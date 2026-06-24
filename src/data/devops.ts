import type { Flashcard } from '../types';

export const devopsCards: Flashcard[] = [

  // ─── DevOps (Senior) ─────────────────────────────────────────────────────────

  {
    id: 'devops-1',
    category: 'DevOps',
    difficulty: 'hard',
    question: 'What is the difference between a Kubernetes liveness probe and a readiness probe? What happens when each fails?',
    answer:
      '**Liveness probe**: answers "Is this container alive, or is it in an unrecoverable broken state?" If it fails, kubelet **kills and restarts** the container.\n\n**Readiness probe**: answers "Is this container ready to serve traffic?" If it fails, the pod is **removed from the Service\'s endpoint list** — no new requests are routed to it. The container is NOT restarted.\n\n**Startup probe** (Node.js 14+): used for slow-starting containers. While it is running, liveness and readiness probes are disabled. Once it succeeds, normal probes take over.\n\n**Common mistake**: using the same DB-checking endpoint for both. The DB going down should make the pod unready (stop taking traffic) but NOT restart it (the pod is fine; only the DB is down). Liveness should only fail for unrecoverable states (deadlock, OOM, infinite loop).',
    code: {
      language: 'yaml',
      snippet: `# k8s deployment spec
livenessProbe:
  httpGet:
    path: /healthz/live   # shallow: just return 200 if process is running
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 10
  failureThreshold: 3     # restart after 3 consecutive failures

readinessProbe:
  httpGet:
    path: /healthz/ready  # deep: check DB connection, cache, message broker
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
  failureThreshold: 1     # remove from LB after first failure`,
    },
  },

  {
    id: 'devops-2',
    category: 'DevOps',
    difficulty: 'hard',
    question: 'Compare blue-green and canary deployment strategies. What are the rollback characteristics of each?',
    answer:
      '**Blue-Green**:\n- Maintain two identical environments (blue = live, green = staging)\n- Deploy the new version to green; run smoke tests; switch the load balancer to green\n- Rollback: flip the load balancer back to blue (seconds)\n- Cost: requires 2× infrastructure at all times; DB schema must be backward-compatible during the switch\n\n**Canary**:\n- Roll the new version out to a small percentage of traffic (e.g. 5%) and monitor error rates, latency, business metrics\n- Gradually increase percentage; roll back by routing 0% to the canary\n- Rollback: slow (must detect the problem) but affects fewer users\n- Cost: no extra infra, but requires weighted routing (K8s: via Argo Rollouts or Istio traffic splitting)\n\n**Choose blue-green** for: high-risk deployments, regulatory environments, when you need instant rollback.\n**Choose canary** for: frequent deployments, when you want data-driven confidence before full rollout.',
  },

  {
    id: 'devops-3',
    category: 'DevOps',
    difficulty: 'hard',
    question: 'What are the three pillars of observability and what is each\'s role in debugging production incidents?',
    answer:
      '**Metrics**: aggregated numeric measurements over time (request rate, error rate, latency percentiles, CPU). Answer "is something wrong?" and "how bad is it?". Tools: Prometheus + Grafana, Datadog.\n\n**Logs**: timestamped records of discrete events. Answer "what happened?". Structured JSON logs are essential — they enable filtering, aggregation, and correlation. Tools: ELK stack, Loki, Datadog Logs. Always include `correlationId`, `userId`, `requestId`.\n\n**Traces**: end-to-end timing of a single request through all services. Answer "where is the latency?" and "which service failed?". Connects the dots between metrics (something is slow) and logs (what that specific slow request did). Tools: Jaeger, Zipkin, Datadog APM.\n\n**The debugging workflow**: alert fires from metrics → trace the slow/failed requests → read logs for the specific trace IDs. Without all three, you\'re debugging blind.',
  },

  {
    id: 'devops-4',
    category: 'DevOps',
    difficulty: 'hard',
    question: 'What is a multi-stage Docker build and why does it matter for production Node.js images?',
    answer:
      'A multi-stage build uses multiple `FROM` instructions in one Dockerfile. Only the final stage ends up in the image — intermediate stages are discarded.\n\n**Why it matters**:\n- **Smaller images**: dev tools (`typescript`, test runners, `devDependencies`) are excluded from the production image\n- **Security**: fewer packages = smaller attack surface; no build toolchain in prod\n- **Layer caching**: `COPY package*.json` before `RUN npm ci` caches dependencies unless lockfile changes — faster CI\n\n**Typical stages**: (1) builder — install all deps, compile TS → JS; (2) production — `node:alpine`, `npm ci --omit=dev`, copy compiled `dist/`.',
    code: {
      language: 'dockerfile',
      snippet: `# ── Stage 1: build ────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci                      # install ALL deps (incl. devDependencies)
COPY tsconfig.json ./
COPY src ./src
RUN npm run build               # tsc → dist/

# ── Stage 2: production ────────────────────────────────
FROM node:20-alpine AS production
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev           # production deps only
COPY --from=builder /app/dist ./dist

EXPOSE 3000
USER node                       # never run as root
CMD ["node", "dist/main.js"]

# Result: ~120 MB instead of ~800 MB with a full dev image`,
    },
  },

  // ─── DevOps (Easy) ───────────────────────────────────────────────────────────

  {
    id: 'devops-e1',
    category: 'DevOps',
    difficulty: 'easy',
    question: 'What is Docker and what problem does it solve?',
    answer:
      'Docker is a **containerisation platform** that packages an application together with its runtime dependencies into a portable, isolated **container**.\n\n**Problem it solves**: "it works on my machine" — dependency and environment inconsistencies between dev, staging, and production. A Docker image bundles everything needed, so the same artifact runs identically everywhere.\n\n**Key concepts**:\n- **Image**: a read-only snapshot — like a class/template. Built from a `Dockerfile`.\n- **Container**: a running instance of an image. Like an object instantiated from a class.\n- **Dockerfile**: instructions to build the image — `FROM`, `COPY`, `RUN`, `CMD`\n- **Registry**: repository for images — Docker Hub, AWS ECR, GitHub Container Registry\n\n**vs VM**: containers share the host OS kernel (lightweight, starts in seconds). VMs emulate a full OS (heavier, starts in minutes).',
    code: {
      language: 'yaml',
      snippet: `# Dockerfile for a Node.js API
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

COPY dist/ ./dist/

USER node                    # run as non-root for security
EXPOSE 3000
CMD ["node", "dist/index.js"]`,
    },
  },

  {
    id: 'devops-e2',
    category: 'DevOps',
    difficulty: 'easy',
    question: 'What is CI/CD? What is the difference between continuous delivery and continuous deployment?',
    answer:
      '**CI (Continuous Integration)**: every code push automatically triggers a pipeline that builds the code, runs tests, and reports pass/fail. Goal: detect integration bugs early, keep `main` always green.\n\n**CD — Continuous Delivery**: after CI passes, the artifact is automatically built and pushed to staging, ready to be **manually** promoted to production.\n\n**CD — Continuous Deployment**: every passing pipeline is automatically deployed **to production** with no manual gate. Requires strong test coverage and monitoring.\n\n**Typical pipeline stages**:\n1. Lint & type-check\n2. Unit tests\n3. Build Docker image\n4. Integration tests\n5. Push image to registry\n6. Deploy to staging\n7. (Optional) smoke tests on staging\n8. Deploy to production (auto or manual gate)\n\n**Tools**: GitHub Actions, GitLab CI, Jenkins, CircleCI, Buildkite.',
  },

  // ─── DevOps (Medium) ─────────────────────────────────────────────────────────

  {
    id: 'devops-m1',
    category: 'DevOps',
    difficulty: 'medium',
    question: 'What is the difference between blue-green and canary deployments?',
    answer:
      '**Blue-Green**: maintain two identical production environments — Blue (current) and Green (new version). Deploy to Green, test, then switch the load balancer to send 100% of traffic to Green. Blue becomes the instant rollback target.\n- ✓ Zero-downtime, instant rollback\n- ✗ Requires double the infrastructure\n- ✗ All-or-nothing traffic switch — if Green has a bug, 100% of users are affected before rollback\n\n**Canary**: gradually shift a small percentage of traffic (5%) to the new version. Monitor error rates and latency. If healthy, ramp to 10%, 50%, 100%.\n- ✓ Risk limited to the canary percentage\n- ✓ Real production traffic validates the release\n- ✗ More complex (requires smart load balancer or feature flags)\n- ✗ Slower rollout\n\n**When to use**: blue-green for large infrequent releases with high rollback risk. Canary for continuous deployment where gradual validation matters.',
  },

  {
    id: 'devops-m2',
    category: 'DevOps',
    difficulty: 'medium',
    question: 'What is Kubernetes (k8s)? What problems does it solve that Docker alone does not?',
    answer:
      'Kubernetes is a **container orchestration platform** — it runs, scales, and manages containers across a cluster of machines.\n\n**Problems Docker alone does not solve**:\n- **Scheduling**: which node should run this container?\n- **Self-healing**: k8s detects failed pods and replaces them automatically\n- **Scaling**: `kubectl scale deployment my-api --replicas=10`; HPA scales based on CPU/memory metrics\n- **Rolling deployments**: replace pods one-by-one to avoid downtime\n- **Service discovery**: pods get dynamic IPs; k8s Services provide stable DNS names\n- **Config management**: `Secrets` and `ConfigMaps` separate config from images\n- **Resource limits**: prevent one container consuming all CPU/memory on a node\n\n**Key objects**: Pod, Deployment, Service, Ingress, ConfigMap, Secret, HorizontalPodAutoscaler.',
  },
];
