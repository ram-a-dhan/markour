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
