-- name: CreateUser :one
INSERT INTO users (user_id, email)
VALUES ($1, $2)
RETURNING *;

-- name: UpdateUser :exec
UPDATE users
SET first_name = $2, last_name = $3, birth_date = $4, gender = $5, "location" = $6, interests = $7, avatar = $8
WHERE user_id = $1;

-- name: GetUser :one
SELECT * FROM users
WHERE user_id = $1;

-- name: GetUserFirstName :one
SELECT first_name FROM users
WHERE user_id = $1;

-- name: DeleteUser :exec
DELETE FROM users WHERE user_id = $1;