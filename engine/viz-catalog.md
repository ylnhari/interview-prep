# viz-lib catalog

`viz-lib.js` and the files under `viz/` define `window.VIZLIB` (about 170 functions, each taking a `uid` string and returning an inline
`<svg viewBox="0 0 760 H">` string, H between 160 and 232) and `window.VIZLIB_CAPTIONS` (one caption per id,
`<b>`/`<i>` allowed).

Every colour is a CSS variable (`--accent`, `--accent-ink`, `--accent-weak`, `--ink`, `--ink-dim`, `--surface`,
`--surface-2`, `--surface-3`, `--border`, `--good`, `--warning`, `--danger`, `--good-weak`, `--warning-weak`,
`--danger-weak`). Every internal SVG id is prefixed with the `uid` argument, so several diagrams can share a page.
Animation is only ever the shell's classes: `.v-flow`, `.v-flow-slow`, `.v-pulse`, `.v-blink`, `.v-move-x`
(with `style="--dx: Npx"`), `.v-grow` (also carries `transform-box:fill-box` so it scales from its own bottom),
`.v-fade-seq` (children carry `style="--i: n"`), `.v-rotate`. No external resources, no scripts, plain ES5.

Usage: `container.innerHTML = '<div class="viz">' + VIZLIB[id]('u17') + '<div class="cap">' + VIZLIB_CAPTIONS[id] + '</div></div>';`
Pass a different `uid` per instance on the page.

Column key: **id** — what the picture shows (and what moves) — concepts it fits in a mapping pass.

## Loops and decisions

- `flow-forecast-optimize-act` — four boxes, forecast to optimize to act to observe, with a feedback line back to forecast; a dot travels the return leg and the forward hops flow. Fits: decision systems, forecast-driven planning, plan-act-learn loops, "closed loop business process".
- `closed-loop` — setpoint, summing junction, controller, plant, sensor feedback; the error arrow pulses. Fits: control theory, feedback control, MPC, SRE control loops, self-correcting systems.
- `open-vs-closed-loop` — split panel: a blind plan with a growing drift wedge vs a plan re-measured and corrected with a bounded error bar. Fits: why measurement matters, static plans vs adaptive plans, batch schedules vs live re-planning.
- `receding-horizon` — three cycles of horizon slots; the first slot is committed (accent), the rest are a plan, and the window slides right each cycle. Fits: model predictive control, rolling plans, re-planning cadence, commitment vs flexibility.
- `mdp-loop` — agent and environment exchanging action and next state, with a dashed delayed-reward return that blinks. Fits: reinforcement learning basics, MDP framing, delayed reward, sequential decisions.
- `bandit-vs-rl` — left: one context, three arms, immediate rewards; right: a state chain with a delayed return credited backwards. Fits: bandits vs RL, exploration, when RL is overkill, credit assignment.

## Optimization

- `assignment-matrix` — tickets by engineers grid; the chosen cells light up in sequence and per-engineer capacity bars grow. Fits: assignment problems, scheduling, dispatch, matching, capacity constraints, integer programming.
- `vrp-routes` — depot with three routes drawn one vehicle at a time, stops as nodes, time-window tags on the right. Fits: vehicle routing, field service scheduling, logistics optimization, time windows.
- `exact-vs-metaheuristic-landscape` — a bumpy objective curve with a dashed proven bound and an exact optimum marker, plus a search dot wandering out of a local dip. Fits: exact solvers vs heuristics, local optima, solver selection, MILP vs metaheuristics.
- `simulated-annealing-temperature` — a cooling temperature curve above a row of moves that shift from accepted (good) to rejected (danger). Fits: simulated annealing, local search, exploration schedules, acceptance criteria.
- `hard-vs-soft-constraint` — a wall the solution cannot cross vs a crossable target line with a growing penalty meter. Fits: constraint modelling, feasibility vs preference, penalty terms, SLA as objective vs SLA as rule.
- `optimality-gap` — best-found and proven-bound curves converging with the gap shaded, and a pulsing "gap 2%" badge. Fits: solution quality claims, stopping criteria, MIP gap, how to report optimizer results.

## Forecasting and statistics

