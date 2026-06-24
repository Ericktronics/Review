import type { Flashcard } from '../types';

export const authCards: Flashcard[] = [

  // ─── Auth & Security (Senior) ────────────────────────────────────────────────

  {
    id: 'auth-1',
    category: 'Auth & Security',
    difficulty: 'hard',
    type: 'experience',
    question: 'Explain the OAuth 2.0 Authorization Code flow with PKCE. Why is PKCE required for SPAs and mobile apps?',
    answer:
      '**Authorization Code flow steps**:\n1. App redirects user to Auth Server with `response_type=code`, `client_id`, `redirect_uri`, `scope`, `state` (CSRF token)\n2. User authenticates; Auth Server redirects back with `code`\n3. App exchanges `code` for `access_token` + `refresh_token` via back-channel POST (includes `client_secret`)\n4. App uses `access_token` to call the Resource Server\n\n**Why PKCE for public clients**: SPAs and mobile apps cannot keep a `client_secret` safe — it would be visible in source code or app binaries. PKCE (Proof Key for Code Exchange) replaces the secret with a one-time `code_verifier`/`code_challenge` pair:\n- Client generates random `code_verifier`, hashes it to `code_challenge` (S256)\n- `code_challenge` is sent with the auth request\n- `code_verifier` is sent with the token exchange\n- Auth Server validates the pair — no secret needed',
    code: {
      language: 'typescript',
      snippet: `import { randomBytes, createHash } from 'crypto';

// Step 1: Generate PKCE pair
function generatePKCE() {
  const verifier = randomBytes(32).toString('base64url');
  const challenge = createHash('sha256')
    .update(verifier)
    .digest('base64url');
  return { verifier, challenge };
}

const { verifier, challenge } = generatePKCE();
sessionStorage.setItem('pkce_verifier', verifier);

const authUrl = new URL('https://auth.example.com/authorize');
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('client_id', CLIENT_ID);
authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
authUrl.searchParams.set('code_challenge', challenge);
authUrl.searchParams.set('code_challenge_method', 'S256');
authUrl.searchParams.set('state', randomBytes(16).toString('hex'));
window.location.href = authUrl.toString();`,
    },
  },

  {
    id: 'auth-2',
    category: 'Auth & Security',
    difficulty: 'hard',
    type: 'experience',
    question: 'What is refresh token rotation and how do you implement secure token revocation?',
    answer:
      '**Refresh token rotation**: every time a refresh token is used to get a new access token, a new refresh token is also issued and the old one is invalidated.\n\n**Reuse detection**: if an old (already-rotated) refresh token is used, it signals a **token theft**. Revoke the entire refresh token family for that user and force re-authentication.\n\n**Revocation strategies**:\n- **Denylist in Redis**: store revoked JTI (JWT ID) claims until expiry. Check on every request. Works but adds a Redis lookup per request\n- **Short access token TTL + rotation**: 15-min access tokens + refresh token rotation. Stolen access tokens expire quickly; stolen refresh tokens are detected via reuse\n- **Opaque refresh tokens in httpOnly cookies**: refresh tokens are opaque (random) and looked up in a DB/cache. Revocation is immediate — just delete the row',
    code: {
      language: 'typescript',
      snippet: `// Refresh token rotation with family-based revocation
async function rotateRefreshToken(oldToken: string): Promise<Tokens> {
  const stored = await db.refreshToken.findUnique({
    where: { token: hash(oldToken) },
  });

  if (!stored) throw new UnauthorizedException('Invalid refresh token');

  if (stored.usedAt) {
    // Token reuse detected → revoke entire family
    await db.refreshToken.deleteMany({ where: { familyId: stored.familyId } });
    throw new UnauthorizedException('Token reuse detected – please log in again');
  }

  // Mark old token as used (not deleted yet – needed for reuse detection window)
  await db.refreshToken.update({
    where: { id: stored.id },
    data: { usedAt: new Date() },
  });

  // Issue new access + refresh token pair
  const newRefresh = randomBytes(32).toString('hex');
  await db.refreshToken.create({
    data: { token: hash(newRefresh), familyId: stored.familyId, userId: stored.userId },
  });

  const accessToken = jwt.sign({ sub: stored.userId }, JWT_SECRET, { expiresIn: '15m' });
  return { accessToken, refreshToken: newRefresh };
}`,
    },
  },

  {
    id: 'auth-3',
    category: 'Auth & Security',
    difficulty: 'hard',
    type: 'experience',
    question: 'What are the OWASP API Security Top 10 risks most relevant to a Node.js backend? How do you mitigate them?',
    answer:
      '1. **Broken Object Level Authorization (BOLA/IDOR)** — always verify the requesting user owns the resource, not just that the route requires auth\n2. **Broken Authentication** — use short-lived JWTs + refresh rotation; store tokens in httpOnly cookies; enforce MFA for sensitive actions\n3. **Broken Object Property Level Authorization** — never mass-assign request body directly to DB; use allowlists (`Pick<>`) for what fields users can update\n4. **Unrestricted Resource Consumption** — rate limit all endpoints; paginate lists; limit request body size; add timeouts to DB queries\n5. **Broken Function Level Authorization** — separate admin routes; check role on every privileged operation, not just at the route level\n6. **Injection** — use parameterized queries; validate all input with Zod/Joi; never build queries with string concatenation\n7. **Security Misconfiguration** — remove default credentials; disable stack traces in production; set security headers (Helmet); restrict CORS origins',
    code: {
      language: 'typescript',
      snippet: `// BOLA fix: always scope to the requesting user
// BAD
app.get('/invoices/:id', auth, async (req, res) => {
  const invoice = await db.invoice.findUnique({ where: { id: req.params.id } });
  res.json(invoice); // any user can fetch any invoice!
});

// GOOD
app.get('/invoices/:id', auth, async (req, res) => {
  const invoice = await db.invoice.findUnique({
    where: { id: req.params.id, userId: req.user.id }, // scoped!
  });
  if (!invoice) return res.status(404).json({ error: 'Not found' });
  res.json(invoice);
});

// Mass assignment fix
app.patch('/users/:id', auth, async (req, res) => {
  // Never: await db.user.update({ data: req.body })
  const safe = updateUserSchema.parse(req.body); // Zod allowlist
  await db.user.update({ where: { id: req.user.id }, data: safe });
});`,
    },
  },

  {
    id: 'auth-4',
    category: 'Auth & Security',
    difficulty: 'hard',
    type: 'experience',
    question: 'What security headers should every production Node.js API set, and what does each header protect against?',
    answer:
      '- **Strict-Transport-Security (HSTS)** — forces HTTPS for the specified duration; prevents SSL stripping attacks\n- **X-Content-Type-Options: nosniff** — prevents browsers from MIME-sniffing a response away from the declared Content-Type\n- **X-Frame-Options: DENY** — prevents clickjacking by disallowing the page in an iframe\n- **Content-Security-Policy (CSP)** — allowlist of sources for scripts, styles, images; primary XSS defence for HTML responses\n- **Referrer-Policy: strict-origin-when-cross-origin** — controls how much referrer info is sent; prevents leaking sensitive URL params\n- **Permissions-Policy** — disables browser features (camera, geolocation) the app doesn\'t need\n- **Cache-Control: no-store** — on authenticated endpoints; prevents sensitive data from being cached by proxies/browsers',
    code: {
      language: 'typescript',
      snippet: `import helmet from 'helmet';

app.use(helmet({
  // HSTS: enforce HTTPS for 1 year
  hsts: { maxAge: 31_536_000, includeSubDomains: true, preload: true },

  // CSP: lock down resource origins
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"], // relax if needed
      imgSrc:     ["'self'", 'data:', 'https://cdn.example.com'],
      connectSrc: ["'self'", 'https://api.example.com'],
      frameAncestors: ["'none'"],
    },
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

// No caching for authenticated API responses
app.use('/api', (_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});`,
    },
  },

  // ─── Auth & Security (Easy) ──────────────────────────────────────────────────

  {
    id: 'auth-e1',
    category: 'Auth & Security',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is the difference between authentication and authorization?',
    answer:
      "**Authentication (AuthN)**: *Who are you?* — verifying the identity of a user.\n- How: password, OAuth token, API key, biometrics\n- Result: 'You are Alice (user ID 42)'\n\n**Authorization (AuthZ)**: *What are you allowed to do?* — checking whether the authenticated user has permission to perform an action.\n- How: role checks, ACLs, policy engines (Casbin, OPA)\n- Result: 'Alice has the admin role, so she can delete posts'\n\n**The order always matters**: authenticate first, then authorise.\n- `401 Unauthorized` → not authenticated\n- `403 Forbidden` → authenticated but not allowed\n\n**Common mistake**: returning 401 with the message 'You are not authorized' — mix-up of terms that confuses clients.",
  },

  {
    id: 'auth-e2',
    category: 'Auth & Security',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is a JWT (JSON Web Token)? What are its three parts?',
    answer:
      'A JWT is a **compact, self-contained token** that encodes claims as a Base64-URL-encoded JSON payload, signed with a secret or private key.\n\n**Structure**: `header.payload.signature` (three Base64-URL segments separated by `.`)\n- **Header**: algorithm + token type `{ "alg": "HS256", "typ": "JWT" }`\n- **Payload**: claims — `{ "sub": "user-42", "role": "admin", "exp": 1716000000 }`\n- **Signature**: `HMACSHA256(base64(header) + "." + base64(payload), secret)` — prevents tampering\n\n**Important**: the payload is encoded, **not encrypted** — anyone can decode and read it. Never store passwords or sensitive PII in a JWT.\n\n**Verification**: re-compute the signature with your secret and compare. Also check `exp`, `iss`, and `aud` claims.',
    code: {
      language: 'typescript',
      snippet: `import jwt from 'jsonwebtoken';
const SECRET = process.env.JWT_SECRET!;

// Sign
const token = jwt.sign(
  { sub: 'user-42', role: 'admin' },
  SECRET,
  { expiresIn: '1h' },
);

// Verify — throws on invalid signature or expiry
try {
  const payload = jwt.verify(token, SECRET) as { sub: string; role: string };
  console.log(payload.sub); // user-42
} catch {
  console.error('Invalid or expired token');
}`,
    },
  },

  // ─── Auth & Security (Medium) ────────────────────────────────────────────────

  {
    id: 'auth-e3',
    category: 'Auth & Security',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is HTTPS and why is it important?',
    answer:
      "**HTTPS (HTTP Secure)** is HTTP transmitted over a **TLS (Transport Layer Security)** connection. The data exchanged between client and server is encrypted and verified.\n\n**What HTTPS provides**:\n- **Encryption** — data in transit is unreadable to eavesdroppers (e.g. on public Wi-Fi)\n- **Authentication** — the client verifies it is talking to the real server (not an impersonator) via the server's TLS certificate signed by a trusted Certificate Authority\n- **Integrity** — data cannot be tampered with in transit without detection\n\n**Why it is important for APIs**:\n- Tokens, passwords, and sensitive data in request/response bodies are exposed in plaintext over HTTP\n- Browsers block mixed content and warn on non-HTTPS sites\n- HTTP/2 (faster) only works over TLS in practice\n- Required by regulations (GDPR, PCI DSS) for sensitive data\n\n**In production**: always terminate TLS — either at a load balancer/CDN (most common) or on the server itself with a certificate from Let's Encrypt.",
  },

  {
    id: 'auth-e4',
    category: 'Auth & Security',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is a session vs a token? (Stateful vs stateless auth)',
    answer:
      "**Session-based (stateful)**:\n- On login, the server creates a session record in a database or Redis and sends back a `session_id` in a cookie\n- On each request, the server looks up the `session_id` to fetch user data\n- **Stateful** — the server must store session state\n- Revocation is instant (delete the session record)\n- Scales poorly if sessions are in-memory (must use sticky sessions or shared Redis)\n\n**Token-based (stateless)**:\n- On login, the server creates a signed JWT containing the user's claims and sends it to the client\n- On each request, the client sends the JWT; the server **verifies the signature** — no DB lookup needed\n- **Stateless** — the server stores nothing; scales horizontally trivially\n- Revocation is hard — the token is valid until it expires (mitigate with short TTLs + refresh token rotation)\n\n**When to use**:\n- Session: traditional web apps with server-rendered HTML, where revocation is important\n- Token/JWT: SPAs, mobile apps, microservices where statelessness is valuable",
    code: {
      language: 'typescript',
      snippet: `// Session-based auth (express-session)
app.use(session({ secret: SESSION_SECRET, resave: false, saveUninitialized: false }));

app.post('/login', async (req, res) => {
  const user = await verifyCredentials(req.body);
  req.session.userId = user.id;  // stored server-side
  res.json({ ok: true });
});

// Token-based auth (JWT)
app.post('/login', async (req, res) => {
  const user = await verifyCredentials(req.body);
  const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
  res.json({ token });  // client stores this, sends it with every request
});

// JWT middleware — no DB lookup needed
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  req.user = jwt.verify(token, JWT_SECRET); // just verify signature
  next();
}`,
    },
  },

  {
    id: 'auth-e5',
    category: 'Auth & Security',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is an API key and when should you use one?',
    answer:
      "An **API key** is a long random string (e.g. `sk_live_abc123...`) that a client sends with every request to identify and authenticate itself.\n\n**How it works**: the server generates a key, stores a hash of it, and the client sends it in a header (e.g. `Authorization: Bearer sk_live_...` or `X-API-Key: ...`). The server hashes the incoming key and compares it to the stored hash.\n\n**When to use API keys**:\n- Machine-to-machine (M2M) communication — a backend service calling another backend service\n- Public APIs where developers need to identify their app (rate limiting, billing)\n- Simple integrations where OAuth is overkill\n\n**When NOT to use API keys**:\n- On behalf of individual users — use OAuth/JWT for user-scoped permissions\n- In browser JavaScript — keys embedded in frontend code are exposed to everyone\n\n**Best practices**:\n- Store only the hash (bcrypt or SHA-256) — never the plaintext key\n- Prefix with an identifier (`sk_live_`, `pk_test_`) so they're easy to detect if leaked\n- Allow key rotation and immediate revocation\n- Scope keys to specific permissions (`read:orders`, `write:products`)",
    code: {
      language: 'typescript',
      snippet: `import { createHash, randomBytes } from 'crypto';

// Generate an API key
function generateApiKey(): { key: string; hash: string } {
  const key = 'sk_' + randomBytes(32).toString('hex');
  const hash = createHash('sha256').update(key).digest('hex');
  return { key, hash }; // store hash in DB; show key once to the user
}

// Validate on each request
async function validateApiKey(rawKey: string): Promise<ApiKeyRecord | null> {
  const hash = createHash('sha256').update(rawKey).digest('hex');
  return db.apiKey.findUnique({ where: { hash } });
}

// Middleware
app.use(async (req, res, next) => {
  const key = req.headers['x-api-key'] as string;
  if (!key) return res.status(401).json({ error: 'API key required' });
  const record = await validateApiKey(key);
  if (!record) return res.status(403).json({ error: 'Invalid API key' });
  req.apiKey = record;
  next();
});`,
    },
  },

  {
    id: 'auth-m3',
    category: 'Auth & Security',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is the difference between symmetric and asymmetric encryption?',
    answer:
      "**Symmetric encryption**: the same key is used to **encrypt and decrypt**. Fast and suitable for large data.\n- Examples: AES-256-GCM\n- Problem: how do you securely share the key with the other party?\n- Used for: encrypting data at rest, encrypted tunnels once a key has been exchanged\n\n**Asymmetric encryption**: uses a mathematically linked **key pair** — a public key (shared freely) and a private key (kept secret).\n- Encrypt with the public key → only the private key can decrypt\n- Sign with the private key → anyone with the public key can verify the signature\n- Examples: RSA, ECDSA, Ed25519\n- Slower than symmetric; used for small data or key exchange\n\n**How TLS combines both**:\n1. Asymmetric crypto (RSA/ECDH) is used to securely exchange a session key\n2. The session key is then used for fast symmetric encryption of all traffic\n\n**JWT RS256 vs HS256**:\n- HS256 (HMAC) — symmetric: same secret for signing and verifying. Simple, fast.\n- RS256 (RSA) — asymmetric: private key signs; public key verifies. Resource servers can verify without the signing secret.",
    code: {
      language: 'typescript',
      snippet: `import { createCipheriv, createDecipheriv, randomBytes, generateKeyPairSync } from 'crypto';

// Symmetric: AES-256-GCM — encrypt/decrypt with same key
const key = randomBytes(32);
const iv  = randomBytes(12);

const cipher = createCipheriv('aes-256-gcm', key, iv);
const encrypted = Buffer.concat([cipher.update('secret data', 'utf8'), cipher.final()]);
const authTag   = cipher.getAuthTag();

const decipher = createDecipheriv('aes-256-gcm', key, iv);
decipher.setAuthTag(authTag);
const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString();

// Asymmetric: RSA key pair — public encrypts, private decrypts
const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });

// JWT: RS256 — service signs with private key; consumers verify with public key
const token = jwt.sign({ sub: userId }, privateKey, { algorithm: 'RS256', expiresIn: '1h' });
jwt.verify(token, publicKey, { algorithms: ['RS256'] });`,
    },
  },

  {
    id: 'auth-m4',
    category: 'Auth & Security',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is SQL injection and how do you prevent it?',
    answer:
      "**SQL injection** is an attack where an attacker inserts malicious SQL code into an input field, and the application executes it as part of a database query.\n\n**How it happens**: string concatenation builds the SQL query with user input directly embedded.\n\n**Impact**: attackers can read all data, delete tables, bypass authentication, or in some configurations execute OS commands.\n\n**Prevention**:\n\n1. **Parameterized queries** (prepared statements) — the query structure is fixed; user input is passed as a separate parameter, never interpolated as SQL text. The DB driver handles escaping.\n\n2. **ORMs** — Prisma, TypeORM generate parameterized queries by default. Dangerous only if you use raw query escape hatches incorrectly.\n\n3. **Input validation** — validate types and lengths, but do NOT rely on this alone for SQL injection prevention.\n\n4. **Least privilege** — the DB user your app connects with should only have SELECT/INSERT/UPDATE/DELETE on specific tables — not DROP TABLE or access to system tables.",
    code: {
      language: 'typescript',
      snippet: `// ✗ VULNERABLE: string concatenation
app.get('/users', async (req, res) => {
  const name = req.query.name;
  // Attacker sends: name = "' OR '1'='1"
  const query = \`SELECT * FROM users WHERE name = '\${name}'\`;
  // Executes: SELECT * FROM users WHERE name = '' OR '1'='1'
  // Returns all rows! Or worse: name = "'; DROP TABLE users;--"
});

// ✓ SAFE: parameterized query with pg
app.get('/users', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE name = $1', // $1 is a placeholder
    [req.query.name],                       // value passed separately
  );
  res.json(rows);
});

// ✓ SAFE: Prisma (parameterized by default)
const users = await prisma.user.findMany({
  where: { name: req.query.name as string },
});

// ✗ UNSAFE even with Prisma: raw query with interpolation
await prisma.$queryRawUnsafe(\`SELECT * FROM users WHERE name = '\${req.query.name}'\`);
// ✓ Use $queryRaw with tagged template instead
await prisma.$queryRaw\`SELECT * FROM users WHERE name = \${req.query.name}\`;`,
    },
  },

  {
    id: 'auth-m1',
    category: 'Auth & Security',
    difficulty: 'medium',
    type: 'basics',
    question: 'Why should you use bcrypt for password hashing instead of SHA-256 or MD5?',
    answer:
      'MD5 and SHA-256 are **general-purpose, fast hash functions** — computable billions of times per second on a GPU, making brute-force and dictionary attacks trivially fast.\n\n**bcrypt** is designed specifically for passwords:\n- **Slow by design**: configurable **cost factor** — doubling it doubles compute time. As hardware gets faster, increase the factor.\n- **Built-in salt**: generates a random salt per password automatically, defeating rainbow table attacks\n- **`bcrypt.compare()` is constant-time**: prevents timing attacks\n\n**Rule of thumb**: cost factor 12 takes ~300 ms per hash on modern hardware — fast enough for login, slow enough to make bulk cracking impractical.\n\n**Alternatives**: Argon2id (Password Hashing Competition winner) is preferred for new projects.',
    code: {
      language: 'typescript',
      snippet: `import bcrypt from 'bcrypt';
const COST = 12; // ~300 ms per hash

// Registration
async function hashPassword(plain: string) {
  return bcrypt.hash(plain, COST);
  // → $2b$12$<22-char salt><31-char hash>
}

// Login — constant-time comparison
async function verifyPassword(plain: string, stored: string) {
  return bcrypt.compare(plain, stored);
}

const hash = await hashPassword('secret123');
await verifyPassword('secret123', hash); // true
await verifyPassword('wrong',     hash); // false`,
    },
  },

  {
    id: 'auth-m2',
    category: 'Auth & Security',
    difficulty: 'medium',
    type: 'basics',
    question: 'What are the OWASP Top 10 vulnerabilities most relevant to a Node.js API?',
    answer:
      '**A01 — Broken Access Control**: not checking authorisation on every endpoint. Fix: enforce role checks in middleware.\n\n**A02 — Cryptographic Failures**: plain-text passwords, no TLS. Fix: bcrypt/Argon2, HTTPS everywhere.\n\n**A03 — Injection**: SQL injection, NoSQL injection, command injection. Fix: parameterised queries, never string-concat user input.\n\n**A05 — Security Misconfiguration**: default credentials, verbose stack traces in responses, CORS `*`, missing security headers.\n\n**A06 — Vulnerable Components**: outdated npm packages with known CVEs. Fix: `npm audit`, Dependabot, pin lockfiles.\n\n**A07 — Identification and Authentication Failures**: no token expiry, weak JWT secrets, no rate limiting on `/login`.\n\n**Quick wins**: add `helmet` (security headers), validate input with `zod`, parameterise all queries, add `express-rate-limit`.',
    code: {
      language: 'typescript',
      snippet: `import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';

app.use(helmet()); // X-Content-Type-Options, CSP, HSTS, etc.

app.use('/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));

// Parameterised query — never concat user input
const { rows } = await pool.query(
  'SELECT * FROM users WHERE email = $1',
  [req.body.email],
);

// Input validation with zod
const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(8).max(128),
});
const body = LoginSchema.parse(req.body); // throws 400 on bad input`,
    },
  },
];
