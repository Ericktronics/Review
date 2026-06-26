import type { Flashcard } from '../types';

export const typescriptCards: Flashcard[] = [

  // ─── TypeScript (Senior) ─────────────────────────────────────────────────────

  {
    id: 'ts-1',
    category: 'TypeScript',
    difficulty: 'hard',
    type: 'experience',
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
    type: 'experience',
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
    type: 'experience',
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
    type: 'experience',
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
    type: 'experience',
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
    type: 'basics',
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

  // ─── TypeScript (Medium) ─────────────────────────────────────────────────────

  {
    id: 'ts-e3',
    category: 'TypeScript',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is type inference in TypeScript?',
    answer:
      "**Type inference** is TypeScript's ability to automatically determine the type of a variable, parameter, or return value without an explicit annotation.\n\nTypeScript infers types from:\n- **Variable initialisation** — `const x = 42` → TypeScript knows `x: number`\n- **Return statements** — the return type of a function is inferred from what it returns\n- **Contextual typing** — callback parameters are inferred from the expected function signature\n\n**Why it matters**: you get full type safety without writing type annotations everywhere. Inference keeps code concise while the compiler still catches mistakes.\n\n**When to annotate explicitly**:\n- Function parameters (TypeScript cannot infer these)\n- Public API surfaces (makes intent clear)\n- When inference produces an overly broad type (e.g. `any` or a union you want to restrict)",
    code: {
      language: 'typescript',
      snippet: `// TypeScript infers all of these without explicit annotations
const name = 'Alice';           // string
const count = 42;               // number
const active = true;            // boolean
const items = [1, 2, 3];        // number[]
const user = { id: 1, name: 'Alice' }; // { id: number; name: string }

// Return type inferred as number
function add(a: number, b: number) {
  return a + b; // TypeScript infers return type: number
}

// Contextual typing: callback parameter types inferred from Array.map
const doubled = [1, 2, 3].map(n => n * 2); // n inferred as number

// When to annotate: function parameters always need types
function greet(name: string): string {
  return \`Hello, \${name}\`;
}`,
    },
  },

  {
    id: 'ts-e4',
    category: 'TypeScript',
    difficulty: 'easy',
    type: 'basics',
    question: 'What are union types and intersection types in TypeScript?',
    answer:
      "**Union type** (`A | B`): a value can be **one of several types**. TypeScript narrows the type in conditional branches.\n\n**Intersection type** (`A & B`): a value must satisfy **all of the combined types** simultaneously — it has all properties of A and all properties of B.\n\n**When to use**:\n- Union: a value that can legitimately be different types (`string | number`, `Success | Error`)\n- Intersection: merge two interfaces, extend a type with extra properties, compose mixins\n\n**Narrowing unions**: use `typeof`, `instanceof`, or a discriminant field to tell TypeScript which branch you're in.",
    code: {
      language: 'typescript',
      snippet: `// Union type — value is one OR the other
type StringOrNumber = string | number;

function formatId(id: StringOrNumber): string {
  if (typeof id === 'string') return id.toUpperCase(); // narrowed to string
  return id.toFixed(0);                               // narrowed to number
}

// Discriminated union — common in API responses
type Result<T> =
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };

// Intersection type — value must satisfy BOTH types
interface HasId    { id: string; }
interface HasName  { name: string; }
type Entity = HasId & HasName;    // must have both id AND name

const user: Entity = { id: '1', name: 'Alice' };

// Practical: extend a type with extra fields
type AdminUser = User & { role: 'admin'; permissions: string[] };`,
    },
  },

  {
    id: 'ts-e5',
    category: 'TypeScript',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is the difference between null, undefined, and never in TypeScript?',
    answer:
      "**`undefined`**: a variable has been declared but not yet assigned a value. It's also the implicit return of a function that doesn't return anything.\n\n**`null`**: explicitly set to mean 'no value'. Must be intentionally assigned — it represents the deliberate absence of an object.\n\n**`never`**: a type that represents a value that **never occurs**. Used for:\n- Functions that always throw (never return normally)\n- Functions with an infinite loop\n- Exhaustive checks — a branch that TypeScript proves is unreachable\n\n**With `strictNullChecks`** (which you should always enable): `null` and `undefined` are their own types and cannot be assigned to `string`, `number`, etc. without explicit handling.\n\n**Practical difference**: `undefined` = forgot to set it; `null` = intentionally set to nothing; `never` = this code path is impossible.",
    code: {
      language: 'typescript',
      snippet: `// undefined — variable declared, no value assigned
let x: string | undefined;
console.log(x); // undefined

// null — explicitly no value
let user: User | null = null;
user = await db.findUser(id); // could be null if not found

// Handling both
function getLength(s: string | null | undefined): number {
  if (s == null) return 0; // == catches both null and undefined
  return s.length;
}

// never — function that never returns
function fail(message: string): never {
  throw new Error(message);
}

// never in exhaustive checks
type Color = 'red' | 'green' | 'blue';
function assertNever(x: never): never { throw new Error('Unhandled case'); }

function describe(c: Color): string {
  switch (c) {
    case 'red':   return 'Red';
    case 'green': return 'Green';
    case 'blue':  return 'Blue';
    default:      return assertNever(c); // TypeScript errors if a case is missed
  }
}`,
    },
  },

  {
    id: 'ts-m3',
    category: 'TypeScript',
    difficulty: 'medium',
    type: 'basics',
    question: 'What are TypeScript decorators?',
    answer:
      "**Decorators** are special declarations that can be attached to classes, methods, properties, or parameters to add metadata or modify behaviour at runtime. They use the `@expression` syntax.\n\n**How they work**: a decorator is a function that receives the decorated target as an argument and can modify or replace it.\n\n**Types**:\n- **Class decorator** — receives the constructor; can modify or replace the class\n- **Method decorator** — receives the prototype, method name, and property descriptor\n- **Property decorator** — receives the prototype and property name\n- **Parameter decorator** — receives the prototype, method name, and parameter index\n\n**Common use cases**: NestJS uses decorators for `@Injectable()`, `@Controller()`, `@Get()`. TypeORM uses `@Entity()`, `@Column()`. They are the foundation of dependency injection in these frameworks.\n\n**Status**: TypeScript 5.0 introduced standard decorators (Stage 3 proposal). Legacy `experimentalDecorators` mode is different — check which version your framework uses.",
    code: {
      language: 'typescript',
      snippet: `// Method decorator: measure execution time
function Measure(target: any, key: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;
  descriptor.value = async function (...args: any[]) {
    const start = Date.now();
    const result = await original.apply(this, args);
    console.log(\`\${key} took \${Date.now() - start}ms\`);
    return result;
  };
  return descriptor;
}

class UserService {
  @Measure
  async findUser(id: string) {
    return db.user.findUnique({ where: { id } });
  }
}

// NestJS-style usage (decorators you'll see in real projects)
// @Injectable()
// class UserService { ... }
//
// @Controller('/users')
// class UserController {
//   @Get(':id')
//   async getUser(@Param('id') id: string) { ... }
// }`,
    },
  },

  {
    id: 'ts-m4',
    category: 'TypeScript',
    difficulty: 'medium',
    type: 'basics',
    question: 'What are the keyof and typeof operators in TypeScript?',
    answer:
      "**`keyof`**: takes an object type and returns a **union of its property names** as string literal types.\n\n**`typeof`**: used in a *type* position to get the **TypeScript type** of a variable or expression (different from the JavaScript `typeof` operator which returns a string at runtime).\n\n**Combined power**: `keyof typeof obj` gets all keys of a plain JavaScript object as a union type — extremely useful for working with enums, lookup tables, and config objects.\n\n**Practical uses**:\n- `keyof T` — create functions that accept only valid property names\n- `typeof` — derive types from existing values instead of duplicating definitions\n- `T[K]` — index access type: `User['name']` is `string`",
    code: {
      language: 'typescript',
      snippet: `interface User {
  id: number;
  name: string;
  email: string;
}

// keyof — union of property names
type UserKey = keyof User; // 'id' | 'name' | 'email'

// Safe property access: K must be a real key of T
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]; // T[K] is the index access type
}

const user: User = { id: 1, name: 'Alice', email: 'a@b.com' };
const name = getProperty(user, 'name');  // type: string ✓
// getProperty(user, 'age');             // ✗ compile error

// typeof — derive a type from a runtime value
const config = {
  host: 'localhost',
  port: 5432,
  ssl: false,
};
type Config = typeof config; // { host: string; port: number; ssl: boolean }

// keyof typeof — get keys of a plain object
const STATUS_CODES = { ok: 200, notFound: 404, error: 500 } as const;
type StatusKey = keyof typeof STATUS_CODES; // 'ok' | 'notFound' | 'error'`,
    },
  },

  {
    id: 'ts-m1',
    category: 'TypeScript',
    difficulty: 'medium',
    type: 'basics',
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
    type: 'basics',
    question: "What does TypeScript's `strict` mode enable and why should you always turn it on?",
    answer:
      "**`strict: true` is a single setting in `tsconfig.json` that enables a bundle of safety checks.** Each check catches a specific category of bug before your code ships.\n\n**Most important flag — `strictNullChecks`**: without it, `null` and `undefined` can be assigned to *any* type, silently. This is the #1 cause of `TypeError: Cannot read properties of undefined` in JavaScript. With it, TypeScript forces you to handle the null case explicitly.\n\n| Flag | What it catches |\n|---|---|\n| `strictNullChecks` | `null`/`undefined` assigned to non-nullable types |\n| `noImplicitAny` | Variables/parameters typed as `any` without being explicit about it |\n| `strictFunctionTypes` | Unsafe function parameter assignments |\n| `strictPropertyInitialization` | Class properties not initialised in the constructor |\n| `useUnknownInCatchVariables` | `catch (e)` gives `e: unknown` instead of `any` — forces you to narrow before using |\n\n**Why always on**: starting a project with `strict: true` costs nothing extra. Turning it on in an existing codebase is painful (you must fix all errors), but it prevents entire categories of runtime crashes.\n\n**Most common gotcha**: if you inherit a project without strict mode, enable `strictNullChecks` first — that alone catches the most bugs.",
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

  {
    id: 'ts-e6',
    category: 'TypeScript',
    difficulty: 'easy',
    type: 'basics',
    question: '`type` vs `interface` in TypeScript — what is the difference and when do you use each?',
    answer:
      '**They are mostly interchangeable for objects, but have key differences:**\n\n| | `interface` | `type` |\n|---|---|---|\n| Declaration merging | ✅ Yes — you can reopen and extend | ❌ No — duplicate name = error |\n| Extends | `extends` keyword | `&` intersection |\n| Can describe primitives / unions / tuples | ❌ No | ✅ Yes |\n| Computed / mapped types | ❌ Limited | ✅ Full support |\n| Error messages | Usually cleaner | Can be verbose |\n\n**Use `interface` when:**\n- Defining the shape of an object or class contract\n- Building a public API / library (consumers can extend via declaration merging)\n- You want `implements` support with classes\n\n**Use `type` when:**\n- You need a union: `type Status = "active" | "inactive"`\n- You need a tuple: `type Point = [number, number]`\n- You need mapped/conditional types\n- Aliasing a primitive or utility type: `type ID = string`\n\n**Rule of thumb:** default to `interface` for objects and class shapes; reach for `type` when you need unions, tuples, or complex type expressions.',
    code: {
      language: 'typescript',
      snippet: `// ── interface ───────────────────────────────────
interface User {
  id: number;
  name: string;
}

// Declaration merging — only interfaces can do this
interface User {
  email: string; // merged into the original User
}

// Class can implement an interface
class AdminUser implements User {
  id = 1; name = 'Admin'; email = 'a@b.com';
}

// ── type ─────────────────────────────────────────
type Status = 'active' | 'inactive' | 'banned'; // union — only type can do this
type Point  = [number, number];                  // tuple

type AdminUser2 = User & { role: 'admin' };      // intersection (same as extends)

// Mapped type — only works with type
type Readonly<T> = { readonly [K in keyof T]: T[K] };

// Conditional type — only works with type
type IsString<T> = T extends string ? true : false;`,
    },
  },
];
