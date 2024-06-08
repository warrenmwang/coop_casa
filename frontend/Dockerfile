# Use a node image
FROM node:21.6.1

# Setup the dir, copy src over, install the modules
WORKDIR /app
COPY . .
RUN npm install && npm install -g serve

# Build
RUN npm run build