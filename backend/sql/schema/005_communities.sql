-- +goose Up
CREATE TABLE communities (
    id SERIAL PRIMARY KEY,
    community_id TEXT NOT NULL UNIQUE,
    admin_user_id TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "description" TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE communities_images (
    id SERIAL PRIMARY KEY,
    community_id TEXT NOT NULL,
    file_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    "size" BIGINT NOT NULL,
    "data" BYTEA NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_community_id_communities_images
        FOREIGN KEY(community_id)
        REFERENCES communities(community_id)
        ON DELETE CASCADE
);

CREATE TABLE communities_users (
    id SERIAL PRIMARY KEY,
    community_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    CONSTRAINT fk_community
        FOREIGN KEY(community_id)
        REFERENCES communities(community_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_user_id_communities_users
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

CREATE TABLE communities_properties (
    id SERIAL PRIMARY KEY,
    community_id TEXT NOT NULL,
    property_id TEXT NOT NULL,
    CONSTRAINT fk_community
        FOREIGN KEY(community_id)
        REFERENCES communities(community_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_property_id_communities_properties
        FOREIGN KEY(property_id)
        REFERENCES properties(property_id)
        ON DELETE CASCADE
);

-- +goose Down
DROP TABLE IF EXISTS communities_images;
DROP TABLE IF EXISTS communities_users;
DROP TABLE IF EXISTS communities_properties;
DROP TABLE IF EXISTS communities;