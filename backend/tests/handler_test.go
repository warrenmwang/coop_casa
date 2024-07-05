package tests

import (
	"backend/internal/server"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestHandler(t *testing.T) {
	s := &server.Server{}
	server := httptest.NewServer(http.HandlerFunc(s.HelloWorldHandler))
	defer server.Close()
	resp, err := http.Get(server.URL)
	if err != nil {
		t.Fatalf("error making request to server. Err: %v", err)
	}
	defer resp.Body.Close()
	// Assertions
	if resp.StatusCode != http.StatusOK {
		t.Errorf("expected status OK; got %v", resp.Status)
	}
	expected := "{\"message\":\"Hello World\"}"
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("error reading response body. Err: %v", err)
	}
	if expected != string(body) {
		t.Errorf("expected response body to be %v; got %v", expected, string(body))
	}
}

func TestGenerateJWT(t *testing.T) {
	// Generate a new JWT and ensure it is valid.
	s := &server.Server{
		JwtSignSecret: "jwtSignSecret",
	}

	user := server.UserOAuthDetails{
		UserId: "1000",
		Email:  "johnnyappleseed@yahoo.com",
	}
	expireTime := time.Now().Add(time.Hour * 24)
	token, err := s.GenerateToken(user, expireTime)
	if err != nil {
		t.Fatal("token generation failed")
	}

	// Check token contains the expected values
	claims, err := s.ValidateTokenAndGetClaims(token)
	if err != nil {
		t.Fatalf("got this error when try ValidateTokenAndGetClaims: %s", err.Error())
	}
	if claims["user_id"] != user.UserId || int64(claims["exp"].(float64)) != expireTime.Unix() {
		t.Fatal("generated token does not contain the expected claims data")
	}

	// Generate a new token with a different user and email
	// and ensure tokens are different
	user1 := server.UserOAuthDetails{
		UserId: "1001",
		Email:  "bobsyouruncle@hotmail.com",
	}
	expireTime1 := time.Now().Add(time.Hour * 24)
	token1, err1 := s.GenerateToken(user1, expireTime1)
	if err1 != nil {
		t.Fatal("token generation failed")
	}

	// Check token contains the expected values
	claims1, err1 := s.ValidateTokenAndGetClaims(token1)
	if err1 != nil {
		t.Fatalf("got this error when try ValidateTokenAndGetClaims: %s", err1.Error())
	}
	if claims1["user_id"] != user1.UserId || int64(claims1["exp"].(float64)) != expireTime1.Unix() {
		t.Fatal("generated token does not contain the expected claims data")
	}

	// Check that the two tokens are actually different
	if token == token1 {
		t.Fatal("tokens of different users are the same, should be different")
	}

}
