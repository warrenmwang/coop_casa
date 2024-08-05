-- +goose Up
CREATE TABLE users(
    id serial PRIMARY KEY,
    user_id text NOT NULL UNIQUE,
    email text NOT NULL UNIQUE,
    first_name text,
    last_name text,
    birth_date text,
    gender text,
    "location" text,
    interests text,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users_avatars(
    id serial PRIMARY KEY,
    user_id text NOT NULL UNIQUE,
    file_name text,
    mime_type text,
    "size" bigint,
    "data" bytea,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_id_users_avatars FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- +goose Down
DROP TABLE IF EXISTS users_avatars;

DROP TABLE IF EXISTS users;

