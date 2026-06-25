import type { Flashcard } from "../types";

export const nodejsCards: Flashcard[] = [
  // ─── Node.js (Senior) ────────────────────────────────────────────────────────

  {
    id: "node-1",
    category: "Node.js",
    difficulty: "hard",
    type: 'experience',
    question:
      "Walk through every phase of the Node.js Event Loop. Where do microtasks (Promises, nextTick) fit in, and what does libuv actually own?",
    answer:
      "**Ownership** (staff-level follow-up):\n- **libuv** → event loop phases, I/O polling, thread pool\n- **V8** → Promise microtask queue (`Promise.then`, `queueMicrotask`)\n- **Node.js** → `process.nextTick` queue (Node-specific, not a V8 concept)\n\nThe loop cycles through 6 libuv phases:\n\n1. **timers** — runs callbacks whose `setTimeout` / `setInterval` threshold has elapsed. Example: `setTimeout(() => console.log('hello'), 100)` runs here once 100 ms has passed.\n2. **pending callbacks** — runs I/O error callbacks deferred from the previous cycle. Example: a TCP connection error that libuv couldn't report immediately.\n3. **idle / prepare** — internal libuv bookkeeping only. Not accessible from userland JavaScript.\n4. **poll** — waits for new I/O events and runs their callbacks. Example: `fs.readFile()` completion, incoming HTTP requests, data arriving on a socket. If there are timers due, the loop won't block here and moves on.\n5. **check** — runs `setImmediate` callbacks. Example: `setImmediate(() => console.log('after I/O'))` — always fires after the current poll phase, making it predictable inside I/O callbacks.\n6. **close callbacks** — runs `close` event handlers. Example: `socket.on('close', () => ...)` after `socket.destroy()` is called.\n\nAfter **every individual callback** (not just between phases — changed in Node.js v11 to match browser behaviour), Node drains two queues in order:\n1. `process.nextTick` queue — fully drained first, can starve I/O if called recursively\n2. V8 microtask queue — `Promise.then` callbacks and `queueMicrotask`\n\nThe thread pool (default 4 threads, tunable via `UV_THREADPOOL_SIZE`) handles `fs`, `crypto`, `dns.lookup`, and `zlib`. TCP/UDP, pipes, and timers use OS async primitives (epoll / kqueue / IOCP) directly — no thread pool involved.",
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

// ── Test 3: classic output prediction (verified) ──
setImmediate(() => console.log('A: setImmediate'));     // check phase
Promise.resolve().then(() => console.log('B: Promise')); // V8 microtask
process.nextTick(() => {
  console.log('C: nextTick');                            // nextTick queue
  Promise.resolve().then(() => console.log('D: nested Promise'));
});
setTimeout(() => console.log('F: setTimeout'), 0);      // timers phase
console.log('E: sync');
// Output:
// E → sync code runs first
// C → nextTick queue drains
// B → microtask queue (B was queued before D)
// D → microtask queued inside C, runs after B
// F → timers phase (setTimeout)
// A → check phase (setImmediate)
//
// Note: from the main module, F vs A order is non-deterministic.
// Inside an I/O callback, setImmediate ALWAYS fires before setTimeout(fn,0).`,
    },
  },

  {
    id: "node-2",
    category: "Node.js",
    difficulty: "hard",
    type: 'experience',
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
    type: 'experience',
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
    type: 'experience',
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
    type: 'experience',
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
    type: 'experience',
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
    type: 'experience',
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
    id: "node-9",
    category: "Node.js",
    difficulty: "hard",
    type: 'experience',
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
    id: "node-12",
    category: "Node.js",
    difficulty: "hard",
    type: 'experience',
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
    type: 'experience',
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
    type: 'experience',
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
    type: 'experience',
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
    type: 'experience',
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
    type: 'basics',
    question: 'What is Node.js and what makes it different from browser JavaScript?',
    answer:
      "**Node.js is a JavaScript runtime that runs on the server**, not in a browser. It is built on Google's V8 engine (the same engine Chrome uses) and lets you use JavaScript for backend code.\n\n**Why it exists**: traditionally, every server language had its own ecosystem. Node.js lets frontend JavaScript developers write servers in the same language they already know, and it handles I/O-heavy workloads (like web APIs) very efficiently.\n\n**Key differences from browser JavaScript**:\n- **No DOM / BOM** — no `window`, `document`, or browser APIs\n- **Non-blocking I/O** — file system, network, and database calls are asynchronous by default; the process does not wait around while the OS fetches data\n- **Single-threaded event loop** — one main thread handles all JavaScript; I/O work is offloaded so the thread stays free\n- **CommonJS / ESM modules** — `require()` / `import` instead of `<script>` tags\n- **Built-in modules** — `fs`, `path`, `http`, `crypto`, `stream`, etc.\n\n**Why this matters**: a Node.js server can handle tens of thousands of concurrent connections with low memory because it does not spawn a thread per request (unlike traditional PHP or Java thread-per-request models).",
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
    type: 'basics',
    question: 'What is the error-first callback pattern and why did Node.js adopt it?',
    answer:
      "The **error-first (Node-style) callback** convention places the error as the first argument of every callback: `callback(err, result)`. If the operation succeeds, `err` is `null`. If it fails, `err` is an `Error` object.\n\n**Why this convention exists**: before Promises (pre-2015), there was no standard way to propagate errors from async code. You could not use `try/catch` because the async callback runs after the original function has already returned. By putting the error first in every callback, Node.js forced developers to explicitly handle failures — not silently ignore them.\n\n**The three rules**:\n- **Always check `err` first** before using the result — otherwise you may crash accessing properties of `undefined`\n- **Never throw synchronously** inside an async callback — it bypasses the caller's error handling and crashes the process\n- **Call the callback exactly once** — never twice, never zero times\n\n**Why it matters today**: you will encounter this pattern in many Node.js built-in APIs (`fs.readFile`, `dns.lookup`) and older npm packages. Understanding it also helps you understand why Promises were invented.",
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
    type: 'basics',
    question: 'How do Promises and async/await work in Node.js? What problems do they solve over callbacks?',
    answer:
      "A **Promise** represents a value that will be available in the future. It is in one of three states: **pending** (operation in progress), **fulfilled** (succeeded, has a value), or **rejected** (failed, has an error).\n\n**Problems callbacks cause** (why Promises were invented):\n- **Callback hell** — deeply nested pyramids of callbacks that are hard to read and debug\n- **Inconsistent error handling** — easy to forget to check `err`, easy to throw in the wrong place\n- **No parallel execution** — difficult to run two async tasks at the same time and wait for both\n\n**async/await** is syntactic sugar built on top of Promises. It makes async code look and behave like synchronous code:\n- An `async` function always returns a Promise\n- `await` pauses execution inside that function until the awaited Promise settles — without blocking the event loop (other requests continue to be processed)\n- Errors are caught with familiar `try/catch`\n\n**Most common gotcha**: forgetting `await`. Without it, the function returns a pending Promise and the next line runs before the async work is done.\n\n**Key methods**:\n- `Promise.all([p1, p2])` — run in parallel, fail fast if any rejects\n- `Promise.allSettled([p1, p2])` — run in parallel, never rejects, reports all outcomes\n- Unhandled rejections **crash the process** in Node.js 15+",
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
    id: 'node-e3',
    category: 'Node.js',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is the difference between require() and import? (CommonJS vs ESM)',
    answer:
      '**CommonJS (CJS)** — the original Node.js module system. Uses `require()` to load modules synchronously.\n\n**ES Modules (ESM)** — the JavaScript standard. Uses `import`/`export` syntax; loaded asynchronously; enables static analysis and tree-shaking.\n\n| | CommonJS | ESM |\n|---|---|---|\n| Syntax | `require()` / `module.exports` | `import` / `export` |\n| Loading | Synchronous | Asynchronous |\n| Top-level `await` | No | Yes |\n| Tree-shaking | No | Yes |\n| `__dirname` | Available | Use `import.meta.url` |\n\n**Enable ESM**: add `"type": "module"` to `package.json`, or use `.mjs` extension.\n\n**Why it matters**: ESM is the future. Most modern packages (and TypeScript) ship ESM. Understanding the difference avoids confusing interop errors.',
    code: {
      language: 'javascript',
      snippet: `// CommonJS (works in Node.js by default)
const fs = require('fs');
const { readFile } = require('fs');
module.exports = { myFunc };

// ESM (requires "type": "module" in package.json or .mjs extension)
import fs from 'fs';
import { readFile } from 'fs';
export function myFunc() {}

// __dirname equivalent in ESM
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));`,
    },
  },

  {
    id: 'node-e4',
    category: 'Node.js',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is package.json? What are the key fields?',
    answer:
      '`package.json` is the **manifest file** for a Node.js project. It describes the project and its dependencies so npm/yarn/pnpm know how to install and run it.\n\n**Key fields**:\n- `name` — package name (must be unique if published to npm)\n- `version` — semver version (`1.2.3`)\n- `main` — entry point for CJS (`"dist/index.js"`)\n- `exports` — modern entry point for ESM and CJS\n- `scripts` — runnable commands (`npm run build`, `npm start`, `npm test`)\n- `dependencies` — packages needed at runtime\n- `devDependencies` — packages needed only during development (TypeScript, test runners, linters)\n- `peerDependencies` — packages the consumer must provide (common in libraries)\n- `engines` — specifies required Node.js version\n\n**`dependencies` vs `devDependencies`**: always put test/build tools in `devDependencies` — they are excluded from production installs with `npm ci --omit=dev`.',
    code: {
      language: 'json',
      snippet: `{
  "name": "my-api",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node-dev src/index.ts",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/express": "^4.17.21",
    "jest": "^29.0.0"
  },
  "engines": { "node": ">=18.0.0" }
}`,
    },
  },

  {
    id: 'node-m3',
    category: 'Node.js',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is streaming in Node.js? Why use streams instead of reading entire files?',
    answer:
      "**A stream processes data piece by piece (in chunks) rather than loading it all into memory at once.** Think of it like watching a video on Netflix: you don't wait for the entire 2 GB file to download before it starts playing.\n\n**Types of streams**:\n- **Readable** — produces data (e.g. `fs.createReadStream`, HTTP request body)\n- **Writable** — consumes data (e.g. `fs.createWriteStream`, HTTP response)\n- **Duplex** — both readable and writable simultaneously (e.g. TCP socket)\n- **Transform** — reads input, transforms it, outputs the result (e.g. `zlib.createGzip`)\n\n**Why use streams instead of loading entire files**:\n- **Memory efficiency** — a 2 GB file read with `fs.readFile` allocates 2 GB of RAM. A stream processes it in ~64 KB chunks, using the same amount of RAM regardless of file size.\n- **Time to first byte** — the client starts receiving data immediately, before the file is fully read\n- **Composability** — streams connect with `.pipe()` into clean pipelines: `read → compress → write`\n\n**Backpressure**: if the consumer (e.g. a slow network client) is slower than the producer (e.g. disk reads), Node.js automatically pauses the readable stream so data does not pile up in memory.",
    code: {
      language: 'javascript',
      snippet: `const fs = require('fs');
const zlib = require('zlib');

// Without streams — loads entire file into RAM
// const data = fs.readFileSync('huge.log'); // ✗ risky for large files

// With streams — processes in chunks, constant memory usage
fs.createReadStream('huge.log')
  .pipe(zlib.createGzip())              // Transform: compress on the fly
  .pipe(fs.createWriteStream('huge.log.gz'))
  .on('finish', () => console.log('Done!'));

// HTTP: stream a file directly to the response
app.get('/download', (req, res) => {
  res.setHeader('Content-Type', 'application/octet-stream');
  fs.createReadStream('./large-file.csv').pipe(res);
  // response starts immediately; data flows in chunks
});`,
    },
  },

  {
    id: 'node-m4',
    category: 'Node.js',
    difficulty: 'medium',
    type: 'basics',
    question: 'How do you handle environment variables in Node.js?',
    answer:
      '**Environment variables** are key-value pairs set in the shell or deployment environment. They keep secrets and environment-specific config out of your code.\n\n**`process.env`**: Node.js exposes all environment variables via `process.env`. Values are always strings.\n\n**`dotenv`**: a package that loads variables from a `.env` file into `process.env` during local development. Never commit `.env` to version control — add it to `.gitignore`.\n\n**Best practices**:\n- **Validate on startup** — use Zod or `envalid` to assert required variables exist and have the right type. Fail fast if a required variable is missing.\n- **Provide defaults** — `process.env.PORT ?? 3000`\n- **Never log the full env** — it may contain secrets\n- **Different `.env` per environment** — `.env.development`, `.env.test` (but never `.env.production` committed)\n\n**In production**: set variables via your deployment platform (Kubernetes Secrets, AWS Parameter Store, Heroku Config Vars) — never via a `.env` file.',
    code: {
      language: 'typescript',
      snippet: `// Install: npm install dotenv zod
import 'dotenv/config'; // load .env file in development
import { z } from 'zod';

// Validate and parse env vars at startup
const envSchema = z.object({
  NODE_ENV:    z.enum(['development', 'test', 'production']),
  PORT:        z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET:  z.string().min(32),
});

export const env = envSchema.parse(process.env);
// Throws a clear error at startup if anything is missing or wrong

// Usage
import { env } from './config';
app.listen(env.PORT);
const pool = new Pool({ connectionString: env.DATABASE_URL });`,
    },
  },

  {
    id: 'node-m2',
    category: 'Node.js',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is the difference between process.nextTick(), Promise microtasks, and setImmediate()?',
    answer:
      "All three defer code execution to run later, but they run at **different points** in the event loop. Understanding the order is critical for predicting async behaviour.\n\n| | Queued in | Runs when |\n|---|---|---|\n| `process.nextTick()` | Node.js nextTick queue | Immediately after the current operation, before any I/O |\n| `Promise.then()` / `queueMicrotask()` | V8 microtask queue | After nextTick queue is fully drained |\n| `setImmediate()` | libuv check phase | After all I/O callbacks in the current loop iteration |\n\n**Execution order** from the main module: synchronous code → nextTick queue → Promise/microtask queue → setImmediate\n\n**Most common gotcha**: `process.nextTick()` runs before I/O callbacks. If you call `process.nextTick()` recursively it can **starve I/O** — the loop never reaches the poll phase. Use `setImmediate()` when you want to defer to the next loop iteration without blocking I/O.\n\n**When to use which**: use `process.nextTick()` to run code after the current synchronous operation but before anything else (e.g. emit an event after construction). Use `setImmediate()` to schedule work after I/O. In most application code, just use `await`.",
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

  // ─── Node.js (More Easy) ─────────────────────────────────────────────────────

  {
    id: 'node-e5',
    category: 'Node.js',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is npm? What are npm scripts and why are they useful?',
    answer:
      '**npm (Node Package Manager)** is the default package manager for Node.js. It does two things:\n1. **Installs packages** from the npm registry into your project (`npm install`)\n2. **Runs scripts** defined in `package.json`\n\n**npm scripts** are shortcuts for terminal commands defined under `"scripts"` in `package.json`. Instead of remembering a long command like `tsc && node dist/index.js`, you just run `npm run start`.\n\n**Why use them**:\n- Shared across the whole team — everyone runs the same command\n- No need to install tools globally — npm runs local binaries from `node_modules/.bin`\n- Can chain commands with `&&` (sequential) or `&` (parallel)\n\n**Special scripts**: `start`, `test`, `build` can be run without the `run` keyword (`npm start`, `npm test`).',
    code: {
      language: 'json',
      snippet: `{
  "scripts": {
    "start":   "node dist/index.js",
    "dev":     "ts-node-dev src/index.ts",
    "build":   "tsc",
    "test":    "jest",
    "lint":    "eslint src/**/*.ts",
    "prepare": "npm run build"  // runs automatically before npm publish
  }
}

// Usage:
// npm run dev     → runs ts-node-dev
// npm test        → no 'run' needed for 'test'
// npm start       → no 'run' needed for 'start'`,
    },
  },

  {
    id: 'node-e6',
    category: 'Node.js',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is the difference between `dependencies` and `devDependencies` in package.json?',
    answer:
      '**`dependencies`**: packages your app needs to **run in production**. They are included when someone installs your package.\n- Examples: `express`, `pg`, `zod`, `jsonwebtoken`\n\n**`devDependencies`**: packages only needed during **development and building** — not in production.\n- Examples: `typescript`, `jest`, `eslint`, `ts-node`\n\n**Why it matters**:\n- `npm install --omit=dev` (used in Docker production builds) skips devDependencies, keeping the image smaller and the attack surface smaller\n- Accidentally putting a dev tool in `dependencies` bloats your production bundle\n\n**`peerDependencies`**: packages the consumer of your library must install themselves (used when writing npm packages, not apps).',
    code: {
      language: 'json',
      snippet: `{
  "dependencies": {
    "express": "^4.18.2",    // needed at runtime
    "zod":     "^3.22.0",    // needed at runtime
    "pg":      "^8.11.0"     // needed at runtime
  },
  "devDependencies": {
    "typescript":   "^5.2.0",  // compile-time only
    "jest":         "^29.0.0", // test-time only
    "@types/node":  "^20.0.0", // type definitions only
    "ts-node-dev":  "^2.0.0"   // dev server only
  }
}

// Install all: npm install
// Install prod only: npm install --omit=dev`,
    },
  },

  {
    id: 'node-e7',
    category: 'Node.js',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is `__dirname` and `__filename` in Node.js?',
    answer:
      '**`__dirname`**: the **absolute path of the directory** containing the current file.\n**`__filename`**: the **absolute path of the current file** itself.\n\nThese are injected by Node.js into every CommonJS module — they are NOT available in ES Modules (use `import.meta.url` instead).\n\n**Why they matter**: when building file paths, never use relative strings like `"./data/file.json"` — they resolve relative to the **working directory** (`process.cwd()`), which changes depending on where you run the command. Always use `path.join(__dirname, ...)` to get a path relative to the file, not the shell.',
    code: {
      language: 'javascript',
      snippet: `const path = require('path');

console.log(__filename); // /Users/alice/project/src/server.js
console.log(__dirname);  // /Users/alice/project/src

// ✗ Fragile — breaks if you run from a different directory
const config = require('./config/settings.json');

// ✓ Safe — always resolves relative to this file
const config2 = require(path.join(__dirname, 'config', 'settings.json'));

// Reading a file relative to the current module
const fs = require('fs');
const template = fs.readFileSync(
  path.join(__dirname, '..', 'templates', 'email.html'),
  'utf8',
);`,
    },
  },

  {
    id: 'node-e8',
    category: 'Node.js',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is a Buffer in Node.js? When do you use it?',
    answer:
      'A **Buffer** is a fixed-size chunk of raw binary memory outside the V8 heap. It represents binary data — like file contents, image bytes, or network packets — before it\'s been converted to a string.\n\n**Why it exists**: JavaScript strings are Unicode, but I/O (files, sockets, crypto) deals in raw bytes. Buffers bridge that gap.\n\n**When you use Buffers**:\n- Reading files in binary mode\n- Working with cryptographic operations (`crypto.createHash`)\n- Handling binary network protocols (TCP, WebSocket frames)\n- Encoding/decoding (Base64, hex)\n\n**Encoding**: when converting to/from a string you must specify the encoding (`utf8`, `base64`, `hex`, `binary`). Defaulting to the wrong one silently corrupts data.',
    code: {
      language: 'javascript',
      snippet: `// Create from string
const buf = Buffer.from('Hello');
console.log(buf);            // <Buffer 48 65 6c 6c 6f>
console.log(buf.toString()); // Hello
console.log(buf.length);     // 5 (bytes, not characters)

// Allocate empty buffer of N bytes
const empty = Buffer.alloc(8); // 8 zero bytes

// Common use: Base64 encode/decode
const encoded = Buffer.from('secret data').toString('base64');
// 'c2VjcmV0IGRhdGE='
const decoded = Buffer.from(encoded, 'base64').toString('utf8');
// 'secret data'

// In streams: chunks arrive as Buffers
readableStream.on('data', (chunk) => {
  console.log(chunk instanceof Buffer); // true
  console.log(chunk.toString('utf8'));  // convert to string
});`,
    },
  },

  // ─── Node.js (More Medium) ───────────────────────────────────────────────────

  {
    id: 'node-m5',
    category: 'Node.js',
    difficulty: 'medium',
    type: 'basics',
    question: 'How does Node.js module caching work with `require()`? What problem can it cause in tests?',
    answer:
      'The first time you `require()` a module, Node.js:\n1. Resolves the file path\n2. Executes the file\n3. **Stores the exported value in `require.cache`** keyed by the absolute file path\n\nEvery subsequent `require()` of the same path returns the **cached export directly** — the file is never executed again. This means modules are effectively **singletons**.\n\n**Why it matters**:\n- A database connection pool required in multiple files is the same instance everywhere — intentional and efficient\n- A config object required in multiple files is shared — mutating it in one place affects all\n\n**Test problem**: if a module holds state (e.g. an in-memory store, a singleton class), that state persists between tests. Fix by deleting from `require.cache` or by using dependency injection instead of direct requires.',
    code: {
      language: 'javascript',
      snippet: `const m1 = require('path');
const m2 = require('path');
console.log(m1 === m2); // true — exact same cached object

// See what's cached
console.log(require.cache[require.resolve('./myModule')]);

// Clear a module from cache (useful in tests)
delete require.cache[require.resolve('./myModule')];
const fresh = require('./myModule'); // re-executes the file

// Circular dependency: A requires B, B requires A
// Node returns A's partially-built export to break the cycle
// This can result in 'undefined' properties — avoid circular deps`,
    },
  },

  {
    id: 'node-m6',
    category: 'Node.js',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is the `path` module? What is the difference between `path.join()` and `path.resolve()`?',
    answer:
      'The built-in `path` module provides utilities for working with file and directory paths in a cross-platform way (handles `/` vs `\\` on Windows automatically).\n\n**`path.join(...segments)`**: joins segments with the OS separator and normalises the result. It is **relative** — it does not care about the current working directory.\n\n**`path.resolve(...segments)`**: builds an **absolute** path by processing segments from right to left. If it hits an absolute path segment, it stops and uses that as the root. Similar to `cd`-ing through the segments in a shell.\n\n**Key difference**: `path.join` just concatenates and normalises. `path.resolve` always returns an absolute path, anchoring to `process.cwd()` if no absolute segment is found.\n\n**Rule of thumb**: use `path.join(__dirname, ...)` for paths relative to the current file. Use `path.resolve()` when you need a guaranteed absolute path.',
    code: {
      language: 'javascript',
      snippet: `const path = require('path');

// path.join — just concatenates + normalises
path.join('/foo', 'bar', 'baz')       // '/foo/bar/baz'
path.join('/foo', 'bar', '../baz')    // '/foo/baz'  (normalised)
path.join('foo', 'bar')               // 'foo/bar'   (still relative)

// path.resolve — always returns absolute path
// (assuming cwd is /Users/alice/project)
path.resolve('foo', 'bar')            // '/Users/alice/project/foo/bar'
path.resolve('/foo', 'bar')           // '/foo/bar'
path.resolve('/foo', 'bar', '/baz')   // '/baz'  (hits absolute, resets)

// Best practice: path relative to current file
const configPath = path.join(__dirname, '..', 'config', 'app.json');`,
    },
  },

  {
    id: 'node-m7',
    category: 'Node.js',
    difficulty: 'medium',
    type: 'basics',
    question: 'How do you read and write files in Node.js? What is the difference between the sync and async APIs?',
    answer:
      'The built-in `fs` module provides file system operations in three styles:\n\n**1. Callback (async)** — `fs.readFile()` — non-blocking, uses error-first callback. Original API.\n\n**2. Promises (async)** — `fs.promises.readFile()` or `require(\'fs/promises\')` — same non-blocking behaviour but returns a Promise. Use with `async/await`. Preferred in modern code.\n\n**3. Sync** — `fs.readFileSync()` — blocks the entire event loop until done. **Never use in a server request handler** — it freezes all other requests while waiting. Only acceptable in startup scripts or CLI tools.\n\n**Common gotcha**: forgetting to specify `\'utf8\'` encoding returns a `Buffer` instead of a string.',
    code: {
      language: 'javascript',
      snippet: `const fs = require('fs/promises'); // Promise-based API (Node 14+)
const fsSync = require('fs');       // sync API

// ✓ Async — non-blocking, use in request handlers
async function readConfig() {
  const data = await fs.readFile('./config.json', 'utf8');
  return JSON.parse(data);
}

async function writeLog(message) {
  await fs.writeFile('./app.log', message + '\\n', { flag: 'a' }); // append
}

// ✓ Sync — only acceptable at startup, never in request handlers
const config = JSON.parse(fsSync.readFileSync('./config.json', 'utf8'));

// ✓ Check if file exists before reading
async function safeRead(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') return null; // file not found
    throw err;
  }
}`,
    },
  },

  {
    id: 'node-m8',
    category: 'Node.js',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is the `child_process` module? When would you use `exec`, `execFile`, `spawn`, or `fork`?',
    answer:
      'The `child_process` module lets you **run external commands or other Node.js scripts** as separate OS processes.\n\n| Method | Use when |\n|---|---|\n| `exec(cmd)` | Run a shell command, capture output as a string. Small output only (buffered). |\n| `execFile(file)` | Like `exec` but no shell — safer when running a known binary (no shell injection risk). |\n| `spawn(cmd)` | Stream large output (video processing, log tailing). Output is a stream, not buffered. |\n| `fork(script)` | Run another Node.js script in a separate process with a built-in IPC channel between parent and child. |\n\n**`exec` security warning**: never pass unsanitised user input to `exec` — it runs through a shell and is vulnerable to command injection. Use `execFile` or `spawn` instead.\n\n**When to use**: CPU-heavy tasks (image processing, PDF generation), running CLI tools, parallel processing.',
    code: {
      language: 'javascript',
      snippet: `const { exec, spawn, fork } = require('child_process');

// exec — run shell command, get output as string
exec('ls -la', (err, stdout, stderr) => {
  if (err) return console.error(err);
  console.log(stdout);
});

// spawn — stream large output (doesn't buffer everything in memory)
const ls = spawn('ls', ['-la']);
ls.stdout.on('data', (chunk) => process.stdout.write(chunk));
ls.on('close', (code) => console.log('Exit:', code));

// fork — run a Node.js file, communicate via IPC
const child = fork('./worker.js');
child.send({ task: 'processImage', file: 'photo.jpg' });
child.on('message', (result) => console.log('Done:', result));`,
    },
  },

  {
    id: 'node-m9',
    category: 'Node.js',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is the V8 heap in Node.js? Where does it live, and how does Node.js use it?',
    answer:
      'The **heap** is the region of memory where V8 (Node\'s JS engine) allocates all JavaScript objects, strings, closures, and arrays at runtime. It lives in **RAM** as part of your Node.js process — not on disk.\n\n**How V8 organises the heap:**\n- **New Space (Young Generation)** — small, fast area for short-lived objects. Collected frequently by minor GC.\n- **Old Space (Old Generation)** — objects that survive minor GCs get promoted here. Collected by major GC.\n- **Large Object Space** — objects > ~256 KB. Never moved by GC.\n- **Code Space** — compiled JIT bytecode.\n- **Map Space** — hidden classes V8 uses to optimise property access.\n\n**Default heap limit:** ~1.5 GB on 64-bit. Override with `node --max-old-space-size=4096 app.js`.\n\n**Common heap problem:** a **memory leak** — objects stay referenced (global array, forgotten event listener, closure) so GC can\'t free them. Heap grows until the process crashes with `JavaScript heap out of memory`.',
    code: {
      language: 'javascript',
      snippet: `// Inspect heap usage at runtime
const v8 = require('v8');
const { heapUsed, heapTotal, rss } = process.memoryUsage();

console.log({
  heapUsed:  (heapUsed  / 1024 / 1024).toFixed(1) + ' MB', // JS objects in use
  heapTotal: (heapTotal / 1024 / 1024).toFixed(1) + ' MB', // total heap reserved
  rss:       (rss       / 1024 / 1024).toFixed(1) + ' MB', // total process RAM
});

// Full V8 heap breakdown (space-by-space)
console.log(v8.getHeapStatistics());
// { total_heap_size, used_heap_size, heap_size_limit, ... }

// Run with larger Old Space for memory-heavy workloads:
// node --max-old-space-size=4096 app.js`,
    },
  },
];
