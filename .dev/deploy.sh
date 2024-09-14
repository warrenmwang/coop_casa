#!/bin/bash

# When we finish a new feature or bug fix, we can run our own manual tests to ensure behavior works,
# then run a script like this to run the automated tests next, and then if they pass we
# can automate updating the main branch and deploy.

usage() {
    echo "Usage: $0 {prod}"
    exit 1
}

# Check if an argument is provided
if [ -z "$1" ]; then
    echo "Error: No argument provided."
    usage
fi

# Check if the argument is "prod"
if  [ "$1" != "prod" ]; then
    echo "Error: Invalid argument '$1'."
    usage
fi

# Check on dev branch with no unstaged changes
if [$(git rev-parse --abbrev-ref HEAD) != "dev"]; then
    echo "Not on dev branch, exiting"
fi

# Check for unstaged changes
if git diff --quiet; then
    echo "No unstaged changes, proceeding."
else
    echo "There are unstaged changes in current branch, aborting before attempting to merge dev into deploy."
    exit 1
fi

echo "Starting tests, then deploy to $1"

# Run tests
bash ./runTests.sh

if [ $? -ne 0 ]; then
    echo "Tests failed, aborting deploy."
    exit 1
else
    echo "Tests passed, continuing."
fi

echo "Deploying!"

echo "Merging dev into main"
git checkout main
git merge dev
git push origin main

# get env vars for prod
set -a
source .env_prod
set +a

# prepare script to run on deploy server
SCRIPT="
# SET ENV VARS
# Proxy
export EXTERNAL_PROXY_PORT=${EXTERNAL_PROXY_PORT}

# Both Proxy and Frontend
export INTERNAL_FRONTEND_PORT=${INTERNAL_FRONTEND_PORT}

# Both Proxy and Backend
export INTERNAL_BACKEND_PORT=${INTERNAL_BACKEND_PORT}

# Backend
export EXTERNAL_FRONTEND_PORT=${EXTERNAL_FRONTEND_PORT}

export IS_PROD=true
export PROD_HOST=${PROD_HOST}

export ADMIN_USER_ID=${ADMIN_USER_ID}
export JWT_SIGN_SECRET=${JWT_SIGN_SECRET}
export AUTH_KEY_SECRET=${AUTH_KEY_SECRET}
export DB_ENCRYPT_KEY_SECRET=${DB_ENCRYPT_KEY_SECRET}

export DB_HOST=${DB_HOST}
export DB_PORT=${DB_PORT}
export DB_DATABASE=${DB_DATABASE}
export DB_USERNAME=${DB_USERNAME}
export DB_PASSWORD=${DB_PASSWORD}

export GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
export GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}

# Frontend
export REACT_APP_IS_PROD=true
export REACT_APP_API_PROD_HOST=${REACT_APP_API_PROD_HOST}
export REACT_APP_API_PORT=${REACT_APP_API_PORT}

# Change into the src dir
cd /home/${USER}/deployment_repos/coop/coop_casa

# Stop running docker services of old src
docker compose down

# Pull repo source
git checkout main
git pull origin main

# Run all as docker containers (db, backend, frontend, proxy)
docker compose build
docker compose up -d --remove-orphans
"

# after creting deploy ssh script, switch back to dev branch
echo "Moving back to dev branch locally."
git checkout dev

# deploy onto server
echo "Connecting to server!"
ssh ${SERVER_ALIAS} "${SCRIPT}"

if [ $? -ne 0 ];then 
    echo "Someting went wrong with deployment!"
    exit 1
fi

echo "Deployed to $1 successfully."
exit 0
