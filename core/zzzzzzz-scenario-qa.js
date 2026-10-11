/* Concrete public scenario Q&A; retain section, activity and quiz identities. */
(function (root) {
  'use strict';
  var topic = root.PREP_CORE['scenario-questions'];
  topic.presentation = 'scenario-qa';
  topic.why = 'Work through realistic engineering situations: what happened, what you would do, and why that response helps.';
  function qa(question, situation, response, why) {
    return '<h4>' + question + '</h4><p><b>Situation.</b> ' + situation + '</p><p><b>A worked response.</b> ' + response + '</p><p><b>Why this works.</b> ' + why + '</p>';
  }
  var sections = {
    'sq-1': ['What would you do when a release harms users?', [
      qa('A launch breaks valid requests. What do you do first?',
        'Immediately after a release, requests with missing optional fields fail. The dashboard shows rising errors. The on-call runbook permits disabling the new parser; the old parser accepts the current data format.',
        'I would confirm affected requests and disable the parser through the tested flag. I would tell the on-call lead what changed and what is affected, compare errors before and after disabling it, and inspect failed requests while recovery continues. Before enabling it again, I would add a missing-field test and verify the fix on representative traffic.',
        'It stops a specific source of harm, checks that the mitigation fits current data, and verifies recovery instead of assuming the flag fixed everything.'),
      qa('Model quality drops, but the service is healthy. What do you investigate?',
        'Latency and errors are normal, but yesterday\'s reported accuracy is lower. Outcome labels sometimes arrive several days late, and a new customer segment recently started using the service.',
        'I would first compare cohorts with equally mature labels. Then I would check input completeness and quality by segment, model version and policy changes. If there is credible user harm, I would discuss a tested fallback with the service owner while investigating. I would not change a threshold or retrain until I understood which errors increased and their consequences.',
        'A changed report can reflect delayed labels or a different population. The response separates those explanations and still allows timely containment.'),
      qa('Tomorrow\'s release has no tested recovery plan. Would you ship?',
        'The release rewrites stored records. A feature flag stops new writes, but it cannot restore records already changed. The migration has not been rehearsed.',
        'I would tell the release owner exactly which effects cannot be undone. I would propose a rehearsal on a representative copy, with validation of every record and a tested recovery or roll-forward procedure. If that cannot be completed, I would recommend deferring the writes or releasing only a separate read-only improvement. The owner would decide against a written acceptance criterion.',
        'The alternatives address the actual irreversible effect. A small rollout or flag alone does not prove the data can be recovered.'),
      qa('You find a feature that reveals a future outcome. What next?',
        'A churn model was evaluated using a cancellation field populated after the prediction date. The evaluation looked excellent, but those values were unavailable when the live predictions were made.',
        'I would withdraw the affected evaluation claim and trace when the field first became available. I would rebuild historical rows at their real prediction cutoffs and test on an unaffected split. In parallel, I would assess live errors with the service owner and choose compatible containment if there is credible harm. I would retain the original artifacts so we can explain the difference.',
        'It corrects the misleading evidence without assuming that an invalid evaluation tells us the exact size of live harm.')
    ]],
    'sq-2': ['What would you do when data or dependencies fail?', [
      qa('A backfill changes the evaluation result. Which result do you trust?',
        'A corrected import adds missing rows and changes some historical values. The new evaluation score differs from last week\'s score, even though the model code is unchanged.',
        'I would pin both data versions, feature code and labels. I would compare predictions on shared rows separately from the newly added population, then inspect changed values and their availability dates. I would report both results with their dataset versions and explain which one matches the intended evaluation contract.',
        'Separating changed values from changed coverage makes the difference explainable and keeps the old result reproducible.'),
      qa('The scheduler reaches its deadline without a plan. What do you dispatch?',
        'A solver returns UNKNOWN and no feasible incumbent. Yesterday\'s schedule used a worker who is unavailable today.',
        'I would not read nonexistent solution values or reuse yesterday\'s plan unchecked. I would run the approved fallback and validate every assignment against today\'s availability and hard constraints. If no valid schedule exists, I would tell the dispatch owner and use the approved deferral or manual procedure. I would keep safety and legal constraints intact.',
        'A timeout is not proof of infeasibility and does not supply a usable plan. Independent validation prevents a plausible-looking fallback from violating current constraints.'),
      qa('A dependency hangs rather than returning an error. How do you respond?',
        'An inventory service stops responding. Requests pile up because each caller retries three times with no overall deadline.',
        'I would use the approved controls to cap concurrency and stop unbounded retry work. I would set an end-to-end deadline and share traces with the inventory owner. If confirmed inventory is required, I would return a pending or unavailable result rather than invent availability. I would verify queue recovery and test both hangs and explicit errors before restoring normal traffic.',
        'It protects the caller from accumulating work while preserving the dependency\'s meaning. A circuit breaker can help, but it does not decide which fallback is valid.'),
      qa('An alert wakes you at 2 a.m., but users seem unaffected. Do you act?',
        'A backup verification alert reports that the latest restore failed. User traffic is normal, but a cleanup job will delete older backups in an hour.',
        'I would check the alert and the on-call procedure, page the responsible owner, and pause the cleanup if that action is authorized. I would preserve the last known usable backup and verify a restore in the approved environment. I would record what remains unverified and arrange a clear handover.',
        'Time-to-harm matters even before visible customer impact. The response protects recovery evidence rather than improvising a production repair.')
    ]],
    'sq-3': ['What would you do if two teammates disagree?', [
      qa('Two teammates disagree about the model to ship. How would you help?',
        'One teammate favors a more accurate model; another favors a simpler model with lower latency. A small trial cannot reliably distinguish their business outcomes, and the launch is due next week.',
        'I would ask each person to explain the evidence and the constraint they are protecting. Together, we would compare the same evaluation data, latency budget, operating cost and failure cases. If a short test could change the decision, I would agree its success and stop criteria first. If uncertainty remained, I would recommend a tested option to the engineering lead who owns the launch, record the trade-off, and set a review date.',
        'It turns a personal dispute into a shared decision. It also acknowledges that an inconclusive experiment cannot choose the owner\'s business trade-off.'),
      qa('Another team cannot meet your dependency deadline. What do you do?',
        'Your team needs a new API field for a release. The owning team says the date is unrealistic because it is handling an incident. Both teams assumed the other had accepted the date.',
        'I would meet the owner, confirm the contract and ask what delivery they can support. I would explain the consequence for our release and offer a compatible reduced scope or a later milestone. If the contractual date still conflicts with their capacity, I would take the options and impact to the accountable leads promptly. I would update the shared plan and owners after the decision.',
        'The conversation addresses a missed agreement, not a presumed lack of cooperation. Escalation resolves a material dependency conflict with concrete options.'),
      qa('A complex design improves one metric slightly. Is it worth it?',
        'A candidate model improves an offline metric but doubles serving cost and makes debugging harder. The gain may matter at high volume, but its uncertainty and user value have not been measured.',
        'I would compare it with the simple baseline on the same held-out data and important user slices. I would translate the gain into expected user benefit and compare that with cost, latency and support burden. If evidence justified a controlled pilot, I would agree acceptance and stop criteria with the owner. Otherwise, I would keep the baseline and explain what evidence would change my recommendation.',
        'Neither a small gain nor added complexity settles the decision by itself. The answer connects measured benefit to operational consequences.'),
      qa('A stakeholder asks for a precise delivery estimate you cannot support. What do you say?',
        'A stakeholder asks whether a migration will finish Friday. Most tasks are understood, but an external dependency and one data-conversion failure remain unresolved.',
        'I would explain the completed work, the unresolved dependency and the failure we are testing. I would give a range tied to explicit assumptions, identify the earliest date we can narrow it, and offer a smaller milestone that is better understood. If Friday is a hard commitment, I would ask the owner to choose scope or resource changes rather than present an uncertain estimate as a promise.',
        'A useful estimate communicates what changes the outcome and when more evidence will arrive. False precision would hide the decision the stakeholder needs to make.')
    ]],
    'sq-4': ['How would you review a migration or AI-generated code?', [
      qa('How would you migrate a service while protecting existing users?',
        'A new platform must preserve existing record identifiers and permissions. Both systems can run briefly in parallel, but a duplicate write could create an external effect twice.',
        'I would map the record and access contracts, then compare old and new outputs on the same approved test inputs. I would isolate shadow work from external writes, validate individual records as well as totals, and measure capacity. I would rehearse the cutover and a compatible rollback or roll-forward procedure, name the operational owner, and proceed only when the agreed checks passed.',
        'Matching aggregate output is not enough to protect individual records or permissions. The response explicitly prevents shadow work from duplicating effects.'),
      qa('AI-generated code passes its own tests. Would you accept it?',
        'An AI tool writes a range-filter function and tests. Both incorrectly include the upper boundary, although the contract requires a half-open interval.',
        'I would derive expected outputs from the contract before inspecting the generated assertions. I would test the lower boundary, upper boundary, empty input and an interior value. I would review a targeted patch changing the upper comparison, run those tests and the existing suite, and inspect the diff for unrelated changes. I would use only an approved tool with permitted inputs.',
        'Code and tests can share the same misunderstanding. Independently expected boundary results reveal the defect; neither AI nor human authorship proves correctness.')
    ]]
  };
  topic.learn.forEach(function (s) {
    s.viz = null;
    s.presentation = 'scenario-qa';
    if (sections[s.id]) {
      s.title = sections[s.id][0]; s.body = sections[s.id][1].join('');
      s.presentation = 'scenario-qa'; s.deeper = null;
    }
  });
  var terms = topic.learn.find(function (s) { return s.id === 'sq-0'; });
  terms.body = '<p>These situations are illustrative. Read the worked responses directly and rehearse aloud if useful. A hypothetical response is not a claim that you personally handled that event.</p>' + terms.body.slice(0, terms.body.indexOf('</ul>') + 5);
  terms.deeper = null;
  var followups = {
    'sq-a1': ['What if disabling the new parser does not fix the errors?', 'The parser flag is off, but errors remain. A schema writer was deployed at the same time, and some records now use a format the old service cannot read.', 'I would tell the incident lead that the first mitigation did not restore service. I would inspect the failing record versions and stop further incompatible writes through the authorized procedure. I would compare a tested reader that understands both versions with a safe traffic restriction, rather than blindly reverting code. After the selected mitigation, I would check both newly written and existing records.', 'A failed mitigation is new evidence. Recovery must fit the data already written, not just the previous implementation.'],
    'sq-a2': ['What if the migration rehearsal fails the recovery test?', 'The proposed release writes a new record format. The rehearsal succeeds forward, but restoring the old reader makes those records inaccessible.', 'I would report the failed recovery test and recommend holding the writes. I would propose a dual-format reader or a tested conversion forward to a working format, then rerun the rehearsal on representative records. If the release owner accepts a reduced read-only scope, I would separate it from the unsafe writes and verify that separation.', 'Defer and reduced scope are concrete options. A working forward migration does not imply a working rollback.'],
    'sq-a3': ['What if the decision owner chooses a different option from your recommendation?', 'The team reviewed quality, latency and cost. The launch owner selects the simpler model while requesting another evaluation next month.', 'I would confirm the decision and the constraints behind it, record the alternative and uncertainty, and help implement the agreed tests and review date. If the choice violated a hard security or safety requirement, I would raise that specific issue through the appropriate process. Otherwise, I would support the decision and bring new evidence to the scheduled review.', 'Disagreement does not require either silent compliance or repeated argument. Clear ownership, hard constraints and a revisit condition make the decision accountable.'],
    'sq-a4': ['What if a correct boundary patch breaks an existing caller?', 'Independent tests confirm that the range is half-open, but one caller relied on the old inclusive upper boundary. Its tests now fail.', 'I would check the documented caller contract and identify which tests describe intended behavior. I would update the caller explicitly, or add a versioned compatibility boundary if it must keep the old behavior. I would review the targeted patch with an approved tool if useful, then execute both the function and caller tests. I would not change expected outputs merely to obtain green tests.', 'A local correctness fix can expose a compatibility dependency. The response treats the contract as evidence and makes the caller change deliberate.'],
    'sq-discovery-pilot-handoff': ['How would you turn an AI-review request into a useful pilot?', 'A support team wants an agent to draft replies from approved knowledge articles. Staff currently check every draft, and only designated reviewers may send a response.', 'I would observe a few real workflows and establish time spent, correction effort and common failure cases. I would first compare a simpler retrieval-and-draft workflow with an agent. The pilot would use approved cases, enforce article access and keep sending under reviewer control. I would agree measures for supported answers, correction time, successful tasks, cost and permission failures, with explicit stop criteria. Before handover, I would have the receiving owner rehearse a change, a rollback and revoked-access handling using the runbook.', 'The pilot tests whether the requested automation improves the actual work. Ownership is demonstrated by independent operation, not merely by handing over a document.'],
    'sq-staff-delivery-extension': ['Optional extended case: a dependent team misses the pilot date', 'The pilot depends on a new permission API. Its owning team cannot deliver on time; the existing API supports only a smaller approved set of articles.', 'I would map the dependency and quantify which pilot cases it blocks. I would compare postponement with a smaller pilot using the existing API, excluding any cases whose permissions cannot be enforced. I would bring those options to the accountable owner, revise the milestones after the decision, and keep the permission boundary intact. Support handover would finish only after the receiving team had rehearsed operation and the agreed acceptance measures held.', 'Reducing scope can be sound when the reduced scope is still useful and authorized. A deadline does not justify bypassing access controls.']
  };
  topic.activities.forEach(function (a) {
    var f = followups[a.id]; if (!f) return;
    a.title = f[0]; a.prompt = '<p><b>Situation.</b> ' + f[1] + '</p>';
    a.model = '<p><b>A worked response.</b> ' + f[2] + '</p><p><b>Why this works.</b> ' + f[3] + '</p>';
    a.viz = null;
  });
}(typeof window !== 'undefined' ? window : this));
