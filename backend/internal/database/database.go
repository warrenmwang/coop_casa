package database

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

type Service interface {
	Health() map[string]string
	CreateUser(userId, email string) (sqlc.User, error)
	GetUser(userId string) (sqlc.User, error)
	UpdateUser(userId, first_name, last_name, birth_date, gender, location, interests, avatar string) error
	GetUserFirstName(userId string) (sql.NullString, error)
}

type service struct {
	db         *sql.DB
	db_queries *sqlc.Queries
}

func New() Service {
	database := os.Getenv("DB_DATABASE")
	password := os.Getenv("DB_PASSWORD")
	username := os.Getenv("DB_USERNAME")
	port := os.Getenv("DB_PORT")
	host := os.Getenv("DB_HOST")

	// Raw sql connection
	connStr := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable", username, password, host, port, database)
	db, err := sql.Open("pgx", connStr)
	if err != nil {
		log.Fatal(err)
	}

	// Instantiate the sqlc queries object for querying
	db_queries := sqlc.New(db)

	s := &service{
		db:         db,
		db_queries: db_queries,
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

func (s *service) CreateUser(userId, email string) (sqlc.User, error) {
	ctx := context.Background()

	// Create a User in the db
	createdUser, err := s.db_queries.CreateUser(ctx, sqlc.CreateUserParams{
		UserID: userId,
		Email:  email,
	})
	if err != nil {
		return sqlc.User{}, err
	}

	return createdUser, nil
}

func (s *service) GetUser(userId string) (sqlc.User, error) {
	// Get the user by the user Id if they exist, if not return with error
	ctx := context.Background()
	user, err := s.db_queries.GetUser(ctx, userId)
	if err != nil {
		return sqlc.User{}, err
	}
	return user, nil
}

func (s *service) GetUserFirstName(userId string) (sql.NullString, error) {
	// Get the user's first_name by the user Id if they exist, if not return with error
	ctx := context.Background()
	userFirstName, err := s.db_queries.GetUserFirstName(ctx, userId)
	if err != nil {
		return sql.NullString{}, err
	}
	return userFirstName, nil
}

func (s *service) UpdateUser(userId, first_name, last_name, birth_date, gender, location, interests, avatar string) error {
	ctx := context.Background()

	// Check if avatar is empty
	var avatarObj sql.NullString
	if avatar != "" {
		avatarObj = sql.NullString{
			String: avatar,
			Valid:  true,
		}
	} else {
		avatarObj = sql.NullString{
			String: "",
			Valid:  false,
		}
	}

	// Parse birthdate string into date format for database
	birthDateTime, err := utils.ParseStringToNullTime(birth_date)
	if err != nil {
		return err
	}

	// FIXME: For now, NO encryption, just store as raw user data for testing.
	err = s.db_queries.UpdateUser(ctx, sqlc.UpdateUserParams{
		UserID: userId,
		FirstName: sql.NullString{
			String: first_name,
			Valid:  true,
		},
		LastName: sql.NullString{
			String: last_name,
			Valid:  true,
		},
		BirthDate: sql.NullTime{
			Time:  birthDateTime,
			Valid: true,
		},
		Gender: sql.NullString{
			String: gender,
			Valid:  true,
		},
		Location: sql.NullString{
			String: location,
			Valid:  true,
		},
		Interests: sql.NullString{
			String: interests,
			Valid:  true,
		},
		Avatar: avatarObj,
	})
	if err != nil {
		return err
	}

	return nil
}
