-- Public Users API Queries
-- name: GetNextPageOfPublicUsers :many
SELECT
    user_id
FROM
    users
WHERE
    first_name IS NOT NULL
    AND last_name IS NOT NULL
    AND birth_date IS NOT NULL
    AND gender IS NOT NULL
    AND "location" IS NOT NULL
    AND interests IS NOT NULL
LIMIT $1 OFFSET $2;

-- name: GetNextPageOfPublicUsersFilterByName :many
SELECT
    user_id
FROM
    users
WHERE
    first_name IS NOT NULL
    AND last_name IS NOT NULL
    AND birth_date IS NOT NULL
    AND gender IS NOT NULL
    AND "location" IS NOT NULL
    AND interests IS NOT NULL
ORDER BY
    0.5 * similarity("first_name", $3) + 0.5 * similarity("last_name", $4) DESC
LIMIT $1 OFFSET $2;

