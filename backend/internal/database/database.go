package database

/*
	Encryption and Decryption of user data happens only in the database module.
	Usage of NullStrings is useful to differentiate between empty values and actual null values in the db.
	Therefore, we should check a value to see if it is Null or not before attempting encryption/decyption
	to save time.
*/

import (
	"backend/internal/config"
	"backend/internal/database/sqlc"
	"backend/internal/utils"
	"context"
	"database/sql"
	"encoding/base64"
	"errors"
	"fmt"
	"log"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
	_ "github.com/joho/godotenv/autoload"
)

type service struct {
	db             *sql.DB
	db_queries     *sqlc.Queries
	db_encrypt_key string
}

type Service interface {
	// General
	Health() map[string]string

	// Admin functions
	AdminGetUsers(limit, offset int32) ([]UserDetails, error)
	AdminGetUsersRoles(userIds []string) ([]string, error)

	// Users Account
	CreateUser(userId, email string) error
	GetUserDetails(userId string) (UserDetails, error)
	UpdateUser(updatedUserData UserDetails, avatarImage FileInternal) error
	DeleteUser(userId string) error
	GetUserAvatar(userId string) (FileInternal, error)

	// Users Account Profile Images
	CreateUserProfileImages(userID string, images []FileInternal) error
	GetUserProfileImages(userID string) ([]FileInternal, error)
	DeleteUserProfileImages(userID string) error

	// Users Saved Entities
	GetUserSavedProperties(userID string) ([]string, error)
	GetUserSavedCommunities(userID string) ([]string, error)
	GetUserSavedUsers(userID string) ([]string, error)
	CreateUserSavedProperty(userID, propertyID string) error
	CreateUserSavedCommunity(userID, communityID string) error
	CreateUserSavedUser(userID, savedUserID string) error
	DeleteUserSavedProperty(userID, propertyID string) error
	DeleteUserSavedCommunity(userID, communityID string) error
	DeleteUserSavedUser(userID, savedUserID string) error
	DeleteUserSavedProperties(userID string) error
	DeleteUserSavedCommunities(userID string) error
	DeleteUserSavedUsers(userID string) error

	// Roles
	CreateNewUserRole(userId, role string) error
	GetUserRole(userId string) (string, error)
	UpdateUserRole(userId, role string) error
	DeleteUserRole(userId string) error

	// Properties
	CreateProperty(propertyDetails PropertyDetails, images []OrderedFileInternal) error
	GetPropertyDetails(propertyId string) (PropertyDetails, error)
	GetPropertyImages(propertyId string) ([]OrderedFileInternal, error)
	GetNextPageProperties(limit, offset int32, addressFilter string) ([]string, error)
	GetTotalCountProperties() (int64, error)
	GetListerOwnedProperties(userID string) ([]string, error)
	CheckDuplicateProperty(propertyDetails PropertyDetails) error
	UpdatePropertyDetails(details PropertyDetails) error
	UpdatePropertyImages(propertyID string, images []OrderedFileInternal) error
	DeleteProperty(propertyId string) error
	DeletePropertyImage(propertyId string, imageOrderNum int16) error
	DeleteUserOwnedProperties(userID string) error

	// Communities
	CreateCommunity(details CommunityDetails, images []FileInternal) error
	CreateCommunityUser(communityId, userId string) error
	CreateCommunityProperty(communityId, propertyId string) error
	GetCommunityDetails(communityId string) (CommunityDetails, error)
	GetCommunityImages(communityId string) ([]FileInternal, error)
	GetCommunityUsers(communityId string) ([]string, error)
	GetCommunityProperties(communityId string) ([]string, error)
	GetNextPageCommunities(limit, offset int32, filterName, filterDescription string) ([]string, error)
	GetUserOwnedCommunities(userId string) ([]string, error)
	UpdateCommunityDetails(details CommunityDetails) error
	UpdateCommunityImages(communityId string, images []FileInternal) error
	UpdateCommunityUsers(communityID string, userIDs []string) error
	UpdateCommunityProperties(communityID string, propertyIDs []string) error
	DeleteCommunity(communityId string) error
	DeleteCommunityUser(communityId, userId string) error
	DeleteCommunityProperty(communityId, propertyId string) error
	DeleteUserOwnedCommunities(userID string) error

	// Public User Discovery API
	GetNextPagePublicUserIDs(limit, offset int32) ([]string, error)
	GetNextPagePublicUserIDsFilterByName(limit, offset int32, firstName, lastName string) ([]string, error)
	GetPublicUserProfile(userID string) (PublicUserProfile, error)
}

// Test database connection
func (s *service) Health() map[string]string {
	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
	defer cancel()

	err := s.db.PingContext(ctx)
	if err != nil {
		log.Fatalf(fmt.Sprintf("db down: %v", err))
	}

	return map[string]string{
		"message": "It's healthy",
	}
}

// -------------- ADMIN FUNCTIONS ------------------
// Admin functions
func (s *service) AdminGetUsers(limit, offset int32) ([]UserDetails, error) {
	ctx := context.Background()

	// Get users using the limit and offset provided
	usersEncrypted, err := s.db_queries.AdminGetUsers(ctx, sqlc.AdminGetUsersParams{
		Limit:  limit,
		Offset: offset,
	})
	if err != nil {
		return []UserDetails{}, err
	}

	// Decrypt user data
	var decryptedUsers []UserDetails
	for _, userEncrypted := range usersEncrypted {
		userId, err := utils.DecryptString(userEncrypted.UserID, s.db_encrypt_key)
		if err != nil {
			return []UserDetails{}, err
		}

		email, err := utils.DecryptString(userEncrypted.Email, s.db_encrypt_key)
		if err != nil {
			return []UserDetails{}, err
		}

		firstName, err := utils.DecryptString(userEncrypted.FirstName.String, s.db_encrypt_key)
		if err != nil {
			return []UserDetails{}, err
		}

		lastName, err := utils.DecryptString(userEncrypted.LastName.String, s.db_encrypt_key)
		if err != nil {
			return []UserDetails{}, err
		}

		birthDate, err := utils.DecryptString(userEncrypted.BirthDate.String, s.db_encrypt_key)
		if err != nil {
			return []UserDetails{}, err
		}

		gender, err := utils.DecryptString(userEncrypted.Gender.String, s.db_encrypt_key)
		if err != nil {
			return []UserDetails{}, err
		}

		location, err := utils.DecryptString(userEncrypted.Location.String, s.db_encrypt_key)
		if err != nil {
			return []UserDetails{}, err
		}

		var interestsDecrypted []string
		for _, encryptedInterest := range userEncrypted.Interests {
			decryptedInterest, err := utils.DecryptString(encryptedInterest, s.db_encrypt_key)
			if err != nil {
				return []UserDetails{}, err
			}
			interestsDecrypted = append(interestsDecrypted, decryptedInterest)
		}

		decryptedUsers = append(decryptedUsers, UserDetails{
			UserID:    userId,
			Email:     email,
			FirstName: firstName,
			LastName:  lastName,
			BirthDate: birthDate,
			Gender:    gender,
			Location:  location,
			Interests: interestsDecrypted,
		})
	}

	return decryptedUsers, nil
}

