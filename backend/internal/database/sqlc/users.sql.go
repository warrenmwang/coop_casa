// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.26.0
// source: users.sql

package sqlc

import (
	"context"
	"database/sql"

	"github.com/lib/pq"
)

const createBareUser = `-- name: CreateBareUser :exec
INSERT INTO
    users (user_id, email)
VALUES
    ($1, $2)
`

type CreateBareUserParams struct {
	UserID string
	Email  string
}

// Private Users API Queries (for each account)
func (q *Queries) CreateBareUser(ctx context.Context, arg CreateBareUserParams) error {
	_, err := q.db.ExecContext(ctx, createBareUser, arg.UserID, arg.Email)
	return err
}

const createBareUserAvatar = `-- name: CreateBareUserAvatar :exec
INSERT INTO
    users_avatars (user_id)
VALUES
    ($1)
`

func (q *Queries) CreateBareUserAvatar(ctx context.Context, userID string) error {
	_, err := q.db.ExecContext(ctx, createBareUserAvatar, userID)
	return err
}

const deleteUserAvatar = `-- name: DeleteUserAvatar :exec
DELETE FROM users_avatars
WHERE
    user_id = $1
`

func (q *Queries) DeleteUserAvatar(ctx context.Context, userID string) error {
	_, err := q.db.ExecContext(ctx, deleteUserAvatar, userID)
	return err
}

const deleteUserDetails = `-- name: DeleteUserDetails :exec
DELETE FROM users
WHERE
    user_id = $1
`

func (q *Queries) DeleteUserDetails(ctx context.Context, userID string) error {
	_, err := q.db.ExecContext(ctx, deleteUserDetails, userID)
	return err
}

const getUserAvatar = `-- name: GetUserAvatar :one
SELECT
    id, user_id, file_name, mime_type, size, data, updated_at
FROM
    users_avatars
WHERE
    user_id = $1
`

func (q *Queries) GetUserAvatar(ctx context.Context, userID string) (UsersAvatar, error) {
	row := q.db.QueryRowContext(ctx, getUserAvatar, userID)
	var i UsersAvatar
	err := row.Scan(
		&i.ID,
		&i.UserID,
		&i.FileName,
		&i.MimeType,
		&i.Size,
		&i.Data,
		&i.UpdatedAt,
	)
	return i, err
}

const getUserDetails = `-- name: GetUserDetails :one
SELECT
    id, user_id, email, first_name, last_name, birth_date, gender, location, interests, created_at, updated_at
FROM
    users
WHERE
    user_id = $1
`

func (q *Queries) GetUserDetails(ctx context.Context, userID string) (User, error) {
	row := q.db.QueryRowContext(ctx, getUserDetails, userID)
	var i User
	err := row.Scan(
		&i.ID,
		&i.UserID,
		&i.Email,
		&i.FirstName,
		&i.LastName,
		&i.BirthDate,
		&i.Gender,
		&i.Location,
		pq.Array(&i.Interests),
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const updateUserAvatar = `-- name: UpdateUserAvatar :exec
UPDATE users_avatars
SET
    file_name = $2,
    mime_type = $3,
    "size" = $4,
    "data" = $5,
    updated_at = CURRENT_TIMESTAMP
WHERE
    user_id = $1
`

type UpdateUserAvatarParams struct {
	UserID   string
	FileName sql.NullString
	MimeType sql.NullString
	Size     sql.NullInt64
	Data     []byte
}

func (q *Queries) UpdateUserAvatar(ctx context.Context, arg UpdateUserAvatarParams) error {
	_, err := q.db.ExecContext(ctx, updateUserAvatar,
		arg.UserID,
		arg.FileName,
		arg.MimeType,
		arg.Size,
		arg.Data,
	)
	return err
}

const updateUserDetails = `-- name: UpdateUserDetails :exec
UPDATE users
SET
    first_name = $2,
    last_name = $3,
    birth_date = $4,
    gender = $5,
    "location" = $6,
    interests = $7,
    updated_at = CURRENT_TIMESTAMP
WHERE
    user_id = $1
`

type UpdateUserDetailsParams struct {
	UserID    string
	FirstName sql.NullString
	LastName  sql.NullString
	BirthDate sql.NullString
	Gender    sql.NullString
	Location  sql.NullString
	Interests []string
}

func (q *Queries) UpdateUserDetails(ctx context.Context, arg UpdateUserDetailsParams) error {
	_, err := q.db.ExecContext(ctx, updateUserDetails,
		arg.UserID,
		arg.FirstName,
		arg.LastName,
		arg.BirthDate,
		arg.Gender,
		arg.Location,
		pq.Array(arg.Interests),
	)
	return err
}
