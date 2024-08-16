// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.26.0
// source: communities.sql

package sqlc

import (
	"context"
	"database/sql"
)

const createCommunityDetails = `-- name: CreateCommunityDetails :exec
INSERT INTO communities(community_id, admin_user_id, "name", "description")
    VALUES ($1, $2, $3, $4)
`

type CreateCommunityDetailsParams struct {
	CommunityID string
	AdminUserID string
	Name        string
	Description sql.NullString
}

func (q *Queries) CreateCommunityDetails(ctx context.Context, arg CreateCommunityDetailsParams) error {
	_, err := q.db.ExecContext(ctx, createCommunityDetails,
		arg.CommunityID,
		arg.AdminUserID,
		arg.Name,
		arg.Description,
	)
	return err
}

const createCommunityImage = `-- name: CreateCommunityImage :exec
INSERT INTO communities_images(community_id, file_name, mime_type, "size", "data")
    VALUES ($1, $2, $3, $4, $5)
`

type CreateCommunityImageParams struct {
	CommunityID string
	FileName    string
	MimeType    string
	Size        int64
	Data        []byte
}

func (q *Queries) CreateCommunityImage(ctx context.Context, arg CreateCommunityImageParams) error {
	_, err := q.db.ExecContext(ctx, createCommunityImage,
		arg.CommunityID,
		arg.FileName,
		arg.MimeType,
		arg.Size,
		arg.Data,
	)
	return err
}

const createCommunityProperty = `-- name: CreateCommunityProperty :exec
INSERT INTO communities_properties(community_id, property_id)
    VALUES ($1, $2)
`

type CreateCommunityPropertyParams struct {
	CommunityID string
	PropertyID  string
}

func (q *Queries) CreateCommunityProperty(ctx context.Context, arg CreateCommunityPropertyParams) error {
	_, err := q.db.ExecContext(ctx, createCommunityProperty, arg.CommunityID, arg.PropertyID)
	return err
}

const createCommunityUser = `-- name: CreateCommunityUser :exec
INSERT INTO communities_users(community_id, user_id)
    VALUES ($1, $2)
`

type CreateCommunityUserParams struct {
	CommunityID string
	UserID      string
}

func (q *Queries) CreateCommunityUser(ctx context.Context, arg CreateCommunityUserParams) error {
	_, err := q.db.ExecContext(ctx, createCommunityUser, arg.CommunityID, arg.UserID)
	return err
}

const deleteCommunity = `-- name: DeleteCommunity :exec
DELETE FROM communities
WHERE community_id = $1
`

func (q *Queries) DeleteCommunity(ctx context.Context, communityID string) error {
	_, err := q.db.ExecContext(ctx, deleteCommunity, communityID)
	return err
}

const deleteCommunityImages = `-- name: DeleteCommunityImages :exec
DELETE FROM communities_images
WHERE community_id = $1
`

func (q *Queries) DeleteCommunityImages(ctx context.Context, communityID string) error {
	_, err := q.db.ExecContext(ctx, deleteCommunityImages, communityID)
	return err
}

const deleteCommunityProperties = `-- name: DeleteCommunityProperties :exec
DELETE FROM communities_properties
WHERE community_id = $1
`

func (q *Queries) DeleteCommunityProperties(ctx context.Context, communityID string) error {
	_, err := q.db.ExecContext(ctx, deleteCommunityProperties, communityID)
	return err
}

const deleteCommunityProperty = `-- name: DeleteCommunityProperty :exec
DELETE FROM communities_properties
WHERE community_id = $1
    AND property_id = $2
`

type DeleteCommunityPropertyParams struct {
	CommunityID string
	PropertyID  string
}

func (q *Queries) DeleteCommunityProperty(ctx context.Context, arg DeleteCommunityPropertyParams) error {
	_, err := q.db.ExecContext(ctx, deleteCommunityProperty, arg.CommunityID, arg.PropertyID)
	return err
}

const deleteCommunityUser = `-- name: DeleteCommunityUser :exec
DELETE FROM communities_users
WHERE community_id = $1
    AND user_id = $2
`

