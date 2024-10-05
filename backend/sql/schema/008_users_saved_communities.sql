-- +goose Up
CREATE TABLE users_saved_communities (
    id serial PRIMARY KEY,
    user_id text NOT NULL,
    community_id text NOT NULL,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_id_users_saved_communities FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_community_id_users_saved_communities FOREIGN KEY (community_id) REFERENCES communities (community_id) ON DELETE CASCADE
);


-- +goose Down
DROP TABLE IF EXISTS users_saved_communities;
