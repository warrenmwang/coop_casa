package server

import (
	"backend/internal/database"
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"text/template"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/golang-jwt/jwt/v5"
	"github.com/markbates/goth/gothic"
)

// ---------------------------------------------------------------

type errorBody struct {
	Error string `json:"error"`
}

type User struct {
	UserId string
	Email  string
}

// Handles http requests and return json
func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	response, err := json.Marshal(payload)
	if err != nil {
		log.Fatal(err)
	}
	w.Write(response)
}

// Wrapper for respondWithJSON for sending errors as the interface used to be converted to json
func respondWithError(w http.ResponseWriter, code int, err error) {
	respondWithJSON(w, code, errorBody{Error: err.Error()})
	log.Println("responded with err:", err.Error())
}

// Generates a JWT for a user attempting login
func (s *Server) GenerateToken(user User, expireTime time.Time) (string, error) {
	// Define token claims
	claims := jwt.MapClaims{}
	claims["authorized"] = true
	claims["user_id"] = user.UserId
	claims["email"] = user.Email
	claims["exp"] = expireTime.Unix()

	// Create token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Sign token with a string
	tokenString, err := token.SignedString([]byte(s.JwtSignSecret))
	if err != nil {
		return "", fmt.Errorf("error in generateToken: %v", err.Error())
	}

	return tokenString, nil
}

// Invalidate the token in the browser from the request
func (s *Server) InvalidateToken(w http.ResponseWriter) {
	// Expire their JWT by by setting a new token in the http-only cookie with an expiration date
	// in the past.
	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    "",
		Path:     "/",
		Expires:  time.Unix(0, 0),
		HttpOnly: true,
		Secure:   s.IsProd,
	})
}

func (s *Server) ValidateTokenAndGetClaims(tokenString string) (jwt.MapClaims, error) {
	// Gets the JWT and validates it. If valid, return the claims.
	// Return an error if invalid.

	// Validate JWT
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(s.JwtSignSecret), nil
	})

	if err != nil {
		return nil, fmt.Errorf("error for parsing jwt: %v", err.Error())
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		// Token is valid. Access the claims here.
		return claims, nil
	} else {
		return nil, fmt.Errorf("invalid token")
	}
}

// Returns the userId from the http cookie in the request, if present (if the user is authed)
// If something goes wrong in here, we should assume a response http code 401 for unauthorized.
func (s *Server) getAuthedUserId(r *http.Request) (string, error) {
	// Read JWT from HttpOnly Cookie
	cookie, err := r.Cookie("token")
	if err != nil {
		return "", fmt.Errorf("no token in cookie in request: %v", err.Error())
	}
	tokenString := cookie.Value

	// Check if JWT is valid and get claims
	claims, err := s.ValidateTokenAndGetClaims(tokenString)
	if err != nil {
		return "", err
	}

	// Get User ID to insert into the right place in the DB
	userId, ok := claims["user_id"].(string)
	if !ok {
		return "", fmt.Errorf("cannot login with given token, sign in again")
	}

	return userId, nil
}

// ---------------------------------------------------------------
// MIDDLEWARES

func (s *Server) corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := fmt.Sprintf("%s:%v", s.Host, s.FrontendPort)

		// Set CORS headers
		w.Header().Set("Access-Control-Allow-Origin", origin)

		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		// Handle cors preflight if method is OPTIONS
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		// Otherwise pass to the handler
		next.ServeHTTP(w, r)
	})
}

// ---------------------------------------------------------------

func (s *Server) RegisterRoutes() http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(s.corsMiddleware)

	// API uptime check
	r.Get("/", s.HelloWorldHandler)

	// DB uptime check
	r.Get("/health", s.healthHandler)

	// Oauth callback
	r.Get("/auth/{provider}/callback", s.getAuthCallbackHandler)

	// Being Oauth login
	r.Get("/auth/{provider}", s.authLoginHandler)

	// Logout
	r.Get("/api/logout", s.apiLogoutHandler)

	// Get account details
	r.Get("/api/account", s.apiGetAccountDetailsHandler)

	// Delete account
	r.Delete("/api/account", s.apiDeleteAccountHandler)

	// Update account details
	r.Post("/api/account/update", s.apiUpdateAccountDetailsHandler)

	return r
}

