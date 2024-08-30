package handlers

import (
	"backend/internal/auth"
	"backend/internal/config"
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

type PropertyHandler struct {
	server      interfaces.Server
	adminUserID string
}

func NewPropertyHandlers(s interfaces.Server) *PropertyHandler {
	return &PropertyHandler{server: s, adminUserID: config.GlobalConfig.ADMIN_USER_ID}
}

// NO AUTH
func (h *PropertyHandler) GetPropertyHandler(w http.ResponseWriter, r *http.Request) {
	propertyID := chi.URLParam(r, "id")

	// Try to get property from db
	propertyDetails, err := h.server.DB().GetPropertyDetails(propertyID)
	if err != nil {
		utils.RespondWithError(w, 500, err)
		return
	}

	propertyImagesBinary, err := h.server.DB().GetPropertyImages(propertyID)
	if err != nil {
		utils.RespondWithError(w, 500, err)
		return
	}

	var propertyImagesB64 []database.OrderedFileExternal
	for _, image := range propertyImagesBinary {
		propertyImagesB64 = append(propertyImagesB64, database.OrderedFileExternal{
			OrderNum: image.OrderNum,
			File: database.FileExternal{
				Filename: image.File.Filename,
				Mimetype: image.File.Mimetype,
				Size:     image.File.Size,
				Data:     base64.StdEncoding.EncodeToString(image.File.Data),
			},
		})
	}

	property := database.PropertyFull{
		PropertyDetails: propertyDetails,
		PropertyImages:  propertyImagesB64,
	}

	utils.RespondWithJSON(w, 200, property)
}

// NO AUTH
func (h *PropertyHandler) GetPropertiesHandler(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()

	pageStr := query.Get("page")
	limitStr := query.Get("limit")
	filterAddress := query.Get("filterAddress")

	// Parse offset and limit
	var offset int
	offset, err := strconv.Atoi(pageStr)
	if err != nil {
		utils.RespondWithError(w, 422, fmt.Errorf("unable to parse page: %s", pageStr))
		return
	}

	var limit int
	limit, err = strconv.Atoi(limitStr)
	if err != nil {
		utils.RespondWithError(w, 422, fmt.Errorf("unable to parse limit: %s", limitStr))
		return
	}

	// Calculate the correct offset
	offset = offset * limit

	// Get the property IDs from DB
	properties, err := h.server.DB().GetNextPageProperties(int32(limit), int32(offset), filterAddress)
	if err != nil {
		utils.RespondWithError(w, 500, err)
		return
	}

	utils.RespondWithJSON(w, 200, struct {
		PropertyIDs []string `json:"propertyIDs"`
	}{
		PropertyIDs: properties,
	})
}

// NO AUTH
func (h *PropertyHandler) GetListerInfoHandler(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	listerID := query.Get("listerID")
	if listerID == "" {
		utils.RespondWithError(w, 422, errors.New("listerID empty"))
		return
	}

	// Check the role of the userid
	role, err := h.server.DB().GetUserRole(listerID)
	if err != nil {
		utils.RespondWithError(w, 500, err)
		return
	}
	if role != "lister" && role != "admin" {
		utils.RespondWithError(w, 500, errors.New("user is not a lister"))
		return
	}

	// userID is a lister, return the email and name for basic contact information
	lister, err := h.server.DB().GetUserDetails(listerID)
	if err != nil {
		utils.RespondWithError(w, 500, err)
		return
	}

	utils.RespondWithJSON(w, 200, struct {
		FirstName string `json:"firstName"`
		LastName  string `json:"lastName"`
		Email     string `json:"email"`
	}{
		FirstName: lister.FirstName,
		LastName:  lister.LastName,
		Email:     lister.Email,
	})
}

// AUTHED
func (h *PropertyHandler) GetPropertiesTotalCountHandler(w http.ResponseWriter, r *http.Request) {
	// Validate properties
	count, err := h.server.DB().GetTotalCountProperties()
	if err != nil {
		utils.RespondWithError(w, 500, err)
		return
	}
	utils.RespondWithJSON(w, 200, count)
}

// AUTHED
func (h *PropertyHandler) CreatePropertiesHandler(w http.ResponseWriter, r *http.Request) {
	// Get user id
	userID, ok := r.Context().Value(auth.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, errors.New("user id blank"))
		return
	}
	role, err := h.server.DB().GetUserRole(userID)
	if err != nil {
		utils.RespondWithError(w, 401, err)
		return
	}
	if role == "regular" {
		utils.RespondWithError(w, 401, err)
		return
	}

	// Prepare reading body form by allocating max memory to read
	MAX_SIZE := 55 << 20 // 55 MiB
	r.Body = http.MaxBytesReader(w, r.Body, int64(MAX_SIZE))
	err = r.ParseMultipartForm(int64(MAX_SIZE + 512))
	if err != nil {
		utils.RespondWithError(w, 500, err)
		return
	}

	// Get details
	detailsRaw := r.FormValue("details")
	var propertyDetails database.PropertyDetails
	err = json.Unmarshal([]byte(detailsRaw), &propertyDetails)
	if err != nil {
		utils.RespondWithError(w, 500, err)
		return
	}

	// Validate property details
	err = validation.ValidatePropertyDetails(propertyDetails)
	if err != nil {
		utils.RespondWithError(w, 400, err)
		return
	}

	// Check that property address is not a duplicate of an existing one before creation
	err = h.server.DB().CheckDuplicateProperty(propertyDetails)
	if err != nil {
		utils.RespondWithError(w, 400, err)
		return
	}

	// Get property images
	numberImagesRaw := r.FormValue("numImages") // should be at most 10, limited on expected frontend.
	numberImagesInt64, err := strconv.ParseInt(numberImagesRaw, 10, 16)
	if err != nil {
		utils.RespondWithError(w, 500, err)
		return
	}
	numberImages := int16(numberImagesInt64)

	// Ensure that at least a single image is given for the property
	if numberImages == 0 {
		utils.RespondWithError(w, 400, errors.New("property must have at least one property"))
		return
	}

	var images []database.OrderedFileInternal
	for i := range numberImages {
		imageDataRaw, imageFileHeader, err := r.FormFile(fmt.Sprintf("image%d", i))
		if err != nil {
			utils.RespondWithError(w, 500, err)
			return
		}
		var imageData []byte
		if imageDataRaw == nil {
			utils.RespondWithError(w, 500, errors.New("image data is empty"))
			return
		} else {
			defer imageDataRaw.Close()

			imageData, err = io.ReadAll(imageDataRaw)
			if err != nil {
				utils.RespondWithError(w, 500, err)
				return
			}
		}

		images = append(images, database.OrderedFileInternal{
			OrderNum: i,
			File: database.FileInternal{
				Filename: imageFileHeader.Filename,
				Mimetype: imageFileHeader.Header.Get("Content-Type"),
				Size:     imageFileHeader.Size,
				Data:     imageData,
			},
		})
	}

	// Create the property in the db
	err = h.server.DB().CreateProperty(propertyDetails, images)
	if err != nil {
		utils.RespondWithError(w, 500, err)
		return
	}

	// Respond with ok created
	w.WriteHeader(201)
}

