package auth

import (
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/gorilla/sessions"
	"github.com/joho/godotenv"
	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	"github.com/markbates/goth/providers/google"
)

const (
	key    = "UgQYB96bNuxTCi6PhUWeylwF1Z4="
	MaxAge = 86400 * 30 // 30 days
	IsProd = false
)

func NewAuth() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	port, _ := strconv.Atoi(os.Getenv("PORT"))
	googleClientId := os.Getenv("GOOGLE_CLIENT_ID")
	googleClientSecret := os.Getenv("GOOGLE_CLIENT_SECRET")

	store := sessions.NewCookieStore([]byte(key))

	gothic.Store = store

	// list of providers that we want our application to accept oauth connections from
	goth.UseProviders(
		google.New(googleClientId, googleClientSecret, fmt.Sprintf("http://localhost:%d/auth/google/callback", port)),
	)
}
