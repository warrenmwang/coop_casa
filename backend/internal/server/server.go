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
	port          int
	frontendPort  int
	jwtSignSecret string
	IsProd        bool
	DEBUG         bool

	db database.Service
}

func NewServer() *http.Server {
	port, _ := strconv.Atoi(os.Getenv("PORT"))
	frontendPort, _ := strconv.Atoi(os.Getenv("FRONTENDPORT"))
	jwtSignSecret := os.Getenv("JWT_SIGN_SECRET")
	IsProd, _ := strconv.ParseBool(os.Getenv("IS_PROD"))
	DEBUG, _ := strconv.ParseBool(os.Getenv("DEBUG_FLAG"))

	NewServer := &Server{
		port:          port,
		frontendPort:  frontendPort,
		jwtSignSecret: jwtSignSecret,
		IsProd:        IsProd,
		DEBUG:         DEBUG,

		db: database.New(),
	}

	// Declare Server config
	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", NewServer.port),
		Handler:      NewServer.RegisterRoutes(),
		IdleTimeout:  time.Minute,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	return server
}
