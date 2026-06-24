import type { Flashcard } from '../types';

export const microservicesCards: Flashcard[] = [

  // ─── Microservices (Senior) ──────────────────────────────────────────────────

  {
    id: 'ms-1',
    category: 'Microservices',
    difficulty: 'hard',
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
    question: 'What is the difference between a monolith and a microservices architecture?',
    answer:
      "**Monolith**: all functionality (auth, orders, payments) is built and deployed as a **single application** sharing one database.\n- ✓ Simple to develop, test, and deploy initially\n- ✓ No network calls between modules\n- ✗ Scales as a whole — cannot scale just the checkout service\n- ✗ One module's bug can take down the entire app\n\n**Microservices**: functionality split into **small, independently deployable services**, each owning its own database and communicating over HTTP or a message bus.\n- ✓ Independent scaling, deployment, and technology choice per service\n- ✓ Fault isolation\n- ✗ Distributed system complexity: network failures, data consistency\n- ✗ Operational overhead: many services to monitor and version\n\n**Recommendation**: start with a modular monolith. Extract services only when you have clear domain boundaries and real scaling pain.",
  },

  {
    id: 'ms-e2',
    category: 'Microservices',
    difficulty: 'easy',
    question: 'What is an API gateway and what responsibilities should it have?',
    answer:
      '**API gateway**: a single entry point in front of all microservices that handles cross-cutting concerns so individual services do not have to.\n\n**Responsibilities**:\n- **Routing**: map `/api/orders/*` to Orders service, `/api/users/*` to Users service\n- **Authentication**: verify JWTs once at the gateway — services trust the forwarded identity\n- **Rate limiting**: protect services from abuse\n- **SSL termination**: decrypt HTTPS at the gateway; internal traffic can be plain HTTP\n- **Logging and tracing**: add `X-Request-ID` to every request\n- **Load balancing**: distribute across service instances\n\n**What it should NOT do**: business logic. An API gateway that makes DB calls or implements domain rules becomes a bottleneck.\n\n**Examples**: AWS API Gateway, Kong, Traefik, Nginx.',
  },

  // ─── Microservices (Medium) ──────────────────────────────────────────────────

  {
    id: 'ms-m1',
    category: 'Microservices',
    difficulty: 'medium',
    question: 'How do microservices communicate? Compare synchronous (HTTP/gRPC) vs asynchronous (message queue) communication.',
    answer:
      '**Synchronous**: the caller waits for a response before continuing.\n- HTTP/REST: simple, widely supported, caller is blocked\n- gRPC: faster (binary protobuf), streaming support, strong contracts\n- **Risk**: if the downstream service is slow or down, the caller fails or waits. Cascading failures: A calls B calls C — C timing out can block A\'s entire request pool\n\n**Asynchronous**: the caller publishes an event/message and returns immediately.\n- Message queues (RabbitMQ, SQS, Kafka)\n- **Benefits**: temporal decoupling, better fault tolerance, natural backpressure\n- **Risks**: eventual consistency, harder to debug, no immediate feedback\n\n**Choosing**:\n- Sync: when you need an immediate response (check inventory before placing an order)\n- Async: when the action can be deferred (send email, update search index, charge payment after acknowledgement)\n\n**Best practice**: sync for queries, async for commands/events.',
  },

  {
    id: 'ms-m2',
    category: 'Microservices',
    difficulty: 'medium',
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
