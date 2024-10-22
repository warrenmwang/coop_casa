#!/bin/bash

# Allows inserting backed up data into tables in a database schema that is expected to be up and existing from a goose migration.
# Also assumes the database container is up for the respective target.

usage() {
    echo "Usage: $0 [target]"
    echo "  Valid targets are: localdocker, localdev, prod"
}

restoreLocalDockerData() {
    # source env vars
    if [ -f .env_local_docker ]; then
      set -a
      source .env_local_docker
      set +a
    else
      echo ".env_local_docker file not found!"
      exit 1
    fi

    cat ./local_backups/goose_db_version_dumpfile | docker exec -i coop_casa-psql_db-1 psql -U $DB_USERNAME -d $DB_DATABASE

    cat ./local_backups/users_details_dumpfile | docker exec -i coop_casa-psql_db-1 psql -U $DB_USERNAME -d $DB_DATABASE
    cat ./local_backups/users_images_dumpfile | docker exec -i coop_casa-psql_db-1 psql -U $DB_USERNAME -d $DB_DATABASE
    cat ./local_backups/users_avatars_dumpfile | docker exec -i coop_casa-psql_db-1 psql -U $DB_USERNAME -d $DB_DATABASE
    cat ./local_backups/roles_dumpfile | docker exec -i coop_casa-psql_db-1 psql -U $DB_USERNAME -d $DB_DATABASE

    cat ./local_backups/users_saved_users_dumpfile | docker exec -i coop_casa-psql_db-1 psql -U $DB_USERNAME -d $DB_DATABASE
    cat ./local_backups/users_saved_properties_dumpfile | docker exec -i coop_casa-psql_db-1 psql -U $DB_USERNAME -d $DB_DATABASE
    cat ./local_backups/users_saved_communities_dumpfile | docker exec -i coop_casa-psql_db-1 psql -U $DB_USERNAME -d $DB_DATABASE
    cat ./local_backups/users_status_dumpfile | docker exec -i coop_casa-psql_db-1 psql -U $DB_USERNAME -d $DB_DATABASE

    cat ./local_backups/properties_details_dumpfile | docker exec -i coop_casa-psql_db-1 psql -U $DB_USERNAME -d $DB_DATABASE
    cat ./local_backups/properties_images_dumpfile | docker exec -i coop_casa-psql_db-1 psql -U $DB_USERNAME -d $DB_DATABASE

    cat ./local_backups/communities_details_dumpfile | docker exec -i coop_casa-psql_db-1 psql -U $DB_USERNAME -d $DB_DATABASE
    cat ./local_backups/communities_images_dumpfile | docker exec -i coop_casa-psql_db-1 psql -U $DB_USERNAME -d $DB_DATABASE
    cat ./local_backups/communities_users_dumpfile | docker exec -i coop_casa-psql_db-1 psql -U $DB_USERNAME -d $DB_DATABASE
    cat ./local_backups/communities_properties_dumpfile | docker exec -i coop_casa-psql_db-1 psql -U $DB_USERNAME -d $DB_DATABASE
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
        "localdocker")
            restoreLocalDockerData
            ;;
        "localdev")
            echo "TODO localdev"
            ;;
        "prod")
            echo "TODO prod"
            ;;
        *)
            echo "Uknown target. Valid target options are: localdocker, localdev, prod"
            exit 1
            ;;
    esac
}

main "$1"
