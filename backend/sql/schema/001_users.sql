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

CREATE TABLE user_avatars (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    avatar TEXT
);

-- +goose Down
DROP TABLE users;
DROP TABLE user_avatars;