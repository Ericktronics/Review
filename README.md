# Backend Developer Flashcards

A flashcard web app for studying backend engineering concepts — built with Vite, React 18, TypeScript, and Tailwind CSS.

## Features

- **100+ flashcards** across 12 categories
- **Two card types** with filter chips
  - **Must Know Basics** — fundamentals every developer should know (easy + medium)
  - **Must Know for Exp. Hires** — senior/production-level knowledge (hard)
- **Three difficulty levels** — Easy, Medium, Hard — with filter chips
- **Three view modes**
  - **Quiz** — one card at a time, answer hidden until revealed
  - **Study** — all cards fully expanded for reading through
  - **Browse All** — grid overview of all Q&A
- **Shuffle** — randomise card order at any time
- **Syntax-highlighted code snippets** via highlight.js
- **Category sidebar** with per-category card counts

## Categories

| Category | Topics covered |
|---|---|
| Node.js | Event loop, streams, async patterns, clustering, AsyncLocalStorage, CommonJS vs ESM |
| Express.js | Middleware chain, routing, error handling, async patterns, production-ready API structure |
| NestJS | Modules, decorators, DI, pipes, guards, interceptors, exception filters, microservices, transactions |
| TypeScript | Generics, conditional types, strict mode, variance, decorators, type inference |
| OOP | SOLID principles, design patterns, composition vs inheritance, Factory, Observer |
| REST & HTTP | HTTP methods, CORS, status codes, gRPC vs GraphQL, versioning, pagination |
| Databases | MVCC, indexing, ACID, sharding, JOINs, normalization, ORMs |
| Auth & Security | OAuth 2.0 PKCE, JWT, bcrypt, OWASP Top 10, HTTPS, session vs token auth |
| System Design | CQRS, CAP theorem, load balancers, message queues, CDN, DNS |
| Caching | Stampede prevention, eviction policies, cache layers, Redis, TTL, invalidation |
| Microservices | Circuit breaker, Saga pattern, API gateway, service mesh, Strangler Fig |
| DevOps | Kubernetes, Docker, CI/CD, blue-green vs canary, Helm, observability |
| Data Structures | Big O, hash tables, heaps, trees, graphs, DFS/BFS, dynamic programming |
| Best Practices | DRY, KISS, testing pyramid, code review, technical debt, semver |
| Compare & Choose | null vs undefined, == vs ===, JWT vs Sessions, REST vs GraphQL, ORM vs SQL, Monolith vs Microservices, consistency models |
| Interview Scenarios | Production incidents, debugging under pressure, tech debt prioritization, API migrations, team leadership, scaling |

## Requirements

- **Node.js 24 LTS** (Krypton) — verified on `v24.18.0`. Minimum supported is Node 18 (Vite 5 requirement).

If you use [nvm](https://github.com/nvm-sh/nvm), an `.nvmrc` is included:

```bash
nvm use   # switches to Node 24 automatically
```

## Getting Started

```bash
nvm use       # if using nvm
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
```

## Tech Stack

- [Vite 5](https://vitejs.dev/)
- [React 18](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v3](https://tailwindcss.com/)
- [highlight.js](https://highlightjs.org/)
