package server

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	_ "github.com/joho/godotenv/autoload"

	"backend/internal/database"
)

type Server struct {
	FrontendOrigin string
	JwtSignSecret  string
	IsProd         bool
	AdminUserID    string

	db database.Service
}

func NewServer() *http.Server {
	backendPort, err := strconv.Atoi(os.Getenv("INTERNAL_BACKEND_PORT"))
	if err != nil {
		log.Fatal("failed to parse INTERNAL_BACKEND_PORT")
	}
	frontendPort, err := strconv.Atoi(os.Getenv("EXTERNAL_FRONTEND_PORT"))
	if err != nil {
		log.Fatal("failed to parse EXTERNAL_FRONTEND_PORT")
	}
	jwtSignSecret := os.Getenv("JWT_SIGN_SECRET")
	if jwtSignSecret == "" {
		log.Fatal("unexpected empty environment variable: jwtSignSecret")
	}
	IsProd, err := strconv.ParseBool(os.Getenv("IS_PROD"))
	if err != nil {
		log.Fatal("failed to parse IS_PROD")
	}
	adminUserID := os.Getenv("ADMIN_USER_ID")
	if adminUserID == "" {
		log.Fatal("unexpected empty environment variable: adminUserID")
	}

	var host string
	var frontendOrigin string
	if IsProd {
		host = os.Getenv("PROD_HOST")
		if host == "" {
			log.Fatal("unexpected empty environment variable: host")
		}
		frontendOrigin = fmt.Sprintf("%s:%d", host, frontendPort)
	} else {
		host = os.Getenv("DEV_HOST")
		if host == "" {
			log.Fatal("unexpected empty environment variable: host")
		}
		frontendOrigin = fmt.Sprintf("%s:%d", host, frontendPort)
	}

	NewServer := &Server{
		FrontendOrigin: frontendOrigin,
		JwtSignSecret:  jwtSignSecret,
		IsProd:         IsProd,
		AdminUserID:    adminUserID,

		db: database.New(),
	}

	// Declare Server config
	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", backendPort),
		Handler:      NewServer.RegisterRoutes(),
		IdleTimeout:  time.Minute,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	return server
}
