import type { Flashcard } from '../types';

export const restCards: Flashcard[] = [

  // ─── REST & HTTP (Senior) ────────────────────────────────────────────────────

  {
    id: 'rest-1',
    category: 'REST & HTTP',
    difficulty: 'hard',
    question: 'Compare REST, gRPC, and GraphQL. When would you choose each for a backend API, and what are the operational trade-offs?',
    answer:
      '| | REST | gRPC | GraphQL |\n|---|---|---|---|\n| Protocol | HTTP/1.1 or 2 | HTTP/2 (required) | HTTP/1.1 or 2 |\n| Payload | JSON / XML | Protobuf (binary) | JSON |\n| Contract | OpenAPI (optional) | `.proto` (required) | Schema (required) |\n| Streaming | SSE / WebSocket | Native bi-directional | Subscriptions |\n| Browser support | Native | Needs grpc-web proxy | Native |\n| Overfetching | Common | No (fields in proto) | Solved |\n\n**Choose REST**: public APIs, wide client ecosystem, human-debuggable traffic.\n**Choose gRPC**: internal microservice-to-service calls where latency and payload size matter; works great in polyglot environments via generated stubs.\n**Choose GraphQL**: product APIs with many client types (web, mobile, partner) that each need different data shapes; avoids multiple round-trips and BFF layers.',
  },

  {
    id: 'rest-2',
    category: 'REST & HTTP',
    difficulty: 'hard',
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
    question: 'What are the trade-offs of different API versioning strategies?',
    answer:
      '**URI versioning** (`/v1/users`, `/v2/users`)\n- Pros: explicit, easy to cache, easy to test in a browser\n- Cons: violates REST (URI should identify a resource, not a version)\n\n**Header versioning** (`Accept: application/vnd.api+json; version=2`)\n- Pros: clean URIs, aligns with HTTP content negotiation spec\n- Cons: harder to test manually, not visible in browser history\n\n**Query param** (`/users?version=2`)\n- Pros: easy to pass in any client\n- Cons: pollutes query strings, caching complications\n\n**No versioning / Evolutionary API (GraphQL / hypermedia)**\n- Pros: single endpoint, clients request only what they need\n- Cons: requires discipline; deprecating fields is a process\n\n**Industry default**: URI versioning (`/v1`) for public REST APIs despite the theoretical purity argument, because it\'s the most operationally straightforward.',
  },

  {
    id: 'rest-4',
    category: 'REST & HTTP',
    difficulty: 'hard',
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
    question: 'What are the common HTTP methods and what does each one do?',
    answer:
      '| Method | Purpose | Idempotent? | Safe? |\n|---|---|---|---|\n| GET | Retrieve a resource | Yes | Yes |\n| POST | Create a new resource | No | No |\n| PUT | Replace a resource entirely | Yes | No |\n| PATCH | Partially update a resource | Not guaranteed | No |\n| DELETE | Remove a resource | Yes | No |\n| HEAD | Same as GET but no body | Yes | Yes |\n| OPTIONS | List allowed methods (CORS preflight) | Yes | Yes |\n\n**Safe** = does not modify server state (read-only).\n**Idempotent** = calling the same request N times has the same effect as calling it once.',
  },

  {
    id: 'rest-e2',
    category: 'REST & HTTP',
    difficulty: 'easy',
    question: 'What do HTTP status code ranges mean? Give examples for each range.',
    answer:
      '**1xx — Informational**: request received, continuing.\n- `100 Continue`\n\n**2xx — Success**:\n- `200 OK` — standard success\n- `201 Created` — resource created (POST)\n- `204 No Content` — success with no body (DELETE)\n\n**3xx — Redirection**:\n- `301 Moved Permanently`\n- `304 Not Modified` — cached version still valid\n\n**4xx — Client Error** (the request is wrong):\n- `400 Bad Request` — malformed input\n- `401 Unauthorized` — not authenticated\n- `403 Forbidden` — authenticated but not authorised\n- `404 Not Found`\n- `422 Unprocessable Entity` — validation failed\n- `429 Too Many Requests` — rate limited\n\n**5xx — Server Error**:\n- `500 Internal Server Error` — generic crash\n- `503 Service Unavailable` — overloaded or in maintenance',
  },

  // ─── REST & HTTP (Medium) ────────────────────────────────────────────────────

  {
    id: 'rest-m1',
    category: 'REST & HTTP',
    difficulty: 'medium',
    question: 'What is CORS? Why does the browser enforce it and how do you configure it on a server?',
    answer:
      '**CORS (Cross-Origin Resource Sharing)** is a browser security mechanism enforcing the **Same-Origin Policy**: a script on `app.example.com` cannot fetch `api.example.com` unless that server explicitly opts in.\n\n**How it works**:\n1. For simple requests (GET/POST + safe headers): browser attaches `Origin`; server must respond with `Access-Control-Allow-Origin`\n2. For complex requests (PUT/PATCH/DELETE, custom headers, JSON body): browser sends an **OPTIONS preflight** first. Server must respond with `Access-Control-Allow-Methods` and `Access-Control-Allow-Headers` before the real request proceeds\n\n**Security note**: never use `*` for credentialed requests. Use specific origins with `Access-Control-Allow-Credentials: true`.',
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
];