// -------------- USERS ACCOUNT ------------------

func (s *service) CreateUser(userId, email string) error {
	ctx := context.Background()

	// Encrypt user data
	userIDEncrypted, err := utils.EncryptString(userId, s.db_encrypt_key)
	if err != nil {
		return err
	}
	email_encrypted, err := utils.EncryptString(email, s.db_encrypt_key)
	if err != nil {
		return err
	}

	// Create a User in the db
	err = s.db_queries.CreateBareUser(ctx, sqlc.CreateBareUserParams{
		UserID: userIDEncrypted,
		Email:  email_encrypted,
	})
	if err != nil {
		return err
	}

	// Create the avatar
	err = s.db_queries.CreateBareUserAvatar(ctx, userIDEncrypted)
	if err != nil {
		return err
	}

	return nil
}

func (s *service) GetUserDetails(userId string) (UserDetails, error) {
	ctx := context.Background()

	// Need to use the encrypted userId to search
	userIDEncrypted, err := utils.EncryptString(userId, s.db_encrypt_key)
	if err != nil {
		return UserDetails{}, err
	}

	userEncrypted, err := s.db_queries.GetUserDetails(ctx, userIDEncrypted)
	if err != nil {
		return UserDetails{}, err
	}

	// Decrypt user data
	emailDecrypted, err := utils.DecryptString(userEncrypted.Email, s.db_encrypt_key)
	if err != nil {
		return UserDetails{}, err
	}

	firstNameDecrypted, err := utils.DecryptString(userEncrypted.FirstName.String, s.db_encrypt_key)
	if err != nil {
		return UserDetails{}, err
	}

	lastNameDecrypted, err := utils.DecryptString(userEncrypted.LastName.String, s.db_encrypt_key)
	if err != nil {
		return UserDetails{}, err
	}

	birthDateDecrypted, err := utils.DecryptString(userEncrypted.BirthDate.String, s.db_encrypt_key)
	if err != nil {
		return UserDetails{}, err
	}

	genderDecrypted, err := utils.DecryptString(userEncrypted.Gender.String, s.db_encrypt_key)
	if err != nil {
		return UserDetails{}, err
	}

	locationDecrypted, err := utils.DecryptString(userEncrypted.Location.String, s.db_encrypt_key)
	if err != nil {
		return UserDetails{}, err
	}

	var interestsDecrypted []string
	for _, interest := range userEncrypted.Interests {
		decryptedInterest, err := utils.DecryptString(interest, s.db_encrypt_key)
		if err != nil {
			return UserDetails{}, err
		}
		interestsDecrypted = append(interestsDecrypted, decryptedInterest)
	}

	return UserDetails{
		UserID:    userId,
		Email:     emailDecrypted,
		FirstName: firstNameDecrypted,
		LastName:  lastNameDecrypted,
		BirthDate: birthDateDecrypted,
		Gender:    genderDecrypted,
		Location:  locationDecrypted,
		Interests: interestsDecrypted,
	}, nil
}

func (s *service) GetUserAvatar(userId string) (FileInternal, error) {
	ctx := context.Background()

	// Encrypt userId
	userIdEncrypted, err := utils.EncryptString(userId, s.db_encrypt_key)
	if err != nil {
		return FileInternal{}, err
	}

	// Get encrypted avatar image by searching with the encrypted user id
	avatarEncrypted, err := s.db_queries.GetUserAvatar(ctx, userIdEncrypted)
	if err != nil {
		return FileInternal{}, err
	}

	// Decrypt filename and data
	avatarFileNameDecrypted, err := utils.DecryptString(avatarEncrypted.FileName.String, s.db_encrypt_key)
	if err != nil {
		return FileInternal{}, err
	}
	avatarDataDecrypted, err := utils.DecryptBytes(avatarEncrypted.Data, s.db_encrypt_key)
	if err != nil {
		return FileInternal{}, err
	}

	// Return decrypted user's avatar image (base64 encoded string)
	return FileInternal{
		Filename: avatarFileNameDecrypted,
		Mimetype: avatarEncrypted.MimeType.String,
		Size:     avatarEncrypted.Size.Int64,
		Data:     avatarDataDecrypted,
	}, nil
}

func (s *service) UpdateUser(updatedUserData UserDetails, avatarImage FileInternal) error {
	ctx := context.Background()

	// Encrypt all user information
	userIDEncrypted, err := utils.EncryptString(updatedUserData.UserID, s.db_encrypt_key)
	if err != nil {
		return err
	}

	first_name_encrypted, err := utils.EncryptString(updatedUserData.FirstName, s.db_encrypt_key)
	if err != nil {
		return err
	}

	last_name_encrypted, err := utils.EncryptString(updatedUserData.LastName, s.db_encrypt_key)
	if err != nil {
		return err
	}

	birth_date_encrypted, err := utils.EncryptString(updatedUserData.BirthDate, s.db_encrypt_key)
	if err != nil {
		return err
	}

	gender_encrypted, err := utils.EncryptString(updatedUserData.Gender, s.db_encrypt_key)
	if err != nil {
		return err
	}

	location_encrypted, err := utils.EncryptString(updatedUserData.Location, s.db_encrypt_key)
	if err != nil {
		return err
	}

	var interestsEncrypted []string
	for _, interest := range updatedUserData.Interests {
		encryptedInterest, err := utils.EncryptString(interest, s.db_encrypt_key)
		if err != nil {
			return err
		}
		interestsEncrypted = append(interestsEncrypted, encryptedInterest)
	}

	// Encrypt filename and data
	avatarFilenameEncrypted, err := utils.EncryptString(avatarImage.Filename, s.db_encrypt_key)
	if err != nil {
		return err
	}

	avatarDataEncrypted, err := utils.EncryptBytes(avatarImage.Data, s.db_encrypt_key)
	if err != nil {
		return err
	}

	// Store encrypted user data in db
	// Small information
	err = s.db_queries.UpdateUserDetails(ctx, sqlc.UpdateUserDetailsParams{
		UserID:    userIDEncrypted, // Need the encrypted userId to search for the right row to update in db.
		FirstName: sql.NullString{String: first_name_encrypted, Valid: true},
		LastName:  sql.NullString{String: last_name_encrypted, Valid: true},
		BirthDate: sql.NullString{String: birth_date_encrypted, Valid: true},
		Gender:    sql.NullString{String: gender_encrypted, Valid: true},
		Location:  sql.NullString{String: location_encrypted, Valid: true},
		Interests: interestsEncrypted,
	})
	if err != nil {
		return err
	}

	// User avatar (user's first image)
	err = s.db_queries.UpdateUserAvatar(ctx, sqlc.UpdateUserAvatarParams{
		UserID: userIDEncrypted,
		FileName: sql.NullString{
			String: avatarFilenameEncrypted,
			Valid:  true,
		},
		MimeType: sql.NullString{
			String: avatarImage.Mimetype,
			Valid:  true,
		},
		Size: sql.NullInt64{
			Int64: avatarImage.Size,
			Valid: true,
		},
		Data: avatarDataEncrypted,
	})
	if err != nil {
		return err
	}

	return nil
}