- `quantile-band-forecast` — history line, a "now" divider, then a p10/p50/p90 fan that grows into the future. Fits: probabilistic forecasting, quantile regression, capacity planning against a range, uncertainty communication.
- `ci-vs-pi-band` — scatter with a fitted line inside a narrow confidence band inside a wider prediction band, both pinching at the mean of x. Fits: confidence vs prediction intervals, regression inference, why the interval widens away from the mean.
- `jackknife-refits` — points with one dropped at a time, a refit line per pass, and a spread of resulting forecasts on the right. Fits: leave-one-out, resampling, influence of a single observation, small-sample uncertainty.
- `rolling-origin-backtest` — four folds with a growing train block, a moving test block, and hit/miss marks. Fits: time-series validation, walk-forward testing, leakage-free evaluation, backtesting cadence.
- `coverage-vs-width` — narrow intervals with misses vs wide intervals that cover, plus two coverage gauges. Fits: interval calibration, coverage vs usefulness, reliability of prediction intervals, conformal prediction.
- `driver-regression-fit` — scatter, fitted line, and pulsing residual sticks. Fits: driver-based forecasting, regression diagnostics, residual analysis, feature discovery.

## ML platform and data

- `ml-lifecycle` — data to features to training to registry to deploy to serve to monitor, with the monitor node pulsing and a feedback arc back to features. Fits: MLOps, model lifecycle, platform architecture, "what happens after the model ships".
- `feature-store-two-stores` — one definition materialised into an online store for serving lookups and an offline store for training sets. Fits: feature stores, online/offline parity, feature reuse, serving architecture.
- `point-in-time-join` — a timeline with the decision time t0, an allowed feature window at or before t0, a label at t0+H, and a crossed-out leak arrow from the future. Fits: leakage, point-in-time correctness, label horizon, training set construction.
- `training-serving-skew` — two pipelines computing the same feature, the values diverging, and a parity check box raising an alert. Fits: training-serving skew, feature parity, silent model degradation, monitoring design.
- `label-latency` — events now, labels arriving weeks later, and a gap bar spanning the delay. Fits: label latency, delayed ground truth, proxy metrics, why offline metrics lag.
- `data-contract-validation` — a schema gate that passes conforming rows and bounces a bad row back to the producer. Fits: data contracts, schema validation, data quality gates, upstream ownership.
- `gitops-loop` — Git to CI to a reconciling CD controller to a cluster, with an observed-state return and a drift-corrected badge. Fits: GitOps, declarative deploys, ArgoCD/Flux, drift reconciliation, infrastructure as code.

## Serving and scale

- `latency-budget-bar` — a stacked per-hop latency bar with a breathing headroom segment and a p99 marker. Fits: latency budgets, p99 vs mean, serving SLOs, where the time actually goes.
- `load-balancer-replicas` — a load balancer fanning to three replicas, one unhealthy and drained, its share re-routed. Fits: load balancing, health checks, horizontal scaling, graceful degradation.
- `autoscaling-queue` — a queue-depth curve crossing a scale-up threshold while replicas appear in sequence. Fits: autoscaling, backlog-driven scaling, HPA/KEDA, scaling lag.
- `request-batching` — many small requests merging into one batch to the model, results fanning back out. Fits: inference batching, GPU utilisation, throughput vs latency, batch window tuning.
- `caching-read-through` — request to cache, a miss to the database, a fill, then later hits with a pulsing hit counter. Fits: caching strategies, read-through, cache hit rate, hot key serving.
- `caching-write-through` — write-through (both stores before the ack) beside write-back (a growing buffer flushed in batches). Fits: write caching, durability vs write latency, buffer risk, database write patterns.
- `cache-invalidation-ttl` — an ageing bar with a moving marker reaching the TTL, the entry evicted, then a refetch from the source of truth. Fits: TTL, cache invalidation, freshness vs load, staleness budgets.
- `cdn-edge` — users in three regions served by edge caches, with only misses reaching a protected origin. Fits: CDN, edge caching, geographic latency, origin offload.
- `message-queue-async` — producer to queue to consumers, with a partially drained backlog and consumers appearing in sequence. Fits: async processing, queues, decoupling, backpressure, spike absorption.
- `db-replication-sharding` — a primary with read replicas (and a lag warning) beside a router splitting three shards by key range. Fits: database scaling, read replicas, replication lag, sharding, partition keys.
- `idempotency-key` — a first request writing once, a retry with the same key returning the stored result and no second write. Fits: idempotency, exactly-once semantics, safe retries, payment and job APIs.
- `rate-limiter-token-bucket` — tokens refilling into a bucket, served requests taking a token, excess rejected with 429. Fits: rate limiting, token bucket, burst vs sustained rate, API quotas.
- `circuit-breaker-states` — closed to open to half-open and back, with probe-succeeds and probe-fails paths. Fits: circuit breakers, resilience patterns, cascading failure, dependency isolation.
- `multi-region-failover` — a global router shifting all traffic from an unhealthy region to a healthy one. Fits: multi-region, disaster recovery, failover testing, RTO/RPO conversations.
- `scale-test-3x` — load steps at 1x to 3x against an expected-peak line and a p99 budget line, with the breaking point pulsing. Fits: load testing, peak-season readiness, capacity planning, stress tests.
- `degrade-to-fallback` — a switch routing away from a failed model service to rules or a cached answer. Fits: graceful degradation, fallbacks, availability of ML systems, failure modes.

