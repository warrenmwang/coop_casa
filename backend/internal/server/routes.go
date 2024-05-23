package server

import (
	"context"
	"encoding/json"
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
		// fmt.Printf("Token is valid. User ID: %v, Expires at %v\n", claims["user_id"], claims["exp"])
		return claims, nil
	} else {
		return nil, fmt.Errorf("invalid token")
	}
}

// ---------------------------------------------------------------

func (s *Server) RegisterRoutes() http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.Logger)

	r.Get("/", s.HelloWorldHandler)

	r.Get("/health", s.healthHandler)

	r.Get("/auth/{provider}/callback", s.getAuthCallbackHandler)

	r.Get("/auth/{provider}", s.authLoginHandler)

	r.Get("/auth/logout/{provider}", s.authLogoutHandler)

	r.Get("/api/login", s.apiLoginHandler)

	r.Get("/api/logout", s.apiLogoutHandler)
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

	// Generate token with user info
	user := User{
		UserId: gothUser.UserID,
		Email:  gothUser.Email,
	}
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

// Endpoint: GET HOST:PORT/auth/logout/{provider}
func (s *Server) authLogoutHandler(w http.ResponseWriter, r *http.Request) {
	// Logout endpoint for OAuth

	// Insert the provider context
	provider := chi.URLParam(r, "provider")
	r = r.WithContext(context.WithValue(context.Background(), "provider", provider))

	// Logout oauth
	gothic.Logout(w, r)
	w.Header().Set("Location", "/")
	w.WriteHeader(http.StatusTemporaryRedirect)
}

// Endpoint: GET HOST:PORT/api/login
func (s *Server) apiLoginHandler(w http.ResponseWriter, r *http.Request) {
	// API login handler is used to check if the user is logged in
	// after they have gotten their JWT

	// Set CORS headers
	w.Header().Set("Access-Control-Allow-Origin", fmt.Sprintf("%s:%v", s.Host, s.FrontendPort))
	w.Header().Set("Access-Control-Allow-Methods", "GET")
	w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
	w.Header().Set("Access-Control-Allow-Credentials", "true")

	// Read JWT from HttpOnly Cookie
	cookie, err := r.Cookie("token")
	if err != nil {
		respondWithError(w, 404, fmt.Errorf("no token in cookie in request: %v", err.Error()))
		return
	}
	tokenString := cookie.Value

	// Check if JWT is valid and get claims
	claims, err := s.ValidateTokenAndGetClaims(tokenString)
	if err != nil {
		respondWithError(w, 401, err)
		return
	}

	type returnValue struct {
		UserId string `json:"userId"`
		Email  string `json:"email"`
	}

	userId, ok := claims["user_id"].(string)
	if !ok {
		log.Printf("value userId not string: %v\n", userId)
		respondWithError(w, 401, fmt.Errorf("cannot login with given token, sign in again"))
		return
	}

	email, ok := claims["email"].(string)
	if !ok {
		log.Printf("value email not string: %v\n", email)
		respondWithError(w, 401, fmt.Errorf("cannot login with given token, sign in again"))
		return
	}

	returnVal := returnValue{
		UserId: userId,
		Email:  email,
	}

	respondWithJSON(w, 200, returnVal)
}

// Endpoint: GET HOST:PORT/api/logout
func (s *Server) apiLogoutHandler(w http.ResponseWriter, r *http.Request) {
	// API logout handler is used to logout the user by expiring their JWT
	// do that by setting a new token in the http-only cookie with an expiration date
	// in the past.

	// Set CORS headers
	w.Header().Set("Access-Control-Allow-Origin", fmt.Sprintf("%s:%v", s.Host, s.FrontendPort))
	w.Header().Set("Access-Control-Allow-Methods", "GET")
	w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
	w.Header().Set("Access-Control-Allow-Credentials", "true")

	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    "",
		Path:     "/",
		Expires:  time.Unix(0, 0),
		HttpOnly: true,
		Secure:   s.IsProd,
	})
}
