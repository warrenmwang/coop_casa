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
	"strconv"
	"strings"
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
		MaxAge:   -1,
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

func (s *Server) CreateNewUserRole(userId string) error {
	// Check if userId is the admin user id and if so, use a role
	// of "admin"
	var role string
	if userId == s.AdminUserID {
		role = "admin"
	} else {
		role = "regular"
	}

	// Create role for user in the db
	err := s.db.CreateNewUserRole(userId, role)
	if err != nil {
		return err
	}

	return nil
}

// ---------------------------------------------------------------
// MIDDLEWARES

func (s *Server) corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Set CORS headers
		w.Header().Set("Access-Control-Allow-Origin", s.FrontendOrigin)

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

// ------------------------ ALL ROUTES -------------------------------

func (s *Server) RegisterRoutes() http.Handler {
	r := chi.NewRouter()

	// Middlewares
	r.Use(middleware.Logger)  // stdout logger
	r.Use(middleware.NoCache) // dont cache responses (especially important to get up to date api/auth responses)
	r.Use(s.corsMiddleware)   // set headers for CORS

	// API uptime check
	r.Get("/", s.HelloWorldHandler)

	// DB uptime check
	r.Get("/health", s.healthHandler)

	// Oauth callback
	r.Get("/auth/{provider}/callback", s.authCallbackHandler)

	// Being Oauth login
	r.Get("/auth/{provider}", s.authLoginHandler)

	// Simple auth check
	r.Get("/auth/check", s.authCheckHandler)

	// Logout
	r.Get("/auth/logout", s.authLogoutHandler)

	// Get account details
	r.Get("/api/account", s.apiGetAccountDetailsHandler)

	// Delete account
	r.Delete("/api/account", s.apiDeleteAccountHandler)

	// Update account details
	r.Post("/api/account", s.apiUpdateAccountDetailsHandler)

	// A user can get their own role
	r.Get("/api/account/role", s.apiGetUserRoleHandler)

	// Admin - get users
	r.Get("/api/admin/users", s.apiAdminGetUsers)

	// Admin - get user(s) role(s)
	r.Get("/api/admin/users/roles", s.apiAdminGetUsersRoles)

	// Admin - update user(s) role(s)
	r.Post("/api/admin/users/roles", s.apiUpdateUserRoleHandler)

	return r
}

// --------------------------- UPTIME CHECKS --------------------------------

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

// ----------------------- AUTH -----------------------------------

// Endpoint: GET HOST:PORT/auth/{provider}/callback
func (s *Server) authCallbackHandler(w http.ResponseWriter, r *http.Request) {
	// Callback function called by the OAuth provider after the user initializes oauth process.
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
				respondWithError(w, 500, fmt.Errorf("unable to create new user in database with err: %s", err.Error()))
				return
			}
			// Create a new role for the user
			err = s.CreateNewUserRole(user.UserId)
			if err != nil {
				respondWithError(w, 500, fmt.Errorf("unable to create new user role in database with err: %s", err.Error()))
				return
			}
		} else {
			respondWithError(w, 500, err)
			return
		}
	}
	// If err was nil user is already in db, just return with token

	// Generate token with user info
	tokenSigned, err := s.GenerateToken(user, expireTime)
	if err != nil {
		respondWithError(w, 500, err)
		return
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

	// Redirect to oauth callback page
	http.Redirect(w, r, fmt.Sprintf("%s/oauth-callback", s.FrontendOrigin), http.StatusFound)
}

