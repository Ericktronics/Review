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
    case 'OrderShipped': return { ...state, status: 'shipped', trackingId: event.payload.payload.trackingId };
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
      '**Vertical scaling (Scale Up)**: add more resources to a single machine — more CPU, more RAM, faster disk.\n- Simple — no application changes needed\n- Hard ceiling — there is a limit to how big one machine can get\n- Single point of failure\n- Expensive at the high end\n\n**Horizontal scaling (Scale Out)**: add more machines running the same service behind a load balancer.\n- Practically unlimited scale\n- No single point of failure\n- Requires **stateless design** — sessions/state must live in a shared store (Redis), not in-process\n- More operational complexity (service discovery, distributed tracing)\n\n**In practice**: vertically scale first (simpler), then horizontally scale once a single machine is no longer enough.',
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
      'CAP theorem states that a **distributed system** can guarantee at most two of three properties simultaneously:\n\n- **Consistency (C)**: every read returns the most recent write, or an error. All nodes see the same data.\n- **Availability (A)**: every request gets a (non-error) response — but it may not be the latest data.\n- **Partition tolerance (P)**: the system continues to operate even when network partitions occur.\n\n**Network partitions are unavoidable** in distributed systems, so the real choice is **CP vs AP**:\n- **CP** (PostgreSQL with sync replication, ZooKeeper, etcd): during a partition, reject requests rather than return stale data\n- **AP** (Cassandra, DynamoDB, CouchDB): stay available, return potentially stale data\n\n**PACELC** extends CAP: even without partitions, there is always a latency vs consistency trade-off.',
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
];
