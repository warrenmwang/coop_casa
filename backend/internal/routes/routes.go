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

func RegisterRoutes(s interfaces.Server) http.Handler {
	r := chi.NewRouter()

	// Global Middlewares
	r.Use(middleware.Logger)               // stdout logger
	r.Use(middleware.NoCache)              // dont cache responses (especially important to get up to date api/auth responses)
	r.Use(customMiddleware.CorsMiddleware) // set headers for CORS

	// Heartbeat endpoints
	// r.Get("/", s.HelloWorldHandler)   // API uptime check
	// r.Get("/health", s.healthHandler) // DB uptime check
	heartBeatHandlers := handlers.NewHeartBeatHandlers(s)
	r.Get("/health", heartBeatHandlers.HelloWorldHandler)
	r.Get("/dbhealth", heartBeatHandlers.DatabaseHealthHandler)

	// Auth
	// r.Route("/auth", func(r chi.Router) {
	// 	r.Get("/{provider}", s.authLoginHandler)
	// 	r.Get("/{provider}/callback", s.authCallbackHandler)
	// 	r.Get("/{provider}/check", s.authCheckHandler)
	// 	r.Post("/{provider}/logout", s.authLogoutHandler)
	// })
	authRouter := NewAuthRouter(s)
	r.Mount("/auth", authRouter)

	apiRouter := chi.NewRouter()

	// Account
	// r.Get("/api/account", s.apiGetAccountDetailsHandler)
	// r.Get("/api/account/communities", s.apiGetUserOwnedCommunities)
	// r.Post("/api/account", s.apiUpdateAccountDetailsHandler)
	// r.Delete("/api/account", s.apiDeleteAccountHandler)
	// r.Get("/api/account/role", s.apiGetUserRoleHandler)
	accountRouter := NewAccountRouter(s)
	apiRouter.Mount("/account", accountRouter)

	// TODO: User (profile) images
	// r.Post("/api/account/images", s.apiCreateUserProfileImagesHandler)
	// r.Delete("/api/account/images", s.apiDeleteUserProfileImagesHandler)

	// // Admin
	// r.Get("/api/admin/users", s.apiAdminGetUsers)
	// r.Get("/api/admin/users/roles", s.apiAdminGetUsersRoles)
	// r.Post("/api/admin/users/roles", s.apiUpdateUserRoleHandler)
	adminRouter := NewAdminRouter(s)
	apiRouter.Mount("/admin", adminRouter)

	// // Properties
	// r.Get("/api/properties/{id}", s.apiGetPropertyHandler)
	// r.Get("/api/properties/total", s.apiGetPropertiesTotalCountHandler)
	// r.Get("/api/properties", s.apiGetPropertiesHandler)
	// r.Post("/api/properties", s.apiCreatePropertiesHandler)
	// r.Put("/api/properties/{id}", s.apiUpdatePropertiesHandler)
	// r.Delete("/api/properties/{id}", s.apiDeletePropertiesHandler)

	// // Public Lister info
	// r.Get("/api/lister", s.apiGetListerInfoHandler)

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
