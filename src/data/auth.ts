import type { Flashcard } from '../types';

export const authCards: Flashcard[] = [

  // ─── Auth & Security (Senior) ────────────────────────────────────────────────

  {
    id: 'auth-1',
    category: 'Auth & Security',
    difficulty: 'hard',
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
    question: 'What is the difference between authentication and authorization?',
    answer:
      "**Authentication (AuthN)**: *Who are you?* — verifying the identity of a user.\n- How: password, OAuth token, API key, biometrics\n- Result: 'You are Alice (user ID 42)'\n\n**Authorization (AuthZ)**: *What are you allowed to do?* — checking whether the authenticated user has permission to perform an action.\n- How: role checks, ACLs, policy engines (Casbin, OPA)\n- Result: 'Alice has the admin role, so she can delete posts'\n\n**The order always matters**: authenticate first, then authorise.\n- `401 Unauthorized` → not authenticated\n- `403 Forbidden` → authenticated but not allowed\n\n**Common mistake**: returning 401 with the message 'You are not authorized' — mix-up of terms that confuses clients.",
  },

  {
    id: 'auth-e2',
    category: 'Auth & Security',
    difficulty: 'easy',
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
    id: 'auth-m1',
    category: 'Auth & Security',
    difficulty: 'medium',
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
