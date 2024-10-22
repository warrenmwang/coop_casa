#!/bin/bash

# Database migration script for deployment

# Ensure environment vars are present
if [ -z "$DB_USERNAME" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_HOST" ] || [ -z "$DB_PORT" ] || [ -z "$DB_DATABASE" ]; then
    echo "Missing environment var(s)."
    exit 1
fi
 
# Setup migration directory and database conn url variables
GOOSE_MIGRATION_DIR="/app/sql/schema"
GOOSE_DATABASE_URL="postgres://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}"

echo "Running Goose migrations..."
goose -dir "$GOOSE_MIGRATION_DIR" postgres "$GOOSE_DATABASE_URL" up
if [ $? -ne 0 ]; then
  echo "Goose migrations failed"
  exit 1
fi

echo "Goose migrations applied successfully"
