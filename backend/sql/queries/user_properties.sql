-- name: CreateUserSavedProperty :exec
INSERT INTO user_saved_properties(user_id, property_id)
    VALUES ($1, $2);

-- name: GetUserSavedProperties :many
SELECT
    property_id,
    created_at
FROM
    user_saved_properties
WHERE
    user_id = $1;

-- name: DeleteUserSavedProperty :exec
DELETE FROM user_saved_properties
WHERE user_id = $1
    AND property_id = $2;

