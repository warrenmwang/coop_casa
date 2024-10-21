// Package routes creates the main router and subrouters needed to setup the HTTP endpoints.
// It connects all of the HTTP handlers to each endpoint that will be exposed by this backend service.
package routes

import (
	"backend/internal/app_middleware"
	"backend/internal/handlers"
	"backend/internal/interfaces"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

// NewAuthRouter creates a new subrouter for the auth endpoint.
// .../auth
func NewAuthRouter(s interfaces.Server) http.Handler {
	r := chi.NewRouter()
	authHandlers := handlers.NewAuthHandlers(s)
	r.Get("/{provider}", authHandlers.LoginHandler)
	r.Get("/{provider}/callback", authHandlers.CallbackHandler)
	r.Post("/{provider}/logout", authHandlers.LogoutHandler)

	r.With(app_middleware.AuthMiddleware).Get("/{provider}/check", authHandlers.AuthCheckHandler)

	return r
}

// NewAccountRouter creates a new subrouter for the account endpoint.
// .../account
func NewAccountRouter(s interfaces.Server) http.Handler {
	r := chi.NewRouter()
	r.Use(app_middleware.AuthMiddleware)

	accountHandlers := handlers.NewAccountHandlers(s)
	r.Get("/", accountHandlers.GetAccountDetailsHandler)
	r.Post("/", accountHandlers.UpdateAccountDetailsHandler)
	r.Delete("/", accountHandlers.DeleteAccountHandler)
	r.Get("/role", accountHandlers.GetAccountRoleHandler)
	r.Get("/communities", accountHandlers.GetAccountOwnedCommunitiesHandler)
	r.Get("/properties", accountHandlers.GetAccountOwnedPropertiesHandler)
	r.Get("/images", accountHandlers.GetAccountProfileImagesHandler)
	r.Post("/images", accountHandlers.UpdateAccountProfileImagesHandler)

	// saved entities
	r.Get("/saved/properties", accountHandlers.GetAccountSavedPropertiesHandler)
	r.Post("/saved/properties", accountHandlers.CreateAccountSavedPropertyHandler)
	r.Delete("/saved/properties/{id}", accountHandlers.DeleteAccountSavedPropertyHandler)
	r.Delete("/saved/properties/", accountHandlers.DeleteAccountSavedPropertiesHandler)

	r.Get("/saved/communities", accountHandlers.GetAccountSavedCommunitiesHandler)
	r.Post("/saved/communities", accountHandlers.CreateAccountSavedCommunityHandler)
	r.Delete("/saved/communities/{id}", accountHandlers.DeleteAccountSavedCommunityHandler)
	r.Delete("/saved/communities/", accountHandlers.DeleteAccountSavedCommunitiesHandler)

	r.Get("/saved/users", accountHandlers.GetAccountSavedUsersHandler)
	r.Post("/saved/users", accountHandlers.CreateAccountSavedUserHandler)
	r.Delete("/saved/users/{id}", accountHandlers.DeleteAccountSavedUserHandler)
	r.Delete("/saved/users/", accountHandlers.DeleteAccountSavedUsersHandler)

	// account status
	r.Get("/status", accountHandlers.GetAccountStatusHandler)
	r.Put("/status", accountHandlers.UpdateAccountStatusHandler)

	return r
}

// NewListerRouter creates a new subrouter for the lister endpoint.
// .../lister
func NewListerRouter(s interfaces.Server) http.Handler {
	r := chi.NewRouter()

	listerHandlers := handlers.NewListerHandlers(s)

	r.Get("/{id}", listerHandlers.GetListerInfoHandler)
	r.With(app_middleware.AuthMiddleware).Get("/", listerHandlers.GetListersFromListersHandler)

	return r
}

// NewAdminRouter creates a new subrouter for the admin endpoint.
// .../admin
func NewAdminRouter(s interfaces.Server) http.Handler {
	r := chi.NewRouter()
	r.Use(app_middleware.AdminAuthMiddleware)

	adminHandlers := handlers.NewAdminHandlers(s)
	r.Get("/users", adminHandlers.AdminGetUsersHandler)
	r.Get("/users/roles", adminHandlers.AdminGetUsersRolesHandler)
	r.Post("/users/roles", adminHandlers.UpdateUserRoleHandler)

	r.Get("/users/status/{id}", adminHandlers.AdminGetUserStatusHandler)
	r.Post("/users/status", adminHandlers.AdminCreateUserStatusHandler)
	r.Put("/users/status/{id}", adminHandlers.AdminUpdateUserStatusHandler)

	r.Get("/total/properties", adminHandlers.GetTotalPropertiesCountHandler)
	r.Get("/total/communities", adminHandlers.GetTotalCommunitiesCountHandler)
	r.Get("/total/users", adminHandlers.GetTotalUsersCountHandler)

	return r
}

// NewPropertyRouter creates a new subrouter for the property endpoint.
// .../properties
func NewPropertyRouter(s interfaces.Server) http.Handler {
	r := chi.NewRouter()

	propertyHandlers := handlers.NewPropertyHandlers(s)
	r.Get("/{id}", propertyHandlers.GetPropertyHandler)
	r.Get("/", propertyHandlers.GetPropertiesHandler)

	r.With(app_middleware.AuthMiddleware).Post("/", propertyHandlers.CreatePropertiesHandler)
	r.With(app_middleware.AuthMiddleware).Put("/{id}", propertyHandlers.UpdatePropertiesHandler)
	r.With(app_middleware.AuthMiddleware).Put("/transfer/ownership", propertyHandlers.TransferPropertyOwnershipHandler)
	r.With(app_middleware.AuthMiddleware).Post("/transfer/ownership/all", propertyHandlers.TransferAllPropertiesOwnershipHandler)
	r.With(app_middleware.AuthMiddleware).Delete("/{id}", propertyHandlers.DeletePropertiesHandler)

	return r
}

// NewCommunityRouter creates a new subrouter for the community endpoint.
// .../communities
func NewCommunityRouter(s interfaces.Server) http.Handler {
	r := chi.NewRouter()

	communityHandlers := handlers.NewCommunityHandlers(s)

	r.Get("/{id}", communityHandlers.GetCommunityHandler)
	r.Get("/", communityHandlers.GetCommunitiesHandler)

	r.With(app_middleware.AuthMiddleware).Post("/", communityHandlers.CreateCommunitiesHandler)
	r.With(app_middleware.AuthMiddleware).Post("/users", communityHandlers.CreateCommunitiesUserHandler)
	r.With(app_middleware.AuthMiddleware).Post("/properties", communityHandlers.CreateCommunitiesPropertyHandler)
	r.With(app_middleware.AuthMiddleware).Put("/{id}", communityHandlers.UpdateCommunitiesHandler)
	r.With(app_middleware.AuthMiddleware).Put("/transfer/ownership", communityHandlers.TransferCommunityOwnershipHandler)
	r.With(app_middleware.AuthMiddleware).Delete("/{id}", communityHandlers.DeleteCommunitiesHandler)
	r.With(app_middleware.AuthMiddleware).Delete("/users", communityHandlers.DeleteCommunitiesUserHandler)
	r.With(app_middleware.AuthMiddleware).Delete("/properties", communityHandlers.DeleteCommunitiesPropertiesHandler)

	return r
}

// NewUserProfileHandler creates a new subrouter for the user profile endpoint.
// .../users
func NewUserProfileHandler(s interfaces.Server) http.Handler {
	r := chi.NewRouter()

	userProfileHandlers := handlers.NewUserProfileHandlers(s)
	r.Get("/", userProfileHandlers.GetUsersHandler)
	r.Get("/{id}", userProfileHandlers.GetUserHandler)
	r.Get("/{id}/images", userProfileHandlers.GetUserImagesHandler)

	return r
}

// RegisterRoutes creates creates and returns the main router after having
// attached global middlewares, initializing all of the 
// subrouters, and connecting them to their endpoints.
func RegisterRoutes(s interfaces.Server) http.Handler {
	r := chi.NewRouter()

	// Global Middlewares
	r.Use(middleware.Logger)               // stdout logger
	r.Use(middleware.NoCache)              // dont cache responses (especially important to get up to date api/auth responses)
	r.Use(app_middleware.CorsMiddleware) // set headers for CORS

	// Auth
	authRouter := NewAuthRouter(s)
	r.Mount("/auth/v1", authRouter)

	// API router
	apiRouter := chi.NewRouter()
	// Heartbeat endpoints
	heartBeatHandlers := handlers.NewHeartBeatHandlers(s)
	apiRouter.Get("/health", heartBeatHandlers.HelloWorldHandler)
	apiRouter.Get("/dbhealth", heartBeatHandlers.DatabaseHealthHandler)

	// Account - user accessing their own personal information
	accountRouter := NewAccountRouter(s)
	apiRouter.Mount("/account", accountRouter)

	// Admin
	adminRouter := NewAdminRouter(s)
	apiRouter.Mount("/admin", adminRouter)

	// Lister
	listerRouter := NewListerRouter(s)
	apiRouter.Mount("/lister", listerRouter)

	// Properties
	propertyRouter := NewPropertyRouter(s)
	apiRouter.Mount("/properties", propertyRouter)

	// Communities
	communityRouter := NewCommunityRouter(s)
	apiRouter.Mount("/communities", communityRouter)

	// Public Users Profile
	userProfileRouter := NewUserProfileHandler(s)
	apiRouter.Mount("/users", userProfileRouter)

	r.Mount("/api/v1", apiRouter)

	return r
}
