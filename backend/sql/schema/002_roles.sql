-- +goose Up
CREATE TABLE roles(
    id serial PRIMARY KEY,
    user_id text NOT NULL UNIQUE,
    "role" text NOT NULL,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_id_roles FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- +goose Down
DROP TABLE IF EXISTS roles;

