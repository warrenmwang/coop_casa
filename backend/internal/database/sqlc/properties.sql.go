// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.26.0
// source: properties.sql

package sqlc

import (
	"context"
	"database/sql"
)

const checkIsPropertyDuplicate = `-- name: CheckIsPropertyDuplicate :one
SELECT
    count(*)
FROM
    properties
WHERE
    (
        lower(trim(address_1)) = lower(trim($1))
        AND lower(trim(coalesce(address_2, ''))) = lower(trim($2))
        AND lower(trim(city)) = lower(trim($3))
        AND lower(trim("state")) = lower(trim($4))
        AND lower(trim(zipcode)) = lower(trim($5))
        AND lower(trim(country)) = lower(trim($6))
    )
`

type CheckIsPropertyDuplicateParams struct {
	Btrim   string
	Btrim_2 string
	Btrim_3 string
	Btrim_4 string
	Btrim_5 string
	Btrim_6 string
}

func (q *Queries) CheckIsPropertyDuplicate(ctx context.Context, arg CheckIsPropertyDuplicateParams) (int64, error) {
	row := q.db.QueryRowContext(ctx, checkIsPropertyDuplicate,
		arg.Btrim,
		arg.Btrim_2,
		arg.Btrim_3,
		arg.Btrim_4,
		arg.Btrim_5,
		arg.Btrim_6,
	)
	var count int64
	err := row.Scan(&count)
	return count, err
}

const createPropertyDetails = `-- name: CreatePropertyDetails :exec
INSERT INTO
    properties (
        property_id,
        lister_user_id,
        "name",
        "description",
        address_1,
        address_2,
        city,
        "state",
        zipcode,
        country,
        square_feet,
        num_bedrooms,
        num_toilets,
        num_showers_baths,
        cost_dollars,
        cost_cents,
        misc_note
    )
VALUES
    (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12,
        $13,
        $14,
        $15,
        $16,
        $17
    )
`

type CreatePropertyDetailsParams struct {
	PropertyID      string
	ListerUserID    string
	Name            string
	Description     sql.NullString
	Address1        string
	Address2        sql.NullString
	City            string
	State           string
	Zipcode         string
	Country         string
	SquareFeet      int32
	NumBedrooms     int16
	NumToilets      int16
	NumShowersBaths int16
	CostDollars     int64
	CostCents       int16
	MiscNote        sql.NullString
}

func (q *Queries) CreatePropertyDetails(ctx context.Context, arg CreatePropertyDetailsParams) error {
	_, err := q.db.ExecContext(ctx, createPropertyDetails,
		arg.PropertyID,
		arg.ListerUserID,
		arg.Name,
		arg.Description,
		arg.Address1,
		arg.Address2,
		arg.City,
		arg.State,
		arg.Zipcode,
		arg.Country,
		arg.SquareFeet,
		arg.NumBedrooms,
		arg.NumToilets,
		arg.NumShowersBaths,
		arg.CostDollars,
		arg.CostCents,
		arg.MiscNote,
	)
	return err
}

const createPropertyImage = `-- name: CreatePropertyImage :exec
INSERT INTO
    properties_images (
        property_id,
        order_num,
        file_name,
        mime_type,
        "size",
        "data"
    )
VALUES
    ($1, $2, $3, $4, $5, $6)
`

type CreatePropertyImageParams struct {
	PropertyID string
	OrderNum   int16
	FileName   string
	MimeType   string
	Size       int64
	Data       []byte
}

func (q *Queries) CreatePropertyImage(ctx context.Context, arg CreatePropertyImageParams) error {
	_, err := q.db.ExecContext(ctx, createPropertyImage,
		arg.PropertyID,
		arg.OrderNum,
		arg.FileName,
		arg.MimeType,
		arg.Size,
		arg.Data,
	)
	return err
}

const deleteListerProperties = `-- name: DeleteListerProperties :exec
DELETE FROM properties
WHERE
    lister_user_id = $1
`

func (q *Queries) DeleteListerProperties(ctx context.Context, listerUserID string) error {
	_, err := q.db.ExecContext(ctx, deleteListerProperties, listerUserID)
	return err
}

const deletePropertyDetails = `-- name: DeletePropertyDetails :exec
DELETE FROM properties
WHERE
    property_id = $1
`

func (q *Queries) DeletePropertyDetails(ctx context.Context, propertyID string) error {
	_, err := q.db.ExecContext(ctx, deletePropertyDetails, propertyID)
	return err
}

const deletePropertyImage = `-- name: DeletePropertyImage :exec
DELETE FROM properties_images
WHERE
    property_id = $1
    AND order_num = $2
`

type DeletePropertyImageParams struct {
	PropertyID string
	OrderNum   int16
}

func (q *Queries) DeletePropertyImage(ctx context.Context, arg DeletePropertyImageParams) error {
	_, err := q.db.ExecContext(ctx, deletePropertyImage, arg.PropertyID, arg.OrderNum)
	return err
}

const deletePropertyImages = `-- name: DeletePropertyImages :exec
DELETE FROM properties_images
WHERE
    property_id = $1
`

func (q *Queries) DeletePropertyImages(ctx context.Context, propertyID string) error {
	_, err := q.db.ExecContext(ctx, deletePropertyImages, propertyID)
	return err
}

const getNextPageProperties = `-- name: GetNextPageProperties :many
SELECT
    property_id
FROM
    properties
ORDER BY
    CASE
        WHEN $3 <> '' THEN similarity (
            CONCAT(
                address_1,
                ', ',
                address_2,
                ', ',
                city,
                ', ',
                zipcode,
                ', ',
                country
            ),
            $3
        )
        ELSE 1
    END DESC
LIMIT
    $1
OFFSET
    $2
`

