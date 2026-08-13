# Markour

## Requirements

| Package Name | Min. Version |
| --- | --- |
| `node` | `20.9` |
| `pnpm` | `10.30.3` |

## Setup

Copy the dotenv file:

```sh
cp .env.example .env
```

Fill in the JWT secret:

```sh
JWT_SECRET=<your-jwt-secret>
```

Fill in the Google Sign-In credentials:

```sh
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
GOOGLE_REDIRECT_URI=<your-redirect-uri>
```

Migrate the database schema:

```sh
pnpm db:migrate
```

## Development

Run the development server:

```sh
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
