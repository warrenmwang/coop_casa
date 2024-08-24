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
	claims, err := s.authCheckAndGetClaims(r)
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
		// should return error.
		respondWithError(w, http.StatusInternalServerError, errors.New("something went wrong"))
	} else {
		// User is not authed, initialize the auth process
		gothic.BeginAuthHandler(w, r)
	}
}

// Endpoint: GET /auth/{provider}/callback
func (s *Server) authCallbackHandler(w http.ResponseWriter, r *http.Request) {
	// Callback function called by the OAuth provider after the user initializes oauth process.
	// Finish auth, create JWT, and save it into a cookie.

	provider := chi.URLParam(r, "provider")

	// Ensure provider is google, which is the only one accepted at current moment
	if provider != "google" {
		respondWithError(w, http.StatusBadRequest, errors.New("invalid oauth provider callback"))
		return
	}

	// Insert the provider context from url param
	r = r.WithContext(context.WithValue(context.Background(), "provider", provider))

	// Complete OAuth
	gothUser, err := gothic.CompleteUserAuth(w, r)
	if err != nil {
		// oauth was likely cancelled by user, redirect to home page
		http.Redirect(w, r, s.FrontendOrigin, http.StatusFound)
		return
	}

	// Define token lifetime to be one month
	expireTime := time.Now().Add(time.Hour * 24 * 30)

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

	// Redirect to dashboard page
	http.Redirect(w, r, fmt.Sprintf("%s/dashboard", s.FrontendOrigin), http.StatusFound)
}

// Endpoint: GET /auth/{provider}/check
func (s *Server) authCheckHandler(w http.ResponseWriter, r *http.Request) {

	// Validate auth provider first
	provider := chi.URLParam(r, "provider")
	if provider != "google" {
		respondWithError(w, http.StatusBadRequest, errors.New("invalid auth provider"))
		return
	}

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

// Endpoint: POST /auth/{provider}/logout
func (s *Server) authLogoutHandler(w http.ResponseWriter, r *http.Request) {
	// Logout function that completes the oauth logout and invalidate the user's auth token

	provider := chi.URLParam(r, "provider")

	// Ensure using the right provider
	if provider != "google" {
		respondWithError(w, http.StatusBadRequest, errors.New("invalid auth provider"))
		return
	}

	// Invalidate their JWT.
	s.InvalidateToken(w)

	// Complete logout for oauth
	// Insert the provider context
	r = r.WithContext(context.WithValue(context.Background(), "provider", provider))

	// Logout oauth
	gothic.Logout(w, r)
	w.WriteHeader(http.StatusOK)
}

// --------------- ACCOUNT ---------------

// Endpoint: GET /api/account
// AUTHED
func (s *Server) apiGetAccountDetailsHandler(w http.ResponseWriter, r *http.Request) {
	// Returns the user data based on the userId in the auth token

	// Authenticate user and get their userId
	userId, err := s.getAuthedUserId(r)
	if err != nil {
		respondWithError(w, 405, err)
		return
	}

	// Get user details
	userDetails, err := s.db.GetUserDetails(userId)
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

	// Make interests an empty list if nil
	if userDetails.Interests == nil {
		userDetails.Interests = []string{}
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
// AUTHED
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
// AUTHED
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
	err = s.db.DeleteUserOwnedProperties(userId)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	// Delete all communities owned by this user
	// If this is not desired behavior, it is the frontend's job to warn the user
	// that all their properties and communities will be deleted. Therefore, they
	// should transfer ownership of their properties/communities before deleting their
	// acount.
	err = s.db.DeleteUserOwnedCommunities(userId)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Invalidate their token
	s.InvalidateToken(w)

	// Return response ok
	w.WriteHeader(200)
}

// Endpoint: GET /api/account/role
// AUTHED
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
// AUTHED
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

	// Return the users
	respondWithJSON(w, 200, users)
}

// Endpoint: GET /api/admin/users/roles
// AUTHED
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
// AUTHED
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

	// Reject requests to alter admin's own user role
	if userID == callerUserId {
		respondWithError(w, http.StatusBadRequest, errors.New("admin cannot change own user role. baka"))
		return
	}

	// Update role for the user specified in the request body in the db
	err = s.db.UpdateUserRole(userID, role)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	// Return response ok
	w.WriteHeader(200)
}

