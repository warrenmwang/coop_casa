-- +goose Up
CREATE EXTENSION fuzzystrmatch;

-- +goose Down
DROP EXTENSION fuzzystrmatch;