// Endpoint: GET HOST:PORT/auth/{provider}
func (s *Server) authLoginHandler(w http.ResponseWriter, r *http.Request) {
	// insert the provider context
	provider := chi.URLParam(r, "provider")
	r = r.WithContext(context.WithValue(context.Background(), "provider", provider))

	if _, err := gothic.CompleteUserAuth(w, r); err == nil {
		// User is already authenticated
		// We don't actually expect the code to ever reach this point because our app
		// will hit the /auth/check endpoint instead of this auth/{provider}
		// endpoint to check if the user is still logged in or not based off of the JWT
		// expiration, therefore, if we ever reach this state something has gone wrong and we
		// should return error explaining that we need to check logic flow again.
		respondWithError(w, 500, errors.New("something went wrong with logic flow in code, should not have reached this point in /auth/{provider}"))
	} else {
		// User is not authed, initialize the auth process
		gothic.BeginAuthHandler(w, r)
	}
}

// Endpoint: GET HOST:PORT/auth/check
func (s *Server) authCheckHandler(w http.ResponseWriter, r *http.Request) {
	// return a json with the account status being authed or not as a bool
	// true for yes authed, false for no
	type returnVal struct {
		AccountIsAuthed bool `json:"accountIsAuthed"`
	}

	// Simple check to see if user has a valid JWT
	_, err := s.getAuthedUserId(r)
	if err != nil {
		respondWithJSON(w, 200, returnVal{
			AccountIsAuthed: false,
		})
	} else {
		respondWithJSON(w, 200, returnVal{
			AccountIsAuthed: true,
		})
	}
}

// Endpoint: GET HOST:PORT/auth/logout
func (s *Server) authLogoutHandler(w http.ResponseWriter, r *http.Request) {
	// Logout function that completes the oauth logout and invalidate the user's auth token

	// Invalidate their JWT.
	s.InvalidateToken(w)

	// Complete logout for oauth
	// Insert the provider context
	provider := chi.URLParam(r, "provider")
	r = r.WithContext(context.WithValue(context.Background(), "provider", provider))

	// Logout oauth
	gothic.Logout(w, r)
	w.WriteHeader(http.StatusTemporaryRedirect)
}

// ----------------------- API -----------------------------------
/*
	All handler functions prefixed with `api` should be thought of
	as "authed" endpoints. They require that the http request being handled
	to have a JWT that authenticates a user's action.

	Currently (05/25/2024) the only way to receive a valid JWT from the server
	is to login using the Google OAuth Provider.
*/

