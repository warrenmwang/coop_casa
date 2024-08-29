package handlers

import (
	"backend/internal/database"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

// GET /api/communities/{id}
// NO AUTH
func (s *Server) apiGetCommunityHandler(w http.ResponseWriter, r *http.Request) {
	communityId := chi.URLParam(r, "id")
	communityDetails, err := s.db.GetCommunityDetails(communityId)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}
	communityImagesInternal, err := s.db.GetCommunityImages(communityId)
	if err != nil {
		respondWithError(w, 500, err)
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
	communityUsers, err := s.db.GetCommunityUsers(communityId)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}
	communityProperties, err := s.db.GetCommunityProperties(communityId)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}
	communityFull := database.CommunityFull{
		CommunityDetails:    communityDetails,
		CommunityImages:     communityImagesExternal,
		CommunityUsers:      communityUsers,
		CommunityProperties: communityProperties,
	}
	respondWithJSON(w, 200, communityFull)
}

// GET /api/communities
// NO AUTH
// Public api to search through all communities
func (s *Server) apiGetCommunitiesHandler(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()

	pageStr := query.Get("page")
	limitStr := query.Get("limit")
	filterName := query.Get("communityFilterName")
	filterDescription := query.Get("communityFilterDescription")

	// Parse offset and limit
	var offset int
	offset, err := strconv.Atoi(pageStr)
	if err != nil {
		respondWithError(w, 422, fmt.Errorf("unable to parse page: %s", pageStr))
		return
	}

	var limit int
	limit, err = strconv.Atoi(limitStr)
	if err != nil {
		respondWithError(w, 422, fmt.Errorf("unable to parse limit: %s", limitStr))
		return
	}

	// Calculate the correct offset
	offset = offset * limit

	// Get communities with optional filters
	communityIds, err := s.db.GetNextPageCommunities(int32(limit), int32(offset), filterName, filterDescription)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	respondWithJSON(w, 200, struct {
		CommunityIDs []string `json:"communityIDs"`
	}{
		CommunityIDs: communityIds,
	})
}

