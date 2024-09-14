package handlers

import (
	"backend/internal/config"
	"backend/internal/database"
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
	utils.RespondWithJSON(w, 200, struct {
		UserDetails []database.UserDetails `json:"userDetails"`
	}{
		UserDetails: users,
	})
}

// GET .../admin/users/roles
// AUTHED
func (h *AdminHandler) AdminGetUsersRoles(w http.ResponseWriter, r *http.Request) {
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

	// construct the return result
	type tmp struct {
		UserID string `json:"userID"`
		Role   string `json:"role"`
	}

	var results []tmp

	for i := range len(userIds) {
		results = append(results, tmp{
			UserID: userIds[i],
			Role:   roles[i],
		})
	}

	// Return the roles
	utils.RespondWithJSON(w, 200, struct {
		UserRoles []tmp `json:"userRoles"`
	}{
		UserRoles: results,
	})
}

// POST .../admin/users/roles
// AUTHED
func (h *AdminHandler) UpdateUserRoleHandler(w http.ResponseWriter, r *http.Request) {
	// For now, expect that only the admin user can update roles

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
	if userID == h.adminUserID {
		utils.RespondWithError(w, http.StatusBadRequest, errors.New("admin cannot change own user role. 𝕊𝕌𝕊𝕊𝕐 𝔹𝔸𝕂𝔸(❁ᴗ͈ˬᴗ͈)"))
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