// ----------------- PROPERTIES ---------------------

// GET /api/properties/{id}
// NO AUTH
func (s *Server) apiGetPropertyHandler(w http.ResponseWriter, r *http.Request) {
	propertyID := chi.URLParam(r, "id")

	// Try to get property from db
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
}

// GET /api/properties/total
// AUTHED
func (s *Server) apiGetPropertiesTotalCountHandler(w http.ResponseWriter, r *http.Request) {
	// Authenticate user
	_, err := s.authCheckAndGetClaims(r)
	if err != nil {
		respondWithError(w, 401, err)
		return
	}

	// Validate properties
	count, err := s.db.GetTotalCountProperties()
	if err != nil {
		respondWithError(w, 500, err)
		return
	}
	respondWithJSON(w, 200, count)
}

// Endpoint: GET /api/properties
// NO AUTH
func (s *Server) apiGetPropertiesHandler(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()

	pageStr := query.Get("page")
	limitStr := query.Get("limit")
	filterAddress := query.Get("filterAddress")

	// Parse offset and limit
	var offset int
	offset, err := strconv.Atoi(pageStr)
	if err != nil {
		respondWithError(w, 422, fmt.Errorf("unable to parse page: %s", pageStr))
		return
	}

	var limit int
	limit, err = strconv.Atoi(limitStr)
	if err != nil {
		respondWithError(w, 422, fmt.Errorf("unable to parse limit: %s", limitStr))
		return
	}

	// Calculate the correct offset
	offset = offset * limit

	// Get the property IDs from DB
	properties, err := s.db.GetNextPageProperties(int32(limit), int32(offset), filterAddress)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	respondWithJSON(w, 200, properties)
}

// Endpoint: POST /api/properties
// AUTHED
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
		respondWithError(w, 500, err)
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
	numberImages := int16(numberImagesInt64)

	// Ensure that at least a single image is given for the property
	if numberImages == 0 {
		respondWithError(w, 400, errors.New("property must have at least one property"))
		return
	}

	var images []database.OrderedFileInternal
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

// PUT /api/properties/{id}
// AUTHED
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
		respondWithError(w, 500, err)
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

	// Validate propertyId of URLParam matches propertyId of data in request body
	if propertyDetails.PropertyID != chi.URLParam(r, "id") {
		respondWithError(w, http.StatusBadRequest, errors.New("propertyId of URLParam does not match propertyId of data in request body"))
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
	numberImages := int16(numberImagesInt64)

	// Ensure that at least a single image is given for the property
	if numberImages == 0 {
		respondWithError(w, 400, errors.New("property must have at least one property"))
		return
	}

	var images []database.OrderedFileInternal
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

// Endpoint: DELETE /api/properties/{id}
// AUTHED
func (s *Server) apiDeletePropertiesHandler(w http.ResponseWriter, r *http.Request) {
	// Authenticate user
	userID, err := s.getAuthedUserId(r)
	if err != nil {
		respondWithError(w, 401, err)
		return
	}

	// Get the property ID they want to delete from the URL param
	propertyID := chi.URLParam(r, "id")
	if len(propertyID) == 0 {
		respondWithError(w, 400, errors.New("no communityId given"))
		return
	}

	// Try to get the requested property
	propertyDetails, err := s.db.GetPropertyDetails(propertyID)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	// Ensure that the user owns the property OR
	// that the user is the admin
	if propertyDetails.ListerUserID != userID && userID != s.AdminUserID {
		respondWithError(w, 401, errors.New("account not authorized for this action"))
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
		FirstName: lister.FirstName,
		LastName:  lister.LastName,
		Email:     lister.Email,
	})
}

