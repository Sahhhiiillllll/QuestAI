# QuestAI – AI Assessment Creator

> Full-stack AI-powered question paper generator built for the VedaAI hiring assignment.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-20-green)](https://nodejs.org)

---

## Live Demo

- **Frontend**: [Deployed Link]
- **Backend API**: [API URL]
- **GitHub**: [Repository URL]

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                              │
│  Next.js 15 + TypeScript + Zustand + WebSocket              │
└────────────────────┬────────────────────┬───────────────────┘
                     │ HTTP/REST           │ WebSocket
┌────────────────────▼────────────────────▼───────────────────┐
│                    EXPRESS SERVER (Node.js)                  │
│  REST API + WebSocket Server + Internal Notification API    │
└────────────────┬───────────────────────────────────────────┘
                 │
       ┌─────────┴─────────┐
       │                   │
┌──────▼──────┐   ┌────────▼────────┐
│   MongoDB   │   │   Redis + BullMQ│
│  (storage)  │   │  (queue/cache)  │
└─────────────┘   └────────┬────────┘
                           │
                  ┌────────▼────────┐
                  │   BullMQ Worker │
                  │  (background)   │
                  └────────┬────────┘
                           │
                  ┌────────▼────────┐
                  │  Anthropic API  │
                  │  (Claude AI)    │
                  └─────────────────┘
```

### Request Flow

1. Teacher fills the assignment creation form (3-step wizard)
2. Frontend sends POST `/api/assignments` → backend validates & saves to MongoDB
3. Job added to **BullMQ queue** (backed by Redis)
4. Response immediately returns `assignmentId` — frontend navigates to progress page
5. **BullMQ Worker** (separate process) picks up job, calls Anthropic API
6. Worker sends progress notifications via HTTP to main server
7. Main server broadcasts via **WebSocket** to subscribed frontend clients
8. Frontend shows real-time progress bar (10% → 40% → 80% → 100%)
9. On completion, result stored in MongoDB; frontend fetches and renders the paper
10. Teacher can download as **PDF** or **Regenerate**

---

## Tech Stack

### Frontend
| Tech | Purpose |
|------|---------|
| Next.js 15 (App Router) | Framework |
| TypeScript | Type safety |
| Zustand | State management |
| WebSocket (native) | Real-time updates |
| jsPDF | PDF export |
| date-fns | Date formatting |
| Tailwind CSS + CSS Variables | Styling |

### Backend
| Tech | Purpose |
|------|---------|
| Node.js + Express | HTTP server |
| TypeScript | Type safety |
| MongoDB + Mongoose | Persistent storage |
| Redis (ioredis) | Cache + job state |
| BullMQ | Background job queue |
| ws | WebSocket server |
| multer | File upload handling |

### AI
| Tech | Purpose |
|------|---------|
| Anthropic Claude (claude-sonnet-4) | Question generation |
| Structured prompt engineering | Reliable JSON output |
| Validation layer | Parse & verify AI response |

---

## Features

### Core
- ✅ 3-step assignment creation wizard with validation
- ✅ File upload (PDF/text) as reference material
- ✅ 5 question types: MCQ, Short, Long, True/False, Fill in Blanks
- ✅ Difficulty levels: Easy, Medium, Hard, Mixed
- ✅ Real-time generation progress via WebSocket
- ✅ Structured question paper with sections (A, B, C…)
- ✅ Difficulty badges (Easy/Medium/Hard) on each question
- ✅ Student info section (Name, Roll No, Section)
- ✅ Regenerate functionality
- ✅ Delete assignments

### Bonus
- ✅ **PDF Export** — properly formatted, not HTML print
- ✅ Redis caching for assignments (TTL-based)
- ✅ BullMQ job retry with exponential backoff
- ✅ WebSocket reconnection with auto-retry
- ✅ Polling fallback when WebSocket unavailable
- ✅ Dark theme UI with animations

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Redis (local or Upstash)
- Anthropic API key

### Option 1: Docker Compose (Recommended)

```bash
git clone <repo-url>
cd vedaai

# Set your API key
echo "ANTHROPIC_API_KEY=your_key_here" > .env

# Start everything
docker compose up
```

App available at http://localhost:3000

### Option 2: Manual Setup

**Backend**
```bash
cd backend
cp .env.example .env
# Edit .env and set your ANTHROPIC_API_KEY, MONGODB_URI, REDIS_URL

npm install
npm run dev        # Start API server (port 5001; macOS often uses 5000 for AirPlay)
npm run worker     # Start BullMQ worker (separate terminal)
```

**Frontend**
```bash
cd frontend
cp .env.example .env.local
# Edit if needed (defaults point to http://localhost:5001)

npm install
npm run dev        # Start Next.js (port 3000)
```

**Infrastructure (MongoDB + Redis)**
```bash
# From project root — requires Docker Desktop running
docker compose up -d mongodb redis
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/api/assignments` | List all assignments |
| `POST` | `/api/assignments` | Create + enqueue generation |
| `GET` | `/api/assignments/:id` | Get assignment with paper |
| `POST` | `/api/assignments/:id/regenerate` | Regenerate paper |
| `DELETE` | `/api/assignments/:id` | Delete assignment |

### WebSocket
Connect to `ws://localhost:5001/ws`, then subscribe:
```json
{ "type": "subscribe", "assignmentId": "..." }
```

Receive events: `status_update`, `progress`, `completed`, `failed`

---

## Prompt Engineering Approach

The AI generation uses a carefully structured prompt that:

1. **Specifies exact JSON schema** — eliminates ambiguity in output format
2. **Enforces constraints** — exact question count, mark distribution, section structure
3. **Uses strong instructions** — "Respond ONLY with valid JSON, no markdown"
4. **Validates output** — server-side validation layer rejects malformed responses
5. **Falls back gracefully** — retries on failure via BullMQ job retry

---

## Project Structure

```
vedaai/
├── backend/
│   ├── src/
│   │   ├── index.ts           # Express server + WebSocket
│   │   ├── worker.ts          # BullMQ worker process
│   │   ├── models/
│   │   │   └── Assignment.ts  # MongoDB schema
│   │   ├── routes/
│   │   │   └── assignments.ts # REST endpoints
│   │   └── services/
│   │       ├── aiGenerator.ts # Anthropic API + prompt
│   │       ├── queue.ts       # BullMQ queue setup
│   │       ├── redis.ts       # Redis connection + cache
│   │       └── websocket.ts   # WS manager
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx                    # Dashboard
│   │   │   ├── assignments/new/page.tsx    # Creation wizard
│   │   │   └── assignments/[id]/page.tsx  # Paper viewer
│   │   ├── store/
│   │   │   └── assignmentStore.ts  # Zustand store
│   │   ├── hooks/
│   │   │   └── useWebSocket.ts     # WS hook
│   │   ├── lib/
│   │   │   └── pdfExport.ts        # jsPDF export
│   │   └── types/
│   │       └── index.ts            # TypeScript types
│   └── package.json
└── docker-compose.yml
```

---

## Design Decisions

- **Separate worker process** — prevents generation blocking the API server
- **BullMQ over raw Redis queues** — built-in retries, progress tracking, dead-letter
- **WebSocket + HTTP polling fallback** — handles environments without WS support
- **Structured AI prompting** — avoids raw LLM output being rendered to users
- **Zustand over Redux** — simpler boilerplate for this scale, devtools support included
- **jsPDF over html2canvas** — true PDF generation with proper A4 formatting, not HTML screenshot


