/* question-banks-b: three question-bank chapters - system design, ML foundations, and LLMs/inference/RAG/agents. */
(function (root) {
  'use strict';
  root.PREP_CORE = root.PREP_CORE || {};

  root.PREP_CORE['question-bank-system-design'] = {
    id: 'question-bank-system-design',
    title: 'Question bank: system design',
    level: 'warning',
    levelLabel: 'Answers are hidden - try first',
    why: `Fifty-four questions on system design, in the order interviewers actually ask them: estimation and the basics first, then APIs and databases, then the harder distributed-systems and reliability material that separates a senior answer from a staff one. The answers are hidden on purpose - try each question yourself before reading it, so you find out what you do not know rather than reading past it. This bank covers general system design only; the two older banks in this course cover decision systems (forecasting, optimisation, control) and production ML platform work, and the other two new banks cover machine learning foundations and language model engineering.`,
    learn: [
      {
        id: 'qbsd-1',
        part: 'field',
        title: 'Fundamentals and estimation — 6 questions',
        body: `<ul>
<li><b>Q1.</b> How do you approach a system design interview in the first five minutes?</li>
<li><b>Q2.</b> What are the standard latency numbers every engineer should know?</li>
<li><b>Q3.</b> How do you estimate QPS and storage needs from a rough user count?</li>
<li><b>Q4.</b> What is the difference between availability and durability, and how do you compute nines?</li>
<li><b>Q5.</b> How do you decide between a monolith and microservices for a design?</li>
<li><b>Q6.</b> What is Little's Law and how do you use it to size a system?</li>
</ul>`,
        deeper: `<ul>
<li><b>A1.</b> Clarify functional scope - which features are in, which are explicitly out - and the two or three non-functional requirements that will drive the design, usually scale, latency and consistency. State rough numbers - users, requests per second, data size - before drawing anything, because the numbers decide whether you need one database or a sharded fleet. Then propose a simple high-level design (client, API, database, cache) and get agreement before adding detail; the design that is right for 10,000 users is often wrong for 100 million.</li>
<li><b>A2.</b> From the widely cited reference set: an L1 cache (the processor's smallest, fastest on-chip memory) reference is about 0.5 nanoseconds, a main memory reference about 100 nanoseconds, a random 4 KB (kilobyte) read from SSD about 150 microseconds, a round trip inside one data centre about 500 microseconds, a disk seek about 10 milliseconds, and a round trip between California and the Netherlands about 150 milliseconds. The ratios matter more than the exact figures: main memory is roughly 5,000 times faster than a round trip inside one data centre, and roughly a million times faster than a round trip between continents. Quoting even one of these with the right order of magnitude is worth more than saying "it's fast."</li>
<li><b>A3.</b> Start from daily active users, multiply by actions per user per day, divide by 86,400 seconds for average QPS (queries per second), then multiply by a peak factor - state it as an assumption, commonly anywhere from 2x to 10x depending on the product - for peak QPS. For storage, multiply records created per day by average record size and retention period, then add a replication factor (commonly 3x) and an index overhead factor (commonly 1.2-1.5x). Example: 10 million daily active users viewing 5 posts each is 50 million reads a day, so 50,000,000 / 86,400 is roughly 580 average QPS, and about 1,700 at a 3x peak - still small enough for a handful of instances behind a load balancer.</li>
<li><b>A4.</b> Availability is the fraction of time the system can correctly answer a request; durability is the probability that data, once accepted, is never lost, independent of whether the system is reachable right now. Nines convert to downtime per year: 99% is about 3.65 days, 99.9% is about 8.76 hours, 99.99% is about 52.6 minutes, and 99.999% is about 5.26 minutes - each extra nine cuts allowed downtime by roughly 10x.</li>
<li><b>A5.</b> Start with a monolith unless scale or team size says otherwise - it is simpler to build, deploy and debug, and most systems never need to split. Split when different parts must scale independently (video transcoding under completely different load than comments), when teams need to deploy independently, or when a component needs a fundamentally different technology. The cost of splitting early is real: network calls where there used to be function calls, and much more operational work to run.</li>
<li><b>A6.</b> Little's Law states L = λW: the average number of requests in a system (L) equals the arrival rate (λ) times the average time each request spends in the system (W). At 1,000 requests per second with a 200 millisecond average response time, the system holds about 1,000 x 0.2 = 200 requests at once, which is the number of concurrent connections or worker threads the service must be able to hold open. It is the fastest way to turn a throughput target and a latency target into a concurrency number without simulating anything.</li>
</ul>`,
        check: null
      },
      {
        id: 'qbsd-2',
        part: 'field',
        title: 'APIs, load balancing and communication — 6 questions',
        body: `<ul>
<li><b>Q7.</b> What is the difference between L4 and L7 load balancing?</li>
<li><b>Q8.</b> What load balancing algorithms exist and when do you use each?</li>
<li><b>Q9.</b> REST vs gRPC vs GraphQL — when do you pick each?</li>
<li><b>Q10.</b> How does a CDN reduce latency and load?</li>
<li><b>Q11.</b> What is the difference between synchronous and asynchronous APIs, and when do you use a webhook vs polling?</li>
<li><b>Q12.</b> How do you design pagination for a large, frequently updated dataset?</li>
</ul>`,
        deeper: `<ul>
<li><b>A7.</b> A layer 4 (transport layer) balancer routes on IP address and port without reading the request, so it is fast and protocol-agnostic but cannot route on content. A layer 7 (application layer) balancer reads the HTTP request - path, header, cookie, hostname - so it can route by URL, terminate TLS, retry a failed request, and rate-limit before the request reaches a service. The trade-off is cost: L7 does more work per request, which is why very high-throughput or non-HTTP traffic is often balanced at L4.</li>
<li><b>A8.</b> Round robin sends requests to replicas in turn, simplest but ignorant of how busy each replica is. Least connections sends the next request to whichever replica has the fewest open connections, better when requests take very different amounts of time. Consistent hashing routes a given key to the same replica every time, the right choice whenever a replica holds warm state - a cache, a loaded model, a sticky session - because it minimises how much state moves when replicas change. Weighted versions of any of these send more traffic to bigger machines.</li>
<li><b>A9.</b> REST is the default for a public or browser-facing API: it maps onto HTTP verbs, is cacheable with ordinary HTTP caching, and has the widest client support. gRPC is the default between your own services: Protocol Buffers give a typed schema checked at compile time and it runs over HTTP/2, at the cost of not being natively callable from a browser. GraphQL fits when one API must serve several very different client views of the same data, since the caller asks for exactly the fields it needs - the cost is that a flexible query is much harder to cache.</li>
<li><b>A10.</b> A CDN (content delivery network) caches content at edge locations physically close to users, so a static asset is served from a nearby point of presence instead of crossing continents to the origin - cutting a 150 millisecond transcontinental round trip to single-digit milliseconds. It also shields the origin: a popular file might be requested millions of times but fetched from the origin only once per edge location per TTL (time to live) window. The core win is always moving bytes physically closer to the reader.</li>
<li><b>A11.</b> A synchronous API blocks the caller until the work is done; an asynchronous one accepts the request, returns an acknowledgement immediately, and delivers the result later. Polling means the caller repeatedly asks "is it done yet," simple but wasteful; a webhook means the server calls the client back when ready, more efficient but the client must expose a reachable endpoint and handle failed delivery. Long-running work should be asynchronous; anything the user actively waits on with a sub-second expectation should stay synchronous.</li>
<li><b>A12.</b> Offset pagination (LIMIT/OFFSET) is simple but breaks under concurrent inserts - a row inserted before the current page shifts everything after it, and the database still scans past every skipped row as the offset grows. Cursor pagination returns a pointer, typically the last row's sort key and ID, and the next page asks for rows after that cursor, staying correct under concurrent writes and fast because it uses an index seek instead of a scan. The trade-off is you cannot jump to an arbitrary page number, only forward and backward - acceptable for almost every real feed or list.</li>
</ul>`,
        check: null
      },
      {
        id: 'qbsd-3',
        part: 'field',
        title: 'Databases, indexing and transactions — 6 questions',
        body: `<ul>
<li><b>Q13.</b> When do you choose SQL vs NoSQL?</li>
<li><b>Q14.</b> How does a B-tree index work and why does it make range queries fast?</li>
<li><b>Q15.</b> What is a composite index and how does column order matter?</li>
<li><b>Q16.</b> What are the ACID guarantees and what does each protect against?</li>
<li><b>Q17.</b> What is the difference between optimistic and pessimistic locking?</li>
<li><b>Q18.</b> What are the four SQL isolation levels and which anomalies do they allow?</li>
</ul>`,
        deeper: `<ul>
<li><b>A13.</b> Choose relational by default when data has clear relationships, the application needs multi-row transactions, and query patterns are not fully known up front. Choose NoSQL when you need to scale writes horizontally beyond one primary, the access pattern is simple and known in advance, or the data does not fit a fixed schema well. Most large systems use both: a relational store for core transactional data and NoSQL stores for pieces that need to scale differently, such as a session store or a feed.</li>
<li><b>A14.</b> A B-tree keeps keys sorted in a balanced tree where every leaf sits at the same depth, so lookup, insert or delete takes O(log n) comparisons - about 30 for a billion rows. Because keys are stored in sorted order, a range query finds the start with one O(log n) descent and reads sequentially forward instead of scanning the whole table. The cost falls on writes: every insert or delete may rebalance a page, and every index on a table is another structure updated on every write.</li>
<li><b>A15.</b> A composite index is one B-tree built over more than one column, compared in order - like sorting a phone book by last name, then first name. It can serve a query filtering on a prefix of the columns using the index, but generally cannot efficiently serve a query filtering only on a later column without scanning. The rule of thumb: put the equality-filtered column first and the range-filtered column last, and put the most selective column first when several columns are filtered by equality.</li>
<li><b>A16.</b> ACID stands for atomicity, consistency, isolation and durability. Atomicity means a transaction's writes all happen or none do, protecting against a partial update on a crash. Consistency means a transaction takes the database from one valid state to another, respecting constraints. Isolation means concurrent transactions do not see each other's uncommitted work, with the exact strength set by the isolation level. Durability means a committed transaction survives a crash, typically guaranteed by writing to a write-ahead log before acknowledging the commit.</li>
<li><b>A17.</b> Pessimistic locking takes a lock before reading or writing a row, blocking other transactions until release - safe under heavy contention but limits concurrency and risks deadlock. Optimistic locking reads a version number with the row and only commits the write if that version has not changed, retrying if it has. Optimistic wins when conflicts are rare, since it avoids paying for locks almost never contended; pessimistic wins when conflicts are common, since retrying an optimistic write repeatedly wastes more work than waiting for a lock.</li>
<li><b>A18.</b> Read uncommitted allows dirty reads and is rarely used. Read committed blocks dirty reads but allows a non-repeatable read (the same query run twice returns different rows), and is the default in PostgreSQL and Oracle. Repeatable read blocks non-repeatable reads but can allow a phantom read in some implementations, and is the default in MySQL's InnoDB, which additionally blocks phantoms with next-key locking: it locks not only the matching rows but the gaps between them, so no new row can be inserted into the range a query already read. Serializable is the strongest, giving the same result as if transactions ran one at a time, at the cost of the most blocking or retries.</li>
</ul>`,
        check: null
      },
      {
        id: 'qbsd-4',
        part: 'field',
        title: 'Sharding, consistent hashing and IDs — 6 questions',
        body: `<ul>
<li><b>Q19.</b> What is database sharding and what makes a good shard key?</li>
<li><b>Q20.</b> How does consistent hashing work and why does it reduce reshuffling?</li>
<li><b>Q21.</b> What causes a hot shard/hot key and how do you fix it?</li>
<li><b>Q22.</b> How would you design a globally unique ID generator (Snowflake)?</li>
<li><b>Q23.</b> What is the difference between range-based, hash-based, and directory-based sharding?</li>
<li><b>Q24.</b> How do you handle resharding/rebalancing without downtime?</li>
</ul>`,
        deeper: `<ul>
<li><b>A19.</b> Sharding splits one logical dataset across multiple physical nodes, with each row's shard chosen by a shard key, so no single node holds or serves all the data. A good shard key spreads both data and traffic evenly - high cardinality, no single value dominating - and matches the most common query pattern, since a query without the shard key has to fan out to every shard. Choosing a shard key that is also the most common filter, such as user ID, is usually the right first move.</li>
<li><b>A20.</b> Consistent hashing places nodes and keys onto positions on a fixed hash ring, and each key belongs to the first node found walking clockwise from its position. Adding or removing one node only affects the keys between it and its next neighbour on the ring, so on average only about 1/(N+1) of keys move when going from N to N+1 nodes - compared with plain hash-mod-N, where changing N reshuffles almost every key. Virtual nodes smooth out the uneven load a small number of real nodes would otherwise create.</li>
<li><b>A21.</b> A hot shard happens when the shard key does not distribute traffic evenly - a celebrity user, a viral post, or a key like date that puts all of today's writes on one shard. Fixes include a better key (a composite key, or a hash of the key), splitting a hot key's data further with a random suffix fanned out on write and merged on read, aggressively caching the hot key's reads, and giving a genuinely hot entity dedicated capacity rather than forcing it through the same shard as everything else.</li>
<li><b>A22.</b> Twitter's Snowflake packs a 64-bit integer as roughly 41 bits of milliseconds since a custom epoch, 10 bits identifying the generating machine, and 12 bits of a per-millisecond sequence counter - unique without a central coordinator, roughly sortable by time, and capable of up to 4,096 IDs per millisecond per machine. Because each generator only needs its own clock and machine ID, there is no cross-node coordination on the hot path, which is why Snowflake-style IDs scale far better than an auto-increment column.</li>
<li><b>A23.</b> Range-based sharding assigns contiguous key ranges to each shard, making range queries fast but risking hot shards if data is unevenly spread. Hash-based sharding hashes the key to choose a shard, spreading load evenly but destroying ordering, so a range query fans out to every shard. Directory-based sharding keeps an explicit lookup table mapping key ranges to shards, the most flexible for rebalancing, but that table becomes a new component that must itself be fast and highly available.</li>
<li><b>A24.</b> Add the new shard, then dual-write new writes to both old and new locations while a background job copies existing rows and tracks a watermark of progress. Reads are served from the old location until the copy catches up for that key, then cut over reads gradually to the new location, and only stop writing to the old location once confident and with a rollback window. Dual write, backfill, verify, cut over, clean up is the general recipe for any online data migration, not just resharding.</li>
</ul>`,
        check: null
      },
      {
        id: 'qbsd-5',
        part: 'field',
        title: 'Caching — 6 questions',
        body: `<ul>
<li><b>Q25.</b> What is the difference between cache-aside, read-through, and write-through/write-back?</li>
<li><b>Q26.</b> How do you choose a TTL and avoid the thundering herd/cache stampede problem?</li>
<li><b>Q27.</b> What eviction policies exist (LRU, LFU) and when does each fail?</li>
<li><b>Q28.</b> What is cache invalidation and why is it hard?</li>
<li><b>Q29.</b> Where do you put a cache in a multi-tier architecture (client, CDN, application, database)?</li>
<li><b>Q30.</b> How do you keep a distributed cache consistent across multiple app servers?</li>
</ul>`,
        deeper: `<ul>
<li><b>A25.</b> Cache-aside has the application check the cache first, and on a miss reads the database and writes the result into the cache itself - simple and most common, but every service touching the data must implement the same logic. Read-through puts that logic inside a cache library or proxy instead. Write-through writes to cache and database together on every write, keeping them in sync at the cost of extra write latency; write-back writes to the cache immediately and flushes to the database asynchronously, fast but risking a lost write if the cache fails before the flush.</li>
<li><b>A26.</b> TTL balances staleness against database load: shorter keeps data fresher but sends more requests to the database, longer protects the database but risks staler reads. A cache stampede happens when a hot key expires and many concurrent requests all miss and hit the database at once; fixes are jitter (randomising each key's TTL by a few percent), a single-flight lock (only one request recomputes while others wait), and stale-while-revalidate (serving the expired value while one request refreshes it in the background).</li>
<li><b>A27.</b> LRU (least recently used) evicts whichever key was accessed longest ago, which works well normally but can be defeated by a large one-time scan flushing genuinely hot keys out. LFU (least frequently used) evicts the key with the fewest total accesses, resisting that scan but able to trap a key that was popular last week and is cold now, mitigated with decaying counts. Redis's default approximates LRU by sampling a small number of keys rather than tracking exact recency for all of them.</li>
<li><b>A28.</b> Cache invalidation removes or updates a cached value when the underlying data changes, so readers stop seeing stale data. It is hard because the cache and the source of truth can be updated by different code paths, a single entity can be cached under many keys, and a network partition can leave an invalidation message undelivered with no automatic retry. Phil Karlton's line about cache invalidation being one of the two hard problems in computer science exists because every fix trades some freshness or complexity, and none makes the problem disappear.</li>
<li><b>A29.</b> Caches stack from closest-to-the-user to closest-to-the-data: a browser cache avoids a network call entirely, a CDN edge cache serves static content near the user, an application-layer cache sits between the service and the database, and the database's own buffer pool caches recently used pages in memory. Each layer trades freshness for speed and must be invalidated independently, so the design question is always which layer actually removes load from the bottleneck.</li>
<li><b>A30.</b> A shared cache that every app server talks to sidesteps consistency by having only one copy of the cached value, at the cost of a network hop. A local, in-process cache on each server is faster but now has N independent copies that can disagree, so invalidation must be broadcast to every instance, typically via pub/sub (publish/subscribe messaging, where every subscribed instance receives a published message). A common pattern uses both: a shared cache as the source of cached truth, with a short-TTL local cache in front for the hottest keys.</li>
</ul>`,
        check: null
      },
      {
        id: 'qbsd-6',
        part: 'field',
        title: 'Distributed systems, consistency and consensus — 6 questions',
        body: `<ul>
<li><b>Q31.</b> State CAP theorem precisely — what does it actually forbid?</li>
<li><b>Q32.</b> What is the difference between strong, eventual, and read-your-writes consistency?</li>
<li><b>Q33.</b> How does the Raft/Paxos consensus algorithm achieve agreement, at a high level?</li>
<li><b>Q34.</b> What is a quorum, and how do read/write quorums (R+W>N) trade off consistency and availability?</li>
<li><b>Q35.</b> What is a vector clock and what problem does it solve?</li>
<li><b>Q36.</b> What is the difference between two-phase commit and the Saga pattern for distributed transactions?</li>
</ul>`,
        deeper: `<ul>
<li><b>A31.</b> CAP (consistency, availability, partition tolerance) says that during a network partition, a distributed data store must choose between consistency (every read sees the latest write) and availability (every request gets a response) - it says nothing about behaviour when there is no partition. A CP system, such as a majority-quorum config store like etcd, refuses requests it cannot guarantee are consistent during a partition; an AP system, such as Cassandra or DynamoDB in its default mode, keeps answering with whatever data it has and reconciles afterward.</li>
<li><b>A32.</b> Strong consistency guarantees every read sees the most recent write, as if there were only one copy - simplest to reason about, most expensive across regions. Eventual consistency guarantees replicas converge "eventually," usually milliseconds to low seconds, but a read right after a write may return a stale value. Read-your-writes is a middle ground: a specific client is guaranteed to see its own writes immediately, often by routing that client's reads to the replica it wrote to, even though other clients might briefly see a stale value.</li>
<li><b>A33.</b> Raft elects a single leader via randomised election timeouts, and only the leader accepts writes, appending them to a replicated log and forwarding them to followers. A write is committed once a majority of nodes (N/2+1) have durably stored it, so the system tolerates up to (N-1)/2 node failures without losing committed data. Paxos solves the same problem with a two-phase proposer/acceptor protocol rather than a stable leader; Raft was designed to be easier to understand and implement correctly, which is why etcd, Consul and CockroachDB use it.</li>
<li><b>A34.</b> With N replicas, write quorum W is how many replicas must acknowledge a write; read quorum R is how many a read must contact and compare. If R + W > N, every read quorum and write quorum overlap by at least one replica, guaranteeing the read sees the latest write - lower W and R favour availability and latency, W=N or R=N favour consistency at the cost of blocking if any replica is unreachable. Systems like DynamoDB and Cassandra let you dial R and W per request.</li>
<li><b>A35.</b> A vector clock is a per-key counter maintained per replica, incremented on every write and attached to the value, used to detect whether one version happened-before, happened-after, or is genuinely concurrent with another. It solves what plain timestamps cannot: wall-clock time cannot reliably order events across machines with clock drift, but comparing two vector clocks tells you unambiguously whether one is an ancestor of the other or whether they conflict, as Amazon's original Dynamo design does by returning both versions to the application.</li>
<li><b>A36.</b> Two-phase commit gives atomicity across databases by having a coordinator ask every participant to prepare, then telling everyone to commit only once all have agreed - strongly consistent, but it holds locks across a network round trip and blocks if the coordinator crashes mid-protocol. A saga instead runs a sequence of local transactions, each with a compensating action that undoes it if a later step fails - it scales far better and holds no locks, but intermediate states are visible to other readers and every step needs a working compensating action.</li>
</ul>`,
        check: null
      },
      {
        id: 'qbsd-7',
        part: 'field',
        title: 'Queues, streams and storage engines — 6 questions',
        body: `<ul>
<li><b>Q37.</b> What problem does a message queue solve, and when do you choose Kafka vs a queue like SQS/RabbitMQ?</li>
<li><b>Q38.</b> What delivery guarantees exist, and how do you build exactly-once in practice?</li>
<li><b>Q39.</b> What is the difference between a queue and a log (partitioned stream)?</li>
<li><b>Q40.</b> How does an LSM-tree storage engine work and why is it write-optimized?</li>
<li><b>Q41.</b> What is a write-ahead log for and how does it enable crash recovery?</li>
<li><b>Q42.</b> How do you handle backpressure when a consumer is slower than a producer?</li>
</ul>`,
        deeper: `<ul>
<li><b>A37.</b> A queue decouples a producer from a consumer: the producer moves on without waiting, and a traffic spike becomes a backlog instead of dropped requests. Choose a traditional queue when you need per-message work distribution to one consumer, with the queue tracking and deleting each message once processed. Choose Kafka when multiple independent consumer groups need to read the same events at their own pace, replay history, or handle very high sustained throughput, since Kafka keeps an ordered, retained log per partition rather than removing messages once read.</li>
<li><b>A38.</b> At-most-once delivery can silently drop a message; at-least-once retries until acknowledged, so a message can arrive more than once - real transports and most queues default to at-least-once. Exactly-once is not something the transport gives you honestly; it is an end-to-end property built from at-least-once delivery plus an idempotency key on the consumer side, checked in the same transaction as the write. Kafka's exactly-once semantics achieves this internally with idempotent producers and transactions, but the moment the effect leaves Kafka you need your own idempotency key again.</li>
<li><b>A39.</b> A queue typically removes a message once acknowledged, so once processed it is gone. A log retains messages for a configured period regardless of whether they have been read, and multiple independent consumer groups each track their own offset into the same log, so many services can read the same stream at their own pace and a new consumer can replay from the beginning. This is why a log fits event sourcing or analytics better, while a queue fits pure task distribution better.</li>
<li><b>A40.</b> A log-structured merge-tree buffers writes in memory (a memtable), and once it reaches a size threshold, flushes it to disk as an immutable sorted file (an SSTable) - writes are always sequential appends, never in-place random updates, which is why LSM-trees are much faster to write to than a B-tree. The cost falls on reads and space: a read may check the memtable and several SSTables before finding the latest value, and background compaction merges and cleans up SSTables over time using extra I/O to keep read amplification and disk usage under control.</li>
<li><b>A41.</b> A write-ahead log is an append-only record of every change, written to durable storage before the change is applied or acknowledged. On a crash, recovery replays the WAL from the last checkpoint forward, reapplying anything logged but not yet reflected in the main data files - which guarantees durability without flushing every page to disk on every write. It is the same mechanism whether called a WAL in Postgres, a commit log in Cassandra, or a redo log in MySQL's InnoDB.</li>
<li><b>A42.</b> First, let the queue absorb the burst up to a bounded size, so a spike becomes a backlog rather than dropped requests. When the backlog keeps growing, apply backpressure upstream: tell the producer to slow down, or reject new work at the edge with a clear error rather than accepting more than the system can ever catch up on. An unbounded queue just delays the failure and makes it worse, since by the time it manifests the backlog is much larger and requests have already timed out on the caller's side.</li>
</ul>`,
        check: null
      },
      {
        id: 'qbsd-8',
        part: 'field',
        title: 'Search, counting and realtime — 6 questions',
        body: `<ul>
<li><b>Q43.</b> How does an inverted index work for full text search?</li>
<li><b>Q44.</b> How would you design a typeahead/autocomplete system?</li>
<li><b>Q45.</b> How does HyperLogLog estimate cardinality, and what is its typical error?</li>
<li><b>Q46.</b> How does a Bloom filter work and what is the false-positive tradeoff?</li>
<li><b>Q47.</b> How would you design a real-time news feed/notification system (fan-out on write vs read)?</li>
<li><b>Q48.</b> How would you design a real-time leaderboard?</li>
</ul>`,
        deeper: `<ul>
<li><b>A43.</b> An inverted index maps each distinct term to the documents that contain it - the inverse of a forward index mapping documents to terms. A search for a word is a direct lookup instead of scanning every document, and a multi-word query intersects the posting lists for each term; ranking then scores each matching document by term frequency, inverse document frequency and document length. Building the index costs write time - every document must be tokenised and every term's posting list updated - the same trade as any other index.</li>
<li><b>A44.</b> Precompute a trie over popular queries, with each node caching its top-k most frequent completions so a lookup is O(length of prefix). Because the dataset can be large, an offline job periodically rebuilds the trie and its frequency counts from search logs, and the live service serves reads from a read-optimized, often in-memory or CDN-cached, snapshot. Personalisation is usually layered on top of the global top-k rather than baked into one giant trie per user.</li>
<li><b>A45.</b> HyperLogLog estimates distinct elements in a very large set using a small fixed amount of memory, by hashing each element and keeping, per bucket, the largest number of leading zeros it has ever seen in a hash - a long run of leading zeros is statistically rare, so seeing one implies many distinct elements have been hashed. Redis's implementation uses 16,384 registers in about 12 kilobytes total and gets a standard error of about 0.81%, regardless of whether you are counting a thousand or a billion unique items.</li>
<li><b>A46.</b> A Bloom filter is a bit array plus several independent hash functions; adding an element sets the bits at each hash function's output, and checking membership tests whether all those bits are set. It never produces a false negative, but it can produce a false positive if enough of its bits happen to be set by other elements - the false-positive rate rises as more elements are added and falls with more bits per element or more hash functions. It is used for a fast, cheap "definitely not here, skip the expensive lookup" check, such as before an SSTable disk read.</li>
<li><b>A47.</b> Fan-out on write pre-computes each follower's feed at post time, pushing the new post into every follower's feed list immediately, making reads a single fast lookup - ideal for a normal follower count. Fan-out on read merges each followed user's recent posts at read time, avoiding the write blow-up of a celebrity account with millions of followers but making every read more expensive. The standard answer is a hybrid: fan out on write for almost everyone, fan out on read for accounts above a follower-count threshold - the publicly described design of Twitter's feed.</li>
<li><b>A48.</b> A sorted set, backed by a skip list, keeps members ordered by score with O(log n) insert/update and O(log n + k) range queries, so "top 10" or "this player's rank" are both fast with millions of members. Because it is in-memory, updates and queries run in low single-digit milliseconds; for very large or partitioned leaderboards, each shard keeps its own sorted set and a separate step merges the top results across shards, with persistence to a durable store happening asynchronously in the background.</li>
</ul>`,
        check: null
      },
      {
        id: 'qbsd-9',
        part: 'field',
        title: 'Reliability, SRE and rate limiting — 6 questions',
        body: `<ul>
<li><b>Q49.</b> How do you design a rate limiter (token bucket vs leaky bucket vs sliding window counter)?</li>
<li><b>Q50.</b> What are SLI, SLO, SLA and error budgets, and how do you compute one?</li>
<li><b>Q51.</b> What is a circuit breaker and what are its three states?</li>
<li><b>Q52.</b> How do you design a system for graceful degradation under overload (load shedding)?</li>
<li><b>Q53.</b> How do you do a zero-downtime deployment / rollback strategy?</li>
<li><b>Q54.</b> How do you design health checks and readiness/liveness probes for auto-recovery?</li>
</ul>`,
        deeper: `<ul>
<li><b>A49.</b> A token bucket holds a capped number of tokens that refill at a fixed rate; each request spends one token, and a request is rejected only when the bucket is empty, naturally allowing short bursts up to the bucket size. A leaky bucket instead processes requests at a strictly constant output rate regardless of how bursty the input is, smoothing traffic to a downstream system but adding queuing delay. A sliding window counter counts requests in a moving time window rather than a fixed one, avoiding the edge case where two bursts fall just either side of a fixed-window boundary. Token bucket, backed by a counter and timestamp in Redis, is the most common default.</li>
<li><b>A50.</b> An SLI (service level indicator) is the measured number, such as the percentage of requests under 300 milliseconds. An SLO (service level objective) is the internal target for that indicator, such as 99.9% under 300 milliseconds over a rolling 30 days. An SLA (service level agreement) is the external, usually contractual, promise, often looser than the SLO to leave margin. The error budget is 100% minus the SLO, converted into allowed failure: a 99.9% SLO over 30 days permits about 43.2 minutes of downtime; once spent, the team should stop shipping new features and focus on reliability.</li>
<li><b>A51.</b> A circuit breaker wraps a call to a dependency and tracks its recent failure rate; in the closed state, calls pass through normally. Once failures cross a threshold it trips to open, failing fast immediately without attempting the call, protecting both the caller and the struggling dependency. After a cooldown it moves to half-open, letting a small number of trial requests through - closing again if they succeed, reopening if they fail - which lets the system recover automatically rather than needing a human to reset it.</li>
<li><b>A52.</b> Decide in advance which work is essential and which is not, and shed non-essential work first when overloaded - a cached or simplified response instead of a personalised one, or rejecting low-priority background jobs while keeping checkout healthy. Detect overload with a leading indicator such as queue depth or latency crossing a threshold rather than waiting for outright errors, and shed load at the edge before expensive work has started. A system under load should serve fewer things well rather than serve everything badly.</li>
<li><b>A53.</b> In a rolling deployment, new replicas must pass a readiness check before receiving traffic, while old replicas stop receiving new requests and are given a drain period longer than the slowest request still running before being terminated. Blue-green runs the new version fully alongside the old and switches all traffic at once, making rollback instant at the cost of running two full environments briefly. Canary releases send a small percentage of real traffic to the new version first, watch error rate and latency, and ramp up only if it looks healthy.</li>
<li><b>A54.</b> A liveness probe answers "is this process alive or should it be restarted" and should be minimal, since a false positive kills a healthy process. A readiness probe answers "should this replica currently receive traffic" and should check that what this request path actually needs is reachable, without going so deep that one slow downstream pulls the whole fleet out of rotation at once. The two must be separate endpoints, because a replica can be alive but not ready - conflating them means either restarting healthy processes needlessly or serving traffic to a replica that cannot handle it.</li>
</ul>`,
        check: null
      }
    ],
    connect: null,
    activities: [
      {
        id: 'qbsd-a1',
        type: 'drill',
        title: 'Five questions, aloud, in five minutes: estimation to consensus',
        prompt: `Answer these five aloud, about one minute each, with a timer running and no notes: Q3 (estimating QPS and storage), Q9 (REST vs gRPC vs GraphQL), Q20 (how consistent hashing works), Q31 (what CAP actually forbids), Q49 (token bucket vs leaky bucket vs sliding window). Mark each fluent, recalled, or absent as you finish it, then say which chapter you would reread for anything absent.`,
        timeboxSec: 300,
        rubric: `Must-haves, applied to each of the five: (1) substantively correct; (2) delivered in under a minute without notes; (3) includes the specific number or formula the bank's answer carries - the stated peak factor and the division by 86,400 for Q3, the fraction of keys that move on a ring for Q20, the partition-only condition for CAP, and the token-bucket refill rule for Q49; (4) names the trade-off, not just the mechanism, for Q9 and Q49 specifically; (5) an honest fluent/recalled/absent mark on each answer, with a stated remediation for any absent one. Common mistakes: reciting a definition with no number attached; stating that CAP bans consistency and availability together rather than only under a partition; describing token bucket and leaky bucket as interchangeable. {{HONESTY}}`,
        model: `<p>"For estimating QPS and storage, I'd take daily active users times actions per user per day, divide by 86,400 seconds for average QPS, then multiply by a stated peak factor - and for storage, multiply record count by size and retention, then add a replication factor around three times. For the API choice, REST for a public API because it's cacheable and universally supported, gRPC between my own services because the typed schema catches a contract mismatch at compile time, GraphQL when different clients need very different slices of the same data. For consistent hashing, it places nodes and keys on a hash ring, so adding one node only moves about one over N of the keys instead of reshuffling everything a plain hash-mod-N scheme would. For CAP, it only constrains behaviour during an actual network partition - outside a partition a system can be both consistent and available. For rate limiting, a token bucket refills at a fixed rate and allows bursts up to the bucket size, while a leaky bucket forces a constant output rate no matter how bursty the input is."</p>
<p>I'd mark each fluent if it came out inside a minute with the number attached, recalled if I had to assemble it, and reread whichever chapter covers anything I could not answer, the same day.</p>`
      },
      {
        id: 'qbsd-a2',
        type: 'drill',
        title: 'Five more, aloud, in five minutes: capacity math to reliability',
        prompt: `Answer these five aloud, about one minute each, no notes: Q6 (Little's Law), Q14 (why a B-tree makes range queries fast), Q25 (cache-aside vs write-through vs write-back), Q37 (queue vs Kafka), Q50 (SLI, SLO, SLA and the error budget number). Mark each fluent, recalled, or absent.`,
        timeboxSec: 300,
        rubric: `Must-haves, applied to each of the five: (1) substantively correct; (2) under a minute, no notes; (3) states the actual formula or number where one exists - L = λW, O(log n), the 43.2-minute error budget for a 99.9% SLO over 30 days; (4) distinguishes the three caching strategies from each other by name and cost, not just "caching is faster"; (5) an honest fluent/recalled/absent mark with a remediation plan for any gap. Common mistakes: stating Little's Law without naming what each letter is; explaining a B-tree without connecting it to why range queries specifically benefit; conflating SLO and SLA. {{HONESTY}}`,
        model: `<p>"Little's Law says L equals lambda times W - the number of requests in the system equals the arrival rate times the average time each one spends there - so at a thousand requests a second and two hundred milliseconds each, I need to hold about two hundred concurrent connections open. A B-tree keeps keys sorted in a balanced tree with every leaf at the same depth, so a range query finds the start in about log-n steps and then just reads forward, instead of scanning the table. Cache-aside has the application read the database on a miss and write the result into the cache itself; write-through updates the cache and database together on every write; write-back writes to the cache immediately and flushes to the database later, which is fast but risks losing the write if the cache fails first. I'd reach for a plain queue when I need one consumer to do each unit of work once, and for Kafka when several independent consumer groups need to read the same events at their own pace or replay history. And for reliability, an SLO is the internal target, an SLA is the external promise, and a 99.9% SLO over thirty days gives an error budget of about forty-three minutes of allowed downtime."</p>
<p>Anything I marked recalled rather than fluent, I would answer again tomorrow without rereading first, to see if it has actually stuck.</p>`
      }
    ],
    sayQuestion: null,
    sayItOutLoud: null,
    readings: [
      { l: 'A Crash Course in Caching - Part 1 (ByteByteGo)', u: 'https://blog.bytebytego.com/p/a-crash-course-in-caching-part-1', w: 'Alex Xu explaining the caching patterns and terms this chapter uses, from the newsletter most system design interviewers themselves read.', m: 12 },
      { l: 'Service Level Objectives (Google SRE Book, chapter 4)', u: 'https://sre.google/sre-book/service-level-objectives/', w: 'The primary source for SLI, SLO, SLA and error budgets, with a worked example the numbers in this chapter follow.', m: 25 },
      { l: 'Timeouts, retries and backoff with jitter (Amazon Builders\' Library)', u: 'https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/', w: 'A production account, from engineers who have been paged for it, of why naive retries cause outages and how jitter fixes it.', m: 20 },
      { l: 'What is Consistent Hashing and Where is it used? (YouTube)', u: 'https://www.youtube.com/watch?v=zaRkONvyGr8', w: 'A short, visual walk-through of the hash ring and why adding a node only reshuffles a small slice of keys.', m: 10 },
      { l: 'Redis new data structure: the HyperLogLog (antirez)', u: 'https://antirez.com/news/75', w: 'The Redis creator explaining HyperLogLog\'s memory and error numbers directly - 12 kilobytes per key, 0.81% standard error.', m: 10 },
      { l: 'Designing A Data-Intensive Future (Martin Kleppmann and Jesse Anderson, GOTO 2023)', u: 'https://www.youtube.com/watch?v=P-9FwZxO1zE', w: 'The author of Designing Data-Intensive Applications discussing consistency and replication in conversation rather than lecture form.', m: 35 }
    ]
  };

  root.PREP_CORE['question-bank-ml-foundations'] = {
    id: 'question-bank-ml-foundations',
    title: 'Question bank: machine learning foundations',
    level: 'warning',
    levelLabel: 'Answers are hidden - try first',
    why: `Fifty-two questions covering the maths, the classical models, and the deep learning and transformer mechanics that machine learning interviews return to again and again, ordered from the most universally asked to the more specialised. The answers are hidden so you have to try first. This bank stops at the modelling and maths; running a model in production is covered by the production ML engineering bank, and language models specifically by the LLM bank.`,
    learn: [
      {
        id: 'qbmlf-1',
        part: 'field',
        title: 'Maths and probability — 7 questions',
        body: `<ul>
<li><b>Q1.</b> Explain Bayes' theorem and give one worked example.</li>
<li><b>Q2.</b> What is the bias-variance tradeoff?</li>
<li><b>Q3.</b> What is the difference between a probability density and a probability mass function?</li>
<li><b>Q4.</b> What is maximum likelihood estimation, and how does it relate to cross-entropy loss?</li>
<li><b>Q5.</b> Explain the central limit theorem and why it matters for A/B testing.</li>
<li><b>Q6.</b> What is the curse of dimensionality?</li>
<li><b>Q7.</b> What is the difference between correlation and causation, and how does a confounder create spurious correlation?</li>
</ul>`,
        deeper: `<ul>
<li><b>A1.</b> Bayes' theorem states P(A|B) = P(B|A) x P(A) / P(B): the probability of A given B equals the probability of B given A, times the prior probability of A, divided by the overall probability of B. Worked example: a disease affects 1% of a population, a test is 99% sensitive and 95% specific; given a positive result, P(disease|positive) = (0.99 x 0.01) / (0.99 x 0.01 + 0.05 x 0.99) is about 0.17 - only 17%, because the test's false positives among the large healthy majority outnumber its true positives among the small sick minority.</li>
<li><b>A2.</b> Bias is error from a model too simple to represent the true relationship; variance is error from a model too sensitive to the particular training sample it saw. Total expected error decomposes as bias squared plus variance plus irreducible noise, and the two usually move in opposite directions as capacity changes - more capacity lowers bias but raises variance. The practical read-off: high error on both training and validation points to bias; low training error but much higher validation error points to variance.</li>
<li><b>A3.</b> A probability mass function applies to a discrete random variable and gives the actual probability of each outcome directly, so its values sum to 1 - a fair die's PMF is 1/6 at each face. A probability density function applies to a continuous random variable, and its value at a point is not itself a probability; only the area under the curve over an interval is a probability, and that area integrates to 1 over the whole range - which is why a PDF's value can exceed 1 while a PMF's value never can.</li>
<li><b>A4.</b> Maximum likelihood estimation picks the parameters that make the observed data most probable under the model. For classification, maximising that likelihood is mathematically the same as minimising its negative log, and the negative log-likelihood for a categorical outcome is exactly cross-entropy loss - so training with cross-entropy is, underneath, maximum likelihood estimation. This is why cross-entropy is the natural loss for a model whose output is a probability distribution.</li>
<li><b>A5.</b> The central limit theorem says the distribution of the sample mean of many independent, identically distributed random variables approaches a normal distribution regardless of the original distribution's shape, once the sample size is large enough - in practice often around 30 or more, more for heavily skewed distributions. This justifies using a normal-based confidence interval or a t-test on the difference of two group means in an A/B test even when the underlying metric, such as revenue per user, is itself heavily skewed, as long as each group's sample is large enough.</li>
<li><b>A6.</b> As the number of features grows, the volume of the feature space grows exponentially, so a fixed amount of data covers an ever-shrinking fraction of it, and every pair of points ends up roughly equally far apart - which breaks distance-based methods like k-nearest neighbors, since "nearest" stops meaning much. It also means far more data is needed to fill the space densely enough to generalise well, which is why dimensionality reduction, feature selection, or a regularised model matter more as feature count grows relative to training examples.</li>
<li><b>A7.</b> Correlation means two variables move together statistically; causation means one variable's change actually produces the change in the other. A confounder is a third variable influencing both correlated variables, creating an association with no direct causal link - ice cream sales and drowning deaths both rise in summer, driven by hot weather, with no causal link between the two. Establishing causation generally needs a randomised experiment or a quasi-experimental design that rules out plausible confounders, not just a strong observed correlation.</li>
</ul>`,
        check: null
      },
      {
        id: 'qbmlf-2',
        part: 'field',
        title: 'Data, features and leakage — 6 questions',
        body: `<ul>
<li><b>Q8.</b> What is data leakage and give a common example.</li>
<li><b>Q9.</b> How do you handle missing data (MCAR/MAR/MNAR)?</li>
<li><b>Q10.</b> What is the difference between normalization and standardization, and when does each matter?</li>
<li><b>Q11.</b> How do you encode a high-cardinality categorical feature?</li>
<li><b>Q12.</b> What is target leakage via time, and how do you prevent it with time-based splits?</li>
<li><b>Q13.</b> How do you handle class imbalance?</li>
</ul>`,
        deeper: `<ul>
<li><b>A8.</b> Data leakage is when information that would not be available at prediction time ends up in the training data, making the model look far more accurate offline than in production. A common example: a feature computed from the outcome itself, such as "days the account was suspended" as a feature for predicting suspension - it only exists once the outcome has already happened. Another form is preprocessing using statistics computed over the whole dataset including the test set.</li>
<li><b>A9.</b> Missing completely at random (MCAR) means the chance of being missing has nothing to do with any value - simple mean imputation or dropping rows introduces little bias. Missing at random (MAR) means the chance depends on other observed variables - imputation using those variables works reasonably well. Missing not at random (MNAR) means the chance depends on the missing value itself, such as high earners declining to report income - no imputation method fully fixes this, so the honest response is a missingness indicator feature or an acknowledged bias.</li>
<li><b>A10.</b> Normalization rescales a feature to a fixed range, usually [0, 1], and is sensitive to outliers since one extreme value stretches the whole scale. Standardization subtracts the mean and divides by the standard deviation, giving mean 0 and standard deviation 1, and is more robust to a moderate number of outliers. Both matter for any algorithm computing distances or gradients across differently scaled features - k-nearest neighbors, k-means, gradient descent, regularised linear models. Tree-based models are scale-invariant and need neither.</li>
<li><b>A11.</b> One-hot encoding creates one binary column per category, fine for low cardinality but exploding the feature space for a category with hundreds or thousands of values. Target encoding replaces each category with a statistic of the target computed from training data, typically smoothed or cross-validated to avoid leakage, keeping the feature space small. Hashing encodes categories into a fixed number of buckets via a hash function, trading a small amount of collision noise for a bounded, memory-efficient representation regardless of how many categories exist.</li>
<li><b>A12.</b> Target leakage via time happens when a feature is technically present in the historical dataset but would not actually have been known at prediction time - a random train/test split can put a Wednesday row in training and a Monday row in test, letting the model implicitly learn from the future. The fix is a time-based (rolling-origin) split: train only on data up to a cut-off and evaluate only after it, moving the cut-off forward for cross-validation folds, and leaving a gap whenever a feature uses a lagged window that could straddle the cut-off.</li>
<li><b>A13.</b> First, choose a metric that is not misleading - accuracy on 99% negative data is misleading, so use precision, recall, F1 or PR-AUC instead. At the data level, oversampling the minority class, including synthetic methods like SMOTE (synthetic minority oversampling technique), which invents new minority-class rows by interpolating between real ones and their nearest neighbours, or undersampling the majority class can rebalance training, though undersampling discards data and oversampling risks overfitting to duplicates. At the algorithm level, class weighting penalises a mistake on the minority class more heavily without duplicating or discarding rows, and is usually the simplest first thing to try.</li>
</ul>`,
        check: null
      },
      {
        id: 'qbmlf-3',
        part: 'field',
        title: 'Linear models, trees and boosting — 7 questions',
        body: `<ul>
<li><b>Q14.</b> Derive/explain logistic regression's loss function.</li>
<li><b>Q15.</b> What is L1 vs L2 regularization and why does L1 induce sparsity?</li>
<li><b>Q16.</b> How does a decision tree choose a split (Gini/entropy/information gain)?</li>
<li><b>Q17.</b> What is the difference between bagging and boosting?</li>
<li><b>Q18.</b> Explain how gradient boosting works (fitting to residuals/gradients).</li>
<li><b>Q19.</b> What is the difference between XGBoost/LightGBM and a plain gradient boosting machine?</li>
<li><b>Q20.</b> How does random forest reduce variance compared to a single tree?</li>
</ul>`,
        deeper: `<ul>
<li><b>A14.</b> Logistic regression models P(y=1|x) = sigma(z), where z = w1*x1 + w2*x2 + ... + b and sigma is the sigmoid function 1/(1+e^-z), squashing any real number into (0, 1). Training by maximum likelihood leads to log-loss (binary cross-entropy): -[y log(p) + (1-y) log(1-p)] averaged over all examples - a heavy penalty when the model is confident and wrong, a small one when it is right or appropriately uncertain. Unlike squared error, log-loss specifically rewards well-calibrated probabilities, not just correct labels.</li>
<li><b>A15.</b> L2 (ridge) adds the sum of squared coefficients to the loss, shrinking every coefficient toward zero smoothly, which handles correlated features gracefully. L1 (lasso) adds the sum of absolute coefficients, and because its penalty's gradient stays constant rather than shrinking toward zero as the coefficient shrinks, it can push a coefficient all the way to exactly zero - geometrically, its diamond-shaped constraint region has corners on the axes, and the loss contour is likely to first touch the constraint at one of those corners. That is why L1 performs feature selection and L2 does not.</li>
<li><b>A16.</b> At each node, the tree considers every feature and threshold, and picks the split that most reduces impurity in the resulting children. Gini impurity measures the probability of misclassifying a randomly chosen element if labelled by the node's class distribution (1 minus the sum of squared class proportions); entropy measures the same idea in bits (-sum of p log2 p). Information gain is the reduction in entropy or Gini from parent to weighted average of children, and the tree greedily picks the highest-gain split at each step - a greedy, not globally optimal, algorithm.</li>
<li><b>A17.</b> Bagging trains many models independently and in parallel, each on a different bootstrap sample, then averages or votes - it mainly reduces variance, which is why it works so well with high-variance base learners like deep trees (random forest is bagging plus random feature subsets per split). Boosting trains models sequentially, each new one focusing on the mistakes of the ones before it, by reweighting misclassified examples or fitting the residual/gradient of the loss - it mainly reduces bias, and is more prone to overfitting than bagging without regularisation.</li>
<li><b>A18.</b> Gradient boosting builds an ensemble of typically shallow trees added one at a time, where each new tree predicts the negative gradient of the loss with respect to the current ensemble's predictions - for squared error that gradient is simply the residual, so "each tree fits the previous tree's errors" is exactly correct for that loss. Each tree's output is scaled by a learning rate, commonly 0.01 to 0.3, before being added to the running prediction, trading more boosting rounds for smaller, safer steps that resist overfitting.</li>
<li><b>A19.</b> XGBoost adds a second-order (Newton) approximation of the loss, using both gradient and Hessian, plus explicit L1/L2 regularisation on leaf weights, and a parallelised, cache-aware implementation that is much faster than a naive one. LightGBM speeds things up further with histogram-based split finding, bucketing continuous features into a fixed number of bins, and leaf-wise rather than level-wise tree growth, reaching lower training loss for the same leaf count at some added overfitting risk on small datasets.</li>
<li><b>A20.</b> Random forest trains many deep, low-bias, high-variance trees, each on a bootstrap sample of rows and, at each split, a random subset of features, then averages or votes their predictions. Averaging many weakly correlated models cancels out much of that individual variance while keeping the low bias of deep trees - the variance of the average of m weakly correlated estimators falls roughly as (1 + (m-1)rho)/m times a single estimator's variance, where rho is the between-tree correlation, which is exactly why decorrelating the trees via feature subsampling matters as much as averaging itself.</li>
</ul>`,
        check: null
      },
      {
        id: 'qbmlf-4',
        part: 'field',
        title: 'Evaluation and metrics — 6 questions',
        body: `<ul>
<li><b>Q21.</b> Precision vs recall, and F1 — when do you optimize for each?</li>
<li><b>Q22.</b> What is ROC-AUC vs PR-AUC, and when is PR-AUC more informative?</li>
<li><b>Q23.</b> What is a confusion matrix and what does each cell mean?</li>
<li><b>Q24.</b> What is k-fold cross-validation, and why not just a train/test split?</li>
<li><b>Q25.</b> What is calibration, and how do you check/fix it?</li>
<li><b>Q26.</b> How do you choose a classification threshold?</li>
</ul>`,
        deeper: `<ul>
<li><b>A21.</b> Precision is, of items predicted positive, what fraction actually are (TP, true positives, divided by TP plus FP, false positives); recall is, of items that actually are positive, what fraction the model found (TP divided by TP plus FN, false negatives). Optimise for precision when a false positive is expensive, such as blocking a real customer's transaction as fraud; optimise for recall when a false negative is expensive, such as missing an actual cancer case. F1 is the harmonic mean, 2 x precision x recall / (precision + recall), used for a single number that penalises an extreme imbalance rather than averaging arithmetically.</li>
<li><b>A22.</b> ROC-AUC (the area under the receiver operating characteristic curve) plots true positive rate against false positive rate across all thresholds and summarises the area under the curve, 0.5 random and 1.0 perfect; it is threshold-independent but can look deceptively good on imbalanced data, since false positive rate is measured against the large negative class. PR-AUC (the area under the precision-recall curve) plots precision against recall instead, and because precision is directly affected by how many negatives get misclassified relative to the small number of positives, it is far more informative when positives are rare.</li>
<li><b>A23.</b> A confusion matrix for binary classification is a 2x2 table: true positives (predicted positive, actually positive), false positives (predicted positive, actually negative), false negatives (predicted negative, actually positive), and true negatives (predicted negative, actually negative). Every other classification metric - precision, recall, specificity, accuracy, F1 - is a ratio computed from these four counts.</li>
<li><b>A24.</b> K-fold cross-validation splits the data into k roughly equal parts, commonly 5 or 10, trains on k-1 and validates on the remaining one, repeats k times so every part is validated on exactly once, and averages the scores. A single train/test split gives one noisy estimate that depends heavily on which rows ended up in the test set, especially with small data; k-fold uses every row for both roles across folds, giving a lower-variance estimate at the cost of training k times instead of once. For time series, use rolling-origin folds instead of random ones.</li>
<li><b>A25.</b> A model is calibrated when its predicted probabilities match observed frequencies - among all the times it predicts 30%, the event should happen about 30% of the time. Check it with a reliability diagram or a summary statistic like Brier score. If miscalibrated, which gradient-boosted trees and neural networks often are, fix it with a post-hoc step fit on held-out data: Platt scaling fits a logistic regression on top of the raw scores; isotonic regression fits a non-decreasing step function, more flexible but needing more calibration data.</li>
<li><b>A26.</b> The default 0.5 threshold is only correct when a false positive and a false negative cost the same, which is rare. The cost-minimising threshold on a well-calibrated model is C_fp / (C_fp + C_fn), so a false negative ten times costlier than a false positive pushes the threshold down toward roughly 0.09. In practice teams often set the threshold to hit an operational constraint instead, such as the volume a review team can process, which is why the threshold should usually be owned jointly with whoever bears the cost of getting it wrong.</li>
</ul>`,
        check: null
      },
      {
        id: 'qbmlf-5',
        part: 'field',
        title: 'Deep learning basics — 7 questions',
        body: `<ul>
<li><b>Q27.</b> Explain backpropagation and the chain rule in one paragraph.</li>
<li><b>Q28.</b> What is the vanishing/exploding gradient problem and how do ReLU/residual connections help?</li>
<li><b>Q29.</b> What is batch normalization and why does it help training?</li>
<li><b>Q30.</b> What is dropout and how does it act as regularization?</li>
<li><b>Q31.</b> Compare activation functions (sigmoid, tanh, ReLU, GELU).</li>
<li><b>Q32.</b> What is the universal approximation theorem, and why doesn't it mean deep networks are unnecessary?</li>
<li><b>Q33.</b> What is a convolutional layer and why does weight sharing help images?</li>
</ul>`,
        deeper: `<ul>
<li><b>A27.</b> Backpropagation computes the gradient of the loss with respect to every weight by applying the chain rule backward from the output: the gradient at any layer is the gradient flowing in from the layer after it, multiplied by the local derivative of that layer's own operation. Because each layer only needs its own local derivative and the gradient handed to it from downstream, the whole network's gradient is computed in one backward pass at roughly the cost of one forward pass - the alternative, finite differences per parameter, would cost one extra forward pass for every single weight.</li>
<li><b>A28.</b> The gradient reaching an early layer is a product of many per-layer derivatives; if those derivatives are consistently below 1, as with sigmoid or tanh near saturation, the product shrinks toward zero across many layers, and early layers barely learn - vanishing gradients. Consistently-above-1 derivatives cause the product to explode instead. ReLU's derivative is exactly 1 for any positive input, greatly reducing vanishing; residual connections add the identity function to a layer's output, giving the gradient a direct additive path back to earlier layers that bypasses the multiplicative chain entirely, which is what let ResNets and transformers train reliably at far greater depth.</li>
<li><b>A29.</b> Batch normalization normalises each layer's activations, per mini-batch, to zero mean and unit variance, then applies a learned scale and shift. It helps mainly by smoothing the loss landscape the optimiser sees, allowing a higher learning rate and faster convergence, and reducing sensitivity to weight initialisation; the original "reducing internal covariate shift" justification is now disputed, with smoother gradients seen as the more likely explanation. At inference it uses a running average of mean and variance collected during training rather than the current batch's statistics.</li>
<li><b>A30.</b> Dropout randomly zeroes a fraction of a layer's activations, commonly 0.2 to 0.5, on each training step, forcing the network not to rely on any single neuron or small co-adapted group, since it might not be there next step. At inference, dropout is turned off, with the scaling handled during training itself in the now-standard "inverted dropout" so no adjustment is needed at inference. It acts like training a large ensemble of thinned sub-networks sharing weights, reducing overfitting similarly to averaging many models in bagging.</li>
<li><b>A31.</b> Sigmoid squashes to (0, 1) and saturates at both ends, where its gradient nears zero, so it is now mostly used only at output layers for binary probabilities. Tanh squashes to (-1, 1), is zero-centred, but still saturates at both ends. ReLU (max(0, x)) does not saturate for positive inputs and is cheap, the long-standing hidden-layer default, though it can produce "dead" neurons whose weights drift so negative they never activate again. GELU, used in BERT, GPT and most modern transformers, is a smooth approximation weighting the input by its value under the standard normal cumulative distribution function (the probability that a standard normal variable falls below that point), which empirically trains slightly better in large transformer models.</li>
<li><b>A32.</b> The universal approximation theorem states a feedforward network with one hidden layer of enough neurons and a non-linear activation can approximate any continuous function on a compact domain to any desired accuracy. It does not say how many neurons that requires, and the required width can be exponentially large for functions a deeper, narrower network represents compactly with far fewer parameters - depth lets the network compose simple functions into complex ones layer by layer, both more parameter-efficient and empirically easier to train with gradient descent.</li>
<li><b>A33.</b> A convolutional layer slides a small learned filter across the input, computing a dot product at each position, so the same small set of weights is reused at every spatial location rather than learning a separate weight per pixel - cutting parameter count dramatically compared to a fully connected layer, and encoding translation invariance directly, since a filter that has learned to detect an edge will detect it wherever it appears. Stacking convolutional layers builds a hierarchy of increasingly abstract features - edges, then textures, then parts, then objects.</li>
</ul>`,
        check: null
      },
      {
        id: 'qbmlf-6',
        part: 'field',
        title: 'Transformers and attention — 6 questions',
        body: `<ul>
<li><b>Q34.</b> Explain scaled dot-product attention with the formula.</li>
<li><b>Q35.</b> Why is attention scaled by sqrt(d_k)?</li>
<li><b>Q36.</b> What is multi-head attention and why use multiple heads?</li>
<li><b>Q37.</b> What is positional encoding and why do transformers need it?</li>
<li><b>Q38.</b> What is the difference between an encoder-only, decoder-only, and encoder-decoder transformer?</li>
<li><b>Q39.</b> What is layer normalization and where does it sit in a transformer block (pre-norm vs post-norm)?</li>
</ul>`,
        deeper: `<ul>
<li><b>A34.</b> Attention(Q, K, V) = softmax(QK^T / sqrt(d_k)) V: for each query vector, compute its dot product with every key vector to get a similarity score, scale the scores down, apply softmax so they sum to 1 and act as weights, then take the weighted sum of the value vectors. Each token asks "which other tokens are relevant to me," gets back a weighting, and builds its new representation as a blend of the other tokens' value vectors - letting a token directly incorporate information from any other token in a single step, unlike a recurrent network passing information step by step.</li>
<li><b>A35.</b> As dimension d_k grows, the variance of the dot product of two random vectors grows in proportion to d_k, so its typical magnitude grows with sqrt(d_k); without scaling, scores for a large d_k would push softmax into a region where its gradient is nearly zero, with one score dominating and all others pushed to near-zero probability. Dividing by sqrt(d_k) keeps the dot products at roughly unit variance regardless of dimension, keeping softmax in a well-behaved range where gradients still flow, which matters given d_k is often 64 or more per head.</li>
<li><b>A36.</b> Multi-head attention runs several independent attention computations in parallel, each with its own learned projections into a smaller dimension, then concatenates all heads' outputs and projects back to the model dimension. Different heads can specialise in different relationships - one attending mostly to the previous word, another to a matching noun phrase, another to punctuation boundaries - which a single attention computation, forced to represent every relationship as one weighted average, could not represent as cleanly. A typical setup splits the model dimension across 8 or 16 heads of 64 dimensions each, at roughly the same total compute cost as one large head.</li>
<li><b>A37.</b> Self-attention itself is permutation-invariant - shuffling the input tokens would produce the same set of outputs just reordered, so the model has no inherent notion of word order. Positional encoding adds position information into each token's embedding before the first attention layer, either as a fixed function of sine and cosine at different frequencies, as in the original transformer, or as a learned embedding per position, as in BERT and GPT-2. More recent models often use relative schemes like RoPE (rotary position embedding; see <a href="#deep-learning-essentials">Deep learning essentials</a>), encoding the relative distance between two tokens directly into the attention computation.</li>
<li><b>A38.</b> An encoder-only model like BERT uses bidirectional self-attention, where every token can attend to every other token including later ones, suiting understanding tasks but not natural left-to-right generation. A decoder-only model like GPT uses causal (masked) self-attention, where a token can only attend to itself and earlier tokens, exactly what is needed to generate one token at a time. An encoder-decoder model like T5 has both: a bidirectional encoder processes the full input, and a causal decoder generates the output while attending to the encoder's output via cross-attention.</li>
<li><b>A39.</b> Layer normalization normalises the activations of a single example across its feature dimension, unlike batch normalization which normalises across the batch, which matters for transformers since sequence lengths vary. The original transformer (post-norm) applies layer norm after each sub-layer's residual addition; most modern large language models use pre-norm instead, applying it before each sub-layer, because pre-norm keeps the residual stream's gradient path cleaner and makes very deep transformers noticeably easier to train stably.</li>
</ul>`,
        check: null
      },
      {
        id: 'qbmlf-7',
        part: 'field',
        title: 'Training and optimisation — 7 questions',
        body: `<ul>
<li><b>Q40.</b> Compare SGD, momentum, and Adam.</li>
<li><b>Q41.</b> What is learning rate warmup and decay, and why do transformers need warmup?</li>
<li><b>Q42.</b> What is weight decay vs L2 regularization (and why they differ in Adam)?</li>
<li><b>Q43.</b> What is gradient clipping and when do you need it?</li>
<li><b>Q44.</b> What is early stopping and how do you implement it correctly?</li>
<li><b>Q45.</b> What is the difference between an epoch, a batch, and an iteration/step, and how does batch size affect training?</li>
<li><b>Q46.</b> What is mixed-precision training and why does it speed up training?</li>
</ul>`,
        deeper: `<ul>
<li><b>A40.</b> Plain SGD (stochastic gradient descent) updates weights by a fixed learning rate times the gradient on a mini-batch - simple, and with the right schedule still competitive for vision tasks, but slow across flat or noisy regions. Momentum adds a fraction, commonly 0.9, of the previous update to the current one, accelerating progress in a consistent direction and dampening oscillation. Adam maintains a per-parameter running estimate of both the gradient's mean and its squared magnitude, dividing the update by the square root of the second estimate - effectively an adaptive learning rate per parameter - which makes it far less sensitive to the initial learning rate and the default for training transformers.</li>
<li><b>A41.</b> Warmup starts training with a small learning rate and increases it, often linearly, over the first few hundred to a few thousand steps before switching to the main schedule; decay then reduces it over the rest of training, commonly a cosine curve down to a small fraction of the peak. Transformers need warmup because Adam's adaptive per-parameter estimate is unreliable in the first steps, having seen very few gradients - starting at full learning rate immediately can cause a large, destabilising early update, one reason pre-norm transformers are more forgiving of warmup choices than post-norm ones.</li>
<li><b>A42.</b> L2 regularization adds squared weight magnitude to the loss itself, so its gradient gets folded into the gradient Adam's adaptive learning rate then rescales per parameter - a weight with a large recent gradient gets less effective L2 penalty per step than one with a small recent gradient, an unintended interaction. Weight decay, as in AdamW, instead subtracts a small fraction of the weight directly from the update after the adaptive learning rate has been applied, decoupling regularisation strength from the gradient-based scaling - AdamW's decoupled weight decay is now the standard for training transformers because it fixes this interaction.</li>
<li><b>A43.</b> Gradient clipping caps the norm of the gradient before it updates the weights, typically rescaling the whole vector down if its norm exceeds a threshold, commonly 1.0, while preserving direction. It matters most in recurrent networks and training large transformers from scratch, where an occasional batch can produce a gradient spike large enough to blow up the weights and derail training - clipping turns that spike into a bounded, recoverable step.</li>
<li><b>A44.</b> Early stopping monitors a validation metric during training and stops, or reverts to the best checkpoint, once it has stopped improving for a set number of epochs, preventing the model from continuing to fit training-set noise. The correct implementation checkpoints weights whenever the validation metric improves and restores those best-checkpoint weights at the end rather than the final epoch's, since the final epoch is usually somewhat overfit relative to the best one; the validation set used for this must be separate from the final test set, or reported test performance is optimistically biased.</li>
<li><b>A45.</b> An epoch is one full pass through the entire training dataset; a batch is a subset used to compute one gradient update, commonly sized in powers of two for hardware efficiency; one iteration is one such update, so steps per epoch equal dataset size divided by batch size. A larger batch gives a less noisy gradient estimate, letting you use a larger learning rate, and better hardware utilisation, but very large batches can generalise slightly worse and need more warmup steps; a smaller batch adds beneficial gradient noise but trains more slowly in wall-clock time per epoch.</li>
<li><b>A46.</b> Mixed-precision training performs most operations, particularly large matrix multiplications, in a lower-precision format - FP16 (16-bit floating point) or BF16 (a 16-bit floating-point format with a wider exponent range) - while keeping sensitive values, typically a master copy of the weights, in FP32 (the ordinary 32-bit floating point used by default), and multiplies the loss by a scale factor before the backward pass to keep small gradients from underflowing to zero in FP16's narrower range. It speeds up training because modern GPU tensor cores execute FP16/BF16 matrix multiplications roughly 2 to 8 times faster than FP32 and move half the data through memory bandwidth for the same tensor, and memory bandwidth, not raw compute, is very often the actual bottleneck.</li>
</ul>`,
        check: null
      },
      {
        id: 'qbmlf-8',
        part: 'field',
        title: 'Classical and unsupervised methods — 6 questions',
        body: `<ul>
<li><b>Q47.</b> How does k-means clustering work and what are its limitations?</li>
<li><b>Q48.</b> What is PCA and how does it reduce dimensionality?</li>
<li><b>Q49.</b> What is the difference between k-means and DBSCAN?</li>
<li><b>Q50.</b> Explain k-nearest neighbors and the curse of dimensionality's effect on it.</li>
<li><b>Q51.</b> What is an autoencoder and how is it used for anomaly detection?</li>
<li><b>Q52.</b> What is the EM algorithm used for (e.g., Gaussian mixture models)?</li>
</ul>`,
        deeper: `<ul>
<li><b>A47.</b> K-means picks k initial cluster centers, often via k-means++ to spread them out, assigns every point to its nearest center, recomputes each center as the mean of its assigned points, and repeats until assignments stop changing - minimising total squared distance to a local, not global, optimum, so it is run several times from different initialisations. Its limitations: you must choose k in advance, often via the elbow method or silhouette score; it assumes roughly spherical, similarly sized clusters; and it is sensitive to feature scale and outliers, since one far-away point can pull a cluster's mean.</li>
<li><b>A48.</b> PCA (principal component analysis) finds new axes, the principal components, as linear combinations of the original features, ordered so the first captures the most variance, the second the most remaining variance while orthogonal to the first, and so on - computationally, the eigenvectors of the data's covariance matrix, ordered by eigenvalue. Keeping only the first few components that explain, say, 90-95% of total variance reduces feature count while discarding the least informative directions, speeding up downstream models and reducing noise, at the cost that the components are no longer individually interpretable.</li>
<li><b>A49.</b> K-means requires specifying the number of clusters in advance, assumes roughly spherical clusters of similar size, and assigns every point to some cluster even if it is really an outlier. DBSCAN groups points that are densely packed within a distance epsilon of at least minPts other points, finds clusters of arbitrary shape, determines the number of clusters from the data's density automatically, and labels sparse points as noise - the trade-off is it struggles when clusters have very different densities, since one global epsilon and minPts cannot suit both a dense and a sparse cluster at once.</li>
<li><b>A50.</b> K-nearest neighbors classifies or predicts a new point by finding the k closest training points by a distance metric, usually Euclidean, and taking a majority vote or average - it needs no training phase, since training is just storing the data, but every prediction costs a distance computation against every stored point unless an index like a k-d tree speeds it up. As dimensionality grows, the curse of dimensionality makes every pair of points roughly equidistant, so "nearest" becomes statistically meaningless well before hundreds of features, which is why KNN needs dimensionality reduction more than a model like gradient boosting does.</li>
<li><b>A51.</b> An autoencoder is a neural network trained to reconstruct its own input, with a narrow bottleneck in the middle - the encoder compresses the input down, the decoder reconstructs it back - forcing the network to learn a compressed representation of the input's most important structure rather than simply copying it through. For anomaly detection, train it only on normal data, so it becomes good at reconstructing normal patterns; a new example that reconstructs poorly is flagged as anomalous, since the network never learned to compress patterns it never saw.</li>
<li><b>A52.</b> The expectation-maximization algorithm fits a model with unobserved latent variables by alternating two steps until convergence: the E-step computes the expected value of the latent variables given current parameters, and for a Gaussian mixture model that means the probability each point belongs to each cluster; the M-step updates the parameters, recomputing each cluster's mean, variance and weight, to maximise the likelihood given those soft assignments. It is a soft, probabilistic generalisation of k-means, and like k-means it is guaranteed not to decrease the data's likelihood at each step but can converge to a local optimum depending on initialisation.</li>
</ul>`,
        check: null
      }
    ],
    connect: null,
    activities: [
      {
        id: 'qbmlf-a1',
        type: 'drill',
        title: 'Five questions, aloud, in five minutes: bias-variance to Adam',
        prompt: `Answer these five aloud, about one minute each, no notes: Q2 (bias-variance tradeoff), Q15 (why L1 induces sparsity and L2 does not), Q21 (precision vs recall, when to optimise for each), Q34 (the scaled dot-product attention formula), Q40 (SGD vs momentum vs Adam). Mark each fluent, recalled, or absent.`,
        timeboxSec: 300,
        rubric: `Must-haves, applied to each of the five: (1) substantively correct; (2) under a minute, no notes; (3) states the actual formula where one exists - the attention formula with the sqrt(d_k) term, the bias-variance decomposition; (4) explains the mechanism behind L1's sparsity geometrically or algebraically, not just "L1 zeroes things out"; (5) an honest fluent/recalled/absent mark with a stated remediation for any gap. Common mistakes: stating attention without the softmax or the scaling term; giving precision and recall's formulas backwards; describing Adam without mentioning it adapts the learning rate per parameter. {{HONESTY}}`,
        model: `<p>"Bias is error from a model too simple to capture the true pattern, variance is error from a model too sensitive to the specific training sample - total error is bias squared plus variance plus noise, and they usually trade off against each other as I add capacity. L1 regularization can push a coefficient all the way to exactly zero because its penalty's gradient stays constant as the coefficient shrinks, so the loss surface's optimum tends to sit on a corner of the diamond-shaped constraint region where some coefficients are zero; L2's penalty shrinks toward zero smoothly and rarely reaches it exactly. Precision is, of what I predicted positive, how much actually was; recall is, of what actually was positive, how much I found - I'd optimise for precision when a false positive is expensive and recall when a false negative is expensive. Attention is softmax of Q K transpose over the square root of d_k, times V - each token compares itself against every other token's key, turns those scores into weights, and blends the value vectors by those weights. And Adam keeps a running estimate of each parameter's gradient mean and its squared magnitude, and divides the update by the square root of that second estimate, so effectively every parameter gets its own adaptive learning rate."</p>
<p>Anything marked absent, I would reread the specific section it came from and answer it again the same day rather than rereading the whole chapter.</p>`
      },
      {
        id: 'qbmlf-a2',
        type: 'drill',
        title: 'Five more, aloud, in five minutes: MLE to PCA',
        prompt: `Answer these five aloud, about one minute each, no notes: Q4 (MLE and cross-entropy), Q18 (how gradient boosting fits residuals), Q27 (backpropagation and the chain rule), Q41 (why transformers need learning rate warmup), Q48 (what PCA's components actually are). Mark each fluent, recalled, or absent.`,
        timeboxSec: 300,
        rubric: `Must-haves, applied to each of the five: (1) substantively correct; (2) under a minute, no notes; (3) explicitly connects maximum likelihood to cross-entropy rather than stating them as two unrelated facts; (4) describes gradient boosting as fitting the gradient of the loss, not only "fitting the residual", and names the learning rate's role; (5) an honest fluent/recalled/absent mark with a remediation plan. Common mistakes: describing backpropagation without mentioning the chain rule by name; explaining PCA as "reducing dimensions" with no mention of variance or eigenvectors; giving no reason at all for warmup beyond "it helps." {{HONESTY}}`,
        model: `<p>"Maximum likelihood estimation picks the parameters that make the data we actually saw most probable, and minimising the negative log of that likelihood for a categorical outcome is mathematically identical to cross-entropy loss - so training with cross-entropy is doing maximum likelihood underneath. Gradient boosting adds one shallow tree at a time, and each new tree is trained to predict the negative gradient of the loss with respect to the current predictions - for squared error that gradient is just the residual - and each tree's output gets scaled down by a learning rate before being added in, trading more rounds for safer steps. Backpropagation applies the chain rule backward from the output, so the gradient at any layer is what flowed in from the layer after it, times that layer's own local derivative, letting the whole network's gradient be computed in one backward pass. Transformers need learning rate warmup because Adam's adaptive estimate is unreliable in the very first steps, having seen almost no gradients yet, so jumping straight to the full learning rate risks a destabilising early update. And PCA's components are the eigenvectors of the data's covariance matrix, ordered by how much variance each one explains, so keeping the first few keeps the directions that carry the most information."</p>
<p>I would time myself again on any answer marked recalled rather than fluent, without notes, the next day.</p>`
      }
    ],
    sayQuestion: null,
    sayItOutLoud: null,
    readings: [
      { l: 'Introduction to Machine Learning Interviews Book (Chip Huyen)', u: 'https://huyenchip.com/ml-interviews-book/', w: 'Over 200 ML interview questions with worked answers, organised by exactly the topics this chapter covers.', m: 30 },
      { l: 'Google\'s Machine Learning Crash Course', u: 'https://developers.google.com/machine-learning/crash-course', w: 'Google\'s own practical primer on the maths, regularisation and evaluation vocabulary this chapter assumes.', m: 40 },
      { l: 'Gradient Boost Part 1 (of 4): Regression Main Ideas (StatQuest)', u: 'https://www.youtube.com/watch?v=3CC4N4z3GJc', w: 'Josh Starmer\'s visual walk-through of fitting to residuals, the mechanism behind every boosting question in this chapter.', m: 15 },
      { l: 'ROC and AUC, Clearly Explained! (StatQuest)', u: 'https://www.youtube.com/watch?v=4jRBRDbJemM', w: 'The clearest visual explanation available of why ROC-AUC and PR-AUC diverge on imbalanced data.', m: 16 },
      { l: 'Backpropagation calculus (3Blue1Brown, Deep Learning chapter 4)', u: 'https://www.youtube.com/watch?v=tIeHLnjs5U8', w: 'The chain-rule mechanics behind backpropagation, shown rather than just stated.', m: 15 },
      { l: 'Attention in transformers, visually explained (3Blue1Brown, Deep Learning chapter 6)', u: 'https://www.youtube.com/watch?v=eMlx5fFNoYc', w: 'A visual build-up of scaled dot-product and multi-head attention, the two hardest-to-picture formulas in this chapter.', m: 26 }
    ]
  };

  root.PREP_CORE['question-bank-llm'] = {
    id: 'question-bank-llm',
    title: 'Question bank: LLMs, inference, RAG and agents',
    level: 'warning',
    levelLabel: 'Answers are hidden - try first',
    why: `Forty-six questions on how a large language model actually runs in production - the KV cache, serving runtimes, quantization, fine-tuning, retrieval, agents and evaluation - ordered from the questions almost every 2025-2026 LLM engineering interview asks to the more specialised ones. The answers are hidden so you have to try first. General machine learning theory sits in the machine learning foundations bank, and general platform and reliability work in the production ML engineering bank; this one assumes both and stays on language models.`,
    learn: [
      {
        id: 'qbllm-1',
        part: 'field',
        title: 'How generation works and the KV cache — 7 questions',
        body: `<ul>
<li><b>Q1.</b> Explain the difference between prefill and decode phases.</li>
<li><b>Q2.</b> What is the KV cache and why is it needed?</li>
<li><b>Q3.</b> Derive the KV cache memory size formula and give a worked example.</li>
<li><b>Q4.</b> Why is autoregressive decoding memory-bandwidth bound rather than compute bound?</li>
<li><b>Q5.</b> What is speculative decoding and how does it speed up generation?</li>
<li><b>Q6.</b> What is the difference between greedy decoding, beam search, and sampling (temperature, top-k, top-p)?</li>
<li><b>Q7.</b> Why does output length dominate latency and cost more than input length?</li>
</ul>`,
        deeper: `<ul>
<li><b>A1.</b> Prefill processes the entire input prompt in one forward pass, computing and caching the key and value vectors for every prompt token in parallel - compute-bound, since the GPU runs a large, highly parallel matrix multiplication that keeps its arithmetic units busy. Decode then generates one new token at a time, each step needing only the previous token's forward pass since earlier tokens' keys and values are already cached - memory-bandwidth-bound, since each step reads the entire model's weights and the growing KV cache for comparatively little arithmetic.</li>
<li><b>A2.</b> Every attention computation needs the key and value vectors of every previous token; without caching them, generating token N would recompute the keys and values for all N-1 previous tokens from scratch, making generation cost grow quadratically with sequence length. The KV cache stores each token's key and value vectors, per layer and per head, the first time they are computed, so generating the next token only needs one new query vector compared against the cached keys and values - turning O(n^2) recomputation into an O(n) cache lookup per step, at the cost of memory that grows with sequence length and concurrent sequences, usually the resource that limits how many requests a server can hold.</li>
<li><b>A3.</b> KV cache size = 2 x batch_size x sequence_length x num_layers x num_kv_heads x head_dim x bytes_per_value, the 2 accounting for both keys and values. Worked example: a 7-billion-parameter model with 32 layers, 32 KV heads, head dimension 128, one sequence of 4,096 tokens in FP16 (2 bytes): 2 x 1 x 4096 x 32 x 32 x 128 x 2 bytes is about 2.15 GB for a single sequence - which is why serving many long-context sequences concurrently, not the model weights themselves, is often what runs a GPU out of memory first.</li>
<li><b>A4.</b> Generating one token requires reading the entire model's weights and the KV cache from GPU memory, but the actual arithmetic per token is small - one new query vector against the cached keys, plus one pass through the feed-forward layers for one token. Modern GPUs can perform far more floating point operations per second than they can move bytes per second, so when the arithmetic per byte moved is low, as in single-token decode, the GPU spends most of its time waiting on memory - this is why batching several requests together, amortising the same weight read across many tokens, improves decode throughput far more than a faster GPU core alone.</li>
<li><b>A5.</b> Speculative decoding uses a small, fast draft model to generate several candidate tokens ahead, then runs the large target model once, in parallel, to verify all candidates in a single forward pass - accepting every candidate up to the first the target model would not have generated itself, then generating one token normally after that. Because verifying several tokens costs about the same as generating one normally, since decode is memory-bandwidth bound, an accurate draft model can produce a genuine 2 to 3x speedup with mathematically identical output to standard decoding, not an approximation.</li>
<li><b>A6.</b> Greedy decoding always picks the single highest-probability next token, fast and deterministic but often repetitive or generic. Beam search keeps the top-k partial sequences at each step and expands each, better than greedy for a task with one clearly correct answer like translation but still prone to repetition. Sampling draws the next token from the probability distribution: temperature reshapes it, below 1 sharpening toward likely tokens and above 1 flattening toward randomness; top-k restricts sampling to the k most likely tokens; top-p (nucleus sampling) restricts it to the smallest set whose cumulative probability exceeds p, the most common default since it adapts the candidate pool to the model's confidence at each step.</li>
<li><b>A7.</b> Prefill processes the whole input in one parallel pass, so doubling input length roughly doubles the relatively small prefill time; decode generates one token at a time sequentially, so doubling output length roughly doubles the number of sequential, memory-bandwidth-bound steps, each taking tens of milliseconds regardless of how short the request is. For a long prompt and short answer, input often dominates cost; for anything with a long generated answer - a long summary, an agent's reasoning, a code file - decode time dominates, which is why bounding output length is one of the highest-leverage ways to control both latency and cost.</li>
</ul>`,
        check: null
      },
      {
        id: 'qbllm-2',
        part: 'field',
        title: 'Batching, attention kernels and serving runtimes — 7 questions',
        body: `<ul>
<li><b>Q8.</b> What is continuous batching (in-flight batching) and how is it different from static batching?</li>
<li><b>Q9.</b> What is PagedAttention and what problem does it solve?</li>
<li><b>Q10.</b> What is FlashAttention and why does it speed up attention without changing the math?</li>
<li><b>Q11.</b> What is multi-query attention (MQA) / grouped-query attention (GQA) and how do they shrink the KV cache?</li>
<li><b>Q12.</b> What metrics matter for LLM (large language model) serving (TTFT, TPOT/ITL, throughput) and how do you trade them off?</li>
<li><b>Q13.</b> Compare vLLM, TensorRT-LLM, and Hugging Face TGI at a high level.</li>
<li><b>Q14.</b> What is tensor parallelism vs pipeline parallelism for serving a large model across GPUs?</li>
</ul>`,
        deeper: `<ul>
<li><b>A8.</b> Static batching waits to collect a fixed-size batch, runs it until every sequence finishes, and only then starts the next batch - a batch with one long sequence and several short ones wastes GPU capacity on the short sequences that finished early but must wait for the long one. Continuous batching, also called in-flight batching, instead adds a new request into the running batch the moment a compute slot frees up, as soon as one sequence finishes - keeping GPU utilisation consistently high and letting throughput scale far better under uneven real traffic than fixed-size batches.</li>
<li><b>A9.</b> Before PagedAttention, most serving systems allocated one contiguous block of GPU memory per sequence, sized for its maximum possible length, wasting an estimated 60-80% of KV cache memory to fragmentation and over-reservation for sequences that ended up shorter. PagedAttention, from the vLLM project, borrows virtual memory paging from operating systems: it stores the KV cache in small fixed-size, non-contiguous blocks with a lookup table mapping each sequence to its blocks, allocating memory just-in-time as a sequence grows and letting identical prompt prefixes across requests share the same underlying blocks instead of duplicating them.</li>
<li><b>A10.</b> Standard attention implementations compute the full N x N attention score matrix and write it to GPU high-bandwidth memory (HBM) before applying softmax, moving a large amount of data between HBM and the much faster on-chip memory (SRAM) for long sequences. FlashAttention restructures the same computation to process the input in small tiles, computing partial softmax and output values incrementally within fast SRAM and only writing the final result back to HBM - producing numerically identical output but, by minimising slow memory reads and writes rather than reducing floating-point operations, delivering a substantial real speedup, roughly 3x on GPT-2 training in the original paper, and letting attention scale to much longer sequences.</li>
<li><b>A11.</b> Standard multi-head attention gives every head its own key and value projections, so KV cache size scales with the full head count. Multi-query attention has all query heads share a single key/value head, cutting KV cache size by roughly the number of heads - up to 32x for a 32-head model - at some quality cost. Grouped-query attention, used by most modern large models from Llama 2 70B onward, splits heads into a small number of groups sharing one key/value head each, recovering most of MQA's memory savings while staying much closer to full multi-head quality; it is specifically the KV cache that shrinks, not the query projections, which do not need caching across decode steps.</li>
<li><b>A12.</b> Time to first token (TTFT) measures how long the user waits before anything appears, dominated by prefill time and growing with prompt length. Time per output token (TPOT, or inter-token latency) measures the steady-state delay between successive generated tokens, determining whether streamed text feels smooth. Throughput measures total tokens generated per second across all concurrent requests. Larger batches generally improve throughput but can increase TPOT for any one request, since more sequences compete for the same decode step - a chat interface prioritising a snappy feel needs a different configuration than a batch summarisation job that only cares about total throughput.</li>
<li><b>A13.</b> vLLM is the open-source project that introduced PagedAttention, widely used for ease of deployment, broad model support, and strong out-of-the-box throughput via continuous batching. TensorRT-LLM is NVIDIA's runtime, built on its TensorRT compiler, extracting the most raw performance on NVIDIA GPUs through hardware-specific kernel optimisation and quantization support, at the cost of a steeper setup and a compilation step per model. Hugging Face's TGI integrates closely with the Hugging Face model ecosystem, a common choice when deploying a wide range of models matters more than squeezing out the last percent of throughput. All three now implement continuous batching and paged or optimised KV cache management, since both ideas have become the baseline expectation for a serious serving runtime.</li>
<li><b>A14.</b> Tensor parallelism splits individual weight matrices across multiple GPUs, so every GPU works on every layer simultaneously but only its slice of each matrix multiplication, requiring a fast all-reduce between GPUs after each split operation - needing a very fast interconnect like NVLink and typically used within one server node. Pipeline parallelism assigns different whole layers to different GPUs, so a request flows through GPU 1's layers then GPU 2's layers, requiring less frequent but higher-latency communication - tolerating a slower interconnect and used to split a model across nodes, though it under-utilises GPUs unless multiple requests are pipelined through the stages concurrently. Serving a very large model commonly uses both together.</li>
</ul>`,
        check: null
      },
      {
        id: 'qbllm-3',
        part: 'field',
        title: 'Quantization and cost — 6 questions',
        body: `<ul>
<li><b>Q15.</b> What is quantization and how does INT8/INT4 reduce memory?</li>
<li><b>Q16.</b> What is the difference between post-training quantization and quantization-aware training?</li>
<li><b>Q17.</b> Explain GPTQ/AWQ at a high level — what do they optimize for?</li>
<li><b>Q18.</b> What is the memory-vs-quality tradeoff of quantization, and where does it break down?</li>
<li><b>Q19.</b> How do you estimate the cost of an LLM feature per request/per month?</li>
<li><b>Q20.</b> What is model distillation and when do you use it instead of quantization?</li>
</ul>`,
        deeper: `<ul>
<li><b>A15.</b> Quantization represents model weights, and sometimes activations, using fewer bits than training precision - typically FP16 or BF16 (16 bits) reduced to INT8 (8 bits) or INT4 (4 bits) for inference. Cutting from 16 to 8 bits halves the memory needed to store the weights and the bandwidth needed to move them, which, since decode is memory-bandwidth bound, directly speeds up generation as well as shrinking the memory footprint; INT4 halves it again. A 70-billion-parameter model needs about 140 GB in FP16 but only about 35 GB in INT4 - the difference between needing multiple high-end GPUs and fitting on one.</li>
<li><b>A16.</b> Post-training quantization converts an already-trained model's weights to lower precision afterward, usually using a small calibration dataset to choose good scaling factors per layer - fast, cheap, and the default choice for large language models, since fully retraining is prohibitively expensive. Quantization-aware training simulates the effect of quantization during training or fine-tuning, letting the model adapt its weights to be more robust to precision loss - it recovers more accuracy, especially at very low bit-widths, but costs a full training or fine-tuning run rather than a one-time conversion.</li>
<li><b>A17.</b> GPTQ quantizes a model layer by layer, using second-order (Hessian-based) information from a small calibration dataset to choose each weight's quantized value to minimise the resulting error in that layer's output, correcting for the rounding error already introduced when quantizing the next weight - letting it push weights to 4 bits or lower with much less accuracy loss than naive independent rounding. AWQ instead observes which weights are multiplied by the largest-magnitude activations, since those weights most influence the output, and protects that small salient fraction from aggressive quantization while quantizing the rest more freely - both target the same 4-bit goal using different signals.</li>
<li><b>A18.</b> Moving from FP16 to INT8 typically costs very little measurable quality on most benchmarks; INT4 with a good method like GPTQ or AWQ still holds up well for most general tasks but starts to show a measurable gap on precise reasoning, arithmetic, or long coherent multi-step generation, where quantization error compounds. Below 4 bits, quality degrades more sharply and unevenly - fluent short-form text survives aggressive quantization much better than exact numeric reasoning or rare factual recall - so the honest approach is to benchmark quantized quality on the specific tasks that matter, not to trust one aggregate benchmark score as proof a bit-width is safe.</li>
<li><b>A19.</b> Estimate tokens per request separately for input and output, since providers typically price them differently, output tokens usually costing 2-4x input tokens per token because they are the memory-bandwidth-bound decode tokens, multiply each by its per-token price, and add any fixed per-request overhead. Multiply by expected requests per day and by 30 for a monthly estimate, and separately estimate retries, safety re-checks, or a multi-step agent workflow calling the model several times per user request, since those often multiply the effective per-request cost by 3 to 10x compared with a naive single-call estimate. For a self-hosted model, replace per-token price with GPU-hours needed for expected peak throughput plus headroom, as a monthly fixed cost rather than a per-call variable one.</li>
<li><b>A20.</b> Distillation trains a smaller student model to mimic a larger teacher model's outputs, often its full probability distribution over the next token rather than just the chosen token, producing a genuinely smaller model with fewer parameters, not the same model in fewer bits per parameter. Use distillation when you need a fundamentally faster or cheaper model for a narrower task and can afford a training run to produce it; use quantization when you want the same model's actual behaviour and capability made to fit in less memory without a separate training process. The two are complementary and often combined - distill first, then quantize the smaller student further.</li>
</ul>`,
        check: null
      },
      {
        id: 'qbllm-4',
        part: 'field',
        title: 'Fine-tuning and alignment — 7 questions',
        body: `<ul>
<li><b>Q21.</b> What is the difference between full fine-tuning and parameter-efficient fine-tuning (LoRA)?</li>
<li><b>Q22.</b> Explain how LoRA works mathematically (low-rank decomposition).</li>
<li><b>Q23.</b> What is instruction tuning / SFT and what does it change about a base model's behavior?</li>
<li><b>Q24.</b> What is RLHF and what are its three stages?</li>
<li><b>Q25.</b> What is DPO and how does it avoid needing a reward model?</li>
<li><b>Q26.</b> When do you fine-tune vs use RAG vs use a longer prompt/few-shot?</li>
<li><b>Q27.</b> What is catastrophic forgetting and how do you mitigate it during fine-tuning?</li>
</ul>`,
        deeper: `<ul>
<li><b>A21.</b> Full fine-tuning updates every parameter, which for a modern large language model means storing gradients and optimiser state for billions of parameters - for a 7-billion-parameter model, the standard 16 bytes per parameter of weights, gradients and Adam state comes to about 112 GB before even counting activations. LoRA freezes the original weights entirely and trains a small pair of low-rank matrices added alongside each targeted weight matrix, keeping trainable parameters under 1% of the full model - so what is left is mostly the frozen base weights themselves, about 14 GB in 16-bit for a 7B model, plus a small amount for the adapter and its optimiser state, while reaching close to full fine-tuning quality on most tasks.</li>
<li><b>A22.</b> For a weight matrix W of size d x k, LoRA freezes W and adds an update expressed as the product of two much smaller matrices, A (r x k) and B (d x r), where rank r is small, commonly 8, 16 or 64 - the effective weight at inference is W + (alpha/r) x B x A, alpha being a scaling hyperparameter. Because only A and B are trained, trainable parameters number r x (d + k) instead of d x k, a reduction of several hundredfold for a large square matrix and small r; after training, B x A can be merged back into W, so the fine-tuned model runs at exactly the original model's inference cost.</li>
<li><b>A23.</b> A base pretrained model is trained only to predict the next token on raw text, so it often continues a question with more questions rather than answering it - it has no learned notion that a user asked something and expects a helpful response. Supervised fine-tuning (SFT), or instruction tuning, further trains the model on curated (instruction, ideal response) pairs using the same next-token loss but on data demonstrating the desired behaviour - after SFT, the model reliably follows an instruction format and answers directly, though it has no explicit notion of which of several plausible responses a human would prefer more.</li>
<li><b>A24.</b> RLHF (reinforcement learning from human feedback) has three stages. First, supervised fine-tuning on demonstration data to get a reasonable base of instruction-following. Second, training a reward model: human raters compare or rank the SFT model's outputs for the same prompt, and a separate model learns to predict which output a human would prefer, turning subjective judgment into a differentiable score. Third, reinforcement learning, commonly PPO (proximal policy optimisation), further tunes the model to generate outputs the reward model scores highly, while a KL-divergence penalty - KL divergence being a measure of how far one probability distribution has moved from another - keeps it from drifting so far from the original SFT model that it exploits the reward model's blind spots.</li>
<li><b>A25.</b> Direct preference optimization observes that the RLHF objective - maximise reward model score subject to a KL penalty against a reference model - has a closed-form solution expressing the optimal policy directly in terms of preference data, without needing a separate reward model or reinforcement learning. It derives a loss optimised directly on (prompt, preferred response, rejected response) triples using ordinary supervised-learning-style gradient descent, making it substantially simpler and more stable than RLHF's three-stage pipeline, though RLHF with a full reward model can still outperform it on tasks where the reward model captures more than the pairwise signal DPO uses directly.</li>
<li><b>A26.</b> Fine-tune when you need to change behaviour, format, tone or a task-specific skill consistently - something that should become the model's default rather than explained fresh each time; it is the wrong tool for fast-changing facts, since retraining every time a fact changes does not scale. Use RAG when the need is knowledge rather than behaviour, since retrieval updates instantly by changing the underlying documents, with no retraining. Use a longer prompt or few-shot examples first, whenever the task fits fully within the context window and does not run so often that extra prompt tokens become a meaningful cost - the cheapest thing to try, and often sufficient.</li>
<li><b>A27.</b> Catastrophic forgetting is when fine-tuning on a narrow new dataset degrades capabilities the model had before that are not represented in the new data - a model heavily fine-tuned on support transcripts might get noticeably worse at general reasoning it previously handled fine. Mitigations include mixing a sample of general-purpose instruction data into the fine-tuning set, using a low learning rate and few epochs so the model moves only a little from its starting point, and using LoRA rather than full fine-tuning, since freezing the original weights naturally limits how far overall behaviour can drift.</li>
</ul>`,
        check: null
      },
      {
        id: 'qbllm-5',
        part: 'field',
        title: 'RAG and retrieval — 6 questions',
        body: `<ul>
<li><b>Q28.</b> What is RAG and what problem does it solve that fine-tuning does not?</li>
<li><b>Q29.</b> How does a vector database do approximate nearest neighbor search (e.g., HNSW)?</li>
<li><b>Q30.</b> What is the difference between dense retrieval (embeddings) and sparse retrieval (BM25), and when do you combine them (hybrid search)?</li>
<li><b>Q31.</b> What is chunking and how does chunk size affect retrieval quality?</li>
<li><b>Q32.</b> What is re-ranking and why add it after the initial retrieval?</li>
<li><b>Q33.</b> How do you evaluate retrieval quality separately from generation quality?</li>
</ul>`,
        deeper: `<ul>
<li><b>A28.</b> Retrieval-augmented generation retrieves relevant text from an external knowledge source at request time and inserts it into the model's prompt, so the model generates its answer grounded in that content rather than relying only on what it memorised during training. It solves the freshness and provenance problem fine-tuning cannot: updating a RAG system's knowledge is as simple as editing a document, with no retraining, and retrieved passages can be shown as a citation, whereas a fact baked into fine-tuned weights cannot be traced back or corrected without retraining. RAG also reduces, though does not eliminate, hallucination on knowledge-heavy questions by giving the model something concrete to ground its answer in.</li>
<li><b>A29.</b> An exact nearest-neighbor search over millions of high-dimensional embeddings requires comparing the query against every stored vector, which does not scale; approximate methods trade a small, tunable accuracy loss for large speed gains. HNSW (hierarchical navigable small world) builds a multi-layer graph where each vector is a node, with sparse long-range connections in upper layers for fast coarse navigation and denser connections in lower layers for fine-grained accuracy - a search starts at the top layer, greedily moves to the closest neighbour, and descends layer by layer, giving search time that scales roughly logarithmically with the number of vectors rather than linearly.</li>
<li><b>A30.</b> Sparse retrieval, BM25 (best matching 25, a formula name plus a version number), matches on exact terms weighted by rarity and concentration, excelling at exact matches - product codes, names, precise phrases - and needing no training or embedding model. Dense retrieval encodes query and documents into vectors and finds documents closest to the query's vector, capturing semantic similarity even with completely different wording. Hybrid search runs both and combines their rankings, often with reciprocal rank fusion, because the two fail in largely non-overlapping cases - a specific model number dense retrieval might paraphrase past, and a semantically related concept BM25's exact matching would completely miss.</li>
<li><b>A31.</b> Chunking splits a document into smaller pieces before embedding and indexing, because a single embedding vector cannot precisely represent a long document's many distinct ideas, and because the retrieved chunk, not the whole document, is what fills the model's limited context window. Chunks too small lose surrounding context needed to make sense of the passage; chunks too large dilute the embedding and waste context window space with irrelevant text. A common starting point is a few hundred tokens per chunk with 10-20% overlap between consecutive chunks, so an idea spanning a chunk boundary is not entirely lost to either half.</li>
<li><b>A32.</b> Initial retrieval is optimised to be fast over a huge corpus, typically returning the top 50-100 candidates using a cheap similarity computation; re-ranking then applies a slower, more accurate model - usually a cross-encoder examining the query and each candidate together, rather than comparing pre-computed independent embeddings - to reorder that shortlist and pick the true top few for the prompt. This two-stage approach gets most of the accuracy of an expensive per-document comparison without paying its cost across the entire corpus, since it only runs on the handful of candidates the first stage already narrowed down.</li>
<li><b>A33.</b> Retrieval quality is measured independent of what the model eventually writes, using recall@k (was the correct passage in the top k) and mean reciprocal rank (how high the correct passage ranked, on average) against labelled query-to-passage pairs. Generation quality is measured separately, checking faithfulness - does the answer only state things supported by the retrieved passages - and answer relevance, often scored by a human rubric or a calibrated LLM-as-judge. Splitting the two matters because a bad final answer with good retrieval means the generator is the problem, while a bad answer with poor retrieval means the generator was never given the right material.</li>
</ul>`,
        check: null
      },
      {
        id: 'qbllm-6',
        part: 'field',
        title: 'Agents, tools and guardrails — 7 questions',
        body: `<ul>
<li><b>Q34.</b> What is function/tool calling and how does the model decide when to call a tool?</li>
<li><b>Q35.</b> What is the ReAct pattern (reason + act)?</li>
<li><b>Q36.</b> What is the difference between a single LLM call and an agent loop?</li>
<li><b>Q37.</b> What are common failure modes of agents (infinite loops, tool misuse, hallucinated arguments) and how do you guard against them?</li>
<li><b>Q38.</b> What is a guardrail / content filter and where do you put it in the pipeline (input vs output)?</li>
<li><b>Q39.</b> How do you prevent prompt injection in a tool-using agent?</li>
<li><b>Q40.</b> What is the difference between an agent framework's memory and the context window?</li>
</ul>`,
        deeper: `<ul>
<li><b>A34.</b> Function calling gives the model a list of available tools, each with a name, a natural-language description, and an argument schema; the model is trained to recognise, from the conversation, when answering needs information or an action it cannot produce alone, and to emit a structured request naming the tool and filling in arguments instead of a normal text response. The calling application, not the model, actually executes the tool, then feeds the result back into the conversation so the model can continue or finish its answer - the model itself never directly executes anything.</li>
<li><b>A35.</b> ReAct interleaves explicit reasoning with actions: the model writes a short thought about what it needs to do next, takes an action, typically a tool call, observes the result, and repeats - reason, act, observe - until it has enough to produce a final answer. Making the reasoning explicit between actions measurably improves an agent's ability to recover from a bad or unexpected tool result, since it has an explicit place to notice the result did not help and decide what to try differently.</li>
<li><b>A36.</b> A single LLM call takes one input, produces one output, and stops, with no ability to check the output or gather more information if the first attempt is wrong. An agent loop repeatedly calls the model, lets it choose and execute actions, feeds results back in, and only stops when the model decides it has enough or hits a limit - trading a fast, cheap, predictable call for a slower, more expensive but more capable process that can gather information, correct course, and handle a task the initial prompt alone cannot solve.</li>
<li><b>A37.</b> An agent can get stuck retrying the same failing action indefinitely if it never recognises repeated failure as a signal to try something different - guarded against with a hard step limit and detecting repeated identical actions to force a different strategy. It can call a tool with fabricated arguments, such as a plausible but nonexistent order ID - guarded against by validating arguments against the tool's schema and, where possible, ground truth before executing anything with a real side effect. And it can pick the wrong or a needlessly destructive tool - guarded against by scoping which tools are available in which contexts and requiring explicit confirmation before any hard-to-reverse action.</li>
<li><b>A38.</b> An input guardrail screens the user's message before it reaches the model, checking for a prompt injection attempt or an out-of-scope request, catching problems before spending a model call on them. An output guardrail screens the model's response before it is shown to the user or acted on, checking for a policy violation or, for a tool-using agent, whether a proposed action is safe to execute, catching problems the model did not avoid on its own. Both matter because they check different things - an input filter cannot know what the model will generate, and an output filter alone lets a malicious input reach and potentially manipulate the model before the output check runs.</li>
<li><b>A39.</b> Prompt injection is when text the agent processes - a retrieved document, a tool's output, a web page - contains instructions crafted to hijack it into doing something the user did not ask for, dangerous specifically because a tool-using agent can act on that hijacked instruction, not just say something wrong. Mitigations include structurally separating trusted instructions from untrusted content so the model treats the latter as data to reason about rather than commands to follow, restricting available tools and permissions wherever untrusted content is processed, and requiring explicit, ideally human, confirmation before any action with a real side effect regardless of what an intervening piece of content appeared to instruct.</li>
<li><b>A40.</b> The context window is the fixed-size, per-request input the model actually sees on each call, measured in tokens, and everything relevant to the current step must fit inside it. Memory, in an agent framework, is a separate, usually external store of information from earlier in the conversation or across sessions that the agent selectively retrieves and inserts into the context window when relevant, rather than keeping the entire history there. This matters because a long-running agent's full history eventually exceeds any context window no matter how large, so a real memory system must decide what to summarise, discard, or keep retrievable.</li>
</ul>`,
        check: null
      },
      {
        id: 'qbllm-7',
        part: 'field',
        title: 'Evaluation and observability — 6 questions',
        body: `<ul>
<li><b>Q41.</b> How do you evaluate a generative model's output when there is no single correct answer?</li>
<li><b>Q42.</b> What is LLM-as-judge and what are its known failure modes (position bias, verbosity bias)?</li>
<li><b>Q43.</b> What is hallucination and how do you measure it?</li>
<li><b>Q44.</b> What do you log/trace for an LLM application in production (spans, tokens, latency, cost)?</li>
<li><b>Q45.</b> What is a golden dataset / eval set and how do you keep it from becoming stale?</li>
<li><b>Q46.</b> How do you do online evaluation (A/B testing, shadow mode) for an LLM feature?</li>
</ul>`,
        deeper: `<ul>
<li><b>A41.</b> Define, in advance, the specific properties a good answer must have for the task - factual accuracy against a source, whether it follows the required format, whether it addresses everything asked, tone - rather than looking for one canonical string to match. Use a mix of methods: automatic checks for objective properties, such as whether it parses as valid JSON or a cited fact actually appears in the source; a held-out set with human ratings for subjective properties; and, once human ratings exist to calibrate against, an LLM-as-judge to scale evaluation of new examples using the same rubric.</li>
<li><b>A42.</b> LLM-as-judge uses another, often more capable, language model to score or compare outputs against a written rubric, scaling far better than having a human rate every example, and correlating reasonably well with human judgment when the judge is capable and the rubric specific. Known failure modes: position bias, favouring whichever answer is shown first or second regardless of quality, mitigated by evaluating both orderings; verbosity bias, systematically favouring longer answers even when not better, needing explicit correction in the rubric; and self-preference, rating outputs in the judge's own style more favourably. Any LLM-as-judge setup should be validated against human ratings before being trusted at scale.</li>
<li><b>A43.</b> Hallucination is fluent, confident output that is factually incorrect or unsupported by any real source - not a rare glitch but an inherent consequence of predicting a plausible next token rather than looking up a verified fact, which is why prompting alone cannot fully eliminate it. It is measured by checking generated claims against a trusted reference: for RAG, checking whether each claim is actually supported by the retrieved passages, a faithfulness or groundedness score; for open-ended generation with no retrieved context, checking specific, verifiable claims against an external source or a human fact-checker, since no automatic method reliably catches every hallucination without one.</li>
<li><b>A44.</b> Log the full prompt sent to the model, including any retrieved context or tool results inserted into it, and the full response, together with a trace ID tying together every step of a multi-call agent workflow, since debugging why an agent went wrong requires seeing the entire chain of calls, not just the final answer. Log token counts, input and output separately since they are priced and bounded differently, latency broken down by step, and per-request cost, so a spike can be traced to the step that caused it. Log which model version and prompt template version were used for every request, since a silent change is one of the most common causes of a quality regression that takes a while to notice.</li>
<li><b>A45.</b> A golden dataset is a fixed set of representative inputs with known-good expected outputs or a rubric, used to test whether a prompt change, model upgrade, or new retrieval setting made things better or worse before it ships - the LLM-application equivalent of a regression test suite. It goes stale when real traffic drifts away from what it covers and nobody notices, since the eval score keeps looking fine while testing less of what production sees; the fix is periodically sampling real production queries, particularly flagged ones or cases where an agent needed unusually many steps, into the eval set, and reviewing it on a set schedule rather than only when something visibly breaks.</li>
<li><b>A46.</b> Shadow mode runs a new prompt, model, or retrieval configuration alongside the current production version on real traffic, logging its output without showing it to users, so the two can be compared on real inputs at zero user-facing risk before trusting the change with live traffic. A/B testing then randomly splits real users between current and candidate and compares outcome metrics that matter to the business - task completion rate, follow-up question rate, cost per resolved request - rather than only an offline proxy score, since an LLM-as-judge can approve a change that does not actually help real users. Because LLM outputs and business metrics are noisy, an online test for a generative feature typically needs a larger sample and a longer run than a typical UI A/B test to reach a confident conclusion.</li>
</ul>`,
        check: null
      }
    ],
    connect: null,
    activities: [
      {
        id: 'qbllm-a1',
        type: 'drill',
        title: 'Five questions, aloud, in five minutes: KV cache to agent failures',
        prompt: `Answer these five aloud, about one minute each, no notes: Q2 (what the KV cache is and why it's needed), Q9 (PagedAttention and the problem it solves), Q21 (LoRA vs full fine-tuning), Q28 (what RAG solves that fine-tuning does not), Q37 (agent failure modes and how you'd guard against them). Mark each fluent, recalled, or absent.`,
        timeboxSec: 300,
        rubric: `Must-haves, applied to each of the five: (1) substantively correct; (2) under a minute, no notes; (3) states the specific mechanism, not just the name - what the KV cache actually stores, what PagedAttention's blocks replace, the low-rank matrices in LoRA; (4) names at least one concrete number where the bank's answer has one, such as LoRA keeping trainable parameters under roughly 1% of the model or PagedAttention's 60-80% wasted memory figure; (5) an honest fluent/recalled/absent mark with a stated remediation for any gap. Common mistakes: describing the KV cache as "for speed" with no mechanism; confusing LoRA with quantization; describing RAG as simply "giving the model more context" without naming the freshness/provenance problem it solves. {{HONESTY}}`,
        model: `<p>"The KV cache stores every previous token's key and value vectors so generating the next token only needs one new query compared against what's already cached, instead of recomputing the whole sequence - which is what turns an otherwise quadratic cost into a linear one. PagedAttention replaces one contiguous reserved memory block per sequence, which wasted an estimated sixty to eighty percent of memory to fragmentation, with small fixed-size non-contiguous blocks allocated just as a sequence grows. LoRA freezes the original weights and trains a small low-rank pair of matrices alongside them instead, keeping trainable parameters under about one percent of the full model, which is why it fits on a fraction of the memory full fine-tuning needs. RAG solves the freshness and provenance problem - I can update what the system knows by editing a document with no retraining, and I can show the user which passage the answer came from, neither of which a fact baked into fine-tuned weights gives me. And the agent failure I'd worry about most is it repeating the same failing tool call forever, which I'd guard against with a hard step limit and detecting repeated identical actions to force a different approach."</p>
<p>I would reread the specific section behind any answer marked absent, and answer it again the same day.</p>`
      },
      {
        id: 'qbllm-a2',
        type: 'drill',
        title: 'Five more, aloud, in five minutes: decoding to LLM-as-judge',
        prompt: `Answer these five aloud, about one minute each, no notes: Q6 (greedy vs beam search vs sampling), Q15 (how INT8/INT4 quantization reduces memory), Q24 (RLHF's three stages), Q30 (dense vs sparse retrieval, and when to combine them), Q42 (LLM-as-judge and its known biases). Mark each fluent, recalled, or absent.`,
        timeboxSec: 300,
        rubric: `Must-haves, applied to each of the five: (1) substantively correct; (2) under a minute, no notes; (3) names all three RLHF stages in the right order, not just "reinforcement learning with human feedback" as a slogan; (4) states at least one concrete number - the roughly 4x memory drop from FP16 to INT4, or a bias name for the LLM-as-judge answer; (5) an honest fluent/recalled/absent mark with a remediation plan. Common mistakes: describing top-p and top-k as the same thing; skipping the reward-model stage of RLHF entirely; claiming hybrid search is "just using both" without naming what each half catches that the other misses. {{HONESTY}}`,
        model: `<p>"Greedy always takes the single highest-probability token and tends to repeat itself; beam search keeps several candidate sequences alive at once and is better for a task with one right answer like translation; sampling actually draws from the distribution, with temperature reshaping it and top-p keeping the smallest set of tokens whose combined probability crosses a threshold, which is the default because it adapts to how confident the model is at each step. Quantization drops weight precision from sixteen bits down to eight or four, roughly halving memory and the bandwidth needed to move it each time you halve the bit width, so a seventy-billion-parameter model goes from about a hundred forty gigabytes at FP16 to around thirty-five at INT4. RLHF is supervised fine-tuning first, then training a reward model on human preference comparisons, then reinforcement learning, usually PPO, to push the policy toward what the reward model scores highly while a KL penalty keeps it near the original model. Dense retrieval catches semantic matches with different wording, sparse retrieval catches exact terms like a product code, and hybrid search combines both because they miss almost completely different things. And LLM-as-judge has to be watched for position bias, favouring whichever answer it sees first, and verbosity bias, favouring longer answers regardless of quality."</p>
<p>Anything recalled rather than fluent, I would answer again the next day without notes to check it actually stuck.</p>`
      }
    ],
    sayQuestion: null,
    sayItOutLoud: null,
    readings: [
      { l: 'LLM inference interview questions that matter (fanout.sh)', u: 'https://fanout.sh/blog/llm-inference-interview-questions', w: 'A collection of the inference interview questions teams are actually asking in 2025-2026; the areas it names line up with this chapter\'s drills.', m: 10 },
      { l: 'vLLM: Easy, Fast, and Cheap LLM Serving with PagedAttention (vLLM blog)', u: 'https://vllm.ai/blog/2023-06-20-vllm', w: 'The original announcement explaining PagedAttention and the memory fragmentation problem it solves, from the project that introduced it.', m: 15 },
      { l: 'FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness (paper)', u: 'https://arxiv.org/abs/2205.14135', w: 'The primary source for why tiling attention to avoid HBM round trips speeds it up without changing the maths.', m: 25 },
      { l: 'Practical Tips for Finetuning LLMs Using LoRA (Sebastian Raschka)', u: 'https://magazine.sebastianraschka.com/p/practical-tips-for-finetuning-llms', w: 'Real measured numbers for LoRA and QLoRA memory and runtime trade-offs, from hundreds of the author\'s own experiments.', m: 20 },
      { l: 'Function calling (OpenAI documentation)', u: 'https://developers.openai.com/api/docs/guides/function-calling', w: 'The primary documentation for how tool calling actually works end to end, from a provider that implements it.', m: 12 },
      { l: 'How Agents Can Improve LLM Performance (DeepLearning.AI, The Batch)', u: 'https://www.deeplearning.ai/the-batch/how-agents-can-improve-llm-performance/', w: 'Andrew Ng\'s four agentic design patterns - reflection, tool use, planning, multi-agent - that this chapter\'s agent section is built around.', m: 12 }
    ]
  };

}(typeof window !== 'undefined' ? window : this));

