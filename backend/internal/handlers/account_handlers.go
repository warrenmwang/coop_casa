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
	"log"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

type AccountHandler struct {
	server interfaces.Server
	isProd bool
}

func NewAccountHandlers(s interfaces.Server) *AccountHandler {
	return &AccountHandler{server: s, isProd: config.GlobalConfig.IS_PROD}
}

// GET .../account
// AUTHED
// Returns the user data based on the userId in the auth token
func (h *AccountHandler) GetAccountDetailsHandler(w http.ResponseWriter, r *http.Request) {
	// Get user id
	userId, ok := r.Context().Value(auth.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, errors.New("unable to parse yolur userId"))
		return
	}

	// Get user details
	userDetails, err := h.server.DB().GetUserDetails(userId)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Get user avatar image
	userAvatar, err := h.server.DB().GetUserAvatar(userId)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Make interests an empty list if nil
	if userDetails.Interests == nil {
		userDetails.Interests = []string{}
	}

	// // Get user liked communities, properties, and users
	// likedCommunityIDs, err := h.server.DB().GetUserSavedCommunities(userId)
	// if err != nil {
	// 	utils.RespondWithError(w, http.StatusInternalServerError, err)
	// 	return
	// }

	// likedPropertyIDs, err := h.server.DB().GetUserSavedCommunities(userId)
	// if err != nil {
	// 	utils.RespondWithError(w, http.StatusInternalServerError, err)
	// 	return
	// }

	// likedUserIDs, err := h.server.DB().GetUserSavedUsers(userId)
	// if err != nil {
	// 	utils.RespondWithError(w, http.StatusInternalServerError, err)
	// 	return
	// }

	// Return as JSON data, need to convert userAvatar to base64 str
	userAvatarDataB64 := base64.StdEncoding.EncodeToString(userAvatar.Data)

	userAvatarFileExternal := database.FileExternal{
		Filename: userAvatar.Filename,
		Mimetype: userAvatar.Mimetype,
		Size:     userAvatar.Size,
		Data:     userAvatarDataB64,
	}

	utils.RespondWithJSON(w, http.StatusOK, database.User{
		UserDetails: userDetails,
		UserAvatar:  userAvatarFileExternal,
	})
}

// POST .../account
// AUTHED
func (h *AccountHandler) UpdateAccountDetailsHandler(w http.ResponseWriter, r *http.Request) {
	userIdFromToken, ok := r.Context().Value(auth.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, errors.New("user id blank"))
		return
	}
	userEmailFromToken, ok := r.Context().Value(auth.UserEmailKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, errors.New("user email blank"))
		return
	}

	// limit body size that we will parse
	MAX_SIZE := 32 << 20 // 32 MiB
	r.Body = http.MaxBytesReader(w, r.Body, int64(MAX_SIZE))

	err := r.ParseMultipartForm(int64(MAX_SIZE + 512))
	if err != nil {
		log.Printf("parsing multipart form data: %v", err)
		http.Error(w, "unable to parse multipart form", http.StatusInternalServerError)
		return
	}

	// Update the user account with the given details
	userDetailsFormData := r.FormValue("user")

	var userDetails database.UserDetails
	err = json.Unmarshal([]byte(userDetailsFormData), &userDetails)
	if err != nil {
		log.Printf("unmarshaling json: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Ensure that the given user id is the same as the
	// id in the token
	if userIdFromToken != userDetails.UserID {
		utils.RespondWithError(w, http.StatusBadRequest, errors.New("verified user id does not match user id in form (cannot change user id)"))
		return
	}

	// Prevent user from changing their email
	// Ensure that the userDetails email is the same as the email in the token
	if userEmailFromToken != userDetails.Email {
		utils.RespondWithError(w, http.StatusUnauthorized, errors.New("cannot change email tied to google account"))
		return
	}

	// Validate the details
	err = validation.ValidateUserDetails(userDetails)
	if err != nil {
		utils.RespondWithError(w, http.StatusNotAcceptable, err)
		return
	}

	// Get avatar
	avatarFileData, avatarFileHeader, err := r.FormFile("avatar")
	if err != nil && err != http.ErrMissingFile {
		http.Error(w, "unable to get user avatar image", http.StatusBadRequest)
		return
	}

	var avatarFile database.FileInternal
	if avatarFileData != nil {
		defer avatarFileData.Close()

		avatarBytes, err := io.ReadAll(avatarFileData)
		if err != nil {
			http.Error(w, "unable to read file", http.StatusInternalServerError)
			return
		}
		avatarFile = database.FileInternal{
			Filename: avatarFileHeader.Filename,
			Mimetype: avatarFileHeader.Header.Get("Content-Type"),
			Size:     avatarFileHeader.Size,
			Data:     avatarBytes,
		}
	}

	// Update the user in the DB with the new info (with avatar)
	err = h.server.DB().UpdateUser(userDetails, avatarFile)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Account setup complete, respond with ok
	w.WriteHeader(200)
}

// DELETE .../account
// AUTHED
func (h *AccountHandler) DeleteAccountHandler(w http.ResponseWriter, r *http.Request) {
	// Delete a user account given their userId from the token

	// Get userId of current user
	userId, ok := r.Context().Value(auth.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, errors.New("user id blank"))
		return
	}

	// Delete user account (details, role, avatar)
	err := h.server.DB().DeleteUser(userId)
	if err != nil {
		utils.RespondWithError(w, http.StatusUnauthorized, err)
		return
	}

	// Delete all the properties that are listed by this user
	err = h.server.DB().DeleteUserOwnedProperties(userId)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Delete all communities owned by this user
	// If this is not desired behavior, it is the frontend's job to warn the user
	// that all their properties and communities will be deleted. Therefore, they
	// should transfer ownership of their properties/communities before deleting their
	// acount.
	err = h.server.DB().DeleteUserOwnedCommunities(userId)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Invalidate their token
	auth.InvalidateToken(w, h.isProd)

	// Return response ok
	w.WriteHeader(200)
}

