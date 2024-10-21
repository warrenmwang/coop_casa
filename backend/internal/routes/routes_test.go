package routes

import (
	"testing"
)

// TODO:
func TestRespondWithJSON(t *testing.T) {

}

// TODO:
func TestRespondWithError(t *testing.T) {

}

// TODO:
func TestGenerateToken(t *testing.T) {
	// s := NewInternalServer()

	// // User with expire time one day from now
	// user := UserOAuthDetails{
	// 	UserId: "1000",
	// 	Email:  "johnnyappleseed@yahoo.com",
	// }
	// expireTime := time.Now().Add(time.Hour * 24)

	// token, err := s.GenerateToken(user, expireTime)
	// if err != nil {
	// 	t.Error("GenerateToken: token generation failed 1")
	// }
	// if token == "" {
	// 	t.Error("GenerateToken: generated token is empty 1")
	// }

	// // Generate token with expire time in the past
	// // The token is just a string and the generator should just generate what is asked of it
	// expireTime = time.Unix(0, 0)
	// token, err = s.GenerateToken(user, expireTime)
	// if err != nil {
	// 	t.Error("GenerateToken: token generation failed 2")
	// }
	// if token == "" {
	// 	t.Error("GenerateToken: generated token is empty 2")
	// }

	// // Far into the future expire time (100 years)
	// expireTime = time.Now().Add(time.Hour * 24 * 365 * 100)
	// token, err = s.GenerateToken(user, expireTime)
	// if err != nil {
	// 	t.Error("GenerateToken: token generation failed 3")
	// }
	// if token == "" {
	// 	t.Error("GenerateToken: generated token is empty 3")
	// }
}

func Test_GenerateAndValidateJWT(t *testing.T) {
	// Generate a new JWT and ensure it is valid.
	// s := &Server{
	// 	JwtSignSecret: "jwtSignSecret",
	// }

	// user := UserOAuthDetails{
	// 	UserId: "1000",
	// 	Email:  "johnnyappleseed@yahoo.com",
	// }
	// expireTime := time.Now().Add(time.Hour * 24)
	// token, err := s.GenerateToken(user, expireTime)
	// if err != nil {
	// 	t.Fatal("token generation failed")
	// }

	// // Check token contains the expected values
	// claims, err := s.ValidateTokenAndGetClaims(token)
	// if err != nil {
	// 	t.Fatalf("got this error when try ValidateTokenAndGetClaims: %s", err.Error())
	// }
	// if claims["user_id"] != user.UserId || int64(claims["exp"].(float64)) != expireTime.Unix() {
	// 	t.Fatal("generated token does not contain the expected claims data")
	// }

	// // Generate a new token with a different user and email
	// // and ensure tokens are different
	// user1 := UserOAuthDetails{
	// 	UserId: "1001",
	// 	Email:  "bobsyouruncle@hotmail.com",
	// }
	// expireTime1 := time.Now().Add(time.Hour * 24)
	// token1, err1 := s.GenerateToken(user1, expireTime1)
	// if err1 != nil {
	// 	t.Fatal("token generation failed")
	// }

	// // Check token contains the expected values
	// claims1, err1 := s.ValidateTokenAndGetClaims(token1)
	// if err1 != nil {
	// 	t.Fatalf("got this error when try ValidateTokenAndGetClaims: %s", err1.Error())
	// }
	// if claims1["user_id"] != user1.UserId || int64(claims1["exp"].(float64)) != expireTime1.Unix() {
	// 	t.Fatal("generated token does not contain the expected claims data")
	// }

	// // Check that the two tokens are actually different
	// if token == token1 {
	// 	t.Fatal("tokens of different users are the same, should be different")
	// }

}
