-- +goose Up
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT, 
    last_name TEXT, 
    birth_date TEXT,
    gender TEXT,
    "location" TEXT,
    interests TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users_avatars (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    file_name TEXT,
    mime_type TEXT,
    "size" BIGINT,
    "data" BYTEA,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_property
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- +goose Down
DROP TABLE users;
DROP TABLE users_avatars;