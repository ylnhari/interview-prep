# Independent systems cross-review - 2026-10-11

Baseline: abd4b97ad27c9b2c95a8409a49b018fd9a5311fe. Independent second review of 15 chapters, 145 lessons and 45 practices (190 stable section IDs). Effective core was evaluated library-first then all core modules in filename order. This includes the new systems corrections; root owns the separately versioned assessment corrections and publication.

Review covered all lesson bodies/deeper explanations and practice prompts/models, the selected correct quiz answers, and practice rubrics. Formula review included BM25, Bloom filter sizing, quorum intersection, Amdahl speedup, error budgets, capacity, ring ownership and rank fusion. Resource validation was selective primary-source verification, not exhaustive availability/video playback.

## Findings and independent evidence

- The original 450 replicas at 300 RPS lose one of three equal zones and retain only 90,000 RPS, below the 100,000 target. Original 135 retain 27,000 below 30,000. The new 540 and 165 retain 108,000 and 33,000: independently checked arithmetic. Rollback still requires compatible state/features and tested timing.
- QUIC separates stream delivery ordering but one packet may carry frames from several streams; shared congestion remains. This removes cross-stream byte blocking, not TCP reliability. [QUIC RFC 9000](https://www.rfc-editor.org/rfc/rfc9000.html).
- PostgreSQL row write locks do not block ordinary MVCC snapshot reads; table ACCESS EXCLUSIVE is different. PostgreSQL repeatable read prevents phantoms while the SQL minimum definition allows them. [Isolation](https://www.postgresql.org/docs/current/transaction-iso.html), [locking](https://www.postgresql.org/docs/current/explicit-locking.html). Cursor movement does not create a snapshot; index-only visibility and suffix scanning depend on engine and plan.
- Archive does not universally require offline restoration: Google Archive remains online; S3 Glacier Instant Retrieval differs from Flexible Retrieval/Deep Archive. [Google classes](https://docs.cloud.google.com/storage/docs/storage-classes), [S3 restoration](https://docs.aws.amazon.com/AmazonS3/latest/userguide/restoring-objects.html).
- A stable Kafka entity key preserves partition append order under ordered producers and serial effects, not business order across arbitrary concurrent producers/retries. The revised qs-a3 explicitly declares those assumptions and adds sequence/outbox recovery.
- RRF rewards agreement without guaranteeing that every two-list document outranks a one-list document: k=60 gives rank100/100 score 2/160=0.0125 versus rank1 in one list 1/61=0.01639. [Elastic RRF formula](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/reciprocal-rank-fusion). Lexical retrieval can include synonym rewrites; plain shared-term matching is a baseline assumption.
- Current CockroachDB uses Pebble rather than the old RocksDB example. [Official storage layer](https://docs.cockroachlabs.com/docs/stable/architecture/storage-layer).
- Raft counting-majority commitment is restricted to current-term entries; prior entries commit indirectly. [Raft section 5.4.2](https://raft.github.io/raft.pdf). The updated diagram and prose agree.
- Protobuf generated local types do not prove independently deployed schema/semantic compatibility. Reported apc-f2/a3 overstatement.
- Monotonic reads do not forbid a legitimate newer friend deletion. A linearizable read can reflect a later write, rather than forever returning one transfer's value. Reported dc-2 examples.
- CMS frequency bounds require nonnegative increments and suitable hashes without overflow. DDSketch needs its supported value range and store policy stated; bounded collapsing stores change low-quantile guarantees. [DDSketch paper](https://arxiv.org/pdf/1908.10693). The between-component percentile bound needs the inverse-CDF convention: lower/interpolated sample conventions can violate it (two sets [0,100] each lower p99=0, pooled lower p99=100).

## Limits and verification

Systems regression suite passed: IDs, complete quiz objects, routes, assumptions and arithmetic. Practice second-round corrections passed its compatibility suite. Changed system diagram mechanisms were independently inspected: B+ separators route key 62 correctly; capacity diagram computes 4.6 GB/s; RRF order A,B,D,C matches sums; quorum caption no longer asserts intersection alone guarantees latest reads; Raft caption includes the current-term rule. This is static mechanism/diff review, not a claim that every diagram's complete animation or pixel layout was visually inspected.

No database, Kafka cluster, payment processor, TLS exchange, screen reader or responsive browser was executed by this reviewer. All reported findings were sent to root; the matrix records discovery, not a blanket claim that every final correction is already published. Private content was not accessed.

## Section coverage

Reviewed means editorial/technical examination under the limits above, not certification of runtime behavior.

| Chapter | Section ID | Result |
| --- | --- | --- |
| system-design-fundamentals | sdf-0 | Reviewed; no additional evidenced defect in this pass |
| system-design-fundamentals | sdf-f1 | Reviewed; no additional evidenced defect in this pass |
| system-design-fundamentals | sdf-f2 | Reviewed; no additional evidenced defect in this pass |
| system-design-fundamentals | sdf-f2b | Reviewed; no additional evidenced defect in this pass |
| system-design-fundamentals | sdf-f3 | Reviewed; no additional evidenced defect in this pass |
| system-design-fundamentals | sdf-f4 | Reviewed; no additional evidenced defect in this pass |
| system-design-fundamentals | sdf-f5 | Reviewed; no additional evidenced defect in this pass |
| system-design-fundamentals | sdf-f6 | Reviewed; no additional evidenced defect in this pass |
| system-design-fundamentals | sdf-a1 | Reported zone-loss arithmetic and rollback qualification; corrected upstream |
| system-design-fundamentals | sdf-a2 | Reported volatile durability and TTL origin-age assumptions; corrected upstream |
| system-design-fundamentals | sdf-a3 | Reported zone-loss arithmetic; corrected upstream |
| networking-basics | nb-0 | Independently checked resolver retry distinction |
| networking-basics | nb-layers | Reviewed; no additional evidenced defect in this pass |
| networking-basics | nb-f2 | Reported QUIC reliability wording; corrected upstream |
| networking-basics | nb-f3 | Reported multi-stream packet loss; revised assessment handled by root |
| networking-basics | nb-f4 | Independently verified TLS version-specific resumption |
| networking-basics | nb-f5 | Reviewed; no additional evidenced defect in this pass |
| networking-basics | nb-f6 | Reviewed; no additional evidenced defect in this pass |
| networking-basics | nb-f7 | Reviewed; no additional evidenced defect in this pass |
| networking-basics | nb-a1 | Reviewed; no additional evidenced defect in this pass |
| networking-basics | nb-a2 | Reviewed; no additional evidenced defect in this pass |
| networking-basics | nb-a3 | Reviewed; no additional evidenced defect in this pass |
| requirements-and-capacity | rac-0 | Reviewed; no additional evidenced defect in this pass |
| requirements-and-capacity | rac-f1 | Reviewed; no additional evidenced defect in this pass |
| requirements-and-capacity | rac-f2 | Reviewed; no additional evidenced defect in this pass |
| requirements-and-capacity | rac-f3 | Reviewed; no additional evidenced defect in this pass |
| requirements-and-capacity | rac-f4 | Reviewed; no additional evidenced defect in this pass |
| requirements-and-capacity | rac-f5 | Reviewed; no additional evidenced defect in this pass |
| requirements-and-capacity | rac-f6 | Reviewed; no additional evidenced defect in this pass |
| requirements-and-capacity | rac-f7 | Reviewed; no additional evidenced defect in this pass |
| requirements-and-capacity | rac-f8 | Reviewed; no additional evidenced defect in this pass |
| requirements-and-capacity | rac-a1 | Reviewed; no additional evidenced defect in this pass |
| requirements-and-capacity | rac-a2 | Reviewed; no additional evidenced defect in this pass |
| requirements-and-capacity | rac-a3 | Reviewed; no additional evidenced defect in this pass |
| apis-and-communication | apc-0 | Reviewed; no additional evidenced defect in this pass |
| apis-and-communication | apc-f1 | Independently checked stable-key cursor versus snapshot traversal |
| apis-and-communication | apc-f2 | Reported protobuf local typing versus deployment compatibility |
| apis-and-communication | apc-f3 | Reviewed; no additional evidenced defect in this pass |
| apis-and-communication | apc-f4 | Reviewed; no additional evidenced defect in this pass |
| apis-and-communication | apc-f5 | Reviewed; no additional evidenced defect in this pass |
| apis-and-communication | apc-f6 | Reviewed; no additional evidenced defect in this pass |
| apis-and-communication | apc-f7 | Reviewed; no additional evidenced defect in this pass |
| apis-and-communication | apc-f8 | Reported explicit independence assumption before fanout arithmetic |
| apis-and-communication | apc-a1 | Reviewed; no additional evidenced defect in this pass |
| apis-and-communication | apc-a2 | Reviewed; no additional evidenced defect in this pass |
| apis-and-communication | apc-a3 | Reported protobuf local typing versus deployment compatibility |
| sql-databases | sql-0 | Reported row-lock versus table-lock distinction |
| sql-databases | sql-f1 | Reviewed; no additional evidenced defect in this pass |
| sql-databases | sql-f2 | Independently checked suffix scan/visibility qualification; reported hide-index engine scope |
| sql-databases | sql-f3 | Reviewed; no additional evidenced defect in this pass |
| sql-databases | sql-f4 | Reviewed; no additional evidenced defect in this pass |
| sql-databases | sql-f5 | Independently checked PostgreSQL snapshot/locks |
| sql-databases | sql-f6 | Independently checked MVCC engine-specific wording |
| sql-databases | sql-f7 | Reviewed; no additional evidenced defect in this pass |
| sql-databases | sql-f8 | Reported asynchronous lag versus strict session guarantee |
| sql-databases | sql-f9 | Independently checked migration concurrency and rollback contract |
| sql-databases | sql-a1 | Reviewed; no additional evidenced defect in this pass |
| sql-databases | sql-a2 | Reviewed; no additional evidenced defect in this pass |
| sql-databases | sql-a3 | Independently checked PostgreSQL repeatable-read phantom behavior |
| nosql-partitioning-ids | npi-0 | Reviewed; no additional evidenced defect in this pass |
| nosql-partitioning-ids | npi-f1 | Reviewed; no additional evidenced defect in this pass |
| nosql-partitioning-ids | npi-f2 | Reported Cassandra CQL declared schema; corrected upstream |
| nosql-partitioning-ids | npi-f3 | Reviewed; no additional evidenced defect in this pass |
| nosql-partitioning-ids | npi-f4 | Reviewed; no additional evidenced defect in this pass |
| nosql-partitioning-ids | npi-f5 | Reviewed; no additional evidenced defect in this pass |
| nosql-partitioning-ids | npi-f6 | Reviewed; no additional evidenced defect in this pass |
| nosql-partitioning-ids | npi-f7 | Reviewed; no additional evidenced defect in this pass |
| nosql-partitioning-ids | npi-f8 | Reviewed; no additional evidenced defect in this pass |
| nosql-partitioning-ids | npi-f9 | Reported archive online access versus restore; corrected upstream |
| nosql-partitioning-ids | npi-a1 | Reviewed; no additional evidenced defect in this pass |
| nosql-partitioning-ids | npi-a2 | Reviewed; no additional evidenced defect in this pass |
| nosql-partitioning-ids | npi-a3 | Reviewed; no additional evidenced defect in this pass |
| caching | cache-0 | Reported skewed working-set hit-rate claim |
| caching | cache-1 | Independently checked database-managed buffer distinction |
| caching | cache-2 | Reviewed; no additional evidenced defect in this pass |
| caching | cache-3 | Reviewed; no additional evidenced defect in this pass |
| caching | cache-4 | Reviewed; no additional evidenced defect in this pass |
| caching | cache-5 | Reviewed; no additional evidenced defect in this pass |
| caching | cache-6 | Reviewed; no additional evidenced defect in this pass |
| caching | cache-7 | Reviewed; no additional evidenced defect in this pass |
| caching | cache-8 | Reviewed; no additional evidenced defect in this pass |
| caching | cache-9 | Reviewed; no additional evidenced defect in this pass |
| caching | cache-a1 | Reported origin staleness/refill conditions |
| caching | cache-a2 | Reviewed; no additional evidenced defect in this pass |
| caching | cache-a3 | Reviewed; no additional evidenced defect in this pass |
| distributed-coordination | dc-0 | Reviewed; no additional evidenced defect in this pass |
| distributed-coordination | dc-1 | Reviewed; no additional evidenced defect in this pass |
| distributed-coordination | dc-2 | Reported legitimate later writes/deletions and session monotonicity qualification |
| distributed-coordination | dc-3 | Reviewed; no additional evidenced defect in this pass |
| distributed-coordination | dc-4 | Reviewed; no additional evidenced defect in this pass |
| distributed-coordination | dc-5 | Reviewed; no additional evidenced defect in this pass |
| distributed-coordination | dc-6 | Independently checked Raft current-term commitment rule |
| distributed-coordination | dc-6b | Independently checked atomic commit versus isolation/compensation boundaries |
| distributed-coordination | dc-7 | Reviewed; no additional evidenced defect in this pass |
| distributed-coordination | dc-8 | Reviewed; no additional evidenced defect in this pass |
| distributed-coordination | dc-9 | Reviewed; no additional evidenced defect in this pass |
| distributed-coordination | dc-a1 | Reviewed; no additional evidenced defect in this pass |
| distributed-coordination | dc-a2 | Reviewed; no additional evidenced defect in this pass |
| distributed-coordination | dc-a3 | Reviewed; no additional evidenced defect in this pass |
| storage-engines | se-0 | Reviewed; no additional evidenced defect in this pass |
| storage-engines | se-f1 | Reviewed; no additional evidenced defect in this pass |
| storage-engines | se-f2 | Reviewed; no additional evidenced defect in this pass |
| storage-engines | se-f3 | Reviewed; no additional evidenced defect in this pass |
| storage-engines | se-f4 | Reviewed; no additional evidenced defect in this pass |
| storage-engines | se-f5 | Reported current CockroachDB Pebble engine |
| storage-engines | se-f6 | Reviewed; no additional evidenced defect in this pass |
| storage-engines | se-f7 | Reviewed; no additional evidenced defect in this pass |
| storage-engines | se-f8 | Reviewed; no additional evidenced defect in this pass |
| storage-engines | se-a1 | Reviewed; no additional evidenced defect in this pass |
| storage-engines | se-a2 | Reviewed; no additional evidenced defect in this pass |
| storage-engines | se-a3 | Reviewed; no additional evidenced defect in this pass |
| queues-and-streams | qs-0 | Reviewed; no additional evidenced defect in this pass |
| queues-and-streams | qs-f1 | Reviewed; no additional evidenced defect in this pass |
| queues-and-streams | qs-f2 | Reviewed; no additional evidenced defect in this pass |
| queues-and-streams | qs-f2b | Reviewed; no additional evidenced defect in this pass |
| queues-and-streams | qs-f3 | Reviewed; no additional evidenced defect in this pass |
| queues-and-streams | qs-f4 | Reviewed; no additional evidenced defect in this pass |
| queues-and-streams | qs-f5 | Reviewed; no additional evidenced defect in this pass |
| queues-and-streams | qs-f6 | Independently checked fencing resource enforcement and corrected anchor |
| queues-and-streams | qs-f7 | Reviewed; no additional evidenced defect in this pass |
| queues-and-streams | qs-f8 | Reviewed; no additional evidenced defect in this pass |
| queues-and-streams | qs-f9 | Reviewed; no additional evidenced defect in this pass |
| queues-and-streams | qs-a1 | Independently checked reservation terminal-state race and unknown payment |
| queues-and-streams | qs-a2 | Reviewed; no additional evidenced defect in this pass |
| queues-and-streams | qs-a3 | Reported append order versus business order; corrected upstream |
| search-and-retrieval | sr-0 | Reviewed; no additional evidenced defect in this pass |
| search-and-retrieval | sr-f1 | Reviewed; no additional evidenced defect in this pass |
| search-and-retrieval | sr-f2 | Independently checked raw-count TF-IDF/BM25 distinction |
| search-and-retrieval | sr-f3 | Reviewed; no additional evidenced defect in this pass |
| search-and-retrieval | sr-f4 | Reviewed; no additional evidenced defect in this pass |
| search-and-retrieval | sr-f5 | Reviewed; no additional evidenced defect in this pass |
| search-and-retrieval | sr-f6 | Reviewed; no additional evidenced defect in this pass |
| search-and-retrieval | sr-f7 | Reviewed; no additional evidenced defect in this pass |
| search-and-retrieval | sr-f8 | Reviewed; no additional evidenced defect in this pass |
| search-and-retrieval | sr-f9 | Reviewed; no additional evidenced defect in this pass |
| search-and-retrieval | sr-a1 | Reviewed; no additional evidenced defect in this pass |
| search-and-retrieval | sr-a2 | Reported RRF universal agreement claim and lexical analyzer qualification |
| search-and-retrieval | sr-a3 | Reviewed; no additional evidenced defect in this pass |
| counting-and-sketches | cs-0 | Reviewed; no additional evidenced defect in this pass |
| counting-and-sketches | cs-f1 | Reviewed; no additional evidenced defect in this pass |
| counting-and-sketches | cs-f2 | Reviewed; no additional evidenced defect in this pass |
| counting-and-sketches | cs-f3 | Reviewed; no additional evidenced defect in this pass |
| counting-and-sketches | cs-f4 | Reported nonnegative-update/hash/overflow assumptions |
| counting-and-sketches | cs-f5 | Reviewed; no additional evidenced defect in this pass |
| counting-and-sketches | cs-f6 | Reviewed; no additional evidenced defect in this pass |
| counting-and-sketches | cs-f7 | Reported DDSketch range/store assumptions and percentile-convention scope |
| counting-and-sketches | cs-f8 | Reviewed; no additional evidenced defect in this pass |
| counting-and-sketches | cs-a1 | Reviewed; no additional evidenced defect in this pass |
| counting-and-sketches | cs-a2 | Reviewed; no additional evidenced defect in this pass |
| counting-and-sketches | cs-a3 | Reported explicit inverse-CDF convention needed for quantile bound |
| realtime-and-feeds | rf-0 | Reviewed; no additional evidenced defect in this pass |
| realtime-and-feeds | rf-f1 | Reviewed; no additional evidenced defect in this pass |
| realtime-and-feeds | rf-f2 | Reviewed; no additional evidenced defect in this pass |
| realtime-and-feeds | rf-f3 | Reviewed; no additional evidenced defect in this pass |
| realtime-and-feeds | rf-f4 | Reviewed; no additional evidenced defect in this pass |
| realtime-and-feeds | rf-f5 | Reviewed; no additional evidenced defect in this pass |
| realtime-and-feeds | rf-f6 | Reviewed; no additional evidenced defect in this pass |
| realtime-and-feeds | rf-f7 | Reviewed; no additional evidenced defect in this pass |
| realtime-and-feeds | rf-f8 | Reviewed; no additional evidenced defect in this pass |
| realtime-and-feeds | rf-a1 | Reviewed; no additional evidenced defect in this pass |
| realtime-and-feeds | rf-a2 | Reviewed; no additional evidenced defect in this pass |
| realtime-and-feeds | rf-a3 | Reviewed; no additional evidenced defect in this pass |
| sre-practices | srep-0 | Reviewed; no additional evidenced defect in this pass |
| sre-practices | srep-f1 | Reviewed; no additional evidenced defect in this pass |
| sre-practices | srep-f2 | Reviewed; no additional evidenced defect in this pass |
| sre-practices | srep-f3 | Reviewed; no additional evidenced defect in this pass |
| sre-practices | srep-f4 | Reviewed; no additional evidenced defect in this pass |
| sre-practices | srep-f5 | Reviewed; no additional evidenced defect in this pass |
| sre-practices | srep-f6 | Reported approximate counter versus exact sliding log distinction |
| sre-practices | srep-f7 | Reviewed; no additional evidenced defect in this pass |
| sre-practices | srep-f8 | Reviewed; no additional evidenced defect in this pass |
| sre-practices | srep-f9 | Reviewed; no additional evidenced defect in this pass |
| sre-practices | srep-a1 | Reviewed; no additional evidenced defect in this pass |
| sre-practices | srep-a2 | Reviewed; no additional evidenced defect in this pass |
| sre-practices | srep-a3 | Reviewed; no additional evidenced defect in this pass |
| system-design-cases | sdc-0 | Reviewed; no additional evidenced defect in this pass |
| system-design-cases | sdc-1 | Reviewed; no additional evidenced defect in this pass |
| system-design-cases | sdc-2 | Reviewed; no additional evidenced defect in this pass |
| system-design-cases | sdc-3 | Reviewed; no additional evidenced defect in this pass |
| system-design-cases | sdc-4 | Reviewed; no additional evidenced defect in this pass |
| system-design-cases | sdc-5 | Reviewed; no additional evidenced defect in this pass |
| system-design-cases | sdc-6 | Reviewed; no additional evidenced defect in this pass |
| system-design-cases | sdc-7 | Reviewed; no additional evidenced defect in this pass |
| system-design-cases | sdc-8 | Reviewed; no additional evidenced defect in this pass |
| system-design-cases | sdc-9 | Reviewed; no additional evidenced defect in this pass |
| system-design-cases | sdc-10 | Independently checked source permission, TTFT stages and disclosure boundary |
| system-design-cases | sdc-enterprise-features | Reviewed; no additional evidenced defect in this pass |
| system-design-cases | sdc-a1 | Reviewed; no additional evidenced defect in this pass |
| system-design-cases | sdc-a2 | Reviewed; no additional evidenced defect in this pass |
| system-design-cases | sdc-a3 | Reviewed; no additional evidenced defect in this pass |
