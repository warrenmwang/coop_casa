package handlers

import (
	"backend/internal/database"
	"backend/internal/interfaces"
	"backend/internal/utils"
	"encoding/base64"
	"errors"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

type UserProfileHandler struct {
	server interfaces.Server
}

func NewUserProfileHandlers(s interfaces.Server) *UserProfileHandler {
	return &UserProfileHandler{server: s}
}

// GET .../users
// NO AUTH
//
// Return a list of userIds for the given query, only returning userIDs whose accounts have been setup.
// Expects query parameters to filter for / get pages of userIds
func (h *UserProfileHandler) GetUsersHandler(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	offset := query.Get("page")
	if offset == "" {
		utils.RespondWithError(w, http.StatusBadRequest, errors.New("empty page query param"))
		return
	}
	limit := query.Get("limit")
	if limit == "" {
		utils.RespondWithError(w, http.StatusBadRequest, errors.New("empty limit query param"))
		return
	}

	tmp, err := strconv.ParseInt(offset, 10, 32)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}
	offsetInt := int32(tmp)

	tmp, err = strconv.ParseInt(limit, 10, 32)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}
	limitInt := int32(tmp)

	// Look for extra filters, if they exist
	firstNameFilter := query.Get("filterFirstName")
	lastNameFilter := query.Get("filterLastName")
	var userIDs []string
	if firstNameFilter != "" || lastNameFilter != "" {
		userIDs, err = h.server.DB().GetNextPagePublicUserIDsFilterByName(limitInt, offsetInt, firstNameFilter, lastNameFilter)
	} else {
		userIDs, err = h.server.DB().GetNextPagePublicUserIDs(limitInt, offsetInt)
	}
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, struct {
		UserIDs []string `json:"userIDs"`
	}{
		UserIDs: userIDs,
	})
}

// GET .../users/{id}
// NO AUTH
func (h *UserProfileHandler) GetUserHandler(w http.ResponseWriter, r *http.Request) {
	userID := chi.URLParam(r, "id")

	userPublicProfile, err := h.server.DB().GetPublicUserProfile(userID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, userPublicProfile)
}

// GET .../users/{id}/images
// NO AUTH
func (h *UserProfileHandler) GetUserImagesHandler(w http.ResponseWriter, r *http.Request) {
	userID := chi.URLParam(r, "id")

	// Get images from db and send as json
	imagesInternal, err := h.server.DB().GetUserProfileImages(userID)
	if err != nil {
		utils.RespondWithError(w, http.StatusNotFound, err)
		return
	}

	// Convert images format from internal to external
	var imagesExternal []database.FileExternal
	for _, image := range imagesInternal {
		imagesExternal = append(imagesExternal, database.FileExternal{
			Filename: image.Filename,
			Mimetype: image.Mimetype,
			Size:     image.Size,
			Data:     base64.StdEncoding.EncodeToString(image.Data),
		})
	}

	// Respond with images in text format
	utils.RespondWithJSON(w, http.StatusOK, struct {
		Images []database.FileExternal `json:"images"`
	}{
		Images: imagesExternal,
	})
}
