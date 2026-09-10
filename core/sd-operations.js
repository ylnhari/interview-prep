/* sd-operations: two system design chapters, site reliability practices and worked system design cases. */
(function (root) {
  'use strict';
  root.PREP_CORE = root.PREP_CORE || {};

  root.PREP_CORE['sre-practices'] = {
    id: 'sre-practices',
    title: 'Site reliability practices',
    level: 'warning',
    levelLabel: 'Common in senior system design and reliability-focused rounds.',
    why: `System design interviews used to stop at the box diagram. Increasingly they keep going: how would you know this is broken, what exactly did you promise, how do you ship a change that might break it, and what happens the night it actually does. None of that is exotic - it is a small, well-known set of practices that most production systems share no matter what they do: watch the right signals, write down a target and a budget for missing it, roll changes out gradually, migrate data without downtime, back things up and rehearse the restore, limit abuse, handle other people's data correctly, and keep one tenant from breaking another. Interviewers use this material to check whether you have actually run something, not just designed it.`,
    learn: [
      {
        id: 'srep-0',
        part: 'field',
        title: 'Key terms',
        body: `<ul>
<li><b>SLI (service level indicator).</b> A measured number describing quality, such as the fraction of requests served under 200 milliseconds.</li>
<li><b>SLO (service level objective).</b> The target for an SLI, stated as a percentile, a threshold and a window: "99.9% of requests under 200ms over 30 days."</li>
<li><b>SLA (service level agreement).</b> An SLO with a contractual consequence attached. Most internal targets are objectives, not agreements.</li>
<li><b>Error budget.</b> The amount of failure an SLO already permits, spent on risk and releases rather than avoided entirely.</li>
<li><b>Burn rate.</b> How fast the error budget is being spent, as a multiple of the sustainable rate.</li>
<li><b>Golden signals.</b> Latency, traffic, errors and saturation - the four numbers worth a dashboard on any service.</li>
<li><b>Structured logging.</b> Writing each log line as named fields (user_id, latency_ms, status) instead of a sentence, so it can be queried like data.</li>
<li><b>Cardinality.</b> The number of distinct values a metric's labels can take. A label with millions of distinct values is high-cardinality and expensive to store.</li>
<li><b>Sampling.</b> Recording only a share of traces to keep tracing affordable at volume, usually keeping every error and slow request.</li>
<li><b>Correlation id (trace id).</b> An identifier passed through every service a request touches, so its logs and spans can be joined into one story.</li>
<li><b>Span.</b> One hop of a distributed trace - one service's part of handling one request.</li>
<li><b>Feature flag.</b> A runtime switch that turns a code path on or off independently of deploying it.</li>
<li><b>Canary release.</b> Sending a small slice of traffic to a new version while comparing its metrics to the old one, before ramping further.</li>
<li><b>Blue-green deployment.</b> Running two full environments and switching all traffic at once, with the previous one kept warm for an instant rollback.</li>
<li><b>Progressive delivery.</b> The umbrella term for canary, blue-green and staged rollout with a check at each step.</li>
<li><b>Expand and contract.</b> A four-stage pattern for changing a schema with no downtime: add the new structure, write to both, switch reads, then remove the old one.</li>
<li><b>Dual write.</b> Writing the same change to two places at once - typically an old and a new schema - during a migration.</li>
<li><b>Backfill.</b> Copying or recomputing existing rows into a new structure after that structure has started accepting live writes.</li>
<li><b>Parallel read-drain.</b> Pointing a new service's reads at the old system first, proving correctness, then gradually moving read traffic away from the old path.</li>
<li><b>RPO (recovery point objective).</b> How much data a restore may lose, measured backward in time from the failure.</li>
<li><b>RTO (recovery time objective).</b> How long a recovery may take, measured forward from the failure to full restoration.</li>
<li><b>Failover drill.</b> A scheduled, deliberate rehearsal of shifting traffic to a standby region or replica.</li>
<li><b>Token bucket.</b> A rate-limiting algorithm that refills tokens at a fixed rate and allows a burst up to the bucket's capacity.</li>
<li><b>Leaky bucket.</b> A rate-limiting algorithm that queues requests and drains them at a fixed rate, smoothing bursts into steady output.</li>
<li><b>Fixed window (rate limiting).</b> Counting requests in a fixed calendar interval that resets fully at the boundary.</li>
<li><b>Sliding window (rate limiting).</b> A rate limit that blends the current and previous window's counts to avoid the fixed-window boundary burst.</li>
<li><b>Data retention schedule.</b> A stated rule for how long a category of data is kept before it is deleted or archived.</li>
<li><b>Right to erasure.</b> A legal right, most known from GDPR, for a person to have their personal data deleted on request.</li>
<li><b>PII (personally identifiable information).</b> Data that identifies a specific person: name, email, government id, precise location.</li>
<li><b>Encryption at rest / in transit.</b> Protecting stored data from anyone who reaches the disk directly, and protecting data moving over the network, respectively.</li>
<li><b>Audit log.</b> A separate, append-only record of who accessed or changed what and when.</li>
<li><b>Authentication.</b> Proving who a caller is.</li>
<li><b>Authorization.</b> Deciding what an already-identified caller is allowed to do.</li>
<li><b>OAuth.</b> A protocol letting a user grant one application limited, revocable access to their data on another service, without sharing a password.</li>
<li><b>Secrets management.</b> Storing API keys, passwords and signing keys in a dedicated, access-controlled system rather than in code or config files.</li>
<li><b>Tenant.</b> One customer or organisation being served from shared infrastructure in a multi-tenant system.</li>
<li><b>Noisy neighbour.</b> One tenant's load degrading shared infrastructure for every other tenant on it.</li>
<li><b>Tenant quota.</b> A cap on how much of a shared resource one tenant may consume.</li>
</ul>`,
        deeper: `<p>Almost everything in this list exists to answer one of two questions faster: "is something wrong right now" and "should we be worried about this specific change." The golden signals and observability tooling answer the first. SLOs, error budgets and safe rollout patterns answer the second. Keeping that split in mind is what stops the vocabulary from feeling like a random list - each term is a tool built for one of those two jobs.</p>`,
        check: {
          question: 'What is the actual difference between an SLO and an SLA?',
          options: [
            'They mean the same thing; SLA is just the older term',
            'An SLA is an SLO with a contractual consequence attached; most internal reliability targets are objectives, not agreements',
            'An SLO applies to latency and an SLA applies to availability',
            'An SLA is set by engineering and an SLO is set by sales'
          ],
          answer: 1,
          explain: 'SLO and SLA differ by consequence, not by subject matter: an SLA is a promise with a penalty (often contractual) if it is missed, while an SLO is an internal target with no such consequence.'
        }
      },
      {
        id: 'srep-f1',
        part: 'field',
        title: 'Observability: logs, metrics, traces, and the golden signals',
        viz: 'golden-signals',
        body: `<p>A single service is easy to debug: read the logs, done. A request that crosses ten services is not - the line you need might sit on a machine you did not even know was involved. <b>Observability</b> is the ability to answer a question about the system's behaviour that you did not think to ask in advance, and it rests on three kinds of data.</p>
<p><b>Metrics</b> are numbers aggregated over time - request count, error count, a latency histogram - cheap to store and fast to query, which is why they drive dashboards and alerts. <b>Logs</b> are individual, timestamped records of one event, useful once you already know roughly where to look. <b>Traces</b> follow one request as it crosses service boundaries, built from <b>spans</b> - one span per hop - stitched together by a <b>trace id</b> every service passes along. Metrics tell you something is wrong; a trace tells you where.</p>
<p>Two disciplines turn this data into something usable instead of overwhelming. <b>Structured logging</b> writes each log line as named fields instead of a sentence, so it can be queried like data rather than grepped like text. And every log line and span belonging to one request should carry the same <b>correlation id</b> - usually the trace id - so a single query pulls every record for that request across every service it touched.</p>
<p>The four numbers worth a dashboard of their own are the <b>golden signals</b>: <b>latency</b> (how long a request takes, always at a percentile), <b>traffic</b> (how much load is arriving), <b>errors</b> (how often it fails), and <b>saturation</b> (how full the most constrained resource is). Almost every incident shows up in at least one of these before a customer files a complaint.</p>`,
        deeper: `<p>Two costs catch people out. <b>Cardinality</b> is the number of distinct values a metric's labels can take; a metric labelled by user id can generate millions of separate time series, which is expensive to store and can silently overwhelm a metrics backend - keep unbounded values in logs or traces, and keep metric labels to a small, bounded set. <b>Sampling</b> keeps tracing affordable at high volume: recording every span of every request does not scale, so most systems keep every trace for errors and slow requests and only a small percentage of ordinary fast ones, which is enough to see what normal behaviour looks like without paying to store all of it.</p>`,
        check: {
          question: 'A metric is labelled by user_id, and the metrics backend starts falling over under normal traffic. What is the most likely cause?',
          options: [
            'Too many requests per second',
            'High cardinality - a distinct time series is created per user id, and there may be millions of them',
            'Sampling is set too high',
            'The trace id is missing from the logs'
          ],
          answer: 1,
          explain: 'A label with unbounded distinct values multiplies the number of stored time series, which is what overloads a metrics backend - not raw request volume, and not tracing configuration.'
        }
      },
      {
        id: 'srep-f2',
        part: 'field',
        title: 'SLIs, SLOs and error budgets',
        viz: 'error-budget-burn',
        body: `<p>An <b>SLI</b> is a number you actually measure: the fraction of requests served under 200 milliseconds, say. An <b>SLO</b> is the target for that number, stated with a percentile, a threshold and a window - "99.9% of requests under 200ms over 30 days." An <b>SLA</b> is an SLO with a contractual penalty attached; most internal targets are objectives, not agreements, and mixing up the two words in front of someone who lives by them is a small tell.</p>
<p>The useful idea underneath an SLO is the <b>error budget</b>: the amount of failure the objective already permits, spent instead of avoided. The formula is direct: <b>budget = (1 - SLO) x window</b>. A 99.9% objective over a 30-day window allows (1 - 0.999) x 43,200 minutes = <b>43.2 minutes</b> of failure that month, on whatever unit the SLI measures. Spend that budget on releases and risk; once it is gone, the answer to "should we ship this" becomes "not until reliability catches up" - not a values statement, but arithmetic anyone can check.</p>
<p>Knowing the budget is 43 minutes does not say when to page someone - a slow leak that empties the budget on day 29 needs a different response than a spike that would empty it in an hour. That is what a <b>burn rate</b> measures: the speed the budget is being spent, as a multiple of the sustainable rate. A burn rate of 1x spends the whole month's budget in exactly a month; a burn rate of 10x would spend it in three days. Alerting on a fast burn rate, not only on remaining budget, is what catches a bad deploy inside the hour instead of at the end of the month.</p>`,
        deeper: `<p>A concrete alerting rule, of the kind published in the site reliability engineering (SRE) handbooks Google made public: page if the service is burning budget fast enough to exhaust a 30-day budget in about two days - a burn rate of roughly 14x, which spends about 2% of the month's budget in a single hour - confirmed over a short window (a few minutes) so one brief blip does not page anyone. Open a ticket, do not page, for a much slower burn that would still exhaust the budget in a few days, because that deserves attention this week, not a 3 a.m. wake-up. The pattern repeats: pair a long lookback window, accurate but slow to fire, with a short one, fast but noisy, and require both to agree before alerting.</p>`,
        check: {
          question: 'A service has a 99.9% SLO over 30 days and is currently burning its error budget at 5x the sustainable rate. What does that mean?',
          options: [
            'The service is 5% unavailable right now',
            'At the current rate, the 30-day budget would be exhausted in about 6 days instead of 30',
            'The SLO has already been breached',
            'The service needs a larger error budget'
          ],
          answer: 1,
          explain: 'Burn rate is a multiple of the sustainable spend rate: at 5x, a budget meant to last 30 days is consumed in 30 / 5 = 6 days if the rate holds.'
        }
      },
      {
        id: 'srep-f3',
        part: 'field',
        title: 'Incident response: roles, communication, runbooks, postmortems',
        viz: 'incident-scenario-spine',
        body: `<p>An incident needs structure before it needs a hero. Most organisations sort incidents into <b>severity levels</b> - a common scheme runs SEV1 (the whole product is down or data is at risk) down to SEV4 (a minor, contained problem) - because the severity decides who gets paged, how often updates go out, and whether an executive needs to know. Getting the severity right, and raising it once things look worse than first thought, matters more than the exact label used.</p>
<p>Past a certain severity, one person cannot both fix the problem and manage the response, so incidents get explicit <b>roles</b>: an <b>incident commander</b> who coordinates and makes the calls that unblock others - including when to escalate, or when to stop trying something that is not working - one or more people actually diagnosing and fixing, and a <b>communications lead</b> who updates stakeholders on a fixed schedule so the fixers are not interrupted every ten minutes for a status update. <b>Communication</b> follows the same discipline as the fix itself: a single channel of record, timestamped updates, and a stated next-update time even when there is nothing new to say.</p>
<p>A <b>runbook</b> is the written, tested procedure for a specific alert - what to check first, what to run, when to escalate - so the third person paged at 2 a.m. does not have to reconstruct what the first person already learned. Afterward, a <b>blameless postmortem</b> asks what in the system allowed the failure, not who caused it, on the reasoning that naming a person as the cause teaches everyone to hide the next near-miss instead of reporting it.</p>`,
        deeper: `<p>A postmortem worth reading follows the same structure every time: a timeline of what happened, in order, with timestamps; the impact, measured against the SLO where one exists; the root cause and contributing factors, plural, because a real outage is almost always more than one thing going wrong at once; what went well and what did not in the response itself; and a list of action items, each with an owner and a date, not a vague intention. The test of a good one is whether the next person paged for a similar alert resolves it faster because this document exists - not whether it reads well.</p>`,
        check: {
          question: 'Why do organisations write blameless postmortems instead of identifying who made the mistake?',
          options: [
            'To avoid disciplinary consequences for the team involved',
            'Naming a person as the cause teaches people to hide near-misses and mistakes rather than report them, which loses the information that prevents the next incident',
            'Because most incidents have no clear cause',
            'Because postmortems exist only for legal record-keeping'
          ],
          answer: 1,
          explain: 'Blameless postmortems keep information flowing: if reporting a mistake gets a person blamed, people stop reporting them, and the system loses its best early warning of the next incident.'
        }
      },
      {
        id: 'srep-f4',
        part: 'field',
        title: 'Deployment and migration safety',
        viz: 'expand-contract-migration',
        body: `<p>Shipping code and shipping risk are the same action, so the goal is never zero risk - it is a small, contained, reversible amount of it. A <b>feature flag</b> separates deploying code from turning it on: the new path ships dark, then is enabled for a percentage of traffic or a specific set of accounts, independent of any deploy. <b>Canary</b> releases send a small slice of real traffic to the new version while comparing its metrics to the old one at each step, aborting backward if they diverge; <b>blue-green</b> keeps two full environments and switches all traffic at once, so rollback is a single router flip back to the environment that never stopped running. Both are <b>progressive delivery</b>: ramping exposure in controlled steps rather than an all-at-once release, with a check at each step.</p>
<p>A schema change is riskier than a code change, because you cannot instantly roll back data the way you roll back a binary. <b>Expand and contract</b> is the standard answer: <i>expand</i> by adding the new column or table alongside the old one; <i>migrate</i> by backfilling old rows and writing to both forms at once (a <b>dual write</b>); verify the two agree; <i>switch</i> reads over to the new form; then <i>contract</i> by removing the old form only once nothing depends on it. Every stage leaves the system fully working on its own, so a bad deploy at any stage is a revert, not an outage. The relational databases chapter works the same pattern through at the SQL level, including the tools that automate it.</p>
<p>Splitting a monolith into services needs the equivalent move for reads: the <b>parallel read-drain</b> pattern points a new service's reads at the old system's data first, through its API or a replica, proves the new read path works with zero risk to correctness, then gradually drains read traffic away from the old path as confidence builds - the data itself moves, or gets duplicated, only once the read path is already proven.</p>`,
        deeper: `<p>A detail worth adding yourself: a feature flag and a canary solve different problems and are worth combining. A canary limits exposure <i>while rolling out</i>; a flag gives an instant kill switch <i>after</i> the rollout has finished, with no new deploy needed - and both matter, because the failure a canary catches in minutes and the one that only shows up under real load after a day are both real. The cost side is worth naming too: flags that outlive their rollout accumulate as <b>flag debt</b>, dead code paths nobody remembers exist - so a flag should carry an expiry date and an owner, not just a name.</p>`,
        check: {
          question: 'Why is a database schema change usually riskier to roll back than a code deploy?',
          options: [
            'Schema changes are always slower to apply',
            'Rolling back code restores the previous binary instantly, but data already written in a new form cannot simply be un-written - the migration itself has to be designed to be reversible',
            'Database changes require more approvals',
            'Code deploys never fail'
          ],
          answer: 1,
          explain: 'A code rollback restores a known-good binary in one move. A schema or data change can leave rows in a form the old code cannot read, so safety has to be designed into the migration steps themselves - which is exactly what expand-and-contract does.'
        }
      },
      {
        id: 'srep-f5',
        part: 'field',
        title: 'Backups, restore and disaster recovery',
        viz: 'rpo-rto',
        body: `<p>Two numbers matter most in every disaster recovery conversation. <b>RPO</b> is how much data you can afford to lose, measured backward in time from the moment of failure - an RPO of 15 minutes means a restore may lose up to the last 15 minutes of writes. <b>RTO</b> is how long the recovery itself may take, measured forward from the failure to the moment service is fully restored. They are independent numbers with independent costs: a small RPO needs frequent backups or continuous replication; a small RTO needs somewhere to fail over to and a rehearsed, fast procedure for doing it - buying one does not buy the other.</p>
<p>A backup nobody has restored is a belief, not a backup. <b>Backup testing</b> means actually running the restore, on a schedule rather than only when something breaks, and checking the restored data is complete and the application can run on it - backup jobs can silently succeed while writing corrupt or incomplete files for months before anyone notices. The same applies to <b>failover drills</b>: scheduled, deliberate exercises of shifting real or realistic traffic to the standby region or replica, because a failover procedure that has only ever been read, never run, usually breaks the first time it matters.</p>
<p>The <b>multi-region</b> choice trades cost against RTO. <b>Active-passive</b> keeps a standby region ready but idle - cheaper to run, slower to bring fully up to speed and traffic. <b>Active-active</b> serves real traffic from more than one region at once, so failover is a traffic-routing change rather than a cold start - a lower RTO, at the cost of running (and keeping consistent) full capacity in more than one place all the time.</p>`,
        deeper: `<p>Worth naming the mechanics behind "backup": a <b>full backup</b> copies everything, an <b>incremental backup</b> copies only what changed since the last one and restores by replaying a chain, and a storage-level <b>snapshot</b> is a point-in-time copy taken by the underlying disk or database engine, usually the fastest to take and to restore. A widely cited rule of thumb, the <b>3-2-1 rule</b>, says to keep three copies of data, on two different kinds of storage, with one copy off-site - aimed squarely at the failure mode where the backup and the primary die together, in the same data centre, from the same cause.</p>`,
        check: {
          question: 'A system takes nightly backups with a 24-hour RPO, but restoring one takes six hours and has never actually been tested. What is the biggest problem?',
          options: [
            '24 hours of possible data loss is always unacceptable',
            'The restore has never been tested, so the real RPO and RTO are unknown until the day they are needed - the worst possible time to find out',
            'Backups should be taken hourly instead',
            'Six hours is too long for any RTO'
          ],
          answer: 1,
          explain: 'An untested restore procedure is an assumption, not a number. The stated RPO and RTO are only real once the restore has actually been run and verified to work.'
        }
      },
      {
        id: 'srep-f6',
        part: 'field',
        title: 'Rate limiting: algorithms, placement, and the key',
        viz: 'token-bucket-sliding',
        body: `<p>A rate limiter caps how much one caller may do in a window, and the common algorithms trade burst tolerance against precision. A <b>token bucket</b> refills tokens at a fixed rate up to a capacity; each request spends one token, and an empty bucket means rejection - it allows a burst up to the bucket size, then settles to the refill rate. A <b>leaky bucket</b> instead queues requests and drains them at a fixed rate regardless of how bursty the arrivals were, smoothing output at the cost of added latency for queued requests. A <b>fixed window</b> counts requests in, say, each calendar minute and resets to zero at the boundary - simple, but it allows up to double the intended rate for a caller who bursts at the very end of one window and again at the start of the next. A <b>sliding window</b> fixes that, either by keeping a timestamped log of every request (exact, but memory-heavy) or, more commonly, by blending the current and previous fixed windows' counts weighted by how much of the previous window is still "inside" the sliding frame - approximate, cheap, and good enough in practice.</p>
<p><b>Where</b> to put the limiter matters as much as which algorithm: at the API gateway or edge, before a request reaches anything expensive, so a rejected caller costs almost nothing. <b>Which key</b> to limit on matters just as much - per user, per API key, per IP, or some combination - and the key should match what you are actually protecting against: an IP-based limit stops a single machine but not a botnet spread across many; a per-account limit stops one customer from starving the rest regardless of how many machines they use.</p>
<p>A single replica can hold its counters in memory, but a fleet of gateway replicas needs a <b>shared, distributed counter</b> so the limit holds cluster-wide rather than per-replica - commonly implemented in Redis, using an atomic increment-and-check operation, or a small script, so two replicas can never both approve a request that should have pushed the count over the limit.</p>`,
        deeper: `<p>Two implementation details worth having ready. First, "atomic" is the whole point: a naive get-count, check, increment done as three separate calls has a race where two concurrent requests both read the count before either increments it, letting both through when only one should pass - the fix is a single atomic command, or a small server-side script, that performs the check and the update as one step. Second, a well-behaved limiter tells the caller what to do next: a <b>429 Too Many Requests</b> response with a <b>Retry-After</b> header, so a well-written client backs off instead of hammering the limiter harder.</p>`,
        check: {
          question: 'A fixed-window rate limiter allows 100 requests per minute. A caller sends 100 requests at 0:59 and another 100 at 1:01. What happens?',
          options: [
            'The second batch is rejected, since the limit is 100 per minute',
            'All 200 requests succeed, because they fall in two different fixed windows only two seconds apart - the classic fixed-window boundary burst',
            'The limiter automatically switches to a sliding window',
            'Both batches are rejected'
          ],
          answer: 1,
          explain: 'A fixed window resets fully at the boundary, so a caller who times two bursts around 0:59 and 1:01 gets up to double the intended rate in a two-second span. A sliding window is the standard fix.'
        }
      },
      {
        id: 'srep-f7',
        part: 'field',
        title: 'Data retention, privacy and deletion',
        body: `<p>Every category of data a system stores should have a stated <b>retention schedule</b> - how long it is kept, and what happens when that period ends - decided deliberately rather than left as "forever" by default. Keeping data longer than needed is not free: it is more to secure, more to be breached, and in many jurisdictions a compliance liability in its own right.</p>
<p><b>PII</b> - names, emails, government id numbers, precise location, anything that identifies a specific person - needs handling rules distinct from ordinary application data: minimise what you collect, restrict who and what can read it, and know exactly where every copy lives, including in logs, backups, analytics exports and a data warehouse, because a value that leaked into a log line is just as exposed as one in the primary database. The <b>right to erasure</b> - the best-known version comes from GDPR, and similar rules exist elsewhere - gives a person the right to have their personal data deleted on request, which is a much harder engineering problem than it sounds once that data has been copied into backups, caches, search indexes, replicas, and a partner's downstream system. A design has to be able to answer "where does this person's data live" before it can promise to delete it everywhere.</p>
<p><b>Encryption at rest</b> protects stored data if the underlying disk or backup is ever accessed directly; <b>encryption in transit</b> protects data moving between services or to a client from being read or altered on the network. Neither substitutes for access control - both assume the data is unreadable without the key, not that nobody can reach it. An <b>audit log</b> is a separate, append-only, tamper-resistant record of who accessed or changed what and when, kept specifically so a security review or an investigation has an answer that does not depend on trusting the same system that might have been compromised.</p>`,
        deeper: `<p>A genuine tension worth raising yourself: an erasure request and an audit log, or a financial ledger which by design must never be altered, can pull in opposite directions. The usual resolution is to delete or anonymise the personal fields while keeping the event itself - "user 88213 made a purchase" survives as a fact even once the name and address attached to that id are gone - and to let backups age out and expire naturally under the retention schedule, rather than trying to selectively edit a backup, which is both operationally dangerous and easy to get wrong.</p>`,
        check: {
          question: 'A user exercises their right to erasure. Why is this typically harder than deleting one row from the primary database?',
          options: [
            'It is not harder; one delete statement is sufficient',
            'Personal data is usually copied into backups, caches, logs, search indexes, replicas and downstream systems, and a real deletion has to reach or expire all of them, not only the primary copy',
            'GDPR only applies to companies based in Europe',
            'Encryption already makes the data inaccessible'
          ],
          answer: 1,
          explain: 'Deletion has to account for every place the data was copied - backups, logs, caches, replicas, analytics, downstream partners - which is why knowing where data lives is a prerequisite for honouring an erasure request at all.'
        }
      },
      {
        id: 'srep-f8',
        part: 'field',
        title: 'Security and abuse prevention basics',
        body: `<p><b>Authentication</b> answers "who are you" - proving identity, typically with a password, a token, or a certificate. <b>Authorization</b> answers "what are you allowed to do" - a separate question, checked after identity is established. Conflating the two is a common source of bugs, where a valid, logged-in user can reach data or actions they should never be allowed to touch.</p>
<p><b>OAuth</b>, specifically the authorization code flow most web and mobile apps use, lets a user grant one application limited access to their data on another service without ever handing over their password: the user authenticates with the service that owns the data, that service issues a short-lived, scoped <b>access token</b> back to the requesting application, and the application presents that token on each API call instead of any credential. The scopes on the token limit exactly what it can do, and it can be revoked without changing the user's password.</p>
<p><b>Secrets</b> - API keys, database passwords, signing keys - belong in a dedicated secrets manager with access control and rotation, never in source code, environment files committed to a repository, or a config value baked into a container image; a leaked secret should be assumed used the moment it is exposed, which is why rotation needs to be fast and routine rather than a rare, manual event.</p>
<p>An interviewer expects working knowledge of the common attacks and their standard defences: <b>SQL injection</b> (untrusted input reaching a query unescaped; fixed with parameterised queries, never string concatenation), <b>cross-site scripting</b> (untrusted input rendered as executable script in a browser; fixed by escaping output and a content security policy), <b>cross-site request forgery</b> (a browser sending a user's credentials to your site from someone else's page; fixed with anti-forgery tokens and same-site cookies), and <b>credential stuffing</b> (trying passwords leaked from other breaches against your login; fixed with rate limiting on login attempts, multi-factor authentication, and checking new credentials against known-breached password lists).</p>`,
        deeper: `<p>One idea ties all of this together, worth stating explicitly if asked to design a secure system from scratch: <b>least privilege</b> - every user, service and token gets the minimum access it needs to do its job, nothing more, so a single compromise reaches as little as possible (its <b>blast radius</b>, the standard name for how far one failure or breach can spread) - and <b>defence in depth</b> - no single control is trusted alone; network boundaries, authentication, authorization checks, input validation and monitoring each catch what the others miss. Naming both, and applying them to the specific system in front of you rather than reciting them, is what separates a checklist answer from a design one.</p>`,
        check: {
          question: 'An application correctly checks a user\'s password before letting them in, but then lets any logged-in user fetch any other user\'s private data by changing an id in the URL. What is missing?',
          options: [
            'Authentication, since the password check must be broken',
            'Authorization - identity was verified correctly, but the system never checked whether that identity was allowed to access that specific resource',
            'Encryption in transit',
            'Rate limiting'
          ],
          answer: 1,
          explain: 'This is the classic authentication/authorization mix-up: proving who someone is says nothing about what they should be allowed to touch, and that second check has to happen on every request, against the specific resource being accessed.'
        }
      },
      {
        id: 'srep-f9',
        part: 'field',
        title: 'Multi-tenant design: isolation, quotas, and noisy neighbours',
        viz: 'tenant-isolation',
        body: `<p>A multi-tenant system serves more than one customer, a <b>tenant</b>, from shared infrastructure, and the central design question is how much of that infrastructure each tenant actually shares. At one end, a <b>shared pool</b> puts every tenant's rows in the same tables behind a tenant_id column - cheapest to run and operate, but a single slow query or a burst of traffic from one tenant can slow the database for everyone else, the classic <b>noisy neighbour</b> problem. At the other end, <b>dedicated infrastructure</b> per tenant - a separate database, or a separate deployment entirely - gives the strongest isolation and the simplest story for a customer who needs to know their data never touches anyone else's storage, at real cost: roughly N times the operational overhead of one.</p>
<p>Between those extremes sit two practical middle grounds. A <b>shared database with per-tenant quotas</b> caps how much of the shared resource - queries per second, storage, concurrent connections - any one tenant may consume, so a runaway tenant is throttled rather than left free to degrade the rest; this is usually the right first answer for a growing product, buying most of the safety of full isolation at a fraction of the cost. <b>Partitioning by tenant</b> - a separate schema per tenant inside one database instance, for example - sits in between: cheaper than fully separate infrastructure, with a cleaner backup, restore and export story per tenant than a fully shared table would give, since a bulk operation can target one tenant's schema instead of filtering rows out of everyone's.</p>`,
        deeper: `<p>In practice, most real systems do not pick one isolation level for every tenant - they tier it. A large enterprise customer paying for a dedicated SLA and a contractual data-residency guarantee often gets a dedicated database or even a dedicated deployment, while the long tail of smaller customers shares a pool with quotas, because dedicating infrastructure to every small account would be far more expensive than the noisy-neighbour risk it removes. State the trade-off in cost and blast-radius terms rather than picking an answer on principle: the question is always what a tenant's contract or size justifies, not which architecture is universally best.</p>`,
        check: {
          question: 'A small number of large enterprise customers share a database with thousands of smaller accounts, and one enterprise customer\'s reporting queries are slowing the database for everyone. What is the most proportionate fix?',
          options: [
            'Move every tenant to dedicated infrastructure immediately',
            'Move that specific heavy tenant to its own database, or apply a strict quota to its query load, without changing the isolation model for the smaller accounts that are not causing the problem',
            'Rate limit all tenants equally regardless of who is causing the load',
            'Do nothing, since noisy neighbours are unavoidable'
          ],
          answer: 1,
          explain: 'Tiering isolation by which tenant actually needs it, or is actually causing the problem, is more proportionate than either doing nothing or paying for full isolation everywhere.'
        }
      }
    ],
    connect: null,
    activities: [
      {
        id: 'srep-a1',
        type: 'design',
        title: 'Exercise: write the SLOs and burn-rate alerts for a payments API',
        prompt: `"Here's a payments API that authorizes card charges. Write its service level objectives, and then design the alerting on top of them: what fires a page immediately, what only opens a ticket, and why. Use real numbers throughout."`,
        timeboxSec: 900,
        rubric: `Marking guide, out of 10. (1) States at least two SLIs precisely - e.g. availability (share of requests answered, including a correct decline, within budget) and latency (a percentile and a threshold) - not vague words like "fast" and "reliable". (2) States each as a full SLO: indicator, percentile/threshold, and window, e.g. "99.95% of requests answered within 300ms over 30 days". (3) Computes the error budget for at least one SLO using budget = (1 - SLO) x window, with the arithmetic shown, not just the answer. (4) Distinguishes a fast burn (page immediately) from a slow burn (ticket, handle this week) and gives each a different response, reasoning that a fast burn threatens the whole month's budget in hours while a slow one does not. (5) Proposes a two-window burn-rate check - a short window to catch it fast, a longer window to confirm it is not a blip - rather than a single instantaneous threshold. (6) Ties the SLO explicitly to a release decision, e.g. freezing deploys or requiring extra review once the budget is mostly spent. (7) Notes that a payments API needs a correctness-adjacent SLI too - e.g. the share of requests that get a clear decision rather than a timeout or an ambiguous state - not only latency and availability. (8) Uses concrete, stated numbers throughout rather than qualitative claims. (9) Avoids inventing a specific company's real production SLOs as fact. (10) Stays in plain, precise language. Deduct for: an SLO without a window; a burn-rate alert with only one time window; treating the error budget as a penalty rather than a decision tool. {{HONESTY}}`,
        model: `"Two SLOs. Availability: 99.95% of authorization requests get a definite answer - approved or declined - within budget, over a rolling 30-day window; a timeout or an ambiguous state counts against this, because a merchant getting no answer is worse than a clean decline. Latency: 99% of requests answered within 300 milliseconds over the same window, since this sits in a checkout flow a customer is actively watching.

Error budget on availability: (1 - 0.9995) x 43,200 minutes is about 21.6 minutes of bad outcomes allowed this month. That's a small number on purpose - this is a payments path.

Alerting: a fast burn - enough to exhaust that 21.6-minute budget in under a day, roughly a 30x rate - pages immediately, confirmed over a short 5-minute window so one bad minute doesn't wake anyone, and re-confirmed over a 1-hour window so a blip that self-resolves doesn't either; both windows have to agree. A slower burn - one that would exhaust the budget in three or four days - opens a ticket for the next business day rather than paging, because there's time to investigate calmly.

Release decision: once more than half the month's budget is spent, new deploys need an extra reviewer and a stated rollback plan; once it's fully spent, we freeze non-critical changes and the next priority becomes reliability work, not features. I'd track this on a dashboard everyone can see, so it's a shared number, not something only on-call knows."`
      },
      {
        id: 'srep-a2',
        type: 'design',
        title: 'Exercise: rollout and rollback for a risky schema change',
        viz: 'canary-rollout',
        prompt: `"You need to rename a column that a busy service reads and writes thousands of times a second, with zero downtime and no lost writes. Walk through the full plan: the migration steps, how you roll out the code that depends on it, and exactly what you would do if something looked wrong halfway through."`,
        timeboxSec: 900,
        rubric: `Marking guide, out of 10. (1) Names expand-and-contract explicitly as the pattern, rather than proposing a direct rename. (2) Expand stage stated correctly: add the new column alongside the old one, without removing anything yet. (3) Dual-write stage stated correctly: the application writes both columns, and a backfill job copies existing rows from old to new, with a verification step confirming the two agree before proceeding. (4) Read-switch stage stated correctly: only once dual-writing has run cleanly and backfill/verification is complete does the application start reading from the new column. (5) Contract stage stated correctly: the old column is dropped only after nothing reads or writes it, with a stated grace period. (6) The application-code rollout is described as its own progressive step - a canary or staged rollout of the code that starts dual-writing or switches reads - rather than a single flip to 100% of traffic. (7) States a concrete, specific abort action for a problem found mid-migration, tied to whichever stage it happens in, rather than a vague "roll back". (8) Recognises that every stage leaves the system correct and running on its own, which is the actual safety property being bought. (9) States explicitly that the column is never renamed in place. (10) Avoids claiming to have personally run this exact migration if that is not true. Deduct for: proposing an in-place rename; a single rollout step with no staged verification; no concrete abort action. {{HONESTY}}`,
        model: `"I would not touch the existing column directly. Expand and contract, in stages, each one independently safe.

Expand: add the new column, nullable, alongside the old one. No application change needed yet - this is a no-op schema change.

Migrate: deploy a code change, itself rolled out as a canary, that starts writing both columns on every write - the dual write. In parallel, run a backfill job over existing rows copying old to new, and once it finishes, run a verification query comparing old and new for a sample, ideally all rows, to confirm they agree. If dual-writing or backfill showed anything off - a mismatch, an error rate uptick - I'd stop there: keep both columns, keep dual-writing, and go find the discrepancy before moving forward. Nothing is broken at this stage; I've just paused.

Switch: once verification is clean and dual-writing has run cleanly for a defined soak period, roll out - again as a canary - the code that reads from the new column instead of the old one, watching error rates and correctness metrics at each step. If reads on the new column looked wrong, I'd roll that specific read-path change back; the old column is still there and still correct, so this is a fast, safe revert.

Contract: only after reads have been off the old column for a stated grace period - long enough to be sure nothing else depends on it - drop the old column and the dual write.

At no point is there a moment where the system is in a half-migrated, broken state; every stage is a complete, working system on its own."`
      },
      {
        id: 'srep-a3',
        type: 'followup',
        title: 'Interview question: "It\'s 3 a.m. and 500 errors just spiked. Go."',
        prompt: `An interviewer says: "You're on call. It's 3 a.m. and your alert says the error rate just jumped from 0.1% to 8%. Walk me through exactly what you do, in order." Answer in first person, about 90 seconds.`,
        timeboxSec: 120,
        rubric: `Must-haves: (1) acknowledges the page and checks the alert is real before doing anything else, confirming against a dashboard rather than trusting one alert. (2) checks what changed recently first - a deploy, a config change, a feature flag flip, an upstream dependency - as the highest-probability cause, before deeper investigation. (3) reaches for a fast, reversible mitigation before a full diagnosis - rolling back the most recent change, or flipping a flag off - stated as the default first move when a recent change is the leading suspect. (4) only escalates to a deeper investigation, such as logs, traces, a specific dependency, once the cheap, reversible options are ruled out or do not apply. (5) mentions checking the blast radius - how many users or what fraction of traffic is actually affected - to judge severity and whether to pull in others. (6) mentions communication, posting a status update on a known channel even briefly, rather than going quiet while investigating. (7) follows through afterward, saying a postmortem or written follow-up happens rather than treating the incident as over once errors drop. Common mistakes: starting with deep log analysis before checking for a recent change; no mention of rollback or a flag as the first action; no communication step. {{HONESTY}}`,
        model: `"First, I'd confirm the alert is real - pull up the actual error-rate dashboard rather than acting on one page, because a flaky alert wastes the first five minutes of an incident.

Assuming it's real, my first question is what changed. I'd check the deploy log and the feature-flag history for the last hour or two, since a fresh change is the highest-probability cause by far, and a fresh change usually has a fast, reversible fix: roll back the deploy, or flip the flag off. I'd do that before trying to fully understand why it broke - stabilise first, diagnose after, because every minute at 8% errors is customer impact I can stop now and explain later.

If nothing recent changed, I'd check the obvious next layer: is a downstream dependency erroring or slow, is a certificate expiring, is a queue backing up. I'd check blast radius too - is this every request or one code path - because that changes both urgency and who else needs to know.

I'd post a short update on our incident channel the moment I'm actively working it, even just "investigating a 500 spike, will update in ten minutes," so nobody's guessing whether it's being handled.

Once it's back to baseline, the incident isn't done - I'd open a postmortem, because the deploy that caused this got past whatever check should have caught it, and that's worth fixing too."`
      }
    ],
    sayQuestion: null,
    sayItOutLoud: null,
    readings: [
      { l: 'Google SRE book: Monitoring Distributed Systems', u: 'https://sre.google/sre-book/monitoring-distributed-systems/', w: 'The original source for the four golden signals - latency, traffic, errors, saturation - and why they were chosen.', m: 20 },
      { l: 'Google SRE book: Service Level Objectives', u: 'https://sre.google/sre-book/service-level-objectives/', w: 'Defines SLI, SLO and SLA precisely and explains how to choose an indicator that actually reflects user experience.', m: 25 },
      { l: 'Google SRE book: Embracing Risk', u: 'https://sre.google/sre-book/embracing-risk/', w: 'Where the error budget idea comes from: treating 100% reliability as the wrong target, and spending the difference deliberately.', m: 25 },
      { l: 'Google SRE workbook: Alerting on SLOs', u: 'https://sre.google/workbook/alerting-on-slos/', w: 'The multi-window, multi-burn-rate alerting design this chapter\'s worked example is based on, with the actual thresholds worked out.', m: 30 },
      { l: 'Google SRE book: Postmortem Culture', u: 'https://sre.google/sre-book/postmortem-culture/', w: 'Why blameless postmortems work, what belongs in one, and how to keep the practice from becoming a box-ticking exercise.', m: 20 },
      { l: 'PRIMER: ParallelChange (expand and contract)', u: 'https://martinfowler.com/bliki/ParallelChange.html', w: 'A short, precise statement of the expand/migrate/contract pattern for changing an interface or a schema with nothing ever fully broken.', m: 8 },
      { l: 'Video: Every engineer should know this.. (Expand-Contract Pattern) - Hussein Nasser', u: 'https://www.youtube.com/watch?v=ONSCQWLD9d0', w: 'A worked walkthrough of the expand-contract migration pattern against a real schema change, easier to follow watched than read.', m: 15 },
      { l: 'Video: Rate Limiter System Design: Token Bucket, Leaky Bucket, Scaling - ByteByteGo', u: 'https://www.youtube.com/watch?v=YXkOdWBwqaA', w: 'Compares the four rate-limiting algorithms side by side and covers where to place the limiter and how to make it distributed.', m: 15 }
    ],
    glossary: [
      {
        g: 'Site reliability practices',
        sub: '',
        rows: [
          ['SLI', 'A measured indicator of service quality, e.g. the fraction of requests under 200ms', 'SLOs and error budgets'],
          ['SLO', 'The target for an SLI: a percentile, a threshold, and a time window', 'SLOs and error budgets'],
          ['Error budget', 'The failure an SLO already permits: (1 - SLO) x window', 'SLOs and error budgets'],
          ['Burn rate', 'How fast the error budget is being spent, as a multiple of the sustainable rate', 'SLOs and error budgets'],
          ['Golden signals', 'Latency, traffic, errors, saturation - the four numbers worth a dashboard', 'observability'],
          ['Correlation id (trace id)', 'An id passed through every service a request touches, so its logs and spans can be joined', 'observability'],
          ['Cardinality', 'The number of distinct values a metric\'s labels can take', 'observability'],
          ['Expand and contract', 'A four-stage pattern for a schema change with no downtime and no broken intermediate state', 'deployment and migration safety'],
          ['Parallel read-drain', 'Pointing a new service\'s reads at the old system first, then draining traffic away as confidence builds', 'deployment and migration safety'],
          ['RPO', 'Recovery point objective: how much data a restore may lose, measured backward from the failure', 'backups and disaster recovery'],
          ['RTO', 'Recovery time objective: how long a recovery may take, measured forward from the failure', 'backups and disaster recovery'],
          ['Token bucket', 'A rate-limiting algorithm that refills tokens at a fixed rate and allows a burst up to the bucket size', 'rate limiting'],
          ['Sliding window (rate limiting)', 'A rate limit that blends the current and previous fixed windows\' counts to avoid a boundary burst', 'rate limiting'],
          ['Right to erasure', 'A legal right, e.g. under GDPR, to have personal data deleted on request', 'data retention and privacy'],
          ['Noisy neighbour', 'One tenant\'s load degrading shared infrastructure for other tenants', 'multi-tenant design']
        ]
      }
    ]
  };

  root.PREP_CORE['system-design-cases'] = {
    id: 'system-design-cases',
    title: 'Worked system design cases',
    level: 'danger',
    levelLabel: 'The core of almost every system design interview: applying fundamentals to a named product.',
    why: `Everything in the earlier chapters is raw material. A system design interview is judged on whether you can pick the right pieces up and put them together for one specific product, under a specific set of numbers, in about 45 minutes - and defend the two or three decisions that actually mattered instead of listing every pattern you know. These ten cases work through common interview questions the same way each time: state the scale, draw the high-level design, name the hard parts, take the trade-off questions an interviewer will actually ask, and say where machine learning fits, if anywhere.`,
    learn: [
      {
        id: 'sdc-0',
        part: 'field',
        title: 'Key terms',
        body: `<p>Terms specific to these ten cases, on top of the words already covered in the system design fundamentals chapter. Read it once, then use the words freely.</p>
<ul>
<li><b>Ticket server.</b> A dedicated database used only to hand out unique, auto-incrementing ids, sometimes run as an odd/even pair so no single server is a point of failure.</li>
<li><b>Fan-out on write / fan-out on read.</b> Pushing a post into every follower's inbox at post time, versus merging a feed from followed accounts at read time.</li>
<li><b>Trie (prefix tree).</b> A tree structure that stores strings so every string sharing a prefix shares a path from the root, giving fast prefix lookup.</li>
<li><b>Chunked (resumable) upload.</b> Splitting a large file into pieces the client can upload independently and resume from the first missing piece after a dropped connection.</li>
<li><b>Transcoding.</b> Re-encoding a video into other resolutions, bitrates or codecs so it plays well on different devices and networks.</li>
<li><b>Adaptive bitrate streaming.</b> Serving a video at a resolution the viewer's current bandwidth can sustain, switching as bandwidth changes.</li>
<li><b>Candidate generation.</b> A cheap first stage that narrows a huge catalog down to a few hundred plausible items.</li>
<li><b>Ranking.</b> A second, heavier stage that scores and orders only the shortlist candidate generation produced.</li>
<li><b>Embedding.</b> A vector representation of an item or a user, positioned so similar things end up close together, letting "similar" become a distance calculation.</li>
<li><b>Cold start.</b> Having little or no history for a new user or a new item to base a recommendation on.</li>
<li><b>Idempotency key.</b> A caller-supplied value that lets a retried request return the original result instead of repeating its effect.</li>
<li><b>Ledger (double-entry).</b> Recording every movement of money as a balanced debit and credit rather than updating a stored balance in place.</li>
<li><b>Reconciliation.</b> Comparing an internal record against an external source of truth, such as a processor's settlement report, to catch drift.</li>
<li><b>Chargeback.</b> A card payment reversed by the customer's bank after the fact, often the first real evidence that a transaction was fraudulent.</li>
<li><b>Exactly-once effect.</b> An outcome that happens once from the caller's point of view, built out of an unreliable, at-least-once network plus idempotent writes.</li>
<li><b>Streaming features.</b> Features computed continuously from an event stream, such as "transactions in the last 10 minutes," so they stay fresh at decision time.</li>
<li><b>Label latency.</b> The delay between a decision and knowing whether it was correct.</li>
<li><b>Retrieval-augmented generation (RAG).</b> Fetching relevant text from an index and giving it to a language model as context before it answers.</li>
<li><b>Context window.</b> The maximum amount of text, measured in tokens, a language model can consider at once.</li>
<li><b>Token (LLM).</b> A chunk of text, often a word piece, that a language model reads or generates one at a time; both cost and context-window limits are measured in tokens.</li>
<li><b>TTFT / TPOT.</b> Time to first token and time per output token: the two latency numbers that matter for a streamed language model answer.</li>
<li><b>Guardrail.</b> A check on a language model's input or output - for PII, injection, policy violations, or unsupported claims - separate from the model generating the answer.</li>
<li><b>Model router.</b> A component that sends most requests to a cheap model and escalates harder or lower-confidence requests to a stronger, pricier one.</li>
<li><b>Presence.</b> Tracking whether a user is currently online and which server holds their live connection.</li>
<li><b>WebSocket / long polling.</b> Two ways to give a client a low-latency channel for server-initiated updates: a persistent bidirectional connection, or repeated requests held open until there is something to return.</li>
</ul>`,
        deeper: `<p>Notice how often the same two-part pattern reappears across these ten cases: a cheap, approximate stage that handles nearly everything, backed by a smaller, more expensive stage that only sees what the cheap stage could not resolve - a rate limiter's local counter and its Redis reconciliation, a feed's push path and its celebrity pull path, a recommender's candidate generation and its ranking model, a router's cheap model and its escalation. Naming that pattern out loud, when it applies, is a strong, general answer that works whether or not you have seen the exact system before.</p>`,
        check: {
          question: 'What is the main reason recommendation systems and search almost always split work into a fast candidate generation stage followed by a slower ranking stage, rather than scoring every item with one model?',
          options: [
            'Ranking models are always more accurate than candidate generators',
            'A single expensive model cannot afford to score millions of items within a latency budget, so a cheap stage narrows the field first and the expensive stage only ever sees the shortlist',
            'Candidate generation replaces the need for a feature store',
            'It is required by most recommendation frameworks'
          ],
          answer: 1,
          explain: 'The split exists purely for cost and latency: an expensive, high-quality model can be affordable only if it never has to look at more than a few hundred items, which is exactly what candidate generation hands it.'
        }
      },
      {
        id: 'sdc-1',
        part: 'field',
        title: 'Case: a rate limiter',
        viz: 'case-rate-limiter',
        body: `<p><b>Requirements and scale.</b> An API gateway in front of a public API handling 50,000 requests per second across many replicas, needing to cap each API key at 100 requests per second sustained, allow a short burst, and add no more than a few milliseconds of latency to the request path.</p>
<p><b>High-level design.</b> The limiter sits at the gateway, before a request reaches any expensive service logic. It checks a counter keyed by the caller's API key against the configured limit, using a sliding-window counter (blending the current and previous fixed windows) so a burst timed around a window boundary cannot double the effective rate. Because many gateway replicas serve traffic for the same key, the counters live in a shared store - typically Redis - checked and incremented atomically in one command, so two replicas can never both approve a request that should have pushed the count over the limit. A caller over the limit gets a 429 response with a Retry-After header.</p>
<p><b>Hard parts.</b> First, making the check atomic and fast under real concurrency: a naive read-then-write has a race that lets two concurrent requests both slip through when only one should. Second, choosing the algorithm: a token bucket is simple and allows a clean burst, while a sliding window is more precise about the sustained rate but slightly more work to compute. Third, doing this cheaply at extreme scale - centralising every single check in Redis adds a network hop per request, so some systems shift to per-replica local counters with a much higher local threshold and periodic asynchronous reconciliation against the shared store, trading exact enforcement for lower latency.</p>
<p><b>Trade-offs an interviewer will push on.</b> Exact versus approximate limiting, and how much over-limit traffic is acceptable in exchange for speed. Where to key the limit - IP stops one machine but not a botnet spread across many, while a per-account key stops one customer regardless of how many machines they use. And what happens when the shared store itself is unreachable: most production limiters fail open, letting traffic through unlimited, because an outage that denies all legitimate traffic is worse than briefly under-enforcing a quota.</p>
<p><b>Where machine learning fits.</b> Rarely in the limiter itself, which should stay simple and predictable. The natural fit sits above it: an anomaly-detection model that adjusts limits per caller based on behaviour - flagging bot-like patterns for a tighter limit - layered on top of, not instead of, the plain counting limiter.</p>`,
        check: {
          question: 'Why do most production rate limiters "fail open" - letting traffic through unlimited - if their shared counter store becomes unreachable?',
          options: [
            'Because failing open is always more secure',
            'Because denying all legitimate traffic during a store outage is usually a worse outcome than briefly under-enforcing the quota',
            'Because Redis cannot fail',
            'Because failing open removes the need for a fallback design'
          ],
          answer: 1,
          explain: 'A rate limiter exists to protect the system from abuse, not to be a single point of failure for all traffic - so most designs accept temporarily looser enforcement over a total outage.'
        }
      },
      {
        id: 'sdc-2',
        part: 'field',
        title: 'Case: a URL shortener or key-value store with ticket-server ids',
        viz: 'snowflake-id',
        body: `<p><b>Requirements and scale.</b> 100 million new short URLs created per day, a read:write ratio around 100:1, five years of retention, and redirect latency under 100 milliseconds.</p>
<p><b>High-level design.</b> A write generates a short code, stores the mapping to the destination URL in a key-value store, and returns it. A redirect looks up the code - almost always served from a cache in front of the store, since the workload is overwhelmingly reads of small, rarely-changing values - and issues a redirect to the destination.</p>
<p><b>Hard parts.</b> First, generating unique ids without a single bottleneck: a <b>ticket server</b> is a dedicated database whose only job is handing out unique, auto-incrementing ids, simple to reason about but a potential single point of failure, usually mitigated by running two ticket servers that split the id space between odd and even numbers. The alternative is a Snowflake-style generator: each node builds an id locally from a timestamp, a machine id and a sequence number, needing no coordination at write time at the cost of requiring roughly synchronised clocks and careful handling if a clock ever moves backward. Second, choosing the redirect status code: a 302 lets you change the destination later and gather click analytics on every redirect, while a 301 lets browsers cache the redirect and skip your service on repeat visits, cutting your load at the cost of losing future click data. Third, sizing the cache for a workload with a long tail of rarely-clicked links behind a small number of very hot ones.</p>
<p><b>Trade-offs an interviewer will push on.</b> Ticket server versus Snowflake-style generation - a coordinated bottleneck that is simple to operate versus a fully distributed generator that depends on clock discipline. Whether to allow custom aliases, which turns a pure hash or counter scheme into something needing a uniqueness check on the requested string. How far to trust a purely random code with a collision check on write, which is simple but has a rising collision rate as the keyspace fills.</p>
<p><b>Where machine learning fits.</b> Marginal for the shortener itself. The realistic fits are bot and click-fraud detection on redirect traffic, and predicting which newly created links are likely to go viral so the cache can pre-warm them before the traffic spike arrives, rather than learning the hot set only after it is already hot.</p>`,
        check: {
          question: 'What is the main operational risk of a single ticket server generating every id for a system, and what is the standard mitigation?',
          options: [
            'It generates ids too slowly; mitigated by caching ids in advance',
            'It is a single point of failure; mitigated by running two ticket servers that split the id space, e.g. by odd and even numbers',
            'It cannot generate ids fast enough for a KV store; mitigated by switching to UUIDs',
            'It leaks database schema information; mitigated by encrypting ids'
          ],
          answer: 1,
          explain: 'A single ticket server is a classic single point of failure. The standard fix, from Flickr\'s original design, is two ticket servers dividing the id space so either can be lost without stopping id generation.'
        }
      },
      {
        id: 'sdc-3',
        part: 'field',
        title: 'Case: a news feed',
        viz: 'case-news-feed',
        body: `<p><b>Requirements and scale.</b> Hundreds of millions of daily active users, most posting rarely, a small number of accounts with tens of millions of followers, and a requirement that a new post reach a follower's feed within seconds.</p>
<p><b>High-level design.</b> A hybrid fan-out: an ordinary post is pushed into every follower's precomputed feed inbox at post time, so reading a feed is a cheap, already-assembled fetch. A post from a very high-follower account is not pushed - it is stored once and pulled in and merged at read time for anyone who follows that account. A ranking layer then reorders the merged result by predicted relevance rather than showing it in strict chronological order.</p>
<p><b>Hard parts.</b> First, the celebrity problem: pushing one post to fifty million follower inboxes is fifty million writes for a single post, so a threshold (commonly based on follower count) decides which accounts get pushed and which get pulled instead. Second, ranking versus recency: computing a full relevance score on every read is expensive, so most systems rank a candidate set built from recent posts rather than re-ranking the entire history, and cache that ranking briefly rather than recomputing it on every single scroll. Third, read-your-writes: a user should see their own new post immediately, even if the fan-out job that pushes it to followers has not finished yet, which usually means merging the poster's own very recent posts directly into their own feed read, bypassing the inbox.</p>
<p><b>Trade-offs an interviewer will push on.</b> Push increases write amplification but keeps reads cheap and simple; pull keeps writes cheap but makes every read a merge across however many accounts are followed. Ranking on every read costs real compute against a chronological feed that costs almost nothing; most systems settle somewhere in between, ranking a bounded candidate window rather than the whole history. How far back pagination should reach affects how much has to be merged per request, and is usually bounded rather than unlimited.</p>
<p><b>Where machine learning fits.</b> This is a central case for it: the ranking layer is a genuine candidate-generation-and-ranking problem, ordering a merged set of push and pull candidates by predicted engagement using features about the viewer, the poster and the content. Content moderation classification, run before a post becomes eligible for fan-out at all, is the other natural fit.</p>`,
        check: {
          question: 'Why is a celebrity account\'s post typically left in place and merged in at read time, rather than pushed into every follower\'s feed inbox the way an ordinary post is?',
          options: [
            'Because celebrity posts are ranked lower by policy',
            'Because pushing to tens of millions of follower inboxes for a single post is an enormous, mostly wasted amount of write work, so it is cheaper to store it once and pull it in only for the followers who actually open their feed',
            'Because celebrities opt out of fan-out for privacy reasons',
            'Because pull-based delivery is always faster than push-based delivery'
          ],
          answer: 1,
          explain: 'This is the classic celebrity problem: fan-out on write does not scale to an account with an enormous follower count, so a hybrid design pulls that specific case instead of pushing it.'
        }
      },
      {
        id: 'sdc-4',
        part: 'field',
        title: 'Case: a chat and notification system',
        viz: 'websocket-fanout',
        body: `<p><b>Requirements and scale.</b> Real-time one-to-one and group messaging for tens of millions of concurrent connections, message delivery under 200 milliseconds when both parties are online, and push notifications when the recipient is not.</p>
<p><b>High-level design.</b> Clients hold a persistent connection, usually a WebSocket, to one of many connection-gateway servers. A presence service, commonly backed by Redis, maps each online user to the specific gateway holding their connection. When a message arrives, it is written durably first, then looked up in presence and routed to the right gateway for immediate delivery, or handed to a push-notification service if the recipient is offline. Group messages fan out to each member's connection or push target, bounded by group size.</p>
<p><b>Hard parts.</b> First, routing: with connections spread across a fleet of stateful gateway servers, delivering a message to the right one requires a fast, accurate presence lookup, and that lookup must be updated the instant a connection drops or moves. Second, delivery guarantees: "sent" is not "delivered," so the design needs acknowledgements and a durable per-recipient inbox a reconnecting client can pull from to fetch what it missed, while preserving per-conversation ordering even if the transport itself reorders. Third, large-group fan-out: a group with thousands of members turns one message into thousands of deliveries, similar to the feed's celebrity problem, which is why very large groups are often handled differently - capped membership, or a pull-based read - than small ones.</p>
<p><b>Trade-offs an interviewer will push on.</b> WebSocket gives low-latency, bidirectional delivery but ties a user to a specific stateful server, complicating routing and failover; long polling works everywhere with simpler infrastructure but costs more overhead and latency, so most systems use WebSocket with long polling as a fallback. Delivery semantics: at-least-once with client-side deduplication by message id is the standard choice, because a true end-to-end exactly-once guarantee is expensive and rarely worth it if the client can simply discard a duplicate.</p>
<p><b>Where machine learning fits.</b> Lightly, and it should stay that way for the transport itself. The genuine fits are spam and abuse classification on message content before delivery, and models that decide the best moment to actually push a notification rather than always firing immediately, reducing notification fatigue. Presence itself is a lookup, not a prediction problem, and does not need a model.</p>`,
        check: {
          question: 'Why do most chat systems use at-least-once delivery with client-side message deduplication, rather than building a strict end-to-end exactly-once guarantee?',
          options: [
            'Exactly-once delivery is impossible in any distributed system',
            'At-least-once is much simpler and cheaper to build, and a client that discards a duplicate by message id gets the same effective result as exactly-once, without the cost',
            'Because WebSocket connections guarantee ordering automatically',
            'Because group chats do not need reliable delivery'
          ],
          answer: 1,
          explain: 'A duplicate message that the client silently discards produces the same user-visible outcome as a true exactly-once guarantee, at a fraction of the engineering cost - so most systems build the cheap version and let the client finish the job.'
        }
      },
      {
        id: 'sdc-5',
        part: 'field',
        title: 'Case: a payment system',
        viz: 'case-payments-ledger',
        body: `<p><b>Requirements and scale.</b> Process card charges reliably at scale, never double-charge a customer even under client or network retries, and produce a complete, auditable trail of every cent moved, reconciled daily against an external processor.</p>
<p><b>High-level design.</b> A charge request carries a caller-supplied idempotency key. The API checks whether that key has already been processed and, if so, returns the stored result rather than charging again. A new charge calls the external processor, and every resulting movement of money is written as a balanced double-entry <b>ledger</b> row - a debit and a credit that sum to zero - rather than updating an account balance in place. A separate nightly job pulls the processor's settlement report and reconciles it line by line against the internal ledger.</p>
<p><b>Hard parts.</b> First, idempotency across retries: the idempotency check and the charge itself must be atomic with respect to each other, typically via a uniqueness constraint on the key inside the same transaction, so two concurrent retries cannot both pass the check and both charge. Second, the harder failure mode - a call to the processor that times out on your side but actually succeeded on theirs - which makes a blind retry unsafe; the fix is to query the processor's own record for that idempotency key, or wait for its confirmation, before deciding whether a retry should charge at all, producing an <b>exactly-once effect</b> from an inherently at-least-once network. Third, the ledger itself: modelling money as immutable, balanced entries rather than a mutable balance keeps the full history reconstructable and gives reconciliation something concrete to check.</p>
<p><b>Trade-offs an interviewer will push on.</b> Strong consistency for ledger writes versus throughput: most systems accept a real database transaction and its cost here, because money is the one place staleness is unacceptable, scaling instead by sharding the ledger by account. Synchronous confirmation to the user versus returning "processing" immediately and confirming later via webhook, trading a slightly worse user experience for not holding a request open on an external network call. What reconciliation does with a mismatch - held for a human to review, never auto-corrected silently.</p>
<p><b>Where machine learning fits.</b> Squarely at authorization time, as a separate fraud-scoring step that approves or blocks the charge before the ledger is ever touched - covered in full in the fraud detection case. The ledger and idempotency machinery itself should have no machine learning in it at all, since its correctness needs to be provable, not statistical.</p>`,
        check: {
          question: 'A charge call to an external processor times out, and the client retries with the same idempotency key. Why is it unsafe for the server to simply retry the charge against the processor?',
          options: [
            'It is always safe, since the idempotency key guarantees the processor will reject a duplicate',
            'The original call may have actually succeeded on the processor\'s side even though the response was lost, so a blind retry risks a second real charge - the server should check the processor\'s own record of that key first',
            'Idempotency keys only work for reads, not writes',
            'The processor never times out in practice'
          ],
          answer: 1,
          explain: 'A timeout tells you nothing about whether the request succeeded downstream. Building an exactly-once effect over an unreliable network means checking the processor\'s own state before retrying, not just trusting your own idempotency table.'
        }
      },
      {
        id: 'sdc-6',
        part: 'field',
        title: 'Case: autocomplete and search suggestions',
        viz: 'trie-autocomplete',
        body: `<p><b>Requirements and scale.</b> A search box serving hundreds of millions of queries a day, returning suggestions within about 100 milliseconds as the user types, reflecting both stable popularity and fast-moving trends rather than a static dictionary.</p>
<p><b>High-level design.</b> An offline pipeline aggregates query logs into a frequency-ranked structure, refreshed on a schedule such as hourly, from which the top completions for each prefix are precomputed. An online service holds this lookup table in memory, sharded by prefix if it does not fit on one machine, and answers a prefix request directly with no live computation needed. The client typically debounces keystrokes so it is not firing a request per character typed.</p>
<p><b>Hard parts.</b> First, the data structure: a <b>trie</b> gives natural prefix lookup, but storing every distinct query ever seen does not scale to billions of them, so production systems typically precompute and serve only the top-k completions per prefix rather than walking a live trie built from raw query volume at request time. Second, freshness versus cost: a breaking news event needs to appear as a suggestion within minutes, pulling toward frequent incremental updates, while a full, high-quality rebuild of the ranking is comparatively expensive - most designs blend a slow offline rebuild with a fast, approximate online counter that can promote a sudden spike before the next full rebuild catches up. Third, personalization and typo tolerance: fuzzy prefix matching and per-user history are each meaningfully harder and more expensive than plain prefix lookup, and worth explicitly scoping in or out rather than assuming.</p>
<p><b>Trade-offs an interviewer will push on.</b> A fully precomputed table is fast and simple to serve but slow to reflect new trends; a live-updated structure is fresher but far more expensive to keep both consistent and fast. Most real systems are a blend, and stating the boundary in minutes - how stale the slow path is allowed to be before the fast path has to cover the gap - is a stronger answer than picking one extreme.</p>
<p><b>Where machine learning fits.</b> Ranking which completions to show for a given prefix and user is a genuine ranking problem - raw frequency is a reasonable baseline, and a personalized or context-aware ranking model is the natural upgrade from it. Typo correction and query normalization are typically a separate, smaller model from the ranking itself.</p>`,
        check: {
          question: 'Why do most production autocomplete systems precompute the top completions per prefix offline, rather than walking a live trie built from raw query data on every keystroke?',
          options: [
            'Tries cannot support prefix lookup efficiently',
            'Storing and ranking every distinct query ever seen does not scale to serve at low latency, so a much smaller, precomputed top-k table is served online instead',
            'Live tries cannot be sharded across machines',
            'Precomputing removes the need for any online service at all'
          ],
          answer: 1,
          explain: 'The scale problem is size and ranking cost, not the trie structure itself - so the practical fix is doing the expensive aggregation and ranking offline and serving a small, fast lookup table online.'
        }
      },
      {
        id: 'sdc-7',
        part: 'field',
        title: 'Case: a video upload and transcoding pipeline',
        viz: 'dag-orchestration',
        body: `<p><b>Requirements and scale.</b> Uploads of up to a few gigabytes, a requirement that the video be watchable within minutes on any device and bandwidth, and tolerance for an upload connection dropping partway through a multi-gigabyte file.</p>
<p><b>High-level design, in brief.</b> The client uploads in chunks directly to object storage using a resumable upload protocol. Completion of the upload emits an event that triggers a transcoding pipeline - an orchestrated set of jobs, not one long script - producing several resolutions and bitrates plus a manifest for adaptive bitrate streaming. Finished outputs go back into object storage behind a CDN for playback.</p>
<p><b>Hard parts.</b> First, resumable, chunked upload: the client and server track which chunks have arrived, so a dropped connection on a multi-gigabyte file resumes from the first missing chunk instead of restarting from zero. Second, the transcoding fan-out: producing multiple resolutions and codecs is naturally parallel and belongs in an orchestrated pipeline with per-job retries, so a failure encoding one resolution does not force redoing the others. Third, progressive readiness: a viewer should be able to start watching the lowest-quality rendition as soon as it finishes rather than waiting for every resolution to complete, which pushes the design toward publishing renditions as they finish rather than atomically all at once.</p>
<p><b>Trade-offs an interviewer will push on.</b> Transcoding every resolution upfront is predictable but wastes compute on renditions few viewers will ever request; transcoding a resolution on first request instead saves compute but adds latency and complexity for whoever asks first. The size of the resolution ladder - how many combinations of resolution and codec to produce - is a real cost decision usually driven by measured viewer device mix rather than covering every device in theory.</p>
<p><b>Where machine learning fits.</b> Content moderation classification before a video goes public, automatic thumbnail selection that picks a representative, non-blurry frame, and perceptual-quality-based encoding that varies bitrate by scene complexity rather than a fixed rate are the natural places machine learning enters. The upload and orchestration machinery itself is plain infrastructure with no modelling involved.</p>`,
        check: {
          question: 'Why is video transcoding usually structured as an orchestrated set of independent jobs per resolution, rather than one script that produces every rendition in sequence?',
          options: [
            'Because a single script cannot read from object storage',
            'Because resolutions are independent work, so a failure in one should be retried on its own without redoing the others, and running them in parallel finishes the overall job faster',
            'Because transcoding is not parallelizable by nature',
            'Because orchestration removes the need for object storage'
          ],
          answer: 1,
          explain: 'The resolutions are independent outputs from the same input, so treating them as separate, retryable jobs in a DAG both isolates failures and lets them run in parallel instead of one after another.'
        }
      },
      {
        id: 'sdc-8',
        part: 'field',
        title: 'Case: a recommendation system',
        viz: 'case-recsys-two-stage',
        body: `<p><b>Requirements and scale.</b> Personalized recommendations drawn from a catalog of tens of millions of items, returned within roughly 100 milliseconds, and responsive to how a user's session evolves in real time.</p>
<p><b>High-level design.</b> A two-stage pipeline. <b>Candidate generation</b> cheaply narrows millions of items to a few hundred - commonly an embedding-based approximate nearest-neighbour lookup, alongside simpler generators like "popular in this category this week," run in parallel and merged. <b>Ranking</b> then scores only that shortlist with a heavier model using richer features. Both stages read from a shared <b>feature store</b>, with an online view for low-latency, freshly updated features at request time and an offline view of the same features for training.</p>
<p><b>Hard parts.</b> First, the handoff between the two stages: candidate generation must be judged mainly on recall - did it fail to include a genuinely good item - since a good item cut in stage one never reaches the ranking model that could have surfaced it, whereas ranking is judged on precision within the shortlist it actually receives. Second, training-serving consistency: the ranking model has to see the same feature values online that it saw during training, computed by two different code paths under very different time pressure, and any drift between them silently degrades ranking quality without an obvious error. Third, cold start: a new user with no history, or a new item with no interactions, gives an embedding-based candidate generator nothing to work from, so most systems fall back to popularity- or content-based candidates until enough behavioural data accumulates.</p>
<p><b>Trade-offs an interviewer will push on.</b> Fresher features and more frequent retraining raise relevance but raise infrastructure cost and the risk of training-serving skew. More candidate generators, each finding a different kind of relevant item, improve diversity and recall at the cost of more infrastructure needed to merge and deduplicate their outputs before ranking ever sees them.</p>
<p><b>Where machine learning fits.</b> This entire case is a machine learning system by design - the interesting systems questions are how to keep the two stages fast and mutually consistent under a strict latency budget, not whether to use a model at all.</p>`,
        check: {
          question: 'Why is candidate generation judged mainly on recall rather than precision, while ranking is judged mainly on precision?',
          options: [
            'Recall and precision mean the same thing in this context',
            'A good item that candidate generation fails to include can never be recovered by ranking, since ranking only ever sees what candidate generation hands it - so missing a good item there is unrecoverable, while ranking\'s job is to order what it does receive well',
            'Ranking always has more data than candidate generation',
            'Precision only matters for the final displayed list, not for any earlier stage'
          ],
          answer: 1,
          explain: 'The two stages have different jobs: candidate generation must not silently drop good items (recall), because nothing downstream can rescue an item it excludes, while ranking\'s job is to score and order well within whatever shortlist it is given (precision).'
        }
      },
      {
        id: 'sdc-9',
        part: 'field',
        title: 'Case: a real-time fraud detection pipeline',
        viz: 'case-fraud-stream',
        body: `<p><b>Requirements and scale.</b> Score every transaction in under 100 milliseconds at the moment of card authorization, at tens of thousands of transactions per second at peak, while the labels that confirm whether a decision was actually correct - chargebacks and confirmed fraud reports - arrive weeks later.</p>
<p><b>High-level design.</b> A streaming feature pipeline continuously computes windowed features per entity - a card, a device, a merchant - such as transaction counts and sums over the last few minutes, hours and days, and writes them to a low-latency feature store as events arrive. The authorization path fetches those precomputed features plus request-time features, scores with a model, and returns allow, hold, or decline inside the latency budget. A separate offline pipeline retrains periodically once enough labels have matured.</p>
<p><b>Hard parts.</b> First, computing streaming features fast enough to be useful: a feature like "transactions in the last 10 minutes" has to be both fresh and cheap to read at authorization time, which pushes toward a windowed aggregation maintained continuously rather than recomputed from raw events on every request. Second, the delayed-label problem: the system operates and must be monitored for weeks before it knows whether yesterday's decisions were actually right, so day-to-day health relies on proxies - alert volume, review-queue size, score distribution - rather than ground truth, and retraining on immature labels can be actively harmful. Third, the feedback loop: the model's own decisions shape which transactions ever get reviewed and labelled at all, since a transaction it silently declines rarely produces a label either way, quietly biasing what the next model learns from its predecessor's own blind spots.</p>
<p><b>Trade-offs an interviewer will push on.</b> A lower decision threshold catches more fraud but declines more legitimate transactions, a real cost to the business and the customer that the model can inform but should not decide alone. A cascade - a cheap model handling the obvious majority, an expensive model reserved for ambiguous cases - trades a little accuracy for the throughput and latency the peak actually requires.</p>
<p><b>Where machine learning fits.</b> This entire case is built around a model from the start; the systems challenge is keeping streaming features fresh and consistent with the offline features used in training, and building monitoring that works despite weeks of label delay - not the modelling itself.</p>`,
        check: {
          question: 'Why can retraining a fraud model on the most recent labels sometimes be actively harmful, rather than simply keeping the model current?',
          options: [
            'Retraining is never harmful as long as more data is used',
            'Labels take weeks to mature, and the model\'s own past decisions shape which transactions get reviewed and labelled at all - so recent labels can be both immature and biased by what the model itself chose not to flag',
            'Streaming features cannot be used for offline training',
            'Fraud models should never be retrained once deployed'
          ],
          answer: 1,
          explain: 'Two problems compound: labels are not yet mature, and the model\'s own decisions determine which transactions were ever reviewed, so recent labels are a biased, incomplete sample of the truth - not a clean basis to retrain on immediately.'
        }
      },
      {
        id: 'sdc-10',
        part: 'field',
        title: 'Case: an LLM chat product',
        viz: 'case-llm-chat',
        body: `<p><b>Requirements and scale.</b> A chat product serving millions of daily conversations, a first-token latency under a second, a bounded cost per conversation, and answers that are grounded in real sources and safe to show.</p>
<p><b>High-level design.</b> A retrieval step - <b>retrieval-augmented generation</b> - fetches relevant chunks from a vector index given the user's message. A <b>model router</b> sends the assembled prompt to the cheapest model capable of answering, escalating to a stronger, pricier model only for a harder or lower-confidence request. The model streams tokens back to the user as they are generated. A <b>guardrail</b> layer checks the input for injection attempts or PII, and the output for policy violations and unsupported claims against the retrieved sources, before or as the answer is shown.</p>
<p><b>Hard parts.</b> First, latency has two distinct numbers that both matter and call for different fixes: <b>TTFT</b>, dominated by retrieval plus the model's initial pass over the prompt, and <b>TPOT</b>, the steady per-token rate during generation - a design should name both rather than one blended "latency." Second, cost control at scale: every token in the prompt, including every retrieved chunk, and every generated token, is metered and billed, which is why chunk selection, prompt length, and a cheap-first router matter as much as raw model quality. Third, grounding and safety: an ungrounded model states a plausible-sounding wrong answer with full confidence, so retrieval has to actually constrain what the model can say, with citations tied to specific retrieved chunks, and a guardrail has to catch an unsafe or unsupported answer before it reaches the user - ideally without adding a second full model call's worth of latency to every response.</p>
<p><b>Trade-offs an interviewer will push on.</b> Retrieving more chunks improves grounding but adds cost and latency and can dilute the prompt with irrelevant text. Routing aggressively to a cheap model saves money but risks quietly worse answers on hard requests, so the router's own accuracy needs monitoring, not just the model's. Streaming the answer improves perceived latency, since the user sees text immediately, but complicates a guardrail that would rather see the whole answer before releasing any of it - most systems compromise with a fast, lightweight check during streaming plus a slower full check that can still retract or flag a response afterward.</p>
<p><b>Where machine learning fits.</b> The entire product is built on a model, so the systems question is not where machine learning fits but how to keep it fast, affordable and safe at the traffic this product actually receives.</p>`,
        check: {
          question: 'A chat product streams its answer token by token as it is generated. What real problem does this create for the guardrail that checks the output before it reaches the user?',
          options: [
            'Streaming makes retrieval unnecessary',
            'A guardrail that wants to see the whole answer before releasing it conflicts with streaming, which shows text as it is generated - so most systems combine a fast, partial check during streaming with a slower full check that can still retract or flag the answer afterward',
            'Streaming eliminates the need for a guardrail entirely',
            'Streaming only affects TTFT, not output safety'
          ],
          answer: 1,
          explain: 'Streaming and full-answer verification pull in opposite directions - show text immediately versus check it all first - so a practical design layers a fast partial check with a slower, more thorough one that can act after the fact.'
        }
      }
    ],
    connect: null,
    activities: [
      {
        id: 'sdc-a1',
        type: 'design',
        title: 'Exercise: design a distributed rate limiter for a public API',
        viz: 'case-rate-limiter',
        prompt: `"Our public API gets 50,000 requests per second across 40 gateway replicas. Design a rate limiter that caps each API key at 100 requests per second sustained, allows short bursts, and adds no more than 5ms at p99. Walk through the algorithm, where it lives, what happens if its backing store goes down, and how you'd key it."`,
        timeboxSec: 900,
        rubric: `Marking guide, out of 10. (1) Picks an explicit algorithm - token bucket or a sliding-window counter - and justifies it against the requirement to allow short bursts, rather than a fixed window. (2) States the limiter runs at the gateway or edge, before expensive work, with a reason. (3) Identifies the concurrency problem correctly - many gateway replicas must share one counter per key - and proposes a shared store with an atomic check-and-increment, naming the race a naive read-then-write would create. (4) Addresses the 5ms p99 budget concretely: a fast, colocated shared store, and/or a local approximate count with periodic reconciliation to cut the network hop, named as a real trade-off between precision and latency. (5) States the key explicitly as the API key, with a reason tied to what is being protected. (6) Addresses backing-store failure explicitly and picks a position - fail-open or fail-closed - with a reason. (7) Mentions the 429 response and a Retry-After header as the contract with callers. (8) Gives a rough capacity estimate for the store itself to show the design is sized, not just described. (9) Avoids overcomplicating with an unnecessary consensus protocol for what is fundamentally an approximate control. (10) Plain, precise language throughout. Deduct for: a fixed-window-only design with no mention of the boundary-burst problem; no answer for store failure; IP-only keying. {{HONESTY}}`,
        model: `"Algorithm: a sliding-window counter, not a hard token bucket, because I want burst tolerance without the fixed-window boundary problem - a caller shouldn't get double the rate by timing two bursts across a minute boundary. Key: the API key, not the caller's IP, since the thing I'm actually protecting is fairness between API consumers, and many callers can share one IP behind NAT.

Where it lives: at the gateway, before the request reaches any service logic, so a rejected call costs almost nothing.

Shared state: with 40 replicas all checking the same key's count, I need one shared source of truth - Redis, with the check-and-increment done as a single atomic command so two replicas can't both read the count as 99 and both let a request through that should have been the 101st. To hit the 5ms p99 budget, I'd colocate Redis in the same region as the gateways; if that's still not fast enough at 50,000 QPS, I'd move to per-replica local counters with a higher local threshold and asynchronous reconciliation against Redis every second or so - trading exact enforcement for speed, which is fine here, since briefly running a little over on a burst is a much smaller problem than adding latency to every request.

Failure mode: if Redis is unreachable, I'd fail open - let requests through unlimited rather than reject everything - because an outage that denies all legitimate traffic is worse than briefly under-enforcing a quota.

Capacity: with maybe 500,000 active API keys and a small counter plus timestamp per key, that's easily a few hundred MB in Redis - not a sizing concern at this scale.

Response contract: a 429 with a Retry-After header telling well-behaved clients exactly when to try again."`
      },
      {
        id: 'sdc-a2',
        type: 'design',
        title: 'Exercise: design the idempotent charge and ledger path for a payments API',
        viz: 'case-payments-ledger',
        prompt: `"Design the write path for a 'charge a card' endpoint. It must never double-charge a customer even if the client retries after a timeout, and finance needs a complete, auditable trail of every cent that moved. Walk through the request flow, the data model, and how a nightly reconciliation would catch a mistake."`,
        timeboxSec: 900,
        rubric: `Marking guide, out of 10. (1) Requires the client to supply an idempotency key and stores it with the eventual result, returning the stored result on any retry with the same key instead of re-processing. (2) Makes the idempotency check and the charge itself atomic with respect to each other, e.g. a uniqueness constraint inside one transaction, so two concurrent retries cannot both pass the check and both charge. (3) Addresses the harder case explicitly: the call to the external processor may have succeeded even though the response to us was lost, so a blind retry is unsafe - the design queries the processor's own record, or waits for its webhook, before deciding whether a retry should charge again. (4) Models money movement as double-entry ledger rows rather than updating an account balance in place. (5) States the ledger write is a real transaction, not eventually consistent, with a reason. (6) Describes reconciliation concretely: pulling the processor's settlement report and comparing it against the internal ledger, flagging any mismatch for a human rather than auto-correcting silently. (7) States what happens on a genuine mismatch: held for investigation, not silently adjusted. (8) Mentions sharding the ledger by account as the scaling answer, rather than relaxing consistency. (9) Keeps the idempotency and ledger path free of anything probabilistic or ML-based, and can say why. (10) Plain, precise language. Deduct for: updating a balance in place; blind retries against the processor; auto-correcting reconciliation mismatches without a human review step. {{HONESTY}}`,
        model: `"Request flow: the client sends the charge with a caller-generated idempotency key. The API looks up that key in an idempotency table first; if it's there, it returns the stored result immediately with no new charge. If not, it inserts the key inside the same transaction that will record the attempt, so two concurrent retries can't both pass the lookup and both proceed - the second one hits a uniqueness constraint and falls back to reading the first one's result.

The trickier case is a call to the card processor that times out on our side but actually succeeded on theirs. I wouldn't blindly retry the charge - I'd first check the processor's own status for that idempotency key, since most processors accept the same key and will report the outcome of the original attempt, or wait for their webhook confirming the result, and only charge again if the processor genuinely has no record of it.

Data model: every movement is a double-entry ledger row - a debit from the customer and a credit to our clearing account, in the same transaction, summing to zero. No balance is ever updated in place; a current balance is a query over the ledger, not a stored number that can drift from reality. This has to be a real transaction, not eventually consistent, because a torn write here is a torn dollar.

Reconciliation: nightly, pull the processor's settlement report and compare it against the internal ledger, transaction by transaction where possible or by daily total as a first check. A mismatch is never auto-corrected - it's held and flagged for a person, because guessing at money is worse than a delay.

Scaling: as volume grows, I'd shard the ledger by account rather than loosen consistency, since account-level operations rarely need to join across shards."`
      },
      {
        id: 'sdc-a3',
        type: 'followup',
        title: 'Interview question: "Your chatbot just confidently cited a source that doesn\'t say what it claims. What do you do?"',
        prompt: `An interviewer says: "A user reports that your RAG chatbot gave a confident answer with a citation, but the cited document doesn't actually say that. Walk me through how this happens and what you'd change." Answer in first person, about 90 seconds.`,
        timeboxSec: 120,
        rubric: `Must-haves: (1) explains the mechanism correctly - retrieval can return a chunk that is topically related but does not actually support the specific claim, and the model can generate a confident answer and attach a citation regardless, since generation and citation attachment are not the same step as verifying the claim against the source. (2) distinguishes a retrieval failure - the wrong or insufficiently specific chunk was retrieved - from a generation failure - the right chunk was retrieved but the model still said something it doesn't support - as two different bugs with two different fixes. (3) proposes a concrete fix for at least one: better chunking or re-ranking of retrieved chunks for a retrieval failure, or an explicit grounding-verification pass that checks a generated claim against its cited chunk before the answer is shown, for a generation failure. (4) acknowledges this cannot be reduced to zero, only reduced, and that showing sources so a user can check them is part of the real safety design, not a promise of perfect grounding. (5) mentions ongoing monitoring for this specific failure, e.g. sampling answers and auditing citations against sources. Common mistakes: blaming "the model" vaguely with no mechanism; proposing a bigger model as the whole fix; no monitoring mentioned. {{HONESTY}}`,
        model: `"This is one of two different bugs, and I'd want to know which one before proposing a fix. Either retrieval pulled a chunk that's topically close but doesn't actually contain the specific claim - a retrieval failure - or the right chunk was retrieved and the model still generated a claim it doesn't support - a generation failure. They need different fixes, so the first thing I'd do is pull the actual retrieved chunks for this conversation and check which one happened.

If it's retrieval: the chunks are probably too large or too broad, so I'd look at smaller, more specific chunking, and add a re-ranking step that scores retrieved chunks against the actual question before they go in the prompt, not just against a general similarity score.

If it's generation: the model attached a citation without the claim actually being grounded in it. I'd add an explicit verification step - a smaller, cheaper model, or a separate call to the same model - that checks each claim against its cited chunk before the answer is shown, and either drops the citation or flags the claim as unsupported if it doesn't hold up.

Longer term, I wouldn't promise this goes to zero. I'd keep showing the actual source alongside the answer so a user can check it themselves, and I'd start sampling live answers for exactly this failure - a human or a secondary model auditing citations against sources on an ongoing basis, not just after a complaint comes in."`
      }
    ],
    sayQuestion: null,
    sayItOutLoud: null,
    readings: [
      { l: 'Ticket Servers: Distributed Unique Primary Keys on the Cheap (Flickr engineering)', u: 'https://code.flickr.net/2010/02/08/ticket-servers-distributed-unique-primary-keys-on-the-cheap/', w: 'The original source for the ticket-server id pattern used in the URL shortener case, including the odd/even two-server trick.', m: 12 },
      { l: 'Designing robust and predictable APIs with idempotency (Stripe)', u: 'https://stripe.com/blog/idempotency', w: 'Stripe\'s own explanation of idempotency keys, written by the team that popularised the pattern this chapter\'s payments case relies on.', m: 12 },
      { l: 'Ledger: Stripe\'s system for tracking and validating money movement', u: 'https://stripe.dev/blog/ledger-stripe-system-for-tracking-and-validating-money-movement', w: 'A real production double-entry ledger at very large scale, and how Stripe validates it continuously rather than trusting it blindly.', m: 20 },
      { l: 'Video: Designing INSTAGRAM: System Design of News Feed - Gaurav Sen', u: 'https://www.youtube.com/watch?v=QmX2NPkJTKg', w: 'A full walkthrough of feed design including the celebrity fan-out problem this chapter\'s news feed case is built around.', m: 35 },
      { l: 'Video: Design Scalable News Feed System Similar to Instagram, Facebook & Twitter', u: 'https://www.youtube.com/watch?v=Ox-aXX2qekU', w: 'A second, independent walkthrough of the same problem with different numbers, useful for seeing which parts of the design are load-bearing.', m: 20 },
      { l: 'How Stripe Detects Fraudulent Transactions Within 100ms (ByteByteGo)', u: 'https://blog.bytebytego.com/p/how-stripe-detects-fraudulent-transactions', w: 'A concrete, sub-100ms fraud-scoring architecture, closely matching the latency budget this chapter\'s fraud case works from.', m: 12 },
      { l: 'Achieve 23x LLM Inference Throughput & Reduce p50 Latency (Anyscale)', u: 'https://www.anyscale.com/blog/continuous-batching-llm-inference', w: 'Explains continuous batching, the serving technique behind why an LLM chat product can serve many concurrent conversations affordably.', m: 15 },
      { l: 'System Design for Recommendations and Search (Eugene Yan)', u: 'https://eugeneyan.com/writing/system-design-for-discovery/', w: 'The clearest public write-up of the candidate-generation-then-ranking split this chapter\'s recommendation case is built around, with real company examples.', m: 20 }
    ],
    glossary: [
      {
        g: 'Worked system design cases',
        sub: '',
        rows: [
          ['Ticket server', 'A dedicated database used only to hand out unique, auto-incrementing ids, often run as an odd/even pair to avoid a single point of failure', 'URL shortener case'],
          ['Fan-out on write / fan-out on read', 'Pushing a post into every follower\'s inbox at post time, versus merging a feed from followed accounts at read time', 'news feed case'],
          ['Idempotency key', 'A caller-supplied value that lets a retried request return the original result instead of repeating its effect', 'payments case'],
          ['Ledger (double-entry)', 'Recording every movement of money as a balanced debit and credit rather than updating a stored balance in place', 'payments case'],
          ['Reconciliation', 'Comparing an internal record against an external source of truth to catch drift', 'payments case'],
          ['Candidate generation', 'A cheap first stage that narrows a huge catalog down to a few hundred plausible items', 'recommendation case'],
          ['Two-stage ranking', 'Candidate generation followed by a heavier ranking model that only scores the shortlist', 'recommendation case'],
          ['Cold start', 'Having little or no history for a new user or a new item to base a recommendation on', 'recommendation case'],
          ['Streaming features', 'Features computed continuously from an event stream so they stay fresh at decision time', 'fraud detection case'],
          ['Label latency', 'The delay between a decision and knowing whether it was correct', 'fraud detection case'],
          ['Retrieval-augmented generation (RAG)', 'Fetching relevant text and giving it to a language model as context before it answers', 'LLM chat case'],
          ['TTFT / TPOT', 'Time to first token and time per output token - the two latency numbers that matter for a streamed LLM answer', 'LLM chat case'],
          ['Model router', 'A component that sends most requests to a cheap model and escalates harder ones to a stronger one', 'LLM chat case'],
          ['Adaptive bitrate streaming', 'Serving a video at a resolution the viewer\'s current bandwidth can sustain, switching as it changes', 'video pipeline case'],
          ['Trie (prefix tree)', 'A tree structure that stores strings so every string sharing a prefix shares a path from the root', 'autocomplete case']
        ]
      }
    ]
  };

}(typeof window !== 'undefined' ? window : this));
