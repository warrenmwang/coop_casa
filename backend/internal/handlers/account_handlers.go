package handlers

import (
	"backend/internal/app_middleware"
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

// GetAccountDetailsHandler handles requests for returning personal account data for the user themself requesting it.
// Returns the user data based on the userId in the auth token.
//
// AUTHED GET .../account
func (h *AccountHandler) GetAccountDetailsHandler(w http.ResponseWriter, r *http.Request) {
	// Get user id
	userId, ok := r.Context().Value(app_middleware.UserIDKey).(string)
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

// UpdateAccountDetailsHandler handles requests for updating a user's account's details.
//
// AUTHED POST .../account
func (h *AccountHandler) UpdateAccountDetailsHandler(w http.ResponseWriter, r *http.Request) {
	userIdFromToken, ok := r.Context().Value(app_middleware.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, errors.New("user id blank"))
		return
	}
	userEmailFromToken, ok := r.Context().Value(app_middleware.UserEmailKey).(string)
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

// DeleteAccountHandler handles requests to delete a user's own account.
// Note that the expected SQL database being used to store all user and app data is a well connected
// relational database and that all other user-specific data SHOULD be automatically dropped
// from their corresponding tables.
//
// AUTHED DELETE .../account
func (h *AccountHandler) DeleteAccountHandler(w http.ResponseWriter, r *http.Request) {
	// Delete a user account given their userId from the token

	// Get userId of current user
	userId, ok := r.Context().Value(app_middleware.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, errors.New("user id blank"))
		return
	}

	// Delete user account
	// Once user is deleted SQL db SHOULD cascade deleting ther user's
	// role, user_avatar, user_status, properties, communities, saved entities, and so on
	err := h.server.DB().DeleteUser(userId)
	if err != nil {
		utils.RespondWithError(w, http.StatusUnauthorized, err)
		return
	}

	// Invalidate their token
	auth.InvalidateToken(w, h.isProd)

	// Return response ok
	w.WriteHeader(200)
}

// GetAccountRoleHandler handles requests for users to retrieve their own account "role".
// Roles are a privilege level indicator for what they can do on the platform.
// By default all users are initialized with a "regular" role status. Certain users can be
// granted extra privileges to become a "lister" and be able to list properties on the app.
// There is one special account that is designated with the "admin" role that has full control
// over all user accounts.
//
// AUTHED GET .../account/role
func (h *AccountHandler) GetAccountRoleHandler(w http.ResponseWriter, r *http.Request) {
	// Get user id
	userId, ok := r.Context().Value(app_middleware.UserIDKey).(string)
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

// GetAccountOwnedCommunitiesHandler handles requests to return a user's communities that where they are the admin. 
// They may or may not be communities that the user themself created, but they are the communities that the user are the sole admin of.
// Communities returned on this endpoint include communities that were transferred to the user from another account.
//
// AUTHED GET .../account/communities
func (h *AccountHandler) GetAccountOwnedCommunitiesHandler(w http.ResponseWriter, r *http.Request) {
	// Get user id
	userId, ok := r.Context().Value(app_middleware.UserIDKey).(string)
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

// GetAccountOwnedPropertiesHandler handles requests to return a user's properties where they are the lister.
//
// AUTHED GET .../account/properties
// Lister is able to retrieve the properties that they are put on the site
func (h *AccountHandler) GetAccountOwnedPropertiesHandler(w http.ResponseWriter, r *http.Request) {
	// Get user id
	userID, ok := r.Context().Value(app_middleware.UserIDKey).(string)
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

// GetAccountProfileImagesHandler handles requests to return the user uploaded images of their account.
// 
// AUTHED GET .../account/images
func (h *AccountHandler) GetAccountProfileImagesHandler(w http.ResponseWriter, r *http.Request) {
	// Get user id
	userID, ok := r.Context().Value(app_middleware.UserIDKey).(string)
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

// UpdateAccountProfileImagesHandler handles requests to update a user's account's profile images.
// 
// AUTHED POST ../account/images
func (h *AccountHandler) UpdateAccountProfileImagesHandler(w http.ResponseWriter, r *http.Request) {
	// Get user id
	userID, ok := r.Context().Value(app_middleware.UserIDKey).(string)
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

// GetAccountSavedPropertiesHandler handles requests to return a user's liked properties.
//
// AUTHED GET .../account/saved/properties
func (h *AccountHandler) GetAccountSavedPropertiesHandler(w http.ResponseWriter, r *http.Request) {
	// Get user id
	userID, ok := r.Context().Value(app_middleware.UserIDKey).(string)
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

// CreateAccountSavedPropertyHandler handles a user's request to like a property.
// 
// AUTHED POST .../account/saved/properties
func (h *AccountHandler) CreateAccountSavedPropertyHandler(w http.ResponseWriter, r *http.Request) {
	// Get user id
	userID, ok := r.Context().Value(app_middleware.UserIDKey).(string)
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

// DeleteAccountSavedPropertyHandler handles requests to unlike a property from a user's account.
// 
// AUTHED DELETE .../account/saved/properties/{id}
func (h *AccountHandler) DeleteAccountSavedPropertyHandler(w http.ResponseWriter, r *http.Request) {
	// Get user id
	userID, ok := r.Context().Value(app_middleware.UserIDKey).(string)
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

// DeleteAccountSavedPropertiesHandler handles requests to delete ALL of the liked properties from a user's account.
// 
// AUTHED DELETE .../account/saved/properties
func (h *AccountHandler) DeleteAccountSavedPropertiesHandler(w http.ResponseWriter, r *http.Request) {
	// Get user id
	userID, ok := r.Context().Value(app_middleware.UserIDKey).(string)
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

// GetAccountSavedCommunitiesHandler handles requests to get all of a user's like communities.
// 
// AUTHED GET .../account/saved/communities
func (h *AccountHandler) GetAccountSavedCommunitiesHandler(w http.ResponseWriter, r *http.Request) {
	// Get user id
	userID, ok := r.Context().Value(app_middleware.UserIDKey).(string)
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

// CreateAccountSavedCommunityHandler handles requests to like a community for a user account.
//
// AUTHED POST .../account/saved/communities
func (h *AccountHandler) CreateAccountSavedCommunityHandler(w http.ResponseWriter, r *http.Request) {
	// Get user id
	userID, ok := r.Context().Value(app_middleware.UserIDKey).(string)
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

// DeleteAccountSavedCommunityHandler handles requests to unlike a community from a user account.
// 
// AUTHED DELETE .../account/saved/communities/{id}
func (h *AccountHandler) DeleteAccountSavedCommunityHandler(w http.ResponseWriter, r *http.Request) {
	// Get user id
	userID, ok := r.Context().Value(app_middleware.UserIDKey).(string)
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

// DeleteAccountSavedCommunitiesHandler handles requests to unlike ALL of the liked communities of a user's account.
// 
// AUTHED DELETE .../account/saved/communities
func (h *AccountHandler) DeleteAccountSavedCommunitiesHandler(w http.ResponseWriter, r *http.Request) {
	// Get user id
	userID, ok := r.Context().Value(app_middleware.UserIDKey).(string)
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

// GetAccountSavedUsersHandler handles requests to retrieve all of the liked users from a user's account.
// 
// AUTHED GET ../account/saved/users
func (h *AccountHandler) GetAccountSavedUsersHandler(w http.ResponseWriter, r *http.Request) {
	// Get user id
	userId, ok := r.Context().Value(app_middleware.UserIDKey).(string)
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

// CreateAccountSavedUserHandler handles requests to like a user for a user account.
// 
// AUTHED POST .../account/saved/users
func (h *AccountHandler) CreateAccountSavedUserHandler(w http.ResponseWriter, r *http.Request) {
	// Get user id
	userId, ok := r.Context().Value(app_middleware.UserIDKey).(string)
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

// DeleteAccountSavedUserHandler handles requests to unlike a user for a user account.
// 
// AUTHED DELETE .../account/saved/users/{id}
func (h *AccountHandler) DeleteAccountSavedUserHandler(w http.ResponseWriter, r *http.Request) {
	// Get user id
	userId, ok := r.Context().Value(app_middleware.UserIDKey).(string)
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

// DeleteAccountSavedUsersHandler handles requests to unlike ALL users from a user's account of liked users.
// 
// AUTHED DELETE .../account/saved/users
func (h *AccountHandler) DeleteAccountSavedUsersHandler(w http.ResponseWriter, r *http.Request) {
	// Get user id
	userId, ok := r.Context().Value(app_middleware.UserIDKey).(string)
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

// GetAccountStatusHandler handles requests to get the account's status.
// The account status denotes whether the account is visible to other users publicly.
// 
// AUTHED GET .../account/status
func (h *AccountHandler) GetAccountStatusHandler(w http.ResponseWriter, r *http.Request) {
	// Get user id from authed context
	authedUserId, ok := r.Context().Value(app_middleware.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, errors.New("userId blank"))
		return
	}

	// Get user's account status and reply with it
	userStatus, err := h.server.DB().GetUserStatus(authedUserId)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}
	utils.RespondWithJSON(w, http.StatusOK, userStatus)
}

// UpdateAccountStatusHandler handles requests for users to update their own account status.
// Endpoint is for the account to be updated by the user themself
// 
// AUTHED PUT .../account/status
func (h *AccountHandler) UpdateAccountStatusHandler(w http.ResponseWriter, r *http.Request) {
	// Get authed user id
	authedUserId, ok := r.Context().Value(app_middleware.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, errors.New("authenticated but unknown userId"))
		return
	}

	// User cannot update their status if the admin has flagged their account.
	currUserStatus, err := h.server.DB().GetUserStatus(authedUserId)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}
	if currUserStatus.UserStatus.Status == config.USER_STATUS_FLAGGED {
		utils.RespondWithError(w, http.StatusUnauthorized, errors.New("your account has been flagged and you cannot update your status until you fix the problems with your account mentioned in the status comment provided by the admin. contact admin if you have any questions."))
		return
	}

	// Get status from body JSON
	var statusStruct struct {
		Status string `json:"status"`
	}
	body, err := io.ReadAll(r.Body)
	if err != nil {
		log.Println("error in io readall")
		utils.RespondWithError(w, http.StatusBadRequest, err)
		return
	}
	err = json.Unmarshal(body, &statusStruct)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}
	status := statusStruct.Status

	// Validate status
	if _, exists := config.USER_STATUS_OPTIONS[status]; !exists {
		utils.RespondWithError(w, http.StatusBadRequest, fmt.Errorf("status %s is not a valid status", status))
		return
	}

	// Assert that user cannot flag their own account.
	// User can only set their account status to normal or private.
	if status == config.USER_STATUS_FLAGGED {
		utils.RespondWithError(w, http.StatusBadRequest, errors.New("you cannot flag your own account status"))
		return
	}

	// Insert accepted values, ignoring other fields which we expect to fill ourselves, into db
	err = h.server.DB().UpdateUserStatus(authedUserId, authedUserId, status, "")
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Reply ok
	w.WriteHeader(http.StatusOK)
}
