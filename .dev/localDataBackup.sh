#!/bin/bash

# Assumes the $DB_DATABASE Postgres docker container is up.
# Backs up the data in the DB onto disk separately as plain text SQL dump files.

if [ -e "../backend/.env" ]; then
    source ../backend/.env
else 
    exit 1
fi


docker exec -i backend-psql-1 pg_dump -U $DB_USERNAME --column-inserts --data-only --table=goose_db_version $DB_DATABASE > ./local_backups/goose_db_version_dumpfile

docker exec -i backend-psql-1 pg_dump -U $DB_USERNAME --column-inserts --data-only --table=users $DB_DATABASE > ./local_backups/users_details_dumpfile
docker exec -i backend-psql-1 pg_dump -U $DB_USERNAME --column-inserts --data-only --table=user_images $DB_DATABASE > ./local_backups/users_images_dumpfile
docker exec -i backend-psql-1 pg_dump -U $DB_USERNAME --column-inserts --data-only --table=users_avatars $DB_DATABASE > ./local_backups/users_avatars_dumpfile
docker exec -i backend-psql-1 pg_dump -U $DB_USERNAME --column-inserts --data-only --table=roles $DB_DATABASE > ./local_backups/roles_dumpfile

docker exec -i backend-psql-1 pg_dump -U $DB_USERNAME --column-inserts --data-only --table=users_saved_users $DB_DATABASE > ./local_backups/users_saved_users_dumpfile
docker exec -i backend-psql-1 pg_dump -U $DB_USERNAME --column-inserts --data-only --table=users_saved_properties $DB_DATABASE > ./local_backups/users_saved_properties_dumpfile
docker exec -i backend-psql-1 pg_dump -U $DB_USERNAME --column-inserts --data-only --table=users_saved_communities $DB_DATABASE > ./local_backups/users_saved_communities_dumpfile

docker exec -i backend-psql-1 pg_dump -U $DB_USERNAME --column-inserts --data-only --table=properties $DB_DATABASE > ./local_backups/properties_details_dumpfile
docker exec -i backend-psql-1 pg_dump -U $DB_USERNAME --column-inserts --data-only --table=properties_images $DB_DATABASE > ./local_backups/properties_images_dumpfile

docker exec -i backend-psql-1 pg_dump -U $DB_USERNAME --column-inserts --data-only --table=communities $DB_DATABASE > ./local_backups/communities_details_dumpfile
docker exec -i backend-psql-1 pg_dump -U $DB_USERNAME --column-inserts --data-only --table=communities_images $DB_DATABASE > ./local_backups/communities_images_dumpfile
docker exec -i backend-psql-1 pg_dump -U $DB_USERNAME --column-inserts --data-only --table=communities_users $DB_DATABASE > ./local_backups/communities_users_dumpfile
docker exec -i backend-psql-1 pg_dump -U $DB_USERNAME --column-inserts --data-only --table=communities_properties $DB_DATABASE > ./local_backups/communities_properties_dumpfile
