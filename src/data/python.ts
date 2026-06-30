import type { Flashcard } from '../types';

export const pythonCards: Flashcard[] = [

  // ─── Python (Easy) ───────────────────────────────────────────────────────────

  {
    id: 'py-e1',
    category: 'Python',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is the difference between a list and a tuple in Python?',
    answer:
      '**List** — mutable, ordered sequence. You can add, remove, or change elements after creation.\n\n**Tuple** — immutable, ordered sequence. Once created, it cannot be changed.\n\n**Key differences:**\n- Lists use `[]`, tuples use `()`\n- Lists are slower (dynamic resizing), tuples are faster and use less memory\n- Tuples can be used as dictionary keys (they are hashable); lists cannot\n- Tuples signal "this data should not change" — use them for fixed collections like coordinates, RGB values, or DB rows\n\n**When to use which:**\n- Use a **list** when the collection needs to grow/shrink or be sorted\n- Use a **tuple** for fixed data, function return values with multiple items, or dict keys',
    code: {
      language: 'python',
      snippet: `# List — mutable
fruits = ['apple', 'banana', 'cherry']
fruits.append('mango')   # OK
fruits[0] = 'avocado'    # OK

# Tuple — immutable
point = (10, 20)
point[0] = 5             # TypeError: 'tuple' object does not support item assignment

# Tuple as dict key (hashable)
locations = {(40.7128, -74.0060): 'New York'}

# Unpacking works the same for both
x, y = point
a, b, c = fruits[:3]`,
    },
  },

  {
    id: 'py-e2',
    category: 'Python',
    difficulty: 'easy',
    type: 'basics',
    question: 'What are Python decorators? How do they work?',
    answer:
      '**Decorators** are functions that wrap another function to extend or modify its behavior without changing its source code. They use the `@` syntax as syntactic sugar.\n\n`@decorator` above a function is equivalent to `func = decorator(func)` after the definition.\n\n**How they work:**\n1. The decorator receives the original function as an argument\n2. It defines a wrapper function that adds behavior before/after the original call\n3. It returns the wrapper\n\n**Common built-in decorators:** `@staticmethod`, `@classmethod`, `@property`\n\n**`functools.wraps`** — preserves the original function\'s name and docstring on the wrapper. Always use it.',
    code: {
      language: 'python',
      snippet: `import functools
import time

def timer(func):
    @functools.wraps(func)  # preserves func.__name__, func.__doc__
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        end = time.perf_counter()
        print(f"{func.__name__} took {end - start:.4f}s")
        return result
    return wrapper

@timer
def slow_sum(n):
    return sum(range(n))

slow_sum(1_000_000)
# slow_sum took 0.0412s

# Decorator with arguments (factory pattern)
def repeat(times):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for _ in range(times):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(times=3)
def greet(name):
    print(f"Hello, {name}!")`,
    },
  },

  {
    id: 'py-e3',
    category: 'Python',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is the difference between `==` and `is` in Python?',
    answer:
      '**`==`** — checks **value equality**: do the two objects hold the same value?\n\n**`is`** — checks **identity**: do the two variables point to the exact same object in memory (same `id()`)?\n\n**Key rules:**\n- Always use `==` to compare values\n- Use `is` only to check against singletons: `None`, `True`, `False`\n- Small integers (-5 to 256) and short strings are **interned** by CPython, so `is` may return `True` for them — but this is an implementation detail, not a language guarantee\n\n**Common mistake:** using `is` to compare strings or numbers leads to subtle bugs that only appear with larger values.',
    code: {
      language: 'python',
      snippet: `a = [1, 2, 3]
b = [1, 2, 3]
c = a

print(a == b)   # True  — same values
print(a is b)   # False — different objects in memory
print(a is c)   # True  — c points to the same object as a

# Correct: check for None with 'is'
def process(value=None):
    if value is None:
        return "no value"
    return value

# CPython interning (don't rely on this!)
x = 256
y = 256
print(x is y)   # True  (interned small int)

x = 257
y = 257
print(x is y)   # False (not interned — different objects)`,
    },
  },

  {
    id: 'py-e4',
    category: 'Python',
    difficulty: 'easy',
    type: 'basics',
    question: 'What are list comprehensions and generator expressions? When do you use each?',
    answer:
      '**List comprehension** — creates a fully-materialized list in memory immediately. Syntax: `[expr for item in iterable if condition]`\n\n**Generator expression** — creates a lazy iterator that yields values one at a time. Syntax: `(expr for item in iterable if condition)`. Uses `()` instead of `[]`.\n\n**When to use which:**\n- Use a **list comprehension** when you need to reuse the result multiple times, index into it, or know its length\n- Use a **generator** when processing large/infinite sequences, or when you only need to iterate once — it uses O(1) memory instead of O(n)\n\n**Dict and set comprehensions** follow the same pattern: `{k: v for ...}` and `{expr for ...}`',
    code: {
      language: 'python',
      snippet: `# List comprehension — all values in memory at once
squares = [x**2 for x in range(10) if x % 2 == 0]
print(squares)         # [0, 4, 16, 36, 64]
print(squares[2])      # 16 — can index
print(len(squares))    # 5  — can get length

# Generator expression — lazy, one value at a time
gen = (x**2 for x in range(10) if x % 2 == 0)
print(next(gen))       # 0
print(next(gen))       # 4
# sum() consumes the generator without building a list
total = sum(x**2 for x in range(1_000_000))

# Dict comprehension
word_lengths = {word: len(word) for word in ['hello', 'world', 'python']}
# {'hello': 5, 'world': 5, 'python': 6}

# Set comprehension (removes duplicates)
unique_lengths = {len(word) for word in ['hi', 'hey', 'hello', 'ok']}
# {2, 3, 5}`,
    },
  },

  // ─── Python (Medium) ─────────────────────────────────────────────────────────

  {
    id: 'py-m1',
    category: 'Python',
    difficulty: 'medium',
    type: 'basics',
    question: 'Explain Python\'s GIL (Global Interpreter Lock). How does it affect threading?',
    answer:
      '**GIL (Global Interpreter Lock)** is a mutex in CPython that allows only one thread to execute Python bytecode at a time, even on multi-core machines.\n\n**Why it exists:** CPython\'s memory management (reference counting) is not thread-safe. The GIL prevents race conditions on reference counts without requiring per-object locks.\n\n**Impact on threading:**\n- **CPU-bound tasks** (computation, data processing) — threads do NOT run in parallel. Only one thread runs at a time. Use `multiprocessing` instead.\n- **I/O-bound tasks** (network requests, file I/O, DB queries) — threads ARE effective because the GIL is released while waiting for I/O. `threading` or `asyncio` work well here.\n\n**Solutions for CPU-bound parallelism:**\n- `multiprocessing` — separate processes, each with its own GIL\n- `concurrent.futures.ProcessPoolExecutor`\n- C extensions (NumPy, Pandas release the GIL for their operations)\n- Alternative runtimes: PyPy, Jython, GraalPy (no GIL)',
    code: {
      language: 'python',
      snippet: `import threading
import multiprocessing
import time

def cpu_task(n):
    return sum(i * i for i in range(n))

# Threading — limited by GIL for CPU work
# Both threads share one CPU core effectively
t1 = threading.Thread(target=cpu_task, args=(10_000_000,))
t2 = threading.Thread(target=cpu_task, args=(10_000_000,))
# NOT truly parallel for CPU-bound work

# Multiprocessing — bypasses GIL
# Each process has its own Python interpreter
with multiprocessing.Pool(processes=4) as pool:
    results = pool.map(cpu_task, [10_000_000] * 4)
# TRUE parallelism — 4 cores running simultaneously

# asyncio — great for I/O-bound, single-threaded concurrency
import asyncio
async def fetch(url):
    # GIL released while awaiting network I/O
    await asyncio.sleep(1)  # simulates network call
    return url`,
    },
  },

  {
    id: 'py-m2',
    category: 'Python',
    difficulty: 'medium',
    type: 'basics',
    question: 'What are `*args` and `**kwargs`? How does argument unpacking work?',
    answer:
      '**`*args`** — collects extra positional arguments into a **tuple**.\n\n**`**kwargs`** — collects extra keyword arguments into a **dict**.\n\n**Parameter order in a function signature must be:**\n1. Regular positional params\n2. `*args`\n3. Keyword-only params (after `*args` or bare `*`)\n4. `**kwargs`\n\n**Unpacking at call site:**\n- `*iterable` — unpacks a list/tuple as positional args\n- `**dict` — unpacks a dict as keyword args\n\nThis pattern is heavily used for function wrappers, decorators, and APIs that need to forward arguments.',
    code: {
      language: 'python',
      snippet: `def log(level, *args, sep=" ", **kwargs):
    message = sep.join(str(a) for a in args)
    print(f"[{level}] {message}", **kwargs)

log("INFO", "User", "logged", "in", sep="-")
# [INFO] User-logged-in

log("ERROR", "Failed", flush=True)
# [ERROR] Failed

# Unpacking at call site
def add(a, b, c):
    return a + b + c

nums = [1, 2, 3]
print(add(*nums))          # 6  — list unpacked as positional args

config = {'b': 20, 'c': 30}
print(add(10, **config))   # 60 — dict unpacked as kwargs

# Keyword-only params (after bare *)
def connect(host, port, *, timeout=30, retries=3):
    pass

connect("localhost", 5432, timeout=10)  # OK
connect("localhost", 5432, 10)          # TypeError — timeout is keyword-only`,
    },
  },

  {
    id: 'py-m3',
    category: 'Python',
    difficulty: 'medium',
    type: 'basics',
    question: 'What are Python\'s `__dunder__` (magic/special) methods? Give key examples.',
    answer:
      '**Dunder methods** (double underscore) let you define how objects behave with Python\'s built-in operations and syntax. They are called implicitly by the interpreter.\n\n**Most important dunders:**\n\n| Method | Triggered by |\n|---|---|\n| `__init__` | `obj = Class()` — initialization |\n| `__repr__` | `repr(obj)` — developer string, used in REPL/debugging |\n| `__str__` | `str(obj)` / `print(obj)` — user-friendly string |\n| `__len__` | `len(obj)` |\n| `__getitem__` | `obj[key]` |\n| `__setitem__` | `obj[key] = val` |\n| `__contains__` | `item in obj` |\n| `__iter__` / `__next__` | `for x in obj` |\n| `__eq__` | `obj == other` |\n| `__lt__`, `__gt__` etc | comparison operators |\n| `__enter__` / `__exit__` | `with obj:` — context manager |\n| `__call__` | `obj()` — callable instances |',
    code: {
      language: 'python',
      snippet: `class BoundedList:
    def __init__(self, max_size):
        self._data = []
        self.max_size = max_size

    def __repr__(self):
        return f"BoundedList(max={self.max_size}, data={self._data})"

    def __len__(self):
        return len(self._data)

    def __getitem__(self, index):
        return self._data[index]

    def __contains__(self, item):
        return item in self._data

    def append(self, item):
        if len(self._data) >= self.max_size:
            raise ValueError("List is full")
        self._data.append(item)

bl = BoundedList(3)
bl.append(10)
bl.append(20)
print(len(bl))      # 2
print(10 in bl)     # True
print(bl[0])        # 10
print(bl)           # BoundedList(max=3, data=[10, 20])

# Context manager via __enter__ / __exit__
class Timer:
    def __enter__(self):
        import time; self.start = time.time(); return self
    def __exit__(self, *args):
        print(f"Elapsed: {time.time() - self.start:.3f}s")

with Timer():
    sum(range(1_000_000))`,
    },
  },

  {
    id: 'py-m4',
    category: 'Python',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is the difference between shallow copy and deep copy in Python?',
    answer:
      '**Shallow copy** — creates a new container object, but the elements inside still reference the same objects as the original. Changes to nested mutable objects affect both copies.\n\n**Deep copy** — recursively creates new copies of all nested objects. The copy is completely independent.\n\n**Ways to shallow copy:**\n- `list.copy()`, `dict.copy()`\n- `list[:]`, `dict.copy()`\n- `copy.copy(obj)`\n\n**Ways to deep copy:**\n- `copy.deepcopy(obj)` — handles arbitrary nesting, circular references\n\n**Rule of thumb:** if your data has only one level (flat list of integers/strings), shallow copy is fine. Use deep copy for nested structures.',
    code: {
      language: 'python',
      snippet: `import copy

original = [[1, 2, 3], [4, 5, 6]]

shallow = copy.copy(original)
deep    = copy.deepcopy(original)

# Modifying a nested list
original[0].append(99)

print(original)  # [[1, 2, 3, 99], [4, 5, 6]]
print(shallow)   # [[1, 2, 3, 99], [4, 5, 6]]  ← affected (same inner list)
print(deep)      # [[1, 2, 3],     [4, 5, 6]]  ← unaffected (independent copy)

# Replacing an element (top-level) — shallow copy IS independent for this
shallow[0] = [100]
print(original)  # [[1, 2, 3, 99], [4, 5, 6]]  ← unaffected at top level`,
    },
  },

  {
    id: 'py-m5',
    category: 'Python',
    difficulty: 'medium',
    type: 'basics',
    question: 'What are Python generators? How do `yield` and `yield from` work?',
    answer:
      '**Generators** are functions that use `yield` to produce values lazily — pausing execution and resuming where they left off. They return a **generator object** (an iterator).\n\n**Benefits:**\n- O(1) memory — values produced one at a time, not all at once\n- Can represent infinite sequences\n- Cleaner than manually implementing `__iter__`/`__next__`\n\n**`yield from`** — delegates to a sub-generator (or any iterable), forwarding values and propagating `send()`/`throw()` calls. Cleaner than `for x in sub: yield x`.\n\n**Generator lifecycle:**\n- Created when function is called (doesn\'t execute yet)\n- `next()` runs to the next `yield`\n- Raises `StopIteration` when the function returns',
    code: {
      language: 'python',
      snippet: `def fibonacci():
    a, b = 0, 1
    while True:           # infinite sequence!
        yield a
        a, b = b, a + b

gen = fibonacci()
print([next(gen) for _ in range(8)])
# [0, 1, 1, 2, 3, 5, 8, 13]

# Reading a huge file line by line — O(1) memory
def read_large_file(path):
    with open(path) as f:
        for line in f:
            yield line.strip()

# yield from — delegate to sub-generator
def chain(*iterables):
    for it in iterables:
        yield from it        # cleaner than: for x in it: yield x

print(list(chain([1, 2], [3, 4], [5])))
# [1, 2, 3, 4, 5]

# Generator pipeline (memory-efficient)
numbers  = (x for x in range(1_000_000))
evens    = (x for x in numbers if x % 2 == 0)
squared  = (x**2 for x in evens)
print(next(squared))   # 0
print(next(squared))   # 4`,
    },
  },

  // ─── Python (Hard) ───────────────────────────────────────────────────────────

  {
    id: 'py-h1',
    category: 'Python',
    difficulty: 'hard',
    type: 'basics',
    question: 'What is Python\'s MRO (Method Resolution Order)? How does `super()` work with multiple inheritance?',
    answer:
      '**MRO** defines the order in which Python looks up methods and attributes in a class hierarchy. It uses the **C3 linearization algorithm**, which guarantees:\n1. A class always comes before its parents\n2. The order in the class definition is preserved\n3. No class appears more than once\n\nYou can inspect it with `ClassName.__mro__` or `ClassName.mro()`.\n\n**`super()`** — returns a proxy that delegates method calls to the next class in the MRO, not necessarily the direct parent. This is critical for cooperative multiple inheritance — every class in the chain calls `super()` so all classes in the MRO get a chance to run.\n\n**Diamond problem** — Python solves it via MRO: each class appears exactly once in the lookup order.',
    code: {
      language: 'python',
      snippet: `class A:
    def greet(self):
        print("A.greet")
        super().greet()   # cooperative — calls next in MRO

class B(A):
    def greet(self):
        print("B.greet")
        super().greet()

class C(A):
    def greet(self):
        print("C.greet")
        super().greet()

class D(B, C):
    def greet(self):
        print("D.greet")
        super().greet()

# MRO: D -> B -> C -> A -> object
print([cls.__name__ for cls in D.__mro__])
# ['D', 'B', 'C', 'A', 'object']

D().greet()
# D.greet
# B.greet
# C.greet
# A.greet
# Each super() call goes to the NEXT class in MRO, not just the parent`,
    },
  },

  {
    id: 'py-h2',
    category: 'Python',
    difficulty: 'hard',
    type: 'basics',
    question: 'What are Python descriptors? How do `@property`, `@staticmethod`, and `@classmethod` use them?',
    answer:
      '**Descriptors** are objects that define `__get__`, `__set__`, and/or `__delete__` methods. When a class attribute is a descriptor, Python calls these methods instead of doing a normal attribute lookup.\n\n**Two types:**\n- **Data descriptor** — defines `__set__` (or `__delete__`). Overrides instance `__dict__`. (`property` is a data descriptor)\n- **Non-data descriptor** — only defines `__get__`. Instance `__dict__` takes priority.\n\n**How built-ins use descriptors:**\n- `@property` → data descriptor (`__get__` returns computed value, `__set__` raises AttributeError unless a setter is defined)\n- `@staticmethod` → non-data descriptor (returns raw function, ignores class/instance)\n- `@classmethod` → non-data descriptor (returns bound method with class as first arg)\n\nDescriptors power the entire Python attribute access protocol.',
    code: {
      language: 'python',
      snippet: `# Custom descriptor — validates positive numbers
class PositiveNumber:
    def __set_name__(self, owner, name):
        self.name = name

    def __get__(self, obj, objtype=None):
        if obj is None:     # accessed on class, not instance
            return self
        return obj.__dict__.get(self.name, 0)

    def __set__(self, obj, value):
        if value <= 0:
            raise ValueError(f"{self.name} must be positive, got {value}")
        obj.__dict__[self.name] = value

class Product:
    price = PositiveNumber()
    quantity = PositiveNumber()

    def __init__(self, price, quantity):
        self.price = price
        self.quantity = quantity

p = Product(9.99, 100)
print(p.price)        # 9.99
p.price = -5          # ValueError: price must be positive

# property is syntax sugar over the descriptor protocol
class Circle:
    def __init__(self, radius):
        self._radius = radius

    @property
    def area(self):
        import math
        return math.pi * self._radius ** 2

    @area.setter
    def area(self, value):
        import math
        self._radius = (value / math.pi) ** 0.5`,
    },
  },

  {
    id: 'py-h3',
    category: 'Python',
    difficulty: 'hard',
    type: 'basics',
    question: 'How does `asyncio` work in Python? Explain the event loop, coroutines, tasks, and `async`/`await`.',
    answer:
      '**asyncio** provides single-threaded concurrency for I/O-bound work using an **event loop** — a loop that runs coroutines, handles I/O events, and schedules callbacks.\n\n**Key concepts:**\n- **Coroutine** — an `async def` function. Calling it returns a coroutine object (doesn\'t execute yet). Must be `await`ed or wrapped in a Task.\n- **`await`** — suspends the current coroutine, yielding control back to the event loop until the awaited thing is done.\n- **Task** — wraps a coroutine and schedules it to run concurrently. Created with `asyncio.create_task()`.\n- **Event loop** — runs tasks, selects which one to resume based on I/O readiness.\n\n**asyncio vs threads:**\n- asyncio: cooperative multitasking, single thread, low overhead, best for high-concurrency I/O\n- threads: preemptive, more overhead, can share memory but need synchronization\n\n**Don\'t block the event loop** with CPU-heavy or synchronous I/O code — use `loop.run_in_executor()` to offload to a thread pool.',
    code: {
      language: 'python',
      snippet: `import asyncio
import aiohttp   # async HTTP client

async def fetch(session, url):
    async with session.get(url) as response:
        return await response.text()

async def fetch_all(urls):
    async with aiohttp.ClientSession() as session:
        # create_task schedules all coroutines concurrently
        tasks = [asyncio.create_task(fetch(session, url)) for url in urls]
        # gather waits for all tasks and returns results in order
        results = await asyncio.gather(*tasks)
    return results

# asyncio.run() creates the event loop and runs until complete
urls = ["https://example.com", "https://httpbin.org/get"]
# results = asyncio.run(fetch_all(urls))

# Running blocking code without blocking the event loop
async def cpu_work():
    loop = asyncio.get_event_loop()
    # offload to thread pool so event loop stays responsive
    result = await loop.run_in_executor(None, sum, range(10_000_000))
    return result

# Producer / Consumer with Queue
async def producer(queue):
    for i in range(5):
        await queue.put(i)
        await asyncio.sleep(0.1)

async def consumer(queue):
    while True:
        item = await queue.get()
        print(f"Consumed {item}")
        queue.task_done()`,
    },
  },

  {
    id: 'py-h4',
    category: 'Python',
    difficulty: 'hard',
    type: 'basics',
    question: 'What are metaclasses in Python? When would you use one?',
    answer:
      '**Metaclass** — the class of a class. Just as an object is an instance of a class, a class is an instance of a metaclass. The default metaclass is `type`.\n\n**How class creation works:**\n1. Python reads the `class` body and collects the namespace dict\n2. Calls `metaclass(name, bases, namespace)` to build the class object\n3. The resulting class object is assigned to the name\n\n**What you can do with metaclasses:**\n- Automatically register subclasses\n- Enforce coding conventions (e.g., all methods must have docstrings)\n- Add methods/attributes to all classes in a hierarchy\n- Implement Singleton, ORM models (Django\'s `Model` uses a metaclass)\n- Validate class definitions at definition time\n\n**In modern Python:** many metaclass use cases can be replaced with `__init_subclass__` (simpler) or class decorators. Use metaclasses only when you need to intercept the class creation itself.',
    code: {
      language: 'python',
      snippet: `# Auto-register all subclasses
class PluginMeta(type):
    registry = {}

    def __new__(mcs, name, bases, namespace):
        cls = super().__new__(mcs, name, bases, namespace)
        if bases:  # don't register the base class itself
            mcs.registry[name] = cls
        return cls

class Plugin(metaclass=PluginMeta):
    def run(self): ...

class CSVPlugin(Plugin):
    def run(self): print("CSV")

class JSONPlugin(Plugin):
    def run(self): print("JSON")

print(PluginMeta.registry)
# {'CSVPlugin': <class 'CSVPlugin'>, 'JSONPlugin': <class 'JSONPlugin'>}

# Modern alternative: __init_subclass__ (Python 3.6+)
class Animal:
    _registry = {}

    def __init_subclass__(cls, sound, **kwargs):
        super().__init_subclass__(**kwargs)
        cls.sound = sound
        Animal._registry[cls.__name__] = cls

class Dog(Animal, sound="woof"): pass
class Cat(Animal, sound="meow"): pass

print(Dog.sound)           # woof
print(Animal._registry)    # {'Dog': ..., 'Cat': ...}`,
    },
  },
];
