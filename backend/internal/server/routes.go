package server

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"text/template"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/golang-jwt/jwt/v5"
	"github.com/markbates/goth/gothic"
)

func (s *Server) generateToken(userID string, expireTime time.Time) (string, error) {
	// generate a JWT

	// Define token claims
	claims := jwt.MapClaims{}
	claims["authorized"] = true
	claims["user_id"] = userID
	claims["exp"] = expireTime.Unix()

	// Create token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Sign token with a string
	tokenString, err := token.SignedString([]byte(s.jwtSignSecret))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func (s *Server) RegisterRoutes() http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.Logger)

	r.Get("/", s.HelloWorldHandler)

	r.Get("/health", s.healthHandler)

	r.Get("/auth/{provider}/callback", s.getAuthCallback)

	r.Get("/auth/{provider}", s.authLogin)

	r.Get("/logout/{provider}", s.authLogout)

	return r
}

func (s *Server) HelloWorldHandler(w http.ResponseWriter, r *http.Request) {
	resp := make(map[string]string)
	resp["message"] = "Hello World"

	jsonResp, err := json.Marshal(resp)
	if err != nil {
		log.Fatalf("error handling JSON marshal. Err: %v", err)
	}

	_, _ = w.Write(jsonResp)
}

func (s *Server) healthHandler(w http.ResponseWriter, r *http.Request) {
	jsonResp, _ := json.Marshal(s.db.Health())
	_, _ = w.Write(jsonResp)
}

func (s *Server) getAuthCallback(w http.ResponseWriter, r *http.Request) {
	// insert the provider context
	provider := chi.URLParam(r, "provider")
	r = r.WithContext(context.WithValue(context.Background(), "provider", provider))

	user, err := gothic.CompleteUserAuth(w, r)
	if err != nil {
		fmt.Fprintln(w, r)
		return
	}

	if s.DEBUG {
		fmt.Printf("Name: %s\n", user.Name)
		fmt.Printf("NickName: %s\n", user.NickName)
		fmt.Printf("Firstname: %s\n", user.FirstName)
		fmt.Printf("Lastname: %s\n", user.LastName)
		fmt.Printf("Email: %s\n", user.Email)
		fmt.Printf("AvatarURL: %s\n", user.AvatarURL)
		fmt.Printf("Location: %s\n", user.Location)
		fmt.Printf("AccessToken: %s\n", user.AccessToken)
		fmt.Printf("AccessTokenSecret: %s\n", user.AccessTokenSecret)
		fmt.Printf("ExpiresAt: %s\n", user.ExpiresAt)
		fmt.Printf("RefreshToken: %s\n", user.RefreshToken)
		fmt.Printf("IDtoken: %s\n", user.IDToken)
		fmt.Printf("User ID: %s\n", user.UserID)
	}

	expireTime := time.Now().Add(time.Hour * 24)
	tokenSigned, err := s.generateToken(user.UserID, expireTime)
	if err != nil {
		log.Fatalf("Unable to sign token with err: %s\n", err.Error())
	}

	// Set cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    tokenSigned,
		Expires:  expireTime,
		HttpOnly: true,
		Secure:   s.IsProd,
		Path:     "/",
	})

	// Redirect to dashboard page
	http.Redirect(w, r, fmt.Sprintf("http://localhost:%d/dashboard", s.frontendPort), http.StatusFound)
}

func (s *Server) authLogin(w http.ResponseWriter, r *http.Request) {
	// insert the provider context
	provider := chi.URLParam(r, "provider")
	r = r.WithContext(context.WithValue(context.Background(), "provider", provider))

	// try to get the user without re-authenticating
	if gothUser, err := gothic.CompleteUserAuth(w, r); err == nil {
		t, _ := template.New("foo").Parse(userTemplate)
		t.Execute(w, gothUser)
	} else {
		gothic.BeginAuthHandler(w, r)
	}
}

func (s *Server) authLogout(w http.ResponseWriter, r *http.Request) {
	gothic.Logout(w, r)
	w.Header().Set("Location", "/")
	w.WriteHeader(http.StatusTemporaryRedirect)
}

var userTemplate = `
<p><a href="/logout/{{.Provider}}">logout</a></p>
<p>Name: {{.Name}} [{{.LastName}}, {{.FirstName}}]</p>
<p>Email: {{.Email}}</p>
<p>NickName: {{.NickName}}</p>
<p>Location: {{.Location}}</p>
<p>AvatarURL: {{.AvatarURL}} <img src="{{.AvatarURL}}"></p>
<p>Description: {{.Description}}</p>
<p>UserID: {{.UserID}}</p>
<p>AccessToken: {{.AccessToken}}</p>
<p>ExpiresAt: {{.ExpiresAt}}</p>
<p>RefreshToken: {{.RefreshToken}}</p>
`