// Endpoint: GET HOST:PORT/api/account
func (s *Server) apiGetAccountDetailsHandler(w http.ResponseWriter, r *http.Request) {
	// Returns the user data based on the userId in the auth token

	// Authenticate user and get their userId
	userId, err := s.getAuthedUserId(r)
	if err != nil {
		respondWithError(w, 405, err)
		return
	}

	// Get user account details (as of 06/11/2024)
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

// Endpoint: POST HOST:PORT/api/account
func (s *Server) apiUpdateAccountDetailsHandler(w http.ResponseWriter, r *http.Request) {
	// Authenticate user
	userIdFromToken, err := s.getAuthedUserId(r)
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

	// Ensure that the given user id is the same as the
	// id in the token
	if userIdFromToken != formData.UserID {
		respondWithError(w, 400, errors.New("token user id does not match user id in form"))
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

	// Delete account (details and avatar) from database
	err = s.db.DeleteUser(userId)
	if err != nil {
		respondWithError(w, 401, err)
		return
	}

	// Delete user role from database
	err = s.db.DeleteUserRole(userId)
	if err != nil {
		respondWithError(w, 401, err)
		return
	}

	// Invalidate their token
	s.InvalidateToken(w)

	// Return response ok
	w.WriteHeader(200)
}

// Endpoint: GET HOST:PORT/api/account/role
func (s *Server) apiGetUserRoleHandler(w http.ResponseWriter, r *http.Request) {
	// Authenticate user
	userId, err := s.getAuthedUserId(r)
	if err != nil {
		respondWithError(w, 401, err)
		return
	}

	// Get the user's role from the db
	role, err := s.db.GetUserRole(userId)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	// Return the user's role
	respondWithJSON(w, 200, struct {
		Role string `json:"role"`
	}{
		Role: role,
	})
}

// Endpoint: GET HOST:PORT/api/admin/users
func (s *Server) apiAdminGetUsers(w http.ResponseWriter, r *http.Request) {
	// Authenticate user
	userId, err := s.getAuthedUserId(r)
	if err != nil {
		respondWithError(w, 401, err)
		return
	}

	// If userid is not the admin user id, return unauthorized
	if userId != s.AdminUserID {
		respondWithError(w, 401, errors.New("unauthorized"))
		return
	}

	// Get limit and offset from query params
	query := r.URL.Query()
	limitStr := query.Get("limit")
	offsetStr := query.Get("offset")

	// Default query parameter values
	limit := 10
	offset := 0

	if limitStr != "" {
		limit, err = strconv.Atoi(limitStr)
		if err != nil {
			http.Error(w, "Invalid limit", http.StatusBadRequest)
			return
		}
	}

	if offsetStr != "" {
		offset, err = strconv.Atoi(offsetStr)
		if err != nil {
			http.Error(w, "Invalid offset", http.StatusBadRequest)
			return
		}
	}

	// Get all users from the db
	users, err := s.db.AdminGetUsers(int32(limit), int32(offset))
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	// Need to convert all users from type
	// sqlc.User to type User_New

	// Create a new slice of User_New
	var usersNew []database.User_New
	for _, user := range users {
		// Get user avatar image
		userAvatar, err := s.db.GetUserAvatar(user.UserID)
		if err != nil {
			respondWithError(w, 405, err)
			return
		}

		// Append the user to the new slice
		usersNew = append(usersNew, database.User_New{
			UserID:    user.UserID,
			Email:     user.Email,
			FirstName: user.FirstName.String,
			LastName:  user.LastName.String,
			BirthDate: user.BirthDate.String,
			Gender:    user.Gender.String,
			Location:  user.Location.String,
			Interests: user.Interests.String,
			Avatar:    userAvatar,
		})
	}

	// Return the users
	respondWithJSON(w, 200, usersNew)
}

// Endpoint: GET HOST:PORT/api/admin/users/roles
func (s *Server) apiAdminGetUsersRoles(w http.ResponseWriter, r *http.Request) {
	// Authenticate user
	userId, err := s.getAuthedUserId(r)
	if err != nil {
		respondWithError(w, 401, err)
		return
	}

	// If userid is not the admin user id, return unauthorized
	if userId != s.AdminUserID {
		respondWithError(w, 401, errors.New("unauthorized"))
		return
	}

	// Get the userIds from the query parameter
	query := r.URL.Query()
	userIdsStr := query.Get("userIds")
	userIds := strings.Split(userIdsStr, ",")

	// Get the roles for the users specified in the request body
	roles, err := s.db.AdminGetUsersRoles(userIds)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	// Return the roles
	respondWithJSON(w, 200, roles)
}

// Endpoint: POST HOST:PORT/api/admin/users/roles
// NOTE: despite the name, it is currently only written to allow the changing of a single
// user's role
func (s *Server) apiUpdateUserRoleHandler(w http.ResponseWriter, r *http.Request) {
	// For now, expect that only the admin user can update roles

	// Authenticate user
	callerUserId, err := s.getAuthedUserId(r)
	if err != nil {
		respondWithError(w, 401, err)
		return
	}

	// If userid is not the admin user id, return unauthorized
	if callerUserId != s.AdminUserID {
		respondWithError(w, 401, errors.New("unauthorized"))
		return
	}

	// Get the role from the request body
	query := r.URL.Query()
	userID := query.Get("userID")
	role := query.Get("role")

	// Ensure query parameters are given
	if userID == "" {
		respondWithError(w, 422, errors.New("userID cannot be empty"))
		return
	}
	if role == "" {
		respondWithError(w, 422, errors.New("role cannot be empty"))
		return
	}

	// Update role for the user specified in the request body in the db
	err = s.db.UpdateUserRole(userID, role)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	// Return response ok
	(w).WriteHeader(200)
}
