package server

import (
	"fmt"
	"net/http"
	"time"

	_ "github.com/joho/godotenv/autoload"

	"backend/internal/config"
	"backend/internal/database"
	"backend/internal/routes"
)

type Server struct {
	db database.Service
}

func (s *Server) DB() database.Service {
	return s.db
}

func NewServer() *http.Server {
	s := &Server{
		db: database.New(),
	}

	// Declare Server config
	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", config.GlobalConfig.PORT),
		Handler:      routes.RegisterRoutes(s),
		IdleTimeout:  time.Minute,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	return server
}
