import type { Flashcard } from '../types';

export const interviewCards: Flashcard[] = [

  // ─── Interview Scenarios (Easy) ──────────────────────────────────────────────

  {
    id: 'int-e1',
    category: 'Interview Scenarios',
    difficulty: 'easy',
    type: 'basics',
    question: 'Production is down right after your deploy. What do you do?',
    answer:
      '**What the interviewer is testing**: can you stay calm under pressure, prioritize restoring service over ego, and communicate proactively.\n\n**Strong answer framework**:\n\n1. **Roll back first, debug second** — if you just deployed, you have a known-good version. Revert immediately. Do not try to hotfix in production while users are down unless rollback is impossible.\n2. **Communicate before you understand** — alert your team and manager within the first 2 minutes: "We have an incident, I believe it\'s related to my deploy, I\'m rolling back now. Will update in 10 minutes." Never go silent while production is down.\n3. **Check the blast radius** — after rollback, check: what broke? Which users or features? Is data corrupted or just unavailable?\n4. **Diagnose with logs** — once service is restored, read error logs, check your monitoring (Datadog, Sentry), and identify the root cause in your change.\n5. **Write a post-mortem** — a short blameless write-up: what happened, timeline, root cause, and action items to prevent it next time (e.g., add a test, improve the deploy checklist).\n\n**What makes this answer strong**: mentioning rollback *before* debugging (most people instinctively want to debug), and proactive communication. Weak answers skip both and jump straight to "I would look at the logs."',
  },

  {
    id: 'int-e2',
    category: 'Interview Scenarios',
    difficulty: 'easy',
    type: 'basics',
    question: 'You find a significant bug in a teammate\'s PR during code review. How do you handle it?',
    answer:
      '**What the interviewer is testing**: communication style, ability to give constructive feedback, whether you are a team player or a gatekeeper.\n\n**Strong approach**:\n\n1. **Describe the problem, not the person** — write "This will throw a TypeError if `user` is null" not "You forgot to check for null." The problem is in the code, not the author.\n2. **Explain the why** — "This could cause a 500 in production when a user hasn\'t completed onboarding" gives them context to understand the severity. "This is wrong" doesn\'t.\n3. **Suggest a concrete fix** — don\'t just flag issues; offer a solution or ask a guiding question: "What if we add a null check here before accessing `user.id`?"\n4. **Be explicit about severity** — say "Blocking: this needs to be addressed before merge" vs "Non-blocking: just a style preference, up to you." Don\'t leave it ambiguous.\n5. **Acknowledge good work too** — genuine positive comments build trust and make critical feedback easier to receive.\n\n**Common mistake**: being vague on severity. If it\'s a real bug, say "Blocking" clearly. Burying a critical bug in soft language ("maybe consider...") is not kindness — it lets a bug through.',
  },

  {
    id: 'int-e3',
    category: 'Interview Scenarios',
    difficulty: 'easy',
    type: 'basics',
    question: 'You\'ve been stuck on a bug for 3+ hours and you\'re going in circles. What do you do?',
    answer:
      '**What the interviewer is testing**: self-awareness, debugging methodology, ability to ask for help without ego.\n\n**Strong answer framework**:\n\n1. **Rubber duck it** — explain the problem out loud, or write it down in a message (even if you don\'t send it). You often find the answer before you finish the sentence because articulating the problem forces your brain to re-examine assumptions.\n2. **List and verify every assumption** — "I assumed the DB is returning data in this format." Log the raw response and check. Bugs almost always live inside an assumption you forgot you were making.\n3. **Shrink the problem** — comment out code, write a minimal reproduction case. Isolate the exact line where the expected value diverges from reality.\n4. **Step away** — 15 minutes away from the screen genuinely helps. Your brain keeps working on the problem in the background.\n5. **Ask for help** — if still stuck, ask a teammate. Frame it well: "I\'ve tried X, Y, Z — I\'m seeing this output and expecting this. Any ideas?" Never ask without showing what you\'ve already tried.\n6. **Document the answer** — when you find it, leave a comment or write a PR note so the next person doesn\'t lose 3 hours on the same thing.\n\n**What makes this answer strong**: showing a methodical process AND knowing when to ask. Lone wolf (never asks) and helpless (asks immediately) are both red flags.',
  },

  {
    id: 'int-e4',
    category: 'Interview Scenarios',
    difficulty: 'easy',
    type: 'basics',
    question: 'A product manager asks you to estimate a feature you\'ve never built before. How do you approach it?',
    answer:
      '**What the interviewer is testing**: planning skills, communication with non-technical stakeholders, honesty about uncertainty.\n\n**Strong approach**:\n\n1. **Decompose first** — break the feature into the smallest concrete tasks you can name: API endpoint, DB schema change, validation logic, tests, frontend integration, deployment. Estimate each task individually, not the feature as a whole.\n2. **Identify and name the unknowns** — "I don\'t know how the payment provider webhook format works — that\'s a wildcard. I\'ll do a 2-hour technical spike and give you a better estimate then."\n3. **Apply a multiplier** — raw task estimates are always optimistic. Account for code review cycles, unexpected edge cases, and back-and-forth with design. A common rule of thumb: multiply your initial estimate by 1.5–2x.\n4. **Give a range, not a point** — "3–5 days" sets honest expectations. "4 days" implies false precision.\n5. **Set a check-in point** — "I\'ll have a sharper estimate after spiking the auth flow tomorrow."\n\n**Common pitfalls to mention**: forgetting to include time for tests and PR review, giving a number under pressure without thinking, or sandbagging so much that you lose trust. A great engineer gives an honest estimate with explicit uncertainty — not a padded one.',
  },

  {
    id: 'int-e5',
    category: 'Interview Scenarios',
    difficulty: 'easy',
    type: 'basics',
    question: 'A junior developer on your team is consistently missing deadlines and seems overwhelmed. How do you help?',
    answer:
      '**What the interviewer is testing**: mentorship mindset, empathy, communication, whether you\'re a teammate or just focused on your own work.\n\n**Strong approach**:\n\n1. **Start with a private conversation** — ask how they\'re doing, not "why are you late?" Create a safe space: "I noticed things have felt tough lately — what\'s getting in the way?"\n2. **Diagnose before prescribing** — are they stuck on technical problems? Unclear requirements? Too many competing tasks? Context-switching? The solution depends on the root cause.\n3. **Make blockers visible early** — teach them to surface blockers the moment they arise, not the day of the deadline: "If something is taking more than a few hours and you\'re not making progress, ping me or ask in Slack — don\'t wait."\n4. **Break down tasks together** — help them decompose large tickets into smaller, shippable steps. Big vague tasks are a common source of paralysis.\n5. **Pair program on hard problems** — don\'t just send links to docs. Sit with them. This also helps you understand their actual blockers.\n6. **Celebrate wins** — when they ship something, acknowledge it publicly (in standups, Slack). Small wins build momentum.\n\n**What makes this answer strong**: showing curiosity about the root cause before jumping to a fix, and genuine investment in their growth — not just "I\'d tell them to ask more questions."',
  },

  {
    id: 'int-e6',
    category: 'Interview Scenarios',
    difficulty: 'easy',
    type: 'basics',
    question: 'You\'re new to a large codebase and you need to make a non-trivial change fast. How do you ramp up?',
    answer:
      '**What the interviewer is testing**: how you learn systems efficiently, whether you have a pragmatic onboarding approach, ability to deliver under ambiguity.\n\n**Strong approach**:\n\n1. **Start from the entry point** — find the request lifecycle: how does an API call come in, move through middleware, hit the business logic, and return a response. You don\'t need to understand everything — just the path relevant to your change.\n2. **Read the tests first** — test files tell you what the system is *supposed* to do, in plain language. They\'re often faster to understand than the implementation.\n3. **Use git blame and git log** — find out who last touched the relevant code and when. Reading the commit messages tells you *why* the code is the way it is, not just *what* it does.\n4. **Ask one targeted question** — find the person who wrote the area you\'re touching. Ask one specific, well-researched question: "I\'m modifying the auth middleware — is there anything about this area I should be aware of?" Not "can you explain the whole codebase to me."\n5. **Make your change small and isolated** — when you\'re new, minimize the surface area of your change. Avoid refactoring things you don\'t fully understand yet.\n\n**What makes this answer strong**: showing you\'re self-sufficient (don\'t need someone to hand-hold you) while also knowing when to ask a targeted question.',
  },

  {
    id: 'int-e7',
    category: 'Interview Scenarios',
    difficulty: 'easy',
    type: 'basics',
    question: 'You shipped a bug to production that caused real user impact. How do you handle it — technically and with your team?',
    answer:
      '**What the interviewer is testing**: ownership, accountability, grace under pressure, whether you hide mistakes or face them.\n\n**Strong framework**:\n\n1. **Fix the immediate problem first** — roll back or hotfix. Don\'t overthink optics while users are impacted.\n2. **Own it immediately** — tell your team what happened, what you did to fix it, and what the user impact was. Don\'t minimize it or wait for someone else to notice. Transparency builds trust; hiding it destroys it.\n3. **Communicate to your manager** — briefly: what broke, how long it was down, what the fix was. They\'d rather hear it from you first than from a customer.\n4. **Write a post-mortem (blameless)** — document: the timeline, root cause, how you fixed it, and — most importantly — what you\'re doing to prevent it happening again (a new test, a better deploy process, a code review checklist).\n5. **Implement the prevention** — actually do the thing you said in the post-mortem. This is what separates senior engineers: they turn mistakes into systemic improvements.\n\n**What makes this answer strong**: owning it without being defensive, and focusing on prevention, not just the fix. Weak answers are either defensive ("it wasn\'t really my fault because...") or have no prevention step.',
  },

  // ─── Interview Scenarios (Medium) ────────────────────────────────────────────

  {
    id: 'int-m1',
    category: 'Interview Scenarios',
    difficulty: 'medium',
    type: 'basics',
    question: 'You\'re asked to add a feature to a 5-year-old codebase with no tests. How do you approach it?',
    answer:
      '**What the interviewer is testing**: pragmatism, risk awareness, ability to improve quality without grinding to a halt, knowing when to refactor vs just deliver.\n\n**Strong approach**:\n\n1. **Understand before changing** — read the area you\'ll touch. Trace the data flow. Don\'t refactor code you don\'t understand yet.\n2. **Write characterization tests first** — before changing anything, write tests that capture the current behavior, even if that behavior is imperfect. These are your safety net so you know when you\'ve broken something.\n3. **Boy Scout Rule** — leave the code slightly better than you found it: rename a confusing variable, extract a helper, remove a dead branch. Don\'t attempt a full rewrite while adding a feature.\n4. **Keep your changes isolated** — add new code in a new function or class where possible, rather than deeply modifying the existing spaghetti. Smaller surface area = easier review.\n5. **Write tests for what you add** — even if the surrounding code has none, your new feature should have coverage.\n6. **Flag the debt** — open a ticket for the missing tests on the areas you touched. Don\'t silently accept the state.\n\n**What makes this answer strong**: "characterization tests first" is a strong signal — most people just plunge in. Weak answers say "I\'d refactor it all first" (scope creep red flag) or "I\'d just add the feature and move on" (quality red flag).',
  },

  {
    id: 'int-m2',
    category: 'Interview Scenarios',
    difficulty: 'medium',
    type: 'basics',
    question: 'Your API\'s p99 latency jumped from 200ms to 3s in production. How do you debug it?',
    answer:
      '**What the interviewer is testing**: systematic debugging under pressure, knowledge of observability tools, ability to isolate bottlenecks.\n\n**Debugging process**:\n\n1. **Check for recent changes first** — look at recent deploys, config changes, traffic increases. Correlation is your fastest signal.\n2. **Narrow the scope** — is it one endpoint or all of them? One region or global? One customer or everyone? This tells you where the bottleneck lives.\n3. **Check your resource metrics** — CPU, memory, DB connection pool size, cache hit rate, queue depth. What resource is at 100%?\n4. **Check slow query logs** — an N+1 query, a missing index, or a suddenly large table scan is the most common cause of gradual API slowdowns.\n5. **Check downstream dependencies** — use distributed tracing (Datadog APM, Jaeger) to see where in the request lifecycle the time is being spent. Is it your code or a downstream service?\n6. **Check for lock contention** — a DB migration running on a hot table, or a long-running transaction, can block all other queries.\n\n**Common culprits to name**: N+1 queries from ORM lazy loading, missing index on a new column, a cron job hammering the DB at peak hours, connection pool exhaustion, a cache that expired and caused a thundering herd.\n\n**What makes this answer strong**: starting with "what changed recently" (fastest lead) and naming specific common causes — not just "I would check the logs."',
  },

  {
    id: 'int-m3',
    category: 'Interview Scenarios',
    difficulty: 'medium',
    type: 'basics',
    question: 'You inherited a codebase with years of tech debt. You can\'t rewrite it. How do you decide what to fix?',
    answer:
      '**What the interviewer is testing**: prioritization, business judgment, ability to improve quality without stalling delivery.\n\n**Strong framework**:\n\n1. **Classify by pain, not aesthetics** — what debt is actively slowing the team down (high-friction deploys, frequent bugs in one area, scary code nobody wants to touch) vs what is just ugly? Only fix what costs the team real time.\n2. **Fix the risky areas first** — security vulnerabilities, data integrity issues, and untested code that changes frequently. These have the highest potential for real damage.\n3. **Boy Scout Rule** — improve the code you touch. Hot paths get cleaner naturally over a few months without a dedicated rewrite project.\n4. **Negotiate a tech debt budget** — ask for 15–20% of sprint capacity for explicit debt reduction. Make it visible on the backlog. Argue the business case in concrete terms: "Cleaning up this auth module will reduce the time to add a new OAuth provider from 3 days to 4 hours."\n5. **Track and report the impact** — measure before and after (deploy frequency, bug count in that area, feature velocity). Visible improvements get continued investment.\n\n**What to avoid saying**: "rewrite it from scratch" (rewrites rarely succeed and often produce the same debt in 2 years), or "stop shipping features until we clean it up" (the business won\'t accept this).',
  },

  {
    id: 'int-m4',
    category: 'Interview Scenarios',
    difficulty: 'medium',
    type: 'basics',
    question: 'You disagree with your tech lead\'s architectural decision. How do you handle it?',
    answer:
      '**What the interviewer is testing**: communication maturity, ability to advocate without being disruptive, knowing when to push back and when to commit.\n\n**Strong approach**:\n\n1. **Understand their reasoning first** — ask before disagreeing: "Can you walk me through the trade-offs you considered?" You might be missing context (constraints, prior attempts, external requirements) that changes your view entirely.\n2. **Prepare a specific case** — come with facts, not feelings. "I\'m worried that approach X will become a bottleneck when we hit N concurrent users because of Y. I think Z would handle that better because..." is persuasive. "I don\'t like this" is not.\n3. **Raise it privately first** — bring it to them in a 1:1 or as a comment on an RFC/design doc, not in a public standup. Nobody likes to be challenged in front of the team.\n4. **Propose an alternative with trade-offs** — if you disagree, come with an option and be honest about its downsides too.\n5. **Disagree and commit** — if the decision stands and it\'s not a safety or ethics issue, commit to it fully. Half-hearted implementation of a decision you disagree with causes more damage than just building it.\n6. **Know when to escalate** — if you genuinely believe the decision is harmful (security risk, compliance violation, legal exposure), escalate through the right channel with documented reasoning.\n\n**What makes this answer strong**: showing you can advocate clearly AND let go — this is the "disagree and commit" principle from engineering cultures like Amazon\'s.',
  },

  {
    id: 'int-m5',
    category: 'Interview Scenarios',
    difficulty: 'medium',
    type: 'basics',
    question: 'How would you run a zero-downtime database migration on a table with 50 million rows?',
    answer:
      '**What the interviewer is testing**: knowledge of DB locking, safe migration patterns, production operations maturity.\n\n**Why naive `ALTER TABLE` fails**: running `ALTER TABLE` directly on a 50M row table acquires a lock that blocks all reads and writes for minutes. This causes downtime.\n\n**Strong approach — the expand-contract pattern**:\n\n1. **Expand** — add the new column as nullable with no default. This is a metadata-only operation in modern Postgres — it completes near-instantly with no lock.\n2. **Backfill in batches** — write a background script that fills existing rows in small batches (e.g. 1,000 rows at a time) with a short sleep between batches. This avoids hammering the DB and keeps replication lag low.\n3. **Dual-write** — deploy app code that writes to both the old and new column. Existing reads still use the old column.\n4. **Verify** — confirm 100% of rows are backfilled before moving on.\n5. **Switch reads** — deploy app code that reads from the new column. Monitor for errors.\n6. **Contract** — in a future deploy, remove the old column.\n\n**Tools**: `pt-online-schema-change` (MySQL), `pgroll` or `pg_repack` (Postgres) automate most of this.\n\n**Always test on a staging DB with production-scale data** — migrations that run in seconds on 10 rows can lock up on 50M rows.',
  },

  {
    id: 'int-m6',
    category: 'Interview Scenarios',
    difficulty: 'medium',
    type: 'basics',
    question: 'You\'re mid-sprint and the product manager asks to significantly change the feature you\'re building. How do you handle it?',
    answer:
      '**What the interviewer is testing**: adaptability, professional communication, ability to push back constructively without being rigid.\n\n**Strong approach**:\n\n1. **Understand the reason for the change first** — ask "what changed that\'s driving this?" A PM asking for a change mid-sprint usually has a reason (new customer feedback, a competitor move, a reprioritization). The reason affects whether it\'s urgent or deferrable.\n2. **Assess the impact honestly** — how much of your current work is still usable? Will this change require reworking the DB schema? The API contract? The frontend? Give a concrete re-estimate: "I\'m 60% done. This change would require me to restart, moving the delivery from Thursday to next Monday."\n3. **Offer options, not a yes or no** — present trade-offs: "We can (a) pause and pivot now — higher cost, later delivery; (b) ship the current version this sprint and reshape next sprint; (c) descope part of the change to land something this sprint." Let the PM make the call with full information.\n4. **Get alignment in writing** — a quick Slack message or ticket comment summarizing the agreed direction protects everyone: "Confirming we\'re going with option B — ship current scope Thursday, new requirements in the next sprint."\n5. **Protect the team** — if this kind of mid-sprint change is frequent, flag it to the engineering manager. Chronic scope churn is a process problem, not just a communication problem.\n\n**What makes this answer strong**: showing you can be flexible *and* protect the team\'s time — not just saying yes to everything.',
  },

  {
    id: 'int-m7',
    category: 'Interview Scenarios',
    difficulty: 'medium',
    type: 'basics',
    question: 'A third-party API your service critically depends on goes down in production. How do you handle it?',
    answer:
      '**What the interviewer is testing**: resilience thinking, incident response, how you communicate dependency failures to users.\n\n**Immediate response**:\n\n1. **Confirm it\'s them, not you** — check your own error logs and the third-party\'s status page (status.stripe.com, etc.) before escalating internally. "Their API is returning 503" is different from "our auth is misconfigured."\n2. **Communicate fast** — tell your team immediately. "Stripe is down. Our checkout flow is broken for all users. ETA unknown, watching their status page."\n3. **Degrade gracefully** — can the affected feature be disabled or surfaced with a clear "temporarily unavailable" message rather than a 500 error? A good user-facing error is better than a confusing crash.\n4. **Queue requests if possible** — for non-time-sensitive operations (sending emails, webhooks), queue the work and replay once the service recovers. Don\'t just drop the operation.\n5. **Contact their support** — if the outage is prolonged and you\'re on a paid plan, open a support ticket.\n\n**Prevention (what you should mention proactively)**:\n- **Circuit breaker** — automatically stop calling a failing dependency and return a fallback/error quickly, instead of letting your threads pile up waiting.\n- **Timeouts** — never make an external HTTP call without a timeout. A slow third-party without a timeout will exhaust your connection pool.\n- **Fallbacks** — can you use cached data, a secondary provider, or a degraded mode?\n\n**What makes this answer strong**: mentioning circuit breakers and graceful degradation — these show production maturity beyond just "wait for them to fix it."',
  },

  // ─── Interview Scenarios (Hard) ──────────────────────────────────────────────

  {
    id: 'int-h1',
    category: 'Interview Scenarios',
    difficulty: 'hard',
    type: 'experience',
    question: 'A critical security vulnerability is discovered in your production API — unauthenticated users can read other users\' data. What do you do?',
    answer:
      '**What the interviewer is testing**: incident response maturity, security awareness, cross-functional communication, ability to prioritize containment over appearing competent.\n\n**Response framework**:\n\n1. **Contain immediately** — take the vulnerable endpoint offline, add a blanket auth check, or route all traffic through a proxy that blocks the attack vector. Stopping the bleeding takes absolute priority over understanding the full scope.\n2. **Assess the scope** — what data was exposed? What types (PII, financial, health)? How long was the vulnerability present? Was it actually exploited? (Check access logs — unusual patterns, bulk reads, off-hours requests.)\n3. **Notify leadership and legal now** — this is not something engineering resolves alone. Legal, compliance, and leadership need to know within the hour. They determine notification obligations.\n4. **Preserve evidence** — export and store access logs before anything is overwritten. These are critical for the forensic investigation and for any regulatory audit.\n5. **Fix and verify** — implement the authorization check, write a regression test that proves the vulnerability is closed, deploy, and verify.\n6. **Notify affected users** — under GDPR, CCPA, and other regulations, you may have 72 hours to notify regulators and/or users. Legal decides this, not engineering.\n7. **Post-mortem** — blameless write-up: root cause (e.g. IDOR — missing object-level authorization check), how it was missed (no authorization test suite), action items (apply authz middleware globally, add authz test coverage, security audit of all endpoints).\n\n**What separates a strong answer**: mentioning legal/compliance notification and log preservation — most candidates only think about the technical fix. Regulators care about what you knew and when.',
  },

  {
    id: 'int-h2',
    category: 'Interview Scenarios',
    difficulty: 'hard',
    type: 'experience',
    question: 'You\'re tasked with scaling a system from 1,000 to 1,000,000 concurrent users. Walk me through your approach.',
    answer:
      '**What the interviewer is testing**: systems thinking, knowledge of scaling patterns, ability to find bottlenecks rather than over-engineer upfront.\n\n**Framework**:\n\n1. **Measure first** — load test the current system. Where does it break? The DB? The app tier? A specific endpoint? A specific query? Scale the bottleneck, not random components. Premature optimization is the enemy here.\n2. **Horizontal scaling of stateless app servers** — ensure the API is stateless (no local session storage), then put it behind a load balancer and scale out. Vertical scaling (bigger instance) hits a ceiling fast.\n3. **Database is almost always the real bottleneck**:\n   - Add **read replicas** for read-heavy workloads\n   - Add a **connection pool** (PgBouncer) — app servers * threads can easily exhaust Postgres connection limits\n   - **Cache** hot, frequently-read, rarely-changing data in Redis — targeting 80%+ cache hit rate on common reads\n   - For write-scale: consider **sharding** or a horizontally scalable DB (CockroachDB, Cassandra, DynamoDB)\n4. **Move slow work off the request path** — send emails, generate reports, process images, fire webhooks via a message queue (SQS, RabbitMQ, Kafka). The HTTP response should be fast.\n5. **CDN for static assets** — images, JS, CSS — offload from your origin servers entirely.\n6. **Rate limiting** — at scale, a single misbehaving client can take down the whole system. Protect all endpoints.\n7. **Observability** — at 1M users you cannot debug blind. Distributed tracing, per-service metrics, alerting on SLOs.\n\n**What makes this answer strong**: "measure first, then scale the bottleneck" — not jumping straight to Kubernetes and microservices. Over-engineering is a real and costly risk.',
  },

  {
    id: 'int-h3',
    category: 'Interview Scenarios',
    difficulty: 'hard',
    type: 'experience',
    question: 'You join a new team as a senior engineer. The codebase is a mess, deadlines are always missed, and morale is low. What do you do in your first 90 days?',
    answer:
      '**What the interviewer is testing**: leadership without formal authority, empathy, systems thinking about teams, ability to improve without alienating people who were there before you.\n\n**90-day framework**:\n\n**Days 1–30 — Listen, don\'t fix**\n- Do not propose sweeping solutions yet. You don\'t understand the constraints, the history, or why things are the way they are.\n- Run 1:1s with every team member: "What\'s slowing you down the most?" "What would you change if you could?" "What should I know that nobody has told me?"\n- Map the real pain: where do most bugs come from? What part of the codebase does everyone dread? What takes forever to ship?\n\n**Days 31–60 — Build trust through small wins**\n- Fix one specific, concrete pain point the team has complained about. Show you listened and you deliver.\n- Propose, don\'t mandate: "I noticed deploys take 45 minutes — I think I can cut that to 10. Can I try it?" Not "we\'re doing deploys wrong."\n- Make your code reviews encouraging and educational, not gatekeeping.\n\n**Days 61–90 — Address root causes**\n- What is actually causing missed deadlines? Unclear requirements? Chronic under-estimation? Scope creep? Accumulated tech debt slowing velocity? The fix is different for each.\n- Propose one process change at a time. Changing everything at once signals you think everything was wrong.\n- Establish psychological safety: celebrate experiments that failed and taught you something, run blameless post-mortems.\n\n**What makes this answer strong**: patience and humility — not "I came in and fixed everything." Listening first is what separates senior engineers who improve teams from those who damage them by moving too fast.',
  },

  {
    id: 'int-h4',
    category: 'Interview Scenarios',
    difficulty: 'hard',
    type: 'experience',
    question: 'Your team needs to make a breaking change to a shared API that 5 other teams depend on. How do you manage it?',
    answer:
      '**What the interviewer is testing**: cross-team communication, API versioning strategy, ability to lead a change that affects others without authority over them.\n\n**Golden rule**: never silently break existing consumers. Every team depending on your API must continue to work until they choose to migrate.\n\n**Strong approach**:\n\n1. **RFC first, code second** — write a design document describing the change, why it\'s needed, the new interface, and a proposed migration timeline. Send it to all affected teams *before* you build anything. Give them 1–2 weeks to respond. Nobody likes a surprise.\n2. **Version the API** — introduce `/v2/endpoint` (or content negotiation with an `Accept` header version). Keep `/v1` fully functional while teams migrate. Set a public deprecation notice with real dates.\n3. **Write a migration guide** — document exactly what changed, provide example before/after request payloads, and give teams access to a test environment running v2 so they can migrate safely.\n4. **Dual-write period if data shape changes** — if the underlying data changes, run both versions in parallel until all consumers have migrated. Track v1 vs v2 traffic metrics.\n5. **Set and honour a sunset date** — give teams at minimum 2–3 months to migrate. On the sunset date, v1 starts returning deprecation warnings, then shuts down on a later date. Never bring v1 down early.\n6. **Don\'t version for additive changes** — adding a new optional field or endpoint never requires a version bump. Design for extensibility from the start to minimize how often this situation arises.\n\n**What makes this answer strong**: the RFC-first approach and the detail on versioning strategy. Weak answers jump to "just version it" without addressing communication or migration support.',
  },

  {
    id: 'int-h5',
    category: 'Interview Scenarios',
    difficulty: 'hard',
    type: 'experience',
    question: 'Your team is going to miss a critical product deadline by two weeks. How do you handle it?',
    answer:
      '**What the interviewer is testing**: leadership under pressure, transparency with stakeholders, ability to make and communicate hard decisions, scope negotiation skills.\n\n**Strong framework**:\n\n1. **Identify the cause honestly** — is it scope creep? An underestimate? An unexpected technical blocker? External dependency? The response depends heavily on the cause.\n2. **Communicate early** — the worst thing you can do is tell stakeholders the day before the deadline. As soon as you have a high-confidence read that you\'ll miss, communicate it: "I\'m flagging now that we\'re tracking behind — I want to give you as much time as possible to adjust plans."\n3. **Come with options, not just bad news** — never walk into a stakeholder meeting with only "we\'re late." Present trade-offs:\n   - **Option A: Scope cut** — ship a reduced version on time. What can be cut without destroying the core value?\n   - **Option B: Extend the timeline** — ship the full feature in 2 more weeks. What is the cost of that delay?\n   - **Option C: Add resources** — rarely the right answer (Brooks\'s Law: adding people to a late project makes it later), but sometimes valid if work is cleanly parallelizable.\n4. **Let stakeholders choose with full information** — a PM or CEO can decide how to handle a two-week slip far better if they understand the trade-offs than if you try to hide it or "surprise" them at the last minute.\n5. **Root cause and prevent** — after delivery, run a retrospective: why did this happen? Was the original estimate wrong? Were there blockers that should have been escalated earlier?\n\n**What makes this answer strong**: surfacing the miss early with options, not waiting until it\'s too late to act.',
  },

  {
    id: 'int-e8',
    category: 'Interview Scenarios',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is your greatest weakness? How are you working on it?',
    answer:
      '**What the interviewer is testing**: self-awareness, honesty, growth mindset. They\'re not looking for fake answers ("I work too hard!") — they\'re looking for evidence that you can identify your own gaps and take action.\n\n**Formula for a strong answer**:\n1. Name a **real weakness** that is relevant but not disqualifying for the role\n2. Show **concrete self-awareness** of when and how it shows up\n3. Describe the **specific steps you\'re taking** to address it\n4. Name the **progress you\'ve seen** so far\n\n**Good examples for a senior engineering role**:\n- "I used to over-engineer solutions — I\'d reach for abstraction too early. I\'ve started defaulting to the simplest thing that works and only adding complexity when I have a concrete reason. I\'ve found my PRs get reviewed and merged faster as a result."\n- "I tend to take on too much rather than delegating. I\'ve been practicing breaking down work and handing off subtasks to junior engineers, which has also helped them grow."\n- "Public speaking — I\'m more comfortable in writing than speaking in front of large groups. I joined an internal speaker series to practice presenting technical topics."\n\n**What to avoid**: answers that are strengths in disguise ("I\'m a perfectionist"), completely non-professional weaknesses, or weaknesses with no action taken. Show you\'re already doing something about it.',
  },

  {
    id: 'int-e9',
    category: 'Interview Scenarios',
    difficulty: 'easy',
    type: 'basics',
    question: 'Why do you want to leave your current role? Why are you interested in this position?',
    answer:
      '**What the interviewer is testing**: motivation, culture fit, whether you\'re running toward something vs. just fleeing. They want to know if you\'ll last at the new company.\n\n**How to answer the "why leaving" part**:\n- Be honest but professional. Focus on what you\'re looking for, not what\'s wrong with your current employer.\n- Acceptable reasons: limited growth or ownership, narrow tech scope, company direction shifted, role became stagnant, seeking larger scale or impact\n- **Never badmouth** your current employer, manager, or team — it signals you might do the same to them\n\n**How to answer the "why this role" part**:\n- Be specific. Research the company before the interview. Generic answers ("I love your company culture") are weak signals.\n- Connect their domain/tech/scale to something you genuinely care about\n- Show you\'ve thought about how you can contribute, not just what you\'ll gain\n\n**Strong example framing**:\n"In my current role, I\'ve been focused on internal tools with a small team, and I\'m ready for a higher-scale environment where engineering decisions have more product impact. What drew me to this role specifically is [X] — I\'ve worked on [related thing] and I\'m excited to go deeper on [Y] here."\n\n**What makes this answer strong**: it\'s honest, it\'s specific to *this* company, and it shows you\'ve done your homework.',
  },

  {
    id: 'int-m8',
    category: 'Interview Scenarios',
    difficulty: 'medium',
    type: 'basics',
    question: 'Tell me about your biggest professional failure. What happened and what did you learn?',
    answer:
      '**What the interviewer is testing**: honesty, accountability, resilience, growth mindset. The failure itself matters far less than how you talk about it. Candidates who can\'t name a real failure are a red flag.\n\n**What makes a strong answer**:\n1. **Choose a real failure** — something with actual impact (not "I missed a small deadline once"). A production outage, a poor architectural decision, a failed project, a miscommunication that cost the team.\n2. **Own it fully** — no deflection, no "the team failed" or "the PM didn\'t..." The question is about *you*.\n3. **Describe what you learned concretely** — not vague lessons ("I learned communication is important") but specific changes in how you work: "I now always write down requirements and get sign-off before starting implementation."\n4. **Show that you applied the lesson** — ideally with an example where you used the lesson afterward.\n\n**STAR structure**:\n- **Situation**: briefly set the context\n- **Task**: what you were responsible for\n- **Action**: what went wrong and why\n- **Result**: the impact, then what you changed\n\n**Example themes that work well**: shipped a bug that caused downtime and didn\'t have a rollback plan; underestimated a migration project and blocked a team for a sprint; built a feature that users didn\'t want because you didn\'t validate the spec early enough.\n\n**What to avoid**: picking something trivial (signals lack of self-awareness), over-explaining why it wasn\'t your fault (signals defensiveness), or having no lesson (signals no growth).',
  },

  {
    id: 'int-m9',
    category: 'Interview Scenarios',
    difficulty: 'medium',
    type: 'basics',
    question: 'You\'re given a vague task with no clear requirements or success criteria. How do you move forward?',
    answer:
      '**What the interviewer is testing**: ability to operate under ambiguity, initiative, communication with stakeholders, avoiding the two failure modes — paralysis (waiting for perfect clarity) and charging ahead blindly.\n\n**Strong framework**:\n\n1. **Ask targeted clarifying questions** — don\'t ask "what do you want?" Narrow the uncertainty: "What does success look like in 2 weeks?", "Who is the primary user?", "What problem are we trying to solve?", "Are there constraints I should know about (timeline, budget, tech stack)?"\n2. **Write down your understanding** — even before a spec exists, write a short summary of what you understand the task to be and send it for confirmation. This surfaces misalignments before you write code.\n3. **Define your own success criteria** — if no one gives you acceptance criteria, draft them yourself and get sign-off: "I\'m planning to call this done when X, Y, Z. Does that match your expectations?"\n4. **Time-box the uncertainty** — if you can\'t get clarity, pick the most reasonable interpretation, timebox a spike (1–2 days), and produce something concrete to react to. A working prototype reveals requirements faster than a requirements meeting.\n5. **Flag blockers early** — if ambiguity is blocking real decisions (DB schema, API contract), escalate early rather than making a guess that\'s expensive to reverse.\n\n**What makes this answer strong**: showing you\'re neither paralysed nor reckless — you move forward deliberately while reducing risk.',
  },

  {
    id: 'int-m10',
    category: 'Interview Scenarios',
    difficulty: 'medium',
    type: 'basics',
    question: 'How do you balance moving fast and shipping features vs. writing clean, maintainable code?',
    answer:
      '**What the interviewer is testing**: engineering maturity, pragmatism, whether you understand that speed and quality are not always opposites — and when they genuinely are, how you make the trade-off consciously.\n\n**Strong answer framework**:\n\n**Speed and quality compound each other** — in the short run, cutting corners feels fast. In the long run, it creates drag: slower onboarding, more bugs, harder refactors. The goal is sustainable pace, not maximum short-term throughput.\n\n**Concrete practices that enable both**:\n- **Small, focused PRs** — easier to review, merge faster, easier to revert. Fewer conflicts with other people\'s work.\n- **Automated tests on the happy path** — you don\'t need 100% coverage on day one. Cover the risky paths so you can refactor safely later.\n- **The "good enough" bar** — distinguish between production code that lives for years (invest more) vs. a one-time script, a prototype, or internal tooling (invest less). Match quality investment to longevity.\n- **Boy Scout Rule** — leave the code slightly better than you found it. Quality improves gradually and organically.\n\n**When to consciously take on debt**:\n- Hard deadline with real business consequence → ship, open a tech debt ticket immediately, address it next sprint\n- Validating whether a feature is even wanted → quick prototype, throw it away or rewrite once validated\n\n**What makes this answer strong**: showing you think about trade-offs consciously and have concrete practices, not just "I always write clean code" or "we move fast and fix later."',
  },

  {
    id: 'int-h7',
    category: 'Interview Scenarios',
    difficulty: 'hard',
    type: 'experience',
    question: 'Walk me through the most technically complex project you\'ve worked on. What decisions did you make and what would you do differently?',
    answer:
      '**What the interviewer is testing**: technical depth, architectural thinking, ownership, ability to reflect critically on your own work.\n\n**How to structure your answer (STAR + retrospective)**:\n\n1. **Set the context briefly** — what the system did, scale, team size, your specific role. Interviewers want to know what *you* owned, not what the team did.\n2. **Identify the hard technical problem** — what made this complex? Distributed systems? Extreme scale? Tight real-time constraints? Migrating a live system? Data consistency guarantees? Don\'t pick a project that was just large — pick one where you faced genuinely hard trade-offs.\n3. **Walk through 2–3 key decisions** — for each: what were the options, what was the trade-off, what did you choose, and why. "We chose eventual consistency here because the write latency cost of strong consistency would have made the feature unusable — and the impact of stale reads was low for this data type."\n4. **Show what actually happened** — did it go well? Where did it break down? What was the user or business impact?\n5. **Retrospective: what would you do differently** — this is what separates senior engineers. You should be able to critique your own past decisions honestly. "We added too many abstractions early. If I did it again, I\'d start simpler and let the complexity emerge from real usage."\n\n**Pitfalls to avoid**: describing a project without clearly stating your personal contribution, picking a project that was complex because it was large but not because the *engineering problems* were hard, or being unable to identify what you\'d change.',
  },

  {
    id: 'int-h8',
    category: 'Interview Scenarios',
    difficulty: 'hard',
    type: 'experience',
    question: 'How do you stay current with new technologies and decide which ones are worth adopting?',
    answer:
      '**What the interviewer is testing**: intellectual curiosity, judgement (knowing what to ignore vs. adopt), and the ability to evaluate tools critically rather than chasing hype.\n\n**Strong answer — two parts:**\n\n**How you stay current**:\n- Curated sources: changelog for languages/frameworks you own (e.g. Node.js release notes, TypeScript release blog), specific newsletters (Node Weekly, JavaScript Weekly), and 2–3 trusted voices on Twitter/X or Substack whose judgement you trust\n- Reading RFCs and ADRs (Architecture Decision Records) from open-source projects you use\n- Side projects: the fastest way to build real intuition about a technology is to use it on something you care about\n- Internal: if colleagues propose a new tool, engage with their RFC rather than tuning it out\n\n**How you decide what to adopt**:\nA useful mental filter:\n1. **What problem does it solve?** If you don\'t currently have that problem, you don\'t need the solution.\n2. **Is this a trend or a pattern?** Trends come and go. Patterns (event-driven, CQRS, hexagonal architecture) have lasted decades. Weight patterns higher.\n3. **What is the operational cost?** Every dependency is a liability: security patches, breaking changes, abandoned maintenance. Evaluate the ecosystem health (GitHub activity, corporate backing, downloads trend).\n4. **Prove it at small scale first** — proposal → timebox spike → decision. No big rewrites based on a blog post.\n\n**What makes this answer strong**: the decision framework. Anyone can list sources. Showing you think critically about adoption — not every new tool deserves to be in production — signals engineering maturity.',
  },

  {
    id: 'int-h9',
    category: 'Interview Scenarios',
    difficulty: 'hard',
    type: 'experience',
    question: 'Your engineering team is burned out: everyone is working overtime, morale is low, and people are starting to leave. What do you do?',
    answer:
      '**What the interviewer is testing**: leadership without authority, empathy, systems thinking, ability to address root causes rather than symptoms.\n\n**Burnout is almost always a systems problem, not a people problem.** The team isn\'t burned out because they\'re weak — something in the environment is consuming too much of their energy. Diagnose before prescribing.\n\n**Common root causes:**\n- Chronic underestimation and unpredictable scope changes → no sustainable pace\n- On-call rotation too heavy or alerts too noisy → sleep deprivation\n- Unclear ownership → everyone is responsible for everything → everyone is always on-call\n- No slack in the sprint → no time to pay down debt, so velocity keeps falling → pressure increases\n- Lack of psychological safety → people afraid to say "this is unsustainable"\n\n**What to do:**\n\n1. **Name it publicly** — acknowledge the problem in a team meeting or retro. "We\'re moving too fast and I can see it\'s unsustainable. I want to fix that." Naming it gives the team permission to be honest.\n2. **Do 1:1s to find the root cause** — ask every person: "What\'s taking the most energy? What feels most out of your control?" Don\'t assume you know.\n3. **Negotiate capacity with leadership** — bring data: "Our on-call noise level doubled in 3 months. We need 1 sprint to address alert hygiene before adding new features." Frame it in business terms: attrition and hiring cost far more than one slow sprint.\n4. **Protect focus time** — no-meeting blocks, async by default, clear ownership so people aren\'t pulled into every incident.\n5. **Make sustainability a team value** — celebrate engineers who push back on unrealistic scopes, not just ones who heroically work all night.\n\n**What makes this answer strong**: diagnosing root cause vs. symptoms, and bringing the problem to leadership with data rather than just venting.',
  },

  {
    id: 'int-m11',
    category: 'Interview Scenarios',
    difficulty: 'medium',
    type: 'experience',
    question: 'How do you balance technical debt with feature delivery? Give me a specific example.',
    answer:
      '**What the interviewer is testing**: business judgment, prioritization under competing pressures, ability to communicate trade-offs without stalling delivery.\n\n**The honest reality**: you can\'t eliminate this tension — the goal is to manage it consciously rather than reactively.\n\n**Strong framework**:\n\n1. **Classify debt by cost, not by aesthetics** — not all debt is equal. Ask: "Is this slowing us down today?" Messy code nobody touches is cheap. Messy code on the hot path of every feature is expensive. Prioritize debt that actively impedes delivery.\n2. **Negotiate a budget, not a sprint** — the most sustainable pattern is a standing 15–20% of sprint capacity reserved for tech debt. Frame it to leadership in business terms: "Cleaning up the auth module will cut the time to add new OAuth providers from 3 days to half a day." Concrete ROI wins over abstract quality arguments.\n3. **Boy Scout Rule for everything else** — leave code slightly better than you found it. Rename a confusing variable, extract a duplicated block, add a missing test on the path you touched. Quality improves organically over months without a dedicated project.\n4. **Consciously take on new debt** — when a hard deadline arrives, ship the expedient version *and immediately open a ticket* for the cleanup. Name the debt explicitly in the PR description so it\'s not lost. Untracked debt compounds invisibly.\n\n**Specific example to mention**:\n"On a previous project we had a payment processing module with no tests and hardcoded logic that made every card type addition a week of manual regression. I made the case to the PM: we were adding two new card types next quarter — if we invest two sprints now to refactor and add integration tests, each future addition drops from 5 days to 1. We did it. The next two card types each shipped in a day and a half. That\'s the ROI argument that gets tech debt prioritized."\n\n**What makes this answer strong**: connecting debt to velocity cost in concrete terms, and having a real example where addressing debt paid off in measurable time savings.',
  },

  {
    id: 'int-h10',
    category: 'Interview Scenarios',
    difficulty: 'hard',
    type: 'experience',
    question: 'How do you approach system design and architecture decisions?',
    answer:
      '**What the interviewer is testing**: architectural thinking, how you handle trade-offs under uncertainty, decision-making discipline, and whether you design for today\'s real constraints or tomorrow\'s imagined ones.\n\n**Core principle**: the best architecture is the simplest one that solves the current problem and leaves the next decision open.\n\n**Process for making architecture decisions**:\n\n1. **Start with requirements, not technologies** — before picking a database or framework, clarify: What is the read/write ratio? What are the latency requirements? What scale are we at today and in 12 months? What does a failure cost? Requirements constrain the design space — skipping this leads to over-engineering.\n2. **Identify the riskiest unknowns first** — the design is only as good as your understanding of the bottlenecks. What part of this are you least certain about? Do a technical spike on the unknown before committing to the full architecture.\n3. **List real options with explicit trade-offs** — never commit to a single approach without considering at least two alternatives. For each: what does it do well, where does it fail, what is the operational cost? Write this down — future-you will thank present-you.\n4. **Design for the current scale, not the theoretical maximum** — a monolith that ships in 4 weeks almost always beats a microservices architecture that ships in 6 months, for an early-stage product. Over-engineering for future scale you may never reach is a real and common failure mode.\n5. **Make it reversible where possible** — prefer decisions that are easy to change. Keep the DB schema additive, use abstraction layers for third-party dependencies, write integration tests so you can refactor safely.\n6. **Write an ADR (Architecture Decision Record)** — a one-page document: context, options considered, decision, and consequences. This is invaluable when you or a new team member asks "why is it built this way?" six months later.\n\n**Common mistakes to name**:\n- Choosing a technology because it\'s popular, not because it fits the problem\n- Designing for 10x current scale before proving product-market fit\n- Making an architecture decision in a meeting without writing it down\n\n**What makes this answer strong**: showing process and discipline — not jumping to "I would use Kafka and microservices," but walking through how you arrive at the right answer for the specific context.',
  },

  {
    id: 'int-m12',
    category: 'Interview Scenarios',
    difficulty: 'medium',
    type: 'basics',
    question: "What's your process for staying current with technology trends?",
    answer:
      '**What the interviewer is testing**: intellectual curiosity, discipline to keep learning amid daily delivery pressure, and critical judgment — knowing what to adopt vs. what to ignore.\n\n**The two-part answer: how you learn, and how you filter**\n\n**How you stay current**:\n- **Curated, not firehose** — pick 2–3 high-quality sources and read them consistently. Subscribing to 30 newsletters and ignoring them is not staying current. Examples: Node Weekly, TypeScript release blog, changelog for the frameworks you own, a trusted Substack or two.\n- **Follow the source, not the commentary** — read release notes, RFCs, and official docs when a major version ships. You get the accurate picture, not the hot take.\n- **Side projects** — reading about a technology gives you zero intuition. Using it on a small personal project gives you real opinions about its rough edges and strengths in 2–3 days.\n- **Engage with your team** — when a colleague proposes a new tool in an RFC or Slack thread, engage seriously. Collective learning within a team compounds fast.\n- **Conferences and talks** — YouTube recordings of conference talks (JSNation, NodeConf, React Summit) are dense with practitioner knowledge, not vendor marketing.\n\n**How you filter (critical judgment)**:\n1. **"What problem does this solve?"** — if you don\'t currently have that problem, the solution is noise.\n2. **Trend vs. pattern** — Bun, Deno, and Vite are trends (valuable to watch). Event-driven architecture and hexagonal architecture are patterns (worth investing in deeply, they outlast any specific tool).\n3. **Ecosystem health check** — before adopting: GitHub stars trajectory, corporate backing, npm download trend, open issues count. Abandoned dependencies are a liability.\n4. **Spike before adopting** — 2-day timebox, real use case, real pain points surface quickly. No production rewrite based on a blog post.\n\n**What makes this answer strong**: having a filtering framework, not just a list of RSS feeds. Anyone can consume content — the signal is knowing how to evaluate it.',
  },

  {
    id: 'int-h6',
    category: 'Interview Scenarios',
    difficulty: 'hard',
    type: 'experience',
    question: 'You\'re asked to design the backend technical interview process for your team from scratch. How do you structure it?',
    answer:
      '**What the interviewer is testing**: hiring philosophy, ability to design for signal vs noise, fairness, what you actually value in engineers.\n\n**Strong approach**:\n\n**Principles first**:\n- Interviews should predict actual job performance — not memorization ability\n- Every stage should reduce uncertainty about a specific dimension\n- Treat candidates\' time as valuable — no 8-round marathon processes\n\n**Recommended structure (4 stages)**:\n\n1. **Recruiter screen (30 min)** — role fit, compensation alignment, availability. No technical content.\n2. **Take-home or async technical screen (60–90 min)** — a scoped, realistic task: "Here\'s a small Express API with 3 bugs and 2 missing features — fix and extend it." Assess: code quality, problem decomposition, testing, communication in the PR description. Take-home respects the candidate\'s schedule and removes live-coding anxiety bias.\n3. **Technical deep-dive interview (60 min)** — discuss the take-home: "Walk me through your approach. What trade-offs did you consider? What would you do differently at 10x scale?" Follow-up system design question relevant to your actual stack.\n4. **Behavioural + culture interview (45 min)** — situational questions (how have you handled conflict, a production incident, a disagreement with leadership). Assess: communication, ownership, growth mindset.\n\n**What to avoid**: LeetCode-only processes (filters for people who have time to grind LeetCode, not for backend engineering skill), no rubric (inconsistent hiring), or skipping the behavioural stage (technical skill alone doesn\'t predict team performance).\n\n**What makes this answer strong**: showing a principled reason for each stage, and being explicit about what you\'re trying to measure and what you\'re trying to avoid biasing against.',
  },
];
