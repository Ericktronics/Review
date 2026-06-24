import type { Flashcard } from "../types";

export const nodejsCards: Flashcard[] = [
  // ─── Node.js (Senior) ────────────────────────────────────────────────────────

  {
    id: "node-1",
    category: "Node.js",
    difficulty: "hard",
    question:
      "Walk through every phase of the Node.js Event Loop. Where do microtasks (Promises, nextTick) fit in, and what does libuv actually own?",
    answer:
      "**Ownership** (staff-level follow-up):\n- **libuv** → event loop phases, I/O polling, thread pool\n- **V8** → Promise microtask queue (`Promise.then`, `queueMicrotask`)\n- **Node.js** → `process.nextTick` queue (Node-specific, not a V8 concept)\n\nThe loop cycles through 6 libuv phases:\n\n1. **timers** — runs `setTimeout` / `setInterval` whose threshold has elapsed\n2. **pending callbacks** — OS-level I/O errors deferred from last cycle\n3. **idle / prepare** — internal libuv bookkeeping only\n4. **poll** — blocks waiting for new I/O events; runs their callbacks\n5. **check** — runs `setImmediate` callbacks\n6. **close callbacks** — e.g. `socket.destroy()`\n\nAfter **every individual callback** (not just between phases — changed in Node.js v11 to match browser behaviour), Node drains two queues in order:\n1. `process.nextTick` queue — fully drained first, can starve I/O if called recursively\n2. V8 microtask queue — `Promise.then` callbacks and `queueMicrotask`\n\nThe thread pool (default 4 threads, tunable via `UV_THREADPOOL_SIZE`) handles `fs`, `crypto`, `dns.lookup`, and `zlib`. TCP/UDP, pipes, and timers use OS async primitives (epoll / kqueue / IOCP) directly — no thread pool involved.",
    code: {
      language: "javascript",
      snippet: `// ── Test 1: queues drain after EACH callback (Node v11+, verified) ──
setTimeout(() => {
  process.nextTick(() => console.log('tick after 1st timer'));
  console.log('1st timer');
}, 0);
setTimeout(() => { console.log('2nd timer'); }, 0);
// 1st timer  → timer callback runs
// tick after 1st timer  → nextTick drains before the 2nd timer callback
// 2nd timer

// ── Test 2: nextTick (Node.js) fires before V8 microtasks ──
setTimeout(() => {
  process.nextTick(() => console.log('nextTick (Node.js queue)'));
  Promise.resolve().then(() => console.log('Promise (V8 microtask queue)'));
  queueMicrotask(() => console.log('queueMicrotask (V8 microtask queue)'));
  console.log('timer');
}, 0);
// timer
// nextTick (Node.js queue)   ← Node.js nextTick queue first
// Promise (V8 microtask queue)
// queueMicrotask (V8 microtask queue)

// ── Test 3: classic output prediction ──
setImmediate(() => console.log('A: setImmediate'));
Promise.resolve().then(() => console.log('B: Promise'));
process.nextTick(() => {
  console.log('C: nextTick');
  Promise.resolve().then(() => console.log('D: nested Promise'));
});
console.log('E: sync');
// E → C → B → D → A  (verified)`,
    },
  },

  {
    id: "node-2",
    category: "Node.js",
    difficulty: "hard",
    question:
      "How does V8's hidden class (shape) mechanism work, and what coding patterns cause deoptimisation?",
    answer:
      'V8 assigns every object a **hidden class** (also called a "shape" or "map") that tracks property names, types, and offsets. When you read `obj.x`, V8 uses the hidden class to find `x` at a constant memory offset — effectively compiling the access to a direct pointer dereference (monomorphic inline cache, IC).\n\n**Deoptimisation triggers**:\n- **Adding properties after construction** — creates a new hidden class transition chain\n- **Deleting properties** (`delete obj.x`) — transitions the object to a "dictionary mode" (slow path)\n- **Changing property types** — a property that is sometimes `number` and sometimes `string` creates a megamorphic IC, preventing JIT optimisation\n- **Mixing property shapes across call sites** — polymorphic (2-4 shapes) or megamorphic (5+ shapes) ICs are slower\n\n**Best practices**: always initialise all properties in the constructor with the same types, avoid `delete`, use `null` instead of removing a property.',
    code: {
      language: "javascript",
      snippet: `// BAD – two different hidden classes for the same "Point" type
function Point(x, y) { this.x = x; this.y = y; }
const a = new Point(1, 2);
const b = new Point(3, 4);
b.z = 5; // new hidden class → polymorphic call site

// GOOD – stable shape; all objects share one hidden class
function Point(x, y, z = 0) {
  this.x = x;
  this.y = y;
  this.z = z; // always initialised
}

// BAD – kills hidden class optimisation
delete obj.x;

// GOOD – keep the property, set to null/undefined
obj.x = null;`,
    },
  },

  {
    id: "node-3",
    category: "Node.js",
    difficulty: "hard",
    question:
      "How do you detect and fix memory leaks in a Node.js production service?",
    answer:
      '**Detection**:\n- Watch for monotonically growing heap in metrics (`process.memoryUsage().heapUsed`)\n- Take heap snapshots with `--heapsnapshot-signal=SIGUSR2` or `v8.writeHeapSnapshot()`\n- Compare two snapshots in Chrome DevTools → "Comparison" view to find retained objects\n- Use `node --inspect` + Chrome DevTools Memory tab for live allocation tracking\n\n**Common causes**:\n- **Global caches without eviction** — unbounded `Map`/`Set` on module scope\n- **Event listener leaks** — adding listeners in a loop without removing them (`emitter.setMaxListeners`)\n- **Closure retention** — a long-lived closure captures a large object\n- **Timers not cleared** — `setInterval` keeps a reference chain alive\n- **Stream not destroyed** — unconsumed Readable keeps its buffer\n- **Circular references in WeakMap-free code** (less common since V8 handles cycles, but worth checking in native code)\n\n**Fix pattern**: prefer `WeakRef` / `WeakMap` for caches, always clean up listeners with `removeListener`, and destroy streams on error.',
    code: {
      language: "typescript",
      snippet: `// Leak: listener added on every request, never removed
app.get('/subscribe', (req, res) => {
  emitter.on('data', (d) => res.write(d)); // leaked!
});

// Fix: remove listener when the connection closes
app.get('/subscribe', (req, res) => {
  const handler = (d: string) => res.write(d);
  emitter.on('data', handler);
  req.on('close', () => emitter.off('data', handler));
});

// Heap snapshot on signal (add to app bootstrap)
import { writeHeapSnapshot } from 'v8';
process.on('SIGUSR2', () => {
  const file = writeHeapSnapshot();
  console.log('Heap snapshot written to', file);
});`,
    },
  },

  {
    id: "node-4",
    category: "Node.js",
    difficulty: "hard",
    question:
      "Compare `cluster`, `worker_threads`, and `child_process`. When do you reach for each?",
    answer:
      "| | cluster | worker_threads | child_process |\n|---|---|---|---|\n| Use case | Scale I/O-bound HTTP servers | CPU-bound JS tasks | Run any external process |\n| Shared memory | No (IPC only) | Yes (SharedArrayBuffer) | No (IPC / stdio only) |\n| V8 instance | Separate per worker | Separate per thread | Separate process entirely |\n| Overhead | Process fork (high) | Thread (low) | Process spawn (high) |\n| Failure isolation | Full — crash doesn't affect master | Partial — crash kills one thread but can take down the process | Full |\n\n**cluster** — fork N worker processes (each gets a copy of the event loop) to utilise all CPU cores for network-bound work. The OS kernel distributes incoming connections.\n\n**worker_threads** — run CPU-intensive JavaScript (JSON parsing, crypto, image manipulation) without blocking the main thread. Share heap memory via `SharedArrayBuffer` + `Atomics` for lock-free coordination.\n\n**child_process** — spawn external binaries (`ffmpeg`, Python scripts, shell commands). Use `spawn` for streaming, `execFile` for one-shot output.",
    code: {
      language: "typescript",
      snippet: `// cluster – utilise all CPUs for HTTP
import cluster from 'cluster';
import os from 'os';

if (cluster.isPrimary) {
  os.cpus().forEach(() => cluster.fork());
  cluster.on('exit', (w) => { console.log(\`worker \${w.id} died\`); cluster.fork(); });
} else {
  startHttpServer(); // each worker has its own event loop
}

// worker_threads – offload CPU work
import { Worker, isMainThread, workerData, parentPort } from 'worker_threads';

if (isMainThread) {
  const worker = new Worker(__filename, { workerData: { payload } });
  const result = await new Promise((res) => worker.on('message', res));
} else {
  parentPort!.postMessage(heavyTransform(workerData.payload));
}`,
    },
  },

  {
    id: "node-5",
    category: "Node.js",
    difficulty: "hard",
    question:
      "Implement a production-grade graceful shutdown for an Express/Fastify service.",
    answer:
      "Graceful shutdown means: stop accepting new connections, wait for in-flight requests to finish, then clean up resources (DB pools, queues, caches) before exiting.\n\n**Key steps**:\n1. Listen for `SIGTERM` (container stop) and `SIGINT` (Ctrl-C)\n2. Call `server.close()` — stops new connections, keeps existing alive\n3. Set a hard deadline (`setTimeout`) to force-exit if cleanup hangs\n4. Close DB pools, flush logs, disconnect from message brokers\n5. Exit with code 0 on clean shutdown, 1 on timeout\n\nKubernetes sends `SIGTERM` then waits `terminationGracePeriodSeconds` (default 30 s) before `SIGKILL`. Your timeout should be shorter than that grace period.",
    code: {
      language: "typescript",
      snippet: `const server = app.listen(PORT);

async function shutdown(signal: string) {
  console.log(\`\${signal} received – graceful shutdown\`);

  // Hard kill after 25 s (K8s grace period is 30 s)
  const forceExit = setTimeout(() => {
    console.error('Forced exit after timeout');
    process.exit(1);
  }, 25_000).unref();

  try {
    await new Promise<void>((res, rej) =>
      server.close((err) => (err ? rej(err) : res()))
    );
    await db.$disconnect();   // Prisma / TypeORM
    await redis.quit();
    await mqChannel.close();
    clearTimeout(forceExit);
    console.log('Clean shutdown');
    process.exit(0);
  } catch (err) {
    console.error('Shutdown error', err);
    process.exit(1);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));`,
    },
  },

  {
    id: "node-6",
    category: "Node.js",
    difficulty: "hard",
    question:
      "What are the differences between CommonJS (CJS) and ES Modules (ESM) in Node.js, and what are the key interop gotchas?",
    answer:
      "| | CJS (`require`) | ESM (`import`) |\n|---|---|---|\n| Loading | Synchronous, dynamic | Asynchronous, static |\n| Exports | Mutable `module.exports` object | Live bindings (read-only references) |\n| `__dirname` / `__filename` | Available | Not available; use `import.meta.url` |\n| Top-level `await` | No | Yes |\n| Tree-shaking | No | Yes (bundlers can dead-code-eliminate) |\n\n**Interop gotchas**:\n- ESM can `import` CJS modules, but CJS receives only the `default` export\n- CJS cannot `require()` an ESM module synchronously — must use dynamic `import()` and `.then()`\n- Dual-package hazard: if a package ships both CJS and ESM, instances may be duplicated, breaking singleton patterns\n- Named exports from CJS are guessed by static analysis — not guaranteed\n- `__dirname` replacement in ESM: `fileURLToPath(new URL('.', import.meta.url))`",
    code: {
      language: "typescript",
      snippet: `// package.json – opt a package into ESM
{ "type": "module" }

// ESM: static imports are hoisted and analysed at parse time
import { readFile } from 'fs/promises';

// __dirname equivalent in ESM
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));

// Dynamic import (works in both CJS and ESM)
const { default: chalk } = await import('chalk');

// CJS importing an ESM package
async function loadESM() {
  const { helper } = await import('./esm-module.mjs');
  return helper();
}`,
    },
  },

  {
    id: "node-7",
    category: "Node.js",
    difficulty: "hard",
    question:
      "How do you implement a custom Transform stream, and how does object mode differ from the default binary mode?",
    answer:
      "Extend `Transform` and implement `_transform(chunk, encoding, callback)`. Call `this.push(data)` to emit data downstream, then `callback()` to signal readiness for more input. Optionally implement `_flush(callback)` to emit remaining buffered data when the writable side ends.\n\n**Binary mode** (default): chunks are `Buffer` / `string`, `highWaterMark` is in bytes (16 KB default).\n\n**Object mode** (`objectMode: true`): chunks can be any JS value, `highWaterMark` counts objects (16 default). Useful for pipelines that pass structured data between stages without serialisation.",
    code: {
      language: "typescript",
      snippet: `import { Transform, TransformCallback } from 'stream';

// Binary mode: uppercase transformer
class UpperCase extends Transform {
  _transform(chunk: Buffer, _enc: string, cb: TransformCallback) {
    this.push(chunk.toString().toUpperCase());
    cb();
  }
}

// Object mode: JSON-lines parser
class JSONLinesParser extends Transform {
  private buf = '';

  constructor() { super({ readableObjectMode: true }); }

  _transform(chunk: Buffer, _enc: string, cb: TransformCallback) {
    this.buf += chunk.toString();
    const lines = this.buf.split('\n');
    this.buf = lines.pop()!; // keep incomplete last line
    for (const line of lines) {
      if (line.trim()) this.push(JSON.parse(line));
    }
    cb();
  }

  _flush(cb: TransformCallback) {
    if (this.buf.trim()) this.push(JSON.parse(this.buf));
    cb();
  }
}`,
    },
  },

  {
    id: "node-8",
    category: "Node.js",
    difficulty: "hard",
    question:
      "How does Node.js handle unhandled Promise rejections, and what is the correct pattern for async error propagation in an Express middleware chain?",
    answer:
      "Since Node.js 15+, an unhandled Promise rejection **crashes the process** by default (previously emitted a deprecation warning). Listen for `unhandledRejection` to log and exit cleanly.\n\n**Express does not catch async errors automatically.** If an async route handler throws, Express never sees it and the request hangs. Solutions:\n\n1. Wrap each handler in a `catchAsync` / `asyncHandler` HOF that passes errors to `next(err)`\n2. Use Express 5 (which natively supports async route handlers)\n3. Use Fastify or Hapi which handle async natively\n\n**async_hooks / AsyncLocalStorage** lets you propagate context (request ID, user) through async operations without passing it explicitly through every function.",
    code: {
      language: "typescript",
      snippet: `// Global safety net — log then exit, let the process manager restart
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  process.exit(1);
});

// asyncHandler HOF – Express 4
const wrap =
  (fn: RequestHandler): RequestHandler =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

router.get('/users/:id', wrap(async (req, res) => {
  const user = await userService.findOrFail(req.params.id);
  res.json(user);
}));

// Global error handler (must have 4 args)
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const status = err instanceof AppError ? err.statusCode : 500;
  res.status(status).json({ error: err.message });
});`,
    },
  },

  {
    id: "node-9",
    category: "Node.js",
    difficulty: "hard",
    question:
      "What is `AsyncLocalStorage` and how would you use it to propagate a request-scoped correlation ID across async boundaries without passing it as a parameter?",
    answer:
      "`AsyncLocalStorage` (part of `async_hooks`) maintains a store that propagates automatically across all async operations (callbacks, Promises, timers) initiated within a `run()` context. It's the Node.js equivalent of thread-local storage.\n\nUse cases: request IDs for distributed tracing, authenticated user context, per-request loggers.\n\n**Gotchas**:\n- Context is inherited when a new async resource is created inside an existing context, not at call time\n- Context is lost if code runs outside a `run()` call (e.g. background cron)\n- Very slight performance overhead — benchmark if used in ultra-hot paths",
    code: {
      language: "typescript",
      snippet: `import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';

interface RequestContext { correlationId: string; userId?: string; }
export const ctx = new AsyncLocalStorage<RequestContext>();

// Middleware: bind a new context per request
app.use((req, res, next) => {
  const store: RequestContext = {
    correlationId: req.headers['x-correlation-id'] as string ?? randomUUID(),
  };
  ctx.run(store, next);   // everything downstream inherits this store
});

// Anywhere in the call chain – no function parameter needed
function getLogger() {
  const { correlationId } = ctx.getStore() ?? { correlationId: 'n/a' };
  return logger.child({ correlationId });
}

async function userService.findOrFail(id: string) {
  getLogger().info('Looking up user');   // correlationId is automatically present
  return db.user.findUniqueOrThrow({ where: { id } });
}`,
    },
  },

  {
    id: "node-11",
    category: "Node.js",
    difficulty: "hard",
    question:
      'How does the Express middleware chain work internally? Explain the "onion model" and how `next(err)` bypasses normal middleware.',
    answer:
      'Express middleware is a linked list of functions. When a request arrives, Express calls `layer.handle(req, res, next)` for each layer in registration order. Each middleware must call `next()` to pass control to the next layer.\n\n**The onion model**: code before `next()` runs on the way "in"; code after `next()` runs on the way "out" (after the route handler has finished). This is how response-timing and logging middleware works.\n\n**Error flow**: calling `next(err)` skips all non-error middleware and jumps to the nearest **error handler** — a middleware with exactly 4 parameters `(err, req, res, next)`. Express uses `fn.length === 4` to detect it.\n\n**Critical gotchas**:\n- Order of `app.use()` calls is execution order — put error handlers last\n- Forgetting to call `next()` hangs the request\n- Calling `next()` after sending a response causes "headers already sent" errors',
    code: {
      language: "typescript",
      snippet: `// Onion model – code after next() runs on the way out
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
    next(err); // jumps directly to the error handler below
  }
});

// Error handler – MUST have exactly 4 params
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
    id: "node-12",
    category: "Node.js",
    difficulty: "hard",
    question:
      "How does the Node.js `EventEmitter` work? What are the most common memory leak patterns involving it, and how do you design a type-safe EventEmitter?",
    answer:
      "EventEmitter is the backbone of Node.js — streams, HTTP servers, and `process` all extend it. It maintains a Map of `event → listener[]` and calls them synchronously in registration order when `emit()` is called.\n\n**Common memory leak patterns**:\n- **Adding listeners in a loop** without removing them (e.g., inside a request handler, inside a loop)\n- **Listener registered but never removed** when the source object is long-lived\n- **`once()` not used** when only one invocation is needed — the handler hangs around forever otherwise\n\n**Default max listeners**: 10 per event. Node.js prints a warning if you exceed it — this is a leak detector, not a hard limit.\n\n**Design rule**: always pair `on()` with `off()` / `removeListener()`, or use `once()`. For scoped resources (HTTP connections, sockets), attach the cleanup to the resource's close/end event.",
    code: {
      language: "typescript",
      snippet: `import { EventEmitter } from 'events';

// Type-safe EventEmitter wrapper
type Events = {
  'user:created': [user: User];
  'order:failed': [orderId: string, reason: string];
};

class TypedEmitter extends EventEmitter {
  emit<K extends keyof Events>(event: K, ...args: Events[K]) {
    return super.emit(event, ...args);
  }
  on<K extends keyof Events>(event: K, listener: (...args: Events[K]) => void) {
    return super.on(event, listener as (...args: unknown[]) => void);
  }
}

// Memory leak: listener added per request, never removed
app.get('/stream', (req, res) => {
  emitter.on('data', (chunk) => res.write(chunk)); // LEAK: grows on every request
});

// Fix: remove when the connection closes
app.get('/stream', (req, res) => {
  const handler = (chunk: Buffer) => res.write(chunk);
  emitter.on('data', handler);
  req.on('close', () => emitter.off('data', handler));  // cleanup
});

// once() is safe for single-use listeners
emitter.once('user:created', (user) => sendWelcomeEmail(user));`,
    },
  },

  {
    id: "node-13",
    category: "Node.js",
    difficulty: "hard",
    question:
      "How does Node.js module caching work with `require()`? What are the implications for singletons, circular dependencies, and testing?",
    answer:
      "`require()` caches modules by their **resolved absolute path** in `require.cache`. Subsequent calls return the same exports object — they do NOT re-execute the module file.\n\n**Singleton pattern**: a module that exports an instance (e.g., a DB connection pool) is naturally a singleton because all `require()` calls return the same cached instance.\n\n**Circular dependency gotcha**: if `A` requires `B` and `B` requires `A`, Node.js breaks the cycle by returning the **partially evaluated** exports of whichever module is still loading. The requiring module gets an incomplete object — a hard-to-debug bug.\n\n**Testing implication**: if a module under test caches state on load, you must either:\n1. Delete `require.cache[require.resolve('./module')]` between tests to force re-evaluation\n2. Redesign the module to be function-based (factory) so each call returns a fresh instance\n\n**ESM modules** have their own module graph and do NOT use `require.cache` — ESM live bindings are immutable references, which makes mocking harder without tools like Vitest's `vi.mock()`.",
    code: {
      language: "typescript",
      snippet: `// db.ts – singleton via module cache
import { Pool } from 'pg';

// This Pool is created ONCE; every import gets the same instance
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ─── Circular dependency example ───────────────────────
// a.ts
import { b } from './b';
export const a = 'A';
console.log('b from a:', b); // may be 'undefined' if b.ts hasn't finished

// b.ts
import { a } from './a';
export const b = 'B';
console.log('a from b:', a); // may be 'undefined' if a.ts hasn't finished

// ─── Cache busting in tests (Jest/CJS) ─────────────────
beforeEach(() => {
  // force the module to re-run between tests
  delete require.cache[require.resolve('../src/config')];
});

// ESM alternative: use vi.mock() or inject deps via factory
// factory.ts – testable without cache hacks
export function createService(config: Config) {
  const pool = new Pool(config.db);
  return { pool, query: pool.query.bind(pool) };
}`,
    },
  },

  {
    id: "node-14",
    category: "Node.js",
    difficulty: "hard",
    question:
      "Compare WebSockets, Server-Sent Events (SSE), and Long Polling for real-time communication in Node.js. When do you choose each?",
    answer:
      "| | Long Polling | SSE | WebSocket |\n|---|---|---|---|\n| Protocol | HTTP | HTTP (chunked) | WS (upgraded) |\n| Direction | bidirectional (via multiple requests) | server → client only | full duplex |\n| Browser support | Universal | Universal (IE needs polyfill) | Universal |\n| Proxies/firewalls | Works everywhere | Works everywhere | Can be blocked |\n| Reconnection | Manual | Built-in (EventSource) | Manual |\n| Overhead | High (new request per message) | Low (persistent connection) | Lowest |\n| Load balancer | No special config | Sticky sessions or shared state | Sticky sessions or shared state |\n\n**Choose Long Polling**: legacy environments, no HTTP/2, very low message frequency.\n**Choose SSE**: dashboards, notifications, live feeds, any case where the client only reads. Simple to implement — just stream `text/event-stream`.\n**Choose WebSocket**: chat, collaborative editing, multiplayer games, any case requiring low-latency bidirectional communication.",
    code: {
      language: "typescript",
      snippet: `// ── SSE (simplest for server→client push) ─────────────
app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const send = (data: object) => res.write(\`data: \${JSON.stringify(data)}\n\n\`);

  const interval = setInterval(() => send({ ts: Date.now() }), 1000);
  req.on('close', () => clearInterval(interval)); // cleanup on disconnect
});

// Client (browser):
// const es = new EventSource('/events');
// es.onmessage = (e) => console.log(JSON.parse(e.data));

// ── WebSocket with ws library ─────────────────────────
import { WebSocketServer } from 'ws';
const wss = new WebSocketServer({ server: httpServer });

wss.on('connection', (ws, req) => {
  ws.on('message', (msg) => {
    // broadcast to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) client.send(msg);
    });
  });
  ws.on('close', () => console.log('client disconnected'));
});`,
    },
  },

  {
    id: "node-15",
    category: "Node.js",
    difficulty: "hard",
    question:
      "What are the differences between `Promise.all`, `Promise.allSettled`, `Promise.race`, and `Promise.any`? When does each fail and how do you handle concurrent async operations safely?",
    answer:
      "| | Resolves when | Rejects when |\n|---|---|---|\n| `Promise.all` | ALL resolve | ANY rejects (immediately, others ignored) |\n| `Promise.allSettled` | ALL settle (resolve OR reject) | Never rejects |\n| `Promise.race` | FIRST settles (resolve OR reject) | FIRST rejects |\n| `Promise.any` | FIRST resolves | ALL reject (`AggregateError`) |\n\n**`Promise.all`** — use when all results are required and one failure should abort. Runs tasks concurrently.\n\n**`Promise.allSettled`** — use when you need results for every item even if some fail (e.g., batch processing, fan-out notifications).\n\n**`Promise.race`** — use for timeouts: race your real request against a `setTimeout` reject.\n\n**`Promise.any`** — use when you have multiple fallback sources and need the fastest successful one.\n\n**Concurrency control**: `Promise.all` with 1000 items launches 1000 concurrent requests. Use a semaphore or batching to limit concurrency.",
    code: {
      language: "typescript",
      snippet: `// Promise.all – fails fast on first rejection
const [users, orders] = await Promise.all([
  db.user.findMany(),
  db.order.findMany(),   // if this throws, users result is discarded
]);

// Promise.allSettled – collect all results regardless
const results = await Promise.allSettled(userIds.map(id => sendEmail(id)));
const failed = results.filter(r => r.status === 'rejected');
console.log(\`\${failed.length} emails failed\`);

// Promise.race – timeout pattern
function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, rej) =>
    setTimeout(() => rej(new Error(\`Timed out after \${ms}ms\`)), ms)
  );
  return Promise.race([p, timeout]);
}

// Concurrency limiter – process 1000 items, 10 at a time
async function batchProcess<T>(items: T[], limit: number, fn: (item: T) => Promise<void>) {
  for (let i = 0; i < items.length; i += limit) {
    await Promise.all(items.slice(i, i + limit).map(fn));
  }
}`,
    },
  },

  {
    id: "node-10",
    category: "Node.js",
    difficulty: "hard",
    question:
      "What is the Node.js thread pool, what operations use it, and how do you tune it for a CPU-heavy workload?",
    answer:
      "libuv maintains a **thread pool** (default 4 threads) for operations the OS cannot perform asynchronously:\n\n**Uses the thread pool**:\n- `fs.*` (most file system operations)\n- `crypto` — `pbkdf2`, `scrypt`, `randomBytes`\n- `dns.lookup` (not `dns.resolve`)\n- `zlib`\n- User-defined native add-ons via `uv_queue_work`\n\n**Does NOT use the thread pool** (uses OS async I/O):\n- TCP/UDP networking\n- Pipes\n- `dns.resolve` (uses c-ares)\n\n**Tuning**: set `UV_THREADPOOL_SIZE` before Node starts (max 1024). For an API that calls `bcrypt` on every login request, tuning to match CPU cores (or slightly above) reduces wait time. Profile with `clinic.js` or `0x` to identify thread pool saturation (I/O tasks taking unexpectedly long).",
    code: {
      language: "bash",
      snippet: `# Set before launching Node.js
            UV_THREADPOOL_SIZE=16 node dist/server.js

            # In Docker
            ENV UV_THREADPOOL_SIZE=16

            # Rule of thumb for crypto-heavy workloads
            # UV_THREADPOOL_SIZE = number of vCPUs × 2
            # Verify with clinic doctor / 0x flame graph
            npx clinic doctor -- node server.js`,
    },
  },

  // ─── Node.js (Easy) ──────────────────────────────────────────────────────────

  {
    id: 'node-e1',
    category: 'Node.js',
    difficulty: 'easy',
    question: 'What is Node.js and what makes it different from browser JavaScript?',
    answer:
      "Node.js is a **server-side JavaScript runtime** built on Google's V8 engine. Key differences from browser JS:\n\n- **No DOM / BOM** — no `window`, `document`, or browser APIs\n- **Non-blocking I/O** — file system, network, and database calls are asynchronous by default; the process does not block waiting for them\n- **Single-threaded event loop** — one main thread handles all JS; I/O-heavy work is offloaded to libuv's thread pool or OS async primitives\n- **CommonJS / ESM modules** — `require()` / `import` instead of `<script>` tags\n- **Built-in modules** — `fs`, `path`, `http`, `crypto`, `stream`, etc.\n\n**Why this matters**: a Node.js server can handle tens of thousands of concurrent connections with low memory because it does not spawn a thread per request.",
    code: {
      language: 'javascript',
      snippet: `// Valid Node.js, not browser JS
const fs   = require('fs');
const path = require('path');

// Non-blocking read — main thread is free while the OS fetches the file
fs.readFile(path.join(__dirname, 'data.json'), 'utf8', (err, data) => {
  if (err) throw err;
  console.log('File contents:', data);
});
console.log('This prints BEFORE the file contents (non-blocking)');`,
    },
  },

  {
    id: 'node-e2',
    category: 'Node.js',
    difficulty: 'easy',
    question: 'What is the error-first callback pattern and why did Node.js adopt it?',
    answer:
      "The **error-first (Node-style) callback** convention: the first argument to any callback is an `Error` object (or `null` if successful), and subsequent arguments are the result data.\n\n**Why**: before Promises, asynchronous errors could not be propagated with `try/catch`. By standardising the first argument as the error, every caller is forced to handle the failure case.\n\n**Rules**:\n- Always check `err` before using the result\n- Never throw synchronously inside an async callback — it skips the caller's error handler\n- Call the callback **once** — never twice, never zero times",
    code: {
      language: 'javascript',
      snippet: `function fetchUser(id, callback) {
  setTimeout(() => {
    if (!id) return callback(new Error('No ID provided'));
    callback(null, { id, name: 'Alice' }); // null = no error
  }, 0);
}

fetchUser(1, (err, user) => {
  if (err) return console.error('Error:', err.message);
  console.log('User:', user.name); // User: Alice
});

fetchUser(null, (err) => {
  if (err) console.error('Error:', err.message); // Error: No ID provided
});`,
    },
  },

  // ─── Node.js (Medium) ────────────────────────────────────────────────────────

  {
    id: 'node-m1',
    category: 'Node.js',
    difficulty: 'medium',
    question: 'How do Promises and async/await work in Node.js? What problems do they solve over callbacks?',
    answer:
      "A **Promise** represents a future value: it is either pending, fulfilled, or rejected. It lets you chain async operations with `.then()` / `.catch()` instead of nesting callbacks.\n\n**Problems callbacks cause**: callback hell (deeply nested pyramids), inconsistent error handling, no easy way to run async tasks in parallel.\n\n**async/await**: syntactic sugar over Promises. An `async` function always returns a Promise. `await` pauses execution within that function until the Promise settles — without blocking the event loop. Error handling uses familiar `try/catch`.\n\n**Key methods**:\n- `Promise.all([])` — parallel, fails fast on first rejection\n- `Promise.allSettled([])` — parallel, never rejects, reports all outcomes\n- Unhandled rejections crash the process in Node.js 15+",
    code: {
      language: 'javascript',
      snippet: `function getOrder(id) { return Promise.resolve({ id, userId: 42 }); }
function getUser(id)  { return Promise.resolve({ id, name: 'Alice' }); }

// Promise chain
getOrder(1)
  .then(order => getUser(order.userId))
  .then(user  => console.log('Chain:', user.name));   // Chain: Alice

// async/await — same result, easier to read and debug
async function printUser() {
  const order = await getOrder(1);
  const user  = await getUser(order.userId);
  console.log('Async/await:', user.name);            // Async/await: Alice
}
printUser();`,
    },
  },

  {
    id: 'node-m2',
    category: 'Node.js',
    difficulty: 'medium',
    question: 'What is the difference between process.nextTick(), Promise microtasks, and setImmediate()?',
    answer:
      'All three defer code execution, but at different points in the event loop:\n\n| | Queued in | Runs when |\n|---|---|---|\n| `process.nextTick()` | Node.js nextTick queue | Before any I/O, after current operation |\n| `Promise.then()` / `queueMicrotask()` | V8 microtask queue | After nextTick queue is drained |\n| `setImmediate()` | libuv check phase | After I/O callbacks in current loop iteration |\n\n**Execution order** (main module): sync code → nextTick queue → microtask queue → setImmediate\n\n**Caution**: `process.nextTick()` runs before I/O, so recursive calls can starve I/O — prefer `setImmediate()` when deferring to next iteration.',
    code: {
      language: 'javascript',
      snippet: `console.log('start');
process.nextTick(() => console.log('nextTick'));
setImmediate(() => console.log('setImmediate'));
Promise.resolve().then(() => console.log('promise'));
console.log('end');
// Output (verified with node -e):
// start
// end
// nextTick
// promise
// setImmediate`,
    },
  },
];