// AUTHED
func (h *PropertyHandler) UpdatePropertiesHandler(w http.ResponseWriter, r *http.Request) {
	// Get user id
	userID, ok := r.Context().Value(auth.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, errors.New("user id blank"))
		return
	}
	// Ensure user has permission to create a property
	// (i.e. a role of lister or admin)
	role, err := h.server.DB().GetUserRole(userID)
	if err != nil {
		utils.RespondWithError(w, 401, err)
		return
	}
	if role == "regular" {
		utils.RespondWithError(w, 401, err)
		return
	}

	// Prepare reading body form by allocating max memory to read
	MAX_SIZE := 55 << 20 // 55 MiB
	r.Body = http.MaxBytesReader(w, r.Body, int64(MAX_SIZE))
	err = r.ParseMultipartForm(int64(MAX_SIZE + 512))
	if err != nil {
		utils.RespondWithError(w, 500, err)
		return
	}

	// Get details
	detailsRaw := r.FormValue("details")
	var propertyDetails database.PropertyDetails
	err = json.Unmarshal([]byte(detailsRaw), &propertyDetails)
	if err != nil {
		utils.RespondWithError(w, 500, err)
		return
	}

	// Validate propertyId of URLParam matches propertyId of data in request body
	if propertyDetails.PropertyID != chi.URLParam(r, "id") {
		utils.RespondWithError(w, http.StatusBadRequest, errors.New("propertyId of URLParam does not match propertyId of data in request body"))
		return
	}

	// Validate property details
	err = validation.ValidatePropertyDetails(propertyDetails)
	if err != nil {
		utils.RespondWithError(w, 400, err)
		return
	}

	// Get property images
	numberImagesRaw := r.FormValue("numImages") // should be at most 10, limited on expected frontend.
	numberImagesInt64, err := strconv.ParseInt(numberImagesRaw, 10, 16)
	if err != nil {
		utils.RespondWithError(w, 500, err)
		return
	}
	numberImages := int16(numberImagesInt64)

	// Ensure that at least a single image is given for the property
	if numberImages == 0 {
		utils.RespondWithError(w, 400, errors.New("property must have at least one property"))
		return
	}

	var images []database.OrderedFileInternal
	for i := range numberImages {
		imageDataRaw, imageFileHeader, err := r.FormFile(fmt.Sprintf("image%d", i))
		if err != nil {
			utils.RespondWithError(w, 500, err)
			return
		}
		var imageData []byte
		if imageDataRaw == nil {
			utils.RespondWithError(w, 500, errors.New("image data is empty"))
			return
		} else {
			defer imageDataRaw.Close()

			imageData, err = io.ReadAll(imageDataRaw)
			if err != nil {
				utils.RespondWithError(w, 500, err)
				return
			}
		}

		images = append(images, database.OrderedFileInternal{
			OrderNum: i,
			File: database.FileInternal{
				Filename: imageFileHeader.Filename,
				Mimetype: imageFileHeader.Header.Get("Content-Type"),
				Size:     imageFileHeader.Size,
				Data:     imageData,
			},
		})
	}

	// Listers can only update their own properties, admins can modify any who cares if they own it or not
	if role == "lister" && userID != propertyDetails.ListerUserID {
		utils.RespondWithError(w, 401, errors.New("you can only modify your own property as a lister"))
		return
	}

	// Update property details
	err = h.server.DB().UpdatePropertyDetails(propertyDetails)
	if err != nil {
		utils.RespondWithError(w, 500, err)
		return
	}

	// Update property images
	err = h.server.DB().UpdatePropertyImages(propertyDetails.PropertyID, images)
	if err != nil {
		utils.RespondWithError(w, 500, err)
		return
	}

	// Respond with ok
	w.WriteHeader(200)
}

// AUTHED
func (h *PropertyHandler) DeletePropertiesHandler(w http.ResponseWriter, r *http.Request) {
	// Get user id
	userID, ok := r.Context().Value(auth.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, errors.New("user id blank"))
		return
	}

	// Get the property ID they want to delete from the URL param
	propertyID := chi.URLParam(r, "id")
	if len(propertyID) == 0 {
		utils.RespondWithError(w, 400, errors.New("no communityId given"))
		return
	}

	// Try to get the requested property
	propertyDetails, err := h.server.DB().GetPropertyDetails(propertyID)
	if err != nil {
		utils.RespondWithError(w, 500, err)
		return
	}

	// Ensure that the user owns the property OR
	// that the user is the admin
	if propertyDetails.ListerUserID != userID && userID != h.adminUserID {
		utils.RespondWithError(w, 401, errors.New("account not authorized for this action"))
		return
	}

	// Delete the property
	err = h.server.DB().DeleteProperty(propertyID)
	if err != nil {
		utils.RespondWithError(w, 500, err)
		return
	}

	// Respond ok
	w.WriteHeader(200)
}
