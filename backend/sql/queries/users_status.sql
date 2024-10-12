-- name: CreateUserStatus :exec
INSERT INTO
    users_status (user_id, setter_user_id, status, comment)
VALUES
    ($1, $2, $3, $4);


-- name: GetUserStatus :one
SELECT
    *
FROM
    users_status
WHERE
    user_id = $1;


-- name: UpdateUserStatus :exec
UPDATE users_status
SET
    setter_user_id = $2,
    status = $3,
    comment = $4,
    updated_at = CURRENT_TIMESTAMP
WHERE
    user_id = $1;


-- name: DeleteUserStatus :exec
DELETE FROM users_status
WHERE
    user_id = $1;
