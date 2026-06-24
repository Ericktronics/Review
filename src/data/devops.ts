import type { Flashcard } from '../types';

export const devopsCards: Flashcard[] = [

  // ─── DevOps (Senior) ─────────────────────────────────────────────────────────

  {
    id: 'devops-1',
    category: 'DevOps',
    difficulty: 'hard',
    type: 'experience',
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
    type: 'experience',
    question: 'Compare blue-green and canary deployment strategies. What are the rollback characteristics of each?',
    answer:
      '**Blue-Green**:\n- Maintain two identical environments (blue = live, green = staging)\n- Deploy the new version to green; run smoke tests; switch the load balancer to green\n- Rollback: flip the load balancer back to blue (seconds)\n- Cost: requires 2× infrastructure at all times; DB schema must be backward-compatible during the switch\n\n**Canary**:\n- Roll the new version out to a small percentage of traffic (e.g. 5%) and monitor error rates, latency, business metrics\n- Gradually increase percentage; roll back by routing 0% to the canary\n- Rollback: slow (must detect the problem) but affects fewer users\n- Cost: no extra infra, but requires weighted routing (K8s: via Argo Rollouts or Istio traffic splitting)\n\n**Choose blue-green** for: high-risk deployments, regulatory environments, when you need instant rollback.\n**Choose canary** for: frequent deployments, when you want data-driven confidence before full rollout.',
  },

  {
    id: 'devops-3',
    category: 'DevOps',
    difficulty: 'hard',
    type: 'experience',
    question: 'What are the three pillars of observability and what is each\'s role in debugging production incidents?',
    answer:
      '**Metrics**: aggregated numeric measurements over time (request rate, error rate, latency percentiles, CPU). Answer "is something wrong?" and "how bad is it?". Tools: Prometheus + Grafana, Datadog.\n\n**Logs**: timestamped records of discrete events. Answer "what happened?". Structured JSON logs are essential — they enable filtering, aggregation, and correlation. Tools: ELK stack, Loki, Datadog Logs. Always include `correlationId`, `userId`, `requestId`.\n\n**Traces**: end-to-end timing of a single request through all services. Answer "where is the latency?" and "which service failed?". Connects the dots between metrics (something is slow) and logs (what that specific slow request did). Tools: Jaeger, Zipkin, Datadog APM.\n\n**The debugging workflow**: alert fires from metrics → trace the slow/failed requests → read logs for the specific trace IDs. Without all three, you\'re debugging blind.',
  },

  {
    id: 'devops-4',
    category: 'DevOps',
    difficulty: 'hard',
    type: 'experience',
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
    type: 'basics',
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
    type: 'basics',
    question: 'What is CI/CD? What is the difference between continuous delivery and continuous deployment?',
    answer:
      '**CI (Continuous Integration)**: every code push automatically triggers a pipeline that builds the code, runs tests, and reports pass/fail. Goal: detect integration bugs early, keep `main` always green.\n\n**CD — Continuous Delivery**: after CI passes, the artifact is automatically built and pushed to staging, ready to be **manually** promoted to production.\n\n**CD — Continuous Deployment**: every passing pipeline is automatically deployed **to production** with no manual gate. Requires strong test coverage and monitoring.\n\n**Typical pipeline stages**:\n1. Lint & type-check\n2. Unit tests\n3. Build Docker image\n4. Integration tests\n5. Push image to registry\n6. Deploy to staging\n7. (Optional) smoke tests on staging\n8. Deploy to production (auto or manual gate)\n\n**Tools**: GitHub Actions, GitLab CI, Jenkins, CircleCI, Buildkite.',
  },

  // ─── DevOps (Medium) ─────────────────────────────────────────────────────────

  {
    id: 'devops-e3',
    category: 'DevOps',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is Infrastructure as Code (IaC)?',
    answer:
      "**Infrastructure as Code (IaC)** is the practice of managing and provisioning infrastructure (servers, databases, networking, cloud resources) using **configuration files or code** instead of manual processes or dashboards.\n\n**Why it matters**:\n- **Reproducibility** — the same code creates identical environments every time (dev = staging = prod)\n- **Version control** — infrastructure changes are tracked in Git, reviewed in PRs, and can be rolled back\n- **Automation** — provisioning a new environment takes minutes, not days\n- **Documentation** — the code *is* the documentation of your infrastructure\n- **Disaster recovery** — if your entire infra is destroyed, you can recreate it from code\n\n**Popular tools**:\n- **Terraform** — cloud-agnostic, declarative HCL syntax; most widely used\n- **AWS CloudFormation** — AWS-specific, YAML/JSON\n- **Pulumi** — define infra using real programming languages (TypeScript, Python)\n- **Ansible** — configuration management and provisioning\n- **Kubernetes YAML/Helm** — IaC for container orchestration\n\n**Declarative vs imperative**: most IaC tools are declarative — you describe the desired end state, the tool figures out how to get there.",
    code: {
      language: 'yaml',
      snippet: `# Terraform example — provision an AWS RDS database
resource "aws_db_instance" "api_db" {
  identifier        = "my-api-db"
  engine            = "postgres"
  engine_version    = "15.3"
  instance_class    = "db.t3.medium"
  allocated_storage = 20

  db_name  = "myapp"
  username = var.db_username
  password = var.db_password

  vpc_security_group_ids = [aws_security_group.db.id]
  skip_final_snapshot    = false

  tags = { Environment = var.env }
}
# Run: terraform plan   (preview changes)
#      terraform apply  (apply changes)
#      terraform destroy (tear down)`,
    },
  },

  {
    id: 'devops-e4',
    category: 'DevOps',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is a health check endpoint and why is it important?',
    answer:
      "A **health check endpoint** is a dedicated HTTP endpoint (typically `GET /healthz` or `GET /health`) that reports whether the service is healthy and ready to serve traffic.\n\n**Two flavors**:\n- **Liveness** (`/healthz/live`) — is the process alive and not in a broken state? Returns 200 if the process is running normally. Used by Kubernetes to decide whether to restart a container.\n- **Readiness** (`/healthz/ready`) — is the service ready to accept traffic? Checks dependencies (DB connection, Redis, external APIs). Used by Kubernetes to decide whether to route traffic to this pod.\n\n**Why it's important**:\n- **Load balancers** use health checks to remove unhealthy instances from rotation automatically\n- **Kubernetes** uses them to restart crashed pods and avoid sending traffic to unready pods\n- **CI/CD** pipelines check health after deployment to verify the rollout succeeded\n- **Monitoring** can alert when health checks start failing\n\n**Best practice**: liveness should be lightweight (just return 200 if the process is running). Readiness can check DB connectivity but should have a timeout so a slow DB doesn't block indefinitely.",
    code: {
      language: 'typescript',
      snippet: `// Liveness — shallow check: is the process alive?
app.get('/healthz/live', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Readiness — deep check: can we serve traffic?
app.get('/healthz/ready', async (_req, res) => {
  try {
    await Promise.race([
      pool.query('SELECT 1'),          // DB check
      new Promise((_, rej) => setTimeout(() => rej(new Error('DB timeout')), 2000)),
    ]);
    await redis.ping();                // Cache check
    res.status(200).json({ status: 'ready', db: 'ok', cache: 'ok' });
  } catch (err) {
    res.status(503).json({ status: 'unavailable', error: String(err) });
  }
});`,
    },
  },

  {
    id: 'devops-e5',
    category: 'DevOps',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is the difference between a Dockerfile and a docker-compose.yml?',
    answer:
      "**Dockerfile**: instructions for **building a single Docker image** — what OS to start from, what packages to install, what files to copy, what command to run.\n\n**docker-compose.yml**: defines and runs **multiple containers together** as a local development environment — how they connect to each other, what ports to expose, what volumes to mount, what environment variables to set.\n\n**Analogy**: the Dockerfile is a recipe for baking one dish; docker-compose.yml is the full menu that says 'serve dish A with drink B and side C'.\n\n**Dockerfile** is used in CI/CD to build the production image. **docker-compose** is primarily a **local development tool** — spin up your app + database + Redis + mail server with one command.\n\n**In production**: use Kubernetes or your cloud platform to run containers — not docker-compose (it doesn't have scheduling, self-healing, or scaling).",
    code: {
      language: 'yaml',
      snippet: `# docker-compose.yml — local dev: API + Postgres + Redis
services:
  api:
    build: .              # uses your Dockerfile
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://user:pass@db:5432/myapp
      REDIS_URL: redis://cache:6379
    depends_on:
      - db
      - cache
    volumes:
      - ./src:/app/src    # hot reload in development

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: myapp
    volumes:
      - pgdata:/var/lib/postgresql/data

  cache:
    image: redis:7-alpine

volumes:
  pgdata:

# Run: docker compose up
# Stops: docker compose down`,
    },
  },

  {
    id: 'devops-m3',
    category: 'DevOps',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is Helm in Kubernetes?',
    answer:
      "**Helm** is the **package manager for Kubernetes** — it lets you define, install, and upgrade complex Kubernetes applications as a single unit called a **chart**.\n\n**Problems Helm solves**:\n- Kubernetes manifests (Deployment, Service, Ingress, ConfigMap) for a single app can be 5–10 YAML files with many repeated values\n- Deploying to multiple environments (dev, staging, prod) requires different values (image tag, replica count, resource limits) — without Helm you maintain separate copies\n\n**Key concepts**:\n- **Chart** — a package of Kubernetes YAML templates\n- **Values** — configurable parameters (`values.yaml`); override per environment\n- **Release** — a deployed instance of a chart in a cluster\n- **Template** — Kubernetes manifest with `{{ .Values.xxx }}` placeholders\n\n**Workflow**:\n```bash\nhelm install my-api ./charts/api --values=values.prod.yaml\nhelm upgrade my-api ./charts/api --set image.tag=v1.2.3\nhelm rollback my-api 1    # roll back to previous release\n```\n\n**Artifact Hub**: public repository of community charts for common software (PostgreSQL, Redis, Nginx, cert-manager).",
    code: {
      language: 'yaml',
      snippet: `# values.yaml — default values for the chart
replicaCount: 2
image:
  repository: my-registry/my-api
  tag: latest
service:
  port: 3000
resources:
  requests: { cpu: 100m, memory: 128Mi }
  limits:   { cpu: 500m, memory: 256Mi }

# templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment
spec:
  replicas: {{ .Values.replicaCount }}
  template:
    spec:
      containers:
        - image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          resources: {{- toYaml .Values.resources | nindent 12 }}

# Deploy with environment-specific overrides
# helm upgrade --install my-api ./chart \
#   --set image.tag=v1.5.0 \
#   --set replicaCount=5`,
    },
  },

  {
    id: 'devops-m4',
    category: 'DevOps',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is observability? Explain the three pillars (logs, metrics, traces).',
    answer:
      "**Observability** is the ability to understand the internal state of a system by examining its external outputs. A highly observable system lets you ask arbitrary questions about what's happening and why — without deploying new code.\n\n**The Three Pillars**:\n\n**1. Logs** — timestamped records of discrete events.\n- What happened? 'User 42 failed to authenticate at 10:32:01'\n- Best practice: structured JSON logs with `correlationId`, `userId`, `level`\n- Tools: ELK Stack (Elasticsearch + Logstash + Kibana), Loki + Grafana, Datadog Logs\n\n**2. Metrics** — aggregated numeric measurements over time.\n- How is the system performing? Error rate = 2.3%, P99 latency = 450 ms, CPU = 73%\n- Best practice: track the four golden signals (latency, traffic, errors, saturation)\n- Tools: Prometheus + Grafana, Datadog, CloudWatch\n\n**3. Traces** — the end-to-end journey of a single request across services.\n- Where is the latency? Why did this request take 2 seconds?\n- Connects logs and metrics to a specific request via a `traceId`\n- Tools: Jaeger, Zipkin, Datadog APM, OpenTelemetry\n\n**Debugging workflow**: metrics alert on high error rate → traces identify the slow service → logs for that trace show the root cause.",
  },

  {
    id: 'devops-m1',
    category: 'DevOps',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is the difference between blue-green and canary deployments?',
    answer:
      '**Blue-Green**: maintain two identical production environments — Blue (current) and Green (new version). Deploy to Green, test, then switch the load balancer to send 100% of traffic to Green. Blue becomes the instant rollback target.\n- ✓ Zero-downtime, instant rollback\n- ✗ Requires double the infrastructure\n- ✗ All-or-nothing traffic switch — if Green has a bug, 100% of users are affected before rollback\n\n**Canary**: gradually shift a small percentage of traffic (5%) to the new version. Monitor error rates and latency. If healthy, ramp to 10%, 50%, 100%.\n- ✓ Risk limited to the canary percentage\n- ✓ Real production traffic validates the release\n- ✗ More complex (requires smart load balancer or feature flags)\n- ✗ Slower rollout\n\n**When to use**: blue-green for large infrequent releases with high rollback risk. Canary for continuous deployment where gradual validation matters.',
  },

  {
    id: 'devops-m2',
    category: 'DevOps',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is Kubernetes (k8s)? What problems does it solve that Docker alone does not?',
    answer:
      'Kubernetes is a **container orchestration platform** — it runs, scales, and manages containers across a cluster of machines.\n\n**Problems Docker alone does not solve**:\n- **Scheduling**: which node should run this container?\n- **Self-healing**: k8s detects failed pods and replaces them automatically\n- **Scaling**: `kubectl scale deployment my-api --replicas=10`; HPA scales based on CPU/memory metrics\n- **Rolling deployments**: replace pods one-by-one to avoid downtime\n- **Service discovery**: pods get dynamic IPs; k8s Services provide stable DNS names\n- **Config management**: `Secrets` and `ConfigMaps` separate config from images\n- **Resource limits**: prevent one container consuming all CPU/memory on a node\n\n**Key objects**: Pod, Deployment, Service, Ingress, ConfigMap, Secret, HorizontalPodAutoscaler.',
  },
];
