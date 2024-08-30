package handlers

import (
	"backend/internal/auth"
	"backend/internal/config"
	"backend/internal/interfaces"
	"backend/internal/utils"
	"errors"
	"net/http"
	"strconv"
	"strings"
)

type AdminHandler struct {
	server      interfaces.Server
	adminUserID string
}

func NewAdminHandlers(s interfaces.Server) *AdminHandler {
	return &AdminHandler{server: s, adminUserID: config.GlobalConfig.ADMIN_USER_ID}
}

// GET .../admin/users
// AUTHED
// Only returns the user details (no avatar images)
func (h *AdminHandler) AdminGetUsers(w http.ResponseWriter, r *http.Request) {
	// Get user id
	userId, ok := r.Context().Value(auth.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, errors.New("user id blank"))
		return
	}

	// If userid is not the admin user id, return unauthorized
	if userId != h.adminUserID {
		utils.RespondWithError(w, 401, errors.New("unauthorized"))
		return
	}

	// Get limit and offset from query params
	query := r.URL.Query()
	limitStr := query.Get("limit")
	offsetStr := query.Get("offset")

	// Limit and offset cannot be empty strings
	if limitStr == "" {
		utils.RespondWithError(w, 422, errors.New("query with empty limit string is not valid"))
		return
	}

	if offsetStr == "" {
		utils.RespondWithError(w, 422, errors.New("query with empty offset string is not valid"))
		return
	}

	// Attempt Parse limit and offset
	var limit int
	var offset int
	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		utils.RespondWithError(w, 422, errors.New("invalid limit string"))
		return
	}
	offset, err = strconv.Atoi(offsetStr)
	if err != nil {
		utils.RespondWithError(w, 422, errors.New("invalid offset string"))
		return
	}

	// Get all users from the db
	users, err := h.server.DB().AdminGetUsers(int32(limit), int32(offset))
	if err != nil {
		utils.RespondWithError(w, 500, err)
		return
	}

	// Return the users
	utils.RespondWithJSON(w, 200, users)
}

// GET .../admin/users/roles
// AUTHED
func (h *AdminHandler) AdminGetUsersRoles(w http.ResponseWriter, r *http.Request) {
	// Get user id
	userId, ok := r.Context().Value(auth.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, errors.New("user id blank"))
		return
	}

	// If userid is not the admin user id, return unauthorized
	if userId != h.adminUserID {
		utils.RespondWithError(w, 401, errors.New("unauthorized"))
		return
	}

	// Get the userIds from the query parameter
	query := r.URL.Query()
	userIdsStr := query.Get("userIds")

	// Ensure that we have something
	if userIdsStr == "" {
		utils.RespondWithError(w, 422, errors.New("query with empty string when expecting userId(s) is not valid input"))
		return
	}

	userIds := strings.Split(userIdsStr, ",")

	// Get the roles for the users specified in the request body
	roles, err := h.server.DB().AdminGetUsersRoles(userIds)
	if err != nil {
		utils.RespondWithError(w, 500, err)
		return
	}

	// Return the roles
	utils.RespondWithJSON(w, 200, roles)
}

// POST .../admin/users/roles
// AUTHED
// NOTE: despite the name, it is currently only written to allow the changing of a single
// user's role
func (h *AdminHandler) UpdateUserRoleHandler(w http.ResponseWriter, r *http.Request) {
	// For now, expect that only the admin user can update roles

	// Get user id
	callerUserId, ok := r.Context().Value(auth.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, errors.New("user id blank"))
		return
	}

	// If userid is not the admin user id, return unauthorized
	if callerUserId != h.adminUserID {
		utils.RespondWithError(w, 401, errors.New("unauthorized"))
		return
	}

	// Get the role from the request body
	query := r.URL.Query()
	userID := query.Get("userID")
	role := query.Get("role")

	// Ensure query parameters are given
	if userID == "" {
		utils.RespondWithError(w, 422, errors.New("userID cannot be empty"))
		return
	}
	if role == "" {
		utils.RespondWithError(w, 422, errors.New("role cannot be empty"))
		return
	}

	// Reject requests to alter admin's own user role
	if userID == callerUserId {
		utils.RespondWithError(w, http.StatusBadRequest, errors.New("admin cannot change own user role. baka"))
		return
	}

	// Update role for the user specified in the request body in the db
	err := h.server.DB().UpdateUserRole(userID, role)
	if err != nil {
		utils.RespondWithError(w, 500, err)
		return
	}

	// Return response ok
	w.WriteHeader(200)
}
