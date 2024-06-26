-- name: CreateUser :exec
WITH new_user AS (
    INSERT INTO users (user_id, email)
    VALUES ($1, $2)
    RETURNING user_id
)
INSERT INTO users_avatars (user_id, avatar)
SELECT user_id, $3
FROM new_user;

-- name: UpdateUser :exec
UPDATE users
SET 
    first_name = $2, 
    last_name = $3, 
    birth_date = $4,
    gender = $5,
    "location" = $6,
    interests = $7,
    updated_at = CURRENT_TIMESTAMP
WHERE user_id = $1;

-- name: UpdateUserAvatar :exec
UPDATE users_avatars
SET
    avatar = $2,
    updated_at = CURRENT_TIMESTAMP
WHERE user_id = $1;

-- name: GetUserAvatar :one
SELECT avatar FROM users_avatars
WHERE user_id = $1;

-- name: GetUser :one
SELECT * FROM users
WHERE user_id = $1;

-- name: AdminGetUsers :many
SELECt * FROM users
ORDER BY id 
LIMIT $1 OFFSET $2;

-- name: DeleteUser :exec
DELETE FROM users WHERE user_id = $1;

-- name: DeleteUserAvatar :exec
DELETE FROM users_avatars WHERE user_id = $1;