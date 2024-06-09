package server

import (
	"fmt"
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

	db database.Service
}

func NewServer() *http.Server {
	backendPort, _ := strconv.Atoi(os.Getenv("INTERNAL_BACKEND_PORT"))
	frontendPort, _ := strconv.Atoi(os.Getenv("EXTERNAL_FRONTEND_PORT"))
	jwtSignSecret := os.Getenv("JWT_SIGN_SECRET")
	IsProd, _ := strconv.ParseBool(os.Getenv("IS_PROD"))

	var host string
	var frontendOrigin string
	if IsProd {
		host = os.Getenv("PROD_HOST")
		frontendOrigin = fmt.Sprintf("%s:%d", host, frontendPort)
	} else {
		host = os.Getenv("DEV_HOST")
		frontendOrigin = fmt.Sprintf("%s:%d", host, frontendPort)
	}

	NewServer := &Server{
		FrontendOrigin: frontendOrigin,
		JwtSignSecret:  jwtSignSecret,
		IsProd:         IsProd,

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