// Attempt to delete user identified by their userId
func (s *service) DeleteUser(userId string) error {
	ctx := context.Background()

	// Encrypt user id
	userIDEncrypted, err := utils.EncryptString(userId, s.db_encrypt_key)
	if err != nil {
		return err
	}

	// Delete the user with the matching encrypyted id
	err = s.db_queries.DeleteUserDetails(ctx, userIDEncrypted)
	return err
}

// User Profile information
func (s *service) CreateUserProfileImages(userID string, images []FileInternal) error {
	ctx := context.Background()

	// Encrypt all of the user information and their images
	encryptedUserID, err := utils.EncryptString(userID, s.db_encrypt_key)
	if err != nil {
		return errors.New("couldn't encrypt userID for image")
	}

	for i, image := range images {
		// Encrypt what we can for the image
		encryptedFilename, err := utils.EncryptString(image.Filename, s.db_encrypt_key)
		if err != nil {
			return fmt.Errorf("couldn't encrypt filename for image %d", i+1)
		}
		encryptedMimetype, err := utils.EncryptString(image.Mimetype, s.db_encrypt_key)
		if err != nil {
			return fmt.Errorf("couldn't encrypt mimtype for image %d", i+1)
		}
		encryptedData, err := utils.EncryptBytes(image.Data, s.db_encrypt_key)
		if err != nil {
			return fmt.Errorf("couldn't encrypt data for image %d", i+1)
		}

		// Insert into the db
		err = s.db_queries.CreateUserImage(ctx, sqlc.CreateUserImageParams{
			UserID:   encryptedUserID,
			FileName: encryptedFilename,
			MimeType: encryptedMimetype,
			Size:     image.Size,
			Data:     encryptedData,
		})
		if err != nil {
			return fmt.Errorf("couldn't create user profile image for image %d", i+1)
		}
	}
	return nil
}

func (s *service) GetUserProfileImages(userID string) ([]FileInternal, error) {
	ctx := context.Background()

	// Encrypt all of the user information and their images
	userID_E, err := utils.EncryptString(userID, s.db_encrypt_key)
	if err != nil {
		return []FileInternal{}, errors.New("couldn't encrypt userID for image")
	}

	// Find images by encrypted user id
	images_E, err := s.db_queries.GetUserImages(ctx, userID_E)
	if err != nil {
		return []FileInternal{}, err
	}

	var images_D []FileInternal
	for i, image_E := range images_E {
		// Decrypt each image's data
		fileName_D, err := utils.DecryptString(image_E.FileName, s.db_encrypt_key)
		if err != nil {
			return nil, fmt.Errorf("couldn't decrypt filename for user image %d", i+1)
		}
		mimeType_D, err := utils.DecryptString(image_E.MimeType, s.db_encrypt_key)
		if err != nil {
			return nil, fmt.Errorf("couldn't decrypt mimetype for user image %d", i+1)
		}
		data_D, err := utils.DecryptBytes(image_E.Data, s.db_encrypt_key)
		if err != nil {
			return nil, fmt.Errorf("couldn't decrypt data for user image %d", i+1)
		}

		images_D = append(images_D, FileInternal{
			Filename: fileName_D,
			Mimetype: mimeType_D,
			Size:     image_E.Size,
			Data:     data_D,
		})
	}

	return images_D, nil
}

func (s *service) DeleteUserProfileImages(userID string) error {
	ctx := context.Background()
	userID_E, err := utils.EncryptString(userID, s.db_encrypt_key)
	if err != nil {
		return err
	}
	err = s.db_queries.DeleteUserImages(ctx, userID_E)
	return err
}

// -------------- USERS SAVED ENTITIES ------------------
// All user's personal entities are encrypted in the database

func (s *service) GetUserSavedProperties(userID string) ([]string, error) {
	ctx := context.Background()

	// Encrypt user id
	encryptedUserID, err := utils.EncryptString(userID, s.db_encrypt_key)
	if err != nil {
		return []string{}, err
	}

	// Get the encrypted property ids
	propertyIDs, err := s.db_queries.GetUserSavedProperties(ctx, encryptedUserID)
	if err != nil {
		return []string{}, err
	}

	// Decrypt the property ids
	var decryptedPropertyIDs []string
	for _, propertyID_E := range propertyIDs {
		propertyID_D, err := utils.DecryptString(propertyID_E.PropertyID, s.db_encrypt_key)
		if err != nil {
			return []string{}, err
		}
		decryptedPropertyIDs = append(decryptedPropertyIDs, propertyID_D)
	}

	// return an actual empty list, instead of nil
	if decryptedPropertyIDs == nil {
		decryptedPropertyIDs = []string{}
	}

	// Return the decrypted property ids
	return decryptedPropertyIDs, nil
}

func (s *service) GetUserSavedCommunities(userID string) ([]string, error) {
	ctx := context.Background()

	// Encrypt user id
	encryptedUserID, err := utils.EncryptString(userID, s.db_encrypt_key)
	if err != nil {
		return []string{}, err
	}

	// Get the encrypted community ids
	communityIDs, err := s.db_queries.GetUserSavedCommunities(ctx, encryptedUserID)
	if err != nil {
		return []string{}, err
	}

	// Decrypt the community ids
	var decryptedCommunityIDs []string
	for _, communityID_E := range communityIDs {
		communityID_D, err := utils.DecryptString(communityID_E.CommunityID, s.db_encrypt_key)
		if err != nil {
			return []string{}, err
		}
		decryptedCommunityIDs = append(decryptedCommunityIDs, communityID_D)
	}

	// return an actual empty list, instead of nil
	if decryptedCommunityIDs == nil {
		decryptedCommunityIDs = []string{}
	}

	return decryptedCommunityIDs, nil
}

