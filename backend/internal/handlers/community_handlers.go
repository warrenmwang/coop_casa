package handlers

import (
	"backend/internal/app_middleware"
	"backend/internal/database"
	"backend/internal/interfaces"
	"backend/internal/utils"
	"backend/internal/validation"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

type CommunityHandler struct {
	server interfaces.Server
}

func NewCommunityHandlers(s interfaces.Server) *CommunityHandler {
	return &CommunityHandler{server: s}
}

// GET .../communities/{id}
// NO AUTH
func (h *CommunityHandler) GetCommunityHandler(w http.ResponseWriter, r *http.Request) {
	communityId := chi.URLParam(r, "id")
	communityDetails, err := h.server.DB().GetCommunityDetails(communityId)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}
	communityImagesInternal, err := h.server.DB().GetCommunityImages(communityId)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}
	var communityImagesExternal []database.FileExternal
	for _, image := range communityImagesInternal {
		communityImagesExternal = append(communityImagesExternal, database.FileExternal{
			Filename: image.Filename,
			Mimetype: image.Mimetype,
			Size:     image.Size,
			Data:     base64.StdEncoding.EncodeToString(image.Data),
		})
	}
	communityUsers, err := h.server.DB().GetCommunityUsers(communityId)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}
	communityProperties, err := h.server.DB().GetCommunityProperties(communityId)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}
	// Do not return nulls!
	if communityImagesExternal == nil {
		communityImagesExternal = []database.FileExternal{}
	}
	if communityUsers == nil {
		communityUsers = []string{}
	}
	if communityProperties == nil {
		communityProperties = []string{}
	}

	// Return completed community
	communityFull := database.CommunityFull{
		CommunityDetails:    communityDetails,
		CommunityImages:     communityImagesExternal,
		CommunityUsers:      communityUsers,
		CommunityProperties: communityProperties,
	}
	utils.RespondWithJSON(w, http.StatusOK, communityFull)
}

// GET .../communities
// NO AUTH
// Public api to search through all communities
func (h *CommunityHandler) GetCommunitiesHandler(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()

	pageStr := query.Get("page")
	limitStr := query.Get("limit")
	filterName := query.Get("communityFilterName")
	filterDescription := query.Get("communityFilterDescription")

	// Parse offset and limit
	var offset int
	offset, err := strconv.Atoi(pageStr)
	if err != nil {
		utils.RespondWithError(w, http.StatusUnprocessableEntity, fmt.Errorf("unable to parse page: %s", pageStr))
		return
	}

	var limit int
	limit, err = strconv.Atoi(limitStr)
	if err != nil {
		utils.RespondWithError(w, http.StatusUnprocessableEntity, fmt.Errorf("unable to parse limit: %s", limitStr))
		return
	}

	// Calculate the correct offset
	offset = offset * limit

	// Get communities with optional filters
	communityIds, err := h.server.DB().GetNextPageCommunities(int32(limit), int32(offset), filterName, filterDescription)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	if communityIds == nil {
		communityIds = []string{}
	}

	utils.RespondWithJSON(w, http.StatusOK, struct {
		CommunityIDs []string `json:"communityIDs"`
	}{
		CommunityIDs: communityIds,
	})
}

// POST .../communities
// AUTHED
func (h *CommunityHandler) CreateCommunitiesHandler(w http.ResponseWriter, r *http.Request) {
	// Get authenticated user's ID
	authedUserID, ok := r.Context().Value(app_middleware.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, errors.New("user id blank"))
		return
	}

	// Define max mem to read from received body
	MAX_SIZE := 55 << 20 // 55 MiB
	r.Body = http.MaxBytesReader(w, r.Body, int64(MAX_SIZE))
	err := r.ParseMultipartForm(int64(MAX_SIZE) + 512)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Unmarshal details data
	detailsRaw := r.FormValue("details")
	var communityDetails database.CommunityDetails
	err = json.Unmarshal([]byte(detailsRaw), &communityDetails)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Validate community's admin is the same id in token
	if authedUserID != communityDetails.AdminUserID {
		utils.RespondWithError(w, http.StatusUnauthorized, errors.New("userId in token does not match adminUserId of community details to be created"))
		return
	}

	// Validate community details
	err = validation.ValidateCommunityDetails(communityDetails)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, err)
		return
	}

	// Get community images if any
	numberImagesRaw := r.FormValue("numImages")
	numberImagesInt64, err := strconv.ParseInt(numberImagesRaw, 10, 16)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}
	numberImages := int16(numberImagesInt64)

	var images []database.FileInternal
	for i := range numberImages {
		imageDataRaw, imageFileHeader, err := r.FormFile(fmt.Sprintf("image%d", i))
		if err != nil {
			utils.RespondWithError(w, http.StatusInternalServerError, err)
			return
		}
		var imageData []byte
		if imageDataRaw == nil {
			utils.RespondWithError(w, http.StatusInternalServerError, errors.New("image data is empty"))
			return
		} else {
			defer imageDataRaw.Close()

			imageData, err = io.ReadAll(imageDataRaw)
			if err != nil {
				utils.RespondWithError(w, http.StatusInternalServerError, err)
				return
			}
		}

		images = append(images, database.FileInternal{
			Filename: imageFileHeader.Filename,
			Mimetype: imageFileHeader.Header.Get("Content-Type"),
			Size:     imageFileHeader.Size,
			Data:     imageData,
		})
	}

	// Create community in db
	err = h.server.DB().CreateCommunity(communityDetails, images)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	w.WriteHeader(201)
}

