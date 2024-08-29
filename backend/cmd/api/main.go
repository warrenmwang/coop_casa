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
