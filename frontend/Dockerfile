# Build stage
FROM node:22.14.0-alpine AS build
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
FROM nginx:latest
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
