# ML disposition ledger — 11 October 2026

Reviewed the supplied claim against effective content, not only original source. Final anchors refer to stable chapter/section IDs; implementations are in core/zzzzzzzz-review-ml.js. The focused engine/test_review_ml.cjs loads actual effective content, guards conflicting claims and compares original IDs/check objects immediately before and after this override. No quiz was mutated by this owner.

| Report ID | Disposition | Final source anchor | Judgment / evidence |
| --- | --- | --- | --- |
| PT01 | Accepted; body fixed, quiz delegated | mot-0 body restores health terms and counter resets; quiz replacement proposed to coordinator, which owns versioned quiz updates. | DVC overlap requires capability-based wording; ML override changes no quiz. |
| PT02 | Accepted/fixed | ro-a2 model/rubric | Alert time does not identify cohort maturity; assert mature older/provisional/proxy/artifact distinctions. |
| PT06 | Accepted/fixed | mot-a3 model/rubric | Offline quality checks differ from delayed production evidence. |
| PT07 | Accepted/fixed | mot-f5 body | Request deadline plus GPU/remote/blocking cancellation caveat and bounded admission. |
| PT12 | Accepted/fixed | training-at-scale glossary DDP / all-reduce | Ready buckets reduce during backward; completion waits. tas-f4/tas-a3 already correct. |
| MLF02 | Accepted/fixed | cm-f2 deeper | Convexity only makes attained local minima global; separable unregularized logistic loss may have no finite minimizer and optimizer/step conditions matter. Original M4 implements this; regression checks no unconditional convergence promise. |
| MLF03 | Accepted/fixed | cm-f9 body | Attach non-core border points within eps; non-core does not mean noise. Topic glossary has no DBSCAN row; global glossary/bank handled by coordinator/practice owner. |
| MLF06 | Accepted/fixed | mfe-f6 body | Temperature applies in distillation student training as well as inference. |
| MLF07 | Accepted/fixed | mfe-f6 body | Tied maxima share limiting mass; unique maximum case distinguished. |
| MLF08 | Accepted/already fixed body | dle-f2 deeper | Zero local data-gradient does not guarantee unchanged parameters with momentum/decay. Quiz version belongs to coordinator. |
| MLF09 | Accepted/fixed | dle-f6 body | Unit stride/dilation and channel widths stated; general weight formulas and counterexample supplied. |
| MLF11 | Accepted/fixed | data-and-generalization topic glossary Bias (statistical) | Estimator expectation minus target; squared-loss prediction conditional mean; capacity only possible source. |
| MLF14 | Accepted/fixed | es-0 body; evaluation-and-selection topic glossary ROC-AUC | Half credit for tied scores, independent class draws. |
| MLF26 | Accepted/fixed | classical-models topic glossary Normal equation | Normal equations distinct from inverse formula requiring full rank; QR/SVD alternative. |
| T07 | Accepted/fixed | or-a1 model/rubric; or-4 deeper | Only approved negotiable workload target gets bounded slack; physical/legal/safety capacity hard. |
| T08 | Accepted/fixed | or-0 deeper; or-2 body/deeper | Use MILP for linear subclass; nonlinear MIP relaxes to nonlinear model and relaxation may be integral. |
| T09 | Accepted/fixed | rl-4 body | Scope single-action IPS to bandits; sequential estimators need trajectory/per-decision ratios or occupancy/value assumptions. |
| T11 | Accepted/fixed | ct-a2 model/rubric; ct-a4 rubric | Warm start can speed search, not damping; commitment/freeze, switching penalties and hysteresis constrain churn. ct-a4 model already qualified. |
| T13 | Accepted/fixed | rl-2 body/deeper | Online supervised/fixed offline RL exist; delayed reward does not alone distinguish a bandit from sequential control. |
| T14 | Accepted/fixed | ct-2 body | Scale-down stabilization uses trailing maximum desired replicas; separate rate policies, not fixed cooldown. |
| T15 | Accepted/fixed | uq-2 deeper; uq-f2 body | Multiple quantiles can share joint model; interval calibration can wrap point models. |
| T20 | Accepted/fixed | uq-0 body | Residual standard error is not required by direct quantile or order-statistic intervals. |

Primary verification: [PyTorch gradient clipping](https://docs.pytorch.org/docs/stable/generated/torch.nn.utils.clip_grad_norm_.html), [Adam](https://docs.pytorch.org/docs/stable/generated/torch.optim.Adam.html), [DDP internals](https://docs.pytorch.org/docs/main/notes/ddp.html#internal-design), [scikit-learn linear models](https://scikit-learn.org/stable/modules/linear_model.html), [DBSCAN core/border/noise definitions](https://scikit-learn.org/stable/modules/clustering.html#dbscan), [bias/variance experiment](https://scikit-learn.org/stable/auto_examples/ensemble/plot_bias_variance.html), [Hinton distillation](https://arxiv.org/html/1503.02531v1), [sequential doubly robust OPE](https://arxiv.org/abs/1511.03722), [Kubernetes stabilization](https://kubernetes.io/docs/concepts/workloads/autoscaling/horizontal-pod-autoscale/), [XGBoost joint quantile example](https://xgboost.readthedocs.io/en/release_2.1.0/python/examples/quantile_regression.html). Formulas for tied ranks, channel counts, ridge and normal equations were also checked algebraically; toy numerical calculations do not certify production fitness.

Current focused regression passes. Browser/GPU/provider execution was not performed by this owner; the release coordinator owns full public build and live checks. This disposition ledger supplements the full 170-section ML coverage ledger, whose initial pass results predate later cross-review findings.
