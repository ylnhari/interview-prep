# viz-lib catalog

`viz-lib.js` defines `window.VIZLIB` (60 functions, each taking a `uid` string and returning an inline
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

## Interview and meta

- `craft-demo-clock` — a 60-minute bar split into intro, case study, and their questions, with a moving time cursor. Fits: interview preparation, craft/portfolio demos, presentation pacing, time management.
- `hlding-boxes` — a blank canvas filling in order with client, load balancer, services, cache, database, queue. Fits: high-level design interviews, system design method, drawing order, architecture basics.
- `gcp-aws-mapping` — two service columns joined by lines lighting up pair by pair. Fits: cloud equivalence, multi-cloud fluency, GKE/EKS, BigQuery/Redshift, Vertex/SageMaker.
- `api-performance-tricks` — a grid of seven levers animating in sequence, plus a "measure first" tile. Fits: API performance, backend optimization checklists, interview rapid-fire answers.
- `n-plus-one` — one list query fanning into N per-row queries beside a single joined query. Fits: ORM pitfalls, query optimization, database round trips, latency debugging.
- `connection-pool` — five clients sharing a pool of four connections, with a no-handshake badge and a waiters-queue warning. Fits: connection pooling, database concurrency limits, PgBouncer-style tuning, throughput ceilings.
- `pagination-cursor` — a page window moving over an ordered result set with a cursor carrying the last id seen. Fits: pagination, keyset vs offset, stable listing APIs, large result sets.
- `async-logging` — logs into a ring buffer, flushed in batches by a background writer, with a dropped-lines warning. Fits: async logging, observability overhead, buffering trade-offs, request-path hygiene.
