package auth

import (
	"fmt"
	"os"
	"strconv"

	"github.com/gorilla/sessions"
	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	"github.com/markbates/goth/providers/google"

	_ "github.com/joho/godotenv/autoload"
)

const MaxAge = 86400 * 30 // 30 days

func NewAuth() {
	googleClientId := os.Getenv("GOOGLE_CLIENT_ID")
	googleClientSecret := os.Getenv("GOOGLE_CLIENT_SECRET")
	frontendPort, _ := strconv.Atoi(os.Getenv("EXTERNAL_FRONTEND_PORT"))
	key := os.Getenv("AUTH_KEY_SECRET")
	backendPort, _ := strconv.Atoi(os.Getenv("INTERNAL_BACKEND_PORT"))

	IsProd, err := strconv.ParseBool(os.Getenv("IS_PROD"))
	if err != nil {
		fmt.Println("Error parsing IS_PROD var", err)
		return
	}

	var host string
	var callbackURL string
	if IsProd {
		host = os.Getenv("PROD_HOST")
		callbackURL = fmt.Sprintf("%s:%d/auth/google/callback", host, frontendPort) // rely on docker proxy
	} else {
		host = os.Getenv("DEV_HOST")
		callbackURL = fmt.Sprintf("%s:%d/auth/google/callback", host, backendPort) // access backend straight up for fast dev
	}

	store := sessions.NewCookieStore([]byte(key))
	store.MaxAge(MaxAge)
	store.Options.HttpOnly = true
	store.Options.Secure = IsProd

	gothic.Store = store

	// list of providers that we want our application to accept oauth connections from
	goth.UseProviders(
		google.New(googleClientId, googleClientSecret, callbackURL),
	)
}