func (s *service) GetUserSavedUsers(userID string) ([]string, error) {
	ctx := context.Background()

	// Encrypt user id
	encryptedUserID, err := utils.EncryptString(userID, s.db_encrypt_key)
	if err != nil {
		return []string{}, err
	}

	// Get the encrypted user ids
	userIDs, err := s.db_queries.GetUserSavedUsers(ctx, encryptedUserID)
	if err != nil {
		return []string{}, err
	}

	// Decrypt the user ids
	var decryptedUserIDs []string
	for _, userID_E := range userIDs {
		userID_D, err := utils.DecryptString(userID_E.SavedUserID, s.db_encrypt_key)
		if err != nil {
			return []string{}, err
		}
		decryptedUserIDs = append(decryptedUserIDs, userID_D)
	}

	// return an actual empty list, instead of nil
	if decryptedUserIDs == nil {
		decryptedUserIDs = []string{}
	}

	return decryptedUserIDs, nil
}

func (s *service) CreateUserSavedProperty(userID, propertyID string) error {
	ctx := context.Background()

	encryptedUserID, err := utils.EncryptString(userID, s.db_encrypt_key)
	if err != nil {
		return err
	}

	encryptedPropertyID, err := utils.EncryptString(propertyID, s.db_encrypt_key)
	if err != nil {
		return err
	}

	err = s.db_queries.CreateUserSavedProperty(ctx, sqlc.CreateUserSavedPropertyParams{
		UserID:     encryptedUserID,
		PropertyID: encryptedPropertyID,
	})
	return err
}

func (s *service) CreateUserSavedCommunity(userID, communityID string) error {
	ctx := context.Background()

	encryptedUserID, err := utils.EncryptString(userID, s.db_encrypt_key)
	if err != nil {
		return err
	}

	encryptedCommunityID, err := utils.EncryptString(communityID, s.db_encrypt_key)
	if err != nil {
		return err
	}

	err = s.db_queries.CreateUserSavedCommunity(ctx, sqlc.CreateUserSavedCommunityParams{
		UserID:      encryptedUserID,
		CommunityID: encryptedCommunityID,
	})
	return err

}

func (s *service) CreateUserSavedUser(userID, savedUserID string) error {
	ctx := context.Background()

	encryptedUserID, err := utils.EncryptString(userID, s.db_encrypt_key)
	if err != nil {
		return err
	}

	encryptedSavedUserID, err := utils.EncryptString(savedUserID, s.db_encrypt_key)
	if err != nil {
		return err
	}

	err = s.db_queries.CreateUserSavedUser(ctx, sqlc.CreateUserSavedUserParams{
		UserID:      encryptedUserID,
		SavedUserID: encryptedSavedUserID,
	})
	return err
}

func (s *service) DeleteUserSavedProperty(userID, propertyID string) error {
	ctx := context.Background()

	encryptedUserID, err := utils.EncryptString(userID, s.db_encrypt_key)
	if err != nil {
		return err
	}

	encryptedPropertyID, err := utils.EncryptString(propertyID, s.db_encrypt_key)
	if err != nil {
		return err
	}

	err = s.db_queries.DeleteUserSavedProperty(ctx, sqlc.DeleteUserSavedPropertyParams{
		UserID:     encryptedUserID,
		PropertyID: encryptedPropertyID,
	})
	return err
}

func (s *service) DeleteUserSavedCommunity(userID, communityID string) error {
	ctx := context.Background()

	encryptedUserID, err := utils.EncryptString(userID, s.db_encrypt_key)
	if err != nil {
		return err
	}

	encryptedCommunityID, err := utils.EncryptString(communityID, s.db_encrypt_key)
	if err != nil {
		return err
	}

	err = s.db_queries.DeleteUserSavedCommunity(ctx, sqlc.DeleteUserSavedCommunityParams{
		UserID:      encryptedUserID,
		CommunityID: encryptedCommunityID,
	})
	return err
}

func (s *service) DeleteUserSavedUser(userID, savedUserID string) error {
	ctx := context.Background()

	encryptedUserID, err := utils.EncryptString(userID, s.db_encrypt_key)
	if err != nil {
		return err
	}

	encryptedSavedUserID, err := utils.EncryptString(savedUserID, s.db_encrypt_key)
	if err != nil {
		return err
	}

	err = s.db_queries.DeleteUserSavedUser(ctx, sqlc.DeleteUserSavedUserParams{
		UserID:      encryptedUserID,
		SavedUserID: encryptedSavedUserID,
	})
	return err
}

func (s *service) DeleteUserSavedProperties(userID string) error {
	ctx := context.Background()
	err := s.db_queries.DeleteUserSavedProperties(ctx, userID)
	return err
}

func (s *service) DeleteUserSavedCommunities(userID string) error {
	ctx := context.Background()
	err := s.db_queries.DeleteUserSavedCommunities(ctx, userID)
	return err
}

func (s *service) DeleteUserSavedUsers(userID string) error {
	ctx := context.Background()
	err := s.db_queries.DeleteUserSavedUsers(ctx, userID)
	return err
}

// -------------- ROLES ------------------
// Roles
// Create a new role for a user, limited to one role per user
func (s *service) CreateNewUserRole(userId, role string) error {
	ctx := context.Background()

	// Encrypt user id
	userIdEncrypted, err := utils.EncryptString(userId, s.db_encrypt_key)
	if err != nil {
		return err
	}

	// Encrypt the role
	roleEncrypted, err := utils.EncryptString(role, s.db_encrypt_key)
	if err != nil {
		return err
	}

	// Insert the new role into the db
	err = s.db_queries.CreateNewUserRole(ctx, sqlc.CreateNewUserRoleParams{
		UserID: userIdEncrypted,
		Role:   roleEncrypted,
	})
	return err
}

// Get a user's role
func (s *service) GetUserRole(userId string) (string, error) {
	ctx := context.Background()

	// Encrypt the user id
	userIdEncrypted, err := utils.EncryptString(userId, s.db_encrypt_key)
	if err != nil {
		return "", err
	}

	// Find the role for the user in the db
	userRole, err := s.db_queries.GetUserRole(ctx, userIdEncrypted)
	if err != nil {
		return "", err
	}

	// Decrypt the role
	roleDecrypted, err := utils.DecryptString(userRole.Role, s.db_encrypt_key)
	if err != nil {
		return "", err
	}

	return roleDecrypted, nil
}

