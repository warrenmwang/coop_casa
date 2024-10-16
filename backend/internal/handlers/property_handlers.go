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

// GET .../properties/{id}
// NO AUTH
func (h *PropertyHandler) GetPropertyHandler(w http.ResponseWriter, r *http.Request) {
	propertyID := chi.URLParam(r, "id")

	// Try to get property from db
	propertyDetails, err := h.server.DB().GetPropertyDetails(propertyID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	propertyImagesBinary, err := h.server.DB().GetPropertyImages(propertyID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
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

	utils.RespondWithJSON(w, http.StatusOK, property)
}

// GET .../properties
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

	// Get the property IDs from DB
	properties, err := h.server.DB().GetNextPageProperties(int32(limit), int32(offset), filterAddress)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Ensure send empty array instead of nil if no more results.
	if properties == nil {
		properties = []string{}
	}

	utils.RespondWithJSON(w, http.StatusOK, struct {
		PropertyIDs []string `json:"propertyIDs"`
	}{
		PropertyIDs: properties,
	})
}

// POST .../properties
// AUTHED
func (h *PropertyHandler) CreatePropertiesHandler(w http.ResponseWriter, r *http.Request) {
	// Get user id
	userID, ok := r.Context().Value(auth.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, errors.New("user id blank"))
		return
	}
	// Ensure authed user has proper permissions by checking their role
	role, err := h.server.DB().GetUserRole(userID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}
	if role == config.USER_ROLE_REGULAR {
		utils.RespondWithError(w, http.StatusUnauthorized, err)
		return
	}

	// Prepare reading body form by allocating max memory to read
	MAX_SIZE := 55 << 20 // 55 MiB
	r.Body = http.MaxBytesReader(w, r.Body, int64(MAX_SIZE))
	err = r.ParseMultipartForm(int64(MAX_SIZE + 512))
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Get details
	detailsRaw := r.FormValue("details")
	var propertyDetails database.PropertyDetails
	err = json.Unmarshal([]byte(detailsRaw), &propertyDetails)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Validate property details
	err = validation.ValidatePropertyDetails(propertyDetails)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, err)
		return
	}

	// Check that property address is not a duplicate of an existing one before creation
	err = h.server.DB().CheckDuplicateProperty(propertyDetails)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, err)
		return
	}

	// Get property images
	numberImagesRaw := r.FormValue("numImages") // should be at most 10, limited on expected frontend.
	numberImagesInt64, err := strconv.ParseInt(numberImagesRaw, 10, 16)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}
	numberImages := int16(numberImagesInt64)

	// Ensure that at least a single image is given for the property
	if numberImages == 0 {
		utils.RespondWithError(w, http.StatusBadRequest, errors.New("property must have at least one property"))
		return
	}

	var images []database.OrderedFileInternal
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

		imageFile := database.FileInternal{
			Filename: imageFileHeader.Filename,
			Mimetype: imageFileHeader.Header.Get("Content-Type"),
			Size:     imageFileHeader.Size,
			Data:     imageData,
		}

		// Validation of images not implemented atm.
		// err = validation.ValidateImage(imageFile)
		// if err != nil {
		// 	utils.RespondWithError(w, http.StatusBadRequest, err)
		// 	return
		// }

		images = append(images, database.OrderedFileInternal{
			OrderNum: i,
			File:     imageFile,
		})
	}

	// Create the property in the db
	err = h.server.DB().CreateProperty(propertyDetails, images)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Respond with ok created
	w.WriteHeader(201)
}

