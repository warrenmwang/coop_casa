package server

/*
	Server Routes

	This file defines the handlers and the route on the chi router
	that will handle all incoming http requests.

	All endpoints will have to be prefixed with either `api` or `auth`,
	as that is what the proxy looks for to route traffic to backend or frontend
	process.

	Most handler functions prefixed with `api` should be thought of
	as "authed" endpoints. They require that the http request being handled
	to have a JWT that authenticates a user's action.

	Some endpoints will require authentication, be it either of a regular user, or a
	property lister, or even the admin account. Authentication of the user making the
	request is done via checking the JWT token included in the request. If no token is
	provided, or the token is invalid, the request will be terminated immediately without
	completing the service. Other endpoints will not require being authed.
	An endpoint like that is the properties endpoint where you can just query for
	available properties on the platform as someone who is not logged in.

	Currently (05/25/2024) the only way to receive a valid JWT from the server
	is to login using the Google OAuth Provider.
*/

import (
	"backend/internal/database"
	"context"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
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

type UserOAuthDetails struct {
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

// Responds with an error
func respondWithError(w http.ResponseWriter, code int, err error) {
	http.Error(w, err.Error(), code)
	log.Println("responded with err:", err.Error())
}

// Generates a JWT for a user attempting login
func (s *Server) GenerateToken(user UserOAuthDetails, expireTime time.Time) (string, error) {
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

// Given the raw JWT as string, validate that the server signed it and return
// the claims object (key value pairs of information put inside the token)
// if it is good, otherwise return an error.
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

// Checks the JWT attached to the request, verify that it was properly signed
// by the server, and if so return the claims object. Otherwise, return an error.
func (s *Server) authCheckAndGetClaims(r *http.Request) (jwt.MapClaims, error) {
	// Read JWT from HttpOnly Cookie
	cookie, err := r.Cookie("token")
	if err != nil {
		return nil, fmt.Errorf("no token in cookie in request: %v", err.Error())
	}
	tokenString := cookie.Value

	// Check if JWT is valid and get claims
	claims, err := s.ValidateTokenAndGetClaims(tokenString)
	if err != nil {
		return nil, err
	}
	return claims, nil
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

// Given the User ID (oauth openid) check if it is the secret, server known
// admin user id and if it is, create the role as a admin
// otherwise default to a regular role.
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

// --------------------- MIDDLEWARES ------------------------------

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

	// Account
	r.Get("/api/account", s.apiGetAccountDetailsHandler)
	r.Post("/api/account", s.apiUpdateAccountDetailsHandler)
	r.Delete("/api/account", s.apiDeleteAccountHandler)

	// A user can get their own role
	r.Get("/api/account/role", s.apiGetUserRoleHandler)

	// Admin
	r.Get("/api/admin/users", s.apiAdminGetUsers)
	r.Get("/api/admin/users/roles", s.apiAdminGetUsersRoles)
	r.Post("/api/admin/users/roles", s.apiUpdateUserRoleHandler)

	// Properties
	r.Get("/api/properties", s.apiGetPropertiesHandler)
	r.Put("/api/properties", s.apiCreatePropertiesHandler)
	r.Post("/api/properties", s.apiUpdatePropertiesHandler)
	r.Delete("/api/properties", s.apiDeletePropertiesHandler)

	// Public Lister info
	r.Get("/api/lister", s.apiGetListerInfoHandler)

	return r
}

// --------------------------- UPTIME CHECKS --------------------------------

// Endpoint: GET /
func (s *Server) HelloWorldHandler(w http.ResponseWriter, r *http.Request) {
	resp := make(map[string]string)
	resp["message"] = "Hello World"

	jsonResp, err := json.Marshal(resp)
	if err != nil {
		log.Fatalf("error handling JSON marshal. Err: %v", err)
	}

	_, _ = w.Write(jsonResp)
}

// Endpoint: GET /health
func (s *Server) healthHandler(w http.ResponseWriter, r *http.Request) {
	jsonResp, _ := json.Marshal(s.db.Health())
	_, _ = w.Write(jsonResp)
}

// ----------------------- AUTH -----------------------------------

// Endpoint: GET /auth/{provider}/callback
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
	user := UserOAuthDetails{
		UserId: gothUser.UserID,
		Email:  gothUser.Email,
	}

	// Create new user in DB if this is their first time in the database
	_, err = s.db.GetUserDetails(user.UserId)
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

// ----------------- AUTH -------------

// Endpoint: GET /auth/{provider}
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

// Endpoint: GET /auth/check
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

// Endpoint: GET /auth/logout
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

// --------------- ACCOUNT ---------------

// Endpoint: GET /api/account
func (s *Server) apiGetAccountDetailsHandler(w http.ResponseWriter, r *http.Request) {
	// Returns the user data based on the userId in the auth token

	// Authenticate user and get their userId
	userId, err := s.getAuthedUserId(r)
	if err != nil {
		respondWithError(w, 405, err)
		return
	}

	// Get user details
	user, err := s.db.GetUserDetails(userId)
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

	userDetails := database.UserDetails{
		UserID:    user.UserID,
		Email:     user.Email,
		FirstName: user.FirstName.String,
		LastName:  user.LastName.String,
		BirthDate: user.BirthDate.String,
		Gender:    user.Gender.String,
		Location:  user.Location.String,
		Interests: user.Interests.String,
	}

	// Return as JSON data, need to convert userAvatar to base64 str
	userAvatarDataB64 := base64.StdEncoding.EncodeToString(userAvatar.Data)

	userAvatarFileExternal := database.FileExternal{
		Filename: userAvatar.Filename,
		Mimetype: userAvatar.Mimetype,
		Size:     userAvatar.Size,
		Data:     userAvatarDataB64,
	}

	type ReturnValue struct {
		UserDetails database.UserDetails  `json:"userDetails"`
		UserAvatar  database.FileExternal `json:"avatarImageB64"`
	}

	respondWithJSON(w, 200, ReturnValue{
		UserDetails: userDetails,
		UserAvatar:  userAvatarFileExternal,
	})
}

// Endpoint: POST /api/account
func (s *Server) apiUpdateAccountDetailsHandler(w http.ResponseWriter, r *http.Request) {
	// Authenticate user
	claims, err := s.authCheckAndGetClaims(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}
	userIdFromToken := claims["user_id"]

	// limit body size that we will parse
	MAX_SIZE := 32 << 20 // 32 MiB
	r.Body = http.MaxBytesReader(w, r.Body, int64(MAX_SIZE))

	err = r.ParseMultipartForm(int64(MAX_SIZE + 512))
	if err != nil {
		log.Printf("parsing multipart form data: %v", err)
		http.Error(w, "unable to parse multipart form", http.StatusInternalServerError)
		return
	}

	// Update the user account with the given details
	userDetailsFormData := r.FormValue("user")

	var userDetails database.UserDetails
	err = json.Unmarshal([]byte(userDetailsFormData), &userDetails)
	if err != nil {
		log.Printf("unmarshaling json: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Ensure that the given user id is the same as the
	// id in the token
	if userIdFromToken != userDetails.UserID {
		respondWithError(w, 400, errors.New("token user id does not match user id in form"))
		return
	}

	// Prevent user from changing their email
	// Ensure that the userDetails email is the same as the email in the token
	if claims["email"] != userDetails.Email {
		respondWithError(w, http.StatusUnauthorized, errors.New("can't change email tied to google account"))
		return
	}

	// Validate the details
	err = ValidateUserDetails(userDetails)
	if err != nil {
		respondWithError(w, http.StatusNotAcceptable, err)
		return
	}

	// Get avatar
	avatarFileData, avatarFileHeader, err := r.FormFile("avatar")
	if err != nil && err != http.ErrMissingFile {
		http.Error(w, "unable to get user avatar image", http.StatusBadRequest)
		return
	}

	var avatarFile database.FileInternal
	if avatarFileData != nil {
		defer avatarFileData.Close()

		avatarBytes, err := io.ReadAll(avatarFileData)
		if err != nil {
			http.Error(w, "unable to read file", http.StatusInternalServerError)
			return
		}
		avatarFile = database.FileInternal{
			Filename: avatarFileHeader.Filename,
			Mimetype: avatarFileHeader.Header.Get("Content-Type"),
			Size:     avatarFileHeader.Size,
			Data:     avatarBytes,
		}
	}

	// Update the user in the DB with the new info (with avatar)
	err = s.db.UpdateUser(userDetails, avatarFile)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	// Account setup complete, respond with ok
	w.WriteHeader(200)
}

// Endpoint: DELETE /api/account
func (s *Server) apiDeleteAccountHandler(w http.ResponseWriter, r *http.Request) {
	// Delete a user account given their userId from the token

	// Get userId of current user
	userId, err := s.getAuthedUserId(r)
	if err != nil {
		respondWithError(w, 401, err)
		return
	}

	// Delete user account (details, role, avatar)
	err = s.db.DeleteUser(userId)
	if err != nil {
		respondWithError(w, 401, err)
		return
	}

	// Delete all the properties that are listed by this user
	err = s.db.DeleteProperties(userId)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	// Invalidate their token
	s.InvalidateToken(w)

	// Return response ok
	w.WriteHeader(200)
}

// Endpoint: GET /api/account/role
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

// ---------------- ADMIN ----------------

// Endpoint: GET /api/admin/users
// Only returns the user details (no avatar images)
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

	// Limit and offset cannot be empty strings
	if limitStr == "" {
		respondWithError(w, 422, errors.New("query with empty limit string is not valid"))
		return
	}

	if offsetStr == "" {
		respondWithError(w, 422, errors.New("query with empty offset string is not valid"))
		return
	}

	// Attempt Parse limit and offset
	var limit int
	var offset int
	limit, err = strconv.Atoi(limitStr)
	if err != nil {
		respondWithError(w, 422, errors.New("invalid limit string"))
		return
	}
	offset, err = strconv.Atoi(offsetStr)
	if err != nil {
		respondWithError(w, 422, errors.New("invalid offset string"))
		return
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
	var usersNew []database.UserDetails
	for _, user := range users {
		// Append the user to the new slice
		usersNew = append(usersNew, database.UserDetails{
			UserID:    user.UserID,
			Email:     user.Email,
			FirstName: user.FirstName.String,
			LastName:  user.LastName.String,
			BirthDate: user.BirthDate.String,
			Gender:    user.Gender.String,
			Location:  user.Location.String,
			Interests: user.Interests.String,
		})
	}

	// Return the users
	respondWithJSON(w, 200, usersNew)
}

// Endpoint: GET /api/admin/users/roles
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

	// Ensure that we have something
	if userIdsStr == "" {
		respondWithError(w, 422, errors.New("query with empty string when expecting userId(s) is not valid input"))
		return
	}

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

// Endpoint: POST /api/admin/users/roles
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

// ----------------- PROPERTIES ---------------------

// Endpoint: GET /api/properties
// Available query params:
// - propertyID string, return the data for a single property
// - page int, return the property ids for the current page
// - getTotalCount bool, return the total number of properties present on site
func (s *Server) apiGetPropertiesHandler(w http.ResponseWriter, r *http.Request) {
	// anyone can get properties, without needing to be authenticated.

	query := r.URL.Query()

	// Check if propertyID is a queryParam, if it is, retrieve it and
	// try to find the suitable property from the database
	propertyID := query.Get("propertyID")
	if propertyID != "" {
		propertyDetails, err := s.db.GetPropertyDetails(propertyID)
		if err != nil {
			respondWithError(w, 500, err)
			return
		}

		propertyImagesBinary, err := s.db.GetPropertyImages(propertyID)
		if err != nil {
			respondWithError(w, 500, err)
			return
		}

		var propertyImagesB64 []database.OrderedFileExternal
		for _, image := range propertyImagesBinary {
			propertyImagesB64 = append(propertyImagesB64, database.OrderedFileExternal{
				OrderNum: image.OrderNum,
				File: database.FileExternal{
					Filename: image.File.Filename,
					Mimetype: image.File.Mimetype,
					Size:     image.File.Size,
					Data:     base64.StdEncoding.EncodeToString(image.File.Data),
				},
			})
		}

		property := database.PropertyFull{
			PropertyDetails: propertyDetails,
			PropertyImages:  propertyImagesB64,
		}

		respondWithJSON(w, 200, property)
		return
	}

	// Check if just want count of properies
	getTotalCountStr := query.Get("getTotalCount")
	if getTotalCountStr != "" {
		getTotalCount, err := strconv.ParseBool(getTotalCountStr)
		if err != nil {
			respondWithError(w, 500, err)
			return
		}
		if !getTotalCount {
			w.WriteHeader(200) // the param was set to false, so don't give anything.
			return
		}
		count, err := s.db.GetTotalCountProperties()
		if err != nil {
			respondWithError(w, 500, err)
			return
		}
		respondWithJSON(w, 200, count)
		return
	}

	// Otherwise, request is for paginated property IDs
	// with or without search params for filtering.

	// Get the offset for the properties viewing
	limit := 9
	offsetStr := query.Get("page")

	// Page cannot be empty string
	if offsetStr == "" {
		respondWithError(w, 422, errors.New("query with empty offset string is not valid"))
		return
	}

	// Attempt Parse offset
	var offset int
	offset, err := strconv.Atoi(offsetStr)
	if err != nil {
		respondWithError(w, 422, errors.New("invalid offset string"))
		return
	}

	// Calculate the correct offset
	offset = offset * limit

	// Get the property IDs from DB
	properties, err := s.db.GetNextPageProperties(int32(limit), int32(offset))
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	respondWithJSON(w, 200, properties)
}

// Endpoint: PUT /api/properties
func (s *Server) apiCreatePropertiesHandler(w http.ResponseWriter, r *http.Request) {
	// Authenticate the user and make sure they have write access to properties db
	// (i.e. Need to be either a lister or admin role, basically just not a regular user)
	userID, err := s.getAuthedUserId(r)
	if err != nil {
		respondWithError(w, 401, err)
		return
	}
	role, err := s.db.GetUserRole(userID)
	if err != nil {
		respondWithError(w, 401, err)
		return
	}
	if role == "regular" {
		respondWithError(w, 401, err)
		return
	}

	// Prepare reading body form by allocating max memory to read
	MAX_SIZE := 55 << 20 // 55 MiB
	r.Body = http.MaxBytesReader(w, r.Body, int64(MAX_SIZE))
	err = r.ParseMultipartForm(int64(MAX_SIZE + 512))
	if err != nil {
		respondWithError(w, 401, err)
		return
	}

	// Get details
	detailsRaw := r.FormValue("details")
	var propertyDetails database.PropertyDetails
	err = json.Unmarshal([]byte(detailsRaw), &propertyDetails)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	// Validate property details
	err = ValidatePropertyDetails(propertyDetails)
	if err != nil {
		respondWithError(w, 400, err)
		return
	}

	// Check that property address is not a duplicate of an existing one before creation
	err = s.db.CheckDuplicateProperty(propertyDetails)
	if err != nil {
		respondWithError(w, 400, err)
		return
	}

	// Get property images
	numberImagesRaw := r.FormValue("numImages") // should be at most 10, limited on expected frontend.
	numberImagesInt64, err := strconv.ParseInt(numberImagesRaw, 10, 16)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	var images []database.OrderedFileInternal
	numberImages := int16(numberImagesInt64)
	for i := range numberImages {
		imageDataRaw, imageFileHeader, err := r.FormFile(fmt.Sprintf("image%d", i))
		if err != nil {
			respondWithError(w, 500, err)
			return
		}
		var imageData []byte
		if imageDataRaw == nil {
			respondWithError(w, 500, errors.New("image data is empty"))
			return
		} else {
			defer imageDataRaw.Close()

			imageData, err = io.ReadAll(imageDataRaw)
			if err != nil {
				respondWithError(w, 500, err)
				return
			}
		}

		images = append(images, database.OrderedFileInternal{
			OrderNum: i,
			File: database.FileInternal{
				Filename: imageFileHeader.Filename,
				Mimetype: imageFileHeader.Header.Get("Content-Type"),
				Size:     imageFileHeader.Size,
				Data:     imageData,
			},
		})
	}

	// Create the property in the db
	err = s.db.CreateProperty(propertyDetails, images)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	// Respond with ok created
	w.WriteHeader(201)
}

// Endpoint: POST /api/properties
func (s *Server) apiUpdatePropertiesHandler(w http.ResponseWriter, r *http.Request) {
	// Authenticate the user and make sure they have write access to properties db
	// (i.e. Need to be either a lister or admin role, basically just not a regular user)
	userID, err := s.getAuthedUserId(r)
	if err != nil {
		respondWithError(w, 401, err)
		return
	}
	role, err := s.db.GetUserRole(userID)
	if err != nil {
		respondWithError(w, 401, err)
		return
	}
	if role == "regular" {
		respondWithError(w, 401, err)
		return
	}

	// Prepare reading body form by allocating max memory to read
	MAX_SIZE := 55 << 20 // 55 MiB
	r.Body = http.MaxBytesReader(w, r.Body, int64(MAX_SIZE))
	err = r.ParseMultipartForm(int64(MAX_SIZE + 512))
	if err != nil {
		respondWithError(w, 401, err)
		return
	}

	// Get details
	detailsRaw := r.FormValue("details")
	var propertyDetails database.PropertyDetails
	err = json.Unmarshal([]byte(detailsRaw), &propertyDetails)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	// Validate property details
	err = ValidatePropertyDetails(propertyDetails)
	if err != nil {
		respondWithError(w, 400, err)
		return
	}

	// Get property images
	numberImagesRaw := r.FormValue("numImages") // should be at most 10, limited on expected frontend.
	numberImagesInt64, err := strconv.ParseInt(numberImagesRaw, 10, 16)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	var images []database.OrderedFileInternal
	numberImages := int16(numberImagesInt64)
	for i := range numberImages {
		imageDataRaw, imageFileHeader, err := r.FormFile(fmt.Sprintf("image%d", i))
		if err != nil {
			respondWithError(w, 500, err)
			return
		}
		var imageData []byte
		if imageDataRaw == nil {
			respondWithError(w, 500, errors.New("image data is empty"))
			return
		} else {
			defer imageDataRaw.Close()

			imageData, err = io.ReadAll(imageDataRaw)
			if err != nil {
				respondWithError(w, 500, err)
				return
			}
		}

		images = append(images, database.OrderedFileInternal{
			OrderNum: i,
			File: database.FileInternal{
				Filename: imageFileHeader.Filename,
				Mimetype: imageFileHeader.Header.Get("Content-Type"),
				Size:     imageFileHeader.Size,
				Data:     imageData,
			},
		})
	}

	// Listers can only update their own properties, admins can modify any who cares if they own it or not
	if role == "lister" && userID != propertyDetails.ListerUserID {
		respondWithError(w, 401, errors.New("you can only modify your own property as a lister"))
		return
	}

	// Update property details
	err = s.db.UpdatePropertyDetails(propertyDetails)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	// Update property images
	err = s.db.UpdatePropertyImages(propertyDetails.PropertyID, images)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	// Respond with ok
	w.WriteHeader(200)
}

// Endpoint: DELETE /api/properties
// AUTHED
func (s *Server) apiDeletePropertiesHandler(w http.ResponseWriter, r *http.Request) {
	// Authenticate user
	userID, err := s.getAuthedUserId(r)
	if err != nil {
		respondWithError(w, 401, err)
		return
	}

	// Get the property ID they want to delete from the query param
	query := r.URL.Query()
	propertyID := query.Get("propertyID")

	// Try to get the requested property
	propertyDetails, err := s.db.GetPropertyDetails(propertyID)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	// Ensure that the user owns the property OR
	// that the user is the admin
	if propertyDetails.ListerUserID != userID && userID != s.AdminUserID {
		respondWithError(w, 401, err)
		return
	}

	// Delete the property
	err = s.db.DeleteProperty(propertyID)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	// Respond ok
	w.WriteHeader(200)
}

// Endpoint: GET /api/lister
// NO AUTH
func (s *Server) apiGetListerInfoHandler(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	listerID := query.Get("listerID")
	if listerID == "" {
		respondWithError(w, 422, errors.New("listerID empty"))
		return
	}

	// Check the role of the userid
	role, err := s.db.GetUserRole(listerID)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}
	if role != "lister" && role != "admin" {
		respondWithError(w, 500, errors.New("user is not a lister"))
		return
	}

	// userID is a lister, return the email and name for basic contact information
	lister, err := s.db.GetUserDetails(listerID)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	respondWithJSON(w, 200, struct {
		FirstName string `json:"firstName"`
		LastName  string `json:"lastName"`
		Email     string `json:"email"`
	}{
		FirstName: lister.FirstName.String,
		LastName:  lister.LastName.String,
		Email:     lister.Email,
	})
}
