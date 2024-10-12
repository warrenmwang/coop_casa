// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.26.0
// source: users_status.sql

package sqlc

import (
	"context"
	"database/sql"
)

const createUserStatus = `-- name: CreateUserStatus :exec
INSERT INTO
    users_status (user_id, setter_user_id, status, comment)
VALUES
    ($1, $2, $3, $4)
`

type CreateUserStatusParams struct {
	UserID       string
	SetterUserID string
	Status       string
	Comment      sql.NullString
}

func (q *Queries) CreateUserStatus(ctx context.Context, arg CreateUserStatusParams) error {
	_, err := q.db.ExecContext(ctx, createUserStatus,
		arg.UserID,
		arg.SetterUserID,
		arg.Status,
		arg.Comment,
	)
	return err
}

const deleteUserStatus = `-- name: DeleteUserStatus :exec
DELETE FROM users_status
WHERE
    user_id = $1
`

func (q *Queries) DeleteUserStatus(ctx context.Context, userID string) error {
	_, err := q.db.ExecContext(ctx, deleteUserStatus, userID)
	return err
}

const getUserStatus = `-- name: GetUserStatus :one
SELECT
    id, user_id, setter_user_id, status, comment, created_at, updated_at
FROM
    users_status
WHERE
    user_id = $1
`

func (q *Queries) GetUserStatus(ctx context.Context, userID string) (UsersStatus, error) {
	row := q.db.QueryRowContext(ctx, getUserStatus, userID)
	var i UsersStatus
	err := row.Scan(
		&i.ID,
		&i.UserID,
		&i.SetterUserID,
		&i.Status,
		&i.Comment,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const updateUserStatus = `-- name: UpdateUserStatus :exec
UPDATE users_status
SET
    setter_user_id = $2,
    status = $3,
    comment = $4,
    updated_at = CURRENT_TIMESTAMP
WHERE
    user_id = $1
`

type UpdateUserStatusParams struct {
	UserID       string
	SetterUserID string
	Status       string
	Comment      sql.NullString
}

func (q *Queries) UpdateUserStatus(ctx context.Context, arg UpdateUserStatusParams) error {
	_, err := q.db.ExecContext(ctx, updateUserStatus,
		arg.UserID,
		arg.SetterUserID,
		arg.Status,
		arg.Comment,
	)
	return err
}
