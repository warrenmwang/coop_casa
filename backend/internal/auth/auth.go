package auth

import (
	"fmt"
	"os"
	"strconv"

	"github.com/gorilla/sessions"
	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	"github.com/markbates/goth/providers/google"
)

const MaxAge = 86400 * 30 // 30 days

func NewAuth() {
	port, _ := strconv.Atoi(os.Getenv("PORT"))
	googleClientId := os.Getenv("GOOGLE_CLIENT_ID")
	googleClientSecret := os.Getenv("GOOGLE_CLIENT_SECRET")

	key := os.Getenv("AUTH_KEY_SECRET")
	IsProd, err := strconv.ParseBool(os.Getenv("IS_PROD"))
	if err != nil {
		fmt.Println("Error parsing IS_PROD var", err)
		return
	}

	var host string
	if IsProd {
		host = os.Getenv("PROD_HOST")
	} else {
		host = os.Getenv("DEV_HOST")
	}

	store := sessions.NewCookieStore([]byte(key))
	store.MaxAge(MaxAge)
	store.Options.HttpOnly = true
	store.Options.Secure = IsProd

	gothic.Store = store

	// list of providers that we want our application to accept oauth connections from
	goth.UseProviders(
		google.New(googleClientId, googleClientSecret, fmt.Sprintf("%s:%d/auth/google/callback", host, port)),
	)
}
