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

// ----------------- PROPERTIES ---------------------

// GET /api/properties/{id}
// NO AUTH
func (s *Server) apiGetPropertyHandler(w http.ResponseWriter, r *http.Request) {
	propertyID := chi.URLParam(r, "id")

	// Try to get property from db
	propertyDetails, err := s.db.GetPropertyDetails(propertyID)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	propertyImagesBinary, err := s.db.GetPropertyImages(propertyID)
	if err != nil {
		respondWithError(w, 500, err)
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

	respondWithJSON(w, 200, property)
}

// GET /api/properties/total
// AUTHED
func (s *Server) apiGetPropertiesTotalCountHandler(w http.ResponseWriter, r *http.Request) {
	// Authenticate user
	_, err := s.authCheckAndGetClaims(r)
	if err != nil {
		respondWithError(w, 401, err)
		return
	}

	// Validate properties
	count, err := s.db.GetTotalCountProperties()
	if err != nil {
		respondWithError(w, 500, err)
		return
	}
	respondWithJSON(w, 200, count)
}

// Endpoint: GET /api/properties
// NO AUTH
func (s *Server) apiGetPropertiesHandler(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()

	pageStr := query.Get("page")
	limitStr := query.Get("limit")
	filterAddress := query.Get("filterAddress")

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

	// Get the property IDs from DB
	properties, err := s.db.GetNextPageProperties(int32(limit), int32(offset), filterAddress)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	respondWithJSON(w, 200, struct {
		PropertyIDs []string `json:"propertyIDs"`
	}{
		PropertyIDs: properties,
	})
}

// Endpoint: POST /api/properties
// AUTHED
func (s *Server) apiCreatePropertiesHandler(w http.ResponseWriter, r *http.Request) {
	// Authenticate the user and make sure they have write access to properties db
	// (i.e. Need to be either a lister or admin role, basically just not a regular user)
	userID, err := s.getAuthedUserId(r)
	if err != nil {
		respondWithError(w, 401, err)
		return
	}
	role, err := s.db.GetUserRole(userID)
	if err != nil {
		respondWithError(w, 401, err)
		return
	}
	if role == "regular" {
		respondWithError(w, 401, err)
		return
	}

	// Prepare reading body form by allocating max memory to read
	MAX_SIZE := 55 << 20 // 55 MiB
	r.Body = http.MaxBytesReader(w, r.Body, int64(MAX_SIZE))
	err = r.ParseMultipartForm(int64(MAX_SIZE + 512))
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	// Get details
	detailsRaw := r.FormValue("details")
	var propertyDetails database.PropertyDetails
	err = json.Unmarshal([]byte(detailsRaw), &propertyDetails)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	// Validate property details
	err = ValidatePropertyDetails(propertyDetails)
	if err != nil {
		respondWithError(w, 400, err)
		return
	}

	// Check that property address is not a duplicate of an existing one before creation
	err = s.db.CheckDuplicateProperty(propertyDetails)
	if err != nil {
		respondWithError(w, 400, err)
		return
	}

	// Get property images
	numberImagesRaw := r.FormValue("numImages") // should be at most 10, limited on expected frontend.
	numberImagesInt64, err := strconv.ParseInt(numberImagesRaw, 10, 16)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}
	numberImages := int16(numberImagesInt64)

	// Ensure that at least a single image is given for the property
	if numberImages == 0 {
		respondWithError(w, 400, errors.New("property must have at least one property"))
		return
	}

	var images []database.OrderedFileInternal
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
	err = s.db.CreateProperty(propertyDetails, images)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	// Respond with ok created
	w.WriteHeader(201)
}

