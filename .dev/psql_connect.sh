#!/bin/bash

# Use the psql client CLI to interface with the database for manual checks / manipulation
# Should only be used for dev purposes

if [ -e "../backend/.env" ]; then
    source ../backend/.env
else 
    exit 1
fi

export PGPASSWORD=$DB_PASSWORD
psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d $DB_DATABASE