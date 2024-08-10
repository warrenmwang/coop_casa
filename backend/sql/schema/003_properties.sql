-- +goose Up
CREATE TABLE properties(
    id serial PRIMARY KEY,
    property_id text NOT NULL UNIQUE,
    lister_user_id text NOT NULL,
    "name" text NOT NULL,
    "description" text,
    address_1 text NOT NULL,
    address_2 text,
    city text NOT NULL,
    "state" text NOT NULL,
    zipcode text NOT NULL,
    country text NOT NULL,
    square_feet integer NOT NULL,
    num_bedrooms smallint NOT NULL,
    num_toilets smallint NOT NULL,
    num_showers_baths smallint NOT NULL,
    cost_dollars bigint NOT NULL,
    cost_cents smallint NOT NULL,
    misc_note text,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_list_user_id_properties FOREIGN KEY (lister_user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE properties_images(
    id serial PRIMARY KEY,
    property_id text NOT NULL,
    order_num smallint NOT NULL,
    file_name text NOT NULL,
    mime_type text NOT NULL,
    "size" bigint NOT NULL,
    "data" bytea NOT NULL,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_property_id_properties_images FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE
);

-- +goose Down
DROP TABLE IF EXISTS properties_images;

DROP TABLE IF EXISTS properties;

