# Use Go Image
FROM golang:1.22

# Install PostgreSQL client (to ensure db is up before running migrations)
RUN apt-get update && apt-get install -y postgresql-client

# Define app directory
WORKDIR /app

# Copy the Go modules and sum files
COPY go.mod go.sum ./

# Download Go module dependencies
RUN go mod download && go mod verify

# Install Goose
RUN go install github.com/pressly/goose/v3/cmd/goose@latest

# Copy the rest of the application's source code
COPY . .

# Build the Application
RUN go build -o main cmd/api/main.go
