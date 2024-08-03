-- +goose Up
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    "role" TEXT NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_id_roles
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- +goose Down
DROP TABLE IF EXISTS roles;