## Reliability and ops

- `canary-rollout` — traffic steps of 1%, 5%, 25%, 100% appearing in sequence with a metrics gate at each step. Fits: canary releases, progressive delivery, release gates, safe deploys.
- `blue-green-swap` — a router pointing at green (n+1) while blue (n) stays warm and idle. Fits: blue-green deployment, instant rollback, cutover strategy, zero-downtime releases.
- `shadow-traffic` — requests mirrored to a shadow model whose output is only logged, with the user path untouched. Fits: shadow deployment, offline-to-online validation, pre-launch model evaluation, zero blast radius.
- `drift-monitor` — two distributions pulling apart with a shift arrow, a drift score against an alert threshold, and a retrain trigger. Fits: data drift, PSI/KL monitoring, retraining policy, model decay.
- `rollback-path` — four versions with a bad release, and the traffic pointer moving back one step. Fits: rollback, release management, forward-compatible migrations, incident response.
- `two-dashboards` — an all-green system health panel beside a decision-quality panel lighting up amber and red. Fits: metrics that matter, business vs system monitoring, ML observability, "green dashboards, bad outcomes".
- `incident-scenario-spine` — clarify, contain, diagnose, fix, prevent along a spine with a pointer moving across it. Fits: incident response, interview answer structure, postmortems, on-call narrative.

## GenAI

- `rag-pipeline` — query, embed, vector index, top-k chunks, prompt, LLM, answer, and a citations box. Fits: RAG architecture, grounding, retrieval quality, citation and auditability.
- `vector-similarity` — points in 2-D with a query vector, its nearest neighbours highlighted, and a small-angle annotation. Fits: embeddings, cosine similarity, ANN indexes, semantic search.
- `llm-serving-batching` — KV-cache slots filling and freeing as sequences arrive and finish, feeding one decode step per live sequence. Fits: LLM inference, continuous batching, KV cache, GPU memory limits, throughput tuning.
- `guardrails-io` — an input filter for PII and injection, the model, and an output filter for policy and grounding, with two blinking trigger badges. Fits: LLM safety, guardrails, PII redaction, prompt injection, responsible AI controls.

## LLM fine-tuning and inference engineering

- `lora-adapter` — a frozen base weight with a small trainable low-rank bypass (A then B) flowing into the summed output. Fits: LoRA, QLoRA, parameter-efficient fine-tuning, adapter mechanics.
- `rlhf-pipeline` — RLHF's sample-score-update loop feeding back into the policy, beside DPO training directly on preference pairs. Fits: RLHF, PPO, DPO, alignment pipelines, reward models.
- `prefill-vs-decode` — a parallel one-pass prefill lane above a sequential token-by-token decode lane. Fits: LLM inference internals, compute-bound vs memory-bound, roofline model, TTFT/TPOT origins.
- `kv-cache-growth` — a cache bar that grows every step toward a GPU memory ceiling line. Fits: KV cache sizing, memory formula, concurrency limits, context-length trade-offs.
- `continuous-batching` — static batching leaving a finished seat idle vs continuous batching refilling it the next step. Fits: continuous/in-flight batching, GPU utilization, mixed request lengths.
- `paged-attention-blocks` — logical KV-cache blocks mapped onto scattered physical blocks in a shared pool. Fits: PagedAttention, memory fragmentation, virtual-memory analogy, prefix sharing.
- `quantization-bits` — three bars shrinking from FP16 to INT8 to INT4. Fits: LLM quantization, AWQ/GPTQ, W8A8 vs W4A16, memory-bandwidth trade-offs.
- `speculative-decoding` — a draft model's fast token guesses checked in one pass by the target model, accepted up to the first rejection. Fits: speculative decoding, draft/target models, exact decoding speedups.
- `tensor-vs-pipeline-parallel` — one matrix multiply split by column and summed vs layers split into stages with an idle bubble. Fits: tensor parallelism, pipeline parallelism, multi-GPU serving, interconnect trade-offs.
- `ttft-tpot-timeline` — a request timeline split into the prefill wait to first token and a steady march of decode ticks after it. Fits: TTFT, TPOT, latency perception, LLM SLOs.

## Interview and meta

