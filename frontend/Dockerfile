# Build stage
FROM node:21.6.1-alpine AS build
WORKDIR /app
COPY . .
RUN npm install
ARG VITE_IS_PROD
ARG VITE_API_PROD_HOST
ARG VITE_API_PORT
ENV VITE_IS_PROD=$VITE_IS_PROD
ENV VITE_API_PROD_HOST=$VITE_API_PROD_HOST
ENV VITE_API_PORT=$VITE_API_PORT
RUN npm run build

# Deployment stage
FROM node:21.6.1-alpine
WORKDIR /app
COPY --from=build /app/build ./build
RUN npm install -g serve
