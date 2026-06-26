import type { Flashcard } from '../types';

export const databasesCards: Flashcard[] = [

  // ─── Databases (Senior) ──────────────────────────────────────────────────────

  {
    id: 'db-1',
    category: 'Databases',
    difficulty: 'hard',
    type: 'experience',
    question: 'How does MVCC (Multi-Version Concurrency Control) work in PostgreSQL, and how does it enable non-blocking reads?',
    answer:
      'MVCC allows readers and writers to coexist without locking each other by keeping **multiple versions** of each row.\n\n**Writes**: every `UPDATE` creates a new row version with a new `xmin` (transaction ID that created it). The old version is marked with `xmax` (transaction ID that deleted/updated it).\n\n**Reads**: a reader uses its snapshot — the set of committed transaction IDs at the moment the transaction began — to determine which row version is visible. It sees the latest version committed before the snapshot, ignoring any in-progress or later transactions.\n\n**Result**: reads never block writes and writes never block reads. This is why `SELECT` in PostgreSQL does not take shared locks.\n\n**Vacuum**: old row versions (dead tuples) accumulate and must be cleaned up by `VACUUM` / `autovacuum`. Table bloat from unapplied vacuums causes performance degradation.',
    code: {
      language: 'sql',
      snippet: `-- See current dead tuples and bloat
SELECT relname, n_live_tup, n_dead_tup, last_autovacuum
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC;

-- Check which transactions are blocking vacuum
SELECT pid, query, state, wait_event_type, wait_event
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY query_start;

-- Lock-free read even during concurrent writes (MVCC at work)
BEGIN ISOLATION LEVEL REPEATABLE READ;
SELECT * FROM orders WHERE status = 'pending';
-- Other transactions can INSERT/UPDATE freely`,
    },
  },

  {
    id: 'db-2',
    category: 'Databases',
    difficulty: 'hard',
    type: 'experience',
    question: 'What are database isolation levels and what read anomalies does each prevent? How do you debug which level caused a bug in production?',
    answer:
      '| Level | Dirty Read | Non-Repeatable Read | Phantom Read | Write Skew |\n|---|---|---|---|---|\n| Read Uncommitted | possible | possible | possible | possible |\n| Read Committed | prevented | possible | possible | possible |\n| Repeatable Read | prevented | prevented | possible* | possible |\n| Serializable | prevented | prevented | prevented | prevented |\n\n*PostgreSQL\'s Repeatable Read also prevents phantom reads due to MVCC snapshots, unlike the SQL standard.\n\n**Write Skew**: two transactions read overlapping data, each decides it\'s safe to write, and both commit — violating an invariant. Only Serializable (SSI in PostgreSQL) prevents it.\n\n**Debugging**: check `pg_stat_activity` and `pg_locks`. Enable `log_lock_waits = on`. Use `EXPLAIN (ANALYZE, BUFFERS)` to see actual vs estimated row counts — a sign of stale statistics.',
  },

  {
    id: 'db-3',
    category: 'Databases',
    difficulty: 'hard',
    type: 'experience',
    question: 'What is database connection pooling? What are the failure modes when the pool is misconfigured?',
    answer:
      'Connection pooling maintains a cache of reusable DB connections, avoiding the overhead (~5–10 ms) of establishing a new TCP connection + TLS + auth handshake per query.\n\n**Key parameters**:\n- `min` / `max` pool size — minimum idle connections; maximum concurrent connections\n- `idleTimeoutMillis` — close connections idle longer than this\n- `connectionTimeoutMillis` — fail-fast if a connection cannot be acquired within this window\n\n**Failure modes**:\n- **Pool exhaustion** — all connections in use; new requests queue indefinitely or timeout. Fix: reduce query duration, raise `max`, or use PgBouncer in transaction-mode\n- **Too many connections** — PostgreSQL has a hard limit (`max_connections`, default 100). Each connection uses ~5–10 MB RAM. Fix: use a connection pooler (PgBouncer) in front of Postgres; keep application pool small\n- **Stale connections** — TCP keep-alive not configured; connections silently dropped by a firewall. Fix: set `keepAlive: true` and run a heartbeat query on idle checkout',
    code: {
      language: 'typescript',
      snippet: `import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,                     // never exceed PG max_connections / num_pods
  min: 2,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  allowExitOnIdle: true,
});

// Always release connections – use try/finally or pool.query shorthand
const client = await pool.connect();
try {
  await client.query('BEGIN');
  const { rows } = await client.query('SELECT ...', [id]);
  await client.query('COMMIT');
  return rows[0];
} catch (e) {
  await client.query('ROLLBACK');
  throw e;
} finally {
  client.release(); // CRITICAL: forgetting this exhausts the pool
}`,
    },
  },

  {
    id: 'db-4',
    category: 'Databases',
    difficulty: 'hard',
    type: 'experience',
    question: 'What is optimistic vs pessimistic locking? When does each break, and how do you implement optimistic locking in Node.js?',
    answer:
      '**Pessimistic locking** (`SELECT ... FOR UPDATE`): acquires an exclusive row lock before reading. Prevents concurrent modifications but blocks other transactions and can deadlock.\n\n**Optimistic locking**: reads the data freely, adds a `version` column, and asserts the version hasn\'t changed at write time. No lock held during processing — better throughput when conflicts are rare.\n\n**Optimistic breaks when**: contention is high (many retries, starvation possible). Use pessimistic locking when conflicts are expected or when the critical section is very short.\n\n**Pessimistic breaks when**: the lock is held for a long time (e.g., waiting for a payment gateway), starving other transactions.',
    code: {
      language: 'typescript',
      snippet: `// Optimistic locking with version column
async function transferFunds(fromId: string, toId: string, amount: number) {
  let retries = 3;
  while (retries-- > 0) {
    const account = await db.account.findUniqueOrThrow({
      where: { id: fromId },
    });

    if (account.balance < amount) throw new Error('Insufficient funds');

    const updated = await db.account.updateMany({
      where: {
        id: fromId,
        version: account.version, // optimistic check
      },
      data: {
        balance:  { decrement: amount },
        version:  { increment: 1 },
      },
    });

    if (updated.count === 0) {
      // Another transaction won the race — retry
      continue;
    }
    return; // success
  }
  throw new Error('Optimistic lock failed after retries');
}

// Pessimistic – use when you KNOW conflicts are frequent
await db.$transaction(async (tx) => {
  const [from] = await tx.$queryRaw\`
    SELECT * FROM accounts WHERE id = \${fromId} FOR UPDATE
  \`;
  await tx.account.update({ where: { id: fromId },
    data: { balance: { decrement: amount } } });
});`,
    },
  },

  {
    id: 'db-5',
    category: 'Databases',
    difficulty: 'hard',
    type: 'experience',
    question: 'What is database sharding? Describe the strategies and the operational pain points that come with it.',
    answer:
      'Sharding horizontally partitions data across multiple database nodes, each responsible for a subset of the dataset.\n\n**Sharding strategies**:\n- **Range sharding** — shard by value range (e.g., user IDs 1–1M on shard 1). Simple but prone to hotspots\n- **Hash sharding** — `shard = hash(key) % N`. Uniform distribution but range queries hit all shards\n- **Directory/lookup sharding** — a shard map service routes requests. Flexible but single point of failure if the map service goes down\n- **Geo sharding** — shard by region for data residency and latency\n\n**Pain points**:\n- **Cross-shard queries / joins** — must scatter-gather across shards and merge results in the application layer\n- **Cross-shard transactions** — no native ACID; need distributed transactions (2PC, Sagas)\n- **Rebalancing** — adding a shard requires data migration; consistent hashing reduces this\n- **Schema migrations** — must run on every shard; coordination is complex',
  },

  // ─── Databases (Easy) ────────────────────────────────────────────────────────

  {
    id: 'db-e1',
    category: 'Databases',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is the difference between SQL (relational) and NoSQL databases?',
    answer:
      '| | SQL (Relational) | NoSQL |\n|---|---|---|\n| Schema | Fixed, enforced by the DB | Flexible, schema-on-read |\n| Data model | Tables, rows, columns | Documents, key-value, graph, wide-column |\n| Relationships | JOINs, foreign keys | Embedded docs or app-level joins |\n| Transactions | ACID by default | Varies (MongoDB 4+ supports multi-doc ACID) |\n| Scaling | Vertical; read replicas | Horizontal sharding built-in |\n| Examples | PostgreSQL, MySQL, SQLite | MongoDB, Redis, DynamoDB, Cassandra |\n\n**Choose SQL**: relational data, ACID transactions required, schema is stable.\n**Choose NoSQL**: hierarchical/document data, schema evolves rapidly, horizontal scale from the start, or specialised model (graph, time-series, cache).',
  },

  {
    id: 'db-e2',
    category: 'Databases',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is a primary key and a foreign key in a relational database?',
    answer:
      '**Primary Key (PK)**: a column (or set of columns) that uniquely identifies each row.\n- Must be unique per row\n- Cannot be NULL\n- The database creates a unique index on it automatically\n\n**Foreign Key (FK)**: a column in one table that holds the PK value of a row in *another* table, creating a reference.\n- Enforces **referential integrity** — you cannot insert a FK value that does not exist in the referenced table\n- On DELETE / UPDATE of the referenced row: can CASCADE, SET NULL, or RESTRICT\n\n**Example**: `orders.user_id` is a FK pointing to `users.id`. You cannot create an order for a non-existent user.',
    code: {
      language: 'sql',
      snippet: `CREATE TABLE users (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE orders (
  id      SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount  NUMERIC(10,2) NOT NULL
);

-- ✗ Error: violates foreign key constraint
INSERT INTO orders (user_id, amount) VALUES (9999, 50.00);`,
    },
  },

  // ─── Databases (Medium) ──────────────────────────────────────────────────────

  {
    id: 'db-e3',
    category: 'Databases',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is a JOIN in SQL? Name the types.',
    answer:
      "A **JOIN** combines rows from two or more tables based on a related column.\n\n**Types**:\n\n**INNER JOIN** — returns only rows where there is a match in **both** tables. Most common.\n\n**LEFT JOIN** (LEFT OUTER JOIN) — returns **all rows from the left table**, plus matched rows from the right. Unmatched right-side columns are NULL.\n\n**RIGHT JOIN** (RIGHT OUTER JOIN) — returns **all rows from the right table**, plus matched rows from the left. Rarely used (just flip the table order and use LEFT JOIN).\n\n**FULL OUTER JOIN** — returns all rows from **both tables**, with NULLs where there is no match.\n\n**CROSS JOIN** — returns the **Cartesian product** of both tables (every combination). No ON clause. Rarely used intentionally.\n\n**SELF JOIN** — a table joined to itself (e.g. finding all employees and their managers from the same `employees` table).",
    code: {
      language: 'sql',
      snippet: `-- INNER JOIN: only users who have orders
SELECT u.name, o.amount
FROM users u
INNER JOIN orders o ON u.id = o.user_id;

-- LEFT JOIN: all users, even those with no orders
SELECT u.name, o.amount
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;
-- u.name = 'Bob', o.amount = NULL (Bob has no orders)

-- FULL OUTER JOIN: all users and all orders
SELECT u.name, o.amount
FROM users u
FULL OUTER JOIN orders o ON u.id = o.user_id;`,
    },
  },

  {
    id: 'db-e4',
    category: 'Databases',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is the difference between WHERE and HAVING in SQL?',
    answer:
      "Both filter rows, but they operate at **different stages** of query execution.\n\n**WHERE** — filters **individual rows before grouping**. Applied before `GROUP BY`. Cannot reference aggregate functions (`SUM`, `COUNT`, `AVG`).\n\n**HAVING** — filters **groups after aggregation**. Applied after `GROUP BY`. Can reference aggregate functions.\n\n**Rule of thumb**: if you're filtering based on an aggregate result (`COUNT(*) > 5`), use `HAVING`. For everything else, use `WHERE`.\n\n**Performance tip**: always filter with `WHERE` first to reduce the number of rows before grouping. `HAVING` filters after the work is done.",
    code: {
      language: 'sql',
      snippet: `-- WHERE: filter rows before grouping
-- Find orders from 2025 with amount > 100, then count per user
SELECT user_id, COUNT(*) as order_count
FROM orders
WHERE amount > 100                    -- filters rows first (before GROUP BY)
  AND created_at >= '2025-01-01'
GROUP BY user_id;

-- HAVING: filter groups after aggregation
-- Find users who placed more than 5 orders
SELECT user_id, COUNT(*) as order_count
FROM orders
GROUP BY user_id
HAVING COUNT(*) > 5;                  -- filters groups (after GROUP BY)

-- Combined: WHERE + HAVING together
SELECT user_id, SUM(amount) as total
FROM orders
WHERE status = 'completed'            -- filter rows first
GROUP BY user_id
HAVING SUM(amount) > 1000;            -- then filter groups`,
    },
  },

  {
    id: 'db-e5',
    category: 'Databases',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is a database view?',
    answer:
      "A **view** is a **named, stored SQL query** that you can reference like a table. It does not store data itself — it runs the underlying query each time it is accessed.\n\n**Benefits**:\n- **Simplify complex queries** — wrap a multi-table JOIN into a view; callers just `SELECT * FROM user_summary`\n- **Security** — expose only specific columns to users who should not see sensitive fields (e.g. hide `password_hash`)\n- **Reusability** — define business logic once in the view; reuse across many queries\n- **Backward compatibility** — rename a table but keep the old view name for legacy queries\n\n**Limitations**:\n- A regular view runs the query every time — no caching\n- Cannot always be updated (INSERT/UPDATE on a view has restrictions)\n\n**Materialized view** (PostgreSQL): the query result is stored on disk and refreshed on demand. Much faster for expensive aggregations, but data can be stale until refreshed.",
    code: {
      language: 'sql',
      snippet: `-- Create a view that hides sensitive columns
CREATE VIEW public_users AS
SELECT id, name, created_at
FROM users
WHERE deleted_at IS NULL;
-- password_hash is not included

-- Use it like a table
SELECT * FROM public_users WHERE id = 42;

-- View with a JOIN
CREATE VIEW order_summary AS
SELECT
  o.id          AS order_id,
  u.name        AS customer,
  o.amount,
  o.status,
  o.created_at
FROM orders o
JOIN users u ON u.id = o.user_id;

SELECT * FROM order_summary WHERE status = 'pending';

-- Materialized view (PostgreSQL): stores the result
CREATE MATERIALIZED VIEW monthly_revenue AS
SELECT DATE_TRUNC('month', created_at) AS month, SUM(amount) AS revenue
FROM orders GROUP BY 1;

REFRESH MATERIALIZED VIEW monthly_revenue; -- run periodically`,
    },
  },

  {
    id: 'db-m3',
    category: 'Databases',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is an ORM? What are the trade-offs vs raw SQL?',
    answer:
      "An **ORM (Object-Relational Mapper)** maps database tables to classes/objects in your programming language. You write code, not SQL — the ORM generates queries for you.\n\n**Examples**: Prisma, TypeORM, Sequelize (Node.js); Hibernate (Java); ActiveRecord (Ruby).\n\n**Benefits of an ORM**:\n- **Productivity** — `db.user.findMany({ where: { active: true } })` vs writing SQL\n- **Type safety** (Prisma) — generated types match your schema exactly\n- **Migration management** — schema changes tracked and applied with commands\n- **Database portability** — switch from PostgreSQL to MySQL with minimal changes\n\n**Drawbacks**:\n- **N+1 problem** — ORM naively fetches each related record in a separate query; requires explicit eager loading\n- **Leaky abstraction** — complex queries are hard to express; ORM generates inefficient SQL\n- **Performance** — raw SQL lets you use DB-specific features (CTEs, window functions, partial indexes)\n\n**Rule of thumb**: use an ORM for standard CRUD; drop to raw SQL for complex reporting queries or performance-critical paths.",
    code: {
      language: 'typescript',
      snippet: `// Prisma ORM — type-safe, concise
const users = await prisma.user.findMany({
  where: { active: true },
  include: { orders: { where: { status: 'pending' } } },
  orderBy: { createdAt: 'desc' },
  take: 20,
});

// N+1 problem — BAD: 1 query to get users + N queries for orders
const users = await prisma.user.findMany();
for (const user of users) {
  user.orders = await prisma.order.findMany({ where: { userId: user.id } }); // N extra queries!
}

// Fix: eager load with include
const users = await prisma.user.findMany({
  include: { orders: true }, // single JOIN query
});

// Raw SQL for complex reporting (Prisma supports this too)
const result = await prisma.$queryRaw\`
  SELECT u.id, u.name, COUNT(o.id) AS order_count, SUM(o.amount) AS total
  FROM users u
  LEFT JOIN orders o ON o.user_id = u.id
  GROUP BY u.id
  HAVING COUNT(o.id) > 5
\`;`,
    },
  },

  {
    id: 'db-m4',
    category: 'Databases',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is database normalization? Explain 1NF, 2NF, 3NF.',
    answer:
      "**Normalization** is the process of structuring a relational database to **eliminate redundant data and prevent update anomalies** (situations where updating one piece of data requires updating it in many places).\n\n**1NF (First Normal Form)** — the most basic rule:\n- Every cell must contain **exactly one value** (no comma-separated lists, no arrays)\n- Every row must have a primary key\n- No repeating groups of columns (no `tag1`, `tag2`, `tag3` columns)\n\n**2NF (Second Normal Form)** — satisfies 1NF, plus:\n- Every non-key column depends on the **entire** primary key (only matters for composite PKs)\n- Violation: a table with PK `(order_id, product_id)` that also stores `customer_name` — `customer_name` depends only on `order_id`, not the full PK. Move it to the `orders` table.\n\n**3NF (Third Normal Form)** — satisfies 2NF, plus:\n- No **transitive dependency**: non-key columns must depend directly on the PK, not on another non-key column\n- Violation: `users` table has `zipcode` and `city`. `city` depends on `zipcode`, not on `user_id`. Move city/zipcode to a separate `zipcodes` table.\n\n**Why it matters**: redundant data leads to *update anomalies* — if a city name is stored in 10,000 user rows and it changes, you must update 10,000 rows. Miss one and your data is inconsistent.\n\n**Trade-off**: highly normalized schemas need more JOINs. OLTP (transactional) databases target 3NF. Analytics/data warehouse schemas often intentionally **denormalize** (flat wide tables) to speed up read queries at the cost of redundancy.",
    code: {
      language: 'sql',
      snippet: `-- Violates 1NF: multiple values in one cell
-- orders: id=1, items="book,pen,ruler"   ✗

-- 1NF: each row has one item
-- order_items: order_id, item_name (separate rows per item)  ✓

-- Violates 2NF: composite PK (order_id, product_id)
-- order_items: order_id, product_id, quantity, customer_name ✗
--   customer_name depends only on order_id, not the full PK

-- 2NF fix: separate tables
-- orders:      id, customer_name
-- order_items: order_id, product_id, quantity  ✓

-- Violates 3NF: transitive dependency
-- employees: id, name, department_id, department_name  ✗
--   department_name depends on department_id, not employee id

-- 3NF fix
-- employees:   id, name, department_id
-- departments: id, name  ✓`,
    },
  },

  {
    id: 'db-m1',
    category: 'Databases',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is a database index and when should you add one?',
    answer:
      "**An index is a separate data structure (typically a B-tree) that lets the database find rows without scanning the entire table.** Without an index on a 10-million-row table, every query must read every row. With an index, the DB jumps straight to the matching rows in O(log n).\n\n**Analogy**: an index in a database is like the index at the back of a book — instead of reading every page, you look up the term and jump to the exact page number.\n\n**When to add an index**:\n- Columns used in `WHERE`, `JOIN ON`, or `ORDER BY` clauses\n- Foreign key columns (prevents full-table scans on joins)\n- High-cardinality columns (many distinct values — `user_id`, `email`, `created_at`)\n\n**When NOT to add one**:\n- Small tables (a full scan is faster than index overhead)\n- Very write-heavy tables (every INSERT/UPDATE/DELETE must also update every index)\n- Low-cardinality columns (`status` with only 3 values — the query planner may ignore it anyway)\n\n**Most common gotcha**: composite indexes only help queries that use a **prefix** of the indexed columns. An index on `(user_id, status)` helps queries filtering by `user_id`, and queries filtering by both `user_id` AND `status` — but NOT queries filtering only by `status`.\n\n**Always use `EXPLAIN ANALYZE`** to verify an index is actually being used — the query planner sometimes chooses a full scan instead.",
    code: {
      language: 'sql',
      snippet: `-- Slow: full table scan on 10M rows
SELECT * FROM orders WHERE user_id = 42;

-- Add index on the FK column
CREATE INDEX idx_orders_user_id ON orders(user_id);
-- Now uses index scan: O(log n)

-- Composite index — only helps when queried in prefix order
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
-- ✓ WHERE user_id = 42
-- ✓ WHERE user_id = 42 AND status = 'pending'
-- ✗ WHERE status = 'pending'  (no leading user_id)

EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 42;`,
    },
  },

  {
    id: 'db-m2',
    category: 'Databases',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is a database transaction? What does ACID stand for?',
    answer:
      "**A transaction is a group of database operations that must all succeed or all fail together.** There is no partial success — if the second step fails, the first step is undone automatically.\n\n**Classic example**: transferring $100 between bank accounts requires two operations — deduct from A, add to B. Without transactions, a crash between the two operations would make money disappear.\n\n**ACID** describes the guarantees a transaction provides:\n- **Atomicity** — all operations succeed, or none do. A mid-way failure rolls everything back.\n- **Consistency** — the transaction takes the database from one valid state to another. Constraints (PKs, FKs, CHECK) are enforced.\n- **Isolation** — concurrent transactions cannot see each other's uncommitted writes. They behave as if they ran one at a time.\n- **Durability** — once committed, changes survive crashes. The database writes to disk (WAL) before confirming success.\n\n**Isolation levels** (weakest → strongest): READ UNCOMMITTED → READ COMMITTED → REPEATABLE READ → SERIALIZABLE. Higher isolation prevents more anomalies but requires more locking, which reduces throughput.\n\n**Most common gotcha**: PostgreSQL defaults to READ COMMITTED. This means a long-running read can see different data at the start vs the end if rows are modified by concurrent transactions. Use REPEATABLE READ when you need a consistent snapshot.",
    code: {
      language: 'sql',
      snippet: `-- Transfer $100 atomically
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 'A';
UPDATE accounts SET balance = balance + 100 WHERE id = 'B';
COMMIT; -- or ROLLBACK if either fails

-- Node.js with pg
const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [100, 'A']);
  await client.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2', [100, 'B']);
  await client.query('COMMIT');
} catch (e) {
  await client.query('ROLLBACK');
  throw e;
} finally { client.release(); }`,
    },
  },

  {
    id: 'db-m5',
    category: 'Databases',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is the N+1 query problem? How do you detect and fix it?',
    answer:
      'The **N+1 problem** happens when you fetch a list of N records and then fire an individual query for each record to get related data — 1 query for the list + N queries for relations = N+1 total.\n\n**Example:** fetch 100 posts, then loop and query each post\'s author → 101 queries instead of 2.\n\n**How to detect:**\n- Log slow queries in production (PostgreSQL `log_min_duration_statement`)\n- ORM debug mode — Prisma: `log: ["query"]`, TypeORM: `logging: true`\n- APM tools (Datadog, New Relic) show query counts per request\n\n**Fixes:**\n- **JOIN / eager load** — fetch everything in one query\n- **Batch loading (DataLoader pattern)** — collect all IDs, run one `WHERE id IN (...)` query\n- **`include` / `with`** in ORMs — Prisma `include: { author: true }`, TypeORM `relations: ["author"]`\n\n**Rule of thumb:** if query count scales with result count, you have N+1.',
    code: {
      language: 'typescript',
      snippet: `// ❌ N+1 — 1 query for posts + N queries for authors
const posts = await db.query('SELECT * FROM posts');
for (const post of posts) {
  // fires a separate query for EVERY post
  post.author = await db.query('SELECT * FROM users WHERE id = $1', [post.authorId]);
}

// ✅ Fix 1: JOIN — single query
const posts = await db.query(\`
  SELECT p.*, u.name AS author_name
  FROM posts p
  JOIN users u ON u.id = p.author_id
\`);

// ✅ Fix 2: Prisma eager load
const posts = await prisma.post.findMany({
  include: { author: true }, // one SQL JOIN under the hood
});

// ✅ Fix 3: DataLoader — batch IDs into one IN query
const authorLoader = new DataLoader(async (ids) => {
  const authors = await db.query('SELECT * FROM users WHERE id = ANY($1)', [ids]);
  return ids.map(id => authors.find(a => a.id === id));
});
// Each post.author call batches — resolves to one query total`,
    },
  },

  {
    id: 'db-m6',
    category: 'Databases',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is connection pooling? How do you configure it correctly in a Node.js app?',
    answer:
      'Creating a new database connection is expensive — TCP handshake, auth, SSL negotiation can take 20–100ms. **Connection pooling** maintains a set of open, reusable connections. Requests borrow a connection, use it, and return it to the pool.\n\n**Key config parameters:**\n- `max` — max connections in the pool. Rule of thumb: `(num_cores * 2) + effective_spindle_count`. Too high → DB runs out of connections. Too low → requests queue.\n- `min` (idle) — connections kept open even when idle. Avoids cold-start latency.\n- `idleTimeoutMillis` — how long an idle connection lives before being closed.\n- `connectionTimeoutMillis` — how long to wait for a free connection before throwing.\n\n**In a serverless / Lambda environment:** pooling doesn\'t work well because each function instance creates its own pool. Use **RDS Proxy** or **PgBouncer** as an external pooler.\n\n**Connection leak:** always release connections in a `finally` block. A leaked connection never returns to the pool — eventually the pool is exhausted and all requests hang.',
    code: {
      language: 'typescript',
      snippet: `import { Pool } from 'pg';

const pool = new Pool({
  host:     process.env.DB_HOST,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max:      20,                // max pool size
  min:      2,                 // keep 2 idle connections warm
  idleTimeoutMillis:    30000, // close idle connections after 30s
  connectionTimeoutMillis: 2000, // throw if no free connection in 2s
});

// Monitor pool health
pool.on('error', (err) => console.error('Idle client error', err));

// ✅ Always release in finally — prevents connection leaks
async function getUser(id: string) {
  const client = await pool.connect();
  try {
    const { rows } = await client.query('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0];
  } finally {
    client.release(); // returns connection to pool even if query throws
  }
}

// Or just use pool.query() for simple one-off queries (auto-releases)
const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);`,
    },
  },

  {
    id: 'db-m7',
    category: 'Databases',
    difficulty: 'medium',
    type: 'basics',
    question: 'What are the core principles of good database schema design? What mistakes do you avoid?',
    answer:
      '**Schema design is a multiplier — a bad schema makes every future query harder.** Key principles:\n\n**1. Normalize to 3NF by default** — eliminate redundancy. Each fact lives in exactly one place. User data belongs in `users`, not duplicated across three tables. Denormalize intentionally only for read performance when queries prove too slow.\n\n**2. Choose data types carefully**\n- Use `UUID` or `BIGSERIAL` for primary keys (UUID is globally unique across services; BIGSERIAL is smaller and faster)\n- Use `TIMESTAMPTZ` (with timezone) not `TIMESTAMP` for all dates — always store in UTC\n- Use `NUMERIC(10,2)` for money, never `FLOAT` (floating point rounding errors in financial calculations)\n\n**3. Always index foreign keys** — without an index on the FK column, every JOIN scans the entire child table. Postgres does not auto-index FKs.\n\n**4. Index query predicates, not everything** — add indexes for columns that appear in `WHERE`, `ORDER BY`, and `JOIN ON`. Over-indexing slows writes.\n\n**5. Use foreign key constraints** — they enforce referential integrity at the DB level. Without them, orphaned rows accumulate silently.\n\n**6. Soft deletes** — add a `deleted_at TIMESTAMPTZ` column instead of physically deleting rows. Preserves audit history. Filter with `WHERE deleted_at IS NULL`.\n\n**Common mistakes**: storing JSON blobs for everything (hard to query/index), no created_at/updated_at timestamps, storing emails/usernames in multiple tables, varchar with no length limit, missing NOT NULL constraints.',
    code: {
      language: 'sql',
      snippet: `-- ✅ Well-designed users table
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       VARCHAR(255) NOT NULL UNIQUE,
  name        VARCHAR(100) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ  -- NULL = active, set = soft deleted
);

-- ✅ Orders table with FK + proper types
CREATE TABLE orders (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  total_cents BIGINT NOT NULL,   -- store money as integer cents, not float
  status      VARCHAR(20) NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'paid', 'cancelled')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ✅ Index the FK (Postgres does NOT auto-index FKs)
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- ✅ Partial index for active users only
CREATE INDEX idx_users_email_active ON users(email) WHERE deleted_at IS NULL;`,
    },
  },
];