- `craft-demo-clock` — a 60-minute bar split into intro, case study, and their questions, with a moving time cursor. Fits: interview preparation, craft/portfolio demos, presentation pacing, time management.
- `hlding-boxes` — a blank canvas filling in order with client, load balancer, services, cache, database, queue. Fits: high-level design interviews, system design method, drawing order, architecture basics.
- `gcp-aws-mapping` — two service columns joined by lines lighting up pair by pair. Fits: cloud equivalence, multi-cloud fluency, GKE/EKS, BigQuery/Redshift, Vertex/SageMaker.
- `api-performance-tricks` — a grid of seven levers animating in sequence, plus a "measure first" tile. Fits: API performance, backend optimization checklists, interview rapid-fire answers.
- `n-plus-one` — one list query fanning into N per-row queries beside a single joined query. Fits: ORM pitfalls, query optimization, database round trips, latency debugging.
- `connection-pool` — five clients sharing a pool of four connections, with a no-handshake badge and a waiters-queue warning. Fits: connection pooling, database concurrency limits, PgBouncer-style tuning, throughput ceilings.
- `pagination-cursor` — a page window moving over an ordered result set with a cursor carrying the last id seen. Fits: pagination, keyset vs offset, stable listing APIs, large result sets.
- `async-logging` — logs into a ring buffer, flushed in batches by a background writer, with a dropped-lines warning. Fits: async logging, observability overhead, buffering trade-offs, request-path hygiene.

## System design foundations

- `capacity-estimate` — four boxes turning a daily-active-user count into average QPS, peak QPS and peak bandwidth, each arrow labelled with the multiplier. Fits: back-of-the-envelope estimation, capacity planning, requirements gathering, QPS/storage/bandwidth arithmetic.
- `scale-up-vs-out` — split panel: one server growing toward a hard ceiling vs a row of nodes appearing one at a time. Fits: horizontal vs vertical scaling, scaling trade-offs, when to add a bigger machine vs more machines.
- `monolith-vs-microservices` — one box holding four stacked modules shipped as one unit, beside four separate boxes connected by network calls. Fits: monolith vs microservices, service boundaries, the cost of splitting a system, Conway's law.
- `l4-vs-l7-lb` — split panel: a layer 4 balancer forwarding packets straight through, beside a layer 7 balancer reading the request and routing by path to two different services. Fits: load balancer algorithms, layer 4 vs layer 7, API gateway routing, TLS termination.
- `retry-backoff-jitter` — five attempts along a timeline with doubling gaps and a jitter band around each wait, ending in success. Fits: retries, exponential backoff, jitter, retry storms, idempotent retries.
- `backpressure` — a producer and consumer with a bounded, nearly full queue between them and a reject/slow-down signal flowing back, contrasted with an unbounded queue growing silently. Fits: backpressure, bounded queues, load shedding, overload signalling.
- `tail-latency-hedge` — a skewed latency distribution with p50 and p99 marked, below it an original request and a hedge request sent to a second replica, whichever finishes first winning. Fits: tail latency, p99, hedged requests, fan-out amplification, load shedding.

## ML foundations

- `dot-product-similarity` — two vectors from the origin with the angle between them, the dot product and both norms shown, and cosine similarity computed from them. Fits: vector similarity, embeddings, the dot product, L1/L2 norms.
- `gradient-descent-bowl` — a loss bowl with a ball taking sequential downhill steps that shrink as the slope flattens near the minimum. Fits: gradient descent, learning rate, convexity, optimisation basics.
- `chain-rule-graph` — a small forward computation graph (x to f(x) to g(u) to L) with values flowing forward, and a backward pass multiplying local derivatives back through each node. Fits: the chain rule, the Jacobian, backpropagation, computation graphs.
- `softmax-temperature` — the same logits turned into two bar charts, one sharp at low temperature and one flatter at high temperature. Fits: softmax, temperature, LLM sampling, knowledge distillation.
- `cross-entropy-curve` — the -ln(p) loss curve against predicted probability of the true class, with the confident-correct and coin-flip points marked. Fits: cross-entropy, classification loss, entropy, KL divergence.
- `bias-variance-targets` — four targets showing low/high bias against low/high variance, with hits scattered or clustered and on- or off-centre. Fits: bias-variance trade-off, overfitting, underfitting, empirical risk minimisation.
- `learning-curves` — training and validation error plotted against training-set size, with the generalisation gap between them shaded. Fits: learning curves, diagnosing bias vs variance, PAC learning, when more data helps.
- `leakage-timeline` — a decision time t0 with an allowed feature window before it, a label arriving after t0, and a dashed arrow showing future information leaking backward. Fits: data leakage, train-test leakage, temporal leakage, target leakage, point-in-time correctness.
- `distribution-shift` — three small panels in sequence: inputs moving, the label mix moving, and the same inputs meeting a new decision boundary. Fits: covariate shift, label shift, concept drift, drift detection.

## ML foundations: classical models and evaluation

