/* sd-data: two system design chapters, relational databases and NoSQL/sharding/distributed IDs. */
(function (root) {
  'use strict';
  root.PREP_CORE = root.PREP_CORE || {};

  root.PREP_CORE['sql-databases'] = {
    id: 'sql-databases',
    title: 'Relational databases',
    level: 'danger',
    levelLabel: 'Asked in almost every system design interview.',
    why: `Almost every system design interview reaches the data layer, and the relational database is still the default answer, so the interviewer is checking whether you can turn a vague requirement into a schema, an index plan, and a story for what happens when two requests touch the same row at once. They are listening for the difference between reciting the letters ACID and actually knowing which isolation level you get by default and what it does not protect you from. They also want to hear that you know how a single database survives a crash and how it scales past one machine, because that is where a memorised answer runs out of things to say.`,
    learn: [
      {
        id: 'sql-0',
        part: 'field',
        title: 'Key terms',
        body: `<ul>
<li><b>Table, row, column.</b> A table holds rows of the same shape; each row is one record; each column is one named field of it.</li>
<li><b>Primary key.</b> The column, or set of columns, that identifies one row uniquely. An <b>order_id</b> column is a typical primary key for an orders table.</li>
<li><b>Foreign key.</b> A column that holds the primary key of a row in another table, linking the two. An order's <b>customer_id</b> column pointing at a row in a customers table is a foreign key.</li>
<li><b>Schema.</b> The set of tables, columns, types and constraints that define the shape of the data.</li>
<li><b>Normalisation.</b> Organising a schema so each fact is stored in exactly one place, to avoid the same fact going out of sync when it is updated in one row but not another.</li>
<li><b>Index.</b> A structure built on one or more columns that lets the database find matching rows without reading every row. Paid for with slower writes and extra storage.</li>
<li><b>B-tree.</b> The balanced tree structure most relational indexes use: every path from the root to a leaf is the same length, so a lookup takes a small, predictable number of steps even over billions of rows.</li>
<li><b>Composite index.</b> An index built on more than one column, in a fixed order.</li>
<li><b>Covering index.</b> An index that already holds every column a query needs, so the database never has to fetch the full row.</li>
<li><b>Query planner (optimizer).</b> The part of the database that decides how to execute a query - which indexes to use, which order to join tables in - based on estimated row counts and cost.</li>
<li><b>EXPLAIN.</b> The SQL command that shows the plan the optimizer chose, without running the query. Adding <b>ANALYZE</b> makes it actually run the query too, and report the real row counts and timings next to the estimates.</li>
<li><b>Table scan (sequential scan).</b> Reading every row in a table, because no index fits the query or because reading all of it is actually cheaper.</li>
<li><b>Transaction.</b> A group of reads and writes that commits together or not at all.</li>
<li><b>ACID.</b> ACID is short for the four properties a transaction is supposed to guarantee: atomicity (all of a transaction's writes happen or none do), consistency (the database's own rules and constraints are never violated), isolation (concurrent transactions do not corrupt each other's view of the data), durability (once committed, a write survives a crash).</li>
<li><b>Isolation level.</b> How much one transaction is allowed to see of another transaction's uncommitted or concurrently committed work. The SQL standard names four: read uncommitted, read committed, repeatable read, serializable.</li>
<li><b>Lock.</b> A claim a transaction holds on a row or table that blocks other transactions from conflicting operations until it is released. A <b>shared lock</b> allows other readers; an <b>exclusive lock</b> allows nobody else in.</li>
<li><b>Deadlock.</b> Two transactions each waiting on a lock the other holds, so neither can proceed; the database detects this and aborts one of them.</li>
<li><b>Lost update.</b> Two transactions each read a value, compute a new value from it, and write it back; the second write overwrites the first, and the first transaction's change is silently gone.</li>
<li><b>Dirty read, non-repeatable read, phantom read.</b> Three anomalies that isolation levels are defined by: seeing another transaction's uncommitted write; re-reading the same row twice in one transaction and getting a different value; re-running the same filtered query twice in one transaction and getting a different set of rows.</li>
<li><b>MVCC (multi-version concurrency control).</b> Keeping several versions of a row so that readers can see a consistent snapshot without blocking writers, and writers do not block readers.</li>
<li><b>Write-ahead log (WAL).</b> A log of every change, written and flushed to disk before the change is applied to the actual data files, so a crash can never lose an acknowledged write.</li>
<li><b>Checkpoint.</b> A point the database records showing that everything before it in the log is safely reflected in the data files, so crash recovery only has to replay the log after that point.</li>
<li><b>Connection pool.</b> A small set of open database connections that many application threads share, instead of opening a new one per request.</li>
<li><b>Read replica.</b> A copy of the database kept up to date from the primary, used to serve reads and take load off the primary.</li>
<li><b>Replication lag.</b> How far behind the primary a replica's data currently is.</li>
<li><b>Partitioning.</b> Splitting one logical table's storage into pieces, by row (<b>horizontal</b>) or by column (<b>vertical</b>); it can happen on one server or be spread across several, and "sharding" is the name usually used when the pieces sit on separate servers.</li>
<li><b>Migration.</b> A change to the schema, applied to a running database without an unacceptable interruption.</li>
<li><b>Soft delete.</b> Marking a row as deleted with a flag or timestamp instead of removing it, so the row can still be found, audited or restored.</li>
</ul>`,
        deeper: `<p>Most of these words describe trade-offs, not rules. An index trades write speed for read speed; a looser isolation level trades correctness guarantees for concurrency; a read replica trades freshness for read capacity. Interviewers are rarely checking whether you know the definition - they are checking whether you can say which side of the trade-off your situation needs and why, because that is what separates a memorised glossary from someone who has actually reasoned about a live database.</p>`,
        check: {
          question: 'What is the actual difference between partitioning and sharding, as the terms are usually used?',
          options: [
            'Partitioning is for reads and sharding is for writes',
            'They are unrelated techniques',
            'Both split a table into pieces by row or column; "sharding" is the common name when those pieces live on separate database servers rather than one',
            'Sharding only applies to NoSQL databases'
          ],
          answer: 2,
          explain: 'Partitioning is the general idea of splitting a table\'s storage into pieces. Sharding is the same idea applied across separate servers, most often to scale writes past what one machine can hold.'
        }
      },
      {
        id: 'sql-f1',
        part: 'field',
        title: 'Schema design and normalisation',
        body: `<p>A schema is the structure you commit the rest of the system to. Get it wrong and every later feature pays a small tax; get it right and most later features are a straightforward join.</p>
<p><b>Why normalise.</b> Suppose an orders table stores <code>customer_name</code> and <code>customer_address</code> directly on every order row, instead of a <code>customer_id</code> pointing at a customers table. The customer's address is now copied onto every one of their orders. When they move, you must update every row, and if you miss one, two orders for the same customer now disagree about where they live. That disagreement is an <b>update anomaly</b>, and it is the actual problem normalisation solves: each fact lives in exactly one place, so it cannot go out of sync with itself.</p>
<p><b>The normal forms, in plain terms.</b> <b>First normal form</b> asks for atomic columns - no comma-separated list of phone numbers stuffed into one field, because you cannot index, filter or join on one item inside it. <b>Second normal form</b> asks that every non-key column depend on the whole primary key, not part of it; it matters when a key is composite, such as (order_id, product_id) on an order-line table, and a column like <code>product_name</code> only depends on <code>product_id</code> - that column belongs on the products table, not repeated on every line. <b>Third normal form</b> asks that non-key columns depend only on the key, not on each other; a <code>tax_rate</code> that is really a function of <code>customer_country</code> should not be stored again next to the country on the same row, because now two columns can disagree about what the country implies.</p>
<p><b>A functional dependency</b> is just that idea named: column A determines column B if every row with the same A always has the same B. Wherever you find one, ask whether B belongs on a different table keyed by A instead of repeated wherever A appears.</p>
<p><b>When to denormalise on purpose.</b> Normalisation optimises for correct, cheap writes; it does not optimise for reads, because a normalised schema often needs several joins to answer one question. When a read path is hot and the joined tables rarely change, copying a value onto the row that needs it - a product's name onto an order line, taken at order time - is a deliberate, documented trade: faster reads, and an explicit decision about what happens if the source value later changes. Say which one you are choosing and why; do not drift into it by accident.</p>`,
        deeper: `<p>A useful discipline: name the functional dependencies in your schema out loud before you draw the tables. "An order line's product name depends only on the product, not on the order" is a sentence you can say in an interview, and it is exactly third normal form without needing the term. Interviewers care more about whether you can spot the dependency in a concrete example than whether you can recite 1NF, 2NF, 3NF from memory.</p>`,
        check: {
          question: 'An orders table stores customer_email directly on every order row. A customer changes their email, and one old order still shows the previous address. What is this an example of?',
          options: [
            'A phantom read',
            'A normal, expected consequence of using a relational database',
            'An update anomaly: the same fact (the customer\'s email) is copied in more than one place, and an update to one copy left the others out of sync',
            'A missing index'
          ],
          answer: 2,
          explain: 'Storing a customer fact on every one of their orders duplicates it. Normalising it into a customers table referenced by customer_id stores the fact once, so an update can never leave a stale copy behind.'
        }
      },
      {
        id: 'sql-f2',
        part: 'field',
        title: 'Indexes: B-tree, composite, covering, and when one hurts',
        viz: 'btree-index',
        body: `<p>An index is a separate, ordered structure that maps a column's values to the rows that have them, so the database can find matches without reading the whole table. Almost every relational database builds this structure as a <b>B-tree</b>.</p>
<p><b>Why a B-tree.</b> It is a balanced tree: every leaf is the same distance from the root, and each node holds many keys - often a few hundred, sized to fit one disk page - so the tree stays shallow even as rows grow into the billions. With a branching factor in the low hundreds, a table with a billion rows is typically only four or five levels deep, so a lookup costs four or five page reads instead of scanning the table. The leaf pages are also linked in sorted order, which is what makes a <b>range query</b> (<code>WHERE created_at BETWEEN ...</code>) fast: find the start with one descent, then walk the linked leaves forward.</p>
<p><b>Composite indexes.</b> An index can cover more than one column, in a fixed order - for example (customer_id, created_at). It helps a query that filters on customer_id alone, or on customer_id and created_at together, because both use the index's leading column as a prefix. It does <b>not</b> help a query that filters on created_at alone, because the index is sorted by customer_id first; that is the <b>leftmost-prefix rule</b>, and it is the single most common reason a composite index "isn't being used."</p>
<p><b>Covering indexes.</b> If an index already contains every column the query needs - in its key or as extra stored columns - the database can answer the query straight from the index and skip fetching the full row entirely. This is the fastest kind of index lookup there is, and it is worth deliberately widening an index to cover a hot query.</p>
<p><b>When an index hurts.</b> Every index the database maintains is extra work on every insert, update and delete, plus extra storage; a table with ten indexes pays that cost ten times per write. An index on a low-cardinality column (a boolean, a status with three values) rarely helps, because the planner would still have to visit a large fraction of the table. Wrapping the indexed column in a function or expression in the query (<code>WHERE LOWER(email) = ...</code>) stops most databases from using a plain index on <code>email</code> at all, unless you index the expression itself. And an index that no query actually uses is pure cost with no benefit, which is why a healthy review question is: which query is this index for? The answer should be a specific statement in production, with a filter and a sort order, not a guess. If nobody can name one, check the database's own index usage statistics, which record how many times each index has been read since the counters were last reset. An index with no named query and no recorded reads is a candidate for removal, and dropping it gives back both write time and storage. The safe way to do that is to disable or hide the index first, watch for a week, and drop it only if nothing got slower.</p>`,
        deeper: `<p>The leftmost-prefix rule generalises: an index on (a, b, c) can serve a query on a, on (a, b), or on (a, b, c), because each is a prefix of the sorted order, but not a query on b alone or on c alone, because within a fixed value of a the rows are only sorted by b, and there is no global order on b by itself. Put the column with the most selective, most frequently filtered value first if you are not also relying on it for sorting; put the column you sort by last if the query also needs an ORDER BY, so the index's own order satisfies the sort for free.</p>`,
        check: {
          question: 'A table has a composite index on (customer_id, created_at). A query filters only on created_at, with no condition on customer_id. What happens?',
          options: [
            'The database uses the index efficiently because created_at is part of it',
            'The index cannot help this query, because created_at is not the leading column, so a query on it alone cannot use the sorted order the index provides',
            'The database automatically builds a second index',
            'The query fails'
          ],
          answer: 1,
          explain: 'A composite index is sorted by its leading column first. Without a condition on customer_id, the rows for any given created_at value are scattered across the whole index, so it cannot narrow the search the way it can when customer_id is also filtered.'
        }
      },
      {
        id: 'sql-f3',
        part: 'field',
        title: 'Query planning: reading EXPLAIN',
        body: `<p>The query planner turns a SQL statement into an actual sequence of steps - which index, if any, to use for each table; which order to join tables in; whether to sort before or after filtering. It picks by estimating the cost of each option, using statistics it keeps about the table: roughly how many rows there are, how many distinct values a column has, and how the values are distributed.</p>
<p><b>Reading a plan.</b> <code>EXPLAIN</code> shows the plan without running the query; <code>EXPLAIN ANALYZE</code> actually runs it and shows the real numbers next to the estimates. What to look for is a tree of nodes, read from the innermost outward: a leaf node is usually a <b>sequential scan</b> (read every row) or an <b>index scan</b> (walk an index, then fetch each matching row) or an <b>index-only scan</b> (the index alone has everything needed, a covering index in action); above those sit join nodes - a <b>nested loop</b> (for each row on one side, look up matches on the other; good when one side is small), a <b>hash join</b> (build a hash table of one side, probe it with the other; good for large, roughly equal-sized sides with no useful index), or a <b>merge join</b> (walk both sides in sorted order together; good when both are already sorted, often by an index). Each node reports an estimated row count and cost; with ANALYZE it also reports the actual row count and actual time.</p>
<p><b>What actually goes wrong.</b> The single most common real-world cause of a query "suddenly getting slow" is that the planner's estimate and reality have drifted apart - the table's statistics are stale after a large load or delete, so the planner picks a plan that would be right for the old row counts and is badly wrong for the new ones. The fix is to refresh statistics (most databases do this automatically on a schedule, and it can be forced). The second most common cause is a missing or unusable index, visible in the plan as a sequential scan where you expected an index scan. And sometimes the planner is simply right that a sequential scan is cheaper - for a query that will touch most of the table anyway, walking an index and then fetching each row can cost more than just reading the table straight through.</p>`,
        deeper: `<p>A concrete way to spot a stale-statistics problem in EXPLAIN ANALYZE output: compare the estimated row count against the actual row count at each node. If the plan estimated 40 rows and a nested loop join over them, but the query actually produced 400,000, the plan chosen for "a handful of rows" is now running for "four hundred thousand rows," and a nested loop that was cheap at the small estimate becomes catastrophic at the real size. That mismatch, not the query's SQL, is usually the actual bug.</p>`,
        check: {
          question: 'A query that used to take ten milliseconds now takes four seconds after a large bulk delete, with no code change. EXPLAIN shows a nested loop join the planner chose based on an estimate of a few hundred rows, but the actual row count is now in the millions. What is the most likely fix?',
          options: [
            'Add more RAM to the database server',
            'Rewrite the query to avoid joins entirely',
            'Refresh the table statistics so the planner\'s row-count estimate reflects reality and it can choose a better join plan',
            'Switch the isolation level to serializable'
          ],
          answer: 2,
          explain: 'A bulk delete changes the table\'s size and distribution. Until statistics are refreshed, the planner keeps costing plans against the old numbers, and a plan that is efficient for a small estimate can be disastrous at the real size.'
        }
      },
      {
        id: 'sql-f4',
        part: 'field',
        title: 'Transactions and ACID',
        body: `<p>A transaction groups one or more reads and writes so they take effect together or not at all. It starts with <code>BEGIN</code>, and ends with either <code>COMMIT</code> (keep everything) or <code>ROLLBACK</code> (discard everything since it began). A <b>savepoint</b> marks a point inside a transaction you can roll back to without discarding the whole thing.</p>
<p><b>Atomicity.</b> All of a transaction's writes happen, or none do. If a transfer debits one account and credits another, and the process crashes between the two, atomicity is what guarantees the database comes back showing either both writes or neither - never just the debit.</p>
<p><b>Consistency.</b> The database's own declared rules - constraints, foreign keys, uniqueness - are never left violated by a committed transaction. This is a narrower promise than it sounds: it protects rules you told the database about, not every invariant your application cares about that you never expressed as a constraint.</p>
<p><b>Isolation.</b> Concurrent transactions behave, from each one's point of view, close to as if they ran one after another rather than interleaved. How close is a dial, not a single guarantee, and it is the subject of the next section - it is the letter in ACID that actually has levels.</p>
<p><b>Durability.</b> Once a transaction has committed, its effect survives a crash immediately afterward. This is what the write-ahead log exists to provide, and it is covered on its own further down, because the mechanism is worth seeing in detail.</p>
<p>The reason ACID is asked about constantly, and reasoned about badly just as often, is that people treat it as one guarantee when it is really four separable ones, and the interesting engineering questions live in the gaps between them - specifically, in exactly how strong "isolation" is by default, which the next section covers directly.</p>`,
        deeper: `<p>Consistency is the letter most often misunderstood, because the word is overloaded across this whole subject: the CAP theorem's (Consistency, Availability, Partition tolerance; see <a href="#distributed-coordination">Distributed coordination</a>) "consistency" is about whether every reader sees the same, most recent write; ACID's "consistency" is about whether the database's own rules stay satisfied. They are different claims about different things, and a system can have one without the other - a single-node database with strict ACID consistency says nothing at all about CAP, because CAP only applies once there is more than one node and a network between them.</p>`,
        check: {
          question: 'A transfer transaction debits one account and credits another. The process crashes after the debit is written but before the credit is. What does atomicity guarantee about the state after the crash?',
          options: [
            'The debit is kept and the credit is applied on the next request automatically',
            'On recovery, the transaction is treated as never having committed, so neither the debit nor the credit is left in place',
            'The database will show only the debit, and an operator must manually apply the credit',
            'Atomicity does not apply to crashes, only to application errors'
          ],
          answer: 1,
          explain: 'Atomicity means a transaction takes effect entirely or not at all. Since it never reached COMMIT, recovery rolls it back completely, leaving neither half-applied write in place.'
        }
      },
      {
        id: 'sql-f5',
        part: 'field',
        title: 'Locking and isolation levels: read committed, repeatable read, serializable',
        viz: 'isolation-anomalies',
        body: `<p>Isolation is a dial, and the SQL standard names four settings for it, from loosest to strictest: <b>read uncommitted</b>, <b>read committed</b>, <b>repeatable read</b>, <b>serializable</b>. Each stronger level prevents one more of three named anomalies.</p>
<p><b>The three anomalies.</b> A <b>dirty read</b> is seeing another transaction's write before it commits - if that transaction then rolls back, you saw a value that never really existed. A <b>non-repeatable read</b> is reading the same row twice inside one transaction and getting two different answers, because another transaction committed a change to it in between. A <b>phantom read</b> is running the same filtered query twice inside one transaction and getting a different set of rows, because another transaction inserted or deleted a matching row in between.</p>
<p><b>What each level stops.</b> Read uncommitted stops nothing (and most production databases do not really implement it separately - they treat it as read committed). <b>Read committed</b> stops dirty reads: you only ever see committed data, but a second read in the same transaction can still see a different, newer committed value. <b>Repeatable read</b> also stops non-repeatable reads: every read inside the transaction sees the same snapshot, taken at the start. <b>Serializable</b> additionally stops phantom reads and every other anomaly, by making the database behave as if transactions ran one at a time - usually enforced by detecting conflicts and forcing one transaction to retry rather than by literally running everything sequentially.</p>
<p><b>Read committed is the default</b> in most widely used engines (PostgreSQL, Oracle, SQL Server), which is worth stating plainly in an interview, because it means "the database handles it" is not actually true unless you asked for more.</p>
<p><b>The lost update, concretely.</b> Transaction A reads a balance of 100. Transaction B also reads 100. A computes 100 - 30 = 70 and writes it. B computes 100 - 50 = 50 and writes it, overwriting A's write. The balance is now 50, but two withdrawals of 30 and 50 should have left it at 20 - one withdrawal vanished. Read committed does not prevent this, because each read individually saw committed data; the problem is between the read and the write, not within either read. Two real fixes: an atomic statement (<code>UPDATE accounts SET balance = balance - 30 WHERE id = ...</code>, which never reads a value into the application in between) or an explicit row lock taken at read time (<code>SELECT ... FOR UPDATE</code>), which blocks the second transaction's read until the first commits.</p>
<p><b>Locking underneath.</b> A <b>shared lock</b> lets other readers in but blocks writers; an <b>exclusive lock</b> blocks everyone. Two transactions that each hold a lock the other needs produce a <b>deadlock</b>; the database detects the cycle and aborts one side, which the application must be ready to retry.</p>`,
        deeper: `<p>There is a real subtlety worth having ready: PostgreSQL's repeatable read is implemented as snapshot isolation, which happens to prevent phantom reads in the everyday sense described above, without being full serializable. What it still permits is <b>write skew</b>: two transactions each read a value the other is about to change, and each independently makes a decision that was only valid because the other's write had not happened yet - two on-call engineers each check "am I the last one on call" and both go off duty, because neither saw the other's read. Serializable is the level that closes this, at the cost of retries under contention.</p>`,
        check: {
          question: 'Under the read committed isolation level (the default in most databases), which of these is still possible?',
          options: [
            'A dirty read of another transaction\'s uncommitted write',
            'A lost update, where two transactions each read a value, compute independently, and one write silently overwrites the other',
            'Seeing a table that does not exist',
            'A transaction committing only half its writes'
          ],
          answer: 1,
          explain: 'Read committed stops dirty reads by only showing committed data, but it does nothing about the gap between a read and a later write in the same transaction - that gap is exactly where a lost update happens.'
        }
      },
      {
        id: 'sql-f6',
        part: 'field',
        title: 'MVCC: how readers and writers stop blocking each other',
        viz: 'mvcc-versions',
        body: `<p>The oldest way to give transactions isolation is locking: a reader takes a shared lock, a writer takes an exclusive lock, and anyone who conflicts waits. That works, but it means writers block readers and readers can block writers - exactly the throughput cost you would want to avoid on a busy table. <b>Multi-version concurrency control</b> is the alternative most modern relational databases use instead.</p>
<p><b>The idea.</b> A write never overwrites a row in place. It creates a new version of the row, tagged with the id of the transaction that created it, and leaves the old version in place, tagged as superseded by that transaction. A reader does not take a lock at all; it simply asks for the version of each row that was current as of some point in time - the start of its transaction, for repeatable read, or the start of its current statement, for read committed - and the database hands back exactly that version, ignoring anything written after. Because a reader is reading an already-written, immutable version, it never has to wait for a writer, and a writer creating a new version never has to wait for a reader who is still looking at an old one.</p>
<p><b>What still needs a lock.</b> MVCC solves read-versus-write contention, not write-versus-write contention. Two transactions trying to create a new version of the <i>same</i> row at the same time still have to be serialized somehow - one waits, or one is told its write conflicts and must retry - because there is no way to have two "next" versions of one row.</p>
<p><b>The cost: old versions have to go somewhere.</b> Every update leaves behind an old version that some already-running transaction might still need to read from its own snapshot. Once every transaction that could possibly need it has finished, the old version is dead weight, and a background process reclaims it - PostgreSQL's is called <code>VACUUM</code>. Skip this for too long, and a table accumulates dead versions it no longer needs, a problem usually called table bloat, which slows down both scans and the eventual cleanup itself.</p>`,
        deeper: `<p>This is also the mechanical reason repeatable read is nearly free in an MVCC database, where it can be genuinely expensive under pure locking: the transaction is not holding anything that blocks other transactions, it is simply pinned to reading one consistent set of versions throughout its life. The price is paid later and elsewhere, by whichever process has to keep those old versions around until nobody needs them and then clean them up.</p>`,
        check: {
          question: 'Under MVCC, why can a long read-only transaction slow down an unrelated part of the database, even though it never blocks a writer directly?',
          options: [
            'It holds a lock on the whole table',
            'Its snapshot may still need old row versions that a busy table keeps producing, so those versions cannot be cleaned up until the long transaction finishes, and the accumulation slows down scans and cleanup',
            'MVCC does not support read-only transactions',
            'It forces every writer to switch to serializable isolation'
          ],
          answer: 1,
          explain: 'MVCC avoids blocking by keeping old versions around for existing snapshots. A long-lived transaction extends how long those versions must be kept, and on a busy table that can mean a large backlog of dead versions waiting on one slow reader.'
        }
      },
      {
        id: 'sql-f7',
        part: 'field',
        title: 'The write-ahead log and crash recovery',
        viz: 'wal-recovery',
        body: `<p>Durability - the promise that a committed write survives a crash - would be expensive to provide by flushing every changed data page to disk on every commit, because data pages are scattered across a file and a flush to a random location is slow. The <b>write-ahead log</b> gets the same guarantee far more cheaply.</p>
<p><b>How it works.</b> Before any change is applied to the actual data pages, a compact record describing that change is appended to the log, and the log is flushed to durable storage with an <code>fsync</code> call - the operating system request that says "do not return until these bytes are genuinely on the disk, not merely in a buffer." Only after that flush succeeds is the transaction told it has committed. The data pages themselves are updated in memory and written back to disk later, in whatever order is efficient, because the log is now the source of truth for what happened. Writing the log is fast specifically because it is a pure sequential append to one file, which is close to the best case for a disk, versus scattered writes across many data pages, which is close to the worst case.</p>
<p><b>Checkpoints.</b> Over time the log grows without bound if nothing ever marks progress. A checkpoint records that everything logged before this point has now actually been written into the data files, so recovery never needs to look earlier than the most recent checkpoint.</p>
<p><b>Crash recovery.</b> On restart after a crash, the database replays the log forward from the last checkpoint - this is called <b>redo</b> - reapplying every logged change to reconstruct the data pages exactly as they should have been. Afterward, any transaction that was still in progress at the moment of the crash, never having reached commit, is rolled back - <b>undo</b> - so its partial writes disappear. The result is a database that looks exactly as if every committed transaction happened and no uncommitted one did, which is precisely the durability and atomicity guarantees ACID promises, delivered by one mechanism.</p>
<p><b>What else the log is used for.</b> The same stream of logged changes can be shipped to another machine and replayed there continuously, which is how most relational replication works, and it can be archived and replayed up to any past point in time for point-in-time recovery from a backup.</p>`,
        deeper: `<p>The sequencing is the entire trick, and it is worth being able to say precisely: the log record must be flushed before the commit is acknowledged, not before the data page is written. The data page can lag behind for as long as it likes, because the log alone is enough to reconstruct it after a crash. Get the order backward - acknowledge the commit before the log is durably flushed - and a crash in that narrow window loses a write the client was told had succeeded, which is exactly the durability failure the whole mechanism exists to prevent.</p>`,
        check: {
          question: 'Why is a write-ahead log usually faster than flushing every changed data page to disk on each commit?',
          options: [
            'The log is smaller so it compresses better',
            'The log is written as a sequential append to one file, which is fast, while data pages are scattered across a file and flushing them is many slow, random writes',
            'The log does not need to be flushed at all',
            'The log only records reads, not writes'
          ],
          answer: 1,
          explain: 'Sequential appends are close to the cheapest possible disk operation. The log captures durability with one cheap sequential flush per commit, deferring the scattered, expensive data-page writes to whenever is convenient.'
        }
      },
      {
        id: 'sql-f8',
        part: 'field',
        title: 'Scaling a relational database',
        viz: 'read-replicas-lag',
        body: `<p>A single relational database instance runs out of capacity in a fairly predictable order, and it helps to know which fix addresses which symptom.</p>
<p><b>Connection pooling</b> is usually the first limit, and it is easy to miss because it looks like a code problem rather than a scaling one. Each open connection costs the database memory and, in most engines, a dedicated backend process or thread, so a fleet of application replicas each opening many connections can exhaust the database's connection limit long before its CPU is under any real pressure. A connection pool - a fixed, small number of connections shared across requests, often via a dedicated proxy sitting in front of the database - removes the per-request handshake cost and, just as importantly, caps how much concurrency the database is actually asked to handle.</p>
<p><b>Read replicas</b> add read capacity once connections and indexes are not the bottleneck. A replica applies the primary's write-ahead log continuously, so it is always slightly behind; how far behind is <b>replication lag</b>, and it is a number, not a guarantee - it can be milliseconds under light load and grow to seconds or worse under a burst of writes or a slow network link. The trap this creates: a request that writes and then immediately reads its own write, if that read is routed to a replica, can see the old value. The fix is either to route that specific read back to the primary, or to use a "read your own writes" guarantee some drivers and proxies provide, which pins a client to the primary for a short window after it writes.</p>
<p><b>Partitioning within one database</b> - native table partitioning by range or hash, splitting one table's storage into pieces the query planner can prune - helps once a single table's size, not the whole instance's load, is the constraint. It is a change to storage layout with no change to which server holds the data.</p>
<p><b>Sharding across several database instances</b> is the step that actually changes how the application talks to its data, because a single query can no longer assume the whole table is in one place. It solves write throughput past what one primary can sustain, at the cost of losing easy cross-shard transactions and joins. It is usually the last option reached for, specifically because it is the hardest one to reverse.</p>`,
        deeper: `<p>The read-your-writes trap is worth a second look, because it is the single most common production bug caused by read replicas. It typically shows up as an intermittent, hard-to-reproduce report: "I just saved this and it's showing the old value" - reproducible only when the request happens to hit a replica that has not yet caught up, which makes it look random even though the cause, replication lag on one specific read path, is completely deterministic once you know to check the lag metric.</p>`,
        check: {
          question: 'A service adds several read replicas. Soon after, users occasionally report that a change they just saved does not show up when they immediately reload the page. What is the most likely cause?',
          options: [
            'The connection pool is too small',
            'The reload request is being routed to a read replica that has not yet caught up with the write, which was applied to the primary',
            'The write-ahead log is corrupted',
            'The index on the updated column is missing'
          ],
          answer: 1,
          explain: 'This is the classic read-your-writes problem: replication lag means a replica can briefly lag behind the primary, and a read routed there right after a write can show the pre-write value.'
        }
      },
      {
        id: 'sql-f9',
        part: 'field',
        title: 'Safe change: online migrations, soft delete, and ticket servers',
        body: `<p>Three small, frequently asked patterns for changing a live schema and a live table without breaking whoever is reading and writing it right now.</p>
<p><b>Why a schema change can be dangerous.</b> Some changes - adding a nullable column, adding an index concurrently in databases that support it - are cheap and do not block anything. Others - adding a column with a default value that must be written into every existing row, or changing a column's type - can require rewriting the entire table, and on a large table that rewrite can hold a lock long enough to stall every other query against it, which in a live system looks exactly like an outage.</p>
<p><b>The safe pattern: expand, migrate, contract.</b> Add the new column or table alongside the old one, so both forms exist at once. Update the application to write both the old and new forms. Backfill the new form for existing rows in small batches, so no single operation locks the table for long. Switch reads over to the new form once the backfill is complete and verified. Only then remove the old column or table. Each step is small, reversible, and leaves the system in a working state if you stop partway - which is the actual point, since a migration that must complete in one uninterrupted step is a migration that turns any mid-way failure into an incident.</p>
<p><b>Tools that automate this for MySQL</b> - gh-ost and pt-online-schema-change are the well-known ones - follow the same pattern at the row level: create a shadow table with the new structure, copy existing rows across in small batches while tailing the ongoing changes (via the binary log, the database's own ordered record of every change, or via triggers, depending on the tool) so the shadow table stays current, and finally swap the shadow table in for the original in one quick rename, once the two are confirmed to match.</p>
<p><b>Soft delete.</b> Instead of a <code>DELETE</code>, set a <code>deleted_at</code> timestamp (or a boolean flag) and leave the row in place. This keeps the row available for an audit trail, an "undo" window, and any other row that still holds a foreign key pointing at it. The cost is that every query against the table must now remember to filter out soft-deleted rows, and any index that is meant to serve the common case efficiently should generally include the flag, or exclude deleted rows via a partial index, so that a mountain of soft-deleted history does not silently slow down every live query.</p>
<p><b>Ticket servers.</b> A small, dedicated table or service whose only job is handing out unique, ordered numbers - typically a single-row table with an auto-incrementing counter, updated with <code>UPDATE ... RETURNING</code> or an equivalent atomic increment. It was the standard way to generate a globally unique id before UUIDs (universally unique identifiers - long, randomly generated ids with no coordination needed between machines; see <a href="#nosql-partitioning-ids">NoSQL, sharding and IDs</a>) and Snowflake-style generators became common, and it still shows up wherever an application needs a strictly ordered sequence rather than a merely unique one. Its own limit is exactly the one it was built to avoid for everything else: it is one row, so it is one point of write contention, which is the problem the next chapter's distributed id generators exist to remove.</p>`,
        deeper: `<p>The expand-migrate-contract pattern generalises well past schema changes - it is the same pattern as changing an API's contract, or moving a feature from one storage system to another: add the new path beside the old one, dual-write or dual-read to build confidence, cut traffic over once verified, then remove the old path only after it is provably unused. Naming that general pattern, rather than only the schema-specific version of it, tends to read as more senior in an interview.</p>`,
        check: {
          question: 'Why is "add a new column, backfill it in small batches, then switch reads over, then drop the old column" generally safer than changing the column in one ALTER TABLE statement?',
          options: [
            'It uses less disk space overall',
            'Each step is small and reversible, and the table never needs a single long-held lock that would stall all other queries against it',
            'It avoids using an index',
            'It is required by the SQL standard'
          ],
          answer: 1,
          explain: 'A single large rewrite can hold a lock for the whole operation on a big table, which stalls other traffic. Splitting the change into small, resumable steps keeps every individual step cheap and lets you stop safely if something goes wrong partway.'
        }
      }
    ],
    connect: null,
    activities: [
      {
        id: 'sql-a1',
        type: 'design',
        title: 'Design the schema and index plan for a checkout system',
        prompt: `"We're building the orders table for an e-commerce checkout. Walk me through the schema, which indexes you'd add and why, and what isolation level or locking approach you'd use for the step where we decrement inventory and charge the customer. Then tell me how you'd scale reads once this table gets large."`,
        timeboxSec: 1500,
        rubric: `Marking guide, out of 10. (1) A schema is proposed with a clear primary key, foreign keys to customers and products rather than duplicated customer or product fields, and a reason given for each normalisation choice. (2) At least one deliberate denormalisation is named if proposed (e.g. a price snapshot on the order line), with the trade-off stated explicitly rather than left implicit. (3) Indexes are proposed with a reason tied to an actual query - e.g. an index on (customer_id, created_at) for order history, not just "index everything" - and at least one mention of the write cost of adding indexes. (4) The inventory-decrement-and-charge step is identified as the concurrency-sensitive one, and a concrete mechanism is named: an atomic UPDATE ... WHERE stock >= quantity, or SELECT FOR UPDATE, or a higher isolation level with retry on conflict. (5) The default isolation level (read committed) is correctly stated as insufficient on its own for this step, with the lost-update or overselling scenario named explicitly. (6) Scaling reads is addressed with read replicas and the replication-lag / read-your-writes trade-off named, not just "add a replica." (7) Connection pooling or partitioning is mentioned as an earlier, cheaper option than sharding. (8) An assumption about scale (a rough order count) is stated before designing, rather than designing in a vacuum. (9) At least one trade-off is stated as a trade-off, with both sides named. (10) The answer stays in plain, precise language rather than restating vocabulary without applying it. Deduct for: claiming ACID alone prevents overselling; recommending serializable everywhere with no mention of the retry cost; sharding proposed before cheaper options; no concrete locking or atomic-statement mechanism named for the concurrency-sensitive step. {{HONESTY}}`,
        model: `"I'd use three tables: customers, products, and orders, with order_lines keyed by (order_id, product_id). Orders reference customer_id as a foreign key rather than copying customer fields, so an address change never leaves a stale copy behind. On order_lines I'd deliberately snapshot unit_price at order time, since a later price change shouldn't rewrite what the customer was actually charged - a documented denormalisation, not an oversight.

For indexes: the primary key on order_id comes free; I'd add (customer_id, created_at) for order history sorted by date, and (product_id) on order_lines for 'orders containing this product.' I wouldn't index a low-cardinality status column alone.

The dangerous step is inventory decrement plus charge: two checkouts for the last unit racing under read-committed is a textbook lost update - both read stock as 1, both decide it's available, one oversells. I'd use an atomic conditional update, UPDATE inventory SET stock = stock - 1 WHERE product_id = ? AND stock >= 1, and check rows affected; zero means sold out. That avoids needing a stronger isolation level, because the check and the write are one atomic statement.

For scaling reads, I'd add replicas for history and reporting, but route a customer's own 'did it go through' check to the primary, to avoid the read-your-writes gap from replication lag. Pooling and the existing indexes come before sharding, which I'd only reach for if write throughput, not reads, was the constraint."`
      },
      {
        id: 'sql-a2',
        type: 'explain',
        title: 'Diagnose a query that got slow with no code change',
        prompt: `"This query used to run in about ten milliseconds. This morning, with no code change, it's taking four seconds. Walk me through how you'd find out why, step by step."`,
        timeboxSec: 600,
        rubric: `Must-haves: (1) the first step is running EXPLAIN ANALYZE on the actual query, not guessing; (2) the plan itself is read - sequential scan versus index scan, and which join algorithm was chosen; (3) estimated row counts are compared against actual row counts in the ANALYZE output as the specific diagnostic for a stale-statistics problem; (4) at least one concrete cause is named with a mechanism: stale statistics after a bulk load or delete, a dropped or corrupted index, a sudden change in data distribution, or a lock/contention issue rather than a planning issue; (5) the fix is tied to the cause - refresh statistics, rebuild or add an index, or investigate blocking transactions - rather than a non-specific "add more resources"; (6) a planning problem (bad plan chosen) is distinguished from a contention problem (right plan, but blocked on a lock), since they are diagnosed differently. Common mistakes: jumping straight to "add an index" without running EXPLAIN first; assuming it must be a hardware problem; not mentioning ANALYZE at all and only reading the estimated plan. {{HONESTY}}`,
        model: `"First I'd run EXPLAIN ANALYZE on the exact query, since guessing wastes time and this gives me the real plan and the real numbers. I'm looking for two things: the plan itself - a sequential scan where I'd expect an index scan, or a nested loop where a hash join would be cheaper - and how estimated row counts compare to actual ones at each node.

If the estimate and the actual are wildly apart - say a few hundred expected versus a few million actual - the table's statistics are stale, usually from a bulk load, a big delete, or an overnight batch job. The planner chose a plan that fit the old numbers and is wrong for the new ones, and a nested loop that's cheap at a few hundred rows can be disastrous at millions. The fix is to refresh statistics and re-check the plan.

If the plan and estimates look reasonable but it's still slow, I'd check for contention next - is it stuck behind a lock held by some other long-running transaction, which is a different diagnosis with a different fix: deal with whatever's holding the lock, not the query.

I'd also confirm the index it depends on still exists and is usable - something could have dropped it, or a migration changed a column type in a way that stops the planner using it. 'This morning, no code change' points me first at a data or maintenance event overnight, and EXPLAIN ANALYZE turns that suspicion into an answer."`
      },
      {
        id: 'sql-a3',
        type: 'drill',
        title: 'Practice: pick the isolation level',
        prompt: `Practice problem. A reporting job runs one long transaction that reads the same set of "active subscriptions" three times during its run, ten minutes apart, and needs to see the exact same set of rows all three times, even though subscriptions are being created and cancelled continuously elsewhere. Which isolation level do you need, and why doesn't the level below it work?`,
        timeboxSec: 420,
        rubric: `Must-haves: (1) correctly identifies that repeatable read is the minimum level needed, because the requirement is "the same result on repeated reads within one transaction," and read committed explicitly does not guarantee that; (2) explains why read committed fails here: each statement in a read-committed transaction sees the latest committed snapshot as of that statement, so a subscription created or cancelled between reads would change the second or third result, which is exactly the non-repeatable-read (here, phantom-row) problem; (3) explains why repeatable read fixes it: the whole transaction reads from one snapshot taken at its start, so later commits elsewhere are invisible to it until it ends; (4) does not over-reach and claim serializable is required, and if it does mention serializable, correctly describes it as solving a different problem (write-write conflict serialization) rather than being needed for this pure-read scenario; (5) names the cost of repeatable read for this use case - old row versions must be retained for the duration of the long transaction, which is a real resource cost on a busy table. Common mistakes: recommending SELECT FOR UPDATE for a read-only report; claiming read committed is sufficient; not connecting the answer back to the specific requirement (identical results three times). {{HONESTY}}`,
        model: `"This needs at least repeatable read. Three reads in one transaction, ten minutes apart, must return the same rows, and read committed doesn't give that: each statement sees whatever's committed as of that moment, so a subscription cancelled between reads would just vanish from the next one. That's the non-repeatable-read problem, showing up here as a changing row set rather than a changing single value.

Repeatable read fixes it directly: the whole transaction reads from one snapshot taken at its start, so anything committed elsewhere afterward is invisible until it finishes, and all three reads see the same world.

I wouldn't reach for serializable here - it solves a different problem, making concurrent writes behave as if run one at a time, which matters when a transaction reads then writes based on what it read. This job is read-only, so there's no write-write conflict to protect against, and serializable would only add retry overhead for no benefit.

The real cost is on the database side: holding a snapshot open for ten-plus minutes means row versions it might still need can't be cleaned up, which on a busy table means more bloat for longer. If this report runs often, I'd point it at a replica instead of the primary, specifically to keep that cost off the write path."`
      }
    ],
    sayQuestion: null,
    sayItOutLoud: null,
    readings: [
      { l: 'PRIMER: Use The Index, Luke - SQL indexing from the ground up', u: 'https://use-the-index-luke.com/', w: 'The clearest ground-up explanation of how a B-tree index actually speeds up a query, with concrete guidance across MySQL, Postgres, Oracle and SQL Server.', m: 30 },
      { l: 'PostgreSQL docs - Concurrency Control', u: 'https://www.postgresql.org/docs/current/mvcc.html', w: 'The official description of MVCC, isolation levels and locking in a real production database, including deadlocks and predicate locking.', m: 20 },
      { l: 'PostgreSQL docs - Transaction Isolation', u: 'https://www.postgresql.org/docs/current/transaction-iso.html', w: 'Defines dirty read, non-repeatable read and phantom read precisely, then walks the account-transfer example that makes a lost update concrete.', m: 15 },
      { l: 'PostgreSQL docs - Write-Ahead Logging (WAL)', u: 'https://www.postgresql.org/docs/current/wal-intro.html', w: 'Explains why the log is written before the data pages, and why that ordering is what makes durability cheap.', m: 10 },
      { l: 'Video: B-Trees and B+ Trees Explained: Database Indexing for Beginners', u: 'https://www.youtube.com/watch?v=JWSObwhGGxY', w: 'Watching the tree get built and searched makes the leaf-chaining behind fast range scans easier to see than to read about.', m: 15 },
      { l: 'ByteByteGo - Database Indexing Strategies', u: 'https://blog.bytebytego.com/p/database-indexing-strategies', w: 'A short, visual second pass over clustered versus non-clustered and composite indexes, useful after the fundamentals.', m: 8 },
      { l: 'GitHub Engineering Blog - gh-ost, an online schema migration tool for MySQL', u: 'https://github.blog/news-insights/company-news/gh-ost-github-s-online-migration-tool-for-mysql/', w: 'A real production tool doing the shadow-table, tail-the-log, cut-over pattern this chapter describes, from the team that built it.', m: 12 }
    ],
    glossary: [
      {
        g: 'Relational databases',
        sub: '',
        rows: [
          ['Normalisation', 'Storing each fact once so an update to it can never leave a stale copy elsewhere', 'schema design'],
          ['Functional dependency', 'Column A always implies the same value of column B', 'normalisation'],
          ['B-tree', 'The balanced tree structure most relational indexes use; shallow even over billions of rows', 'indexes'],
          ['Leftmost-prefix rule', 'A composite index only serves a query that filters on its leading columns, in order', 'indexes'],
          ['Covering index', 'An index holding every column a query needs, so the row itself is never fetched', 'indexes'],
          ['Query planner', 'Chooses an execution plan from estimated row counts and cost', 'query planning'],
          ['Lost update', 'Two transactions each read, compute, and write; one write silently overwrites the other', 'isolation'],
          ['Phantom read', 'A repeated filtered query returns a different set of rows within one transaction', 'isolation'],
          ['MVCC', 'Keeping several row versions so readers use a snapshot and never block writers', 'concurrency'],
          ['Write-ahead log', 'A log flushed to disk before a change is applied to data pages, for cheap durability', 'crash recovery'],
          ['Checkpoint', 'The point recovery can start replaying from, instead of the start of the whole log', 'crash recovery'],
          ['Replication lag', 'How far behind the primary a read replica currently is', 'scaling'],
          ['Read-your-writes', 'A guarantee that a client sees its own just-committed write, even with replicas in play', 'scaling'],
          ['Expand-migrate-contract', 'Add the new form, backfill, cut over, then remove the old form, in separately safe steps', 'safe migrations']
        ]
      }
    ]
  };

  root.PREP_CORE['nosql-partitioning-ids'] = {
    id: 'nosql-partitioning-ids',
    title: 'NoSQL, sharding and IDs',
    level: 'danger',
    levelLabel: 'Asked in almost every system design interview.',
    why: `Once a design has to survive more data or more traffic than one relational database can comfortably hold, the interview moves onto this chapter's ground: which storage model actually fits the access pattern, how you split data across many machines without concentrating all the traffic on one of them, and how you hand out unique ids once no single machine is in charge of counting anymore. Interviewers use this material to separate someone who has memorised "NoSQL scales better" from someone who can say exactly which access pattern justifies which store, and what a hash ring or a Bloom filter actually buys you and what it costs.`,
    learn: [
      {
        id: 'npi-0',
        part: 'field',
        title: 'Key terms',
        body: `<ul>
<li><b>NoSQL.</b> A loose umbrella term for non-relational stores - document, key-value, wide-column and graph databases are the four families this chapter covers.</li>
<li><b>Key-value store.</b> A store where every value is looked up by a single key and nothing else; there is no query language beyond get and put.</li>
<li><b>Document store.</b> A store where each record is a nested, self-contained document (commonly JSON-like), and queries can filter or sort on any field inside it.</li>
<li><b>Wide-column (column-family) store.</b> A store where each row has a key and a flexible set of named columns, grouped into families, and different rows can have entirely different columns.</li>
<li><b>Graph database.</b> A store built around nodes and the relationships between them, optimised for traversing connections rather than for filtering flat rows.</li>
<li><b>Shard key (partition key).</b> The value used to decide which node a given piece of data lives on.</li>
<li><b>Range partitioning.</b> Assigning contiguous ranges of the shard key's sorted values to each node.</li>
<li><b>Hash partitioning.</b> Assigning data to a node based on a hash of the shard key, spreading similar keys apart.</li>
<li><b>Hot partition (hot key).</b> One partition, or one especially popular key inside it, that receives far more traffic than the others.</li>
<li><b>Rebalancing.</b> Moving data between nodes after nodes are added or removed, so load stays roughly even.</li>
<li><b>Consistent hashing.</b> A hashing scheme, usually visualised as a ring, that keeps most keys mapped to the same node even as nodes join or leave, so rebalancing only moves a small fraction of the data.</li>
<li><b>Virtual node.</b> One physical node represented by several points on a consistent-hashing ring, so load spreads more evenly than one point per node would.</li>
<li><b>UUID.</b> Short for universally unique identifier: a 128-bit identifier, usually generated to be globally unique without any coordination between machines.</li>
<li><b>Snowflake-style id.</b> A 64-bit identifier packed from a timestamp, a machine id, and a per-millisecond sequence number, so ids are both unique and roughly sortable by creation time.</li>
<li><b>Clock skew.</b> A machine's clock disagreeing with real time, or with another machine's clock, which threatens any id scheme that leans on the clock for ordering.</li>
<li><b>Offset pagination.</b> Returning page N by skipping the first (N-1) times the page size rows.</li>
<li><b>Keyset (seek) pagination.</b> Returning the next page by asking for rows after the last key seen on the previous page.</li>
<li><b>Bloom filter.</b> A compact, probabilistic structure that can say "definitely not present" for free, and "probably present" with a small, tunable chance of being wrong.</li>
<li><b>False positive rate.</b> How often a Bloom filter wrongly claims an absent item is present; it never has false negatives.</li>
<li><b>Hot and cold storage.</b> Keeping frequently accessed data on fast, expensive storage and rarely accessed data on slow, cheap storage, moving data between the two as its access pattern changes.</li>
</ul>`,
        deeper: `<p>Almost every technique in this chapter exists to answer one question under one specific constraint: how do you keep serving requests correctly when the data or the traffic is bigger than one machine, and machines keep joining, leaving, and occasionally lying about what time it is. Read the rest of the chapter as different answers to slices of that same question, rather than as an unrelated list of trivia, and it holds together a great deal better.</p>`,
        check: {
          question: 'What is the actual difference between a hot partition and a hot key?',
          options: [
            'They are two names for the same thing at different scales - a hot key is one especially popular value; a hot partition is the (possibly whole) partition that key\'s traffic goes to, so a single hot key is often the cause of a hot partition',
            'A hot partition only happens with range partitioning',
            'A hot key only happens with hash partitioning',
            'A hot partition means the whole cluster is overloaded'
          ],
          answer: 0,
          explain: 'A hot key is the specific value receiving disproportionate traffic; a hot partition is the shard that traffic concentrates on. One popular key is one of the most common causes of a hot partition.'
        }
      },
      {
        id: 'npi-f1',
        part: 'field',
        title: 'When to leave SQL: decision rules, not a default',
        body: `<p>Reaching for a non-relational store is a decision with real trade-offs, not a free upgrade, and a relational database usually scales further than people assume once you have used the options from the previous chapter: better indexes, read replicas, native partitioning, and a cache. Leave SQL when one of these is actually true for your workload, not because a name sounds more scalable.</p>
<ul>
<li><b>The access pattern is single-key, not relational.</b> If almost every read and write is "get or set the whole record for this one key" - a session, a user profile, a shopping cart - and you rarely join across records, a key-value or document store fits the pattern directly and a relational schema is buying you join and transaction machinery you are not using.</li>
<li><b>The write volume needs to scale out linearly, past what vertical scaling and standard partitioning can sustain on one writable primary.</b> Many stores built as distributed-by-default make adding a node a straightforward way to add write capacity, where scaling a relational primary's writes usually means sharding it yourself.</li>
<li><b>The schema genuinely varies per record, and enforcing one structure costs more than it helps.</b> A catalogue of products with wildly different attributes per category is a real example; a table with fifty mostly-null columns is the symptom that this rule applies.</li>
<li><b>The query is fundamentally about structure a relational table represents awkwardly</b> - deep traversal of relationships (fraud rings, recommendations), full-text ranking, or unbounded time-series ingestion - where a specialised store's data structure matches the query better than rows and joins do.</li>
</ul>
<p><b>The trap to say out loud.</b> "We need to scale" is not, by itself, one of these rules - it is a symptom that could be caused by a missing index, an unpooled connection, or a schema that has not been partitioned yet, all of which are cheaper and more reversible fixes than migrating to a different storage model. Naming which specific rule above applies, rather than gesturing at scale in general, is what separates a reasoned choice from a fashion choice.</p>`,
        deeper: `<p>A related, often-skipped question: what do you give up? Most non-relational stores trade away one or more of multi-row transactions, ad hoc joins, or strong immediate consistency across records, in exchange for the scaling property you actually need. State which one you are giving up and why the application can tolerate it - "orders reference a product by id and we accept that a product rename might briefly show old names on orders already placed" is a specific, defensible trade; "we don't need consistency" said with no example attached is not.</p>`,
        check: {
          question: 'A team says "we need to move this table to a NoSQL store because it needs to scale." What is the strongest response?',
          options: [
            'Agree immediately, since NoSQL always scales better than SQL',
            'Ask which specific limit is actually being hit - connection count, a missing index, single-primary write throughput, or an awkward access pattern - since each has a different, and often cheaper, fix before a storage migration is justified',
            'Refuse, since relational databases can always be scaled indefinitely',
            'Recommend sharding the relational database immediately without further questions'
          ],
          answer: 1,
          explain: '"Needs to scale" is a symptom, not a diagnosis. The cheaper, more reversible fixes - indexing, pooling, replicas, native partitioning - should be ruled out with a specific bottleneck before a storage-model migration is the right call.'
        }
      },
      {
        id: 'npi-f2',
        part: 'field',
        title: 'Document, key-value, wide-column and graph stores',
        body: `<p>Four families, each built around a different access pattern. Naming the access pattern first, and the family second, is the order that actually works in an interview.</p>
<ul>
<li><b>Key-value.</b> A value is stored and retrieved by exactly one key; there is no query language beyond that, and no relationships between keys the store understands. <b>Redis</b> is a widely used example, valued for lookups fast enough to sit in front of a slower store as a cache, and for data structures (lists, sets, sorted sets) built on top of the basic get/put model. The trade is simplicity and speed for a total absence of query flexibility - if you need to find values by anything other than their key, this family cannot do it on its own.</li>
<li><b>Document.</b> A record is a self-contained, usually JSON-like document, and the store can query, filter and index on any field inside it, not just a single key. <b>MongoDB</b> is the standard example. This fits data whose natural unit is "one whole object" - a user profile with nested preferences, a product with a variable set of attributes - read and written as one piece more often than joined against other collections. The trade is that enforcing relationships between documents, and multi-document transactions, are both more limited than in a relational database, even though most document stores now offer some version of both.</li>
<li><b>Wide-column (column-family).</b> Each row has a key and a set of columns grouped into families, and different rows can have completely different columns - there is no fixed schema across rows the way a relational table enforces one. <b>Apache Cassandra</b> (and Google's <b>Bigtable</b>, which the model originates from) is the standard example, built for very high write throughput spread across many nodes with no single primary, at the cost of weaker default consistency and no general-purpose join.</li>
<li><b>Graph.</b> Data is nodes and the relationships between them, and the store is optimised for traversing those relationships - "friends of friends," "which accounts share a device with this one" - rather than for scanning flat rows. <b>Neo4j</b> is the standard example. A query that would be a chain of several expensive joins in a relational database, growing worse with every extra hop, is often a single efficient traversal in a graph store, because the relationships are stored in their own right as pointers rather than reconstructed by a join at query time.</li>
</ul>
<p>The rule that ties all four together: name the access pattern - single key, whole document, huge sparse rows written at high volume, or a traversal - and the family follows from that, not the other way around.</p>`,
        deeper: `<p>A subtlety worth having ready: these families are not as sharply separated in practice as the four-way split suggests. A document store can be used as a plain key-value store by never querying inside the document; a wide-column store can hold what is effectively a document in one large column; several modern stores blend two or three of these models under one engine. The four-way split is a way to reason about access patterns, not a strict taxonomy every real product fits into cleanly.</p>`,
        check: {
          question: 'A team needs to store user sessions, looked up only by session id, with sub-millisecond reads, and no need to query by anything else. Which family fits best, and why?',
          options: [
            'Graph, because sessions are relationships',
            'Wide-column, because it scales writes best',
            'Key-value, because the entire access pattern is a single-key lookup with no need for querying on other fields',
            'Document, because sessions might have nested fields'
          ],
          answer: 2,
          explain: 'The access pattern - retrieve by exactly one key, nothing else - is the definition of the key-value fit. A document or wide-column store would work but carries query and schema flexibility this workload never uses.'
        }
      },
      {
        id: 'npi-f3',
        part: 'field',
        title: 'Sharding and partitioning: range vs hash, and rebalancing',
        viz: 'shard-range-vs-hash',
        body: `<p>Once one node cannot hold the data or the write rate, you split it across several, by a chosen shard key. There are two standard ways to decide which node a key goes to, and each has a matching failure mode.</p>
<p><b>Range partitioning.</b> Sort possible key values and assign contiguous ranges to nodes - shard 1 holds keys A through H, shard 2 holds I through Q, and so on. This makes range queries efficient, because a query for "everything between M and P" touches only the shards that own that range, instead of every shard. Its failure mode is a hot range: if the shard key has any natural ordering - a timestamp, an auto-incrementing id - every new write goes into whichever range currently holds the highest values, so one shard takes all the write traffic while the others sit idle.</p>
<p><b>Hash partitioning.</b> Apply a hash function to the key and use the result to pick a node - typically <code>hash(key) mod N</code> for N nodes. Because a good hash function scatters similar keys unpredictably, this spreads load evenly regardless of any ordering in the original key, which directly fixes the range approach's hot-range problem. Its cost is the opposite of range partitioning's strength: a query across a range of key values can no longer be answered by a handful of shards, because consecutive keys are deliberately scattered across all of them, so a range scan has to fan out to every shard and merge the results.</p>
<p><b>Rebalancing.</b> When a node is added or removed, data has to move to keep load even. Range partitioning rebalances by moving whole ranges, which can be done incrementally and predictably. Plain hash partitioning with <code>mod N</code> has a much worse problem: changing N changes almost every key's <code>hash(key) mod N</code> result, so adding one node to a ten-node cluster can require reshuffling close to all the data, not just a tenth of it. That specific problem - a small change in cluster size causing an almost total reshuffle - is exactly what consistent hashing, the next section, exists to fix.</p>`,
        deeper: `<p>The choice is really a bet on the queries you expect. If range scans over the shard key are common and important - "all events for this device in the last hour," where the key is device id plus time - range partitioning, accepting the hot-range risk and managing it separately (the next section covers the fix), can be worth it. If the workload is overwhelmingly point lookups by key with no important range structure, hash partitioning's even spread with no range-query benefit to give up is close to free.</p>`,
        check: {
          question: 'A table is range-partitioned by an auto-incrementing order id. What problem should you expect as order volume grows?',
          options: [
            'Range queries become slow',
            'The most recent shard, which owns the highest id range, receives all new writes while older shards sit nearly idle',
            'Hash collisions corrupt the data',
            'The primary key can no longer be enforced'
          ],
          answer: 1,
          explain: 'An auto-incrementing key always grows into whichever range currently holds the top of the sequence. Every new order goes to that one shard, concentrating all write traffic there while the rest of the cluster does nothing.'
        }
      },
      {
        id: 'npi-f4',
        part: 'field',
        title: 'Hot partitions and how to fix them',
        body: `<p>A hot partition is one shard, or one key inside a shard, receiving disproportionate traffic. It shows up as one node running hot on CPU or throttled requests while its neighbours are idle, and it is one of the most commonly asked "now fix it" follow-ups after a sharding design.</p>
<p><b>The two usual causes.</b> A monotonic shard key - a timestamp or an auto-incrementing id, as in the previous section - concentrates every new write on whichever range currently owns the top of the sequence. A skewed key distribution - one celebrity account, one enormous tenant, one viral item - concentrates reads or writes on a single key regardless of how evenly the shard key was hashed, because hashing spreads keys evenly only when the keys themselves are requested roughly evenly.</p>
<p><b>Fixes, matched to cause.</b> For a monotonic key, switch to hash partitioning, or add a well-distributed prefix or suffix to the key so writes stop arriving in strict order. For a single hot key regardless of partitioning scheme, the standard fix is <b>key salting</b>: append a small random suffix (say, a number from 0 to 9) to the hot key, spreading its writes across several sub-keys on different partitions, and merge or aggregate the sub-keys back together on read. This trades a slightly more complex read path for spreading a single key's write load across many nodes instead of one. For a hot key that is mostly read, not written, a cache in front of that specific key - or a managed accelerator layer some stores provide for exactly this case - absorbs the read traffic before it ever reaches the partition, which is a much simpler fix when the traffic is reads rather than writes.</p>
<p><b>Detecting it before it becomes an incident.</b> Per-key or per-partition metrics, not just per-cluster averages, are what actually reveal a hot partition; a cluster-wide utilisation graph can look calm while one partition is silently throttling every request that reaches it.</p>`,
        deeper: `<p>Salting has a real cost worth naming explicitly: a write to the hot key becomes N writes to N sub-keys, and a read of the hot key's true value becomes a fan-out read across all N sub-keys followed by an aggregation step, which is more complex and more expensive per operation than an unsalted key. It is worth doing specifically because the alternative - one partition throttled or overloaded while N-1 others sit idle - is worse, not because it is free.</p>`,
        check: {
          question: 'A single celebrity user\'s profile key is receiving far more read traffic than any other key, even though the shard key is well hashed across the cluster. What is the correct diagnosis?',
          options: [
            'The hash function is broken',
            'This is a hot key, not a hot range - hashing spreads different keys evenly, but it cannot spread the traffic to one specific key across multiple partitions by itself',
            'The shard count is too low',
            'This can only be fixed by moving to range partitioning'
          ],
          answer: 1,
          explain: 'Hashing distributes distinct keys evenly across partitions, but a single key still lives on exactly one partition. If that one key is disproportionately popular, its traffic concentrates there regardless of how well the rest of the keyspace is spread - a cache or key salting addresses this, not a different hash scheme.'
        }
      },
      {
        id: 'npi-f5',
        part: 'field',
        title: 'Consistent hashing: the ring, virtual nodes, and why it limits data movement',
        viz: 'consistent-hash-ring',
        body: `<p>Plain hash partitioning's weak point is that <code>hash(key) mod N</code> ties every key's assignment to the total node count N, so changing N reshuffles almost everything. Consistent hashing fixes this by not partitioning on the node count at all.</p>
<p><b>The ring.</b> Imagine the entire output range of a hash function bent into a circle - a <b>ring</b>. Each node is placed at one or more points on the ring, by hashing something that identifies it (its address, say). A key is assigned to whichever node's point is the first one reached going clockwise from the key's own hash position. That is the entire rule: hash the key, walk clockwise, stop at the first node.</p>
<p><b>Why this limits data movement.</b> When a new node joins, it takes a point somewhere on the ring, and it becomes responsible only for the arc of keys between itself and the previous node going counter-clockwise - every other node's arc, and therefore every other node's keys, is completely unaffected. Removing a node has the mirror-image effect: only the keys in its arc move, to the next node clockwise. Compare that to plain <code>mod N</code>, where changing N reassigns almost every key; consistent hashing reassigns, on average, only about <code>K / (N + 1)</code> of the K keys when adding a node to an N-node ring - the fraction that has to move, not nearly everything.</p>
<p><b>Virtual nodes.</b> Placing each physical node at just one point on the ring means the size of its arc, and therefore its share of the load, depends entirely on the luck of where that one point fell - one node could end up owning a much larger arc than another purely by chance. Giving each physical node many points scattered around the ring (its <b>virtual nodes</b>) averages this out: each physical node ends up with many small arcs rather than one large-or-small one, so its total share of the keyspace converges toward an even split as the number of virtual nodes per physical node grows.</p>`,
        deeper: `<p>The reason this specific property - bounded data movement on membership change - matters so much in practice: a rebalance that moves nearly all the data (plain mod N) has to be treated as a rare, carefully scheduled maintenance event, because it saturates the network and the disks while it runs. A rebalance that moves a small, predictable fraction of the data can be treated as a routine, almost unremarkable part of adding or removing capacity, which is the actual operational difference consistent hashing buys a system that scales its node count often.</p>`,
        check: {
          question: 'Why does giving each physical node several virtual points on a consistent-hashing ring, rather than just one, matter?',
          options: [
            'It makes the hash function itself more secure',
            'With only one point per node, each node\'s share of the ring depends on chance placement and can be very uneven; many virtual points per node average this out into a much more even split of load',
            'It reduces the number of hash functions needed to zero',
            'It removes the need for a ring at all'
          ],
          answer: 1,
          explain: 'A single random point can give a node a tiny arc or a huge one purely by chance. Spreading each physical node across many points makes its total share of the ring converge toward its fair fraction, rather than depending on the luck of one placement.'
        }
      },
      {
        id: 'npi-f6',
        part: 'field',
        title: 'Distributed id generation: UUID, ObjectId, Snowflake, and clock skew',
        viz: 'snowflake-id',
        body: `<p>Once ids are handed out by many machines instead of one counter, "unique" has to be achieved without any of them talking to each other on every request, and several standard schemes trade off uniqueness, size, and whether the id is roughly sortable by creation time.</p>
<p><b>UUID (specifically UUIDv4).</b> 128 bits, generated from randomness, with no coordination at all - the collision probability from randomness alone is astronomically small. The trade-off: a random UUID has no relationship to creation time, so it makes a poor primary key for a B-tree index on write-heavy tables, because inserts go to random positions across the whole index rather than appending at the end, which is far more expensive for the index to maintain. Newer time-ordered UUID variants exist specifically to fix this by putting a timestamp in the leading bits.</p>
<p><b>MongoDB's ObjectId.</b> 12 bytes: a 4-byte seconds-since-epoch timestamp, a 5-byte value randomly generated once per process, and a 3-byte counter that increments per id generated by that process. It is roughly time-ordered - useful for range queries by creation time and for insert-friendly indexing - but only roughly: the timestamp has one-second resolution and the ordering can be disturbed by clock differences between processes, so it should not be relied on as a strict, total order.</p>
<p><b>Snowflake-style ids.</b> A 64-bit integer packed into fixed fields: 1 unused sign bit, a 41-bit millisecond timestamp measured from a custom epoch, a 10-bit machine (or datacenter-plus-worker) id, and a 12-bit per-machine, per-millisecond sequence number. The 41-bit timestamp gives roughly 69 years of range from whatever epoch is chosen; the 10-bit machine id allows 1,024 distinct machines (2 to the 10th); the 12-bit sequence allows 4,096 distinct ids per machine per millisecond (2 to the 12th) before that machine has to wait for the next millisecond. Because the timestamp is the leading, most significant field, ids generated later almost always sort as numerically larger - they are unique and roughly time-ordered, in one small, fast-to-generate integer.</p>
<p><b>Clock skew is the real failure mode.</b> The entire scheme depends on each machine's clock only ever moving forward. If a clock correction ever moves a machine's clock backward - an adjustment from NTP, the Network Time Protocol that keeps machines roughly in step with a reference clock, or a manual fix - that machine could generate a timestamp smaller than one it already generated, which breaks both the uniqueness guarantee (if the sequence also happens to repeat) and the time-ordering guarantee. Real implementations detect this - by refusing to generate an id while the clock is behind where it was last observed, and waiting until it catches back up - rather than silently producing an id that looks fine and occasionally is not.</p>`,
        deeper: `<p>The size trade-off is worth stating in numbers, because it is concrete and often decisive: a UUID is 128 bits (16 bytes) per id; a Snowflake-style id is 64 bits (8 bytes). On a table with a few billion rows, every foreign key referencing that id, and every index entry for it, pays that difference - half the space per reference, and generally faster comparisons, for the Snowflake-style scheme, at the cost of needing a coordinated machine-id assignment scheme that pure random UUIDs never need at all.</p>`,
        check: {
          question: 'A service assigns Snowflake-style ids using each machine\'s local clock for the timestamp field. An NTP correction moves one machine\'s clock backward by 200 milliseconds. What is the actual risk, and what should the id generator do about it?',
          options: [
            'There is no risk; the sequence number alone guarantees uniqueness regardless of the timestamp',
            'The machine could generate a timestamp it has already used, risking a duplicate or an out-of-order id; a correct implementation detects the clock moving backward and refuses to generate ids until it catches up',
            'The risk only affects the machine id field, not the timestamp',
            'This can be fixed by increasing the sequence number\'s bit width'
          ],
          answer: 1,
          explain: 'The scheme\'s uniqueness and ordering both depend on the timestamp only moving forward. A backward jump can reproduce a timestamp already used, so a correct implementation must detect this and stall rather than generate an id from a timestamp it has already issued.'
        }
      },
      {
        id: 'npi-f7',
        part: 'field',
        title: 'Keyset pagination vs offset pagination',
        viz: 'pagination-cursor',
        body: `<p>A large result set has to be returned in pages, and the two standard ways to say "give me the next page" behave very differently once the underlying data is changing while someone pages through it.</p>
<p><b>Offset pagination.</b> Ask for a page by position: "skip the first (N-1) times the page size rows, then give me the next page size." It is simple and lets a caller jump to any page directly. Its cost grows with how far into the result set you are, because most databases still have to walk past every skipped row to know it should skip it - page 1,000 is meaningfully more expensive than page 1. Worse, if a row is inserted or deleted ahead of the current position while someone is paging through, every row after that point shifts by one, so the caller can see the same row twice, or miss one entirely, without anything having gone wrong on the server.</p>
<p><b>Keyset (seek) pagination.</b> Ask for a page relative to the last row actually seen: "give me the next page size rows with a sort key greater than the last one on the previous page." Given an index on that sort key, the database can jump straight to the right position and read forward, with no cost that grows with how deep into the results you are, and no drift when rows are inserted elsewhere, because the query is tied to a specific value rather than to a shifting position count.</p>
<p><b>The trade-off, honestly stated.</b> Keyset pagination needs a sort order with no ties (a unique column, or a compound key that breaks ties), it cannot jump to an arbitrary page number the way offset can, and reversing direction (previous page) needs the query logic mirrored rather than just walking backward from an offset. For anything that behaves like an infinite scroll or a feed - where "give me page 47" is never actually asked for, and correctness under concurrent writes matters - keyset pagination is close to always the better choice; for a small, mostly static result set where jumping to an arbitrary page number is a real requirement, offset's simplicity can be worth its cost.</p>`,
        deeper: `<p>The concurrent-insert failure mode is worth being able to describe precisely, because it is the detail interviewers actually ask about: with offset pagination on a feed sorted newest-first, a new item inserted at the top while a reader is on page 2 pushes every existing item down by one position, so what was the last item on page 1 becomes the first item on page 2 - the reader sees it twice. Keyset pagination based on "items older than the last one I saw" is immune to this exact failure, because a new item at the top never changes where "older than X" points.</p>`,
        check: {
          question: 'A social feed sorted newest-first uses offset pagination. A user scrolling through it sometimes sees the same post twice. What causes this, and what fixes it?',
          options: [
            'A caching bug; the fix is to disable caching',
            'New posts inserted at the top shift every later post down by one offset position while the user is mid-scroll, so a post already seen reappears on the next page; keyset pagination anchored to the last post id seen avoids this',
            'The database\'s index is corrupted',
            'This is expected and cannot be fixed with any pagination scheme'
          ],
          answer: 1,
          explain: 'Offset pagination is positional, so any insert ahead of the current position shifts everything after it, causing duplicates or skips. Keyset pagination uses a specific value already seen, which a new insert elsewhere does not move.'
        }
      },
      {
        id: 'npi-f8',
        part: 'field',
        title: 'Bloom filters: how they work, and the false-positive rate',
        viz: 'bloom-filter',
        body: `<p>A Bloom filter answers one narrow question extremely cheaply: "might this key be in the set?" It can say "definitely not" with certainty, and "probably yes" with a small, known chance of being wrong - it never produces a false negative, only occasional false positives.</p>
<p><b>How it works.</b> Start with a bit array of <code>m</code> bits, all zero, and <code>k</code> independent hash functions. To insert an item, run it through all <code>k</code> hash functions and set the bit at each resulting position to 1. To check whether an item might be in the set, run it through the same <code>k</code> hash functions and look at those same bit positions: if any one of them is still 0, the item was definitely never inserted, because inserting it would have set that bit. If all <code>k</code> positions are 1, the item is probably in the set - but another combination of inserted items could have happened to set exactly those same bits by coincidence, which is where the false positive comes from.</p>
<p><b>The false-positive rate.</b> For <code>m</code> bits, <code>n</code> inserted items, and <code>k</code> hash functions, the approximate false-positive probability is <code>p = (1 - e^(-kn/m))^k</code>, and the number of hash functions that minimises it for a given <code>m</code> and <code>n</code> is <code>k = (m/n) * ln(2)</code>.</p>
<p><b>A worked example.</b> Take one million inserted items (<code>n</code> = 1,000,000) and a bit array sized at ten bits per item, <code>m</code> = 10,000,000. The optimal <code>k</code> is <code>(10,000,000 / 1,000,000) * ln(2)</code> = 10 * 0.693 &asymp; 6.93, so round to <code>k</code> = 7. Plugging <code>k</code> = 7 and <code>m/n</code> = 10 into the formula: the exponent is <code>-kn/m</code> = <code>-7/10</code> = -0.7, and <code>e^-0.7</code> &asymp; 0.497, so <code>1 - 0.497</code> = 0.503, and <code>0.503^7</code> &asymp; 0.008. That is a false-positive rate of about 0.8 percent - roughly one wrong "maybe present" answer in every 122 checks for an absent item - from a structure using ten bits, a little over one byte, per item, regardless of how large each actual item is.</p>
<p><b>What it is for.</b> Bloom filters are used to skip expensive work cheaply: a database can check a Bloom filter before reading a data file from disk, and only pay the real disk read when the filter says "maybe" rather than "definitely not," which is exactly how many storage engines built on sorted files (LSM-trees, short for log-structured merge trees; see <a href="#storage-engines">Storage engines</a>) avoid checking every file for every read.</p>`,
        deeper: `<p>The worked example above shows the actual trade the formula controls. With the optimal <code>k</code>, the false-positive rate works out to roughly <code>0.6185</code> raised to the power of the bits per item, so it falls exponentially as memory grows: doubling the bits per item from ten to twenty <i>squares</i> the rate rather than halving it, taking it from about 0.8 percent to about 0.007 percent. More memory buys a disproportionately lower error rate, which is why a bits-per-item budget is a genuinely useful rule of thumb rather than an approximation to distrust.</p>`,
        check: {
          question: 'A Bloom filter says an item is "probably present," but the item was never actually inserted. What does this tell you, and could the reverse happen - the filter saying "definitely not present" for an item that actually was inserted?',
          options: [
            'This is a false positive, and yes, the reverse can also happen occasionally',
            'This is a false positive, caused by other inserted items happening to set the same bit positions; the reverse (a false negative) can never happen, because inserting an item always sets its bits, and once set they are never cleared',
            'This means the filter is corrupted and must be rebuilt',
            'This means too few hash functions were used, and adding one more guarantees no false positives'
          ],
          answer: 1,
          explain: 'A false positive happens when unrelated inserted items happen to set exactly the bits this item would have set. A false negative is structurally impossible: once an item is inserted, its bits are 1 forever (in a filter with no deletions), so a real member can never test as absent.'
        }
      },
      {
        id: 'npi-f9',
        part: 'field',
        title: 'Hot and cold storage tiering',
        body: `<p>Most data gets colder as it ages: a log entry, a completed order, a sensor reading are all read constantly in the first hours or days after they are created, and almost never after that. Storing everything on the fastest, most expensive tier forever wastes money on data nobody is reading; storing everything on the cheapest tier from the start makes the recent, frequently accessed data slower than it needs to be. Tiering is matching each piece of data's storage cost to how often it is actually being accessed right now.</p>
<p><b>Hot storage</b> is fast and comparatively expensive per gigabyte - in-memory or SSD-backed, low latency, no retrieval delay or fee - and it is where recent, frequently read data lives. <b>Cold storage</b> is slow and cheap per gigabyte - often object storage with a deliberate retrieval delay measured in minutes to hours, and sometimes a retrieval fee - and it is where data that is accessed rarely, but still needs to be kept, ends up. Cloud object stores typically expose this as a small ladder of named tiers rather than a strict two-way split: a "standard" or "hot" tier with no retrieval cost or delay, then progressively cheaper tiers meant for data accessed roughly monthly, then quarterly, then less than once a year, each cheaper to store and more expensive or slower to read back.</p>
<p><b>How the move happens.</b> A lifecycle policy - "move objects older than 30 days to the next cheaper tier, and objects older than a year to the cheapest one" - automates the transition based on age, without an application having to manage it explicitly. In a database context, the same idea shows up as partitioning data by time and putting older partitions on cheaper storage, or physically moving old partitions out of the primary database into a separate archive store or a data warehouse built for infrequent, large scans rather than frequent, small ones.</p>
<p><b>The trade-off to state plainly.</b> Moving data to a colder tier is a bet that it will be read rarely enough that the storage savings outweigh the occasional expensive or slow retrieval. Getting the age threshold wrong in either direction either keeps paying hot-tier prices for data nobody reads, or forces a slow, sometimes costly retrieval for data that turns out to still be read regularly - which is why the threshold should be set from actual access statistics, not from a guess about how old "old" feels.</p>`,
        deeper: `<p>The retrieval delay on the coldest tiers is a detail worth remembering precisely, because it changes what those tiers can be used for: archive-class storage often needs minutes to hours to restore an object to a readable state, which rules it out for anything on a live request path and confines it strictly to backup, compliance retention, and batch analytics that can tolerate waiting. A design that quietly assumes archived data is instantly readable has usually not actually checked the tier's retrieval behaviour.</p>`,
        check: {
          question: 'A team moves all order records older than 90 days into an archive storage tier with a multi-hour retrieval delay, to cut storage cost. What should they check before doing this?',
          options: [
            'Nothing; archive tiers behave identically to standard storage for reads',
            'Whether any live request path - a customer looking up an old order, a support tool - needs to read that data quickly, since a multi-hour retrieval delay would break any of those paths',
            'Whether the data compresses well',
            'Whether the primary database has enough disk space'
          ],
          answer: 1,
          explain: 'The coldest storage tiers trade a real, often multi-hour retrieval delay for a much lower storage cost. Anything that needs that data on a live, low-latency path will break, so the access pattern for old data has to be confirmed as genuinely tolerant of that delay before moving it.'
        }
      }
    ],
    connect: null,
    activities: [
      {
        id: 'npi-a1',
        type: 'design',
        title: 'Design the id and partitioning scheme for a multi-region order system',
        prompt: `"We're taking an orders system multi-region, with a service in each region able to accept new orders independently. Design the id scheme for a new order, and the partitioning scheme for the orders table, so ids never collide across regions and no single partition becomes a bottleneck as one region's traffic grows."`,
        timeboxSec: 1500,
        rubric: `Marking guide, out of 10. (1) A coordination-free id scheme is proposed - UUID or a Snowflake-style id with a region/machine id field - with an explicit reason why an auto-incrementing primary key from one database does not work once more than one region can write independently. (2) If Snowflake-style is chosen, the bit layout is at least roughly described (timestamp, machine or region id, sequence) and the size trade-off against a 128-bit UUID is mentioned. (3) Clock skew is raised as a real risk for a timestamp-based scheme, with a stated mitigation (detect backward clock movement, stall rather than reuse a timestamp). (4) A partitioning scheme is proposed with a stated shard key, and hash partitioning (or consistent hashing) is chosen over naive range partitioning on a monotonic key, with the hot-range problem named as the reason. (5) At least one plausible hot-key risk specific to this domain is identified (a very large customer, a flash-sale product) and proposes a concrete fix - salting, caching, or a dedicated path - rather than declaring the design hot-key-free by assumption. (6) If consistent hashing is invoked, virtual nodes are mentioned as the reason load stays even despite uneven node placement. (7) What happens on rebalancing - adding a region or a shard - is stated, and why the chosen scheme limits data movement compared to a naive mod-N scheme. (8) A clarifying question about read patterns (is a global, cross-region order history needed) is asked before committing to a scheme that would make that hard. (9) At least one trade-off is stated as a trade-off, not asserted as free. (10) The language stays concrete and plain rather than reciting definitions without applying them. Deduct for: proposing an auto-incrementing key across regions; ignoring clock skew entirely for a timestamp-based id; range-partitioning by an auto-incrementing or creation-time key with no mitigation named. {{HONESTY}}`,
        model: `"First: does anyone need one globally ordered view of orders across regions, or is per-region ordering with occasional cross-region lookups by id enough? I'll assume the second, the common case.

An auto-incrementing key is out immediately - two regions writing independently would both hand out id 1001 and collide once compared. I'd use a Snowflake-style 64-bit id: a millisecond timestamp, a region-plus-machine field, and a per-machine sequence. That's compact - 8 bytes versus 16 for a UUID, which matters across every index referencing it - and roughly time-ordered. The real risk is clock skew: if a clock is corrected backward, the generator could reuse a timestamp it already issued, so it needs to detect that and stall rather than hand out a colliding id.

For partitioning, I wouldn't shard by creation time or the id itself, since both are monotonic and would concentrate writes on whichever shard owns the newest range. I'd hash-partition on something like customer_id, with consistent hashing so adding capacity later moves a small fraction of the data, and virtual nodes so no shard is disproportionately large by chance.

The hot-key risk I'd expect is one large customer generating outsized traffic, which concentrates on one shard even with good hashing, since hashing spreads distinct keys, not one key's own volume. I'd fix that with key salting on that customer specifically if it became real, rather than building it in everywhere upfront.

The trade-off: per-region ordering plus a compact id needs no cross-region coordination, at the cost of no single global sequence - fine unless something downstream actually needs one, which is why I asked."`
      },
      {
        id: 'npi-a2',
        type: 'followup',
        title: 'Interview question: consistent hashing versus hash mod N',
        prompt: `An interviewer asks: "Why would you use consistent hashing instead of just doing hash(key) mod N across your servers?" Answer in first person, in about 90 seconds, focused on what actually breaks with mod N and how the ring fixes it.`,
        timeboxSec: 120,
        rubric: `Must-haves: (1) correctly states that hash(key) mod N works fine while N is fixed, so the problem is specifically about changing N; (2) explains that changing N changes almost every key's mod-N result, causing a near-total reshuffle when a server is added or removed; (3) describes the ring mechanism at least briefly: nodes and keys both hashed onto a circular space, a key assigned to the next node clockwise; (4) states the actual benefit correctly: adding or removing a node only moves the keys in the arc adjacent to that node, not the whole keyspace; (5) mentions virtual nodes as the fix for uneven load when only one point per physical node is used; (6) does not overstate the benefit - correctly describes it as "a small, bounded fraction of keys move," not "no keys move." Common mistakes: describing consistent hashing without ever explaining what specifically is wrong with mod N; forgetting to mention virtual nodes; claiming consistent hashing eliminates rebalancing entirely rather than shrinking it. {{HONESTY}}`,
        model: `"Hash of key mod N works fine as long as N, the server count, never changes. The problem is what happens when it does. Add or remove one server and N changes, so for almost every key, hash(key) mod N now points at a different server - adding one server to a ten-server cluster can reshuffle close to all the data, not just a tenth, because mod N for N and mod N for N plus one have no relationship to each other.

Consistent hashing doesn't tie the assignment to N at all. I hash the servers onto points on a circle, a ring, and hash each key onto the same ring, assigning it to whichever server's point comes next clockwise. When a server joins, it only takes the arc between itself and the previous server; every other server's arc is untouched. When one leaves, only its arc's keys move, to the next server clockwise. So instead of a near-total reshuffle, a small, bounded fraction of keys move - roughly one over the new server count.

One addition matters in practice: with just one point per server, its share of the ring depends on chance, so one could get a much bigger arc than another. Real implementations give each server many points - virtual nodes - spread around the ring, so load evens out instead of depending on where one random point fell."`
      },
      {
        id: 'npi-a3',
        type: 'drill',
        title: 'Practice: work the Bloom filter false-positive rate',
        prompt: `Practice problem. You are sizing a Bloom filter for 500,000 inserted items, and you want to keep the false-positive rate under roughly 1 percent. Using 10 bits per item and the optimal number of hash functions, is that target met? Show the arithmetic.`,
        timeboxSec: 420,
        rubric: `Must-haves: (1) states the formula p = (1 - e^(-kn/m))^k with each symbol defined; (2) computes m from the given bits-per-item: m = 10 * 500,000 = 5,000,000; (3) computes the optimal k using k = (m/n) * ln(2), getting (5,000,000/500,000) * 0.693 = 10 * 0.693 ≈ 6.93, rounded to 7; (4) substitutes correctly: exponent -kn/m = -7/10 = -0.7, e^-0.7 ≈ 0.497, so 1 - 0.497 = 0.503, and 0.503^7 is computed to roughly 0.008; (5) states the conclusion correctly: about 0.8 percent, which is under the 1 percent target, and expresses it as roughly 1 in 122 checks; (6) notes that the result does not depend on n and m individually, only on the ratio m/n (bits per item), which is why "10 bits per item" was enough information without needing n and m as separate numbers for the final answer. Common mistakes: forgetting to round k to a whole number of hash functions; arithmetic errors in the exponent; not stating the conclusion relative to the 1 percent target. {{HONESTY}}`,
        model: `"The formula is p equals (1 minus e to the power of minus k n over m) to the power of k, where m is the bits in the array, n is the inserted items, k is the hash function count, and p is the false-positive probability.

With 10 bits per item and 500,000 items, m is 10 times 500,000, or 5,000,000 bits. The optimal k is m over n times the natural log of 2 - m over n here is just the bits-per-item ratio, 10, so k is 10 times 0.693, or 6.93, rounded to 7.

Plugging k equals 7 and m over n equals 10 in: the exponent is minus k n over m, minus 7 over 10, minus 0.7. e to the minus 0.7 is about 0.497, so 1 minus 0.497 is 0.503, raised to the 7th power. That comes out to about 0.008.

So the false-positive rate is about 0.8 percent, roughly 1 wrong answer in every 122 checks against an absent item - under the 1 percent target, so 10 bits per item is enough. Worth noting: the answer only depends on the bits-per-item ratio, not the raw count of 500,000; the same budget gives the same rate whether there are five hundred thousand items or five million."`
      }
    ],
    sayQuestion: null,
    sayItOutLoud: null,
    readings: [
      { l: 'PRIMER: ByteByteGo - SQL vs NoSQL: Choosing the Right Database', u: 'https://blog.bytebytego.com/p/sql-vs-nosql-choosing-the-right-database', w: 'A practical decision framework for the choice this chapter opens with, including where NewSQL (relational databases redesigned to scale like a distributed store while keeping SQL and transactions) sits between the two.', m: 10 },
      { l: 'Video: Consistent Hashing | Algorithms You Should Know #1', u: 'https://www.youtube.com/watch?v=UF9Iqmg94tk', w: 'Watch the ring and the virtual nodes move as servers join and leave; the motion is the whole point of the technique.', m: 12 },
      { l: 'Video: Design a Unique Id Generator in a Distributed System (Snowflake Algorithm)', u: 'https://www.youtube.com/watch?v=g3BV_holJK4', w: 'Walks the bit layout of a Snowflake id and the clock-going-backward failure mode this chapter covers.', m: 15 },
      { l: 'Wikipedia - Bloom filter', u: 'https://en.wikipedia.org/wiki/Bloom_filter', w: 'States the false-positive formula this chapter works an example through, along with the optimal-k derivation.', m: 12 },
      { l: 'MongoDB docs - BSON Types (ObjectId)', u: 'https://www.mongodb.com/docs/manual/reference/bson-types/', w: 'The exact byte layout of a real, shipped distributed id, useful to compare directly against Snowflake\'s layout.', m: 8 },
      { l: 'AWS Database Blog - Choosing the Right DynamoDB Partition Key', u: 'https://aws.amazon.com/blogs/database/choosing-the-right-dynamodb-partition-key', w: 'A production explanation of hot partitions and the salting fix, from the team operating the store.', m: 12 },
      { l: 'Use The Index, Luke - Fetch the Next Page', u: 'https://use-the-index-luke.com/sql/partial-results/fetch-next-page', w: 'The seek method (keyset pagination) explained against offset pagination, with the exact index behaviour that makes it fast.', m: 15 },
      { l: 'Google Cloud docs - Storage classes', u: 'https://cloud.google.com/storage/docs/storage-classes', w: 'A clean, concrete example of a hot-to-cold tiering ladder with the access-frequency thresholds that justify each tier.', m: 8 }
    ],
    glossary: [
      {
        g: 'NoSQL, sharding and IDs',
        sub: '',
        rows: [
          ['Key-value store', 'Lookup by exactly one key, no other query; example: Redis', 'store families'],
          ['Document store', 'Self-contained, queryable nested records; example: MongoDB', 'store families'],
          ['Wide-column store', 'Rows with flexible column sets, built for high write throughput; example: Cassandra', 'store families'],
          ['Graph database', 'Nodes and relationships, optimised for traversal; example: Neo4j', 'store families'],
          ['Hot partition', 'A single shard receiving disproportionate traffic', 'sharding'],
          ['Key salting', 'Appending a random suffix to a hot key to spread its writes across sub-keys', 'hot partitions'],
          ['Consistent hashing', 'A ring-based hashing scheme that limits data movement when nodes join or leave', 'partitioning'],
          ['Virtual node', 'Several ring points per physical node, used to even out load', 'consistent hashing'],
          ['Snowflake-style id', '64-bit id packed from a timestamp, machine id and sequence number', 'distributed ids'],
          ['Clock skew', 'A machine\'s clock disagreeing with real time, threatening timestamp-based id ordering', 'distributed ids'],
          ['Keyset pagination', 'Paging by the last key seen rather than by position, stable under concurrent writes', 'pagination'],
          ['Bloom filter', 'A bit array plus k hash functions that can rule out membership for free', 'probabilistic structures'],
          ['False-positive rate', 'How often a Bloom filter wrongly claims an absent item is present', 'Bloom filters'],
          ['Hot and cold storage', 'Matching each tier\'s cost and speed to how often the data on it is actually read', 'storage tiering']
        ]
      }
    ]
  };

}(typeof window !== 'undefined' ? window : this));
