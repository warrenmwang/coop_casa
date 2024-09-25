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

const MaxAge = 86400 * 30 // 30 days

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
	store.MaxAge(MaxAge)
	store.Options.HttpOnly = true
	store.Options.Secure = isProd

	gothic.Store = store

	// list of providers that we want our application to accept oauth connections from
	goth.UseProviders(
		google.New(googleClientId, googleClientSecret, callbackURL),
	)
}

type UserOAuthDetails struct {
	UserId string
	Email  string
}

// Generates a JWT for a user attempting login
func GenerateToken(user UserOAuthDetails, expireTime time.Time, signingKeySecret string) (string, error) {
	// Define token claims
	claims := jwt.MapClaims{}
	claims["authorized"] = true
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

// Invalidate the token in the browser from the request
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

// Given the raw JWT as string, validate that the server signed it and return
// the claims object (key value pairs of information put inside the token)
// if it is good, otherwise return an error.
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

// Checks the JWT attached to the request, verify that it was properly signed
// by the server, and if so return the claims object. Otherwise, return an error.
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
