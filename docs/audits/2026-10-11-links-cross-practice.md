# Independent technical cross-review: practice chapters — 2026-10-11

Round 2 reviewed the current local effective course, including `core/zzzzzzzz-review-practice.js`, independently of its first-pass findings. Loaded library.js, other core modules in lexical order, then packs/course/content.js. Read all body, deeper, prompt and model fields in 89 sections across eight chapters; hidden checks/rubrics were outside the rendered-content scope. Coverage is source review, not a claim of pixel-level or complete empirical validation.

## New findings for the implementation owner

1. **qbsd-6 A33 — Raft commitment and Paxos.** Majority storage alone does not commit a previous-term Raft entry. State current-term commitment, preceding entries committed indirectly, and distinguish basic Paxos from stable-leader Multi-Paxos. The [Raft paper](https://raft.github.io/raft.pdf), section 5.4.2 and Figure 8, supplies the counterexample.
2. **qbsd-1 A6; qbsd-a2 model — Little's Law resource inference.** L=1000×0.2=200 is mean in-flight work for a stable, consistently bounded system, not a guarantee that 200 threads or connections suffice. Async multiplexing, queue residence, bursts, tail targets and headroom alter actual resource sizing. Retain arithmetic; qualify interpretation.
3. **qb2-2 A2 — point-in-time cutoff.** Availability at the actual prediction cutoff is required, not merely 'ideally' observed. Latest event-time record can have been published after the decision. Invalid historical evaluation need not manifest immediately in production. State both temporal and availability policy.
4. **qb2-6 A6 — self-hosting boundary.** Self-hosting does not ensure data never leaves a boundary. Network egress, telemetry, tools, storage and deployment controls determine this. State increased control subject to those controls.
5. **qbmlf-3 A14 — squared probability loss.** Binary squared probability loss (Brier score) is also strictly proper; 'unlike squared error' is false. Both Brier and log loss reward honest probabilities in expectation and combine calibration/discrimination. [scikit-learn scoring documentation](https://scikit-learn.org/stable/modules/model_evaluation.html#brier-score-loss) gives the formula and limitations. Keep negative log-likelihood derivation.
6. **cdr-a1 prompt — correction identity.** Prompt says higher revision replaces retained record 'for the same key'; code indexes revisions by globally unique event_id and checks entity key. Two different events for one entity must coexist. Clarify same event_id, unchanged entity key, as implemented.

Additional bounded cautions, suitable for narrow wording corrections: qbmlf-7 A45 steps-per-epoch requires ceiling/floor policy and gradient-accumulation distinction; qbmlf-5 A32 needs activation conditions rather than arbitrary nonlinear activation (a polynomial activation does not provide the stated universal theorem); qb-5 A5 BIC's k log(n) penalty exceeds AIC's 2k only for n>exp(2), and BIC is not a guarantee of a smaller chosen model. These do not invalidate the neighboring examples.

## Independently checked examples

Bayes example: 0.0099/(0.0099+0.0495)=1/6, approximately 17%. KV example: 2×4096×32×32×128×2=2147483648 bytes, 2 GiB/~2.15 GB. Little's Law arithmetic: 200 mean in-flight requests. Nines use 365-day-year basis. One-million-request 99.95% budget: 500; 30-day time budget:21.6 minutes. Independent twenty-test false-positive chance:1−0.95^20≈0.6415. Forecast [0,0,9] gives absolute loss9/12 and squared81/54 at predictions0/3. Newsvendor ratio3/(3+1)=0.75 under declared linear single-period costs. Forest variance formula valid with common individual variance and pairwise correlation. LoRA matrix shapes r×k and d×r give r(d+k). Existing Python code was read for invariants, bounds, aliasing, heap ties, unreachable states, SQL peer/cutoff semantics, and unsupported finite-weight contracts.

## Coverage

| Chapter/section | Fields reviewed | Result |
| --- | --- | --- |
| start-here/sh-1 | body | Reviewed; see findings above where applicable |
| start-here/sh-2 | body | Reviewed; see findings above where applicable |
| start-here/sh-diagnostic | body | Reviewed; see findings above where applicable |
| start-here/sh-3 | body | Reviewed; see findings above where applicable |
| scenario-questions/sq-0 | body | Reviewed; see findings above where applicable |
| scenario-questions/sq-1 | body | Reviewed; see findings above where applicable |
| scenario-questions/sq-2 | body | Reviewed; see findings above where applicable |
| scenario-questions/sq-3 | body | Reviewed; see findings above where applicable |
| scenario-questions/sq-4 | body | Reviewed; see findings above where applicable |
| scenario-questions/sq-a1 | prompt, model | Reviewed; see findings above where applicable |
| scenario-questions/sq-a2 | prompt, model | Reviewed; see findings above where applicable |
| scenario-questions/sq-a3 | prompt, model | Reviewed; see findings above where applicable |
| scenario-questions/sq-a4 | prompt, model | Reviewed; see findings above where applicable |
| scenario-questions/sq-discovery-pilot-handoff | prompt, model | Reviewed; see findings above where applicable |
| scenario-questions/sq-staff-delivery-extension | prompt, model | Reviewed; see findings above where applicable |
| coding-drills/cdr-0 | body | Reviewed; see findings above where applicable |
| coding-drills/cdr-f1 | body | Reviewed; see findings above where applicable |
| coding-drills/cdr-f2 | body | Reviewed; see findings above where applicable |
| coding-drills/cdr-f3 | body | Reviewed; see findings above where applicable |
| coding-drills/cdr-f4 | body | Reviewed; see findings above where applicable |
| coding-drills/cdr-diagnostic | body | Reviewed; see findings above where applicable |
| coding-drills/cdr-testing-explanation | body | Reviewed; see findings above where applicable |
| coding-drills/cdr-arrays-hashing | body | Reviewed; see findings above where applicable |
| coding-drills/cdr-two-pointers | body | Reviewed; see findings above where applicable |
| coding-drills/cdr-binary-search | body | Reviewed; see findings above where applicable |
| coding-drills/cdr-intervals-greedy | body | Reviewed; see findings above where applicable |
| coding-drills/cdr-stacks | body | Reviewed; see findings above where applicable |
| coding-drills/cdr-linked-lists | body | Reviewed; see findings above where applicable |
| coding-drills/cdr-heaps | body | Reviewed; see findings above where applicable |
| coding-drills/cdr-trees | body | Reviewed; see findings above where applicable |
| coding-drills/cdr-graphs-ordering | body | Reviewed; see findings above where applicable |
| coding-drills/cdr-union-find | body | Reviewed; see findings above where applicable |
| coding-drills/cdr-shortest-paths | body | Reviewed; see findings above where applicable |
| coding-drills/cdr-backtracking | body | Reviewed; see findings above where applicable |
| coding-drills/cdr-dynamic-programming | body | Reviewed; see findings above where applicable |
| coding-drills/cdr-tries | body | Reviewed; see findings above where applicable |
| coding-drills/cdr-bits | body | Reviewed; see findings above where applicable |
| coding-drills/cdr-a1 | prompt, model | Reviewed; see findings above where applicable |
| coding-drills/cdr-a2 | prompt, model | Reviewed; see findings above where applicable |
| coding-drills/cdr-a3 | prompt, model | Reviewed; see findings above where applicable |
| coding-drills/cdr-a4 | prompt, model | Reviewed; see findings above where applicable |
| question-bank-system-design/qbsd-1 | body, deeper | Reviewed; see findings above where applicable |
| question-bank-system-design/qbsd-2 | body, deeper | Reviewed; see findings above where applicable |
| question-bank-system-design/qbsd-3 | body, deeper | Reviewed; see findings above where applicable |
| question-bank-system-design/qbsd-4 | body, deeper | Reviewed; see findings above where applicable |
| question-bank-system-design/qbsd-5 | body, deeper | Reviewed; see findings above where applicable |
| question-bank-system-design/qbsd-6 | body, deeper | Reviewed; see findings above where applicable |
| question-bank-system-design/qbsd-7 | body, deeper | Reviewed; see findings above where applicable |
| question-bank-system-design/qbsd-8 | body, deeper | Reviewed; see findings above where applicable |
| question-bank-system-design/qbsd-9 | body, deeper | Reviewed; see findings above where applicable |
| question-bank-system-design/qbsd-a1 | prompt, model | Reviewed; see findings above where applicable |
| question-bank-system-design/qbsd-a2 | prompt, model | Reviewed; see findings above where applicable |
| question-bank-mle/qb2-3 | body, deeper | Reviewed; see findings above where applicable |
| question-bank-mle/qb2-4 | body, deeper | Reviewed; see findings above where applicable |
| question-bank-mle/qb2-1 | body, deeper | Reviewed; see findings above where applicable |
| question-bank-mle/qb2-2 | body, deeper | Reviewed; see findings above where applicable |
| question-bank-mle/qb2-5 | body, deeper | Reviewed; see findings above where applicable |
| question-bank-mle/qb2-7 | body, deeper | Reviewed; see findings above where applicable |
| question-bank-mle/qb2-6 | body, deeper | Reviewed; see findings above where applicable |
| question-bank-mle/qb2-a1 | prompt, model | Reviewed; see findings above where applicable |
| question-bank-mle/qb2-a2 | prompt, model | Reviewed; see findings above where applicable |
| question-bank-ml-foundations/qbmlf-1 | body, deeper | Reviewed; see findings above where applicable |
| question-bank-ml-foundations/qbmlf-2 | body, deeper | Reviewed; see findings above where applicable |
| question-bank-ml-foundations/qbmlf-3 | body, deeper | Reviewed; see findings above where applicable |
| question-bank-ml-foundations/qbmlf-4 | body, deeper | Reviewed; see findings above where applicable |
| question-bank-ml-foundations/qbmlf-5 | body, deeper | Reviewed; see findings above where applicable |
| question-bank-ml-foundations/qbmlf-6 | body, deeper | Reviewed; see findings above where applicable |
| question-bank-ml-foundations/qbmlf-7 | body, deeper | Reviewed; see findings above where applicable |
| question-bank-ml-foundations/qbmlf-8 | body, deeper | Reviewed; see findings above where applicable |
| question-bank-ml-foundations/qbmlf-a1 | prompt, model | Reviewed; see findings above where applicable |
| question-bank-ml-foundations/qbmlf-a2 | prompt, model | Reviewed; see findings above where applicable |
| question-bank-llm/qbllm-1 | body, deeper | Reviewed; see findings above where applicable |
| question-bank-llm/qbllm-2 | body, deeper | Reviewed; see findings above where applicable |
| question-bank-llm/qbllm-3 | body, deeper | Reviewed; see findings above where applicable |
| question-bank-llm/qbllm-4 | body, deeper | Reviewed; see findings above where applicable |
| question-bank-llm/qbllm-5 | body, deeper | Reviewed; see findings above where applicable |
| question-bank-llm/qbllm-6 | body, deeper | Reviewed; see findings above where applicable |
| question-bank-llm/qbllm-7 | body, deeper | Reviewed; see findings above where applicable |
| question-bank-llm/qbllm-a1 | prompt, model | Reviewed; see findings above where applicable |
| question-bank-llm/qbllm-a2 | prompt, model | Reviewed; see findings above where applicable |
| question-bank-fundamentals/qb-1 | body, deeper | Reviewed; see findings above where applicable |
| question-bank-fundamentals/qb-2 | body, deeper | Reviewed; see findings above where applicable |
| question-bank-fundamentals/qb-3 | body, deeper | Reviewed; see findings above where applicable |
| question-bank-fundamentals/qb-4 | body, deeper | Reviewed; see findings above where applicable |
| question-bank-fundamentals/qb-5 | body, deeper | Reviewed; see findings above where applicable |
| question-bank-fundamentals/qb-6 | body, deeper | Reviewed; see findings above where applicable |
| question-bank-fundamentals/qb-7 | body, deeper | Reviewed; see findings above where applicable |
| question-bank-fundamentals/qb-a1 | prompt, model | Reviewed; see findings above where applicable |
| question-bank-fundamentals/qb-a2 | prompt, model | Reviewed; see findings above where applicable |

## Execution and limits

Using the explicit installed Python 3.12.1 interpreter, `-m unittest engine.test_coding_sql engine.test_python_concepts` passed 17 tests. The generic python shim had no configured version; its initial invocation did not execute tests. The passing run exercises actual lesson code and independent fixture expectations already present in the repository. This review additionally checked formulas and mechanisms manually; it does not establish every floating-point extreme, adversarial input, third-party runtime or operational claim empirically. Browser pixels and video playback remain outside this pass. No course content was edited by this reviewer; findings were sent to the implementation owner.