// PUT .../properties/{id}
// AUTHED
func (h *PropertyHandler) UpdatePropertiesHandler(w http.ResponseWriter, r *http.Request) {
	// Get user id
	authedUserID, ok := r.Context().Value(auth.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, errors.New("user id blank"))
		return
	}

	// Ensure user has permission to create a property
	// (i.e. a role of lister or admin)
	role, err := h.server.DB().GetUserRole(authedUserID)
	if err != nil {
		utils.RespondWithError(w, http.StatusUnauthorized, err)
		return
	}
	if role == config.USER_ROLE_REGULAR {
		utils.RespondWithError(w, http.StatusUnauthorized, errors.New("you do not have permission to access this endpoint"))
		return
	}

	// Prepare reading body form by allocating max memory to read
	MAX_SIZE := 55 << 20 // 55 MiB
	r.Body = http.MaxBytesReader(w, r.Body, int64(MAX_SIZE))
	err = r.ParseMultipartForm(int64(MAX_SIZE + 512))
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Get details
	detailsRaw := r.FormValue("details")
	var propertyDetails database.PropertyDetails
	err = json.Unmarshal([]byte(detailsRaw), &propertyDetails)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Validate propertyId of URLParam matches propertyId of data in request body
	if propertyDetails.PropertyID != chi.URLParam(r, "id") {
		utils.RespondWithError(w, http.StatusBadRequest, errors.New("propertyId of URLParam does not match propertyId of data in request body"))
		return
	}

	// Query for current property details of entity to check
	// that the lister id is not modified here.
	currDBPropertyDetails, err := h.server.DB().GetPropertyDetails(propertyDetails.PropertyID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Also ensure lister id is not changed here on this endpoint (that is a separate endpoint, see below)
	// and matches what is given
	if role == config.USER_ROLE_LISTER {
		// cannot modify properties you do not own
		if authedUserID != currDBPropertyDetails.ListerUserID {
			utils.RespondWithError(w, http.StatusUnauthorized, errors.New("as a lister, your verified user id does not match the lister user id in the property details of the request you are making"))
			return
		}
		// enforce cannot change lister id of property on this endpoint
		if propertyDetails.ListerUserID != currDBPropertyDetails.ListerUserID {
			utils.RespondWithError(w, http.StatusUnauthorized, errors.New("cannot change lister id of property you own on this endpoint"))
			return
		}
	} else if role == config.USER_ROLE_ADMIN {
		// enforce cannot change lister id of property on this endpoint
		if propertyDetails.ListerUserID != currDBPropertyDetails.ListerUserID {
			utils.RespondWithError(w, http.StatusUnauthorized, errors.New("cannot change lister id of property you own on this endpoint"))
			return
		}
	} else {
		utils.RespondWithError(w, http.StatusBadRequest, errors.New("something went wrong, unexpected user role"))
		return
	}

	// Validate property details
	err = validation.ValidatePropertyDetails(propertyDetails)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, err)
		return
	}

	// Get count of property images sent
	numberImagesRaw := r.FormValue("numImages") // should be at most 10, limited on expected frontend.
	numberImagesInt64, err := strconv.ParseInt(numberImagesRaw, 10, 16)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}
	numberImages := int16(numberImagesInt64)

	// Ensure that at least a single image is given for the property
	if numberImages < 1 {
		utils.RespondWithError(w, http.StatusBadRequest, errors.New("property must have at least one property"))
		return
	}

	// Get images from request
	var images []database.OrderedFileInternal
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

	// Update property details
	err = h.server.DB().UpdatePropertyDetails(propertyDetails)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Update property images
	err = h.server.DB().UpdatePropertyImages(propertyDetails.PropertyID, images)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Respond with ok
	w.WriteHeader(200)
}

// DELETE .../properties/{id}
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
		utils.RespondWithError(w, http.StatusBadRequest, errors.New("no communityId given"))
		return
	}

	// Try to get the requested property
	propertyDetails, err := h.server.DB().GetPropertyDetails(propertyID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Ensure that the user owns the property OR
	// that the user is the admin
	if propertyDetails.ListerUserID != userID && userID != h.adminUserID {
		utils.RespondWithError(w, http.StatusUnauthorized, errors.New("account not authorized for this action"))
		return
	}

	// Delete the property
	err = h.server.DB().DeleteProperty(propertyID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Respond ok
	w.WriteHeader(200)
}

// PUT .../properties/transfer/ownership
// AUTHED
func (h *PropertyHandler) TransferPropertyOwnershipHandler(w http.ResponseWriter, r *http.Request) {
	// Get authenticated user's ID
	authedUserID, ok := r.Context().Value(auth.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, errors.New("user id blank"))
		return
	}

	query := r.URL.Query()
	propertyId := query.Get("propertyId")
	userId := query.Get("userId")

	// Ensure presence of query parameters
	if propertyId == "" {
		utils.RespondWithError(w, http.StatusBadRequest, errors.New("missing \"propertyId\" query parameter"))
		return
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

	// Ensure property exists
	_, err := h.server.DB().GetPropertyDetails(propertyId)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, errors.New("property does not exist"))
		return
	}

	// Ensure the other user exists
	_, err = h.server.DB().GetPublicUserProfile(userId)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, errors.New("other user does not exist"))
		return
	}

	// Ensure the other user has a lister or admin (i.e. not regular)
	role, err := h.server.DB().GetUserRole(userId)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}
	if role == config.USER_ROLE_REGULAR {
		utils.RespondWithError(w, http.StatusBadRequest, errors.New("other user is not a lister and cannot be the new lister of the property"))
		return
	}

	// Update the property's lister to the new user
	err = h.server.DB().UpdatePropertyLister(propertyId, userId)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, err)
		return
	}

	// Respond with Ok
	w.WriteHeader(http.StatusOK)
}
