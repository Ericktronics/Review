import type { Flashcard } from '../types';

export const testingCards: Flashcard[] = [

  // ─── Testing (Easy) ──────────────────────────────────────────────────────────

  {
    id: 'test-e1',
    category: 'Testing',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is unit testing and why does it matter?',
    answer:
      "**A unit test verifies that a single, isolated piece of code does what it's supposed to do.** A \"unit\" is typically a function, a method, or a class — tested without its real dependencies (database, network, file system).\n\n**Why it matters**:\n- **Fast feedback** — a unit test suite runs in seconds. You know immediately if you broke something.\n- **Safe refactoring** — change the internals of a function freely; the tests tell you if the behavior changed\n- **Documents intent** — a test named `should return null when user is not found` explains the contract better than a comment\n- **Forces good design** — if a function is hard to test, it's usually doing too many things (tight coupling, side effects)\n\n**What to test**: the *behavior* (what the code does from the outside), not the *implementation* (how it does it internally). If you rename a variable inside a function and the test breaks, the test is testing the wrong thing.\n\n**What NOT to test in a unit test**: third-party libraries (assume they work), framework internals, private helper methods (test the public entry point instead).",
    code: {
      language: 'typescript',
      snippet: `// The function we're testing
export function calculateDiscount(price: number, userType: 'regular' | 'premium'): number {
  if (price <= 0) throw new Error('Price must be positive');
  return userType === 'premium' ? price * 0.8 : price;
}

// Unit tests — pure, fast, no external dependencies
import { calculateDiscount } from './pricing';

describe('calculateDiscount', () => {
  it('returns full price for regular users', () => {
    expect(calculateDiscount(100, 'regular')).toBe(100);
  });

  it('applies 20% discount for premium users', () => {
    expect(calculateDiscount(100, 'premium')).toBe(80);
  });

  it('throws when price is zero or negative', () => {
    expect(() => calculateDiscount(0, 'regular')).toThrow('Price must be positive');
    expect(() => calculateDiscount(-50, 'premium')).toThrow('Price must be positive');
  });
});`,
    },
  },

  {
    id: 'test-e2',
    category: 'Testing',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is the testing pyramid? How do unit, integration, and E2E tests differ?',
    answer:
      "The **testing pyramid** is a model for how many tests of each type to write. The wide base = many fast tests; the narrow top = fewer slow tests.\n\n```\n        /  E2E  \\      ← few, slow, expensive, high confidence\n       /─────────\\\n      / Integration\\   ← some, moderate speed\n     /─────────────\\\n    /     Unit      \\  ← many, fast, cheap, isolated\n```\n\n**Unit tests** — test one function/component in complete isolation. Mock all dependencies. Run in milliseconds. Write the most of these.\n\n**Integration tests** — test how multiple units work together. May hit a real database (test DB, not prod), a real file system. Slower but confirm that the pieces assemble correctly. Example: test that a service + repository + database round-trip works.\n\n**E2E (End-to-End) tests** — launch the full application in a real browser and simulate user actions. Slowest, most brittle, highest confidence. Example: Playwright clicks through signup → login → checkout. Write the fewest of these, only for critical paths.\n\n**The inverted pyramid problem**: too many slow E2E tests and not enough unit tests → the suite takes 20 minutes, developers stop running it, bugs slip through.\n\n**Rule of thumb for most apps**: 70% unit, 20% integration, 10% E2E.",
    code: {
      language: 'typescript',
      snippet: `// Unit test — isolated, mocked dependencies, milliseconds
it('should hash the password', async () => {
  const hash = await hashPassword('secret');
  expect(hash).not.toBe('secret');           // not plain text
  expect(await bcrypt.compare('secret', hash)).toBe(true);
});

// Integration test — real DB, tests the full repository layer
it('should persist and retrieve a user from the database', async () => {
  const created = await userRepo.create({ email: 'a@b.com', name: 'Alice' });
  const found   = await userRepo.findById(created.id);
  expect(found?.email).toBe('a@b.com');
});

// E2E test (Playwright) — real browser, real server, full flow
test('user can log in and see their dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name=email]', 'alice@example.com');
  await page.fill('[name=password]', 'password123');
  await page.click('button[type=submit]');
  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByText('Welcome, Alice')).toBeVisible();
});`,
    },
  },

  {
    id: 'test-e3',
    category: 'Testing',
    difficulty: 'easy',
    type: 'basics',
    question: 'What are Jest\'s core building blocks? Explain describe, it/test, expect, and setup/teardown hooks.',
    answer:
      "**Jest** is the de facto testing framework for JavaScript/TypeScript. It ships with a test runner, assertion library, and mocking tools in one package.\n\n**`describe(name, fn)`** — groups related tests into a suite. Can be nested. Use to organize tests around a class, function, or behavior scenario.\n\n**`it(name, fn)` / `test(name, fn)`** — defines a single test case. `it` and `test` are identical. Convention: `it('should ...')` or `test('returns ...')`.\n\n**`expect(value)`** — the assertion. Chains with matchers: `.toBe()`, `.toEqual()`, `.toThrow()`, `.toHaveBeenCalledWith()`, `.resolves`, `.rejects`.\n\n**Setup/Teardown hooks**:\n- `beforeEach(fn)` — runs before every `it` in the describe block. Use for: creating fresh mocks, seeding test data.\n- `afterEach(fn)` — runs after every `it`. Use for: cleanup, resetting mocks (`jest.clearAllMocks()`).\n- `beforeAll(fn)` — runs once before all tests in the block. Use for: expensive setup like DB connection.\n- `afterAll(fn)` — runs once after all tests. Use for: closing connections, dropping test data.\n\n**Key distinction**: `toBe` uses `===` (reference equality for objects). `toEqual` does a deep equality check — use it for objects and arrays.",
    code: {
      language: 'typescript',
      snippet: `import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    // Fresh instance before every test — no shared state between tests
    service = new UserService();
    jest.clearAllMocks(); // reset all mock call counts
  });

  describe('findById', () => {
    it('returns a user when found', async () => {
      const user = await service.findById('123');
      expect(user).toEqual({ id: '123', name: 'Alice' }); // deep equality
    });

    it('returns null when user does not exist', async () => {
      const user = await service.findById('nonexistent');
      expect(user).toBeNull();
    });

    it('throws when id is empty', async () => {
      await expect(service.findById('')).rejects.toThrow('ID is required');
    });
  });

  describe('createUser', () => {
    it('returns the created user with an id assigned', async () => {
      const result = await service.createUser({ name: 'Bob', email: 'b@b.com' });
      expect(result.id).toBeDefined();
      expect(result.name).toBe('Bob');
    });
  });
});`,
    },
  },

  {
    id: 'test-e4',
    category: 'Testing',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is mocking in tests and why do you do it?',
    answer:
      "**Mocking replaces a real dependency with a controlled fake** that you can configure to return specific values or verify how it was called.\n\n**Why you mock**:\n- **Speed** — a real database query takes 50ms; a mock returns instantly\n- **Reliability** — tests shouldn't fail because a third-party API is down\n- **Isolation** — test only your code's logic, not the dependency's behavior\n- **Control** — simulate edge cases that are hard to reproduce with real data (DB throwing an error, network timeout, rate limit hit)\n\n**Three types of test doubles** (all called 'mocks' loosely):\n- **Stub** — returns a predetermined value. `jest.fn().mockResolvedValue({ id: '1' })`\n- **Spy** — wraps a real function and tracks how it was called. `jest.spyOn(service, 'sendEmail')`\n- **Mock** — full replacement of a module. `jest.mock('./email-service')`\n\n**What NOT to mock**: don't mock what you're testing. Don't mock so much that the test no longer proves anything. A rule: mock at the boundary of your system (external HTTP calls, DB, message queues).",
    code: {
      language: 'typescript',
      snippet: `import { sendWelcomeEmail } from './email-service';
import { createUser } from './user-service';

// Auto-mock the entire module — every exported function becomes a jest.fn()
jest.mock('./email-service');

const mockedSendEmail = sendWelcomeEmail as jest.MockedFunction<typeof sendWelcomeEmail>;

describe('createUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends a welcome email after creating the user', async () => {
    mockedSendEmail.mockResolvedValue(undefined); // stub: pretend it succeeded

    await createUser({ email: 'alice@example.com', name: 'Alice' });

    // Spy: verify it was called with the right argument
    expect(mockedSendEmail).toHaveBeenCalledTimes(1);
    expect(mockedSendEmail).toHaveBeenCalledWith('alice@example.com', 'Alice');
  });

  it('still creates the user even if the email fails', async () => {
    mockedSendEmail.mockRejectedValue(new Error('SMTP timeout')); // simulate failure

    const user = await createUser({ email: 'bob@example.com', name: 'Bob' });
    expect(user.id).toBeDefined(); // user was still created
  });
});`,
    },
  },

  {
    id: 'test-e5',
    category: 'Testing',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is test coverage? What does 80% coverage actually mean?',
    answer:
      "**Test coverage** measures what percentage of your source code is executed when your test suite runs. Jest reports it after `jest --coverage`.\n\n**Types of coverage**:\n- **Line coverage** — what % of lines were executed\n- **Branch coverage** — what % of conditional branches (if/else, ternary, switch) were exercised. Most important: an `if/else` has two branches; 100% line coverage might only test the `if` path.\n- **Function coverage** — what % of functions were called\n- **Statement coverage** — similar to line but counts individual statements\n\n**What 80% coverage means (and doesn't mean)**:\n- It means 80% of lines ran during tests\n- It does NOT mean those tests assert anything meaningful\n- A test that calls a function but checks nothing still counts as coverage\n- 80% carefully-targeted coverage > 95% coverage with assertion-free tests\n\n**Where to focus**: cover the branches that matter — error paths, edge cases, authentication logic, payment flows. Uncovered code paths are where bugs hide.\n\n**Coverage thresholds**: set a minimum in `jest.config.ts` to fail the build if coverage drops below your baseline. Don't chase 100% — test generated code, getters/setters, and trivial code add noise.",
    code: {
      language: 'typescript',
      snippet: `// jest.config.ts — enforce minimum coverage
export default {
  coverageThreshold: {
    global: {
      lines:     80,
      branches:  75,
      functions: 80,
    },
    // Stricter thresholds for critical files
    './src/auth/': {
      lines: 95,
      branches: 90,
    },
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',          // exclude type declarations
    '!src/**/index.ts',        // exclude barrel files
    '!src/migrations/**',      // exclude DB migrations
  ],
};

// Run: npx jest --coverage
// Output shows uncovered lines — focus on branches (the B column)`,
    },
  },

  // ─── Testing (Medium) ────────────────────────────────────────────────────────

  {
    id: 'test-m1',
    category: 'Testing',
    difficulty: 'medium',
    type: 'basics',
    question: 'How do you test async code in Jest? What are the common pitfalls?',
    answer:
      "Jest supports async tests natively. The test runner waits for the returned Promise to resolve or reject before declaring the test passed or failed.\n\n**Three patterns** (use async/await — it's the clearest):\n1. **`async/await`** — return a Promise from the test; Jest awaits it\n2. **`done` callback** — old pattern, error-prone. Avoid in new code.\n3. **`.resolves` / `.rejects` matchers** — chain directly on expect\n\n**Critical pitfall — forgotten `await`**: if you forget `await` on an assertion, the test passes vacuously because the assertion Promise was never awaited and any error is swallowed. Always `await` async assertions.\n\n**Testing rejected Promises**: wrap in `expect(...).rejects.toThrow()` — don't use try/catch in tests, it's verbose and can mask errors.\n\n**Timer mocking**: for code that uses `setTimeout`/`setInterval`, use `jest.useFakeTimers()` + `jest.runAllTimers()` to advance time without waiting.",
    code: {
      language: 'typescript',
      snippet: `// ── Pattern 1: async/await (preferred) ──────────────────────
it('fetches a user by id', async () => {
  const user = await userService.findById('123');
  expect(user?.name).toBe('Alice');
});

// ── Pattern 2: .resolves / .rejects matchers ──────────────────
it('resolves with the user', async () => {
  await expect(userService.findById('123')).resolves.toMatchObject({ name: 'Alice' });
});

it('rejects with "not found" when id is missing', async () => {
  await expect(userService.findById('ghost')).rejects.toThrow('User not found');
});

// ── Pitfall: forgotten await — test passes but asserts nothing ──
it('THIS TEST IS WRONG — no await', () => {
  // ✗ Test passes even if the promise rejects!
  expect(userService.findById('ghost')).rejects.toThrow('User not found');
});

// ── Timer mocking ─────────────────────────────────────────────
it('calls the callback after 1 second', () => {
  jest.useFakeTimers();
  const callback = jest.fn();

  delayedCall(callback, 1000);
  expect(callback).not.toHaveBeenCalled(); // not yet

  jest.runAllTimers(); // advance all timers instantly
  expect(callback).toHaveBeenCalledTimes(1);

  jest.useRealTimers(); // restore
});`,
    },
  },

  {
    id: 'test-m2',
    category: 'Testing',
    difficulty: 'medium',
    type: 'basics',
    question: 'How do you test React components with React Testing Library? What is its core philosophy?',
    answer:
      "**React Testing Library (RTL)** encourages testing components the same way a user interacts with them — through the visible DOM, not through React internals.\n\n**Core philosophy**: *\"The more your tests resemble the way your software is used, the more confidence they can give you.\"* — Kent C. Dodds\n\nThis means:\n- Query by what the user *sees or interacts with* (role, label, text), not by implementation details (class names, component state, internal function calls)\n- A refactor that doesn't break the UI should never break your tests\n\n**Query priority** (highest → lowest confidence):\n1. `getByRole` — finds by ARIA role + accessible name (buttons, inputs, headings). Most accessible and most semantic.\n2. `getByLabelText` — form fields by their label\n3. `getByPlaceholderText` — input placeholder\n4. `getByText` — visible text content\n5. `getByTestId` — last resort only, not visible to users\n\n**Query variants**:\n- `getBy*` — throws if not found (use in assertions)\n- `queryBy*` — returns null if not found (use when asserting absence)\n- `findBy*` — async, awaits the element to appear (use after async events)\n\n**`userEvent`** (from `@testing-library/user-event`) simulates real browser events — typing, clicking, tabbing. Prefer it over `fireEvent` which dispatches synthetic events directly.",
    code: {
      language: 'tsx',
      snippet: `import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('submits credentials when the form is filled and submitted', async () => {
    const user = userEvent.setup(); // v14+ — call setup() first
    const onLogin = jest.fn().mockResolvedValue({ token: 'abc' });
    render(<LoginForm onLogin={onLogin} />);

    // Query by label — semantic, accessible
    await user.type(screen.getByLabelText(/email/i), 'alice@example.com');
    await user.type(screen.getByLabelText(/password/i), 'secret123');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(onLogin).toHaveBeenCalledWith('alice@example.com', 'secret123');
  });

  it('shows an error message when login fails', async () => {
    const user = userEvent.setup();
    const onLogin = jest.fn().mockRejectedValue(new Error('Invalid credentials'));
    render(<LoginForm onLogin={onLogin} />);

    await user.type(screen.getByLabelText(/email/i), 'wrong@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpass');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    // findBy* waits for the DOM update after the async rejection
    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });

  it('disables the submit button while the request is in-flight', async () => {
    const user = userEvent.setup();
    const onLogin = jest.fn(() => new Promise(() => {})); // never resolves
    render(<LoginForm onLogin={onLogin} />);

    await user.click(screen.getByRole('button', { name: /log in/i }));
    expect(screen.getByRole('button', { name: /log in/i })).toBeDisabled();
  });
});`,
    },
  },

  {
    id: 'test-m3',
    category: 'Testing',
    difficulty: 'medium',
    type: 'basics',
    question: 'How does Jest mocking work? Compare jest.fn(), jest.mock(), and jest.spyOn().',
    answer:
      "**`jest.fn()`** — creates a standalone mock function from scratch. Has no real implementation. Use it when you need to pass a callback or stub a dependency manually.\n\n**`jest.mock('modulePath')`** — replaces an entire imported module with auto-mocked versions of its exports. Call at the top of the file (Jest hoists it before imports). Every exported function becomes a `jest.fn()`. Good for: mocking a service, an HTTP client, a DB layer.\n\n**`jest.spyOn(object, 'method')`** — wraps an existing method, making it trackable without replacing it. You can still call the real implementation (`jest.spyOn(...).mockImplementation(...)` to replace). Good for: verifying a method was called, temporarily overriding behavior.\n\n**Configuring return values**:\n- `.mockReturnValue(value)` — always returns this value\n- `.mockResolvedValue(value)` — returns `Promise.resolve(value)`\n- `.mockRejectedValue(error)` — returns `Promise.reject(error)`\n- `.mockImplementation(fn)` — custom implementation\n- `.mockImplementationOnce(fn)` — only for the next call\n\n**Always reset in `beforeEach`**: use `jest.clearAllMocks()` to reset call counts between tests, or `jest.resetAllMocks()` to also clear implementations.",
    code: {
      language: 'typescript',
      snippet: `// ── jest.fn() — standalone mock ──────────────────────────────
const mockFn = jest.fn();
mockFn.mockReturnValue(42);
expect(mockFn()).toBe(42);
expect(mockFn).toHaveBeenCalledTimes(1);

// ── jest.mock() — module replacement ──────────────────────────
jest.mock('./db'); // auto-mocks the entire ./db module

import { db } from './db'; // this is now a mock
const mockedDb = db as jest.Mocked<typeof db>;

beforeEach(() => {
  mockedDb.user.findUnique.mockResolvedValue({ id: '1', name: 'Alice' });
});

it('returns user from db', async () => {
  const user = await userService.findById('1');
  expect(user.name).toBe('Alice');
  expect(mockedDb.user.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
});

// ── jest.spyOn() — spy on real implementation ─────────────────
import * as emailModule from './email';

it('sends a confirmation email', async () => {
  const spy = jest.spyOn(emailModule, 'sendEmail').mockResolvedValue(undefined);

  await orderService.placeOrder({ userId: '1', items: ['A'] });

  expect(spy).toHaveBeenCalledWith(expect.objectContaining({
    to: 'alice@example.com',
    subject: expect.stringContaining('Order Confirmation'),
  }));

  spy.mockRestore(); // restore the original after the test
});`,
    },
  },

  {
    id: 'test-m4',
    category: 'Testing',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is Test-Driven Development (TDD)? What is the red-green-refactor cycle?',
    answer:
      "**TDD is a development practice where you write the test before you write the code** that makes it pass.\n\n**Red-Green-Refactor cycle**:\n1. **Red** — write a failing test for the behavior you're about to implement. Run it; confirm it fails (red). This proves the test actually tests something.\n2. **Green** — write the minimum code necessary to make the test pass. Don't over-engineer. It's okay if the code is ugly.\n3. **Refactor** — clean up the code while keeping all tests green. Extract functions, rename variables, remove duplication. The tests are your safety net.\n\n**Benefits**:\n- Forces you to design the API/interface before implementation\n- Every behavior has a corresponding test — you can't forget to test something you've already written the test for\n- Keeps code minimal — you only write what the tests demand\n- Gives confidence for refactoring\n\n**When TDD works best**: new features with clear acceptance criteria, bug fixes (write a test that reproduces the bug first, then fix it).\n\n**When TDD is harder**: exploratory coding where you don't yet know the shape of the solution, UI-heavy work, integration with poorly-documented external APIs.",
    code: {
      language: 'typescript',
      snippet: `// ── Step 1: RED — write the failing test first ───────────────
// The function 'slugify' doesn't exist yet. The test defines its contract.

describe('slugify', () => {
  it('converts a title to a lowercase, hyphenated slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });
  it('removes special characters', () => {
    expect(slugify('Node.js & TypeScript!')).toBe('nodejs-typescript');
  });
  it('collapses multiple spaces into one hyphen', () => {
    expect(slugify('  too   many   spaces  ')).toBe('too-many-spaces');
  });
});

// Run → ✗ ReferenceError: slugify is not defined  (RED)

// ── Step 2: GREEN — minimum code to pass ─────────────────────
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')   // remove non-alphanumeric
    .trim()
    .replace(/\s+/g, '-');          // spaces → hyphens
}

// Run → ✓ all tests pass  (GREEN)

// ── Step 3: REFACTOR — clean up (tests stay green) ────────────
// Could extract regex constants, add TypeScript overloads, etc.
// Tests guard you — refactor freely.`,
    },
  },

  {
    id: 'test-m5',
    category: 'Testing',
    difficulty: 'medium',
    type: 'basics',
    question: 'How do you test a Node.js/Express API route? What is supertest and how do you use it?',
    answer:
      "**`supertest`** lets you make HTTP requests directly to your Express `app` object without starting a real server on a port. It returns a Promise you can `await` and assert on.\n\n**Setup**: export your `app` without calling `.listen()` — the server binding happens separately. Supertest handles the lifecycle.\n\n**What to test in route tests**:\n- HTTP status code (200, 201, 400, 401, 404, 500)\n- Response body shape and values\n- Response headers (Content-Type, Location, etc.)\n- That the correct service method was called (via mocks)\n- Error responses return a consistent error format\n\n**What to mock**: the service layer. Route tests should test HTTP concerns (serialization, status codes, validation) — not business logic. Business logic goes in the service layer and has its own unit tests.\n\n**Authentication in tests**: inject a pre-signed test token or mock the auth middleware for tests that don't specifically test auth.",
    code: {
      language: 'typescript',
      snippet: `import request from 'supertest';
import { app } from '../app'; // export app without .listen()
import { userService } from '../services/user.service';

jest.mock('../services/user.service');
const mockedService = userService as jest.Mocked<typeof userService>;

describe('GET /api/users/:id', () => {
  it('returns 200 and the user when found', async () => {
    mockedService.findById.mockResolvedValue({ id: '1', name: 'Alice', email: 'a@b.com' });

    const res = await request(app)
      .get('/api/users/1')
      .set('Authorization', 'Bearer test-token'); // inject auth header

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: '1', name: 'Alice', email: 'a@b.com' });
  });

  it('returns 404 when user is not found', async () => {
    mockedService.findById.mockResolvedValue(null);

    const res = await request(app).get('/api/users/ghost');
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ error: expect.any(String) });
  });
});

describe('POST /api/users', () => {
  it('returns 201 and the created user', async () => {
    const input = { name: 'Bob', email: 'bob@example.com' };
    mockedService.create.mockResolvedValue({ id: '2', ...input });

    const res = await request(app).post('/api/users').send(input);

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(mockedService.create).toHaveBeenCalledWith(input);
  });

  it('returns 400 when email is missing', async () => {
    const res = await request(app).post('/api/users').send({ name: 'Bob' });
    expect(res.status).toBe(400);
  });
});`,
    },
  },

  {
    id: 'test-m6',
    category: 'Testing',
    difficulty: 'medium',
    type: 'basics',
    question: 'What are snapshot tests in Jest? When should you use them and when should you avoid them?',
    answer:
      "**Snapshot testing** serializes a value (component output, object, JSON) to a text file on the first run. On subsequent runs, Jest compares the current output to the saved snapshot and fails if they differ.\n\n**How it works**:\n1. First run: `expect(component).toMatchSnapshot()` → saves a `.snap` file\n2. Future runs: compares current output to saved snapshot\n3. Intentional changes: run `jest --updateSnapshot` to update the saved file\n\n**When snapshots are useful**:\n- Serialized data structures that are stable and deliberately designed (config shapes, API response schemas)\n- Catching accidental regressions in components with complex output\n\n**When to avoid snapshots** (the common pitfall):\n- Large component snapshots that include dozens of HTML elements — any styling change triggers a snapshot diff, developers just run `--updateSnapshot` without reading it, defeating the purpose\n- Frequently changing UI — constant update noise\n- When a specific assertion is clearer: `expect(heading.textContent).toBe('Welcome')` is better than a whole-component snapshot\n\n**Preferred alternative**: assert on specific, semantically meaningful values. Use `toMatchObject` for partial matching instead of full serialization.",
    code: {
      language: 'tsx',
      snippet: `// ✗ Avoid — too broad, any DOM change breaks this, easy to ignore
it('renders the user card', () => {
  const { container } = render(<UserCard user={mockUser} />);
  expect(container).toMatchSnapshot(); // 200 lines of HTML in the .snap file
});

// ✓ Better — assert what matters semantically
it('displays the user name and email', () => {
  render(<UserCard user={mockUser} />);
  expect(screen.getByRole('heading')).toHaveTextContent(mockUser.name);
  expect(screen.getByText(mockUser.email)).toBeInTheDocument();
});

// ✓ Snapshot is fine for stable, small data structures
it('formats the API response correctly', () => {
  const result = formatUserResponse(rawUser);
  expect(result).toMatchSnapshot();
  // Or even better — be explicit:
  expect(result).toEqual({
    id: rawUser.id,
    name: rawUser.name,
    createdAt: expect.any(String),
  });
});

// toMatchInlineSnapshot — snapshot stored in the test file, easier to review
it('formats an error response', () => {
  expect(formatError(new Error('Not found'))).toMatchInlineSnapshot(\`
    {
      "error": "Not found",
      "status": 404,
    }
  \`);
});`,
    },
  },

  // ─── Testing (Hard) ──────────────────────────────────────────────────────────

  {
    id: 'test-1',
    category: 'Testing',
    difficulty: 'hard',
    type: 'experience',
    question: 'How do you design a testing strategy for a production Node.js + React application? Walk through your approach.',
    answer:
      "A good testing strategy is about **confidence per unit of time**, not coverage metrics. The goal: catch the most bugs with the fastest possible feedback loop.\n\n**Layer 1 — Unit tests (fast, many)**\n- Service methods, utility functions, reducers, custom hooks\n- Mock: repositories, HTTP clients, external APIs\n- Speed target: entire suite under 10 seconds\n- Coverage target: high on business logic (90%+), lower on boilerplate\n\n**Layer 2 — Integration tests (moderate, some)**\n- API endpoints (supertest) + real test DB (Postgres in Docker)\n- React component trees that fetch data (MSW to intercept HTTP)\n- Tests the full vertical slice: route → service → DB → response\n- Speed target: 30–60 seconds per CI run\n- Catch: SQL bugs, ORM mapping issues, serialization errors unit tests miss\n\n**Layer 3 — E2E tests (slow, few)**\n- Playwright for critical user journeys: signup, login, core feature flows\n- Run against a staging environment or a locally-spun full stack\n- 5–15 test cases covering the paths your business cannot afford to break\n- Speed target: under 5 minutes\n\n**Supporting practices**:\n- **MSW (Mock Service Worker)** — intercept real fetch calls in React tests and component stories without mocking modules\n- **Test DB**: separate Postgres instance with migrations applied at test startup; truncate tables between tests with `beforeEach`\n- **CI strategy**: unit + integration on every PR (must pass to merge), E2E on merge to main\n- **Flaky test policy**: any test that fails intermittently is quarantined immediately — one flaky test erodes team trust in the whole suite",
    code: {
      language: 'typescript',
      snippet: `// Example: integration test with a real test database
// jest.config.ts — use a separate test DB
process.env.DATABASE_URL = 'postgresql://localhost:5432/myapp_test';

// global test setup: run migrations once before all tests
// jest.setup.ts
import { db } from './src/db';
import { runMigrations } from './src/db/migrations';

beforeAll(async () => {
  await runMigrations();
});

afterAll(async () => {
  await db.$disconnect();
});

// Individual test file: clean up between tests
beforeEach(async () => {
  // truncate in dependency order (child tables first)
  await db.$executeRawUnsafe('TRUNCATE TABLE orders, users RESTART IDENTITY CASCADE');
});

// ── MSW for React integration tests ──────────────────────────
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer(
  http.get('/api/users/:id', ({ params }) => {
    return HttpResponse.json({ id: params.id, name: 'Alice' });
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it('displays user name from API', async () => {
  render(<UserProfile userId="1" />);
  expect(await screen.findByText('Alice')).toBeInTheDocument();
});`,
    },
  },

  {
    id: 'test-2',
    category: 'Testing',
    difficulty: 'hard',
    type: 'experience',
    question: 'How do you test a NestJS service with properly mocked dependencies?',
    answer:
      "NestJS provides `Test.createTestingModule()` to bootstrap a lightweight DI container with mocked providers — no HTTP server, no database, just the service under test.\n\n**The pattern**:\n1. Create a testing module with the real service but replace its dependencies with mocks\n2. Get the service from the module via `module.get(ServiceClass)`\n3. Get the mock via `module.get(TokenOrClass)` and configure it per test\n\n**What to mock**: repositories, external HTTP clients, event publishers, email services — anything with I/O. What NOT to mock: the service under test itself, pure utility functions it calls internally.\n\n**Common mistake**: mocking too deeply. If your service calls `UserRepository.findById` and `OrderRepository.create`, mock both — but your test should assert on the *outcome* the service returns, not on every internal call.\n\n**Prisma/TypeORM**: use `jest-mock-extended` to create fully-typed mocks of Prisma Client or TypeORM repository objects.",
    code: {
      language: 'typescript',
      snippet: `import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderService } from './order.service';
import { Order } from './order.entity';
import { UserService } from '../user/user.service';

describe('OrderService', () => {
  let service: OrderService;
  let orderRepo: jest.Mocked<Repository<Order>>;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        // Replace real TypeORM repository with a mock
        {
          provide: getRepositoryToken(Order),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
        // Replace UserService with a mock
        {
          provide: UserService,
          useValue: {
            findById: jest.fn(),
            deductCredits: jest.fn(),
          },
        },
      ],
    }).compile();

    service    = module.get(OrderService);
    orderRepo  = module.get(getRepositoryToken(Order));
    userService = module.get(UserService);
  });

  describe('placeOrder', () => {
    it('creates an order and deducts user credits', async () => {
      userService.findById.mockResolvedValue({ id: '1', credits: 100, name: 'Alice' });
      orderRepo.save.mockResolvedValue({ id: 'ord-1', userId: '1', total: 50 } as Order);

      const result = await service.placeOrder({ userId: '1', total: 50 });

      expect(result.id).toBe('ord-1');
      expect(userService.deductCredits).toHaveBeenCalledWith('1', 50);
    });

    it('throws when user has insufficient credits', async () => {
      userService.findById.mockResolvedValue({ id: '1', credits: 10, name: 'Alice' });

      await expect(service.placeOrder({ userId: '1', total: 50 }))
        .rejects.toThrow('Insufficient credits');

      expect(orderRepo.save).not.toHaveBeenCalled();
    });
  });
});`,
    },
  },

  {
    id: 'test-3',
    category: 'Testing',
    difficulty: 'hard',
    type: 'experience',
    question: 'What makes tests brittle? How do you write tests that survive refactors?',
    answer:
      "**Brittle tests** break when you refactor code without changing any *observable behavior*. They make refactoring painful and slow, so developers stop refactoring — leading to accumulating technical debt.\n\n**Common causes of brittle tests**:\n\n**1. Testing implementation details**\nVerifying internal state, private method calls, or specific variable names. When the implementation changes (even correctly), the test breaks.\n\n**2. Over-specifying mock interactions**\nChecking that a mock was called with the *exact* arguments in the *exact* order, when only the end result matters. A refactor that passes data differently breaks the test even if the outcome is correct.\n\n**3. Tight coupling to DOM structure (in React tests)**\n`querySelector('.user-card__title')` breaks if you rename a CSS class. `getByRole('heading', { name: /alice/i })` survives any structural refactor.\n\n**4. Shared mutable state between tests**\nTests that depend on execution order or shared globals. Use `beforeEach` to reset state.\n\n**5. Time-dependent tests**\n`new Date()` in assertions. Freeze or mock time.\n\n**How to write resilient tests**:\n- **Test the contract (observable output), not the implementation**\n- **Assert on what the user sees or what the caller receives**, not on internal steps\n- **Use partial matching** (`toMatchObject`) instead of full equality when only some fields matter\n- **Verify behavior via side effects** (what got saved to DB, what was emitted) not via call inspection",
    code: {
      language: 'typescript',
      snippet: `// ✗ BRITTLE — breaks if you rename the internal method or change call order
it('processes a payment', async () => {
  await paymentService.charge({ amount: 100, userId: '1' });

  expect(stripeClient.createCharge).toHaveBeenCalledWith({
    amount: 100,
    currency: 'usd',
    customer: 'cus_123',
    metadata: { userId: '1', timestamp: expect.any(Number) },
  });
  expect(db.payment.create).toHaveBeenCalledTimes(1);
  expect(notifier.send).toHaveBeenCalledWith('1', 'payment_success');
});

// ✓ RESILIENT — tests observable outcomes, not implementation steps
it('charges the user and records the payment', async () => {
  const result = await paymentService.charge({ amount: 100, userId: '1' });

  // Assert on the returned value
  expect(result).toMatchObject({ status: 'succeeded', amount: 100 });

  // Assert on the DB side effect (the durable outcome)
  const saved = await db.payment.findFirst({ where: { userId: '1' } });
  expect(saved?.amount).toBe(100);
  expect(saved?.status).toBe('succeeded');
});

// ✓ React: test visible behavior, not DOM structure
// ✗ Brittle:
expect(container.querySelector('.payment-status-badge--success')).toBeTruthy();

// ✓ Resilient:
expect(screen.getByRole('status')).toHaveTextContent(/payment successful/i);`,
    },
  },

  {
    id: 'test-4',
    category: 'Testing',
    difficulty: 'hard',
    type: 'experience',
    question: 'How do you write E2E tests with Playwright? What should you test in E2E vs lower layers?',
    answer:
      "**Playwright** launches a real browser (Chromium, Firefox, WebKit) and drives it programmatically. It's the most reliable E2E tool for modern web apps.\n\n**What belongs in E2E tests** (keep the list short):\n- Critical user journeys that cross multiple systems: sign up → verify email → log in\n- Checkout / payment flows\n- Auth and session handling (login, logout, token expiry)\n- Anything where integration between your frontend, API, and DB needs to be proven end-to-end\n\n**What does NOT belong in E2E**: individual component behavior, API response formats, business logic. Those are faster and more reliable in unit/integration tests.\n\n**Page Object Model (POM)**: encapsulate page-specific selectors and actions into a class. Tests become readable and maintainable — change a selector in one place instead of 20 tests.\n\n**Test isolation**: each test must start from a clean state. Use the API to seed data before the test and tear it down after, rather than relying on data created by previous tests.\n\n**Playwright-specific power features**: `page.route()` to intercept network calls, `expect(locator).toBeVisible()` auto-waits (no `sleep()` needed), trace files for debugging failures in CI.",
    code: {
      language: 'typescript',
      snippet: `// tests/e2e/auth.spec.ts
import { test, expect, type Page } from '@playwright/test';

// Page Object Model — encapsulates selectors and actions in one class
class LoginPage {
  constructor(private page: Page) {}

  async goto() { await this.page.goto('/login'); }

  async login(email: string, password: string) {
    await this.page.fill('[name=email]', email);
    await this.page.fill('[name=password]', password);
    await this.page.click('button[type=submit]');
  }

  errorMessage() { return this.page.getByRole('alert'); }
}

// Test suite
test.describe('Authentication', () => {
  // Seed test data via API before each test
  test.beforeEach(async ({ request }) => {
    await request.post('/api/test/seed', {
      data: { email: 'alice@example.com', password: 'password123', name: 'Alice' },
    });
  });

  test.afterEach(async ({ request }) => {
    await request.post('/api/test/cleanup');
  });

  test('user can log in and reach dashboard', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('alice@example.com', 'password123');

    // Playwright auto-waits for navigation
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: /welcome, alice/i })).toBeVisible();
  });

  test('shows error on invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('wrong@example.com', 'wrong');

    await expect(loginPage.errorMessage()).toHaveText(/invalid credentials/i);
    await expect(page).toHaveURL('/login'); // stays on login page
  });
});`,
    },
  },

];
