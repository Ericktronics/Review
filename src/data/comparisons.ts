import type { Flashcard } from '../types';

export const comparisonsCards: Flashcard[] = [

  // ─── Compare & Choose (Easy) ─────────────────────────────────────────────────

  {
    id: 'cmp-e1',
    category: 'Compare & Choose',
    difficulty: 'easy',
    type: 'basics',
    question: '`null` vs `undefined` — what is the difference, and when do you use each?',
    answer:
      '**`undefined`**: a variable was declared but never assigned, a function parameter was not provided, or a property does not exist on an object. JavaScript sets this automatically — you never set it yourself.\n\n**`null`**: an intentional absence of value. A programmer explicitly sets this to say "this field has no value right now."\n\n| | `null` | `undefined` |\n|---|---|---|\n| `typeof` | `"object"` (historic bug) | `"undefined"` |\n| `== null` | `true` | `true` |\n| `=== null` | `true` | `false` |\n| Set by | Developer, intentionally | JavaScript, automatically |\n\n**Use `null` when**: explicitly clearing a value (`user.avatar = null`), signalling "no result" from a function (`return null` when not found), or marking optional DB fields as empty.\n\n**Never assign `undefined`**: if you want to represent "no value", use `null`. `undefined` means "I forgot to set this" — `null` means "I set this to nothing on purpose."\n\n**Practical tip**: `x == null` (loose equality) is the one valid use of `==` — it matches both `null` and `undefined` in a single check.',
    code: {
      language: 'javascript',
      snippet: `// undefined — automatic, means "not set"
let x;
console.log(x);              // undefined
console.log(typeof x);       // 'undefined'

function greet(name) {
  console.log(name);         // undefined — not passed
}

const obj = { a: 1 };
console.log(obj.b);          // undefined — property doesn't exist

// null — intentional "no value"
let user = { name: 'Alice', avatar: null }; // explicitly no avatar

// typeof null is a famous JS bug
console.log(typeof null);    // 'object' (not 'null')

// Checking for both at once
const value = null;
console.log(value == null);  // true  — matches null AND undefined
console.log(value === null); // true  — only matches null`,
    },
  },

  {
    id: 'cmp-e2',
    category: 'Compare & Choose',
    difficulty: 'easy',
    type: 'basics',
    question: '`==` vs `===` — what is the difference, and which should you use?',
    answer:
      '**`==` (loose equality)**: coerces both operands to the same type before comparing. The coercion rules are complex and produce surprising results.\n\n**`===` (strict equality)**: no type coercion — both value AND type must match.\n\n**Always use `===`**. The only arguable exception is `x == null`, which checks for both `null` and `undefined` simultaneously.\n\n**Why `==` is dangerous**: the coercion rules are hard to memorise (`"" == false` is true, but `"0" == false` is also true, while `"" == "0"` is false). Code that relies on `==` is a source of subtle bugs.\n\n**ESLint rule**: `eqeqeq` enforces `===` everywhere and is enabled in every serious codebase.',
    code: {
      language: 'javascript',
      snippet: `// === strict — no surprises
console.log(1 === 1);       // true
console.log(1 === '1');     // false (different types)
console.log(null === undefined); // false

// == loose — type coercion, surprising results
console.log(1 == '1');      // true  (string coerced to number)
console.log(0 == false);    // true  (false coerced to 0)
console.log('' == false);   // true
console.log(null == undefined); // true
console.log(null == 0);     // false (null only == undefined)
console.log([] == false);   // true  ([] → '' → 0 → false)
console.log([] == ![]);     // true  (!!! coercion rabbit hole)

// ✓ Use === everywhere
// One exception: check for null OR undefined in one shot
function process(value) {
  if (value == null) return; // catches both null and undefined
  // ...
}`,
    },
  },

  {
    id: 'cmp-e3',
    category: 'Compare & Choose',
    difficulty: 'easy',
    type: 'basics',
    question: '`var` vs `let` vs `const` — what are the differences, and which do you use?',
    answer:
      '| | `var` | `let` | `const` |\n|---|---|---|---|\n| Scope | Function | Block | Block |\n| Hoisting | Yes (to `undefined`) | TDZ error | TDZ error |\n| Re-declare | Yes | No | No |\n| Re-assign | Yes | Yes | No |\n\n**`var`**: function-scoped and hoisted. A `var` declared inside an `if` block leaks out of it. Almost never use in modern code.\n\n**`let`**: block-scoped. Use when a variable needs to be reassigned (loop counters, accumulating values).\n\n**`const`**: block-scoped, cannot be reassigned. Does NOT mean immutable — object/array contents can still be mutated. Use by default.\n\n**Rule of thumb**: default to `const`. Use `let` only when you need to reassign. Never use `var`.\n\n**TDZ (Temporal Dead Zone)**: `let`/`const` declarations exist in scope from the start of the block but cannot be accessed before the declaration line — accessing them throws a `ReferenceError`.',
    code: {
      language: 'javascript',
      snippet: `// var — function-scoped, leaks from blocks
function example() {
  if (true) {
    var x = 1; // leaks out of the if block
  }
  console.log(x); // 1 — unexpected!
}

// let — block-scoped
function example2() {
  if (true) {
    let y = 1;
  }
  console.log(y); // ReferenceError — y is not defined
}

// const — block-scoped, no reassignment
const MAX = 100;
MAX = 200; // TypeError: Assignment to constant variable

// const objects are NOT immutable
const user = { name: 'Alice' };
user.name = 'Bob';   // ✓ mutating is fine
user = {};           // ✗ TypeError — reassigning the binding

// var hoisting surprise
console.log(a); // undefined (not ReferenceError — var is hoisted)
var a = 5;

// let TDZ
console.log(b); // ReferenceError: Cannot access 'b' before initialization
let b = 5;`,
    },
  },

  {
    id: 'cmp-e4',
    category: 'Compare & Choose',
    difficulty: 'easy',
    type: 'basics',
    question: '`Promise.all` vs `Promise.allSettled` — what is the difference, and which do you use?',
    answer:
      'Both run an array of promises in parallel, but they differ in how they handle failures.\n\n**`Promise.all(promises)`**\n- Resolves when **all** promises resolve — returns array of resolved values\n- **Rejects immediately** if **any** promise rejects (fail-fast) — other pending promises are ignored\n- Use when: all results are required, and one failure means the whole operation should fail\n\n**`Promise.allSettled(promises)`**\n- Waits for **all** promises to settle (resolve or reject) — **never rejects**\n- Returns an array of `{ status: "fulfilled", value }` or `{ status: "rejected", reason }` for each\n- Use when: you want to process all results regardless of individual failures\n\n| | `Promise.all` | `Promise.allSettled` |\n|---|---|---|\n| On failure | Rejects immediately | Waits for all |\n| Return type | `value[]` | `{status, value/reason}[]` |\n| Use when | All must succeed | Process all outcomes |',
    code: {
      language: 'javascript',
      snippet: `const p1 = Promise.resolve(1);
const p2 = Promise.reject(new Error('failed'));
const p3 = Promise.resolve(3);

// Promise.all — fails fast if ANY rejects
Promise.all([p1, p2, p3])
  .then(values => console.log(values))
  .catch(err => console.log('Caught:', err.message)); // 'Caught: failed'
// p3 result is ignored — you never get it

// Promise.allSettled — waits for all, never rejects
Promise.allSettled([p1, p2, p3])
  .then(results => console.log(results));
// [
//   { status: 'fulfilled', value: 1 },
//   { status: 'rejected',  reason: Error: 'failed' },
//   { status: 'fulfilled', value: 3 },
// ]

// ✓ Use Promise.all: fetch multiple required resources
const [user, account] = await Promise.all([
  fetchUser(id),
  fetchAccount(id),
]); // if either fails, the whole thing fails — correct behaviour

// ✓ Use Promise.allSettled: send notifications, don't stop on one failure
const results = await Promise.allSettled(
  userIds.map(id => sendEmail(id))
);
const failed = results.filter(r => r.status === 'rejected');
console.log(\`\${failed.length} emails failed\`);`,
    },
  },

  {
    id: 'cmp-e5',
    category: 'Compare & Choose',
    difficulty: 'easy',
    type: 'basics',
    question: 'SQL vs NoSQL — what is the difference, and which do you choose?',
    answer:
      '**SQL (Relational)**: structured tables, fixed schema, joins, ACID transactions. Examples: PostgreSQL, MySQL.\n\n**NoSQL (Non-relational)**: flexible schema, various models, trades some consistency for scale/flexibility. Examples: MongoDB (document), Redis (key-value), Cassandra (column), Neo4j (graph).\n\n| | SQL | NoSQL |\n|---|---|---|\n| Schema | Fixed, defined upfront | Flexible, schema-less |\n| Relationships | JOINs between tables | Embedded documents or denormalized |\n| Transactions | ACID (strong) | Varies (often eventual consistency) |\n| Scaling | Vertical (bigger machine) | Horizontal (more machines) |\n| Query language | SQL (standardized) | Varies by DB |\n\n**Choose SQL when**:\n- Data has complex relationships (users → orders → products)\n- ACID transactions are required (financial, medical, inventory)\n- Data integrity and normalization matter\n- Schema is well-understood and stable\n\n**Choose NoSQL when**:\n- Need horizontal scale at massive volume (billions of writes)\n- Schema changes frequently or is flexible (product catalogs, user settings)\n- Data is naturally hierarchical/nested (one document = one entity)\n- Specific access patterns: key-value lookups (Redis), time-series (InfluxDB), full-text search (Elasticsearch)',
    code: {
      language: 'sql',
      snippet: `-- SQL: normalized tables with JOINs
-- users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL
);

-- orders table (FK to users)
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  total NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- query with JOIN
SELECT u.name, COUNT(o.id) AS order_count
FROM users u
JOIN orders o ON o.user_id = u.id
GROUP BY u.name;`,
    },
  },

  {
    id: 'cmp-e6',
    category: 'Compare & Choose',
    difficulty: 'easy',
    type: 'basics',
    question: '`map` vs `forEach` vs `reduce` — what is the difference, and when do you use each?',
    answer:
      'All three iterate over an array, but they have different purposes and return values.\n\n**`forEach(fn)`**: iterate with side effects. Returns `undefined`. Use when you want to do something with each element (log, send a request) but don\'t need a new array.\n\n**`map(fn)`**: transform each element into a new value. Returns a **new array** of the same length. Use when you want to convert every item. Does not mutate the original.\n\n**`reduce(fn, initial)`**: accumulate elements into a single output value — that output can be a number, string, object, or even an array. The most powerful and general of the three, but hardest to read if overused.\n\n| | `forEach` | `map` | `reduce` |\n|---|---|---|---|\n| Returns | `undefined` | New array | Any value |\n| Use for | Side effects | Transform each item | Accumulate into one value |\n| Mutates original | No | No | No |\n\n**Rule of thumb**: use `map` when transforming, `filter`+`map` for filtering+transforming, `reduce` for aggregation, `forEach` only when you truly just need side effects.',
    code: {
      language: 'javascript',
      snippet: `const nums = [1, 2, 3, 4, 5];

// forEach — side effects, returns undefined
nums.forEach(n => console.log(n * 2)); // logs 2,4,6,8,10

// map — transform each item, returns new array
const doubled = nums.map(n => n * 2);
console.log(doubled); // [2, 4, 6, 8, 10]

// reduce — accumulate into a single value
const sum = nums.reduce((acc, n) => acc + n, 0);
console.log(sum); // 15

// reduce building an object (powerful but use with care)
const freq = ['a','b','a','c','b','a'].reduce((acc, ch) => {
  acc[ch] = (acc[ch] || 0) + 1;
  return acc;
}, {});
console.log(freq); // { a: 3, b: 2, c: 1 }

// Common mistake: using forEach when map is cleaner
// ✗ don't do this
const result = [];
nums.forEach(n => result.push(n * 2));

// ✓ do this
const result2 = nums.map(n => n * 2);`,
    },
  },

  // ─── Compare & Choose (Medium) ───────────────────────────────────────────────

  {
    id: 'cmp-m1',
    category: 'Compare & Choose',
    difficulty: 'medium',
    type: 'basics',
    question: 'JWT vs Sessions — what is the difference, and which do you use for authentication?',
    answer:
      '**Sessions (stateful)**:\n- Server stores session data (in a DB or Redis)\n- Client stores only a session ID in a cookie\n- Every request: server looks up session ID in the store\n- Easy to invalidate instantly (delete the session)\n- Requires session store shared across all servers\n\n**JWT (stateless)**:\n- Server stores NO state — all claims are in the token itself\n- Client stores the token (HttpOnly cookie or memory)\n- Every request: server verifies the cryptographic signature — no DB lookup\n- Hard to invalidate before expiry — requires a token blocklist (which reintroduces state)\n- Works naturally across multiple servers and microservices\n\n| | Sessions | JWT |\n|---|---|---|\n| Server state | Stored in DB/Redis | None |\n| Invalidation | Instant (delete session) | Hard (blocklist needed) |\n| Scaling | Needs shared session store | Stateless — easy |\n| Best for | Traditional web apps | APIs, microservices, SPAs |\n\n**Use Sessions when**: you need instant token revocation (admin banning a user mid-session), building a traditional server-rendered web app.\n\n**Use JWT when**: API consumed by mobile/SPA clients, microservices where multiple services need to verify identity without a DB call, or when horizontal scaling is important.',
    code: {
      language: 'javascript',
      snippet: `// ── Sessions ─────────────────────────────────────────────────────
// Server stores: { "sessionId-abc123": { userId: 42, role: "admin" } }
// Client cookie: sessionId=abc123

app.post('/login', async (req, res) => {
  const user = await validateCredentials(req.body);
  req.session.userId = user.id;    // stored server-side
  res.json({ ok: true });
});

// Revoke: just delete from store
app.post('/logout', (req, res) => {
  req.session.destroy();  // instant revocation
  res.json({ ok: true });
});

// ── JWT ──────────────────────────────────────────────────────────
// Server stores: nothing
// Client stores token: eyJhbGciOiJIUzI1NiJ9...

app.post('/login', async (req, res) => {
  const user = await validateCredentials(req.body);
  const token = jwt.sign(
    { userId: user.id, role: user.role }, // payload (public)
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  res.json({ token });
});

// Verify on each request — no DB lookup
app.get('/profile', (req, res) => {
  const payload = jwt.verify(req.headers.authorization?.split(' ')[1], secret);
  res.json({ userId: payload.userId });
});`,
    },
  },

  {
    id: 'cmp-m2',
    category: 'Compare & Choose',
    difficulty: 'medium',
    type: 'basics',
    question: 'REST vs GraphQL — what is the difference, and which do you choose?',
    answer:
      '**REST**: multiple endpoints, each returning a fixed data shape defined by the server. Clients take what the server gives them.\n\n**GraphQL**: single endpoint, clients send a query describing exactly the fields they want. The server resolves only those fields.\n\n| | REST | GraphQL |\n|---|---|---|\n| Endpoints | One per resource | One (`/graphql`) |\n| Data shape | Server-defined | Client-defined |\n| Over-fetching | Common | Eliminated |\n| Under-fetching / N+1 | Common (multiple requests) | Solved with one query |\n| HTTP caching | Works naturally (GET) | Hard (all POSTs) |\n| Learning curve | Low | Higher (schema, resolvers) |\n| Tooling | Mature | Growing |\n\n**Use REST when**:\n- Building public APIs (simple to consume, familiar to all clients)\n- HTTP caching of responses matters\n- Simple CRUD with predictable data shapes\n- Team or consumers are not familiar with GraphQL\n\n**Use GraphQL when**:\n- Frontend has many different views that need different slices of the same data\n- Mobile clients need to minimize bandwidth (request only what\'s needed)\n- Multiple teams/clients consume your API with different data requirements\n- Rapid frontend iteration where data requirements change often',
    code: {
      language: 'javascript',
      snippet: `// ── REST — server controls shape ─────────────────────────────────

// GET /users/1 → returns full user object (may include fields you don't need)
// GET /users/1/posts → second round-trip (under-fetching)
// GET /users/1/posts/5/comments → third round-trip

// ── GraphQL — client controls shape ──────────────────────────────

// Single request for exactly what you need
const query = \`
  query {
    user(id: "1") {
      name                   # only name, not email/phone/etc.
      posts(limit: 5) {
        title
        comments(limit: 3) {
          body
          author { name }
        }
      }
    }
  }
\`;

// One round-trip, no over-fetching, no under-fetching
fetch('/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query }),
});`,
    },
  },

  {
    id: 'cmp-m3',
    category: 'Compare & Choose',
    difficulty: 'medium',
    type: 'basics',
    question: '`require()` (CommonJS) vs `import` (ES Modules) — what is the difference, and which do you use in Node.js?',
    answer:
      '**CommonJS (`require`)**:\n- Loads modules **synchronously** at runtime\n- Dynamic — you can `require()` inside an `if` block or function\n- `module.exports` / `require()`\n- `__dirname`, `__filename` are available\n- Default in Node.js for years; still the majority of npm packages\n\n**ES Modules (`import`)**:\n- **Static** — imports are resolved at parse time, not runtime. Cannot be inside conditionals\n- Enables **tree-shaking** (bundlers remove unused exports)\n- Supports **top-level `await`**\n- No `__dirname` / `__filename` — use `import.meta.url` instead\n- The official JavaScript standard; browser-native\n\n| | CommonJS | ES Modules |\n|---|---|---|\n| Loading | Synchronous | Asynchronous capable |\n| Dynamic imports | `require()` anywhere | `import()` (dynamic, returns Promise) |\n| `__dirname` | Available | Use `import.meta.url` |\n| Tree-shaking | No | Yes |\n| Top-level await | No | Yes |\n\n**Use ESM for new projects**: set `"type": "module"` in `package.json`. Use `.js` extension for ESM files, `.cjs` for CommonJS files.\n\n**Mixing them is painful**: `import` cannot `require()` a CJS module directly in all cases — check package compatibility.',
    code: {
      language: 'javascript',
      snippet: `// ── CommonJS ─────────────────────────────────────────────────────
const path = require('path');
const { readFile } = require('fs/promises');

// Dynamic — require inside a condition is valid
if (process.env.DEBUG) {
  const debugTool = require('./debug');
}

// __dirname works
const config = require(path.join(__dirname, 'config.json'));

module.exports = { myFunction };
module.exports.myConst = 42;

// ── ES Modules ────────────────────────────────────────────────────
import path from 'path';
import { readFile } from 'fs/promises';

// Static imports must be at the top level
// import x from './x'; ← inside an if-block would be a SyntaxError

// __dirname equivalent
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

export function myFunction() {}
export const myConst = 42;
export default { myFunction };

// Dynamic import — lazy load (works in both CJS and ESM)
const module = await import('./heavy-module.js'); // returns Promise`,
    },
  },

  {
    id: 'cmp-m4',
    category: 'Compare & Choose',
    difficulty: 'medium',
    type: 'basics',
    question: 'ORM vs Raw SQL — what is the difference, and which do you use?',
    answer:
      '**ORM (Prisma, TypeORM, Sequelize)**:\n- Write database queries in TypeScript/JavaScript — the ORM generates SQL\n- Type safety, autocomplete, auto-migrations\n- No SQL injection risk (queries are parameterized internally)\n- Easier to swap databases\n- **Risk**: N+1 query problem with lazy loading, complex joins become awkward, abstraction hides what SQL is being executed\n\n**Raw SQL (with parameterized queries)**:\n- Full control over every query — write exactly the SQL you need\n- Optimal performance, no overhead\n- Complex CTEs, window functions, EXPLAIN ANALYZE — all natural\n- **Risk**: verbose, SQL injection if you ever use string interpolation, no type safety by default (use `pg` with typed queries or `sql` tagged template literals)\n\n| | ORM | Raw SQL |\n|---|---|---|\n| Type safety | Built-in | Needs extra setup |\n| Complex queries | Awkward | Natural |\n| Performance | Some overhead | Optimal |\n| SQL injection | Protected | Protected if parameterized |\n| Learning curve | Medium | SQL knowledge required |\n\n**Use ORM for**: standard CRUD, rapid development, teams not strong in SQL.\n**Use raw SQL for**: complex reporting queries, data migrations, performance-critical paths.\n**Best practice**: use ORM for 90% of queries, drop to raw SQL for the ones that need it.',
    code: {
      language: 'typescript',
      snippet: `// ── ORM (Prisma) ────────────────────────────────────────────────
// Clean, type-safe, but generates SQL you don't control
const users = await prisma.user.findMany({
  where: { active: true },
  include: { orders: true },  // ← triggers a JOIN (or separate query depending on config)
  orderBy: { createdAt: 'desc' },
  take: 10,
});

// N+1 problem with ORMs (without eager loading)
const users2 = await prisma.user.findMany();
for (const user of users2) {
  const orders = await prisma.order.findMany({ where: { userId: user.id } });
  // ← N+1: 1 query for users + N queries for orders (one per user) ✗
}

// ── Raw SQL (using postgres.js or pg) ────────────────────────────
import postgres from 'postgres';
const sql = postgres(process.env.DATABASE_URL);

// Parameterized — safe from SQL injection
const users3 = await sql\`
  SELECT u.id, u.name, COUNT(o.id) AS order_count
  FROM users u
  LEFT JOIN orders o ON o.user_id = u.id
  WHERE u.active = true
  GROUP BY u.id, u.name
  ORDER BY order_count DESC
  LIMIT 10
\`;

// ✓ Use tagged template literals — postgres.js auto-parameterizes`,
    },
  },

  {
    id: 'cmp-m5',
    category: 'Compare & Choose',
    difficulty: 'medium',
    type: 'basics',
    question: '`Promise.race` vs `Promise.any` — what is the difference, and when do you use each?',
    answer:
      'Both settle as soon as one of the input promises settles, but they differ in what triggers them.\n\n**`Promise.race(promises)`**:\n- Settles (resolve **or** reject) as soon as the **first** promise settles, regardless of outcome\n- If the first to settle is a rejection, `Promise.race` rejects\n- Use for: **timeout patterns** — race a real operation against a timeout promise\n\n**`Promise.any(promises)`**:\n- Resolves as soon as the **first** promise **resolves** (ignores rejections)\n- Only rejects if **all** promises reject (throws `AggregateError`)\n- Use for: **fastest successful result** — try multiple sources, take whichever succeeds first\n\n| | `Promise.race` | `Promise.any` |\n|---|---|---|\n| Wins on | First settle (resolve or reject) | First **resolve** |\n| On all reject | Rejects with first rejection | Rejects with `AggregateError` |\n| Use for | Timeouts | Fastest successful result |',
    code: {
      language: 'javascript',
      snippet: `// Promise.race — settles with the first to finish (win or fail)
const timeout = (ms) => new Promise((_, reject) =>
  setTimeout(() => reject(new Error('Timeout')), ms)
);

// ✓ Timeout pattern: reject if fetchUser takes > 3s
const user = await Promise.race([
  fetchUser(id),
  timeout(3000),
]);

// If fetchUser resolves first → user = result
// If timeout fires first → throws Error('Timeout')

// ─────────────────────────────────────────────────────────────────

// Promise.any — resolves with the FIRST success, ignores failures
const mirrors = ['https://cdn1.example.com', 'https://cdn2.example.com'];

// ✓ Fastest CDN pattern: use whichever mirror responds first
const data = await Promise.any(
  mirrors.map(url => fetch(url).then(r => r.json()))
);

// If cdn1 is slow but cdn2 is fast → uses cdn2
// If cdn1 fails but cdn2 succeeds → uses cdn2 (race ignores the failure)
// Only rejects if BOTH fail

// Promise.any rejects with AggregateError if ALL fail
try {
  await Promise.any([Promise.reject('a'), Promise.reject('b')]);
} catch (err) {
  console.log(err instanceof AggregateError); // true
  console.log(err.errors); // ['a', 'b']
}`,
    },
  },

  {
    id: 'cmp-m6',
    category: 'Compare & Choose',
    difficulty: 'medium',
    type: 'basics',
    question: 'Cookies vs `localStorage` vs `sessionStorage` — what is the difference, and where do you store auth tokens?',
    answer:
      '| | Cookies | `localStorage` | `sessionStorage` |\n|---|---|---|---|\n| Lifespan | Set by server (or manually) | Until manually cleared | Until tab closes |\n| Capacity | ~4 KB | ~5–10 MB | ~5–10 MB |\n| Sent to server | Automatically with every request | No | No |\n| JavaScript access | Yes (unless `HttpOnly`) | Yes | Yes |\n| XSS risk | Low if `HttpOnly` | **High** (JS can read it) | **High** |\n| CSRF risk | Yes (mitigate with `SameSite`) | No | No |\n\n**For auth tokens — always use `HttpOnly` cookies**:\n- `HttpOnly`: JavaScript cannot read the cookie → XSS attack cannot steal the token\n- `Secure`: only sent over HTTPS\n- `SameSite=Strict/Lax`: prevents CSRF\n\n**Never store JWTs in `localStorage`**: any XSS vulnerability (yours, a third-party script, browser extension) can read it and exfiltrate the token. This is a well-documented security anti-pattern.\n\n**`localStorage`** is fine for non-sensitive user preferences (theme, language, layout).\n\n**`sessionStorage`** is fine for per-tab state (multi-step form data, wizard progress).',
    code: {
      language: 'typescript',
      snippet: `// ✗ NEVER do this — localStorage is readable by any JS on the page
localStorage.setItem('token', jwt); // XSS can steal this

// ✓ Set token as an HttpOnly cookie from the server
// Express example:
app.post('/login', async (req, res) => {
  const token = generateJWT(user);
  res.cookie('access_token', token, {
    httpOnly: true,   // JS cannot read this cookie
    secure: true,     // only sent over HTTPS
    sameSite: 'lax',  // prevents CSRF from cross-site POST requests
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.json({ ok: true });
});

// The browser sends the cookie automatically on every same-site request
// Your API reads it from req.cookies, not from Authorization header

// ✓ localStorage for non-sensitive preferences
localStorage.setItem('theme', 'dark');
localStorage.setItem('language', 'en');

// ✓ sessionStorage for per-tab, temporary state
sessionStorage.setItem('checkoutStep', '2');
// clears automatically when the tab is closed`,
    },
  },

  // ─── Compare & Choose (Hard) ─────────────────────────────────────────────────

  {
    id: 'cmp-h1',
    category: 'Compare & Choose',
    difficulty: 'hard',
    type: 'experience',
    question: 'Monolith vs Microservices — what is the difference, and which architecture do you choose?',
    answer:
      '**Monolith**: a single deployable unit. All features live in one codebase, one process, one database.\n\n**Microservices**: multiple independently deployable services, each owning its own data store, communicating over HTTP/messaging.\n\n| | Monolith | Microservices |\n|---|---|---|\n| Deployment | Single unit | Each service independently |\n| Scaling | Scale entire app | Scale specific services |\n| Development speed | Fast initially | Slower (distributed system complexity) |\n| Debugging | Easy (one process) | Hard (distributed traces, network failures) |\n| Technology | One stack | Different stack per service |\n| Team size | Small to medium | Multiple teams, one per service |\n| Operational complexity | Low | High (K8s, service mesh, distributed tracing) |\n\n**Start with a monolith** — this is the right default for most new products. Monoliths are simpler to build, test, debug, and deploy. Premature microservices create distributed system complexity before you understand your domain boundaries.\n\n**Move to microservices when**:\n- Specific parts need independent scaling (payments needs 10× the capacity of user profiles)\n- Multiple teams are stepping on each other in the same codebase\n- Different parts need different technology stacks\n- You have the DevOps maturity to run Kubernetes, distributed tracing, and on-call rotation\n\n**Strangler Fig pattern**: gradually extract microservices from a monolith without a risky big-bang rewrite.',
    code: {
      language: 'typescript',
      snippet: `// ── Monolith: direct function calls within one process ───────────
// UserService and OrderService live in the same app
import { UserService } from './users/user.service';
import { OrderService } from './orders/order.service';

// Creating an order is a simple in-process call — synchronous, typed
const user = await userService.findById(userId);
const order = await orderService.create({ userId, items });
// Errors propagate normally. No network. No serialization.

// ── Microservices: services communicate over the network ──────────
// users-service (port 3001), orders-service (port 3002)

// orders-service must call users-service over HTTP or a message queue
async function createOrder(userId: string, items: Item[]) {
  // Network call — can fail, timeout, return stale data
  const user = await fetch(\`http://users-service/users/\${userId}\`);
  if (!user.ok) throw new Error('User service unavailable');

  // Now create the order
  return orderRepository.create({ userId, items });
}

// Must now handle: retries, timeouts, circuit breakers,
// idempotency, distributed transactions, and tracing`,
    },
  },

  {
    id: 'cmp-h2',
    category: 'Compare & Choose',
    difficulty: 'hard',
    type: 'experience',
    question: 'Message Queue vs Synchronous API call — when do you use each?',
    answer:
      '**Synchronous API call**: caller makes a request and **waits** for the response before continuing. Tight coupling between services.\n\n**Message Queue (async)**: caller publishes a message and **continues immediately**. A consumer processes it independently, at its own pace.\n\n| | Sync API | Message Queue |\n|---|---|---|\n| Caller waits | Yes | No |\n| Coupling | Tight | Loose |\n| Traffic spikes | Caller is blocked | Queue absorbs the spike |\n| Failure handling | Caller gets error | Message can be retried/DLQ |\n| Complexity | Low | Higher (idempotency, ordering, DLQ) |\n| Observability | Easier | Harder (async flow) |\n\n**Use synchronous API when**:\n- The caller needs the result to continue (user login, payment confirmation, inventory check before placing order)\n- Latency is critical and the operation is fast\n- Request-response pattern makes logical sense\n\n**Use a message queue when**:\n- The operation can happen asynchronously (send email, generate PDF, resize image, process webhook)\n- You need to absorb traffic spikes (don\'t want to block users while 10,000 emails send)\n- The producer and consumer should scale independently\n- You need retry logic and a dead-letter queue for failed jobs\n- Cross-service events that multiple consumers may listen to (order placed → notify inventory, billing, shipping)',
    code: {
      language: 'typescript',
      snippet: `// ── Synchronous — use when caller NEEDS the result ───────────────
app.post('/checkout', async (req, res) => {
  // Synchronous: must check inventory BEFORE confirming the order
  const inStock = await inventoryService.check(req.body.itemId);
  if (!inStock) return res.status(409).json({ error: 'Out of stock' });

  const order = await orderService.create(req.body);
  res.status(201).json(order); // return result immediately
});

// ── Message Queue — use for async work ────────────────────────────
app.post('/checkout', async (req, res) => {
  const order = await orderService.create(req.body);

  // Publish events — fire and forget, no waiting
  await queue.publish('order.created', {
    orderId: order.id,
    userId: order.userId,
    items: order.items,
  });

  res.status(201).json(order); // respond immediately

  // Meanwhile, separate consumers handle:
  // - send confirmation email      (email-service)
  // - update inventory             (inventory-service)
  // - generate invoice PDF         (billing-service)
  // - notify shipping              (fulfillment-service)
  // Each runs independently, retries on failure, scales separately
});`,
    },
  },

  {
    id: 'cmp-h3',
    category: 'Compare & Choose',
    difficulty: 'hard',
    type: 'experience',
    question: 'Strong consistency vs Eventual consistency — what is the difference, and which do you choose?',
    answer:
      '**Strong consistency**: after a write completes, every subsequent read from any node returns that new value. All clients see the same data at the same time. Higher latency (must coordinate all nodes before acknowledging the write).\n\n**Eventual consistency**: after a write, different nodes may return different (stale) values for a period of time. Eventually (seconds to milliseconds), all nodes converge to the same value. Lower latency, higher availability.\n\n**CAP Theorem**: a distributed system can only guarantee 2 of 3 properties: **C**onsistency, **A**vailability, **P**artition tolerance. Since network partitions are inevitable, you choose CP or AP.\n\n| | Strong Consistency | Eventual Consistency |\n|---|---|---|\n| Reads | Always latest value | May return stale data |\n| Latency | Higher | Lower |\n| Availability | Lower | Higher |\n| Examples | PostgreSQL, transactions | DynamoDB, Cassandra, DNS |\n\n**Use strong consistency when**:\n- Financial transactions (balance must be accurate)\n- Inventory (cannot oversell)\n- Authentication (revoked token must be immediately invalid)\n- Any data where stale reads cause business harm\n\n**Use eventual consistency when**:\n- Social media likes, view counts (a few seconds of lag is fine)\n- Analytics and metrics aggregation\n- User profile data read by recommendation engines\n- DNS record propagation\n- Any counter/aggregate that can tolerate brief inconsistency',
    code: {
      language: 'typescript',
      snippet: `// ── Strong consistency — PostgreSQL transaction ───────────────────
// Transfer $100: both debit and credit must happen atomically
// Any reader after this transaction sees the correct balance
await prisma.$transaction(async (tx) => {
  await tx.account.update({
    where: { id: fromId },
    data: { balance: { decrement: 100 } },
  });
  await tx.account.update({
    where: { id: toId },
    data: { balance: { increment: 100 } },
  });
  // If anything throws, both operations are rolled back
});
// After commit: every read returns updated balance — guaranteed

// ── Eventual consistency — DynamoDB / Redis counter ───────────────
// Incrementing a post's view count
// Multiple servers write to different replicas simultaneously
await redis.incr(\`post:\${postId}:views\`);
// Different clients may see 1,247 vs 1,249 vs 1,251 for a few ms
// That's fine — nobody cares if a view count is off by 2 for a second

// Real-world pattern: write to eventually-consistent store,
// use a strongly-consistent store for critical data
await Promise.all([
  db.order.create({ data: order }),          // PostgreSQL — strong
  redis.incr('analytics:orders_today'),      // Redis — eventual OK
  queue.publish('order.created', order),     // async notification
]);`,
    },
  },

  {
    id: 'cmp-h4',
    category: 'Compare & Choose',
    difficulty: 'hard',
    type: 'experience',
    question: 'Horizontal scaling vs Vertical scaling — what is the difference, and when does each hit its limit?',
    answer:
      '**Vertical scaling (scale up)**: give the existing machine more resources — more CPU cores, more RAM, faster disk. Simple: no code changes required.\n\n**Horizontal scaling (scale out)**: add more machines running the same service behind a load balancer. Requires the application to be stateless (no local session, no local file storage).\n\n| | Vertical | Horizontal |\n|---|---|---|\n| Approach | Bigger machine | More machines |\n| Code changes | None | App must be stateless |\n| Cost | Expensive at the top | Cheaper at scale |\n| Single point of failure | Yes | No (redundancy) |\n| Limit | Physical hardware ceiling | Theoretically unlimited |\n| Complexity | Low | High (load balancer, distributed state) |\n\n**Vertical hits its limit when**: you reach the largest available machine (diminishing returns, very expensive). A single machine is also a single point of failure.\n\n**Horizontal hits its limit when**: the **database** becomes the bottleneck — stateless app servers scale easily, but databases require read replicas, connection pooling (PgBouncer), and eventually sharding to scale writes.\n\n**Strategy in practice**:\n1. Vertical scale first — it is fast and requires no architecture changes\n2. When you hit the machine ceiling or need redundancy, go horizontal\n3. When the DB is the bottleneck: add read replicas → add caching → connection pooling → sharding',
    code: {
      language: 'typescript',
      snippet: `// ── Vertical scaling: no code change needed ──────────────────────
// Just resize the server instance in AWS/GCP/Azure console
// t3.medium (2 vCPU, 4GB) → c5.4xlarge (16 vCPU, 32GB)

// ── Horizontal scaling: app must be STATELESS ─────────────────────

// ✗ Stateful — breaks with multiple servers
// Server 1 stores sessions in memory → Server 2 has no idea about them
app.use(session({ store: new MemoryStore() })); // each server has its own sessions

// ✓ Stateless — works across multiple servers
// Move sessions to Redis — shared across all servers
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
}));

// ✓ Or use JWT — no server-side state at all
// Any server can verify the JWT signature independently

// ── Database horizontal scaling pattern ───────────────────────────
// Read replicas for read-heavy workloads
const writeDb = postgres(process.env.DATABASE_PRIMARY_URL);
const readDb  = postgres(process.env.DATABASE_REPLICA_URL);

async function getUser(id: string) {
  return readDb\`SELECT * FROM users WHERE id = \${id}\`; // replica
}

async function createUser(data: UserDto) {
  return writeDb\`INSERT INTO users ... RETURNING *\`;    // primary
}`,
    },
  },
];
