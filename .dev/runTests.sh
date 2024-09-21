#!/bin/bash

# You know, I really should be writing unit tests for my functions.
# There really is no time like the present to do something new in your life.

# README
# To run tests properly for this project, we need a postgresql server running, and furthermore
# we need to instantiate a the database with the schema that matches exactly the one we will use
# in our production server. Therefore, we will use the same scripts used in production to conduct
# the database migrations from a brand new PostgreSQL server. 

# SETUP NOTE
# First, we need to inject environment variables in this shell runner.
# This script is expected to be run from inside of the test directory
# located at /test relative to the root of the project repository.
#   1. Be in the /test dir.
# Next we need to make sure our environment variables are set in the .env_test
# file.
#   2. Ensure .env_test file has environment variables populated. 
# Next we just need to make sure we actually have the binaries installed...
#   3. Ensure have bash shell, go toolchain, goose, docker, node/npm.

CONTAINER_NAME="test-backend-psql"
VOLUME_NAME="${CONTAINER_NAME}_volume"

start_db() {
    echo "Start DB"

    echo "Creating and starting new testing PostgreSQL container..."
    # Ensure previous test volume does not exist, stop if does
    if [ -n "$(docker volume ls -q -f name=$VOLUME_NAME)" ]; then
        echo "  Unexpected test PostgreSQL volume exists, likely from a previous test run in which cleanup did not process successfully and till completion."
        echo "  Do you want to remove it and continue?"
        read -r user_input
        if [ "$user_input" = "y" ]; then
            cleanup_db
        else
            echo "  Exiting without removing the volume."
            exit 1
        fi
    fi

    # Create test volume
    docker volume create $VOLUME_NAME
    echo "  Created volume."

    # Start the db container
    docker run --name $CONTAINER_NAME \
        -e POSTGRES_DB=$DB_DATABASE \
        -e POSTGRES_USER=$DB_USERNAME \
        -e POSTGRES_PASSWORD=$DB_PASSWORD \
        -v $VOLUME_NAME:/var/lib/postgresql/data \
        -p 5432:5432 \
        -d postgres:latest

    echo "  Started container."
}

wait_for_db() {
    echo "Wait For DB"
    echo "  Waiting for PostgreSQL container to be up and running..."
    while ! docker exec $CONTAINER_NAME pg_isready -U $DB_USERNAME -d $DB_DATABASE > /dev/null 2>&1; do
        echo "  Not ready yet. Waiting..."
        sleep 0.5
    done
    echo "  Container up."
    echo "  Waiting for database to be available..."
    until PGPASSWORD=$DB_PASSWORD; docker exec $CONTAINER_NAME psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d $DB_DATABASE -c '\l' | grep $DB_DATABASE > /dev/null; do
    sleep 1
    done
    echo "  Database is available."
}

run_migrations_db() {
    echo "Run Migrations DB"
    GOOSE_MIGRATION_DIR="../backend/sql/schema"
    GOOSE_DATABASE_URL="postgres://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}"
    goose -dir "$GOOSE_MIGRATION_DIR" postgres "$GOOSE_DATABASE_URL" up

    # Check if Goose migrations were successful
    if [ $? -ne 0 ]; then
        echo "  Goose migrations failed"
        exit 1
    else
        echo "  Goose migrations applied successfully"
    fi
}

cleanup_db() {
    echo "Cleanup DB"

    echo "  Stopping and removing PostgreSQL container..."
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
    echo "  Removed container."

    echo "  Removing PostgreSQL volume..."
    docker volume rm $VOLUME_NAME
    echo "  Removed volume."
}

run_backend_tests() {
    echo "Run Backend Tests"
    cd ../backend

    # note usage of -count=1 flag is only to prevent go from caching test results.
    # this is useful if we want to test the same code for different db data (WIP)
    go test ./... -count=1 
    if [ $? -ne 0 ]; then
        echo "  Backend has at least one failed test"
        exit 1
    fi
}

run_frontend_tests() {
    echo "Run Frontend Tests"
    cd ../frontend

    echo "  Run ESLint"
    npm run lint

    if [ $? -ne 0 ]; then
        echo "  Frontend lint error."
        exit 1
    fi

    echo "  Running Jest tests."
    npm run test

    if [ $? -ne 0 ]; then
        echo "  Frontend Jest tests failed."
        exit 1
    fi
}

check_run_conditions() {
    # Check if the script is in a subdirectory of a Git repository
    if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
        echo "  This script is expected to be run from within the coop_casa Git repo."
        exit 1
    fi

    # Check if the current working directory ends .dev
    if [[ ! "$PWD" =~ /.dev/?$ ]]; then
        echo "  This script is expected to be run from inside of GIT_ROOT/.dev dir of project."
        exit 1
    fi
}

trap cleanup_db SIGINT SIGTERM
trap 'if [ $? -eq 1 ]; then cleanup_db; fi' EXIT

main() {
    echo "Coop.casa tests script."
    echo "Great job. Look at you being responsible." 
    echo ""

    check_run_conditions

    # Source the db variables
    if [ -f .env_test ]; then
        set -a
        source .env_test
        set +a
    else
        echo "  .env_test file not found"
        exit 1
    fi

    start_db
    wait_for_db
    run_migrations_db
    run_backend_tests
    run_frontend_tests
    cleanup_db

    echo ""
    echo "All tests passed."

    exit 0
}

main
