# Campus Lost and Found Website
## Overview

The Campus Lost and Found System is a web application that allows university students and staff to report, search for and recover lost items on campus.
This platform centralizes lost and found reports and provides a secure environment for campus members to communicate and recover belongings.

## Features:
- User registration and login (students and staff only)
- Post lost or found items with description, images, date and location
- Search and filter items by location and date
- Item status tracking (Lost, Found, Returned)
- Messaging system between users
- Email notifications for updates and reminders

# SDSU Lost & Found — Project Documentation

## Overview

SDSU Lost & Found is a full-stack campus web application that allows SDSU students and staff to report lost or found items, search existing posts, and communicate with each other to return belongings safely. The platform centralizes lost and found reports, connects posts to verified user accounts, and keeps item communication inside the app through a built-in messaging system.

---

## Tech Stack Summary

| Layer            | Technologies                                                                 |
|------------------|------------------------------------------------------------------------------|
| Frontend         | Next.js 16, React 19, TypeScript, Tailwind CSS                               |
| Backend          | Python 3.13, FastAPI, SQLAlchemy, Pydantic v2                                |
| Database         | SQLite (via SQLAlchemy ORM)                                                  |
| Authentication   | JWT (PyJWT) — access tokens (15 min) + refresh tokens (7 days)               |
| Password Hashing | `pwdlib` with Argon2, `passlib` with bcrypt                                  |
| Package Manager  | `uv` (Python), `npm` (Node.js)                                               |
| Dev Tools        | Ruff (linter), Pytest, httpx, ESLint, TypeScript compiler                    |
| Deployment       | Docker (backend), Uvicorn ASGI server                                        |

---

## Frontend

**Directory:** `frontend/`

### Framework & Language
- **Next.js 16** — App Router, file-based routing, server and client components
- **React 19** — UI rendering
- **TypeScript** — full static typing across all components and pages

### Styling
- **Tailwind CSS v4** — utility-first CSS framework
- **shadcn/ui** — pre-built accessible component library built on Radix UI primitives
- **lucide-react** — icon set

### Forms & Validation
- **react-hook-form** — form state management, controlled inputs, and submission handling
- **@hookform/resolvers** — connects react-hook-form to Zod for schema-based validation
- **Zod** — client-side schema validation (mirrors Pydantic schemas on the backend)

### Data Fetching
- **@tanstack/react-query** — server state management, caching, background refetching, and loading states
- **@tanstack/react-query-devtools** — development tooling for inspecting the query cache

### Pages Built
- `/` — Home/landing page
- `/about` — Project info and tech stack overview
- `/create-post` — Form to create a lost or found item post
- `/messages` — Conversation list and chat panel UI

### Key Components
- `conversation-panel.tsx` — Real-time chat UI with message bubbles, scroll handling, send form, and open/close behavior
- `navbar.tsx` — Site-wide navigation bar

### Config & Tooling
- `tsconfig.json` — TypeScript compiler options with strict mode enabled
- `next.config.ts` — Next.js configuration
- `eslint` + `eslint-config-next` — linting

---

## Backend

**Directory:** `backend/`

### Framework & Language
- **Python 3.13** — required minimum version
- **FastAPI** — async-capable REST API framework with automatic OpenAPI docs generation
- **Uvicorn** — ASGI server used to run the FastAPI application

### Project & Package Management
- **uv** — fast Python package manager and project tool (replaces pip/venv). Used to install dependencies, manage the lockfile (`uv.lock`), and run the app via `uv run uvicorn ...`
- **pyproject.toml** — single source of truth for all project dependencies and metadata

### API Structure

All routes are registered under `/api/v1/` via a central router in `api/v1/routes.py`.

| Router File               | Prefix                   | Responsibility                                      |
|---------------------------|--------------------------|-----------------------------------------------------|
| `routes/user.py`          | `/api/v1/user`           | Signup, login, get/update/delete user               |
| `routes/token.py`         | `/api/v1/token`          | Refresh access token, logout (revoke refresh token) |
| `routes/items.py`         | `/api/v1/items`          | Create, read, update, delete lost/found posts       |
| `routes/conversations.py` | `/api/v1/conversations`  | Create/list/delete conversations, get/send messages |
| `routes/uploads.py`       | `/api/v1/uploads`        | Image upload, file validation, disk storage         |

