# Backend

REST API that manages user and group information for the coop.casa app. All user data is stored in the database.

## Misc. Notes From Me For Me

It took using `sqlc` a couple times, going through their docs, and finally going into their discord server that I now understand
that all the inputs are properly "parameterized" and therefore the input values are properly "escaped", thus solving the problem
of preventing SQL injection for me, as long as I use their functions with their parameters in my own code.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

## Tests

To run the backend tests run:

Note, this requires the PostgreSQL database to be up and running, with an `.env` file in the `backend` directory that contains the DB's details that are to be read by both the DB and the go process. Once the DB is up and running, then you can run the tests:

```
cd tests
go test
```

Honestly, just use the bash script that aims to run tests across all parts of the app in the `test` dir at root of this repo.

--

## MakeFile

run all make commands with clean tests

```bash
make all build
```

build the application

```bash
make build
```

run the application

```bash
make run
```

Create DB container

```bash
make docker-run
```

Shutdown DB container

```bash
make docker-down
```

live reload the application

```bash
make watch
```

run the test suite

```bash
make test
```

clean up binary from the last build

```bash
make clean
```
