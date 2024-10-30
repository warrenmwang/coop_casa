#!/bin/bash

# When we finish a new feature or bug fix, we can run our own manual tests to ensure behavior works,
# then run a script like this to run the automated tests next, and then if they pass we
# can automate updating the main branch and deploy.

usage() {
    echo "Usage: $0 {target}"
    echo "  Valid options for target are: prod, local"
}

runTests() {
    echo "Running tests..."
    bash ./runTests.sh
    if [ $? -ne 0 ]; then
        echo "Tests failed, aborting deploy."
        exit 1
    else
        echo "Tests passed, continuing."
    fi
}

deployToProd() {
    # get env vars for prod
    if [ -f .env_prod ]; then
        set -a
        source .env_prod
        set +a
    else
      echo ".env_prod file not found!"
      exit 1
    fi

    echo "Merging current local git branch dev into main and pushing to remote."
    git checkout main
    git merge dev
    git push origin main
    git checkout dev

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
    export VITE_IS_PROD=true
    export VITE_API_PROD_HOST=${REACT_APP_API_PROD_HOST}
    export VITE_API_PORT=${REACT_APP_API_PORT}

    # Change into the src dir
    cd /home/${USER}/deployment_repos/coop/coop_casa

    # Pull repo source
    git pull origin main

    # Rebuild changed containers, stop old ones, start new ones
    docker compose up -d --build --remove-orphans
    "

    # deploy onto server
    echo "Connecting to server, and deploying new changes!"
    ssh ${SERVER_ALIAS} "${SCRIPT}"

    if [ $? -ne 0 ]; then
        echo "Someting went wrong with deployment!"
        echo "Check the logs! Aborting merging changes to main."
        exit 1
    fi

    echo "Deployed to prod successfully."
}

# TODO: need to use a self-signed cert for enabling HTTPS on localhost
# if we want to do this kind of testing right.
deployToLocal() {
    # source env vars
    if [ -f .env_local_docker ]; then
      set -a
      source .env_local_docker
      set +a
    else
      echo ".env_local_docker file not found!"
      exit 1
    fi

    cd ..
    docker compose up -d --build --remove-orphans

    docker run --rm -d \
      --name temp_nginx \
      --network webnet \
      -p 3000:80 \
      -v ./.dev/dev_nginx.conf:/etc/nginx/nginx.conf:ro \
      nginx:latest
}

main() {
    local target="$1"

    # Check if an argument is provided
    if [ -z "$target" ]; then
        echo "Error: No argument provided."
        usage
        exit 1
    fi

    case "$target" in 
        "prod")
            # Check on dev branch with no unstaged changes
            if [ "$(git rev-parse --abbrev-ref HEAD)" != "dev" ]; then
                echo "Not on dev branch, exiting"
                exit 1
            fi

            # Check for unstaged changes
            if git diff --quiet; then
                echo "No unstaged changes, proceeding."
            else
                echo "There are unstaged changes in current branch, aborting before attempting to merge dev into deploy."
                exit 1
            fi

            runTests
            deployToProd
            ;;
        "local")
            runTests
            deployToLocal
            ;;
        *)
            echo "Unknown target. Valid target options are: prod, local"
            exit 1
            ;;
    esac
}

main "$1"
