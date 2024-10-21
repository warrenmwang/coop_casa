// Package main provides the entrance function to setting up the backend API service for the Coop App.
// Specifically, this package only has one function, the entrnace function main.
// It will setup global configuration constants, read in requisite environment variables,
// and setup and start the main HTTP server.
package main

import (
	"backend/internal/auth"
	"backend/internal/config"
	"backend/internal/server"
	"fmt"
)

func main() {
	config.InitConfig()
	auth.NewAuth()
	server := server.NewServer()

	err := server.ListenAndServe()
	if err != nil {
		panic(fmt.Sprintf("cannot start server: %s", err))
	}
}
