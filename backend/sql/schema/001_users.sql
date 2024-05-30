-- +goose Up
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT, 
    last_name TEXT, 
    birth_date DATE,
    gender TEXT,
    avatar TEXT,
    "location" TEXT,
    interests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- +goose Down
DROP TABLE users;