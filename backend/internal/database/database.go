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

type User_New struct {
	UserID    string `json:"userId"`
	Email     string `json:"email"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	BirthDate string `json:"birthDate"`
	Gender    string `json:"gender"`
	Location  string `json:"location"`
	Interests string `json:"interests"`
	Avatar    string `json:"avatar"`
}

type Service interface {
	Health() map[string]string
	CreateUser(userId, email string) error
	GetUser(userId string) (sqlc.User, error)
	UpdateUser(updatedUserData User_New) error
	DeleteUser(userId string) error
	GetUserAvatar(userId string) (string, error)
}

type service struct {
	db             *sql.DB
	db_queries     *sqlc.Queries
	db_encrypt_key string
}

func (s *service) decryptNullString(encrypted sql.NullString) (sql.NullString, error) {
	if encrypted.Valid {
		decrypted, err := utils.Decrypt(encrypted.String, s.db_encrypt_key)
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

	decrypted, err := utils.Decrypt(encrypted, s.db_encrypt_key)
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

	encrypted, err := utils.Encrypt(plainText.String, s.db_encrypt_key)
	if err != nil {
		return sql.NullString{}, err
	}

	return sql.NullString{
		String: encrypted,
		Valid:  true,
	}, nil
}

func (s *service) encryptString(plainText string) (string, error) {
	encrypted, err := utils.Encrypt(plainText, s.db_encrypt_key)
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
	err = s.db_queries.CreateUser(ctx, sqlc.CreateUserParams{
		UserID: userId_encrypted,
		Email:  email_encrypted,
		Avatar: sql.NullString{
			String: "",
			Valid:  false,
		},
	})
	if err != nil {
		return err
	}

	return nil
}

func (s *service) GetUser(userId string) (sqlc.User, error) {
	ctx := context.Background()

	// Need to use the encrypted userId to search
	userId_encrypted, err := s.encryptString(userId)
	if err != nil {
		return sqlc.User{}, err
	}

	user_encrypted, err := s.db_queries.GetUser(ctx, userId_encrypted)
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

func (s *service) GetUserAvatar(userId string) (string, error) {
	ctx := context.Background()

	// Encrypt userId
	userId_encrypted, err := s.encryptString(userId)
	if err != nil {
		return "", err
	}

	// Get encrypted avatar image by searching with the encrypted user id
	avatar_encrypted, err := s.db_queries.GetUserAvatar(ctx, userId_encrypted)
	if err != nil {
		return "", err
	}

	// Decrypt avatar image
	avatar_decrypted, err := s.decryptNullString(avatar_encrypted)
	if err != nil {
		return "", err
	}

	// Return decrypted user's avatar image (base64 encoded string)
	return avatar_decrypted.String, nil
}

func (s *service) UpdateUser(updatedUserData User_New) error {
	ctx := context.Background()

	userId := updatedUserData.UserID
	first_name := updatedUserData.FirstName
	last_name := updatedUserData.LastName
	birth_date := updatedUserData.BirthDate
	gender := updatedUserData.Gender
	location := updatedUserData.Location
	interests := updatedUserData.Interests
	avatar := updatedUserData.Avatar

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

	avatar_encrypted, err := s.encryptNullString(sql.NullString{String: avatar, Valid: true})
	if err != nil {
		return err
	}

	// Store encrypted user data in db
	// Small information
	err = s.db_queries.UpdateUser(ctx, sqlc.UpdateUserParams{
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
		Avatar: avatar_encrypted,
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
	err = s.db_queries.DeleteUser(ctx, userId_encrypted)
	if err != nil {
		return err
	}

	// Delete the user's avatar with the matching encrypted id
	err = s.db_queries.DeleteUserAvatar(ctx, userId_encrypted)
	return err
}
