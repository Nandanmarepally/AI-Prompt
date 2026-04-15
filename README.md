# AI Prompt Library

A full-stack application for storing, discovering, and managing AI image generation prompts.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript (Vite) |
| Backend | Python 3.11 + Django 4.2 |
| Database | PostgreSQL 16 |
| Cache / Counter | Redis 7 |
| Containerisation | Docker + Docker Compose |

---

## Project Structure

```
ai-prompt-library/
├── backend/
│   ├── config/
│   │   ├── settings.py       # Django settings (DB, Redis, CORS)
│   │   ├── urls.py           # Root URL config
│   │   └── wsgi.py
│   ├── prompts/
│   │   ├── migrations/
│   │   │   └── 0001_initial.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py         # Prompt model
│   │   ├── views.py          # API endpoints + Redis counter
│   │   └── urls.py
│   ├── requirements.txt
│   ├── entrypoint.sh         # Wait-for-postgres → migrate → gunicorn
│   ├── Dockerfile
│   └── manage.py
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── prompt-list/
│   │   │   │   │   └── prompt-list.component.tsx
│   │   │   │   ├── prompt-detail/
│   │   │   │   │   └── prompt-detail.component.tsx
│   │   │   │   └── add-prompt/
│   │   │   │       └── add-prompt.component.tsx
│   │   │   ├── services/
│   │   │   │   └── prompt.service.ts
│   │   │   ├── models/
│   │   │   │   └── prompt.model.ts
│   │   │   ├── app-routing.module.tsx
│   │   │   └── app.module.tsx
│   │   ├── main.tsx
│   │   └── styles.css
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
│
├── docker-compose.yml
├── .env
└── README.md
```

---

## API Endpoints

| Method | URL | Description |
|---|---|---|
| `GET` | `/api/prompts/` | List all prompts |
| `POST` | `/api/prompts/` | Create a new prompt |
| `GET` | `/api/prompts/:id/` | Get one prompt + increment Redis view counter |

### Example POST body
```json
{
  "title": "Neon Cyberpunk City",
  "content": "A sprawling cyberpunk city at night, neon reflections on wet streets, ultra-detailed, cinematic...",
  "complexity": 7
}
```

### Validation rules (backend + frontend)
- `title` — required, ≥ 3 chars, ≤ 255 chars
- `content` — required, ≥ 20 chars
- `complexity` — integer 1–10

---

## Running with Docker Compose

### Prerequisites
- Docker Desktop installed and running

### Steps

```bash
# 1. Clone / open the project
cd "AI Prompt"

# 2. Start all services (builds images on first run)
docker-compose up --build

# 3. Open in browser
#    Frontend  →  http://localhost
#    Django API → http://localhost:8000/api/prompts/
#    Django Admin → http://localhost:8000/admin/
```

> On first run the backend automatically runs `python manage.py migrate`.  
> Database data persists in the `postgres_data` Docker volume between restarts.

### Create a Django superuser (optional, for admin panel)
```bash
docker exec -it promptlib_backend python manage.py createsuperuser
```

---

## Running Locally (without Docker)

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt

# Set env vars or edit settings.py to point to a local Postgres
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:4200
# /api calls are proxied to http://localhost:8000 via vite.config.ts
```

---

## Architecture

```
Browser
   │
   ▼
React (Vite) ─── /api/* ──▶ Django (Gunicorn)
                                   │           │
                              PostgreSQL     Redis
                           (prompt data)  (view counts)
```

- **View counts** are stored exclusively in Redis using `INCR prompt:<id>:views`.  
  Each `GET /api/prompts/<id>/` call atomically increments the counter.
- **Prompt data** (title, content, complexity, created_at) is stored in PostgreSQL.
- The frontend is served as static files through Nginx in production.

---

## Assumptions & Trade-offs

- View counts are stored in Redis only (not persisted to PostgreSQL), so counts reset if the Redis container is recreated without a persistent volume.
- Django views are plain function-based views returning `JsonResponse` — no DRF required.
- CORS is configured to allow all origins in Docker (suitable for dev/assignment; restrict in production).
- The Nginx config in the frontend Dockerfile additionally proxies `/api/` to the backend, so the app works on port 80 without needing port 8000 to be open.
