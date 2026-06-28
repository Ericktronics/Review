import type { Flashcard } from '../types';

export const javascriptCards: Flashcard[] = [

  // ─── JavaScript (Easy) ───────────────────────────────────────────────────────

  {
    id: 'js-e1',
    category: 'JavaScript',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is hoisting in JavaScript? How does it differ for `var`, `let`/`const`, and function declarations?',
    answer:
      '**Hoisting** is JavaScript\'s behavior of processing declarations before code executes — as if they were "moved" to the top of their scope.\n\n**`var`** — declaration AND initialization to `undefined` are hoisted to the top of the enclosing function. You can read a `var` before its line and get `undefined` (no error).\n\n**`let` / `const`** — declaration is hoisted, but NOT initialized. Accessing the variable before its line throws a `ReferenceError`. The gap between the start of the scope and the declaration line is the **Temporal Dead Zone (TDZ)**.\n\n**Function declarations** (`function foo() {}`) — fully hoisted: the entire function body is available at the top of the scope. You can call it before its definition line.\n\n**Function expressions** (`const foo = function() {}` or `const foo = () => {}`) — only the variable binding is hoisted (as `undefined` for `var`, or TDZ for `let`/`const`). The function itself is NOT available until that line executes.\n\n**Rule of thumb**: use `const` by default. It gives you the TDZ safety net, and you\'ll never be surprised by accessing a variable before it\'s set.',
    code: {
      language: 'javascript',
      snippet: `// var: hoisted and initialized to undefined
console.log(x); // undefined (no error)
var x = 5;

// let: hoisted but in the Temporal Dead Zone
console.log(y); // ReferenceError: Cannot access 'y' before initialization
let y = 5;

// Function declaration: fully hoisted — callable before its definition
greet(); // "Hello!" ✅
function greet() { console.log("Hello!"); }

// Function expression: NOT hoisted
sayBye(); // TypeError: sayBye is not a function
var sayBye = function() { console.log("Bye!"); };

// const: same TDZ as let
console.log(z); // ReferenceError
const z = 10;`,
    },
  },

  {
    id: 'js-e2',
    category: 'JavaScript',
    difficulty: 'easy',
    type: 'basics',
    question: 'What are JavaScript\'s data types? What is the difference between primitives and reference types?',
    answer:
      '**Primitive types** (7 total) — stored by value, immutable:\n`string`, `number`, `bigint`, `boolean`, `undefined`, `null`, `symbol`\n\nWhen you copy a primitive, you get an independent copy. Changing the copy doesn\'t affect the original.\n\n**Reference types** — stored by reference (pointer to a memory location):\nObjects, arrays, functions (arrays and functions are objects under the hood)\n\nWhen you copy a reference type, you copy the pointer — both variables point to the same object in memory. Mutating one affects the other.\n\n**`typeof` quirks to know for interviews**:\n- `typeof null === \'object\'` — historical bug, cannot be fixed without breaking the web\n- `typeof function(){} === \'function\'` — functions have their own `typeof` result even though they\'re objects\n- `typeof undefined === \'undefined\'`\n- `typeof [] === \'object\'` — use `Array.isArray()` to check for arrays\n\n**Checking for `null`**: `value === null` (strict equality, not typeof)',
    code: {
      language: 'javascript',
      snippet: `// Primitives: copy by value
let a = 5;
let b = a;
b = 10;
console.log(a); // 5 — unchanged

// Reference types: copy by reference (pointer)
const obj1 = { name: 'Alice' };
const obj2 = obj1;       // both point to the same object
obj2.name = 'Bob';
console.log(obj1.name);  // 'Bob' — obj1 was mutated via obj2

// typeof quirks
console.log(typeof null);        // 'object'  ← bug, not a real object
console.log(typeof []);          // 'object'  ← use Array.isArray() instead
console.log(typeof function(){}); // 'function'
console.log(typeof undefined);   // 'undefined'
console.log(typeof 42n);         // 'bigint'

// Correct null check
const val = null;
console.log(val === null);       // true ✅
console.log(typeof val === 'object' && val === null); // true ✅`,
    },
  },

  {
    id: 'js-e3',
    category: 'JavaScript',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is the scope chain in JavaScript? How does lexical scoping work?',
    answer:
      '**Scope** defines where a variable is accessible. JavaScript uses **lexical (static) scoping** — a variable\'s scope is determined by where it\'s *written* in the source code, not by where it\'s *called* from.\n\n**Scope chain**: when you access a variable, JavaScript looks in the current scope first. If not found, it moves up to the parent scope, then the parent\'s parent, and so on up to the global scope. If the variable isn\'t found anywhere, it throws a `ReferenceError`.\n\n**Types of scope**:\n- **Global** — variables declared outside any function or block\n- **Function** — variables declared inside a function (`var`, `let`, `const`)\n- **Block** — variables declared inside `{}` with `let` or `const` (not `var`)\n- **Module** — each ES module has its own scope; nothing leaks to global\n\n**Key insight**: inner functions have access to outer variables, but outer functions cannot access inner variables. Closures are built on this — a function "closes over" the variables in its outer scope.',
    code: {
      language: 'javascript',
      snippet: `const globalVar = 'global';

function outer() {
  const outerVar = 'outer';

  function inner() {
    const innerVar = 'inner';

    // Scope chain: inner → outer → global
    console.log(innerVar);  // 'inner'   ✅ own scope
    console.log(outerVar);  // 'outer'   ✅ parent scope
    console.log(globalVar); // 'global'  ✅ grandparent scope
  }

  inner();
  // console.log(innerVar); // ❌ ReferenceError — inner scope not accessible
}

// Block scope (let/const only)
{
  let blockScoped = 'only here';
  var notBlockScoped = 'leaks out';
}
// console.log(blockScoped);    // ❌ ReferenceError
console.log(notBlockScoped);    // 'leaks out' — var ignores block scope

// Module scope: each file is its own scope (with ES modules)
// export const x = 1; — only accessible where imported`,
    },
  },

  {
    id: 'js-e4',
    category: 'JavaScript',
    difficulty: 'easy',
    type: 'basics',
    question: 'What are `Map` and `Set` in JavaScript? When do you use them over plain objects and arrays?',
    answer:
      '**`Map`** — a key-value store like an object, but with important differences:\n- Keys can be **any type** (objects, functions, primitives) — not just strings/symbols\n- Maintains **insertion order** when iterating\n- Has a built-in `.size` property\n- Better performance for frequent additions/deletions\n- No risk of prototype pollution (plain objects inherit keys like `toString`, `constructor`)\n\n**`Set`** — a collection of **unique values**. Adding a duplicate is silently ignored.\n- Use for deduplication: `[...new Set(array)]`\n- Has O(1) `.has()` lookups (same as Map)\n- Maintains insertion order\n\n**WeakMap / WeakSet**: keys must be objects; references are held weakly (don\'t prevent garbage collection). Use for private metadata attached to objects, e.g. caching computed results without preventing GC of the keys.\n\n**When to use Map over object**: dynamic keys, non-string keys, need size, frequent add/delete.\n**When to use Set over array**: need uniqueness, fast `.has()` lookups, deduplication.',
    code: {
      language: 'javascript',
      snippet: `// Map: any key type, maintains order
const map = new Map();
const objKey = { id: 1 };

map.set(objKey, 'metadata');    // object as key
map.set('name', 'Alice');
map.set(42, 'the answer');

console.log(map.get(objKey));   // 'metadata'
console.log(map.size);          // 3

// Iterating a Map
for (const [key, value] of map) {
  console.log(key, value);
}

// Set: unique values only
const set = new Set([1, 2, 2, 3, 3, 3]);
console.log([...set]);          // [1, 2, 3]
console.log(set.has(2));        // true
console.log(set.size);          // 3

// Most common Set use: deduplicate an array
const tags = ['js', 'react', 'js', 'node', 'react'];
const unique = [...new Set(tags)]; // ['js', 'react', 'node']

// WeakMap: cache without preventing GC
const cache = new WeakMap();
function getMetadata(obj) {
  if (!cache.has(obj)) cache.set(obj, { computed: true });
  return cache.get(obj);
}`,
    },
  },

  {
    id: 'js-e5',
    category: 'JavaScript',
    difficulty: 'easy',
    type: 'basics',
    question: 'What are spread, rest, and destructuring in JavaScript?',
    answer:
      'Three ES6 syntax features that make working with arrays and objects cleaner.\n\n**Spread (`...`)** — *expands* an iterable into individual elements:\n- Copy an array/object: `const copy = [...arr]` or `{ ...obj }`\n- Merge: `[...a, ...b]` or `{ ...defaults, ...overrides }`\n- Pass array elements as function arguments: `Math.max(...nums)`\n\n**Rest (`...`)** — *collects* remaining elements into an array. Same syntax as spread, but used in function parameter position or the last destructuring target.\n\n**Destructuring** — extract values from arrays/objects into named variables:\n- Object: `const { name, age } = user`\n- Array: `const [first, , third] = arr` (skip with empty slot)\n- Default values: `const { name = \'Anonymous\' } = user`\n- Rename: `const { name: userName } = user`\n- Nested: `const { address: { city } } = user`\n\n**Important**: spread creates a *shallow* copy. Nested objects/arrays are still shared by reference.',
    code: {
      language: 'javascript',
      snippet: `// ── Spread ──────────────────────────────────────────
const nums = [1, 2, 3];
const more = [...nums, 4, 5];          // [1, 2, 3, 4, 5]
console.log(Math.max(...nums));        // 3

const defaults = { theme: 'dark', lang: 'en' };
const settings = { ...defaults, lang: 'fr' }; // override lang
// { theme: 'dark', lang: 'fr' }

// ── Rest ─────────────────────────────────────────────
function sum(first, ...rest) {
  return rest.reduce((acc, n) => acc + n, first);
}
console.log(sum(1, 2, 3, 4)); // 10

// ── Object destructuring ──────────────────────────────
const user = { name: 'Alice', age: 30, role: 'admin' };

const { name, age }           = user;         // basic
const { name: userName }      = user;         // rename
const { city = 'Unknown' }    = user;         // default value
const { role, ...rest2 }      = user;         // rest in destructure

// ── Array destructuring ───────────────────────────────
const [first, second, ...tail] = [10, 20, 30, 40];
// first=10, second=20, tail=[30,40]

// Skip elements
const [,, third] = [1, 2, 3]; // third = 3

// ── Function parameter destructuring ─────────────────
function greet({ name, greeting = 'Hello' }) {
  return \`\${greeting}, \${name}!\`;
}
console.log(greet({ name: 'Bob' })); // 'Hello, Bob!'`,
    },
  },

  // ─── JavaScript (Medium) ─────────────────────────────────────────────────────

  {
    id: 'js-m1',
    category: 'JavaScript',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is a closure in JavaScript? What is the `var`-in-loop bug and how do you fix it?',
    answer:
      'A **closure** is a function that remembers variables from its outer lexical scope even after the outer function has finished executing. Every function in JavaScript is a closure — it "closes over" the environment where it was created.\n\n**How it works**: when a function is defined inside another function, it holds a reference to the outer function\'s scope. The variables in that scope stay alive as long as the inner function is referenced.\n\n**The `var`-in-loop bug** — a classic interview question:\n`var` is function-scoped, so all loop iterations share the SAME `i` variable. By the time the `setTimeout` callbacks fire (after the loop completes), `i` is already at its final value.\n\n**Fixes**:\n1. Use `let` — creates a new binding per iteration (block-scoped)\n2. IIFE — immediately invoke a function to capture `i` by value\n\n**Practical uses of closures**:\n- **Data privacy / module pattern** — expose only what you need, hide implementation\n- **Partial application / currying** — pre-fill some arguments\n- **Memoization** — cache results in closure scope\n- **Event handlers** — remember setup values without global variables',
    code: {
      language: 'javascript',
      snippet: `// ── The var-in-loop bug ───────────────────────────────
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Prints: 3, 3, 3  (all share the same i — already 3 after loop)

// Fix 1: use let (new binding per iteration)
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Prints: 0, 1, 2 ✅

// Fix 2: IIFE captures i by value
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(() => console.log(j), 100);
  })(i);
}
// Prints: 0, 1, 2 ✅

// ── Data privacy via closure ───────────────────────────
function createCounter() {
  let count = 0;           // private — not accessible from outside

  return {
    increment: () => ++count,
    decrement: () => --count,
    value: () => count,
  };
}

const counter = createCounter();
counter.increment(); // 1
counter.increment(); // 2
counter.decrement(); // 1
console.log(counter.value()); // 1
// console.log(count);  ❌ ReferenceError — count is private`,
    },
  },

  {
    id: 'js-m2',
    category: 'JavaScript',
    difficulty: 'medium',
    type: 'basics',
    question: 'How does the JavaScript Event Loop work? What is the difference between microtasks and macrotasks?',
    answer:
      'JavaScript is **single-threaded** — only one piece of code runs at a time. The event loop orchestrates what runs and when.\n\n**Key components**:\n- **Call stack** — where currently executing functions live. LIFO (last in, first out).\n- **Web APIs** — browser/Node handles async work off the main thread (timers, fetch, I/O)\n- **Microtask queue** — `Promise.then/catch/finally`, `queueMicrotask`, `MutationObserver`\n- **Macrotask queue (task queue)** — `setTimeout`, `setInterval`, `setImmediate` (Node), I/O callbacks, UI events\n\n**Event loop order**:\n1. Run all synchronous code (empty the call stack)\n2. **Drain the entire microtask queue** — including any new microtasks added during draining\n3. Take **ONE** macrotask from the macrotask queue and run it\n4. Drain the microtask queue again\n5. Repeat\n\n**Key rule**: microtasks always run before the next macrotask. This is why `Promise.then` always fires before `setTimeout(..., 0)` even if the setTimeout was registered first.',
    code: {
      language: 'javascript',
      snippet: `// Classic interview question — what is the output?
console.log('1');                          // sync

setTimeout(() => console.log('2'), 0);    // macrotask

Promise.resolve()
  .then(() => console.log('3'))           // microtask
  .then(() => console.log('4'));          // microtask (chained)

console.log('5');                          // sync

// Output: 1, 5, 3, 4, 2
// Explanation:
// Sync: 1, 5
// Microtask queue: 3 → then 4 (added after 3 runs)
// Macrotask queue: 2

// ── Microtasks block the next macrotask ───────────────
// Infinite microtask loop starves macrotasks:
function infiniteMicrotasks() {
  Promise.resolve().then(infiniteMicrotasks); // setTimeout never fires
}

// ── Practical: async/await is microtask-based ─────────
async function run() {
  console.log('A');
  await Promise.resolve();   // suspends, queues microtask to resume
  console.log('B');          // runs as microtask on resume
}
run();
console.log('C');
// Output: A, C, B`,
    },
  },

  {
    id: 'js-m3',
    category: 'JavaScript',
    difficulty: 'medium',
    type: 'basics',
    question: 'How does `this` work in JavaScript? What are the four binding rules?',
    answer:
      '`this` refers to the object that is executing the current function. Its value is determined by **how** the function is called, not where it\'s defined.\n\n**The 4 binding rules (in priority order)**:\n\n**1. `new` binding** — `new Foo()` creates a new object and sets `this` to it inside the constructor.\n\n**2. Explicit binding** — `fn.call(obj, args)`, `fn.apply(obj, [args])`, `fn.bind(obj)` explicitly set `this` to `obj`.\n\n**3. Implicit binding** — `obj.method()` sets `this` to `obj`. The object to the left of the dot wins.\n\n**4. Default binding** — bare function call `fn()`. In strict mode: `undefined`. In sloppy mode: `globalThis` (window in browsers, global in Node).\n\n**Arrow functions** — do NOT have their own `this`. They inherit `this` from the surrounding lexical scope at the time they\'re defined. `call`, `apply`, and `bind` cannot change an arrow function\'s `this`.\n\n**Common bug**: passing a method as a callback loses the implicit binding.',
    code: {
      language: 'javascript',
      snippet: `// 1. new binding
function Person(name) {
  this.name = name; // 'this' is the new object
}
const alice = new Person('Alice');
console.log(alice.name); // 'Alice'

// 2. Explicit binding
function greet() { return \`Hello, \${this.name}\`; }
const bob = { name: 'Bob' };
console.log(greet.call(bob));         // 'Hello, Bob'
console.log(greet.bind(bob)());       // 'Hello, Bob'

// 3. Implicit binding
const obj = {
  name: 'Carol',
  greet() { return \`Hello, \${this.name}\`; },
};
console.log(obj.greet()); // 'Hello, Carol'

// Lost binding — common bug
const fn = obj.greet;
console.log(fn()); // 'Hello, undefined' (default binding — this = global/undefined)

// Fix: bind or arrow function
const fixed = obj.greet.bind(obj);
console.log(fixed()); // 'Hello, Carol' ✅

// Arrow function: this from lexical scope
class Timer {
  constructor() { this.seconds = 0; }

  start() {
    // Arrow function inherits 'this' from start() — which is the Timer instance
    setInterval(() => { this.seconds++; }, 1000); // ✅

    // Regular function would lose 'this':
    // setInterval(function() { this.seconds++; }, 1000); // ❌ this = global
  }
}`,
    },
  },

  {
    id: 'js-m4',
    category: 'JavaScript',
    difficulty: 'medium',
    type: 'basics',
    question: 'How does prototypal inheritance work in JavaScript? How does `class` relate to it?',
    answer:
      'Every JavaScript object has a hidden internal link to another object called its **prototype** (`[[Prototype]]`). When you access a property on an object, JavaScript first looks at the object itself, then walks up the prototype chain until it finds the property or reaches `null`.\n\n**Prototype chain lookup order**: `object` → `Object.prototype` → `null`\n\n**Key APIs**:\n- `Object.create(proto)` — creates a new object with `proto` as its prototype\n- `Object.getPrototypeOf(obj)` — get an object\'s prototype\n- `obj instanceof Constructor` — checks if `Constructor.prototype` appears anywhere in `obj`\'s prototype chain\n- `obj.hasOwnProperty(key)` — checks if property is on the object itself (not inherited)\n\n**`class` is syntactic sugar** — JavaScript classes don\'t introduce a new inheritance model. Under the hood, `class` sets up the same prototype chain. `class Foo extends Bar` makes `Foo.prototype.__proto__ === Bar.prototype`.\n\n**`__proto__` vs `prototype`**: `__proto__` is the actual prototype link on an object instance. `prototype` is a property on constructor functions used to set up the chain when `new` is called.',
    code: {
      language: 'javascript',
      snippet: `// Prototype chain manually
const animal = {
  speak() { return \`\${this.name} makes a sound.\`; }
};

const dog = Object.create(animal); // dog's prototype is animal
dog.name = 'Rex';

console.log(dog.speak());                   // 'Rex makes a sound.'
console.log(dog.hasOwnProperty('speak'));   // false — inherited from animal
console.log(dog.hasOwnProperty('name'));    // true  — own property

// class: same prototype chain under the hood
class Animal {
  constructor(name) { this.name = name; }
  speak() { return \`\${this.name} makes a sound.\`; }
}

class Dog extends Animal {
  speak() { return \`\${this.name} barks.\`; }
}

const rex = new Dog('Rex');
console.log(rex.speak());          // 'Rex barks.'
console.log(rex instanceof Dog);   // true
console.log(rex instanceof Animal);// true — chain: rex → Dog.prototype → Animal.prototype

// Equivalent to class Dog extends Animal:
// Dog.prototype.__proto__ === Animal.prototype ✅`,
    },
  },

  {
    id: 'js-m5',
    category: 'JavaScript',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is debounce? What is throttle? When do you use each?',
    answer:
      'Both techniques limit how often a function runs in response to rapidly firing events (scroll, resize, keypress). They solve different problems.\n\n**Debounce** — delays execution until the events *stop*. The timer resets on every call. The function runs only after `delay` ms of silence.\n- **Use when**: you want to act after the user finishes doing something\n- **Examples**: search-as-you-type (API call after user stops typing), form validation, window resize layout recalculation\n\n**Throttle** — guarantees at most one execution per time window. After a call, further calls are silently dropped until the window expires.\n- **Use when**: you want to act *during* the activity but at a controlled rate\n- **Examples**: scroll event (update sticky nav at most every 16ms), mouse move tracking, rate-limited API calls, game input\n\n**Memory trick**: debounce = *wait for quiet*. Throttle = *pace the rate*.\n\n**Libraries**: `lodash` provides well-tested `_.debounce` and `_.throttle` implementations. Write your own only for learning or if lodash is unavailable.',
    code: {
      language: 'javascript',
      snippet: `// ── Debounce implementation ───────────────────────────
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);                      // reset on every call
    timer = setTimeout(() => fn(...args), delay);
  };
}

// Search input — only fires 300ms after user stops typing
const handleSearch = debounce((query) => {
  console.log('Searching for:', query);
  fetch(\`/api/search?q=\${query}\`);
}, 300);

input.addEventListener('input', (e) => handleSearch(e.target.value));

// ── Throttle implementation ────────────────────────────
function throttle(fn, interval) {
  let lastRun = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastRun >= interval) {
      lastRun = now;
      fn(...args);
    }
  };
}

// Scroll handler — runs at most once every 16ms (~60fps)
const handleScroll = throttle(() => {
  updateStickyNav(window.scrollY);
}, 16);

window.addEventListener('scroll', handleScroll);`,
    },
  },

  {
    id: 'js-m6',
    category: 'JavaScript',
    difficulty: 'medium',
    type: 'basics',
    question: 'What are common `async`/`await` pitfalls? How do you run Promises in parallel vs in sequence?',
    answer:
      '`async`/`await` is syntactic sugar over Promises — an `async` function always returns a Promise; `await` pauses the async function\'s execution until the Promise settles, without blocking the event loop.\n\n**Pitfall 1 — `await` inside `forEach`**:\n`Array.forEach` does not await the callback. The loop fires all callbacks and moves on immediately. Use `for...of` instead.\n\n**Pitfall 2 — Sequential when you mean parallel**:\nAwaiting Promises one by one means each waits for the previous to finish. If the operations are independent, use `Promise.all()` to run them concurrently.\n\n**Pitfall 3 — Missing error handling**:\nAn `async` function that throws produces an unhandled rejection if the caller doesn\'t `await` it or `.catch()` it. Always handle errors.\n\n**Pitfall 4 — Ignoring that `await` only awaits the immediate Promise**:\n`await Promise.all([...])` vs `await fetch()` followed by `await res.json()` — two separate awaits, two separate microtask ticks.',
    code: {
      language: 'javascript',
      snippet: `// ✗ WRONG: await inside forEach — doesn't wait
async function processAll(ids) {
  ids.forEach(async (id) => {
    await fetch(\`/api/\${id}\`); // forEach ignores the returned promise
  });
  console.log('done'); // fires immediately, before any fetch completes
}

// ✓ CORRECT: for...of respects await
async function processAll(ids) {
  for (const id of ids) {
    await fetch(\`/api/\${id}\`); // truly sequential
  }
  console.log('done'); // fires after all fetches complete
}

// ── Sequential vs Parallel ────────────────────────────
// ✗ SLOW: sequential — 3s total (1s + 1s + 1s)
const user    = await getUser(id);    // 1s
const orders  = await getOrders(id);  // 1s
const reviews = await getReviews(id); // 1s

// ✓ FAST: parallel — ~1s total (all run concurrently)
const [user2, orders2, reviews2] = await Promise.all([
  getUser(id),
  getOrders(id),
  getReviews(id),
]);

// ── Error handling ────────────────────────────────────
async function loadData() {
  try {
    const res = await fetch('/api/data');
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
    return await res.json();
  } catch (err) {
    console.error('Failed to load:', err);
    throw err; // re-throw so callers know it failed
  }
}`,
    },
  },

  // ─── JavaScript (Hard) ───────────────────────────────────────────────────────

  {
    id: 'js-1',
    category: 'JavaScript',
    difficulty: 'hard',
    type: 'experience',
    question: 'What is currying in JavaScript? What is partial application and how are they different?',
    answer:
      '**Currying** — transforms a function that takes multiple arguments into a chain of functions, each taking ONE argument. Named after mathematician Haskell Curry.\n\n`f(a, b, c)` → `f(a)(b)(c)`\n\n**Partial application** — pre-filling some (not all) arguments of a function to produce a new function with fewer parameters. Unlike currying, it doesn\'t enforce one argument at a time.\n\n`f(a, b, c)` → `fWithA = partial(f, a)` → `fWithA(b, c)`\n\n**Why they\'re useful**:\n- Create reusable, specialized functions from generic ones\n- Enable point-free programming style\n- Improve readability by naming intermediate functions\n- Work naturally with higher-order functions (`map`, `filter`)\n\n**When to use in real code**: creating configured instances of utility functions (a logger with a preset prefix, a fetcher with a preset base URL, a formatter with preset locale/currency).\n\n**Automatic currying**: lodash\'s `_.curry()` wraps any function so it auto-curries — it returns itself until all arguments are supplied.',
    code: {
      language: 'javascript',
      snippet: `// ── Manual currying ───────────────────────────────────
function add(a) {
  return function(b) {
    return a + b;
  };
}
const add5 = add(5);       // partially applied
console.log(add5(3));      // 8
console.log(add5(10));     // 15

// Arrow function shorthand
const multiply = (a) => (b) => a * b;
const double = multiply(2);
console.log([1, 2, 3].map(double)); // [2, 4, 6]

// ── Practical example ─────────────────────────────────
const formatCurrency = (currency) => (locale) => (amount) =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);

const formatUSD = formatCurrency('USD')('en-US');
const formatEUR = formatCurrency('EUR')('de-DE');

console.log(formatUSD(1234.5)); // '$1,234.50'
console.log(formatEUR(1234.5)); // '1.234,50 €'

// ── Generic curry function ─────────────────────────────
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn(...args);               // all args received — call fn
    }
    return (...more) => curried(...args, ...more); // wait for more
  };
}

const curriedAdd = curry((a, b, c) => a + b + c);
console.log(curriedAdd(1)(2)(3));   // 6
console.log(curriedAdd(1, 2)(3));   // 6
console.log(curriedAdd(1)(2, 3));   // 6`,
    },
  },

  {
    id: 'js-2',
    category: 'JavaScript',
    difficulty: 'hard',
    type: 'experience',
    question: 'What causes memory leaks in JavaScript? How do you detect and fix them?',
    answer:
      'A memory leak occurs when memory that is no longer needed is not released, causing the app to consume more and more RAM over time until it crashes or degrades.\n\n**Common causes**:\n\n**1. Forgotten event listeners** — adding listeners to DOM elements or `window` without removing them. When the element is removed from the DOM but the listener isn\'t removed, the element\'s entire subtree and the callback\'s closure stay in memory.\n\n**2. Timers never cleared** — `setInterval` that runs forever keeps its callback and everything in its closure alive. Always store the ID and call `clearInterval`.\n\n**3. Closures holding large data** — a closure keeps the entire outer scope alive, even if you only need one small variable. Avoid capturing large objects unnecessarily.\n\n**4. Global variables** — accidentally assigning to `window.foo = ...` or using `var` at the top level keeps data alive for the page lifetime.\n\n**5. Detached DOM nodes** — storing a JS reference to a DOM node after it\'s been removed from the document. The node\'s subtree stays in memory even though it\'s not visible.\n\n**Detection**: Chrome DevTools → Memory tab → take a heap snapshot, record an allocation timeline, or use the Allocation Profiler. Look for objects that grow over time without being GC\'d.\n\n**Fix strategy**: use `AbortController` for fetch, `removeEventListener` for DOM events, `clearInterval`/`clearTimeout` in cleanup, and WeakRef/WeakMap for optional references.',
    code: {
      language: 'javascript',
      snippet: `// ✗ LEAK 1: event listener never removed
function setup() {
  const handler = () => console.log('click', hugeData);
  document.addEventListener('click', handler);
  // handler and hugeData stay in memory forever
}

// ✓ FIX: remove listener when done, or use AbortController
function setup() {
  const controller = new AbortController();
  document.addEventListener('click', handler, { signal: controller.signal });
  return () => controller.abort(); // call this to clean up
}

// ✗ LEAK 2: interval never cleared
function startPolling() {
  setInterval(() => fetch('/api/status'), 5000); // runs forever
}

// ✓ FIX: store the ID and clear it
function startPolling() {
  const id = setInterval(() => fetch('/api/status'), 5000);
  return () => clearInterval(id);
}

// ✗ LEAK 3: detached DOM node
let detachedNode;
function createNode() {
  const el = document.createElement('div');
  document.body.appendChild(el);
  detachedNode = el;              // JS holds a reference
  document.body.removeChild(el); // removed from DOM but stays in memory
}

// ✓ FIX: null out references when done
function createNode() {
  const el = document.createElement('div');
  document.body.appendChild(el);
  document.body.removeChild(el);
  // no reference kept — el can be GC'd
}

// WeakMap: hold metadata without preventing GC
const metadata = new WeakMap();
metadata.set(element, { clicks: 0 }); // won't leak if element is removed`,
    },
  },

  {
    id: 'js-3',
    category: 'JavaScript',
    difficulty: 'hard',
    type: 'experience',
    question: 'What are generator functions in JavaScript? What problems do they solve?',
    answer:
      'A **generator function** (`function*`) can pause its execution mid-way using `yield`, and resume it later. Calling a generator function returns an **iterator** — an object with a `.next()` method. Each `.next()` call resumes execution until the next `yield` or `return`.\n\n**`.next()` returns** `{ value, done }` — `value` is the yielded value, `done` is `true` when the function returns.\n\n**Problems generators solve**:\n\n**1. Lazy evaluation / infinite sequences** — compute values only when needed, without storing them all in memory. You can model an infinite sequence and only pull values as required.\n\n**2. Custom iterables** — implement `[Symbol.iterator]` with a generator to make any object work with `for...of`, spread, and destructuring.\n\n**3. Cooperative multitasking** — `yield` hands control back to the caller without losing local state. This was the foundation of async patterns before `async`/`await` (via libraries like `co`).\n\n**`yield*`** — delegates to another iterable/generator, yielding all its values in sequence.',
    code: {
      language: 'javascript',
      snippet: `// Basic generator
function* counter(start = 0) {
  while (true) {
    yield start++;    // pause here, resume on next .next() call
  }
}

const gen = counter(1);
console.log(gen.next()); // { value: 1, done: false }
console.log(gen.next()); // { value: 2, done: false }
console.log(gen.next()); // { value: 3, done: false }
// Infinite — but we only compute values we ask for

// ── Finite generator ──────────────────────────────────
function* range(start, end, step = 1) {
  for (let i = start; i < end; i += step) {
    yield i;
  }
}

console.log([...range(0, 10, 2)]); // [0, 2, 4, 6, 8]

for (const n of range(1, 4)) {
  console.log(n); // 1, 2, 3
}

// ── Custom iterable object ────────────────────────────
class LinkedList {
  constructor() { this.head = null; }

  *[Symbol.iterator]() {       // makes the class iterable
    let node = this.head;
    while (node) {
      yield node.value;
      node = node.next;
    }
  }
}

const list = new LinkedList();
// ... populate list ...
for (const value of list) {   // works with for...of, spread, destructuring
  console.log(value);
}

// ── yield* delegate ───────────────────────────────────
function* concat(...iterables) {
  for (const iterable of iterables) {
    yield* iterable; // delegate — yields all items from each iterable
  }
}

console.log([...concat([1, 2], [3, 4], [5])]); // [1, 2, 3, 4, 5]`,
    },
  },

  {
    id: 'js-4',
    category: 'JavaScript',
    difficulty: 'hard',
    type: 'experience',
    question: 'What is event delegation? Why is it better than attaching listeners to every element?',
    answer:
      '**Event delegation** — attach ONE event listener to a parent element instead of individual listeners on each child. When a child is clicked, the event **bubbles up** through the DOM tree to the parent, where you handle it by checking `event.target`.\n\n**Why events bubble**: most DOM events propagate from the target element up through its ancestors to the document root. This is what makes delegation possible.\n\n**Advantages**:\n1. **Performance** — one listener instead of hundreds. Matters for large lists (virtual scrolling, huge tables).\n2. **Dynamic content** — works automatically for elements added to the DOM after the listener was set up. You don\'t need to re-attach listeners when the list changes.\n3. **Less memory** — fewer closures and function references.\n4. **Simpler cleanup** — remove one listener instead of tracking and removing many.\n\n**When delegation doesn\'t work**: events that don\'t bubble (`focus`, `blur`, `mouseenter`, `mouseleave`). Use the bubbling equivalents instead: `focusin`, `focusout`, `mouseover`, `mouseout`.\n\n**`event.target` vs `event.currentTarget`**: `target` is the element that was actually clicked; `currentTarget` is the element the listener is attached to.',
    code: {
      language: 'javascript',
      snippet: `// ✗ BAD: listener on every item — 1000 listeners for 1000 items
document.querySelectorAll('.todo-item').forEach(item => {
  item.addEventListener('click', handleClick);
  // Also breaks for dynamically added items
});

// ✓ GOOD: one listener on the parent using event delegation
const list = document.querySelector('#todo-list');

list.addEventListener('click', (event) => {
  // event.target = the actual element clicked
  // event.currentTarget = the list (where listener is attached)

  const item = event.target.closest('.todo-item'); // handle clicks on children too
  if (!item) return; // clicked somewhere else in the list

  const id = item.dataset.id;
  handleTodoClick(id);
});

// Works even for items added dynamically after the listener was set up
function addTodo(text) {
  const li = document.createElement('li');
  li.className = 'todo-item';
  li.dataset.id = Date.now();
  li.textContent = text;
  list.appendChild(li); // automatically handled by the existing listener ✅
}

// ── Handling different actions via data attributes ─────
list.addEventListener('click', (event) => {
  const btn = event.target.closest('[data-action]');
  if (!btn) return;

  const { action, id } = btn.dataset;
  if (action === 'delete') deleteTodo(id);
  if (action === 'complete') completeTodo(id);
});`,
    },
  },

  // ── Arrow functions vs regular functions (new / arguments / prototype) ───
  {
    id: 'js-m7',
    category: 'JavaScript',
    difficulty: 'medium',
    type: 'basics',
    question: 'How do arrow functions differ from regular functions regarding `new`, `arguments`, and `prototype`?',
    answer:
      '**`new`**: Regular functions CAN be called with `new` — they have a `prototype` property and act as constructors. Arrow functions CANNOT — they have no `prototype` and throw a `TypeError` if you try `new ArrowFn()`.\n\n**`arguments` object**: Regular functions have their own `arguments` array-like object containing all passed args. Arrow functions have NO own `arguments` — they inherit it from the nearest enclosing regular function (or get a `ReferenceError` in strict mode with no enclosing function). Use rest params `...args` in arrows instead.\n\n**`this` binding**: Regular function `this` is dynamic — determined at call time by 4 rules (default, implicit, explicit, `new`). Arrow function `this` is **lexical** — captured from the enclosing scope at definition time. `.call()`, `.apply()`, and `.bind()` cannot change it.\n\n| Feature | Regular Function | Arrow Function |\n|---|---|---|\n| `new` | ✅ works | ❌ TypeError |\n| `prototype` | ✅ exists | ❌ `undefined` |\n| `arguments` | ✅ own object | ❌ none (use `...args`) |\n| `this` | Dynamic (call site) | Lexical (definition) |',
    code: {
      language: 'javascript',
      snippet: `// ── new / prototype ────────────────────────────────────
function Person(name) { this.name = name; }
const alice = new Person('Alice');      // ✅ works
console.log(Person.prototype);         // { constructor: [Function: Person] }

const ArrowPerson = (name) => { this.name = name; };
// new ArrowPerson('Bob');             // ❌ TypeError: ArrowPerson is not a constructor
console.log(ArrowPerson.prototype);    // undefined

// ── arguments object ────────────────────────────────────
function regular() {
  console.log(arguments[0]);           // ✅ "hello"
}
regular('hello');

const arrow = () => {
  // console.log(arguments);           // ❌ ReferenceError in strict mode
};
const withRest = (...args) => console.log(args[0]); // ✅ use rest params
withRest('hello');

// ── this binding ────────────────────────────────────────
function Timer() {
  this.seconds = 0;
  setInterval(function() {
    // this.seconds++;                 // ❌ 'this' is undefined (strict) or global
  }, 1000);
  setInterval(() => {
    this.seconds++;                    // ✅ 'this' is the Timer instance (lexical)
  }, 1000);
}`,
    },
  },

];
