package tests

import (
	"backend/internal/database"
	"log"
	"path/filepath"
	"testing"

	"github.com/joho/godotenv"
)

func TestDatabase(t *testing.T) {
	// Assumes docker postgresql db to be up.

	rootDir := filepath.Join("..", ".env")
	err := godotenv.Load(rootDir)
	if err != nil {
		log.Fatalf("Error loading .env file: %s\n", err.Error())
	}

	db := database.New()
	expected := map[string]string{
		"message": "It's healthy",
	}
	returned := db.Health()
	if returned == nil {
		t.Fatal("expected database Health() to return map[string]string")
	}

	if expected["message"] != returned["message"] {
		t.Fatal("got unexpected database Health() message")
	}
}
