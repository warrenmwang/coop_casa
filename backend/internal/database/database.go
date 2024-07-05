package database

/*
	Encryption and Decryption of user data happens only in the database module.
	Usage of NullStrings is useful to differentiate between empty values and actual null values in the db.
	Therefore, we should check a value to see if it is Null or not before attempting encryption/decyption
	to save time.
*/

import (
	"backend/internal/database/sqlc"
	"backend/internal/utils"
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
	_ "github.com/joho/godotenv/autoload"
)

type FileInternal struct {
	Filename string 
	Mimetype string 
	Size int64 
	Data []byte 
}

type FileExternal struct {
	Filename string `json:"fileName"`
	Mimetype string `json:"mimeType"`
	Size int64 `json:"size"`
	Data string `json:"data"`
}

type UserDetails struct {
	UserID    string `json:"userId"`
	Email     string `json:"email"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	BirthDate string `json:"birthDate"`
	Gender    string `json:"gender"`
	Location  string `json:"location"`
	Interests string `json:"interests"`
}

type Property struct {
	PropertyID        string `json:"propertyId"`
	ListerUserID      string `json:"listerUserId"`
	Name              string `json:"name"`
	Description       string `json:"description"`
	Address_1         string `json:"address1"`
	Address_2         string `json:"address2"`
	City              string `json:"city"`
	State             string `json:"state"`
	Zipcode           string `json:"zipcode"`
	Country           string `json:"country"`
	Square_feet       int32  `json:"squareFeet"`
	Num_bedrooms      int16  `json:"numBedrooms"`
	Num_toilets       int16  `json:"numToilets"`
	Num_showers_baths int16  `json:"numShowersBaths"`
	Cost_dollars      int64  `json:"costDollars"`
	Cost_cents        int16  `json:"costCents"`
	Misc_note         string `json:"miscNote"`
	Images            string `json:"images"`
}

type Service interface {
	// General
	Health() map[string]string

	// Admin functions
	AdminGetUsers(limit, offset int32) ([]sqlc.User, error)
	AdminGetUsersRoles(userIds []string) ([]string, error)

	// Users
	CreateUser(userId, email string) error
	GetUserDetails(userId string) (sqlc.User, error)
	UpdateUser(updatedUserData UserDetails, avatarImage FileInternal) error
	DeleteUser(userId string) error
	GetUserAvatar(userId string) (FileInternal, error)

	// Roles
	CreateNewUserRole(userId, role string) error
	GetUserRole(userId string) (string, error)
	UpdateUserRole(userId, role string) error
	DeleteUserRole(userId string) error

	// Properties
	CreateProperty(property Property) error
	GetProperty(propertyId string) (Property, error)
	UpdateProperty(property Property) error
	DeleteProperty(propertyId string) error
	GetNextPageProperties(limit, offset int32) ([]string, error)
	GetTotalCountProperties() (int64, error)
}



type service struct {
	db             *sql.DB
	db_queries     *sqlc.Queries
	db_encrypt_key string
}

func (s *service) encryptBytes(plainBytes []byte) ([]byte, error) {
	if plainBytes == nil {
		return nil, nil
	}

	encryptedBytes, err := utils.EncryptBytes(plainBytes, s.db_encrypt_key)
	if err != nil {
		return nil, err
	}

	return encryptedBytes, nil
}

func (s *service) decryptBytes(encryptedBytes []byte) ([]byte, error) {
	if encryptedBytes == nil {
		return nil, nil
	}

	plainBytes, err := utils.DecryptBytes(encryptedBytes, s.db_encrypt_key)
	if err != nil {
		return nil, err
	}

	return plainBytes, nil
}

func (s *service) decryptNullString(encrypted sql.NullString) (sql.NullString, error) {
	if encrypted.Valid {
		decrypted, err := utils.DecryptString(encrypted.String, s.db_encrypt_key)
		if err != nil {
			return sql.NullString{}, err
		}
		return sql.NullString{
			String: decrypted,
			Valid:  encrypted.Valid,
		}, nil
	}
	return encrypted, nil
}

func (s *service) decryptString(encrypted string) (string, error) {
	if encrypted == "" {
		return "", nil
	}

	decrypted, err := utils.DecryptString(encrypted, s.db_encrypt_key)
	if err != nil {
		return "", err
	}

	return decrypted, nil
}

func (s *service) encryptNullString(plainText sql.NullString) (sql.NullString, error) {
	if !plainText.Valid {
		return sql.NullString{
			String: "",
			Valid:  false,
		}, nil
	}

	encrypted, err := utils.EncryptString(plainText.String, s.db_encrypt_key)
	if err != nil {
		return sql.NullString{}, err
	}

	return sql.NullString{
		String: encrypted,
		Valid:  true,
	}, nil
}

func (s *service) encryptString(plainText string) (string, error) {
	encrypted, err := utils.EncryptString(plainText, s.db_encrypt_key)
	if err != nil {
		return "", err
	}
	return encrypted, nil
}

func New() Service {
	database := os.Getenv("DB_DATABASE")
	password := os.Getenv("DB_PASSWORD")
	username := os.Getenv("DB_USERNAME")
	port := os.Getenv("DB_PORT")
	host := os.Getenv("DB_HOST")
	dbEncryptKey := os.Getenv("DB_ENCRYPT_KEY_SECRET")

	// Raw sql connection
	connStr := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable", username, password, host, port, database)
	db, err := sql.Open("pgx", connStr)
	if err != nil {
		log.Fatal(err)
	}

	// Instantiate the sqlc queries object for querying
	db_queries := sqlc.New(db)

	s := &service{
		db:             db,
		db_queries:     db_queries,
		db_encrypt_key: dbEncryptKey,
	}
	return s
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

// Admin functions
func (s *service) AdminGetUsers(limit, offset int32) ([]sqlc.User, error) {
	ctx := context.Background()

	// Get users using the limit and offset provided
	users, err := s.db_queries.AdminGetUsers(ctx, sqlc.AdminGetUsersParams{
		Limit:  limit,
		Offset: offset,
	})
	if err != nil {
		return nil, err
	}

	// Decrypt user data
	var decryptedUsers []sqlc.User
	for _, user := range users {
		userId, err := s.decryptString(user.UserID)
		if err != nil {
			return nil, err
		}

		email, err := s.decryptString(user.Email)
		if err != nil {
			return nil, err
		}

		firstName, err := s.decryptNullString(user.FirstName)
		if err != nil {
			return nil, err
		}

		lastName, err := s.decryptNullString(user.LastName)
		if err != nil {
			return nil, err
		}

		birthDate, err := s.decryptNullString(user.BirthDate)
		if err != nil {
			return nil, err
		}

		gender, err := s.decryptNullString(user.Gender)
		if err != nil {
			return nil, err
		}

		location, err := s.decryptNullString(user.Location)
		if err != nil {
			return nil, err
		}

		interests, err := s.decryptNullString(user.Interests)
		if err != nil {
			return nil, err
		}

		decryptedUsers = append(decryptedUsers, sqlc.User{
			UserID:    userId,
			Email:     email,
			FirstName: firstName,
			LastName:  lastName,
			BirthDate: birthDate,
			Gender:    gender,
			Location:  location,
			Interests: interests,
		})
	}

	return decryptedUsers, nil
}

// Users

func (s *service) CreateUser(userId, email string) error {
	ctx := context.Background()

	// Encrypt user data
	userId_encrypted, err := s.encryptString(userId)
	if err != nil {
		return err
	}
	email_encrypted, err := s.encryptString(email)
	if err != nil {
		return err
	}

	// Create a User in the db
	err = s.db_queries.CreateBareUser(ctx, sqlc.CreateBareUserParams{
		UserID: userId_encrypted,
		Email: email_encrypted,
	})
	if err != nil {
		return err
	}

	// Create the avatar
	err = s.db_queries.CreateBareUserAvatar(ctx, userId_encrypted)
	if err != nil {
		return err
	}

	return nil
}

func (s *service) GetUserDetails(userId string) (sqlc.User, error) {
	ctx := context.Background()

	// Need to use the encrypted userId to search
	userId_encrypted, err := s.encryptString(userId)
	if err != nil {
		return sqlc.User{}, err
	}

	user_encrypted, err := s.db_queries.GetUserDetails(ctx, userId_encrypted)
	if err != nil {
		return sqlc.User{}, err
	}

	// Decrypt user data
	email, err := s.decryptString(user_encrypted.Email)
	if err != nil {
		return sqlc.User{}, err
	}

	firstName, err := s.decryptNullString(user_encrypted.FirstName)
	if err != nil {
		return sqlc.User{}, err
	}

	lastName, err := s.decryptNullString(user_encrypted.LastName)
	if err != nil {
		return sqlc.User{}, err
	}

	birthDate, err := s.decryptNullString(user_encrypted.BirthDate)
	if err != nil {
		return sqlc.User{}, err
	}

	gender, err := s.decryptNullString(user_encrypted.Gender)
	if err != nil {
		return sqlc.User{}, err
	}

	location, err := s.decryptNullString(user_encrypted.Location)
	if err != nil {
		return sqlc.User{}, err
	}

	interests, err := s.decryptNullString(user_encrypted.Interests)
	if err != nil {
		return sqlc.User{}, err
	}

	return sqlc.User{
		UserID:    userId,
		Email:     email,
		FirstName: firstName,
		LastName:  lastName,
		BirthDate: birthDate,
		Gender:    gender,
		Location:  location,
		Interests: interests,
		CreatedAt: user_encrypted.CreatedAt, // Note createdat and updatedat timestamps are not encrypted
		UpdatedAt: user_encrypted.UpdatedAt,
	}, nil
}

func (s *service) GetUserAvatar(userId string) (FileInternal, error) {
	ctx := context.Background()

	// Encrypt userId
	userIdEncrypted, err := s.encryptString(userId)
	if err != nil {
		return FileInternal{}, err
	}

	// Get encrypted avatar image by searching with the encrypted user id
	avatarEncrypted, err := s.db_queries.GetUserAvatar(ctx, userIdEncrypted)
	if err != nil {
		return FileInternal{}, err
	}

	// Decrypt filename and data
	avatarFileNameDecrypted, err := s.decryptString(avatarEncrypted.FileName.String)
	if err != nil {
		return FileInternal{}, err
	}
	avatarDataDecrypted, err := s.decryptBytes(avatarEncrypted.Data)
	if err != nil {
		return FileInternal{}, err
	}

	// Return decrypted user's avatar image (base64 encoded string)
	return FileInternal{
		Filename: avatarFileNameDecrypted,
		Mimetype: avatarEncrypted.MimeType.String,
		Size: avatarEncrypted.Size.Int64,
		Data: avatarDataDecrypted,
	}, nil
}

func (s *service) UpdateUser(updatedUserData UserDetails, avatarImage FileInternal) error {
	ctx := context.Background()

	userId := updatedUserData.UserID
	first_name := updatedUserData.FirstName
	last_name := updatedUserData.LastName
	birth_date := updatedUserData.BirthDate
	gender := updatedUserData.Gender
	location := updatedUserData.Location
	interests := updatedUserData.Interests

	// Encrypt all user information
	userId_encrypted, err := s.encryptString(userId)
	if err != nil {
		return err
	}

	first_name_encrypted, err := s.encryptNullString(sql.NullString{String: first_name, Valid: true})
	if err != nil {
		return err
	}

	last_name_encrypted, err := s.encryptNullString(sql.NullString{String: last_name, Valid: true})
	if err != nil {
		return err
	}

	birth_date_encrypted, err := s.encryptNullString(sql.NullString{String: birth_date, Valid: true})
	if err != nil {
		return err
	}

	gender_encrypted, err := s.encryptNullString(sql.NullString{String: gender, Valid: true})
	if err != nil {
		return err
	}

	location_encrypted, err := s.encryptNullString(sql.NullString{String: location, Valid: true})
	if err != nil {
		return err
	}

	interests_encrypted, err := s.encryptNullString(sql.NullString{String: interests, Valid: true})
	if err != nil {
		return err
	}

	// Encrypt filename and data
	avatarFilenameEncrypted, err := s.encryptString(avatarImage.Filename)
	if err != nil {
		return err
	}

	avatarDataEncrypted, err := s.encryptBytes(avatarImage.Data)
	if err != nil {
		return err
	}

	// Store encrypted user data in db
	// Small information
	err = s.db_queries.UpdateUserDetails(ctx, sqlc.UpdateUserDetailsParams{
		UserID:    userId_encrypted, // Need the encrypted userId to search for the right row to update in db.
		FirstName: first_name_encrypted,
		LastName:  last_name_encrypted,
		BirthDate: birth_date_encrypted,
		Gender:    gender_encrypted,
		Location:  location_encrypted,
		Interests: interests_encrypted,
	})
	if err != nil {
		return err
	}

	// Larger information
	err = s.db_queries.UpdateUserAvatar(ctx, sqlc.UpdateUserAvatarParams{
		UserID: userId_encrypted,
		FileName: sql.NullString{
			String: avatarFilenameEncrypted,
			Valid: true,
		},
		MimeType: sql.NullString{
			String: avatarImage.Mimetype,
			Valid: true,
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
	userId_encrypted, err := s.encryptString(userId)
	if err != nil {
		return err
	}

	// Delete the user with the matching encrypyted id
	err = s.db_queries.DeleteUserDetails(ctx, userId_encrypted)
	if err != nil {
		return err
	}

	// Delete the user's avatar with the matching encrypted id
	err = s.db_queries.DeleteUserAvatar(ctx, userId_encrypted)
	return err
}

// Roles
// Create a new role for a user, limited to one role per user
func (s *service) CreateNewUserRole(userId, role string) error {
	ctx := context.Background()

	// Encrypt user id
	userIdEncrypted, err := s.encryptString(userId)
	if err != nil {
		return err
	}

	// Encrypt the role
	roleEncrypted, err := s.encryptString(role)
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
	userIdEncrypted, err := s.encryptString(userId)
	if err != nil {
		return "", err
	}

	// Find the role for the user in the db
	userRole, err := s.db_queries.GetUserRole(ctx, userIdEncrypted)
	if err != nil {
		return "", err
	}

	// Decrypt the role
	roleDecrypted, err := s.decryptString(userRole.Role)
	if err != nil {
		return "", err
	}

	return roleDecrypted, nil
}

// Update a user's role
func (s *service) UpdateUserRole(userId, role string) error {
	ctx := context.Background()

	// Encrypt the user id
	userIdEncrypted, err := s.encryptString(userId)
	if err != nil {
		return err
	}

	// Encrypt the role
	roleEncrypted, err := s.encryptString(role)
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
	userIdEncrypted, err := s.encryptString(userId)
	if err != nil {
		return err
	}

	// Delete the user's role
	err = s.db_queries.DeleteUserRole(ctx, userIdEncrypted)
	return err
}

// Properties
// Just encrypt the lister user id
// all other fields can be in plaintext

// Create a row in both the properties and properties_images tables
func (s *service) CreateProperty(property Property) error {
	ctx := context.Background()

	// Encrypt the lister user id
	listerUserIdEncrypted, err := s.encryptString(property.ListerUserID)
	if err != nil {
		return err
	}

	// Insert property data into db
	err = s.db_queries.CreateProperty(ctx, sqlc.CreatePropertyParams{
		PropertyID:      property.PropertyID,
		ListerUserID:    listerUserIdEncrypted,
		Name:            property.Name,
		Description:     utils.CreateSQLNullString(property.Description),
		Address1:        property.Address_1,
		Address2:        utils.CreateSQLNullString(property.Address_2),
		City:            property.City,
		State:           property.State,
		Zipcode:         property.Zipcode,
		Country:         property.Country,
		SquareFeet:      property.Square_feet,
		NumBedrooms:     property.Num_bedrooms,
		NumToilets:      property.Num_toilets,
		NumShowersBaths: property.Num_showers_baths,
		CostDollars:     property.Cost_dollars,
		CostCents:       property.Cost_cents,
		MiscNote:        utils.CreateSQLNullString(property.Misc_note),
		Images:          utils.CreateSQLNullString(property.Images),
	})
	return err
}

// Find and return the property details given the property's id
func (s *service) GetProperty(propertyId string) (Property, error) {
	ctx := context.Background()

	// Get the property details
	property, err := s.db_queries.GetProperty(ctx, propertyId)
	if err != nil {
		return Property{}, err
	}

	// Decrypt the lister user id
	listerUserIDDecrypted, err := s.decryptString(property.ListerUserID)
	if err != nil {
		return Property{}, err
	}

	// Get the property images
	propertyImages, err := s.db_queries.GetPropertyImages(ctx, propertyId)
	if err != nil {
		return Property{}, err
	}

	fullProperty := Property{
		PropertyID:        propertyId,
		ListerUserID:      listerUserIDDecrypted,
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
		Images:            propertyImages.Images.String,
	}

	return fullProperty, nil
}

// Allow a public function to search for the available properties on app
func (s *service) GetNextPageProperties(limit, offset int32) ([]string, error) {
	ctx := context.Background()

	// Get the encrypted properties details
	propertyIDs, err := s.db_queries.GetNextPageProperties(ctx, sqlc.GetNextPagePropertiesParams{
		Limit:  limit,
		Offset: offset,
	})
	if err != nil {
		return nil, err
	}

	return propertyIDs, nil
}

// Update property
func (s *service) UpdateProperty(property Property) error {
	ctx := context.Background()

	// Encrypt the lister user id
	listerUserIDEncrypted, err := s.encryptString(property.ListerUserID)
	if err != nil {
		return err
	}

	// Construct the new property struct to insert into db
	err = s.db_queries.UpdateProperty(ctx, sqlc.UpdatePropertyParams{
		PropertyID:      property.PropertyID,
		ListerUserID:    listerUserIDEncrypted,
		Name:            property.Name,
		Description:     utils.CreateSQLNullString(property.Description),
		Address1:        property.Address_1,
		Address2:        utils.CreateSQLNullString(property.Address_2),
		City:            property.City,
		State:           property.State,
		Zipcode:         property.Zipcode,
		Country:         property.Country,
		SquareFeet:      property.Square_feet,
		NumBedrooms:     property.Num_bedrooms,
		NumToilets:      property.Num_toilets,
		NumShowersBaths: property.Num_showers_baths,
		CostDollars:     property.Cost_dollars,
		CostCents:       property.Cost_cents,
		MiscNote:        utils.CreateSQLNullString(property.Misc_note),
	})
	if err != nil {
		return err
	}

	// Construct the new property images struct to insert into db
	err = s.db_queries.UpdatePropertyImages(ctx, sqlc.UpdatePropertyImagesParams{
		PropertyID: property.PropertyID,
		Images:     utils.CreateSQLNullString(property.Images),
	})
	return err
}

// Delete property
func (s *service) DeleteProperty(propertyId string) error {
	ctx := context.Background()

	// Delete the property and the images (a single transaction)
	err := s.db_queries.DeleteProperty(ctx, propertyId)
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

// Admin - get multiple user ids
func (s *service) AdminGetUsersRoles(userIds []string) ([]string, error) {
	ctx := context.Background()

	// Encrypt the user ids
	var userIdsEncrypted []string
	for _, userId := range userIds {
		userIdEncrypted, err := s.encryptString(userId)
		if err != nil {
			return nil, err
		}
		userIdsEncrypted = append(userIdsEncrypted, userIdEncrypted)
	}

	// Get the roles for the users
	var userRolesEncrypted []sqlc.Role
	for _, userId := range userIdsEncrypted {
		role, err := s.db_queries.GetUserRole(ctx, userId)
		if err != nil {
			return nil, err
		}

		userRolesEncrypted = append(userRolesEncrypted, role)
	}

	// Decrypt the roles
	var userRoles []string
	for _, role := range userRolesEncrypted {
		roleDecrypted, err := s.decryptString(role.Role)
		if err != nil {
			return nil, err
		}
		userRoles = append(userRoles, roleDecrypted)
	}

	return userRoles, nil
}
