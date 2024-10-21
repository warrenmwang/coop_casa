// Package auth provides functions related to user authentication.
// It contains functions for working with JWTs in cookies as well as middlewares
// that are to be used with protecting authenticated endpoints for different
// levels of privilege.
package auth

import (
	"backend/internal/config"
	"fmt"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt"
	"github.com/gorilla/sessions"
	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	"github.com/markbates/goth/providers/google"

	_ "github.com/joho/godotenv/autoload"
)

// NewAuth sets up the the Goth store for usage with Google OAuth2.0 provider
// for user authentication.
func NewAuth() {
	host := config.GlobalConfig.HOST
	isProd := config.GlobalConfig.IS_PROD
	key := config.GlobalConfig.AUTH_KEY_SECRET
	googleClientId := config.GlobalConfig.GOOGLE_CLIENT_ID
	googleClientSecret := config.GlobalConfig.GOOGLE_CLIENT_SECRET

	var callbackURL string
	if isProd {
		callbackURL = fmt.Sprintf("%s:%d/auth/v1/google/callback", host, config.GlobalConfig.FRONTEND_PORT) // rely on docker proxy
	} else {
		callbackURL = fmt.Sprintf("%s:%d/auth/v1/google/callback", host, config.GlobalConfig.PORT) // access backend straight up for fast dev
	}

	store := sessions.NewCookieStore([]byte(key))
	store.MaxAge(config.MAX_TOKEN_AGE)
	store.Options.HttpOnly = true
	store.Options.Secure = isProd

	gothic.Store = store

	// list of providers that we want our application to accept oauth connections from
	goth.UseProviders(
		google.New(googleClientId, googleClientSecret, callbackURL),
	)
}

// UserOAuthDetails holds the information that we care about returned to us from
// our OAuth2.0 provider. We just need the OpenID and the Email of the user.
type UserOAuthDetails struct {
	UserId string
	Email  string
}

// GenerateToken generates a JWT with a payload of the user's OAuth2.0 information
// with a given expiration time and signs the token with a given signing key secret.
func GenerateToken(user UserOAuthDetails, expireTime time.Time, signingKeySecret string) (string, error) {
	// Define token claims
	claims := jwt.MapClaims{}
	claims["user_id"] = user.UserId
	claims["email"] = user.Email
	claims["exp"] = expireTime.Unix()

	// Create token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Sign token with a string
	tokenString, err := token.SignedString([]byte(signingKeySecret))
	if err != nil {
		return "", fmt.Errorf("error in generateToken: %v", err.Error())
	}

	return tokenString, nil
}

// InvalidateToken invalidates the token in the attached cookie from the HTTP request.
func InvalidateToken(w http.ResponseWriter, isProd bool) {
	// Expire their JWT by by setting a new token in the http-only cookie with an expiration date
	// in the past.
	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    "",
		Path:     "/",
		Expires:  time.Unix(0, 0),
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   isProd,
	})
}

// ValidateTokenAndGetClaims takes the raw JWT as a string and validates it.
// If valid, it will return the claims object (key value pairs of information put inside the token).
// Otherwise it returns an error.
func ValidateTokenAndGetClaims(tokenString string, signingKeySecret string) (jwt.MapClaims, error) {
	// Gets the JWT and validates it. If valid, return the claims.
	// Return an error if invalid.

	// Validate JWT
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(signingKeySecret), nil
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

// AuthCheckAndGetClaims retrieves the JWT from the cookie attached to
// the HTTP request given and checks the JWT attached to the request, returning
// the claims object if valid and an error otherwise.
func AuthCheckAndGetClaims(r *http.Request, signingKeySecret string) (jwt.MapClaims, error) {
	// Read JWT from HttpOnly Cookie
	cookie, err := r.Cookie("token")
	if err != nil {
		return nil, fmt.Errorf("no token in cookie in request: %v", err.Error())
	}
	tokenString := cookie.Value

	// Check if JWT is valid and get claims
	claims, err := ValidateTokenAndGetClaims(tokenString, signingKeySecret)
	if err != nil {
		return nil, err
	}
	return claims, nil
}
