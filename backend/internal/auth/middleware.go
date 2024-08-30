package auth

import (
	"backend/internal/config"
	"backend/internal/utils"
	"context"
	"errors"
	"net/http"
)

// For context's in middleware
type ctxKey int

const UserIDKey ctxKey = 0
const UserEmailKey ctxKey = 1

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Try to get user id from jwt token, after validating it
		claims, err := AuthCheckAndGetClaims(r, config.GlobalConfig.JWT_SIGN_SECRET)
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

func AdminAuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Try to get user id from jwt token, after validating it
		claims, err := AuthCheckAndGetClaims(r, config.GlobalConfig.JWT_SIGN_SECRET)
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
			utils.RespondWithError(w, 401, errors.New("unauthorized"))
			return
		}

		// Otherwise add userid and email to context for handlers
		ctx := context.WithValue(r.Context(), UserIDKey, userID)
		ctx = context.WithValue(ctx, UserEmailKey, userEmail)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