// Update a user's role
func (s *service) UpdateUserRole(userId, role string) error {
	ctx := context.Background()

	// Encrypt the user id
	userIdEncrypted, err := utils.EncryptString(userId, s.db_encrypt_key)
	if err != nil {
		return err
	}

	// Encrypt the role
	roleEncrypted, err := utils.EncryptString(role, s.db_encrypt_key)
	if err != nil {
		return err
	}

	// Update the user's role
	err = s.db_queries.UpdateUserRole(ctx, sqlc.UpdateUserRoleParams{
		UserID: userIdEncrypted,
		Role:   roleEncrypted,
	})
	return err
}

// Delete the user's role (since users must have a role as long as their account exists
// this means the user's account has been deleted)
func (s *service) DeleteUserRole(userId string) error {
	ctx := context.Background()

	// Encrypt the user id
	userIdEncrypted, err := utils.EncryptString(userId, s.db_encrypt_key)
	if err != nil {
		return err
	}

	// Delete the user's role
	err = s.db_queries.DeleteUserRole(ctx, userIdEncrypted)
	return err
}

// Properties
func (s *service) CreateProperty(propertyDetails PropertyDetails, images []OrderedFileInternal) error {
	ctx := context.Background()

	// Encrypt user id
	encryptedListerUserID, err := utils.EncryptString(propertyDetails.ListerUserID, s.db_encrypt_key)
	if err != nil {
		return err
	}

	// Insert property data into db
	err = s.db_queries.CreatePropertyDetails(ctx, sqlc.CreatePropertyDetailsParams{
		PropertyID:      propertyDetails.PropertyID,
		ListerUserID:    encryptedListerUserID,
		Name:            propertyDetails.Name,
		Description:     utils.CreateSQLNullString(propertyDetails.Description),
		Address1:        propertyDetails.Address_1,
		Address2:        utils.CreateSQLNullString(propertyDetails.Address_2),
		City:            propertyDetails.City,
		State:           propertyDetails.State,
		Zipcode:         propertyDetails.Zipcode,
		Country:         propertyDetails.Country,
		SquareFeet:      propertyDetails.Square_feet,
		NumBedrooms:     propertyDetails.Num_bedrooms,
		NumToilets:      propertyDetails.Num_toilets,
		NumShowersBaths: propertyDetails.Num_showers_baths,
		CostDollars:     propertyDetails.Cost_dollars,
		CostCents:       propertyDetails.Cost_cents,
		MiscNote:        utils.CreateSQLNullString(propertyDetails.Misc_note),
	})
	if err != nil {
		return err
	}

	// Create the property images
	for _, image := range images {
		err = s.db_queries.CreatePropertyImage(ctx, sqlc.CreatePropertyImageParams{
			PropertyID: propertyDetails.PropertyID,
			OrderNum:   image.OrderNum,
			FileName:   image.File.Filename,
			MimeType:   image.File.Mimetype,
			Size:       image.File.Size,
			Data:       image.File.Data,
		})
		if err != nil {
			return err
		}
	}

	return nil
}

// Find and return the property details given the property's id
func (s *service) GetPropertyDetails(propertyId string) (PropertyDetails, error) {
	ctx := context.Background()

	// Get the property details
	property, err := s.db_queries.GetProperty(ctx, propertyId)
	if err != nil {
		return PropertyDetails{}, err
	}

	// Decrypt user id
	decryptedListerUserID, err := utils.DecryptString(property.ListerUserID, s.db_encrypt_key)
	if err != nil {
		return PropertyDetails{}, err
	}

	propertyDetails := PropertyDetails{
		PropertyID:        propertyId,
		ListerUserID:      decryptedListerUserID,
		Name:              property.Name,
		Description:       property.Description.String,
		Address_1:         property.Address1,
		Address_2:         property.Address2.String,
		City:              property.City,
		State:             property.State,
		Zipcode:           property.Zipcode,
		Country:           property.Country,
		Square_feet:       property.SquareFeet,
		Num_bedrooms:      property.NumBedrooms,
		Num_toilets:       property.NumToilets,
		Num_showers_baths: property.NumShowersBaths,
		Cost_dollars:      property.CostDollars,
		Cost_cents:        property.CostCents,
		Misc_note:         property.MiscNote.String,
	}

	return propertyDetails, nil
}

func (s *service) GetPropertyImages(propertyId string) ([]OrderedFileInternal, error) {
	ctx := context.Background()

	var propertyImages []OrderedFileInternal
	propertyImagesDB, err := s.db_queries.GetPropertyImages(ctx, propertyId)
	if err != nil {
		return []OrderedFileInternal{}, err
	}

	for _, image := range propertyImagesDB {
		propertyImages = append(propertyImages, OrderedFileInternal{
			OrderNum: image.OrderNum,
			File: FileInternal{
				Filename: image.FileName,
				Mimetype: image.MimeType,
				Size:     image.Size,
				Data:     image.Data,
			},
		})
	}

	return propertyImages, nil
}

// Allow a public function to search for the available properties on app
func (s *service) GetNextPageProperties(limit, offset int32, addressFilter string) ([]string, error) {
	ctx := context.Background()

	if addressFilter == "" {
		// Get the encrypted properties details
		propertyIDs, err := s.db_queries.GetNextPageProperties(ctx, sqlc.GetNextPagePropertiesParams{
			Limit:  limit,
			Offset: offset,
		})
		if err != nil {
			return []string{}, err
		}
		return propertyIDs, nil
	}

	// There is an addressFilter
	propertyIDs, err := s.db_queries.GetNextPagePropertiesFilterByAddress(ctx, sqlc.GetNextPagePropertiesFilterByAddressParams{
		Limit:      limit,
		Offset:     offset,
		Similarity: addressFilter,
	})
	if err != nil {
		return []string{}, err
	}

	return propertyIDs, nil
}

