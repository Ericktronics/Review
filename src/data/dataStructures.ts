import type { Flashcard } from '../types';

export const dataStructuresCards: Flashcard[] = [

  // ─── Data Structures (Senior) ────────────────────────────────────────────────

  {
    id: 'ds-1',
    category: 'Data Structures',
    difficulty: 'hard',
    type: 'experience',
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
    type: 'experience',
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
    type: 'experience',
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
    type: 'basics',
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
    type: 'basics',
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
    id: 'ds-e3',
    category: 'Data Structures',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is a binary tree? What is a binary search tree (BST)?',
    answer:
      "**Binary tree**: a tree data structure where each node has **at most two children**, called the left child and right child. There are no ordering rules.\n\n**Binary Search Tree (BST)**: a binary tree with an ordering property:\n- All nodes in the **left subtree** have values **less than** the current node\n- All nodes in the **right subtree** have values **greater than** the current node\n- This applies recursively to every node\n\n**Why BST is useful**: the ordering property enables **efficient search, insertion, and deletion in O(log n)** on average — by eliminating half the remaining tree at each step (like binary search on an array).\n\n**Worst case**: if you insert values in sorted order (1, 2, 3, 4, 5), the BST degenerates into a linked list — O(n) for all operations. **Self-balancing BSTs** (AVL tree, Red-Black tree) prevent this by rebalancing after insertions.\n\n**Common interview operations**: search, insert, delete, in-order traversal (gives sorted order), find min/max.",
    code: {
      language: 'typescript',
      snippet: `class BSTNode {
  constructor(
    public val: number,
    public left: BSTNode | null = null,
    public right: BSTNode | null = null,
  ) {}
}

class BST {
  root: BSTNode | null = null;

  insert(val: number) {
    const node = new BSTNode(val);
    if (!this.root) { this.root = node; return; }
    let curr = this.root;
    while (true) {
      if (val < curr.val) {
        if (!curr.left)  { curr.left  = node; return; }
        curr = curr.left;
      } else {
        if (!curr.right) { curr.right = node; return; }
        curr = curr.right;
      }
    }
  }

  // In-order traversal gives sorted output
  inOrder(node = this.root, result: number[] = []): number[] {
    if (!node) return result;
    this.inOrder(node.left, result);
    result.push(node.val);
    this.inOrder(node.right, result);
    return result;
  }
}

const bst = new BST();
[5, 3, 7, 1, 4].forEach(v => bst.insert(v));
bst.inOrder(); // [1, 3, 4, 5, 7] — sorted!`,
    },
  },

  {
    id: 'ds-e4',
    category: 'Data Structures',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is recursion? Give an example.',
    answer:
      "**Recursion** is when a function **calls itself** to solve a smaller version of the same problem. It continues until it reaches a **base case** that doesn't require further recursion.\n\n**Two required components**:\n1. **Base case** — the condition that stops the recursion (prevents infinite loop)\n2. **Recursive case** — calls the function with a smaller/simpler input\n\n**How it works mentally**: think about what the function does for one step, and trust that the recursive call handles the rest correctly.\n\n**When to use recursion**:\n- Tree traversal (file systems, DOM, BST)\n- Divide-and-conquer algorithms (merge sort, quick sort)\n- Backtracking problems (mazes, sudoku)\n- Problems with a naturally recursive structure\n\n**Caution**: each recursive call adds a frame to the **call stack**. Very deep recursion causes a **stack overflow**. Iterative solutions or tail recursion optimisation avoid this.\n\n**Memoize** expensive recursive calls to avoid recomputing the same subproblems.",
    code: {
      language: 'typescript',
      snippet: `// Factorial: n! = n * (n-1)!
function factorial(n: number): number {
  if (n <= 1) return 1;           // base case
  return n * factorial(n - 1);   // recursive case
}
factorial(5); // 5 * 4 * 3 * 2 * 1 = 120

// Fibonacci (naive — exponential without memoization)
function fib(n: number): number {
  if (n <= 1) return n;           // base cases: fib(0)=0, fib(1)=1
  return fib(n - 1) + fib(n - 2);
}

// Tree traversal — naturally recursive
function sumTree(node: TreeNode | null): number {
  if (!node) return 0;            // base case: empty node
  return node.val + sumTree(node.left) + sumTree(node.right);
}

// File system traversal
function getAllFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap(e =>
    e.isDirectory()
      ? getAllFiles(path.join(dir, e.name)) // recurse into subdirectory
      : [path.join(dir, e.name)],
  );
}`,
    },
  },

  {
    id: 'ds-e5',
    category: 'Data Structures',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is the difference between depth-first search (DFS) and breadth-first search (BFS)?',
    answer:
      "Both are algorithms for **traversing a graph or tree**, visiting every node.\n\n**Depth-First Search (DFS)**: go as **deep as possible** along one path before backtracking. Uses a **stack** (or the call stack via recursion).\n- Explores one complete path before trying alternatives\n- Implementations: preorder, inorder, postorder tree traversal\n- Good for: detecting cycles, topological sort, solving mazes, finding connected components\n\n**Breadth-First Search (BFS)**: explore all nodes at the **current depth level** before going deeper. Uses a **queue**.\n- Explores layer by layer\n- Good for: **shortest path** in an unweighted graph, level-order tree traversal, finding nodes closest to a source\n\n**Key difference**:\n| | DFS | BFS |\n|---|---|---|\n| Data structure | Stack (LIFO) | Queue (FIFO) |\n| Memory | O(height) | O(width) |\n| Shortest path | No | Yes (unweighted) |\n| Implementation | Recursive or iterative | Iterative (queue) |",
    code: {
      language: 'typescript',
      snippet: `// DFS — recursive (uses call stack)
function dfs(node: TreeNode | null, result: number[] = []): number[] {
  if (!node) return result;
  result.push(node.val);       // preorder: visit before children
  dfs(node.left, result);
  dfs(node.right, result);
  return result;
}

// BFS — iterative with a queue
function bfs(root: TreeNode | null): number[][] {
  if (!root) return [];
  const result: number[][] = [];
  const queue: TreeNode[] = [root];

  while (queue.length > 0) {
    const levelSize = queue.length;
    const level: number[] = [];

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()!;
      level.push(node.val);
      if (node.left)  queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(level);
  }
  return result; // [[root], [level2...], [level3...]]
}`,
    },
  },

  {
    id: 'ds-m3',
    category: 'Data Structures',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is dynamic programming? How does memoization help?',
    answer:
      "**Dynamic programming (DP)** is an optimization technique for problems that can be broken down into **overlapping subproblems** with **optimal substructure** (the optimal solution to the whole problem is built from optimal solutions to subproblems).\n\n**Two approaches**:\n\n**Top-down with memoization**: write the recursive solution naturally, then cache results of subproblems. On a recursive call, check the cache first — if the answer is already computed, return it immediately.\n\n**Bottom-up (tabulation)**: solve smaller subproblems first, store results in a table, build up to the final answer. No recursion — avoids call stack overhead.\n\n**How memoization helps**: the naive recursive Fibonacci computes `fib(n)` in O(2ⁿ) because it recomputes the same values many times. With memoization, each unique `n` is computed once — O(n) time and space.\n\n**Classic DP problems**: Fibonacci, coin change, longest common subsequence, knapsack, edit distance, shortest paths (Bellman-Ford).",
    code: {
      language: 'typescript',
      snippet: `// Fibonacci — top-down DP with memoization
function fibMemo(n: number, memo = new Map<number, number>()): number {
  if (n <= 1) return n;
  if (memo.has(n)) return memo.get(n)!; // cache hit
  const result = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  memo.set(n, result);                  // cache result
  return result;
}
fibMemo(50); // instant; naive recursion would take ~2^50 operations

// Fibonacci — bottom-up DP (tabulation)
function fibDP(n: number): number {
  if (n <= 1) return n;
  const dp = [0, 1];
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp[n];
}

// Coin change: minimum coins to make amount
function coinChange(coins: number[], amount: number): number {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i) dp[i] = Math.min(dp[i], dp[i - coin] + 1);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
    },
  },

  {
    id: 'ds-m4',
    category: 'Data Structures',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is a graph data structure? What are its representations?',
    answer:
      "A **graph** is a collection of **nodes (vertices)** connected by **edges**. Unlike a tree, a graph can have cycles and multiple paths between nodes.\n\n**Types**:\n- **Directed** (digraph): edges have a direction (A → B doesn't mean B → A). Example: Twitter follows.\n- **Undirected**: edges have no direction (A — B means both can reach each other). Example: Facebook friends.\n- **Weighted**: edges have a cost (distance, latency). Used in shortest-path algorithms.\n\n**Representations**:\n\n**Adjacency List** (most common): a Map/object where each node maps to an array of its neighbors.\n- Space: O(V + E) — efficient for sparse graphs\n- Check if edge exists: O(degree of node)\n\n**Adjacency Matrix**: a 2D array where `matrix[i][j] = 1` if edge exists.\n- Space: O(V²) — wasteful for sparse graphs\n- Check if edge exists: O(1)\n\n**Real-world uses**: social networks, routing (Dijkstra, A*), dependency graphs, recommendation engines.",
    code: {
      language: 'typescript',
      snippet: `// Adjacency list — most common representation
class Graph {
  private adj = new Map<string, string[]>();

  addEdge(u: string, v: string, directed = false) {
    if (!this.adj.has(u)) this.adj.set(u, []);
    if (!this.adj.has(v)) this.adj.set(v, []);
    this.adj.get(u)!.push(v);
    if (!directed) this.adj.get(v)!.push(u);
  }

  neighbors(node: string): string[] {
    return this.adj.get(node) ?? [];
  }

  // BFS — shortest path (unweighted)
  shortestPath(start: string, end: string): string[] | null {
    const queue: string[][] = [[start]];
    const visited = new Set([start]);
    while (queue.length) {
      const path = queue.shift()!;
      const node = path[path.length - 1];
      if (node === end) return path;
      for (const neighbor of this.neighbors(node)) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push([...path, neighbor]);
        }
      }
    }
    return null;
  }
}`,
    },
  },

  {
    id: 'ds-m1',
    category: 'Data Structures',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is a hash table? How does it handle collisions?',
    answer:
      "**A hash table stores key-value pairs and delivers O(1) average-time lookup, insertion, and deletion** — regardless of how many items it holds. This is why JavaScript's `Map` and `{}` objects are so fast.\n\n**How it works**:\n1. Apply a **hash function** to the key: `index = hash(key) % capacity`\n2. Store the value at `array[index]`\n3. To look up a key, compute the same index and read `array[index]`\n\n**Collision**: two different keys can produce the same index. This is normal and handled by:\n\n- **Chaining** — each bucket is a linked list of `(key, value)` pairs. Multiple entries at the same index are chained together. Worst case O(n) if all keys collide (but a good hash function makes this extremely rare).\n- **Open addressing (linear probing)** — on collision, scan forward to the next empty slot. Better CPU cache performance but degrades badly at high fill ratios.\n\n**Load factor**: `entries / capacity`. When it exceeds ~0.7, the table **doubles its capacity and rehashes** all entries. This single operation is O(n) but happens rarely — so insertion is O(1) amortised.\n\n**Most common gotcha**: using a plain `{}` object as a map in JavaScript has subtle bugs — inherited prototype properties (`constructor`, `toString`) can collide with your keys. Always use `new Map()` for a proper hash map.\n\n**JavaScript `Map`** preserves insertion order, accepts any type as a key, and has `size` built-in — prefer it over `{}` for dynamic key-value storage.",
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
    type: 'basics',
    question: 'What is Big O notation? List the most common time complexities with examples.',
    answer:
      "**Big O notation describes how an algorithm's performance scales as the input size grows.** It answers the question: 'If I double the input, how much slower does this get?'\n\nIt expresses the **worst-case upper bound**, ignoring constants (we care about the shape of growth, not the exact milliseconds).\n\n| Complexity | Name | Description | Example |\n|---|---|---|---|\n| O(1) | Constant | Same speed regardless of input size | Array index lookup, hash map get |\n| O(log n) | Logarithmic | Halves the problem each step | Binary search, balanced BST lookup |\n| O(n) | Linear | Work grows proportionally to input | Scan an array, traverse a linked list |\n| O(n log n) | Log-linear | Common in efficient sorting | Merge sort, heap sort |\n| O(n²) | Quadratic | Every element compared to every other | Bubble sort, nested loops over an array |\n| O(2ⁿ) | Exponential | Doubles with each additional input | Recursive Fibonacci without memoization |\n\n**Practical rules of thumb**:\n- O(n log n) is acceptable for `n < 10⁷` (millions of items)\n- O(n²) becomes too slow around `n > 10⁴` (tens of thousands)\n- If your input is always small (< 100 items), O(n²) is fine — don't over-optimize\n\n**Most common interview gotcha**: two nested `for` loops over the same array = O(n²). If you can replace one loop with a hash map lookup (O(1)), you often get O(n) overall.",
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