// GET .../account/role
// AUTHED
func (h *AccountHandler) GetUserRoleHandler(w http.ResponseWriter, r *http.Request) {
	// Get user id
	userId, ok := r.Context().Value(auth.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, errors.New("user id blank"))
		return
	}

	// Get the user's role from the db
	role, err := h.server.DB().GetUserRole(userId)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Return the user's role
	utils.RespondWithJSON(w, http.StatusOK, struct {
		Role string `json:"role"`
	}{
		Role: role,
	})
}

// GET .../account/communities
// AUTHED
func (h *AccountHandler) GetUserOwnedCommunities(w http.ResponseWriter, r *http.Request) {
	// Get user id
	userId, ok := r.Context().Value(auth.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, errors.New("user id blank"))
		return
	}

	// Retrieve saved communities of authed user
	communityIds, err := h.server.DB().GetUserOwnedCommunities(userId)
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

// GET .../account/properties
// AUTHED
// Lister is able to retrieve the properties that they are put on the site
func (h *AccountHandler) GetUserOwnedProperties(w http.ResponseWriter, r *http.Request) {
	// Get user id
	userID, ok := r.Context().Value(auth.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, errors.New("user id blank"))
		return
	}
	// Fetch properties owned by user
	propertyIDs, err := h.server.DB().GetListerOwnedProperties(userID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}
	// Do not return null!
	if propertyIDs == nil {
		propertyIDs = []string{}
	}

	// Return the propertyIDs
	utils.RespondWithJSON(w, http.StatusOK, struct {
		PropertyIDs []string `json:"propertyIDs"`
	}{
		PropertyIDs: propertyIDs,
	})
}

// GET .../account/images
// AUTHED
func (h *AccountHandler) GetUserProfileImages(w http.ResponseWriter, r *http.Request) {
	// Get user id
	userID, ok := r.Context().Value(auth.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, errors.New("user id blank"))
		return
	}

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