// Update property details
func (s *service) UpdatePropertyDetails(details PropertyDetails) error {
	ctx := context.Background()

	// Encrypt user id
	encryptedListerUserID, err := utils.EncryptString(details.ListerUserID, s.db_encrypt_key)
	if err != nil {
		return err
	}

	// Construct the new details struct to insert into db
	err = s.db_queries.UpdatePropertyDetails(ctx, sqlc.UpdatePropertyDetailsParams{
		PropertyID:      details.PropertyID,
		ListerUserID:    encryptedListerUserID,
		Name:            details.Name,
		Description:     utils.CreateSQLNullString(details.Description),
		Address1:        details.Address_1,
		Address2:        utils.CreateSQLNullString(details.Address_2),
		City:            details.City,
		State:           details.State,
		Zipcode:         details.Zipcode,
		Country:         details.Country,
		SquareFeet:      details.Square_feet,
		NumBedrooms:     details.Num_bedrooms,
		NumToilets:      details.Num_toilets,
		NumShowersBaths: details.Num_showers_baths,
		CostDollars:     details.Cost_dollars,
		CostCents:       details.Cost_cents,
		MiscNote:        utils.CreateSQLNullString(details.Misc_note),
	})
	if err != nil {
		return err
	}
	return nil
}

func (s *service) UpdatePropertyImages(propertyID string, images []OrderedFileInternal) error {
	ctx := context.Background()

	// Delete all old property images
	err := s.db_queries.DeletePropertyImages(ctx, propertyID)
	if err != nil {
		return err
	}

	// Upload new ones
	for _, image := range images {
		err = s.db_queries.CreatePropertyImage(ctx, sqlc.CreatePropertyImageParams{
			PropertyID: propertyID,
			OrderNum:   image.OrderNum,
			FileName:   image.File.Filename,
			MimeType:   image.File.Mimetype,
			Size:       image.File.Size,
			Data:       image.File.Data,
		})
		if err != nil {
			return err
		}
	}

	return nil
}

// Delete both property details and all images for a given property id
func (s *service) DeleteProperty(propertyId string) error {
	ctx := context.Background()

	// Delete the property (image rows get deleted via cascade)
	err := s.db_queries.DeletePropertyDetails(ctx, propertyId)
	if err != nil {
		return err
	}

	return err
}

// Get count of properties
func (s *service) GetTotalCountProperties() (int64, error) {
	ctx := context.Background()
	num, err := s.db_queries.GetTotalCountProperties(ctx)
	if err != nil {
		return -1, err
	}
	return num, nil
}

func (s *service) GetListerOwnedProperties(userID string) ([]string, error) {
	ctx := context.Background()
	// Encrypt user id to search
	encryptedUserID, err := utils.EncryptString(userID, s.db_encrypt_key)
	if err != nil {
		return []string{}, err
	}

	propertyIDs, err := s.db_queries.GetUserOwnedProperties(ctx, encryptedUserID)
	if err != nil {
		return []string{}, err
	}
	return propertyIDs, nil
}

// Delete a single property's image identified by its order number
func (s *service) DeletePropertyImage(propertyId string, imageOrderNum int16) error {
	ctx := context.Background()

	err := s.db_queries.DeletePropertyImage(ctx, sqlc.DeletePropertyImageParams{
		PropertyID: propertyId,
		OrderNum:   imageOrderNum,
	})

	return err
}

// Delete all properties that whose lister id is the user id given
func (s *service) DeleteUserOwnedProperties(userID string) error {
	ctx := context.Background()
	err := s.db_queries.DeleteListerProperties(ctx, userID)
	return err
}

func (s *service) CheckDuplicateProperty(propertyDetails PropertyDetails) error {
	ctx := context.Background()

	// No duplicate property addresses (basic search and check)
	address1 := propertyDetails.Address_1
	address2 := propertyDetails.Address_2
	city := propertyDetails.City
	state := propertyDetails.State
	zipcode := propertyDetails.Zipcode
	country := propertyDetails.Country

	count, err := s.db_queries.CheckIsPropertyDuplicate(ctx, sqlc.CheckIsPropertyDuplicateParams{
		Btrim:   address1,
		Btrim_2: address2,
		Btrim_3: city,
		Btrim_4: state,
		Btrim_5: zipcode,
		Btrim_6: country,
	})
	if err != nil {
		return err
	}

	if count > 0 {
		return errors.New("property uses an address that is already in use")
	}

	return nil
}

// ------------------- ADMIN -------------------
// Admin - get multiple user ids
func (s *service) AdminGetUsersRoles(userIds []string) ([]string, error) {
	ctx := context.Background()

	// Encrypt the user ids
	var userIdsEncrypted []string
	for _, userId := range userIds {
		userIdEncrypted, err := utils.EncryptString(userId, s.db_encrypt_key)
		if err != nil {
			return []string{}, err
		}
		userIdsEncrypted = append(userIdsEncrypted, userIdEncrypted)
	}

	// Get the roles for the users
	var userRolesEncrypted []sqlc.Role
	for _, userId := range userIdsEncrypted {
		role, err := s.db_queries.GetUserRole(ctx, userId)
		if err != nil {
			return []string{}, err
		}

		userRolesEncrypted = append(userRolesEncrypted, role)
	}

	// Decrypt the roles
	var userRoles []string
	for _, role := range userRolesEncrypted {
		roleDecrypted, err := utils.DecryptString(role.Role, s.db_encrypt_key)
		if err != nil {
			return []string{}, err
		}
		userRoles = append(userRoles, roleDecrypted)
	}

	return userRoles, nil
}

// ---------------- Communities --------------------
func (s *service) CreateCommunity(details CommunityDetails, images []FileInternal) error {
	ctx := context.Background()

	// Encrypt the community's admin user id
	encryptedAdminUserID, err := utils.EncryptString(details.AdminUserID, s.db_encrypt_key)
	if err != nil {
		return err
	}

	// Create community details with all plain text details except admin user id
	err = s.db_queries.CreateCommunityDetails(ctx, sqlc.CreateCommunityDetailsParams{
		CommunityID: details.CommunityID,
		AdminUserID: encryptedAdminUserID,
		Name:        details.Name,
		Description: utils.CreateSQLNullString(details.Description),
	})
	if err != nil {
		return err
	}

	// Add the community admin as the first user
	err = s.db_queries.CreateCommunityUser(ctx, sqlc.CreateCommunityUserParams{
		CommunityID: details.CommunityID,
		UserID:      encryptedAdminUserID,
	})
	if err != nil {
		return err
	}

	// Insert all provided community images
	for _, image := range images {
		err = s.db_queries.CreateCommunityImage(ctx, sqlc.CreateCommunityImageParams{
			CommunityID: details.CommunityID,
			FileName:    image.Filename,
			MimeType:    image.Mimetype,
			Size:        image.Size,
			Data:        image.Data,
		})
		if err != nil {
			return err
		}
	}

	return nil
}

