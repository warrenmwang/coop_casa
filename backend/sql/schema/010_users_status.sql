-- +goose Up
CREATE TABLE users_status (
    id serial PRIMARY KEY,
    user_id text NOT NULL,
    setter_user_id text NOT NULL,
    status text NOT NULL,
    comment text,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk__user_id__users_status FOREIGN key (user_id) REFERENCES users (user_id) ON DELETE cascade,
    CONSTRAINT fk__setter_user_id__users_status FOREIGN key (user_id) REFERENCES users (user_id) ON DELETE cascade
);


-- +goose Down
DROP TABLE IF EXISTS users_status;
