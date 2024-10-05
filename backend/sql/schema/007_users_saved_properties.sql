-- +goose Up
CREATE TABLE users_saved_properties (
    id serial PRIMARY KEY,
    user_id text NOT NULL,
    property_id text NOT NULL,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_id_users_saved_properties FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_property_id_users_saved_properties FOREIGN KEY (property_id) REFERENCES properties (property_id) ON DELETE CASCADE
);


-- +goose Down
DROP TABLE IF EXISTS users_saved_properties;
