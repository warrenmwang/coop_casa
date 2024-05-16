#!/bin/bash

# While we don't need sudo permissions for any of the commands,
# checking whether we are root or not will prevent us from trying to 
# run this script on dev machine, which we assume the user is not logged in
# as root.
if [ "$EUID" -ne 0 ]; then
    echo "Not root user, assume not on deployment server. Exiting."
    exit 1
fi

# Build frontend
cd frontend
/root/.nvm/versions/node/v21.6.1/bin/npm run build

# Move frontend build to nginx serve location
rm -rf /var/www/coop/*
mv build/* /var/www/coop/
cd ..

# Build backend
cd backend
make build

# Run backend in tmux session
SESSION_NAME="coop"
DIRECTORY="/root/deployment_repos/coop/src/backend"
COMMAND="/root/deployment_repos/coop/src/backend/main"

# Check if the tmux session exists
tmux has-session -t $SESSION_NAME 2>/dev/null

if [ $? != 0 ]; then
    echo "Session $SESSION_NAME does not exist, creating it"
    tmux new-session -d -s $SESSION_NAME "$COMMAND"
else
    echo "Session $SESSION_NAME exists, killing and creating a new one"
    tmux kill-session -t $SESSION_NAME
    tmux new-session -d -s $SESSION_NAME "$COMMAND"
fi
