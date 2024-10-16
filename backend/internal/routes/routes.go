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

// .../auth
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

// .../lister
func NewListerRouter(s interfaces.Server) http.Handler {
	r := chi.NewRouter()

	listerHandlers := handlers.NewListerHandlers(s)

	r.Get("/{id}", listerHandlers.GetListerInfoHandler)
	r.With(auth.AuthMiddleware).Get("/", listerHandlers.GetListersFromListersHandler)

	return r
}

// .../admin
func NewAdminRouter(s interfaces.Server) http.Handler {
	r := chi.NewRouter()
	r.Use(auth.AdminAuthMiddleware)

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

// .../properties
func NewPropertyRouter(s interfaces.Server) http.Handler {
	r := chi.NewRouter()

	propertyHandlers := handlers.NewPropertyHandlers(s)
	r.Get("/{id}", propertyHandlers.GetPropertyHandler)
	r.Get("/", propertyHandlers.GetPropertiesHandler)

	r.With(auth.AuthMiddleware).Post("/", propertyHandlers.CreatePropertiesHandler)
	r.With(auth.AuthMiddleware).Put("/{id}", propertyHandlers.UpdatePropertiesHandler)
	r.With(auth.AuthMiddleware).Put("/transfer/ownership", propertyHandlers.TransferPropertyOwnershipHandler)
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
	r.With(auth.AuthMiddleware).Put("/transfer/ownership", communityHandlers.TransferCommunityOwnershipHandler)
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
	r.Get("/{id}/images", userProfileHandlers.GetUserImagesHandler)

	return r
}

func RegisterRoutes(s interfaces.Server) http.Handler {
	r := chi.NewRouter()

	// Global Middlewares
	r.Use(middleware.Logger)               // stdout logger
	r.Use(middleware.NoCache)              // dont cache responses (especially important to get up to date api/auth responses)
	r.Use(customMiddleware.CorsMiddleware) // set headers for CORS

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