- `sigmoid-threshold` — the sigmoid curve mapping a raw score to a probability, a 0.5 decision threshold, and example points classified above and below it. Fits: logistic regression, decision thresholds, odds, binary classification.
- `ridge-vs-lasso` — a loss contour meeting a circular L2 penalty region versus a diamond-shaped L1 penalty region, the diamond's corner zeroing out a coefficient. Fits: ridge, lasso, elastic net, regularisation, sparse coefficients, why L1 differs from L2.
- `calibration-curve` — a reliability diagram sagging below the diagonal (overconfidence), with Platt scaling and isotonic regression shown as the two fixes. Fits: probability calibration, reliability diagrams, why boosted trees and neural networks miscalibrate.
- `tree-split` — a scatter split by a candidate threshold, the resulting Gini impurity of each child, and the gain the split buys over the root. Fits: decision trees, splitting criteria, Gini/entropy, overfitting via depth.
- `boosting-residuals` — three sequential rounds where each new tree targets the previous round's residuals and the gap to the truth shrinks. Fits: gradient boosting, residual fitting, learning rate, XGBoost/LightGBM.
- `svm-margin` — two classes separated by a maximum-margin boundary with its support vectors circled. Fits: support vector machines, hinge loss, margin, kernel methods.
- `kmeans-steps` — three panels showing k-means alternating between assigning points to the nearest centroid and moving each centroid to its cluster's mean. Fits: k-means, choosing k, clustering, the EM-like assign/update pattern.
- `data-split-time` — a correct time-ordered train/validation/test split above a shuffled split where future rows leak into training. Fits: data splitting, time-based and grouped splits, leakage through evaluation design.
- `confusion-matrix` — the four outcomes of a binary classifier with precision and recall traced back to the cells that define them. Fits: confusion matrix, precision, recall, F1, classification metrics.
- `roc-vs-pr` — the same imbalanced-fraud model on an ROC curve (looking excellent) and a precision-recall curve (showing the real precision collapse). Fits: ROC-AUC vs PR-AUC, class imbalance, threshold choice, cost-sensitive evaluation.
- `ab-test-flow` — incoming users randomly split into control and treatment, their metrics compared against what chance alone would produce. Fits: A/B testing, online evaluation, guardrail metrics, statistical power.

## System design: databases

- `btree-index` — a B-tree with a root, two internal nodes and four leaves; a highlighted path descends root to leaf for one lookup, and the leaves stay linked for range scans. Fits: index internals, B-tree, composite and covering indexes, query planning.
- `isolation-anomalies` — a 3x3 grid of isolation level against anomaly, cells lighting up blocked or possible in sequence. Fits: transaction isolation levels, dirty read, non-repeatable read, phantom read, lost update.
- `mvcc-versions` — a row's version chain (old, superseded, newest) with two transactions pinned to different snapshots reading different versions without blocking each other. Fits: MVCC, snapshot isolation, read replicas of one, garbage collection/vacuum.
- `wal-recovery` — a write flowing through the log (append + fsync) before the ack, data pages flushed later, then a crash and a recovery arrow replaying from the last checkpoint. Fits: write-ahead log, durability, checkpoints, crash recovery, ARIES-style redo/undo.
- `read-replicas-lag` — a primary streaming to two replicas with different, growing lag bars, plus a read-your-writes request routed back to the primary. Fits: read replicas, replication lag, read-your-writes, scaling reads.
- `shard-range-vs-hash` — split panel: range partitioning with a hot top shard from a monotonic key, versus hash partitioning scattering keys evenly across shards. Fits: sharding, partition key choice, hot ranges, rebalancing trade-offs.
- `consistent-hash-ring` — a hash ring with nodes and virtual node points; a key walks clockwise to its node, and a joining node only takes the adjacent arc. Fits: consistent hashing, virtual nodes, bounded rebalancing, distributed caches.
- `snowflake-id` — a 64-bit id split into sign, timestamp, machine id and sequence segments, with ids sorting by time and a clock-skew warning. Fits: distributed id generation, Snowflake, ObjectId, clock skew, sortable ids.
- `bloom-filter` — a bit array set by an insert's k hash functions, then a query whose bits are already set, reporting a false positive. Fits: Bloom filters, false-positive rate, probabilistic membership, LSM-tree read paths.

## System design: storage engines and object storage