// GET /api/communities/{id}
// NO AUTH
func (s *Server) apiGetCommunityHandler(w http.ResponseWriter, r *http.Request) {
	communityId := chi.URLParam(r, "id")
	communityDetails, err := s.db.GetCommunityDetails(communityId)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}
	communityImagesInternal, err := s.db.GetCommunityImages(communityId)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}
	var communityImagesExternal []database.FileExternal
	for _, image := range communityImagesInternal {
		communityImagesExternal = append(communityImagesExternal, database.FileExternal{
			Filename: image.Filename,
			Mimetype: image.Mimetype,
			Size:     image.Size,
			Data:     base64.StdEncoding.EncodeToString(image.Data),
		})
	}
	communityUsers, err := s.db.GetCommunityUsers(communityId)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}
	communityProperties, err := s.db.GetCommunityProperties(communityId)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}
	communityFull := database.CommunityFull{
		CommunityDetails:    communityDetails,
		CommunityImages:     communityImagesExternal,
		CommunityUsers:      communityUsers,
		CommunityProperties: communityProperties,
	}
	respondWithJSON(w, 200, communityFull)
}

// GET /api/communities
// NO AUTH
// Public api to search through all communities
func (s *Server) apiGetCommunitiesHandler(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()

	pageStr := query.Get("page")
	limitStr := query.Get("limit")
	filterName := query.Get("communityFilterName")
	filterDescription := query.Get("communityFilterDescription")

	// Parse offset and limit
	var offset int
	offset, err := strconv.Atoi(pageStr)
	if err != nil {
		respondWithError(w, 422, fmt.Errorf("unable to parse page: %s", pageStr))
		return
	}

	var limit int
	limit, err = strconv.Atoi(limitStr)
	if err != nil {
		respondWithError(w, 422, fmt.Errorf("unable to parse limit: %s", limitStr))
		return
	}

	// Calculate the correct offset
	offset = offset * limit

	// Get communities with optional filters
	communityIds, err := s.db.GetNextPageCommunities(int32(limit), int32(offset), filterName, filterDescription)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	respondWithJSON(w, 200, communityIds)
}

// POST /api/communities
// AUTHED
func (s *Server) apiCreateCommunitiesHandler(w http.ResponseWriter, r *http.Request) {
	// Authenticate user
	authedUserId, err := s.getAuthedUserId(r)
	if err != nil {
		respondWithError(w, 401, err)
		return
	}

	// Define max mem to read from received body
	MAX_SIZE := 55 << 20 // 55 MiB
	r.Body = http.MaxBytesReader(w, r.Body, int64(MAX_SIZE))
	err = r.ParseMultipartForm(int64(MAX_SIZE) + 512)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	// Unmarshal details data
	detailsRaw := r.FormValue("details")
	var communityDetails database.CommunityDetails
	err = json.Unmarshal([]byte(detailsRaw), &communityDetails)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	// Validate community's admin is the same id in token
	if authedUserId != communityDetails.AdminUserID {
		respondWithError(w, 401, errors.New("userId in token does not match adminUserId of community details to be created"))
		return
	}

	// Validate community details
	err = ValidateCommnityDetails(communityDetails)
	if err != nil {
		respondWithError(w, 400, err)
		return
	}

	// Get community images if any
	numberImagesRaw := r.FormValue("numImages")
	numberImagesInt64, err := strconv.ParseInt(numberImagesRaw, 10, 16)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}
	numberImages := int16(numberImagesInt64)

	var images []database.FileInternal
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

		images = append(images, database.FileInternal{
			Filename: imageFileHeader.Filename,
			Mimetype: imageFileHeader.Header.Get("Content-Type"),
			Size:     imageFileHeader.Size,
			Data:     imageData,
		})
	}

	// Create community in db
	err = s.db.CreateCommunity(communityDetails, images)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	w.WriteHeader(201)
}

