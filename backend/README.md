# Backend

Compiled binary is an HTTP server that acts as a (mostly) RESTful API that manages user and group information for the coop.casa app. All user data is stored in the database.

## Documentation
Comments are written in the `godoc` style. To view documentation in a web interface locally, 
I recommend just using `godoc`.
1. Install it with `go install golang.org/x/tools/cmd/godoc@latest`.
2. At the root of `backend` module run `godoc -http=:6060`.
3. Navigate to `http://localhost:6060/pkg/backend/?m=all`. 
> Note the query parameter `?m=all` is needed in order to let the web server reveal the docs for 
> internal packages, which is like 99% of this backend service.

## Testing
See the bash script I use for running tests against the service that is connected
to a a test PostgreSQL docker container running [here](../.dev/runTests.sh).