### Authentication (`core/auth.py`)
- **PyJWT (`pyjwt`)** — encoding and decoding JWT tokens using the HS256 algorithm
- **python-jose** — additional JWT/cryptography support
- **OAuth2PasswordBearer** — FastAPI dependency used to extract the Bearer token from request headers
- Access tokens expire in **15 minutes**; refresh tokens expire in **7 days**
- Refresh tokens are stored in the database as a **SHA-256 hash** (never the raw token), with fields for `jti`, `revoked_at`, `expires_at`, `last_used_at`, `user_agent`, and `ip`
- `get_current_user_id` — FastAPI dependency injected into all protected routes to identify the current user

### Password Hashing
- **pwdlib** with `argon2` extra — primary password hashing library using the Argon2 algorithm (modern recommended standard)
- **passlib** with `bcrypt` extra — also included as a secondary hashing option

### Settings (`core/settings.py`)
- **pydantic-settings** (`BaseSettings`) — reads environment variables and `.env` files into a typed `Settings` object. Covers JWT secret, algorithm, token expiry, database URL, upload directory, and max upload size.

### Services Layer
Business logic is separated from route handlers into service modules:
- `services/user.py` — signup, login, profile updates, password hashing
- `services/token_service.py` — issue token pairs, refresh, revoke
- `services/chat_service.py` — send/read messages with participant access control
- `services/conversation.py` — get-or-create conversation logic, list conversations with last message previews

### Repository Layer
All raw database queries are abstracted into repository classes:
- `repository/user.py` — user CRUD
- `repository/conversation_repository.py` — conversation queries
- `repository/message_repository.py` — message queries (list, create, delete, get last)

### Linting & Testing
- **Ruff** — fast Python linter and formatter (replaces flake8/black); configured in `pyproject.toml`
- **Pytest** — test runner
- **httpx** — async HTTP client used in tests to make requests to the FastAPI app

### Deployment
- **Docker** — `backend/Dockerfile` defines the container image. Uses `python:3.13-slim` as the base, installs `uv`, syncs dependencies from `uv.lock` with `uv sync --frozen --no-dev`, and runs Uvicorn on port 8000.
- **Alembic** — database migration tool included as a dependency for managing future schema changes

---

## Pydantic

Pydantic v2 is used throughout the backend for **request body validation**, **response serialization**, and **settings management**. Every API route uses Pydantic schemas.

### Schema Files

**`schemas/user.py`**
- `UserBase` — validates that the email ends in `@sdsu.edu`
- `UserCreate` — adds password validation: 8–20 chars, must include a number, letter, and special character; name fields are stripped of whitespace
- `UserUpdate` — optional fields for first name, last name, and email
- `User` — public user response shape
- `LoginRequest`, `SignupResponse`, `UserUpdateResponse` — request/response wrappers

**`schemas/items.py`**
- `ItemCreate` — title (max 255 chars), description, location, `report_type` (`Literal["lost", "found"]`), optional image URL, `given_back` flag
- `ItemUpdate` — all fields optional for partial updates
- `ItemOut` / `ItemListItem` — ORM-mode response schemas using `model_config = ConfigDict(from_attributes=True)`

**`schemas/message.py`**
- `MessageCreate` — content field with 1–2000 character limits
- `MessageOut` — full message response including `is_read` status
- `MessageListItem` — simplified list view

**`schemas/conversation.py`**
- `ConversationCreate` — just a `recipient_id`
- `ConversationOut` — returns `id` and list of `participant_ids`
- `ConversationListItem` — includes `partner_name` and `last_message` preview

**`schemas/token.py`**
- `TokenPairResponse` — contains both access and refresh tokens
- `RefreshRequest` / `AccessTokenResponse` — for the `/token/refresh` endpoint
- `LogoutRequest` / `LogoutResponse` — for the `/token/logout` endpoint

**`core/settings.py`**
- Extends `pydantic_settings.BaseSettings` to load typed app config from environment variables and `.env` file

### Pydantic Features Used
- `BaseModel`, `field_validator`, `@classmethod` validators
- `EmailStr` for email type validation
- `Field(min_length=..., max_length=...)` for string constraints
- `Literal["lost", "found"]` for enum-style type narrowing
- `model_config = {"from_attributes": True}` (ORM mode) for serializing SQLAlchemy model instances directly
- `ConfigDict` for model-level configuration

---

## Database (SQLite)

**Connection string:** `sqlite:///./sdsu_lost_and_found.db` — a local file-based SQLite database.

