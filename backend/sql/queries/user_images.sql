-- name: CreateUserImage :exec
INSERT INTO
    user_images (user_id, file_name, mime_type, size, data)
VALUES
    ($1, $2, $3, $4, $5);


-- name: GetUserImages :many
SELECT
    *
FROM
    user_images
WHERE
    user_id = $1;


-- name: DeleteUserImages :exec
DELETE FROM user_images
WHERE
    user_id = $1;
