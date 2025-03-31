package handlers

import (
	"backend/internal/config"
	"backend/internal/database"
	"backend/internal/interfaces"
	"backend/internal/utils"
	"backend/internal/validation"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
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
func (h *AdminHandler) AdminGetUsersHandler(w http.ResponseWriter, r *http.Request) {
	// Get limit and offset from query params
	query := r.URL.Query()
	limitStr := query.Get("limit")
	offsetStr := query.Get("offset")
	name := query.Get("name")

	// Limit and offset cannot be empty strings
	if limitStr == "" {
		utils.RespondWithError(w, http.StatusUnprocessableEntity, errors.New("query with empty limit string is not valid"))
		return
	}

	if offsetStr == "" {
		utils.RespondWithError(w, http.StatusUnprocessableEntity, errors.New("query with empty offset string is not valid"))
		return
	}

	// Attempt Parse limit and offset
	var limit int
	var offset int
	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		utils.RespondWithError(w, http.StatusUnprocessableEntity, errors.New("invalid limit string"))
		return
	}
	offset, err = strconv.Atoi(offsetStr)
	if err != nil {
		utils.RespondWithError(w, http.StatusUnprocessableEntity, errors.New("invalid offset string"))
		return
	}

	// Get all users from the db
	users, err := h.server.DB().AdminGetUsers(int32(limit), int32(offset), name)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Handle edge case of new user acconts that haven't setup their account yet
	// making sure that no interests doesn't equate to a null and is an actual empty array
	for i, user := range users {
		if user.Interests == nil {
			user.Interests = []string{}
			users[i] = user
		}
	}

	// Return the users
	utils.RespondWithJSON(w, http.StatusOK, struct {
		UserDetails []database.UserDetails `json:"userDetails"`
	}{
		UserDetails: users,
	})
}

// GET .../admin/users/roles
// AUTHED
func (h *AdminHandler) AdminGetUsersRolesHandler(w http.ResponseWriter, r *http.Request) {
	// Get the userIds from the query parameter
	query := r.URL.Query()
	userIdsStr := query.Get("userIds")

	// Ensure that we have something
	if userIdsStr == "" {
		utils.RespondWithError(w, http.StatusUnprocessableEntity, errors.New("query with empty string when expecting userId(s) is not valid input"))
		return
	}

	userIds := strings.Split(userIdsStr, ",")

	// Get the roles for the users specified in the request body
	roles, err := h.server.DB().AdminGetUsersRoles(userIds)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
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
	utils.RespondWithJSON(w, http.StatusOK, struct {
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
	newRole := query.Get("role")

	// Ensure query parameters are given
	if userID == "" {
		utils.RespondWithError(w, http.StatusUnprocessableEntity, errors.New("userID cannot be empty"))
		return
	}
	if newRole == "" {
		utils.RespondWithError(w, http.StatusUnprocessableEntity, errors.New("role cannot be empty"))
		return
	}

	// Ensure role is valid
	if _, exists := config.USER_ROLE_OPTIONS[newRole]; !exists {
		utils.RespondWithError(w, http.StatusBadRequest, fmt.Errorf("newRole %s is not a valid user role", newRole))
		return
	}

	// Reject requests to alter admin's own user role
	if userID == h.adminUserID {
		utils.RespondWithError(w, http.StatusBadRequest, errors.New("admin cannot change own user role. 𝕊𝕌𝕊𝕊𝕐 𝔹𝔸𝕂𝔸(❁ᴗ͈ˬᴗ͈)"))
		return
	}

	// Check if current role of account to update is a lister
	// If so, we need additional information that should be provided as a query parameter
	// about what to do with the lister's properties, if the lister has any properties at all.
	currUserRole, err := h.server.DB().GetUserRole(userID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// If new role is same as old role, do nothing and return ok
	if newRole == currUserRole {
		w.WriteHeader(http.StatusOK)
		return
	}

	if currUserRole == config.USER_ROLE_LISTER {
		// Fetch query parameters to determine whether to transfer the properties
		// of the user or to simply delete them
		doPropertyTransfer := query.Get("propertyTransfer")
		if doPropertyTransfer == "" {
			utils.RespondWithError(w, http.StatusBadRequest, errors.New("propertyTransfer query paramter not provided but is necessary when altering the role of an account that is currently a lister"))
			return
		}
		doPropertyTransfer_bool, err := strconv.ParseBool(doPropertyTransfer)
		if err != nil {
			utils.RespondWithError(w, http.StatusBadRequest, errors.New("could not parse propertyTransfer value, it should be a boolean like true or false"))
			return
		}
		if doPropertyTransfer_bool {
			// Transfer the properties to the other user
			userToTransferTo := query.Get("transferUserID")
			if userToTransferTo == "" {
				utils.RespondWithError(w, http.StatusBadRequest, errors.New("transferUserID query parameter is empty but is necessary for transferring properties to"))
				return
			}
			if err := validation.ValidateOpenID(userToTransferTo, "transferUserID"); err != nil {
				utils.RespondWithError(w, http.StatusBadRequest, errors.New("transferUserID is not a valid user ID"))
				return
			}
			// Ensure the other user id is lister!
			otherUserRole, err := h.server.DB().GetUserRole(userToTransferTo)
			if err != nil {
				utils.RespondWithError(w, http.StatusInternalServerError, err)
				return
			}
			if otherUserRole == config.USER_ROLE_REGULAR {
				utils.RespondWithError(w, http.StatusInternalServerError, errors.New("other user must be a lister in order to transfer the properties to them"))
				return
			}

			err = h.server.DB().TransferAllPropertiesToOtherUser(userID, userToTransferTo)
			if err != nil {
				utils.RespondWithError(w, http.StatusInternalServerError, err)
				return
			}
		} else {
			// Delete all properties of the user
			err = h.server.DB().DeleteUserOwnedProperties(userID)
			if err != nil {
				utils.RespondWithError(w, http.StatusInternalServerError, err)
				return
			}
		}
	}

	// Update role for the user specified in the request body in the db
	err = h.server.DB().UpdateUserRole(userID, newRole)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Return response ok
	w.WriteHeader(200)
}

// GET .../admin/users/status/{id}
// AUTHED
func (h *AdminHandler) AdminGetUserStatusHandler(w http.ResponseWriter, r *http.Request) {
	// Get the user status of the id in the url param
	requestedStatusUserID := chi.URLParam(r, "id")
	userStatus, err := h.server.DB().GetUserStatus(requestedStatusUserID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}
	utils.RespondWithJSON(w, http.StatusOK, userStatus)
}

// POST .../admin/users/status
// AUTHED
// Create a user status based on the information in the request body
func (h *AdminHandler) AdminCreateUserStatusHandler(w http.ResponseWriter, r *http.Request) {

	// Parse the user status from request body
	var userStatusTmp struct {
		UserID  string `json:"userId"`
		Status  string `json:"status"`
		Comment string `json:"comment"`
	}
	body, err := io.ReadAll(r.Body)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, err)
		return
	}
	err = json.Unmarshal(body, &userStatusTmp)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, errors.New("unable to parse provided user status data"))
		return
	}

	// Insert admin user id into the object
	userStatus := database.UserStatus{
		UserID:       userStatusTmp.UserID,
		SetterUserID: h.adminUserID,
		Status:       userStatusTmp.Status,
		Comment:      userStatusTmp.Comment,
	}

	// Verify user status data
	err = validation.ValidateUserStatusData(userStatus)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, err)
		return
	}

	// Insert data into db after verification
	err = h.server.DB().CreateUserStatus(userStatus.UserID, userStatus.SetterUserID, userStatus.Status, userStatus.Comment)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

