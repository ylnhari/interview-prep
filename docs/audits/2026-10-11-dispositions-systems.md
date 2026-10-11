# Systems follow-up dispositions — 2026-10-11

All assigned T/SYS findings were checked against effective content. Corrections are in core/zzzzzzzz-review-systems.js; engine/test_review_systems.cjs checks the effective mechanisms, IDs and untouched quiz objects. Quiz corrections belong to core/zzzzzzzzz-review-checks.js and engine/test_review_checks.cjs. The original audit covers 190 section IDs; this ledger resolves subsequent independent review findings.

| Finding | Disposition and exact anchors | Regression evidence |
| --- | --- | --- |
| T01 | Fixed SQL glossary and sql-0/sql-f2: suffix scans/skip scan, MVCC heap visibility, lock modes. | Skip scan/Heap Fetches assertions |
| T03 | Fixed sql-f5/sql-f6 exclusive row versus table locks and ordinary SELECT. | Effective-body review; quiz objects preserved |
| T04 | Fixed sql-a3: replica offloads execution, but hot_standby_feedback can retain primary bloat; otherwise replay lag/cancellation. | Feedback assertion |
| T05 | Fixed sql-f8: fixed pinning window is heuristic; strict primary/read-position contract. | Pinning assertion |
| T17 | Fixed sql-0 foreign key: one/multiple columns, eligible unique target, same/other table. | Unique-key assertion |
| T19 | Fixed sql-f1 2NF across every candidate key/non-prime attribute; string split/filter possible but awkward; corrected deeper 2NF example. | Candidate-key assertion |
| SYS03 | Fixed rf-f4: ranked cursor follows actual score/order snapshot; unread arrival watermark separate. | Ranked snapshot assertion |
| SYS04 | Fixed npi-f4: random suffix does not disperse monotonic range hotspot; partition function/leading salt explicit. | Suffix counterexample assertion |
| SYS06 | Fixed dc-6b: atomic commit does not imply global reader isolation. | Effective-body review |
| SYS09 | Fixed srep glossary expand/contract: writer invariants, recoverable dual writes, versioned backfill/parity and rollback retirement. | Effective glossary review |
| SYS10 | Fixed nb-0/nb-f3/apc-0 PATCH: patch media-type operations, not inherently idempotent; HTTP safe intended semantics and cache policy. | Effective-body review |
| SYS11 | Fixed nb-f3/nb-a3/apc-f3 and QUIC glossary: multiple stream frames per packet/shared congestion. | Packet/stream assertions |
| SYS14 | Fixed cache-7/cache-a1/sdf-a2: TTL age since fill, refill/version race and origin-age distinction. | Cache age/checkout assertions |
| SYS15 | Fixed cache-0/cache-1: smaller hot-key cache still useful; evaluate reuse, skew, expiry and origin load. | Hot-skew assertion and 95% hit arithmetic |
| SYS16 | Fixed qs-f4/qs-a3: broker append order versus source business order; producer retries/serial effects/partition changes. | Ordering assumptions assertion |
| SYS17 | Fixed srep glossary: budget units follow request/time SLI; million requests at 99.9% permits 1,000 bad requests. | Arithmetic definition reviewed |
| SYS20 | Fixed dc-7: new grant alone does not revoke old token at sink; atomic install/observed newer token required. | Token installation assertion |
| SYS21 | Fixed nb-0/nb-f4 resumption: TLS 1.3 ordinary full/resumed both 1 RTT; accepted early data/replay policy. | TLS RTT assertion |
| SYS22 | Fixed sdf-f2: authenticated response cache eligibility separate from edge TLS/warm connections/routing benefits. | Warm-origin assertion |
| SYS23 | Fixed sdc-2: redirect semantics separate from freshness/no-store; neither observes every click. | Redirect assertion |
| SYS24 | Fixed nb-f7: weighted L4 canary at connection level; headers/per-request routing need L7. | Weighted L4 assertion |
| SYS26 | Fixed se-f5: CockroachDB current Pebble; MyRocks/TiKV RocksDB. | Pebble assertion |
| SYS27 | Fixed npi-f2 Cassandra declared CQL typed schema versus Bigtable sparse qualifiers. | Effective-body review |
| SYS28 | Fixed apc-f2/apc-a3 local generated types versus deployed schema/semantic compatibility. | Contract-test assertions |
| SYS29 | Fixed qs-0 registry registration compatibility policy, bypass boundary and consumer upgrade distinction. | Registry assertion |
| Additional | Fixed apc-f8 independence assumption at numeric fan-out example. | Independence assertion |
| Additional | Fixed srep-f6 exact log versus approximate counter. | Approximation assertion |
| Additional | Fixed dc-2 legitimate later writes/deletions allowed by consistency guarantees. | Newer deletion assertion |
| Additional | Fixed cs-f4 nonnegative increments/hash/overflow assumptions; scoped quiz. | Insertion assertion and revised-check test |
| Additional | Fixed cs-f7 inverse empirical CDF declared, alternative quantile counterexample, DDSketch zero/range/collapsing-store limits. | Quantile counterexample runtime |
| Additional | Fixed sr-a2 RRF agreement is not universal outranking. | 2/160 < 1/61 runtime |
| Additional | Fixed sdf-a1/sdf-a3 zone capacity arithmetic to 540/165 across equal zones. | Surviving capacity runtime |

Primary evidence: [PostgreSQL indexes](https://www.postgresql.org/docs/current/indexes-multicolumn.html), [index-only visibility](https://www.postgresql.org/docs/current/indexes-index-only-scans.html), [locks](https://www.postgresql.org/docs/current/explicit-locking.html), [hot standby feedback](https://www.postgresql.org/docs/current/hot-standby.html), [foreign keys](https://www.postgresql.org/docs/current/ddl-constraints.html), [HTTP semantics](https://www.rfc-editor.org/rfc/rfc9110.html), [PATCH](https://www.rfc-editor.org/rfc/rfc5789.html), [QUIC](https://www.rfc-editor.org/rfc/rfc9000.html), [TLS 1.3](https://www.rfc-editor.org/rfc/rfc8446.html), [Redis eviction](https://redis.io/docs/latest/develop/reference/eviction/), [Kafka design](https://kafka.apache.org/41/design/design/), [Protobuf evolution](https://protobuf.dev/programming-guides/proto3/), [Cockroach storage](https://www.cockroachlabs.com/docs/stable/architecture/storage-layer), [Bigtable key design](https://docs.cloud.google.com/bigtable/docs/schema-design), [Schema Registry compatibility](https://docs.confluent.io/platform/current/schema-registry/fundamentals/schema-evolution.html), [DDSketch implementation](https://github.com/DataDog/sketches-py), [Count-Min original reference](https://sites.google.com/site/countminsketch/), [RRF definition](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/reciprocal-rank-fusion).

Validation is content/runtime/arithmetic against source definitions. No production database, broker, cache, compiler or storage provider execution was performed; no pixel/accessibility result is claimed here.
