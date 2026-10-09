# Systems audit resolution

Audit supplied 9 October 2026; reconciled against the checkout rather than treating
the snapshot as the current release. Existing IDs are retained. Quiz corrections
keep their canonical correct index; the release compatibility manifest records
the reviewed wording changes. This ledger is scoped content evidence, not a
claim that every external link or production architecture was exercised.

| Supplied item | Resolution and evidence |
| --- | --- |
| 1 — request SLO budgets | Rewrote `srep-0`, `srep-f2`, `srep-a1`, `qbsd-9/A50`, `qb2-4/A2` and the error-budget diagram. One million requests at 99.95% permits 500 failures; minutes apply to a distinct time SLI. Burn-rate denominator explicit. Arithmetic tested. |
| 2 — write-through and TTL | `cache-0`, `cache-2`, `cache-3`, `qbsd-5/A25–26` distinguish acknowledgment from atomic agreement, fill age from origin staleness, and late-refill races. Existing careful `sdf-a2` retained. |
| 3 — quorums, PACELC and vector clocks | `dc-3` and caption retain intersection math with membership/durability/reconciliation/sloppy-quorum assumptions. `dc-4` names favored properties and avoids product-wide labels or all-replica strong-read rules. `dc-5` requires one strict component and distinguishes equal vectors. |
| 4 — online migrations | Rewrote `srep-f4`, its check and `srep-a2`: lock bounds, engine/version, compatible writers, transactional same-DB dual writes, concurrent-safe batching, validation and destructive contract boundary. SQL worker independently owns `sql-f9` and SQL fixture validation. |
| 5 — paused workers | `qs-f6` distinguishes short claim transactions from long work and requires sink-enforced fences, atomic same-DB completion or supported downstream idempotency; leases/dedup records alone are insufficient. |
| 6 — ideal ranking universe | `sr-f5` uses a fixed judged eligible universe with grade-3/grade-1 counterexample: NDCG@1=1/7. Quiz feedback explicitly notes NDCG is defined for a single result and explains recall coverage. Arithmetic tested. |
| 7 — HTTP and TCP | `apc-0` safe-method semantics/caching and check explanation corrected. Its TCP definition and `nb-0`, `nb-f2` distinguish ordered received bytes from delivery/application outcome certainty. |
| 8 — window semantics | `cs-f2` permits processing-time load counts, reserves event time for the corresponding business question, treats watermarks as estimates and requires explicit idle/reactivation policy. |
| 9 — Bloom filters | `npi-f8`, `qbsd-8/A46` (actual snapshot numbering), and caption use “might be present,” insertion/hash assumptions and conditional FPR. Hash count improves only to the optimum; numerical counterexample tested. |
| 10 — rollout choices | `ro-f4`, `ro-a2`, `ro-a3`, `qb2-4/A3–8`, `qbsd-9/A53` remove ML exclusivity, zero-risk and compulsory progression claims. Risk-aware authorized mitigation, compatible state and measured recovery replace blanket immediate rollback. |
| 11 — environments and artifact identity | `mot-f1` distinguishes version resolution from bytes/numerical repeatability and framework/runtime/driver from optional extension toolkit. `mlp-f5` accepts immutable artifact digest/versioned file/object identity and lineage without mandating one registry product. |
| 12 — storage recovery | `se-f6` requires tombstones, logical versions, acknowledgment boundary, synchronized crash-safe manifest publication, concurrent-write protection and recovery tests as the assigned build contract. This lesson is a design/build specification, not a claim of a shipped runnable storage engine. `se-f7` permits key overwrite and scopes S3 operations; `qbsd-7/A40` removes universal LSM speed superiority. |
| 13 — retrieval/recommendation | `sdc-8` outcome, explanation and feedback use feature semantics/availability parity, NDCG/business utility and guardrails. `sr-f2` names TF-IDF variants; `sr-f7` removes unsupported hybrid prevalence. |
| 14 — deployment/capacity | `rac-f6` separates deployment boundary from repository organization. `ss-f2` retains HPA/scheduler/node-autoscaler distinction, describes warm capacity as one strategy and removes the unsupported serving-round prevalence claim. |
| 15 — framing | Neutral outcome-oriented `why`/level labels for systems overview, lifecycle, serving, requirements and SRE. Course orientation/path selection belongs to the parent renderer/home work. Useful named technologies and hypothetical examples retained. |

Production-ML overlap: `mot-0` check now acknowledges DVC experiments/params/metrics;
`mot-f5` explicitly covers coercion/strictness, finite/range constraints,
end-to-end deadlines and cancellation limits. `mlp-a2` consistently names three
evaluation sets and avoids “accuracy meaningless.” `mlp-a3` is a hypothetical
adoption design with explicit governance, support, pilot criteria and honest
experience boundaries rather than fabricated first-person history. General
incident scenario and ML/AI statistical corrections belong to their workers.

Added original applied case `sdc-enterprise-features` and dedicated chapter
`enterprise-feature-platform`. The staged chapter distinguishes exact observed
decision replay, acknowledgment-based approximate reconstruction and corrected
truth; includes region-specific visibility, tenant authority, replay versions,
home-writer fencing, residency, quotas and independent operational handover.
The fixture uses two tenants sharing an entity key, a 45-minute correction,
regional lag, an unavailable value and an exact availability boundary.

`node engine/test_systems_audit.cjs` passes: final effective public-object loading,
request/time budget arithmetic, NDCG counterexample, Bloom optimum, synthetic
capacity units, tenant/time fixture outputs, selected misleading-phrase
regressions and Key-terms-first ordering. It exercises no cloud accounts.
Reference URLs derive from supplied primary-source audit; this worker did not
play videos or perform a full link census. Browser/deployment evidence is owned
by the parent task.

Source compatibility cleanup: the two legacy `library.js` text-transformation
helpers now skip absent legacy phrases when rewritten source already supersedes
them. They still locate existing topics/items normally. No progress reset or ID
replacement was introduced. Temporary editing scripts are ignored under `local/`
and are excluded from publication.