- `lsm-tree-levels` — a write flowing through the WAL into the memtable, flushing to a level 0 SSTable, and compaction arrows merging files down into fewer, larger, non-overlapping files at level 1. Fits: LSM trees, memtables, SSTables, compaction, write path internals.
- `lsm-read-path` — a lookup checking the memtable, then SSTables newest to oldest: one file's Bloom filter rules it out for free, the next file's "maybe" sends the read to its sparse index, and the value is found there. Fits: LSM-tree reads, Bloom filters, sparse indexes, read amplification.
- `btree-vs-lsm` — split panel: a B-tree rewriting the one page holding a key in place, versus an LSM tree appending to a log and memtable and compacting later. Fits: B-tree vs LSM-tree trade-offs, random vs sequential writes, choosing a storage engine.
- `object-storage-layers` — a request passing through a metadata service and a partition map before reaching an append-only stream layer, where an object is split into data and parity fragments across nodes, one fragment shown lost and still recoverable. Fits: object storage architecture, S3-style systems, erasure coding, durability.
- `queue-vs-stream` — split panel: a task queue where a taken message is gone, versus an event stream where two independent consumer groups each read the same durable log at their own offsets. Fits: task queues vs event streams, RabbitMQ/SQS vs Kafka, replay.
- `consumer-group-offsets` — one topic's partitions read by two consumers in one group (each owning a subset of partitions) and, independently, one consumer in a second group reading all of them with its own offsets. Fits: Kafka consumer groups, partition assignment, offsets, independent consumption.
- `delivery-guarantees` — three lanes: at-most-once dropping a message, at-least-once producing a duplicate after a lost acknowledgement, and a duplicate being absorbed by an idempotency-key check. Fits: delivery semantics, idempotent consumers, effectively-once processing.
- `dead-letter-queue` — a message failing three retries in sequence, then rerouted to a separate dead-letter queue while the main queue keeps moving. Fits: poison messages, retry limits, dead-letter queues, queue health.
- `dag-orchestration` — a small DAG with one task retrying (blinking) while a dependent task waits, sitting above an orchestrator panel and a backfill run replaying a past date range. Fits: Airflow/Argo/Temporal, DAG dependencies, retries, backfills.
- `fanout-write-vs-read` — split panel: fan-out on write pushing one celebrity post into many follower feeds at once, versus fan-out on read merging a feed from followed accounts at request time. Fits: fan-out on write vs read, the celebrity problem, notification fan-out.

## Training and LLM systems

- `chunk-overlap` — a document split into overlapping chunks with the shared region highlighted and a fixed-size window sliding by less than its own width. Fits: RAG chunking, chunk size and overlap, boundary loss, document splitting strategy.
- `hybrid-retrieval` — a query forking into a dense (embedding) search and a sparse (BM25) search, both ranked lists fused into one. Fits: hybrid search, dense vs sparse retrieval, reciprocal rank fusion, RAG retrieval quality.
- `hnsw-layers` — a layered graph with sparse long-range links at the top and dense short-range links at the bottom, a highlighted path greedily descending to the nearest neighbour. Fits: HNSW, approximate nearest neighbour search, ANN indexes, recall vs latency.
- `agent-tool-loop` — a model deciding whether to call a tool, observing the result, looping back, with a stopping-rule box that can send it to a final answer. Fits: agents, tool/function calling, planning loops, stopping rules, agent observability.
- `model-router` — a classifier routing most requests to a cheap model and harder or low-confidence ones up to stronger, pricier models. Fits: model routing, cost/quality trade-offs, LLM request classification, escalation.
- `roofline` — a bent ceiling line (a rising memory-bandwidth limit meeting a flat compute limit) with a memory-bound and a compute-bound operation plotted against it. Fits: the roofline model, arithmetic intensity, compute-bound vs memory-bound, why matmul dominates GPU workloads.
- `memory-per-parameter` — five stacked bars (fp16 param, fp16 gradient, fp32 master param, fp32 momentum, fp32 variance) summing to a highlighted total. Fits: GPU memory budgeting, mixed-precision Adam training, the 16-bytes-per-parameter rule, fitting a model in memory.
- `data-parallel-allreduce` — four GPUs each holding a full model replica and a different batch shard, connected by a ring all-reduce that syncs their gradients. Fits: data parallelism, DDP, gradient all-reduce, ring all-reduce.
- `zero-sharding` — three columns (DDP baseline, ZeRO-2, ZeRO-3) showing progressively less of each memory category held on one GPU. Fits: ZeRO, FSDP, optimizer/gradient/parameter sharding, large-model memory scaling.
- `pipeline-bubbles` — a stage-by-time grid where forward and backward microbatches step diagonally through the stages, with idle bubble cells shown where a stage has nothing to do. Fits: pipeline parallelism, pipeline bubbles, microbatching, GPipe/1F1B scheduling.

## System design: caching and coordination

