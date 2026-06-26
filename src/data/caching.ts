import type { Flashcard } from '../types';

export const cachingCards: Flashcard[] = [

  // ─── Caching (Senior) ────────────────────────────────────────────────────────

  {
    id: 'cache-1',
    category: 'Caching',
    difficulty: 'hard',
    type: 'experience',
    question: 'What is a cache stampede (thundering herd) and how do you prevent it?',
    answer:
      'A cache stampede occurs when a popular key expires and hundreds of concurrent requests simultaneously find a cache miss, all race to recompute the value, all hit the database at once, overloading it.\n\n**Prevention strategies**:\n- **Mutex / lock**: only one request computes; others wait. Introduces latency for waiting requests\n- **Probabilistic early expiration** (XFetch): stochastically refresh the cache before it expires based on how expensive the recomputation is and time remaining\n- **Background refresh**: always serve the cached (possibly stale) value and trigger an async refresh when the TTL falls below a threshold\n- **Jittered TTL**: add random noise to TTL so many keys don\'t expire simultaneously\n- **Stampede-safe wrapper**: check for a "computing" flag in the cache; if set, return stale value or short-poll',
    code: {
      language: 'typescript',
      snippet: `// Mutex-based stampede prevention with stale fallback
const computingKeys = new Set<string>();

async function getWithStampedePrevention<T>(
  key: string,
  compute: () => Promise<T>,
  ttl: number,
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  if (computingKeys.has(key)) {
    // Another request is already computing – short-poll for the result
    await new Promise((r) => setTimeout(r, 50));
    return getWithStampedePrevention(key, compute, ttl);
  }

  computingKeys.add(key);
  try {
    const value = await compute();
    const jitter = Math.floor(Math.random() * 0.1 * ttl); // ±10% jitter
    await redis.setex(key, ttl + jitter, JSON.stringify(value));
    return value;
  } finally {
    computingKeys.delete(key);
  }
}`,
    },
  },

  {
    id: 'cache-2',
    category: 'Caching',
    difficulty: 'hard',
    type: 'experience',
    question: 'What are the right Redis data structures for common backend use cases?',
    answer:
      '- **String + TTL** — session tokens, feature flags, simple key-value cache\n- **Hash** — store an object\'s fields individually (avoids serialise/deserialise the whole object to update one field)\n- **Sorted Set (ZSet)** — leaderboards (`ZRANGEBYSCORE`), sliding-window rate limiting (timestamps as scores), delayed job queues (future timestamp as score)\n- **List** — task queues (`LPUSH` / `BRPOP`), activity feeds (capped with `LTRIM`)\n- **Set** — unique visitors, tagging, union/intersection operations\n- **Pub/Sub** — lightweight real-time fan-out (not durable; use Streams for durability)\n- **Stream** — durable event log with consumer groups; replacement for Kafka for moderate throughput\n- **Bitmap / HyperLogLog** — daily active users (bitmap per day), unique count approximation (HyperLogLog, ~0.81% error, 12 KB regardless of cardinality)',
    code: {
      language: 'typescript',
      snippet: `// Hash: update one user field without round-tripping the whole object
await redis.hset(\`user:\${id}\`, 'lastSeen', Date.now());
await redis.hset(\`user:\${id}\`, 'loginCount', await redis.hincrby(\`user:\${id}\`, 'loginCount', 1));

// Sorted Set: leaderboard
await redis.zadd('leaderboard', { score: points, member: userId });
const top10 = await redis.zrevrange('leaderboard', 0, 9, 'WITHSCORES');

// Sorted Set: delayed job queue (score = run-at timestamp)
await redis.zadd('jobs:scheduled', { score: Date.now() + 5000, member: JSON.stringify(job) });
// Worker: poll for jobs due now
const due = await redis.zrangebyscore('jobs:scheduled', '-inf', Date.now(), 'LIMIT', 0, 10);`,
    },
  },

  {
    id: 'cache-3',
    category: 'Caching',
    difficulty: 'hard',
    type: 'experience',
    question: 'What are the trade-offs between CDN caching, in-process (L1) caching, and Redis (L2) caching? When do you use each layer?',
    answer:
      '**CDN (edge cache)**: latency ~1–10 ms globally; no server hit; best for public, static, or slowly-changing content. Invalidation is slow and may require purge APIs.\n\n**In-process / L1 cache** (e.g. `lru-cache`): sub-millisecond, no network hop; lost on restart; inconsistent across multiple instances — usable only for truly immutable or per-process data (e.g. compiled templates, feature flag snapshots).\n\n**Redis / L2 cache**: shared across all instances, sub-millisecond over LAN; network hop; operational complexity; data survives restarts (with persistence).\n\n**Typical layered strategy**:\n1. CDN → cache public API responses for 60 s\n2. In-process LRU → hold 500 most-recently-used records for 30 s (reduces Redis calls by ~80% under hot traffic)\n3. Redis → authoritative shared cache with 5-min TTL\n4. Database → always the source of truth',
  },

  // ─── Caching (Easy) ──────────────────────────────────────────────────────────

  {
    id: 'cache-e1',
    category: 'Caching',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is caching and why is it used?',
    answer:
      "**Caching stores the result of an expensive operation so future requests can be served from fast storage instead of repeating the work.**\n\n**Analogy**: a caching is like keeping a sticky note on your desk with your most-used phone numbers. Instead of looking them up in a contact book every time (slow), you read the sticky note (instant).\n\n**Why use it**:\n- **Reduce latency** — an in-memory/Redis response takes microseconds; a database query takes 1–50 ms. For high-traffic endpoints, this difference is significant.\n- **Reduce database load** — a well-tuned cache can serve 80–95% of read requests without touching the DB, protecting it during traffic spikes.\n- **Reduce cost** — fewer DB queries = lower infrastructure cost.\n\n**What to cache**: data that is **read frequently** and **changes infrequently** — user profiles, product catalogue, configuration values, computed aggregates, API responses.\n\n**What NOT to cache**:\n- Highly personalised data (no reuse between users)\n- Financial balances or inventory counts that must always be accurate\n- Data that changes on every request\n\n**Cache hierarchy** (fastest to slowest): CPU L1/L2/L3 → in-process memory (JavaScript `Map`) → distributed cache (Redis) → database.",
  },

  {
    id: 'cache-e2',
    category: 'Caching',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is a cache hit and a cache miss? What is the hit rate?',
    answer:
      '**Cache hit**: the requested data is found in the cache — served immediately without touching the database.\n\n**Cache miss**: the data is NOT in the cache. The system must:\n1. Fetch from the original source (DB, API)\n2. Store it in the cache for future requests\n3. Return the data to the caller\n\nA cache miss costs more than not caching at all — there is the cache lookup overhead *plus* the original fetch.\n\n**Hit rate**: `cache hits / total requests`. A healthy hit rate is >80–90%. Low hit rates indicate:\n- TTL is too short\n- Keys are too granular (unique per request)\n- Cache capacity is too small (keys evicted before reuse)\n\n**Cache warm-up**: pre-populate the cache on startup to avoid cold-start miss spikes.',
  },

  // ─── Caching (Medium) ────────────────────────────────────────────────────────

  {
    id: 'cache-e3',
    category: 'Caching',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is Redis and what is it commonly used for?',
    answer:
      "**Redis** (Remote Dictionary Server) is an **in-memory data structure store** that can be used as a cache, message broker, and database. It stores data in RAM for extremely fast read/write operations (sub-millisecond).\n\n**Common uses**:\n- **Caching** — store frequently read DB results, rendered HTML, API responses\n- **Sessions** — store server-side user sessions (fast lookup, TTL-based expiry)\n- **Rate limiting** — atomic increment counters per user/IP\n- **Pub/Sub messaging** — broadcast events to multiple subscribers\n- **Queues** — `LPUSH`/`BRPOP` for task queues\n- **Leaderboards** — sorted sets with scores for rankings\n- **Distributed locks** — prevent race conditions across multiple server instances\n\n**Data structures**: Strings, Hashes, Lists, Sets, Sorted Sets, Bitmaps, HyperLogLog, Streams.\n\n**Persistence options**: Redis is in-memory but can persist to disk (RDB snapshots or AOF append-only log) for durability — though it's typically treated as a cache (data can be lost and rebuilt from the DB).",
    code: {
      language: 'typescript',
      snippet: `import { createClient } from 'redis';
const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

// Cache-aside pattern
async function getUser(id: string) {
  const cached = await redis.get(\`user:\${id}\`);
  if (cached) return JSON.parse(cached);

  const user = await db.findUser(id);
  await redis.setEx(\`user:\${id}\`, 300, JSON.stringify(user)); // TTL: 5 min
  return user;
}

// Session storage
await redis.setEx(\`session:\${sessionId}\`, 3600, JSON.stringify({ userId }));

// Rate limiting counter
const count = await redis.incr(\`rate:\${userId}\`);
if (count === 1) await redis.expire(\`rate:\${userId}\`, 60); // 1 min window
if (count > 100) return res.status(429).send('Too many requests');`,
    },
  },

  {
    id: 'cache-e4',
    category: 'Caching',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is a TTL (Time-To-Live) in caching?',
    answer:
      "**TTL (Time-To-Live)** is the duration after which a cached item **automatically expires and is deleted**. It prevents stale data from being served indefinitely.\n\n**Why TTL matters**:\n- **Freshness** — ensures the cache doesn't serve outdated data forever; forces a refresh from the source\n- **Memory management** — expired keys are automatically removed, freeing memory\n- **Security** — session tokens and API responses with sensitive data expire automatically\n\n**Choosing the right TTL**:\n- Static data (product images, CSS files) → long TTL (hours/days) or no expiry\n- User profile → medium TTL (5–30 minutes)\n- Real-time data (stock prices, sports scores) → short TTL (seconds) or no caching\n- Session tokens → match your session timeout (e.g. 24 hours)\n\n**Trade-off**: longer TTL = better performance but more stale data risk. Shorter TTL = fresher data but more DB load.\n\n**TTL jitter**: add random variation to TTLs to prevent many keys expiring simultaneously and causing a cache stampede.",
    code: {
      language: 'typescript',
      snippet: `// Set a key with TTL in Redis
await redis.setEx('user:42', 300, JSON.stringify(user)); // expires in 300 seconds (5 min)

// Check remaining TTL
const ttl = await redis.ttl('user:42'); // returns seconds remaining, -1 if no TTL, -2 if expired

// Update a value and reset the TTL
await redis.setEx('user:42', 300, JSON.stringify(updatedUser));

// TTL jitter: randomise ±10% to avoid stampede
function ttlWithJitter(baseTtl: number): number {
  const jitter = Math.floor(baseTtl * 0.1 * (Math.random() * 2 - 1));
  return baseTtl + jitter;
}

await redis.setEx('product:123', ttlWithJitter(600), JSON.stringify(product));`,
    },
  },

  {
    id: 'cache-e5',
    category: 'Caching',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is the difference between an in-memory cache and a distributed cache?',
    answer:
      "**In-memory cache (local/L1)**: a cache stored in the **process's own memory** (e.g. a JavaScript `Map`, `lru-cache`).\n- Sub-millisecond access — no network hop\n- Lost when the process restarts\n- **Not shared across multiple server instances** — each process has its own copy\n- Suitable for: per-process singletons, compiled templates, feature flag snapshots, data that is identical for all users\n\n**Distributed cache (L2)**: a cache stored in a **separate shared service** (e.g. Redis, Memcached) that all application instances connect to over the network.\n- ~0.5–2 ms access (network hop)\n- Survives process restarts (data still in Redis)\n- **Shared across all instances** — one invalidation affects all servers\n- Suitable for: user sessions, API response cache, rate limiting counters, anything that must be consistent across instances\n\n**Common architecture**: use both layers. In-process LRU holds the last 500 hot items for 30 seconds; on a miss, check Redis; on another miss, query the database.",
  },

  {
    id: 'cache-m3',
    category: 'Caching',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is cache invalidation? Why is it hard?',
    answer:
      "**Cache invalidation** is the process of removing or updating a cached entry when the underlying data changes, so the cache does not serve stale data.\n\n**Why it's hard** (Phil Karlton: *\"There are only two hard things in Computer Science: cache invalidation and naming things\"*):\n\n- **When to invalidate?** — you need to know exactly which cache keys are affected by a DB write. Complex data with many relationships (a user change affects user profiles, order history, dashboard summaries) makes this difficult.\n- **Distributed invalidation** — with many application instances, all their local caches need to be invalidated. Requires a pub/sub mechanism.\n- **Race conditions** — a write invalidates the cache, another request immediately repopulates it with old data before the DB write is committed.\n- **Over-invalidation** — invalidating too broadly causes unnecessary cache misses and DB load.\n- **Under-invalidation** — missing a cache key causes stale reads.\n\n**Strategies**:\n- **TTL-based expiry** — let the cache expire naturally (simple but allows temporary stale reads)\n- **Write-through invalidation** — delete or update the cache key on every write\n- **Event-driven** — publish a domain event on write; a cache invalidation handler removes the affected keys",
    code: {
      language: 'typescript',
      snippet: `// Write-through invalidation: delete cache on DB write
async function updateUser(id: string, data: Partial<User>) {
  await db.user.update({ where: { id }, data });
  await redis.del(\`user:\${id}\`); // invalidate immediately
  // Next read will repopulate the cache from DB
}

// Invalidate multiple related keys
async function updateProduct(id: string, data: Partial<Product>) {
  await db.product.update({ where: { id }, data });
  await redis.del([
    \`product:\${id}\`,
    \`product:list\`,          // invalidate the list view too
    \`category:\${data.categoryId}\`, // and category caches
  ]);
}

// Pattern-based deletion (use carefully — can be slow on large keyspaces)
// Avoid KEYS * in production; use SCAN instead
async function invalidateUserCaches(userId: string) {
  const pattern = \`user:\${userId}:*\`;
  for await (const key of redis.scanIterator({ MATCH: pattern })) {
    await redis.del(key);
  }
}`,
    },
  },

  {
    id: 'cache-m4',
    category: 'Caching',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is memoization and how does it relate to caching?',
    answer:
      "**Memoization** is a specific optimization technique where a function **remembers the result of a previous call** with the same arguments, so it doesn't recompute it on subsequent calls.\n\n**How it relates to caching**: memoization *is* caching, but at the function level. Instead of caching at the HTTP or database layer, you cache the return value of a specific function keyed by its input arguments.\n\n**When to use memoization**:\n- **Pure functions** — same input always produces same output (no side effects)\n- **Expensive computations** — complex calculations, recursive algorithms (Fibonacci)\n- **Repeated calls with the same args** — parsing a config file, computing permissions\n\n**Limitations**:\n- Memory grows with unique inputs — add a max cache size (LRU)\n- Only works for pure functions — functions with side effects or time-dependent results should not be memoized\n- Cache invalidation applies here too — if the underlying data changes, the memoized result is stale\n\n**In Node.js**: manual `Map`-based memoization or libraries like `lodash.memoize`.",
    code: {
      language: 'typescript',
      snippet: `// Simple memoization
function memoize<T>(fn: (...args: unknown[]) => T): (...args: unknown[]) => T {
  const cache = new Map<string, T>();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key)!;
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

// Expensive computation — memoize it
const computePermissions = memoize((userId: string, role: string) => {
  // expensive calculation...
  return { canRead: true, canWrite: role === 'admin' };
});

computePermissions('u1', 'admin'); // computed
computePermissions('u1', 'admin'); // returned from cache instantly

// Fibonacci — classic example of how memoization cuts O(2^n) to O(n)
const fib = memoize((n: number): number => {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
});`,
    },
  },

  {
    id: 'cache-m1',
    category: 'Caching',
    difficulty: 'medium',
    type: 'basics',
    question: 'What are the most common cache eviction policies? When should you choose LRU over LFU?',
    answer:
      '**LRU (Least Recently Used)**: evict the item not accessed for the longest time. Favours recency.\n- Good for temporal locality (recently accessed data will likely be accessed again)\n- Bad for large sequential scans — scans pollute the cache with one-time items\n\n**LFU (Least Frequently Used)**: evict the item with the fewest accesses. Favours popularity.\n- Good for stable hot keys (top articles, product catalogue)\n- Bad for new items — they start with low frequency and get evicted before getting a chance\n\n**TTL (Time-To-Live)**: evict after a fixed time regardless of access pattern.\n- Good for data that becomes stale over time (exchange rates, sessions)\n\n**FIFO**: evict in insertion order. Simple, ignores access patterns.\n\n**Redis default**: `allkeys-lru`. Redis 4+ supports `allkeys-lfu`.\n**In practice**: LRU covers most use cases. Use LFU when you have a well-defined, stable hot set.',
  },

  {
    id: 'cache-m2',
    category: 'Caching',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is the difference between cache-aside, write-through, and write-back caching?',
    answer:
      "**Cache-aside (lazy loading)** — the application manages the cache manually.\n\nRead flow:\n1. Check cache → if found (cache hit), return immediately\n2. If not found (cache miss), fetch from DB, store in cache, return\n\n- **Pro**: only caches data that is actually requested — memory-efficient\n- **Con**: first request after a miss (or after expiry) has extra latency; the cache can serve stale data if the DB is updated by another path\n- **Most common pattern** — used by the majority of production systems\n\n**Write-through** — every write goes to **both the cache and the DB** in the same operation, synchronously.\n- **Pro**: cache is always consistent with the DB — no stale reads\n- **Con**: higher write latency; may cache data that is never read (wasted memory)\n\n**Write-behind (write-back)** — writes go to the cache only; the cache flushes to the DB asynchronously in the background.\n- **Pro**: extremely low write latency (the caller does not wait for the DB)\n- **Con**: risk of data loss if the cache server crashes before flushing; harder to reason about consistency\n\n**Most common gotcha with cache-aside**: forgetting to invalidate the cache after a write. If you update a user in the DB but don't delete `user:42` from Redis, subsequent reads return stale data until the TTL expires.",
    code: {
      language: 'typescript',
      snippet: `// Cache-aside pattern
async function getUser(id: string) {
  const cached = await redis.get(\`user:\${id}\`);
  if (cached) return JSON.parse(cached);       // hit

  const user = await db.query('SELECT * FROM users WHERE id = $1', [id]);
  await redis.setex(\`user:\${id}\`, 300, JSON.stringify(user)); // 5 min TTL
  return user;
}

// Invalidate on write
async function updateUser(id: string, data: Partial<User>) {
  await db.query('UPDATE users SET ... WHERE id = $1', [id]);
  await redis.del(\`user:\${id}\`); // force re-fetch next time
}`,
    },
  },

  {
    id: 'cache-m5',
    category: 'Caching',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is cache warming? When do you need it and how do you implement it?',
    answer:
      '**Cache warming** (pre-warming) is the process of proactively loading data into the cache before it is requested — so the first users after a cold start or deploy don\'t hit the database.\n\n**When you need it:**\n- After a deploy that flushes the cache\n- After a Redis restart or failover\n- For data that is expensive to compute and heavily accessed at startup (e.g. product catalogue, feature flags, config)\n- To avoid the **thundering herd** — hundreds of simultaneous cache misses all hitting the DB at once\n\n**Approaches:**\n1. **Startup script** — warm before the app starts accepting traffic (good for fixed data sets)\n2. **Background job on deploy** — CI/CD triggers a warming worker after deploy\n3. **Single-flight / mutex lock** — first miss triggers the fetch, a distributed lock prevents other instances from also fetching simultaneously\n4. **Stale-while-revalidate** — serve stale data while refreshing in the background; never fully cold\n\n**Trade-off:** warming adds deploy complexity and DB load at startup. Only do it for truly hot, expensive-to-compute data.',
    code: {
      language: 'typescript',
      snippet: `// Approach 1: warm cache before accepting traffic
async function warmCache() {
  const products = await db.query('SELECT * FROM products WHERE active = true');
  await redis.set('products:all', JSON.stringify(products.rows), 'EX', 3600);
  console.log(\`Warmed \${products.rowCount} products\`);
}
warmCache().then(() => app.listen(3000));

// Approach 2: single-flight lock — prevents thundering herd on cache miss
async function getWithLock(key: string, fetcher: () => Promise<any>) {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  // Only one instance fetches — others wait and retry
  const acquired = await redis.set(\`lock:\${key}\`, '1', 'NX', 'EX', 5);
  if (!acquired) {
    await new Promise(r => setTimeout(r, 100));
    return getWithLock(key, fetcher); // retry — should hit cache now
  }

  try {
    const data = await fetcher();
    await redis.set(key, JSON.stringify(data), 'EX', 3600);
    return data;
  } finally {
    await redis.del(\`lock:\${key}\`);
  }
}`,
    },
  },

  {
    id: 'cache-m6',
    category: 'Caching',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is the NX + Lua pattern in Redis caching? How does it prevent cache stampedes?',
    answer:
      '**NX** ("Not eXists") is a Redis `SET` flag that only sets a key if it does not already exist. Returns `OK` on success (lock acquired), `null` if the key was already there (someone else has it).\n\n**Lua scripts** (`EVAL`) execute multiple Redis commands as one atomic operation. Because Redis is single-threaded, a Lua script cannot be interrupted — no other commands run between its steps.\n\n**The problem they solve — cache stampede**: when a hot cache key expires, hundreds of simultaneous requests get a cache miss and all rush to recompute the same expensive value, hammering the DB at once.\n\n**The fix — single-flight lock**:\n1. First request: `SET lock:key "1" NX EX 10` → gets `OK` → computes value → caches it → releases lock\n2. All other requests: same command returns `null` → they wait and retry, or serve stale data\n3. `EX 10` auto-expires the lock in 10 s — prevents deadlock if the computing process crashes\n\n**Why not just `GET` then `SET` separately?** Two requests can race between your `GET` check and `SET` write — both think they won. Lua makes the whole check-and-set indivisible.\n\n**NX is also used for**: distributed rate limiting counters, idempotency key storage, and any "do this exactly once" pattern.',
    code: {
      language: 'typescript',
      snippet: `import Redis from 'ioredis';
const redis = new Redis();

// ── Basic NX lock ───────────────────────────────────────────
async function acquireLock(key: string, ttlSec: number): Promise<boolean> {
  const result = await redis.set(\`lock:\${key}\`, '1', 'NX', 'EX', ttlSec);
  return result === 'OK'; // true = acquired, false = already held
}

// ── Lua script — atomic check + set ────────────────────────
// Returns the cached value if it exists, otherwise sets a lock flag
const LUA_GET_OR_LOCK = \`
  local val = redis.call('GET', KEYS[1])
  if val then return {1, val} end
  local locked = redis.call('SET', KEYS[2], '1', 'NX', 'EX', ARGV[1])
  if locked then return {2, 'LOCKED'} end
  return {3, 'WAIT'}
\`;

// ── Full single-flight cache helper ────────────────────────
async function getWithSingleFlight<T>(
  key: string,
  compute: () => Promise<T>,
  ttlSec = 60,
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);   // 1. fast path — cache hit

  const lockKey = \`lock:\${key}\`;
  const acquired = await redis.set(lockKey, '1', 'NX', 'EX', 10);

  if (acquired === 'OK') {
    // 2. We hold the lock — compute and cache
    try {
      const value = await compute();
      await redis.setex(key, ttlSec, JSON.stringify(value));
      return value;
    } finally {
      await redis.del(lockKey);            // always release lock
    }
  }

  // 3. Another process is computing — poll for the result
  for (let i = 0; i < 10; i++) {
    await new Promise(r => setTimeout(r, 200));
    const result = await redis.get(key);
    if (result) return JSON.parse(result);
  }

  return compute();                        // fallback if lock holder crashed
}

// Usage — only one DB call fires even under 500 concurrent requests
const user = await getWithSingleFlight(
  \`user:\${id}\`,
  () => db.user.findUniqueOrThrow({ where: { id } }),
  300,
);`,
    },
  },
];
