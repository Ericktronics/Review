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
    id: 'int-h6',
    category: 'Interview Scenarios',
    difficulty: 'hard',
    type: 'experience',
    question: 'You\'re asked to design the backend technical interview process for your team from scratch. How do you structure it?',
    answer:
      '**What the interviewer is testing**: hiring philosophy, ability to design for signal vs noise, fairness, what you actually value in engineers.\n\n**Strong approach**:\n\n**Principles first**:\n- Interviews should predict actual job performance — not memorization ability\n- Every stage should reduce uncertainty about a specific dimension\n- Treat candidates\' time as valuable — no 8-round marathon processes\n\n**Recommended structure (4 stages)**:\n\n1. **Recruiter screen (30 min)** — role fit, compensation alignment, availability. No technical content.\n2. **Take-home or async technical screen (60–90 min)** — a scoped, realistic task: "Here\'s a small Express API with 3 bugs and 2 missing features — fix and extend it." Assess: code quality, problem decomposition, testing, communication in the PR description. Take-home respects the candidate\'s schedule and removes live-coding anxiety bias.\n3. **Technical deep-dive interview (60 min)** — discuss the take-home: "Walk me through your approach. What trade-offs did you consider? What would you do differently at 10x scale?" Follow-up system design question relevant to your actual stack.\n4. **Behavioural + culture interview (45 min)** — situational questions (how have you handled conflict, a production incident, a disagreement with leadership). Assess: communication, ownership, growth mindset.\n\n**What to avoid**: LeetCode-only processes (filters for people who have time to grind LeetCode, not for backend engineering skill), no rubric (inconsistent hiring), or skipping the behavioural stage (technical skill alone doesn\'t predict team performance).\n\n**What makes this answer strong**: showing a principled reason for each stage, and being explicit about what you\'re trying to measure and what you\'re trying to avoid biasing against.',
  },
];
