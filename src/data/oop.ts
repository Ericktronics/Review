import type { Flashcard } from '../types';

export const oopCards: Flashcard[] = [

  // ─── OOP ─────────────────────────────────────────────────────────────────────

  {
    id: 'oop-1',
    category: 'OOP',
    difficulty: 'hard',
    type: 'experience',
    question: 'Explain each of the SOLID principles and give a concrete TypeScript example of a violation and its fix.',
    answer:
      '**S — Single Responsibility**: a class should have one reason to change. Violating it: a `UserService` that both validates, saves to DB, and sends emails.\n\n**O — Open/Closed**: open for extension, closed for modification. Add new behaviour via new classes, not by editing existing ones (Strategy, Decorator).\n\n**L — Liskov Substitution**: subtypes must be substitutable for their base type without altering correctness. Violating it: `Square extends Rectangle` breaks if `setWidth` also sets height.\n\n**I — Interface Segregation**: clients should not depend on methods they don\'t use. Split fat interfaces into focused ones.\n\n**D — Dependency Inversion**: high-level modules depend on abstractions, not concretions. Inject `IEmailService`, not `SendGridService`.',
    code: {
      language: 'typescript',
      snippet: `// OCP violation: adding a new discount type requires editing this function
function applyDiscount(type: 'seasonal' | 'vip', price: number) {
  if (type === 'seasonal') return price * 0.9;
  if (type === 'vip')      return price * 0.8;
  return price;
}

// OCP fix: extend via new classes
interface DiscountStrategy { apply(price: number): number; }
class SeasonalDiscount implements DiscountStrategy {
  apply(price: number) { return price * 0.9; }
}
class VipDiscount implements DiscountStrategy {
  apply(price: number) { return price * 0.8; }
}

// DIP fix: depend on abstraction
interface IEmailService { send(to: string, body: string): Promise<void>; }

class UserService {
  constructor(
    private db: IUserRepository,   // abstraction
    private email: IEmailService,  // abstraction
  ) {}
}`,
    },
  },

  {
    id: 'oop-2',
    category: 'OOP',
    difficulty: 'hard',
    type: 'experience',
    question: 'Why prefer composition over inheritance, and how do you implement it in TypeScript?',
    answer:
      'Inheritance creates tight coupling between base and derived classes — the **fragile base class** problem means a change in the base can silently break subclasses. It also forces you into a single inheritance hierarchy, while objects often need behaviours from multiple orthogonal concerns.\n\n**Composition**: build objects by assembling small, focused behaviours. Each behaviour is a strategy/mixin that can be reused independently.\n\n**When inheritance is fine**: pure "is-a" relationships with stable base classes (e.g., `HttpError extends Error`).\n\n**Prefer**: composition for behaviour reuse, interfaces for type contracts, inheritance only for genuine specialisation hierarchies.',
    code: {
      language: 'typescript',
      snippet: `// Inheritance problem: what if a Duck can Swim AND Fly but not Quack?
class Animal { breathe() {} }
class Duck extends Animal { quack() {} fly() {} swim() {} } // God class

// Composition: mix independent capabilities
interface Flyable  { fly():  void; }
interface Swimmable { swim(): void; }

const canFly   = (): Flyable   => ({ fly:  () => console.log('flying') });
const canSwim  = (): Swimmable => ({ swim: () => console.log('swimming') });

function createDuck() {
  return { ...canFly(), ...canSwim(), quack: () => console.log('quack') };
}

// Real-world: service built from composable pieces
class OrderService {
  constructor(
    private readonly pricing:  PricingService,
    private readonly inventory: InventoryService,
    private readonly notifier:  NotificationService,
  ) {}

  async place(order: Order) {
    await this.inventory.reserve(order);
    const total = this.pricing.calculate(order);
    await this.notifier.confirm(order, total);
  }
}`,
    },
  },

  {
    id: 'oop-3',
    category: 'OOP',
    difficulty: 'hard',
    type: 'experience',
    question: 'What is the Repository pattern and how does it help with testability and persistence ignorance?',
    answer:
      'The Repository pattern encapsulates all data-access logic behind an interface. The domain layer depends only on the interface — not on Prisma, TypeORM, or any specific driver.\n\n**Benefits**:\n- **Persistence ignorance** — swap PostgreSQL for MongoDB by replacing one implementation\n- **Testability** — unit tests use an in-memory repository; no real DB needed\n- **Boundary enforcement** — keeps raw SQL / ORM queries out of services\n- **Centralised query logic** — complex queries live in one place\n\n**Pitfall**: don\'t leak ORM entities through the interface — return domain models, not Prisma types. Otherwise you re-couple the layer you meant to decouple.',
    code: {
      language: 'typescript',
      snippet: `// Domain model (no ORM decorators)
interface User { id: string; email: string; createdAt: Date; }

// Repository interface (domain layer)
interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(id: string): Promise<void>;
}

// Production implementation
class PrismaUserRepository implements IUserRepository {
  constructor(private db: PrismaClient) {}
  async findById(id: string) {
    return this.db.user.findUnique({ where: { id } });
  }
  // ...
}

// In-memory implementation for unit tests
class InMemoryUserRepository implements IUserRepository {
  private store = new Map<string, User>();
  async findById(id: string) { return this.store.get(id) ?? null; }
  async save(user: User) { this.store.set(user.id, user); }
  // ...
}

// Service depends on the interface only
class UserService {
  constructor(private users: IUserRepository) {}
}`,
    },
  },

  {
    id: 'oop-4',
    category: 'OOP',
    difficulty: 'hard',
    type: 'experience',
    question: 'What is Dependency Injection (DI) and how does it differ from the Service Locator pattern? What problem does each solve and what trade-off does each introduce?',
    answer:
      '**Dependency Injection**: dependencies are provided to a class from outside — usually via constructor injection. The class declares what it needs; the caller or a DI container creates and wires them.\n\n**Service Locator**: the class calls a central registry to fetch its own dependencies (`container.get(IUserRepo)`).\n\n**DI advantages**: dependencies are explicit (visible in the constructor signature), easy to mock in tests, promotes interface segregation.\n\n**Service Locator disadvantages**: dependencies are hidden inside the class body; the class implicitly couples to the locator; harder to test because you must configure the container.\n\n**In Node.js / TypeScript**: NestJS uses decorator-based DI (`@Injectable`, `@Inject`). For simpler projects, manual constructor injection (Pure DI) is often cleaner than adding a heavy container.',
    code: {
      language: 'typescript',
      snippet: `// Service Locator – hidden dependency
class UserService {
  async getUser(id: string) {
    const repo = container.get<IUserRepository>('UserRepo'); // hidden!
    return repo.findById(id);
  }
}

// Constructor DI – explicit, testable
class UserService {
  constructor(
    private readonly users: IUserRepository,
    private readonly cache: ICacheService,
    private readonly logger: ILogger,
  ) {}

  async getUser(id: string) {
    const cached = await this.cache.get(id);
    if (cached) return cached;
    const user = await this.users.findById(id);
    this.logger.info('user fetched', { id });
    return user;
  }
}

// Unit test – no container, no real DB
const svc = new UserService(
  new InMemoryUserRepository(),
  new NoopCache(),
  new ConsoleLogger(),
);`,
    },
  },

  {
    id: 'oop-5',
    category: 'OOP',
    difficulty: 'hard',
    type: 'experience',
    question: 'Explain the Strategy and Decorator design patterns with a real backend example for each.',
    answer:
      '**Strategy** — defines a family of algorithms, encapsulates each one, and makes them interchangeable. The context delegates work to a strategy object set at runtime.\n\nBackend example: a payment processor that supports Stripe, PayPal, and crypto via swappable strategy objects.\n\n**Decorator** — wraps an object to add behaviour without subclassing. Decorators stack, each calling the inner object after adding its logic.\n\nBackend example: a logging decorator wraps any repository, adding before/after log lines without touching the real implementation. Middleware in Express is essentially a chain of decorators.',
    code: {
      language: 'typescript',
      snippet: `// ── Strategy ──────────────────────────────────────────
interface PaymentStrategy {
  charge(amount: number, metadata: PaymentMeta): Promise<Receipt>;
}
class StripeStrategy  implements PaymentStrategy { /* ... */ }
class PayPalStrategy  implements PaymentStrategy { /* ... */ }

class CheckoutService {
  constructor(private strategy: PaymentStrategy) {}
  async checkout(cart: Cart) {
    return this.strategy.charge(cart.total, { orderId: cart.id });
  }
}
// Swap at runtime based on user preference
const svc = new CheckoutService(user.preferredGateway === 'stripe'
  ? new StripeStrategy()
  : new PayPalStrategy());

// ── Decorator ─────────────────────────────────────────
class LoggingUserRepository implements IUserRepository {
  constructor(
    private inner: IUserRepository,
    private logger: ILogger,
  ) {}

  async findById(id: string) {
    this.logger.debug('findById', { id });
    const start = Date.now();
    const result = await this.inner.findById(id);
    this.logger.debug('findById done', { ms: Date.now() - start });
    return result;
  }
  // delegate remaining methods to this.inner
}

const repo = new LoggingUserRepository(
  new PrismaUserRepository(prisma),
  logger,
);`,
    },
  },

  {
    id: 'oop-6',
    category: 'OOP',
    difficulty: 'hard',
    type: 'experience',
    question: 'What is polymorphism, and how does the Open/Closed Principle rely on it to eliminate conditionals?',
    answer:
      'Polymorphism lets you call the same method on different types and get type-appropriate behaviour. At the call site you don\'t need to know the concrete type.\n\n**OCP + polymorphism** eliminate `if/switch` chains that must be extended whenever a new variant is added:\n- Every `if (type === \'X\')` block is an OCP violation waiting to happen\n- Replace with an interface: each variant implements it; the calling code is generic\n\nThis is the essence of the **Replace Conditional with Polymorphism** refactoring. Combined with a factory or DI container for construction, you can add new variants without touching existing code.',
    code: {
      language: 'typescript',
      snippet: `// ✗ OCP violation – must edit this every time a new report type is added
function generateReport(type: string, data: unknown) {
  if (type === 'pdf')   return generatePDF(data);
  if (type === 'csv')   return generateCSV(data);
  if (type === 'excel') return generateExcel(data);
  throw new Error('unknown type');
}

// ✓ OCP + polymorphism – extend by adding a class, zero edits to existing code
interface ReportGenerator {
  generate(data: unknown): Buffer;
  readonly mimeType: string;
}
class PdfGenerator   implements ReportGenerator { /* ... */ }
class CsvGenerator   implements ReportGenerator { /* ... */ }
class ExcelGenerator implements ReportGenerator { /* ... */ }

const generators = new Map<string, ReportGenerator>([
  ['pdf',   new PdfGenerator()],
  ['csv',   new CsvGenerator()],
  ['excel', new ExcelGenerator()],
]);

function generateReport(type: string, data: unknown): Buffer {
  const gen = generators.get(type);
  if (!gen) throw new Error(\`Unknown report type: \${type}\`);
  return gen.generate(data);
}`,
    },
  },

  // ─── OOP (Easy) ──────────────────────────────────────────────────────────────

  {
    id: 'oop-e1',
    category: 'OOP',
    difficulty: 'easy',
    type: 'basics',
    question: 'What are the four pillars of Object-Oriented Programming?',
    answer:
      "**1. Encapsulation**: bundling data (fields) and behaviour (methods) into a class, and hiding internal details behind an interface (`private`, `protected`). Prevents external code from depending on implementation details.\n\n**2. Abstraction**: exposing only what is necessary. Interfaces and abstract classes define *what* something does without specifying *how*. Consumers depend on the abstraction, not the implementation.\n\n**3. Inheritance**: a class (child) inherits properties and methods from another class (parent), enabling code reuse and an 'is-a' relationship.\n\n**4. Polymorphism**: the same interface can behave differently depending on the concrete type at runtime — achieved through method overriding.",
    code: {
      language: 'typescript',
      snippet: `abstract class Shape {              // Abstraction
  abstract area(): number;
  describe() { return \`Area: \${this.area()}\`; }
}

class Circle extends Shape {        // Inheritance
  constructor(private radius: number) { super(); } // Encapsulation
  area() { return Math.PI * this.radius ** 2; }     // Polymorphism
}

class Square extends Shape {
  constructor(private side: number) { super(); }
  area() { return this.side ** 2; }
}

const shapes: Shape[] = [new Circle(5), new Square(4)];
shapes.forEach(s => console.log(s.describe())); // polymorphic dispatch`,
    },
  },

  {
    id: 'oop-e2',
    category: 'OOP',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is the difference between a class and an object? What is instantiation?',
    answer:
      "A **class** is a **blueprint** — it defines the structure (properties) and behaviour (methods) that instances will have. It exists at the code level.\n\nAn **object** is an **instance** of a class — a concrete value in memory created from the blueprint. Many objects can share the same class.\n\n**Instantiation** is the act of creating an object from a class using the `new` keyword, which:\n1. Allocates memory on the heap\n2. Calls the `constructor` to initialise state\n3. Returns a reference to the new object\n\n**Analogy**: the class is the architectural drawing; the object is the built house. Many houses (objects) can be built from the same drawing (class).",
    code: {
      language: 'typescript',
      snippet: `class Car {
  speed: number = 0;
  constructor(public make: string) {}
  accelerate(amount: number) { this.speed += amount; }
}

// Two separate objects from the same class
const tesla   = new Car('Tesla');
const ferrari = new Car('Ferrari');

tesla.accelerate(100);
console.log(tesla.speed);   // 100
console.log(ferrari.speed); // 0 — independent state`,
    },
  },

  // ─── OOP (Medium) ────────────────────────────────────────────────────────────

  {
    id: 'oop-e3',
    category: 'OOP',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is an abstract class and how is it different from an interface?',
    answer:
      "**Abstract class**: a class that **cannot be instantiated directly** — it exists to be subclassed. It can contain:\n- Abstract methods (declared but not implemented — subclasses must implement them)\n- Concrete methods (fully implemented, inherited by subclasses)\n- Constructor logic\n- Instance fields\n\n**Interface**: a pure type contract — it only describes the shape (what methods/properties exist), with **no implementation at all**.\n\n| | Abstract Class | Interface |\n|---|---|---|\n| Can be instantiated | No | No |\n| Can have implementation | Yes | No (pre-TS 4.2) |\n| Fields with state | Yes | No |\n| Multiple inheritance | No (single extends) | Yes (multiple implements) |\n| Runtime presence | Yes (compiled to JS) | No (erased at compile time) |\n\n**Rule of thumb**: use an interface when you only need a type contract. Use an abstract class when you want to share implementation (default behaviour) across subclasses.",
    code: {
      language: 'typescript',
      snippet: `// Abstract class — shares implementation, enforces contract
abstract class HttpError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
  }

  abstract toJSON(): Record<string, unknown>; // subclass must implement
}

class NotFoundError extends HttpError {
  constructor(resource: string) {
    super(\`\${resource} not found\`, 404);
  }
  toJSON() { return { error: this.message, status: 404 }; }
}

// Interface — type contract only, no implementation
interface Serializable {
  toJSON(): Record<string, unknown>;
}

// A class can extend one abstract class but implement many interfaces
class MyError extends HttpError implements Serializable {
  toJSON() { return { message: this.message }; }
}`,
    },
  },

  {
    id: 'oop-e4',
    category: 'OOP',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is method overloading?',
    answer:
      "**Method overloading** lets you define multiple signatures for the same method name, allowing it to be called with different argument types or counts. The single implementation handles all variants.\n\n**In TypeScript**: you declare multiple overload signatures above the implementation. The implementation signature is not directly visible to callers — only the overload signatures are.\n\n**Why it matters**: overloading gives callers precise return types based on what they pass in, without creating multiple differently-named functions.\n\n**In JavaScript** (no compile-time types): overloading is simulated by checking `typeof arguments` or using optional parameters — there's no native support.",
    code: {
      language: 'typescript',
      snippet: `// TypeScript overloads — declare multiple signatures
function formatDate(date: Date): string;
function formatDate(timestamp: number): string;
function formatDate(dateOrTimestamp: Date | number): string {
  // single implementation handles both cases
  const d = typeof dateOrTimestamp === 'number'
    ? new Date(dateOrTimestamp)
    : dateOrTimestamp;
  return d.toISOString();
}

formatDate(new Date());       // string ✓
formatDate(Date.now());       // string ✓

// Class method overloads
class Logger {
  log(message: string): void;
  log(message: string, level: 'info' | 'warn' | 'error'): void;
  log(message: string, level = 'info') {
    console[level as 'log'](message);
  }
}`,
    },
  },

  {
    id: 'oop-e5',
    category: 'OOP',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is the `this` keyword in OOP?',
    answer:
      "**`this`** refers to the **current instance** of a class inside its methods. It lets methods access and modify the object's own properties.\n\n**In a class method**, `this` is the object the method was called on.\n\n**Common pitfall — losing `this`**: when you pass a method as a callback, `this` is no longer bound to the instance — it becomes `undefined` (in strict mode) or the global object.\n\n**Solutions**:\n- **Arrow function class fields** — arrow functions capture `this` lexically at definition time\n- **`.bind(this)`** — explicitly bind in the constructor\n- **Arrow function wrapper** — `() => this.method()` in the callback\n\nUnderstanding `this` is critical because Express route handlers, event listeners, and setTimeout callbacks all involve passing methods as callbacks.",
    code: {
      language: 'typescript',
      snippet: `class Counter {
  private count = 0;

  // Problem: 'this' lost when passed as callback
  increment() {
    this.count++;
  }

  // Fix 1: arrow function field — 'this' is always bound to the instance
  incrementArrow = () => {
    this.count++;
  };

  getCount() { return this.count; }
}

const counter = new Counter();
counter.increment();           // works: 'this' is counter
counter.incrementArrow();      // works: arrow function

// Problem scenario
const fn = counter.increment;  // detached from counter
// fn(); // ✗ 'this' is undefined in strict mode

// Fix 2: bind in constructor
class Counter2 {
  count = 0;
  constructor() {
    this.increment = this.increment.bind(this);
  }
  increment() { this.count++; }
}`,
    },
  },

  {
    id: 'oop-m3',
    category: 'OOP',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is the Factory design pattern?',
    answer:
      "The **Factory pattern** provides an interface for creating objects without specifying the exact class to instantiate. The decision of which class to create is delegated to the factory.\n\n**Why use it**:\n- Decouple creation logic from business logic — callers don't need to know which concrete class to use\n- Centralise complex creation (e.g., configuring dependencies, reading from config)\n- Swap implementations without changing calling code\n\n**Variants**:\n- **Simple Factory** — a function or static method that returns the right object\n- **Factory Method** — a base class defines the creation interface; subclasses override to return a specific type\n- **Abstract Factory** — creates families of related objects\n\n**Real-world example**: a payment processor factory that returns a Stripe, PayPal, or mock payment client based on configuration.",
    code: {
      language: 'typescript',
      snippet: `// Simple factory function
interface Logger {
  log(message: string): void;
}

class ConsoleLogger implements Logger {
  log(message: string) { console.log(message); }
}

class JsonLogger implements Logger {
  log(message: string) { console.log(JSON.stringify({ message, ts: Date.now() })); }
}

class NoopLogger implements Logger {
  log(_message: string) {} // silence in tests
}

// Factory — callers ask for a logger, don't know the concrete class
function createLogger(env: string): Logger {
  if (env === 'test')       return new NoopLogger();
  if (env === 'production') return new JsonLogger();
  return new ConsoleLogger();
}

const logger = createLogger(process.env.NODE_ENV ?? 'development');
logger.log('Server started'); // correct logger for the environment`,
    },
  },

  {
    id: 'oop-m4',
    category: 'OOP',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is the Observer design pattern?',
    answer:
      "The **Observer pattern** defines a **one-to-many relationship** between objects: when a subject (publisher) changes state, all registered observers (subscribers) are notified automatically.\n\n**Key participants**:\n- **Subject** — holds state; manages a list of observers; calls `notify()` on state change\n- **Observer** — interface with an `update()` method called by the subject\n\n**Why use it**:\n- Decouples the subject from its subscribers — the subject doesn't know what the observers do with the notification\n- Easy to add/remove observers at runtime\n- Core to event-driven architecture\n\n**In Node.js**: `EventEmitter` is a built-in implementation of the Observer pattern. Libraries like RxJS build on this idea with reactive streams.",
    code: {
      language: 'typescript',
      snippet: `interface Observer<T> {
  update(data: T): void;
}

class EventBus<T> {
  private observers: Observer<T>[] = [];

  subscribe(observer: Observer<T>) {
    this.observers.push(observer);
  }

  unsubscribe(observer: Observer<T>) {
    this.observers = this.observers.filter(o => o !== observer);
  }

  notify(data: T) {
    this.observers.forEach(o => o.update(data));
  }
}

// Usage
const orderBus = new EventBus<{ orderId: string; total: number }>();

// Multiple independent observers
orderBus.subscribe({ update: ({ orderId }) => emailService.send(orderId) });
orderBus.subscribe({ update: ({ orderId }) => analyticsService.track(orderId) });
orderBus.subscribe({ update: ({ total }) => revenueMetrics.record(total) });

// When an order is placed, all observers are notified
orderBus.notify({ orderId: 'ord-123', total: 99.99 });`,
    },
  },

  {
    id: 'oop-m1',
    category: 'OOP',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is inheritance in OOP? What is method overriding and when do you use super()?',
    answer:
      "Inheritance creates an **'is-a' relationship**: the child class acquires all non-private members of the parent and can extend or override them.\n\n**Method overriding**: a child redefines a method inherited from the parent. The overriding method must have a compatible signature (Liskov Substitution).\n\n**`super`**: refers to the parent class.\n- In the constructor: `super()` must be called before accessing `this`\n- In a method: `super.methodName()` invokes the parent's version\n\n**When to use inheritance**: genuine 'is-a' hierarchies (`Dog extends Animal`). Prefer **composition** for 'has-a' relationships — inheritance chains deeper than 2–3 levels become brittle.",
    code: {
      language: 'typescript',
      snippet: `class Animal {
  constructor(protected name: string) {}
  speak(): string { return \`\${this.name} makes a sound\`; }
}

class Dog extends Animal {
  constructor(name: string, private breed: string) {
    super(name); // must call super before using 'this'
  }

  speak(): string {                         // override
    return \`\${super.speak()} — Woof!\`;   // call parent version
  }

  info() { return \`\${this.name} (\${this.breed})\`; }
}

const dog = new Dog('Rex', 'Husky');
console.log(dog.speak()); // Rex makes a sound — Woof!`,
    },
  },

  {
    id: 'oop-m2',
    category: 'OOP',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is the difference between composition and inheritance? When should you prefer composition?',
    answer:
      "**Inheritance** ('is-a'): a class *extends* another, gaining all its behaviour. Tight coupling — changes to the parent ripple to all children.\n\n**Composition** ('has-a'): a class *holds a reference* to another object and delegates behaviour to it. Loose coupling — you can swap out the composed object without changing the container.\n\n**Favour composition when**:\n- The relationship is 'has-a' or 'can-do' (`UserService` *has* a `Logger`, not *is* a `Logger`)\n- You need to vary behaviour at runtime (Strategy pattern)\n- Multiple inheritance would be needed (TypeScript only allows single class inheritance)\n- The hierarchy would be deeper than 2 levels\n\n**Rule of thumb**: 'Prefer composition over inheritance' (GoF). Use inheritance only for genuine 'is-a' hierarchies.",
    code: {
      language: 'typescript',
      snippet: `// ✗ Inheritance — Logger is not a UserService
// class LoggingUserService extends UserService { ... }

// ✓ Composition — inject the collaborator
interface Logger { log(msg: string): void; }

class UserService {
  constructor(
    private db: { findUser(id: string): Promise<unknown> },
    private logger: Logger,
  ) {}

  async getUser(id: string) {
    this.logger.log(\`Fetching user \${id}\`);
    return this.db.findUser(id);
  }
}

// Swap logger at will (e.g. silent in tests)
new UserService(db, new ConsoleLogger());
new UserService(db, new NoOpLogger());`,
    },
  },
];