// POST /api/communities/users
// AUTHED
// adds a given userId to the given communityId, where the userid in the token must be an admin (currently only one admin per group allowed)
func (s *Server) apiCreateCommunitiesUserHandler(w http.ResponseWriter, r *http.Request) {
	// Authenticate user
	authedUserId, err := s.getAuthedUserId(r)
	if err != nil {
		respondWithError(w, 401, err)
		return
	}

	MAX_SIZE := 50
	r.Body = http.MaxBytesReader(w, r.Body, int64(MAX_SIZE))
	err = r.ParseMultipartForm(int64(MAX_SIZE + 10))
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	type FormData struct {
		CommunityID string `json:"communityId"`
		UserID      string `json:"userId"`
	}
	var data FormData
	formData := r.FormValue("data")
	if len(formData) == 0 {
		respondWithError(w, 400, errors.New("empty data given"))
		return
	}

	err = json.Unmarshal([]byte(formData), &data)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	// Validate userId in JWT matches the adminId of the given community
	communityDetails, err := s.db.GetCommunityDetails(data.CommunityID)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}
	if authedUserId != communityDetails.AdminUserID {
		respondWithError(w, 401, errors.New("userId in JWT not the admin userId of community requested"))
		return
	}

	// Add given user to given community
	err = s.db.CreateCommunityUser(data.CommunityID, data.UserID)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	w.WriteHeader(201)
}

// POST /api/communities/properties
// AUTHED
// adds a given propertyId to the given communityId, where userid in token must be an admin
func (s *Server) apiCreateCommunitiesPropertyHandler(w http.ResponseWriter, r *http.Request) {
	// Authenticate user
	authedUserId, err := s.getAuthedUserId(r)
	if err != nil {
		respondWithError(w, 401, err)
		return
	}

	MAX_SIZE := 50
	r.Body = http.MaxBytesReader(w, r.Body, int64(MAX_SIZE))
	err = r.ParseMultipartForm(int64(MAX_SIZE + 10))
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	type FormData struct {
		CommunityID string `json:"communityId"`
		PropertyID  string `json:"propertyId"`
	}
	var data FormData
	formData := r.FormValue("data")
	if len(formData) == 0 {
		respondWithError(w, 400, errors.New("empty data given"))
		return
	}

	err = json.Unmarshal([]byte(formData), &data)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	// Validate userId in JWT matches the adminId of the given community
	communityDetails, err := s.db.GetCommunityDetails(data.CommunityID)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}
	if authedUserId != communityDetails.AdminUserID {
		respondWithError(w, 401, errors.New("userId in JWT not the admin userId of community requested"))
		return
	}

	// Add propertyID to this community
	err = s.db.CreateCommunityProperty(communityDetails.CommunityID, data.PropertyID)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	w.WriteHeader(201)
}

// PUT /api/communities/{id}
// AUTHED
func (s *Server) apiUpdateCommunitiesHandler(w http.ResponseWriter, r *http.Request) {
	// Authenticate user
	authedUserId, err := s.getAuthedUserId(r)
	if err != nil {
		respondWithError(w, 401, err)
		return
	}

	// Set max size to parse given data and parse
	MAX_SIZE := 55 << 20 // 55 MiB
	r.Body = http.MaxBytesReader(w, r.Body, int64(MAX_SIZE))
	err = r.ParseMultipartForm(int64(MAX_SIZE + 512))
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	// Unmarshal details data
	detailsRaw := r.FormValue("details")
	var communityDetails database.CommunityDetails
	err = json.Unmarshal([]byte(detailsRaw), &communityDetails)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	// Validate communityId in the data in the request body matches the id in the URL
	if communityDetails.CommunityID != chi.URLParam(r, "id") {
		respondWithError(w, http.StatusBadRequest, errors.New("communityId in url does not match communityId in request body"))
		return
	}

	// Validate community's admin is the same id in token
	if authedUserId != communityDetails.AdminUserID {
		respondWithError(w, 401, errors.New("userId in token does not match adminUserId of community details to be created"))
		return
	}

	// Validate community details
	err = ValidateCommnityDetails(communityDetails)
	if err != nil {
		respondWithError(w, 400, err)
		return
	}

	// Get community images (optional, can be 0)
	numberImagesRaw := r.FormValue("numImages")
	numberImagesInt64, err := strconv.ParseInt(numberImagesRaw, 10, 16)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}
	numberImages := int16(numberImagesInt64)

	var images []database.FileInternal
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

		images = append(images, database.FileInternal{
			Filename: imageFileHeader.Filename,
			Mimetype: imageFileHeader.Header.Get("Content-Type"),
			Size:     imageFileHeader.Size,
			Data:     imageData,
		})
	}

	// Update community details and images
	err = s.db.UpdateCommunityDetails(communityDetails)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}
	err = s.db.UpdateCommunityImages(communityDetails.CommunityID, images)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	// Respond with ok
	w.WriteHeader(200)
}

