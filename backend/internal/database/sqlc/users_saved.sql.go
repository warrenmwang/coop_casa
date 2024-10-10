// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.26.0
// source: users_saved.sql

package sqlc

import (
	"context"
)

const createUserSavedCommunity = `-- name: CreateUserSavedCommunity :exec
INSERT INTO
    users_saved_communities (user_id, community_id)
VALUES
    ($1, $2)
`

type CreateUserSavedCommunityParams struct {
	UserID      string
	CommunityID string
}

func (q *Queries) CreateUserSavedCommunity(ctx context.Context, arg CreateUserSavedCommunityParams) error {
	_, err := q.db.ExecContext(ctx, createUserSavedCommunity, arg.UserID, arg.CommunityID)
	return err
}

const createUserSavedProperty = `-- name: CreateUserSavedProperty :exec
INSERT INTO
    users_saved_properties (user_id, property_id)
VALUES
    ($1, $2)
`

type CreateUserSavedPropertyParams struct {
	UserID     string
	PropertyID string
}

func (q *Queries) CreateUserSavedProperty(ctx context.Context, arg CreateUserSavedPropertyParams) error {
	_, err := q.db.ExecContext(ctx, createUserSavedProperty, arg.UserID, arg.PropertyID)
	return err
}

const createUserSavedUser = `-- name: CreateUserSavedUser :exec
INSERT INTO
    users_saved_users (user_id, saved_user_id)
VALUES
    ($1, $2)
`

type CreateUserSavedUserParams struct {
	UserID      string
	SavedUserID string
}

func (q *Queries) CreateUserSavedUser(ctx context.Context, arg CreateUserSavedUserParams) error {
	_, err := q.db.ExecContext(ctx, createUserSavedUser, arg.UserID, arg.SavedUserID)
	return err
}

const deleteUserSavedCommunities = `-- name: DeleteUserSavedCommunities :exec
DELETE FROM users_saved_communities
WHERE
    user_id = $1
`

// Delete's all of the user's saved communities.
func (q *Queries) DeleteUserSavedCommunities(ctx context.Context, userID string) error {
	_, err := q.db.ExecContext(ctx, deleteUserSavedCommunities, userID)
	return err
}

const deleteUserSavedCommunity = `-- name: DeleteUserSavedCommunity :exec
DELETE FROM users_saved_communities
WHERE
    user_id = $1
    AND community_id = $2
`

type DeleteUserSavedCommunityParams struct {
	UserID      string
	CommunityID string
}

func (q *Queries) DeleteUserSavedCommunity(ctx context.Context, arg DeleteUserSavedCommunityParams) error {
	_, err := q.db.ExecContext(ctx, deleteUserSavedCommunity, arg.UserID, arg.CommunityID)
	return err
}

const deleteUserSavedProperties = `-- name: DeleteUserSavedProperties :exec
DELETE FROM users_saved_properties
WHERE
    user_id = $1
`

// Delete's all of the user's saved properties.
func (q *Queries) DeleteUserSavedProperties(ctx context.Context, userID string) error {
	_, err := q.db.ExecContext(ctx, deleteUserSavedProperties, userID)
	return err
}

const deleteUserSavedProperty = `-- name: DeleteUserSavedProperty :exec
DELETE FROM users_saved_properties
WHERE
    user_id = $1
    AND property_id = $2
`

type DeleteUserSavedPropertyParams struct {
	UserID     string
	PropertyID string
}

// Deleters
func (q *Queries) DeleteUserSavedProperty(ctx context.Context, arg DeleteUserSavedPropertyParams) error {
	_, err := q.db.ExecContext(ctx, deleteUserSavedProperty, arg.UserID, arg.PropertyID)
	return err
}

const deleteUserSavedUser = `-- name: DeleteUserSavedUser :exec
DELETE FROM users_saved_users
WHERE
    user_id = $1
    AND saved_user_id = $2
`

type DeleteUserSavedUserParams struct {
	UserID      string
	SavedUserID string
}

func (q *Queries) DeleteUserSavedUser(ctx context.Context, arg DeleteUserSavedUserParams) error {
	_, err := q.db.ExecContext(ctx, deleteUserSavedUser, arg.UserID, arg.SavedUserID)
	return err
}

const deleteUserSavedUsers = `-- name: DeleteUserSavedUsers :exec
DELETE FROM users_saved_users
WHERE
    user_id = $1
`

// Delete's all of the user's saved users.
func (q *Queries) DeleteUserSavedUsers(ctx context.Context, userID string) error {
	_, err := q.db.ExecContext(ctx, deleteUserSavedUsers, userID)
	return err
}

const getUserSavedCommunities = `-- name: GetUserSavedCommunities :many
SELECT
    id, user_id, community_id, created_at
FROM
    users_saved_communities
WHERE
    user_id = $1
`

func (q *Queries) GetUserSavedCommunities(ctx context.Context, userID string) ([]UsersSavedCommunity, error) {
	rows, err := q.db.QueryContext(ctx, getUserSavedCommunities, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []UsersSavedCommunity
	for rows.Next() {
		var i UsersSavedCommunity
		if err := rows.Scan(
			&i.ID,
			&i.UserID,
			&i.CommunityID,
			&i.CreatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getUserSavedProperties = `-- name: GetUserSavedProperties :many
SELECT
    id, user_id, property_id, created_at
FROM
    users_saved_properties
WHERE
    user_id = $1
`

func (q *Queries) GetUserSavedProperties(ctx context.Context, userID string) ([]UsersSavedProperty, error) {
	rows, err := q.db.QueryContext(ctx, getUserSavedProperties, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []UsersSavedProperty
	for rows.Next() {
		var i UsersSavedProperty
		if err := rows.Scan(
			&i.ID,
			&i.UserID,
			&i.PropertyID,
			&i.CreatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getUserSavedUsers = `-- name: GetUserSavedUsers :many
SELECT
    id, user_id, saved_user_id, created_at
FROM
    users_saved_users
WHERE
    user_id = $1
`

func (q *Queries) GetUserSavedUsers(ctx context.Context, userID string) ([]UsersSavedUser, error) {
	rows, err := q.db.QueryContext(ctx, getUserSavedUsers, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []UsersSavedUser
	for rows.Next() {
		var i UsersSavedUser
		if err := rows.Scan(
			&i.ID,
			&i.UserID,
			&i.SavedUserID,
			&i.CreatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}
