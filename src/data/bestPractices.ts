import type { Flashcard } from '../types';

export const bestPracticesCards: Flashcard[] = [

  // ─── Best Practices ──────────────────────────────────────────────────────────

  {
    id: 'bp-1',
    category: 'Best Practices',
    difficulty: 'hard',
    question: 'How should you design a custom error class hierarchy for a Node.js API, and why does it matter for observability and client responses?',
    answer:
      'A structured error hierarchy lets you:\n- Map domain errors to HTTP status codes without `if` chains in route handlers\n- Include operational context (requestId, userId) automatically\n- Distinguish **operational errors** (expected, safe to send to client) from **programmer errors** (bugs — crash the process)\n\n**Base class**: `AppError extends Error` with `statusCode`, `isOperational`, and optional `code` (machine-readable string like `USER_NOT_FOUND`).\n\n**Rule**: only send `isOperational === true` errors to the client. For anything else, return a generic 500 and alert on-call. Programmer errors (null dereference, type errors) should always bubble up and restart the process.',
    code: {
      language: 'typescript',
      snippet: `export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
    public readonly isOperational = true,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype); // fix instanceof
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(\`\${resource} '\${id}' not found\`, 404, 'NOT_FOUND');
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public readonly fields?: Record<string, string>) {
    super(message, 422, 'VALIDATION_ERROR');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) { super(message, 409, 'CONFLICT'); }
}

// Global error handler – safe to type-narrow
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({ error: err.message, code: err.code });
  }
  // Programmer error – log and return generic 500
  logger.error('Unexpected error', { err });
  res.status(500).json({ error: 'Internal server error' });
});`,
    },
  },

  {
    id: 'bp-2',
    category: 'Best Practices',
    difficulty: 'hard',
    question: 'What is the recommended folder structure for a production Node.js TypeScript REST API, and why does the layout matter for maintainability?',
    answer:
      'A domain-driven layout keeps related code together and prevents the "utils folder explosion" that makes large codebases unmaintainable.\n\n**Principle**: group by **feature/domain**, not by **technical role**. `src/users/` contains `user.router.ts`, `user.service.ts`, `user.repository.ts`, `user.schema.ts` — not `src/routers/users.ts`, `src/services/users.ts`, etc.\n\n**Key directories**:\n- `src/common/` — shared middleware, base classes, error types, logger\n- `src/config/` — env validation, feature flags\n- `src/db/` — migrations, schema, client singleton\n- `src/{domain}/` — one directory per bounded context\n- `tests/` — mirrors `src/`, unit tests co-located or in `__tests__`\n\n**Why it matters**: when you delete a feature, you delete one folder. When you onboard a new engineer, they find all code for "orders" in one place. Dependencies between domains are explicit imports — easy to enforce with ESLint `import/no-restricted-paths`.',
    code: {
      language: 'bash',
      snippet: `src/
├── common/
│   ├── errors.ts          # AppError hierarchy
│   ├── logger.ts          # structured logger (pino)
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── validate.ts    # Zod middleware
│   │   └── rate-limit.ts
│   └── types.ts           # shared domain types
├── config/
│   └── index.ts           # Zod-validated env vars
├── db/
│   ├── client.ts          # Prisma/pg singleton
│   └── migrations/
├── users/
│   ├── user.router.ts
│   ├── user.service.ts
│   ├── user.repository.ts
│   ├── user.schema.ts     # Zod schemas
│   └── user.test.ts
├── orders/
│   ├── order.router.ts
│   └── ...
├── app.ts                 # Express app (no listen())
└── server.ts              # bootstrap + listen + graceful shutdown`,
    },
  },

  {
    id: 'bp-3',
    category: 'Best Practices',
    difficulty: 'hard',
    question: 'What is the testing pyramid? How do you decide what to unit-test vs integration-test vs E2E-test in a Node.js API?',
    answer:
      '**Testing Pyramid** (bottom = most, top = fewest):\n\n1. **Unit tests** (fast, isolated, many) — test a single function/class with all dependencies mocked. Best for: pure business logic, transformations, utility functions, error handling branches\n2. **Integration tests** (medium speed, some deps) — test a slice of the system with real infrastructure (real DB, real Redis). Best for: repository layer, complex service flows, DB constraint verification\n3. **E2E tests** (slow, full stack, few) — test through the HTTP interface. Best for: critical user journeys, auth flows, contract verification against external APIs\n\n**Rules of thumb**:\n- Never mock the DB in integration tests — that\'s what got teams burned (mocked tests passed, prod migration failed)\n- Use `testcontainers` or a dedicated test DB to run integration tests in CI\n- Mock only at system boundaries: external HTTP APIs, email providers, payment gateways\n- Co-locate unit tests with source (`user.service.test.ts` next to `user.service.ts`)',
    code: {
      language: 'typescript',
      snippet: `// Unit test – pure logic, no I/O, fast
describe('PricingService', () => {
  it('applies VIP discount', () => {
    const svc = new PricingService();          // no mocks needed
    expect(svc.calculate({ price: 100, tier: 'vip' })).toBe(80);
  });
});

// Integration test – real DB via testcontainers
describe('UserRepository (integration)', () => {
  let pool: Pool;
  beforeAll(async () => { pool = await startTestDatabase(); });
  afterAll(async () => { await pool.end(); });
  afterEach(async () => { await pool.query('TRUNCATE users CASCADE'); });

  it('persists and retrieves a user', async () => {
    const repo = new PgUserRepository(pool);
    await repo.save({ id: '1', email: 'a@b.com', createdAt: new Date() });
    const found = await repo.findById('1');
    expect(found?.email).toBe('a@b.com');
  });
});

// E2E test – full HTTP stack
it('POST /users returns 201 with location header', async () => {
  const res = await request(app)
    .post('/users')
    .send({ email: 'x@y.com', password: 'secret123' });
  expect(res.status).toBe(201);
  expect(res.headers.location).toMatch(/\/users\/.+/);
});`,
    },
  },

  {
    id: 'bp-4',
    category: 'Best Practices',
    difficulty: 'hard',
    question: 'What are structured logging best practices for a Node.js production service? What should every log line contain?',
    answer:
      '**Structured logging** emits JSON objects instead of free-form strings so that log aggregators (Datadog, Loki, CloudWatch) can index, filter, and alert on fields.\n\n**Every log line should include**:\n- `level` — debug / info / warn / error\n- `ts` — ISO timestamp\n- `correlationId` / `requestId` — to trace a request across services\n- `service` / `env` — which service and environment emitted this\n- `msg` — human-readable summary\n- Relevant domain context (`userId`, `orderId`, `durationMs`)\n\n**Log levels discipline**:\n- `debug` — verbose, disabled in production\n- `info` — significant events (request received, job completed)\n- `warn` — unexpected but recoverable (retry, cache miss, deprecated usage)\n- `error` — requires attention; always include the full `err` object (stack trace)\n\n**Never log**: passwords, tokens, PII, full request bodies with sensitive fields. Redact before logging.\n\n**Library**: `pino` is the fastest structured logger for Node.js (~5× faster than `winston` for high-throughput services).',
    code: {
      language: 'typescript',
      snippet: `import pino from 'pino';
import { ctx } from './async-context'; // AsyncLocalStorage

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  base: { service: 'order-api', env: process.env.NODE_ENV },
  redact: ['req.headers.authorization', 'body.password', 'body.token'],
  timestamp: pino.stdTimeFunctions.isoTime,
});

// Request-scoped child logger – picks up correlationId automatically
export function getLogger() {
  const store = ctx.getStore();
  return store ? logger.child({ correlationId: store.correlationId }) : logger;
}

// Usage
getLogger().info({ userId, durationMs: 42 }, 'User fetched from DB');
// → { "level":"info","ts":"2025-01-01T...","service":"order-api",
//     "correlationId":"abc-123","userId":"u_1","durationMs":42,
//     "msg":"User fetched from DB" }

// Error logging – always pass the error object
try {
  await processOrder(order);
} catch (err) {
  getLogger().error({ err, orderId: order.id }, 'Order processing failed');
  // pino serialises err.message + err.stack automatically
}`,
    },
  },

  {
    id: 'bp-5',
    category: 'Best Practices',
    difficulty: 'medium',
    question: 'What is Conventional Commits and what Git branching strategy works well for a small backend team?',
    answer:
      '**Conventional Commits** is a lightweight commit message convention that enables automatic changelog generation, semantic versioning, and readable history:\n\n`<type>(<scope>): <description>`\n\nTypes: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`\n\nA `feat` triggers a minor bump; a `fix` triggers a patch; `feat!` or `BREAKING CHANGE:` in the footer triggers a major bump.\n\n**Trunk-based development** (recommended for CI/CD teams):\n- One long-lived branch: `main`\n- Short-lived feature branches (< 2 days), merged via PR\n- Deployments from `main` — every merge is potentially releasable\n- Feature flags control exposure, not branches\n\n**Git Flow** (for teams with release trains):\n- `main`, `develop`, `feature/*`, `release/*`, `hotfix/*`\n- More overhead but clear separation of stable vs development',
    code: {
      language: 'bash',
      snippet: `# Good commit messages
git commit -m "feat(auth): add refresh token rotation"
git commit -m "fix(orders): prevent double-charge on retry"
git commit -m "perf(db): add index on orders.user_id"
git commit -m "refactor(users): extract UserRepository from UserService"

# Breaking change
git commit -m "feat(api)!: rename /v1/users to /v2/members

BREAKING CHANGE: /v1/users endpoint is removed.
Clients must migrate to /v2/members before 2025-03-01."

# Useful git aliases for a clean workflow
git config alias.lg "log --oneline --graph --decorate --all"
git config alias.sw "switch"        # cleaner than checkout
git config alias.undo "reset HEAD~" # undo last commit, keep changes`,
    },
  },

  {
    id: 'bp-6',
    category: 'Best Practices',
    difficulty: 'hard',
    question: 'How do you manage dependency security and keep a Node.js project\'s supply chain clean?',
    answer:
      '**Supply chain attacks** (e.g., malicious packages published to npm) are a top risk for Node.js projects.\n\n**Controls**:\n- **Lock files**: always commit `package-lock.json` or `yarn.lock` — pins exact transitive versions\n- **`npm audit`**: checks direct + transitive deps against CVE databases. Run in CI; fail on `high` or `critical`\n- **Dependabot / Renovate**: auto-opens PRs for dep updates so you stay current without manual work\n- **Minimal deps**: each dep is an attack surface. Ask "can I implement this in 10 lines?" before adding\n- **`npm publish` access control**: use npm access tokens with least privilege; enable 2FA on publish\n- **Private registry**: proxy public npm through Artifactory/Nexus to scan and cache packages\n- **`overrides` / `resolutions`**: force a safe version of a transitive dep when you can\'t wait for upstream to patch\n\n**Post-install scripts**: packages with `preinstall`/`postinstall` scripts run arbitrary code. Review them — or use `npm ci --ignore-scripts` in CI.',
    code: {
      language: 'bash',
      snippet: `# Audit and fix in CI
npm audit --audit-level=high   # fail pipeline on high/critical CVEs
npm audit fix                  # auto-fix safe upgrades

# Pin exact versions in package.json to avoid ^ surprises
npm config set save-exact true

# Force a safe version of a transitive dep (package.json)
# "overrides": { "vulnerable-pkg": ">=2.0.1" }

# Check for unused dependencies
npx depcheck

# Verify lockfile integrity (CI)
npm ci   # installs from lockfile exactly; errors if lockfile is out of sync

# Review what a package actually does before installing
npx npm-package-inspect express   # or: npm pack <pkg> && tar -tvf *.tgz`,
    },
  },

  {
    id: 'bp-7',
    category: 'Best Practices',
    difficulty: 'hard',
    question: 'What are the most important async anti-patterns in Node.js / TypeScript and how do you fix each?',
    answer:
      '1. **Floating Promises** — calling an async function without `await` or `.catch()`. The rejection is silently swallowed. Fix: always `await`, or attach `.catch()`, or use `void fn()` only when intentionally fire-and-forget (and still handle errors inside).\n\n2. **`await` inside a loop** — sequential I/O when parallel is possible. Fix: collect promises first, then `Promise.all`.\n\n3. **Not using `Promise.allSettled` for fan-out** — `Promise.all` aborts on the first failure. Fix: use `allSettled` when each item\'s result is independent.\n\n4. **Mixing async/await with raw `.then()/.catch()`** — creates confusing dual error paths. Fix: pick one style per function.\n\n5. **`new Promise()` constructor anti-pattern** — wrapping an already-Promise-returning function in `new Promise()`. Unnecessary and loses the inner rejection.',
    code: {
      language: 'typescript',
      snippet: `// ✗ Floating promise – rejection silently swallowed
sendEmail(user);  // forgot await

// ✓ Fix
await sendEmail(user);
// or for intentional fire-and-forget:
sendEmail(user).catch((err) => logger.error({ err }, 'email failed'));

// ✗ await in loop – sequential, slow
for (const id of ids) {
  const user = await fetchUser(id);  // waits for each before starting next
}

// ✓ Fix – concurrent
const users = await Promise.all(ids.map(fetchUser));

// ✗ Promise constructor anti-pattern
const data = await new Promise((res, rej) => {
  fetch(url).then(res).catch(rej);  // unnecessary wrapper
});

// ✓ Fix – just await the existing promise
const data = await fetch(url);

// ✗ Missing await on async forEach callback (async is ignored)
ids.forEach(async (id) => { await deleteUser(id); });  // errors are lost!

// ✓ Fix
await Promise.all(ids.map((id) => deleteUser(id)));`,
    },
  },

  // ─── Best Practices (Easy) ───────────────────────────────────────────────────

  {
    id: 'bp-e1',
    category: 'Best Practices',
    difficulty: 'easy',
    question: 'What is the DRY principle and when does following it too strictly hurt you?',
    answer:
      "**DRY (Don't Repeat Yourself)**: every piece of knowledge or logic should have a single, authoritative representation in the codebase. Duplication forces multiple updates when requirements change and keeps bugs alive in copies you forget to update.\n\n**How to apply it**: extract repeated logic into a function, module, or class. If the same logic appears three or more times, it's a candidate for abstraction.\n\n**When DRY hurts**:\n- **Premature abstraction**: two pieces of code look similar now but may diverge later. Forcing them into one abstraction couples them.\n- **Wrong abstraction**: unifying code that differs in meaning creates hard-to-understand generalisations.\n\n**The 3-strike rule** (Kent Beck): first time, just write it. Second time, note the duplication. Third time, refactor.\n\n**'Duplication is far cheaper than the wrong abstraction'** — Sandi Metz.",
  },

  {
    id: 'bp-e2',
    category: 'Best Practices',
    difficulty: 'easy',
    question: 'What does KISS mean as a software principle and what does it look like in code?',
    answer:
      "**KISS (Keep It Simple, Stupid)**: solutions should be as simple as possible. Complexity should be justified by a real requirement, not speculation or cleverness.\n\n**Signs you're violating KISS**:\n- Functions longer than 20–30 lines doing multiple things\n- Deep nesting (more than 3 levels)\n- Clever one-liners that need a comment to explain\n- Premature generalisation ('I'll make this configurable for future use cases')\n\n**In practice**:\n- Prefer flat `if/else` over nested ternary chains\n- Prefer explicit variable names over compact math tricks\n- Build the simplest thing that works today; refactor when the requirement is real\n\n**KISS ≠ lazy**: it takes more skill to write simple, readable code than complex clever code.",
    code: {
      language: 'typescript',
      snippet: `// ✗ Violates KISS — clever but unreadable
const result = arr.reduce((a, v, i) => i % 2 ? {...a, [v]: arr[i + 1]} : a, {} as Record<string,string>);

// ✓ Follows KISS — obvious intent, easily debuggable
const result: Record<string, string> = {};
for (let i = 0; i < arr.length; i += 2) {
  result[arr[i]] = arr[i + 1];
}`,
    },
  },

  // ─── Best Practices (Medium) ─────────────────────────────────────────────────

  {
    id: 'bp-m1',
    category: 'Best Practices',
    difficulty: 'medium',
    question: 'What should you look for when reviewing someone else\'s code?',
    answer:
      "Code review is about **knowledge sharing and quality gate**, not style policing. Focus on:\n\n**Correctness**:\n- Does it do what the ticket/PR says?\n- Are edge cases handled (empty array, null, concurrent access)?\n- Is error handling correct?\n\n**Security**:\n- Is user input validated and sanitised?\n- SQL injection / XSS risks? Hard-coded secrets?\n\n**Maintainability**:\n- Readable? Would a new team member understand it?\n- Descriptive names? Meaningful tests?\n\n**Performance**:\n- N+1 queries? Expensive operations inside a hot loop?\n\n**Tone tips**:\n- Ask questions ('What happens if X is null?') rather than making demands\n- Use 'nit:' prefix for non-blocking style suggestions\n- Approve with comments for non-blocking issues instead of requesting changes",
  },

  {
    id: 'bp-m2',
    category: 'Best Practices',
    difficulty: 'medium',
    question: 'What is the difference between unit tests, integration tests, and end-to-end (E2E) tests?',
    answer:
      '**Unit tests**: test a **single function or class** in isolation, all dependencies mocked. Milliseconds per test, run thousands in seconds.\n- Catch: logic bugs, pure function edge cases\n- Miss: integration issues (does my code work with the real DB?)\n\n**Integration tests**: test **multiple components working together** — service layer + real database, HTTP handler + middleware. Slower, require infrastructure.\n- Catch: ORM query bugs, migration mismatches, middleware order\n- Miss: full user flows, frontend/backend contract issues\n\n**E2E tests**: simulate a **real user** interacting with the deployed application (Playwright, Cypress, Supertest).\n- Catch: full flow bugs, deployment config issues\n- Miss: edge cases (too expensive to cover all)\n\n**Test pyramid**: many unit tests → fewer integration tests → very few E2E. Inverted pyramid = slow, brittle test suite.',
    code: {
      language: 'typescript',
      snippet: `// Unit test — pure function, no DB
it('applies 10% discount', () => {
  expect(applyDiscount(100, 0.1)).toBe(90);
});

// Integration test — real DB + HTTP
it('POST /users creates a user', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 'Alice', email: 'alice@test.com' });
  expect(res.status).toBe(201);
  const row = await db.query('SELECT * FROM users WHERE email = $1', ['alice@test.com']);
  expect(row.rows).toHaveLength(1);
});

// E2E test — full browser (Playwright)
test('user can log in', async ({ page }) => {
  await page.goto('https://app.example.com/login');
  await page.fill('[name=email]', 'alice@test.com');
  await page.click('button[type=submit]');
  await expect(page).toHaveURL('/dashboard');
});`,
    },
  },
];