func (s *service) CreateCommunityUser(communityId, userId string) error {
	ctx := context.Background()

	// Encrypt user id
	encryptedUserID, err := utils.EncryptString(userId, s.db_encrypt_key)
	if err != nil {
		return err
	}

	err = s.db_queries.CreateCommunityUser(ctx, sqlc.CreateCommunityUserParams{
		CommunityID: communityId,
		UserID:      encryptedUserID,
	})
	return err
}

func (s *service) CreateCommunityProperty(communityId, propertyId string) error {
	ctx := context.Background()
	err := s.db_queries.CreateCommunityProperty(ctx, sqlc.CreateCommunityPropertyParams{
		CommunityID: communityId,
		PropertyID:  propertyId,
	})
	return err
}

func (s *service) GetCommunityDetails(communityId string) (CommunityDetails, error) {
	ctx := context.Background()
	details, err := s.db_queries.GetCommunityDetails(ctx, communityId)
	if err != nil {
		return CommunityDetails{}, err
	}

	// Decrypt user id
	decryptedUserID, err := utils.DecryptString(details.AdminUserID, s.db_encrypt_key)
	if err != nil {
		return CommunityDetails{}, err
	}

	return CommunityDetails{
		CommunityID: details.CommunityID,
		AdminUserID: decryptedUserID,
		Name:        details.Name,
		Description: details.Description.String,
	}, nil
}

func (s *service) GetCommunityImages(communityId string) ([]FileInternal, error) {
	ctx := context.Background()
	images, err := s.db_queries.GetCommunityImages(ctx, communityId)
	if err != nil {
		return []FileInternal{}, err
	}
	var returnImages []FileInternal
	for _, image := range images {
		returnImages = append(returnImages, FileInternal{
			Filename: image.FileName,
			Mimetype: image.MimeType,
			Size:     image.Size,
			Data:     image.Data,
		})
	}
	return returnImages, nil
}

func (s *service) GetCommunityUsers(communityId string) ([]string, error) {
	ctx := context.Background()
	userIds, err := s.db_queries.GetCommunityUsers(ctx, communityId)
	if err != nil {
		return []string{}, err
	}
	var returnUserIds []string
	for _, id := range userIds {
		// Decrypt each user id of the community
		decryptedUserID, err := utils.DecryptString(id.UserID, s.db_encrypt_key)
		if err != nil {
			return []string{}, err
		}
		returnUserIds = append(returnUserIds, decryptedUserID)
	}
	return returnUserIds, nil
}

func (s *service) GetCommunityProperties(communityId string) ([]string, error) {
	ctx := context.Background()
	propertyIds, err := s.db_queries.GetCommunityProperties(ctx, communityId)
	if err != nil {
		return []string{}, err
	}
	var returnPropertyIds []string
	for _, id := range propertyIds {
		returnPropertyIds = append(returnPropertyIds, id.PropertyID)
	}
	return returnPropertyIds, nil
}

func (s *service) GetNextPageCommunities(limit, offset int32, filterName, filterDescription string) ([]string, error) {
	ctx := context.Background()

	if len(filterName) > 0 && len(filterDescription) > 0 {
		communityIds, err := s.db_queries.GetNextPageCommunitiesFilteredByCombination(ctx, sqlc.GetNextPageCommunitiesFilteredByCombinationParams{
			Limit:        limit,
			Offset:       offset,
			Similarity:   filterName,
			Similarity_2: filterDescription,
		})
		if err != nil {
			return []string{}, err
		}
		return communityIds, nil
	} else if len(filterName) > 0 {
		communityIds, err := s.db_queries.GetNextPageCommunitiesFilterByName(ctx, sqlc.GetNextPageCommunitiesFilterByNameParams{
			Limit:      limit,
			Offset:     offset,
			Similarity: filterName,
		})
		if err != nil {
			return []string{}, err
		}
		return communityIds, nil
	} else if len(filterDescription) > 0 {
		communityIds, err := s.db_queries.GetNextPageCommunitiesFilterByDescription(ctx, sqlc.GetNextPageCommunitiesFilterByDescriptionParams{
			Limit:      limit,
			Offset:     offset,
			Similarity: filterDescription,
		})
		if err != nil {
			return []string{}, err
		}
		return communityIds, nil
	} else {
		communityIds, err := s.db_queries.GetNextPageCommunities(ctx, sqlc.GetNextPageCommunitiesParams{
			Limit:  limit,
			Offset: offset,
		})
		if err != nil {
			return []string{}, err
		}
		return communityIds, nil
	}
}

func (s *service) UpdateCommunityDetails(details CommunityDetails) error {
	ctx := context.Background()
	// Encrypt user id
	encryptedAdminUserID, err := utils.EncryptString(details.AdminUserID, s.db_encrypt_key)
	if err != nil {
		return err
	}
	err = s.db_queries.UpdateCommunityDetails(ctx, sqlc.UpdateCommunityDetailsParams{
		CommunityID: details.CommunityID,
		AdminUserID: encryptedAdminUserID,
		Name:        details.Name,
		Description: utils.CreateSQLNullString(details.Description),
	})
	return err
}

func (s *service) UpdateCommunityImages(communityId string, images []FileInternal) error {
	ctx := context.Background()
	err := s.db_queries.DeleteCommunityImages(ctx, communityId)
	if err != nil {
		return err
	}
	for _, image := range images {
		err = s.db_queries.CreateCommunityImage(ctx, sqlc.CreateCommunityImageParams{
			CommunityID: communityId,
			FileName:    image.Filename,
			MimeType:    image.Mimetype,
			Size:        image.Size,
			Data:        image.Data,
		})
		if err != nil {
			return err
		}
	}
	return nil
}

func (s *service) UpdateCommunityUsers(communityID string, userIDs []string) error {
	ctx := context.Background()
	err := s.db_queries.DeleteCommunityUsers(ctx, communityID)
	if err != nil {
		return err
	}

	for _, userID := range userIDs {
		// Encrypt user id
		encryptedUserID, err := utils.EncryptString(userID, s.db_encrypt_key)
		if err != nil {
			return err
		}
		err = s.db_queries.CreateCommunityUser(ctx, sqlc.CreateCommunityUserParams{
			CommunityID: communityID,
			UserID:      encryptedUserID,
		})
		if err != nil {
			return err
		}
	}
	return nil
}

func (s *service) UpdateCommunityProperties(communityID string, propertyIDs []string) error {
	ctx := context.Background()
	err := s.db_queries.DeleteCommunityProperties(ctx, communityID)
	if err != nil {
		return err
	}
	for _, propertyID := range propertyIDs {
		err = s.db_queries.CreateCommunityProperty(ctx, sqlc.CreateCommunityPropertyParams{
			CommunityID: communityID,
			PropertyID:  propertyID,
		})
		if err != nil {
			return err
		}
	}
	return nil
}

