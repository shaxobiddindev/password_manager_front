# 🔐 Company Vault — Frontend

Premium password manager frontend built with React + Vite + TailwindCSS + Zustand.

## Stack
- **React 19** + Vite
- **TailwindCSS v3**
- **Zustand** (global state)
- **Axios** (API client with auth interceptors)
- **React Router v6**

## Setup

```bash
npm install
npm run dev
```

Backend must be running at `http://localhost:8080/api`.

## API Endpoints Expected

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/login` | Login → `{ token, user }` |
| POST | `/auth/unlock` | Unlock vault with master password |
| PUT | `/auth/change-master-password` | Change master password |
| GET | `/vault/items` | Get all credentials |
| POST | `/vault/items` | Add credential |
| PUT | `/vault/items/:id` | Update credential |
| DELETE | `/vault/items/:id` | Delete credential |

## User Roles
- **ADMIN** — can add, edit, delete credentials + access settings
- **MEMBER** — view and copy only

## Features
- 🔐 Lock screen with shake animation on wrong password
- ⏱ Auto-lock after 5 minutes
- ⚡ Quick Copy mode (copy password without revealing)
- 🔄 Password reuse detection
- 💪 Password strength indicator
- 🎲 Password generator
- 🔍 Search + category filter
- 👥 RBAC UI (admin/member)
- 🌙 Dark mode premium design
