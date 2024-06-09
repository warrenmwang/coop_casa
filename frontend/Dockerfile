# Dockerfile for frontend

# build portion
FROM node:21.6.1-alpine AS build

WORKDIR /app

# install dependencies
COPY package.json package-lock.json ./
RUN npm install && npm install -g serve

# copy rest of code
COPY . .

# define the build time args 
ARG REACT_APP_IS_PROD
ARG REACT_APP_API_PROD_HOST
ARG REACT_APP_API_PORT

# Set environment variables for the build process
ENV REACT_APP_IS_PROD=$REACT_APP_IS_PROD
ENV REACT_APP_API_PROD_HOST=$REACT_APP_API_PROD_HOST
ENV REACT_APP_API_PORT=$REACT_APP_API_PORT

# build
RUN npm run build

# serve portion
FROM node:21.6.1-alpine
WORKDIR /app
COPY --from=build /app/build ./build
RUN npm install -g serve
