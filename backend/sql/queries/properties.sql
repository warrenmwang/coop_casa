-- name: CreatePropertyDetails :exec
INSERT INTO properties 
(
property_id, lister_user_id, "name", "description", 
address_1, address_2, city, "state", zipcode, country,
square_feet, num_bedrooms, num_toilets, num_showers_baths, cost_dollars, cost_cents, misc_note
)
VALUES 
($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17);

-- name: CreatePropertyImage :exec
INSERT INTO properties_images (property_id, order_num, file_name, mime_type, "size", "data")
VALUES ($1, $2, $3, $4, $5, $6);

-- name: GetProperty :one
SELECT * FROM properties
WHERE property_id = $1;

-- name: GetNextPageProperties :many
SELECT property_id FROM properties
ORDER BY id
LIMIT $1 OFFSET $2;

-- name: GetTotalCountProperties :one
SELECT count(*) FROM properties;

-- name: GetPropertyImages :many
SELECT * FROM properties_images
WHERE property_id = $1;

-- name: UpdatePropertyDetails :exec
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

-- name: DeletePropertyDetails :exec
DELETE FROM properties
WHERE property_id = $1;

-- name: DeletePropertyImage :exec
DELETE FROM properties_images
WHERE property_id = $1 AND order_num = $2;

-- name: DeletePropertyImages :exec
DELETE FROM properties_images
WHERE property_id = $1;

-- name: DeleteListerProperties :exec
DELETE FROM properties
WHERE lister_user_id = $1;

-- name: CheckIsPropertyDuplicate :one
SELECT count(*) FROM properties
WHERE
(
    lower(trim(address_1)) = lower(trim($1)) 
    AND 
    lower(trim(coalesce(address_2, ''))) = lower(trim($2)) 
    AND
    lower(trim(city)) = lower(trim($3)) 
    AND
    lower(trim("state")) = lower(trim($4)) 
    AND
    lower(trim(zipcode)) = lower(trim($5)) 
    AND
    lower(trim(country)) = lower(trim($6))
);

-- name: PropertiesFuzzySearchAddress :one
-- SELECT 
--     tbl_name_column, 
--     levenshtein(tbl_name_column, 'search string') AS score 
-- FROM tbl 
-- ORDER BY score ASC; --levenshtein distance decreases with similarity