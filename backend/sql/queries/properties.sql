-- name: CreateProperty :exec
WITH new_property AS (
    INSERT INTO properties 
    (
    property_id, lister_user_id, "name", "description", 
    address_1, address_2, city, "state", zipcode, country,
    square_feet, num_bedrooms, num_toilets, num_showers_baths, cost_dollars, cost_cents, misc_note
    )
    VALUES 
    ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
    RETURNING property_id
)
INSERT INTO properties_images (property_id, images)
SELECT property_id, $18
FROM new_property;

-- name: GetProperty :one
SELECT * FROM properties
WHERE property_id = $1;

-- name: GetPublicProperties :many
SELECT * FROM properties
ORDER BY id
LIMIT $1 OFFSET $2;

-- name: GetPropertyImages :one
SELECT * FROM properties_images
WHERE property_id = $1;

-- name: UpdateProperty :exec
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
WHERE property_id = $1;

-- name: UpdatePropertyImages :exec
UPDATE properties_images
SET
    images = $2,
    updated_at = CURRENT_TIMESTAMP
WHERE property_id = $1;

-- name: DeleteProperty :exec
WITH deleted_property AS (
    DELETE FROM properties
    WHERE properties.property_id = $1
    RETURNING property_id
)
DELETE FROM properties_images
WHERE properties_images.property_id
IN
(SELECT deleted_property.property_id FROM deleted_property);