- `cache-aside-flow` — an app missing the cache, reading the origin, and filling the cache, versus the same request next time hitting straight through. Fits: cache-aside, read-through, hit rate, populate-on-miss.
- `write-through-vs-behind` — split panel: write-through acknowledging only after the origin confirms, versus write-behind acknowledging immediately and flushing a growing buffer later. Fits: write-through, write-behind/write-back, write latency vs durability.
- `lru-list` — a hash map pointing straight into a doubly linked list of nodes, a hit moving a node to the head, and eviction always removing the tail. Fits: LRU, O(1) cache implementation, eviction policies.
- `cache-stampede` — several clients missing the same expired key at once, converging on a single in-flight origin call whose result they all share. Fits: cache stampede, thundering herd, request coalescing, single-flight.
- `consistency-spectrum` — five bands from linearizable to eventual, each with a one-line example, and a dot sliding from strong to weak. Fits: consistency models, linearizability, causal/sequential/eventual consistency, read-your-writes.
- `quorum-w-r-n` — five replicas with an overlapping write-quorum bracket and read-quorum bracket sharing one node. Fits: quorums, W + R > N, leaderless replication, Dynamo-style stores.
- `raft-election` — a candidate requesting votes, a majority granting them, and the new leader replicating entries to the rest. Fits: Raft, leader election, log replication, majority commit, consensus.
- `lamport-clock` — two process timelines where a sent message's counter forces the receiver's counter to jump past it. Fits: logical clocks, Lamport clocks, happens-before, vector clocks, event ordering.
- `fencing-token` — a lock service issuing increasing tokens to two clients, with the resource rejecting a paused client's stale, lower token. Fits: distributed locks, leases, fencing tokens, the Redlock debate, safe mutual exclusion.
- `gossip-spread` — an origin node's information reaching new peers each round, roughly doubling the informed set until the whole cluster knows. Fits: gossip protocols, cluster membership, failure detection, SWIM, distributed hash tables.

## System design: search, counting and realtime delivery

- `inverted-index` — documents tokenised on the left flowing into a term-to-postings table on the right, each term's posting list filling in with matching document ids in sequence. Fits: inverted index, posting lists, tokenisation, search indexing.
- `bm25-scoring` — three worked factor boxes (IDF, saturating term frequency, length normalisation) multiplying together into one term's BM25 score. Fits: BM25, TF-IDF, relevance scoring, k1 and b parameters.
- `query-pipeline` — a raw, misspelled query flowing through spell correction, synonym expansion, intent detection and rewriting in sequence to a final query. Fits: query understanding, spell correction, synonym expansion, query rewriting, search intent.
- `hybrid-rank-fusion` — a BM25 ranked list and a vector ranked list, one shared document highlighted in both, converging into a worked reciprocal-rank-fusion score and a fused top rank. Fits: hybrid search, reciprocal rank fusion, combining sparse and dense retrieval.
- `trie-autocomplete` — a prefix tree walked letter by letter to a cached top-k completions box hanging off the matched prefix node. Fits: autocomplete, typeahead, tries, prefix search, top-k caching.
- `time-windows` — non-overlapping tumbling windows above overlapping hopping windows, with a watermark line and one late event arriving after its window closed. Fits: tumbling/sliding/hopping windows, stream aggregation, watermarks, late events.
- `hyperloglog-buckets` — a grid of buckets each showing the longest run of leading zeros seen, averaged into a cardinality estimate. Fits: HyperLogLog, cardinality estimation, unique counting, mergeable sketches.
- `count-min-sketch` — a width-by-depth counter grid where one item's hashes light up one cell per row, the estimate taken as the minimum across rows. Fits: Count-Min Sketch, frequency estimation, heavy hitters, hash collisions.
- `tdigest-merge` — centroids packed finer near both tails and coarser near the median, two hosts' digests merging into one before a percentile is read. Fits: t-digest, DDSketch, quantile sketches, why p99 cannot be averaged across hosts.
- `polling-vs-websocket` — split panel: repeated request-response cycles on a timer versus one persistent connection carrying messages either way at any time. Fits: short/long polling, Server-Sent Events, WebSockets, transport choice.
- `websocket-fanout` — a sending server looking up a target user in a connection registry, publishing to a channel, and the server actually holding that user's socket delivering it. Fits: scaling WebSocket servers, sticky sessions, connection registries, pub/sub fan-out, heartbeats.
- `notification-pipeline` — an event moving through priority and deduplication, rate limiting, channel routing to push/email/SMS, with a failed provider triggering backoff and retry. Fits: notification systems, priority, deduplication, rate limiting, retries, delivery receipts.

## System design: SRE practices and worked cases

