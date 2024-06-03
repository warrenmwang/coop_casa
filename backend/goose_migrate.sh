#!/bin/bash

# Manual run of database migrations (new schema)
# Should only be used for dev purposes, thus gitignored.

# Read variables from .env if file exists
# File will be non-existent in production environment and we 
# expect the environment variables to already be set by Github Actions
if [ -e ".env" ]; then
    source .env
fi

# Conduct the db up migration for the development db
GOOSE_MIGRATION_DIR="./sql/schema"
GOOSE_DATABASE_URL="postgres://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}"
goose -dir "$GOOSE_MIGRATION_DIR" postgres "$GOOSE_DATABASE_URL" $1