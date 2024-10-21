// Package config holds gloval constant values and contains functions
// to load in all the environment variables used through the backend service.
package config

import (
	"fmt"
	"log"
	"os"
	"strconv"
)

var GlobalConfig *Config

const MAX_TOKEN_AGE = 86400 * 30 // 30 days

const USER_ROLE_REGULAR = "regular"
const USER_ROLE_LISTER = "lister"
const USER_ROLE_ADMIN = "admin"

const USER_STATUS_NORMAL = "normal"
const USER_STATUS_PRIVATE = "private"
const USER_STATUS_FLAGGED = "flagged"

var USER_ROLE_OPTIONS = map[string]struct{}{
	USER_ROLE_REGULAR: {},
	USER_ROLE_LISTER:  {},
	USER_ROLE_ADMIN:   {},
}

var USER_STATUS_OPTIONS = map[string]struct{}{
	USER_STATUS_NORMAL:  {},
	USER_STATUS_PRIVATE: {},
	USER_STATUS_FLAGGED: {},
}

var GENDER_OPTIONS = map[string]struct{}{
	"Man":                 {},
	"Woman":               {},
	"Transgender Woman":   {},
	"Transgender Man":     {},
	"Non-binary":          {},
	"Agender":             {},
	"Prefer Not To State": {},
}

var INTERESTS_OPTIONS = map[string]struct{}{
	"Reading":        {},
	"Traveling":      {},
	"Cooking":        {},
	"Swimming":       {},
	"Gaming":         {},
	"Sports":         {},
	"Music":          {},
	"Art":            {},
	"Technology":     {},
	"Politics":       {},
	"Writing":        {},
	"Social Justice": {},
	"History":        {},
	"Dance":          {},
}

type Config struct {
	HOST                  string
	IS_PROD               bool
	PORT                  int
	FRONTEND_PORT         int
	FRONTEND_ORIGIN       string
	DB_DATABASE           string
	DB_PASSWORD           string
	DB_USERNAME           string
	DB_HOST               string
	DB_PORT               string
	DB_ENCRYPT_KEY_SECRET string
	GOOGLE_CLIENT_ID      string
	GOOGLE_CLIENT_SECRET  string
	AUTH_KEY_SECRET       string
	JWT_SIGN_SECRET       string
	ADMIN_USER_ID         string
}

// Initconfig reads in and saves all the environment variables used in the backend service.
func InitConfig() {
	// Server config
	backendPort, err := strconv.Atoi(os.Getenv("INTERNAL_BACKEND_PORT"))
	if err != nil {
		log.Fatal("failed to parse INTERNAL_BACKEND_PORT")
	}
	frontendPort, err := strconv.Atoi(os.Getenv("EXTERNAL_FRONTEND_PORT"))
	if err != nil {
		log.Fatal("failed to parse EXTERNAL_FRONTEND_PORT")
	}
	isProd, err := strconv.ParseBool(os.Getenv("IS_PROD"))
	if err != nil {
		log.Fatal("failed to parse IS_PROD")
	}
	var host string
	if isProd {
		host = os.Getenv("PROD_HOST")
	} else {
		host = os.Getenv("DEV_HOST")
	}
	if host == "" {
		log.Fatal("host env var is empty")
	}
	frontendOrigin := fmt.Sprintf("%s:%d", host, frontendPort) // For CORS middleware

	// Auth
	jwtSignSecret := os.Getenv("JWT_SIGN_SECRET")
	if jwtSignSecret == "" {
		log.Fatal("empty jwt sign secret")
	}
	adminUserID := os.Getenv("ADMIN_USER_ID")
	if adminUserID == "" {
		log.Fatal("unexpected empty environment variable: adminUserID")
	}
	googleClientId := os.Getenv("GOOGLE_CLIENT_ID")
	if googleClientId == "" {
		log.Fatal("empty google client id")
	}
	googleClientSecret := os.Getenv("GOOGLE_CLIENT_SECRET")
	if googleClientSecret == "" {
		log.Fatal("empty google client secret")
	}
	authKey := os.Getenv("AUTH_KEY_SECRET")
	if authKey == "" {
		log.Fatal("empty auth key secret")
	}

	// Database configs
	dbDatabase := os.Getenv("DB_DATABASE")
	if dbDatabase == "" {
		log.Fatal("unexpected empty environment variable: DB_DATABASE")
	}
	dbPassword := os.Getenv("DB_PASSWORD")
	if dbPassword == "" {
		log.Fatal("unexpected empty environment variable: DB_PASSWORD")
	}
	dbUsername := os.Getenv("DB_USERNAME")
	if dbUsername == "" {
		log.Fatal("unexpected empty environment variable: DB_USERNAME")
	}
	dbPort := os.Getenv("DB_PORT")
	if dbPort == "" {
		log.Fatal("unexpected empty environment variable: DB_PORT")
	}
	dbHost := os.Getenv("DB_HOST")
	if dbHost == "" {
		log.Fatal("unexpected empty environment variable: DB_HOST")
	}
	dbEncryptKey := os.Getenv("DB_ENCRYPT_KEY_SECRET")
	if dbEncryptKey == "" {
		log.Fatal("unexpected empty environment variable: DB_ENCRYPT_KEY_SECRET")
	}

	GlobalConfig = &Config{
		HOST:                  host,
		IS_PROD:               isProd,
		PORT:                  backendPort,
		FRONTEND_PORT:         frontendPort,
		FRONTEND_ORIGIN:       frontendOrigin,
		DB_DATABASE:           dbDatabase,
		DB_PASSWORD:           dbPassword,
		DB_USERNAME:           dbUsername,
		DB_HOST:               dbHost,
		DB_PORT:               dbPort,
		DB_ENCRYPT_KEY_SECRET: dbEncryptKey,
		GOOGLE_CLIENT_ID:      googleClientId,
		GOOGLE_CLIENT_SECRET:  googleClientSecret,
		AUTH_KEY_SECRET:       authKey,
		JWT_SIGN_SECRET:       jwtSignSecret,
		ADMIN_USER_ID:         adminUserID,
	}
}
