-- +goose Up
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    "role" TEXT NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_property
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- +goose Down
DROP TABLE roles;