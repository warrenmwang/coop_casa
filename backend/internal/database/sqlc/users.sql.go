// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.26.0
// source: users.sql

package sqlc

import (
	"context"
	"database/sql"
)

const createUser = `-- name: CreateUser :one
INSERT INTO users (user_id, email)
VALUES ($1, $2)
RETURNING id, user_id, email, first_name, last_name, birth_date, gender, avatar, location, interests, created_at
`

type CreateUserParams struct {
	UserID string
	Email  string
}

func (q *Queries) CreateUser(ctx context.Context, arg CreateUserParams) (User, error) {
	row := q.db.QueryRowContext(ctx, createUser, arg.UserID, arg.Email)
	var i User
	err := row.Scan(
		&i.ID,
		&i.UserID,
		&i.Email,
		&i.FirstName,
		&i.LastName,
		&i.BirthDate,
		&i.Gender,
		&i.Avatar,
		&i.Location,
		&i.Interests,
		&i.CreatedAt,
	)
	return i, err
}

const getUser = `-- name: GetUser :one
SELECT id, user_id, email, first_name, last_name, birth_date, gender, avatar, location, interests, created_at FROM users
WHERE user_id = $1
`

func (q *Queries) GetUser(ctx context.Context, userID string) (User, error) {
	row := q.db.QueryRowContext(ctx, getUser, userID)
	var i User
	err := row.Scan(
		&i.ID,
		&i.UserID,
		&i.Email,
		&i.FirstName,
		&i.LastName,
		&i.BirthDate,
		&i.Gender,
		&i.Avatar,
		&i.Location,
		&i.Interests,
		&i.CreatedAt,
	)
	return i, err
}

const getUserFirstName = `-- name: GetUserFirstName :one
SELECT first_name FROM users
WHERE user_id = $1
`

func (q *Queries) GetUserFirstName(ctx context.Context, userID string) (sql.NullString, error) {
	row := q.db.QueryRowContext(ctx, getUserFirstName, userID)
	var first_name sql.NullString
	err := row.Scan(&first_name)
	return first_name, err
}

const updateUser = `-- name: UpdateUser :exec
UPDATE users
SET first_name = $2, last_name = $3, birth_date = $4, gender = $5, "location" = $6, interests = $7, avatar = $8
WHERE user_id = $1
`

type UpdateUserParams struct {
	UserID    string
	FirstName sql.NullString
	LastName  sql.NullString
	BirthDate sql.NullTime
	Gender    sql.NullString
	Location  sql.NullString
	Interests sql.NullString
	Avatar    sql.NullString
}

func (q *Queries) UpdateUser(ctx context.Context, arg UpdateUserParams) error {
	_, err := q.db.ExecContext(ctx, updateUser,
		arg.UserID,
		arg.FirstName,
		arg.LastName,
		arg.BirthDate,
		arg.Gender,
		arg.Location,
		arg.Interests,
		arg.Avatar,
	)
	return err
}
