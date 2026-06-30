import type { Flashcard } from '../types';

export const mongodbCards: Flashcard[] = [

  // ─── MongoDB (Easy) ──────────────────────────────────────────────────────────

  {
    id: 'mongo-e1',
    category: 'MongoDB',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is MongoDB? How does its document model differ from a relational database?',
    answer:
      '**MongoDB** is a NoSQL document database that stores data as BSON documents (Binary JSON) in **collections** instead of rows in tables.\n\n**Key differences from relational DBs:**\n\n| | MongoDB | PostgreSQL |\n|---|---|---|\n| Unit of storage | Document (JSON-like) | Row |\n| Grouping | Collection | Table |\n| Schema | Flexible (schemaless) | Strict (defined upfront) |\n| Joins | `$lookup` (aggregation) | Native JOIN |\n| Relations | Embed or reference | Foreign keys |\n| Scaling | Horizontal (sharding built-in) | Vertical (sharding is complex) |\n\n**When MongoDB wins:**\n- Data shape varies per document (product catalogs, user profiles, CMS)\n- Rapid iteration where schema changes often\n- Hierarchical/nested data that maps naturally to documents\n- High write throughput needs\n\n**When PostgreSQL wins:**\n- Complex relationships with many JOINs\n- Strong ACID guarantees across multiple entities\n- Reporting/analytics with complex queries\n- Financial or transactional data',
    code: {
      language: 'javascript',
      snippet: `// MongoDB: a single document holds the full user profile
// No JOINs needed — related data is embedded
{
  _id: ObjectId("64a1b2c3d4e5f6a7b8c9d0e1"),
  name: "Henrick",
  email: "h@example.com",
  addresses: [
    { type: "home", city: "Manila", zip: "1234" },
    { type: "work", city: "Makati", zip: "1226" }
  ],
  preferences: { theme: "dark", notifications: true },
  createdAt: ISODate("2024-01-15T08:00:00Z")
}

// SQL equivalent would need: users, addresses, preferences tables + 3 JOINs`,
    },
  },

  {
    id: 'mongo-e2',
    category: 'MongoDB',
    difficulty: 'easy',
    type: 'basics',
    question: 'What is Mongoose? How do you define a schema and model?',
    answer:
      '**Mongoose** is an ODM (Object Document Mapper) for MongoDB and Node.js. It adds:\n- **Schema definition** — enforce structure and types on documents\n- **Validation** — built-in and custom validators\n- **Middleware (hooks)** — pre/post hooks on operations (`save`, `find`, `delete`)\n- **Virtuals** — computed properties not stored in DB\n- **Population** — reference-based joins (like SQL JOINs but manual)\n\n**Schema types:** `String`, `Number`, `Boolean`, `Date`, `Buffer`, `ObjectId`, `Array`, `Map`, `Mixed`\n\n**Best practices:**\n- Set `timestamps: true` to auto-add `createdAt`/`updatedAt`\n- Always add indexes in the schema with `index: true` or `unique: true`\n- Use `lean()` for read-only queries — returns plain JS objects, skipping Mongoose overhead (up to 5× faster)',
    code: {
      language: 'typescript',
      snippet: `import mongoose, { Schema, Document, Model } from 'mongoose';

interface IUser extends Document {
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name:  { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    role:  { type: String, enum: ['admin', 'user'], default: 'user' },
  },
  { timestamps: true }   // auto adds createdAt, updatedAt
);

// Index for faster lookups
userSchema.index({ email: 1 });

// Virtual — not stored in DB
userSchema.virtual('greeting').get(function () {
  return \`Hello, \${this.name}\`;
});

// Pre-save hook
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

const User: Model<IUser> = mongoose.model('User', userSchema);

// lean() for read-only — plain object, no Mongoose overhead
const users = await User.find({ role: 'admin' }).lean();`,
    },
  },

  // ─── MongoDB (Medium) ────────────────────────────────────────────────────────

  {
    id: 'mongo-m1',
    category: 'MongoDB',
    difficulty: 'medium',
    type: 'basics',
    question: 'What is the MongoDB aggregation pipeline? Walk through the key stages.',
    answer:
      '**The aggregation pipeline** is MongoDB\'s way to process and transform documents through a sequence of stages. Each stage takes the output of the previous stage as input — like Unix pipes.\n\n**Key stages:**\n\n| Stage | SQL equivalent | Purpose |\n|---|---|---|\n| `$match` | `WHERE` | Filter documents early (always put first to use indexes) |\n| `$group` | `GROUP BY` | Group and aggregate (sum, count, avg, etc.) |\n| `$project` | `SELECT` | Include/exclude/reshape fields |\n| `$sort` | `ORDER BY` | Sort documents |\n| `$limit` / `$skip` | `LIMIT` / `OFFSET` | Pagination |\n| `$lookup` | `LEFT JOIN` | Join another collection |\n| `$unwind` | — | Deconstruct an array field into separate documents |\n| `$addFields` | computed columns | Add new computed fields |\n| `$facet` | — | Run multiple pipelines in parallel (multi-facet results) |\n\n**Performance rule:** always `$match` first to reduce documents before expensive stages.',
    code: {
      language: 'javascript',
      snippet: `// Sales report: total revenue per category, top 5 only
db.orders.aggregate([
  // Stage 1: filter (uses index on status)
  { $match: { status: 'completed', createdAt: { $gte: new Date('2024-01-01') } } },

  // Stage 2: unwind array of items
  { $unwind: '$items' },

  // Stage 3: group by category, sum revenue
  {
    $group: {
      _id: '$items.category',
      totalRevenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } },
      orderCount:   { $sum: 1 },
      avgOrderValue: { $avg: '$items.price' },
    }
  },

  // Stage 4: sort descending by revenue
  { $sort: { totalRevenue: -1 } },

  // Stage 5: top 5 only
  { $limit: 5 },

  // Stage 6: reshape output
  {
    $project: {
      _id: 0,
      category: '$_id',
      totalRevenue: { $round: ['$totalRevenue', 2] },
      orderCount: 1,
    }
  },
]);

// $lookup — join users to orders
db.orders.aggregate([
  {
    $lookup: {
      from:         'users',
      localField:   'userId',
      foreignField: '_id',
      as:           'user',
    }
  },
  { $unwind: '$user' },
  { $project: { total: 1, 'user.name': 1, 'user.email': 1 } },
]);`,
    },
  },

  {
    id: 'mongo-m2',
    category: 'MongoDB',
    difficulty: 'medium',
    type: 'basics',
    question: 'How does MongoDB indexing work? What index types exist and when do you use each?',
    answer:
      '**Indexes** in MongoDB store a small portion of the data in an ordered, traversable form — dramatically speeding up queries at the cost of extra storage and slower writes.\n\n**Index types:**\n\n- **Single field** — index on one field. MongoDB auto-creates one on `_id`.\n- **Compound** — index on multiple fields. Order matters — follows ESR rule: **Equality → Sort → Range**.\n- **Multikey** — automatically used when indexing an array field. Creates one entry per array element.\n- **Text** — full-text search on string fields. Supports `$text` queries.\n- **2dsphere** — geospatial queries (near, within polygon). Used for location data.\n- **TTL (Time To Live)** — automatically deletes documents after a set number of seconds. Perfect for sessions, logs, temp data.\n- **Partial** — only indexes documents matching a filter expression. Smaller and faster than a full index.\n- **Sparse** — only indexes documents where the field exists.\n\n**Key tools:**\n- `.explain("executionStats")` — shows whether a query used an index (`IXSCAN`) or scanned all docs (`COLLSCAN`)\n- `db.collection.getIndexes()` — list all indexes\n- Always index fields used in `find()`, `sort()`, and aggregation `$match`',
    code: {
      language: 'javascript',
      snippet: `// Single field
db.users.createIndex({ email: 1 }, { unique: true });

// Compound — ESR rule: Equality first, then Sort, then Range
// For query: find active users in a date range, sorted by name
db.users.createIndex({ status: 1, name: 1, createdAt: 1 });

// Text index for full-text search
db.articles.createIndex({ title: 'text', content: 'text' });
db.articles.find({ $text: { $search: 'mongodb indexing' } });

// TTL index — auto-delete sessions after 1 hour
db.sessions.createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 });

// Partial index — only index active products (smaller index)
db.products.createIndex(
  { price: 1 },
  { partialFilterExpression: { status: 'active' } }
);

// 2dsphere for geospatial
db.places.createIndex({ location: '2dsphere' });
db.places.find({
  location: {
    $near: {
      $geometry: { type: 'Point', coordinates: [121.0, 14.6] },
      $maxDistance: 5000,   // 5km radius
    }
  }
});

// explain — check if index is used
db.users.find({ email: 'test@example.com' }).explain('executionStats');
// Look for: winningPlan.stage === 'IXSCAN' (good) vs 'COLLSCAN' (bad)`,
    },
  },

  {
    id: 'mongo-m3',
    category: 'MongoDB',
    difficulty: 'medium',
    type: 'basics',
    question: 'When do you embed vs reference documents in MongoDB? What are the trade-offs?',
    answer:
      '**Schema design in MongoDB** is driven by your application\'s query patterns, not normalization theory.\n\n**Embedding** — store related data inside the parent document.\n- **Use when:** data is always accessed together, one-to-few relationship, child data doesn\'t need to be queried independently\n- **Pros:** single read to get all data, no joins, atomic updates on the parent document\n- **Cons:** document size grows (16MB BSON limit), duplication if the same sub-doc is referenced by many parents, unbounded arrays can cause performance problems\n\n**Referencing** — store only the `ObjectId` in the parent, full data in a separate collection.\n- **Use when:** many-to-many relationships, child docs are large or frequently updated, child docs are queried independently\n- **Pros:** avoids duplication, independent updates, no document bloat\n- **Cons:** requires `$lookup` (aggregation join) or Mongoose `populate()` — extra query\n\n**Decision rules:**\n- "Do you always need Y when you fetch X?" → embed\n- "Can Y belong to many X?" → reference\n- "Can Y grow unboundedly?" → reference (never embed unbounded arrays)\n- "Do you need to query Y without X?" → reference',
    code: {
      language: 'javascript',
      snippet: `// ✅ EMBED: blog post with comments (few, always read together)
{
  _id: ObjectId("..."),
  title: "MongoDB Schema Design",
  content: "...",
  comments: [                      // embedded — fetched with post
    { author: "Alice", text: "Great post!", date: ISODate("2024-06-01") },
    { author: "Bob",   text: "Very helpful", date: ISODate("2024-06-02") },
  ]
}

// ✅ REFERENCE: orders referencing products (M:M, products queried independently)
// orders collection
{
  _id: ObjectId("..."),
  userId: ObjectId("user123"),
  items: [
    { productId: ObjectId("prod1"), qty: 2, priceSnapshot: 29.99 },
    { productId: ObjectId("prod2"), qty: 1, priceSnapshot: 49.99 },
  ]
}

// products collection — updated independently
{ _id: ObjectId("prod1"), name: "Widget", price: 32.99, stock: 145 }

// Mongoose populate (reference resolution)
const order = await Order
  .findById(id)
  .populate('userId', 'name email')        // only fetch name & email
  .lean();

// $lookup in aggregation (more control)
db.orders.aggregate([
  { $lookup: { from: 'products', localField: 'items.productId', foreignField: '_id', as: 'products' } }
]);`,
    },
  },

  {
    id: 'mongo-h1',
    category: 'MongoDB',
    difficulty: 'hard',
    type: 'basics',
    question: 'How do MongoDB transactions work? What are replica sets and why are they required?',
    answer:
      '**MongoDB multi-document transactions** (4.0+) provide ACID guarantees across multiple documents and collections — similar to SQL transactions. They require a **replica set** or sharded cluster.\n\n**Replica set** — a group of MongoDB nodes (typically 3) that maintain the same data:\n- **Primary** — handles all writes\n- **Secondaries** — replicate from primary asynchronously, can serve reads\n- **Automatic failover** — if primary goes down, secondaries elect a new primary within ~10 seconds\n\n**Why transactions need a replica set:** MongoDB uses the oplog (operation log) on replica sets to enable the rollback mechanism that multi-document transactions depend on.\n\n**Transaction caveats:**\n- **Performance cost** — transactions hold locks, increase latency\n- **16MB limit** applies to the whole transaction\n- **Max runtime** — 60 seconds by default\n- **Prefer embedding** for atomic updates on a single document — no transaction needed (MongoDB guarantees atomicity on a single document natively)\n\n**Rule:** design your schema to avoid needing transactions. When you do need them, they work — but reach for them sparingly.',
    code: {
      language: 'typescript',
      snippet: `import mongoose from 'mongoose';

async function transferFunds(fromId: string, toId: string, amount: number) {
  const session = await mongoose.startSession();

  try {
    session.startTransaction({
      readConcern:  { level: 'snapshot' },
      writeConcern: { w: 'majority' },
    });

    const from = await Account.findById(fromId).session(session);
    const to   = await Account.findById(toId).session(session);

    if (!from || from.balance < amount) {
      throw new Error('Insufficient funds');
    }

    await Account.updateOne(
      { _id: fromId },
      { $inc: { balance: -amount } },
      { session }
    );

    await Account.updateOne(
      { _id: toId },
      { $inc: { balance: amount } },
      { session }
    );

    // Log the transfer
    await Transaction.create(
      [{ from: fromId, to: toId, amount, date: new Date() }],
      { session }
    );

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();   // rolls back all writes in this session
    throw err;
  } finally {
    session.endSession();
  }
}`,
    },
  },
];
