import type { Flashcard } from '../types';

export const typescriptCards: Flashcard[] = [

  // ─── TypeScript (Senior) ─────────────────────────────────────────────────────

  {
    id: 'ts-1',
    category: 'TypeScript',
    difficulty: 'hard',
    question: 'What are conditional types and the `infer` keyword? Build a `PromiseValue<T>` and `FunctionReturn<T>` utility type from scratch.',
    answer:
      'Conditional types evaluate to different types depending on a condition: `T extends U ? X : Y`.\n\n`infer R` introduces a **type variable** that TypeScript infers from the matched pattern inside a conditional type. It\'s how you "extract" a type from another type.\n\n**Use cases**: unwrapping `Promise<T>`, extracting function return types, element types of arrays, parameter types.',
    code: {
      language: 'typescript',
      snippet: `// Unwrap a Promise – works recursively for nested Promises
type PromiseValue<T> = T extends Promise<infer R> ? PromiseValue<R> : T;

type A = PromiseValue<Promise<string>>;           // string
type B = PromiseValue<Promise<Promise<number>>>;  // number
type C = PromiseValue<string>;                    // string (no-op)

// Extract return type of any function
type FunctionReturn<T> = T extends (...args: any[]) => infer R ? R : never;

type D = FunctionReturn<() => string>;            // string
type E = FunctionReturn<(x: number) => boolean>; // boolean

// Extract element type of an array
type ElementType<T> = T extends (infer E)[] ? E : never;
type F = ElementType<User[]>; // User

// Practical: strip null/undefined from all fields
type NonNullableFields<T> = { [K in keyof T]: NonNullable<T[K]> };`,
    },
  },

  {
    id: 'ts-2',
    category: 'TypeScript',
    difficulty: 'hard',
    question: 'What are mapped types? Build a `DeepReadonly<T>` and a `Mutable<T>` utility.',
    answer:
      'Mapped types iterate over the keys of an existing type and produce a new type by transforming each property. Syntax: `{ [K in keyof T]: TransformedType }`.\n\nKey modifiers:\n- `+readonly` / `-readonly` — add or remove readonly\n- `+?` / `-?` — add or remove optional\n- `as NewKey` (TypeScript 4.1+) — remap key names',
    code: {
      language: 'typescript',
      snippet: `// Recursive readonly
type DeepReadonly<T> = T extends (infer R)[]
  ? ReadonlyArray<DeepReadonly<R>>
  : T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

// Remove readonly from all properties
type Mutable<T> = { -readonly [K in keyof T]: T[K] };

// Remove optional from all properties
type Concrete<T> = { [K in keyof T]-?: T[K] };

// Remap keys: prefix all method names with 'get'
type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};

interface User { id: number; name: string; }
type UserGetters = Getters<User>;
// { getId: () => number; getName: () => string }`,
    },
  },

  {
    id: 'ts-3',
    category: 'TypeScript',
    difficulty: 'hard',
    question: 'What is a discriminated union and how do you enforce exhaustive checks at compile time?',
    answer:
      'A discriminated union uses a shared **literal-type discriminant** field so TypeScript can narrow each variant precisely.\n\n**Exhaustive check**: create a `never`-typed `assertNever(x: never)` function and call it in the `default` branch. If you add a new variant but forget to handle it, TypeScript errors at compile time because the new variant is not assignable to `never`.',
    code: {
      language: 'typescript',
      snippet: `type Shape =
  | { kind: 'circle';    radius: number }
  | { kind: 'rect';      w: number; h: number }
  | { kind: 'triangle';  base: number; height: number };

function assertNever(x: never): never {
  throw new Error(\`Unhandled variant: \${JSON.stringify(x)}\`);
}

function area(s: Shape): number {
  switch (s.kind) {
    case 'circle':   return Math.PI * s.radius ** 2;
    case 'rect':     return s.w * s.h;
    case 'triangle': return 0.5 * s.base * s.height;
    default:         return assertNever(s);
    // ^^^^ Adding 'hexagon' to Shape without a case here is a compile error
  }
}

// Also works in if/else chains via the never type narrowing
function describeApiResult<T>(res: ApiResponse<T>): string {
  if (res.status === 'success') return JSON.stringify(res.data);
  if (res.status === 'error')   return res.message;
  if (res.status === 'loading') return 'Loading…';
  return assertNever(res); // TypeScript confirms all cases handled
}`,
    },
  },

  {
    id: 'ts-4',
    category: 'TypeScript',
    difficulty: 'hard',
    question: 'What are template literal types and how are they useful for building typed event systems or API route maps?',
    answer:
      'Template literal types (TypeScript 4.1+) allow string types to be constructed by combining other string types using template literal syntax. They support `Uppercase<S>`, `Lowercase<S>`, `Capitalize<S>`, `Uncapitalize<S>` intrinsics.\n\nUse cases:\n- Typed event names (`user:created`, `order:fulfilled`)\n- CSS property names\n- HTTP method + route combinations\n- Strongly-typed `EventEmitter` wrappers',
    code: {
      language: 'typescript',
      snippet: `type Entity = 'user' | 'order' | 'product';
type Action = 'created' | 'updated' | 'deleted';

// Cross product of all entity:action combinations
type DomainEvent = \`\${Entity}:\${Action}\`;
// 'user:created' | 'user:updated' | ... (9 variants)

// Typed EventEmitter
type EventMap = {
  [E in DomainEvent]: E extends \`\${infer T}:\${infer A}\`
    ? { entity: T; action: A; payload: unknown }
    : never;
};

// Route type for a REST API
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type Route = \`/\${string}\`;
type Endpoint = \`\${HttpMethod} \${Route}\`;

declare function createHandler(endpoint: Endpoint, handler: Handler): void;
createHandler('GET /users/:id', getUser);       // ✓
createHandler('FETCH /users',   getUsers);       // ✗ compile error`,
    },
  },

  {
    id: 'ts-5',
    category: 'TypeScript',
    difficulty: 'hard',
    question: 'What is variance in TypeScript generics? Explain covariance vs contravariance with function parameters.',
    answer:
      '**Variance** describes how subtype relationships of complex types relate to subtype relationships of their component types.\n\n**Covariant** (read position): if `Dog extends Animal`, then `Producer<Dog> extends Producer<Animal>` — you can substitute a more specific producer. Array elements are covariant.\n\n**Contravariant** (write / parameter position): if `Dog extends Animal`, then `Consumer<Animal> extends Consumer<Dog>` — a function expecting `Animal` can handle any `Dog` (but not vice versa). Function parameters are contravariant.\n\n**Bivariant** (TypeScript default for method signatures — a soundness hole): TypeScript 4.7 introduced `in`/`out` variance annotations to be explicit.',
    code: {
      language: 'typescript',
      snippet: `// Covariance: return types are covariant
type Producer<out T> = () => T;
declare const dogProducer: Producer<Dog>;
const animalProducer: Producer<Animal> = dogProducer; // ✓ safe

// Contravariance: parameter types are contravariant
type Consumer<in T> = (x: T) => void;
declare const animalConsumer: Consumer<Animal>;
const dogConsumer: Consumer<Dog> = animalConsumer; // ✓ safe
// An animalConsumer can handle any Animal, including a Dog

// TypeScript method shorthand is bivariant (unsound):
interface Unsound { method(x: Dog): void; }
// Whereas function property is properly contravariant:
interface Sound { method: (x: Dog) => void; }

// TypeScript 4.7 explicit variance markers
type ReadonlyBox<out T>   = { get(): T };       // covariant
type WriteOnlyBox<in T>   = { set(v: T): void }; // contravariant`,
    },
  },

  // ─── TypeScript (Easy) ───────────────────────────────────────────────────────

  {
    id: 'ts-e1',
    category: 'TypeScript',
    difficulty: 'easy',
    question: 'What is TypeScript and what are the main benefits of using it over plain JavaScript?',
    answer:
      'TypeScript is a **statically-typed superset of JavaScript** developed by Microsoft. It compiles to plain JavaScript and adds optional type annotations.\n\n**Benefits**:\n- **Catch errors at compile time** — type mismatches, undefined property access, and wrong function signatures are flagged before the code runs\n- **Better IDE support** — autocomplete, inline docs, and safe refactoring\n- **Self-documenting code** — function signatures describe their contracts without reading the body\n- **Safer refactoring** — rename a type and the compiler tells you every call site that breaks\n\n**Trade-offs**: adds a build step, learning curve for advanced types, and type-declaration files for untyped third-party packages.',
    code: {
      language: 'typescript',
      snippet: `// TypeScript catches this bug at compile time
function greet(name: string): string {
  return 'Hello, ' + name;
}

greet('Alice');    // ✓ OK
greet(42);         // ✗ Argument of type 'number' is not assignable to parameter of type 'string'
greet(undefined);  // ✗ Caught at compile time, not at runtime`,
    },
  },

  {
    id: 'ts-e2',
    category: 'TypeScript',
    difficulty: 'easy',
    question: 'What is the difference between `interface` and `type` in TypeScript?',
    answer:
      "Both describe the shape of an object. Key differences:\n\n| | `interface` | `type` |\n|---|---|---|\n| Extension | `extends` keyword | Intersection `&` |\n| Declaration merging | Yes — multiple declarations merge | No — duplicate names error |\n| Primitives / unions | No | Yes (`type ID = string \\| number`) |\n| Computed types | No | Yes (`type Keys = keyof T`) |\n\n**Rule of thumb**: use `interface` for **public API shapes** (class contracts, object props) where declaration merging or extension is useful. Use `type` for **unions, intersections, mapped types, and primitive aliases**.\n\nFor most object shapes they are interchangeable — prefer `interface` for objects and `type` for everything else.",
    code: {
      language: 'typescript',
      snippet: `// interface — extendable, mergeable
interface User { id: number; name: string; }
interface Admin extends User { role: 'admin'; }

// Declaration merging (only interfaces can do this)
interface Window { myCustomProp: string; }

// type — unions, mapped types, aliases
type Status  = 'active' | 'inactive' | 'banned';
type Nullable<T> = T | null;
type UserKeys = keyof User; // 'id' | 'name'`,
    },
  },

  // ─── TypeScript (Medium) ─────────────────────────────────────────────────────

  {
    id: 'ts-m1',
    category: 'TypeScript',
    difficulty: 'medium',
    question: 'What are generics in TypeScript and when should you use them?',
    answer:
      "Generics let you write **reusable, type-safe functions and classes** that work across multiple types without losing type information.\n\nInstead of using `any` (which loses type info) or duplicating code for each type, you introduce a **type parameter** (e.g. `<T>`) that is resolved at the call site.\n\n**When to use**:\n- Collections / data structures: `Stack<T>`, `Repository<T>`\n- Utility functions: `first<T>(arr: T[]): T`\n- Higher-order functions: `map`, `filter`, `pipe`\n- API wrappers where the return type depends on the request type\n\n**Constraints**: `<T extends object>` restricts what `T` can be. `<T extends keyof U>` ensures `T` is a valid key of `U`.",
    code: {
      language: 'typescript',
      snippet: `// Without generics — loses type info
function identity(value: any): any { return value; }
const result = identity(42); // result: any

// With generics — type flows through
function identity<T>(value: T): T { return value; }
const n = identity(42);       // n: number ✓
const s = identity('hello');  // s: string ✓

// Generic repository pattern
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<T>;
}

// Constrained generic: only accept objects with an 'id' field
function merge<T extends { id: string }>(a: T, b: Partial<T>): T {
  return { ...a, ...b };
}`,
    },
  },

  {
    id: 'ts-m2',
    category: 'TypeScript',
    difficulty: 'medium',
    question: "What does TypeScript's `strict` mode enable and why should you always turn it on?",
    answer:
      '`strict: true` in `tsconfig.json` enables a bundle of strictness flags that catch entire categories of bugs:\n\n| Flag | What it catches |\n|---|---|\n| `strictNullChecks` | Prevents `null`/`undefined` from being assigned to every type — #1 source of runtime errors |\n| `noImplicitAny` | Requires explicit types where TypeScript cannot infer them |\n| `strictFunctionTypes` | Catches unsafe function parameter variance |\n| `strictPropertyInitialization` | Ensures class properties are initialised in the constructor |\n| `useUnknownInCatchVariables` | Makes `catch (e)` give `e: unknown` instead of `any` |\n\n**Why always on**: starting a project with strict mode costs nothing. Enabling it on a legacy codebase is painful but prevents entire classes of `TypeError: Cannot read properties of undefined` in production.',
    code: {
      language: 'typescript',
      snippet: `// Without strictNullChecks — compiles fine, crashes at runtime
function getLength(s: string) { return s.length; }
getLength(null as any); // runtime TypeError

// With strictNullChecks — caught at compile time
function getLength(s: string | null) {
  if (s === null) return 0;
  return s.length; // TypeScript narrows to string here
}

// useUnknownInCatchVariables
try {
  JSON.parse('{bad}');
} catch (e) {
  // e is 'unknown' — must narrow before using
  if (e instanceof Error) console.error(e.message);
}`,
    },
  },
];