// POST ../account/images
// AUTHED
func (h *AccountHandler) UpdateUserProfileImages(w http.ResponseWriter, r *http.Request) {
	// Get user id
	userID, ok := r.Context().Value(auth.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, errors.New("user id blank"))
		return
	}

	// Prepare reading body form by allocating max memory to read
	MAX_SIZE := 55 << 20 // 55 MiB
	r.Body = http.MaxBytesReader(w, r.Body, int64(MAX_SIZE))
	err := r.ParseMultipartForm(int64(MAX_SIZE + 512))
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Get images from form
	numberImagesRaw := r.FormValue("numImages") // should be at most 10, limited on expected frontend.
	numberImagesInt64, err := strconv.ParseInt(numberImagesRaw, 10, 16)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}
	numberImages := int16(numberImagesInt64)

	// Get images from form
	var images []database.FileInternal
	for i := range numberImages {
		imageDataRaw, imageFileHeader, err := r.FormFile(fmt.Sprintf("image%d", i))
		if err != nil {
			utils.RespondWithError(w, http.StatusInternalServerError, err)
			return
		}
		var imageData []byte
		// Check if image data is empty
		if imageDataRaw == nil {
			utils.RespondWithError(w, http.StatusInternalServerError, errors.New("image data is empty"))
			return
		}

		// Otherwise, read image data
		defer imageDataRaw.Close()
		imageData, err = io.ReadAll(imageDataRaw)
		if err != nil {
			utils.RespondWithError(w, http.StatusInternalServerError, err)
			return
		}

		images = append(images, database.FileInternal{
			Filename: imageFileHeader.Filename,
			Mimetype: imageFileHeader.Header.Get("Content-Type"),
			Size:     imageFileHeader.Size,
			Data:     imageData,
		})
	}

	// Before delete, save current user profile images in case of
	// erro when inserting new images
	oldUserProfileImages, err := h.server.DB().GetUserProfileImages(userID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Delete current user profile images from db
	err = h.server.DB().DeleteUserProfileImages(userID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Insert new images into db
	err = h.server.DB().CreateUserProfileImages(userID, images)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, errors.New("error inserting new images, reverting to old images"))

		// Revert to old images
		err = h.server.DB().CreateUserProfileImages(userID, oldUserProfileImages)
		if err != nil {
			utils.RespondWithError(w, http.StatusInternalServerError, errors.New("error reverting to old images"))
		}

		return
	}

	// Respond with ok
	w.WriteHeader(http.StatusOK)
}

// User saved entities

// GET .../account/saved/properties
// AUTHED
func (h *AccountHandler) GetUserSavedProperties(w http.ResponseWriter, r *http.Request) {
	// Get user id
	userID, ok := r.Context().Value(auth.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, errors.New("user id blank"))
		return
	}

	// Get user saved properties
	propertyIds, err := h.server.DB().GetUserSavedProperties(userID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, struct {
		PropertyIDs []string `json:"propertyIDs"`
	}{
		PropertyIDs: propertyIds,
	})
}

// POST .../account/saved/properties
// AUTHED
func (h *AccountHandler) CreateUserSavedProperty(w http.ResponseWriter, r *http.Request) {
	// Get user id
	userID, ok := r.Context().Value(auth.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, errors.New("user id blank"))
		return
	}

	// Retrieve property id from form
	propertyID := r.FormValue("propertyID")
	if propertyID == "" {
		utils.RespondWithError(w, http.StatusBadRequest, errors.New("property id blank"))
		return
	}

	// Save property id to user saved properties
	err := h.server.DB().CreateUserSavedProperty(userID, propertyID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Respond with created
	w.WriteHeader(http.StatusCreated)
}

// DELETE .../account/saved/properties/{id}
// AUTHED
func (h *AccountHandler) DeleteUserSavedProperty(w http.ResponseWriter, r *http.Request) {
	// Get user id
	userID, ok := r.Context().Value(auth.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, errors.New("user id blank"))
		return
	}

	// Retrieve property id url param
	propertyID := chi.URLParam(r, "id")
	if propertyID == "" {
		utils.RespondWithError(w, http.StatusBadRequest, errors.New("property id blank"))
		return
	}

	// Delete property id from user saved properties
	err := h.server.DB().DeleteUserSavedProperty(userID, propertyID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Respond with ok
	w.WriteHeader(http.StatusOK)
}

// DELETE .../account/saved/properties
// AUTHED
func (h *AccountHandler) DeleteUserSavedProperties(w http.ResponseWriter, r *http.Request) {
	// Get user id
	userID, ok := r.Context().Value(auth.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, errors.New("user id blank"))
		return
	}

	// Delete all user saved properties
	err := h.server.DB().DeleteUserSavedProperties(userID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Respond with ok
	w.WriteHeader(http.StatusOK)
}

