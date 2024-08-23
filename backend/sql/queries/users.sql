-- -------------------------- PRivate Users API Queries (for each account) --------------------------
-- name: CreateBareUser :exec
INSERT INTO users(user_id, email)
    VALUES ($1, $2);

-- name: CreateBareUserAvatar :exec
INSERT INTO users_avatars(user_id)
    VALUES ($1);

-- name: UpdateUserDetails :exec
UPDATE
    users
SET
    first_name = $2,
    last_name = $3,
    birth_date = $4,
    gender = $5,
    "location" = $6,
    interests = $7,
    updated_at = CURRENT_TIMESTAMP
WHERE
    user_id = $1;

-- name: UpdateUserAvatar :exec
UPDATE
    users_avatars
SET
    file_name = $2,
    mime_type = $3,
    "size" = $4,
    "data" = $5,
    updated_at = CURRENT_TIMESTAMP
WHERE
    user_id = $1;

-- name: GetUserAvatar :one
SELECT
    *
FROM
    users_avatars
WHERE
    user_id = $1;

-- name: GetUserDetails :one
SELECT
    *
FROM
    users
WHERE
    user_id = $1;

-- name: AdminGetUsers :many
SELECT
    *
FROM
    users
ORDER BY
    id
LIMIT $1 OFFSET $2;

-- name: DeleteUserDetails :exec
DELETE FROM users
WHERE user_id = $1;

-- name: DeleteUserAvatar :exec
DELETE FROM users_avatars
WHERE user_id = $1;

-- -------------------------- Public Users API Queries --------------------------
-- name: GetNextPageOfPublicUsers :many
SELECT
    user_id
FROM
    users
LIMIT $1 OFFSET $2;