// DELETE /api/communities/{id}
// AUTHED
func (s *Server) apiDeleteCommunitiesHandler(w http.ResponseWriter, r *http.Request) {
	// Authenticate user
	authedUserId, err := s.getAuthedUserId(r)
	if err != nil {
		respondWithError(w, 401, err)
		return
	}

	communityId := chi.URLParam(r, "id")
	if len(communityId) == 0 {
		respondWithError(w, 400, errors.New("no communityId given"))
		return
	}

	// Try to get community
	communityDetails, err := s.db.GetCommunityDetails(communityId)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	// Ensure user is an admin of the community and not admin of entire site.
	if communityDetails.AdminUserID != communityId && authedUserId != s.AdminUserID {
		respondWithError(w, 401, errors.New("account not authorized for this action"))
		return
	}

	// Delete community
	err = s.db.DeleteCommunity(communityId)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	w.WriteHeader(200)
}

// DELETE /api/communities/user
// AUTHED
func (s *Server) apiDeleteCommunitiesUserHandler(w http.ResponseWriter, r *http.Request) {
	// Authenticate user
	authedUserId, err := s.getAuthedUserId(r)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, err)
		return
	}

	query := r.URL.Query()
	communityId := query.Get("communityId")
	userId := query.Get("userId")

	// Ensure presence of both query parameters
	if communityId == "" || userId == "" {
		respondWithError(w, http.StatusBadRequest, errors.New("missing query parameters in either/both communityId and userId"))
		return
	}

	// Try to get community details to validate existence of community
	communityDetails, err := s.db.GetCommunityDetails(communityId)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Ensure authedUserId is the same as the adminId of community
	if communityDetails.AdminUserID != authedUserId {
		respondWithError(w, http.StatusUnauthorized, err)
		return
	}

	// Ensure userId is NOT adminId of community
	// (Don't allow admin to remove themselves, they should delete the community instead)
	if authedUserId == userId {
		respondWithError(w, http.StatusBadRequest, errors.New("community admin cannot remove themselves from the community"))
		return
	}

	// Attempt user deletion
	err = s.db.DeleteCommunityUser(communityId, userId)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Respond ok
	w.WriteHeader(http.StatusOK)
}

// DELETE /api/communities/properties
// AUTHED
func (s *Server) apiDeleteCommunitiesPropertiesHandler(w http.ResponseWriter, r *http.Request) {
	// Authenticate user
	authedUserId, err := s.getAuthedUserId(r)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, err)
		return
	}

	query := r.URL.Query()
	communityId := query.Get("communityId")
	propertyId := query.Get("propertyId")

	// Ensure presence of query parameters
	if communityId == "" || propertyId == "" {
		respondWithError(w, http.StatusBadRequest, errors.New("missing query parameters in either/both communityId and propertyId"))
		return
	}

	// Try to get community details to validate existence of community
	communityDetails, err := s.db.GetCommunityDetails(communityId)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Ensure authedUserId is the same as the adminId of community
	if communityDetails.AdminUserID != authedUserId {
		respondWithError(w, http.StatusUnauthorized, err)
		return
	}

	// Try to delete property marking from this community
	err = s.db.DeleteCommunityProperty(communityId, propertyId)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Respond ok
	w.WriteHeader(http.StatusOK)
}

// GET /api/account/communities
// AUTHED
func (s *Server) apiGetUserOwnedCommunities(w http.ResponseWriter, r *http.Request) {
	// Authenticate user
	authedUserId, err := s.getAuthedUserId(r)
	if err != nil {
		respondWithError(w, 401, err)
		return
	}

	// Retrieve saved communities of authed user
	communityIds, err := s.db.GetUserOwnedCommunities(authedUserId)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	respondWithJSON(w, 200, struct {
		CommunityIDs []string `json:"communityIds"`
	}{
		CommunityIDs: communityIds,
	})
}

// --------------- Public Users API ---------------

