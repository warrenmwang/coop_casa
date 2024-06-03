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
GOOSE_MIGRATION_DIR="/app/sql/schema"
GOOSE_DATABASE_URL="postgres://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}"

# Wait for the PostgreSQL container to be ready
echo "Waiting for PostgreSQL to start..."
while ! pg_isready -h postgres -p 5432 -q -U postgres; do
  sleep 1
done
echo "PostgreSQL started"

# Wait for the database to be available
echo "Waiting for database to be available..."
until PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USERNAME -c '\l' | grep $DB_DATABASE > /dev/null; do
  sleep 1
done
echo "Database is available"

echo "Running Goose migrations..."
goose -dir "$GOOSE_MIGRATION_DIR" postgres "$GOOSE_DATABASE_URL" up

# Check if Goose migrations were successful
if [ $? -ne 0 ]; then
  echo "Goose migrations failed"
  exit 1
else
  echo "Goose migrations applied successfully"
fi