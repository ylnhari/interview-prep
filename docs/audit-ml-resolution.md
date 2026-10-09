# ML content resolution ledger

Scope: the supplied 2026-10-09 audit, reconciled with existing dirty calibration
and explanation edits. Stable chapter, lesson and activity IDs are retained.
This ledger covers the ML worker's ownership; SQL/coding, production ML,
training-at-scale and decision-system question banks have separate owners.

| Finding | Resolved source locations | Evidence / qualification |
| --- | --- | --- |
| 1 Calibration, accuracy, AUC, rare events | cm-f3 preserved; cm-a1 rubric/model; qbmlf-4 A25 | Half-credit ties, strictly monotone versus isotonic ties, independent evaluation and event counts |
| 2 Missingness | dag-f2 body/deeper; qbmlf-2 A9 preserved | MCAR does not preserve variance after mean fill; MAR model/estimand assumptions |
| 3 Squared-loss decomposition | dag-f6 body/deeper/check; dag-0 bias definition; dag-a1 rubric/model; qbmlf-1 A2 | Repeated-training expectation and conditional target, no universal capacity law |
| 4 Threshold metrics | es-f3 body/deeper; es-f4 check | [1,0,1] counterexample; operating points separate from average precision / trapezoidal PR-AUC |
| 5 Log-loss baseline | mfe-f5 body/deeper/check | A .4/.625 true-class probability fixture has mean ln(2) without constant .5 predictions |
| 6 OLS and SVM | cm-f1 body/deeper; cm-f7 body/deeper | QR/SVD, identification versus inference assumptions; regularized hinge objective with C |
| 7 Tree library stereotypes | cm-f6 body/deeper; cm-a3 rubric/model; qbmlf-3 A18/A19 | Versioned configurations and equal benchmark budgets |
| 8 Split conformal | uq-3 body/deeper; uq-a1 rubric/model | Actual displayed Python executed, corrected order rank, small-n infinite interval, invalid/NaN score cases |
| 9 DeepAR / MASE | uq-f1 body/deeper; uq-a0 rubric/model; uq-f3 body/deeper | Sampled trajectories versus direct quantiles; training scaling denominator versus held-out paired comparison |
| 10 Forecast functional | uq-1 deeper/check; uq-f3 body | A point may target a quantile; evaluate combined buffers and coupled constraints |
| 11 Backward versus update / warmup | dle-f2 deeper; dle-f4 body/check; qbmlf-7 A41 | SGD can warm up; no compulsory AdamW claim |
| 12 Attention shapes | dle-a3 prompt/rubric/model | Displayed reference executed on nonsquare cross-attention, causal and fully masked rows, malformed shapes and extreme scores |
| Secondary math | mfe-0, mfe-f1, mfe-f2 body/deeper/check | Local minima may be global, mass/density likelihood, squared ridge norm, orthogonal reflections and covariance convention |
| Secondary learning curves and drift | dag-f8 body/deeper; dag-f9 body/deeper; qbmlf-2 A12 | Hypotheses and finite-class assumptions; P(X) change does not establish pure covariate shift; labels/validated estimation |
| Secondary clustering | cm-f8 body; cm-f9 body; qbmlf-8 A49/A50/A52 | EM stationary/degenerate cases; scikit-learn DBSCAN includes self; no fixed KNN feature cutoff |
| Secondary deep learning | dle-f5 deeper; dle-f8 body/deeper/check; dle-a1 rubric/model | Label smoothing effects need measurement; permutation equivariance; RoPE no extrapolation guarantee; ReLU can revive |
| Secondary statistics | qbmlf-1 A5; qbmlf-4 A25 | No universal CLT n=30; reliability plots plus counts |

Validation: `python -m unittest engine.test_ml_content` passed eight tests.
Four learner-visible Python functions are executed from the content itself;
metric fixtures additionally verify the three-label precision counterexample,
ROC-AUC ties and the nonunique mean-log-loss example. No GPU experiment or
external notebook execution is claimed.

Quiz wording/options changed in mfe-f2, mfe-f5, dag-f6, dag-f8, dag-f9, es-f4, dle-f4,
dle-f8 and uq-1. Each retained its canonical correct answer index and option
count. These semantic corrections still require the release owner's explicit
compatibility ledger review; old self-recorded attempts are not evidence of
having learned the revised explanation.

Existing Fanout-style references are not copied. Existing chapter visuals are
retained; the common renderer owns visual-first presentation, collapsing
extended answers and reduced-motion behavior. This worker did not conduct
browser QA, verify external video playback or publish independently.

New original chapters in `core/applied-evaluation.js` address the curriculum
gaps: `recommendation-systems` and `experimentation-and-causal-measurement`.
They reuse appropriate pipeline/experiment diagrams and ask learners to trace,
predict, diagnose a changed constraint and produce a release-gate or experiment
contract. Extended references are optional. Recommendation work includes
fixed-universe judged ranking, retrieval loss, exposure, cold-start slices,
latency and business/safety gates. Experimentation includes randomization unit,
interference, MDE/power assumptions, allocation mismatch, selection/delayed
labels, uncertainty, multiplicity, sequential stopping and safety gates.
The additional executed displayed functions verify fixed-universe NDCG,
duplicate/unknown result policies, zero ideal gain and twenty-test arithmetic.
