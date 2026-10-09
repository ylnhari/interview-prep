# Independent course review follow-up

Reviewed public baseline: `c09d70c3cd386ab2cce73a6d0bd88956e567f6be` (PR 13). Findings were reconciled against effective final-loaded content. This ledger supplements the [original audit](course-redesign-audit.md), domain ledgers and [first follow-up](course-review-followup.md); it does not replace them.

## Systems findings

| ID | Resolution | Evidence |
|---|---|---|
| S1 | `sdc-5` payment check names the provider's actual idempotency scope, parameter comparison, retention and concurrency contract. An identical same-key retry is safe only under that contract; unknown status requires reconciliation. | Effective check/body regression; [Stripe API contract](https://docs.stripe.com/api/idempotent_requests). |
| S2 | `sdc-5` and `sdc-a2` keep balanced journal legs atomic. Account-based sharding requires shard-local clearing with explicit settlement or a real atomic cross-shard mechanism; a shared clearing account can be a hotspot. | Body/rubric/model assertions; [TigerBeetle transfer semantics](https://docs.tigerbeetle.com/reference/transfer/). |
| S3 | `qs-a2` accepts durable RabbitMQ fan-out with persistence, confirms and consumer acknowledgments for pending work through an outage. A retained log is useful for acknowledged-history replay or later consumers; downtime alone does not mandate Kafka. | Effective rubric/model alternatives; [RabbitMQ queues](https://www.rabbitmq.com/docs/queues). |
| S4 | `se-f3` separates an OS-buffer write from the configured persistence/acknowledgment boundary, including `sync=false` and process versus machine failure. Retire WAL only after durable replacement data and publication metadata. | Effective body/deeper/check assertions; [RocksDB basic operations](https://github.com/facebook/rocksdb/wiki/Basic-Operations). |
| S5 | `se-f2` retains tombstones until masked older values can no longer reappear, accounting for snapshots, replication, concurrent writes and crash-safe publication. | Effective body regression; existing displayed storage exercise recovery tests remain in the suite. |
| S6 | `sdc-4` treats presence as best-effort with heartbeat/lease policy and bounded staleness. Durable inbox acknowledgment and retry/replay are separate contracts. | Effective body assertions. |
| S7 | `nb-a1` illustrative request path totals 700 ms (60 + 200 + 200 + 100 + 40 + 100). The separate New York/London diagram remains 228 ms, or 86 ms with a reused connection and its declared DNS assumption. | Arithmetic assertions plus caption/diagram source agreement. |
| S8 | `se-0` defines the write-amplification numerator, denominator and measurement boundary. Compression/deduplication can produce a measured ratio below one; there is no universal lower bound. | Effective glossary assertion. |

## ML and AI findings

| ID | Resolution | Evidence |
|---|---|---|
| T1 | `qb2-3` A7 and `ss-a1` permit a fallback only within its validated population and authorized harm contract. Deferral, review, halt or an unavailable response can be correct. | Bank/model/rubric agreement. |
| T2 | `qb2-6` A1 uses conditional prefill/decode bottlenecks, queue-inclusive TTFT and actual retained KV state; pressure behavior depends on policy. | Effective answer regression. |
| T3 | `dag-f5` gives a January 1 prediction cutoff: a pre-cutoff payment gap may be valid; a January 31 snapshot leaks. `dag-a2` distinguishes a pre-cutoff cancellation start from post-cutoff completion. | Effective question, options, feedback, rubric and model assertions. |
| T4 | `es-f1` and `es-a2` distinguish known-account future prediction from unseen-account generalization. Time correctness, label maturity, dependence and population slices govern the split; an observed gap alone does not prove leakage. | Effective body/deeper/check and activity assertions. |
| T5 | `ss-a2` computes replicas as ceil(peak requests per second / measured per-replica throughput), with headroom afterward. Its example requires 300 replicas before headroom. Spare-capacity strategies are choices; no invented learner operating history. | Arithmetic and model/rubric regression. |
| T6 | `raa-a2` states a synthetic blended price and equal billable-token length per route group for the original one-shot calculation. A changed-length case preserves an 800-token overall average but costs $37,750 rather than $22,000; request share is not token share. | Worked arithmetic assertions for both cases. |
| T7 | `qb2-3` A4 separates HPA desired replicas, controllers creating Pods, scheduler placement and node autoscaler provisioning. | Effective answer assertion. |
| T8 | `qb2-3` A2 and `ss-a1` qualify tail amplification by the dependence between requests. Five independent 1% exceedance events imply about 4.90%; perfectly correlated events imply 1%. Marginal p99 alone does not establish endpoint latency. | Bank/activity agreement and both counterexamples. |

The proposed `mot-local-build-track` SLO defect was withdrawn after reconciliation: 1,000 observed failures against a 500-request budget means burn rate 2. It is retained unchanged with a regression covering those quantities.

## Learning experience and browser findings

| Finding | Resolution | Evidence |
|---|---|---|
| Prerequisite order and omitted background | AI evaluation precedes deep learning; FDE systems precedes requirements and includes search before RAG; staff queues precede coordination. Each path has an optional background check with links; MLE entry diagnostics may be revisited for deeper coding practice. | Effective path prerequisite-order/background assertions. |
| Omitted inherited references | Restore all 32 original readings across classical models, deep learning, training at scale and design cases, preserving curated additions and avoiding URL duplicates. Pack metadata extraction still works without core loaded. | Resource preservation/metadata tests; rendered deep-learning panel contains all nine entries. |
| Featured teaching displaced by inherited videos | Prefer an explicitly featured resource before video/first-resource fallback. | Executed renderer selection function; browser shows curated micrograd rather than inherited 3Blue1Brown. |
| Dense glossary opened by default | Public Key terms starts collapsed as an optional reference. Private default disclosure behavior is preserved. | Renderer regression and browser disclosure state. |
| Role selection loses keyboard focus | Restore focus to the selected role card after rerender. | Browser Enter-key selection retains focus and `aria-pressed=true`; source contract test. |
| Prediction feedback disappears after answer | Preserve open chapter disclosures during progress rerenders; answering keeps the check open and focuses its explanatory status, while retry focuses an option. | Executed renderer harness plus actual browser answer/retry observation. |
| Unsupported chapter introductions | Replace 21 remaining interview-frequency, scoring and role-comparison introductions with practical goals and evidence; keep the subjects and technology examples. | Effective 45-chapter orientation regression and read-only independent metadata review. |

A browser-observed normalization caption also incorrectly said the methods differ only by axis. It now separates BatchNorm training statistics, LayerNorm centering/scaling and RMSNorm root-mean-square scaling without centering, consistent with the diagram and [PyTorch RMSNorm reference](https://docs.pytorch.org/docs/stable/generated/torch.nn.RMSNorm.html).

Learning reviewer final report: pending reconciliation before publication.

## Compatibility and validation scope

Four semantic assessment corrections (`se-f3`, `sdc-5`, `dag-f5`, `es-f1`) have exact old/new quiz hashes and the fresh `independent-review-2026-10-09` version. Historical choices and completion remain recorded; new answers use separate versioned keys. No storage reset or progress-schema change is used.

Current catalogue: 45 chapters, 376 lessons, 309 checks, 129 activities, nine explicitly typed code activities and 206 visual references. The resource census now contains 282 entries and 256 unique URLs. Cookie-free GET checks on 2026-10-09 returned 253 successes and three Cloudflare 403 responses, with no confirmed 404/410. A reachable URL does not establish playback, login requirements or external compute availability. See [machine-readable link results](resource-link-audit.json).

Rendered QA used the supported Codex in-app browser. Both reviewed baseline and patched preview opened all 45 catalogue routes at a 320 px viewport without page-wide horizontal overflow. Patched Back/Forward routes, collapsed resource/reference panels and curated resource choice were inspected. The SQL diagnostic reaches `cdr-f4`; testing/explanation reaches the actual `cdr-testing-explanation` task. Home search returned relevant results for a natural-language latency query, offered a useful empty state and exposed keyboard focus. Contents opened with Enter and closed with Escape, returning focus to its trigger. A synthetic localhost read mark and answer draft survived actual Export/Import controls and reload.

A computed contrast sample of 133 visible home text elements with opaque backgrounds had a minimum ratio 5.94 and no failures under the tested size thresholds. This excludes SVG fill, complex/transparent backgrounds and closed disclosures; it is not a complete WCAG certification. Browser console review found no warning/error during the route sweep. Diagram and code scroll regions have labels in inspected source/rendered examples.

Reduced-motion CSS is covered by source checks; a rendered emulation attempt was interrupted and could not establish the actual OS preference. Native assistive-technology behavior was not tested. CPU mathematical fixtures and extracted learner-visible Python/SQL examples are tested; these do not validate external GPU runtimes, production payment systems, RabbitMQ/RocksDB operation or Hugging Face training kernels.

No private content or account data is included. The separately authorized private Page access inspection made no changes and is not a publication dependency.
