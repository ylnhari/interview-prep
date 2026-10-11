# Diagram findings disposition — 2026-10-11

Baseline: `abd4b97ad27c9b2c95a8409a49b018fd9a5311fe`.

All 33 assigned external technical findings below were independently checked against the actual source. Every row is **accepted and fixed**. Original diagram IDs and content/progress IDs remain unchanged. Source anchors name the definition inside `engine/viz/` (except `engine/viz-lib.js`). Numerical assertions inspect rendered SVG coordinates rather than accepting labels alone.

| Finding | Source / definition | Resolution | Evidence |
| --- | --- | --- | --- |
| PT07 | ml-foundations-c.js / fastapi-serving | Validation-to-client 422 arrow; end-to-end admission/queue/features/inference deadline; GPU cancellation caveat | actual arrow path + caption assertions |
| PT13 | viz-lib.js / vector-similarity | Cosine top-three recalculated relative to origin (70,190) and query (226,108) | actual highlighted coordinates independently ranked |
| PT14 | viz-lib.js / canary-rollout | Widths 3/15/75/300 represent 1/5/25/100%; traffic rollback qualification | actual bar widths |
| PT15 | viz-lib.js / scale-test-3x | x offered-load multiple, y p99 ms; vertical 1x peak; horizontal 200ms budget; 3x =260ms exceeds it | actual x centres and latency values |
| PT16 | viz-lib.js / rollback-path | Arrow, target and v3 label point to x470 | actual arrow target |
| MLF07 | ml-foundations-a.js / softmax-temperature | Low-temperature unique-maximum premise and tied-maxima limit explicit | caption review |
| MLF09 | ml-foundations-c.js / conv-receptive-field | Stride/dilation-one assumption; general channel weight formula; equal-width 18C² vs25C² | formula review |
| MLF10 | ml-foundations-c.js / lr-schedule | Warm-up depends on recipe; Pre-LN counterexample retained | primary paper below; caption review |
| MLF15 | ml-foundations-b.js / calibration-curve | Plot generated from explicit predicted/observed probabilities below diagonal | recovered coordinates verify observed<predicted |
| MLF16 | ml-foundations-b.js / roc-vs-pr | Single threshold fixture drives both curves, AUC0.82113, prevalence.001, PR axis explicitly zoomed | recovered actual ROC/PR coordinates, AUC and baseline |
| MLF17 | ml-foundations-b.js / tree-split | Displayed 7/3 split: left20/49, right0, weighted2/7, gain3/14 | Gini recomputed from actual colored points |
| MLF18 | ml-foundations-b.js / svm-margin | Exact hard-margin fixture, correct support planes and circled points; qualified nonsupport movement | actual boundary endpoints and all signed margins |
| MLF19 | ml-foundations-b.js / ridge-vs-lasso | Nonzero unconstrained optimum; coefficient axes; true unit-L2 radial projection and unit-L1 corner contact | actual feasible coordinates/tangency |
| MLF20 | ml-foundations-a.js / gradient-descent-bowl | Objective theta²; eta.2; actual recurrence theta_next=.6theta drives points | actual iterate coordinates and objective values |
| MLF21 | ml-foundations-a.js / learning-curves | Narrowing gap alone does not exclude bias | caption/label review |
| MLF22 | ml-foundations-c.js / backprop-two-layer | Incoming dL/da_A=-.51749, post-ReLU dL/dz_A=0; output weights and bias stated | independent sigmoid and derivative fixture |
| MLF23 | ml-foundations-b.js / kmeans-steps | Cluster means generated from actual plotted points | actual final centroid rectangles |
| MLF24 | ml-foundations-b.js / sigmoid-threshold | Threshold .5 maps to y103, not90 | actual threshold line |
| MLF25 | ml-foundations-a.js / distribution-shift | Parenthesized arithmetic prevents coordinate concatenation | all actual polyline coordinates bounded |
| T16 | viz-lib.js / coverage-vs-width | Same outcome offsets in narrow/wide pair; counts5/8=62.5% and8/8=100% | count labels plus actual bounds |
| SYS01 | sd-information.js / hybrid-rank-fusion | D ranks third under the stated fixture | independent score recomputation |
| T02 | sd-data.js / btree-index | B+ tree separators55/25/70 respect depicted leaf ranges | separator partitions and search62 |
| SYS07 | sd-coordination.js / quorum-w-r-n | Overlap footer no longer guarantees latest write unconditionally | footer assertion |
| SYS08 | sd-operations.js / case-payments-ledger | Atomic PENDING record; stable provider key, scope/retention, unknown reconciliation, atomic terminal journal | diagram/qualified caption review |
| SYS09 | sd-operations.js / expand-contract-migration | Compatible deployments, atomic dual-write/protocol, guarded backfill, parity, retire old writers/rollback | diagram and caption invariants |
| SYS11 | networking.js / http-versions | Packet may carry multiple streams; shared congestion remains | caption and in-diagram qualification |
| SYS12 | sd-storage-async.js / lsm-tree-levels | Synchronous durability illustration scoped, memtable-before-sync possible | heading/caption review |
| SYS18 | sd-operations.js / tenant-isolation | Schema separation is logical; dedicated depicted independent instance means resource isolation | label/caption review |
| SYS19 | sd-foundations.js / tail-latency-hedge | p50 explicitly aggressive roughly50% duplication; measured tail/budget and cancellation caveat | label/caption review |
| SYS21 | networking.js / tcp-handshake | Accepted resumed0-RTT early data requires replay-safe policy; resumption alone insufficient | label/caption review |
| SYS25 | viz-lib.js / circuit-breaker-states | Breaker limits caller harm and dependency load | label/caption review |
| SYS30 | sd-foundations.js / capacity-estimate | 2requests/day, /86400seconds,10xpeak,2MB payload and rounding explicit | dimension and label regression |
| SYS31 | sd-coordination.js / lru-list | Access-C path starts x200; resulting orderC,D,B,A | actual path and order assertion |

