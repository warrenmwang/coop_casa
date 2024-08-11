-- +goose Up
CREATE TABLE communities(
    id serial PRIMARY KEY,
    community_id text NOT NULL UNIQUE,
    admin_user_id text NOT NULL,
    "name" text NOT NULL,
    "description" text,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_admin_user_id_communities FOREIGN KEY (admin_user_id) REFERENCES users(user_id)
);

CREATE TABLE communities_images(
    id serial PRIMARY KEY,
    community_id text NOT NULL,
    file_name text NOT NULL,
    mime_type text NOT NULL,
    "size" bigint NOT NULL,
    "data" bytea NOT NULL,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_community_id_communities_images FOREIGN KEY (community_id) REFERENCES communities(community_id) ON DELETE CASCADE
);

CREATE TABLE communities_users(
    id serial PRIMARY KEY,
    community_id text NOT NULL,
    user_id text NOT NULL,
    CONSTRAINT fk_community FOREIGN KEY (community_id) REFERENCES communities(community_id) ON DELETE CASCADE,
    CONSTRAINT fk_user_id_communities_users FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE communities_properties(
    id serial PRIMARY KEY,
    community_id text NOT NULL,
    property_id text NOT NULL,
    CONSTRAINT fk_community FOREIGN KEY (community_id) REFERENCES communities(community_id) ON DELETE CASCADE,
    CONSTRAINT fk_property_id_communities_properties FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE
);

-- +goose Down
DROP TABLE IF EXISTS communities_images;

DROP TABLE IF EXISTS communities_users;

DROP TABLE IF EXISTS communities_properties;

DROP TABLE IF EXISTS communities;