// POST /api/communities
// AUTHED
func (s *Server) apiCreateCommunitiesHandler(w http.ResponseWriter, r *http.Request) {
	// Authenticate user
	authedUserId, err := s.getAuthedUserId(r)
	if err != nil {
		respondWithError(w, 401, err)
		return
	}

	// Define max mem to read from received body
	MAX_SIZE := 55 << 20 // 55 MiB
	r.Body = http.MaxBytesReader(w, r.Body, int64(MAX_SIZE))
	err = r.ParseMultipartForm(int64(MAX_SIZE) + 512)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	// Unmarshal details data
	detailsRaw := r.FormValue("details")
	var communityDetails database.CommunityDetails
	err = json.Unmarshal([]byte(detailsRaw), &communityDetails)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	// Validate community's admin is the same id in token
	if authedUserId != communityDetails.AdminUserID {
		respondWithError(w, 401, errors.New("userId in token does not match adminUserId of community details to be created"))
		return
	}

	// Validate community details
	err = ValidateCommnityDetails(communityDetails)
	if err != nil {
		respondWithError(w, 400, err)
		return
	}

	// Get community images if any
	numberImagesRaw := r.FormValue("numImages")
	numberImagesInt64, err := strconv.ParseInt(numberImagesRaw, 10, 16)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}
	numberImages := int16(numberImagesInt64)

	var images []database.FileInternal
	for i := range numberImages {
		imageDataRaw, imageFileHeader, err := r.FormFile(fmt.Sprintf("image%d", i))
		if err != nil {
			respondWithError(w, 500, err)
			return
		}
		var imageData []byte
		if imageDataRaw == nil {
			respondWithError(w, 500, errors.New("image data is empty"))
			return
		} else {
			defer imageDataRaw.Close()

			imageData, err = io.ReadAll(imageDataRaw)
			if err != nil {
				respondWithError(w, 500, err)
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
	err = s.db.CreateCommunity(communityDetails, images)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	w.WriteHeader(201)
}

// POST /api/communities/users
// AUTHED
// adds a given userId to the given communityId, where the userid in the token must be an admin (currently only one admin per group allowed)
func (s *Server) apiCreateCommunitiesUserHandler(w http.ResponseWriter, r *http.Request) {
	// Authenticate user
	authedUserId, err := s.getAuthedUserId(r)
	if err != nil {
		respondWithError(w, 401, err)
		return
	}

	MAX_SIZE := 50
	r.Body = http.MaxBytesReader(w, r.Body, int64(MAX_SIZE))
	err = r.ParseMultipartForm(int64(MAX_SIZE + 10))
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	type FormData struct {
		CommunityID string `json:"communityId"`
		UserID      string `json:"userId"`
	}
	var data FormData
	formData := r.FormValue("data")
	if len(formData) == 0 {
		respondWithError(w, 400, errors.New("empty data given"))
		return
	}

	err = json.Unmarshal([]byte(formData), &data)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	// Validate userId in JWT matches the adminId of the given community
	communityDetails, err := s.db.GetCommunityDetails(data.CommunityID)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}
	if authedUserId != communityDetails.AdminUserID {
		respondWithError(w, 401, errors.New("userId in JWT not the admin userId of community requested"))
		return
	}

	// Add given user to given community
	err = s.db.CreateCommunityUser(data.CommunityID, data.UserID)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	w.WriteHeader(201)
}

// POST /api/communities/properties
// AUTHED
// adds a given propertyId to the given communityId, where userid in token must be an admin
func (s *Server) apiCreateCommunitiesPropertyHandler(w http.ResponseWriter, r *http.Request) {
	// Authenticate user
	authedUserId, err := s.getAuthedUserId(r)
	if err != nil {
		respondWithError(w, 401, err)
		return
	}

	MAX_SIZE := 50
	r.Body = http.MaxBytesReader(w, r.Body, int64(MAX_SIZE))
	err = r.ParseMultipartForm(int64(MAX_SIZE + 10))
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	type FormData struct {
		CommunityID string `json:"communityId"`
		PropertyID  string `json:"propertyId"`
	}
	var data FormData
	formData := r.FormValue("data")
	if len(formData) == 0 {
		respondWithError(w, 400, errors.New("empty data given"))
		return
	}

	err = json.Unmarshal([]byte(formData), &data)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	// Validate userId in JWT matches the adminId of the given community
	communityDetails, err := s.db.GetCommunityDetails(data.CommunityID)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}
	if authedUserId != communityDetails.AdminUserID {
		respondWithError(w, 401, errors.New("userId in JWT not the admin userId of community requested"))
		return
	}

	// Add propertyID to this community
	err = s.db.CreateCommunityProperty(communityDetails.CommunityID, data.PropertyID)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	w.WriteHeader(201)
}