- `golden-signals` — a service box fanning out to four cards (latency, traffic, errors, saturation) appearing in sequence. Fits: observability, the four golden signals, what to put on a service dashboard.
- `error-budget-burn` — a 30-day budget bar being spent in growing steps by a bad deploy, ending in a "budget exhausted, freeze releases" marker. Fits: error budgets, burn rate, the error-budget formula, release-freeze decisions.
- `expand-contract-migration` — four sequential stages (expand, migrate, switch, contract) for a zero-downtime schema change. Fits: expand-and-contract, dual writes, backfill, safe schema migration.
- `rpo-rto` — one timeline with the last backup, the failure, and full restoration marked, RPO measured backward and RTO measured forward between them. Fits: recovery point objective, recovery time objective, backup and disaster recovery planning.
- `token-bucket-sliding` — a refilling token bucket beside a sliding window blending the current and previous fixed windows. Fits: rate-limiting algorithms compared, token bucket vs sliding window, the fixed-window boundary burst.
- `tenant-isolation` — three columns (shared pool, shared with quotas, dedicated) with a noisy tenant's blast radius shown reaching only the shared pool. Fits: multi-tenant isolation levels, noisy neighbours, per-tenant quotas.
- `case-rate-limiter` — a client through a gateway limiter backed by shared Redis counters, with an over-limit path returning 429. Fits: rate limiter system design case, distributed counters, limiter placement and keying.
- `case-news-feed` — ordinary posts fanned out on write into inboxes beside a celebrity post stored once and pulled in at read time. Fits: news feed system design case, the celebrity problem, hybrid fan-out.
- `case-payments-ledger` — an idempotency-key check guarding a charge, with the resulting money movement written as a balanced double-entry ledger. Fits: payments system design case, idempotency, double-entry ledgers, reconciliation.
- `case-recsys-two-stage` — candidate generation narrowing millions of items to a shortlist a heavier ranking model then scores, both reading one feature store. Fits: recommendation system design case, candidate generation, two-stage ranking.
- `case-fraud-stream` — a transaction scored in milliseconds from streaming features, with a chargeback label arriving weeks later feeding a delayed retrain. Fits: real-time fraud detection case, streaming features, label latency.
- `case-llm-chat` — a chat turn moving through retrieval, a cost-aware model router, generation, and an output guardrail. Fits: LLM chat product case, RAG, model routing, TTFT/TPOT, guardrails.

## ML foundations: deep learning and MLOps tooling

- `neuron-layer` — one neuron's inputs, weights, sum-plus-bias and activation, beside a layer running several such neurons on the same inputs in parallel. Fits: neurons, weights and biases, activation functions, why a layer is a matrix multiply.
- `backprop-two-layer` — a tiny two-layer network's forward pass (with real numbers) above a backward pass showing the gradient shrinking to zero through a dead ReLU unit. Fits: backpropagation, the chain rule with actual numbers, dead ReLU, gradient flow.
- `norm-layers` — three small batch-by-feature grids highlighting a column (BatchNorm) or a row (LayerNorm, RMSNorm) to show which axis each normaliser averages over. Fits: BatchNorm vs LayerNorm vs RMSNorm, where each is used, batch-size sensitivity.
- `lr-schedule` — a learning-rate curve ramping up through warm-up then riding a cosine curve back down. Fits: learning-rate schedules, warm-up, cosine decay, Adam/AdamW training stability.
- `conv-receptive-field` — three shrinking layers of grid cells with a highlighted region growing from one output cell down to a wide patch of the input. Fits: convolution, stride and pooling, receptive field, why stacked small kernels beat one large kernel.
- `attention-heads` — Q/K/V feeding several parallel attention heads that concatenate into one linear projection. Fits: scaled dot-product attention, multi-head attention, the transformer's core operation.
- `encoder-decoder-vs-decoder` — an encoder-decoder stack with cross-attention beside a single causal decoder-only stack. Fits: encoder-decoder vs decoder-only transformers, causal masking, why decoder-only dominates generation.
- `dvc-pipeline` — Git holding only pointer files for a dvc.yaml pipeline of stages, with the actual bytes pushed to and pulled from a remote bucket. Fits: DVC, data versioning, reproducible pipelines, S3-style remotes.
- `mlflow-registry` — a training run logging params, metrics and artifacts to a tracking server, then a registered version promoted from Staging to Production. Fits: experiment tracking, MLflow, model registry, promotion stages.
- `fastapi-serving` — a request validated by a Pydantic model, batched, scored, and returned, with a bad request short-circuited straight to an error. Fits: FastAPI serving, request/response validation, batching, timeouts, health checks.
- `k8s-ml-service` — an Ingress and Service fronting a Deployment's Pods on a GPU node pool, with an HPA watching a load metric. Fits: Kubernetes for ML services, Pods/Deployments/Services/Ingress, HPA, GPU node pools, resource requests and limits.
- `ci-cd-ml` — commit to CI (tests plus a data-validation gate) to training to a registry version, then GitOps reconciling the cluster to match. Fits: CI/CD for ML, data validation gates, model promotion, GitOps deployment.
