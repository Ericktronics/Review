import type { Flashcard } from '../types';

export const microservicesCards: Flashcard[] = [

  // ─── Microservices (Senior) ──────────────────────────────────────────────────

  {
    id: 'ms-1',
    category: 'Microservices',
    difficulty: 'hard',
    type: 'experience',
    question: 'What is the Circuit Breaker pattern and how do you implement it with state tracking and half-open probing?',
    answer:
      'The Circuit Breaker wraps calls to an external dependency. After a configured failure threshold it "opens" and rejects calls immediately (fail-fast), giving the dependency time to recover.\n\n**States**:\n- **Closed** — normal operation; count failures. If failures/s > threshold, trip to Open\n- **Open** — all calls fail immediately with a `CircuitOpenError`; start a reset timer\n- **Half-Open** — after reset timer, allow one probe request. If it succeeds → Closed; if it fails → Open again\n\n**Key metrics**: failure rate (not just count, to avoid false trips on low traffic), slow call rate (timeouts), and request volume threshold (don\'t trip on 1 failure from 1 request).\n\n**Libraries**: `opossum` for Node.js. Istio / Linkerd implement CB at the service mesh level without code changes.',
    code: {
      language: 'typescript',
      snippet: `import CircuitBreaker from 'opossum';

const options = {
  timeout: 3000,          // fail if fn takes longer than 3 s
  errorThresholdPercentage: 50, // trip when 50% of calls fail
  resetTimeout: 10_000,   // try again after 10 s
  volumeThreshold: 10,    // need at least 10 calls to trip
};

const breaker = new CircuitBreaker(callPaymentService, options);

breaker.fallback(() => ({ status: 'pending', message: 'Payment queued' }));

breaker.on('open',     () => logger.warn('Payment CB opened'));
breaker.on('halfOpen', () => logger.info('Payment CB half-open probe'));
breaker.on('close',    () => logger.info('Payment CB closed'));

// Use just like the original function
const result = await breaker.fire(paymentPayload);`,
    },
  },

  {
    id: 'ms-2',
    category: 'Microservices',
    difficulty: 'hard',
    type: 'experience',
    question: 'What is the Saga pattern and when do you use choreography vs orchestration?',
    answer:
      'A Saga manages a distributed transaction by breaking it into a sequence of **local transactions** with **compensating transactions** to undo them on failure.\n\n**Choreography**: each service publishes events; downstream services react. No central coordinator. Pros: loose coupling, easy to add new participants. Cons: hard to trace the overall flow; implicit dependencies through events.\n\n**Orchestration**: a dedicated Saga orchestrator sends commands and tracks state. Pros: the business flow is visible in one place, easier to debug. Cons: orchestrator becomes a coupling point; must be highly available.\n\n**Compensating transactions** must be idempotent and cannot always restore the exact prior state (e.g., a sent email can\'t be "unsent"). Design the domain accordingly — prefer reversible operations or use "logical undo" (issue a refund, not a rollback).',
    code: {
      language: 'typescript',
      snippet: `// Orchestration Saga for order placement
class OrderSaga {
  async execute(order: Order) {
    let state: SagaState = 'started';
    try {
      await inventoryService.reserve(order);      state = 'reserved';
      await paymentService.charge(order);         state = 'charged';
      await shippingService.schedule(order);      state = 'shipped';
      await this.emit('OrderCompleted', order);
    } catch (err) {
      // Compensate in reverse order
      if (state === 'charged')   await paymentService.refund(order);
      if (state === 'reserved')  await inventoryService.release(order);
      await this.emit('OrderFailed', { order, reason: err.message });
      throw err;
    }
  }
}`,
    },
  },

  {
    id: 'ms-3',
    category: 'Microservices',
    difficulty: 'hard',
    type: 'experience',
    question: 'What is distributed tracing? How do you instrument a Node.js microservice with OpenTelemetry?',
    answer:
      'Distributed tracing records the path and timing of a request as it flows through multiple services. Each unit of work is a **span**; related spans form a **trace** connected by a **trace ID** propagated in HTTP headers (`traceparent` in W3C Trace Context).\n\n**Core concepts**:\n- **Trace**: the full end-to-end journey of one request\n- **Span**: one operation within a trace (DB query, HTTP call, message publish)\n- **Context propagation**: the trace ID is injected into outgoing requests and extracted from incoming ones\n- **Sampling**: recording every span in production is too expensive; use head-based or tail-based sampling\n\n**OpenTelemetry** is the CNCF standard SDK. Exporters send data to Jaeger, Zipkin, or Datadog. A single auto-instrumentation setup covers HTTP, DB drivers, and Redis without manual span creation.',
    code: {
      language: 'typescript',
      snippet: `// otel.ts – initialise BEFORE importing anything else
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
  }),
  instrumentations: [getNodeAutoInstrumentations()],
  // auto-instruments: http, express, pg, redis, grpc, ...
});
sdk.start();

// Manual span for custom business logic
import { trace, context } from '@opentelemetry/api';
const tracer = trace.getTracer('order-service');

async function processOrder(order: Order) {
  return tracer.startActiveSpan('processOrder', async (span) => {
    span.setAttributes({ 'order.id': order.id, 'order.total': order.total });
    try {
      const result = await doWork(order);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (err) {
      span.recordException(err as Error);
      span.setStatus({ code: SpanStatusCode.ERROR });
      throw err;
    } finally {
      span.end();
    }
  });
}`,
    },
  },

  // ─── Microservices (Easy) ────────────────────────────────────────────────────

  {
    id: 'ms-e1',
    category: 'Microservices',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is the difference between a monolith and a microservices architecture?',
    answer:
      "**Monolith**: all functionality (auth, orders, payments) is built and deployed as a **single application** sharing one database.\n- ✓ Simple to develop, test, and deploy initially\n- ✓ No network calls between modules\n- ✗ Scales as a whole — cannot scale just the checkout service\n- ✗ One module's bug can take down the entire app\n\n**Microservices**: functionality split into **small, independently deployable services**, each owning its own database and communicating over HTTP or a message bus.\n- ✓ Independent scaling, deployment, and technology choice per service\n- ✓ Fault isolation\n- ✗ Distributed system complexity: network failures, data consistency\n- ✗ Operational overhead: many services to monitor and version\n\n**Recommendation**: start with a modular monolith. Extract services only when you have clear domain boundaries and real scaling pain.",
  },

  {
    id: 'ms-e2',
    category: 'Microservices',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is an API gateway and what responsibilities should it have?',
    answer:
      '**API gateway**: a single entry point in front of all microservices that handles cross-cutting concerns so individual services do not have to.\n\n**Responsibilities**:\n- **Routing**: map `/api/orders/*` to Orders service, `/api/users/*` to Users service\n- **Authentication**: verify JWTs once at the gateway — services trust the forwarded identity\n- **Rate limiting**: protect services from abuse\n- **SSL termination**: decrypt HTTPS at the gateway; internal traffic can be plain HTTP\n- **Logging and tracing**: add `X-Request-ID` to every request\n- **Load balancing**: distribute across service instances\n\n**What it should NOT do**: business logic. An API gateway that makes DB calls or implements domain rules becomes a bottleneck.\n\n**Examples**: AWS API Gateway, Kong, Traefik, Nginx.',
  },

  // ─── Microservices (Medium) ──────────────────────────────────────────────────

  {
    id: 'ms-e3',
    category: 'Microservices',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is REST vs event-driven communication in microservices?',
    answer:
      "**REST (synchronous)**: Service A sends an HTTP request to Service B and **waits for a response** before continuing.\n- Simple, familiar, immediate feedback\n- Tightly coupled in time — if B is down or slow, A is affected\n- Good for: queries that need an immediate answer (check inventory before placing an order)\n\n**Event-driven (asynchronous)**: Service A **publishes an event** to a message broker (Kafka, RabbitMQ, SQS). Service B subscribes and processes it independently. A does not wait.\n- Decoupled — A doesn't care if B is down; the event is queued\n- Harder to debug; eventual consistency\n- Good for: notifications, background processing, fan-out to multiple consumers\n\n**When to use which**:\n| Scenario | Use |\n|---|---|\n| Check if item is in stock | REST (need immediate answer) |\n| Send welcome email after signup | Event (fire and forget) |\n| Update search index after product change | Event (async, multiple consumers) |\n| Authenticate a user | REST (synchronous, immediate) |\n\n**Best practice**: *synchronous for queries, asynchronous for commands and domain events.*",
  },

  {
    id: 'ms-e4',
    category: 'Microservices',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is a service registry and why is it needed?',
    answer:
      "In microservices, services are deployed as many instances across dynamic infrastructure — IP addresses and ports change as containers start and stop. A **service registry** is a directory that keeps track of where each service instance is running.\n\n**How it works**:\n- When a service starts, it **registers itself** in the registry (name + address + port + health status)\n- When a service wants to call another, it **queries the registry** to discover the current address\n- The registry periodically checks health; unhealthy instances are removed\n\n**Why it's needed**:\n- Without it, you'd need to hardcode IPs — impossible in dynamic cloud environments\n- Enables **load balancing** — the registry returns multiple instances; the client picks one\n- Enables **zero-downtime deployments** — new instances register, old ones deregister\n\n**Implementations**:\n- **Client-side discovery**: the service queries the registry and load-balances itself (Netflix Eureka)\n- **Server-side discovery**: a load balancer or API gateway queries the registry (AWS ALB + ECS, Kubernetes Service)\n\n**Kubernetes built-in**: Kubernetes Services act as a built-in service registry — DNS resolves `my-service` to the current pod IPs automatically.",
  },

  {
    id: 'ms-e5',
    category: 'Microservices',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is the difference between orchestration and choreography in microservices?',
    answer:
      "Both describe how microservices coordinate to complete a multi-step business process.\n\n**Orchestration**: a **central coordinator** (orchestrator) tells each service what to do and when. It knows the full workflow and directs each step.\n- ✓ Workflow is visible in one place — easy to understand and monitor\n- ✓ Easy to handle compensations (rollback) — the orchestrator tracks state\n- ✗ Orchestrator is a central coupling point — it must know about all participants\n- Example: a Saga Orchestrator that calls Payment → Inventory → Shipping in sequence\n\n**Choreography**: each service **reacts to events** independently. There is no central brain — services know what to do when they see a certain event.\n- ✓ Fully decoupled — services don't know about each other\n- ✓ Easy to add new participants (just subscribe to the event)\n- ✗ Workflow is implicit — hard to understand the big picture\n- ✗ Debugging distributed flows is harder\n- Example: OrderPlaced event → Payment service charges → PaymentSucceeded event → Inventory reserves → InventoryReserved event → Shipping schedules\n\n**When to use**: choreography for simple, loosely-coupled workflows; orchestration for complex flows with many conditional steps and compensation logic.",
  },

  {
    id: 'ms-m3',
    category: 'Microservices',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is the Strangler Fig pattern for migrating a monolith?',
    answer:
      "The **Strangler Fig pattern** (Martin Fowler) incrementally replaces a legacy monolith with microservices, piece by piece, without a big-bang rewrite.\n\n**Named after** the strangler fig tree, which grows around a host tree and eventually replaces it.\n\n**How it works**:\n1. Place a **facade (API gateway or reverse proxy)** in front of the monolith — all traffic goes through it\n2. Identify a feature/domain to extract (start with low-risk, well-defined boundaries)\n3. Build the new service independently, with its own database\n4. **Route** traffic for that feature from the facade to the new service\n5. Remove the corresponding code from the monolith\n6. Repeat until the monolith is empty and can be decommissioned\n\n**Key challenges**:\n- **Data migration** — the new service needs its own data; dual-write during transition, then cut over\n- **Shared database** — old monolith and new service may need to share the DB temporarily; plan the separation\n- **Momentum** — extraction can stall if it's not prioritized; the monolith keeps receiving new features\n\n**Why it beats a rewrite**: the system stays live and delivers value throughout the migration. A full rewrite risks months of parallel maintenance and a risky big-bang cutover.",
    code: {
      language: 'typescript',
      snippet: `// Reverse proxy / API gateway routing
// nginx or Express gateway in front of monolith

const proxy = require('http-proxy-middleware');

// NEW: User service has been extracted
app.use('/api/users', proxy.createProxyMiddleware({
  target: 'http://user-service:3001',
  changeOrigin: true,
}));

// NEW: Orders service has been extracted
app.use('/api/orders', proxy.createProxyMiddleware({
  target: 'http://order-service:3002',
  changeOrigin: true,
}));

// LEGACY: everything else still goes to the monolith
app.use('/', proxy.createProxyMiddleware({
  target: 'http://monolith:3000',
  changeOrigin: true,
}));`,
    },
  },

  {
    id: 'ms-m4',
    category: 'Microservices',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is a service mesh and what problems does it solve?',
    answer:
      "A **service mesh** is an infrastructure layer that handles **service-to-service communication** transparently, without requiring application code changes. Each service gets a **sidecar proxy** (e.g. Envoy) that intercepts all inbound and outbound traffic.\n\n**Problems it solves**:\n- **Observability** — automatic distributed tracing, metrics, and access logs for every service call without instrumenting each service\n- **Traffic management** — canary deployments, A/B testing, circuit breaking, retries, and timeouts configured centrally\n- **mTLS (mutual TLS)** — automatic encryption and authentication between all services; zero-trust networking\n- **Load balancing** — advanced algorithms (least connections, zone-aware) without application code\n\n**How it works**:\n- A **data plane** (Envoy sidecars injected into every pod) intercepts traffic\n- A **control plane** (Istio, Linkerd) configures the sidecars centrally\n\n**Trade-offs**: adds operational complexity; the control plane is another system to manage; increases latency slightly (sidecar hop). Worth it for large microservice deployments; overkill for a handful of services.",
  },

  {
    id: 'ms-m1',
    category: 'Microservices',
    difficulty: 'medium',
    type: 'basics',
    question: 'How do microservices communicate? Compare synchronous (HTTP/gRPC) vs asynchronous (message queue) communication.',
    answer:
      '**Synchronous**: the caller waits for a response before continuing.\n- HTTP/REST: simple, widely supported, caller is blocked\n- gRPC: faster (binary protobuf), streaming support, strong contracts\n- **Risk**: if the downstream service is slow or down, the caller fails or waits. Cascading failures: A calls B calls C — C timing out can block A\'s entire request pool\n\n**Asynchronous**: the caller publishes an event/message and returns immediately.\n- Message queues (RabbitMQ, SQS, Kafka)\n- **Benefits**: temporal decoupling, better fault tolerance, natural backpressure\n- **Risks**: eventual consistency, harder to debug, no immediate feedback\n\n**Choosing**:\n- Sync: when you need an immediate response (check inventory before placing an order)\n- Async: when the action can be deferred (send email, update search index, charge payment after acknowledgement)\n\n**Best practice**: sync for queries, async for commands/events.',
  },

  {
    id: 'ms-m2',
    category: 'Microservices',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is the Saga pattern? How does it handle distributed transactions across microservices?',
    answer:
      'In microservices you cannot use a single ACID transaction across multiple services. The **Saga pattern** replaces a distributed transaction with a sequence of **local transactions**, each publishing an event that triggers the next step.\n\n**Two implementations**:\n- **Choreography**: each service listens for events and decides what to do next. No central coordinator. Simple for short sagas, hard to track complex ones.\n- **Orchestration**: a central Saga Orchestrator sends commands to each service and waits for responses. Flow is explicit and easier to monitor.\n\n**Compensating transactions**: if a step fails, previously completed steps are undone with compensating transactions (not a true rollback — the DB writes already happened).\n\n**Example**: `OrderPlaced` → `charge payment` → success → `reserve inventory` → failure → `refund payment` (compensation).',
    code: {
      language: 'typescript',
      snippet: `// Orchestrator-style saga
async function placeOrderSaga(orderId: string) {
  try {
    await paymentService.charge(orderId);
    await inventoryService.reserve(orderId);
    await notificationService.confirm(orderId);
    await orderService.markComplete(orderId);
  } catch {
    // Compensating transactions in reverse order
    await inventoryService.release(orderId).catch(() => {});
    await paymentService.refund(orderId).catch(() => {});
    await orderService.markFailed(orderId);
    throw new Error('Order saga failed — rolled back');
  }
}`,
    },
  },
];
