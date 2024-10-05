-- +goose Up
CREATE TABLE user_images (
    id serial PRIMARY KEY,
    user_id text NOT NULL,
    file_name text NOT NULL,
    mime_type text NOT NULL,
    "size" bigint NOT NULL,
    "data" bytea NOT NULL,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_id_user_images FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
);


-- +goose Down
DROP TABLE IF EXISTS user_images;
