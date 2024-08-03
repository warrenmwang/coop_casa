-- +goose Up
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;

-- +goose Down
DROP EXTENSION IF EXISTS fuzzystrmatch;