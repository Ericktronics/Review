# Backend Developer Flashcards

A flashcard web app for studying backend engineering concepts — built with Vite, React 18, TypeScript, and Tailwind CSS.

## Features

- **111 flashcards** across 12 categories
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
| Node.js | Event loop, streams, async patterns, clustering, AsyncLocalStorage |
| TypeScript | Generics, conditional types, strict mode, variance |
| OOP | SOLID principles, design patterns, composition vs inheritance |
| REST & HTTP | HTTP methods, CORS, status codes, gRPC vs GraphQL |
| Databases | MVCC, indexing, ACID, sharding, query optimisation |
| Auth & Security | OAuth 2.0 PKCE, JWT, bcrypt, OWASP Top 10 |
| System Design | CQRS, CAP theorem, load balancers, message queues |
| Caching | Stampede prevention, eviction policies, cache layers |
| Microservices | Circuit breaker, Saga pattern, API gateway, service mesh |
| DevOps | Kubernetes, Docker, CI/CD, blue-green vs canary |
| Data Structures | Big O, hash tables, heaps, trees, linked lists |
| Best Practices | DRY, KISS, testing pyramid, code review, logging |

## Getting Started

```bash
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
