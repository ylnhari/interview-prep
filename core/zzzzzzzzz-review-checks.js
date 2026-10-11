/* Reviewed retained-ID quiz corrections. Historical choices use their old revision keys. */
(function () {
  const core = window.PREP_CORE;
  const check = (topic, id) => core[topic].learn.find(s => s.id === id).check;
  const suffix = check('sql-databases', 'sql-f2');
  suffix.options[1] = 'Leading-column constraints are usually most efficient, but suffix-only scans or supported skip scans may help; inspect the engine, version and actual plan';
  suffix.explain = 'A composite B-tree is ordered first by customer_id. Without that leading constraint, an engine may scan a larger part of the index. PostgreSQL 18 can use skip scan when the planner expects it to help, for example with relatively few distinct leading values. Inspect the measured plan rather than categorically rule out the index.';
  const migration = check('sql-databases', 'sql-f9');
  migration.options[1] = 'Expansion and bounded backfill preserve compatibility; DDL still acquires locks, and destructive contraction follows the rollback window';
  migration.explain = 'Expand, migrate and contract separate compatibility from destructive removal. Test engine-specific lock behavior, bound backfill work and retain compatible old readers/writers through the declared rollback window. The sequence does not promise every step is reversible or lock-free.';
  const quic = check('networking-basics', 'nb-f3');
  quic.options[1] = 'QUIC removes cross-stream ordered-byte blocking; one lost packet can affect frames from several streams, and shared congestion still affects throughput';
  quic.explain = 'QUIC streams have separate ordered-byte delivery, so a missing byte on one stream does not force another stream to wait for that byte. Packets can contain frames from multiple streams, and congestion control still couples their network capacity.';
  const tf = check('search-and-retrieval', 'sr-f2');
  tf.question = tf.question.replace('plain TF-IDF', 'raw-count TF-IDF');
  tf.explain = tf.explain.replace(/plain TF-IDF/g, 'raw-count TF-IDF');
})();

(function () {
  const core = window.PREP_CORE;
  const check = (t,id) => core[t].learn.find(s => s.id === id).check;
  const dvc = check('mlops-tooling','mot-0');
  dvc.question = 'What is an accurate relationship between DVC experiment management and an experiment platform such as MLflow?';
  dvc.options = ['DVC cannot record experiment parameters or metrics', 'DVC supports experiments, parameters, metrics and plots; choose tooling from the required collaboration, tracking, registry and deployment workflow rather than assuming DVC cannot track runs', 'Every DVC pipeline must also use MLflow', 'Versioning data automatically guarantees model quality'];
  dvc.explain = 'DVC can save and compare experiments and track parameters, metrics and plots. Data versioning alone is not the same as establishing a complete workflow, but a separate tracker is not mandatory merely because DVC is present. Compare actual product capabilities and operating requirements.';
  const goodput = check('llm-inference-engineering','lie-f9');
  goodput.options[1] = 'Higher concurrency can raise aggregate throughput while worsening TTFT or TPOT; goodput may rise or fall, so measure SLO-qualified completion rate and missed-deadline rate separately';
  goodput.explain = 'Raw throughput does not imply latency quality or the direction of goodput. At 100 completed requests/s and 99% SLO attainment, goodput is 99/s and misses 1/s; at 200/s and 90%, goodput is 180/s and misses 20/s. Complaints and goodput can both rise.';
  const stream = check('system-design-cases','sdc-10');
  stream.options[1] = 'Streaming exposes text before a whole-answer check can finish; when unsupported claims must never be exposed, buffer for verification or release only independently verified segments under an explicit safety contract';
  stream.explain = 'A later retraction or flag cannot undo disclosure. Full-answer verification conflicts with immediate streaming; strict pre-release support requires buffering or verification of independently releasable segments, with the actual safety boundary stated.';
  const ridge = check('classical-models','cm-0');
  ridge.options[1] = 'Ridge typically shrinks coefficients without inducing sparsity; lasso can induce exact zeros, while special data or symmetry can also yield a zero ridge coefficient';
  ridge.explain = 'L2 penalizes squared coefficient magnitudes and usually shrinks continuously; it does not categorically forbid a zero optimum. L1 can induce sparse fitted coefficients. Neither penalty guarantees superior predictive accuracy.';
  const relu = check('deep-learning-essentials','dle-f2');
  relu.question = "In the worked example, why is neuron A's local data-loss gradient through ReLU zero on this step?";
  relu.options[1] = "A's pre-activation is negative, so ReLU's derivative is zero and this data-loss path contributes no gradient to A's weights";
  relu.explain = 'Negative-input ReLU has zero derivative, so this local data-loss gradient is zero. A parameter may still change through momentum, weight decay or another gradient path; only a plain SGD update with none of those forces would leave it unchanged.';
  const conv = check('deep-learning-essentials','dle-f6');
  conv.question = 'With stride 1, dilation 1, no intervening pooling, equal input/intermediate/output channel count C and biases excluded, why can two stacked 3x3 convolutions cover a 5x5 receptive field with fewer weights than one 5x5?';
  conv.options[1] = 'The receptive field grows from 3 to 5; equal channels require 18*C*C weights versus 25*C*C, while arbitrary intermediate widths can reverse the parameter saving';
  conv.explain = 'For arbitrary channel counts, two layers need 9*Cin*Cmid + 9*Cmid*Cout weights versus 25*Cin*Cout for one 5x5. The equal-channel comparison gives 18*C*C versus 25*C*C. Receptive-field size also depends on stride, dilation and intervening operations.';
  const gap = check('or-tooling','or-6');
  gap.question = 'A minimization solver stops with feasible incumbent I=100 and valid lower bound B=97. Using the explicitly declared relative-gap formula (I-B)/I, what does its 3% gap establish?';
  gap.options[1] = 'The optimum lies between 97 and 100, so any improvement is at most 3 units, or 3% of this positive incumbent; other solver gap formulas must be interpreted separately';
  gap.explain = 'The bound and feasible incumbent give B <= optimum <= I for minimization. Here 3/100 is 3%. Solver denominators differ, especially near zero or with signed objectives; a reported gap is not a universal percentage improvement without its definition.';
  check('search-and-retrieval','sr-f2').explain = check('search-and-retrieval','sr-f2').explain.replace('Plain term frequency in TF-IDF', 'Raw-count term frequency in TF-IDF');
})();

(function () {
 const core=window.PREP_CORE;
 const c=(t,id)=>core[t].learn.find(s=>s.id===id).check;
 c('counting-and-sketches','cs-f4').question='For an insertion-only Count-Min Sketch with nonnegative increments, suitable hashes and counters that do not overflow, why take the minimum across its d counters instead of their average or maximum?';
 c('counting-and-sketches','cs-f4').explain='Under the stated insertion-only conditions, collisions only add nonnegative mass, so every matching counter is at least the true count. Their minimum is the tightest one-sided estimate. Signed deletions or overflow invalidate this argument.';
 c('sre-practices','srep-f6').explain=c('sre-practices','srep-f6').explain.replace('A sliding window is the standard fix.', 'An exact sliding-window log enforces a rolling count; weighted window counters approximate it and reduce, rather than universally eliminate, boundary effects.');
 c('distributed-coordination','dc-7').explain+=' A newer lease grant alone does not revoke the old token at the destination: the destination must first observe or atomically install the higher token and compare it as part of applying an operation.';
 c('queues-and-streams','qs-f4').explain+=' Delivery and retention guarantees still assume the broker durability and failure contract; at-least-once is not immunity to arbitrary catastrophic data loss or expired retention.';
})();
