#!/bin/bash

# This is the quick dev script that watches for changes in the code live and will 
# interactively show those changes. This requires that ports 3000 and 8080 be available for
# the frontend and backend respectively. Of course, these can be changed by editing the .env
# files in the backend and frontend dirs respectively.

CONTAINER_NAME="backend-psql-1"

backend() {
    cd ../backend
    make watch
}

db() {
    # source the database variables
    if [ -f .env_local_docker ]; then
        set -a
        source .env_local_docker
        set +a
    else
        echo ".env_local_docker file not found!"
        exit 1
    fi

    VOLUME_NAME="${CONTAINER_NAME}_volume"

    # Check if the container exists
    if [ "$(docker ps -a -q -f name=$CONTAINER_NAME)" ]; then
        echo "Starting existing PostgreSQL container..."
        docker start $CONTAINER_NAME
    else
        echo "Creating and starting new PostgreSQL container..."
        # Create a volume if it doesn't exist
        if [ -z "$(docker volume ls -q -f name=$VOLUME_NAME)" ]; then
            docker volume create $VOLUME_NAME
        fi

        # Run a new PostgreSQL container with the specified environment variables
        docker run --name $CONTAINER_NAME \
            -e POSTGRES_DB=$DB_DATABASE \
            -e POSTGRES_USER=$DB_USERNAME \
            -e POSTGRES_PASSWORD=$DB_PASSWORD \
            -v $VOLUME_NAME:/var/lib/postgresql/data \
            -p 5432:5432 \
            -d postgres:latest
    fi
}

frontend() {
    cd ../frontend
    if [ $1 = "playwright" ]; then
        /home/wang/.nvm/versions/node/v21.6.1/bin/npm run dev:playwright
    else 
        /home/wang/.nvm/versions/node/v21.6.1/bin/npm run dev
    fi
}

# Function to handle cleanup on script termination
cleanup() {
    echo "Terminating background processes..."
    kill $backend_pid $frontend_pid
    docker stop $CONTAINER_NAME
    # Wait for the backend and frontend processes to terminate
    wait $backend_pid $frontend_pid
}

main(){
    # Trap SIGINT and SIGTERM to run the cleanup function
    trap cleanup SIGINT SIGTERM

    # Run these in parallel, still attached to this script and can all be stopped by a Ctrl+C in terminal
    backend &
    backend_pid=$!

    db &
    db_pid=$!

    frontend "$1" &
    frontend_pid=$!

    # Wait for all background jobs to finish
    wait $backend_pid $frontend_pid
}

main "$1"
