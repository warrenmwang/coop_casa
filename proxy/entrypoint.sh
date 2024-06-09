#!/bin/sh

# Substitute environment variables in the template and generate nginx.conf
sed -e "s/\${INTERNAL_FRONTEND_PORT}/$INTERNAL_FRONTEND_PORT/" -e "s/\${INTERNAL_BACKEND_PORT}/$INTERNAL_BACKEND_PORT/" /etc/nginx/templates/nginx.conf.template > /etc/nginx/nginx.conf

# Execute the CMD from the Dockerfile
exec "$@"