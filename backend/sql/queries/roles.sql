-- name: CreateNewUserRole :exec
INSERT INTO roles (user_id, "role")
VALUES ($1, $2);

-- name: GetUserRole :one
SELECT * FROM roles
WHERE user_id = $1;

-- name: UpdateUserRole :exec
UPDATE roles
SET
    "role" = $2
WHERE user_id = $1;

-- name: DeleteUserRole :exec
DELETE FROM roles WHERE user_id = $1;