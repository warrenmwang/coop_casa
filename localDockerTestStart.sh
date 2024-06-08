#!/bin/bash

# source backend and frontend vars
if [ -f .env_local_docker ]; then
  set -a
  source .env_local_docker
  set +a
else
  echo ".env_local_docker file not found!"
  exit 1
fi

# up 
docker compose up --build --remove-orphans