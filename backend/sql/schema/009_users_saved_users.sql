-- +goose Up
CREATE TABLE users_saved_users (
    id serial PRIMARY KEY,
    user_id text NOT NULL,
    saved_user_id text NOT NULL,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_id_users_saved_users FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_saved_user_id_users_saved_users FOREIGN KEY (saved_user_id) REFERENCES users (user_id) ON DELETE CASCADE
);


-- +goose Down
DROP TABLE IF EXISTS users_saved_users;
