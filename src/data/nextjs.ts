import type { Flashcard } from '../types';

export const nextjsCards: Flashcard[] = [

  // ─── Next.js (Easy) ──────────────────────────────────────────────────────────

  {
    id: 'next-e1',
    category: 'Next.js',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is Next.js and what problems does it solve over plain React?',
    answer:
      "**Next.js is a React framework** built by Vercel. Plain React renders in the browser (CSR). Next.js adds rendering strategies, file-based routing, API routes, and optimizations — so you don't have to wire them up yourself.\n\n**Problems it solves**:\n- **SEO** — client-side-only React apps have poor SEO because crawlers may not execute JavaScript. Next.js pre-renders HTML on the server or at build time, giving crawlers real content.\n- **Performance** — first meaningful paint is faster because HTML arrives pre-rendered, not assembled by JS.\n- **Routing** — file-based routing out of the box; no React Router to configure.\n- **API routes** — write backend endpoints in the same repo (`/pages/api/*` or `/app/api/*`), no separate Express server needed.\n- **Image and font optimization** — `<Image>` auto-resizes, lazy-loads, and serves WebP. `next/font` zero-layout-shift fonts.\n- **Environment variables** — built-in server/client env var separation (`NEXT_PUBLIC_` prefix for browser).",
    code: {
      language: 'typescript',
      snippet: `// File structure determines routes automatically
// app/
//   page.tsx          → /
//   about/page.tsx    → /about
//   users/[id]/page.tsx → /users/:id  (dynamic route)
//   api/users/route.ts → GET/POST /api/users

// app/users/[id]/page.tsx
export default async function UserPage({ params }: { params: { id: string } }) {
  // This runs on the server — no loading state needed
  const user = await fetch(\`https://api.example.com/users/\${params.id}\`).then(r => r.json());

  return <h1>Hello, {user.name}</h1>;
}`,
    },
  },

  {
    id: 'next-e2',
    category: 'Next.js',
    difficulty: 'easy',
    type: 'basics',
    question: 'Compare the four rendering strategies in Next.js: SSR, SSG, ISR, and CSR.',
    answer:
      "**CSR (Client-Side Rendering)** — the server sends a blank HTML shell; the browser downloads JS and renders. Standard React behavior. Use for: dashboards behind auth, highly interactive UIs where SEO doesn't matter.\n\n**SSG (Static Site Generation)** — HTML generated at **build time**. Blazing fast (CDN-served). Use for: marketing pages, blog posts, docs — content that rarely changes.\n\n**SSR (Server-Side Rendering)** — HTML generated on the **server per request**. Always fresh. Use for: pages with user-specific or frequently-changing data (e-commerce product pages, personalized feeds).\n\n**ISR (Incremental Static Regeneration)** — SSG but with a **revalidation interval**. The page is served statically and regenerated in the background after N seconds. Use for: content that changes occasionally (news articles, product catalogs). Best of SSG performance + SSR freshness.\n\n**In App Router (Next.js 13+)**: these map to `fetch` cache options — `force-cache` (SSG), `no-store` (SSR), `next: { revalidate: 60 }` (ISR).",
    code: {
      language: 'typescript',
      snippet: `// App Router — rendering strategy is set per fetch call

// SSG — cached forever (build-time only)
const data = await fetch('/api/data', { cache: 'force-cache' });

// SSR — never cache, always fresh per request
const data = await fetch('/api/data', { cache: 'no-store' });

// ISR — revalidate every 60 seconds
const data = await fetch('/api/data', { next: { revalidate: 60 } });

// Pages Router equivalents:
// SSG
export async function getStaticProps() {
  const data = await fetchData();
  return { props: { data } };
}

// ISR — revalidate every 60s
export async function getStaticProps() {
  return { props: { data: await fetchData() }, revalidate: 60 };
}

// SSR
export async function getServerSideProps(context) {
  return { props: { data: await fetchData(context.params.id) } };
}`,
    },
  },

  {
    id: 'next-e3',
    category: 'Next.js',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is the difference between the Pages Router and the App Router in Next.js?',
    answer:
      "**Pages Router** (Next.js 1–12, still supported) — the original system. Files in `/pages` map to routes. Data fetching via `getStaticProps`, `getServerSideProps`, `getStaticPaths`.\n\n**App Router** (Next.js 13+) — the new system. Files in `/app`. Based on React Server Components. Data fetching is done directly with `async/await` in components. Colocates layouts, loading states, and error boundaries per route segment.\n\n**Key App Router concepts**:\n- **Server Components** (default) — render on the server, zero JS sent to browser, can `await` directly\n- **Client Components** — add `'use client'` directive; run in browser, can use hooks and event handlers\n- **Layouts** — `layout.tsx` wraps child routes without re-rendering on navigation\n- **Loading UI** — `loading.tsx` shows a Suspense fallback while the page loads\n- **Error boundaries** — `error.tsx` catches render errors in a route segment\n\n**Which to use**: App Router for new projects (the future). Pages Router for existing codebases — no need to migrate immediately.",
    code: {
      language: 'typescript',
      snippet: `// App Router file structure
// app/
//   layout.tsx          ← root layout (persistent nav, theme)
//   page.tsx            ← / route
//   loading.tsx         ← shown while page.tsx suspends
//   error.tsx           ← shown if page.tsx throws
//   dashboard/
//     layout.tsx        ← dashboard-specific layout
//     page.tsx          ← /dashboard
//     users/
//       page.tsx        ← /dashboard/users

// app/dashboard/users/page.tsx — Server Component (default)
export default async function UsersPage() {
  const users = await db.user.findMany(); // direct DB call — no API needed!
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}

// app/dashboard/users/UserSearch.tsx — Client Component
'use client'; // marks this as a Client Component
import { useState } from 'react';

export function UserSearch() {
  const [query, setQuery] = useState('');
  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}`,
    },
  },

  // ─── Next.js (Medium) ────────────────────────────────────────────────────────

  {
    id: 'next-m1',
    category: 'Next.js',
    difficulty: 'medium',
    type: 'basics',
    question: 'What are React Server Components (RSC)? How are they different from Client Components?',
    answer:
      "**React Server Components** run exclusively on the server and never ship JavaScript to the browser. They can directly access databases, file systems, and secrets — without exposing them to the client.\n\n**Server Component (default in App Router)**:\n- Renders on server → sends HTML to browser\n- Can use `async/await` directly — no `useEffect` for data fetching\n- Zero client-side JavaScript for the component itself\n- Cannot use browser APIs, React hooks, or event handlers\n\n**Client Component** (`'use client'` directive):\n- Hydrates and runs in the browser\n- Can use `useState`, `useEffect`, `useRef`, event handlers\n- Can access `window`, `localStorage`, etc.\n\n**The key mental model**: push interactivity as far down the tree as possible. Keep data-heavy, static parent components as Server Components, and mark only the interactive leaves as Client Components.\n\n**Common pattern**: fetch data in a Server Component, pass it as props to a Client Component that handles interaction.",
    code: {
      language: 'typescript',
      snippet: `// ── Server Component — fetches data, no JS sent to browser ──
// app/posts/page.tsx
import { LikeButton } from './LikeButton'; // Client Component
import { db } from '@/lib/db';

export default async function PostsPage() {
  const posts = await db.post.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>
          <h2>{post.title}</h2>
          {/* Server Component passes data to Client Component */}
          <LikeButton postId={post.id} initialLikes={post.likes} />
        </li>
      ))}
    </ul>
  );
}

// ── Client Component — handles interactivity ──────────────────
// app/posts/LikeButton.tsx
'use client';
import { useState } from 'react';

export function LikeButton({ postId, initialLikes }: Props) {
  const [likes, setLikes] = useState(initialLikes);

  async function handleLike() {
    await fetch(\`/api/posts/\${postId}/like\`, { method: 'POST' });
    setLikes(l => l + 1);
  }

  return <button onClick={handleLike}>❤ {likes}</button>;
}`,
    },
  },

  {
    id: 'next-m2',
    category: 'Next.js',
    difficulty: 'medium',
    type: 'basics',
    question: 'How do you create API routes in Next.js? What are Route Handlers?',
    answer:
      "Next.js lets you write backend API endpoints inside the same repo — no separate Express server needed.\n\n**Pages Router** — files in `/pages/api/*`. Export a default function `(req, res) => void`.\n\n**App Router Route Handlers** — files named `route.ts` in `/app/api/*`. Export named functions matching HTTP methods: `GET`, `POST`, `PUT`, `DELETE`, etc.\n\n**When to use Next.js API routes**:\n- BFF (Backend For Frontend) — thin proxy to your real backend\n- Webhooks — receive Stripe, GitHub, etc. callbacks\n- Simple CRUD for small apps — skip a separate backend entirely\n\n**When NOT to use**: don't build a heavy business logic backend with Next.js route handlers. For complex APIs, use a dedicated Express/NestJS/Fastify service.",
    code: {
      language: 'typescript',
      snippet: `// App Router — app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get('page') ?? 1);

  const users = await db.user.findMany({ skip: (page - 1) * 20, take: 20 });
  return NextResponse.json({ data: users });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const user = await db.user.create({ data: body });
  return NextResponse.json(user, { status: 201 });
}

// Dynamic route: app/api/users/[id]/route.ts
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await db.user.findUniqueOrThrow({ where: { id: params.id } });
  return NextResponse.json(user);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await db.user.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}`,
    },
  },

  {
    id: 'next-m3',
    category: 'Next.js',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is Next.js Middleware? What can you use it for?',
    answer:
      "**Next.js Middleware** runs before a request is completed — before the page or API route handles it. It runs on the Edge Runtime (V8 isolates at the CDN level), making it extremely fast.\n\n**What you can do in Middleware**:\n- **Auth checks** — verify a JWT and redirect to `/login` if invalid before the page loads\n- **A/B testing** — rewrite requests to different page variants based on a cookie\n- **Geolocation routing** — redirect to country-specific pages\n- **Rate limiting** — check a counter in KV store and return 429\n- **Request header injection** — add correlation IDs, user context for downstream\n\n**Limitations**: runs on the Edge Runtime — no Node.js APIs (`fs`, `crypto`), no native modules. Keep it fast and lightweight. Complex business logic belongs in API routes.\n\nMiddleware is defined in `middleware.ts` at the project root and controlled by the `matcher` config.",
    code: {
      language: 'typescript',
      snippet: `// middleware.ts (at project root)
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose'; // Edge-compatible JWT lib

const PUBLIC_PATHS = ['/', '/login', '/signup'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next();

  const token = req.cookies.get('session')?.value;

  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET!)
    );
    // Inject user id into header for downstream API routes
    const res = NextResponse.next();
    res.headers.set('x-user-id', payload.sub as string);
    return res;
  } catch {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

// Only run on these paths
export const config = {
  matcher: ['/dashboard/:path*', '/api/protected/:path*'],
};`,
    },
  },

  // ─── Next.js (Hard) ──────────────────────────────────────────────────────────

  {
    id: 'next-1',
    category: 'Next.js',
    difficulty: 'hard',
    type: 'experience',
    question: 'How do you deploy a Next.js app to AWS ECS? Walk through the CI/CD pipeline.',
    answer:
      "**Architecture** for deploying a Dockerized Next.js app to AWS ECS via GitHub Actions:\n- **Next.js app** containerized with a multi-stage Docker build (builder stage + slim production stage)\n- **AWS ECR** — private Docker registry; GitHub Actions pushes the image here\n- **AWS ECS Fargate** — serverless container orchestration; no EC2 instances to manage\n- **ALB (Application Load Balancer)** — routes traffic to ECS tasks, handles TLS termination\n- **GitHub Actions** — triggered on push to `main`, builds the image, pushes to ECR, updates the ECS service\n\n**Key steps in the pipeline**:\n1. Checkout + setup Node → `npm ci` → `npm run build`\n2. Configure AWS credentials (OIDC role, not long-lived access keys)\n3. Build Docker image → tag with Git SHA\n4. `docker push` to ECR\n5. `aws ecs update-service --force-new-deployment` — ECS rolls out the new task definition\n6. Health check on ALB — old tasks are drained only when new tasks pass health checks\n\n**Zero-downtime**: ECS rolling update replaces tasks one at a time, ALB health checks ensure traffic only routes to healthy tasks.",
    code: {
      language: 'yaml',
      snippet: `# .github/workflows/deploy.yml
name: Deploy to ECS
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    permissions:
      id-token: write  # for OIDC
      contents: read
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials (OIDC — no long-lived keys)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789:role/github-deploy
          aws-region: ap-southeast-1

      - name: Login to ECR
        id: ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build and push Docker image
        run: |
          IMAGE=\${{ steps.ecr.outputs.registry }}/my-nextjs-app:\${{ github.sha }}
          docker build -t $IMAGE .
          docker push $IMAGE
          echo "IMAGE=$IMAGE" >> $GITHUB_ENV

      - name: Deploy to ECS
        run: |
          aws ecs update-service \\
            --cluster production \\
            --service my-nextjs-service \\
            --force-new-deployment`,
    },
  },

  {
    id: 'next-2',
    category: 'Next.js',
    difficulty: 'hard',
    type: 'experience',
    question: 'How do you handle authentication in a Next.js App Router app? Compare cookie-based sessions vs JWT.',
    answer:
      "**Two main approaches in Next.js:**\n\n**1. Cookie-based sessions (recommended for most apps)**\n- User logs in → server creates a session record in DB/Redis → sets an `HttpOnly` secure cookie with the session ID\n- Middleware reads the cookie and validates the session on every request\n- **Pros**: instant revocation (delete the session record), simpler security model, no token storage on client\n- **Cons**: requires a session store (DB or Redis); sessions don't scale as cleanly across multiple services\n- **`next-auth` / Auth.js** implements this out of the box with many providers\n\n**2. JWT in HttpOnly cookies**\n- User logs in → server signs a JWT → stores it in an `HttpOnly` cookie (NOT localStorage — XSS risk)\n- Middleware verifies the JWT signature on every request — no DB lookup needed\n- **Pros**: stateless, scales across services easily (ideal for multi-portal or cross-domain auth)\n- **Cons**: can't revoke tokens before expiry without a denylist; rotate secrets carefully\n\n**Never store tokens in localStorage** — vulnerable to XSS. Always use `HttpOnly; Secure; SameSite=Strict` cookies.\n\n**Session vs JWT rule of thumb**: session for user-facing apps, JWT for service-to-service or when you need cross-domain auth.",
    code: {
      language: 'typescript',
      snippet: `// app/api/auth/login/route.ts — JWT in HttpOnly cookie
import { SignJWT } from 'jose';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const user = await validateCredentials(email, password);
  if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  const token = await new SignJWT({ sub: user.id, email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(new TextEncoder().encode(process.env.JWT_SECRET!));

  const res = NextResponse.json({ ok: true });
  res.cookies.set('session', token, {
    httpOnly: true,   // not accessible by JS — prevents XSS
    secure: true,     // HTTPS only
    sameSite: 'strict', // CSRF protection
    maxAge: 60 * 60,  // 1 hour
    path: '/',
  });
  return res;
}

// middleware.ts — verify on every protected request
// (see the Middleware card for the full example)

// app/api/auth/logout/route.ts
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete('session');
  return res;
}`,
    },
  },
];