// PUT /api/properties/{id}
// AUTHED
func (s *Server) apiUpdatePropertiesHandler(w http.ResponseWriter, r *http.Request) {
	// Authenticate the user and make sure they have write access to properties db
	// (i.e. Need to be either a lister or admin role, basically just not a regular user)
	userID, err := s.getAuthedUserId(r)
	if err != nil {
		respondWithError(w, 401, err)
		return
	}
	role, err := s.db.GetUserRole(userID)
	if err != nil {
		respondWithError(w, 401, err)
		return
	}
	if role == "regular" {
		respondWithError(w, 401, err)
		return
	}

	// Prepare reading body form by allocating max memory to read
	MAX_SIZE := 55 << 20 // 55 MiB
	r.Body = http.MaxBytesReader(w, r.Body, int64(MAX_SIZE))
	err = r.ParseMultipartForm(int64(MAX_SIZE + 512))
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	// Get details
	detailsRaw := r.FormValue("details")
	var propertyDetails database.PropertyDetails
	err = json.Unmarshal([]byte(detailsRaw), &propertyDetails)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	// Validate propertyId of URLParam matches propertyId of data in request body
	if propertyDetails.PropertyID != chi.URLParam(r, "id") {
		respondWithError(w, http.StatusBadRequest, errors.New("propertyId of URLParam does not match propertyId of data in request body"))
		return
	}

	// Validate property details
	err = ValidatePropertyDetails(propertyDetails)
	if err != nil {
		respondWithError(w, 400, err)
		return
	}

	// Get property images
	numberImagesRaw := r.FormValue("numImages") // should be at most 10, limited on expected frontend.
	numberImagesInt64, err := strconv.ParseInt(numberImagesRaw, 10, 16)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}
	numberImages := int16(numberImagesInt64)

	// Ensure that at least a single image is given for the property
	if numberImages == 0 {
		respondWithError(w, 400, errors.New("property must have at least one property"))
		return
	}

	var images []database.OrderedFileInternal
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
		respondWithError(w, 401, errors.New("you can only modify your own property as a lister"))
		return
	}

	// Update property details
	err = s.db.UpdatePropertyDetails(propertyDetails)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	// Update property images
	err = s.db.UpdatePropertyImages(propertyDetails.PropertyID, images)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	// Respond with ok
	w.WriteHeader(200)
}

// Endpoint: DELETE /api/properties/{id}
// AUTHED
func (s *Server) apiDeletePropertiesHandler(w http.ResponseWriter, r *http.Request) {
	// Authenticate user
	userID, err := s.getAuthedUserId(r)
	if err != nil {
		respondWithError(w, 401, err)
		return
	}

	// Get the property ID they want to delete from the URL param
	propertyID := chi.URLParam(r, "id")
	if len(propertyID) == 0 {
		respondWithError(w, 400, errors.New("no communityId given"))
		return
	}

	// Try to get the requested property
	propertyDetails, err := s.db.GetPropertyDetails(propertyID)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	// Ensure that the user owns the property OR
	// that the user is the admin
	if propertyDetails.ListerUserID != userID && userID != s.AdminUserID {
		respondWithError(w, 401, errors.New("account not authorized for this action"))
		return
	}

	// Delete the property
	err = s.db.DeleteProperty(propertyID)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	// Respond ok
	w.WriteHeader(200)
}

// Endpoint: GET /api/lister
// NO AUTH
func (s *Server) apiGetListerInfoHandler(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	listerID := query.Get("listerID")
	if listerID == "" {
		respondWithError(w, 422, errors.New("listerID empty"))
		return
	}

	// Check the role of the userid
	role, err := s.db.GetUserRole(listerID)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}
	if role != "lister" && role != "admin" {
		respondWithError(w, 500, errors.New("user is not a lister"))
		return
	}

	// userID is a lister, return the email and name for basic contact information
	lister, err := s.db.GetUserDetails(listerID)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}

	respondWithJSON(w, 200, struct {
		FirstName string `json:"firstName"`
		LastName  string `json:"lastName"`
		Email     string `json:"email"`
	}{
		FirstName: lister.FirstName,
		LastName:  lister.LastName,
		Email:     lister.Email,
	})
}
