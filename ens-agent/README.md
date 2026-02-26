# ENS Chat

A chat-based assistant for registering and managing ENS (.eth) names on Ethereum. The app consists of three services that all need to be running for local development.

## Architecture

```
Frontend (React + Vite)  →  Backend (FastAPI + OpenAI Agents)  →  Worker API (Cloudflare Worker + Hono)
     :5173                        :8000                                  :8787
```

- **Frontend** (`frontend/`) — React chat UI with RainbowKit wallet integration. Sends messages to the backend via the ChatKit protocol.
- **Backend** (`backend/`) — FastAPI server running an OpenAI Agents SDK agent. Receives chat messages, invokes ENS tools, and streams responses back. All ENS reads/writes are proxied to the Worker API.
- **Worker API** (`../ens-agent-api/`) — Cloudflare Worker (Hono) that handles ENS operations: name resolution, subgraph queries, registration transactions, text record updates, etc. Uses on-chain RPC and ENSNode subgraph.

> **All three services must be running** for the app to work locally. If the Worker API is down, the backend's ENS tools will fail with connection errors.

## Prerequisites

- Node.js (for frontend and worker)
- Python 3.12+ (for backend)
- A Python virtual environment at `backend/.venv`

## Getting Started

Open three terminal tabs and start each service:

### 1. Worker API (port 8787)

```sh
cd ../ens-agent-api
npx wrangler dev
```

Requires a `.dev.vars` file with:
```
ETH_RPC_URL_SEPOLIA=<your Sepolia RPC URL>
ETH_RPC_URL_MAINNET=<your Mainnet RPC URL>
API_KEY=<worker API key>
```

### 2. Backend (port 8000)

```sh
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

Requires a `.env` file with:
```
OPENAI_API_KEY=<your OpenAI key>
WORKER_URL=http://localhost:8787
WORKER_API_KEY=<matching worker API key>
```

### 3. Frontend (port 5173)

```sh
cd frontend
npm run dev
```

Once all three are running, open http://localhost:5173.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| "Connection issue retrieving your ENS names" | Worker API is not running on port 8787 |
| Chat sends but no response | Backend is not running on port 8000 |
| Blank page / build errors | Frontend dev server is not running |
| ENS tools return 401 | `WORKER_API_KEY` in backend `.env` doesn't match `API_KEY` in worker `.dev.vars` |
