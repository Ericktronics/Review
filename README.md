# Dev Flashcards

A flashcard web app for studying software engineering concepts — built with Vite, React 18, TypeScript, and Tailwind CSS.

## Features

- **400+ flashcards** across 24 categories
- **Today home** — daily goal ring, day streak, last 7 days and one button to start reviewing
- **Spaced review** — cards you know come back after 1, 3, 7, 14 and 30 days; missed cards stay due
- **Two levels** — Fundamentals (easy + medium) and Senior (hard)
- **Three difficulty levels** — Easy, Medium, Hard
- **Four views**
  - **Today** — your goal, streak and topic progress
  - **Quiz** — one card at a time, graded with Review again or Got it
  - **Study** — every question beside its answer
  - **Browse** — a list of questions; open any to see its answer
- **Search** across questions and answers (press `/`)
- **Shuffle** — randomize card order at any time
- **Keyboard shortcuts** in Quiz: `Space` reveal, `1` review again, `2` got it, `←` `→` navigate
- **Syntax-highlighted code snippets** via highlight.js
- **Dark by default**, with a one-tap flip to light that is remembered

Progress and streaks are stored in the browser's `localStorage`, so each device keeps its own.

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
| Data Structures & Algorithms | Big O, hash tables, heaps, trees, graphs, DFS/BFS, dynamic programming, palindrome |
| Best Practices | DRY, KISS, testing pyramid, code review, technical debt, semver |
| Compare & Choose | null vs undefined, == vs ===, JWT vs Sessions, REST vs GraphQL, ORM vs SQL, Monolith vs Microservices, consistency models |
| Interview Scenarios | Production incidents, debugging under pressure, tech debt prioritization, API migrations, team leadership, scaling |
| React | Components, hooks (useState, useEffect, useMemo, useCallback, useReducer, useContext), virtual DOM, reconciliation, error boundaries, performance optimization |
| Angular | Components, directives, lifecycle hooks, two-way data binding, DI, RxJS, Observables, pipes, route guards |
| Next.js | SSR, SSG, ISR, CSR, App Router vs Pages Router, React Server Components, API routes, middleware, authentication |
| Testing | Unit, integration, E2E, Jest, React Testing Library, mocking, TDD, supertest, NestJS testing, Playwright |
| JavaScript | Hoisting, closures, event loop, `this`, prototypal inheritance, scope chain, debounce/throttle, async/await pitfalls, currying, memory leaks, generators, event delegation |
| Python | Lists vs tuples, decorators, `==` vs `is`, comprehensions/generators, GIL, `*args`/`**kwargs`, dunder methods, shallow vs deep copy |
| Django | MTV architecture, ORM queries, migrations, DRF serializers/views/ViewSets, N+1 detection, auth/permissions, caching, transactions |
| MongoDB | Document model, Mongoose schemas, aggregation pipeline, indexing, embed vs reference, transactions and replica sets |

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

Open [http://localhost:5173/flash-cards/](http://localhost:5173/flash-cards/).

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
