-- name: GetTotalCountProperties :one
SELECT
    count(*)
FROM
    properties;


-- name: GetTotalCountCommunities :one
SELECT
    count(*)
FROM
    communities;


-- name: GetTotalCountUsers :one
SELECT
    count(*)
FROM
    users;


-- name: AdminGetUsers :many
-- Want to filter by similarity to name if name argument is present.
SELECT
    *
FROM
    users
ORDER BY
    CASE
        WHEN $3 <> '' THEN similarity (CONCAT(first_name, ' ', last_name), $3)
        ELSE 1
    END DESC
LIMIT
    $1
OFFSET
    $2;
