/* Original applied evaluation cases: no personal or employer-specific record. */
(function (root) {
  'use strict';
  root.PREP_CORE = root.PREP_CORE || {};
  root.PREP_CORE['recommendation-systems'] = {
    id: 'recommendation-systems', title: 'Recommendation: retrieval to useful decisions',
    level: 'warning', levelLabel: 'Applied ML and AI engineering',
    why: 'Produce a ranking evaluation and release gate that account for missing candidates, exposure bias, cold starts, latency and user outcomes.',
    prerequisites: ['evaluation-and-selection', 'search-and-retrieval', 'data-features'],
    learn: [
      { id: 'rec-0', part: 'field', title: 'Key terms',
        body: `<p><b>Candidate generation</b> retrieves a small eligible set from a large catalogue. <b>Ranking</b> orders those candidates. <b>Reranking</b> applies constraints such as diversity or safety to that order. <b>Exposure</b> means an item was shown; a missing click on an unseen item is not a negative preference label. <b>Cold start</b> means little interaction evidence for a new user or item. <b>NDCG</b> is discounted relevance gain divided by the ideal gain from a fixed judged eligible universe. <b>Guardrails</b> are required limits on harms, latency, cost or other outcomes alongside a primary goal.</p>`, deeper: null, check: null },
      { id: 'rec-candidates', part: 'field', title: 'Trace the missing recommendation', viz: 'case-recsys-two-stage',
        body: `<p>A learning-resource catalogue has 100,000 items. A new advanced learner receives popular introductory material. Trace one request through eligibility, candidate generation, feature retrieval, ranking and reranking. If the advanced resource never reaches the shortlist, a better ranker cannot recover it.</p><p>Predict what changes when the shortlist doubles under a 120 ms request budget. Compare retrieval recall, ranking work, tail latency and freshness. Label each diagram arrow with its owner, input contract and failure path.</p>`,
        deeper: `<p>Compare popularity, content-based and collaborative baselines on the same eligible catalogue. For new users, ask for interests or use context under a consented contract; for new items, content features can help. Interaction data reflect past exposure and position. Evaluate selection and coverage rather than assuming unclicked items are irrelevant. A useful optional resource is Google's recommendation course; its published course estimate is four hours, rather than a single-video runtime.</p>`, check: null },
      { id: 'rec-ranking', part: 'field', title: 'Hold the ideal ranking fixed',
        body: `<p>Judges grade eligible items A=3, B=1 and C=0. A system returning only B must not receive NDCG@1=1 by defining its own ideal universe. With gain 2^grade-1, its score is 1/7. Use the same judgments, eligible universe, cutoff and missing-judgment policy across systems.</p><p>Predict the result before running the small reference. Then remove A from the system output, not from the judgment universe.</p>`,
        deeper: `<pre><code class="language-python">import math

def ndcg(returned, judged, k):
    if k &lt; 1 or len(returned) != len(set(returned)):
        raise ValueError("positive cutoff and unique result IDs required")
    if any(item not in judged for item in returned):
        raise ValueError("declare a missing-judgment policy first")
    def gain(grades):
        return sum((2**g-1)/math.log2(i+2) for i,g in enumerate(grades))
    ideal = gain(sorted(judged.values(), reverse=True)[:k])
    actual = gain([judged[item] for item in returned[:k]])
    return actual/ideal if ideal else 0.0
</code></pre><p>This fixture defines zero ideal gain as score zero and rejects unknown judgments. A production evaluation needs a defensible judging/sample policy and uncertainty, not this toy's exhaustive labels.</p>`, check: null },
      { id: 'rec-release', part: 'field', title: 'An offline gain is a hypothesis', viz: 'ab-test-flow',
        body: `<p>A new ranker improves judged NDCG but mostly exposes already-popular items. Choose a product outcome such as successful learning-resource use, then define safety, diversity, cold-start coverage and latency guardrails. Check freshness and access constraints before a bounded pilot.</p><p>Reattempt with a 60 ms budget and a new-user population. Explain in 60–90 seconds which baseline you would keep, which evidence would change your decision and why the offline gain may not become user value.</p>`, deeper: `<p>Offline labels and historical exposure can mismatch the product outcome. A randomized pilot needs a valid unit and interference analysis; see <a href="#experimentation-and-causal-measurement">Experimentation and causal measurement</a>. Use confidence intervals, operational limits and a decision owner rather than a single metric winner.</p>`, check: null }
    ],
    activities: [{ id: 'rec-evaluation-artifact', type: 'design', title: 'Build a ranking release gate',
      prompt: 'Create a one-page evaluation plan for the resource catalogue. Include fixed judgments and eligibility, retrieval coverage, a cold-start slice, an exposure-bias warning, latency budget, outcome/guardrail thresholds and a pilot stop rule. Annotate the two-stage diagram. Reattempt when the request budget halves.', timeboxSec: null,
      rubric: 'Require an inspectable plan, arithmetic or test output, explicit assumptions and a spoken defense. Accept lexical, content, collaborative or hybrid candidates when measured constraints justify them. Reward discriminating evidence, access/freshness propagation, operational ownership and an explicit no-go option. Do not infer competence from reading the sample. {{HONESTY}}',
      model: '<p>I would first verify whether the useful items reach the eligible shortlist. I would compare candidate methods under the latency budget, evaluate ranking against one fixed judged universe, and report new-user and new-item coverage separately. I would treat the offline gain as a hypothesis, predeclare product and safety gates, and use an authorized bounded pilot with stop criteria. Halving the budget may favor a simpler baseline or smaller shortlist until measurements justify more work.</p>' }],
    readings: [{ l: 'Google — Recommendation Systems', u: 'https://developers.google.com/machine-learning/recommendation', w: 'Public course with reading and exercises for candidate generation, collaborative filtering, scoring and reranking. Publisher states four hours for the whole course; selected sections can be used independently. Requires basic ML and linear algebra.', m: 30 }, { l: 'scikit-learn — NDCG reference', u: 'https://scikit-learn.org/stable/modules/generated/sklearn.metrics.ndcg_score.html', w: 'Public primary reference for gain, discounting and tie treatment; use for a metric implementation review.', m: 10 }],
    connect: null, sayQuestion: null, sayItOutLoud: null
  };
  root.PREP_CORE['experimentation-and-causal-measurement'] = {
    id: 'experimentation-and-causal-measurement', title: 'Experiments: evidence for a decision',
    level: 'warning', levelLabel: 'Applied measurement and production judgment',
    why: 'Produce a defensible experiment contract and diagnose misleading results before a release decision.',
    prerequisites: ['ml-math-essentials', 'data-and-generalization', 'evaluation-and-selection'],
    learn: [
      { id: 'exp-0', part: 'field', title: 'Key terms',
        body: `<p><b>Estimand</b> is the effect or quantity being estimated. <b>Randomization unit</b> is the entity assigned to a condition, such as a user or team. <b>Interference</b> means one unit's treatment changes another unit's outcome. <b>Minimum detectable effect (MDE)</b> is an effect a design aims to detect at chosen error and power levels. <b>Power</b> is the probability of rejecting the null for a specified true effect. <b>Sample-ratio mismatch (SRM)</b> is an unexpected allocation imbalance. <b>Confidence interval</b> is an interval procedure with stated repeated-sampling coverage assumptions. <b>Multiple comparisons</b> are several tested claims requiring an error-control plan. <b>Sequential stopping</b> uses accumulating data under a valid stopping/inference rule. <b>Guardrail</b> is a required safety or operational constraint.</p>`, deeper: null, check: null },
      { id: 'exp-contract', part: 'field', title: 'Randomize the right entity', viz: 'ab-test-flow',
        body: `<p>A shared support queue tests AI reply suggestions. Agents share answers and queue assignments affect waiting time. Request-level randomization may mix conditions within an agent and spill effects between groups. Name the estimand, population and randomization unit before launch; investigate team/queue clustering and interference rather than assuming independent requests.</p><p>Trace assignment → exposure → outcome → label availability on the diagram. A correct assignment count does not prove exposure or labels were measured correctly.</p>`,
        deeper: `<p>Predeclare the primary outcome, population, effect scale, MDE, error/power targets and analysis. Clustered units need dependence-aware design and uncertainty; more requests within one team are not equivalent to more independent teams. A no-treatment baseline and a justified defer decision remain valid.</p>`, check: null },
      { id: 'exp-diagnosis', part: 'field', title: 'Inject a misleading success',
        body: `<p>A planned 50:50 user allocation logs 6,000 control and 4,000 treatment users. Treatment outcomes arrive one day later, and only closed tickets have quality labels. Pause effect interpretation: inspect assignment, exclusions, exposure logging, missing outcomes and label selection. SRM is a diagnostic signal; investigate its cause with a declared test rather than repair counts by discarding inconvenient users.</p><p>Reattempt after allocation is correct but teams share suggestions. What could still make the effect estimate misleading?</p>`,
        deeper: `<p>For an illustrative two-arm difference in means with independent observations, equal variance sigma² and equal arm sizes, a normal approximation gives n per arm ≈ 2*(1.96+0.84)²*sigma²/delta² for two-sided 5% error and about 80% power. This is an estimate under those assumptions, not a universal sample-size recipe. Binary, clustered, heavy-tailed and rare-label outcomes need an appropriate design calculation.</p>`, check: null },
      { id: 'exp-stop', part: 'field', title: 'A release rule before results', viz: 'ab-test-flow',
        body: `<p>Predeclare the outcome, uncertainty method, multiple-testing plan, analysis window and stopping rule. Repeatedly checking ordinary fixed-sample p-values until one crosses 0.05 changes the error rate. Use a valid sequential design when early stopping is required. Safety monitoring can stop a harmful test independently of a claimed efficacy result.</p><p>Under twenty true nulls tested at 0.05, expected false positives are one; independence gives probability of at least one 1−0.95^20, about 64%. Neither statement guarantees a false positive in a particular run.</p>`,
        deeper: `<pre><code class="language-python">def false_positive_summary(tests, alpha):
    if tests &lt; 0 or not 0 &lt;= alpha &lt;= 1:
        raise ValueError("nonnegative test count and probability required")
    return tests*alpha, 1-(1-alpha)**tests
</code></pre><p>The second result assumes independent true-null tests; the expected count uses the marginal error rates. Report confidence intervals and effect relevance, guardrail outcomes and unresolved bias. A nonsignificant result may be inconclusive rather than proof of no effect.</p>`, check: null }
    ],
    activities: [{ id: 'exp-plan-artifact', type: 'design', title: 'Write the experiment contract',
      prompt: 'Create a prelaunch experiment plan for shared support suggestions: estimand, population, assignment/exposure units, interference, outcome/label contract, MDE/power assumptions, SRM diagnostic, uncertainty, multiple comparisons, stopping, safety guardrails and decision owner. Annotate one failure path. Reattempt with scarce delayed quality labels.', timeboxSec: null,
      rubric: 'Require the actual plan and an assumption-aware spoken defense. Score identification, logging/selection diagnosis, dependence-aware uncertainty, realistic sample/power reasoning, predeclared analysis/stopping and authorized harm containment. Accept cluster designs, safe offline pilots or deferral when justified; no mandatory significance result or tool choice. {{HONESTY}}',
      model: '<p>I would define the effect on eligible users and check how shared queues and agents create interference. I would choose and justify assignment units, log actual exposure, and preserve delayed and missing labels. Before launch I would specify effect size, power assumptions, uncertainty, allocation diagnostics, multiplicity and stopping rules. Safety limits can stop the pilot without claiming efficacy. Scarce labels may require a longer or narrower study, a different defensible estimand or deferral.</p>' }],
    readings: [{ l: 'Microsoft Research — Twelve metric interpretation pitfalls', u: 'https://www.microsoft.com/en-us/research/publication/a-dirty-dozen-twelve-common-metric-interpretation-pitfalls-in-online-controlled-experiments/', w: 'Public primary research page and paper on interpreting controlled experiments. Use selected failure cases to challenge the predeclared plan.', m: 25 }, { l: 'SciPy — permutation-test assumptions', u: 'https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.permutation_test.html', w: 'Public primary reference for null hypotheses and valid permutation structures; unrestricted shuffling is not appropriate for arbitrary dependent observations.', m: 15 }],
    connect: null, sayQuestion: null, sayItOutLoud: null
  };
}(typeof window !== 'undefined' ? window : this));
