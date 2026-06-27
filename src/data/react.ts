import type { Flashcard } from '../types';

export const reactCards: Flashcard[] = [

  // ─── React (Easy) ────────────────────────────────────────────────────────────

  {
    id: 'react-e1',
    category: 'React',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is React and what makes it different from a full framework like Angular?',
    answer:
      "**React is a UI library** — it only handles the view layer. You compose it with other libraries for routing (React Router), state (Redux, Zustand), forms (React Hook Form), etc.\n\n**Angular is a full framework** — it ships opinions on everything: routing, HTTP, forms, DI, testing. One team, one way.\n\n**Key React concepts**:\n- **Components** — reusable UI pieces, either functions or classes (functions are standard now)\n- **JSX** — HTML-like syntax inside JavaScript that compiles to `React.createElement()` calls\n- **Virtual DOM** — React maintains a lightweight copy of the DOM in memory. On state change, it diffs the new virtual DOM against the previous one and only updates the real DOM where things changed (reconciliation). This avoids expensive full re-renders.\n- **Unidirectional data flow** — data flows down via props; events flow up via callbacks\n\n**Why React won**: composability over convention. You pick your own tools. Massive ecosystem. Meta + community backing.",
    code: {
      language: 'tsx',
      snippet: `// Simplest React component — a function that returns JSX
function Greeting({ name }: { name: string }) {
  return <h1>Hello, {name}!</h1>;  // JSX compiles to React.createElement(...)
}

// Used like HTML
<Greeting name="Henrick" />

// JSX rules:
// - One root element (or use a Fragment <>...</>)
// - className not class
// - camelCase event handlers: onClick not onclick
// - Expressions in {}
const el = <p>{isLoggedIn ? 'Welcome back' : 'Please log in'}</p>;`,
    },
  },

  {
    id: 'react-e2',
    category: 'React',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is the difference between props and state in React?',
    answer:
      "**Props** (properties) — data passed **into** a component from its parent. Read-only inside the component. Think of them like function arguments.\n\n**State** — data managed **inside** a component that can change over time. When state changes, React re-renders the component.\n\n**Key rule**: never mutate props or state directly. State must be updated via `setState` or the setter from `useState` — this is what triggers a re-render.\n\n**Lifting state up** — when two sibling components need to share state, move the state to their closest common parent and pass it down via props.\n\n**Props vs State quick test**: ask 'does this data change over time?' and 'does this component own it?' If yes to both → state. If it comes from outside → props.",
    code: {
      language: 'tsx',
      snippet: `// Props — passed in from parent, read-only
function Button({ label, onClick }: { label: string; onClick: () => void }) {
  return <button onClick={onClick}>{label}</button>;
}

// State — owned by the component, triggers re-renders when changed
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0); // initial value = 0

  return (
    <div>
      <p>Count: {count}</p>
      <Button label="+" onClick={() => setCount(count + 1)} />
      <Button label="-" onClick={() => setCount(count - 1)} />
    </div>
  );
}`,
    },
  },

  {
    id: 'react-e3',
    category: 'React',
    difficulty: 'easy',
    type: 'basics',
    question: 'What are React hooks? What are the rules of hooks?',
    answer:
      "**Hooks** are functions that let you use React features (state, lifecycle, context) inside functional components. They replaced class components for managing local state and side effects.\n\n**Most used hooks**:\n- `useState` — local component state\n- `useEffect` — side effects (data fetching, subscriptions, DOM mutations)\n- `useContext` — read from a Context without prop drilling\n- `useRef` — mutable value that doesn't trigger re-renders; also used to access DOM nodes\n- `useMemo` / `useCallback` — memoize expensive values / functions\n\n**Rules of Hooks** (enforced by the ESLint plugin):\n1. **Only call hooks at the top level** — never inside loops, conditions, or nested functions. React relies on hook call order to match state to the right hook on every render.\n2. **Only call hooks from React functions** — functional components or custom hooks. Never from regular JS functions.\n\n**Custom hooks** — extract reusable hook logic into a function prefixed with `use`: `useLocalStorage`, `useFetch`, `useDebounce`.",
    code: {
      language: 'tsx',
      snippet: `import { useState, useEffect, useRef } from 'react';

function Timer() {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // side effect: start timer when component mounts
    intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000);

    // cleanup: stop timer when component unmounts
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []); // empty array = run once on mount

  return <p>Elapsed: {seconds}s</p>;
}

// ✗ WRONG — hook inside a condition
function Bad({ show }: { show: boolean }) {
  if (show) useState(0); // breaks hook order!
}`,
    },
  },

  {
    id: 'react-e4',
    category: 'React',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is `useEffect`? How do the dependency array options behave differently?',
    answer:
      '`useEffect` runs a side effect after the component renders. It replaces `componentDidMount`, `componentDidUpdate`, and `componentWillUnmount` from class components.\n\n**Dependency array controls when it runs:**\n\n- `useEffect(fn)` — no array → runs after **every render** (rarely what you want)\n- `useEffect(fn, [])` — empty array → runs **once after mount** (componentDidMount equivalent)\n- `useEffect(fn, [a, b])` — runs after mount **and whenever `a` or `b` changes**\n\n**Cleanup function** — return a function to clean up subscriptions, timers, or event listeners. It runs before the next effect and on unmount.\n\n**Common mistake**: missing a dependency. If you use a variable inside the effect but don\'t include it in the deps array, the effect captures a stale closure. The `eslint-plugin-react-hooks` exhaustive-deps rule catches this.',
    code: {
      language: 'tsx',
      snippet: `import { useState, useEffect } from 'react';

function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);

  // Re-run whenever userId changes
  useEffect(() => {
    let cancelled = false; // prevent setting state on unmounted component

    fetch(\`/api/users/\${userId}\`)
      .then(r => r.json())
      .then(data => { if (!cancelled) setUser(data); });

    return () => { cancelled = true; }; // cleanup
  }, [userId]); // dependency: re-fetch when userId changes

  if (!user) return <p>Loading...</p>;
  return <p>{user.name}</p>;
}`,
    },
  },

  {
    id: 'react-e5',
    category: 'React',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is the virtual DOM and how does React\'s reconciliation work?',
    answer:
      "**Virtual DOM** — a lightweight JavaScript object tree that mirrors the real DOM structure. React maintains this in memory and uses it to compute the minimal set of real DOM changes needed.\n\n**Reconciliation process** (happens on every render):\n1. State or props change → React calls the component function again → returns a new virtual DOM tree\n2. React **diffs** the new tree against the previous tree (the diffing algorithm)\n3. React generates a list of changes (insertions, deletions, updates)\n4. React applies only those changes to the real DOM (the commit phase)\n\n**Why it matters for performance**: real DOM operations are expensive. By batching and minimizing DOM writes, React stays fast even for complex UIs.\n\n**The `key` prop** — when rendering lists, React uses `key` to match elements across renders. Without it, React can't tell if an item was reordered vs replaced, causing bugs. Always use a stable, unique key (like a DB id), not array index — index keys break when items are added/removed.",
    code: {
      language: 'tsx',
      snippet: `// key tells React which list item is which across re-renders
const items = [
  { id: 1, name: 'Apple' },
  { id: 2, name: 'Banana' },
];

// ✗ BAD — index as key breaks on insert/delete/reorder
items.map((item, i) => <li key={i}>{item.name}</li>);

// ✓ GOOD — stable unique id
items.map(item => <li key={item.id}>{item.name}</li>);

// React.Fragment — group elements without adding a real DOM node
function Table() {
  return (
    <>
      <tr><td>Row 1</td></tr>
      <tr><td>Row 2</td></tr>
    </>
  );
}`,
    },
  },

  {
    id: 'react-e6',
    category: 'React',
    difficulty: 'easy',
    type: 'basics',
    question: 'How do you conditionally render elements in JSX?',
    answer:
      "JSX is JavaScript, so you use plain JS expressions for conditionals — no special directive syntax like Angular's `*ngIf`.\n\n**Three patterns:**\n\n**1. Ternary** — use when you need either/or:\n```\n{isLoggedIn ? <Dashboard /> : <LoginPage />}\n```\n\n**2. `&&` short-circuit** — use when you render something only if true:\n```\n{hasError && <ErrorBanner />}\n```\n⚠️ **Pitfall**: if the left side is a number, React renders that number.\n`{count && <Badge />}` renders `0` when count is 0. Fix: `{count > 0 && <Badge />}`\n\n**3. Early return** — cleanest for guard clauses at the top of a component:\n```\nif (!user) return null;\n```\n\n**`null`, `undefined`, `false`, `''`** — React renders nothing for these. Use them to \"turn off\" a subtree.",
    code: {
      language: 'tsx',
      snippet: `function Notification({ count, user }: { count: number; user: User | null }) {
  // Early return guard
  if (!user) return null;

  return (
    <div>
      {/* Ternary: either/or */}
      {user.isAdmin ? <AdminBanner /> : <UserBanner name={user.name} />}

      {/* && shortcircuit: only show if true */}
      {user.isVerified && <span>✓ Verified</span>}

      {/* ✗ WRONG: renders "0" when count is 0 */}
      {count && <Badge label={count} />}

      {/* ✓ CORRECT: explicitly check > 0 */}
      {count > 0 && <Badge label={count} />}
    </div>
  );
}`,
    },
  },

  {
    id: 'react-e7',
    category: 'React',
    difficulty: 'easy',
    type: 'basics',
    question: 'How does event handling work in React? How is it different from HTML?',
    answer:
      "React wraps native browser events in a **SyntheticEvent** — a normalized wrapper that works identically across all browsers.\n\n**Key differences from HTML:**\n- Event names are **camelCase**: `onClick`, `onChange`, `onSubmit` (not `onclick`)\n- You pass a **function reference**, not a string: `onClick={handleClick}` (not `onclick=\"handleClick()\"`)\n- To prevent default browser behavior, call **`e.preventDefault()`** — `return false` does nothing in React\n\n**Common events:**\n- `onClick` — any clickable element\n- `onChange` — fires on every keystroke in `<input>`, `<select>`, `<textarea>`; use `e.target.value` to read the current value\n- `onSubmit` — on `<form>`; always call `e.preventDefault()` to stop the page reload\n- `onKeyDown`, `onFocus`, `onBlur` — keyboard and focus events\n\n**Passing arguments** — wrap the handler in an arrow function if you need to pass extra data:\n`onClick={() => handleDelete(item.id)}`",
    code: {
      language: 'tsx',
      snippet: `function ContactForm() {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // stop page reload
    // process form data...
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    console.log(e.target.value); // current input value on each keystroke
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" onChange={handleChange} />
      <button type="submit">Send</button>
    </form>
  );
}

// Passing arguments with an arrow function wrapper
function List({ items }: { items: Item[] }) {
  function handleDelete(id: string) { /* ... */ }

  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>
          {item.name}
          <button onClick={() => handleDelete(item.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}`,
    },
  },

  {
    id: 'react-e8',
    category: 'React',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is `useRef`? When do you use it instead of `useState`?',
    answer:
      "`useRef` returns `{ current: initialValue }` — a box you can put any value in. Unlike state, **mutating `.current` does not trigger a re-render**.\n\n**Two main uses:**\n\n**1. Access a DOM node directly** — attach the ref to a JSX element via the `ref` prop:\n- Focus an input programmatically\n- Measure an element's size or position\n- Integrate with a non-React library (chart, map, video player)\n\n**2. Store a mutable value without re-rendering** — like an instance variable:\n- Holding a timer ID so you can cancel it later\n- Tracking the previous value of a prop\n- Flagging whether the component is still mounted during an async operation\n\n**Rule of thumb**: if a value changing should update the UI → use `useState`. If it's just an internal detail the UI doesn't care about → use `useRef`.",
    code: {
      language: 'tsx',
      snippet: `import { useRef, useEffect } from 'react';

// Use 1: access a DOM node
function SearchInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus(); // focus on mount
  }, []);

  return <input ref={inputRef} type="text" placeholder="Search..." />;
}

// Use 2: store a timer ID — changing it shouldn't re-render the component
function Poller({ url }: { url: string }) {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function start() {
    timerRef.current = setInterval(() => fetch(url), 5000);
  }

  function stop() {
    if (timerRef.current) clearInterval(timerRef.current);
  }

  return (
    <>
      <button onClick={start}>Start polling</button>
      <button onClick={stop}>Stop</button>
    </>
  );
}`,
    },
  },

  {
    id: 'react-e9',
    category: 'React',
    difficulty: 'easy',
    type: 'basics',
    question: 'How do you render a list of items in React?',
    answer:
      "Use JavaScript's `.map()` inside JSX. Each returned element **must have a `key` prop** — a unique string or number React uses to track items across re-renders.\n\n**Key rules:**\n- Keys must be unique **among siblings** (not globally)\n- Use a stable, unique ID from your data (database ID, slug). **Never use array index** unless the list is fully static — index keys break animations, form state, and reconciliation when items are added, removed, or reordered\n- Keys go on the outermost element returned from `.map()`, not a child inside it\n\n**Handling edge cases:**\n- Empty list → check `.length` and return a fallback message\n- Nested lists → each `.map()` level needs its own `key`\n\n**Never mutate** the array before mapping. Always create a new array with `.filter()`, `.sort()`, etc.",
    code: {
      language: 'tsx',
      snippet: `type Product = { id: string; name: string; price: number };

function ProductList({ products }: { products: Product[] }) {
  // Empty state guard
  if (products.length === 0) {
    return <p>No products found.</p>;
  }

  return (
    <ul>
      {products.map(product => (
        // key goes on the outermost element of the map callback
        <li key={product.id}>
          <span>{product.name}</span>
          <span>\${product.price.toFixed(2)}</span>
        </li>
      ))}
    </ul>
  );
}

// ✗ index as key — breaks when items are added/removed/reordered
products.map((p, i) => <li key={i}>{p.name}</li>);

// ✓ stable unique ID
products.map(p => <li key={p.id}>{p.name}</li>);`,
    },
  },

  {
    id: 'react-e10',
    category: 'React',
    difficulty: 'easy',
    type: 'basics',
    question: 'What are React Fragments and why do you need them?',
    answer:
      "JSX requires a **single root element** — you can't return two sibling elements side by side. Wrapping them in a `<div>` works but adds an unnecessary DOM node, which can break CSS layouts (flexbox, grid) and semantic HTML (e.g. `<tr>` inside a `<table>`).\n\n**Fragments** let you group elements without adding a real DOM node.\n\n**Two forms:**\n- `<>...</>` — shorthand, most common. Cannot accept props.\n- `<React.Fragment>...</React.Fragment>` — explicit form. Needed when you have to pass a `key` prop (e.g. inside a `.map()` returning multiple elements per item).\n\n**When you'll see them:**\n- Table rows where a component returns `<dt>` and `<dd>` pairs\n- Layout components that return multiple siblings\n- Anywhere a wrapper `<div>` would disturb the DOM structure or CSS",
    code: {
      language: 'tsx',
      snippet: `import { Fragment } from 'react';

// ✗ Extra <div> breaks table structure
function BadRow({ label, value }: { label: string; value: string }) {
  return (
    <div>          {/* ← invalid inside <table> */}
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

// ✓ Fragment — no extra DOM node
function DefinitionRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  );
}

// When you need a key (inside .map()), use explicit React.Fragment
const items = [{ id: 1, label: 'Name', value: 'Alice' }];

items.map(item => (
  <Fragment key={item.id}>   {/* <> shorthand can't have a key prop */}
    <dt>{item.label}</dt>
    <dd>{item.value}</dd>
  </Fragment>
));`,
    },
  },

  // ─── React (Medium) ──────────────────────────────────────────────────────────

  {
    id: 'react-m1',
    category: 'React',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is `useContext`? How does it solve prop drilling?',
    answer:
      "**Prop drilling** — passing data through multiple layers of components that don't need it, just to reach a deeply nested child. Makes code brittle and hard to refactor.\n\n**Context** — a way to share data globally across a component tree without passing it as props at every level. Use cases: auth user, theme, language/locale, toast notifications.\n\n**How to use**:\n1. `createContext(defaultValue)` — create the context object\n2. `<Context.Provider value={...}>` — wrap the tree that needs access\n3. `useContext(Context)` — read the value in any component inside the Provider\n\n**When NOT to use Context**: don't use it as a replacement for all state management. Context re-renders every consumer when the value changes — for high-frequency state updates (form inputs, animations), use Zustand, Jotai, or Redux instead.",
    code: {
      language: 'tsx',
      snippet: `import { createContext, useContext, useState } from 'react';

// 1. Create context
const AuthContext = createContext<{ user: User | null; logout: () => void } | null>(null);

// 2. Provider wraps the app (or the subtree that needs it)
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  return (
    <AuthContext.Provider value={{ user, logout: () => setUser(null) }}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Any nested component can read it — no prop drilling
function UserAvatar() {
  const auth = useContext(AuthContext);
  if (!auth?.user) return null;
  return <img src={auth.user.avatarUrl} alt={auth.user.name} />;
}

// Custom hook wrapper — better DX + type safety
function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}`,
    },
  },

  {
    id: 'react-m2',
    category: 'React',
    difficulty: 'medium',
    type: 'basics',
    question: 'What are `useMemo` and `useCallback`? When should you use them?',
    answer:
      "Both are **performance optimization hooks** — they memoize values to avoid expensive recomputation or unnecessary re-renders.\n\n**`useMemo(fn, deps)`** — memoizes the **return value** of a function. The function only re-runs when a dependency changes.\n\n**`useCallback(fn, deps)`** — memoizes the **function itself**. Returns the same function reference across renders unless a dep changes.\n\n**When to use them**:\n- `useMemo` — computationally expensive derivations (filtering a 10k item list, complex calculations)\n- `useCallback` — when passing a callback to a child wrapped in `React.memo`, or as a dependency in another hook's array\n\n**When NOT to use them**: premature optimization is a real problem. Don't wrap every function and value — memoization has overhead too. Only add them when you've profiled a performance issue.\n\n**`React.memo`** — HOC that skips re-rendering a component if its props haven't changed. Works best when the parent re-renders often but the child's props are stable.",
    code: {
      language: 'tsx',
      snippet: `import { useMemo, useCallback, memo } from 'react';

function ProductList({ products, searchTerm }: Props) {
  // useMemo: only re-filter when products or searchTerm changes
  const filtered = useMemo(
    () => products.filter(p => p.name.toLowerCase().includes(searchTerm)),
    [products, searchTerm]
  );

  // useCallback: stable function ref so ItemRow doesn't re-render
  const handleDelete = useCallback((id: string) => {
    deleteProduct(id);
  }, []); // no deps — function never changes

  return (
    <ul>
      {filtered.map(p => (
        <ItemRow key={p.id} product={p} onDelete={handleDelete} />
      ))}
    </ul>
  );
}

// React.memo: skip re-render if props are the same
const ItemRow = memo(function ItemRow({ product, onDelete }: ItemRowProps) {
  return (
    <li>
      {product.name}
      <button onClick={() => onDelete(product.id)}>Delete</button>
    </li>
  );
});`,
    },
  },

  {
    id: 'react-m3',
    category: 'React',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is `useReducer`? When do you choose it over `useState`?',
    answer:
      '`useReducer` is an alternative to `useState` for managing state that involves multiple sub-values or where the next state depends on the previous one.\n\nIt follows the Redux pattern: `(state, action) => newState`.\n\n**Choose `useReducer` over `useState` when**:\n- State has multiple related fields that change together\n- Multiple actions need to transition the same state in different ways\n- The next state depends on the previous state in complex ways\n- You want state transitions to be explicit, testable, and predictable\n\n**`useState` is fine for**: a single primitive value, a simple toggle, a form field.',
    code: {
      language: 'tsx',
      snippet: `import { useReducer } from 'react';

type State = { status: 'idle' | 'loading' | 'success' | 'error'; data: User | null; error: string | null };
type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: User }
  | { type: 'FETCH_ERROR'; payload: string };

const initialState: State = { status: 'idle', data: null, error: null };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START':   return { ...state, status: 'loading', error: null };
    case 'FETCH_SUCCESS': return { status: 'success', data: action.payload, error: null };
    case 'FETCH_ERROR':   return { status: 'error', data: null, error: action.payload };
    default:              return state;
  }
}

function UserCard({ id }: { id: string }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  async function load() {
    dispatch({ type: 'FETCH_START' });
    try {
      const user = await fetchUser(id);
      dispatch({ type: 'FETCH_SUCCESS', payload: user });
    } catch (e) {
      dispatch({ type: 'FETCH_ERROR', payload: (e as Error).message });
    }
  }

  if (state.status === 'loading') return <p>Loading...</p>;
  if (state.status === 'error')   return <p>Error: {state.error}</p>;
  if (state.status === 'success') return <p>{state.data?.name}</p>;
  return <button onClick={load}>Load User</button>;
}`,
    },
  },

  {
    id: 'react-m4',
    category: 'React',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is a custom hook? How do you build one?',
    answer:
      "A **custom hook** is a function that starts with `use` and calls other hooks internally. It lets you extract and reuse stateful logic across components — without touching the component tree (unlike HOCs or render props).\n\n**When to extract a custom hook**: when the same `useState` + `useEffect` combination appears in multiple components, or when a component's logic is complex enough to deserve its own isolated concern.\n\n**Rules**: custom hooks follow the same rules as all hooks — only call them at the top level, only from React functions.",
    code: {
      language: 'tsx',
      snippet: `import { useState, useEffect } from 'react';

// Custom hook: encapsulates fetch logic
function useFetch<T>(url: string) {
  const [data, setData]       = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch(url)
      .then(r => { if (!r.ok) throw new Error(\`HTTP \${r.status}\`); return r.json(); })
      .then(d  => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch(e => { if (!cancelled) { setError(e.message); setLoading(false); } });

    return () => { cancelled = true; };
  }, [url]);

  return { data, loading, error };
}

// Consumed cleanly by any component
function UserProfile({ id }: { id: string }) {
  const { data, loading, error } = useFetch<User>(\`/api/users/\${id}\`);

  if (loading) return <p>Loading...</p>;
  if (error)   return <p>Error: {error}</p>;
  return <p>{data?.name}</p>;
}`,
    },
  },

  {
    id: 'react-m5',
    category: 'React',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is controlled vs uncontrolled component in React forms?',
    answer:
      "**Controlled component** — the form field's value is driven by React state. Every keystroke calls a state setter, and the input's `value` prop is always the source of truth.\n\n**Uncontrolled component** — the DOM owns the value. You read it via a `ref` when needed (e.g. on submit). No state per keystroke.\n\n**When to use which**:\n- **Controlled**: when you need instant validation, dependent fields (show field B based on field A's value), or dynamic enables/disables\n- **Uncontrolled / `useRef`**: simple forms, file inputs (always uncontrolled), performance-sensitive forms with many fields\n- **React Hook Form** uses uncontrolled inputs under the hood for performance, with a clean API on top — the best of both worlds for real apps",
    code: {
      language: 'tsx',
      snippet: `import { useState, useRef } from 'react';

// Controlled — React state is the source of truth
function ControlledForm() {
  const [email, setEmail] = useState('');
  const isValid = email.includes('@');

  return (
    <form>
      <input
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ borderColor: isValid ? 'green' : 'red' }}
      />
      <button disabled={!isValid}>Submit</button>
    </form>
  );
}

// Uncontrolled — DOM is the source of truth, read on submit
function UncontrolledForm() {
  const emailRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log(emailRef.current?.value); // read only when needed
  }

  return (
    <form onSubmit={handleSubmit}>
      <input ref={emailRef} type="email" />
      <button type="submit">Submit</button>
    </form>
  );
}`,
    },
  },

  {
    id: 'react-m6',
    category: 'React',
    difficulty: 'medium',
    type: 'basics',
    question: 'How does React Router v6 work? What are the core concepts?',
    answer:
      "React Router is the standard routing library for SPAs — it maps URL paths to components without a full page reload.\n\n**Core setup:**\n- `BrowserRouter` — wraps the entire app; listens to URL changes using the browser's History API\n- `Routes` + `Route` — declaratively maps paths to components\n- `Link` — renders an `<a>` tag but intercepts the click, updating the URL via the History API instead of reloading the page\n\n**Reading the URL:**\n- `useParams()` — reads dynamic segments: `/users/:id` → `{ id: '42' }`\n- `useSearchParams()` — reads query strings: `/search?q=react`\n- `useLocation()` — the full location object (pathname, search, hash)\n\n**Navigation in code:**\n- `useNavigate()` — programmatically go to a route: `navigate('/dashboard')`, `navigate(-1)` to go back\n\n**Nested routes + `Outlet`:**\nNest `<Route>` elements to share a layout. The parent renders `<Outlet />` where the child route should appear — great for dashboards with a persistent sidebar.",
    code: {
      language: 'tsx',
      snippet: `import {
  BrowserRouter, Routes, Route,
  Link, Outlet, useParams, useNavigate,
} from 'react-router-dom';

// Root — wrap the app in BrowserRouter
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>          {/* parent layout */}
          <Route index element={<Home />} />            {/* / */}
          <Route path="users" element={<UserList />} /> {/* /users */}
          <Route path="users/:id" element={<UserDetail />} /> {/* /users/42 */}
          <Route path="*" element={<NotFound />} />    {/* catch-all */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

// Persistent layout — Outlet renders whichever child route matched
function Layout() {
  return (
    <>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/users">Users</Link>
      </nav>
      <main>
        <Outlet /> {/* child route renders here */}
      </main>
    </>
  );
}

// Read a URL param
function UserDetail() {
  const { id } = useParams(); // /users/42 → id = '42'
  const navigate = useNavigate();

  return (
    <>
      <p>User ID: {id}</p>
      <button onClick={() => navigate(-1)}>Back</button>
    </>
  );
}`,
    },
  },

  {
    id: 'react-m7',
    category: 'React',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is component composition in React? How does the `children` prop work?',
    answer:
      "**Composition** is the React pattern for building complex UIs from simple, reusable pieces — instead of inheritance. In React, **favor composition over inheritance** (the React docs say this explicitly; class-based inheritance for components is an anti-pattern).\n\n**The `children` prop** — any JSX nested between a component's opening and closing tags is automatically passed as `props.children`. This lets you build generic wrapper/container components without knowing what goes inside them.\n\n**Why it matters:**\n- Avoids prop drilling for layout concerns\n- Makes wrapper components (modal, card, sidebar) truly generic\n- Enables the **slot pattern** — pass multiple named sections as props (like named slots in Vue/Angular)\n\n**Common composition patterns:**\n1. **Containment** — wrapper components that render `children` (Modal, Card, Panel)\n2. **Specialization** — a generic component configured via props into a specific one\n3. **Render props / function as children** — pass a function as `children` for inversion of control (less common since hooks)\n4. **Compound components** — a parent + tightly coupled children (Tabs + Tab, Select + Option)",
    code: {
      language: 'tsx',
      snippet: `// 1. Containment — generic wrapper via children
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div className="card-body">{children}</div>
    </div>
  );
}

// Caller controls what goes inside — Card doesn't need to know
<Card title="User Profile">
  <Avatar src={user.avatarUrl} />
  <p>{user.bio}</p>
  <FollowButton userId={user.id} />
</Card>

// 2. Named slots — pass multiple sections as props
function Dialog({
  header,
  body,
  footer,
}: {
  header: React.ReactNode;
  body: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div role="dialog">
      <header>{header}</header>
      <section>{body}</section>
      <footer>{footer}</footer>
    </div>
  );
}

<Dialog
  header={<h1>Confirm deletion</h1>}
  body={<p>This action cannot be undone.</p>}
  footer={<><button>Cancel</button><button>Delete</button></>}
/>`,
    },
  },

  // ─── React (Hard) ────────────────────────────────────────────────────────────

  {
    id: 'react-1',
    category: 'React',
    difficulty: 'hard',
    type: 'experience',
    question: 'How does React\'s reconciliation algorithm work? What is the role of Fiber?',
    answer:
      "**Reconciliation** is React's process for determining what changed between renders and applying the minimum DOM updates.\n\n**Old Stack reconciler (pre-React 16)**: recursive, synchronous, couldn't be interrupted. If a large tree was processing, the main thread was blocked — causing frame drops and jank.\n\n**Fiber (React 16+)**: a complete rewrite of the reconciler.\n- Each component instance becomes a **fiber node** — a plain object containing component type, props, state, effect list, and a link to parent/child/sibling fibers\n- Work is split into small units. React can **pause, abort, or resume** work between units, yielding control to the browser for higher-priority tasks (like user input)\n- Two phases:\n  1. **Render phase** (interruptible) — React walks the fiber tree, determines what changed, builds an effect list. This can be paused.\n  2. **Commit phase** (synchronous, cannot pause) — React applies all DOM mutations in one synchronous pass\n\n**Concurrent Mode** (React 18): exposes fiber's scheduling capability to userland. `useTransition` marks state updates as non-urgent so they can be interrupted by higher-priority updates (e.g. typing into an input while a slow list renders).",
    code: {
      language: 'tsx',
      snippet: `import { useState, useTransition, Suspense, lazy } from 'react';

const HeavyList = lazy(() => import('./HeavyList'));

function Search() {
  const [query, setQuery]     = useState('');
  const [deferredQ, setDeferred] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value); // urgent — input stays responsive

    startTransition(() => {
      setDeferred(e.target.value); // non-urgent — can be interrupted
    });
  }

  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending && <span>Updating...</span>}
      <Suspense fallback={<p>Loading results...</p>}>
        <HeavyList query={deferredQ} />
      </Suspense>
    </>
  );
}`,
    },
  },

  {
    id: 'react-2',
    category: 'React',
    difficulty: 'hard',
    type: 'experience',
    question: 'What are Error Boundaries? How do you implement one and when should you use them?',
    answer:
      "**Error Boundaries** catch JavaScript errors anywhere in a component tree during rendering, in lifecycle methods, and in constructors. They prevent the entire app from crashing when a subtree throws.\n\n**Key limitation**: Error Boundaries must be **class components** — there is no functional hook equivalent yet (as of React 18). They do NOT catch: errors in event handlers (use try/catch), async errors (use error state), or errors in the boundary itself.\n\n**When to use**: wrap sections of the UI that load dynamic data or render complex widgets that could throw. A common pattern: one top-level boundary for global fallback + finer-grained boundaries around unstable features.",
    code: {
      language: 'tsx',
      snippet: `import { Component, type ReactNode } from 'react';

// Error Boundary must be a class component
class ErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    // log to Sentry, Datadog, etc.
    console.error('Caught by boundary:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

// Usage: wrap risky subtrees
function App() {
  return (
    <ErrorBoundary fallback={<p>Something went wrong. Please refresh.</p>}>
      <UserDashboard />
    </ErrorBoundary>
  );
}

// For functional components: use 'react-error-boundary' package
import { ErrorBoundary } from 'react-error-boundary';
<ErrorBoundary FallbackComponent={({ error }) => <p>{error.message}</p>}>
  <RiskyComponent />
</ErrorBoundary>`,
    },
  },

  {
    id: 'react-3',
    category: 'React',
    difficulty: 'hard',
    type: 'experience',
    question: 'How do you optimize a React app with heavy re-renders? Walk through your approach.',
    answer:
      "**Always profile before optimizing.** Use React DevTools Profiler to find which components are re-rendering unnecessarily and why.\n\n**Common causes and fixes**:\n\n**1. Object/function references changing on every render**\nA new object `{}` or arrow function `() => {}` is a new reference each render — breaking `React.memo` comparisons. Fix: `useMemo` for objects, `useCallback` for functions.\n\n**2. Context causing all consumers to re-render**\nEvery context consumer re-renders when the Provider value changes — even if they only use part of it. Fix: split contexts (AuthContext, ThemeContext), or use a selector library like `use-context-selector`.\n\n**3. Large lists**\nRendering thousands of DOM nodes is slow. Fix: **virtualization** with `react-window` or `react-virtual` — renders only the items visible in the viewport.\n\n**4. Heavy synchronous work on render**\nExpensive filtering/sorting on every render. Fix: `useMemo` with proper deps.\n\n**5. Unnecessary component tree depth**\nDeep trees mean more reconciliation work. Keep component trees shallow where possible.\n\n**6. Code splitting**\nBundle size affects initial load. Use `React.lazy` + `Suspense` to split heavy routes.",
    code: {
      language: 'tsx',
      snippet: `import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

// Virtualize a 100k-row list — renders only ~20 rows at a time
function VirtualList({ items }: { items: string[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40, // px per row
  });

  return (
    <div ref={parentRef} style={{ height: '500px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() + 'px', position: 'relative' }}>
        {virtualizer.getVirtualItems().map(row => (
          <div
            key={row.key}
            style={{ position: 'absolute', top: row.start, height: row.size + 'px' }}
          >
            {items[row.index]}
          </div>
        ))}
      </div>
    </div>
  );
}

// Code splitting — split heavy routes
const Dashboard = React.lazy(() => import('./Dashboard'));
<Suspense fallback={<Spinner />}><Dashboard /></Suspense>`,
    },
  },
];
