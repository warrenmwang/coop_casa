-- +goose Up
CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    property_id TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "description" TEXT,
    address_1 TEXT NOT NULL,
    address_2 TEXT,
    city TEXT NOT NULL,
    "state" TEXT NOT NULL,
    zipcode TEXT NOT NULL,
    country TEXT NOT NULL,
    num_bedrooms SMALLINT NOT NULL,
    num_toilets SMALLINT NOT NULL,
    num_showers_baths SMALLINT NOT NULL,
    cost_dollars BIGINT NOT NULL,
    cost_cents SMALLINT NOT NULL,
    misc_note TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE properties_images (
    id SERIAL PRIMARY KEY,
    property_id TEXT NOT NULL UNIQUE,
    images TEXT,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- +goose Down
DROP TABLE properties;
DROP TABLE properties_images;