type DeleteCommunityUserParams struct {
	CommunityID string
	UserID      string
}

func (q *Queries) DeleteCommunityUser(ctx context.Context, arg DeleteCommunityUserParams) error {
	_, err := q.db.ExecContext(ctx, deleteCommunityUser, arg.CommunityID, arg.UserID)
	return err
}

const deleteCommunityUsers = `-- name: DeleteCommunityUsers :exec
DELETE FROM communities_users
WHERE community_id = $1
`

func (q *Queries) DeleteCommunityUsers(ctx context.Context, communityID string) error {
	_, err := q.db.ExecContext(ctx, deleteCommunityUsers, communityID)
	return err
}

const getCommunityDetails = `-- name: GetCommunityDetails :one
SELECT
    id, community_id, admin_user_id, name, description, created_at, updated_at
FROM
    communities
WHERE
    community_id = $1
`

func (q *Queries) GetCommunityDetails(ctx context.Context, communityID string) (Community, error) {
	row := q.db.QueryRowContext(ctx, getCommunityDetails, communityID)
	var i Community
	err := row.Scan(
		&i.ID,
		&i.CommunityID,
		&i.AdminUserID,
		&i.Name,
		&i.Description,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const getCommunityImages = `-- name: GetCommunityImages :many
SELECT
    id, community_id, file_name, mime_type, size, data, updated_at
FROM
    communities_images
WHERE
    community_id = $1
`

func (q *Queries) GetCommunityImages(ctx context.Context, communityID string) ([]CommunitiesImage, error) {
	rows, err := q.db.QueryContext(ctx, getCommunityImages, communityID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []CommunitiesImage
	for rows.Next() {
		var i CommunitiesImage
		if err := rows.Scan(
			&i.ID,
			&i.CommunityID,
			&i.FileName,
			&i.MimeType,
			&i.Size,
			&i.Data,
			&i.UpdatedAt,
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

const getCommunityProperties = `-- name: GetCommunityProperties :many
SELECT
    id, community_id, property_id
FROM
    communities_properties
WHERE
    community_id = $1
`

func (q *Queries) GetCommunityProperties(ctx context.Context, communityID string) ([]CommunitiesProperty, error) {
	rows, err := q.db.QueryContext(ctx, getCommunityProperties, communityID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []CommunitiesProperty
	for rows.Next() {
		var i CommunitiesProperty
		if err := rows.Scan(&i.ID, &i.CommunityID, &i.PropertyID); err != nil {
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

const getCommunityUsers = `-- name: GetCommunityUsers :many
SELECT
    id, community_id, user_id
FROM
    communities_users
WHERE
    community_id = $1
`

func (q *Queries) GetCommunityUsers(ctx context.Context, communityID string) ([]CommunitiesUser, error) {
	rows, err := q.db.QueryContext(ctx, getCommunityUsers, communityID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []CommunitiesUser
	for rows.Next() {
		var i CommunitiesUser
		if err := rows.Scan(&i.ID, &i.CommunityID, &i.UserID); err != nil {
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

const getNextPageCommunities = `-- name: GetNextPageCommunities :many
SELECT
    community_id
FROM
    communities
ORDER BY
    id
LIMIT $1 OFFSET $2
`

type GetNextPageCommunitiesParams struct {
	Limit  int32
	Offset int32
}

func (q *Queries) GetNextPageCommunities(ctx context.Context, arg GetNextPageCommunitiesParams) ([]string, error) {
	rows, err := q.db.QueryContext(ctx, getNextPageCommunities, arg.Limit, arg.Offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []string
	for rows.Next() {
		var community_id string
		if err := rows.Scan(&community_id); err != nil {
			return nil, err
		}
		items = append(items, community_id)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getNextPageCommunitiesFilterByDescription = `-- name: GetNextPageCommunitiesFilterByDescription :many
SELECT
    community_id
FROM
    communities
ORDER BY
    similarity("description", $3) DESC
LIMIT $1 OFFSET $2
`

type GetNextPageCommunitiesFilterByDescriptionParams struct {
	Limit      int32
	Offset     int32
	Similarity string
}

func (q *Queries) GetNextPageCommunitiesFilterByDescription(ctx context.Context, arg GetNextPageCommunitiesFilterByDescriptionParams) ([]string, error) {
	rows, err := q.db.QueryContext(ctx, getNextPageCommunitiesFilterByDescription, arg.Limit, arg.Offset, arg.Similarity)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []string
	for rows.Next() {
		var community_id string
		if err := rows.Scan(&community_id); err != nil {
			return nil, err
		}
		items = append(items, community_id)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getNextPageCommunitiesFilterByName = `-- name: GetNextPageCommunitiesFilterByName :many
SELECT
    community_id
FROM
    communities
ORDER BY
    similarity("name", $3) DESC
LIMIT $1 OFFSET $2
`

type GetNextPageCommunitiesFilterByNameParams struct {
	Limit      int32
	Offset     int32
	Similarity string
}

// thinking like be able to search by 2 things: name of community and something from the description
// the way we return an ordering of communities will be by a weighted objective function
// like ( name_weight * name_match_score + description_weight * description_match_score )
// where name_weight and description_weight are chosen by us.
// and the scores are calculated using something like similarity edit distance between the search term
// and the actual values from the db.
func (q *Queries) GetNextPageCommunitiesFilterByName(ctx context.Context, arg GetNextPageCommunitiesFilterByNameParams) ([]string, error) {
	rows, err := q.db.QueryContext(ctx, getNextPageCommunitiesFilterByName, arg.Limit, arg.Offset, arg.Similarity)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []string
	for rows.Next() {
		var community_id string
		if err := rows.Scan(&community_id); err != nil {
			return nil, err
		}
		items = append(items, community_id)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getNextPageCommunitiesFilteredByCombination = `-- name: GetNextPageCommunitiesFilteredByCombination :many
SELECT
    community_id
FROM
    communities
ORDER BY
    0.4 * similarity("name", $3) + 0.6 * similarity("description", $4) DESC
LIMIT $1 OFFSET $2
`

type GetNextPageCommunitiesFilteredByCombinationParams struct {
	Limit        int32
	Offset       int32
	Similarity   string
	Similarity_2 string
}

func (q *Queries) GetNextPageCommunitiesFilteredByCombination(ctx context.Context, arg GetNextPageCommunitiesFilteredByCombinationParams) ([]string, error) {
	rows, err := q.db.QueryContext(ctx, getNextPageCommunitiesFilteredByCombination,
		arg.Limit,
		arg.Offset,
		arg.Similarity,
		arg.Similarity_2,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []string
	for rows.Next() {
		var community_id string
		if err := rows.Scan(&community_id); err != nil {
			return nil, err
		}
		items = append(items, community_id)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getUserOwnedCommunities = `-- name: GetUserOwnedCommunities :many
SELECT
    community_id
FROM
    communities
WHERE
    admin_user_id = $1
`

func (q *Queries) GetUserOwnedCommunities(ctx context.Context, adminUserID string) ([]string, error) {
	rows, err := q.db.QueryContext(ctx, getUserOwnedCommunities, adminUserID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []string
	for rows.Next() {
		var community_id string
		if err := rows.Scan(&community_id); err != nil {
			return nil, err
		}
		items = append(items, community_id)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const updateCommunityDetails = `-- name: UpdateCommunityDetails :exec
UPDATE
    communities
SET
    admin_user_id = $2,
    "name" = $3,
    "description" = $4,
    updated_at = CURRENT_TIMESTAMP
WHERE
    community_id = $1
`

type UpdateCommunityDetailsParams struct {
	CommunityID string
	AdminUserID string
	Name        string
	Description sql.NullString
}

func (q *Queries) UpdateCommunityDetails(ctx context.Context, arg UpdateCommunityDetailsParams) error {
	_, err := q.db.ExecContext(ctx, updateCommunityDetails,
		arg.CommunityID,
		arg.AdminUserID,
		arg.Name,
		arg.Description,
	)
	return err
}