// PUT /api/communities/{id}
// AUTHED
func (s *Server) apiUpdateCommunitiesHandler(w http.ResponseWriter, r *http.Request) {
	// Authenticate user
	authedUserId, err := s.getAuthedUserId(r)
	if err != nil {
		respondWithError(w, 401, err)
		return
	}

	// Set max size to parse given data and parse
	MAX_SIZE := 55 << 20 // 55 MiB
	r.Body = http.MaxBytesReader(w, r.Body, int64(MAX_SIZE))
	err = r.ParseMultipartForm(int64(MAX_SIZE + 512))
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	// Unmarshal details data
	detailsRaw := r.FormValue("details")
	var communityDetails database.CommunityDetails
	err = json.Unmarshal([]byte(detailsRaw), &communityDetails)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	// Validate communityId in the data in the request body matches the id in the URL
	if communityDetails.CommunityID != chi.URLParam(r, "id") {
		respondWithError(w, http.StatusBadRequest, errors.New("communityId in url does not match communityId in request body"))
		return
	}

	// Validate community's admin is the same id in token
	if authedUserId != communityDetails.AdminUserID {
		respondWithError(w, 401, errors.New("userId in token does not match adminUserId of community details to be created"))
		return
	}

	// Validate community details
	err = ValidateCommnityDetails(communityDetails)
	if err != nil {
		respondWithError(w, 400, err)
		return
	}

	// Get community images (optional, can be 0)
	numberImagesRaw := r.FormValue("numImages")
	numberImagesInt64, err := strconv.ParseInt(numberImagesRaw, 10, 16)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}
	numberImages := int16(numberImagesInt64)

	var images []database.FileInternal
	for i := range numberImages {
		imageDataRaw, imageFileHeader, err := r.FormFile(fmt.Sprintf("image%d", i))
		if err != nil {
			respondWithError(w, 500, err)
			return
		}
		var imageData []byte
		if imageDataRaw == nil {
			respondWithError(w, 500, errors.New("image data is empty"))
			return
		} else {
			defer imageDataRaw.Close()

			imageData, err = io.ReadAll(imageDataRaw)
			if err != nil {
				respondWithError(w, 500, err)
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

	// Update community details and images
	err = s.db.UpdateCommunityDetails(communityDetails)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}
	err = s.db.UpdateCommunityImages(communityDetails.CommunityID, images)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	// Respond with ok
	w.WriteHeader(200)
}

// DELETE /api/communities/{id}
// AUTHED
func (s *Server) apiDeleteCommunitiesHandler(w http.ResponseWriter, r *http.Request) {
	// Authenticate user
	authedUserId, err := s.getAuthedUserId(r)
	if err != nil {
		respondWithError(w, 401, err)
		return
	}

	communityId := chi.URLParam(r, "id")
	if len(communityId) == 0 {
		respondWithError(w, 400, errors.New("no communityId given"))
		return
	}

	// Try to get community
	communityDetails, err := s.db.GetCommunityDetails(communityId)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	// Ensure user is an admin of the community and not admin of entire site.
	if communityDetails.AdminUserID != communityId && authedUserId != s.AdminUserID {
		respondWithError(w, 401, errors.New("account not authorized for this action"))
		return
	}

	// Delete community
	err = s.db.DeleteCommunity(communityId)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	w.WriteHeader(200)
}

// DELETE /api/communities/user
// AUTHED
func (s *Server) apiDeleteCommunitiesUserHandler(w http.ResponseWriter, r *http.Request) {
	// Authenticate user
	authedUserId, err := s.getAuthedUserId(r)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, err)
		return
	}

	query := r.URL.Query()
	communityId := query.Get("communityId")
	userId := query.Get("userId")

	// Ensure presence of both query parameters
	if communityId == "" || userId == "" {
		respondWithError(w, http.StatusBadRequest, errors.New("missing query parameters in either/both communityId and userId"))
		return
	}

	// Try to get community details to validate existence of community
	communityDetails, err := s.db.GetCommunityDetails(communityId)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Ensure authedUserId is the same as the adminId of community
	if communityDetails.AdminUserID != authedUserId {
		respondWithError(w, http.StatusUnauthorized, err)
		return
	}

	// Ensure userId is NOT adminId of community
	// (Don't allow admin to remove themselves, they should delete the community instead)
	if authedUserId == userId {
		respondWithError(w, http.StatusBadRequest, errors.New("community admin cannot remove themselves from the community"))
		return
	}

	// Attempt user deletion
	err = s.db.DeleteCommunityUser(communityId, userId)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Respond ok
	w.WriteHeader(http.StatusOK)
}

// DELETE /api/communities/properties
// AUTHED
func (s *Server) apiDeleteCommunitiesPropertiesHandler(w http.ResponseWriter, r *http.Request) {
	// Authenticate user
	authedUserId, err := s.getAuthedUserId(r)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, err)
		return
	}

	query := r.URL.Query()
	communityId := query.Get("communityId")
	propertyId := query.Get("propertyId")

	// Ensure presence of query parameters
	if communityId == "" || propertyId == "" {
		respondWithError(w, http.StatusBadRequest, errors.New("missing query parameters in either/both communityId and propertyId"))
		return
	}

	// Try to get community details to validate existence of community
	communityDetails, err := s.db.GetCommunityDetails(communityId)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Ensure authedUserId is the same as the adminId of community
	if communityDetails.AdminUserID != authedUserId {
		respondWithError(w, http.StatusUnauthorized, err)
		return
	}

	// Try to delete property marking from this community
	err = s.db.DeleteCommunityProperty(communityId, propertyId)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Respond ok
	w.WriteHeader(http.StatusOK)
}
