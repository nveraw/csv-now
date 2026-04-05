# csv-now

## How it works

1. **Upload** — select a `.csv` file and submit.
2. **Duplicate handling** — if the file contains ID that already exists in the system, a dialog shows a preview of the conflicting rows. User can choose to overwrite (`upsert`), skip (`ignore`), or abort.
3. **Processing** — the file is queued via BullMQ and processed in batches by a background worker. Progress is streamed back to the client in real time over Socket.IO.
4. **Browse** — view the stored records in a paginated table with a search filter.

## Tech stack

**Client** — React, Redux Toolkit, TanStack Query, Chakra UI, Socket.IO client, Vite

**Server** — Node.js, Express, Socket.IO, BullMQ (Redis), Supabase (Postgres), Multer, PapaParse

## CSV format

The uploaded file must contain exactly these columns (order doesn't matter, extra columns are ignored):

| Column   | Type   |
| -------- | ------ |
| `postId` | number |
| `id`     | number |
| `name`   | string |
| `email`  | string |
| `body`   | string |

Maximum file size: **10MB**. Only `.csv` files are accepted.

## API

| Method | Path                     | Description                                                                     |
| ------ | ------------------------ | ------------------------------------------------------------------------------- |
| `POST` | `/api/upload`            | Upload a CSV file. Returns `uploadId` and optional `duplicate` payload.         |
| `POST` | `/api/:uploadId/confirm` | Confirm duplicate handling. Body: `{ option: "upsert" \| "ignore" \| "abort" }` |
| `GET`  | `/api/records`           | Fetch records. Query params: `page`, `pageSize`, `filter`                       |

### Socket events (server → client)

| Event             | Payload               | Description                      |
| ----------------- | --------------------- | -------------------------------- |
| `upload_progress` | `{ uploaded, total }` | Emitted after each batch insert  |
| `upload_complete` | `{ uploaded, total }` | Emitted when the worker finishes |
| `upload_error`    | `{ message }`         | Emitted if the worker job fails  |

## Environment variables

**Server** (`.env`)

```
SUPABASE_URL=
SUPABASE_KEY=
REDIS_HOST=localhost     # optional, defaults to localhost
PORT=3001                # optional, defaults to 3001
```

**Client** (`.env`)

```
VITE_API_URL=http://localhost:3001
```

## Getting started

**Prerequisites:** Node.js, Redis, a Supabase project with a `csv_now` table.

```bash
# install dependencies in both workspaces
cd server && npm install
cd ../client && npm install

# start Redis (if running locally)
docker exec -it redis redis-cli (or check: https://redis.io/docs/latest/develop/tools/)

# start the server and client
npm run dev

# start with docker
docker compose down -v
docker compose up --build
```

The client runs on `http://localhost:5173` and the server on `http://localhost:3001`.

## Running tests

```bash
# server
cd server && npm test

# client
cd client && npm test
```
