-- name: GetNextPageOfPublicUsers :many
SELECT
    users.user_id
FROM
    users
    INNER JOIN users_status ON users.user_id = users_status.user_id
WHERE
    users_status.status = $5
    AND first_name IS NOT NULL
    AND first_Name <> ''
    AND last_name IS NOT NULL
    AND last_name <> ''
    AND birth_date IS NOT NULL
    AND gender IS NOT NULL
    AND "location" IS NOT NULL
    AND interests IS NOT NULL
ORDER BY
    CASE
        WHEN $3 <> ''
        AND $4 <> '' THEN 0.5 * similarity ("first_name", $3) + 0.5 * similarity ("last_name", $4)
        WHEN $3 <> '' THEN similarity ("first_name", $3)
        WHEN $4 <> '' THEN similarity ("last_name", $4)
        ELSE 0
    END DESC,
    users.user_id
LIMIT
    $1
OFFSET
    $2;
