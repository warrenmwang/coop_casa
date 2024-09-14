#!/bin/bash

# DB migrations using goose for dev
if [ -e "../backend/.env" ]; then
    source ../backend/.env
else 
    exit 1
fi

GOOSE_MIGRATION_DIR="../backend/sql/schema"
GOOSE_DATABASE_URL="postgres://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}"
goose -dir "$GOOSE_MIGRATION_DIR" postgres "$GOOSE_DATABASE_URL" $1
