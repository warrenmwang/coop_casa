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


-- name: CreateUserSavedProperty :exec
INSERT INTO
    users_saved_properties (user_id, property_id)
VALUES
    ($1, $2);


-- name: CreateUserSavedCommunity :exec
INSERT INTO
    users_saved_communities (user_id, community_id)
VALUES
    ($1, $2);


-- name: CreateUserSavedUser :exec
INSERT INTO
    users_saved_users (user_id, saved_user_id)
VALUES
    ($1, $2);


-- Deleters
-- name: DeleteUserSavedProperty :exec
DELETE FROM users_saved_properties
WHERE
    user_id = $1
    AND property_id = $2;


-- name: DeleteUserSavedCommunity :exec
DELETE FROM users_saved_communities
WHERE
    user_id = $1
    AND community_id = $2;


-- name: DeleteUserSavedUser :exec
DELETE FROM users_saved_users
WHERE
    user_id = $1
    AND saved_user_id = $2;


-- Delete's all of the user's saved properties.
-- name: DeleteUserSavedProperties :exec
DELETE FROM users_saved_properties
WHERE
    user_id = $1;


-- Delete's all of the user's saved communities.
-- name: DeleteUserSavedCommunities :exec
DELETE FROM users_saved_communities
WHERE
    user_id = $1;


-- Delete's all of the user's saved users.
-- name: DeleteUserSavedUsers :exec
DELETE FROM users_saved_users
WHERE
    user_id = $1;