// POST .../communities/users
// AUTHED
// adds a given userId to the given communityId, where the userid in the token must be an admin (currently only one admin per group allowed)
func (h *CommunityHandler) CreateCommunitiesUserHandler(w http.ResponseWriter, r *http.Request) {
	// Get authenticated user's ID
	authedUserID, ok := r.Context().Value(app_middleware.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, errors.New("user id blank"))
		return
	}

	MAX_SIZE := 50
	r.Body = http.MaxBytesReader(w, r.Body, int64(MAX_SIZE))
	err := r.ParseMultipartForm(int64(MAX_SIZE + 10))
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	type FormData struct {
		CommunityID string `json:"communityId"`
		UserID      string `json:"userId"`
	}
	var data FormData
	formData := r.FormValue("data")
	if len(formData) == 0 {
		utils.RespondWithError(w, http.StatusBadRequest, errors.New("empty data given"))
		return
	}

	err = json.Unmarshal([]byte(formData), &data)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Validate userId in JWT matches the adminId of the given community
	communityDetails, err := h.server.DB().GetCommunityDetails(data.CommunityID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}
	if authedUserID != communityDetails.AdminUserID {
		utils.RespondWithError(w, http.StatusUnauthorized, errors.New("userId in JWT not the admin userId of community requested"))
		return
	}

	// Add given user to given community
	err = h.server.DB().CreateCommunityUser(data.CommunityID, data.UserID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	w.WriteHeader(201)
}

// POST .../communities/properties
// AUTHED
// adds a given propertyId to the given communityId, where userid in token must be an admin
func (h *CommunityHandler) CreateCommunitiesPropertyHandler(w http.ResponseWriter, r *http.Request) {
	// Get authenticated user's ID
	authedUserID, ok := r.Context().Value(app_middleware.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, errors.New("user id blank"))
		return
	}

	MAX_SIZE := 50
	r.Body = http.MaxBytesReader(w, r.Body, int64(MAX_SIZE))
	err := r.ParseMultipartForm(int64(MAX_SIZE + 10))
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	type FormData struct {
		CommunityID string `json:"communityId"`
		PropertyID  string `json:"propertyId"`
	}
	var data FormData
	formData := r.FormValue("data")
	if len(formData) == 0 {
		utils.RespondWithError(w, http.StatusBadRequest, errors.New("empty data given"))
		return
	}

	err = json.Unmarshal([]byte(formData), &data)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Validate userId in JWT matches the adminId of the given community
	communityDetails, err := h.server.DB().GetCommunityDetails(data.CommunityID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}
	if authedUserID != communityDetails.AdminUserID {
		utils.RespondWithError(w, http.StatusUnauthorized, errors.New("userId in JWT not the admin userId of community requested"))
		return
	}

	// Add propertyID to this community
	err = h.server.DB().CreateCommunityProperty(communityDetails.CommunityID, data.PropertyID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	w.WriteHeader(201)
}

