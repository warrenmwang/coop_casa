-- +goose Up
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    "role" TEXT NOT NULL
);

-- +goose Down
DROP TABLE roles;