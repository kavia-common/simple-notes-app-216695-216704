# Simple Notes — Frontend (React)

UI for creating, viewing, editing, and deleting notes. It talks to the FastAPI backend over REST.

## Prerequisites

- Node.js / npm
- Backend running (default: `http://localhost:3001`)

## Configure API Base URL

The API client (`src/api/notesApi.js`) reads the backend base URL from:

- `process.env.REACT_APP_API_BASE` (if set)
- otherwise defaults to `http://localhost:3001`

Create a `.env` file (or set env vars in your shell) to override:

```bash
# .env
REACT_APP_API_BASE=http://localhost:3001
```

> Note: Create React App only exposes env vars prefixed with `REACT_APP_`.
> After changing `.env`, restart `npm start`.

## Run

```bash
npm install
npm start
```

Open: http://localhost:3000

## Backend API Docs (OpenAPI)

When the backend is running, see interactive docs at:

- http://localhost:3001/docs
- OpenAPI JSON: http://localhost:3001/openapi.json
