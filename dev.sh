#!/bin/bash

backend() {
    cd ./backend
    make watch
}

db() {
    docker start backend-psql-1
}

frontend() {
    cd ./frontend
    /home/wang/.nvm/versions/node/v21.6.1/bin/npm run start
}

# Function to handle cleanup on script termination
cleanup() {
    echo "Terminating background processes..."
    kill $backend_pid $frontend_pid
    docker stop backend-psql-1
    # Wait for the backend and frontend processes to terminate
    wait $backend_pid $frontend_pid
}

# Trap SIGINT and SIGTERM to run the cleanup function
trap cleanup SIGINT SIGTERM

# Run these in parallel, still attached to this script and can all be stopped by a Ctrl+C in terminal
backend &
backend_pid=$!

db &
db_pid=$!

frontend &
frontend_pid=$!

# Wait for all background jobs to finish
wait $backend_pid $frontend_pid
