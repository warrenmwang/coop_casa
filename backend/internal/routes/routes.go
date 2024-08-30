package routes

import (
	"backend/internal/auth"
	"backend/internal/customMiddleware"
	"backend/internal/handlers"
	"backend/internal/interfaces"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
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

// .../account
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

// .../admin
func NewAdminRouter(s interfaces.Server) http.Handler {
	r := chi.NewRouter()
	r.Use(auth.AuthMiddleware)

	adminHandlers := handlers.NewAdminHandlers(s)
	r.Get("/users", adminHandlers.AdminGetUsers)
	r.Get("/users/roles", adminHandlers.AdminGetUsersRoles)
	r.Post("/users/roles", adminHandlers.UpdateUserRoleHandler)

	return r
}

// .../properties
func NewPropertyRouter(s interfaces.Server) http.Handler {
	r := chi.NewRouter()

	propertyHandlers := handlers.NewPropertyHandlers(s)
	r.Get("/{id}", propertyHandlers.GetPropertyHandler)
	r.Get("/", propertyHandlers.GetPropertiesHandler)
	r.Get("/lister", propertyHandlers.GetListerInfoHandler)

	r.With(auth.AuthMiddleware).Get("/total", propertyHandlers.GetPropertiesTotalCountHandler)
	r.With(auth.AuthMiddleware).Post("/", propertyHandlers.CreatePropertiesHandler)
	r.With(auth.AuthMiddleware).Put("/{id}", propertyHandlers.UpdatePropertiesHandler)
	r.With(auth.AuthMiddleware).Delete("/{id}", propertyHandlers.DeletePropertiesHandler)

	return r
}

// .../communities
func NewCommunityRouter(s interfaces.Server) http.Handler {
	r := chi.NewRouter()

	communityHandlers := handlers.NewCommunityHandlers(s)

	r.Get("/{id}", communityHandlers.GetCommunityHandler)
	r.Get("/", communityHandlers.GetCommunitiesHandler)

	r.With(auth.AuthMiddleware).Post("/", communityHandlers.CreateCommunitiesHandler)
	r.With(auth.AuthMiddleware).Post("/users", communityHandlers.CreateCommunitiesUserHandler)
	r.With(auth.AuthMiddleware).Post("/properties", communityHandlers.CreateCommunitiesPropertyHandler)
	r.With(auth.AuthMiddleware).Put("/{id}", communityHandlers.UpdateCommunitiesHandler)
	r.With(auth.AuthMiddleware).Delete("/{id}", communityHandlers.DeleteCommunitiesHandler)
	r.With(auth.AuthMiddleware).Delete("/users", communityHandlers.DeleteCommunitiesUserHandler)
	r.With(auth.AuthMiddleware).Delete("/properties", communityHandlers.DeleteCommunitiesPropertiesHandler)

	return r
}

// .../users
func NewUserProfileHandler(s interfaces.Server) http.Handler {
	r := chi.NewRouter()

	userProfileHandlers := handlers.NewUserProfileHandlers(s)
	r.Get("/", userProfileHandlers.GetUsersHandler)
	r.Get("/{id}", userProfileHandlers.GetUserHandler)

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

	// API router
	apiRouter := chi.NewRouter()

	// Account - user accessing their own personal information
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

	// Communities
	communityRouter := NewCommunityRouter(s)
	apiRouter.Mount("/communities", communityRouter)

	// Public Users Profile
	userProfileRouter := NewUserProfileHandler(s)
	apiRouter.Mount("/users", userProfileRouter)

	// // r.Get("/api/users/{id}/images", s.apiGetUserProfileImagesHandler)

	r.Mount("/api/v1", apiRouter)

	return r
}
