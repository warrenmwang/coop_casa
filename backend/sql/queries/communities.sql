-- name: GetNextPageCommunities :many
SELECT
    community_id
FROM
    communities
ORDER BY
    CASE
        WHEN $3 <> ''
        AND $4 <> '' THEN 0.4 * similarity ("name", $3) + 0.6 * similarity ("description", $4)
        WHEN $3 <> '' THEN CASE
            WHEN "name" <> '' THEN similarity ("name", $3)
            ELSE 0
        END
        WHEN $4 <> '' THEN CASE
            WHEN "description" <> '' THEN similarity ("description", $4)
            ELSE 0
        END
        ELSE 0
    END DESC,
    id
LIMIT
    $1
OFFSET
    $2;


-- name: CreateCommunityDetails :exec
INSERT INTO
    communities (
        community_id,
        admin_user_id,
        "name",
        "description"
    )
VALUES
    ($1, $2, $3, $4);


-- name: CreateCommunityImage :exec
INSERT INTO
    communities_images (
        community_id,
        file_name,
        mime_type,
        "size",
        "data"
    )
VALUES
    ($1, $2, $3, $4, $5);


-- name: CreateCommunityProperty :exec
INSERT INTO
    communities_properties (community_id, property_id)
VALUES
    ($1, $2);


-- name: CreateCommunityUser :exec
INSERT INTO
    communities_users (community_id, user_id)
VALUES
    ($1, $2);


-- name: GetCommunityDetails :one
SELECT
    *
FROM
    communities
WHERE
    community_id = $1;


-- name: GetCommunityImages :many
SELECT
    *
FROM
    communities_images
WHERE
    community_id = $1;


-- name: GetCommunityProperties :many
SELECT
    *
FROM
    communities_properties
WHERE
    community_id = $1;


-- name: GetCommunityUsers :many
SELECT
    *
FROM
    communities_users
WHERE
    community_id = $1;


-- name: GetUserOwnedCommunities :many
SELECT
    community_id
FROM
    communities
WHERE
    admin_user_id = $1;


-- name: UpdateCommunityDetails :exec
UPDATE communities
SET
    admin_user_id = $2,
    "name" = $3,
    "description" = $4,
    updated_at = CURRENT_TIMESTAMP
WHERE
    community_id = $1;


-- name: UpdateCommunityAdmin :exec
UPDATE communities
SET
    admin_user_id = $2,
    updated_at = CURRENT_TIMESTAMP
WHERE
    community_id = $1;


-- name: DeleteCommunityImages :exec
DELETE FROM communities_images
WHERE
    community_id = $1;


-- name: DeleteCommunityProperties :exec
DELETE FROM communities_properties
WHERE
    community_id = $1;


-- name: DeleteCommunityProperty :exec
DELETE FROM communities_properties
WHERE
    community_id = $1
    AND property_id = $2;


-- name: DeleteCommunityUsers :exec
DELETE FROM communities_users
WHERE
    community_id = $1;


-- name: DeleteCommunityUser :exec
DELETE FROM communities_users
WHERE
    community_id = $1
    AND user_id = $2;


-- name: DeleteCommunity :exec
DELETE FROM communities
WHERE
    community_id = $1;


-- name: DeleteUserOwnedCommunities :exec
DELETE FROM communities
WHERE
    admin_user_id = $1;
