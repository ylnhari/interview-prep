# Decision systems and scenario audit resolution

Effective public source: `core/zzzz-decision-audit.js`, loaded after the original library. Existing chapter/section/activity identifiers are retained. Tests load all effective core files, not the stale original literals. Source references are linked near the relevant explanations. No private content or Space work is included.

| Supplied finding | Resolution and evidence |
| --- | --- |
| ML audit 22: CVXPY, DCP | `or-0`, `or-1`, `or-a0`: mixed-integer support, compatible solver, certification versus convexity. `or-0` quiz corrected. |
| ML audit 23: deadline, warm start, stochastic MIP | `or-6`, `or-a5`: UNKNOWN/no incumbent, independent validation, explicit commitments/change cost; scenario MILP accepted. New `or-status-validation` exercises missing/incumbent/invalid/current-capacity cases. |
| ML audit 24: control scope, PID, token bucket | `ct-1/4/5/6`: optional domain scope; explicit MPC conditions; PID saturation/anti-windup; fixed bucket is not automatically feedback. `ct-1` quiz corrected. |
| ML audit 25: OPE, shadow, method dogma | `rl-0/1/3/4/5/6`, `rl-a1/a4/a5`: IPS versus direct/FQE assumptions, nonstationarity insufficient, tabular methods allowed, partial feedback/carry-over, shadow cannot measure unchosen rewards, monitoring plus objective repair. |
| Decision bank 1: mean/median/quantile | `qb-1` A7 and `qb-a2`: squared/absolute/linear asymmetric losses, coupling caveat. Displayed Python counterexample tested. |
| Decision bank 2–3: split gap, intervals | `qb-1` A3/A6: expanding/sliding windows; horizon/availability/dependence gap policy; interval target and comparable-level scope. |
| Decision bank 4–7: MILP/CP, infeasibility, status, assignment | `qb-2` A2–A6/A9: no exponential-tree mandate; CP-SAT has relaxations; IIS; negotiable slack only; no-solution/status/tolerance contract; skills/costs can preserve flow structure; feasible accepted warm start. |
| Decision bank 8: MPC boundary | `qb-3` A1/A2 and `ct-6`: model/state/horizon/feedback conditions; open-loop optimal control exists. |
| Decision bank 9–10: OPE and partial feedback | `qb-4` A1/A2/A4: direct/FQE does not universally need propensities; continuous actions possible; plans/buffers may have carry-over. |
| Decision bank 11–12: bias/variance, p-value/permutations | `qb-5` A2/A3/A4/A7: specified-loss expectations, hypotheses rather than diagnoses, null/statistic definition; expected false positives and 64.15% independent probability; dependence-valid permutation. Arithmetic tested. |
| Decision bank 13–15: feature contracts, shadow, repeatability | `qb-6` A2/A4/A5/A7: parity/time availability; drift attribution uncertainty; data/capacity/side effects; compatible recovery; artifact preservation and declared reproducibility scope. |
| Decision bank 16 and rubric corrections | `qb-7` A1/A3/A4; `qb-a1/a2`: missing labels do not exclude all learning; governance exceptions; honest bounds/no estimate; alternative correct answers; no readiness claim; coverage plus width and combined policy cost. `qb-4` A5 requires objective repair. |
| Scenario 1–3: containment, drift, leakage | `sq-0/1`, `sq-a1`: risk/authority/compatibility before mitigation; hypotheses can coexist; decision-time leakage, unaffected evaluation, measured harm. No prescribed rollback/threshold. |
| Scenario 4–5: scheduler and nighttime alert | `sq-2`: statuses, current constraints, approved halt/deferral; severity/time-to-harm before visible impact. |
| Scenario 6: release decision | `sq-1`, `sq-a2`: justified ship/reduce/defer, named owner and evidence gate; no mandatory yes, guessed hours or volunteering; flags do not undo writes. |
| Scenario 7: AI code/test use | `sq-4`, `sq-a4`: independent oracle, reviewed tests/patch and execution; AI assistance allowed under approved policies; no human-authorship guarantee or invented complexity requirement. |
| Scenario 8–9: backfill/dependencies | `sq-2`: pinned data/code/labels/time contracts; separate coverage and values; down may hang; bounded deadlines/retries/concurrency and coordinated recovery. |
| Scenario 10–13: disagreements, escalation, baseline, estimate | `sq-3`, `sq-a3`: no stereotypes/history invention; experiment may be inconclusive; business owner; broad escalation grounds; offline baseline before approved pilot; defensible estimate/bounds/needs. |
| Scenario 14–15: migration/rhetoric | `sq-4`, all `sq` bodies/deeper/models: cutover option, capacity/compatibility, per-record tolerance or stochastic task checks; incident versus decision spine; frequency/mind-reading rhetoric removed. |

Preserved: `qb-1` A5 conformal qualification; `qb-4` A3 solver-certification qualifier; `qb-5` A6 association/causality; `qb-6` A8 and `qb-7` A5 decision/discovery structure; the newer `sq-discovery-pilot-handoff` lesson and activity. Forecasting chapter fixes are owned by the ML worker. Staff capstone extension is coordinated separately.

Eight corrected quizzes change meaning: `or-0`, `ct-1`, `rl-4`, `sq-0` through `sq-4`. Release must register the scoped progress revisions so old selections remain retained without being treated as answers to rewritten questions. The compatibility worker owns this migration; no silent progress reset is permitted.

Validation: `node engine/test_decision_audit.cjs` executes the displayed Python status validator and loss code; includes no solution, invalid status, eligibility, capacity, changed capacity, missing job, empty contract, loss arithmetic and invalid loss. It also checks honesty tokens, old routes, all 48 reference-answer slots and removed misleading language. This is a small assignment fixture, not a tested full solver implementation or live production migration. No external video playback or browser QA is claimed by this worker.
