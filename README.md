# Real-Time Multiplayer Chess

A full-stack, real-time multiplayer chess platform engineered with a modern TypeScript monorepo architecture.

## 🚀 Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Zustand, `chess.js`, `react-chessboard`, Socket.IO Client, Zod
- **Backend**: Node.js, Express, Socket.IO, PostgreSQL, Prisma ORM, JWT, `chess.js`
- **Monorepo & Tooling**: Turborepo, pnpm Workspaces, TypeScript, ESLint

---

## ⚡ Technical Architecture & Highlights

- Developed a full-stack real-time multiplayer chess platform using Socket.IO and `chess.js`, enabling low-latency state synchronization, move validation, and concurrent match handling.
- Optimized active connection state using `Map` data structures for $O(1)$ user session lookups, reliable socket mapping, and clean session cleanup on disconnects.
- Architected the application as a Turborepo monorepo with `pnpm` workspaces, integrating JWT authentication and a Prisma-backed PostgreSQL database for game history persistence.

---

## 📁 Repository Structure

```
.
├── apps/
│   ├── chess-frontend/    # Vite + React 19 client application
│   └── chess-backend/     # Express + Socket.IO server & Prisma ORM layer
└── packages/
    ├── typescript-config/ # Shared tsconfig baselines
    ├── eslint-config/     # Shared linting standards
    └── ui/                # Reusable UI component library
```