type GetNextPagePropertiesParams struct {
	Limit   int32
	Offset  int32
	Column3 interface{}
}

func (q *Queries) GetNextPageProperties(ctx context.Context, arg GetNextPagePropertiesParams) ([]string, error) {
	rows, err := q.db.QueryContext(ctx, getNextPageProperties, arg.Limit, arg.Offset, arg.Column3)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []string
	for rows.Next() {
		var property_id string
		if err := rows.Scan(&property_id); err != nil {
			return nil, err
		}
		items = append(items, property_id)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getProperty = `-- name: GetProperty :one
SELECT
    id, property_id, lister_user_id, name, description, address_1, address_2, city, state, zipcode, country, square_feet, num_bedrooms, num_toilets, num_showers_baths, cost_dollars, cost_cents, misc_note, created_at, updated_at
FROM
    properties
WHERE
    property_id = $1
`

func (q *Queries) GetProperty(ctx context.Context, propertyID string) (Property, error) {
	row := q.db.QueryRowContext(ctx, getProperty, propertyID)
	var i Property
	err := row.Scan(
		&i.ID,
		&i.PropertyID,
		&i.ListerUserID,
		&i.Name,
		&i.Description,
		&i.Address1,
		&i.Address2,
		&i.City,
		&i.State,
		&i.Zipcode,
		&i.Country,
		&i.SquareFeet,
		&i.NumBedrooms,
		&i.NumToilets,
		&i.NumShowersBaths,
		&i.CostDollars,
		&i.CostCents,
		&i.MiscNote,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const getPropertyImages = `-- name: GetPropertyImages :many
SELECT
    id, property_id, order_num, file_name, mime_type, size, data, created_at
FROM
    properties_images
WHERE
    property_id = $1
`

func (q *Queries) GetPropertyImages(ctx context.Context, propertyID string) ([]PropertiesImage, error) {
	rows, err := q.db.QueryContext(ctx, getPropertyImages, propertyID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []PropertiesImage
	for rows.Next() {
		var i PropertiesImage
		if err := rows.Scan(
			&i.ID,
			&i.PropertyID,
			&i.OrderNum,
			&i.FileName,
			&i.MimeType,
			&i.Size,
			&i.Data,
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

const getUserOwnedProperties = `-- name: GetUserOwnedProperties :many
SELECT
    property_id
FROM
    properties
WHERE
    lister_user_id = $1
ORDER BY
    id
`

func (q *Queries) GetUserOwnedProperties(ctx context.Context, listerUserID string) ([]string, error) {
	rows, err := q.db.QueryContext(ctx, getUserOwnedProperties, listerUserID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []string
	for rows.Next() {
		var property_id string
		if err := rows.Scan(&property_id); err != nil {
			return nil, err
		}
		items = append(items, property_id)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const transferAllPropertiesToAnotherLister = `-- name: TransferAllPropertiesToAnotherLister :exec
UPDATE properties
SET
    lister_user_id = $2,
    updated_at = CURRENT_TIMESTAMP
WHERE
    lister_user_id = $1
`

type TransferAllPropertiesToAnotherListerParams struct {
	ListerUserID   string
	ListerUserID_2 string
}

func (q *Queries) TransferAllPropertiesToAnotherLister(ctx context.Context, arg TransferAllPropertiesToAnotherListerParams) error {
	_, err := q.db.ExecContext(ctx, transferAllPropertiesToAnotherLister, arg.ListerUserID, arg.ListerUserID_2)
	return err
}

const updatePropertyDetails = `-- name: UpdatePropertyDetails :exec
UPDATE properties
SET
    "name" = $2,
    "description" = $3,
    address_1 = $4,
    address_2 = $5,
    city = $6,
    "state" = $7,
    zipcode = $8,
    country = $9,
    square_feet = $10,
    num_bedrooms = $11,
    num_toilets = $12,
    num_showers_baths = $13,
    cost_dollars = $14,
    cost_cents = $15,
    misc_note = $16,
    lister_user_id = $17,
    updated_at = CURRENT_TIMESTAMP
WHERE
    property_id = $1
`

type UpdatePropertyDetailsParams struct {
	PropertyID      string
	Name            string
	Description     sql.NullString
	Address1        string
	Address2        sql.NullString
	City            string
	State           string
	Zipcode         string
	Country         string
	SquareFeet      int32
	NumBedrooms     int16
	NumToilets      int16
	NumShowersBaths int16
	CostDollars     int64
	CostCents       int16
	MiscNote        sql.NullString
	ListerUserID    string
}

func (q *Queries) UpdatePropertyDetails(ctx context.Context, arg UpdatePropertyDetailsParams) error {
	_, err := q.db.ExecContext(ctx, updatePropertyDetails,
		arg.PropertyID,
		arg.Name,
		arg.Description,
		arg.Address1,
		arg.Address2,
		arg.City,
		arg.State,
		arg.Zipcode,
		arg.Country,
		arg.SquareFeet,
		arg.NumBedrooms,
		arg.NumToilets,
		arg.NumShowersBaths,
		arg.CostDollars,
		arg.CostCents,
		arg.MiscNote,
		arg.ListerUserID,
	)
	return err
}

const updatePropertyLister = `-- name: UpdatePropertyLister :exec
UPDATE properties
SET
    lister_user_id = $2,
    updated_at = CURRENT_TIMESTAMP
WHERE
    property_id = $1
`

type UpdatePropertyListerParams struct {
	PropertyID   string
	ListerUserID string
}

func (q *Queries) UpdatePropertyLister(ctx context.Context, arg UpdatePropertyListerParams) error {
	_, err := q.db.ExecContext(ctx, updatePropertyLister, arg.PropertyID, arg.ListerUserID)
	return err
}