// GET /api/users
// NO AUTH
//
// Return a list of userIds for the given query, only returning userIDs whose accounts have been setup.
// Expects query parameters to filter for / get pages of userIds
func (s *Server) apiGetUsersHandler(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	offset := query.Get("page")
	if offset == "" {
		respondWithError(w, http.StatusBadRequest, errors.New("empty page query param"))
		return
	}
	limit := query.Get("limit")
	if limit == "" {
		respondWithError(w, http.StatusBadRequest, errors.New("empty limit query param"))
		return
	}

	tmp, err := strconv.ParseInt(offset, 10, 32)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err)
		return
	}
	offsetInt := int32(tmp)

	tmp, err = strconv.ParseInt(limit, 10, 32)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}
	limitInt := int32(tmp)

	// Look for extra filters, if they exist
	firstNameFilter := query.Get("filterFirstName")
	lastNameFilter := query.Get("filterLastName")
	var userIDs []string
	if firstNameFilter != "" || lastNameFilter != "" {
		userIDs, err = s.db.GetNextPagePublicUserIDsFilterByName(limitInt, offsetInt, firstNameFilter, lastNameFilter)
	} else {
		userIDs, err = s.db.GetNextPagePublicUserIDs(limitInt, offsetInt)
	}
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err)
		return
	}

	respondWithJSON(w, http.StatusOK, struct {
		UserIDs []string `json:"userIDs"`
	}{
		UserIDs: userIDs,
	})
}

// GET /api/users/{id}
// NO AUTH
func (s *Server) apiGetUserHandler(w http.ResponseWriter, r *http.Request) {
	userID := chi.URLParam(r, "id")

	userPublicProfile, err := s.db.GetPublicUserProfile(userID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err)
		return
	}

	respondWithJSON(w, http.StatusOK, userPublicProfile)
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

	// Auth
	r.Get("/auth/{provider}", s.authLoginHandler)
	r.Get("/auth/{provider}/callback", s.authCallbackHandler)
	r.Get("/auth/{provider}/check", s.authCheckHandler)
	r.Post("/auth/{provider}/logout", s.authLogoutHandler)

	// Account
	r.Get("/api/account", s.apiGetAccountDetailsHandler)
	r.Get("/api/account/communities", s.apiGetUserOwnedCommunities)
	r.Post("/api/account", s.apiUpdateAccountDetailsHandler)
	r.Delete("/api/account", s.apiDeleteAccountHandler)

	// A user can get their own role
	r.Get("/api/account/role", s.apiGetUserRoleHandler)

	// Admin
	r.Get("/api/admin/users", s.apiAdminGetUsers)
	r.Get("/api/admin/users/roles", s.apiAdminGetUsersRoles)
	r.Post("/api/admin/users/roles", s.apiUpdateUserRoleHandler)

	// Properties
	r.Get("/api/properties/{id}", s.apiGetPropertyHandler)
	r.Get("/api/properties/total", s.apiGetPropertiesTotalCountHandler)
	r.Get("/api/properties", s.apiGetPropertiesHandler)
	r.Post("/api/properties", s.apiCreatePropertiesHandler)
	r.Put("/api/properties/{id}", s.apiUpdatePropertiesHandler)
	r.Delete("/api/properties/{id}", s.apiDeletePropertiesHandler)

	// Public Lister info
	r.Get("/api/lister", s.apiGetListerInfoHandler)

	// Communities
	r.Get("/api/communities/{id}", s.apiGetCommunityHandler)
	r.Get("/api/communities", s.apiGetCommunitiesHandler)
	r.Post("/api/communities", s.apiCreateCommunitiesHandler)
	r.Post("/api/communities/users", s.apiCreateCommunitiesUserHandler)
	r.Post("/api/communities/properties", s.apiCreateCommunitiesPropertyHandler)
	r.Put("/api/communities/{id}", s.apiUpdateCommunitiesHandler)
	r.Delete("/api/communities/{id}", s.apiDeleteCommunitiesHandler)
	r.Delete("/api/communities/users", s.apiDeleteCommunitiesUserHandler)
	r.Delete("/api/communities/properties", s.apiDeleteCommunitiesPropertiesHandler)

	// Users
	r.Get("/api/users", s.apiGetUsersHandler)
	r.Get("/api/users/{id}", s.apiGetUserHandler)

	return r
}
