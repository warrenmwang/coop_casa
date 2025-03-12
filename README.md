# Coop.casa

### Overview

Just a project to learn about building full stack web applications around a theme that I own no creative rights to. I feel legally obligated to mention
that this project is currently not a legal entity nor a real company. This does not indicate anything about
whether Coop will exist in the future. The live demo of the site can be found [here](https://coop.casa/), and I make no guarantees
about whether or not this service will be maintained indefinitely since it currently provides no real world value other than
to convey an idea of what could exist.

If you are a hacker type and see a vuln in my code and have too much free time to dive into this codebase, please submit an issue and I will fix it. Or better
yet, submit a PR!

### Technical Details

Architecture Design

- Monolith, RESTful

Frontend

- Language: Typescript, TSX <br>
- Node JS Libraries: React, TanStack/React Query, React Router, and a couple others ... <br>
- CSS Libraries: TailwindCSS
- Transpilers: Babel, TSC
- Bundler: esbuild (what vite uses under the hood)

Backend

- Language: Golang, SQL <br>
- Golang Libraries: Goth, pgx, chi, jwt, and others <br>
- Database: PostgreSQL <br>
- Golang Tools: Goose, SQLC, <br>
  Other: Docker, Nginx <br>

Code Formatters:

- JS/TS/JSX/TSX => Prettier <br>
- Go => Gofmt, SQL => pgFormatter

### Getting Started

#### Development and Testing

Started with [Create React App (CRA)](https://create-react-app.dev). NOTE: I would not recommend starting new projects with CRA in 2024, if you
use options like [Vite](https://vitejs.dev/), but it still works nonetheless.
CRA configures Babel and Webpack under the hood, which may not be ideal if you want to customize them to your needs.
This project, so far, has not warranted the need to modify those configuration files.

I provide the bash script that I personally use for development in the `.dev` directory. However, it's just using `npm run start` for the client,
Go [air](https://github.com/air-verse/air) for the backend, and a docker container for the PostgreSQL DB.

Client tests are provided, run using Jest.
Backend tests are written using Go's standard library testing framework.

## Connecting Communities, Empowering Ownership

Coop wants to provide a platform for people to meet specifically with the idea in mind to
co-own a property together. Targeted specifically towards young people
who have never owned a property before, we the founders also understand what it's like to
look at the current housing market in the USA and feel the dread of trying to buy your own home.
Many things in life are hard and have to be done alone. Buying a home doesn't have to be one of them.

There are many reasons to consider co-ownership of properties. As part of our vision, we want
to emphasize the community aspect. In the wake of a current loneliness epidemic, we think
that trying to put efforts into fostering more communities that people actually want to be apart of
will ease the collective pain and suffering. Lots of people tackle this problem from different angles, and
we will come from the angle of trying to get people to commit to living together. Reducing physical distance
between old friends or new friends reduces the friction of trying to hang out and do things together or
even something as necessary and difficult like planning group trips.

Let's make great communities and learn, love, and laugh together.
