-- Queries for saving properties, communities, and users.
--
-- Getters
-- name: GetUserSavedProperties :many
SELECT
    *
FROM
    users_saved_properties
WHERE
    user_id = $1;

-- name: GetUserSavedCommunities :many
SELECT
    *
FROM
    users_saved_communities
WHERE
    user_id = $1;

-- name: GetUserSavedUsers :many
SELECT
    *
FROM
    users_saved_users
WHERE
    user_id = $1;

-- Setters
-- name: CreateUserSavedProperty :exec
INSERT INTO users_saved_properties(user_id, property_id)
    VALUES ($1, $2);

-- name: CreateUserSavedCommunity :exec
INSERT INTO users_saved_communities(user_id, community_id)
    VALUES ($1, $2);

-- name: CreateUserSavedUser :exec
INSERT INTO users_saved_users(user_id, saved_user_id)
    VALUES ($1, $2);

-- Deleters
-- name: DeleteUserSavedProperty :exec
DELETE FROM users_saved_properties
WHERE user_id = $1
    AND property_id = $2;

-- name: DeleteUserSavedCommunity :exec
DELETE FROM users_saved_communities
WHERE user_id = $1
    AND community_id = $2;

-- name: DeleteUserSavedUser :exec
DELETE FROM users_saved_users
WHERE user_id = $1
    AND saved_user_id = $2;

-- Delete all of user's saved properties, communities, and users
-- name: DeleteUserSavedProperties :exec
DELETE FROM users_saved_properties
WHERE user_id = $1;

-- name: DeleteUserSavedCommunities :exec
DELETE FROM users_saved_communities
WHERE user_id = $1;

-- name: DeleteUserSavedUsers :exec
DELETE FROM users_saved_users
WHERE user_id = $1;

