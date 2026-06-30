import type { Flashcard } from '../types';

export const systemDesignCards: Flashcard[] = [

  // ─── System Design (Senior) ──────────────────────────────────────────────────

  {
    id: 'sys-1',
    category: 'System Design',
    difficulty: 'hard',
    type: 'experience',
    question: 'What is CQRS and Event Sourcing? When do they solve a real problem, and when are they over-engineering?',
    answer:
      '**CQRS (Command Query Responsibility Segregation)**: separate the write model (commands that change state) from the read model (queries that return data). Each side can be optimised independently — e.g., writes go to a normalised PostgreSQL schema, reads hit a denormalised Elasticsearch index.\n\n**Event Sourcing**: instead of storing the current state, store every state-changing **event** (immutable log). Current state is derived by replaying events. Enables audit logs, time-travel debugging, and projecting new read models from historical events.\n\n**Good fit**: financial systems (audit trail is mandatory), collaborative editing, systems that need multiple projections of the same data, or complex domain logic that benefits from explicit command/event vocabulary.\n\n**Over-engineering when**: a simple CRUD app with one UI, no audit requirements, no complex read patterns. You pay with operational complexity: eventual consistency, event schema versioning, projection rebuild time.',
    code: {
      language: 'typescript',
      snippet: `// Event Sourcing: store facts, not state
type OrderEvent =
  | { type: 'OrderPlaced';  payload: { items: Item[];   userId: string } }
  | { type: 'ItemAdded';    payload: { item: Item } }
  | { type: 'OrderPaid';    payload: { amount: number; method: string } }
  | { type: 'OrderShipped'; payload: { trackingId: string } };

// Current state is derived by replaying events
function applyEvent(state: OrderState, event: OrderEvent): OrderState {
  switch (event.type) {
    case 'OrderPlaced':  return { ...state, status: 'pending', items: event.payload.items };
    case 'OrderPaid':    return { ...state, status: 'paid', total: event.payload.amount };
    case 'OrderShipped': return { ...state, status: 'shipped', trackingId: event.payload.trackingId };
    default: return state;
  }
}
const currentState = events.reduce(applyEvent, initialState);`,
    },
  },

  {
    id: 'sys-2',
    category: 'System Design',
    difficulty: 'hard',
    type: 'experience',
    question: 'What is consistent hashing and why is it used in distributed caches and load balancers?',
    answer:
      'In a naive modulo-based distribution (`key % N`), adding or removing a node re-maps nearly every key to a different node — causing a cache miss storm or requiring mass data migration.\n\n**Consistent hashing** maps both nodes and keys onto a ring of hash values (0 to 2³²-1). Each key is assigned to the first node clockwise from its hash position.\n\n**Adding/removing a node** only affects the keys in that node\'s segment — typically `1/N` of all keys.\n\n**Virtual nodes (vnodes)**: each physical node gets many positions on the ring (e.g., 150 virtual nodes). This balances load even with heterogeneous node capacities and ensures even distribution when the total node count is small.\n\n**Used by**: Redis Cluster, Cassandra, DynamoDB, AWS ElastiCache, Nginx upstream hashing.',
  },

  {
    id: 'sys-3',
    category: 'System Design',
    difficulty: 'hard',
    type: 'experience',
    question: 'What is the Strangler Fig pattern? When and how do you apply it to migrate a monolith to microservices?',
    answer:
      'The Strangler Fig pattern (Martin Fowler) incrementally replaces a legacy system by routing traffic to new services while keeping the old system alive, gradually "strangling" it until it can be decommissioned.\n\n**Steps**:\n1. Place a **facade / API gateway** in front of the monolith — all traffic passes through it\n2. Identify a bounded context to extract (start with low-coupling, high-value, or problematic areas)\n3. Build the new service independently\n4. Redirect traffic for that context from the gateway to the new service\n5. Remove the corresponding code from the monolith\n6. Repeat until the monolith is gone\n\n**Key risks**:\n- Data ownership: shared DB between old and new must be resolved (extract table → dual-write → cut over)\n- Distributed tracing across old + new system\n- The "strangling" can stall if the monolith is deeply coupled',
  },

  {
    id: 'sys-4',
    category: 'System Design',
    difficulty: 'hard',
    type: 'experience',
    question: 'How do you design a distributed rate limiter that works across 50 API server instances?',
    answer:
      '**Challenge**: each server only sees a fraction of requests, so local in-memory counters under-count.\n\n**Solution 1 — Centralised Redis**: use Redis `INCR` + `EXPIRE` (or a Lua script for atomicity). All nodes share one counter. Trade-off: Redis becomes a bottleneck and single point of failure. Mitigate with Redis Sentinel / Cluster.\n\n**Solution 2 — Redis with sliding window**: store request timestamps in a sorted set per key. Atomic Lua: remove old entries, count remaining, add new entry if under limit.\n\n**Solution 3 — Token bucket in Redis**: store token count and last refill time. Lua script refills based on elapsed time and checks available tokens.\n\n**Solution 4 — Local + global** (two-tier): each node maintains a local budget (`global_limit / N`). Periodically sync with a central Redis counter. Trades precision for throughput.\n\n**Production**: libraries like `redis-cell` (Redis module) implement token bucket natively with a single `CL.THROTTLE` command.',
    code: {
      language: 'typescript',
      snippet: `// Redis sliding window (atomic Lua)
const LIMIT = 1000, WINDOW = 60_000; // 1000 req/min

async function checkLimit(userId: string): Promise<{ allowed: boolean; remaining: number }> {
  const key = \`rl:\${userId}\`;
  const now = Date.now();

  const [count] = await redis.eval(\`
    local key = KEYS[1]
    local now, window, limit = tonumber(ARGV[1]), tonumber(ARGV[2]), tonumber(ARGV[3])
    redis.call('ZREMRANGEBYSCORE', key, '-inf', now - window)
    local c = redis.call('ZCARD', key)
    if c < limit then
      redis.call('ZADD', key, now, now .. math.random())
      redis.call('PEXPIRE', key, window)
    end
    return c
  \`, 1, key, now, WINDOW, LIMIT) as [number];

  return { allowed: count < LIMIT, remaining: Math.max(0, LIMIT - count - 1) };
}`,
    },
  },

  // ─── System Design (Easy) ────────────────────────────────────────────────────

  {
    id: 'sys-e1',
    category: 'System Design',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is the difference between horizontal and vertical scaling?',
    answer:
      "**Vertical scaling (Scale Up)**: make the single server bigger — add more CPU cores, more RAM, faster SSDs.\n- **Pro**: simple — no application code changes needed; no distributed system complexity\n- **Con**: there is a hard ceiling to how big one machine can get; it becomes extremely expensive at the high end; a single machine is a single point of failure\n\n**Horizontal scaling (Scale Out)**: add more machines, all running the same service, behind a load balancer.\n- **Pro**: theoretically unlimited scale — just keep adding machines; no single point of failure\n- **Con**: requires **stateless application design** — you cannot store sessions or user state in-process because the next request may hit a different server. State must live in a shared store (Redis, database).\n\n**Analogy**: vertical scaling is making one chef cook faster. Horizontal scaling is hiring more chefs.\n\n**Practical rule**: vertically scale first — it's simpler and often sufficient. Move to horizontal scaling when a single machine can no longer handle peak load, or when you need fault tolerance (multiple instances means one can fail without downtime).\n\n**Most common gotcha**: an application that stores data in-process (e.g. in a `Map` variable) will behave incorrectly when horizontally scaled — two users hitting different servers will see different state.",
  },

  {
    id: 'sys-e2',
    category: 'System Design',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is a load balancer and what algorithms does it use to distribute traffic?',
    answer:
      '**Load balancer**: sits in front of multiple backend servers and distributes requests to prevent any single server from being overwhelmed.\n\n**Benefits**: high availability, horizontal scalability, zero-downtime deployments (drain a server, deploy, re-add).\n\n**Algorithms**:\n- **Round-robin**: requests cycle sequentially. Simple, good when all servers have equal capacity.\n- **Least connections**: route to the server with fewest active connections. Better for long-lived connections.\n- **IP hash**: `hash(client_IP) % N` — same client always hits the same server (sticky sessions). Breaks when servers are added/removed.\n- **Weighted round-robin**: higher-capacity servers get more requests.\n\n**Types**:\n- **L4 (Transport)**: routes by TCP/UDP — Nginx, HAProxy, AWS NLB\n- **L7 (Application)**: routes by HTTP path, headers, cookies — AWS ALB, Nginx, Traefik',
  },

  // ─── System Design (Medium) ──────────────────────────────────────────────────

  {
    id: 'sys-e3',
    category: 'System Design',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is a database and what is a cache? How are they different?',
    answer:
      "**Database**: a **durable, persistent** store for your application's source-of-truth data. Designed for reliable storage, complex queries, transactions, and consistency.\n- Examples: PostgreSQL, MySQL, MongoDB\n- Characteristics: persists to disk, survives restarts, supports queries and joins, enforces constraints\n\n**Cache**: a **fast, temporary** store for data you want to serve quickly without going to the database every time. Designed for speed.\n- Examples: Redis, Memcached, in-process `Map`\n- Characteristics: stored in memory (much faster), data can be lost, no complex queries, simple key-value lookups\n\n**Key differences**:\n| | Database | Cache |\n|---|---|---|\n| Storage | Disk | RAM |\n| Speed | Milliseconds | Microseconds |\n| Durability | Persistent | Volatile (usually) |\n| Data size | Unlimited | Limited by RAM |\n| Purpose | Source of truth | Speed layer |\n\n**How they work together**: the cache sits in front of the database. Hot data is served from the cache; cache misses fall through to the database.",
  },

  {
    id: 'sys-e4',
    category: 'System Design',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is DNS and how does it work?',
    answer:
      "**DNS (Domain Name System)** is the internet's phonebook — it translates human-readable domain names (e.g. `api.example.com`) into IP addresses (e.g. `93.184.216.34`) that computers use to connect.\n\n**How a DNS lookup works** (simplified):\n1. Browser checks its **local cache** and the OS cache\n2. If not found, queries the **Recursive Resolver** (usually your ISP or 8.8.8.8)\n3. Resolver asks the **Root DNS Server** (knows who manages `.com`)\n4. Resolver asks the **TLD Name Server** (knows who manages `example.com`)\n5. Resolver asks the **Authoritative Name Server** for `example.com` → gets the IP\n6. Resolver returns the IP to your browser and caches it for the TTL duration\n\n**Key DNS record types**:\n- `A` — maps a domain to an IPv4 address\n- `AAAA` — maps to an IPv6 address\n- `CNAME` — alias from one domain to another (`api.example.com` → `api.heroku.com`)\n- `MX` — mail server\n- `TXT` — arbitrary text (used for domain verification, SPF, DKIM)\n\n**TTL (Time to Live)**: how long the DNS response is cached. Low TTL = changes propagate faster but more DNS traffic.",
  },

  {
    id: 'sys-e5',
    category: 'System Design',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is latency vs throughput?',
    answer:
      "**Latency**: the **time it takes** to complete a single operation — the delay from request sent to response received. Measured in milliseconds.\n- Example: a database query takes 5 ms; a CDN serves an asset in 20 ms\n- Also called **response time** from the client's perspective\n\n**Throughput**: the **number of operations** a system can handle per unit of time. Measured in requests per second (RPS), queries per second (QPS), or MB/s.\n- Example: a server handles 5,000 RPS; a pipeline processes 10,000 messages/second\n\n**The relationship**: they are related but not the same.\n- A system can have low latency but low throughput (handles one request very fast but only one at a time)\n- A system can have high throughput but high latency (handles 10,000 RPS but each takes 500 ms)\n\n**In system design**:\n- Latency matters for user experience (perceived speed)\n- Throughput matters for capacity planning (how many users can we serve?)\n- Optimising one can hurt the other — batching increases throughput but increases latency per item",
  },

  {
    id: 'sys-m3',
    category: 'System Design',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is a CDN (Content Delivery Network) and how does it work?',
    answer:
      "A **CDN** is a globally distributed network of **edge servers (Points of Presence, PoPs)** that cache and serve content from locations close to end users.\n\n**How it works**:\n1. Your origin server is in, say, Sydney\n2. A user in London requests `https://cdn.example.com/image.png`\n3. DNS resolves to the nearest CDN edge server (e.g. in Frankfurt)\n4. If the edge has the file cached — it serves it directly (cache hit, ~10 ms)\n5. If not — the edge fetches from your origin server, caches it, then serves it (cache miss, ~200 ms, but only once)\n\n**Benefits**:\n- **Lower latency** — content served from ~50 ms away instead of ~200 ms from origin\n- **Reduced origin load** — 80–95% of static requests served by the edge, never reaching your servers\n- **DDoS protection** — CDN absorbs attack traffic before it reaches origin\n- **Automatic HTTPS** — CDN handles TLS certificates\n\n**What to cache on a CDN**: static assets (JS, CSS, images), API responses with public data, versioned files (cache forever with content-hash URLs).\n\n**What NOT to cache**: personalised responses, authenticated API endpoints, frequently changing data without versioning.",
  },

  {
    id: 'sys-m4',
    category: 'System Design',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is the difference between SQL and NoSQL in terms of scalability?',
    answer:
      "**SQL (relational) databases** scale primarily **vertically** (bigger machine) and **horizontally via read replicas**.\n- Horizontal write scaling (sharding) is possible but complex — the DB schema and query patterns must be designed around the shard key\n- Strong consistency and ACID transactions make multi-node coordination expensive\n- PostgreSQL, MySQL work well up to tens of thousands of RPS on a single powerful machine\n\n**NoSQL databases** are typically designed for **horizontal scaling from the ground up**:\n- Data is partitioned across nodes by a partition/shard key automatically\n- No JOINs — data is denormalized or embedded, avoiding cross-node operations\n- Trade strong consistency for availability and partition tolerance (AP in CAP theorem)\n\n**Examples**:\n- DynamoDB — automatic horizontal scaling, single-digit ms at any scale, but you design around access patterns\n- Cassandra — linear write scalability, eventual consistency\n- MongoDB — flexible documents, but requires careful sharding design at scale\n\n**Rule of thumb**: SQL is simpler and covers most use cases up to very large scale. Choose NoSQL when you have a specific access pattern that maps naturally to a key-value or document model, or when you need proven horizontal write scale.",
  },

  {
    id: 'sys-m1',
    category: 'System Design',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is CAP theorem? How does it guide database selection?',
    answer:
      "**The core insight**: in a distributed system running across multiple machines, you cannot avoid network failures. When a network partition splits your cluster, you are forced to choose between two options — refuse requests until the partition heals (consistent but unavailable) or serve requests with potentially stale data (available but inconsistent).\n\n**CAP theorem** formalises this: a distributed system can guarantee at most two of three properties simultaneously:\n\n- **Consistency (C)** — every read returns the most recent write, or an error. All nodes see the same data at the same time.\n- **Availability (A)** — every request gets a non-error response, but it may not be the latest data.\n- **Partition tolerance (P)** — the system keeps operating even when some nodes cannot communicate.\n\n**The practical rule**: network partitions are unavoidable in real distributed systems, so **P is not optional**. The real choice is **CP vs AP**:\n\n| | CP systems | AP systems |\n|---|---|---|\n| Examples | PostgreSQL (sync replication), ZooKeeper, etcd | Cassandra, DynamoDB, CouchDB |\n| During partition | Reject requests to stay consistent | Serve possibly stale data to stay available |\n| Use when | Accuracy is critical (banking, inventory) | Availability is critical (social feeds, DNS) |\n\n**PACELC** extends CAP: even when there is no partition, there is still a trade-off between **latency** and **consistency** — replication takes time.",
  },

  {
    id: 'sys-m2',
    category: 'System Design',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is a message queue? When would you use one instead of direct HTTP calls?',
    answer:
      "A **message queue** (RabbitMQ, SQS, Kafka) is a durable buffer between a producer and a consumer that decouples the two.\n\n**Benefits over direct HTTP**:\n- **Temporal decoupling**: producer and consumer do not need to be running simultaneously\n- **Backpressure handling**: slow consumers cause messages to queue up instead of timeouts\n- **Retry + dead-letter queues**: failed messages are retried automatically\n- **Fan-out**: one message can be consumed by multiple independent services\n- **Traffic smoothing**: bursts are absorbed and processed at the consumer's pace\n\n**Use cases**: sending emails, processing images/videos, charging payments async, propagating domain events.\n\n**Trade-offs**: eventual consistency, more operational overhead, harder to debug end-to-end.",
    code: {
      language: 'typescript',
      snippet: `// Producer: returns immediately, enqueues the work
app.post('/orders', async (req, res) => {
  const order = await db.createOrder(req.body);
  await queue.send('order.placed', { orderId: order.id });
  res.status(201).json({ orderId: order.id });
  // Response sent BEFORE email or inventory update
});

// Consumer: separate process, processes at its own pace
queue.consume('order.placed', async (msg) => {
  await emailService.sendConfirmation(msg.orderId);
  await inventoryService.reserve(msg.orderId);
  await msg.ack();
});`,
    },
  },

  {
    id: 'sys-5',
    category: 'System Design',
    difficulty: 'hard',
    type: 'experience',
    question: 'Design a URL shortener (like bit.ly). Walk through your architecture and key decisions.',
    answer:
      "This is the classic system design interview question. It's deceptively simple but forces you to discuss encoding, scale, caching, and trade-offs.\n\n**Core requirements**: user submits a long URL → get back a short URL (e.g. `sho.rt/aB3x9z`). Visiting the short URL redirects to the original.\n\n**Write path**:\n1. User POSTs a long URL\n2. Generate a unique short code (6–8 characters)\n3. Store `{ shortCode → longUrl, createdAt, userId, clickCount }` in DB\n4. Return the short URL\n\n**Short code generation strategies**:\n- **Counter + Base62**: auto-increment an integer ID, encode in base62 (a-z, A-Z, 0-9). ID 125 → `cb`. Simple, no collisions, predictable length. Risk: sequential codes are guessable.\n- **Hash**: MD5/SHA256 of the long URL, take first 7 characters. Risk: collisions — check DB and regenerate if taken.\n- **Random**: generate random 7-char base62 string, check uniqueness. Simple but requires a uniqueness check on every write.\n\n**Read path (the critical hot path)**:\n1. Extract short code from URL\n2. Look up in **Redis cache** first\n3. On cache miss: query DB, store in cache with TTL\n4. Return HTTP **301 vs 302** redirect:\n   - `301 Permanent` — browser caches forever, never hits your server again. Reduces load but you lose click analytics.\n   - `302 Temporary` — browser always re-requests. Enables analytics and letting you change the destination. Preferred for URL shorteners.\n\n**Schema** (PostgreSQL):\n```sql\nCREATE TABLE urls (\n  id         BIGSERIAL PRIMARY KEY,\n  short_code VARCHAR(10) UNIQUE NOT NULL,\n  long_url   TEXT NOT NULL,\n  user_id    UUID,\n  expires_at TIMESTAMPTZ,\n  created_at TIMESTAMPTZ DEFAULT NOW()\n);\nCREATE INDEX idx_short_code ON urls(short_code);\n```\n\n**Scale considerations**:\n- Read:write ratio is ~100:1 — optimize the read path\n- Cache top URLs in Redis: ~20% of URLs get 80% of traffic\n- For billions of URLs: shard by short code prefix or use a distributed KV store (DynamoDB, Cassandra)\n- Rate limit: prevent abuse with per-IP or per-user limits\n\n**Analytics** (if required): don't log synchronously on redirect — emit to a message queue (Kafka) and process asynchronously.",
    code: {
      language: 'typescript',
      snippet: `// POST /shorten — write path
app.post('/shorten', async (req, res) => {
  const { longUrl } = req.body;

  // Generate short code from auto-increment ID (base62)
  const result = await db.query(
    'INSERT INTO urls (long_url) VALUES ($1) RETURNING id',
    [longUrl]
  );
  const shortCode = toBase62(result.rows[0].id); // e.g. id 10000 → "aBc1"
  await db.query('UPDATE urls SET short_code=$1 WHERE id=$2',
    [shortCode, result.rows[0].id]);

  res.json({ shortUrl: \`https://sho.rt/\${shortCode}\` });
});

// GET /:code — read path (hot path, cache-first)
app.get('/:code', async (req, res) => {
  const { code } = req.params;

  // 1. Redis cache
  const cached = await redis.get(\`url:\${code}\`);
  if (cached) return res.redirect(302, cached);

  // 2. DB lookup
  const row = await db.query(
    'SELECT long_url FROM urls WHERE short_code=$1', [code]
  );
  if (!row.rows[0]) return res.status(404).send('Not found');

  const longUrl = row.rows[0].long_url;

  // 3. Populate cache with TTL
  await redis.setex(\`url:\${code}\`, 3600, longUrl);

  // 4. 302 = browser won't cache, lets us track analytics
  res.redirect(302, longUrl);
});

// Base62 encoding: maps integers to [a-z, A-Z, 0-9]
function toBase62(n: number): string {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  while (n > 0) { result = chars[n % 62] + result; n = Math.floor(n / 62); }
  return result || '0';
}`,
    },
  },

  // ─── ERD & System Architecture ───────────────────────────────────────────────

  {
    id: 'sys-erd1',
    category: 'System Design',
    difficulty: 'medium',
    type: 'basics',
    question: 'How do you design an ERD (Entity Relationship Diagram)? What are the key elements and relationship types?',
    answer:
      '**ERD (Entity Relationship Diagram)** visualizes the data model — entities, their attributes, and how they relate. It is the blueprint before writing any migrations or ORM models.\n\n**Key elements:**\n- **Entity** — a real-world object that has data (Users, Orders, Products). Maps to a DB table.\n- **Attribute** — a property of an entity (name, email, price). Maps to a column.\n- **Primary Key (PK)** — uniquely identifies each row.\n- **Foreign Key (FK)** — references the PK of another table to establish a relationship.\n\n**Cardinality (relationship types):**\n\n| Type | Example | Implementation |\n|---|---|---|\n| One-to-One (1:1) | User ↔ Profile | FK in one table |\n| One-to-Many (1:N) | User → Orders | FK on the "many" side |\n| Many-to-Many (M:N) | Students ↔ Courses | Junction/pivot table |\n\n**ERD design process:**\n1. Identify entities (nouns in the requirements)\n2. Define attributes and PKs for each entity\n3. Identify relationships and their cardinality\n4. Add FKs and junction tables for M:N\n5. Normalize to remove redundancy (at least 3NF)\n6. Add indexes on FK columns and frequent query fields\n\n**Tools:** dbdiagram.io, Lucidchart, draw.io, pgAdmin ERD tool',
    code: {
      language: 'sql',
      snippet: `-- E-commerce ERD as SQL schema

CREATE TABLE users (
  id         SERIAL PRIMARY KEY,
  email      VARCHAR(255) UNIQUE NOT NULL,
  name       VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE categories (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

-- Products: many products → one category (1:N)
CREATE TABLE products (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  price       NUMERIC(10,2) NOT NULL,
  stock       INT NOT NULL DEFAULT 0,
  category_id INT REFERENCES categories(id)
);

-- Orders: one user → many orders (1:N)
CREATE TABLE orders (
  id         SERIAL PRIMARY KEY,
  user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status     VARCHAR(20) DEFAULT 'pending',
  total      NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order_Items: orders ↔ products (M:N junction table)
CREATE TABLE order_items (
  order_id   INT NOT NULL REFERENCES orders(id)   ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity   INT NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,   -- price snapshot at purchase time
  PRIMARY KEY (order_id, product_id)
);

-- Always index FK columns used in JOINs
CREATE INDEX idx_orders_user_id    ON orders(user_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);`,
    },
  },

  {
    id: 'sys-arch1',
    category: 'System Design',
    difficulty: 'medium',
    type: 'basics',
    question: 'How do you document and communicate system architecture? What diagrams do you produce for an interview?',
    answer:
      '**The C4 Model** (Context → Container → Component → Code) is the most practical framework for documenting architecture at different levels of zoom.\n\n**The 4 levels:**\n1. **Context** — system as a black box, who uses it, what external systems it talks to\n2. **Container** — what runs inside: API server, web app, queue, DB, cache. Shows tech choices and protocols.\n3. **Component** — inside a single container: modules, services, repositories\n4. **Code** — class/sequence diagrams. Usually skipped in interviews.\n\n**For a senior interview, you should produce:**\n- A **container diagram** — the most common whiteboard ask\n- A **data flow diagram** — how data moves from request → response, including async paths\n- An **ERD** — for any question involving persistent data\n\n**Whiteboard interview framework (5 steps):**\n1. Clarify requirements & scale (DAU, requests/sec, data size, SLAs)\n2. Define system boundaries (in scope / out of scope)\n3. Draw container diagram top-down: Client → CDN → API → DB / Cache / Queue\n4. Call out trade-offs at each decision point\n5. Address the bottleneck — where will this break at 10× traffic?',
    code: {
      language: 'typescript',
      snippet: `/*
  Container Diagram — E-commerce Platform (interview whiteboard)

  [Browser / Mobile]
        │ HTTPS
        ▼
  [CDN / Vercel Edge]         ← static assets, cached SSR pages
        │
        ▼
  [Next.js App Server]        ← SSR, Server Actions, BFF
    │               │
    │ REST/JSON      │ Internal call
    ▼               ▼
  [NestJS API]                ← auth, business logic, validation
    │        │        │
    ▼        ▼        ▼
  [PostgreSQL] [MongoDB]  [Redis]
  (orders,     (catalog,  (sessions,
   users,       CMS)       cache,
   payments)               rate limit)
                    │
              [BullMQ Queue]  ← async job processing
                    │
              [Worker Service]
                    │
              [AWS SES / S3]  ← email + file storage

  Key data flows:
  1. Checkout: Browser → Next.js → NestJS → PostgreSQL (transaction)
              → BullMQ (enqueue confirmation email) → Worker → SES

  2. Product list: Browser → CDN (cache hit) → serve in <50ms
                  (cache miss) → Next.js ISR → MongoDB → rebuild cache

  Trade-offs to mention:
  - MongoDB for catalog: flexible schema, easy to add product attributes
  - PostgreSQL for orders: ACID, strong consistency for financial data
  - BullMQ over direct email: decoupled, retryable, no timeout pressure
*/`,
    },
  },
];