## Shared primary evidence

- [Raft paper](https://raft.github.io/raft.pdf), §5.4.2: current-term direct commitment; older-term replication alone is insufficient.
- [QUIC RFC9000](https://www.rfc-editor.org/rfc/rfc9000.html): packets carry frames, independent stream ordering and connection-level congestion.
- [QUIC/TLS RFC9001](https://www.rfc-editor.org/rfc/rfc9001.html): early data acceptance, rejection and replay considerations.
- [FastAPI validation errors](https://fastapi.tiangolo.com/tutorial/handling-errors/): request-validation exception handling.
- [Python asyncio tasks](https://docs.python.org/3/library/asyncio-task.html): timeout/cancellation behavior; a request deadline does not establish a GPU cancellation contract.
- [On Layer Normalization in the Transformer Architecture](https://arxiv.org/abs/2002.04745): Post-LN/Pre-LN differences and a tested no-warm-up Pre-LN recipe.
- [vLLM author explanation](https://vllm.ai/blog/2023-06-20-vllm): last-block memory waste remains.
- The numerical fixtures are directly recomputed from depicted coordinates, counts, objective definitions and dimensional arithmetic. They do not rely on third-party estimates.

## Validation and limits

`node engine/test_review_diagrams.cjs` passes all 204 references / 163 definitions across 45 chapters (158 SVG, five responsive HTML boards). It validates internal markers/names, simple shape bounds and the corrected numerical fixtures. Existing readability, RAG, AI-learning and visual-course tests also pass.

This ledger closes assigned factual/source findings; it does not claim every diagram passed browser pixels, glyph-width/overlap measurement, path-curve clipping or screen-reader testing. The independent UI report and full chapter diagram matrix record those limits. No commit, push or publication was performed by this reviewer.
