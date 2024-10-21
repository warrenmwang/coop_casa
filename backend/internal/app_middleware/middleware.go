// Package app_middleware contains all the middleware functions used internally.
// It includes for example a CORS middleware and authentication middlewares for differing levels of account privilges.
package app_middleware

import (
	"backend/internal/auth"
	"backend/internal/config"
	"backend/internal/utils"
	"context"
	"errors"
	"net/http"
)

func CorsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Set CORS headers
		w.Header().Set("Access-Control-Allow-Origin", config.GlobalConfig.FRONTEND_ORIGIN)

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

// ctxkKey is a type we declare to use for context's in middlewares.
type ctxKey int
// UserIDKey is the key for UserID.
const UserIDKey ctxKey = 0
// UserEmailKey is the key we use for UserEmail.
const UserEmailKey ctxKey = 1

// AuthMiddleware is a middleware that authenticates requests for any user that has successfully
// authenticated themself to the Google OAuth2.0 provider and is using the JWT dished out by this service.
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Try to get user id from jwt token, after validating it
		claims, err := auth.AuthCheckAndGetClaims(r, config.GlobalConfig.JWT_SIGN_SECRET)
		if err != nil {
			utils.RespondWithError(w, http.StatusUnauthorized, err)
			return
		}
		userID, ok := claims["user_id"].(string)
		if !ok {
			utils.RespondWithError(w, http.StatusUnauthorized, errors.New("invalid userId"))
			return
		}
		userEmail, ok := claims["email"].(string)
		if !ok {
			utils.RespondWithError(w, http.StatusUnauthorized, errors.New("invalid userEmail"))
			return
		}

		// Ensure userid is not blank
		if userID == "" {
			utils.RespondWithError(w, http.StatusBadRequest, errors.New("user id is empty"))
			return
		}

		// Ensure userEmail is not blank
		if userEmail == "" {
			utils.RespondWithError(w, http.StatusBadRequest, errors.New("user email is empty"))
			return
		}

		// Otherwise add userid and email to context for handlers
		ctx := context.WithValue(r.Context(), UserIDKey, userID)
		ctx = context.WithValue(ctx, UserEmailKey, userEmail)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// AdminAuthMiddleware is a middleware function that authenticates requests for
// admin-level functions. Only the user with admin account, as confirmed by OAuth2.0 provider,
// can pass this middleware and reach the handlers.
func AdminAuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Try to get user id from jwt token, after validating it
		claims, err := auth.AuthCheckAndGetClaims(r, config.GlobalConfig.JWT_SIGN_SECRET)
		if err != nil {
			utils.RespondWithError(w, http.StatusUnauthorized, err)
			return
		}
		userID, ok := claims["user_id"].(string)
		if !ok {
			utils.RespondWithError(w, http.StatusUnauthorized, errors.New("invalid userId"))
			return
		}
		userEmail, ok := claims["email"].(string)
		if !ok {
			utils.RespondWithError(w, http.StatusUnauthorized, errors.New("invalid userEmail"))
			return
		}

		// Ensure userid is not blank
		if userID == "" {
			utils.RespondWithError(w, http.StatusBadRequest, errors.New("user id is empty"))
			return
		}

		// Ensure userEmail is not blank
		if userEmail == "" {
			utils.RespondWithError(w, http.StatusBadRequest, errors.New("user email is empty"))
			return
		}

		// Ensure userid is the admin user id
		if userID != config.GlobalConfig.ADMIN_USER_ID {
			utils.RespondWithError(w, http.StatusUnauthorized, errors.New("unauthorized"))
			return
		}

		// Otherwise add userid and email to context for handlers
		ctx := context.WithValue(r.Context(), UserIDKey, userID)
		ctx = context.WithValue(ctx, UserEmailKey, userEmail)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
