import type { Flashcard } from '../types';

export const dataStructuresCards: Flashcard[] = [

  // ─── Data Structures (Senior) ────────────────────────────────────────────────

  {
    id: 'ds-1',
    category: 'Data Structures',
    difficulty: 'hard',
    question: 'When should you use a Heap (priority queue) vs a sorted array vs a BST? What are the time complexity trade-offs?',
    answer:
      '| Operation | Sorted Array | Heap | Balanced BST (e.g. AVL/RB) |\n|---|---|---|---|\n| Insert | O(n) | O(log n) | O(log n) |\n| Get min/max | O(1) | O(1) | O(log n) |\n| Delete min/max | O(n) | O(log n) | O(log n) |\n| Search arbitrary | O(log n) | O(n) | O(log n) |\n| In-order traversal | O(n) | O(n log n) | O(n) |\n\n**Choose Heap** when you only need the min/max repeatedly (e.g. Dijkstra\'s shortest path, task scheduler, median maintenance with two heaps).\n**Choose Sorted Array** when data is mostly read-only and binary search suffices.\n**Choose BST** when you need ordered iteration, range queries, or arbitrary key lookups alongside priority access.',
    code: {
      language: 'typescript',
      snippet: `// Min-heap for a task scheduler (smallest deadline first)
// JavaScript has no built-in heap; common interview solution:
class MinHeap<T> {
  private heap: T[] = [];
  constructor(private compare: (a: T, b: T) => number) {}

  push(val: T) {
    this.heap.push(val);
    this.bubbleUp(this.heap.length - 1);
  }
  pop(): T | undefined {
    const top = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) { this.heap[0] = last; this.sinkDown(0); }
    return top;
  }
  peek() { return this.heap[0]; }
  size() { return this.heap.length; }

  private bubbleUp(i: number) {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.compare(this.heap[p], this.heap[i]) <= 0) break;
      [this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]];
      i = p;
    }
  }
  private sinkDown(i: number) {
    const n = this.heap.length;
    while (true) {
      let min = i, l = 2*i+1, r = 2*i+2;
      if (l < n && this.compare(this.heap[l], this.heap[min]) < 0) min = l;
      if (r < n && this.compare(this.heap[r], this.heap[min]) < 0) min = r;
      if (min === i) break;
      [this.heap[min], this.heap[i]] = [this.heap[i], this.heap[min]];
      i = min;
    }
  }
}`,
    },
  },

  {
    id: 'ds-2',
    category: 'Data Structures',
    difficulty: 'hard',
    question: 'What is amortised O(1) and how does a dynamic array (like JavaScript\'s `Array`) achieve it for `push`?',
    answer:
      'Amortised analysis averages the cost of an operation over a sequence of operations. A single operation may be expensive, but the average across N operations is cheap.\n\n**Dynamic array doubling**: when the array is full and `push` is called, it allocates a new array with **2× capacity** and copies all elements (O(n) for that one push). But this expensive copy only happens when capacity is a power-of-2 boundary.\n\n**Amortised cost analysis**: starting from empty, after N pushes, total copies ≤ 1 + 2 + 4 + ... + N = 2N. So N pushes cost 2N total copies → O(1) amortised per push.\n\nV8\'s `Array.push` uses a similar strategy (SMI arrays, packed arrays, backing store doubling). The same principle applies to hash map resizing: when load factor exceeds a threshold, rehash into a 2× table.',
    code: {
      language: 'typescript',
      snippet: `// Simplified dynamic array to illustrate the amortised argument
class DynamicArray<T> {
  private data: T[] = new Array(1);
  private _size = 0;
  private capacity = 1;

  push(item: T): void {
    if (this._size === this.capacity) {
      // O(n) resize – but happens rarely
      this.capacity *= 2;
      const next = new Array<T>(this.capacity);
      for (let i = 0; i < this._size; i++) next[i] = this.data[i];
      this.data = next;
    }
    this.data[this._size++] = item; // O(1) most of the time
  }

  get(i: number): T { return this.data[i]; }
  get size()        { return this._size; }
}

// After 8 pushes: copies at i=1(1), i=2(2), i=4(4) = 7 copies total
// 8 pushes / 7 copies ≈ O(1) amortised`,
    },
  },

  {
    id: 'ds-3',
    category: 'Data Structures',
    difficulty: 'hard',
    question: 'What is a trie (prefix tree) and when would you use one in a backend system?',
    answer:
      'A trie is a tree where each node represents a character, and paths from root to leaf spell out keys. All keys sharing a prefix share the same path in the tree.\n\n**Time complexity**: insert, search, and prefix search all run in O(m) where m is the key length — independent of the number of keys (unlike O(m log n) for a BST).\n\n**Backend use cases**:\n- **Autocomplete / search suggestions**: retrieve all words with a given prefix in O(m + k) where k = results count\n- **IP routing tables**: longest-prefix matching in routers\n- **Rate limiting by prefix**: block entire IP ranges (`192.168.*`)\n- **URL routing**: HTTP router prefix matching\n- **Dictionary / spell check**: O(m) word lookup\n\n**Trade-off**: high memory usage when keys share few prefixes (sparse trie). A **compressed trie** (radix tree) collapses single-child chains to reduce memory.',
    code: {
      language: 'typescript',
      snippet: `class TrieNode {
  children = new Map<string, TrieNode>();
  isEnd = false;
}

class Trie {
  root = new TrieNode();

  insert(word: string) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
      node = node.children.get(ch)!;
    }
    node.isEnd = true;
  }

  // Returns all words with the given prefix – O(prefix + results)
  suggest(prefix: string): string[] {
    let node = this.root;
    for (const ch of prefix) {
      if (!node.children.has(ch)) return [];
      node = node.children.get(ch)!;
    }
    const results: string[] = [];
    const dfs = (n: TrieNode, current: string) => {
      if (n.isEnd) results.push(current);
      for (const [ch, child] of n.children) dfs(child, current + ch);
    };
    dfs(node, prefix);
    return results;
  }
}`,
    },
  },

  // ─── Data Structures (Easy) ──────────────────────────────────────────────────

  {
    id: 'ds-e1',
    category: 'Data Structures',
    difficulty: 'easy',
    question: 'What is the difference between an array and a linked list? When would you choose one over the other?',
    answer:
      '| | Array | Linked List |\n|---|---|---|\n| Memory | Contiguous block | Nodes scattered in heap |\n| Access by index | O(1) | O(n) — traverse from head |\n| Insert/delete at start | O(n) — shift all elements | O(1) — update head pointer |\n| Insert/delete at end | O(1) amortised | O(n) without tail pointer |\n| Cache performance | Excellent (spatial locality) | Poor (pointer chasing) |\n\n**Choose array**: random access by index is frequent, memory is a concern, data size is known upfront.\n\n**Choose linked list**: frequent insertions/deletions at the head or middle, and random access is rare.\n\n**In practice (JavaScript)**: `Array` is a dynamic array. You rarely need a hand-rolled linked list — but understanding the trade-offs helps in system design and algorithm questions.',
    code: {
      language: 'typescript',
      snippet: `class ListNode<T> {
  constructor(public val: T, public next: ListNode<T> | null = null) {}
}

class LinkedList<T> {
  head: ListNode<T> | null = null;

  prepend(val: T) {               // O(1) — advantage over array
    this.head = new ListNode(val, this.head);
  }

  get(index: number): T | null {  // O(n) — disadvantage vs array
    let node = this.head;
    for (let i = 0; i < index && node; i++) node = node.next;
    return node?.val ?? null;
  }
}`,
    },
  },

  {
    id: 'ds-e2',
    category: 'Data Structures',
    difficulty: 'easy',
    question: 'What is a stack and a queue? Give a real-world example of each.',
    answer:
      '**Stack — LIFO (Last In, First Out)**: the last element added is the first one removed.\n- Operations: `push` (add to top), `pop` (remove from top), `peek` (view top) — all O(1)\n- Examples: browser back button, function call stack, undo/redo, bracket matching in a compiler\n\n**Queue — FIFO (First In, First Out)**: the first element added is the first one removed.\n- Operations: `enqueue` (add to back), `dequeue` (remove from front), `peek` — O(1) with a deque\n- Examples: task/message queue (jobs processed in arrival order), print spooler, BFS traversal\n\n**In JavaScript**: `Array.push` / `Array.pop` implement a stack in O(1). `Array.shift()` for a queue is O(n) — use a linked-list-based deque for large queues.',
    code: {
      language: 'typescript',
      snippet: `// Stack — array push/pop are O(1) amortised
const stack: number[] = [];
stack.push(1); stack.push(2); stack.push(3);
console.log(stack.pop()); // 3 — LIFO

// Queue — shift() is O(n); fine for small sizes
class Queue<T> {
  private data: T[] = [];
  enqueue(item: T) { this.data.push(item); }
  dequeue(): T | undefined { return this.data.shift(); }
  peek(): T | undefined { return this.data[0]; }
  get size() { return this.data.length; }
}

const q = new Queue<string>();
q.enqueue('a'); q.enqueue('b');
console.log(q.dequeue()); // 'a' — FIFO`,
    },
  },

  // ─── Data Structures (Medium) ────────────────────────────────────────────────

  {
    id: 'ds-m1',
    category: 'Data Structures',
    difficulty: 'medium',
    question: 'What is a hash table? How does it handle collisions?',
    answer:
      'A hash table maps **keys to values** in O(1) average time using a **hash function** that converts the key to an array index.\n\n**How it works**:\n1. `index = hash(key) % capacity`\n2. Store value at `array[index]`\n3. Lookup: compute same index, return value\n\n**Collision**: two keys hash to the same index. Handled by:\n\n**Chaining**: each bucket holds a linked list of (key, value) pairs. Worst case O(n) if all keys collide.\n\n**Open addressing** (linear probing): on collision, scan to the next empty slot. Better cache locality but degrades at high load factors.\n\n**Load factor**: `entries / capacity`. When it exceeds ~0.7, the table resizes (doubles) and all entries are rehashed — O(n) amortised.\n\n**JavaScript `Map`**: uses a hash table internally. Prefer `Map` over plain objects when key order matters or keys are non-strings.',
    code: {
      language: 'typescript',
      snippet: `class HashMap<K, V> {
  private buckets: Array<[K, V][]>;
  constructor(private capacity = 16) {
    this.buckets = Array.from({ length: capacity }, () => []);
  }

  private hash(key: K): number {
    const str = String(key);
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % this.capacity;
    return h;
  }

  set(key: K, val: V) {
    const b = this.buckets[this.hash(key)];
    const pair = b.find(([k]) => k === key);
    if (pair) pair[1] = val;
    else b.push([key, val]);
  }

  get(key: K): V | undefined {
    return this.buckets[this.hash(key)].find(([k]) => k === key)?.[1];
  }
}`,
    },
  },

  {
    id: 'ds-m2',
    category: 'Data Structures',
    difficulty: 'medium',
    question: 'What is Big O notation? List the most common time complexities with examples.',
    answer:
      "Big O notation describes how an algorithm's **time or space requirements grow** as input size `n` increases. It expresses the **worst-case upper bound**, ignoring constants and lower-order terms.\n\n| Complexity | Name | Example |\n|---|---|---|\n| O(1) | Constant | Array index lookup, hash map get |\n| O(log n) | Logarithmic | Binary search, balanced BST lookup |\n| O(n) | Linear | Array scan, linked list traversal |\n| O(n log n) | Log-linear | Merge sort, heap sort |\n| O(n²) | Quadratic | Bubble sort, nested loops over an array |\n| O(2ⁿ) | Exponential | Recursive Fibonacci without memoisation |\n\n**Rule of thumb for interviews**: O(n log n) is acceptable for `n < 10⁷`. O(n²) is too slow for `n > 10⁴`.",
    code: {
      language: 'typescript',
      snippet: `// O(1) — constant
const first = arr[0];

// O(log n) — binary search
function binarySearch(arr: number[], target: number): number {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) lo = mid + 1; else hi = mid - 1;
  }
  return -1;
}

// O(n²) — avoid on large inputs
function hasDuplicate(arr: number[]): boolean {
  for (let i = 0; i < arr.length; i++)
    for (let j = i + 1; j < arr.length; j++)
      if (arr[i] === arr[j]) return true;
  return false;
}

// Better: O(n) with a Set
const hasDuplicateFast = (arr: number[]) => arr.length !== new Set(arr).size;`,
    },
  },
];
