-- name: GetManyListerInformation :many
SELECT
    users.user_id,
    users.email,
    users.first_name,
    users.last_name
FROM
    users
    JOIN roles ON users.user_id = roles.user_id
WHERE
    roles.role = $4
ORDER BY
    similarity (
        CONCAT(users.first_name, ' ', users.last_name),
        $3
    ) DESC
LIMIT
    $1
OFFSET
    $2;