// ---------------------------------------------------------------

// Endpoint: GET HOST:PORT/
func (s *Server) HelloWorldHandler(w http.ResponseWriter, r *http.Request) {
	resp := make(map[string]string)
	resp["message"] = "Hello World"

	jsonResp, err := json.Marshal(resp)
	if err != nil {
		log.Fatalf("error handling JSON marshal. Err: %v", err)
	}

	_, _ = w.Write(jsonResp)
}

// Endpoint: GET HOST:PORT/health
func (s *Server) healthHandler(w http.ResponseWriter, r *http.Request) {
	jsonResp, _ := json.Marshal(s.db.Health())
	_, _ = w.Write(jsonResp)
}

// Endpoint: GET HOST:PORT/auth/{provider}/callback
func (s *Server) getAuthCallbackHandler(w http.ResponseWriter, r *http.Request) {
	// Callback function called by the OAuth provider after the user logs in on their page.
	// Finish auth, create JWT, and save it into a cookie.

	// Insert the provider context
	provider := chi.URLParam(r, "provider")
	r = r.WithContext(context.WithValue(context.Background(), "provider", provider))

	// Complete OAuth
	gothUser, err := gothic.CompleteUserAuth(w, r)
	if err != nil {
		fmt.Fprintln(w, r)
		return
	}

	// Define token lifetime to be a day
	expireTime := time.Now().Add(time.Hour * 24)

	// Create User struct with identifying user info from OAuth
	user := User{
		UserId: gothUser.UserID,
		Email:  gothUser.Email,
	}

	// Create new user in DB if this is their first time in the database
	_, err = s.db.GetUser(user.UserId)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			// this user is not recorded in db, then it is the first time they have logged in to app.
			// create new user for them
			err = s.db.CreateUser(user.UserId, user.Email)
			if err != nil {
				log.Fatalf("Unable to create new user in database with err: %s\n", err.Error())
			}
		} else {
			log.Fatalf("Error in GetUser in oauth callback function: %s\n", err.Error())
		}
	}
	// If err was nil user is already in db, just return with token

	// Generate token with user info
	tokenSigned, err := s.GenerateToken(user, expireTime)
	if err != nil {
		log.Fatalf("Unable to sign token with err: %s\n", err.Error())
	}

	// Set token in cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    tokenSigned,
		Path:     "/",
		Expires:  expireTime,
		HttpOnly: true,
		Secure:   s.IsProd,
	})

	// Redirect to dashboard page
	// NOTE: even in production environment, as long as frontend port is set properly
	// to say 443 for htpps, this redirect should work.
	http.Redirect(w, r, fmt.Sprintf("%s:%d/dashboard", s.Host, s.FrontendPort), http.StatusFound)
}

// Endpoint: GET HOST:PORT/auth/{provider}
func (s *Server) authLoginHandler(w http.ResponseWriter, r *http.Request) {
	// insert the provider context
	provider := chi.URLParam(r, "provider")
	r = r.WithContext(context.WithValue(context.Background(), "provider", provider))

	// TODO: I'm not sure what this is actually doing here?
	// try to get the user without re-authenticating

	var userTemplate = `
	<p><a href="/logout/{{.Provider}}">logout</a></p>
	<p>Name: {{.Name}} [{{.LastName}}, {{.FirstName}}]</p>
	<p>Email: {{.Email}}</p>
	<p>NickName: {{.NickName}}</p>
	<p>Location: {{.Location}}</p>
	<p>AvatarURL: {{.AvatarURL}} <img src="{{.AvatarURL}}"></p>
	<p>Description: {{.Description}}</p>
	<p>UserID: {{.UserID}}</p>
	<p>AccessToken: {{.AccessToken}}</p>
	<p>ExpiresAt: {{.ExpiresAt}}</p>
	<p>RefreshToken: {{.RefreshToken}}</p>
	`

	if gothUser, err := gothic.CompleteUserAuth(w, r); err == nil {
		t, _ := template.New("foo").Parse(userTemplate)
		t.Execute(w, gothUser)
	} else {
		gothic.BeginAuthHandler(w, r)
	}
}

