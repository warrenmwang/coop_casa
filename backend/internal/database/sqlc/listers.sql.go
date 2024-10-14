// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.26.0
// source: listers.sql

package sqlc

import (
	"context"
	"database/sql"
)

const getManyListerInformation = `-- name: GetManyListerInformation :many
SELECT
    users.user_id,
    users.email,
    users.first_name,
    users.last_name
FROM
    users
    JOIN roles ON users.user_id = roles.user_id
WHERE
    roles.role = $4
ORDER BY
    similarity (
        CONCAT(users.first_name, ' ', users.last_name),
        $3
    ) DESC
LIMIT
    $1
OFFSET
    $2
`

type GetManyListerInformationParams struct {
	Limit      int32
	Offset     int32
	Similarity string
	Role       string
}

type GetManyListerInformationRow struct {
	UserID    string
	Email     string
	FirstName sql.NullString
	LastName  sql.NullString
}

func (q *Queries) GetManyListerInformation(ctx context.Context, arg GetManyListerInformationParams) ([]GetManyListerInformationRow, error) {
	rows, err := q.db.QueryContext(ctx, getManyListerInformation,
		arg.Limit,
		arg.Offset,
		arg.Similarity,
		arg.Role,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []GetManyListerInformationRow
	for rows.Next() {
		var i GetManyListerInformationRow
		if err := rows.Scan(
			&i.UserID,
			&i.Email,
			&i.FirstName,
			&i.LastName,
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