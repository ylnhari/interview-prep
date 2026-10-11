# Practice review dispositions - 2026-10-11

Baseline: abd4b97ad27c9b2c95a8409a49b018fd9a5311fe. These are the parent technical/editorial review groups assigned to the practice reviewer, including repeat findings. Corrections reside in `core/zzzzzzzz-review-practice.js`; all stable routes and complete quiz mappings are retained. No commit or publication was performed by this reviewer.

| Finding | Disposition | Exact section/answer and evidence |
| --- | --- | --- |
| PT03 | Accepted and fixed; repeated cutoff finding consolidated | qb2-5/A6 actual prediction-time event/region availability; qb2-2/A2 availability required, invalid joins need repair policy. Content assertions. |
| PT04 | Accepted and fixed; complementary earlier fix retained | qb2-2/A3 sampled serving capture/replay, missingness/freshness/fallback slices; qb2-1/A6 integration tests are one source of parity evidence. Content assertions. |
| PT05 | Accepted and fixed | qb2-1/A3 Git history distinguished from approval/controller/runtime provenance records. Content assertion. |
| PT08 | Accepted and fixed | qbllm-4/A21 LoRA parameter formula; qbllm-a1 model/rubric remove invariant under-one-percent claim. Independent arithmetic fixture computes 159,907,840 = about 2.28% of 7B. |
| MLF03 | Accepted and fixed | qbmlf-8/A49 attaches non-core border points; noise means unassigned, not merely non-core. Content assertion and scikit-learn clustering documentation. |
| MLF04 | Accepted; earlier correction retained | qbmlf-3/A14 both Brier and log loss are proper scores. Content assertion; scoring documentation. |
| MLF05 | Accepted and fixed | qbmlf-5/A32 sufficient continuous nonpolynomial activation/bias assumptions; quadratic activation counterexample and no optimization guarantee. Content assertion. |
| MLF10 | Accepted and fixed | qbmlf-a2 prompt asks when warmup can reduce instability; model already qualified architecture/optimizer dependence. Negative assertion against mandatory prompt wording. |
| MLF11 | Accepted; earlier correction retained | qbmlf-a1 squared-loss bias/variance decomposition with fixed-input and conditional-mean scope; no universal capacity tradeoff. |
| MLF12 | Accepted and fixed | qbmlf-1/A6 geometry/scaling/intrinsic-dimension qualification. Repeated coordinates preserve distance ordering rather than inevitably concentrating it. Content assertion. |
| MLF13 | Accepted; earlier correction retained | qbmlf-a2 PCA preserves greatest variance, with task-relevance validation rather than maximum information. |
| T10 | Accepted and fixed | cdr-a1 constructor rejects NaN/infinite horizons; finite overflow in Welford or sum raises OverflowError. Executed extracted lesson Python for NaN/inf horizons, opposite 1e308 values, same-sign sum overflow and ordinary variance. |
| T12 | Accepted and fixed | cdr-a4 SQLite DDL explicitly NOT NULL for IDs/customer keys/required times. Executed seven rejected-NULL fixtures against DDL extracted from the prompt. COUNT(event_id) retained. |
| T18 | Accepted and fixed | qb-5/A5 BIC penalty exceeds AIC only n > exp(2); n=4 counterexample and likelihood comparability. Content assertion. |
| T21 | Accepted and fixed | qbsd-3/A15 index ordering from complete workload/prefix/range/sort/plan, not universal most-selective equality first. |
| T22 | Accepted and fixed | qbsd-3/A16 SQL read uncommitted permits dirty reads; PostgreSQL implementation scope explicit. Content assertion. |
| SYS12 | Accepted and fixed | qbsd-7/A41 memory mutation versus durable publication/acknowledgement boundaries; asynchronous durability contract explicit. Content assertion. |
| SYS13 | Accepted and fixed; earlier policy correction retained | qbsd-5 explains configured approximate LRU and upstream noeviction default versus hosted settings. |
| SYS17 | Accepted and fixed | qbsd-a2 model/rubric distinguish time-based 43.2 minutes from request-based 1,000 bad requests per million at 99.9%. Content assertion. |
| SYS28 | Accepted and fixed | qbsd-a1 generated local protobuf types versus deployed wire/semantic compatibility. Contradictory compile-time guarantee removed and mixed-version checks added. Negative assertion. |
| SYS32 | Accepted; earlier correction retained | qbsd-a2 queue acknowledgement/retry admits duplicates; no single-delivery once-only promise. |

Independent first cross-review findings also accepted: qbsd-1/A6 and qbsd-a2 Little's law gives stable mean in-flight requests rather than workers/connections; qbsd-6/A33 Raft current-term commitment and stable-leader Multi-Paxos; qb2-6/A6 self-hosting needs egress/telemetry/tool controls; cdr-a1 higher revision matches event_id plus entity key. Corresponding assertions are included. No assigned group was rejected merely to preserve wording.

Primary evidence: [Raft](https://raft.github.io/raft.pdf), [probability scoring](https://scikit-learn.org/stable/modules/model_evaluation.html#brier-score-loss), [DBSCAN](https://scikit-learn.org/stable/modules/clustering.html#dbscan), [LoRA](https://arxiv.org/abs/2106.09685), [normalization and warmup](https://arxiv.org/abs/2002.04745), [SQLite primary keys](https://sqlite.org/lang_createtable.html), [PostgreSQL isolation](https://www.postgresql.org/docs/current/transaction-iso.html), [Redis eviction](https://redis.io/docs/latest/develop/reference/eviction/). Numerical, LoRA, BIC and repeated-dimension counterexamples were independently evaluated from the stated formulas; source claims do not substitute for deployment tests.

Validation: `node engine/test_review_practice.cjs <python-executable>` passed, including complete route/quiz identity comparison, teaching-contract assertions, LoRA arithmetic, extracted Python numerical adversarial fixtures and extracted SQLite schema constraints. Python 3.12.1 executed the fixtures. Standard invocation reports a clear runtime limitation when the host's Python shim is unavailable; pass an explicit executable to require runtime success. No visual browser/screen-reader checks or deployment checks were performed by this reviewer. Root owns the combined build and publication.

Universal-approximation qualification independently verified against the [Leshno et al. primary paper archive](https://archive.nyu.edu/handle/2451/14329), including nonpolynomial activation and the threshold/bias requirement.
