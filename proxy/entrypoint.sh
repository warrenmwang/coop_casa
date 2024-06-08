#!/bin/sh

# Substitute environment variables in the template and generate nginx.conf
sed -e "s/\${FRONTEND_PORT}/$FRONTEND_PORT/" -e "s/\${BACKEND_PORT}/$BACKEND_PORT/" /etc/nginx/templates/nginx.conf.template > /etc/nginx/nginx.conf

# Execute the CMD from the Dockerfile
exec "$@"