// PUT .../communities/{id}
// AUTHED
func (h *CommunityHandler) UpdateCommunitiesHandler(w http.ResponseWriter, r *http.Request) {
	// Get authenticated user's ID
	authedUserID, ok := r.Context().Value(app_middleware.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, errors.New("user id blank"))
		return
	}

	// Set max size to parse given data and parse
	MAX_SIZE := 55 << 20 // 55 MiB
	r.Body = http.MaxBytesReader(w, r.Body, int64(MAX_SIZE))
	err := r.ParseMultipartForm(int64(MAX_SIZE + 512))
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Unmarshal details data
	detailsRaw := r.FormValue("details")
	var communityDetails database.CommunityDetails
	err = json.Unmarshal([]byte(detailsRaw), &communityDetails)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Validate communityId in the data in the request body matches the id in the URL
	if communityDetails.CommunityID != chi.URLParam(r, "id") {
		utils.RespondWithError(w, http.StatusBadRequest, errors.New("communityId in url does not match communityId in request body"))
		return
	}

	// Query for current community details of entity to check
	// that the admin id is not modified here.
	currDBCommunityDetails, err := h.server.DB().GetCommunityDetails(communityDetails.CommunityID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	if communityDetails.AdminUserID != currDBCommunityDetails.AdminUserID {
		utils.RespondWithError(w, http.StatusBadRequest, errors.New("cannot change admin user id of community on this endpoint"))
		return
	}

	// Validate community's admin is the same id in token
	if authedUserID != communityDetails.AdminUserID {
		utils.RespondWithError(w, http.StatusUnauthorized, errors.New("userId in token does not match adminUserId of community details to be created"))
		return
	}

	// Validate community details
	err = validation.ValidateCommunityDetails(communityDetails)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, err)
		return
	}

	// Get community images (optional, can be 0)
	numberImagesRaw := r.FormValue("numImages")
	numberImagesInt64, err := strconv.ParseInt(numberImagesRaw, 10, 16)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}
	numberImages := int16(numberImagesInt64)

	var images []database.FileInternal
	for i := range numberImages {
		imageDataRaw, imageFileHeader, err := r.FormFile(fmt.Sprintf("image%d", i))
		if err != nil {
			utils.RespondWithError(w, http.StatusInternalServerError, err)
			return
		}
		var imageData []byte
		if imageDataRaw == nil {
			utils.RespondWithError(w, http.StatusInternalServerError, errors.New("image data is empty"))
			return
		} else {
			defer imageDataRaw.Close()

			imageData, err = io.ReadAll(imageDataRaw)
			if err != nil {
				utils.RespondWithError(w, http.StatusInternalServerError, err)
				return
			}
		}

		images = append(images, database.FileInternal{
			Filename: imageFileHeader.Filename,
			Mimetype: imageFileHeader.Header.Get("Content-Type"),
			Size:     imageFileHeader.Size,
			Data:     imageData,
		})
	}

	// Get user ids
	userIDsRaw := r.FormValue("userIDs")
	var userIDs []string
	err = json.Unmarshal([]byte(userIDsRaw), &userIDs)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Get property ids
	propertyIDsRaw := r.FormValue("propertyIDs")
	var propertyIDs []string
	err = json.Unmarshal([]byte(propertyIDsRaw), &propertyIDs)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Validate community as a whole before committing changes to db
	community := database.CommunityFullInternal{
		CommunityDetails:    communityDetails,
		CommunityImages:     images,
		CommunityUsers:      userIDs,
		CommunityProperties: propertyIDs,
	}
	err = validation.ValidateCommunity(community)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, err)
		return
	}

	// Commit changes to community to DB
	// Update community details and images
	err = h.server.DB().UpdateCommunityDetails(communityDetails)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}
	err = h.server.DB().UpdateCommunityImages(communityDetails.CommunityID, images)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Update community's list of users and properties
	err = h.server.DB().UpdateCommunityUsers(communityDetails.CommunityID, userIDs)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}
	err = h.server.DB().UpdateCommunityProperties(communityDetails.CommunityID, propertyIDs)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Respond with ok
	w.WriteHeader(200)
}

// DELETE .../communities/{id}
// AUTHED
func (h *CommunityHandler) DeleteCommunitiesHandler(w http.ResponseWriter, r *http.Request) {
	// Get authenticated user's ID
	authedUserID, ok := r.Context().Value(app_middleware.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, errors.New("user id blank"))
		return
	}

	communityId := chi.URLParam(r, "id")
	if len(communityId) == 0 {
		utils.RespondWithError(w, http.StatusBadRequest, errors.New("no communityId given"))
		return
	}

	// Try to get community
	communityDetails, err := h.server.DB().GetCommunityDetails(communityId)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Ensure user is an admin of the community
	if communityDetails.AdminUserID != authedUserID {
		utils.RespondWithError(w, http.StatusUnauthorized, errors.New("account not authorized for this action"))
		return
	}

	// Delete community
	err = h.server.DB().DeleteCommunity(communityId)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	w.WriteHeader(200)
}

