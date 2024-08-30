package handlers

import (
	"backend/internal/auth"
	"backend/internal/config"
	"backend/internal/interfaces"
	"backend/internal/utils"
	"context"
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/markbates/goth/gothic"
)

type AuthHandler struct {
	server         interfaces.Server
	adminUserID    string
	frontendOrigin string
	isProd         bool
	jwtSecret      string
}

func NewAuthHandlers(s interfaces.Server) *AuthHandler {
	return &AuthHandler{
		server:         s,
		adminUserID:    config.GlobalConfig.ADMIN_USER_ID,
		frontendOrigin: config.GlobalConfig.FRONTEND_ORIGIN,
		isProd:         config.GlobalConfig.IS_PROD,
		jwtSecret:      config.GlobalConfig.JWT_SIGN_SECRET,
	}
}

// GET /auth/{provider}
// NO AUTH
func (h *AuthHandler) LoginHandler(w http.ResponseWriter, r *http.Request) {
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
		utils.RespondWithError(w, http.StatusInternalServerError, errors.New("something went wrong"))
	} else {
		// User is not authed, initialize the auth process
		gothic.BeginAuthHandler(w, r)
	}
}

// GET /auth/{provider}/callback
// NO AUTH
func (h *AuthHandler) CallbackHandler(w http.ResponseWriter, r *http.Request) {
	// Callback function called by the OAuth provider after the user initializes oauth process.
	// Finish auth, create JWT, and save it into a cookie.

	provider := chi.URLParam(r, "provider")

	// Ensure provider is google, which is the only one accepted at current moment
	if provider != "google" {
		utils.RespondWithError(w, http.StatusBadRequest, errors.New("invalid oauth provider callback"))
		return
	}

	// Insert the provider context from url param
	r = r.WithContext(context.WithValue(context.Background(), "provider", provider))

	// Complete OAuth
	gothUser, err := gothic.CompleteUserAuth(w, r)
	if err != nil {
		// oauth was likely cancelled by user, redirect to home page
		http.Redirect(w, r, h.frontendOrigin, http.StatusFound)
		return
	}

	// Define token lifetime to be one month
	expireTime := time.Now().Add(time.Hour * 24 * 30)

	// Create User struct with identifying user info from OAuth
	user := auth.UserOAuthDetails{
		UserId: gothUser.UserID,
		Email:  gothUser.Email,
	}

	// Create new user in DB if this is their first time in the database
	_, err = h.server.DB().GetUserDetails(user.UserId)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			// this user is not recorded in db, then it is the first time they have logged in to app.
			// create new user for them
			err = h.server.DB().CreateUser(user.UserId, user.Email)
			if err != nil {
				utils.RespondWithError(w, 500, fmt.Errorf("unable to create new user in database with err: %s", err.Error()))
				return
			}

			// Initialize new role for the user
			var role string
			if user.UserId == h.adminUserID {
				role = "admin"
			} else {
				role = "regular"
			}

			// Save role for user in the db
			err := h.server.DB().CreateNewUserRole(user.UserId, role)
			if err != nil {
				utils.RespondWithError(w, 500, fmt.Errorf("unable to create new user role in database with err: %s", err.Error()))
			}
		} else {
			utils.RespondWithError(w, 500, err)
			return
		}
	}
	// If err was nil user is already in db, just return with token

	// Generate token with user info
	tokenSigned, err := auth.GenerateToken(user, expireTime, h.jwtSecret)
	if err != nil {
		utils.RespondWithError(w, 500, err)
		return
	}

	// Set token in cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    tokenSigned,
		Path:     "/",
		Expires:  expireTime,
		HttpOnly: true,
		Secure:   h.isProd,
	})

	// Redirect to dashboard page
	http.Redirect(w, r, fmt.Sprintf("%s/dashboard", h.frontendOrigin), http.StatusFound)
}

// POST /auth/{provider}/logout
// NO AUTH
func (h *AuthHandler) LogoutHandler(w http.ResponseWriter, r *http.Request) {
	// Logout function that completes the oauth logout and invalidate the user's auth token

	provider := chi.URLParam(r, "provider")

	// Ensure using the right provider
	if provider != "google" {
		utils.RespondWithError(w, http.StatusBadRequest, errors.New("invalid auth provider"))
		return
	}

	// Invalidate their JWT.
	auth.InvalidateToken(w, h.isProd)

	// Complete logout for oauth
	// Insert the provider context
	r = r.WithContext(context.WithValue(context.Background(), "provider", provider))

	// Logout oauth
	gothic.Logout(w, r)
	w.WriteHeader(http.StatusOK)
}

// GET /auth/{provider}/check
// AUTHED
// This handler is expected to be using an auth middleware, so client will receive
// a 401 if they do not a valid jwt in their cookie with the request.
func (h *AuthHandler) AuthCheckHandler(w http.ResponseWriter, r *http.Request) {

	// Validate auth provider
	provider := chi.URLParam(r, "provider")
	if provider != "google" {
		utils.RespondWithError(w, http.StatusBadRequest, errors.New("invalid auth provider"))
		return
	}

	// Return ok
	utils.RespondWithJSON(w, http.StatusOK, struct {
		Authed bool `json:"authed"`
	}{
		Authed: true,
	})
}
