-- Public Users API Queries
-- name: GetNextPageOfPublicUsers :many
SELECT
    users.user_id
FROM
    users
    INNER JOIN users_status ON users.user_id = users_status.user_id
WHERE
    users_status.status = $3
    AND first_name IS NOT NULL
    AND last_name IS NOT NULL
    AND birth_date IS NOT NULL
    AND gender IS NOT NULL
    AND "location" IS NOT NULL
    AND interests IS NOT NULL
LIMIT
    $1
OFFSET
    $2;


-- name: GetNextPageOfPublicUsersFilterByName :many
SELECT
    users.user_id
FROM
    users
    INNER JOIN users_status ON users.user_id = users_status.user_id
WHERE
    users_status.status = $5
    AND first_name IS NOT NULL
    AND last_name IS NOT NULL
    AND birth_date IS NOT NULL
    AND gender IS NOT NULL
    AND "location" IS NOT NULL
    AND interests IS NOT NULL
ORDER BY
    0.5 * similarity ("first_name", $3) + 0.5 * similarity ("last_name", $4) DESC
LIMIT
    $1
OFFSET
    $2;