/*
	All handler functions prefixed with `api` should be thought of
	as "authed" endpoints. They require that the http request being handled
	to have a JWT that authenticates a user's action.

	Currently (05/25/2024) the only way to receive a valid JWT from the server
	is to login using the Google OAuth Provider.
*/

// Endpoint: GET HOST:PORT/api/logout
func (s *Server) apiLogoutHandler(w http.ResponseWriter, r *http.Request) {
	// Logout function that completes the oauth logout and invalidate the user's auth token

	// Invalidate their JWT.
	s.InvalidateToken(w)

	// Complete logout for oauth
	// Insert the provider context
	provider := chi.URLParam(r, "provider")
	r = r.WithContext(context.WithValue(context.Background(), "provider", provider))

	// Logout oauth
	gothic.Logout(w, r)
	w.Header().Set("Location", "/")
	w.WriteHeader(http.StatusTemporaryRedirect)
}

// Endpoint: GET HOST:PORT/api/account
func (s *Server) apiGetAccountDetailsHandler(w http.ResponseWriter, r *http.Request) {
	// Returns the user data based on the userId in the auth token

	// Authenticate user and get their userId
	userId, err := s.getAuthedUserId(r)
	if err != nil {
		respondWithError(w, 405, err)
		return
	}

	// Get user account details
	/*
		type User struct {
			ID        int32
			UserID    string
			Email     string
			FirstName sql.NullString
			LastName  sql.NullString
			BirthDate sql.NullString
			Gender    sql.NullString
			Location  sql.NullString
			Interests sql.NullString
			CreatedAt time.Time
			UpdatedAt time.Time
		}
	*/
	userDetails, err := s.db.GetUser(userId)
	if err != nil {
		respondWithError(w, 405, err)
		return
	}

	// Get user avatar image
	userAvatar, err := s.db.GetUserAvatar(userId)
	if err != nil {
		respondWithError(w, 405, err)
		return
	}

	// Return user details and user avatar in a json
	respondWithJSON(w, 200, database.User_New{
		UserID:    userDetails.UserID,
		Email:     userDetails.Email,
		FirstName: userDetails.FirstName.String,
		LastName:  userDetails.LastName.String,
		BirthDate: userDetails.BirthDate.String,
		Gender:    userDetails.Gender.String,
		Location:  userDetails.Location.String,
		Interests: userDetails.Interests.String,
		Avatar:    userAvatar,
	})
}

// Endpoint: POST HOST:PORT/api/account/update
func (s *Server) apiUpdateAccountDetailsHandler(w http.ResponseWriter, r *http.Request) {
	// Authenticate user
	_, err := s.getAuthedUserId(r)
	if err != nil {
		respondWithError(w, 405, err)
		return
	}

	// Update the user account with the given details
	var formData database.User_New
	err = json.NewDecoder(r.Body).Decode(&formData)
	if err != nil {
		respondWithError(w, 400, err)
		return
	}

	// Update the user in the DB with the new info
	err = s.db.UpdateUser(formData)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	// Account setup complete, respond with ok
	w.WriteHeader(200)
}

// Endpoint: DELETE HOST:PORT/api/account
func (s *Server) apiDeleteAccountHandler(w http.ResponseWriter, r *http.Request) {
	// Delete a user account given their userId from the token

	// Get userId of current user
	userId, err := s.getAuthedUserId(r)
	if err != nil {
		respondWithError(w, 401, err)
		return
	}

	// Delete account from database
	err = s.db.DeleteUser(userId)
	if err != nil {
		respondWithError(w, 401, err)
		return
	}

	// Invalidate their token
	s.InvalidateToken(w)

	// Return response ok
	w.WriteHeader(200)
}
