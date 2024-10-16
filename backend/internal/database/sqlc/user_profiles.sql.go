// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.26.0
// source: user_profiles.sql

package sqlc

import (
	"context"
)

const getNextPageOfPublicUsers = `-- name: GetNextPageOfPublicUsers :many
SELECT
    users.user_id
FROM
    users
    INNER JOIN users_status ON users.user_id = users_status.user_id
WHERE
    users_status.status = $3
    AND first_name IS NOT NULL
    AND last_name IS NOT NULL
    AND birth_date IS NOT NULL
    AND gender IS NOT NULL
    AND "location" IS NOT NULL
    AND interests IS NOT NULL
LIMIT
    $1
OFFSET
    $2
`

type GetNextPageOfPublicUsersParams struct {
	Limit  int32
	Offset int32
	Status string
}

// Public Users API Queries
func (q *Queries) GetNextPageOfPublicUsers(ctx context.Context, arg GetNextPageOfPublicUsersParams) ([]string, error) {
	rows, err := q.db.QueryContext(ctx, getNextPageOfPublicUsers, arg.Limit, arg.Offset, arg.Status)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []string
	for rows.Next() {
		var user_id string
		if err := rows.Scan(&user_id); err != nil {
			return nil, err
		}
		items = append(items, user_id)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getNextPageOfPublicUsersFilterByName = `-- name: GetNextPageOfPublicUsersFilterByName :many
SELECT
    users.user_id
FROM
    users
    INNER JOIN users_status ON users.user_id = users_status.user_id
WHERE
    users_status.status = $5
    AND first_name IS NOT NULL
    AND last_name IS NOT NULL
    AND birth_date IS NOT NULL
    AND gender IS NOT NULL
    AND "location" IS NOT NULL
    AND interests IS NOT NULL
ORDER BY
    0.5 * similarity ("first_name", $3) + 0.5 * similarity ("last_name", $4) DESC
LIMIT
    $1
OFFSET
    $2
`

type GetNextPageOfPublicUsersFilterByNameParams struct {
	Limit        int32
	Offset       int32
	Similarity   string
	Similarity_2 string
	Status       string
}

func (q *Queries) GetNextPageOfPublicUsersFilterByName(ctx context.Context, arg GetNextPageOfPublicUsersFilterByNameParams) ([]string, error) {
	rows, err := q.db.QueryContext(ctx, getNextPageOfPublicUsersFilterByName,
		arg.Limit,
		arg.Offset,
		arg.Similarity,
		arg.Similarity_2,
		arg.Status,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []string
	for rows.Next() {
		var user_id string
		if err := rows.Scan(&user_id); err != nil {
			return nil, err
		}
		items = append(items, user_id)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}