func (s *service) DeleteCommunity(communityId string) error {
	ctx := context.Background()
	err := s.db_queries.DeleteCommunity(ctx, communityId)
	return err
}

func (s *service) DeleteCommunityUser(communityId, userId string) error {
	ctx := context.Background()

	// Encrypt user id
	encryptedUserID, err := utils.EncryptString(userId, s.db_encrypt_key)
	if err != nil {
		return err
	}

	err = s.db_queries.DeleteCommunityUser(ctx, sqlc.DeleteCommunityUserParams{
		CommunityID: communityId,
		UserID:      encryptedUserID,
	})
	return err
}
func (s *service) DeleteCommunityProperty(communityId, propertyId string) error {
	ctx := context.Background()
	err := s.db_queries.DeleteCommunityProperty(ctx, sqlc.DeleteCommunityPropertyParams{
		CommunityID: communityId,
		PropertyID:  propertyId,
	})
	return err
}

func (s *service) GetUserOwnedCommunities(userId string) ([]string, error) {
	ctx := context.Background()

	// Encrypt user id
	encryptedUserID, err := utils.EncryptString(userId, s.db_encrypt_key)
	if err != nil {
		return []string{}, err
	}

	communities, err := s.db_queries.GetUserOwnedCommunities(ctx, encryptedUserID)
	if err != nil {
		return []string{}, err
	}
	return communities, nil
}

func (s *service) DeleteUserOwnedCommunities(userID string) error {
	ctx := context.Background()
	err := s.db_queries.DeleteUserOwnedCommunities(ctx, userID)
	return err
}

func (s *service) GetNextPagePublicUserIDs(limit, offset int32) ([]string, error) {
	ctx := context.Background()

	userIdsEncrypted, err := s.db_queries.GetNextPageOfPublicUsers(ctx, sqlc.GetNextPageOfPublicUsersParams{
		Limit:  limit,
		Offset: offset,
	})
	if err != nil {
		return []string{}, err
	}

	// Decrypt userIDs
	var userIDs []string
	for _, userID := range userIdsEncrypted {
		decryptedUserID, err := utils.DecryptString(userID, s.db_encrypt_key)
		if err != nil {
			return []string{}, err
		}
		userIDs = append(userIDs, decryptedUserID)
	}

	return userIDs, nil
}

func (s *service) GetNextPagePublicUserIDsFilterByName(limit, offset int32, firstName, lastName string) ([]string, error) {
	ctx := context.Background()

	encryptedFirstName, err := utils.EncryptString(firstName, s.db_encrypt_key)
	if err != nil {
		return []string{}, err
	}
	encryptedLastName, err := utils.EncryptString(lastName, s.db_encrypt_key)
	if err != nil {
		return []string{}, err
	}

	userIdsEncrypted, err := s.db_queries.GetNextPageOfPublicUsersFilterByName(ctx, sqlc.GetNextPageOfPublicUsersFilterByNameParams{
		Limit:        limit,
		Offset:       offset,
		Similarity:   encryptedFirstName,
		Similarity_2: encryptedLastName,
	})
	if err != nil {
		return []string{}, err
	}

	// Decrypt userIDs
	var userIDs []string
	for _, userID := range userIdsEncrypted {
		decryptedUserID, err := utils.DecryptString(userID, s.db_encrypt_key)
		if err != nil {
			return []string{}, err
		}
		userIDs = append(userIDs, decryptedUserID)
	}

	return userIDs, nil
}

func (s *service) GetPublicUserProfile(userID string) (PublicUserProfile, error) {
	plainTextUserID := userID

	userDetails, err := s.GetUserDetails(plainTextUserID)
	if err != nil {
		return PublicUserProfile{}, err
	}

	// First get user avatar
	userAvatar, err := s.GetUserAvatar(plainTextUserID)
	if err != nil {
		return PublicUserProfile{}, err
	}

	// Calculate user age in years
	ageInYears, err := utils.CalculateAge(userDetails.BirthDate)
	if err != nil {
		return PublicUserProfile{}, err
	}

	var userImages []FileExternal
	// First append user avatar
	userImages = append(userImages, FileExternal{
		Filename: userAvatar.Filename,
		Mimetype: userAvatar.Mimetype,
		Size:     userAvatar.Size,
		Data:     base64.StdEncoding.EncodeToString(userAvatar.Data),
	})
	// Then get and append the rest of the user images
	userProfileImages, err := s.GetUserProfileImages(plainTextUserID)
	if err != nil {
		return PublicUserProfile{}, err
	}
	for _, image := range userProfileImages {
		userImages = append(userImages, FileExternal{
			Filename: image.Filename,
			Mimetype: image.Mimetype,
			Size:     image.Size,
			Data:     base64.StdEncoding.EncodeToString(image.Data),
		})
	}

	// User's liked communities and properties
	communityIDs, err := s.GetUserSavedCommunities(plainTextUserID)
	if err != nil {
		return PublicUserProfile{}, err
	}

	if communityIDs == nil {
		communityIDs = []string{}
	}

	propertyIDs, err := s.GetUserSavedProperties(plainTextUserID)
	if err != nil {
		return PublicUserProfile{}, err
	}

	if propertyIDs == nil {
		propertyIDs = []string{}
	}

	userProfile := PublicUserProfile{
		Details: PublicUserProfileDetails{
			UserID:     userDetails.UserID,
			FirstName:  userDetails.FirstName,
			LastName:   userDetails.LastName,
			AgeInYears: ageInYears,
			Gender:     userDetails.Gender,
			Location:   userDetails.Location,
			Interests:  userDetails.Interests,
		},
		Images:       userImages,
		CommunityIDs: communityIDs,
		PropertyIDs:  propertyIDs,
	}

	return userProfile, nil
}

// -----------------------------------------------------

// DB entrance func to init
func New() Service {
	// Raw sql connection
	connStr := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable", config.GlobalConfig.DB_USERNAME, config.GlobalConfig.DB_PASSWORD, config.GlobalConfig.DB_HOST, config.GlobalConfig.DB_PORT, config.GlobalConfig.DB_DATABASE)
	db, err := sql.Open("pgx", connStr)
	if err != nil {
		log.Fatal(err)
	}

	// Instantiate the sqlc queries object for querying
	db_queries := sqlc.New(db)

	s := &service{
		db:             db,
		db_queries:     db_queries,
		db_encrypt_key: config.GlobalConfig.DB_ENCRYPT_KEY_SECRET,
	}
	return s
}
