-- thinking like be able to search by 2 things: name of community and something from the description
-- the way we return an ordering of communities will be by a weighted objective function
-- like ( name_weight * name_match_score + description_weight * description_match_score )
-- where name_weight and description_weight are chosen by us.
-- and the scores are calculated using something like similarity edit distance between the search term
-- and the actual values from the db.
--
-- name: GetNextPageCommunitiesFilterByName :many
SELECT
    community_id
FROM
    communities
ORDER BY
    similarity("name", $3) ASC
LIMIT $1 OFFSET $2;

-- name: GetNextPageCommunitiesFilterByDescription :many
SELECT
    community_id
FROM
    communities
ORDER BY
    similarity("description", $3) ASC
LIMIT $1 OFFSET $2;

-- name: GetNextPageCommunitiesFilteredByCombination :many
SELECT
    community_id
FROM
    communities
ORDER BY
    0.4 * similarity("name", $3) + 0.6 * similarity("description", $4) ASC
LIMIT $1 OFFSET $2;

-- name: GetNextPageCommunities :many
SELECT
    community_id
FROM
    communities
ORDER BY
    id
LIMIT $1 OFFSET $2;

-- name: CreateCommunityDetails :exec
INSERT INTO communities(community_id, admin_user_id, "name", "description")
    VALUES ($1, $2, $3, $4);

-- name: CreateCommunityImage :exec
INSERT INTO communities_images(community_id, file_name, mime_type, "size", "data")
    VALUES ($1, $2, $3, $4, $5);

-- name: CreateCommunityProperty :exec
INSERT INTO communities_properties(community_id, property_id)
    VALUES ($1, $2);

-- name: CreateCommunityUser :exec
INSERT INTO communities_users(community_id, user_id)
    VALUES ($1, $2);

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
UPDATE
    communities
SET
    admin_user_id = $2,
    "name" = $3,
    "description" = $4,
    updated_at = CURRENT_TIMESTAMP
WHERE
    community_id = $1;

-- name: DeleteCommunityImages :exec
DELETE FROM communities_images
WHERE community_id = $1;

-- name: DeleteCommunityProperties :exec
DELETE FROM communities_properties
WHERE community_id = $1;

-- name: DeleteCommunityProperty :exec
DELETE FROM communities_properties
WHERE community_id = $1
    AND property_id = $2;

-- name: DeleteCommunityUsers :exec
DELETE FROM communities_users
WHERE community_id = $1;

-- name: DeleteCommunityUser :exec
DELETE FROM communities_users
WHERE community_id = $1
    AND user_id = $2;

-- name: DeleteCommunity :exec
DELETE FROM communities
WHERE community_id = $1;

