package routes

import (
	"backend/internal/auth"
	"backend/internal/customMiddleware"
	"backend/internal/handlers"
	"backend/internal/interfaces"
	"net/http"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
)

// /auth
func NewAuthRouter(s interfaces.Server) http.Handler {
	r := chi.NewRouter()
	authHandlers := handlers.NewAuthHandlers(s)
	r.Get("/{provider}", authHandlers.LoginHandler)
	r.Get("/{provider}/callback", authHandlers.CallbackHandler)
	r.Post("/{provider}/logout", authHandlers.LogoutHandler)

	r.With(auth.AuthMiddleware).Get("/{provider}/check", authHandlers.AuthCheckHandler)

	return r
}

// /api/{v}/account
func NewAccountRouter(s interfaces.Server) http.Handler {
	r := chi.NewRouter()
	r.Use(auth.AuthMiddleware)

	accountHandlers := handlers.NewAccountHandlers(s)
	r.Get("/", accountHandlers.GetAccountDetailsHandler)
	r.Post("/", accountHandlers.UpdateAccountDetailsHandler)
	r.Delete("/", accountHandlers.DeleteAccountHandler)
	r.Get("/role", accountHandlers.GetUserRoleHandler)
	r.Get("/communities", accountHandlers.GetUserOwnedCommunities)

	return r
}

func NewAdminRouter(s interfaces.Server) http.Handler {
	r := chi.NewRouter()
	r.Use(auth.AuthMiddleware)

	adminHandlers := handlers.NewAdminHandlers(s)
	r.Get("/users", adminHandlers.AdminGetUsers)
	r.Get("/users/roles", adminHandlers.AdminGetUsersRoles)
	r.Post("/users/roles", adminHandlers.UpdateUserRoleHandler)

	return r
}

func NewPropertyRouter(s interfaces.Server) http.Handler {
	r := chi.NewRouter()

	propertyHandlers := handlers.NewPropertyHandlers(s)
	r.Get("/{id}", propertyHandlers.GetPropertyHandler)
	r.Get("/", propertyHandlers.GetPropertiesHandler)
	r.Get("/lister", propertyHandlers.GetListerInfoHandler)

	r.With(auth.AuthMiddleware).Post("/", propertyHandlers.CreatePropertiesHandler)
	r.With(auth.AuthMiddleware).Put("/{id}", propertyHandlers.UpdatePropertiesHandler)
	r.With(auth.AuthMiddleware).Delete("/{id}", propertyHandlers.DeletePropertiesHandler)
	r.With(auth.AuthMiddleware).Get("/total", propertyHandlers.GetPropertiesTotalCountHandler)

	return r
}

func RegisterRoutes(s interfaces.Server) http.Handler {
	r := chi.NewRouter()

	// Global Middlewares
	r.Use(middleware.Logger)               // stdout logger
	r.Use(middleware.NoCache)              // dont cache responses (especially important to get up to date api/auth responses)
	r.Use(customMiddleware.CorsMiddleware) // set headers for CORS

	// Heartbeat endpoints
	heartBeatHandlers := handlers.NewHeartBeatHandlers(s)
	r.Get("/health", heartBeatHandlers.HelloWorldHandler)
	r.Get("/dbhealth", heartBeatHandlers.DatabaseHealthHandler)

	// Auth
	authRouter := NewAuthRouter(s)
	r.Mount("/auth", authRouter)

	apiRouter := chi.NewRouter()

	// Account
	accountRouter := NewAccountRouter(s)
	apiRouter.Mount("/account", accountRouter)

	// TODO: User (profile) images
	// r.Post("/api/account/images", s.apiCreateUserProfileImagesHandler)
	// r.Delete("/api/account/images", s.apiDeleteUserProfileImagesHandler)

	// Admin
	adminRouter := NewAdminRouter(s)
	apiRouter.Mount("/admin", adminRouter)

	// Properties
	propertyRouter := NewPropertyRouter(s)
	apiRouter.Mount("/properties", propertyRouter)

	// // Public Lister info

	// // Communities
	// r.Get("/api/communities/{id}", s.apiGetCommunityHandler)
	// r.Get("/api/communities", s.apiGetCommunitiesHandler)
	// r.Post("/api/communities", s.apiCreateCommunitiesHandler)
	// r.Post("/api/communities/users", s.apiCreateCommunitiesUserHandler)
	// r.Post("/api/communities/properties", s.apiCreateCommunitiesPropertyHandler)
	// r.Put("/api/communities/{id}", s.apiUpdateCommunitiesHandler)
	// r.Delete("/api/communities/{id}", s.apiDeleteCommunitiesHandler)
	// r.Delete("/api/communities/users", s.apiDeleteCommunitiesUserHandler)
	// r.Delete("/api/communities/properties", s.apiDeleteCommunitiesPropertiesHandler)

	// // Users
	// r.Get("/api/users", s.apiGetUsersHandler)
	// r.Get("/api/users/{id}", s.apiGetUserHandler)
	// // r.Get("/api/users/{id}/images", s.apiGetUserProfileImagesHandler)

	r.Mount("/api/v1", apiRouter)

	return r
}
