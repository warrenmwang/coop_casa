#!/bin/bash

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
