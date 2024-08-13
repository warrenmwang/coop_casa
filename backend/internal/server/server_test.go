package server

import (
	"fmt"
	"os"
	"strconv"
	"testing"
)

func TestNewInternalServer(t *testing.T) {
	frontendPort, err := strconv.Atoi(os.Getenv("EXTERNAL_FRONTEND_PORT"))
	if err != nil {
		t.Fatal("failed to parse EXTERNAL_FRONTEND_PORT")
	}
	jwtSignSecret := os.Getenv("JWT_SIGN_SECRET")
	if jwtSignSecret == "" {
		t.Fatal("unexpected empty environment variable: jwtSignSecret")
	}
	IsProd, err := strconv.ParseBool(os.Getenv("IS_PROD"))
	if err != nil {
		t.Fatal("failed to parse IS_PROD")
	}
	adminUserID := os.Getenv("ADMIN_USER_ID")
	if adminUserID == "" {
		t.Fatal("unexpected empty environment variable: adminUserID")
	}

	var host string
	var frontendOrigin string
	if IsProd {
		host = os.Getenv("PROD_HOST")
		if host == "" {
			t.Fatal("unexpected empty environment variable: host")
		}
		frontendOrigin = fmt.Sprintf("%s:%d", host, frontendPort)
	} else {
		host = os.Getenv("DEV_HOST")
		if host == "" {
			t.Fatal("unexpected empty environment variable: host")
		}
		frontendOrigin = fmt.Sprintf("%s:%d", host, frontendPort)
	}

	// Instantiate new internal server struct to ensure properties are correct
	// and match the expected variables found in the env
	server := NewInternalServer()

	if server.FrontendOrigin != frontendOrigin {
		t.Error("new internal server struct frontend origin not matching env host:frontendPort")
	}

	if server.JwtSignSecret != jwtSignSecret {
		t.Error("new internal server struct jwt sign secret not matching env jwtSignSecret")
	}

	if server.IsProd != IsProd {
		t.Error("new internal server struct isProd not matching env isProd")
	}

	if server.AdminUserID != adminUserID {
		t.Error("new internal server struct admin user id not matching env admin user id")
	}
}
