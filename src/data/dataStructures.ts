import type { Flashcard } from '../types';

export const dataStructuresCards: Flashcard[] = [

  // ─── Data Structures (Hard) ──────────────────────────────────────────────────

  {
    id: 'ds-1',
    category: 'Data Structures & Algorithms',
    difficulty: 'hard',
    type: 'experience',
    question: 'Kth Largest Element in an Array — LeetCode #215\n\nGiven an integer array nums and an integer k, return the kth largest element in the array. Note that it is the kth largest in sorted order, not the kth distinct element.\n\nExample 1:\nInput:  nums = [3,2,1,5,6,4], k = 2\nOutput: 5\n\nExample 2:\nInput:  nums = [3,2,3,1,2,4,5,5,6], k = 4\nOutput: 4\n\nConstraints: Must solve in better than O(n log n) — aim for O(n log k) or O(n) average.',
    answer:
      '**Intuition**: the kth largest is the minimum of the k largest elements. A min-heap of size k always holds the k largest values seen so far — its root is the answer.\n\n**Approach — Min-Heap O(n log k)**:\n1. Iterate through every number\n2. Push it onto a min-heap\n3. If heap size exceeds k, pop the minimum (discard values smaller than the k-th largest)\n4. After the loop, the heap root is the kth largest\n\n**Approach — Quickselect O(n) average**:\nPartition around a pivot (like quicksort). Only recurse into the partition that contains index n-k. Average O(n), worst O(n²).\n\n**Complexity**:\n- Min-heap: Time O(n log k) | Space O(k)\n- Quickselect: Time O(n) avg | Space O(1)\n\n**When to use each**: if k is small relative to n, the heap is simple and fast. Quickselect is optimal but trickier to implement correctly under pressure.',
    code: {
      language: 'javascript',
      snippet: `// Min-heap approach — O(n log k)
// JavaScript has no built-in heap; use a sorted approach for interviews
function findKthLargest(nums, k) {
  // Simple O(n log n) using sort — acceptable in many interviews
  return nums.sort((a, b) => b - a)[k - 1];
}

// Quickselect — O(n) average
function findKthLargestQS(nums, k) {
  const target = nums.length - k; // kth largest = (n-k)th smallest index

  function partition(lo, hi) {
    const pivot = nums[hi];
    let i = lo;
    for (let j = lo; j < hi; j++) {
      if (nums[j] <= pivot) [nums[i++], nums[j]] = [nums[j], nums[i]];
    }
    [nums[i], nums[hi]] = [nums[hi], nums[i]];
    return i;
  }

  function select(lo, hi) {
    const p = partition(lo, hi);
    if (p === target) return nums[p];
    return p < target ? select(p + 1, hi) : select(lo, p - 1);
  }

  return select(0, nums.length - 1);
}

console.log(findKthLargest([3,2,1,5,6,4], 2)); // 5
console.log(findKthLargest([3,2,3,1,2,4,5,5,6], 4)); // 4`,
    },
  },

  {
    id: 'ds-2',
    category: 'Data Structures & Algorithms',
    difficulty: 'hard',
    type: 'experience',
    question: 'Design HashMap — LeetCode #706\n\nDesign a HashMap without using any built-in hash table libraries. Implement the following operations:\n- put(key, value) — insert or update\n- get(key) — return value, or -1 if not found\n- remove(key) — remove the key if it exists\n\nExample:\nInput:  ["put",[1,1]], ["put",[2,2]], ["get",[1]], ["get",[3]], ["put",[2,1]], ["get",[2]], ["remove",[2]], ["get",[2]]\nOutput: [null, null, 1, -1, null, 1, null, -1]\n\nConstraints: 0 ≤ key, value ≤ 10⁶ | At most 10⁴ calls',
    answer:
      '**Intuition**: a hash map maps keys to array indices via a hash function. Multiple keys may hash to the same index (collision) — handle with chaining (each bucket is a linked list of key-value pairs).\n\n**Approach**:\n1. Allocate an array of `capacity` buckets (e.g. 1024)\n2. `hash(key) = key % capacity` → bucket index\n3. Each bucket stores a list of `[key, value]` pairs (chaining for collisions)\n4. `put`: find existing entry in bucket and update, or append new\n5. `get`: scan bucket for matching key\n6. `remove`: filter the matching entry out of the bucket\n\n**Load factor & resizing**: when entries/capacity > 0.7, double the capacity and rehash all entries. This keeps average O(1) per operation.\n\n**Complexity**: Time O(1) average, O(n) worst (all keys collide) | Space O(n)\n\n**Why not use `{}` as a map in JS**: prototype properties (`constructor`, `toString`) can collide with your keys — always use `new Map()` in production.',
    code: {
      language: 'javascript',
      snippet: `class MyHashMap {
  constructor() {
    this.capacity = 1024;
    this.buckets = Array.from({ length: this.capacity }, () => []);
  }

  _hash(key) {
    return key % this.capacity;
  }

  put(key, value) {
    const bucket = this.buckets[this._hash(key)];
    const pair = bucket.find(([k]) => k === key);
    if (pair) pair[1] = value;       // update existing
    else bucket.push([key, value]);  // insert new
  }

  get(key) {
    const pair = this.buckets[this._hash(key)].find(([k]) => k === key);
    return pair ? pair[1] : -1;
  }

  remove(key) {
    const idx = this._hash(key);
    this.buckets[idx] = this.buckets[idx].filter(([k]) => k !== key);
  }
}

const map = new MyHashMap();
map.put(1, 1);
map.put(2, 2);
console.log(map.get(1));    // 1
console.log(map.get(3));    // -1
map.put(2, 1);
console.log(map.get(2));    // 1
map.remove(2);
console.log(map.get(2));    // -1`,
    },
  },

  {
    id: 'ds-3',
    category: 'Data Structures & Algorithms',
    difficulty: 'hard',
    type: 'experience',
    question: 'Implement Trie (Prefix Tree) — LeetCode #208\n\nA trie is a tree where each node represents a character. Implement a Trie with:\n- insert(word) — insert a word\n- search(word) — return true if word is in the trie\n- startsWith(prefix) — return true if any word starts with prefix\n\nExample:\nInput:  insert("apple"), search("apple"), search("app"), startsWith("app"), insert("app"), search("app")\nOutput: [null, true, false, true, null, true]\n\nConstraints: 1 ≤ word.length ≤ 2000 | word and prefix consist of lowercase letters only',
    answer:
      '**Intuition**: all words sharing a prefix share the same path in the tree. This gives O(m) lookup where m = word length — independent of how many words are stored (vs O(m log n) for a sorted set).\n\n**Approach**:\n1. Each TrieNode has a `children` map (char → TrieNode) and an `isEnd` flag\n2. `insert`: walk the trie character by character, creating nodes as needed, set `isEnd = true` on the last node\n3. `search`: walk the trie, return false if any character is missing; return `node.isEnd` at the end\n4. `startsWith`: same as search, but return true regardless of `isEnd`\n\n**Complexity**: Time O(m) for all operations | Space O(m × n) total where n = number of words\n\n**Backend uses**: autocomplete suggestions, IP routing, URL prefix matching, spell check',
    code: {
      language: 'javascript',
      snippet: `class TrieNode {
  constructor() {
    this.children = new Map(); // char → TrieNode
    this.isEnd = false;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
      node = node.children.get(ch);
    }
    node.isEnd = true;
  }

  _walk(str) {
    let node = this.root;
    for (const ch of str) {
      if (!node.children.has(ch)) return null;
      node = node.children.get(ch);
    }
    return node;
  }

  search(word) {
    const node = this._walk(word);
    return node !== null && node.isEnd;
  }

  startsWith(prefix) {
    return this._walk(prefix) !== null;
  }
}

const trie = new Trie();
trie.insert('apple');
console.log(trie.search('apple'));     // true
console.log(trie.search('app'));       // false
console.log(trie.startsWith('app'));   // true
trie.insert('app');
console.log(trie.search('app'));       // true`,
    },
  },

  // ─── Data Structures (Easy) ──────────────────────────────────────────────────

  {
    id: 'ds-e1',
    category: 'Data Structures & Algorithms',
    difficulty: 'easy',
    type: 'basics',
    question: 'Reverse Linked List — LeetCode #206\n\nGiven the head of a singly linked list, reverse the list and return the reversed list.\n\nExample 1:\nInput:  1 → 2 → 3 → 4 → 5\nOutput: 5 → 4 → 3 → 2 → 1\n\nExample 2:\nInput:  1 → 2\nOutput: 2 → 1\n\nExample 3:\nInput:  []\nOutput: []\n\nConstraints: 0 ≤ number of nodes ≤ 5000 | -5000 ≤ Node.val ≤ 5000\nFollow-up: solve both iteratively and recursively.',
    answer:
      '**Intuition**: each node currently points forward. We need to make it point backward. Keep track of the previous node while moving forward — that is all we need.\n\n**Approach — Iterative O(1) space**:\n1. Start with `prev = null`, `curr = head`\n2. For each node: save `next = curr.next`, point `curr.next = prev`, advance `prev = curr`, `curr = next`\n3. When `curr` is null, `prev` is the new head\n\n**Approach — Recursive O(n) space (call stack)**:\n1. Base case: null or single node → return head\n2. Reverse the rest of the list recursively\n3. Make `head.next.next = head` and `head.next = null`\n\n**Complexity**:\n- Iterative: Time O(n) | Space O(1) ← preferred\n- Recursive: Time O(n) | Space O(n)\n\n**Why this matters**: pointer manipulation is the foundation of all linked list problems. Mastering the 3-pointer pattern (prev/curr/next) solves dozens of list problems.',
    code: {
      language: 'javascript',
      snippet: `// Iterative — O(1) space (preferred)
function reverseList(head) {
  let prev = null;
  let curr = head;

  while (curr !== null) {
    const next = curr.next; // save next before overwriting
    curr.next = prev;        // reverse the pointer
    prev = curr;             // advance prev
    curr = next;             // advance curr
  }

  return prev; // prev is the new head
}

// Recursive — O(n) space (call stack)
function reverseListRecursive(head) {
  if (!head || !head.next) return head;          // base case

  const newHead = reverseListRecursive(head.next); // reverse rest
  head.next.next = head; // make next node point back to current
  head.next = null;       // remove forward pointer
  return newHead;
}

// Helper to build a list from array for testing
function fromArray(arr) {
  let dummy = { val: 0, next: null }, curr = dummy;
  for (const v of arr) { curr.next = { val: v, next: null }; curr = curr.next; }
  return dummy.next;
}`,
    },
  },

  {
    id: 'ds-e2',
    category: 'Data Structures & Algorithms',
    difficulty: 'easy',
    type: 'basics',
    question: 'Valid Parentheses — LeetCode #20\n\nGiven a string s containing only \'(\', \')\', \'{\', \'}\', \'[\', \']\', determine if the input string is valid.\n\nA string is valid if:\n- Open brackets are closed by the same type of bracket\n- Open brackets are closed in the correct order\n- Every close bracket has a corresponding open bracket\n\nExample 1: Input: "()"       → Output: true\nExample 2: Input: "()[]{}"   → Output: true\nExample 3: Input: "(]"       → Output: false\nExample 4: Input: "([)]"     → Output: false\nExample 5: Input: "{[]}"     → Output: true\n\nConstraints: 1 ≤ s.length ≤ 10⁴',
    answer:
      '**Intuition**: a stack naturally handles nested ordering — the most recently opened bracket must be the next one closed (LIFO).\n\n**Approach**:\n1. Create a map of closing → opening bracket pairs\n2. Iterate each character:\n   - If it is an opening bracket (`(`, `{`, `[`) → push to stack\n   - If it is a closing bracket → pop from stack and check it matches the expected opening\n   - If the stack is empty when we try to pop, or the popped bracket doesn\'t match → return false\n3. Return true only if the stack is empty at the end (all brackets closed)\n\n**Complexity**: Time O(n) | Space O(n)\n\n**Common mistake**: not checking if the stack is empty before popping — causes an error on inputs like `"]"`',
    code: {
      language: 'javascript',
      snippet: `function isValid(s) {
  const stack = [];
  const match = { ')': '(', '}': '{', ']': '[' };

  for (const ch of s) {
    if (ch === '(' || ch === '{' || ch === '[') {
      stack.push(ch);               // opening bracket — push
    } else {
      if (stack.pop() !== match[ch]) return false; // mismatch or empty
    }
  }

  return stack.length === 0; // all brackets must be closed
}

console.log(isValid('()'));      // true
console.log(isValid('()[]{}')); // true
console.log(isValid('(]'));     // false
console.log(isValid('([)]'));   // false
console.log(isValid('{[]}'));   // true
console.log(isValid(']'));      // false (empty stack pop)`,
    },
  },

  {
    id: 'ds-e3',
    category: 'Data Structures & Algorithms',
    difficulty: 'easy',
    type: 'basics',
    question: 'Maximum Depth of Binary Tree — LeetCode #104\n\nGiven the root of a binary tree, return its maximum depth. Maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.\n\nExample 1:\nInput:  [3, 9, 20, null, null, 15, 7]\nOutput: 3\n\nExample 2:\nInput:  [1, null, 2]\nOutput: 2\n\nConstraints: 0 ≤ number of nodes ≤ 10⁴ | -100 ≤ Node.val ≤ 100',
    answer:
      '**Intuition**: the depth of any node is 1 + the maximum depth of its children. This is naturally recursive — each subtree is the same problem on a smaller input.\n\n**Approach — Recursive DFS**:\n1. Base case: `null` node → return 0\n2. Recursively compute depth of left and right subtrees\n3. Return `1 + Math.max(leftDepth, rightDepth)`\n\n**Approach — Iterative BFS (level-order)**:\n1. Use a queue starting with root\n2. For each level, process all nodes and enqueue their children\n3. Increment depth counter for each level\n\n**Complexity**:\n- DFS: Time O(n) | Space O(h) where h = height (O(log n) balanced, O(n) skewed)\n- BFS: Time O(n) | Space O(w) where w = max width\n\n**Which to choose**: DFS is simpler to write. BFS is better when you need level-by-level information.',
    code: {
      language: 'javascript',
      snippet: `// Recursive DFS — clean and simple
function maxDepth(root) {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}

// Iterative BFS
function maxDepthBFS(root) {
  if (!root) return 0;
  const queue = [root];
  let depth = 0;

  while (queue.length > 0) {
    const levelSize = queue.length;
    depth++;
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      if (node.left)  queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
  }
  return depth;
}

// Tree: [3, 9, 20, null, null, 15, 7]
//       3
//      / \
//     9   20
//        /  \
//       15   7
// maxDepth → 3`,
    },
  },

  {
    id: 'ds-e4',
    category: 'Data Structures & Algorithms',
    difficulty: 'easy',
    type: 'basics',
    question: 'Fibonacci Number — LeetCode #509\n\nThe Fibonacci sequence: F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2) for n > 1.\nGiven n, return F(n).\n\nExample 1: Input: 4  → Output: 3  (0, 1, 1, 2, 3)\nExample 2: Input: 10 → Output: 55\nExample 3: Input: 0  → Output: 0\n\nConstraints: 0 ≤ n ≤ 30\nFollow-up: what is the time complexity of each approach?',
    answer:
      '**Intuition**: naive recursion recomputes the same subproblems exponentially. Caching each result (memoization) reduces this to linear time.\n\n**Approach 1 — Naive Recursion**: O(2ⁿ) time. Computes fib(3) dozens of times for large n. Never use in production.\n\n**Approach 2 — Memoization (top-down DP)**: cache each fib(n) result on first compute. O(n) time, O(n) space.\n\n**Approach 3 — Iterative (bottom-up DP)**: compute from fib(0) up, only tracking the last two values. O(n) time, O(1) space — optimal.\n\n**Complexity comparison**:\n| Approach | Time | Space |\n|---|---|---|\n| Naive recursion | O(2ⁿ) | O(n) stack |\n| Memoization | O(n) | O(n) |\n| Iterative | O(n) | O(1) |\n\n**Key insight**: any problem where fib(n) depends on fib(n-1) and fib(n-2) is dynamic programming. This pattern appears in climbing stairs, min-cost path, and many others.',
    code: {
      language: 'javascript',
      snippet: `// Approach 1: Naive recursion — O(2^n), DO NOT use for large n
function fibNaive(n) {
  if (n <= 1) return n;
  return fibNaive(n - 1) + fibNaive(n - 2);
}

// Approach 2: Memoization — O(n) time, O(n) space
function fibMemo(n, memo = new Map()) {
  if (n <= 1) return n;
  if (memo.has(n)) return memo.get(n);
  const result = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  memo.set(n, result);
  return result;
}

// Approach 3: Iterative DP — O(n) time, O(1) space (optimal)
function fib(n) {
  if (n <= 1) return n;
  let prev = 0, curr = 1;
  for (let i = 2; i <= n; i++) {
    [prev, curr] = [curr, prev + curr];
  }
  return curr;
}

console.log(fib(0));  // 0
console.log(fib(1));  // 1
console.log(fib(4));  // 3
console.log(fib(10)); // 55`,
    },
  },

  {
    id: 'ds-e5',
    category: 'Data Structures & Algorithms',
    difficulty: 'easy',
    type: 'basics',
    question: 'Flood Fill — LeetCode #733\n\nGiven an m × n image grid of integers, a starting pixel (sr, sc), and a new color, perform a flood fill.\n\nFlood fill: change the color of the starting pixel and all 4-directionally connected pixels that share the same original color, then do the same for all newly changed pixels (recursively).\n\nExample:\nInput:  image = [[1,1,1],[1,1,0],[1,0,1]], sr = 1, sc = 1, color = 2\nOutput: [[2,2,2],[2,2,0],[2,0,1]]\n\nConstraints:\n- m == image.length, n == image[i].length\n- 1 ≤ m, n ≤ 50 | 0 ≤ image[i][j] ≤ 65535',
    answer:
      '**Intuition**: this is DFS/BFS on a grid. Starting from (sr, sc), spread in 4 directions to all connected cells that share the original color.\n\n**Approach — DFS**:\n1. Record the original color at (sr, sc)\n2. If original color already equals new color → return early (prevents infinite loop)\n3. Change current cell to new color (mark visited)\n4. Recursively DFS all 4 valid neighbors that have the original color\n\n**Approach — BFS (queue)**: same logic but iterative with a queue. Useful if the grid is huge and recursion depth would overflow the stack.\n\n**Complexity**: Time O(m × n) | Space O(m × n) for the recursion stack\n\n**Common mistake**: not checking if `startColor === color` before starting — causes infinite recursion because you immediately re-visit cells you just changed.',
    code: {
      language: 'javascript',
      snippet: `function floodFill(image, sr, sc, color) {
  const startColor = image[sr][sc];
  if (startColor === color) return image; // avoid infinite loop

  const rows = image.length, cols = image[0].length;
  const dirs = [[0,1],[0,-1],[1,0],[-1,0]]; // 4 directions

  function dfs(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return; // out of bounds
    if (image[r][c] !== startColor) return;               // wrong color

    image[r][c] = color; // fill

    for (const [dr, dc] of dirs) dfs(r + dr, c + dc);
  }

  dfs(sr, sc);
  return image;
}

const image = [[1,1,1],[1,1,0],[1,0,1]];
console.log(floodFill(image, 1, 1, 2));
// [[2,2,2],
//  [2,2,0],
//  [2,0,1]]`,
    },
  },

  {
    id: 'ds-e6',
    category: 'Data Structures & Algorithms',
    difficulty: 'easy',
    type: 'basics',
    question: 'Fizz Buzz — LeetCode #412\n\nGiven an integer n, return a string array answer where:\n- answer[i] == "FizzBuzz" if i is divisible by 3 and 5\n- answer[i] == "Fizz" if i is divisible by 3\n- answer[i] == "Buzz" if i is divisible by 5\n- answer[i] == i (as a string) otherwise\n\nNote: i starts at 1, not 0.\n\nExample 1: Input: 3  → Output: ["1","2","Fizz"]\nExample 2: Input: 5  → Output: ["1","2","Fizz","4","Buzz"]\nExample 3: Input: 15 → Output: ["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]\n\nConstraints: 1 ≤ n ≤ 10⁴',
    answer:
      '**Intuition**: check divisibility with `%`. The only trick is order — check 15 (both) first, otherwise a number like 15 hits the `% 3` check and returns "Fizz" before ever reaching the combined case.\n\n**Approach**:\n1. Loop i from 1 to n\n2. Check `i % 15 === 0` first → "FizzBuzz"\n3. Then `i % 3 === 0` → "Fizz"\n4. Then `i % 5 === 0` → "Buzz"\n5. Else → `String(i)`\n\n**Complexity**: Time O(n) | Space O(n)\n\n**Common mistake**: using separate `if` blocks instead of `else if` — a multiple of 15 would then push "Fizz" and "Buzz" as separate entries instead of "FizzBuzz".',
    code: {
      language: 'javascript',
      snippet: `function fizzBuzz(n) {
  const result = [];
  for (let i = 1; i <= n; i++) {
    if      (i % 15 === 0) result.push('FizzBuzz'); // check BOTH first
    else if (i % 3  === 0) result.push('Fizz');
    else if (i % 5  === 0) result.push('Buzz');
    else                   result.push(String(i));
  }
  return result;
}

console.log(fizzBuzz(15));
// ['1','2','Fizz','4','Buzz','Fizz','7','8','Fizz',
//  'Buzz','11','Fizz','13','14','FizzBuzz']`,
    },
  },

  {
    id: 'ds-e7',
    category: 'Data Structures & Algorithms',
    difficulty: 'easy',
    type: 'basics',
    question: 'Valid Palindrome — LeetCode #125\n\nA phrase is a palindrome if, after converting all uppercase letters to lowercase and removing all non-alphanumeric characters, it reads the same forward and backward.\n\nGiven a string s, return true if it is a palindrome, or false otherwise.\n\nExample 1:\nInput:  "A man, a plan, a canal: Panama"\nOutput: true  (→ "amanaplanacanalpanama")\n\nExample 2:\nInput:  "race a car"\nOutput: false  (→ "raceacar")\n\nExample 3:\nInput:  " "\nOutput: true  (→ ""  — empty string is palindrome)\n\nConstraints: 1 ≤ s.length ≤ 2 × 10⁵',
    answer:
      '**Intuition**: strip non-alphanumeric characters and compare the cleaned string to its reverse. The two-pointer approach avoids creating a reversed copy.\n\n**Approach 1 — Clean and reverse**: O(n) time, O(n) space.\n\n**Approach 2 — Two pointers (optimal)**: left starts at 0, right at end. Skip non-alphanumeric chars by advancing the pointers. Compare lowercase characters at each valid position. Return false on first mismatch, true if pointers cross.\n\n**Complexity**:\n- Approach 1: Time O(n) | Space O(n)\n- Approach 2: Time O(n) | Space O(1) ← preferred\n\n**Edge cases**: empty string after cleaning → true. Single character → true.',
    code: {
      language: 'javascript',
      snippet: `// Approach 1: clean and reverse — O(n) space
function isPalindrome1(s) {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return clean === clean.split('').reverse().join('');
}

// Approach 2: two pointers — O(1) space (optimal)
function isPalindrome(s) {
  const isAlNum = (c) => /[a-z0-9]/.test(c);
  let left = 0, right = s.length - 1;

  while (left < right) {
    while (left < right && !isAlNum(s[left]))  left++;  // skip non-alnum
    while (left < right && !isAlNum(s[right])) right--;

    if (s[left].toLowerCase() !== s[right].toLowerCase()) return false;
    left++;
    right--;
  }
  return true;
}

console.log(isPalindrome('A man, a plan, a canal: Panama')); // true
console.log(isPalindrome('race a car'));  // false
console.log(isPalindrome(' '));           // true`,
    },
  },

  {
    id: 'ds-e8',
    category: 'Data Structures & Algorithms',
    difficulty: 'easy',
    type: 'basics',
    question: 'Count Vowels and Consonants\n\nGiven a string s, count the number of vowels (a, e, i, o, u) and consonants. Ignore digits, spaces, and special characters — count alphabetical characters only. The check is case-insensitive.\n\nExample 1:\nInput:  "Hello World!"\nOutput: { vowels: 3, consonants: 7 }\n\nExample 2:\nInput:  "Accenture"\nOutput: { vowels: 4, consonants: 5 }\n\nExample 3:\nInput:  "12345"\nOutput: { vowels: 0, consonants: 0 }\n\nConstraints: 1 ≤ s.length ≤ 10⁴',
    answer:
      '**Intuition**: iterate over each character and classify it. Skip anything that is not a letter (`/[a-z]/` check after lowercasing). If it is a letter, check if it is in the vowel set.\n\n**Approach**:\n1. Lowercase the entire string\n2. For each character: skip if not `[a-z]`\n3. Check if it is a vowel (use a Set for O(1) lookup)\n4. Otherwise it is a consonant\n\n**Complexity**: Time O(n) | Space O(1)\n\n**Common mistake**: not skipping non-alphabetic characters — counting digits or spaces as consonants.',
    code: {
      language: 'javascript',
      snippet: `function countVowelsConsonants(s) {
  const vowels = new Set(['a', 'e', 'i', 'o', 'u']);
  let vowelCount = 0, consonantCount = 0;

  for (const ch of s.toLowerCase()) {
    if (!/[a-z]/.test(ch)) continue; // skip digits, spaces, punctuation
    if (vowels.has(ch)) vowelCount++;
    else consonantCount++;
  }

  return { vowels: vowelCount, consonants: consonantCount };
}

console.log(countVowelsConsonants('Hello World!'));
// { vowels: 3, consonants: 7 }

console.log(countVowelsConsonants('Accenture'));
// { vowels: 4, consonants: 5 }

console.log(countVowelsConsonants('12345'));
// { vowels: 0, consonants: 0 }`,
    },
  },

  {
    id: 'ds-e9',
    category: 'Data Structures & Algorithms',
    difficulty: 'easy',
    type: 'basics',
    question: 'Find Minimum in Array — Classic Problem\n\nGiven an unsorted array of integers nums, return both the maximum and minimum values in a single pass (do not sort the array).\n\nExample 1:\nInput:  [3, 7, 1, 9, 2, 5]\nOutput: { max: 9, min: 1 }\n\nExample 2:\nInput:  [42]\nOutput: { max: 42, min: 42 }\n\nExample 3:\nInput:  [-3, -1, -7, -5]\nOutput: { max: -1, min: -7 }\n\nConstraints: 1 ≤ nums.length ≤ 10⁵ | Do not use Math.max(...arr) — explain why.',
    answer:
      '**Intuition**: initialise both `max` and `min` to the first element, then scan from index 1. Update each when a larger or smaller value is found.\n\n**Approach**:\n1. Guard empty array\n2. Set `max = min = nums[0]`\n3. For i from 1 to n-1: update `max` if `nums[i] > max`, update `min` if `nums[i] < min`\n4. Return both\n\n**Why not `Math.max(...arr)`**: the spread operator converts the array into function arguments. JavaScript\'s call stack has a limited argument count (~125k). For arrays larger than ~100k elements this throws: `RangeError: Maximum call stack size exceeded`. The loop is always safe.\n\n**Complexity**: Time O(n) | Space O(1)',
    code: {
      language: 'javascript',
      snippet: `function findMaxMin(nums) {
  if (nums.length === 0) return null;

  let max = nums[0], min = nums[0];

  for (let i = 1; i < nums.length; i++) {
    if (nums[i] > max) max = nums[i];
    if (nums[i] < min) min = nums[i];
  }

  return { max, min };
}

console.log(findMaxMin([3, 7, 1, 9, 2, 5])); // { max: 9, min: 1 }
console.log(findMaxMin([42]));                // { max: 42, min: 42 }
console.log(findMaxMin([-3, -1, -7, -5]));   // { max: -1, min: -7 }

// ✗ Dangerous for large arrays:
// Math.max(...new Array(200000).fill(1))
// → RangeError: Maximum call stack size exceeded`,
    },
  },

  {
    id: 'ds-e10',
    category: 'Data Structures & Algorithms',
    difficulty: 'easy',
    type: 'basics',
    question: 'Reverse String — LeetCode #344\n\nWrite a function that reverses a string. The input string is given as an array of characters s. You must do this by modifying the input array in-place with O(1) extra memory.\n\nExample 1:\nInput:  ["h","e","l","l","o"]\nOutput: ["o","l","l","e","h"]\n\nExample 2:\nInput:  ["H","a","n","n","a","h"]\nOutput: ["h","a","n","n","a","H"]\n\nBonus: also reverse the words in a sentence ("Hello World" → "World Hello").\n\nConstraints: 1 ≤ s.length ≤ 10⁵',
    answer:
      '**Intuition**: two pointers — one at the start, one at the end. Swap them and move inward until they meet. No extra space needed.\n\n**Approach**:\n1. `left = 0`, `right = s.length - 1`\n2. While `left < right`: swap `s[left]` and `s[right]`, then `left++`, `right--`\n3. The array is reversed in-place\n\n**Complexity**: Time O(n) | Space O(1)\n\n**Common variation — reverse words in sentence**: split on spaces, reverse the words array, rejoin. This creates a new string (O(n) space) but is O(n) time.',
    code: {
      language: 'javascript',
      snippet: `// LeetCode #344: reverse char array in-place
function reverseString(s) {
  let left = 0, right = s.length - 1;
  while (left < right) {
    [s[left], s[right]] = [s[right], s[left]]; // swap
    left++;
    right--;
  }
}

const s = ['h','e','l','l','o'];
reverseString(s);
console.log(s); // ['o','l','l','e','h']

// Bonus: reverse words in a sentence
function reverseWords(sentence) {
  return sentence.split(' ').reverse().join(' ');
}

console.log(reverseWords('Hello World'));      // 'World Hello'
console.log(reverseWords('the sky is blue')); // 'blue is sky the'`,
    },
  },

  // ─── Data Structures (Medium) ────────────────────────────────────────────────

  {
    id: 'ds-m1',
    category: 'Data Structures & Algorithms',
    difficulty: 'medium',
    type: 'basics',
    question: 'Contains Duplicate — LeetCode #217\n\nGiven an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.\n\nExample 1: Input: [1,2,3,1]     → Output: true\nExample 2: Input: [1,2,3,4]     → Output: false\nExample 3: Input: [1,1,1,3,3,4,3,2,4,2] → Output: true\n\nConstraints: 1 ≤ nums.length ≤ 10⁵ | -10⁹ ≤ nums[i] ≤ 10⁹\nFollow-up: can you solve it in O(n) time and O(1) space? (Hint: you cannot with a general input — explain why.)',
    answer:
      '**Intuition**: use a Set to remember every number seen so far. Before inserting, check if it is already there.\n\n**Approach — Hash Set O(n)**:\n1. Create an empty Set\n2. For each number: if it is in the Set → return true; else add it\n3. Return false if the loop finishes\n\n**Approach — Sort O(n log n)**:\nSort the array, then check adjacent elements. Uses O(1) extra space (if sorting in-place) but is slower.\n\n**Complexity**:\n- Hash Set: Time O(n) | Space O(n) ← preferred\n- Sort: Time O(n log n) | Space O(1)\n\n**Follow-up answer**: for arbitrary integer ranges, you cannot achieve O(n) time AND O(1) space simultaneously — any sublinear-space solution requires at least O(n log n) comparisons by information theory. The O(n) / O(1) trade-off is a classic interview discussion point.\n\n**One-liner**: `nums.length !== new Set(nums).size`',
    code: {
      language: 'javascript',
      snippet: `// Hash Set — O(n) time, O(n) space
function containsDuplicate(nums) {
  const seen = new Set();
  for (const num of nums) {
    if (seen.has(num)) return true;
    seen.add(num);
  }
  return false;
}

// One-liner (same complexity)
const containsDup = (nums) => nums.length !== new Set(nums).size;

// Sort approach — O(n log n) time, O(1) extra space
function containsDuplicateSort(nums) {
  nums.sort((a, b) => a - b);
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] === nums[i - 1]) return true;
  }
  return false;
}

console.log(containsDuplicate([1,2,3,1])); // true
console.log(containsDuplicate([1,2,3,4])); // false`,
    },
  },

  {
    id: 'ds-m2',
    category: 'Data Structures & Algorithms',
    difficulty: 'medium',
    type: 'basics',
    question: 'Best Time to Buy and Sell Stock — LeetCode #121\n\nYou are given an array prices where prices[i] is the price of a stock on the ith day. You want to maximize profit by choosing a single day to buy and a single day to sell after the buy day.\n\nReturn the maximum profit. If no profit is possible, return 0.\n\nExample 1:\nInput:  [7, 1, 5, 3, 6, 4]\nOutput: 5  (buy at 1, sell at 6)\n\nExample 2:\nInput:  [7, 6, 4, 3, 1]\nOutput: 0  (prices only decrease — no profitable trade)\n\nConstraints: 1 ≤ prices.length ≤ 10⁵ | 0 ≤ prices[i] ≤ 10⁴',
    answer:
      '**Intuition**: at each day, the best profit is `current price − lowest price seen so far`. Track both the running minimum and the best profit in one pass.\n\n**Approach — One pass O(n)**:\n1. `minPrice = Infinity`, `maxProfit = 0`\n2. For each price:\n   - Update `minPrice = Math.min(minPrice, price)`\n   - Update `maxProfit = Math.max(maxProfit, price - minPrice)`\n3. Return `maxProfit`\n\n**Why O(n) beats O(n²)**: the brute-force checks every (buy, sell) pair with nested loops. The key insight — once you know the minimum so far, you don\'t need to revisit previous prices.\n\n**Complexity**:\n- Brute force: Time O(n²) | Space O(1)\n- One pass: Time O(n) | Space O(1)\n\n**This problem illustrates the most common Big O optimization**: replace inner loop + scan with a "running best" variable.',
    code: {
      language: 'javascript',
      snippet: `// Brute force — O(n²), TLE on large inputs
function maxProfitBrute(prices) {
  let max = 0;
  for (let i = 0; i < prices.length; i++)
    for (let j = i + 1; j < prices.length; j++)
      max = Math.max(max, prices[j] - prices[i]);
  return max;
}

// One pass — O(n), optimal
function maxProfit(prices) {
  let minPrice = Infinity;
  let maxProfit = 0;

  for (const price of prices) {
    minPrice = Math.min(minPrice, price);          // cheapest day to buy
    maxProfit = Math.max(maxProfit, price - minPrice); // profit if sold today
  }

  return maxProfit;
}

console.log(maxProfit([7, 1, 5, 3, 6, 4])); // 5  (buy 1, sell 6)
console.log(maxProfit([7, 6, 4, 3, 1]));    // 0  (no profitable trade)`,
    },
  },

  {
    id: 'ds-m3',
    category: 'Data Structures & Algorithms',
    difficulty: 'medium',
    type: 'basics',
    question: 'Climbing Stairs — LeetCode #70\n\nYou are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?\n\nExample 1: Input: 2 → Output: 2  (1+1, 2)\nExample 2: Input: 3 → Output: 3  (1+1+1, 1+2, 2+1)\nExample 3: Input: 5 → Output: 8\n\nConstraints: 1 ≤ n ≤ 45',
    answer:
      '**Intuition**: to reach step n, you either came from step n-1 (1 step) or step n-2 (2 steps). So `ways(n) = ways(n-1) + ways(n-2)`. This is exactly Fibonacci.\n\n**Approach — Bottom-up DP**:\n1. Base cases: `dp[1] = 1`, `dp[2] = 2`\n2. For i from 3 to n: `dp[i] = dp[i-1] + dp[i-2]`\n3. Return `dp[n]`\n\n**Space optimization**: only the last two values are needed — no array required.\n\n**Complexity**: Time O(n) | Space O(1) with space optimization\n\n**Why not recursion without memoization**: `ways(n)` calls `ways(n-1)` and `ways(n-2)`, each of which call more recursive calls — exponential O(2ⁿ). With memoization it becomes O(n).\n\n**Pattern to recognize**: whenever `f(n) = f(n-1) + f(n-2)`, think Fibonacci / DP.',
    code: {
      language: 'javascript',
      snippet: `// Bottom-up DP with space optimization — O(n) time, O(1) space
function climbStairs(n) {
  if (n <= 2) return n;

  let prev = 1, curr = 2; // ways to reach step 1 and step 2
  for (let i = 3; i <= n; i++) {
    [prev, curr] = [curr, prev + curr];
  }
  return curr;
}

// Memoized recursion — O(n) time, O(n) space
function climbStairsMemo(n, memo = {}) {
  if (n <= 2) return n;
  if (memo[n]) return memo[n];
  memo[n] = climbStairsMemo(n - 1, memo) + climbStairsMemo(n - 2, memo);
  return memo[n];
}

console.log(climbStairs(2));  // 2
console.log(climbStairs(3));  // 3
console.log(climbStairs(5));  // 8
console.log(climbStairs(10)); // 89`,
    },
  },

  {
    id: 'ds-m4',
    category: 'Data Structures & Algorithms',
    difficulty: 'medium',
    type: 'basics',
    question: 'Number of Islands — LeetCode #200\n\nGiven an m × n 2D binary grid where \'1\' represents land and \'0\' represents water, return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.\n\nExample 1:\nInput:\n[["1","1","1","1","0"],\n ["1","1","0","1","0"],\n ["1","1","0","0","0"],\n ["0","0","0","0","0"]]\nOutput: 1\n\nExample 2:\nInput:\n[["1","1","0","0","0"],\n ["1","1","0","0","0"],\n ["0","0","1","0","0"],\n ["0","0","0","1","1"]]\nOutput: 3\n\nConstraints: 1 ≤ m, n ≤ 300',
    answer:
      '**Intuition**: each unvisited \'1\' is the start of an island. DFS/BFS from it to visit all connected land cells (marking them as visited), then count how many times you had to start a new DFS.\n\n**Approach — DFS**:\n1. Iterate every cell\n2. When you find an unvisited \'1\', increment island count and DFS all 4 neighbors\n3. Mark cells as \'0\' (or a visited marker) during DFS to avoid revisiting\n4. Return the count\n\n**Complexity**: Time O(m × n) | Space O(m × n) for the recursion stack\n\n**Union-Find alternative**: for follow-up questions about connecting islands dynamically, Union-Find (Disjoint Set Union) is more efficient for repeated queries.\n\n**Common mistake**: forgetting to mark cells as visited before recursing — causes infinite loops.',
    code: {
      language: 'javascript',
      snippet: `function numIslands(grid) {
  if (!grid || grid.length === 0) return 0;

  const rows = grid.length, cols = grid[0].length;
  let count = 0;

  function dfs(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return;
    if (grid[r][c] !== '1') return;

    grid[r][c] = '0'; // mark visited (sink the land)

    dfs(r + 1, c);
    dfs(r - 1, c);
    dfs(r, c + 1);
    dfs(r, c - 1);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1') {
        count++;       // found an unvisited island
        dfs(r, c);     // sink the whole island
      }
    }
  }

  return count;
}

const grid = [['1','1','0','0','0'],['1','1','0','0','0'],
              ['0','0','1','0','0'],['0','0','0','1','1']];
console.log(numIslands(grid)); // 3`,
    },
  },

  {
    id: 'ds-m5',
    category: 'Data Structures & Algorithms',
    difficulty: 'medium',
    type: 'basics',
    question: 'Valid Anagram — LeetCode #242\n\nGiven two strings s and t, return true if t is an anagram of s, and false otherwise. An anagram uses the same characters with the same frequencies in a different order.\n\nExample 1: Input: s = "anagram", t = "nagaram" → Output: true\nExample 2: Input: s = "rat",     t = "car"     → Output: false\nExample 3: Input: s = "listen",  t = "silent"  → Output: true\n\nConstraints: 1 ≤ s.length, t.length ≤ 5 × 10⁴ | s and t consist of lowercase English letters\nFollow-up: what if the inputs contain Unicode characters?',
    answer:
      '**Intuition**: two strings are anagrams if and only if they have the exact same character frequencies. A frequency map captures this.\n\n**Approach 1 — Sort and compare**: O(n log n) — sort both strings alphabetically and compare. Simple but slower.\n\n**Approach 2 — Frequency map (optimal)**: O(n)\n1. Early return if lengths differ\n2. Count frequency of each character in s\n3. Decrement for each character in t\n4. If any count goes negative → not an anagram\n\n**Complexity**:\n- Sort: Time O(n log n) | Space O(1)\n- Freq map: Time O(n) | Space O(1) — at most 26 keys\n\n**Follow-up (Unicode)**: use a `Map` instead of an object — `Map` handles any character as a key, not just letters.',
    code: {
      language: 'javascript',
      snippet: `// Approach 1: sort and compare — O(n log n)
function isAnagramSort(s, t) {
  if (s.length !== t.length) return false;
  const sort = str => str.split('').sort().join('');
  return sort(s) === sort(t);
}

// Approach 2: frequency map — O(n), optimal
function isAnagram(s, t) {
  if (s.length !== t.length) return false;

  const freq = {};
  for (const ch of s) freq[ch] = (freq[ch] || 0) + 1;
  for (const ch of t) {
    if (!freq[ch]) return false; // char not in s or count exhausted
    freq[ch]--;
  }
  return true;
}

console.log(isAnagram('anagram', 'nagaram')); // true
console.log(isAnagram('rat', 'car'));         // false
console.log(isAnagram('listen', 'silent'));   // true`,
    },
  },

  {
    id: 'ds-m6',
    category: 'Data Structures & Algorithms',
    difficulty: 'medium',
    type: 'basics',
    question: 'First Unique Character in a String — LeetCode #387\n\nGiven a string s, find the first non-repeating character in it and return its index. If it does not exist, return -1.\n\nExample 1: Input: "leetcode"  → Output: 0  (\'l\' appears once)\nExample 2: Input: "loveleetcode" → Output: 2  (\'v\' appears once)\nExample 3: Input: "aabb"      → Output: -1  (no unique character)\n\nConstraints: 1 ≤ s.length ≤ 10⁵ | s consists of only lowercase English letters',
    answer:
      '**Intuition**: two passes — first build a frequency count, then scan again to find the first character with count 1. The second pass over the original string preserves insertion order.\n\n**Approach**:\n1. Build a frequency map: for each char, `freq[ch]++`\n2. Scan s again: return the index of the first char where `freq[ch] === 1`\n3. If no such char exists, return -1\n\n**Why two passes**: after the first pass the frequency map is complete. A single pass cannot tell you if a character is unique until you\'ve seen the entire string.\n\n**Complexity**: Time O(n) | Space O(1) — at most 26 keys in the map\n\n**Variation**: return the character instead of the index — same approach, just return `s[i]` instead of `i`.',
    code: {
      language: 'javascript',
      snippet: `function firstUniqChar(s) {
  const freq = {};

  // Pass 1: count every character
  for (const ch of s) {
    freq[ch] = (freq[ch] || 0) + 1;
  }

  // Pass 2: find first with count 1 (preserves original order)
  for (let i = 0; i < s.length; i++) {
    if (freq[s[i]] === 1) return i;
  }

  return -1;
}

console.log(firstUniqChar('leetcode'));     // 0  ('l')
console.log(firstUniqChar('loveleetcode')); // 2  ('v')
console.log(firstUniqChar('aabb'));         // -1`,
    },
  },

  {
    id: 'ds-m7',
    category: 'Data Structures & Algorithms',
    difficulty: 'medium',
    type: 'basics',
    question: 'Missing Number — LeetCode #268\n\nGiven an array nums containing n distinct numbers in the range [0, n], return the only number in the range that is missing from the array.\n\nExample 1: Input: [3,0,1]     → Output: 2\nExample 2: Input: [0,1]       → Output: 2\nExample 3: Input: [9,6,4,2,3,5,7,0,1] → Output: 8\n\nConstraints: n == nums.length | 1 ≤ n ≤ 10⁴ | 0 ≤ nums[i] ≤ n | All numbers are unique\nFollow-up: solve in O(1) extra space and O(n) runtime.',
    answer:
      '**Intuition**: the sum of 0..n is known from Gauss\'s formula: `n*(n+1)/2`. The difference between the expected sum and the actual sum is the missing number.\n\n**Approach 1 — Gauss formula (optimal)**:\n1. Expected sum = `n * (n + 1) / 2`\n2. Actual sum = `nums.reduce((a, b) => a + b, 0)`\n3. Return `expected - actual`\n\n**Approach 2 — XOR**: XOR every index (0..n) with every value in the array. All paired values cancel out, leaving the missing number. Also O(n) time O(1) space.\n\n**Approach 3 — Set**: put all numbers in a Set, scan 0..n for the missing one. O(n) time but O(n) space.\n\n**Complexity** (Gauss): Time O(n) | Space O(1)',
    code: {
      language: 'javascript',
      snippet: `// Gauss formula — O(n) time, O(1) space (optimal)
function missingNumber(nums) {
  const n = nums.length;
  const expected = (n * (n + 1)) / 2;
  const actual = nums.reduce((sum, num) => sum + num, 0);
  return expected - actual;
}

// XOR approach — also O(n) time, O(1) space
function missingNumberXOR(nums) {
  let result = nums.length; // start with n
  for (let i = 0; i < nums.length; i++) {
    result ^= i ^ nums[i]; // XOR index and value — paired ones cancel out
  }
  return result;
}

console.log(missingNumber([3, 0, 1]));               // 2
console.log(missingNumber([0, 1]));                  // 2
console.log(missingNumber([9,6,4,2,3,5,7,0,1]));    // 8`,
    },
  },

  {
    id: 'ds-m8',
    category: 'Data Structures & Algorithms',
    difficulty: 'medium',
    type: 'basics',
    question: 'Second Largest Element — Classic Problem\n\nGiven an unsorted array of integers, find the second largest distinct value in a single pass (do not sort the array).\n\nExample 1: Input: [3, 7, 1, 9, 2, 5] → Output: 7\nExample 2: Input: [5, 5, 5]           → Output: -1  (no distinct second largest)\nExample 3: Input: [1, 2]              → Output: 1\nExample 4: Input: [9, 1]              → Output: 1\n\nConstraints: 1 ≤ nums.length ≤ 10⁵ | Solve in O(n) time, O(1) space',
    answer:
      '**Intuition**: track two variables — `first` (the largest seen) and `second` (the second largest distinct value). Update them as you scan.\n\n**Approach**:\n1. Initialise `first = second = -Infinity`\n2. For each number:\n   - If `num > first`: shift — `second = first`, then `first = num`\n   - Else if `num > second && num !== first`: update `second = num`\n3. Return `second`, or -1 if it is still `-Infinity`\n\n**Why not just sort**: sorting is O(n log n). One-pass tracking is O(n) — the interviewer specifically asks for "single pass" to test this.\n\n**Key detail**: the `num !== first` guard handles duplicates — `[5, 5, 5]` should return -1, not 5.\n\n**Complexity**: Time O(n) | Space O(1)',
    code: {
      language: 'javascript',
      snippet: `function secondLargest(nums) {
  if (nums.length < 2) return -1;

  let first = -Infinity, second = -Infinity;

  for (const num of nums) {
    if (num > first) {
      second = first; // old first drops to second
      first = num;
    } else if (num > second && num !== first) {
      second = num;   // new second — must be strictly less than first
    }
  }

  return second === -Infinity ? -1 : second;
}

console.log(secondLargest([3, 7, 1, 9, 2, 5])); // 7
console.log(secondLargest([5, 5, 5]));           // -1 (all duplicates)
console.log(secondLargest([1, 2]));              // 1
console.log(secondLargest([9, 1]));              // 1`,
    },
  },

  {
    id: 'ds-m9',
    category: 'Data Structures & Algorithms',
    difficulty: 'medium',
    type: 'basics',
    question: 'Two Sum — LeetCode #1\n\nGiven an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nExample 1:\nInput:  nums = [2,7,11,15], target = 9\nOutput: [0,1]  (nums[0] + nums[1] = 2 + 7 = 9)\n\nExample 2:\nInput:  nums = [3,2,4], target = 6\nOutput: [1,2]\n\nExample 3:\nInput:  nums = [3,3], target = 6\nOutput: [0,1]\n\nConstraints: 2 ≤ nums.length ≤ 10⁴ | Only one valid answer exists.',
    answer:
      '**Intuition**: for each number, the value needed to complete the pair is `target - nums[i]`. Store each number\'s index in a map — if its complement is already in the map, the pair is found.\n\n**Approach — Hash Map O(n)**:\n1. Create an empty Map: `value → index`\n2. For each index i:\n   - Compute `complement = target - nums[i]`\n   - If `complement` is in the map → return `[map.get(complement), i]`\n   - Otherwise → `map.set(nums[i], i)`\n3. (The problem guarantees a solution exists)\n\n**Why this works**: the map acts as a lookup table for "have I seen the number that pairs with this one?" — O(1) lookup vs O(n) scan in a nested loop.\n\n**Complexity**:\n- Brute force: Time O(n²) | Space O(1)\n- Hash map: Time O(n) | Space O(n)',
    code: {
      language: 'javascript',
      snippet: `// Brute force: O(n²) — mention this first, then optimize
function twoSumBrute(nums, target) {
  for (let i = 0; i < nums.length; i++)
    for (let j = i + 1; j < nums.length; j++)
      if (nums[i] + nums[j] === target) return [i, j];
}

// Hash map: O(n) — optimal
function twoSum(nums, target) {
  const seen = new Map(); // value → index

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];

    if (seen.has(complement)) {
      return [seen.get(complement), i]; // complement found!
    }
    seen.set(nums[i], i); // store for future lookups
  }
}

console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]
console.log(twoSum([3, 2, 4], 6));      // [1, 2]
console.log(twoSum([3, 3], 6));         // [0, 1]`,
    },
  },

  {
    id: 'ds-e12',
    category: 'Data Structures & Algorithms',
    difficulty: 'easy',
    type: 'basics',
    question: 'How do you check if a string is a palindrome?',
    answer:
      "A **palindrome** reads the same forwards and backwards. `\"racecar\"` → palindrome. `\"hello\"` → not.\n\n**Two-pointer approach (O(n) time, O(1) space)**:\nPlace one pointer at the start and one at the end, move them inward comparing characters. If any pair doesn't match, it's not a palindrome. This is the preferred approach in interviews.\n\n**Reverse-and-compare (O(n) time, O(n) space)**:\nReverse the string and check equality. Simple to write but uses extra space.\n\n**Common follow-ups**:\n- *Case-insensitive*: `toLowerCase()` before checking\n- *Ignore non-alphanumeric characters* (e.g. `\"A man, a plan, a canal: Panama\"`): filter out non-letters/digits first\n- *Check a number*: convert to string, or use the modulo/divide approach to reverse the number without string conversion\n\n**Complexity**:\n- Two-pointer: Time O(n) | Space O(1)\n- Reverse: Time O(n) | Space O(n)",
    code: {
      language: 'javascript',
      snippet: `// ── Two-pointer: O(n) time, O(1) space ──────────────
function isPalindrome(s) {
  let left = 0, right = s.length - 1;

  while (left < right) {
    if (s[left] !== s[right]) return false;
    left++;
    right--;
  }
  return true;
}

// ── Reverse-and-compare: O(n) time, O(n) space ───────
function isPalindromeReverse(s) {
  return s === s.split('').reverse().join('');
}

// ── Follow-up: ignore case and non-alphanumeric ───────
// "A man, a plan, a canal: Panama" → true
function isPalindromeClean(s) {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  let left = 0, right = clean.length - 1;

  while (left < right) {
    if (clean[left] !== clean[right]) return false;
    left++;
    right--;
  }
  return true;
}

// ── Follow-up: check a number ─────────────────────────
// 121 → true  |  -121 → false  |  10 → false
function isPalindromeNumber(n) {
  if (n < 0) return false; // negative numbers are never palindromes
  return n === Number(String(n).split('').reverse().join(''));
}

console.log(isPalindrome('racecar'));   // true
console.log(isPalindrome('hello'));     // false
console.log(isPalindromeClean('A man, a plan, a canal: Panama')); // true
console.log(isPalindromeNumber(121));   // true
console.log(isPalindromeNumber(-121));  // false`,
    },
  },
];