**Config:** `core/db.py`
- `create_engine` with `check_same_thread: False` for SQLite thread compatibility
- `SessionLocal` created via `sessionmaker(autocommit=False, autoflush=False)`
- `get_db()` — FastAPI dependency that yields a DB session and closes it after each request
- `Base.metadata.create_all(bind=engine)` in `main.py` auto-creates all tables on startup

### ORM: SQLAlchemy 2.x

All tables are defined as Python classes inheriting from `DeclarativeBase`. The project uses both the modern `Mapped`/`mapped_column` typed syntax and the classic `Column` style.

### Tables

**`users`**
| Column         | Type       | Notes                        |
|----------------|------------|------------------------------|
| `id`           | Integer PK | Auto-increment, indexed      |
| `first_name`   | String(15) | Required                     |
| `last_name`    | String(15) | Required                     |
| `email`        | String(30) | Unique, indexed              |
| `password_hash`| String     | Argon2/bcrypt hash           |

Relationships: `items`, `message_sent`, `refresh_tokens`, `conversation_as_user1`, `conversation_as_user2` — all with `cascade="all, delete-orphan"`

**`items`**
| Column        | Type        | Notes                          |
|---------------|-------------|--------------------------------|
| `id`          | Integer PK  |                                |
| `user_id`     | Integer FK  | References `users.id`, CASCADE |
| `title`       | String(255) |                                |
| `description` | Text        |                                |
| `location`    | String(255) |                                |
| `report_type` | String(20)  | `"lost"` or `"found"`, indexed |
| `image_url`   | String(500) | Nullable                       |
| `given_back`  | Boolean     | Default `False`                |
| `created_at`  | DateTime    | Default `utcnow`               |

**`conversations`**
| Column      | Type       | Notes                 |
|-------------|------------|-----------------------|
| `id`        | Integer PK |                       |
| `user_id1`  | Integer FK | References `users.id` |
| `user_id2`  | Integer FK | References `users.id` |
| `created_at`| DateTime   | Timezone-aware        |

Relationship: `messages` with `cascade="all, delete"`

**`messages`**
| Column            | Type       | Notes                         |
|-------------------|------------|-------------------------------|
| `id`              | Integer PK |                               |
| `conversation_id` | Integer FK | References `conversations.id` |
| `sender_id`       | Integer FK | References `users.id`         |
| `message_text`    | String     | Required                      |
| `is_read`         | Boolean    | Default `False`               |
| `created_at`      | DateTime   | Timezone-aware                |

**`refresh_tokens`**
| Column         | Type        | Notes                              |
|----------------|-------------|------------------------------------|
| `id`           | Integer PK  |                                    |
| `user_id`      | Integer FK  | References `users.id`, CASCADE     |
| `token_hash`   | String(64)  | SHA-256 hex of the raw JWT         |
| `jti`          | String(36)  | JWT ID (UUID), indexed             |
| `created_at`   | DateTime    |                                    |
| `expires_at`   | DateTime    |                                    |
| `revoked_at`   | DateTime    | Nullable — set on logout           |
| `last_used_at` | DateTime    | Nullable — updated on each refresh |
| `user_agent`   | String(256) | Nullable                           |
| `ip`           | String(45)  | Nullable (supports IPv6)           |

---

## File Uploads

- **Route:** `POST /api/v1/uploads/image`
- **Accepted formats:** JPEG, PNG, GIF, WebP
- **Max size:** 5 MB (configurable via `Settings.max_upload_size_bytes`)
- **python-multipart** — required by FastAPI to parse `multipart/form-data` file uploads
- Files are saved to the local filesystem under `./data/uploads/` with a UUID-based filename
- The `/uploads` path is mounted as a **StaticFiles** directory by FastAPI, making uploaded images publicly accessible by URL
- The returned URL is stored as `image_url` on the item record

---

## Project Structure

```
project/
├── frontend/
│   ├── src/
│   │   ├── app/                   # Next.js App Router pages
│   │   └── components/            # Reusable React components
│   ├── package.json
│   └── tsconfig.json
│
└── backend/
    ├── src/app/
    │   ├── api/v1/routes.py       # Central router
    │   ├── core/                  # db.py, auth.py, settings.py
    │   ├── models/                # SQLAlchemy ORM models
    │   ├── schemas/               # Pydantic schemas
    │   ├── routes/                # FastAPI route handlers
    │   ├── services/              # Business logic layer
    │   └── repository/            # Database query layer
    ├── pyproject.toml
    ├── uv.lock
    └── Dockerfile
```