# Build stage
FROM golang:1.22-alpine AS build
WORKDIR /app
COPY . .
RUN go mod download && go mod verify
RUN go build -o main cmd/api/main.go

# Goose stage
FROM golang:1.22-alpine AS goose
RUN go install github.com/pressly/goose/v3/cmd/goose@latest

# Deployment stage
FROM alpine:3.19
WORKDIR /app
RUN apk add --no-cache bash
COPY ./sql/schema ./sql/schema
COPY --from=build /app/main ./
COPY --from=goose /go/bin/goose /usr/local/bin/goose
COPY goose_migrate.sh .
RUN chmod +x goose_migrate.sh
CMD [ "/bin/bash", "-c", "./goose_migrate.sh && ./main" ]
