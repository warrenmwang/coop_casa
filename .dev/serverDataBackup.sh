#!/bin/bash

# SSH to server, dump the postgresql data to files, copy those files from server to current machine
# then delete the dump files on the server.

set -a
source .env_prod
set +a 

# script to dump db to plain text files on server
SCRIPT="
cd /home/${USER}/deployment_repos/coop/

docker exec -i $LIVE_DB_CONTAINER_NAME pg_dump -U $DB_USERNAME --column-inserts --data-only --table=goose_db_version $DB_DATABASE > ./backups/goose_db_version_dumpfile

docker exec -i $LIVE_DB_CONTAINER_NAME pg_dump -U $DB_USERNAME --column-inserts --data-only --table=users $DB_DATABASE > ./backups/users_details_dumpfile
docker exec -i $LIVE_DB_CONTAINER_NAME pg_dump -U $DB_USERNAME --column-inserts --data-only --table=user_images $DB_DATABASE > ./backups/users_images_dumpfile
docker exec -i $LIVE_DB_CONTAINER_NAME pg_dump -U $DB_USERNAME --column-inserts --data-only --table=users_avatars $DB_DATABASE > ./backups/users_avatars_dumpfile
docker exec -i $LIVE_DB_CONTAINER_NAME pg_dump -U $DB_USERNAME --column-inserts --data-only --table=roles $DB_DATABASE > ./backups/roles_dumpfile

docker exec -i $LIVE_DB_CONTAINER_NAME pg_dump -U $DB_USERNAME --column-inserts --data-only --table=users_saved_users $DB_DATABASE > ./backups/users_saved_users_dumpfile
docker exec -i $LIVE_DB_CONTAINER_NAME pg_dump -U $DB_USERNAME --column-inserts --data-only --table=users_saved_properties $DB_DATABASE > ./backups/users_saved_properties_dumpfile
docker exec -i $LIVE_DB_CONTAINER_NAME pg_dump -U $DB_USERNAME --column-inserts --data-only --table=users_saved_communities $DB_DATABASE > ./backups/users_saved_communities_dumpfile

docker exec -i $LIVE_DB_CONTAINER_NAME pg_dump -U $DB_USERNAME --column-inserts --data-only --table=properties $DB_DATABASE > ./backups/properties_details_dumpfile
docker exec -i $LIVE_DB_CONTAINER_NAME pg_dump -U $DB_USERNAME --column-inserts --data-only --table=properties_images $DB_DATABASE > ./backups/properties_images_dumpfile

docker exec -i $LIVE_DB_CONTAINER_NAME pg_dump -U $DB_USERNAME --column-inserts --data-only --table=communities $DB_DATABASE > ./backups/communities_details_dumpfile
docker exec -i $LIVE_DB_CONTAINER_NAME pg_dump -U $DB_USERNAME --column-inserts --data-only --table=communities_images $DB_DATABASE > ./backups/communities_images_dumpfile
docker exec -i $LIVE_DB_CONTAINER_NAME pg_dump -U $DB_USERNAME --column-inserts --data-only --table=communities_users $DB_DATABASE > ./backups/communities_users_dumpfile
docker exec -i $LIVE_DB_CONTAINER_NAME pg_dump -U $DB_USERNAME --column-inserts --data-only --table=communities_properties $DB_DATABASE > ./backups/communities_properties_dumpfile
"
ssh ${SERVER_ALIAS} "${SCRIPT}"

if [ $? -ne 0 ]; then 
    echo "Initial SSH script to dump files exited with non 0 status code."
    exit 1
fi

# copy those dumpfiles to local machine
rsync -avz -e ssh ${SERVER_ALIAS}:/home/${USER}/deployment_repos/coop/backups/ ./server_backups

if [ $? -ne 0 ]; then 
    echo "Rsync exited with non 0 status code."
    exit 1
fi

# remove dumpfiles on server
ssh ${SERVER_ALIAS} "rm -f /home/${USER}/deployment_repos/coop/backups/*_dumpfile"

if [ $? -ne 0 ]; then 
    echo "SSH script to remove server dumpfiles exited with non 0 status code."
    exit 1
fi

echo "Server backups complete."