// DELETE .../communities/user
// AUTHED
func (h *CommunityHandler) DeleteCommunitiesUserHandler(w http.ResponseWriter, r *http.Request) {
	// Get authenticated user's ID
	authedUserID, ok := r.Context().Value(app_middleware.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, errors.New("user id blank"))
		return
	}

	query := r.URL.Query()
	communityId := query.Get("communityId")
	userId := query.Get("userId")

	// Ensure presence of both query parameters
	if communityId == "" || userId == "" {
		utils.RespondWithError(w, http.StatusBadRequest, errors.New("missing query parameters in either/both communityId and userId"))
		return
	}

	// Try to get community details to validate existence of community
	communityDetails, err := h.server.DB().GetCommunityDetails(communityId)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Ensure authedUserID is the same as the adminId of community
	if communityDetails.AdminUserID != authedUserID {
		utils.RespondWithError(w, http.StatusUnauthorized, err)
		return
	}

	// Ensure userId is NOT adminId of community
	// (Don't allow admin to remove themselves, they should delete the community instead)
	if authedUserID == userId {
		utils.RespondWithError(w, http.StatusBadRequest, errors.New("community admin cannot remove themselves from the community"))
		return
	}

	// Attempt user deletion
	err = h.server.DB().DeleteCommunityUser(communityId, userId)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Respond ok
	w.WriteHeader(http.StatusOK)
}

// DELETE .../communities/properties
// AUTHED
func (h *CommunityHandler) DeleteCommunitiesPropertiesHandler(w http.ResponseWriter, r *http.Request) {
	// Get authenticated user's ID
	authedUserID, ok := r.Context().Value(app_middleware.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, errors.New("user id blank"))
		return
	}

	query := r.URL.Query()
	communityId := query.Get("communityId")
	propertyId := query.Get("propertyId")

	// Ensure presence of query parameters
	if communityId == "" {
		utils.RespondWithError(w, http.StatusBadRequest, errors.New("missing \"communityId\" query parameter"))
	}
	if propertyId == "" {
		utils.RespondWithError(w, http.StatusBadRequest, errors.New("missing \"propertyId\" query parameter"))
		return
	}

	// Try to get community details to validate existence of community
	communityDetails, err := h.server.DB().GetCommunityDetails(communityId)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Ensure authedUserID is the same as the adminId of community
	if communityDetails.AdminUserID != authedUserID {
		utils.RespondWithError(w, http.StatusUnauthorized, err)
		return
	}

	// Try to delete property marking from this community
	err = h.server.DB().DeleteCommunityProperty(communityId, propertyId)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Respond ok
	w.WriteHeader(http.StatusOK)
}

// PUT .../communities/transfer/ownership
// AUTHED
func (h *CommunityHandler) TransferCommunityOwnershipHandler(w http.ResponseWriter, r *http.Request) {
	// Get authenticated user's ID
	authedUserID, ok := r.Context().Value(app_middleware.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, errors.New("user id blank"))
		return
	}

	query := r.URL.Query()
	communityId := query.Get("communityId")
	userId := query.Get("userId")

	// Ensure presence of query parameters
	if communityId == "" {
		utils.RespondWithError(w, http.StatusBadRequest, errors.New("missing \"communityId\" query parameter"))
	}
	if userId == "" {
		utils.RespondWithError(w, http.StatusBadRequest, errors.New("missing \"userId\" query parameter"))
		return
	}

	// Don't do anything if authedUserID is the same as the userId in the query parameter
	// since that would be essentially a noop (transfer to yourself)
	if authedUserID == userId {
		w.WriteHeader(http.StatusOK)
		return
	}

	// Ensure community exists
	_, err := h.server.DB().GetCommunityDetails(communityId)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, errors.New("community does not exist"))
		return
	}

	// Ensure the other user Id exists
	_, err = h.server.DB().GetPublicUserProfile(userId)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, errors.New("user does not exist"))
		return
	}

	// Add the new admin user id to the community's list of users if not already a member
	communityUserIDs, err := h.server.DB().GetCommunityUsers(communityId)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, errors.New("couldn't get the community's members list"))
		return
	}
	found := false
	for _, id := range communityUserIDs {
		if userId == id {
			found = true
			break
		}
	}
	if !found {
		communityUserIDs = append(communityUserIDs, userId)
		err = h.server.DB().UpdateCommunityUsers(communityId, communityUserIDs)
		if err != nil {
			utils.RespondWithError(w, http.StatusInternalServerError, err)
			return
		}
	}

	// Update the community's admin user id
	err = h.server.DB().UpdateCommunityAdmin(communityId, userId)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Success, respond ok
	w.WriteHeader(http.StatusOK)
}
