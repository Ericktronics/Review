import type { Flashcard } from '../types';

export const expressCards: Flashcard[] = [

  // ─── Express.js (Hard) ───────────────────────────────────────────────────────

  {
    id: 'exp-1',
    category: 'Express.js',
    difficulty: 'hard',
    type: 'experience',
    question: 'How does the Express middleware chain work internally? Explain the "onion model" and how `next(err)` bypasses normal middleware.',
    answer:
      'Express middleware is a **linked list of functions**. When a request arrives, Express calls `layer.handle(req, res, next)` for each layer in registration order. Each middleware must call `next()` to pass control to the next layer, or end the cycle by sending a response.\n\n**The onion model**: code before `next()` runs on the way "in"; code after `next()` runs on the way "out" (after the route handler has finished). This is how response-timing and logging middleware works.\n\n**Error flow**: calling `next(err)` skips all normal middleware and jumps directly to the nearest **error handler** — a middleware with exactly 4 parameters `(err, req, res, next)`. Express detects error handlers by checking `fn.length === 4`.\n\n**Critical gotchas**:\n- Order of `app.use()` calls is execution order — put error handlers last\n- Forgetting to call `next()` hangs the request forever\n- Calling `next()` after `res.send()` causes "headers already sent" errors',
    code: {
      language: 'typescript',
      snippet: `// Onion model — code after next() runs on the way out
app.use((req, res, next) => {
  const start = Date.now();
  console.log('→ in');
  next();                          // passes to the next layer
  console.log('← out', Date.now() - start, 'ms'); // runs after handler returns
});

// Route handler
app.get('/users', async (req, res, next) => {
  try {
    const users = await userService.findAll();
    res.json(users);
  } catch (err) {
    next(err); // skips normal middleware, goes straight to error handler
  }
});

// Error handler — MUST have exactly 4 params
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

// Output for GET /users (success):
// → in
// ← out 12 ms`,
    },
  },

  {
    id: 'exp-2',
    category: 'Express.js',
    difficulty: 'hard',
    type: 'experience',
    question: 'How do you build a production-ready Express.js API? What security, validation, and error handling patterns should be in place?',
    answer:
      'A production Express API needs layers of protection and structure beyond basic routing.\n\n**Security** (apply globally):\n- `helmet()` — sets secure HTTP headers (CSP, HSTS, X-Frame-Options)\n- `express-rate-limit` — throttle endpoints, especially auth routes\n- `cors` — whitelist allowed origins explicitly, never use `*` with credentials\n\n**Validation**: validate all incoming data at the boundary using `zod` or `joi`. Never trust `req.body` without parsing.\n\n**Async error handling**: Express 4 does not catch async errors — wrap every async handler or use a `catchAsync` HOF. Express 5 handles async natively.\n\n**Error handler**: one centralised error handler at the end of the middleware stack — maps error types to HTTP status codes.\n\n**Observability**: structured logging with `pino`, request IDs via `crypto.randomUUID()`, and `/healthz` endpoints for liveness and readiness probes.',
    code: {
      language: 'typescript',
      snippet: `import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: ['https://app.example.com'], credentials: true }));
app.use(express.json({ limit: '10kb' })); // prevent large payload attacks
app.use('/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));

// catchAsync — wraps async handlers for Express 4
const catchAsync = (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Route with validation
const CreateUserSchema = z.object({ name: z.string(), email: z.string().email() });

app.post('/users', catchAsync(async (req, res) => {
  const body = CreateUserSchema.parse(req.body); // throws ZodError on invalid input
  const user = await userService.create(body);
  res.status(201).json(user);
}));

// Centralised error handler — always last
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof z.ZodError)
    return res.status(422).json({ errors: err.errors });
  res.status(500).json({ error: 'Internal server error' });
});`,
    },
  },

  {
    id: 'exp-3',
    category: 'Express.js',
    difficulty: 'hard',
    type: 'experience',
    question: 'How does Node.js handle unhandled Promise rejections, and what is the correct pattern for async error propagation in an Express middleware chain?',
    answer:
      "Since Node.js 15+, an unhandled Promise rejection **crashes the process** by default (previously emitted a deprecation warning). You should listen for `unhandledRejection` to log and exit cleanly before your process manager restarts it.\n\n**Express does not catch async errors automatically.** If an async route handler throws and you don't catch it, Express never sees the error and the request hangs.\n\n**Solutions**:\n1. Wrap each handler in a `catchAsync` / `asyncHandler` HOF that catches the rejection and calls `next(err)`\n2. Use **Express 5** — it natively handles async route handlers (no wrapper needed)\n3. Use Fastify or Hapi which support async natively out of the box\n\n**Always register a global error handler** (4 params) as the last middleware — it is the final safety net.",
    code: {
      language: 'typescript',
      snippet: `// Global safety net — log then exit, let the process manager restart
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  process.exit(1);
});

// catchAsync HOF — Express 4
const catchAsync =
  (fn: RequestHandler): RequestHandler =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

router.get('/users/:id', catchAsync(async (req, res) => {
  const user = await userService.findOrFail(req.params.id);
  res.json(user);
}));

// Global error handler — must have exactly 4 params, register LAST
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const status = err instanceof AppError ? err.statusCode : 500;
  res.status(status).json({ error: err.message });
});`,
    },
  },

  // ─── Express.js (Easy) ───────────────────────────────────────────────────────

  {
    id: 'exp-e1',
    category: 'Express.js',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is Express.js and why is it used with Node.js?',
    answer:
      '**Express.js** is a minimal, unopinionated web framework for Node.js. It sits on top of Node\'s built-in `http` module and makes building web servers and APIs much simpler.\n\n**What it adds on top of plain Node.js**:\n- **Routing** — map URLs and HTTP methods to handler functions (`app.get`, `app.post`)\n- **Middleware** — chain reusable functions that process requests before they reach your route\n- **Request/response helpers** — `res.json()`, `res.status()`, `req.params`, `req.body`\n- **Template engine support** — render HTML server-side\n\n**Why it\'s popular**: minimal overhead, huge ecosystem, easy to learn, and works well for REST APIs.\n\n**Alternatives**: Fastify (faster, schema-based), NestJS (structured, opinionated), Hapi (enterprise features built-in).',
    code: {
      language: 'javascript',
      snippet: `const express = require('express');
const app = express();

app.use(express.json()); // parse JSON request bodies

// Route: GET /hello
app.get('/hello', (req, res) => {
  res.json({ message: 'Hello, world!' });
});

// Route with URL parameter: GET /users/42
app.get('/users/:id', (req, res) => {
  res.json({ userId: req.params.id });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
    },
  },

  {
    id: 'exp-e2',
    category: 'Express.js',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is middleware in Express.js?',
    answer:
      '**Middleware** is a function that runs between receiving a request and sending a response. It has access to `req`, `res`, and `next`.\n\nYou must call `next()` to pass control to the next middleware — if you forget, the request hangs forever.\n\n**Types**:\n- **Application-level** — `app.use()` — runs for all routes\n- **Router-level** — `router.use()` — scoped to a specific router\n- **Error-handling** — 4 parameters `(err, req, res, next)` — handles errors passed via `next(err)`\n- **Built-in** — `express.json()`, `express.static()`\n- **Third-party** — `cors`, `helmet`, `morgan`\n\n**Why it matters**: middleware is how you handle cross-cutting concerns (auth, logging, validation, rate limiting) in one place without duplicating logic in every route.',
    code: {
      language: 'javascript',
      snippet: `const express = require('express');
const app = express();

app.use(express.json()); // built-in: parse JSON bodies

// Custom middleware — runs for every request
app.use((req, res, next) => {
  console.log(\`\${req.method} \${req.path}\`);
  next(); // must call next() or request hangs
});

// Auth middleware — only applied to specific routes
function requireAuth(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

app.get('/profile', requireAuth, (req, res) => {
  res.json({ user: 'Alice' });
});`,
    },
  },

  {
    id: 'exp-e3',
    category: 'Express.js',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is routing in Express.js? What is the difference between app.use() and app.get()?',
    answer:
      '**Routing** is mapping an incoming HTTP request (method + URL) to a specific handler function.\n\n**`app.get(path, handler)`** — matches only GET requests at exactly that path.\n\n**`app.use(path, handler)`** — matches ALL HTTP methods and any URL that starts with the given path (prefix match). Used for mounting middleware and routers.\n\n| | `app.get()` | `app.use()` |\n|---|---|---|\n| Methods | GET only | All methods |\n| Path matching | Exact | Prefix |\n| Typical use | Route handler | Middleware, sub-router |\n\n**`express.Router()`**: groups related routes into a mini-app that can be mounted at a prefix. Keeps large apps organised.',
    code: {
      language: 'javascript',
      snippet: `const express = require('express');
const app = express();
const router = express.Router();

// app.get — exact path, GET only
app.get('/users', (req, res) => res.json([]));
app.post('/users', (req, res) => res.status(201).json({}));
app.delete('/users/:id', (req, res) => res.sendStatus(204));

// Router — group related routes
router.get('/', (req, res) => res.json([]));    // GET  /products
router.post('/', (req, res) => res.sendStatus(201)); // POST /products

app.use('/products', router); // mount at /products prefix

// app.use — matches ALL methods starting with /api
app.use('/api', (req, res, next) => {
  console.log('API request:', req.path);
  next();
});`,
    },
  },

  // ─── Express.js (Medium) ─────────────────────────────────────────────────────

  {
    id: 'exp-m1',
    category: 'Express.js',
    difficulty: 'medium',
    type: 'basics',
    question: 'How does error handling work in Express.js? How do you handle async errors?',
    answer:
      'Express has a special **error-handling middleware** with exactly 4 parameters: `(err, req, res, next)`. It must be registered last — after all routes.\n\nWhen you call `next(err)` from any middleware or route, Express skips all normal middleware and jumps to this error handler.\n\n**The async problem**: Express 4 does not automatically catch errors thrown inside `async` route handlers. If an async function throws and you don\'t catch it, the request hangs.\n\n**Solutions**:\n1. `try/catch` + `next(err)` in every handler\n2. A `catchAsync` wrapper HOF that catches the rejection and calls `next(err)` automatically\n3. **Express 5** — handles async errors natively (no wrapper needed)\n\n**Best practice**: one centralised error handler that maps error types to HTTP status codes — keeps error logic out of individual routes.',
    code: {
      language: 'typescript',
      snippet: `// catchAsync wrapper — eliminates try/catch boilerplate in Express 4
const catchAsync = (fn: Function) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Clean route — no try/catch needed
app.get('/users/:id', catchAsync(async (req, res) => {
  const user = await userService.findById(req.params.id);
  if (!user) throw new NotFoundError('User not found'); // caught by catchAsync
  res.json(user);
}));

// Centralised error handler — register LAST
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(err);

  if (err instanceof NotFoundError) return res.status(404).json({ error: err.message });
  if (err instanceof ValidationError) return res.status(422).json({ error: err.message });

  // Unknown errors → generic 500
  res.status(500).json({ error: 'Something went wrong' });
});`,
    },
  },

  {
    id: 'exp-m2',
    category: 'Express.js',
    difficulty: 'medium',
    type: 'basics',
    question: 'How do you structure a scalable Express.js application?',
    answer:
      'A flat `index.js` with all routes works for small apps but becomes unmanageable fast. The standard pattern is **separation by layer**:\n\n- **`routes/`** — only routing, no business logic. Calls the controller.\n- **`controllers/`** — handles HTTP: parses req, calls service, sends res. No DB calls.\n- **`services/`** — all business logic. No knowledge of HTTP (no req/res).\n- **`repositories/`** (optional) — all database queries. Services call repositories.\n- **`middlewares/`** — reusable middleware (auth, validation, logging).\n- **`config/`** — environment variables, DB connection setup.\n\n**Why this separation matters**: services can be unit-tested without HTTP. Controllers can be tested without a real DB. Each layer has one responsibility.',
    code: {
      language: 'typescript',
      snippet: `// routes/users.ts — only routing
router.post('/', validate(CreateUserSchema), userController.create);
router.get('/:id', requireAuth, userController.findById);

// controllers/userController.ts — HTTP layer only
export const create = catchAsync(async (req, res) => {
  const user = await userService.create(req.body); // delegate to service
  res.status(201).json(user);
});

// services/userService.ts — business logic, no req/res
export async function create(data: CreateUserDto): Promise<User> {
  const existing = await userRepository.findByEmail(data.email);
  if (existing) throw new ConflictError('Email already in use');
  return userRepository.create(data);
}

// repositories/userRepository.ts — DB queries only
export async function findByEmail(email: string) {
  return db.query('SELECT * FROM users WHERE email = $1', [email]);
}`,
    },
  },

  {
    id: 'exp-e4',
    category: 'Express.js',
    difficulty: 'easy',
    type: 'basics',
    question: 'What are the four types of middleware in Express and what is each used for?',
    answer:
      '**1. Application-level** — bound to `app` with `app.use()` or `app.METHOD()`. Runs for all or specific routes.\n\n**2. Router-level** — bound to an `express.Router()` instance. Same behaviour but scoped to a sub-router, keeps code modular.\n\n**3. Error-handling** — has a *four-parameter* signature `(err, req, res, next)`. Express identifies it by the 4th param and only calls it when `next(err)` is invoked.\n\n**4. Built-in / Third-party** — `express.json()`, `express.urlencoded()`, `express.static()` are built-in. `cors`, `helmet`, `morgan`, `multer` are popular third-party middleware.\n\n**Key rule:** middleware runs in the order it is registered. Always put error-handling middleware *last*.',
    code: {
      language: 'javascript',
      snippet: `const express = require('express');
const app = express();
const router = express.Router();

// 1. Application-level — runs for every request
app.use(express.json());
app.use((req, res, next) => { console.log(req.method, req.url); next(); });

// 2. Router-level — scoped to /users
router.use((req, res, next) => { console.log('users router'); next(); });
router.get('/', (req, res) => res.json([]));
app.use('/users', router);

// 3. Error-handling — MUST have 4 params
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

// 4. Third-party
const helmet = require('helmet');
app.use(helmet()); // sets security headers`,
    },
  },

  {
    id: 'exp-m3',
    category: 'Express.js',
    difficulty: 'medium',
    type: 'basics',
    question: 'How do you implement rate limiting in Express? What are the risks of in-memory rate limiting?',
    answer:
      '**Rate limiting** caps how many requests a client can make in a time window — protects against brute force, DDoS, and API abuse.\n\n**`express-rate-limit`** is the standard package. It plugs in as middleware.\n\n**In-memory risk:** the default store keeps counters in the Node process\'s memory. This breaks in a **multi-instance / clustered** deployment — each instance has its own counter, so a client can make `limit × instances` requests total. Fix: use a shared store (Redis).\n\n**`rate-limit-redis`** or **`ioredis`** backed stores share counters across all instances — the correct approach for production.\n\n**Best practice:** apply a global limiter on all routes, then a stricter limiter on sensitive endpoints (`/login`, `/register`, `/payment`).',
    code: {
      language: 'javascript',
      snippet: `const rateLimit = require('express-rate-limit');
const RedisStore  = require('rate-limit-redis');
const redis       = require('./redis'); // your ioredis client

// Global limiter — 100 req / 15 min per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,  // Return RateLimit-* headers
  legacyHeaders: false,
  store: new RedisStore({ sendCommand: (...args) => redis.call(...args) }),
});

// Strict limiter for auth routes — 10 req / 15 min
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many attempts, try again later.' },
  store: new RedisStore({ sendCommand: (...args) => redis.call(...args) }),
});

app.use(globalLimiter);
app.use('/auth', authLimiter);`,
    },
  },

  {
    id: 'exp-m4',
    category: 'Express.js',
    difficulty: 'medium',
    type: 'basics',
    question: 'How do you validate incoming request data in Express? Why is validation at the route level important?',
    answer:
      '**Never trust user input.** Validation at the route/controller level ensures invalid data is rejected before it reaches your business logic or database.\n\n**Two popular libraries:**\n- **Zod** — schema-first, TypeScript-native, throws typed errors\n- **Joi** — mature, expressive, framework-agnostic\n\n**Pattern:** define a schema, parse `req.body` / `req.params` / `req.query` inside the handler or a reusable validation middleware. On failure, return `400` with a clear error message.\n\n**Why it matters:**\n- Prevents malformed data from corrupting your DB\n- Prevents injection attacks (combined with parameterised queries)\n- Gives clients clear error messages\n- Acts as living documentation of your API contract',
    code: {
      language: 'typescript',
      snippet: `import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// Define schema
const CreateUserSchema = z.object({
  name:     z.string().min(2).max(50),
  email:    z.string().email(),
  age:      z.number().int().min(18).optional(),
  role:     z.enum(['admin', 'user']).default('user'),
});

// Reusable middleware factory
function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.flatten().fieldErrors });
    }
    req.body = result.data; // replace with parsed + coerced data
    next();
  };
}

// Route
router.post('/users', validate(CreateUserSchema), async (req, res) => {
  const user = await createUser(req.body); // body is now fully typed & safe
  res.status(201).json(user);
});`,
    },
  },

  {
    id: 'exp-m5',
    category: 'Express.js',
    difficulty: 'medium',
    type: 'basics',
    question: 'How do you handle file uploads in Express using Multer? What are the key security concerns?',
    answer:
      '**Multer** is the standard Express middleware for handling `multipart/form-data` (file uploads). It parses the incoming form data and attaches `req.file` (single) or `req.files` (multiple) to the request.\n\n**Storage options:**\n- `memoryStorage()` — file held in RAM as a `Buffer`. Fast but dangerous for large files.\n- `diskStorage()` — file written to disk. You control the destination and filename.\n- **Production:** stream directly to S3/cloud storage using `multer-s3`.\n\n**Security concerns:**\n- **File type validation** — check `mimetype` AND magic bytes (not just extension — easy to fake)\n- **File size limit** — always set `limits.fileSize` to prevent memory/disk exhaustion\n- **Filename sanitisation** — never use the original filename from the client; generate a UUID\n- **Malware** — consider scanning uploads with ClamAV or a cloud API before storing',
    code: {
      language: 'javascript',
      snippet: `const multer  = require('multer');
const path    = require('path');
const crypto  = require('crypto');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads/'),
  // Generate safe random filename — never trust req.file.originalname
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, \`\${crypto.randomUUID()}\${ext}\`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only JPEG, PNG, WebP allowed'));
    }
    cb(null, true);
  },
});

// Single file upload
router.post('/avatar', upload.single('avatar'), (req, res) => {
  res.json({ filename: req.file.filename });
});

// Error handling for multer errors
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message.includes('Only')) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});`,
    },
  },

  // ── Express security best practices ────────────────────────────────────
  {
    id: 'exp-m6',
    category: 'Express.js',
    difficulty: 'medium',
    type: 'experience',
    question: 'What are the essential security middleware and practices for a production Express API?',
    answer:
      '**`helmet`** — sets a suite of security HTTP headers in one line: `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, etc. Add it first so every response gets the headers.\n\n**`express-rate-limit`** — protects against brute-force and DoS. Apply a global limit early; tighten it further on auth routes.\n\n**Input validation** — never trust request data. Validate and sanitize with `zod` (or `express-validator`) before it touches your business logic or DB. Return 400 on invalid input, not 500.\n\n**CORS** — configure `cors()` with an explicit `origin` allowlist. Never use `origin: *` on an API that handles credentials.\n\n**Cookie security** — set `httpOnly`, `secure`, and `sameSite: \'strict\'` on session/auth cookies.\n\n**Middleware ordering matters**: `helmet` → CORS → rate limit → body parser → validation → auth → routes → error handler.',
    code: {
      language: 'typescript',
      snippet: `import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';

const app = express();

// 1. Security headers — must be first
app.use(helmet());

// 2. CORS — explicit allowlist, never '*' with credentials
app.use(cors({
  origin: ['https://app.example.com'],
  credentials: true,
}));

// 3. Global rate limit — before body parser so it's cheap to reject
const globalLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use(globalLimit);

// 4. Body parser — after rate limit
app.use(express.json({ limit: '10kb' })); // size limit prevents payload bombs

// 5. Tighter limit on auth routes
const authLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
app.post('/auth/login', authLimit, loginHandler);

// 6. Input validation with zod before any business logic
const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

app.post('/users', (req, res, next) => {
  const result = CreateUserSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ errors: result.error.flatten() });
  // result.data is typed and validated — safe to use
  createUser(result.data).then(user => res.status(201).json(user)).catch(next);
});

// 7. Secure cookies
res.cookie('sessionId', token, {
  httpOnly: true,  // inaccessible to JS — blocks XSS token theft
  secure: true,    // HTTPS only
  sameSite: 'strict', // blocks CSRF
  maxAge: 3600_000,
});`,
    },
  },
];