// GET .../account/saved/communities
// AUTHED
func (h *AccountHandler) GetUserSavedCommunities(w http.ResponseWriter, r *http.Request) {
	// Get user id
	userID, ok := r.Context().Value(auth.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, errors.New("user id blank"))
		return
	}

	// Retrieve the users saved communities
	communityIds, err := h.server.DB().GetUserSavedCommunities(userID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, struct {
		CommunityIDs []string `json:"communityIDs"`
	}{
		CommunityIDs: communityIds,
	})
}

// POST .../account/saved/communities
// AUTHED
func (h *AccountHandler) CreateUserSavedCommunity(w http.ResponseWriter, r *http.Request) {
	// Get user id
	userID, ok := r.Context().Value(auth.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, errors.New("user id blank"))
		return
	}

	// Get community id from form
	communityID := r.FormValue("communityID")
	if communityID == "" {
		utils.RespondWithError(w, http.StatusBadRequest, errors.New("community id blank"))
		return
	}

	// Save community id to user saved communities
	err := h.server.DB().CreateUserSavedCommunity(userID, communityID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Respond with created
	w.WriteHeader(http.StatusCreated)
}

// DELETE .../account/saved/communities/{id}
// AUTHED
func (h *AccountHandler) DeleteUserSavedCommunity(w http.ResponseWriter, r *http.Request) {
	// Get user id
	userID, ok := r.Context().Value(auth.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, errors.New("user id blank"))
		return
	}

	// Get community id from url param
	communityID := chi.URLParam(r, "id")
	if communityID == "" {
		utils.RespondWithError(w, http.StatusBadRequest, errors.New("community id blank"))
		return
	}

	// Delete community id from user saved communities
	err := h.server.DB().DeleteUserSavedCommunity(userID, communityID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Respond with ok
	w.WriteHeader(http.StatusOK)
}

// DELETE .../account/saved/communities
// AUTHED
func (h *AccountHandler) DeleteUserSavedCommunities(w http.ResponseWriter, r *http.Request) {
	// Get user id
	userID, ok := r.Context().Value(auth.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, errors.New("user id blank"))
		return
	}

	// Delete all user saved communities
	err := h.server.DB().DeleteUserSavedCommunities(userID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Respond with ok
	w.WriteHeader(http.StatusOK)
}

// GET ../account/saved/users
// AUTHED
func (h *AccountHandler) GetUserSavedUsers(w http.ResponseWriter, r *http.Request) {
	// Get user id
	userId, ok := r.Context().Value(auth.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, errors.New("userId blank"))
		return
	}

	// Get user saved users
	userIds, err := h.server.DB().GetUserSavedUsers(userId)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, struct {
		UserIDs []string `json:"userIDs"`
	}{
		UserIDs: userIds,
	})
}

// POST .../account/saved/users
// AUTHED
func (h *AccountHandler) CreateUserSavedUser(w http.ResponseWriter, r *http.Request) {
	// Get user id
	userId, ok := r.Context().Value(auth.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, errors.New("userId blank"))
		return
	}

	// Retrieve user id from form
	userIdToSave := r.FormValue("userID")
	if userIdToSave == "" {
		utils.RespondWithError(w, http.StatusBadRequest, errors.New("userID blank"))
		return
	}

	// Save user id to user saved users
	err := h.server.DB().CreateUserSavedUser(userId, userIdToSave)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Respond with created
	w.WriteHeader(http.StatusCreated)
}

// DELETE .../account/saved/users/{id}
// AUTHED
func (h *AccountHandler) DeleteUserSavedUser(w http.ResponseWriter, r *http.Request) {
	// Get user id
	userId, ok := r.Context().Value(auth.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, errors.New("userId blank"))
		return
	}

	// Retrieve user id from url param
	userIdToDelete := chi.URLParam(r, "id")
	if userIdToDelete == "" {
		utils.RespondWithError(w, http.StatusBadRequest, errors.New("userID blank"))
		return
	}

	// Delete user id from user saved users
	err := h.server.DB().DeleteUserSavedUser(userId, userIdToDelete)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Respond with ok
	w.WriteHeader(http.StatusOK)
}

// DELETE .../account/saved/users
// AUTHED
func (h *AccountHandler) DeleteUserSavedUsers(w http.ResponseWriter, r *http.Request) {
	// Get user id
	userId, ok := r.Context().Value(auth.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, errors.New("userId blank"))
		return
	}

	// Delete all user saved users
	err := h.server.DB().DeleteUserSavedUsers(userId)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Respond with ok
	w.WriteHeader(http.StatusOK)
}
