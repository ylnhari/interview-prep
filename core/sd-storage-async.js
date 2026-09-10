/* sd-storage-async: two system design chapters, storage engines/object storage, and queues/streams/async work. */
(function (root) {
  'use strict';
  root.PREP_CORE = root.PREP_CORE || {};

  root.PREP_CORE['storage-engines'] = {
    id: 'storage-engines',
    title: 'Storage engines and object storage',
    level: 'warning',
    levelLabel: 'Common in database-heavy and infrastructure design interviews.',
    why: `Any interview that goes past "design a database" or "pick a data store for this" eventually asks how the storage layer actually works underneath the query language, and naming a product without saying why it fits falls apart under one follow-up question. Interviewers are listening for whether you understand the one choice that explains almost everything else: rewriting data in place, or only ever appending it and cleaning up later. The same question shows up again whenever a system needs to store something in a form or at a scale a general-purpose database was not built for, such as model files or bulk snapshots, where object storage is the right answer for reasons worth stating precisely rather than by name alone.`,
    learn: [
      {
        id: 'se-0',
        part: 'field',
        title: 'Key terms',
        body: `<p>One pass through the words this chapter uses. Read it once, then use the words freely.</p>
<ul>
<li><b>Storage engine.</b> The part of a database that decides how bytes are laid out on disk and how they are found again. InnoDB inside MySQL, Postgres's own heap-plus-index engine, and RocksDB are all storage engines.</li>
<li><b>Durability.</b> A write that has been acknowledged survives a crash or power loss. The usual mechanism is writing a description of the change to a log and forcing it to disk before replying to the caller.</li>
<li><b>Write path, read path.</b> The exact sequence of steps a write, or a read, takes through the engine, from the caller's call to bytes on disk and back.</li>
<li><b>Sequential write, random write.</b> Writing bytes one after another to a growing file, versus writing to scattered locations across a file. Both hard disks and, to a lesser extent, SSDs are far faster at the sequential kind.</li>
<li><b>Append-only log.</b> A file that is only ever added to at the end and never edited in place, which turns every write into a sequential write.</li>
<li><b>In-memory index.</b> A lookup structure kept in RAM that maps a key to where its value lives on disk, rebuilt from disk if the process restarts.</li>
<li><b>Write-ahead log (WAL).</b> A log of every change, appended and flushed to disk before the change is applied anywhere else, so a crash can never lose an acknowledged write.</li>
<li><b>Memtable.</b> An in-memory sorted structure that holds the most recent writes before they are flushed to disk.</li>
<li><b>SSTable (sorted string table).</b> An immutable on-disk file holding key-value pairs sorted by key, written once and never modified again.</li>
<li><b>Compaction.</b> A background process that merges older files into fewer, larger ones, dropping any key value that a later write has since overwritten.</li>
<li><b>Bloom filter.</b> A small, probabilistic structure that reports a key as either definitely absent from a file, or maybe present, letting a read skip a file it does not need to check.</li>
<li><b>Sparse index.</b> An index recording the position of only every few hundred or few thousand keys in a sorted file, relying on the file's sort order to scan the short gap between two known positions.</li>
<li><b>Write amplification, read amplification, space amplification.</b> How many bytes are actually written to disk for every byte the application wrote; how many separate disk reads one logical read needs in the worst case; how much bigger the data on disk is than its logical size.</li>
<li><b>B-tree.</b> A balanced tree structure that updates a value in place, at its existing position on disk, keeping every path from root to leaf the same short length.</li>
<li><b>Checksum.</b> A value computed from a block of bytes that changes if even one bit of those bytes changes, used to detect corruption.</li>
<li><b>Object storage.</b> A system that stores whole, immutable objects under a flat key, rather than mutable rows a query can filter and update in place. Amazon S3 is the common example.</li>
<li><b>Erasure coding.</b> Splitting an object into data pieces plus extra parity pieces, so the whole object can be rebuilt from a subset of the pieces, using less extra space than keeping full copies.</li>
</ul>`,
        deeper: `<p>Two of these numbers are worth being able to state precisely rather than vaguely, because interviewers ask for the exact definition, not the general idea. Write amplification is a ratio of bytes actually written to disk over bytes the application logically wrote; it is always at least one, and a value well above ten is normal for a heavily compacted LSM tree. Read amplification is a count of disk reads for one logical read, not a ratio, and a well-tuned Bloom filter is what keeps that count low.</p>`,
        check: {
          question: 'What is write amplification a ratio of?',
          options: [
            'The size of the database file compared to a competitor\'s',
            'Bytes actually written to disk, including every rewrite by compaction, divided by bytes the application logically wrote',
            'The number of tables compared to the number of indexes',
            'CPU time spent on writes divided by CPU time spent on reads'
          ],
          answer: 1,
          explain: 'Write amplification measures how much extra physical writing the engine does, beyond the logical bytes the application asked to store, mostly from compaction rewriting data more than once.'
        }
      },
      {
        id: 'se-f1',
        part: 'field',
        title: 'What a storage engine must do',
        body: `<p>Every storage engine, however it is dressed up, answers the same handful of questions: where does a write actually go, in what order, and how does a later read find it again without scanning everything.</p>
<p><b>Durability</b> means an acknowledged write must survive a crash. The dependable, cheap way to get it is to write a description of the change to a log and force it to disk with an <code>fsync</code> call - the operating system request that does not return until the bytes are genuinely on the disk rather than sitting in a write buffer - before replying to the caller. Only after the log is safely on disk does the engine need to update its normal data structures, because those can always be rebuilt by replaying the log.</p>
<p><b>Ordering</b> matters for two reasons. Recovery after a crash has to replay changes in the order they actually happened, or it reconstructs the wrong final state. And an engine that keeps its on-disk data sorted by key gets a fast range scan for free, because the next hundred keys are already sitting next to each other on disk.</p>
<p>The <b>write path</b> is short when it can be: append to a log, update an in-memory structure, acknowledge. The <b>read path</b> is where the real design decisions live, because it has to find one value among everything ever written without reading all of it.</p>
<p>Hard disks and solid-state drives both punish random access, for different physical reasons. A hard disk has to move a head and wait for the right sector to spin underneath it, costing several milliseconds per random seek. An SSD has no moving parts, but it can only erase data in large blocks and write in pages within them, so scattering small random writes across many blocks forces more internal rewriting than the same data written sequentially. Both drives reward an engine that turns writes into long sequential runs.</p>`,
        deeper: `<p>Group commit is the standard way to make <code>fsync</code> affordable under load: instead of flushing after every single write, the engine batches writes that arrive within a short window and flushes them together with one <code>fsync</code> call. Ten writers sharing one flush pay a fraction of the cost of ten separate flushes, at the price of each individual write being acknowledged a little later than it could have been on its own.</p>`,
        check: {
          question: 'Why does an engine write to a log before updating its normal on-disk data structures?',
          options: [
            'Because log files compress better than other formats',
            'Because writing the log first, and flushing it, means a crash can never lose an acknowledged write - other structures can always be rebuilt by replaying it',
            'Because the log is read more often than the data itself',
            'Because logs do not require a checksum'
          ],
          answer: 1,
          explain: 'The log is the source of truth; everything else the engine keeps is effectively a cache of it that can be recomputed from it after a crash.'
        }
      },
      {
        id: 'se-f2',
        part: 'field',
        title: 'Log-structured storage and Bitcask',
        body: `<p>The simplest possible storage engine is a single append-only file: every write, new key or update, is appended to the end, and an in-memory hash table maps each key straight to the byte offset of its most recent write. A read is one hash lookup plus one disk read at a known offset - no scanning, no tree to descend.</p>
<p>Bitcask, the engine behind Riak, works exactly this way, and its design is worth knowing because later engines borrow pieces of it. Bitcask keeps one active file that is always being appended to. Once that file reaches a size limit, it is closed and never written to again, and a new active file opens. The in-memory index, which Bitcask calls the <b>keydir</b>, holds, for every key, which file it lives in, the byte offset, and the length of the value.</p>
<p>Deleting a key does not remove any bytes; it appends a special <b>tombstone</b> record meaning "this key is gone," and the keydir simply drops the key from memory.</p>
<p>Two problems follow from never deleting anything: the files grow forever, and old files fill up with values that were later overwritten. A background <b>merge</b> compacts a set of older files into one new file, keeping only the latest value for each key and dropping tombstoned keys entirely, then deletes the files it replaced.</p>
<p>Rebuilding the keydir by reading every record in every file on startup would be slow once the data set is large. Bitcask solves this with a <b>hint file</b> written next to each data file during a merge: it holds the same key, offset and size information as the keydir, but not the value itself, so it is far smaller and much faster to scan than the full data file.</p>`,
        deeper: `<p>The keydir is a hash table, so Bitcask cannot answer "give me every key between A and F" without scanning everything; it only ever answers "give me the value for this exact key." That is the trade a log-structured hash index makes for very fast point lookups and writes, and it is exactly the limit the next section's sorted structure removes.</p>`,
        check: {
          question: 'Why does Bitcask keep a hint file alongside each data file produced by a merge?',
          options: [
            'To store a backup copy of every value in case the data file is corrupted',
            'To let the engine rebuild the in-memory keydir on startup by scanning something far smaller than the full data file, since it holds keys and locations but not values',
            'To make range scans between two keys fast',
            'To reduce how many active files can exist at once'
          ],
          answer: 1,
          explain: 'A hint file is small precisely because it omits the values, so scanning every hint file to rebuild the keydir is much faster than scanning every full data file.'
        }
      },
      {
        id: 'se-f3',
        part: 'field',
        title: 'LSM trees: the write path',
        viz: 'lsm-tree-levels',
        body: `<p>A log-structured merge-tree, or LSM tree, answers Bitcask's biggest limit: a hash index that only ever finds one exact key. An LSM tree keeps its data sorted, so it can answer range queries too, while keeping the same core idea of writing sequentially and never editing a file in place.</p>
<p>A write first goes to the <b>write-ahead log</b>, appended and flushed to disk, exactly as in any durable engine. Only after that is it added to the <b>memtable</b>, an in-memory sorted structure, commonly a skip list, that holds the most recent writes. Because the memtable is sorted and lives in RAM, inserting into it and reading from it are both fast.</p>
<p>When the memtable reaches a size limit, it is frozen and flushed to disk as a new <b>SSTable</b>: an immutable file holding all its key-value pairs in sorted order. A fresh, empty memtable takes over for new writes, and the write-ahead log covering the flushed data can be discarded, since its contents are now safely on disk.</p>
<p>Left alone, this process produces an ever-growing pile of SSTables, each of which a read might have to check. <b>Compaction</b> merges SSTables together in the background, much like Bitcask's merge, discarding any key value that a newer SSTable has since overwritten. Most engines organise SSTables into <b>levels</b>: level 0 holds the freshly flushed files and may have overlapping key ranges between files; level 1 and below hold larger, non-overlapping files, each level typically around ten times the size of the one above it. Compacting a file down into the next level is what keeps the number of files a read has to check bounded, instead of growing without limit.</p>`,
        deeper: `<p>RocksDB and LevelDB both default to leveled compaction, which keeps space use low at the cost of rewriting data more times as it moves down through the levels. Cassandra popularised size-tiered compaction, which merges files of similar size regardless of level, doing less rewriting per byte but tolerating more duplicate, not-yet-reclaimed data sitting on disk at once. Neither is universally right; it is a choice between paying in extra disk writes or paying in extra disk space.</p>`,
        check: {
          question: 'Why does an LSM tree flush the memtable to a new, immutable SSTable instead of updating an existing file in place?',
          options: [
            'Because RAM is cheaper than disk',
            'Because writing new, immutable, sorted files keeps every write sequential, and never touching old files in place is what makes background compaction safe to run alongside live reads',
            'Because immutable files never need a checksum',
            'Because the write-ahead log requires it'
          ],
          answer: 1,
          explain: 'Immutability is what makes compaction and concurrent reads safe together: nothing is ever mutated out from under a reader that already opened a file.'
        }
      },
      {
        id: 'se-f4',
        part: 'field',
        title: 'LSM trees: the read path and amplification',
        viz: 'lsm-read-path',
        body: `<p>Reading one key from an LSM tree has to consider every place a newer or older version of it might be: the live memtable first, since it holds the newest writes, then any memtable already frozen but not yet flushed, then SSTables from newest to oldest, stopping as soon as one of them has the key.</p>
<p>Checking every SSTable on disk for a key that might not exist anywhere would make reads slow, so two structures cut that cost. A <b>Bloom filter</b> is kept for every SSTable; it can say "this key is definitely not in this file" almost for free, letting the read skip that file's disk access entirely, or "this key might be in this file," which is checked for real. A <b>sparse index</b> then avoids reading the whole file even when the key might be present: it records the on-disk position of every few hundred keys, so the read jumps to the nearest recorded position at or before the target key and scans only the short stretch after it.</p>
<p>These structures explain the three amplification numbers that describe an LSM tree's trade-offs. <b>Write amplification</b> is the ratio of bytes actually written to disk, counting every rewrite done by compaction, to the bytes the application logically wrote; a value rewritten as it moves down four or five levels can be physically written well over ten times before it settles. <b>Read amplification</b> is how many separate disk reads one query needs in the worst case, one per SSTable that could not be ruled out by its Bloom filter. <b>Space amplification</b> is how much bigger the data on disk is than its logical size, from old, not-yet-compacted versions of overwritten keys still sitting around.</p>`,
        deeper: `<p>Take a table holding 100 GB of live data under leveled compaction with each level ten times larger than the one above it. A key written today may be rewritten once at each level as it is promoted, so by the time it reaches the bottom level it might have been physically written five to seven times - and RocksDB's own tuning documentation reports overall write amplification more commonly in the 10 to 30 times range for realistic leveled configurations, since compaction rewrites whole overlapping files, not one key at a time. That is the price paid for keeping space amplification low and reads bounded to a handful of files.</p>`,
        check: {
          question: 'A read checks a key that was never written. Which structure lets the engine avoid a disk read for most of the SSTables that do not contain it?',
          options: [
            'The write-ahead log',
            'The memtable',
            'The Bloom filter, which reports "definitely not present" for the great majority of files that do not hold the key',
            'The sparse index'
          ],
          answer: 2,
          explain: 'The Bloom filter rules files out with certainty and near-zero cost; the sparse index only helps once a file has already passed the Bloom filter check.'
        }
      },
      {
        id: 'se-f5',
        part: 'field',
        title: 'B-trees versus LSM trees',
        viz: 'btree-vs-lsm',
        body: `<p>A B-tree and an LSM tree solve the same problem - find a key quickly, keep a sorted order for range scans - with opposite instincts about writes. A B-tree updates a value where it already lives: descend from the root to the leaf holding the key, change the bytes on that page, and write the page back, in place. An LSM tree never touches an old page; it only ever appends new data and cleans up later with compaction.</p>
<p>That difference decides which one fits which workload. A B-tree's in-place update means a single write can touch a page scattered anywhere on disk, and the same page may be rewritten by unrelated updates - random writes that disks are slower at. An LSM tree turns every write into a sequential append, at the cost of write amplification from compaction and needing to check a handful of SSTables on the least lucky read.</p>
<p>In practice: <b>PostgreSQL</b> and <b>MySQL</b>'s default InnoDB engine both use B-trees, and are the standard choice for a healthy mix of reads and writes, or reads that dominate. <b>LevelDB</b>, the original Google-built LSM engine, and <b>RocksDB</b>, Facebook's much-extended fork of it, are the standard choice underneath write-heavy systems - RocksDB is used inside MySQL itself as the MyRocks storage engine, inside CockroachDB and TiKV, and as an embedded engine in countless other systems that need a fast local key-value store. The rule of thumb interviewers listen for: choose a B-tree when reads dominate, or a workload needs many secondary indexes updated cheaply in place; choose an LSM tree when writes dominate, especially many small writes, and reads can tolerate checking a small number of files.</p>`,
        deeper: `<p>The one operational cost worth naming out loud in an interview is that LSM compaction is not free: it runs continuously in the background, competing for the same disks as live reads and writes, and a compaction backlog that falls behind is exactly what write stalls in RocksDB and similar engines look like.</p>`,
        check: {
          question: 'A workload is dominated by small, frequent writes and can tolerate reads that check a handful of files. Which storage engine style fits better, and why?',
          options: [
            'A B-tree, because it is simpler to implement',
            'An LSM tree, because it turns writes into sequential appends and defers reorganising data to background compaction, which is exactly what a write-heavy workload needs',
            'A B-tree, because it never needs compaction',
            'Neither; both perform identically regardless of workload'
          ],
          answer: 1,
          explain: 'LSM trees trade some read cost and background compaction work for cheap, sequential writes, which is the right trade when writes dominate.'
        }
      },
      {
        id: 'se-f6',
        part: 'field',
        title: 'Building a file-backed key-value store from scratch',
        body: `<p>Building a small key-value engine end to end makes every idea above concrete. Start with one data file, opened for appending only. Define one binary record format and never deviate from it: for example, a 4-byte checksum, an 8-byte timestamp, a 4-byte key length, a 4-byte value length, then the key bytes, then the value bytes. Every record, insert, update, or delete, is written this way and only ever appended.</p>
<p>Keep an in-memory index mapping each key to a <b>byte range</b>: which file it is in, the offset the record starts at, and how many bytes to read. A read becomes: look up the byte range, seek to that offset, read exactly that many bytes, check the checksum. Nothing about the read has to guess where a record ends.</p>
<p>Once the active file passes a size limit, close it - it becomes an <b>immutable, versioned file</b>, such as <code>seg-000004.log</code> - and open a new active file for new writes. Immutability is what makes the next part safe: a background compaction can read several old, closed files, write their surviving keys into a brand-new file, and only then update the in-memory index and delete the old files, all without touching a file another reader might currently have open.</p>
<p>The checksum earns its place on every read, not just at write time. Recomputing it over the bytes just read and comparing it to the stored value catches disk corruption and torn writes, the kind a crash mid-append can leave behind. A record that fails its checksum is treated as if it were never written, and a well-behaved engine reports the failure rather than silently returning wrong bytes - checking that comparison on every single read, not just having a checksum stored somewhere, is what end-to-end integrity actually means.</p>`,
        deeper: `<p>On startup, this design rebuilds its index by scanning every immutable file once, reading each record's length fields to know where the next one begins, and keeping only the newest version of each key seen. That is slow on a large data set, which is exactly the problem Bitcask's hint files solve: write a small index file alongside each immutable data file at compaction time, so startup only has to read the small hint files instead of every full record.</p>`,
        check: {
          question: 'Why store the value\'s byte length explicitly in each record, rather than relying on a separator character between records?',
          options: [
            'Separator characters take up more disk space than a length field',
            'A stored length lets the engine read exactly the right number of bytes regardless of what bytes happen to appear inside the value, including bytes that would look like a separator',
            'Length fields are required for the checksum to work',
            'It is not necessary; either approach works equally well'
          ],
          answer: 1,
          explain: 'A value can contain arbitrary bytes, including whatever byte a separator would use, so only an explicit length is reliable for finding the end of a record.'
        }
      },
      {
        id: 'se-f7',
        part: 'field',
        title: 'Object storage versus a database',
        viz: 'object-storage-layers',
        body: `<p>Object storage systems like Amazon S3 solve a different problem than a database: store an enormous number of large, whole, immutable blobs cheaply and durably, under a flat namespace of keys, rather than mutable rows a query can filter, join, or partially update. The trade-offs below describe how such a system is generally built, not any one company's exact internals.</p>
<p>A <b>metadata service</b> tracks which bucket and key map to which object, its size, and its current version, separately from the bytes themselves - it answers "does this object exist" and "where does it live" without touching the object's actual data. A <b>partition manager</b> shards this huge namespace across many machines, using a <b>map table</b> that records which partition owns which slice of the key space, since no single machine can hold the metadata or serve the traffic for billions of objects; a naive scheme that partitions by the plain order of keys can create a hot partition if many keys share a sequential prefix, which is why object stores encourage varied key prefixes, or hash the key before choosing a partition.</p>
<p>Underneath the metadata, an <b>append-only stream layer</b> is a common way to actually place object bytes on disk: new object data is appended to large underlying files, similar to an SSTable, rather than each object owning its own tiny file, which would waste space and hurt throughput at massive scale.</p>
<p>Durability comes from spreading every object across multiple machines and, usually, multiple physical locations, so no single disk, machine, or facility failure loses data. <b>Erasure coding</b> is the space-efficient way to do this: split an object into several data pieces and add a smaller number of parity pieces, so that any subset of pieces up to the number of parity pieces can be lost and the object still rebuilt, at roughly one and a half times the object's size in storage rather than the two or three times a full-copy replication scheme would need for similar protection.</p>`,
        deeper: `<p>For years S3 gave only eventual consistency for overwrites of an existing key, meaning a read right after a write could still return the old value; Amazon changed this in December 2020 to strong read-after-write consistency for every request, closing a gap application code used to have to work around.</p>`,
        check: {
          question: 'Why might partitioning an object store\'s key namespace by the plain order of the key create a hot partition?',
          options: [
            'Plain ordering requires more storage per key',
            'Many objects with a shared, sequentially increasing key prefix, such as a timestamp, all fall in the same narrow slice of the key range, and therefore the same partition, concentrating their traffic there',
            'Plain ordering cannot support range queries at all',
            'It cannot; ordering keys always distributes them evenly'
          ],
          answer: 1,
          explain: 'A monotonically increasing prefix, like a timestamp, means every new write goes to the same end of the sorted range, and therefore on the same partition.'
        }
      },
      {
        id: 'se-f8',
        part: 'field',
        title: 'A worked example: storage for ML feature snapshots and model files',
        body: `<p>A team training and serving a fraud-detection model has to decide where three different kinds of data live, and the right answer differs for each because the access pattern differs, not because one storage system is generally better.</p>
<p><b>Trained model files</b> - the weights produced by a training run, from a few megabytes for a small model to tens of gigabytes for a large one - are written once, read many times, and read in large sequential chunks when a serving process loads them into memory. That access pattern is exactly what object storage is built for: cheap per gigabyte, very high durability, strong sequential read throughput, and a natural way to keep every past version addressable by its own key for rollback.</p>
<p><b>Historical feature snapshots</b> used to train the model - large, columnar files covering months of past data, read by scanning a whole date range at once during a training run - fit the same pattern: bulk, sequential, infrequent writes. Object storage, organised with a clear key structure by date, is again the right fit, and is far cheaper per gigabyte than a database built for point lookups.</p>
<p>The <b>live feature value for one entity</b>, fetched the instant a model has to score a transaction, is the opposite access pattern: one specific row, by one specific key, in a few milliseconds, at a request rate that can reach thousands of lookups a second. Object storage's per-request latency and lack of a real key index make it the wrong tool here; this belongs in a database built on a B-tree or an LSM tree, the same structures this chapter has spent its time on, chosen specifically because they answer one key's worth of data quickly under load.</p>
<p>The lesson interviewers are listening for is not "always use object storage" or "always use a database." It is recognising that the same word, feature data, can describe two entirely different access patterns, and that those two patterns belong in two different storage systems.</p>`,
        deeper: `<p>As a rough feel for the gap: an object storage request typically costs tens of milliseconds and is billed and rate-limited per request, while a well-indexed key-value store built for point lookups routinely answers one in a few milliseconds and is built to sustain a much higher request rate on the same hardware. Neither figure is a promise for any specific system; the point is that the two differ by roughly an order of magnitude, and a design that puts request-time scoring on object storage feels that gap immediately under load.</p>`,
        check: {
          question: 'A team stores trained model weights, historical training snapshots, and live per-request feature values. Which of these is the best fit for object storage rather than a database?',
          options: [
            'The live feature value looked up for one entity at request time',
            'All three fit object storage equally well',
            'The trained model weights and the historical training snapshots, because both are large, immutable, and read in big sequential chunks rather than as single-key point lookups',
            'None of them; all three should live in a relational database'
          ],
          answer: 2,
          explain: 'The deciding factor is access pattern - bulk sequential reads fit object storage; a single-key, low-latency point lookup at high request rate needs a database built for that job.'
        }
      }
    ],
    connect: null,
    activities: [
      {
        id: 'se-a1',
        type: 'design',
        title: 'Choose a storage engine for a metrics ingestion service',
        prompt: `"We're building a metrics ingestion service: millions of small writes per second, and queries are almost always 'give me this metric between time A and time B.' Would you build this on a B-tree or an LSM tree, and walk me through how you'd structure the write path, compaction, and the read path for a range query?"`,
        timeboxSec: 1200,
        rubric: `Marking guide, out of 10. (1) Correctly picks an LSM tree, justified by the write-heavy pattern (millions of writes per second), not just asserted. (2) Explains the write path: write-ahead log, then memtable, then flush to an immutable SSTable, in that order. (3) Chooses a key that supports the query pattern, such as metric name followed by timestamp, so a range query is a sorted scan rather than a search across the whole data set. (4) Reasons about compaction strategy in light of the workload: notes that metrics are mostly appended rather than overwritten, so there is little space amplification to fight, and leans toward a strategy that bounds file count over one obsessed with reclaiming space. (5) Describes the read path for a range query: sparse index to jump near the start time in each relevant SSTable, scan forward to the end time, Bloom filter to skip files holding unrelated metrics. (6) States an assumption about the key structure explicitly rather than designing in a vacuum. (7) Names write amplification as the metric to actually watch and ties memtable/level sizing to real write rate rather than a default. (8) At least one trade-off is stated as a trade-off, with both sides named. Deduct for: choosing a B-tree with no justification tied to the given numbers; no mention of compaction; describing the read path as a full scan with no sparse index or Bloom filter reasoning. {{HONESTY}}`,
        model: `"I'd build this on an LSM tree, not a B-tree - millions of writes a second is squarely the workload LSM trees are built for, and a B-tree's in-place updates would mean random writes scattered across disk at that rate.

I'd key each record by metric name followed by timestamp, so a range query for one metric between two times is a sorted scan, not a search across the whole data set. Writes go to the write-ahead log first for durability, then into the memtable; once the memtable fills, it flushes to an immutable SSTable, sorted by that same metric-plus-timestamp key.

Because metrics are almost always appended, not updated, there are very few overwrites to reclaim, so I'd lean toward a compaction strategy that merges files mostly to bound the total number of SSTables a range query has to touch, rather than one obsessed with reclaiming space from overwritten values - closer to size-tiered than an aggressive leveled setup, since I'm not fighting much space amplification here.

For the read path, a query for one metric's time range uses the sparse index to jump near the start time in each relevant SSTable and scans forward until it passes the end time; a Bloom filter per file lets me skip any SSTable that clearly holds a different set of metrics. I'd expect write amplification to be the real cost to watch, and I'd size the memtable and level fan-out around the actual write rate rather than a default."`
      },
      {
        id: 'se-a2',
        type: 'explain',
        title: 'Correct a misunderstanding about Bloom filters',
        prompt: `"Someone on your team says, 'Bloom filters make our reads faster because they tell us exactly which file has the key.' What's wrong with that statement, and what do Bloom filters actually guarantee?"`,
        timeboxSec: 480,
        rubric: `Must-haves: (1) states the correct guarantee precisely: no false negatives, possible false positives - a "definitely not present" answer is always correct, a "maybe present" answer can be wrong. (2) Directly corrects the claim: a Bloom filter never confirms a key is present, so it cannot point to exactly the right file. (3) Explains the actual mechanism of the speed-up: the great majority of files that do not hold the key get skipped with no disk read, while files flagged as "maybe" still require a real check. (4) Mentions the tunable trade-off between filter memory and false-positive rate. Common mistakes: claiming Bloom filters have zero false positives; claiming they eliminate the need to check the file when it says "maybe present." {{HONESTY}}`,
        model: `"The statement isn't quite right. A Bloom filter never confirms a key is present, and it can produce a false positive - it only ever rules things out with certainty. When it says a key is definitely not there, that's always correct, and we skip a disk read for that file entirely. When it says a key might be there, we still have to actually check that file, because that answer can be wrong.

So the speed-up is asymmetric: Bloom filters make reads faster by cutting the number of files we bother checking for a key that only touches a few of them, not by pointing straight at the right file. On a table with ten SSTables, without the filter we might check most of them before finding or ruling out a key; with the filter, most of those checks turn into a fast, in-memory 'definitely not here,' and we only pay for real disk reads on the files that could actually have it.

There's also a tunable trade-off worth mentioning: a smaller filter uses less memory but has a higher false-positive rate, meaning more files get the 'might be there' answer and have to be checked for real. Sizing the filter is a real memory-versus-read-cost decision, not something to leave at a default without checking it against the read pattern."`
      },
      {
        id: 'se-a3',
        type: 'drill',
        title: 'Practice: estimate write amplification, and name the caveat',
        prompt: `Practice problem. Your LSM tree uses leveled compaction with a level size multiplier of 10, and a key written today gets compacted from level 0 down to level 3 before it settles. Roughly how many times might that key's data actually be rewritten to disk before it's done moving, and why is the real number not exactly one per level?`,
        timeboxSec: 420,
        rubric: `Must-haves: (1) gives the mechanism-based intuition first - roughly once per level transition, so three or four rewrites moving from level 0 to level 3. (2) Correctly explains why the real number is higher: compaction rewrites whole overlapping files, not one key at a time, so a key can be swept into more than one compaction pass at the same level before it is promoted, and files are touched again as new data keeps arriving above them. (3) Cites the correct order of magnitude for realistic leveled configurations - commonly 10 to 30 times, per RocksDB's own tuning documentation - rather than stopping at the naive per-level count. (4) Frames this as measured, not derived purely from counting levels. Deduct for stating an exact number with no caveat, or an arbitrary figure with no reasoning tied to the mechanism. {{HONESTY}}`,
        model: `"Naively, moving from level 0 to level 3 sounds like three or four rewrites - once per level the key passes through as compaction promotes it downward. That's the right intuition for the mechanism, but it understates the real number, because compaction doesn't rewrite one key at a time: it merges whole overlapping files together, so a key can get swept up in more than one compaction pass at the same level as new data keeps arriving above it, and a file it sits in might be touched again before it's promoted.

That's why RocksDB's own tuning documentation reports leveled compaction write amplification more commonly in the 10 to 30 times range for realistic configurations, not the 3 or 4 you'd get from just counting levels. The level count gives the minimum number of times the data is touched on its way down; the actual figure also depends on how much data sits at each level, how big the level size multiplier is, and how often compaction runs.

The honest way to answer this in an interview is to give the mechanism-based intuition first, roughly once per level, and then name the caveat: real write amplification is measured, not derived from level count alone, and the commonly cited range for leveled compaction is noticeably higher than that simple count."`
      }
    ],
    sayQuestion: null,
    sayItOutLoud: null,
    readings: [
      { l: 'PRIMER: Bitcask - A Log-Structured Hash Table for Fast Key/Value Data', u: 'https://riak.com/assets/bitcask-intro.pdf', w: 'The original design behind Bitcask: one append-only active file, an in-memory keydir, hint files, and the merge process this chapter\'s log-structured section is based on.', m: 25 },
      { l: 'Designing Data-Intensive Applications - official excerpt including Chapter 3', u: 'https://www.scylladb.com/wp-content/uploads/ScyllaDB-Designing-Data-Intensive-Applications.pdf', w: 'A free official excerpt of Kleppmann\'s book including the storage and retrieval chapter, the clearest full treatment of hash indexes, SSTables, LSM-trees and B-trees side by side.', m: 40 },
      { l: 'RocksDB wiki - Compaction', u: 'https://github.com/facebook/rocksdb/wiki/Compaction', w: 'The production documentation for how a real, widely used LSM engine actually runs compaction, including the leveled and universal strategies this chapter only summarises.', m: 15 },
      { l: 'LevelDB docs - SSTable file format', u: 'https://github.com/google/leveldb/blob/main/doc/table_format.md', w: 'The exact on-disk layout of an SSTable from the engine that started this design, including the index block and filter block this chapter describes in words.', m: 10 },
      { l: 'Video: ByteByteGo - The Secret Sauce Behind NoSQL: LSM Tree', u: 'https://www.youtube.com/watch?v=I6jB0nM9SKU', w: 'A short visual walk through why LSM trees exist and how memtables, SSTables and compaction fit together.', m: 8 },
      { l: 'ByteByteGo - B-Trees vs LSM Trees: Comparison and Trade-Offs', u: 'https://blog.bytebytego.com/p/b-trees-vs-lsm-trees-comparison-and', w: 'A side-by-side comparison of the two engine families and the databases that use each, useful right after this chapter\'s own comparison.', m: 8 },
      { l: 'Arpit Bhayani - How erasure coding achieves S3 durability with reduced storage cost', u: 'https://arpitbhayani.me/notes/how-erasure-coding-achieves-s3-durability-with-reduced-storage-costs', w: 'A clear worked explanation of how splitting an object into data and parity pieces gets S3-level durability for a fraction of full replication\'s storage cost.', m: 10 },
      { l: 'Build Your Own Database (interactive)', u: 'https://www.nan.fyi/database', w: 'An interactive page to click through append, index, and compaction operations on a toy key-value store, building the exact structure this chapter\'s from-scratch section describes.', m: 20 }
    ],
    glossary: [
      {
        g: 'Storage engines and object storage',
        sub: '',
        rows: [
          ['Write-ahead log', 'A log appended and flushed to disk before a change touches any other structure, so a crash can never lose an acknowledged write', 'durability'],
          ['Memtable', 'The in-memory sorted structure holding the newest writes before they are flushed to disk', 'LSM write path'],
          ['SSTable', 'An immutable, sorted, on-disk file written once and never edited again', 'LSM trees'],
          ['Compaction', 'The background process that merges files and drops overwritten or deleted keys', 'LSM trees, Bitcask'],
          ['Bloom filter', 'A small structure that rules out files with certainty and flags others as merely possible', 'LSM read path'],
          ['Sparse index', 'An index over every few hundred keys, relying on sort order to scan the short gap between them', 'LSM read path'],
          ['Write amplification', 'Bytes actually written to disk, counting every rewrite, divided by bytes the application logically wrote', 'LSM trees'],
          ['Keydir', 'Bitcask\'s in-memory hash index: key mapped to file, offset, and size', 'Bitcask'],
          ['Hint file', 'A small file holding key and location but not the value, so startup avoids scanning full data files', 'Bitcask'],
          ['Byte-range index', 'An in-memory map from key to exactly which file, offset and length holds its value', 'file-backed key-value stores'],
          ['Checksum', 'A value computed from a block of bytes that changes if any bit of those bytes changes, catching corruption', 'integrity'],
          ['Erasure coding', 'Splitting data into pieces plus parity pieces so a subset of pieces can rebuild the whole, more cheaply than full copies', 'object storage'],
          ['Metadata service', 'The part of an object store that tracks which key maps to which object and version, apart from the object bytes', 'object storage'],
          ['Leveled compaction', 'Compaction that keeps space use low by repeatedly merging data down through size-multiplied levels, at the cost of more rewriting', 'LSM trees']
        ]
      }
    ]
  };

  root.PREP_CORE['queues-and-streams'] = {
    id: 'queues-and-streams',
    title: 'Queues, streams and asynchronous work',
    level: 'danger',
    levelLabel: 'Asked in almost every system design interview that touches background work.',
    why: `Nearly every system design interview eventually reaches a step that should not block the caller - sending a notification, processing a payment, resizing an image - and how you handle that moment says more about production experience than almost anything else in the round. Interviewers are listening for the difference between someone who says "we'd use a queue" as a reflex and someone who can say which kind of queue, what happens if a message runs twice, and what happens to the one message that will never succeed. The same ideas show up again disguised as a scheduling problem, a fan-out problem, or a data-contract problem, so being fluent in this vocabulary pays off across the whole interview, not only in the question that mentions "queue" by name.`,
    learn: [
      {
        id: 'qs-0',
        part: 'field',
        title: 'Key terms',
        body: `<p>One pass through the words this chapter uses. Read it once, then use the words freely.</p>
<ul>
<li><b>Asynchronous processing.</b> Doing work after replying to whoever asked for it, instead of making them wait for it to finish. Sending a welcome email after account creation, rather than during it, is a small example.</li>
<li><b>Producer, consumer.</b> The producer creates a unit of work or an event and hands it off; the consumer picks it up and does something with it. The same process can be both, for different pieces of work.</li>
<li><b>Broker.</b> The server, or cluster, that sits between producers and consumers, holding work until a consumer takes it. RabbitMQ, Amazon SQS and Apache Kafka are all brokers, built around different models.</li>
<li><b>Task queue.</b> A model where each unit of work is meant to be handled once, by one consumer, and then it is gone. Good for "send this email," "resize this image," "charge this card."</li>
<li><b>Event stream (log).</b> A model where every event is appended to a durable, ordered log and kept for a retention period, and many independent consumers can each read the same events at their own pace. Good for "every service that cares about orders happening needs to know."</li>
<li><b>Partition.</b> One ordered, independent slice of a stream's log. A topic with several partitions can be written to and read from in parallel, at the cost of ordering being guaranteed only within one partition, not across the whole topic.</li>
<li><b>Consumer group.</b> A set of consumers sharing the work of reading one stream, where each partition is read by exactly one consumer in the group at a time.</li>
<li><b>Offset.</b> A number marking a consumer's position in one partition: which record it should read next. Committing an offset says "everything up to here is done."</li>
<li><b>Retention.</b> How long a stream keeps old events before discarding them, regardless of whether every consumer has read them yet.</li>
<li><b>Replay.</b> Resetting a consumer's offset backward and reading events again, something a durable log allows and a task queue that removes work after it is handled does not.</li>
<li><b>At-most-once, at-least-once, exactly-once.</b> How many times a piece of work might actually run: possibly zero, possibly more than once but never zero, or - in practice, achieved by combining at-least-once delivery with an idempotent consumer - effectively exactly once from the outside.</li>
<li><b>Idempotent consumer.</b> A consumer written so that processing the same message twice has the same effect as processing it once, usually by checking an idempotency key against work already done before doing it again.</li>
<li><b>Backpressure.</b> Slowing down or rejecting new work because a downstream consumer, or the queue itself, cannot keep up.</li>
<li><b>Consumer lag.</b> How far behind a consumer is: how many messages, or how much time, sit unread on the queue or stream behind its current position.</li>
<li><b>Dead-letter queue.</b> A separate queue that a message is moved to after failing processing some number of times, so it stops blocking, or repeatedly failing, the main queue.</li>
<li><b>Poison message.</b> A message that will never process successfully no matter how many times it is retried, because of a bug or bad data, and needs a dead-letter queue rather than endless retries.</li>
<li><b>Lease.</b> A time-limited claim a worker takes on a piece of work, after which, if the worker has not finished or renewed it, another worker is allowed to take over.</li>
<li><b>SKIP LOCKED.</b> A database clause that lets a query skip rows another transaction already has locked, instead of waiting for them, which is what turns an ordinary table into a usable queue.</li>
<li><b>DAG (directed acyclic graph).</b> A set of tasks with dependencies between them and no cycles, so a valid order to run them in always exists.</li>
<li><b>Orchestrator.</b> A system that runs a DAG of tasks, tracking which have run, retrying failures, and re-running a past date range on demand.</li>
<li><b>Backfill.</b> Running an orchestrated pipeline again over a past date range, usually after a bug fix or a schema change, to bring old output in line with the corrected logic.</li>
<li><b>Fan-out.</b> Turning one event into many pieces of follow-up work, one per interested party - for example, one new post triggering a write into every follower's own feed.</li>
<li><b>Schema registry.</b> A service that stores the accepted schema for every message type and rejects a producer or consumer using an incompatible version.</li>
</ul>`,
        deeper: `<p>Two of these are worth stating precisely rather than vaguely. "Exactly-once" is not something the network itself can guarantee across arbitrary producers and consumers, because a sender can never fully tell "my message was lost" apart from "my acknowledgement was lost." What is achievable, and is what people usually mean by the phrase, is at-least-once delivery paired with an idempotent consumer - a duplicate can arrive, but processing it twice has the same effect as processing it once.</p>`,
        check: {
          question: 'What does an idempotent consumer guarantee?',
          options: [
            'That a message will never be delivered more than once',
            'That processing the same message twice has the same effect as processing it once, so a duplicate delivery causes no harm',
            'That a message will always be processed within a fixed time limit',
            'That the broker will never lose a message'
          ],
          answer: 1,
          explain: 'Idempotency does not stop duplicates from arriving; it makes a duplicate harmless, which is what turns at-least-once delivery into effectively-once processing.'
        }
      },
      {
        id: 'qs-f1',
        part: 'field',
        title: 'Why hand off work asynchronously',
        viz: 'message-queue-async',
        body: `<p>Three separate reasons show up in almost every interview answer about async processing, and naming all three, not just one, is what makes an answer sound complete.</p>
<p>The first is <b>latency</b>: a request only needs to wait for the part of the work the caller actually needs an answer to. Uploading a video does not need to wait for every resolution to finish transcoding before replying "upload received" - the caller gets a fast response, and the transcoding happens after, off the request path.</p>
<p>The second is <b>decoupling</b>. A producer that hands work to a queue does not need to know how many consumers exist, whether they are healthy right now, or how fast they run. A consumer can be deployed, scaled, or rewritten in a different language without the producer changing at all. If a downstream service is down for ten minutes, work queues up instead of every request failing.</p>
<p>The third is <b>smoothing spikes</b>. A queue turns a burst of arriving work into depth rather than into errors or dropped requests: ten thousand orders in one minute during a sale become a queue that is ten thousand messages deeper, worked through at whatever steady rate the consumers can sustain, instead of ten thousand requests each demanding to be handled the instant it arrives.</p>
<p>None of this is free. Async work means the caller no longer knows, at the moment it gets a response, whether the work actually succeeded - only that it was accepted. Anything the caller genuinely needs confirmed before replying, a payment succeeding, for instance, usually cannot be pushed fully asynchronous without redesigning what "success" means to the caller.</p>`,
        deeper: `<p>The spike-smoothing benefit has a limit worth stating precisely: a queue can absorb a spike only if the average arrival rate over time is at or below what consumers can sustain. If it is consistently higher, the queue does not smooth the spike, it grows without bound, and consumer lag climbs forever - a queue buys time, not extra total capacity.</p>`,
        check: {
          question: 'A checkout service now writes a message to a queue instead of calling the shipping service directly, and replies to the customer immediately. What has this checkout service given up?',
          options: [
            'Nothing; asynchronous processing has no downsides',
            'Knowing, at the moment it replies, whether the shipping step actually succeeded - it now only knows the work was accepted',
            'The ability to ever find out if shipping failed',
            'The ability to scale the shipping service independently'
          ],
          answer: 1,
          explain: 'The reply now means "accepted," not "completed." The system can still detect and handle shipping failures later, just not at the moment of the original reply.'
        }
      },
      {
        id: 'qs-f2',
        part: 'field',
        title: 'Task queue versus event stream',
        viz: 'queue-vs-stream',
        body: `<p>A task queue and an event stream both move work off the request path, but they answer a different question. A task queue asks "who will do this job," and once a consumer takes a message, it is meant for that one consumer only - RabbitMQ and Amazon SQS are built around this model. An event stream asks "what happened," and expects that more than one independent party might care - Apache Kafka is built around this model, and calling it a queue undersells what it actually is.</p>
<p>The mechanical difference follows from that. In a task queue, a message is normally removed, or made invisible to other consumers, once it is picked up, and it is gone for good once it is acknowledged. In an event stream, an event is appended to a durable, ordered log and stays there for its retention period regardless of who has read it; reading it does not remove it, so a second consumer, or the same consumer starting over, can read it again.</p>
<p>That gives an event stream two things a task queue does not: several independent consumer groups can each read every event at their own pace for their own purpose - billing, analytics, and fraud checks all reading the same "order placed" event without knowing about each other - and any one of them can replay history by resetting where it is reading from, useful for fixing a bug and reprocessing, or for a new consumer that needs everything from the beginning.</p>
<p>The practical rule: reach for a task queue when a job needs to be done exactly once, by whichever consumer gets to it, and the job disappears once it succeeds. Reach for an event stream when the same event matters to several different parts of the system, or history needs to be replayable.</p>`,
        deeper: `<p>This is also why a stream's data is spread over partitions rather than one channel: many task queues get more throughput by adding more consumers competing for the same messages, but an event stream needs a way to keep reading in parallel while still preserving order for events that need it, which partitioning provides - the next section covers exactly how.</p>`,
        check: {
          question: 'A team needs three independent services - billing, fraud detection, and analytics - to each process every "order placed" event, at their own pace, without depending on each other. What handles this better, a task queue or an event stream, and why?',
          options: [
            'A task queue, because it processes work in a strict order',
            'An event stream, because each event stays in the durable log for every interested consumer group to read independently, rather than being removed once one consumer takes it',
            'Either works identically for this case',
            'A task queue, because it removes work once handled, keeping the system simpler'
          ],
          answer: 1,
          explain: 'The requirement - several independent parties, each reading every event at its own pace - is exactly what an event stream\'s durable log and independent consumer groups are built for.'
        }
      },
      {
        id: 'qs-f3',
        part: 'field',
        title: 'Inside Kafka: partitions, consumer groups, offsets, retention, and replay',
        viz: 'consumer-group-offsets',
        body: `<p>Kafka calls one named stream of events a <b>topic</b>, and splits it into some number of <b>partitions</b> decided when the topic is created. Every event written to a partition gets the next sequential <b>offset</b> in that partition, and Kafka guarantees order only within a single partition, never across the whole topic - two events in different partitions have no ordering guarantee relative to each other.</p>
<p>A <b>consumer group</b> is a named set of consumers sharing the work of reading a topic. Kafka assigns each partition to exactly one consumer within a group at a time, so a topic with six partitions can be read in parallel by up to six consumers in one group; a seventh consumer in that group would sit idle, since there is nothing left to assign it. Two different consumer groups reading the same topic are entirely independent of each other - each group has its own offsets, and one group's reading has no effect on another's.</p>
<p>Each consumer periodically <b>commits</b> its offset, recording "everything up to here in this partition is done" for its group. If a consumer crashes, another member of the group picks up its partitions and resumes from the last committed offset, which is why how often offsets are committed, and whether they are committed before or after processing finishes, decides whether a crash causes lost work or repeated work.</p>
<p><b>Retention</b> keeps events for a configured amount of time or total size, independent of consumption - a topic set to keep seven days of data holds every event from that window whether or not any consumer has read it, and a consumer group can <b>replay</b> data by resetting its committed offset backward, as long as the events it wants are still within retention.</p>`,
        deeper: `<p>One consequence worth stating out loud: partition count is chosen up front and is expensive to change later, because increasing it changes which partition a given key hashes to, breaking per-key ordering for any key with events already produced under the old partition count. Sizing partition count for expected future consumer parallelism, not just today's traffic, is a real design decision, not an afterthought.</p>`,
        check: {
          question: 'A Kafka topic has four partitions and one consumer group with two consumers. What is true?',
          options: [
            'Both consumers read all four partitions',
            'Each consumer is assigned two of the four partitions, and Kafka guarantees ordering only within each partition, not across all four',
            'Only one consumer can be active at a time',
            'The topic must have exactly two partitions to match the two consumers'
          ],
          answer: 1,
          explain: 'Kafka splits the partitions across the consumers in a group; ordering is a per-partition guarantee, not a per-topic one.'
        }
      },
      {
        id: 'qs-f4',
        part: 'field',
        title: 'Delivery guarantees and ordering',
        viz: 'delivery-guarantees',
        body: `<p>Three delivery guarantees describe how many times a piece of work might actually run, and the honest interview answer is that only two of them are ever really implemented directly. <b>At-most-once</b> means work runs zero or one times - acceptable when losing an occasional message is cheaper than the complexity of guaranteeing delivery, such as a best-effort metrics ping. <b>At-least-once</b> means work runs one or more times - never lost, but a retry after a timeout can cause the same message to be processed twice, for example if a consumer finishes the work but crashes before it acknowledges the message.</p>
<p><b>Exactly-once</b>, in the strict sense of running precisely one time, no more, no less, is not achievable across an arbitrary network, because a producer or consumer can never fully distinguish "my last message was lost" from "my last acknowledgement was lost." What is achievable, and is what people usually mean in practice, is <b>at-least-once delivery combined with an idempotent consumer</b>: the message might arrive twice, but processing it twice has exactly the same effect as processing it once, because the consumer checks an idempotency key, has this order ID already been charged, before doing the work again. The system behaves as if delivery were exactly once, without needing the network to actually guarantee it.</p>
<p><b>Ordering per key</b> is a separate guarantee from delivery count. Kafka guarantees order only within one partition, so sending every event for the same entity - the same order ID, the same user ID - to the same partition, usually by hashing that key, keeps that entity's events in order even though the topic as a whole is unordered across partitions.</p>`,
        deeper: `<p>A payments example makes the idempotency point concrete: a client calls "charge this card" and the network times out before the response arrives. The client cannot tell whether the charge happened or not, so it retries. If the server remembers idempotency keys already processed and returns the stored result for a repeat, the customer is charged once no matter how many times the client retries - the guarantee lives in the server's own bookkeeping, not in the network being reliable.</p>`,
        check: {
          question: 'Why is a message queue with automatic retries usually described as at-least-once rather than exactly-once, even if most messages are only ever processed a single time?',
          options: [
            'Because messages are frequently lost',
            'Because a consumer can finish processing and crash before acknowledging, causing a retry to redeliver a message that was already handled, so duplicates are possible even though loss is not',
            'Because ordering cannot be guaranteed',
            'Because exactly-once is only possible with a task queue, never a stream'
          ],
          answer: 1,
          explain: 'The gap between "work done" and "acknowledgement sent" is exactly where a crash can turn at-least-once delivery into a duplicate, which is why the guarantee is named for what it actually promises.'
        }
      },
      {
        id: 'qs-f5',
        part: 'field',
        title: 'Queue lag and backpressure',
        viz: 'dead-letter-queue',
        body: `<p><b>Consumer lag</b> - how far behind consumers are - is usually the single most useful health number for an async system, and it can be measured two ways: message count, how many unread messages or unconsumed offsets sit behind the consumer's position, and time, how old the oldest unprocessed message is. Time-based lag is usually the more honest number to alert on, because ten thousand tiny, fast messages is a very different problem from ten messages that each take an hour.</p>
<p>Rising lag has two possible fixes, and picking the wrong one wastes effort. If consumers are the bottleneck and the work parallelises, add more consumers - up to the partition count for a stream, since a partition can only be read by one consumer in a group at a time, or up to whatever concurrency limit a downstream dependency can tolerate for a task queue. If a downstream dependency, like a database or a third-party API, is the actual bottleneck, adding consumers just moves the queueing there instead, and the fix is to reduce work per message, batch calls to the dependency, or apply backpressure upstream - slowing or rejecting new work at the producer rather than letting it pile up invisibly.</p>
<p>A <b>dead-letter queue</b> exists for the messages that consumer scaling and backpressure cannot fix: a <b>poison message</b> that fails every single time it is retried, because of a bug in how it is handled or because the message itself is malformed. Retrying it forever blocks other messages behind it, or wastes capacity retrying something that will never succeed. After a configured number of failed attempts, the message is moved to a separate dead-letter queue, out of the main flow, where it can be inspected, fixed, and replayed manually, without holding up everything behind it.</p>`,
        deeper: `<p>The number of retries before dead-lettering is itself a design decision with a real trade-off: too few, and a message that would have succeeded on a third try after a brief downstream blip gets dead-lettered unnecessarily; too many, and a genuinely poisoned message clogs the queue and burns retry capacity for a long time before anyone notices it needs a human.</p>`,
        check: {
          question: 'Consumer lag is rising, and profiling shows each consumer is spending most of its time waiting on a slow downstream API, not on CPU work. What is the right first move?',
          options: [
            'Add many more consumers immediately',
            'Reduce the number of consumers to save resources',
            'Address the downstream bottleneck directly - batch calls, cache, or apply backpressure - since adding more consumers will only shift the queueing onto the already-overloaded dependency',
            'Move every message straight to the dead-letter queue'
          ],
          answer: 2,
          explain: 'Adding consumers only helps when the consumers themselves are the constraint; here the constraint is downstream, so more consumers just create more concurrent pressure on the same bottleneck.'
        }
      },
      {
        id: 'qs-f6',
        part: 'field',
        title: 'Building your own queue: schedulers and Postgres with SKIP LOCKED',
        body: `<p>Two closely related problems - run jobs on a recurring schedule reliably across a fleet, and let several workers safely share one queue of jobs - come up often enough that it is worth knowing both without reaching for a message broker.</p>
<p>A <b>distributed task scheduler</b> is what "cron, but for a fleet of machines, and jobs that must not silently double-run" looks like. Plain cron on one box has an obvious failure mode: if that box is down when the schedule fires, the job simply never runs, and if two boxes both run the same cron entry, the job runs twice. A distributed version fixes this with a <b>lease</b>: before running a scheduled job, a worker claims a short-lived lease on it, visible to every other worker, and only the worker holding the lease runs it. If that worker dies mid-job, the lease expires and another worker can take over. Retries on failure and a record of which schedule instance has already run - deduplication by, for example, the schedule time plus the job name - stop a slow network or a retry from causing the same run to happen twice.</p>
<p>A plain relational table can act as a real queue with one clause: <b>SKIP LOCKED</b>. <code>SELECT * FROM jobs WHERE status = 'pending' ORDER BY id FOR UPDATE SKIP LOCKED LIMIT 1</code> lets several workers run this same query concurrently, each one locking and claiming a different row instead of queueing up behind each other's locks or, worse, claiming the same row twice. It is genuinely enough for a queue with a modest number of workers and a job volume the database can comfortably absorb alongside its other traffic, and it comes with a real advantage: the job and the data it touches can live in the same transaction, so a job's effect and its completion can commit together.</p>
<p>It stops being enough once throughput needs to go far beyond what one database can serve, once consumers need to be spread across independent services rather than one shared database, or once the job needs the replay, fan-out to multiple independent consumers, or partition-level ordering that a real event stream provides and a single table fundamentally cannot.</p>`,
        deeper: `<p>Fairness is one thing SKIP LOCKED explicitly does not promise: a worker's query can, and eventually will, pick a newer row and skip an older one that happens to be locked by someone else, so job age alone is not a strict guarantee of run order, only a rough one, and a system that truly needs strict first-in-first-out order per job type needs to check for that specifically rather than assume the ORDER BY delivers it under concurrency.</p>`,
        check: {
          question: 'A small internal tool uses a Postgres table with SKIP LOCKED as its job queue. Which of these is a real reason to eventually replace it with a dedicated broker or stream?',
          options: [
            'SKIP LOCKED cannot be used with more than one worker',
            'Postgres cannot store job payloads',
            'The job volume has grown past what one database can serve alongside its other traffic, or the system now needs several independent services each reading the same events',
            'SKIP LOCKED requires an external message broker to function at all'
          ],
          answer: 2,
          explain: 'SKIP LOCKED works fine with many workers on one database; the real limits are database throughput and the need for independent readers of the same events, which a single table cannot provide.'
        }
      },
      {
        id: 'qs-f7',
        part: 'field',
        title: 'DAG workflow orchestration',
        viz: 'dag-orchestration',
        body: `<p>A pipeline of dependent steps - extract data, wait for it to arrive, transform it, then load it, and only after that, train a model - is a <b>directed acyclic graph</b>, or DAG: a set of tasks, with dependencies between them, and no cycles, so a valid running order always exists. Tools like Airflow, Argo Workflows, and Temporal exist because running this by hand, or with a pile of cron jobs and shell scripts checking for each other's output files, gets unreliable fast once there are more than a handful of steps.</p>
<p>An orchestrator adds four things a plain script does not give you for free. It tracks which tasks have actually run and which have not, so a restart does not blindly redo everything, or worse, skip something that never ran. It retries a failed task automatically, with its own policy for how many times and how long to wait between attempts. It gives a single, visual record of what ran, when, and what failed, instead of stitching that story together from scattered logs. And it supports <b>backfill</b>: re-running the whole pipeline, or one step of it, over a past date range - useful after fixing a bug in a transform step that has been quietly producing wrong output for the last month.</p>
<p>None of that removes the need for each individual task to be <b>idempotent</b>: safe to run again with the same effect, since an orchestrator's retry, or a backfill, means "run this again" is something every task must expect and survive without corrupting its output. An orchestrator makes it easy to retry work; it does not make retrying safe on its own.</p>`,
        deeper: `<p>Airflow, Argo Workflows and Temporal differ mainly in how a task's state is represented: Airflow schedules independent tasks, typically each its own process, on a fixed schedule with the DAG mostly fixed at definition time; Argo Workflows runs each task as its own Kubernetes pod, fitting naturally into a container-native pipeline; Temporal represents an entire multi-step process as ordinary code that can pause, wait on external events, and resume exactly where it left off even after a crash, at the cost of a different programming model to learn. None of the three is universally right; the choice tracks whether the work is batch data pipelines, containerised jobs, or long-running stateful application logic.</p>`,
        check: {
          question: 'A backfill re-runs last month\'s pipeline after fixing a bug in one transform step. Why does this require every task in the pipeline to be idempotent, not just the fixed one?',
          options: [
            'It does not; only the fixed task needs to be idempotent',
            'Because the backfill re-runs the whole pipeline for that date range, so any task that already ran for those dates will run again, and a non-idempotent task would duplicate or corrupt its previous output',
            'Because Airflow requires all tasks to have identical code',
            'Because idempotency is only relevant to the first task in a DAG'
          ],
          answer: 1,
          explain: 'A backfill re-executes tasks that already succeeded once, not just the one that was fixed, so every task in the affected range needs to tolerate running again.'
        }
      },
      {
        id: 'qs-f8',
        part: 'field',
        title: 'Fan-out patterns',
        viz: 'fanout-write-vs-read',
        body: `<p><b>Fan-out on write</b> does the work of spreading one event to many places at the moment it happens: when a user posts, the post is immediately written into every follower's own precomputed feed, so reading a feed later is just reading one already-assembled list - fast reads, paid for with more write work up front, proportional to the number of followers.</p>
<p><b>Fan-out on read</b> defers that work: nothing is precomputed when a post is made, and a feed is assembled at read time by pulling recent posts from everyone the reader follows and merging them - cheap, single writes, paid for with more expensive reads, proportional to how many people the reader follows.</p>
<p>The <b>celebrity problem</b> is where this trade stops being a free choice: an account with a hundred million followers posting under fan-out on write means a hundred million feed writes for one post, which can saturate the write path and delay every other post going through it. Most large systems settle on a hybrid, fanning out on write for ordinary accounts and on read for the few very large ones. The realtime delivery and feeds chapter works the hybrid through in full; what matters here is that the queue carrying that fan-out is the thing that has to absorb the spike.</p>
<p><b>Notification fan-out</b> - sending a push notification, an email, or an in-app alert to every interested party for one event - is the same trade-off in a different form: precompute and send immediately, write-heavy but fast to consume, or maintain a list of who is interested and generate notifications on demand, read-heavy but cheaper to write.</p>`,
        deeper: `<p>The size of the trade-off is easy to underestimate without a number: for an account with 80 million followers, fan-out on write turns one post into 80 million individual writes. Even at a very fast 1 million writes per second across a whole fleet of machines - already an aggressive number for many systems - that single post's fan-out alone takes 80 seconds to complete, during which every other post competing for the same write capacity is delayed behind it.</p>`,
        check: {
          question: 'Why does a hybrid fan-out strategy - fan-out on write for most accounts, fan-out on read for a small number of very large accounts - make sense rather than picking one strategy for everyone?',
          options: [
            'Because fan-out on read is always faster than fan-out on write',
            'Because the two strategies trade write cost against read cost, and that trade only becomes dangerous at extreme follower counts, so most accounts are better served by the fast-read strategy while only the rare huge account needs the other',
            'Because a hybrid approach is required by convention',
            'Because fan-out on write cannot be implemented for accounts with any followers at all'
          ],
          answer: 1,
          explain: 'The celebrity problem only appears at extreme follower counts; below that, fan-out on write is simply the better trade, which is why systems switch strategy rather than pick one for everyone.'
        }
      },
      {
        id: 'qs-f9',
        part: 'field',
        title: 'Event contracts and schema evolution',
        body: `<p>Once more than one service reads the same stream, the structure of a message becomes a contract between teams who may never talk to each other directly, and changing it carelessly breaks a consumer nobody remembered still existed. <b>Avro</b> and <b>Protobuf</b> are the two formats built for this: both store data in a compact binary form with a real schema behind it, rather than a loosely structured JSON document any producer could accidentally reshape.</p>
<p>A <b>schema registry</b> is the service that makes this enforceable rather than a matter of hoping everyone remembers: producers register a schema for a topic, and every message is checked against a compatibility rule before it is accepted, so an incompatible change is rejected at write time, not discovered later when it silently corrupts a downstream consumer.</p>
<p><b>Backward compatibility</b> means a consumer running the new schema can still read data written with the old one - the safe direction when consumers are upgraded before producers. <b>Forward compatibility</b> means a consumer still running the old schema can read data written with the new one - the safe direction when producers are upgraded first. The changes that keep either promise are narrow and worth knowing exactly: adding a new field with a default value is safe both ways; removing a field that had a default is safe; renaming a field, or removing one with no default, breaks compatibility and needs a new schema version and a migration plan, not a quiet edit.</p>`,
        deeper: `<p>Protobuf and Avro differ in one detail that matters here: Protobuf identifies fields by a numbered tag rather than by name, so a field can be renamed in code without breaking on-wire compatibility as long as its number does not change - Avro, which matches fields by name, does not have that escape hatch, and a rename there is a breaking change regardless of intent.</p>`,
        check: {
          question: 'A producer adds a new required field with no default to a message schema. Consumers are upgraded to the new schema first, and they immediately fail to read the messages already sitting in the topic, which were written with the old schema. Which compatibility rule did this change break?',
          options: [
            'None; adding a field is always safe',
            'Forward compatibility only',
            'Backward compatibility: a consumer using the new schema has no value to fall back on for the new field when it reads a message written before that field existed',
            'This is a producer-side issue only and does not involve compatibility rules'
          ],
          answer: 2,
          explain: 'Backward compatibility is the promise that a consumer on the new schema can still read data written under the old one. A required field with no default breaks it, because there is nothing for the new consumer to use when that field is simply absent from an older message.'
        }
      }
    ],
    connect: null,
    activities: [
      {
        id: 'qs-a1',
        type: 'design',
        title: 'Design an inventory hold for a flash sale',
        prompt: `"We're running a flash sale: a fixed number of a limited item, and a huge burst of concurrent 'buy now' requests. Walk me through how you'd stop overselling - locking on the row, a queue, or a reservation model - and what you'd actually pick and why."`,
        timeboxSec: 1200,
        rubric: `Marking guide, out of 10. (1) Describes plain row locking or an atomic conditional update as a correct baseline, and explicitly names its weakness under this exact workload: it serializes access to one hot row at the moment concurrency is highest. (2) Describes a queue-based approach: routing purchase attempts through a queue with limited concurrency per item, avoiding lock contention on the database, and names its cost - added latency before the customer knows the outcome, and operational complexity. (3) Describes a reservation model: placing a short-lived hold on a unit at the start of checkout and releasing it if payment does not complete in a fixed window, giving the customer an honest answer up front. (4) States an actual recommendation rather than listing all three with no conclusion, and ties the choice to the flash-sale scenario specifically. (5) Notes that the reservation model still needs an atomic decrement underneath it to be correct, and a background sweep for expired holds. (6) Explicitly mentions idempotency for retried purchase attempts, given that a flash sale guarantees client retries and timeouts. (7) At least one trade-off is stated as a trade-off with both sides named, not asserted as free. Deduct for proposing only one approach with no comparison, or claiming any approach removes all contention on a single scarce resource. {{HONESTY}}`,
        model: `"For a flash sale on a fixed, small number of units, the core problem is that huge concurrency is aimed at one hot row, and I'd compare three approaches rather than jump straight to one.

Plain row locking - SELECT FOR UPDATE, or better, an atomic conditional update like UPDATE inventory SET stock = stock - 1 WHERE id = ? AND stock > 0 - is correct and simple, but it serializes every attempt against that one row exactly when concurrency is at its highest, so under real flash-sale load it becomes the bottleneck itself, with most requests waiting on the lock rather than failing fast.

Routing every purchase attempt through a queue with a single consumer per item avoids lock contention on the database entirely, since only one process ever touches that item's stock at a time, but it trades instant feedback for a short delay before the customer knows if they got the item, and it adds a whole extra system to build and operate for what might be a once-a-year event.

What I'd actually build is a reservation model: when a customer starts checkout, place a short-lived hold on one unit using that same atomic conditional decrement, give them a fixed window - say two minutes - to complete payment, and release the hold back to available stock automatically if payment doesn't complete in time. This gives customers an honest 'yes, you have a chance' the moment they start checkout instead of a race at final payment, and it still needs the atomic decrement underneath to be correct, plus a background job sweeping expired holds. I'd also make the checkout call idempotent on a client-generated request ID, since a flash sale guarantees a lot of retries from users refreshing and clients timing out."`
      },
      {
        id: 'qs-a2',
        type: 'explain',
        title: 'Choose between RabbitMQ and Kafka for a real case',
        prompt: `"Your team is deciding between RabbitMQ and Kafka for a new notification system: one event should trigger a push notification, an email, and an entry in an analytics pipeline. Which would you recommend, and what's the actual reasoning, not just 'Kafka is more scalable'?"`,
        timeboxSec: 480,
        rubric: `Must-haves: (1) identifies this as a case of one event needing multiple independent consumers, not a raw scalability question. (2) Recommends Kafka, or an equivalent event-stream broker, specifically because three independent consumer groups need the same event, each able to fail or lag without affecting the others. (3) Explicitly rejects "more scalable" as the reasoning and names the real distinguishing feature instead - independent consumer groups and replay. (4) Acknowledges RabbitMQ could technically fan out to three queues via an exchange, showing this isn't about raw capability, just about which model fits better. (5) Mentions retention and replay as a concrete, case-specific benefit, such as replaying missed events after a consumer outage. (6) States when a plain task queue would actually be the right call instead - a single consumer, one job, nothing else caring about the event. Deduct for choosing based on unexplained throughput or scale claims. {{HONESTY}}`,
        model: `"I'd go with Kafka here, but I want to be careful about why, because 'Kafka is more scalable' isn't actually the reason and I'd push back on it if a teammate said that.

The real structure of this problem is one event needing to reach three independent consumers - push, email, and analytics - each of which should be able to fail, retry, and even be down for a while without affecting the other two. That's exactly what an event stream with independent consumer groups gives you: each of those three becomes its own consumer group reading the same topic at its own pace, with its own offset, completely unaware of the other two. RabbitMQ can be made to fan out to three consumers too, using an exchange bound to three queues, so it's not that RabbitMQ literally can't do this - but Kafka's retention and replay give me something genuinely useful here: if the email service has a bug for six hours, I can fix it and replay those six hours of events once it's healthy, rather than having lost whatever wasn't delivered in that window.

If this were instead one job that needed to happen exactly once - say, just sending the push notification, full stop, nothing else caring about the event - I'd lean toward RabbitMQ or SQS instead, since a plain task queue is simpler to operate and reason about when there's genuinely only one consumer that matters. The deciding factor is the number of independent parties that need the same event, not raw scale."`
      },
      {
        id: 'qs-a3',
        type: 'drill',
        title: 'Practice: fix an ordering bug caused by the wrong partition key',
        prompt: `Practice problem. A payments consumer group has three consumers reading a Kafka topic partitioned by a random ID generated per event, not by customer ID. A customer's "card charged" and "card refunded" events, sent moments apart, are processed out of order, refunding a charge that hasn't been recorded yet. What's the fix, and why does it work?`,
        timeboxSec: 420,
        rubric: `Must-haves: (1) identifies the root cause correctly: partitioning by a random per-event ID scatters a given customer's events across partitions at random, and Kafka only guarantees order within one partition, so no ordering guarantee exists between the two events. (2) States the fix: partition by customer ID, or whichever entity needs order preserved, instead of a random value. (3) Explains why this works: events sharing a key hash to the same partition, and within one partition events are read in production order by the same consumer, restoring per-customer ordering without needing global ordering across the topic. (4) Optionally notes the trade-off: a very active customer's events all funnel through one partition, which could unbalance load slightly, but is usually the right trade for correctness. Deduct for proposing a global lock, an external sequencing service, or removing partitioning entirely, since a key-based partition choice solves the actual problem directly. {{HONESTY}}`,
        model: `"The bug is in the partition key, not in Kafka's guarantees - Kafka did exactly what it promises, which is order events within a partition, not across the whole topic. Keying each event by a random ID means the 'charged' and 'refunded' events for the same customer go to two different, unrelated partitions purely by chance, and Kafka gives no ordering promise between them.

The fix is to partition by the customer ID, or whichever entity actually needs its events in order, instead of a random value. Kafka hashes the key to choose a partition, so every event for the same customer consistently goes to the same partition, and within that one partition, order is exactly the order events were produced - the 'charged' event will always be read before the 'refunded' one for that customer.

The trade I'd flag: keying by customer ID means one very active customer's events all funnel through one partition, which could unbalance load slightly if that customer is unusually high-volume, but for payments correctness that's clearly the right trade to make. I wouldn't reach for a heavier fix like a global sequencer or removing partitioning - that throws away the whole reason to use partitions in the first place, when picking the right key solves the actual problem directly."`
      }
    ],
    sayQuestion: null,
    sayItOutLoud: null,
    readings: [
      { l: 'Video: Hussein Nasser - Kafka Consumer Group is a Brilliant Design Choice and We should Discuss it', u: 'https://www.youtube.com/watch?v=e5uAhoT1hhU', w: 'A clear, example-driven walk through why consumer groups are designed the way they are, from a channel known for explaining backend systems well.', m: 15 },
      { l: 'Confluent docs - Schema Evolution and Compatibility Types', u: 'https://docs.confluent.io/platform/current/schema-registry/fundamentals/schema-evolution.html', w: 'The exact backward and forward compatibility rules for Avro and Protobuf schemas, with the specific changes that are and are not safe.', m: 15 },
      { l: 'AWS docs - Amazon SQS visibility timeout', u: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html', w: 'The primary source for in-flight messages, visibility timeouts, and how a message ends up in a dead-letter queue.', m: 10 },
      { l: 'Confluent - Exactly-once Semantics is Possible: Here\'s How Apache Kafka Does It', u: 'https://www.confluent.io/blog/exactly-once-semantics-are-possible-heres-how-apache-kafka-does-it/', w: 'A precise, primary-source account of what "exactly-once" actually means inside Kafka and the mechanism behind it.', m: 15 },
      { l: 'Microsoft Azure Architecture Center - Idempotent Consumer pattern', u: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/idempotent-consumer', w: 'A vendor-neutral reference pattern for building the idempotent consumer this chapter leans on for effectively-once processing.', m: 10 },
      { l: 'Prisma - Build a Postgres Job Queue with SKIP LOCKED, No Redis', u: 'https://www.prisma.io/blog/you-dont-need-a-job-queue-postgres-already-has-skip-locked', w: 'A practical walkthrough of building a queue directly on Postgres with SKIP LOCKED, including where it starts to strain.', m: 12 },
      { l: 'Apache Airflow docs - Backfill', u: 'https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/backfill.html', w: 'The official mechanics of re-running a DAG over a past date range, straight from the tool most commonly used for it.', m: 8 },
      { l: 'System Design: Twitter/X News Feed - fan-out on write vs read, the celebrity problem', u: 'https://www.techinterview.org/post/3233474168/system-design-twitter-news-feed-timeline-fanout-on-write-fanout-on-read-celebrity-problem-ranking-caching/', w: 'A worked walkthrough of the exact fan-out trade-off and hybrid solution this chapter describes, with concrete follower-count numbers.', m: 15 }
    ],
    glossary: [
      {
        g: 'Queues, streams and asynchronous work',
        sub: '',
        rows: [
          ['Consumer group', 'A set of consumers sharing a topic, with each partition read by exactly one member at a time', 'Kafka internals'],
          ['Offset', 'A consumer\'s position in one partition; committing it marks everything before it as done', 'Kafka internals'],
          ['Partition', 'One ordered, independent slice of a stream, the unit Kafka guarantees order within', 'Kafka internals'],
          ['Retention', 'How long a stream keeps events regardless of whether every consumer has read them', 'event streams'],
          ['Idempotent consumer', 'A consumer where processing the same message twice has the same effect as processing it once', 'delivery guarantees'],
          ['At-least-once delivery', 'A message may arrive more than once but is never silently dropped', 'delivery guarantees'],
          ['Dead-letter queue', 'Where a message goes after failing processing repeatedly, so it stops blocking the main queue', 'backpressure'],
          ['Poison message', 'A message that will never process successfully no matter how many times it is retried', 'backpressure'],
          ['Lease', 'A time-limited claim on a piece of work, reassignable if it expires unrenewed', 'schedulers'],
          ['SKIP LOCKED', 'A clause letting a query skip rows already locked by another transaction, instead of waiting', 'Postgres queues'],
          ['DAG', 'A set of tasks with dependencies and no cycles, so a valid run order always exists', 'orchestration'],
          ['Backfill', 'Re-running an orchestrated pipeline over a past date range, usually after a bug fix', 'orchestration'],
          ['Fan-out on write', 'Spreading one event to every interested party immediately, at write time', 'fan-out patterns'],
          ['Fan-out on read', 'Assembling the result from sources at read time instead of precomputing it', 'fan-out patterns'],
          ['Schema registry', 'A service that checks a message schema against compatibility rules before accepting it', 'event contracts']
        ]
      }
    ]
  };

}(typeof window !== 'undefined' ? window : this));
