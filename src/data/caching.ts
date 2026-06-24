import type { Flashcard } from '../types';

export const cachingCards: Flashcard[] = [

  // ─── Caching (Senior) ────────────────────────────────────────────────────────

  {
    id: 'cache-1',
    category: 'Caching',
    difficulty: 'hard',
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
    question: 'What are the trade-offs between CDN caching, in-process (L1) caching, and Redis (L2) caching? When do you use each layer?',
    answer:
      '**CDN (edge cache)**: latency ~1–10 ms globally; no server hit; best for public, static, or slowly-changing content. Invalidation is slow and may require purge APIs.\n\n**In-process / L1 cache** (e.g. `lru-cache`): sub-millisecond, no network hop; lost on restart; inconsistent across multiple instances — usable only for truly immutable or per-process data (e.g. compiled templates, feature flag snapshots).\n\n**Redis / L2 cache**: shared across all instances, sub-millisecond over LAN; network hop; operational complexity; data survives restarts (with persistence).\n\n**Typical layered strategy**:\n1. CDN → cache public API responses for 60 s\n2. In-process LRU → hold 500 most-recently-used records for 30 s (reduces Redis calls by ~80% under hot traffic)\n3. Redis → authoritative shared cache with 5-min TTL\n4. Database → always the source of truth',
  },

  // ─── Caching (Easy) ──────────────────────────────────────────────────────────

  {
    id: 'cache-e1',
    category: 'Caching',
    difficulty: 'easy',
    question: 'What is caching and why is it used?',
    answer:
      'Caching is storing the result of an expensive computation or data fetch in fast-access storage so future requests can be served without repeating the work.\n\n**Why use it**:\n- **Reduce latency**: memory / Redis response is microseconds vs database query milliseconds\n- **Reduce database load**: serve 80%+ of read requests from cache, protecting the DB from peak traffic\n- **Reduce cost**: fewer compute cycles and DB queries per request\n\n**What to cache**: frequently read, infrequently updated data — user profiles, product catalogue, configuration values, computed aggregates.\n\n**What NOT to cache**: highly personalised data (no reuse), financial balances that must always be accurate, or data that changes on every request.\n\n**Cache hierarchy**: CPU L1/L2/L3 → in-process memory → distributed cache (Redis) → database.',
  },

  {
    id: 'cache-e2',
    category: 'Caching',
    difficulty: 'easy',
    question: 'What is a cache hit and a cache miss? What is the hit rate?',
    answer:
      '**Cache hit**: the requested data is found in the cache — served immediately without touching the database.\n\n**Cache miss**: the data is NOT in the cache. The system must:\n1. Fetch from the original source (DB, API)\n2. Store it in the cache for future requests\n3. Return the data to the caller\n\nA cache miss costs more than not caching at all — there is the cache lookup overhead *plus* the original fetch.\n\n**Hit rate**: `cache hits / total requests`. A healthy hit rate is >80–90%. Low hit rates indicate:\n- TTL is too short\n- Keys are too granular (unique per request)\n- Cache capacity is too small (keys evicted before reuse)\n\n**Cache warm-up**: pre-populate the cache on startup to avoid cold-start miss spikes.',
  },

  // ─── Caching (Medium) ────────────────────────────────────────────────────────

  {
    id: 'cache-m1',
    category: 'Caching',
    difficulty: 'medium',
    question: 'What are the most common cache eviction policies? When should you choose LRU over LFU?',
    answer:
      '**LRU (Least Recently Used)**: evict the item not accessed for the longest time. Favours recency.\n- Good for temporal locality (recently accessed data will likely be accessed again)\n- Bad for large sequential scans — scans pollute the cache with one-time items\n\n**LFU (Least Frequently Used)**: evict the item with the fewest accesses. Favours popularity.\n- Good for stable hot keys (top articles, product catalogue)\n- Bad for new items — they start with low frequency and get evicted before getting a chance\n\n**TTL (Time-To-Live)**: evict after a fixed time regardless of access pattern.\n- Good for data that becomes stale over time (exchange rates, sessions)\n\n**FIFO**: evict in insertion order. Simple, ignores access patterns.\n\n**Redis default**: `allkeys-lru`. Redis 4+ supports `allkeys-lfu`.\n**In practice**: LRU covers most use cases. Use LFU when you have a well-defined, stable hot set.',
  },

  {
    id: 'cache-m2',
    category: 'Caching',
    difficulty: 'medium',
    question: 'What is the difference between cache-aside, write-through, and write-back caching?',
    answer:
      '**Cache-aside (lazy loading)**: application code manages the cache manually.\n1. On read: check cache → on miss, fetch from DB, populate cache, return\n- ✓ Only caches what is actually requested\n- ✗ Cache miss penalty on first access; stale reads if DB is updated directly\n\n**Write-through**: every write goes to the cache AND the DB synchronously.\n- ✓ Cache is always consistent with the DB\n- ✗ Higher write latency; caches data that may never be read\n\n**Write-behind (write-back)**: writes go to the cache immediately; cache flushes to DB asynchronously.\n- ✓ Very low write latency\n- ✗ Risk of data loss if cache crashes before flushing\n\n**Most common**: cache-aside for reads + cache invalidation on writes.',
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
];