// PUT .../admin/users/status/{id}
// AUTHED
func (h *AdminHandler) AdminUpdateUserStatusHandler(w http.ResponseWriter, r *http.Request) {
	// Parse the user status to populate DB with
	var userStatusTmp struct {
		UserID  string `json:"userId"`
		Status  string `json:"status"`
		Comment string `json:"comment"`
	}
	body, err := io.ReadAll(r.Body)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, err)
		return
	}
	err = json.Unmarshal(body, &userStatusTmp)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, errors.New("unable to parse provided user status data"))
		return
	}

	// Assert that url user id matches request body's data user id
	if userStatusTmp.UserID != chi.URLParam(r, "id") {
		utils.RespondWithError(w, http.StatusBadRequest, errors.New("user id in url param does not match user id in request body data"))
		return
	}

	// Insert admin user id into the object
	userStatus := database.UserStatus{
		UserID:       userStatusTmp.UserID,
		SetterUserID: h.adminUserID,
		Status:       userStatusTmp.Status,
		Comment:      userStatusTmp.Comment,
	}

	// Verify user status data
	err = validation.ValidateUserStatusData(userStatus)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, err)
		return
	}

	// Update user status in db
	err = h.server.DB().UpdateUserStatus(userStatus.UserID, userStatus.SetterUserID, userStatus.Status, userStatus.Comment)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Reply ok
	w.WriteHeader(http.StatusOK)

}

// GET .../admin/total/properties
// AUTHED
func (h *AdminHandler) GetTotalPropertiesCountHandler(w http.ResponseWriter, r *http.Request) {
	count, err := h.server.DB().GetTotalCountProperties()
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}
	utils.RespondWithJSON(w, http.StatusOK, count)
}

// GET .../admin/total/communities
// AUTHED
func (h *AdminHandler) GetTotalCommunitiesCountHandler(w http.ResponseWriter, r *http.Request) {
	count, err := h.server.DB().GetTotalCountCommunities()
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}
	utils.RespondWithJSON(w, http.StatusOK, count)
}

// GET .../admin/total/users
// AUTHED
func (h *AdminHandler) GetTotalUsersCountHandler(w http.ResponseWriter, r *http.Request) {
	count, err := h.server.DB().GetTotalCountUsers()
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}
	utils.RespondWithJSON(w, http.StatusOK, count)
}
