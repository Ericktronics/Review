import type { Flashcard } from '../types';

export const restCards: Flashcard[] = [

  // ─── REST & HTTP (Senior) ────────────────────────────────────────────────────

  {
    id: 'rest-1',
    category: 'REST & HTTP',
    difficulty: 'hard',
    type: 'experience',
    question: 'Compare REST, gRPC, and GraphQL. When would you choose each for a backend API, and what are the operational trade-offs?',
    answer:
      '| | REST | gRPC | GraphQL |\n|---|---|---|---|\n| Protocol | HTTP/1.1 or 2 | HTTP/2 (required) | HTTP/1.1 or 2 |\n| Payload | JSON / XML | Protobuf (binary) | JSON |\n| Contract | OpenAPI (optional) | `.proto` (required) | Schema (required) |\n| Streaming | SSE / WebSocket | Native bi-directional | Subscriptions |\n| Browser support | Native | Needs grpc-web proxy | Native |\n| Overfetching | Common | No (fields in proto) | Solved |\n\n**Choose REST**: public APIs, wide client ecosystem, human-debuggable traffic.\n**Choose gRPC**: internal microservice-to-service calls where latency and payload size matter; works great in polyglot environments via generated stubs.\n**Choose GraphQL**: product APIs with many client types (web, mobile, partner) that each need different data shapes; avoids multiple round-trips and BFF layers.',
  },

  {
    id: 'rest-2',
    category: 'REST & HTTP',
    difficulty: 'hard',
    type: 'experience',
    question: 'What are idempotency and safety in HTTP methods? Why does this matter for distributed systems and retries?',
    answer:
      '**Safe**: the method has no observable server-side effects. `GET`, `HEAD`, `OPTIONS` are safe.\n\n**Idempotent**: calling the method N times produces the same result as calling it once. `GET`, `HEAD`, `PUT`, `DELETE` are idempotent. `POST` and `PATCH` are neither safe nor idempotent by default.\n\n**Why it matters in distributed systems**: networks are unreliable. A client that times out doesn\'t know if the server processed the request. With an idempotent method, it\'s safe to retry.\n\n**Pattern for POST idempotency**: issue an **Idempotency-Key** header. The server stores the response against the key; duplicate requests return the cached response. Used by Stripe, Braintree, etc.',
    code: {
      language: 'typescript',
      snippet: `// Idempotency-Key middleware
app.post('/payments', async (req, res) => {
  const key = req.headers['idempotency-key'] as string;
  if (!key) return res.status(400).json({ error: 'Idempotency-Key required' });

  // Check if we've already processed this key
  const cached = await redis.get(\`idem:\${key}\`);
  if (cached) {
    return res.status(200).json(JSON.parse(cached)); // replay stored response
  }

  const result = await paymentService.charge(req.body);

  // Store for 24 h (or until the key expires per your SLA)
  await redis.setex(\`idem:\${key}\`, 86_400, JSON.stringify(result));
  res.status(201).json(result);
});`,
    },
  },

  {
    id: 'rest-3',
    category: 'REST & HTTP',
    difficulty: 'hard',
    type: 'experience',
    question: 'What are the trade-offs of different API versioning strategies?',
    answer:
      '**URI versioning** (`/v1/users`, `/v2/users`)\n- Pros: explicit, easy to cache, easy to test in a browser\n- Cons: violates REST (URI should identify a resource, not a version)\n\n**Header versioning** (`Accept: application/vnd.api+json; version=2`)\n- Pros: clean URIs, aligns with HTTP content negotiation spec\n- Cons: harder to test manually, not visible in browser history\n\n**Query param** (`/users?version=2`)\n- Pros: easy to pass in any client\n- Cons: pollutes query strings, caching complications\n\n**No versioning / Evolutionary API (GraphQL / hypermedia)**\n- Pros: single endpoint, clients request only what they need\n- Cons: requires discipline; deprecating fields is a process\n\n**Industry default**: URI versioning (`/v1`) for public REST APIs despite the theoretical purity argument, because it\'s the most operationally straightforward.',
  },

  {
    id: 'rest-4',
    category: 'REST & HTTP',
    difficulty: 'hard',
    type: 'experience',
    question: 'How do you implement robust rate limiting in a Node.js API? Discuss algorithms and distributed considerations.',
    answer:
      '**Algorithms**:\n- **Fixed window** — counter resets every N seconds. Simple but vulnerable to burst at window boundary (2× rate in 1 second)\n- **Sliding window log** — store timestamps of each request. Accurate but memory-heavy\n- **Sliding window counter** — weighted average of current and previous windows. Good balance\n- **Token bucket** — tokens refill at rate R, requests consume 1 token. Allows bursts up to bucket size\n- **Leaky bucket** — requests enter a queue and are processed at a fixed rate. Smoothes traffic\n\n**Distributed**: a single in-process counter fails across multiple nodes. Use **Redis** with atomic Lua scripts or `INCR` + `EXPIRE`.\n\n**Identify by**: IP (unauthenticated), `userId` or API key (authenticated). Return `Retry-After` header and `429` status.',
    code: {
      language: 'typescript',
      snippet: `// Sliding window counter with Redis (Lua for atomicity)
const LIMIT = 100;
const WINDOW_MS = 60_000; // 1 minute

async function isRateLimited(key: string): Promise<boolean> {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  // Lua script runs atomically in Redis
  const result = await redis.eval(\`
    local key = KEYS[1]
    local now = tonumber(ARGV[1])
    local window = tonumber(ARGV[2])
    local limit = tonumber(ARGV[3])
    redis.call('ZREMRANGEBYSCORE', key, '-inf', window)
    local count = redis.call('ZCARD', key)
    if count < limit then
      redis.call('ZADD', key, now, now)
      redis.call('PEXPIRE', key, ARGV[4])
      return 0
    end
    return 1
  \`, 1, key, now, windowStart, LIMIT, WINDOW_MS) as number;

  return result === 1;
}`,
    },
  },

  // ─── REST & HTTP (Easy) ──────────────────────────────────────────────────────

  {
    id: 'rest-e1',
    category: 'REST & HTTP',
    difficulty: 'easy',
    type: 'basics',
    question: 'What are the common HTTP methods and what does each one do?',
    answer:
      "HTTP methods (also called **verbs**) tell the server what kind of action you want to perform on a resource. Choosing the right method is the foundation of good REST API design — it communicates intent to the server, proxies, browsers, and API clients.\n\n| Method | Purpose | Idempotent? | Safe? |\n|---|---|---|---|\n| GET | Retrieve a resource or collection | Yes | Yes |\n| POST | Create a new resource | No | No |\n| PUT | Replace a resource entirely (full update) | Yes | No |\n| PATCH | Partially update a resource | Not guaranteed | No |\n| DELETE | Remove a resource | Yes | No |\n| HEAD | Same as GET but returns headers only (no body) | Yes | Yes |\n| OPTIONS | Lists allowed methods — used for CORS preflight | Yes | Yes |\n\n**Safe** = does not modify server state (read-only). Browsers, caches, and crawlers can call safe methods freely.\n\n**Idempotent** = calling the request N times produces the same result as calling it once. This is critical for **retry logic** — if a network call times out and you're not sure if the server received it, you can safely retry an idempotent request.\n\n**Why it matters**: violating these semantics breaks caches, load balancers, and client retry logic. A common mistake is using `GET` with side effects (e.g. `GET /send-email`) — clients and proxies assume GET is safe and may call it multiple times.",
  },

  {
    id: 'rest-e2',
    category: 'REST & HTTP',
    difficulty: 'easy',
    type: 'basics',
    question: 'What do HTTP status code ranges mean? Give examples for each range.',
    answer:
      '**1xx — Informational**: request received, continuing.\n- `100 Continue`\n\n**2xx — Success**:\n- `200 OK` — standard success\n- `201 Created` — resource created (POST)\n- `204 No Content` — success with no body (DELETE)\n\n**3xx — Redirection**:\n- `301 Moved Permanently` — resource has a new permanent URL; clients should update bookmarks\n- `302 Found` — temporary redirect; client should keep using the original URL for future requests\n- `304 Not Modified` — cached version still valid; no body returned\n\n**4xx — Client Error** (the request is wrong):\n- `400 Bad Request` — malformed input\n- `401 Unauthorized` — not authenticated\n- `403 Forbidden` — authenticated but not authorised\n- `404 Not Found`\n- `422 Unprocessable Entity` — validation failed\n- `429 Too Many Requests` — rate limited\n\n**5xx — Server Error**:\n- `500 Internal Server Error` — generic crash\n- `502 Bad Gateway` — the server was acting as a proxy/gateway and received an invalid response from the upstream server\n- `503 Service Unavailable` — server is overloaded or in maintenance; often temporary\n- `504 Gateway Timeout` — the server was acting as a proxy/gateway and the upstream server did not respond in time',
  },

  // ─── REST & HTTP (Medium) ────────────────────────────────────────────────────

  {
    id: 'rest-e3',
    category: 'REST & HTTP',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is a RESTful API? What are the 6 REST constraints?',
    answer:
      '**REST (Representational State Transfer)** is an architectural style for designing networked APIs. A RESTful API uses HTTP in a structured, predictable way.\n\n**The 6 constraints** (Roy Fielding\'s dissertation):\n\n1. **Client-Server** — UI and data storage are separated. The client does not know about server implementation details.\n\n2. **Stateless** — each request contains all information needed to process it. The server stores no session state between requests.\n\n3. **Cacheable** — responses must declare themselves cacheable or not. Clients and proxies can cache responses to reduce load.\n\n4. **Uniform Interface** — resources are identified by URIs; representations are separate from resources; responses include enough information to act on the data (HATEOAS in the strict sense).\n\n5. **Layered System** — a client cannot tell whether it is connected directly to the server or through a proxy/load balancer.\n\n6. **Code on Demand** (optional) — servers can send executable code to clients (e.g. JavaScript).\n\n**Why it matters**: understanding these constraints helps you design predictable, scalable APIs and explains why REST APIs behave the way they do.',
  },

  {
    id: 'rest-e4',
    category: 'REST & HTTP',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is JSON and why is it used in APIs?',
    answer:
      "**JSON (JavaScript Object Notation)** is a lightweight, text-based data format for representing structured data as key-value pairs, arrays, strings, numbers, booleans, and null.\n\n**Why APIs use JSON**:\n- **Human-readable** — easy to read and debug without special tools\n- **Language-agnostic** — every mainstream language has a JSON parser\n- **Native to JavaScript** — `JSON.parse()` and `JSON.stringify()` are built-in\n- **Widely supported** — HTTP clients, browsers, mobile apps, and servers all handle it\n- **Lightweight** — less verbose than XML\n\n**Limitations**:\n- No native support for dates (use ISO 8601 strings: `2025-01-15T10:30:00Z`)\n- No support for binary data (use Base64 encoding or multipart/form-data)\n- Not as efficient as binary formats (Protobuf, MessagePack) for high-throughput internal APIs\n\n**Content-Type header**: always set `Content-Type: application/json` when sending JSON in a request or response body.",
    code: {
      language: 'json',
      snippet: `{
  "id": "usr-42",
  "name": "Alice",
  "email": "alice@example.com",
  "active": true,
  "score": 9.5,
  "tags": ["admin", "beta"],
  "address": {
    "city": "Sydney",
    "country": "AU"
  },
  "createdAt": "2025-01-15T10:30:00Z",
  "deletedAt": null
}`,
    },
  },

  {
    id: 'rest-e5',
    category: 'REST & HTTP',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is an API endpoint? What makes a good URL design?',
    answer:
      "An **endpoint** is a specific URL that a client can call to perform an action on a resource. It combines an HTTP method and a path: `GET /users/42`.\n\n**Good REST URL design**:\n- **Use nouns, not verbs** — resources are things, not actions\n  - `GET /users` not `GET /getUsers`\n  - `POST /orders` not `POST /createOrder`\n- **Plural nouns for collections** — `/users`, `/orders`, `/products`\n- **Hierarchical for relationships** — `/users/42/orders` (orders belonging to user 42)\n- **Lowercase, kebab-case** — `/order-items` not `/orderItems` or `/Order_Items`\n- **IDs in the path for specific resources** — `/users/:id`\n- **Query strings for filtering, sorting, pagination** — `/users?status=active&page=2`\n\n**What to avoid**:\n- Verbs in URLs: `POST /users/42/delete` → use `DELETE /users/42`\n- Deep nesting beyond 2 levels: `/users/42/orders/7/items/3/reviews` → consider `/order-items/3/reviews`",
    code: {
      language: 'typescript',
      snippet: `// Good REST endpoint design
// GET    /users           — list all users
// POST   /users           — create a user
// GET    /users/:id       — get one user
// PUT    /users/:id       — replace a user
// PATCH  /users/:id       — partially update a user
// DELETE /users/:id       — delete a user

// Nested resources (max 2 levels)
// GET  /users/:userId/orders   — orders for a user
// POST /users/:userId/orders   — create an order for a user

// Query strings for filtering/sorting/pagination
// GET /products?category=shoes&sort=price&page=2&limit=20

app.get('/users', getUsers);           // collection
app.get('/users/:id', getUserById);    // single resource
app.post('/users', createUser);
app.patch('/users/:id', updateUser);
app.delete('/users/:id', deleteUser);`,
    },
  },

  {
    id: 'rest-m3',
    category: 'REST & HTTP',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is API versioning? What strategies exist?',
    answer:
      "**API versioning** lets you evolve an API (rename fields, change behaviour, remove endpoints) without breaking existing clients that depend on the old contract.\n\n**Strategies**:\n\n**1. URI versioning** — `/v1/users`, `/v2/users`\n- Most common in practice\n- Explicit, easy to test in a browser, easy to route at the gateway\n- Technically violates REST (the URI should identify the resource, not the version)\n\n**2. Query parameter** — `/users?version=2`\n- Simple to implement, but pollutes URLs and complicates caching\n\n**3. Header versioning** — `Accept: application/vnd.myapi.v2+json`\n- Cleaner URLs, aligns with HTTP content negotiation\n- Harder to test manually; not visible in browser history\n\n**4. No versioning / evolutionary API**\n- Add fields (additive changes are backward-compatible)\n- Deprecate fields before removing them\n- Works well with GraphQL; harder with REST\n\n**Best practice**: use URI versioning for public REST APIs. Run multiple versions in parallel during the transition period. Set a sunset date and return a `Sunset` header.",
    code: {
      language: 'typescript',
      snippet: `// URI versioning — most common approach
const v1Router = express.Router();
const v2Router = express.Router();

v1Router.get('/users/:id', getUserV1);
v2Router.get('/users/:id', getUserV2); // richer response, different shape

app.use('/v1', v1Router);
app.use('/v2', v2Router);

// Return deprecation warning in response headers
v1Router.use((req, res, next) => {
  res.setHeader('Deprecation', 'true');
  res.setHeader('Sunset', 'Sat, 01 Jan 2026 00:00:00 GMT');
  res.setHeader('Link', '</v2/users>; rel="successor-version"');
  next();
});`,
    },
  },

  {
    id: 'rest-m4',
    category: 'REST & HTTP',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is pagination in APIs? Compare offset vs cursor pagination.',
    answer:
      "**Pagination** splits large collections into pages so clients receive a manageable subset of records per request.\n\n**Offset pagination** (`?page=2&limit=20` or `?offset=40&limit=20`):\n- Simple to implement with `LIMIT`/`OFFSET` in SQL\n- **Problems**: if records are inserted/deleted between page requests, items can be skipped or duplicated; `OFFSET` on large tables is slow — the DB must scan and discard the first N rows\n\n**Cursor pagination** (`?after=cursor_token&limit=20`):\n- The cursor encodes the position of the last seen record (e.g. an ID or timestamp)\n- Stable: insertions/deletions don't affect subsequent pages\n- Efficient: `WHERE id > cursor LIMIT 20` uses the index, no offset scanning\n- **Limitation**: cannot jump to page 5 — must navigate sequentially\n\n**When to use**:\n- Offset: admin tables, search results where users jump to page N, data that changes infrequently\n- Cursor: feeds, timelines, real-time data, large datasets",
    code: {
      language: 'typescript',
      snippet: `// Offset pagination
app.get('/users', async (req, res) => {
  const page  = parseInt(req.query.page  as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const [users, total] = await Promise.all([
    db.user.findMany({ skip: offset, take: limit, orderBy: { id: 'asc' } }),
    db.user.count(),
  ]);
  res.json({ data: users, total, page, pages: Math.ceil(total / limit) });
});

// Cursor pagination
app.get('/feed', async (req, res) => {
  const cursor = req.query.after as string | undefined;
  const limit  = 20;

  const users = await db.user.findMany({
    take: limit + 1, // fetch one extra to detect hasNextPage
    cursor: cursor ? { id: cursor } : undefined,
    skip:   cursor ? 1 : 0,
    orderBy: { id: 'asc' },
  });

  const hasNextPage = users.length > limit;
  const data = users.slice(0, limit);
  res.json({ data, nextCursor: hasNextPage ? data[data.length - 1].id : null });
});`,
    },
  },

  {
    id: 'rest-m1',
    category: 'REST & HTTP',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is CORS? Why does the browser enforce it and how do you configure it on a server?',
    answer:
      "**CORS (Cross-Origin Resource Sharing)** is a browser security mechanism that controls whether a web page on one domain can make requests to a different domain.\n\n**Why it exists**: without CORS, a malicious website (`evil.com`) could include JavaScript that silently reads your bank's API using your already-logged-in session cookies. The **Same-Origin Policy** prevents this: browsers block cross-origin requests by default unless the target server explicitly allows them.\n\n**Note**: CORS is enforced by the browser only — server-to-server requests (Node.js calling another API) are not affected.\n\n**How it works**:\n1. **Simple requests** (GET/POST with basic headers): the browser attaches an `Origin` header. The server must respond with `Access-Control-Allow-Origin: https://app.example.com` (or `*` for public APIs).\n2. **Preflight requests** (for PUT/PATCH/DELETE, custom headers like `Authorization`, or JSON bodies): the browser first sends an `OPTIONS` request to ask 'am I allowed to make this call?'. The server must respond with `Access-Control-Allow-Methods` and `Access-Control-Allow-Headers` before the actual request is sent.\n\n**Most common gotcha**: setting `Access-Control-Allow-Origin: *` while also setting `Access-Control-Allow-Credentials: true` — this combination is rejected by browsers. If you need credentials (cookies, Authorization header), you must specify exact origins, not `*`.",
    code: {
      language: 'typescript',
      snippet: `import cors from 'cors';
import express from 'express';
const app = express();

app.use(cors({
  origin: ['https://app.example.com', 'https://admin.example.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // allow cookies / Authorization header
}));

// Manual preflight for fine-grained control
app.options('/api/*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin ?? '');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.sendStatus(204);
});`,
    },
  },

  {
    id: 'rest-m2',
    category: 'REST & HTTP',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is the difference between PUT and PATCH? When should you use each?',
    answer:
      '**PUT** — **full replacement**. The client sends the entire resource. If any field is omitted, it is set to null/default. The server replaces the current state entirely.\n\n**PATCH** — **partial update**. The client sends only the fields that should change. The server applies the diff to the existing resource.\n\n**Idempotency**: PUT is always idempotent (same payload always produces the same result). PATCH *can* be idempotent (set `name` to `"Alice"`) or non-idempotent (increment `count` by 1).\n\n**When to use**:\n- PUT: client manages the full resource lifecycle (file upload, config overwrite)\n- PATCH: client updates individual fields (profile edit form)',
    code: {
      language: 'typescript',
      snippet: `// PUT — must send full object; missing fields get cleared
// PUT /users/42  →  { "name": "Alice", "email": "alice@example.com", "role": "admin" }

// PATCH — send only changed fields
// PATCH /users/42  →  { "email": "new@example.com" }

app.put('/users/:id', async (req, res) => {
  // Replace the entire document
  const user = await User.findByIdAndReplace(req.params.id, req.body);
  res.json(user);
});

app.patch('/users/:id', async (req, res) => {
  // Only update provided fields
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true },
  );
  res.json(user);
});`,
    },
  },

  {
    id: 'rest-m5',
    category: 'REST & HTTP',
    difficulty: 'medium',
    type: 'experience',
    question: 'How do you implement idempotency in a payment API? Why does it matter?',
    answer:
      '**Idempotency** means calling the same endpoint multiple times with the same input produces the same result and no duplicate side effects — critical for payments where a retry must not charge the user twice.\n\n**How it works:**\n1. Client generates a unique **idempotency key** (UUID) per request and sends it in a header: `Idempotency-Key: <uuid>`\n2. Server checks if that key already exists in a store (DB/Redis)\n3. **If found** → return the stored response immediately, skip all processing\n4. **If not found** → process the request, persist `{ key, response, createdAt }`, return response\n5. Keys expire after a TTL (e.g. 24 hours) — after that, a new request with the same key is treated as fresh\n\n**What to store:** the key, the HTTP status code, and the full response body.\n\n**Edge case — in-flight requests:** if two identical requests arrive simultaneously before the first finishes, use a DB lock or `INSERT ... ON CONFLICT DO NOTHING` to prevent double-processing.\n\n**Stripe uses this exact pattern** with the `Idempotency-Key` header on all mutation endpoints.',
    code: {
      language: 'typescript',
      snippet: `// Express middleware — check idempotency key before processing
async function idempotencyMiddleware(req, res, next) {
  const key = req.headers['idempotency-key'];
  if (!key) return next(); // GET/read endpoints — skip

  const cached = await redis.get(\`idem:\${key}\`);
  if (cached) {
    const { status, body } = JSON.parse(cached);
    return res.status(status).json(body); // replay stored response
  }

  // Wrap res.json to capture and store the response
  const originalJson = res.json.bind(res);
  res.json = async (body) => {
    await redis.setex(
      \`idem:\${key}\`,
      86400, // 24 hr TTL
      JSON.stringify({ status: res.statusCode, body })
    );
    return originalJson(body);
  };

  next();
}

// Usage on payment route
router.post('/payments', idempotencyMiddleware, async (req, res) => {
  const charge = await stripe.charges.create({ amount: req.body.amount });
  res.status(201).json({ chargeId: charge.id });
  // On retry with same key → returns stored 201 without charging again
});`,
    },
  },

  {
    id: 'rest-m6',
    category: 'REST & HTTP',
    difficulty: 'medium',
    type: 'basics',
    question: 'How would you design a RESTful API expected to handle very heavy traffic? What strategies do you apply?',
    answer:
      '**This is a classic Micro1/senior-screen question.** There are 6 layers to cover:\n\n**1. Pagination** — never return unbounded lists. Use cursor pagination for large, frequently-updated datasets; offset pagination for simple, sortable tables. Include `nextCursor` or `totalCount` in the response.\n\n**2. Caching** — add a Redis layer in front of the DB for frequently-read, rarely-changed data. Set `Cache-Control` headers for public resources so CDN/proxies cache them too. Aim for 80%+ cache hit rate on hot endpoints.\n\n**3. Rate limiting** — protect all endpoints with per-user or per-IP limits. Use sliding window counters in Redis. Return `429 Too Many Requests` with a `Retry-After` header.\n\n**4. HTTP compression** — enable `gzip`/`brotli` response compression. A 100 KB JSON payload compresses to ~10 KB, reducing bandwidth costs and latency especially on mobile.\n\n**5. Async processing** — move slow work (emails, PDF generation, webhooks, image resizing) off the HTTP request path. Accept the request, enqueue a job, return `202 Accepted`. Process via workers (BullMQ, SQS).\n\n**6. Connection pooling + DB read replicas** — never create a new DB connection per request. Pool connections (pg Pool, PgBouncer). Route `SELECT` queries to read replicas to spread the load.',
    code: {
      language: 'typescript',
      snippet: `// Cursor pagination — scalable for large datasets
app.get('/posts', async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const cursor = req.query.cursor as string | undefined;

  const posts = await db.post.findMany({
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { createdAt: 'desc' },
  });

  const hasMore = posts.length > limit;
  if (hasMore) posts.pop();

  res.json({
    data: posts,
    nextCursor: hasMore ? posts[posts.length - 1].id : null,
  });
});

// HTTP compression with Express
import compression from 'compression';
app.use(compression()); // gzip/brotli all JSON responses automatically

// Async job — return 202, process in background
app.post('/reports', async (req, res) => {
  const job = await reportQueue.add('generate', req.body);
  res.status(202).json({ jobId: job.id, status: 'queued' });
});`,
    },
  },
];
