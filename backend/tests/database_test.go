package tests

import (
	"backend/internal/config"
	"backend/internal/database"
	"testing"
)

func TestDatabase(t *testing.T) {
	// Assumes docker postgresql db to be up.
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

func TestMain(m *testing.M) {
	config.InitConfig()
	m.Run()
}
