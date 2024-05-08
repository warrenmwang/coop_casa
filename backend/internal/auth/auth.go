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

const MaxAge = 86400 * 30 // 30 days

func NewAuth() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	port, _ := strconv.Atoi(os.Getenv("PORT"))
	googleClientId := os.Getenv("GOOGLE_CLIENT_ID")
	googleClientSecret := os.Getenv("GOOGLE_CLIENT_SECRET")

	key := os.Getenv("AUTH_KEY_SECRET")
	IsProd, err := strconv.ParseBool(os.Getenv("IS_PROD"))
	if err != nil {
		fmt.Println("Error parsing IS_PROD var", err)
		return
	}

	store := sessions.NewCookieStore([]byte(key))
	store.MaxAge(MaxAge)
	store.Options.HttpOnly = true
	store.Options.Secure = IsProd

	gothic.Store = store

	// list of providers that we want our application to accept oauth connections from
	goth.UseProviders(
		google.New(googleClientId, googleClientSecret, fmt.Sprintf("http://localhost:%d/auth/google/callback", port)),
	)
}