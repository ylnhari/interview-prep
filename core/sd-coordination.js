/* sd-coordination: two system design chapters, caching and distributed systems/coordination. */
(function (root) {
  'use strict';
  root.PREP_CORE = root.PREP_CORE || {};

  root.PREP_CORE['caching'] = {
    id: 'caching',
    title: 'Caching',
    level: 'danger',
    levelLabel: 'Asked in almost every system design interview.',
    why: `Almost every system design interview reaches a point where the obvious database design is too slow or too expensive, and the fix the interviewer is fishing for is a cache. They are listening for whether you know where a cache actually belongs, what happens to correctness when you add one, and what happens when it fails - not just the word "cache" said with confidence. Someone who can name cache-aside versus write-through, explain why an eviction policy exists, and describe what a cache stampede is and how to stop one is covering a large share of what gets asked in this part of the interview. The system design fundamentals chapter introduces caching in a few paragraphs; this chapter is the full version of the same material.`,
    learn: [
      {
        id: 'cache-0',
        part: 'field',
        title: 'Key terms',
        body: `<ul>
<li><b>Cache.</b> A smaller, faster copy of data kept close to where it is read, so most reads never have to reach the slower system behind it. A page of search results kept in memory instead of re-querying a database is a cache.</li>
<li><b>Origin (source of truth).</b> The system that holds the real, authoritative data - usually a database. The cache is never the source of truth; it is a copy that can, in principle, be rebuilt from the origin.</li>
<li><b>Hit and miss.</b> A <b>hit</b> is a request the cache can answer by itself. A <b>miss</b> is a request the cache cannot answer, so the origin must be asked.</li>
<li><b>Hit rate.</b> The share of requests that are hits: hits divided by (hits plus misses). It is the single number that tells you whether a cache is earning its complexity.</li>
<li><b>Working set.</b> The set of keys actually being read often enough to matter right now. A cache only helps if it can hold the working set; a cache smaller than the working set behaves close to having no cache at all.</li>
<li><b>Cold cache.</b> A cache that is empty or nearly empty, right after a restart or a deploy, so almost every request is a miss until it fills back up. A <b>warm</b> cache is one that already holds the working set.</li>
<li><b>TTL (time to live), plural TTLs.</b> How long a cached value is allowed to be served before it must be treated as too old and refetched from the origin.</li>
<li><b>Eviction.</b> Removing an entry from the cache to make room for another, chosen by an <b>eviction policy</b> such as LRU (least recently used) or LFU (least frequently used).</li>
<li><b>Cache-aside (lazy loading).</b> The application checks the cache first; on a miss, it reads the origin itself and writes the result into the cache for next time.</li>
<li><b>Read-through.</b> The same idea as cache-aside, except the cache (or a library sitting in front of it) does the origin read on a miss itself, so the application only ever talks to the cache.</li>
<li><b>Write-through.</b> A write goes to the cache, and the cache writes it to the origin before telling the application the write succeeded, so the cache and the origin never disagree.</li>
<li><b>Write-behind (write-back).</b> A write goes to the cache, the application is told it succeeded immediately, and the cache writes it to the origin later, often batched with other writes.</li>
<li><b>Write-around.</b> A write goes straight to the origin and skips the cache entirely; the value only enters the cache later, on a read miss.</li>
<li><b>Cache stampede (thundering herd, dogpile).</b> Many requests for the <i>same</i> key arrive at once right after it expires or is evicted, and all of them miss and hit the origin at the same time to recompute the same value.</li>
<li><b>Cache avalanche.</b> A large number of <i>different</i> keys expire together, or the cache itself goes down, so a big share of all traffic hits the origin at once rather than just the traffic for one key.</li>
<li><b>Request coalescing (single-flight).</b> Letting only the first of several concurrent requests for the same missing key actually go to the origin, and handing the same result to the others once it returns, instead of sending them all.</li>
<li><b>Jitter.</b> Randomness added to a TTL or a retry delay so that many entries or many clients do not all act at the exact same moment.</li>
<li><b>Invalidation.</b> Telling the cache that a value is no longer good, before its TTL would otherwise have expired it, usually because the origin just changed.</li>
<li><b>Cache key.</b> The string a value is stored and looked up under. A <b>versioned key</b> bakes a version number into the key itself, so a changed value gets a new key instead of overwriting the old one.</li>
<li><b>Sharding.</b> Splitting a cache's keys across more than one node, so no single node has to hold or serve everything.</li>
<li><b>Consistent hashing.</b> A way of assigning keys to nodes so that adding or removing one node only moves the keys near it, instead of reshuffling almost every key in the cache.</li>
<li><b>Hot key.</b> One key that gets far more traffic than the others, enough to overload the single node or shard that holds it even while the cluster as a whole has spare capacity.</li>
<li><b>Circuit breaker.</b> A guard in front of a dependency that stops sending it calls once it is clearly failing, so a struggling origin is not also buried under the traffic a dead cache would have absorbed.</li>
</ul>`,
        deeper: `<p>Two pairs of terms in this list are easy to blend together and worth keeping separate on purpose. A stampede is about <i>one</i> key and a burst of concurrent requests for it; an avalanche is about <i>many</i> keys losing their cached value around the same time, or the cache disappearing outright. And cache-aside and write-through are not opposites on the same axis - cache-aside is mainly a way of handling reads (the application fills the cache on a miss), while write-through and write-behind are ways of handling writes (how a change gets from the application into the origin). A real system usually picks one pattern for reads and a separate one for writes, and the two choices are made for different reasons.</p>`,
        check: {
          question: 'A key gets far more traffic than any other key in the system, and its shard is overloaded even though the rest of the cluster is fine. What is this called?',
          options: [
            'A cache avalanche',
            'A hot key',
            'Cache penetration',
            'A cold cache'
          ],
          answer: 1,
          explain: 'A hot key is one key drawing disproportionate traffic, enough to overload the single node holding it. An avalanche is many keys losing their value together, which is a different problem with a different fix.'
        }
      },
      {
        id: 'cache-1',
        part: 'field',
        title: 'Where caches live',
        body: `<p>A request can pass through several caches before it ever reaches a database, and each one exists to remove load from a different, slower thing behind it.</p>
<p><b>Browser cache.</b> The user's own browser stores a response locally, controlled by HTTP headers like <code>Cache-Control</code> and <code>ETag</code>. It solves the round trip to the network entirely - a hit never leaves the device. It only helps that one user, and only for content that is safe to reuse across their own repeated visits.</p>
<p><b>CDN (content delivery network).</b> A globally distributed set of edge servers, positioned close to users, that cache content on the network's behalf. It solves distance: a user in another country reads from a nearby edge location instead of crossing the ocean to the origin. It is shared across every user near that edge, which is why it works best for content that is the same for everyone - images, scripts, and API responses that do not depend on who is asking.</p>
<p><b>Gateway or reverse-proxy cache.</b> Sitting just in front of the application servers (for example, in a load balancer, an API gateway, or a tool like Varnish or NGINX), this cache solves load on the application layer itself: identical requests are answered without ever running the application's own code.</p>
<p><b>Application (in-process or local) cache.</b> A cache kept inside the application process's own memory, such as a hash map of recent results. It solves the cost of recomputing something inside that one process, with no network hop at all, but it only exists on that one instance and disappears when that instance restarts, and it does not stay consistent with the same cache on another instance.</p>
<p><b>Distributed cache.</b> A separate service, such as Redis or Memcached, shared by every instance of the application. It solves the problem the in-process cache cannot: every instance sees the same cached value, and the cache survives any one application instance restarting. It costs a network hop that the in-process cache does not.</p>
<p><b>Database cache (buffer pool, query cache).</b> The database's own internal cache of recently used pages or query results, entirely inside the database. It solves disk I/O: a page already in memory does not need to be read from disk again. It is invisible to the application and is not something the application configures directly.</p>`,
        deeper: `<p>These layers stack, and each one only sees the traffic the layer in front of it let through. A CDN sitting in front of a gateway cache means the gateway only ever sees the requests the CDN missed on; a hit rate that looks unimpressive at the gateway can still mean the vast majority of real user traffic never got that far. When you are asked to design caching for a system, naming which layer you are adding and which specific load it removes is worth more than saying "add a cache" once.</p>`,
        check: {
          question: 'An API returns the same product listing to every user in a country, and the product data changes only a few times a day. Which cache layer removes the most load with the least effort?',
          options: [
            'An in-process application cache, since it has no network hop',
            'A CDN, since the response is identical for every user near a given location and changes rarely',
            'The database buffer pool, since it is already there',
            'The browser cache, since it is free'
          ],
          answer: 1,
          explain: 'Content that is the same for everyone and changes rarely is exactly what a CDN is built for: it serves the whole population near an edge location from one cached copy, removing that traffic from every layer behind it.'
        }
      },
      {
        id: 'cache-2',
        part: 'field',
        title: 'Cache-aside and read-through',
        viz: 'cache-aside-flow',
        body: `<p><b>Cache-aside</b> is the pattern most engineers reach for first, because the application stays in full control of both stores. On a read, the application checks the cache. On a hit, it returns the value directly. On a miss, the application itself reads the origin, writes the result into the cache, and then returns it - so the next request for that key is a hit.</p>
<p>The appeal is that the cache and the origin are two separate calls the application makes explicitly, which makes cache-aside easy to reason about and easy to bolt onto an existing system without changing the origin at all. The cost is that every miss pays for two round trips in sequence - cache, then origin - and the application code has to remember to populate the cache on every miss path, which is easy to forget in one code path and not another.</p>
<p><b>Read-through</b> is the same idea with the responsibility moved: the cache itself (or a thin library sitting in front of it) knows how to load from the origin on a miss, so the application only ever talks to one thing, the cache. This removes the risk of an application forgetting to fill the cache, at the cost of the cache needing to know how to reach the origin, which couples the two more tightly than cache-aside does.</p>
<p><b>Consistency, either way.</b> Both patterns only refresh a key when it is <i>read</i> after going stale or missing. If the origin changes and nothing reads that key again until its TTL expires, the cache keeps serving the old value for the rest of the TTL. Neither pattern, by itself, tells the cache about a write the moment it happens - that is a separate concern, covered under invalidation later in this chapter. What cache-aside and read-through give you is a bounded staleness window (the TTL), not immediate freshness.</p>`,
        deeper: `<p>A subtle failure mode of cache-aside is worth naming: if a read and a concurrent write interleave badly, a stale value can get written into the cache <i>after</i> a newer value already went to the origin. Request A misses, starts reading the old value from the origin; before A writes that old value into the cache, a write updates the origin to a new value; A's read finally finishes and writes the now-stale value into the cache, overwriting nothing (since A never saw the new write) but leaving the cache wrong until the next miss or an explicit invalidation. This is rare in practice because the window is small, but it is why a short TTL is still worth keeping even under cache-aside - it bounds how long that kind of race can matter.</p>`,
        check: {
          question: 'Under cache-aside, who is responsible for writing a value into the cache after a miss?',
          options: [
            'The cache itself, automatically',
            'The database, as part of committing the write',
            'The application, as an explicit step after it reads the value from the origin',
            'Nobody - cache-aside never populates the cache on a miss'
          ],
          answer: 2,
          explain: 'Cache-aside puts the application in charge of both calls: check the cache, and on a miss, read the origin and write the result back into the cache. Read-through is the variant where the cache does that origin read itself instead.'
        }
      },
      {
        id: 'cache-3',
        part: 'field',
        title: 'Write-through and write-behind',
        viz: 'write-through-vs-behind',
        body: `<p>Where cache-aside and read-through are about what happens on a read, write-through and write-behind are about what happens on a write.</p>
<p><b>Write-through.</b> A write is sent to the cache, and the cache writes it to the origin synchronously, only telling the application the write succeeded once the origin has confirmed it. This keeps the cache and the origin in agreement at all times for anything written this way: there is never a moment where the cache holds a value the origin does not also have. The cost is latency - every write now waits for the slower of the two stores, which is almost always the origin - and the origin still has to absorb the full write volume, since nothing about write-through reduces how many writes reach it.</p>
<p><b>Write-behind (write-back).</b> A write is written to the cache and acknowledged to the application immediately, and the cache writes it to the origin later, often batching several writes into one operation. This makes writes fast and can turn many small writes into one larger, cheaper one at the origin. The cost is durability: if the cache crashes or loses power before a buffered write reaches the origin, that write is gone, even though the application was already told it succeeded. Write-behind also makes ordering and retries harder to get right, since the cache now owns a queue of pending writes it must eventually deliver, in the right order, even after its own failures.</p>
<p><b>Choosing between them.</b> Write-through is the safer default whenever losing an acknowledged write is not acceptable - a payment, an order, anything with a real cost to being wrong. Write-behind earns its complexity when the write volume is high, the origin is comparatively slow or expensive per write, and losing the last few seconds of writes on a rare crash is a cost the system is willing to accept - view counts and activity logs are common examples.</p>`,
        deeper: `<p>Write-through and write-behind are usually paired with cache-aside or read-through on the read side, not with each other - a system typically has one write pattern and one read pattern, chosen somewhat independently. It is worth being explicit in an interview about which axis you are answering: "reads are cache-aside, writes are write-through" is a complete, precise sentence that a vague "we cache it" is not.</p>`,
        check: {
          question: 'A system uses write-behind for a counter that increments millions of times a minute. The cache node holding the buffered increments crashes before flushing to the database. What is lost?',
          options: [
            'Nothing - write-behind never loses data',
            'Only the increments the cache had accepted and acknowledged but not yet flushed to the database',
            'The entire counter, back to zero',
            'Nothing in the cache, only in the database'
          ],
          answer: 1,
          explain: 'Write-behind acknowledges a write before it reaches the origin. Anything sitting in the cache\'s buffer, already acknowledged to callers, is gone if the cache crashes before flushing - that is the durability cost the pattern trades for write speed.'
        }
      },
      {
        id: 'cache-4',
        part: 'field',
        title: 'Eviction policies: LRU, LFU, FIFO, random, and TTL',
        viz: 'lru-list',
        body: `<p>A cache has finite memory, so once it is full, adding a new entry means removing an old one. The <b>eviction policy</b> is the rule for which one to remove.</p>
<p><b>LRU (least recently used).</b> Evict the entry that has gone the longest without being read. It works well because real traffic tends to keep reading recently popular things, so "not read in a while" is a decent proxy for "unlikely to be read again soon."</p>
<p><b>LFU (least frequently used).</b> Evict the entry with the fewest total reads. It handles a case LRU gets wrong: a key read constantly for a week and then not touched for an hour has earned more trust than a key read once, ten seconds ago, that LRU would treat as more valuable simply because it is more recent.</p>
<p><b>FIFO (first in, first out).</b> Evict whatever was inserted first, regardless of how often or how recently it has been read. It costs almost nothing to implement and ignores usage entirely, which makes it a poor fit whenever some keys are clearly more popular than others.</p>
<p><b>Random.</b> Evict a randomly chosen entry. It sounds crude, but it costs almost nothing to run and, on real traffic, performs surprisingly close to LRU - which is why Redis offers it as a real option, not just a fallback.</p>
<p><b>TTL-based.</b> Evict (expire) whatever has been in the cache longest relative to its own configured lifetime, independent of how popular it is. This is not really about memory pressure at all - it exists to bound staleness, and is usually combined with one of the policies above rather than used by itself.</p>
<p><b>Implementing LRU in O(1)</b> (O(1), or constant time, means the operation takes the same small, bounded number of steps regardless of how many entries the cache holds). The classic implementation pairs a <b>hash map</b> with a <b>doubly linked list</b>. The list holds every entry in order of use, most recently used at the head and least recently used at the tail; the hash map maps each key straight to its node in the list. A read that hits: look the key up in the hash map in O(1), then unlink that node and move it to the head of the list in O(1), because a doubly linked list lets you remove and re-insert a node without walking the list. An eviction: remove the node at the tail in O(1), and delete its key from the hash map. Every operation the cache needs - read, insert, evict - is O(1), which is exactly why this pairing, and not a plain sorted structure, is the standard answer.</p>`,
        deeper: `<p>Real caches rarely implement exact LRU at scale, because keeping one global list perfectly ordered under heavy concurrent access means a lot of contention on that list. Redis instead uses <b>approximated LRU</b>: on eviction, it samples a small number of keys at random (five, by default) and evicts the one among them with the oldest last-access time, rather than tracking one exact global order. Raising the sample size makes the approximation closer to true LRU at the cost of a little more work per eviction; in practice, a small sample already performs close to exact LRU on typical access patterns.</p>`,
        check: {
          question: 'Why does the classic O(1) LRU implementation use a doubly linked list rather than a singly linked list or an array?',
          options: [
            'A doubly linked list uses less memory per node',
            'A doubly linked list lets a node in the middle be unlinked and moved to the head in O(1), without walking the list to find its neighbours',
            'Arrays cannot store key-value pairs',
            'A hash map cannot be combined with a singly linked list'
          ],
          answer: 1,
          explain: 'Moving a just-read entry to the front requires removing it from wherever it currently sits. A doubly linked list node already points to both its neighbours, so unlinking and re-inserting it is O(1); a singly linked list would need to walk from the head to find the previous node first, and an array would need to shift elements.'
        }
      },
      {
        id: 'cache-5',
        part: 'field',
        title: 'TTL expiry and background reapers',
        body: `<p>A TTL is only useful if something actually acts on it once it passes. There are two ways a cache can enforce one, and most real caches use both together.</p>
<p><b>Lazy (passive) expiration.</b> The cache checks a key's TTL only when that key is next read. If the TTL has passed, the cache treats the read as a miss, discards the stale entry, and lets the normal miss path (cache-aside or read-through) refill it. This costs nothing for keys nobody reads again - an expired key that is never requested can sit in memory doing no harm except taking up space, and lazy expiration alone would never notice or reclaim it.</p>
<p><b>Active expiration (a background reaper).</b> A background process periodically scans some or all of the keyed entries, checks their TTLs, and deletes anything that has expired, whether or not anyone has tried to read it. This reclaims memory that lazy expiration would otherwise leave sitting around forever, at the cost of using CPU time for work that produces no immediate answer to any specific request.</p>
<p><b>Why both.</b> Lazy expiration alone can leak memory: a cache full of keys nobody reads again would never be cleaned up, since nothing ever checks them. Active expiration alone can waste work scanning keys that would have expired lazily the moment someone actually asked for them, and it cannot promise to have gotten to every key by any specific deadline if it only samples. Redis, for example, runs an active cycle that repeatedly samples a small batch of keys with a TTL set, expires the ones that have passed, and repeats faster if it found a lot of expired keys in that batch and slower if it found few - a self-tuning way to spend more effort exactly when there is more expired data waiting to be reclaimed, without ever pausing to scan the entire keyspace at once.</p>
<p>Either mechanism only removes a key once its TTL has passed; neither one makes a cache aware that the underlying data changed sooner than that. That earlier, event-driven kind of freshness is what invalidation, a few sections ahead, is for.</p>`,
        deeper: `<p>A TTL is also a knob, not just a cleanup mechanism: shorter TTLs bound staleness more tightly and cost more origin load (more misses); longer TTLs cost less origin load and tolerate more staleness. Choosing a TTL is choosing a point on that trade-off for a specific piece of data, and it is worth being able to say, for any cached value, roughly how stale it is allowed to be before it matters.</p>`,
        check: {
          question: 'A cache uses only lazy (passive) expiration, with no background reaper. A key expires and is never read again by anyone. What happens to it?',
          options: [
            'It is deleted the moment its TTL passes',
            'It sits in memory indefinitely, since nothing ever checks or reclaims it without a read',
            'The cache automatically restarts to clear it',
            'It is moved to the database'
          ],
          answer: 1,
          explain: 'Lazy expiration only checks a key\'s TTL when that key is read. A key nobody ever asks for again is never checked, so it keeps occupying memory until something else removes it - which is exactly the gap a background reaper (active expiration) is meant to close.'
        }
      },
      {
        id: 'cache-6',
        part: 'field',
        title: 'Cache stampede and thundering herd',
        viz: 'cache-stampede',
        body: `<p>A cache stampede happens when a popular key expires or gets evicted, and every request that was relying on it arrives at almost the same moment. Instead of one request rebuilding the value, dozens or thousands of concurrent requests all miss at once, and all of them go to the origin to recompute the exact same result - at the worst possible moment, since the key was popular precisely because it was being read constantly. The origin, which the cache was supposed to be protecting, can be knocked over by a burst of duplicate work for one piece of data.</p>
<p><b>Locking.</b> Let only the first request that misses actually go compute the value, using a lock (often just a short-lived key in the cache itself, acting as a mutex). Every other concurrent request for the same key either waits for the lock to release and then reads the now-filled cache, or is told to briefly serve a slightly stale value instead of waiting. This turns "many requests hit the origin" into "one request hits the origin, and everyone else waits or gets a stale answer for a moment."</p>
<p><b>Request coalescing (single-flight).</b> A close relative of locking, implemented in the application or client library rather than the cache: if a request for a key is already in progress, later requests for that same key are attached to that same call, already under way, and all receive its result when it returns, rather than each starting a separate call to the origin.</p>
<p><b>Early recomputation.</b> Instead of waiting for a key to actually expire before doing anything, recompute it slightly <i>before</i> its TTL is up, with a probability that grows the closer the key gets to expiring. Done well, this means a hot key's value almost always gets refreshed by a single background recompute before it ever has the chance to expire and cause a burst of concurrent misses at all.</p>
<p><b>Jitter.</b> Add a small amount of randomness to each key's TTL, so that a batch of keys all cached at the same moment (for example, right after a deploy warms the cache) do not all expire at the exact same instant later. Spreading expirations out in time turns one large stampede into many small, harmless trickles of misses.</p>`,
        deeper: `<p>These four techniques are complementary, not competing: jitter reduces how often many keys expire together in the first place; early recomputation tries to refresh a hot key before it ever actually misses; and locking or coalescing is the backstop for whatever still gets through - a key that does expire with concurrent readers waiting. A production cache in front of a popular endpoint typically uses more than one of these together, because each closes a different gap the others leave open.</p>`,
        check: {
          question: 'A cached value that is read constantly expires, and 2,000 concurrent requests all miss within the same second. What does request coalescing do about it?',
          options: [
            'It increases the TTL automatically',
            'It lets only one of those requests actually call the origin, and shares its result with the other 1,999 once it returns',
            'It deletes the key permanently to avoid future stampedes',
            'It sends all 2,000 requests to the origin, but in a randomized order'
          ],
          answer: 1,
          explain: 'Request coalescing recognizes that many concurrent requests are asking for the same missing key and lets only the first one actually do the work, attaching every other one to that same call, already under way, so they all get the answer without each hitting the origin separately.'
        }
      },
      {
        id: 'cache-7',
        part: 'field',
        title: 'Invalidation',
        body: `<p>A TTL bounds staleness passively - a value is trusted until a deadline, whether or not it is still correct. <b>Invalidation</b> is telling the cache a value has gone stale the moment the origin actually changes, instead of waiting for that deadline.</p>
<p><b>Event-driven invalidation.</b> When a write happens at the origin, it publishes an event (directly, through a message queue, or through a <b>change-data-capture</b> stream - a feed of every row change the database itself emits) that says which key or keys just changed. Something subscribed to that event deletes or updates the matching cache entry right away, so the next read is a guaranteed miss that refetches the current value, rather than serving a stale one until the TTL happens to expire.</p>
<p><b>Versioned keys.</b> Instead of updating or deleting an existing cache entry when the underlying data changes, bake a version into the key itself - for example, including the row's own <code>updated_at</code> timestamp, or a separately tracked version number, as part of the key string. A write that changes the data produces a new key; reads for the new version are guaranteed misses that populate a fresh entry, and the old entry is simply never read again and eventually falls out through ordinary eviction or TTL, without anyone needing to explicitly find and delete it.</p>
<p><b>Why invalidation is hard.</b> A cache is often replicated across several nodes, so "invalidate this key" has to reach every node that might be holding it, not just one - and if that invalidation message is lost, delayed, or arrives out of order relative to the write it describes, a node can keep serving the old value indefinitely with no TTL left to eventually save it. There is also a race between the write finishing and the invalidation arriving: a read that falls in that gap can still see a stale value even though the origin has already changed. And a system frequently has more than one caching layer - browser, CDN, application - each with its own TTL and its own invalidation path, so "the data changed" can require coordinating several different mechanisms rather than one.</p>`,
        deeper: `<p>Versioned keys sidestep the hardest part of event-driven invalidation - reliably deleting the one old entry everywhere it might be cached - by never needing to delete anything at all. The trade is that old versions still occupy space until eviction reclaims them, so versioned keys work best paired with a reasonably short TTL or an eviction policy that can be trusted to clear out entries nobody reads anymore.</p>`,
        check: {
          question: 'A cache is replicated across three nodes. An invalidation message for a changed key is sent, but a network issue means only two of the three nodes receive it. What happens?',
          options: [
            'Nothing - the cache automatically retries until all nodes are updated',
            'The third node keeps serving the old, stale value until its own TTL expires or it is separately invalidated',
            'The whole cache is automatically cleared as a safety measure',
            'The write to the origin fails'
          ],
          answer: 1,
          explain: 'Event-driven invalidation has to reach every node holding the value to actually work. A node that never receives the message has no way to know its copy is stale, and keeps serving it until something else - a TTL, a later invalidation, or eviction - removes it.'
        }
      },
      {
        id: 'cache-8',
        part: 'field',
        title: 'Distributed cache design: Redis, Memcached, and what happens when the cache is down',
        viz: 'consistent-hash-ring',
        body: `<p><b>Redis</b> and <b>Memcached</b> are the two distributed caches asked about most often, and they are not interchangeable. Memcached is a pure cache: plain key-value storage, no persistence, and it is multi-threaded, which lets it use several CPU cores for a single instance. Redis stores richer data structures (lists, sets, sorted sets, hashes, not just strings), can persist to disk and be used as more than a cache, and runs its core command processing on a single thread per instance, which keeps individual operations predictable but means one Redis instance does not use more than one core for that work by itself.</p>
<p><b>Sharding a cache.</b> A single cache node has a memory ceiling, so a large working set is split across many nodes by <b>sharding</b>: each key is assigned to one node, usually by hashing the key. Plain hashing (key hash modulo the number of nodes) has a serious problem: adding or removing one node changes the modulus, which reassigns almost every key to a different node at once, turning nearly every request into a miss right when the cluster just changed. <b>Consistent hashing</b> fixes this by placing both nodes and keys on a conceptual ring by hash value; a key belongs to the next node clockwise from it. Adding or removing a node then only moves the keys between it and its neighbour on the ring, leaving the rest of the assignment untouched. Real deployments add many <b>virtual nodes</b> per physical node around the ring, so that the keys a departing node was holding get spread across several remaining nodes instead of dumping them all onto just one neighbour.</p>
<p><b>Replication.</b> A cache node is often paired with one or more replicas that receive a copy of its data, so a node failure does not mean losing everything it held - the replica can take over serving reads, and in Redis's case can be promoted to replace a failed primary for writes.</p>
<p><b>Hot keys.</b> Sharding balances load only when different keys get roughly similar traffic. A single extremely popular key still maps to exactly one shard under consistent hashing, and that shard can be overloaded even while every other shard is idle. Fixes include keeping an extra, very short-lived copy of that one key in every application instance's own local memory, or deliberately splitting one hot key into several sub-keys spread across shards and combining their results on read.</p>
<p><b>When the cache is down.</b> A cache-aside setup naturally treats an unreachable cache as a permanent miss and falls back to reading the origin directly - which is exactly the problem, because the cache was likely absorbing the great majority of traffic, and the origin was never sized to take all of it at once. This is the same kind of failure as a cache avalanche, and the same tools apply: a circuit breaker in front of the cache so the application fails fast instead of piling up slow calls to a dead cache, request coalescing so concurrent requests for the same key do not each hit the origin separately, and load shedding or rate limiting on the origin so it degrades rather than falls over entirely.</p>`,
        deeper: `<p>Redis Cluster does not use a hash ring directly; it splits the keyspace into 16,384 fixed <b>hash slots</b>, and each node owns a set of those slots. Rebalancing moves whole slots between nodes rather than recomputing a ring position for every key, which achieves the same goal as consistent hashing - bounded, targeted movement instead of a full reshuffle - through a different, simpler mechanism suited to a cluster that manages its own membership.</p>`,
        check: {
          question: 'A cache cluster grows from 4 nodes to 5. Under plain hash-modulo-N sharding, roughly what fraction of keys change which node they belong to?',
          options: [
            'None - the new node only takes keys that were about to expire anyway',
            'Only the keys already on the busiest node',
            'The great majority of keys, because changing the modulus from 4 to 5 changes almost every key\'s hash-mod-N result',
            'Exactly 20%, matching the size of the new node\'s share'
          ],
          answer: 2,
          explain: 'Hash-modulo-N ties every key\'s node assignment to the exact value of N. Changing N from 4 to 5 changes the result of "hash mod N" for nearly every key, not just a proportional slice - which is precisely the problem consistent hashing is built to avoid.'
        }
      },
      {
        id: 'cache-9',
        part: 'field',
        title: 'Worked example: sizing a cache for a read-heavy feature API',
        body: `<p>Say a feature-serving API for a recommendation model gets 20,000 reads per second at peak, each one asking for one entity's precomputed features. Traffic follows the usual pattern for this kind of workload: a Zipf-like skew where a minority of entities (active users, popular items) account for most of the reads, and a long tail of entities are read rarely. The target is a 95% hit rate, meaning only 5% of reads - 1,000 requests per second at peak - are allowed to reach the origin.</p>
<p><b>Step 1: how many distinct entities need to be cached.</b> Suppose analysis of recent traffic shows the top 2 million distinct entities (out of a much larger total population) account for 95% of all reads over a rolling window matching the TTL. That is the number the cache needs to hold to hit the 95% target - not the entire population, just its actively-read core.</p>
<p><b>Step 2: size per entry.</b> Say each entity's feature vector serializes to 1.5 KB. Redis also carries its own bookkeeping per key - the exact number depends on the value's internal encoding, but budgeting roughly 100 bytes of overhead per key is a reasonable planning assumption. That puts each entry at about 1.6 KB.</p>
<p><b>Step 3: total memory for the working set.</b> 2,000,000 entries x 1.6 KB is about 3.2 GB. Add a replica of each shard for failover, which roughly doubles the memory footprint to about 6.4 GB, and add headroom - say 30% - for growth and for the fact that traffic and popularity shift over time, bringing the planning target to roughly 8 to 8.5 GB.</p>
<p><b>Step 4: what the origin still needs to handle.</b> At a 95% hit rate, the origin only has to serve the remaining 5% of 20,000 requests per second - 1,000 requests per second - plus whatever write volume updates the underlying data. That is the number to size the database's read capacity against, not the full 20,000; sizing it for the full request rate would mean paying for capacity the cache exists specifically to avoid needing.</p>
<p><b>Step 5: sanity-check the TTL.</b> If features are recomputed hourly upstream, a TTL of 10 to 15 minutes keeps served data reasonably fresh relative to how often it actually changes, without pushing the miss rate up by refetching far more often than the data itself changes.</p>`,
        deeper: `<p>The 95% target is not free to raise. Because the access pattern is skewed, going from 95% to 99% hit rate does not mean caching 5% more entities - it usually means reaching much further into the long tail, where each additional entity contributes far less traffic than the ones already cached. Doubling or tripling the cache's memory footprint to move from 95% to 99% is a common, real trade-off, and being able to say "the last few points of hit rate are the expensive ones, because of the traffic skew" is the kind of sentence that shows you understand why the last few points cost so much, rather than just quoting the target number.</p>`,
        check: {
          question: 'In the worked example, why does the origin only need to be sized for 1,000 requests per second rather than the full 20,000?',
          options: [
            'Because the origin is faster than the cache',
            'Because a 95% cache hit rate means only the remaining 5% of requests - the misses - ever reach the origin',
            'Because the cache handles writes as well as reads',
            'Because 1,000 requests per second is an industry standard limit'
          ],
          answer: 1,
          explain: 'Hit rate describes exactly what share of requests the cache answers by itself. At 95%, only the other 5% - the misses - are ever forwarded to the origin, so that smaller number, not the full request rate, is what the origin has to be provisioned for.'
        }
      }
    ],
    connect: null,
    activities: [
      {
        id: 'cache-a1',
        type: 'design',
        title: 'Design the caching layer for a product detail page',
        prompt: `"Our product detail page gets 50,000 reads per second and about 200 writes per second when sellers update price or stock. Reads are 250x writes. Walk me through how you would add caching to this, top to bottom."`,
        timeboxSec: 600,
        rubric: `Must-haves: (1) names at least two distinct cache layers appropriate to the traffic described - for example a CDN or gateway cache for the parts of the page that do not vary per request, and a distributed cache such as Redis for the per-product data; (2) picks a read pattern (cache-aside or read-through) and a write pattern (write-through or write-behind, or explicitly write-around plus cache-aside) and justifies the choice against the given read:write ratio, noting that at 250:1 reads to writes, optimizing the read path matters far more than the write path; (3) specifies a TTL and reasons about the staleness it implies for a price or stock value, rather than picking an arbitrary number with no justification; (4) addresses at least one of stampede risk (a very popular product page) or invalidation (updating the cache the moment price/stock changes rather than waiting for TTL expiry) with a concrete mechanism; (5) states what happens if the cache is unavailable, and that the fallback should not be "the database absorbs all 50,000 reads per second unprotected." Common mistakes: saying "we'll cache it" with no layer, pattern, or TTL specified; ignoring the write path entirely; not mentioning what happens when the cache is down. {{HONESTY}}`,
        model: `"With reads at 50,000 a second against only 200 writes, I'd optimize hard for the read path and keep the write path simple.

For layers, I'd put a CDN in front of anything that doesn't vary by user - images, most of the page markup - and a distributed cache, Redis, in front of the per-product data: price, stock, description. Each layer removes a different kind of load.

For Redis, cache-aside for reads: check Redis, and on a miss, read the database and populate Redis. For writes, write-through rather than write-behind - stock and price are exactly the data where I don't want to risk losing an acknowledged write if the cache crashes before flushing, and write-behind's speed isn't worth that risk at only 200 writes a second.

I'd set a short TTL, maybe 30 to 60 seconds, since stale stock or price is a visible problem. But I wouldn't rely on TTL alone: on every price or stock write, I'd invalidate that product's key immediately, so the change is visible on the next read.

Given how popular one product can get, I'd also want request coalescing on the miss path, so a burst of concurrent misses after an invalidation doesn't turn into a stampede on the database.

And if Redis goes down, I would not let 50,000 reads a second hit the database directly - a circuit breaker in front of the cache calls, so the application fails fast to a degraded response, or rate limiting on the fallback path, since the database was never sized for that traffic alone."`
      },
      {
        id: 'cache-a2',
        type: 'explain',
        title: 'Diagnose a database overload right after a cache restart',
        prompt: `"At 2am, the caching layer restarted after a routine deploy. Within thirty seconds, the database's CPU spiked to 100% and started timing out. Nothing else changed. What happened, and how would you prevent this next time?"`,
        timeboxSec: 480,
        rubric: `Must-haves: (1) correctly identifies the mechanism as a cold cache / cache avalanche: the restart emptied the cache, so essentially every read became a miss at the same time, and all of that traffic - previously mostly absorbed by the cache - hit the database at once; (2) explicitly distinguishes this from a single-key cache stampede, since this is the whole cache going cold rather than one hot key expiring; (3) proposes at least one concrete prevention: warming the cache before it takes production traffic (pre-loading the known hot keys from a snapshot or the database before flipping traffic to the new instance), staggering the restart of cache nodes rather than restarting all at once, or rate-limiting/shedding load on the database path while the cache refills; (4) mentions that a circuit breaker or backpressure on the database would have limited the blast radius even if the cache still went cold, rather than only proposing a fix for the cache side. Common mistakes: describing this as a stampede on one key rather than a cold-cache event; proposing only "add more database capacity" without addressing the actual cause; not mentioning cache warming at all. {{HONESTY}}`,
        model: `"This is a cold cache problem, sometimes called a cache avalanche - the same underlying failure as a stampede, but on the scale of the whole cache rather than one key. The restart threw away everything the cache held, so the very next wave of reads was almost entirely misses, all hitting the database within the same few seconds.

The database was sized assuming the cache does most of the work, so a sudden 100%-miss rate is close to full production read traffic with no warning - exactly the load it wasn't provisioned for.

To prevent it, I'd do two things. First, warm the cache before it takes traffic: load the known hot keys, from recent access patterns or a snapshot, into the new instance before routing reads to it. Second, if there are multiple cache nodes, restart them one at a time, so most of the cluster stays warm at any moment.

I'd also want a backstop on the database side regardless, because warming won't cover every key: a circuit breaker or rate limit on the database read path, so a miss spike sheds or queues load instead of taking the database down entirely."`
      },
      {
        id: 'cache-a3',
        type: 'formulate',
        title: 'Work out how much memory a cache needs',
        prompt: `Practice problem. A session cache needs to hold 8 million active sessions at any moment. Each session serializes to 800 bytes, and you estimate roughly 70 bytes of per-key overhead in the cache. You also want one replica of every shard for failover. How much memory should you provision, and what would you add on top of the raw number?`,
        timeboxSec: 420,
        rubric: `Must-haves: (1) computes per-entry size correctly as roughly 870 bytes (800 + 70); (2) computes the raw working-set size as 8,000,000 x ~870 bytes, arriving at approximately 7 GB (6.96 GB); (3) correctly doubles for one replica per shard, reaching roughly 14 GB; (4) adds an explicit headroom margin (a stated percentage, commonly 20-30%, rather than an unjustified round number) and shows the resulting total, arriving in the rough range of 17-18 GB; (5) states at least one reason headroom is needed beyond the raw calculation - growth in active sessions, uneven distribution across shards, or the overhead estimate being approximate rather than exact. Common mistakes: forgetting the per-key overhead entirely; forgetting to double for the replica; presenting a headroom number with no stated reason. {{HONESTY}}`,
        model: `"Each session is 800 bytes of data plus about 70 bytes of overhead the cache itself adds per key, so call it roughly 870 bytes per entry. For 8 million active sessions, that's 8,000,000 times 870 bytes, which is about 6.96 gigabytes - call it 7 gigabytes for the raw working set.

Since I want one replica of every shard for failover, that roughly doubles the memory footprint, since a replica holds a full copy of whatever its primary holds. That brings it to about 14 gigabytes.

On top of that I'd add headroom, maybe 25 to 30%, which brings the provisioning target to somewhere around 17 to 18 gigabytes. I wouldn't skip that step - the 8 million figure is a snapshot of current active sessions, and that number grows with traffic and with product changes; the per-key overhead I used is an estimate, not an exact figure, since the real number depends on the value's internal encoding; and sessions are unlikely to be perfectly evenly distributed across shards, so some shards will run hotter than the average and need slack to absorb that.

I'd treat 17 to 18 gigabytes as the number to provision against today, and I'd want to revisit it against real measured session counts and real measured per-key overhead once it's running, rather than trusting the back-of-envelope number forever."`
      }
    ],
    sayQuestion: null,
    sayItOutLoud: null,
    readings: [
      { l: 'ByteByteGo - Top caching strategies', u: 'https://blog.bytebytego.com/p/top-caching-strategies', w: 'Covers the core read and write patterns - cache-aside, read-through, write-around, write-back, write-through - with the standard diagrams this chapter follows.', m: 8 },
      { l: 'Redis docs - Key eviction', u: 'https://redis.io/docs/latest/develop/reference/eviction/', w: 'The primary source for how LRU, LFU, random and TTL-based eviction actually work in a real cache, including the approximated-LRU sampling detail.', m: 15 },
      { l: 'PRIMER: Amazon Builders\' Library - Caching challenges and strategies', u: 'https://aws.amazon.com/builders-library/caching-challenges-and-strategies/', w: 'The clearest primer on cache staleness, the thundering herd problem, and surviving a downstream outage when the cache is unavailable.', m: 20 },
      { l: 'Hello Interview - Caching', u: 'https://www.hellointerview.com/learn/system-design/core-concepts/caching', w: 'One page walking through where to cache, all four read/write patterns, eviction, stampedes, and hot keys, tying the whole chapter together.', m: 15 },
      { l: 'Video: Jordan has no life - Consistent Hashing', u: 'https://www.youtube.com/watch?v=kiCbLOPmBh4', w: 'Explains consistent hashing and virtual nodes, the mechanism a sharded Redis or Memcached cluster uses to place keys and rebalance.', m: 20 },
      { l: 'Video: Hussein Nasser - Memcached Architecture Crash Course', u: 'https://www.youtube.com/watch?v=NCePGsRZFus', w: 'Takes a real distributed cache apart end to end: memory management, LRU eviction internals, threading, and a live demo.', m: 65 }
    ],
    glossary: [
      {
        g: 'Caching',
        sub: '',
        rows: [
          ['Hit rate', 'Hits divided by hits plus misses; the number that says whether a cache is worth its complexity', 'sizing and design'],
          ['Cache-aside', 'The application checks the cache, and on a miss reads the origin and fills the cache itself', 'read patterns'],
          ['Write-through', 'A write is confirmed only after it reaches both the cache and the origin', 'write patterns'],
          ['Write-behind', 'A write is acknowledged immediately and flushed to the origin later, batched', 'write patterns'],
          ['LRU', 'Evicts the entry not read for the longest time; implemented with a hash map plus a doubly linked list for O(1) operations', 'eviction'],
          ['Approximated LRU', 'Redis evicts the oldest of a small random sample rather than tracking one exact global order', 'eviction'],
          ['Cache stampede', 'Many concurrent requests for one expired key all miss and hit the origin at once', 'stampede and avalanche'],
          ['Cache avalanche', 'Many different keys expire together, or the cache itself fails, sending a broad spike of traffic to the origin', 'stampede and avalanche'],
          ['Request coalescing', 'Only the first of several concurrent requests for a missing key actually calls the origin; the rest share its result', 'stampede mitigation'],
          ['Jitter', 'Randomness added to a TTL so many entries do not expire at the same instant', 'stampede mitigation'],
          ['Versioned key', 'A cache key that bakes in a version, so a changed value gets a new key instead of needing an update or delete', 'invalidation'],
          ['Consistent hashing', 'Assigns keys to cache nodes on a ring so adding or removing a node only moves the keys near it', 'sharding'],
          ['Hot key', 'One key with disproportionate traffic, able to overload its single shard even when the cluster overall has room', 'distributed cache design'],
          ['Redis hash slots', 'Redis Cluster splits keys into 16,384 fixed slots per node rather than using a hash ring directly', 'distributed cache design']
        ]
      }
    ]
  };

  root.PREP_CORE['distributed-coordination'] = {
    id: 'distributed-coordination',
    title: 'Distributed systems and coordination',
    level: 'danger',
    levelLabel: 'Asked in almost every system design interview.',
    why: `Once a design has more than one machine, the interviewer's questions stop being about any single component and start being about what happens between them: what a node cannot know for certain about another node, what a client is actually guaranteed to see after a write, and what breaks when a leader disappears mid-request. This is where someone who has only memorised component names (a queue, a cache, a database) runs out of things to say, and where someone who can reason about partial failure, ordering, and quorums keeps going. Interviewers are listening for whether you know that these guarantees have precise names and real trade-offs, not just that "distributed systems are hard."`,
    learn: [
      {
        id: 'dc-0',
        part: 'field',
        title: 'Key terms',
        body: `<ul>
<li><b>Node.</b> One running instance in a distributed system - one server, one process participating in the system.</li>
<li><b>Partial failure.</b> Some nodes or some parts of a request fail while others keep working, unlike a single machine, which either runs or is down as a whole.</li>
<li><b>Network partition.</b> A break in communication between groups of nodes, so each side can still run but cannot reach the other side.</li>
<li><b>Consistency model.</b> A precise promise about what a reader is guaranteed to see, and in what order, relative to writes happening elsewhere in the system.</li>
<li><b>Linearizability.</b> The strongest common consistency model: every operation appears to happen instantly at one point in time, and every reader agrees on that same order, matching real time.</li>
<li><b>Eventual consistency.</b> The weakest common promise: if writes stop, every replica will eventually converge to the same value, with no guarantee about how long that takes or what you see in the meantime.</li>
<li><b>Read-your-writes.</b> A guarantee that the client who just made a write will see that write on their own next read, even if other clients might not yet.</li>
<li><b>Monotonic reads.</b> A guarantee that once a client has seen a value, a later read by that same client never shows them something older.</li>
<li><b>Replication.</b> Keeping copies of the same data on more than one node, for durability and for spreading out read load.</li>
<li><b>Leader (primary).</b> The one replica a system designates to accept writes in a leader-based scheme; the others are <b>followers (replicas)</b>.</li>
<li><b>Quorum.</b> A minimum number of nodes that must agree, or acknowledge, before an operation counts as done.</li>
<li><b>CAP theorem.</b> Its name spells out the three properties it is about - Consistency, Availability, Partition tolerance. During a network partition, a system must choose between staying consistent and staying available; it says nothing about normal operation when there is no partition.</li>
<li><b>Logical clock.</b> A counter used to order events without relying on physical, wall-clock time. A <b>Lamport clock</b> is the simplest one; a <b>vector clock</b> is a richer version that can detect when two events are concurrent rather than ordered.</li>
<li><b>Happens-before.</b> The relation saying one event causally influenced another - for example, a message being sent happens-before it being received.</li>
<li><b>Consensus.</b> Getting a group of nodes to agree on one value or one sequence of operations, even if some of them fail or messages are delayed.</li>
<li><b>Leader election.</b> The process by which nodes agree on which one of them is currently the leader, especially after the previous leader has failed.</li>
<li><b>Distributed lock.</b> A mechanism letting only one client at a time hold exclusive access to some resource, enforced by a shared coordination service rather than by one machine's own memory.</li>
<li><b>Lease.</b> A lock that expires automatically after a set time, so a crashed or unreachable holder does not block everyone else forever.</li>
<li><b>Fencing token.</b> A number that increases every time a lock or lease is granted, which the protected resource can use to reject a stale holder even if that holder still believes it owns the lock.</li>
<li><b>Circuit breaker.</b> A guard that stops calling a dependency once it is clearly failing, instead of letting every caller wait out its own timeout.</li>
<li><b>Gossip protocol.</b> A way for nodes to spread information by each periodically telling a few random peers what it knows, so the information reaches everyone without any central coordinator.</li>
<li><b>Distributed hash table (DHT).</b> A decentralized way to look up which node owns a given key, using a small number of hops rather than one node knowing everyone.</li>
</ul>`,
        deeper: `<p>Almost every term above exists to answer one of two questions: "what can I be sure a reader sees?" (the consistency and replication terms) or "how do independent nodes agree on anything at all when messages can be lost or delayed and any one of them can fail?" (the clock, consensus, and lock terms). Keeping those two questions apart while you read the rest of the chapter makes it much easier to see why each mechanism exists, instead of memorizing a list of unrelated names.</p>`,
        check: {
          question: 'What is the precise difference between a network partition and a node simply crashing?',
          options: [
            'There is no difference - both terms mean the same thing',
            'A crash means a node stops entirely; a partition means nodes on each side keep running normally but cannot communicate with each other',
            'A partition only happens in databases, never in application servers',
            'A partition is a planned event and a crash is always unplanned'
          ],
          answer: 1,
          explain: 'A crashed node is simply gone. A partition is more subtle: every node involved may be perfectly healthy and still running, but the network between two groups of them is broken, so each side has to decide how to behave while cut off from the other, not knowing whether the other side is down or just unreachable.'
        }
      },
      {
        id: 'dc-1',
        part: 'field',
        title: 'Why distributed systems are hard',
        body: `<p>A single machine either works or it does not, and its own memory always reflects the last instruction it ran. Add a second machine and a network between them, and three new problems appear that have no equivalent on one machine.</p>
<p><b>Partial failure.</b> In a distributed system, some nodes can fail while others keep working perfectly, and a request that touches several nodes can succeed on some of them and fail on others. Worse, when a request to another node times out, the caller genuinely cannot tell which of three things happened: the request never arrived, it arrived and is still being processed, or it arrived, was processed, and only the response was lost. All three look identical from the caller's side - silence - and each one calls for a different response. Retrying a request that actually succeeded, but whose response was lost, can mean doing the same write twice.</p>
<p><b>Unreliable networks.</b> Real networks do not guarantee that a message arrives, arrives once, arrives in order, or arrives within any fixed amount of time. Packets can be delayed by a slow link, dropped by a failing switch, duplicated by a retry somewhere, or reordered by taking different paths. A timeout is only ever a guess about how long is too long to wait - set it too short and you give up on requests that would have succeeded; set it too long and a genuinely failed dependency keeps every caller waiting far longer than necessary.</p>
<p><b>Clocks.</b> Each machine keeps its own physical clock, built from a quartz crystal that drifts - gains or loses time - at a small but real rate, and even frequent synchronization only bounds that drift, it does not eliminate it. Two machines' clocks are never perfectly identical at the same instant, which means you cannot safely say "event A happened before event B" just because A's timestamp is smaller than B's, if A and B happened on different machines. This is the single most common mistake in distributed system design: treating wall-clock timestamps from different machines as if they gave a reliable global order of events.</p>`,
        deeper: `<p>A concrete number for clock drift: a typical quartz clock drifts by roughly 200 parts per million. Over 86,400 seconds in a day, that works out to about 200 / 1,000,000 x 86,400 = 17.28 seconds of drift per day if left completely unsynchronized. Network Time Protocol (NTP) corrects for this continuously and usually keeps machines within a few milliseconds of each other on a good network, but "usually" is doing real work in that sentence - an NTP sync that fails silently, or a large one-time correction that steps the clock instead of smoothly adjusting it, can leave a machine's clock meaningfully wrong for a real amount of time, which is exactly the case any design relying on clocks needs to survive.</p>`,
        check: {
          question: 'A client sends a write request and the connection times out before any response arrives. What can the client conclude about whether the write happened?',
          options: [
            'The write definitely failed, since a timeout always means failure',
            'The write definitely succeeded, since the server usually processes requests quickly',
            'Nothing for certain: the request may never have arrived, may still be processing, or may have already succeeded with only the response lost',
            'The client can check its own clock to determine what happened'
          ],
          answer: 2,
          explain: 'A timeout tells you the response did not arrive in time - it says nothing about what happened on the other end. All three outcomes look identical from the caller\'s side, which is exactly why blind retries can be dangerous without something like an idempotency key.'
        }
      },
      {
        id: 'dc-2',
        part: 'field',
        title: 'Consistency models',
        viz: 'consistency-spectrum',
        body: `<p>A consistency model is a precise promise about what a reader will see. They form a rough spectrum from strongest to weakest, and each one costs more coordination - and usually more latency - than the one below it.</p>
<p><b>Linearizable.</b> The strongest common model: every operation appears to happen instantly at some single point between when it was called and when it returned, and every client, no matter who they are, agrees on the same order of operations, matching real time. Example: a bank's balance check right after a transfer - once the transfer's write has returned to the caller, absolutely every reader, anywhere, must see the new balance, never the old one.</p>
<p><b>Sequential consistency.</b> Every client sees operations in some single, agreed-upon order, and that order respects each individual client's own program order - but the agreed order does not have to match real, wall-clock time. Example: in a replicated log that every node applies in the same sequence, two operations that were genuinely concurrent in real time may be ordered either way, as long as every node applies them in that same order.</p>
<p><b>Causal consistency.</b> Operations that are causally related (one happened because of the other) must be seen in that same order by everyone; operations with no causal relationship can be seen in different orders by different people. Example: a reply to a comment must never be shown before the comment it replies to, but two unrelated top-level comments posted around the same time can appear in a different order to different readers with no correctness problem.</p>
<p><b>Eventual consistency.</b> The weakest common promise: if no new writes happen, every replica will eventually agree - with no bound on how long "eventually" takes, and no guarantee about what a reader sees in the meantime. Example: a product's view count shown slightly differently on different servers for a few seconds after an update, before it settles to the same number everywhere.</p>
<p><b>Read-your-writes and monotonic reads</b> are narrower, practical guarantees rather than full models: read-your-writes promises a specific client always sees their own prior write (your own comment appears on your own screen immediately, even under an eventually consistent system overall); monotonic reads promises a client's own view never moves backward in time (a friends list that already showed a new friend will never later show them as gone on a refresh, even if that refresh happens to hit a lagging replica).</p>`,
        deeper: `<p>It helps to notice that read-your-writes and monotonic reads are promises about one client's own experience over time, while linearizability, sequential and causal consistency are promises about what different clients see relative to each other. A system can offer read-your-writes cheaply - for example, by always routing a client's reads to the replica it just wrote to - without paying for full linearizability across every client in the system, which is why these session-level guarantees show up constantly in real, eventually consistent systems as a way to hide the worst of the staleness from any one user.</p>`,
        check: {
          question: 'A social app guarantees that a reply is never shown before the comment it replies to, but two unrelated comments posted around the same time can appear in either order to different viewers. Which consistency model is this?',
          options: [
            'Linearizability',
            'Causal consistency',
            'Eventual consistency with no ordering guarantees at all',
            'Sequential consistency'
          ],
          answer: 1,
          explain: 'Causal consistency preserves order only between operations that are actually causally related - a reply depends on its parent comment. Operations with no causal link, like two unrelated comments, are allowed to be seen in different orders by different viewers, which is exactly the behavior described.'
        }
      },
      {
        id: 'dc-3',
        part: 'field',
        title: 'Replication and quorums',
        viz: 'quorum-w-r-n',
        body: `<p>Replication keeps more than one copy of the same data, for durability and to spread out read traffic. There are three common designs.</p>
<p><b>Leader-follower (primary-replica).</b> One node, the leader, accepts all writes and replicates them to one or more followers. Reads can go to the leader (always current) or to a follower (cheaper, but may lag behind, arriving after a short replication delay). This is the simplest design to reason about, because there is never a question of which node's write wins - there is only ever one writer.</p>
<p><b>Multi-leader.</b> More than one node accepts writes, often one leader per data center or region, and the leaders replicate to each other. This avoids sending every write across a long-distance link to one central leader, at the cost of needing to resolve <b>write conflicts</b>: if two leaders accept different writes to the same record at close to the same time, something has to decide which one wins, or how to merge them.</p>
<p><b>Leaderless.</b> Any replica can accept a read or a write directly, with no fixed leader at all. Correctness is enforced instead by requiring enough replicas to participate in each operation - which is what a quorum is for.</p>
<p><b>The quorum rule: W + R &gt; N.</b> Let <b>N</b> be the total number of replicas, <b>W</b> the number of replicas that must acknowledge a write before it counts as done, and <b>R</b> the number of replicas a read must query before it returns. If W + R &gt; N, every possible set of R replicas a read might query is guaranteed to overlap with every possible set of W replicas a write might have used - by simple counting, two subsets of a set of N items whose sizes add up to more than N cannot both avoid sharing at least one item. That overlap guarantees a read will always include at least one replica holding the most recent completed write, which the client can then pick out, usually by comparing version numbers.</p>
<p><b>Worked example.</b> With N = 3, a common choice is W = 2 and R = 2, so W + R = 4 &gt; 3: a write only needs 2 of 3 replicas to succeed, and a read only needs 2 of 3 to be checked, yet every read is still guaranteed to overlap with every write. Pushing W down to 1 for faster writes would need R = 3 to keep the guarantee - reading from every replica every time - trading read latency for write latency. This is a genuine dial: lower W makes writes faster and more available during a node failure; lower R makes reads faster and more available; the constraint W + R &gt; N is what has to be preserved for the overlap guarantee to hold at all.</p>`,
        deeper: `<p>A quorum read guarantees you see the latest <i>completed</i> write, but it does not by itself make the whole system linearizable - two writes that overlap in time, without one waiting for the other to finish, can still race, and different clients can briefly disagree about which one "won" until the version comparison settles it. Quorums buy strong, practical guarantees at a much lower coordination cost than a single global leader, but they are not automatically the same thing as linearizability, and it's worth being precise about that distinction rather than treating "quorum" and "strongly consistent" as synonyms.</p>`,
        check: {
          question: 'A system has N = 5 replicas and uses W = 2 for writes. What is the smallest value of R that still guarantees every read overlaps with every write?',
          options: [
            'R = 2',
            'R = 3',
            'R = 4',
            'R = 5'
          ],
          answer: 2,
          explain: 'The rule is W + R > N. With W = 2 and N = 5, R must be greater than 3, so the smallest whole number that satisfies it is R = 4 (2 + 4 = 6 > 5). R = 3 gives 2 + 3 = 5, which is not greater than N, so overlap is not guaranteed.'
        }
      },
      {
        id: 'dc-4',
        part: 'field',
        title: 'CAP and PACELC',
        body: `<p><b>CAP</b> says: during an actual network partition, a distributed system must choose between staying <b>consistent</b> (every node returns the most recent write, or an error, rather than something out of date) and staying <b>available</b> (every request gets a non-error response, even if it might not be the very latest write). It cannot fully guarantee both at the same time while the partition lasts.</p>
<p><b>What CAP does not say.</b> It is not a claim that a system must sacrifice consistency or availability all the time - only during a partition, which for most systems is a relatively rare event. Outside a partition, a well-built system can serve both consistent and available responses. It is also not the same statement as the "C" in ACID (see <a href="#sql-databases">Relational databases</a>), which is about a database's own internal rules never being violated, a completely different property from CAP's consistency, which is about whether readers see the latest write. And CAP's "consistency" specifically means linearizability - it is a narrower, more technical claim than the word suggests in casual use, which is why labeling a whole real system simply "CP" or "AP" tends to oversimplify what it actually does in every situation.</p>
<p><b>PACELC</b> spells out its own rule as a run of six words - Partition, Availability, Consistency, Else, Latency, Consistency - and extends CAP with the case CAP leaves out: if there is a <b>P</b>artition, choose between <b>A</b>vailability and <b>C</b>onsistency (that part is CAP); <b>E</b>lse, when there is no partition at all, still choose between <b>L</b>atency and <b>C</b>onsistency, because keeping every replica linearizable even under completely normal conditions requires coordinating with other nodes before answering, and that coordination costs time. A system that returns a fast answer from the nearest replica without checking every other replica is trading consistency for latency, with no partition involved at all.</p>
<p><b>Reading a real system.</b> A system's PACELC position is written as two letters joined by a slash: the first pair says what it gives up during a partition (PA for availability, PC for consistency), the second what it gives up when there is no partition (EL for latency, EC for consistency). A single-region relational database with synchronous replication is close to PC/EC: it favors consistency both during a partition and in normal operation, at the cost of availability and latency respectively. A system like DynamoDB in its default mode is closer to PA/EL: available during a partition, and favoring low latency over strict consistency the rest of the time too. Naming a real system's actual position on both axes, rather than reciting "CP" or "AP" as a single fixed label, is what tells an interviewer you understand the trade-off rather than the acronym.</p>`,
        deeper: `<p>The reason PACELC is worth knowing on top of CAP is that most engineering time is spent in the "else" branch, not during rare partitions - a system's everyday latency-versus-consistency trade-off, made on every single request, matters far more often in practice than the partition-time trade-off CAP focuses all its attention on.</p>`,
        check: {
          question: 'What does the CAP theorem say about a system during completely normal operation, with no network partition happening?',
          options: [
            'It says the system must still choose between consistency and availability at all times',
            'It says nothing - CAP is specifically a statement about behavior during a partition, and PACELC is what addresses the no-partition case',
            'It says the system is always fully consistent when there is no partition',
            'It says the system must be shut down until the partition risk passes'
          ],
          answer: 1,
          explain: 'CAP is a claim about what a system must choose between only while an actual partition is happening. It makes no statement about normal operation - that is exactly the gap PACELC fills with its "else" branch, trading latency against consistency instead.'
        }
      },
      {
        id: 'dc-5',
        part: 'field',
        title: 'Clocks and ordering',
        viz: 'lamport-clock',
        body: `<p>Because physical clocks on different machines cannot be perfectly trusted to agree, distributed systems that need to order events reach for clocks that do not depend on wall-clock time at all.</p>
<p><b>Physical clocks and NTP.</b> Every machine has a hardware clock that drifts on its own; NTP corrects it by periodically comparing it against reference time servers and adjusting. This keeps clocks close together most of the time, but "close" is not "identical," and a sync failure or a network issue can leave a machine's clock wrong by much more than usual for a real stretch of time. Physical clocks are good enough for logging and for rough human-facing timestamps; they are not a safe way to determine which of two events on different machines happened first.</p>
<p><b>Lamport clocks.</b> Each node keeps a single counter, starting at zero. Before doing anything, a node increments its own counter. When it sends a message, it attaches its current counter value. When it receives a message, it sets its counter to whichever is larger - its own current value or the value attached to the message - and then increments once more. This guarantees that if event A happened-before event B (for example, A is a message send and B is that message's receipt), then A's counter value is smaller than B's. What it does not guarantee is the reverse: two events can have counter values in either order without one having actually happened before the other, if neither one influenced the other at all - Lamport clocks can tell you an order exists, but not always whether two events were truly independent (concurrent).</p>
<p><b>Vector clocks.</b> Instead of one number, each node keeps a full array with one counter per node in the system. A node increments only its own position on every local event, and when it sends a message it attaches its whole vector; a receiving node updates its vector to the elementwise maximum of its own and the received one, then increments its own position. Comparing two vector clocks tells you strictly more than a Lamport clock can: if every position in vector A is less than or equal to the matching position in vector B, A happened-before B; if neither vector is entirely less-than-or-equal to the other, the two events are genuinely concurrent, and the system knows that for certain instead of guessing.</p>
<p><b>Hybrid logical clocks (HLC).</b> A practical middle ground: each timestamp combines the node's physical clock with a logical counter, so timestamps stay close to real wall-clock time (useful for humans and for TTL-style comparisons) while still preserving the same happens-before guarantee a Lamport clock gives, even when physical clocks briefly disagree between nodes.</p>`,
        deeper: `<p>The gap between Lamport and vector clocks is exactly the gap between "ordering" and "detecting concurrency." A Lamport clock can always produce <i>some</i> total order over all events (breaking ties with, say, node ID), which is enough for many uses, but it can silently impose an order on two events that never actually influenced each other. A vector clock costs more to maintain - one counter per node instead of one counter total, growing with cluster size - but it is the only one of the two that can correctly say "these two writes are genuinely concurrent, and neither caused the other," which matters directly when a system needs to detect a real write conflict rather than just pick an arbitrary winner.</p>`,
        check: {
          question: 'Two events have Lamport clock values 5 and 7. What can you conclude?',
          options: [
            'The event with value 5 definitely happened before the event with value 7',
            'The events are definitely concurrent',
            'The event with value 7 might have happened after the one with value 5, or the two might be unrelated and simply ended up with different values - a Lamport clock alone cannot tell you which',
            'The clocks are unsynchronized and the values are meaningless'
          ],
          answer: 2,
          explain: 'A Lamport clock guarantees that happens-before implies a smaller value, but not the reverse. Seeing 5 and 7 is consistent with 5 happening before 7, but it is equally consistent with the two events being completely unrelated - only a vector clock can tell concurrency apart from real causal order.'
        }
      },
      {
        id: 'dc-6',
        part: 'field',
        title: 'Consensus: Raft, Paxos, and where ZooKeeper and etcd fit',
        viz: 'raft-election',
        body: `<p>Consensus is getting a group of nodes to agree on one value, or one ordered sequence of operations, even when some nodes fail or messages are delayed - and to keep that agreement correct even if a minority of nodes disappear entirely.</p>
<p><b>Raft, in three parts.</b> <b>Leader election:</b> every node starts as a follower; if a follower does not hear from a leader within a randomized timeout, it becomes a candidate and requests votes from the others. A candidate that gets votes from a majority of all nodes becomes the leader for a numbered <b>term</b>; the randomized timeout makes it unlikely that two nodes become candidates at exactly the same moment and split the vote repeatedly. <b>Log replication:</b> once elected, the leader is the only node that accepts new operations; each one is appended to the leader's log and sent to every follower. <b>Majority commit:</b> an entry is considered committed, and safe to apply, only once a majority of all nodes (leader included) have it in their log - not once every node has it. This is what lets Raft keep working correctly even if a minority of nodes are down or unreachable: as long as a majority is present, the system can still make progress, and any future leader is guaranteed to already have every previously committed entry, because it could only have won an election with votes from a majority, which necessarily overlaps with the majority that committed that entry.</p>
<p><b>Paxos.</b> An earlier consensus algorithm that solves the same underlying problem through a two-phase protocol of proposers, acceptors, and learners. It is provably correct and was the standard reference for decades, but it is notoriously difficult to reason about and to implement correctly; Raft was explicitly designed afterward to give the same safety guarantees while being easier for engineers to actually understand and build correctly.</p>
<p><b>Where ZooKeeper and etcd fit.</b> These are not consensus algorithms themselves; they are coordination services built on top of one. ZooKeeper uses its own consensus protocol, ZAB (ZooKeeper Atomic Broadcast), internally, and exposes higher-level primitives on top of it - a small hierarchical namespace, watches that notify a client when something changes, and nodes that automatically disappear if the client holding them dies - which applications use to build locks, leader election, and configuration storage without implementing consensus themselves. etcd uses Raft directly and exposes a simple, strongly consistent key-value store; it is best known as the component Kubernetes itself uses to store all cluster state.</p>`,
        deeper: `<p>The majority-commit rule is also what determines fault tolerance in a concrete, countable way: a cluster of N nodes running Raft can survive the failure of up to floor((N-1)/2) nodes and keep operating. A 3-node cluster tolerates 1 failure; a 5-node cluster tolerates 2. Adding a 4th node to a 3-node cluster does not actually improve fault tolerance at all - floor((4-1)/2) is still 1 - while making every write wait for one more possible vote; this is why production Raft or ZooKeeper clusters are almost always sized to odd numbers.</p>`,
        check: {
          question: 'In Raft, why does an entry need acknowledgment from a majority of nodes, rather than just the leader, before it is considered committed?',
          options: [
            'Because a majority is faster to reach than contacting every node',
            'Because it guarantees any future leader - who must win a majority of votes to be elected - will necessarily have already seen every previously committed entry, since any two majorities out of the same cluster must overlap',
            'Because Raft requires unanimous agreement for every operation, and "majority" is just another name for that',
            'It is an arbitrary performance optimization with no correctness role'
          ],
          answer: 1,
          explain: 'Two majorities of the same cluster can never be fully disjoint, so any node that wins a later election is guaranteed to have voted in a set of nodes that overlaps with whichever majority committed an earlier entry - meaning the new leader already has that entry. This overlap is the entire reason majority commit keeps Raft correct across leader changes.'
        }
      },
      {
        id: 'dc-7',
        part: 'field',
        title: 'Distributed locks, leases, fencing tokens, and the Redlock debate',
        body: `<p>A <b>distributed lock</b> lets only one client at a time do something - run a scheduled job, write to a shared resource - enforced by a coordination service rather than by one process's own memory, since two different processes on two different machines cannot share an ordinary in-memory mutex.</p>
<p><b>Leases fix the obvious failure mode.</b> A plain lock, held forever until explicitly released, becomes a permanent deadlock the moment its holder crashes without releasing it. A <b>lease</b> is a lock with a built-in expiry: if the holder does not renew it before the lease runs out, it is automatically released and another client can acquire it. This solves the crash case, but it opens a subtler one: a client can be paused for longer than the lease's duration - a long garbage-collection pause, a suspended virtual machine, or just a slow, overloaded thread scheduler - and resume still believing it holds the lease, even though it expired and another client has since acquired it. Now two clients can both believe, correctly by their own information, that they hold the lock at the same time.</p>
<p><b>Fencing tokens close that gap.</b> Every time the lock or lease is granted, the coordination service hands out a number that only ever increases. The client passes that number along with every operation it performs on the protected resource, and the resource itself - not the lock service - checks the number and rejects any operation carrying a token lower than the highest one it has already seen. Even if a paused client wakes up and tries to act as if it still holds the lock, its old, lower token is rejected by the resource, because a newer client has since acquired the lock with a higher token. The safety no longer depends on the lock-holder behaving correctly; it depends on the protected resource enforcing the token order.</p>
<p><b>Why Redlock is debated.</b> Redlock is an algorithm for building a distributed lock across several independent Redis instances, requiring a majority of them to agree before granting the lock. Martin Kleppmann published a widely read critique arguing that Redlock, without fencing tokens, cannot actually guarantee mutual exclusion under exactly the pause scenario above - any lock service, not only Redlock, is unsafe against a client that pauses past its lease and resumes unaware, unless the protected resource itself checks a fencing token. Redis's creator defended the algorithm's specific design, and the debate is not fully settled, but the practical lesson most engineers take from it is the same either way: treat the lock service as advisory, and put the real safety check - the fencing token comparison - on the resource being protected, not on trusting that the lock holder is still who it thinks it is.</p>`,
        deeper: `<p>This is a specific instance of a much more general pattern worth being able to say out loud: coordinating who is <i>allowed</i> to act and enforcing what actually <i>gets applied</i> are two separate jobs, and putting all of the safety into the first one (the lock) without any check in the second one (the resource) leaves a gap that a long enough pause can always fall through, no matter how good the lock service is.</p>`,
        check: {
          question: 'A client holds a lease on a job scheduler lock, then experiences a 45-second garbage collection pause. The lease was only 20 seconds long. What is the danger when the client resumes?',
          options: [
            'None - the lease automatically extends itself during a pause',
            'The client may still believe it holds the lock, even though the lease expired and another client has since acquired it, risking two clients acting at once unless a fencing token stops the stale one',
            'The garbage collection pause will be detected and the process will be killed automatically',
            'The lock service will refuse to grant the lock to any other client while the first one is paused'
          ],
          answer: 1,
          explain: 'A pause longer than the lease duration means the lease can expire and be re-granted to someone else while the paused client is unaware. Without a fencing token that the protected resource checks, the resumed client has no way to know it no longer safely holds the lock.'
        }
      },
      {
        id: 'dc-8',
        part: 'field',
        title: 'Circuit breakers and timeouts',
        body: `<p>Every call to another node needs a <b>timeout</b>, because without one, a caller waiting on a partially failed dependency can wait forever - and a thread or connection tied up waiting is a resource the caller cannot use for anything else. A timeout is always a guess: too short, and calls that would have eventually succeeded are given up on; too long, and a genuinely dead dependency keeps every caller stuck for far longer than necessary, and those stuck callers can themselves exhaust the caller's own connection pool or thread pool, turning one slow dependency into a second outage in a completely different service.</p>
<p>A <b>circuit breaker</b> is what stops that second failure from happening. It watches the failure rate of calls to a dependency, and once that rate crosses a threshold, it "opens": for a cooldown period, it fails new calls immediately, without even attempting them, so callers get a fast, predictable failure instead of piling up behind a slow timeout. After the cooldown, it moves to "half-open" and lets a single trial call through; if that succeeds, it closes again and resumes normal calls, and if it fails, it reopens and waits again.</p>
<p><b>The difference that matters.</b> A timeout only bounds how long <i>one</i> call is allowed to wait. A circuit breaker remembers the recent past and uses it to avoid even attempting calls that are very likely to fail, protecting both the caller (which stops wasting resources on doomed calls) and the struggling dependency (which stops receiving load it clearly cannot handle right now, giving it a chance to recover instead of being kept underwater by callers still retrying it). In a coordination context specifically, this matters most around the services a system depends on to make decisions at all - a lock service, a leader-election service, a metadata store - because a slow or half-failing coordination dependency can otherwise stall every caller that depends on it for permission to do anything.</p>`,
        deeper: `<p>Circuit breakers pair naturally with retries and exponential backoff with jitter: a retry without a circuit breaker just resends the same doomed call, possibly in lockstep with every other caller retrying at the same moment; a circuit breaker stops that pile-up at the source, and jittered backoff spreads out whatever retries do still happen once the breaker allows calls through again, so recovery does not itself look like a second spike of load hitting the dependency all at once.</p>`,
        check: {
          question: 'A dependency is failing, and every caller has its own 5-second timeout with no circuit breaker. What is the most likely secondary problem this causes?',
          options: [
            'Nothing - timeouts alone are always sufficient protection',
            'Every caller\'s threads or connections stay tied up for the full 5 seconds on every call, which can exhaust the caller\'s own capacity even though the caller itself is otherwise healthy',
            'The dependency will automatically restart',
            'The timeout value will automatically decrease over time'
          ],
          answer: 1,
          explain: 'Without a circuit breaker, every caller keeps attempting calls and waiting out the full timeout on each one. Under enough concurrent load, those tied-up resources can exhaust the caller\'s own thread or connection pool, spreading the failure to a service that was otherwise fine.'
        }
      },
      {
        id: 'dc-9',
        part: 'field',
        title: 'Gossip protocols and distributed hash tables',
        viz: 'gossip-spread',
        body: `<p><b>Gossip protocols</b> spread information across a cluster without any central coordinator. Periodically, each node picks one or a few random peers and exchanges what it currently knows with them - which nodes are alive, a configuration change, a new piece of routing state. Any node that receives new information passes it along the next time it gossips, so a single update spreads exponentially: after a few rounds, the number of nodes that know it roughly doubles each round, reaching the whole cluster in a number of rounds that grows only with the logarithm of the cluster's size, not its full size. This is what makes gossip attractive for <b>membership</b> - keeping track of which nodes are currently up - since a fixed, central membership list is itself a single point of failure and a bottleneck.</p>
<p>Gossip is also naturally resilient: because every node eventually hears from several different peers, losing any single message, or even several, rarely stops information from spreading, unlike a design that depends on one specific message reaching one specific node. Real systems using gossip for membership and failure detection include Cassandra and Consul; SWIM (scalable weakly-consistent infection-style process group membership) is a widely used, more efficient refinement of the basic idea, built specifically for detecting failed nodes quickly without every node having to ping every other node directly.</p>
<p><b>Distributed hash tables, in brief.</b> A DHT answers one question in a fully decentralized way: given a key, which node is responsible for it? Rather than every node knowing about every other node, each node keeps routing information about only a small number of others - in the classic Chord design, about the logarithm of the total node count - and a lookup hops from node to node, each hop getting closer to the key's owner, resolving in roughly that same small number of hops even in a cluster of millions of nodes. This is the same underlying goal as the consistent hashing used to shard a cache, extended into a fully decentralized system with no fixed list of nodes anywhere: DHTs are the basis for systems like BitTorrent's trackerless peer discovery, and influenced the partitioning design behind Amazon's Dynamo.</p>`,
        deeper: `<p>Gossip and consensus solve different problems and are often used together rather than as alternatives: consensus (Raft, Paxos) is for the small amount of state that must be exactly agreed upon with strong guarantees, like who the current leader is; gossip is for spreading a much larger volume of loosely time-sensitive information, like "which nodes are currently reachable," where being right most of the time, a little late, is an acceptable and much cheaper trade than paying for full consensus on every membership change.</p>`,
        check: {
          question: 'Why does information spread through a gossip protocol in a number of rounds proportional to the logarithm of the cluster size, rather than the full size of the cluster?',
          options: [
            'Because gossip messages travel faster than normal network traffic',
            'Because the number of nodes that know a piece of information roughly doubles each round, so it takes only a small number of doublings to cover the whole cluster',
            'Because gossip protocols use a fixed central server to broadcast updates',
            'Because only one node ever needs to know the information'
          ],
          answer: 1,
          explain: 'Each round, every node that already knows the information can pass it to a new peer, so the informed set roughly doubles each round - exponential growth reaches the full cluster in a number of rounds proportional to the logarithm of its size, not the size itself.'
        }
      }
    ],
    connect: null,
    activities: [
      {
        id: 'dc-a1',
        type: 'design',
        title: 'Design a safe distributed lock for a job scheduler',
        viz: 'fencing-token',
        prompt: `"We have a job scheduler that must run each nightly job exactly once, even though it runs on three replicas for availability. Design the locking so two replicas never run the same job at the same time - including when one replica is paused by a long garbage collection cycle."`,
        timeboxSec: 600,
        rubric: `Must-haves: (1) proposes a lease-based lock (not a plain, indefinitely-held lock), naming a coordination service such as ZooKeeper, etcd, or Redis and a concrete lease duration; (2) explicitly identifies the garbage-collection pause failure mode - a pause while the language runtime reclaims memory, during which the process does nothing at all - a replica pausing longer than the lease, waking up, and still believing it holds the lock while another replica has since acquired it; (3) proposes a fencing token as the actual fix: an increasing number issued with each lease grant, checked by whatever the job actually writes to or acts on, rejecting a stale token even if the paused replica still thinks it holds the lock; (4) is explicit that the safety check belongs on the resource being protected (the job's output store, or wherever its side effects are written), not solely on trusting the lock service or the replica's own belief that it holds the lock; (5) does not claim Redlock or any single lock service alone solves the pause problem without a fencing token. Common mistakes: proposing a lock with no expiry at all; never mentioning the garbage-collection pause scenario despite it being stated in the prompt; describing a fencing token vaguely without saying what checks it or where. {{HONESTY}}`,
        model: `"I'd use a lease, not a plain lock, from a coordination service like etcd or ZooKeeper - say a 30-second lease a replica has to renew while it's working, so a crashed replica's lock releases automatically.

But a lease alone doesn't solve this, and the prompt is pointing right at why: if a replica pauses for a garbage collection cycle longer than 30 seconds, it can wake up still believing it holds the lock, even though the lease expired and a second replica has since correctly acquired it and started the job.

The fix is a fencing token. Every lease grant comes with a number that only increases. The replica includes that token with anything it writes as part of the job. The place that matters is wherever those writes go: that store rejects anything with a token lower than the highest one it's already accepted. So the paused replica's stale writes get rejected, because the second replica already wrote with a higher token.

The important part is that the safety doesn't come from the lock service alone - it comes from the resource the job writes to enforcing the token order. The lease coordinates who's allowed to try; the fencing token is what actually stops a stale replica's writes from counting."`
      },
      {
        id: 'dc-a2',
        type: 'explain',
        title: 'Explain why an available system can return stale data',
        prompt: `"Our system stayed fully available during a data center network partition last week, but some users saw data that was a few seconds out of date. Walk me through why that happened, using CAP and PACELC."`,
        timeboxSec: 480,
        rubric: `Must-haves: (1) correctly identifies that choosing availability during the partition (the "A" in CAP) means some nodes kept answering requests using whatever data they locally had, rather than returning an error or blocking until the partition healed; (2) explains that this is the direct trade CAP describes: staying available during a partition means not every node can guarantee it is returning the most recently written value; (3) brings in PACELC to explain that the same system likely also trades some consistency for latency even outside the partition (the "else" branch), so the staleness users experienced was not purely a partition-only event but consistent with the system's normal trade-off too; (4) does not claim the system violated CAP or that this staleness means the system is broken - it correctly identifies this as the expected, chosen behavior of an available system during a partition. Common mistakes: describing this as a bug rather than an expected trade-off; confusing CAP's consistency with ACID consistency; failing to mention PACELC's role in explaining behavior outside the partition. {{HONESTY}}`,
        model: `"This is exactly the trade-off CAP describes, working as intended rather than as a bug. During the partition, the system chose availability: nodes on both sides kept answering using whatever data they locally had, instead of blocking until the partition healed. CAP says that during an actual partition, a system can't guarantee both that every node returns the latest write and that every node keeps answering - we chose to keep answering, which is right for most user-facing traffic, but it means a node cut off from a recent write couldn't know about it yet.

The few seconds of staleness is the direct cost of that choice - some requests were served by a replica that hadn't yet received the latest write because the network to it was broken.

I'd also bring in PACELC, because it explains something CAP alone doesn't: this system almost certainly trades some consistency for latency even with no partition at all, on every request. So the staleness during the partition wasn't a one-off exception - it's the same everyday choice showing up more visibly, because the partition made the normal staleness window temporarily larger.

If a few seconds of staleness during a rare partition is acceptable for most reads, this system is behaving correctly. Any operation that truly can't tolerate staleness is the one I'd single out for a quorum-based or leader-routed read path instead."`
      },
      {
        id: 'dc-a3',
        type: 'formulate',
        title: 'Choose quorum values for a given durability and latency target',
        prompt: `Practice problem. You are running a leaderless store with N = 7 replicas. You want writes to survive up to 2 replica failures without becoming unavailable, and you want to minimize read latency as much as the quorum rule allows. What W and R would you choose, and what is the resulting read cost?`,
        timeboxSec: 420,
        rubric: `Must-haves: (1) correctly reasons that surviving 2 failures out of 7 while still being able to complete a write means W can be at most N - 2 = 5 for availability under failure, but more importantly that a smaller W is what actually helps availability, so identifies that W should be chosen small enough that a write still succeeds with up to 2 replicas down, meaning W <= 5, and picks a concrete reasonable value (commonly W = 4, the majority, or an explicitly justified smaller number) with justification; (2) applies the quorum rule W + R > N correctly to solve for the minimum valid R given the chosen W (for W = 4, N = 7: R > 3, so R = 4 minimum); (3) explicitly connects the choice to the stated goal of minimizing read latency, noting that R cannot be pushed below the value the rule requires without losing the overlap guarantee, so R = 4 is the lowest read cost available once W = 4 is fixed; (4) states the trade-off in plain terms: under the fixed constraint W + R > N, W and R move in opposite directions, so both cannot be made smaller at once - a cheaper read (smaller R) has to be paid for with a larger W. Common mistakes: picking W and R without applying W + R > N at all; assuming both W and R can be minimized simultaneously; not tying availability under 2 failures to the choice of W. {{HONESTY}}`,
        model: `"With N = 7 and wanting writes to keep succeeding with up to 2 replicas down, I'd want W low enough that a write doesn't need more than the 5 replicas still up in that case - so W = 4, a majority, comfortably achievable even with 2 gone.

Given W = 4, the quorum rule W + R > N means R has to be greater than 7 - 4 = 3, so the smallest valid R is 4. That's the lowest read cost without breaking the overlap guarantee - I can't push R to, say, 2, because then a read quorum and a write quorum could exist without sharing a replica, and a read could miss the latest write.

So the answer is W = 4, R = 4: every read checks 4 of 7 replicas, the minimum the math allows given W = 4 for availability under 2 failures. A cheaper read would need a higher W instead - I can't shrink both sides at once, since the constraint ties them together. I'd want the actual read:write ratio before deciding whether shifting more cost onto W, say W = 5, R = 3, is a better trade for this workload, but for the numbers given, W = 4 and R = 4 is the balanced answer."`
      }
    ],
    sayQuestion: null,
    sayItOutLoud: null,
    readings: [
      { l: 'Martin Kleppmann - How to do distributed locking', u: 'https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html', w: 'The primary source for why Redlock is debated and what a fencing token actually fixes, written by the person who started the debate.', m: 20 },
      { l: 'Martin Kleppmann - Please stop calling databases CP or AP', u: 'https://martin.kleppmann.com/2015/05/11/please-stop-calling-databases-cp-or-ap.html', w: 'Explains precisely what CAP does and does not constrain, and why the CP/AP labels mislead even for well-known systems.', m: 15 },
      { l: 'Raft consensus algorithm - paper and site', u: 'https://raft.github.io/', w: 'The paper itself plus links to talks and implementations, for leader election, log replication, and the safety argument in full.', m: 10 },
      { l: 'The Secret Lives of Data - Raft', u: 'http://thesecretlivesofdata.com/raft/', w: 'An interactive, step-by-step visualization of Raft leader election and log replication actually running.', m: 20 },
      { l: 'Redis docs - Distributed Locks with Redis', u: 'https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/', w: 'The official description of Redlock, with its own pointer to Kleppmann\'s critique so you can read both sides.', m: 15 },
      { l: 'Leslie Lamport - Time, Clocks, and the Ordering of Events in a Distributed System', u: 'https://lamport.azurewebsites.net/pubs/time-clocks.pdf', w: 'The original 1978 paper defining happens-before and the logical clock this chapter\'s Lamport clock is named after; short and genuinely readable.', m: 25 },
      { l: 'Video: Hussein Nasser - Circuit Breaker Pattern Explained: Timeouts, Retries and Fallbacks', u: 'https://www.youtube.com/watch?v=rvKKj7JU92g', w: 'Ties circuit breakers directly to timeouts and retries, which is how they actually come up together in an interview question.', m: 15 },
      { l: 'High Scalability - Gossip Protocol Explained', u: 'https://highscalability.com/gossip-protocol-explained/', w: 'Covers gossip-based membership and failure detection with real systems - Cassandra, Dynamo, CockroachDB - that actually use it.', m: 10 }
    ],
    glossary: [
      {
        g: 'Distributed systems and coordination',
        sub: '',
        rows: [
          ['Partial failure', 'Some nodes or parts of a request fail while others keep working, unlike a single machine', 'why distributed systems are hard'],
          ['Linearizability', 'Every operation appears instant, in one order every client agrees on, matching real time', 'consistency models'],
          ['Causal consistency', 'Causally related operations are seen in order by everyone; unrelated ones may differ by viewer', 'consistency models'],
          ['Quorum (W + R > N)', 'Choosing write and read acknowledgment counts so every read set overlaps every write set', 'replication'],
          ['CAP theorem', 'During a partition, choose consistency or availability; says nothing about normal operation', 'CAP and PACELC'],
          ['PACELC', 'Extends CAP: even without a partition, trade latency against consistency', 'CAP and PACELC'],
          ['Lamport clock', 'A single counter per node giving a happens-before-respecting order, but not detecting concurrency', 'clocks and ordering'],
          ['Vector clock', 'One counter per node, able to detect when two events are genuinely concurrent', 'clocks and ordering'],
          ['Majority commit', 'Raft treats a log entry as committed once a majority of nodes have it, tolerating minority failures', 'consensus'],
          ['Fencing token', 'An increasing number checked by the protected resource, rejecting a stale lock holder', 'distributed locks'],
          ['Lease', 'A lock that expires automatically, so a crashed holder does not block everyone forever', 'distributed locks'],
          ['Circuit breaker', 'Fails fast without attempting a call once a dependency crosses a failure threshold', 'circuit breakers and timeouts'],
          ['Gossip protocol', 'Nodes periodically exchange state with random peers, spreading information without a coordinator', 'gossip and membership'],
          ['Distributed hash table', 'Decentralized key lookup resolving in a small, roughly logarithmic number of hops', 'gossip and membership']
        ]
      }
    ]
  };

}(typeof window !== 'undefined' ? window : this));
