/* sd-foundations: two system design chapters, requirements/capacity planning and APIs/load balancing/communication. */
(function (root) {
  'use strict';
  root.PREP_CORE = root.PREP_CORE || {};

  root.PREP_CORE['requirements-and-capacity'] = {
    id: 'requirements-and-capacity',
    title: 'Requirements and capacity planning',
    level: 'danger',
    levelLabel: 'Asked in almost every system design interview.',
    why: `Every system design interview opens with a vague sentence - "design something like Instagram" - and the first five minutes decide whether the rest of the hour goes well. The interviewer is watching whether you turn that sentence into a scoped problem with real numbers before you draw a single box, because that is the actual job: nobody hands a working engineer a fully specified problem either. Getting the arithmetic roughly right, and saying out loud which corner you are cutting and why, matters far more than reciting a formula perfectly.`,
    learn: [
      {
        id: 'rac-0',
        part: 'field',
        title: 'Key terms',
        body: `<p>One pass through the words this chapter uses. Read it once, then use the words freely.</p>
<ul>
<li><b>Functional requirement.</b> Something the system must do - "a user can upload a photo," "a driver can accept a ride."</li>
<li><b>Non-functional requirement (quality attribute).</b> How well the system must do it - how fast, how available, how durable, how much it may cost. "Uploads succeed 99.9% of the time" is non-functional.</li>
<li><b>Availability.</b> The fraction of time a system is able to answer requests correctly, usually stated as a percentage.</li>
<li><b>Nines.</b> Shorthand for an availability target: two nines is 99% (about 3.7 days of downtime a year), three nines is 99.9% (about 9 hours a year), five nines is 99.999% (about 5 minutes a year).</li>
<li><b>Durability.</b> The probability that data, once accepted, is never lost - independent of whether the system is reachable right now. A store can be durable and briefly unavailable at the same time.</li>
<li><b>Consistency.</b> How up to date a read is guaranteed to be relative to the latest write. <b>Strong</b> consistency guarantees the latest write; <b>eventual</b> consistency only guarantees that copies converge in time.</li>
<li><b>Latency.</b> The time between sending a request and getting a response.</li>
<li><b>Percentile (p50, p99).</b> p50 is the median request. p99 means 99 out of 100 requests were at least this fast - it captures the slow tail that an average hides.</li>
<li><b>Throughput.</b> How much work a system completes per unit time.</li>
<li><b>QPS / RPS.</b> Queries per second / requests per second - the standard unit for how busy a service is.</li>
<li><b>DAU / MAU.</b> Daily active users / monthly active users - the standard way a product states how many people use it in a period.</li>
<li><b>Read:write ratio.</b> How many reads happen for every write. A social feed might be 100:1; a payments ledger is closer to 1:1.</li>
<li><b>Peak factor.</b> How many times higher than the average the busiest moment gets, for example ten times the average traffic during a flash sale.</li>
<li><b>Back-of-the-envelope estimate.</b> Rough arithmetic from a few stated assumptions, done to get a number that is right within a factor of two or three, quickly.</li>
<li><b>Horizontal scaling.</b> Adding more machines that each carry a share of the work.</li>
<li><b>Vertical scaling.</b> Making one machine more powerful - more CPU, more memory, a faster disk.</li>
<li><b>Monolith.</b> One codebase, built and deployed as a single unit, that contains all of a system's functionality.</li>
<li><b>Microservice.</b> One independently deployable service that owns one part of the functionality and talks to the others over the network.</li>
<li><b>Service boundary.</b> The line that decides what one service owns and what it must call another service for. A bad boundary forces two services to change together.</li>
<li><b>Conway's law.</b> The observation that a system's structure tends to mirror the communication structure of the organisation that built it - team boundaries and service boundaries end up looking alike.</li>
<li><b>Concurrency.</b> Structuring a program so several tasks are in progress at once, making progress by interleaving, without necessarily executing at the exact same instant.</li>
<li><b>Parallelism.</b> Actually running more than one task at the exact same instant, on more than one core or machine.</li>
<li><b>Thread, process, core.</b> A thread is a sequence of instructions inside a process; a process is a running program with its own memory; a core is the physical unit inside a CPU that executes one thread at a time.</li>
<li><b>Headroom.</b> Capacity kept unused on purpose, so a spike or a lost machine does not immediately cause an overload.</li>
<li><b>CAP theorem.</b> Under a network partition, a distributed data store must choose between staying consistent and staying available. It says nothing about behaviour when there is no partition.</li>
<li><b>PACELC.</b> An extension of CAP: else, when there is no partition, a system still trades latency against consistency, because waiting for more replicas to agree always costs time.</li>
</ul>`,
        deeper: `<p>Notice how many of these words name a trade-off rather than a rule. Availability, durability, consistency, latency and cost are five dials on the same panel, and turning one usually moves another. The rest of this chapter is mostly about learning which dial to turn for a given problem, and being able to say so out loud in one sentence.</p>`,
        check: {
          question: 'A payments ledger and a social media feed both claim to be "highly available." What is the sharpest way to tell whether a service is actually optimising for availability or for durability?',
          options: [
            'Availability and durability are the same property described two ways',
            'Availability is whether the system is reachable and answering right now; durability is whether accepted data can ever be lost, even during an outage - a system can be unavailable yet perfectly durable',
            'Durability only applies to databases, not to services',
            'A system with high availability automatically has high durability'
          ],
          answer: 1,
          explain: 'Availability is about being reachable now; durability is about never losing data that was already accepted, whether or not the system is currently reachable. A store can refuse new writes during an outage (unavailable) while every write it already accepted is still safe (durable).'
        }
      },
      {
        id: 'rac-f1',
        part: 'field',
        title: 'Clarifying requirements: functional vs non-functional',
        body: `<p>The prompt "design something like Instagram" is not a specification; it is an invitation to build one. The first move is to ask a short, structured set of questions and turn the answers into a scope you both agree on, before any box is drawn.</p>
<p><b>Functional questions</b> establish what the system does: who are the users, what are the two or three core actions (upload a photo, follow a user, view a feed), and what is explicitly out of scope for this session (comments, ads, search). Naming what you are <i>not</i> designing is as useful as naming what you are.</p>
<p><b>Non-functional questions</b> establish how well it must do those things: roughly how many users and how much traffic, what latency is acceptable and at which percentile, how available it needs to be, whether a read can be slightly stale, and how durable the data must be. A photo upload that is allowed to take five seconds is a different design problem from one that must complete in five hundred milliseconds.</p>
<p><b>Ask what already exists.</b> "Is there an existing user service I call, or am I designing that too?" scopes the problem down immediately and shows you think about integration, not just green-field design.</p>
<p><b>State the scope back.</b> After a minute or two of questions, say the scope out loud in one or two sentences: "I'll design the upload and view path for photos, for a few million daily users, prioritising availability and low read latency over strict consistency, and I'll treat user accounts as an existing service." That sentence is the contract for the rest of the interview, and it is far more valuable than any box on the whiteboard.</p>`,
        deeper: `<p>The habit that separates a strong answer from a mechanical one is asking "what happens when this fails" as a non-functional question, not an afterthought. "What should happen if the upload succeeds but the thumbnail generation fails?" is a requirements question, and answering it early avoids redesigning the whole flow later when a failure mode comes up. For that specific example, the usual answer is that the upload itself is accepted and stored, the thumbnail job is retried in the background, and the client is shown the original image until a thumbnail exists. The alternative - failing the whole upload because a thumbnail failed - throws away work the user already paid for in upload time. Which one is right depends on whether a missing thumbnail is visible to the user or merely untidy, and that is exactly the thing to agree on out loud before designing.</p>`,
        check: {
          question: 'An interviewer says "design something like Twitter." What is the strongest first move?',
          options: [
            'Start drawing the client, load balancer and database, since those appear in almost every design',
            'Ask two or three functional and non-functional questions, then state a narrowed scope out loud before designing anything',
            'Recite the CAP theorem to show you understand distributed trade-offs',
            'Ask how many total engineers work at the company that inspired the prompt'
          ],
          answer: 1,
          explain: 'A vague prompt is an invitation to scope the problem. A few sharp questions followed by a one-sentence stated scope turns an open-ended prompt into something you can actually design against, and shows the interviewer how you approach ambiguity.'
        }
      },
      {
        id: 'rac-f2',
        part: 'field',
        title: 'The trade-offs: availability, durability, consistency, latency, cost',
        body: `<p>Five properties, and almost every design decision moves at least two of them in opposite directions. Naming the trade-off out loud, rather than pretending you can have all five for free, is what an interviewer is listening for.</p>
<ul>
<li><b>Availability against consistency.</b> This is the CAP theorem stated as a choice: when the network partitions, a store that keeps answering both sides is choosing availability over consistency, and one that refuses the minority side is choosing consistency over availability. A shopping cart usually chooses availability - a stale cart is annoying, a cart you cannot add to is a lost sale. A bank ledger usually chooses consistency - a wrong balance is worse than a temporarily unavailable one.</li>
<li><b>Latency against consistency.</b> PACELC's addition to CAP: even with no partition at all, waiting for more replicas to agree on a write still costs time. A single-replica acknowledgement is fast and weakly consistent; waiting for a majority of replicas is slower and strongly consistent. This trade-off exists on every single request, not just during a rare partition.</li>
<li><b>Durability against latency and cost.</b> Writing to more replicas, in more places, before acknowledging a write makes data harder to lose and slower and more expensive to write. A cache that is lost on restart is cheap and fast and not durable at all; that is an acceptable trade for data you can recompute, and an unacceptable one for a payment record.</li>
<li><b>Cost against everything else.</b> Every extra nine of availability, every extra replica for durability, every microsecond shaved off latency costs money and operational complexity. A reasonable design states the target, not the maximum: "99.9%, not 99.999%," because the last two nines are disproportionately expensive for most products.</li>
</ul>
<p>The reusable move: pick the one or two properties this specific system actually needs most, say why, and be explicit about what you are giving up to get them.</p>`,
        deeper: `<p>A concrete way to see PACELC in production systems: a Dynamo-style store (many shopping-cart and session stores) picks availability under partition and low latency otherwise, tolerating eventual consistency in both cases. A Spanner-style store picks consistency in both cases, at the cost of higher write latency because it waits for a quorum of replicas even when nothing is partitioned. Neither is more "correct" - they are simply optimised for different requirements.</p>`,
        check: {
          question: 'What does PACELC add on top of the CAP theorem?',
          options: [
            'That consistency and availability can both be achieved if enough replicas are used',
            'That even when there is no partition, a system still trades latency against consistency, because agreement across replicas takes time',
            'That partitions never actually happen in practice',
            'That durability and availability are the same property'
          ],
          answer: 1,
          explain: 'CAP only describes behaviour during a partition. PACELC observes that the latency-versus-consistency trade-off is present all the time, partition or not, because waiting for replicas to agree always costs time.'
        }
      },
      {
        id: 'rac-f3',
        part: 'field',
        title: 'Back-of-the-envelope estimation: the method and the numbers to know',
        viz: 'capacity-estimate',
        body: `<p>Three multiplications get you from a user count to the numbers that drive a design: traffic, storage, and bandwidth.</p>
<p>Two conventions first, because the arithmetic below depends on them. Sizes go up in steps of a thousand: a kilobyte (KB) is a thousand bytes, a megabyte (MB) a thousand KB, a gigabyte (GB) a thousand MB, a terabyte (TB) a thousand GB, and a petabyte (PB) a thousand TB. Network speed is quoted in <b>bits</b> per second, not bytes: a 1 Gbps link carries a billion bits a second, which is 125 MB a second, so divide by eight whenever a link speed meets a payload size.</p>
<ul>
<li><b>Traffic.</b> Average QPS = (daily active users x actions per user per day) / 86,400 seconds in a day. Peak QPS = average QPS x peak factor. State the peak factor as an assumption - "I'll assume ten times average at the daily peak" - rather than leaving it out.</li>
<li><b>Storage.</b> Storage per day = writes per day x average size per write x replication factor. Total storage = storage per day x 365 x years of retention.</li>
<li><b>Bandwidth.</b> Bandwidth = peak QPS x average payload size. Do this once for writes and once for reads, since the read:write ratio usually makes them very different.</li>
</ul>
<p><b>The latency numbers every engineer should carry.</b> These come from a well-known reference (see readings) and the exact figures drift with hardware, but the <i>relative gaps</i> - the orders of magnitude between rows - have stayed stable for years, which is the part worth memorising:</p>
<ul>
<li>L1 cache reference: about 0.5 nanoseconds. Main memory reference: about 100 nanoseconds - roughly 200 times slower than L1.</li>
<li>Send 1 KB over a 1 Gbps network: about 10 microseconds.</li>
<li>Read 4 KB randomly from SSD: about 150 microseconds.</li>
<li>Round trip inside the same data centre: about 500 microseconds.</li>
<li>Disk seek: about 10 milliseconds - roughly 100,000 times slower than main memory.</li>
<li>Round trip from California to the Netherlands and back: about 150 milliseconds.</li>
</ul>
<p>The takeaway to say out loud: memory is far faster than any disk, a same-datacentre round trip is cheap, and a cross-continent round trip dominates almost any latency budget it appears in - so keep chatty cross-region calls off the critical path.</p>`,
        deeper: `<p>Always write the assumption next to the number: "10 million DAU, 2 actions per user per day, so about 230 requests per second on average" is checkable and correctable; "230 requests per second" on its own is not. An interviewer who disagrees with your assumption can say so in five seconds and you both move on; an unstated assumption just sits there being wrong.</p>`,
        check: {
          question: 'Why is it more useful to memorise the relative gaps between the standard latency numbers (memory vs SSD vs disk vs network) than the exact nanosecond figures?',
          options: [
            'The exact figures are secret and cannot be looked up',
            'Hardware changes the exact numbers over time, but the order-of-magnitude gaps between memory, SSD, disk and cross-region network stay stable and are what actually drives a design decision',
            'Interviewers never ask about exact numbers',
            'Relative gaps are easier to memorise but design decisions only depend on exact numbers'
          ],
          answer: 1,
          explain: 'A design decision - cache in memory, avoid a disk seek on the path a request actually takes, keep chatty calls inside one region - depends on knowing that memory beats SSD by roughly a thousand times and disk seek beats a cross-region round trip by roughly ten times, not on the exact nanosecond count for this year\'s hardware.'
        }
      },
      {
        id: 'rac-f4',
        part: 'field',
        title: 'Two worked examples: a photo-sharing service and a fraud-scoring API',
        body: `<p><b>Example 1: a photo-sharing service.</b> Assume 100 million monthly active users, 20% daily active, so 20 million DAU. Assume each active user uploads 0.1 photos a day and views 20 photos a day.</p>
<p>Write QPS: 20,000,000 x 0.1 / 86,400 ≈ 23 uploads/second average; at a 10x peak factor, about 230/second at peak. Read QPS: 20,000,000 x 20 / 86,400 ≈ 4,630 views/second average, about 46,300/second at peak - confirming a read:write ratio of roughly 200:1, which says the design effort should go into caching reads, not optimising the write path.</p>
<p>Storage: assume 2 MB per photo including its stored resolutions. 20,000,000 x 0.1 = 2,000,000 photos/day x 2 MB ≈ 4 TB/day. Over five years at that rate, roughly 4 TB x 365 x 5 ≈ 7.3 PB before any replication factor. Bandwidth: peak upload ≈ 230 x 2 MB ≈ 460 MB/second; peak read, assuming most views hit a smaller cached thumbnail of about 200 KB, ≈ 46,300 x 200 KB ≈ 9.3 GB/second - which is why a CDN in front of the read path is not optional at this scale.</p>
<p><b>Example 2: a fraud-scoring API for checkout.</b> Assume 50 million orders a month, so about 1.67 million a day, average QPS ≈ 19/second; at a 20x peak factor for a sale event, about 386/second. Storage is small here - a 2 KB decision log per request at peak is only about 770 KB/second, nothing to design around.</p>
<p>What matters instead is the latency budget: if the caller needs a decision within a 300 ms p99 budget, and a feature lookup costs a same-datacentre round trip (about 500 microseconds) plus a few SSD reads for less-common features (about 150 microseconds each), the model call and the policy check have to fit in what is left. Contrast the two examples: the photo service is a storage-and-bandwidth problem; the fraud API is a latency-budget problem with a modest QPS. Estimating both the same way - traffic, then storage, then bandwidth or latency - shows which one actually constrains the design.</p>`,
        deeper: `<p>Notice that neither example needed a precise number, only a defensible one. If an interviewer challenges an assumption - "would you really see a 200:1 read:write ratio?" - the correct response is to reason about it ("most users look far more than they post, the way Instagram's own numbers suggest"), not to defend the exact figure to the decimal place.</p>`,
        check: {
          question: 'In the photo-sharing example, average upload QPS is about 23/second and the peak factor is 10. What is peak upload QPS, and why might the capacity you actually provision be higher still?',
          options: [
            '23/second; provisioned capacity should match it exactly to avoid waste',
            'About 230/second; provisioned capacity is usually set higher still, to leave headroom for a lost server or availability zone and for growth since the last estimate',
            '2,300/second; the peak factor should be squared',
            '23/second; peak factor only applies to storage, not to QPS'
          ],
          answer: 1,
          explain: 'Peak QPS = average QPS x peak factor = 23 x 10 ≈ 230/second. Real provisioning adds headroom on top of that peak for failure domains (a lost machine or zone) and for the traffic growing since the estimate was made, which is why "peak" and "capacity you build for" are not the same number.'
        }
      },
      {
        id: 'rac-f5',
        part: 'field',
        title: 'Horizontal vs vertical scaling',
        viz: 'scale-up-vs-out',
        body: `<p><b>Vertical scaling</b> means moving to a bigger machine: more CPU, more memory, a faster disk. It is simple - nothing about the software has to change, there is no distributed-systems problem to solve, and a single machine can offer strong consistency for free because there is only one copy of the data. The cost is a hard ceiling: the largest machine you can buy is still finite, cost tends to rise faster than capacity as you approach that ceiling, and the machine is a single point of failure.</p>
<p><b>Horizontal scaling</b> means adding more machines that each carry a share of the load. Cost grows close to linearly and there is no hard ceiling, but it only works cleanly for a service that is <b>stateless</b> - any replica can answer any request - and it introduces real coordination costs: a load balancer to spread requests, data that must be partitioned or replicated across machines, and consistency questions that a single machine never had.</p>
<p><b>The common default.</b> Fix inefficiency and scale up first, because it is nearly free and buys time without adding a distributed-systems problem to the design. Scale out once a single machine's ceiling is actually in sight, or once availability requires more than one machine regardless of size - a single machine can never be highly available on its own, no matter how large it is.</p>
<p>A relational database is the classic example: it is common to scale a primary database vertically for a long time, because a single writer keeps transactions simple, and only shard it once write throughput or data volume genuinely outgrows the largest available machine.</p>`,
        deeper: `<p>Vertical scaling is not "the beginner's option" - it is frequently the right senior call, precisely because it avoids a whole category of failure modes (partial failure, network partitions, data skew across shards) that a smaller system does not need to pay for yet. The mistake worth naming out loud in an interview is scaling out before measuring whether scaling up would have been enough.</p>`,
        check: {
          question: 'A service today handles 200 requests per second on one moderately sized machine, and the product roadmap does not expect that to grow by more than 50% in the next two years. What is the strongest argument for scaling up rather than out?',
          options: [
            'Horizontal scaling is always slower to implement',
            'At this load, a single bigger machine likely has enough headroom, avoids the complexity of statelessness, partitioning and a load balancer, and keeps strong consistency simple - complexity that would only pay for itself at a scale this service is not approaching',
            'Vertical scaling is required for any database',
            'Horizontal scaling is only possible with microservices'
          ],
          answer: 1,
          explain: 'Scaling out is a real cost - coordination, statelessness, partitioning - that is only worth paying when a single machine\'s ceiling is actually in view or when availability demands more than one machine. At modest, slow-growing load, the cheaper option usually wins.'
        }
      },
      {
        id: 'rac-f6',
        part: 'field',
        title: 'Monolith vs microservices',
        viz: 'monolith-vs-microservices',
        body: `<p>A <b>monolith</b> is one codebase, built and deployed as a single unit. Its modules call each other as ordinary in-process function calls, and it usually shares one database, so a change touching several modules can be one transaction. That makes it simple to develop, test, deploy and reason about, at the cost of scaling and deploying as a single unit even when only one part of it is under load, and of a large team working in the same codebase getting in each other's way.</p>
<p><b>Microservices</b> split the system into independently deployable services, each owning its own part of the functionality and usually its own data, communicating over the network. Each service can be scaled, deployed and owned by a separate team independently, and a failure in one service does not automatically take down the others. The cost is that an in-process function call becomes a network call: it can now fail on its own, needs a timeout and a retry policy, adds real latency, and a transaction that used to be one database commit becomes a much harder problem to keep consistent across services.</p>
<p><b>Conway's law</b> is the reason this choice is organisational as much as technical: service boundaries tend to end up matching team boundaries. Splitting services along the lines of how teams are actually organised, rather than an abstract diagram, tends to produce boundaries that survive contact with reality.</p>
<p><b>The common default</b> is to start with a monolith. Splitting too early means guessing at service boundaries before you have enough experience with the domain to know where they actually belong, and a wrong boundary is expensive to undo once two services and two teams depend on it. Split once a specific, felt pain shows up - one part of the system needs to scale or deploy independently of the rest, or one team is genuinely blocked by another's release schedule - rather than by default.</p>`,
        deeper: `<p>The trade-off worth stating precisely in an interview: microservices trade a simple, in-process transaction for two or more services that must coordinate over an unreliable network, which is exactly what makes idempotency, timeouts and retries mandatory rather than optional the moment you split. Naming that cost, rather than treating microservices as a free upgrade, is what shows real experience.</p>`,
        check: {
          question: 'A team splits a monolith into "orders" and "payments" services. What is the single biggest new problem this split introduces that did not exist before?',
          options: [
            'The database schema must be rewritten from scratch',
            'What used to be one in-process function call, inside one database transaction, is now a network call between two services that can fail, time out, or be retried on its own',
            'Microservices cannot use a relational database',
            'The two services must now be written in different programming languages'
          ],
          answer: 1,
          explain: 'The core cost of splitting a monolith is that a call which used to be a guaranteed, fast, in-process function call becomes a network call with its own failure modes - which is why retries, timeouts and idempotency stop being optional the moment you split.'
        }
      },
      {
        id: 'rac-f7',
        part: 'field',
        title: 'Concurrency vs parallelism',
        body: `<p><b>Concurrency</b> is a way of structuring work: several tasks are in progress at once, making progress by interleaving, even on a single core. A single-threaded event loop handling a thousand open network connections is concurrent - it switches between them while each one is waiting on the network - without ever running two of them at the literal same instant.</p>
<p><b>Parallelism</b> is actually running more than one task at the exact same instant, which needs more than one core or more than one machine. Splitting a large matrix multiplication across eight CPU cores is parallel.</p>
<p><b>Why the distinction matters for a design.</b> An I/O-bound workload - a web server waiting on the network or a disk far more than it computes - benefits from concurrency even on a single core, because the CPU is idle during every wait and can serve another request instead. A CPU-bound workload - encoding video, training a model - needs real parallelism across cores or machines to finish faster, because there is no idle time for another task to fill.</p>
<p><b>Amdahl's law</b> puts a hard ceiling on what parallelism alone can buy. If a fraction <code>p</code> of a job can be parallelised and sped up by a factor <code>s</code>, the overall speedup is <code>1 / ((1 - p) + p/s)</code>. As <code>s</code> grows very large, the speedup approaches <code>1 / (1 - p)</code> - a ceiling set entirely by the part of the job that cannot be parallelised. If 90% of a job is parallelisable, the maximum possible speedup from adding processors, however many you add, is 10x.</p>`,
        deeper: `<p>The practical version of Amdahl's law in system design: before adding more machines to speed something up, find out how much of the actual critical path is inherently serial - a single database write, a fixed network round trip, a step that must wait for another to finish. That serial fraction sets your ceiling regardless of how many machines you add after that, so it is usually worth attacking before buying more hardware.</p>`,
        check: {
          question: 'A batch job is 80% parallelisable across machines and 20% must run as one serial step. According to Amdahl\'s law, roughly what is the maximum possible speedup, no matter how many machines are added?',
          options: [
            'Unlimited - enough machines always makes it faster',
            'About 5x, because the ceiling is 1 divided by the serial fraction (1 / 0.2)',
            'Exactly 80x, matching the parallel percentage',
            '2x, because parallelism always halves runtime'
          ],
          answer: 1,
          explain: 'As the speedup of the parallel portion grows very large, overall speedup approaches 1 / (1 - p), where p is the parallel fraction. With p = 0.8, the ceiling is 1 / 0.2 = 5x, regardless of how many machines are thrown at the parallel 80%.'
        }
      },
      {
        id: 'rac-f8',
        part: 'field',
        title: 'Cost-aware design and when not to add infrastructure',
        body: `<p>Every new piece of infrastructure - a cache, a queue, a read replica, a shard - buys capability and adds a bill: a new failure mode, an on-call responsibility, and a monthly cost. A senior answer treats that as a real trade, not a free upgrade, and reaches for the cheapest fix first.</p>
<p><b>The usual order of escalation</b> for a service that is slow or struggling under load: measure what is actually slow before changing anything; fix an inefficient query or a missing index; fix an N+1 call pattern; add a cache in front of the hot read path; add a read replica; and only then consider partitioning, sharding, or splitting a service. Each step is cheaper and more reversible than the one after it, which is exactly why it comes first.</p>
<p><b>Premature scaling</b> is the recognised failure of skipping that order: reaching for a distributed cache, a message queue, or a microservice split to solve a problem that a single fixed query or a bigger machine would have solved for a fraction of the cost and none of the new failure modes. Plenty of real outages trace back to unnecessary complexity introduced to solve a scaling problem the system did not actually have yet, not to a lack of infrastructure.</p>
<p><b>Naming the cost concretely</b> is what makes this sound like judgement rather than caution: "a cache here removes load from the database, but it is a new component with its own staleness and stampede failure modes, and it costs money to run whether or not it is needed yet - I'd only add it once the measured database load actually justifies it." State the numbers if you have them: a read replica costs roughly the same as the primary it copies, so doubling read capacity by that route roughly doubles the database line item.</p>`,
        deeper: `<p>A useful one-line test before adding infrastructure: "what is the specific, measured bottleneck this solves, and what would happen if I did nothing?" If the answer to the second half is "probably nothing for the next year," that is a legitimate reason to defer, and saying so out loud is a stronger answer than defaulting to the most sophisticated design available.</p>`,
        check: {
          question: 'A service\'s API is slow under moderate load. What should happen before adding a cache or a queue?',
          options: [
            'Immediately add both, since caching and queueing never hurt',
            'Measure where the time is actually going - a slow query, a missing index, an N+1 pattern - and fix that first, since it is usually cheaper, more reversible, and might remove the need for new infrastructure entirely',
            'Move straight to sharding the database',
            'Rewrite the service as microservices'
          ],
          answer: 1,
          explain: 'Cheaper, more reversible fixes come first: measuring the actual bottleneck and fixing an inefficient query or access pattern often removes the problem outright, whereas adding a cache or queue on top of an unmeasured problem adds cost and new failure modes without necessarily fixing anything.'
        }
      }
    ],
    connect: null,
    activities: [
      {
        id: 'rac-a1',
        type: 'design',
        title: 'Size a URL shortener end to end',
        prompt: `"We want to build a URL shortener like bit.ly. Before you design anything, walk me through your assumptions and the numbers: how many short URLs get created per day, how many redirects per second at peak, how much storage you need over five years, and what your read:write ratio tells you about where to put your design effort."`,
        timeboxSec: 1200,
        rubric: `Marking guide, out of 10. (1) States an explicit assumption for creations per day (e.g. 10 million new short URLs a day) before calculating anything. (2) Computes average write QPS from that assumption using the correct formula (creations per day / 86,400) and states a peak factor to get peak write QPS. (3) States an assumption for the read:write ratio (e.g. 100:1 redirects to creations) and computes peak read QPS from it. (4) Computes storage: an assumption for bytes per record (short code, long URL, metadata), multiplied by records per day and by 365 x 5 years, arriving at a total order of magnitude. (5) Draws the design implication from the read:write ratio explicitly - redirects vastly outnumber creations, so the read path (cache, CDN, or an in-memory lookup) deserves the design effort, not the write path. (6) Mentions headroom - provisioned capacity above the computed peak for failure domains and growth. (7) Makes a scaling choice (vertical vs horizontal) with a stated reason tied to the numbers, not asserted by default. (8) States a first thing to build, in priority order. (9) Treats every number as a stated, checkable assumption rather than an unexplained constant. (10) Stays in plain, precise language rather than reciting vocabulary without applying it. Deduct for: skipping the read:write ratio entirely; computing storage without a retention period; asserting sharding or a distributed cache with no numbers behind the assertion. {{HONESTY}}`,
        model: `"I'll assume 10 million new short URLs are created a day, and that redirects outnumber creations by about 100 to 1, so 1 billion redirects a day - a link gets shared and clicked far more often than a new one gets made.

Write QPS: 10,000,000 / 86,400 ≈ 116/second average. With a 5x peak factor for daily variation, about 580/second at peak. Read QPS: 1,000,000,000 / 86,400 ≈ 11,600/second average, and at the same peak factor, around 58,000/second - confirming this is overwhelmingly a read-heavy system, so the redirect path is where the design effort belongs, not the creation path.

Storage: assume 500 bytes per record for the short code, the destination URL and metadata. 10,000,000 x 500 bytes ≈ 5 GB/day. Over five years: 5 GB x 365 x 5 ≈ 9.1 TB before replication - small enough that storage is not the constraint here; read throughput is.

Given 58,000 redirects a second and a tiny per-record size, I'd put a cache in front of the redirect path sized to hold the hot fraction of short codes in memory, since a redirect is a single key lookup with no joins - close to the ideal cache workload. I would not shard the write path at this scale; a single primary comfortably handles 580 writes a second, so vertical scaling or a couple of replicas for the write side is enough, and I would add headroom of roughly 50% above the computed peaks for a lost machine or an unplanned traffic spike.

First thing I would build: the redirect path with its cache, since that is where nearly all the traffic and nearly all the risk actually is."`
      },
      {
        id: 'rac-a2',
        type: 'formulate',
        title: 'Turn "it just needs to be reliable and fast" into numbers',
        prompt: `An interviewer says: "This service just needs to be reliable and fast, nothing fancy." Turn that sentence into three or four concrete, measurable non-functional requirements you would actually design against.`,
        timeboxSec: 300,
        rubric: `Must-haves: (1) does not accept the vague statement as-is, and explicitly restates it as a request for concrete numbers; (2) proposes a specific availability target (e.g. 99.9%) rather than "as high as possible"; (3) proposes a specific latency target tied to a percentile (e.g. p99 under 300ms) rather than "fast"; (4) proposes a consistency requirement appropriate to the guessed domain (e.g. eventual consistency acceptable for a feed, strong consistency required for a balance); (5) asks one clarifying question back rather than inventing numbers with total confidence, since "reliable and fast" for a chat app and for a payments API mean very different numbers. Common mistakes: proposing 99.999% and sub-10ms latency by default regardless of the domain; leaving "reliable" and "fast" as unquantified adjectives in the final answer. {{HONESTY}}`,
        model: `"Before I commit to numbers, I'd ask one thing: what does this service do, since 'reliable and fast' means a very different number for a payments API than for an internal analytics dashboard. Assuming it's a customer-facing API on the critical path of a checkout flow, here's what I'd actually design against.

Availability: 99.9% over a rolling 30-day window, which is about 43 minutes of allowed downtime a month - high enough to be a real commitment, not so high that every deploy becomes terrifying.

Latency: p99 under 300 milliseconds, not an average, because an average hides exactly the slow requests that create a bad experience for real users.

Consistency: since this sits in a checkout flow, I'd want read-your-writes consistency at minimum for the specific customer who just took an action, even if other read paths can tolerate a short eventual-consistency window.

Durability: any accepted order must never be lost, so I'd want a durability target stated separately from availability - the system can be briefly unreachable without ever losing an order that was already accepted.

That turns 'reliable and fast' into four numbers I can actually design a system to hit, and four numbers I can be held to afterward."`
      },
      {
        id: 'rac-a3',
        type: 'followup',
        title: 'Interview question: horizontal vs vertical scaling, and when vertical still wins',
        prompt: `An interviewer asks: "What's the difference between scaling up and scaling out, and is there ever a case where you'd still scale up today?" Answer in first person, in about 90 seconds.`,
        timeboxSec: 120,
        rubric: `Must-haves: (1) vertical scaling correctly defined as making one machine bigger, with its benefit named - simplicity, no distributed-systems problem, easy strong consistency; (2) horizontal scaling correctly defined as adding more machines, with its benefit named - near-linear cost, no hard ceiling; (3) at least one real cost of horizontal scaling named explicitly - the statelessness requirement, a load balancer, or coordination across machines; (4) a concrete case given for still scaling up, tied to a reason rather than asserted (moderate, slowly growing load; a single-writer database wanting simple transactions; avoiding distributed complexity before it is needed); (5) does not claim horizontal scaling is always superior or that vertical scaling is only for beginners. Common mistakes: describing only one of the two options; asserting a preference with no stated reason; forgetting that vertical scaling has a hard ceiling. {{HONESTY}}`,
        model: `"Scaling up means making one machine bigger - more CPU, more memory, a faster disk. It's simple: nothing about the software changes, there's no distributed-systems problem to solve, and because there's only one copy of the data, strong consistency comes for free. The cost is a hard ceiling - the biggest machine you can buy is still finite - and it's a single point of failure.

Scaling out means adding more machines that each carry a share of the load. Cost grows close to linearly and there's no hard ceiling, but it only works cleanly if the service is stateless, and it introduces real coordination costs - a load balancer, data partitioned or replicated across machines, and consistency questions a single machine never had.

Yes, I'd still scale up today, and I think it's actually the right senior instinct more often than people assume. If a service is comfortably inside a single big machine's capacity and isn't expected to outgrow it soon, scaling up avoids paying for a distributed system you don't need yet - no statelessness requirement, no partitioning, no new failure modes. A single-writer relational database is a good example: keeping one primary and scaling it vertically keeps transactions simple for a long time, and I'd only shard it once write throughput or data volume genuinely outgrew the largest machine available, or once availability itself demanded more than one machine regardless of size."`
      }
    ],
    sayQuestion: null,
    sayItOutLoud: null,
    readings: [
      { l: 'PRIMER: Latency Numbers Every Programmer Should Know', u: 'https://gist.github.com/jboner/2841832', w: 'The exact reference table this chapter\'s latency numbers come from - memorise the relative gaps between the rows, not the exact nanosecond counts.', m: 8 },
      { l: 'PRIMER: High availability (the "nines" table)', u: 'https://en.wikipedia.org/wiki/High_availability', w: 'The standard table mapping an availability percentage to allowed downtime per year, which is what a nines target actually commits you to.', m: 8 },
      { l: 'Problems with CAP, and Yahoo\'s little known NoSQL system (Daniel Abadi)', u: 'http://dbmsmusings.blogspot.com/2010/04/problems-with-cap-and-yahoos-little.html', w: 'The original post proposing PACELC, written by the person who named it - the clearest source for why CAP alone is an incomplete way to reason about distributed trade-offs.', m: 15 },
      { l: 'MonolithFirst (Martin Fowler)', u: 'https://martinfowler.com/bliki/MonolithFirst.html', w: 'The classic, short argument for starting with a monolith and discovering service boundaries through experience before splitting.', m: 8 },
      { l: 'PRIMER: Amdahl\'s law', u: 'https://en.wikipedia.org/wiki/Amdahl%27s_law', w: 'The formula behind the parallelism ceiling this chapter uses, stated precisely with the derivation.', m: 10 },
      { l: 'Back-of-the-Envelope Estimation (ByteByteGo)', u: 'https://bytebytego.com/courses/system-design-interview/back-of-the-envelope-estimation', w: 'A second walk-through of the same estimation method with different worked numbers, useful for practising the arithmetic under time pressure.', m: 12 },
      { l: 'Video: Back of the Envelope Storage Estimates | System Design Interview', u: 'https://www.youtube.com/watch?v=eR5pIYfxKgY', w: 'Watching someone do the storage arithmetic out loud, assumption by assumption, is closer to what an interview actually feels like than reading a table.', m: 10 },
      { l: 'AWS Well-Architected Framework - Cost Optimization Pillar, design principles', u: 'https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/design-principles.html', w: 'The standard, vendor-neutral-in-spirit statement of why measuring efficiency and avoiding undifferentiated infrastructure spend is a design discipline, not an afterthought.', m: 10 }
    ],
    glossary: [
      {
        g: 'Requirements and capacity planning',
        sub: '',
        rows: [
          ['Nines', 'Shorthand for an availability target, e.g. three nines = 99.9% = about 9 hours down a year', 'availability targets'],
          ['Durability', 'The probability accepted data is never lost, independent of whether the system is reachable now', 'availability vs durability'],
          ['Percentile (p99)', '99 out of 100 requests were at least this fast; captures the slow tail an average hides', 'latency reporting'],
          ['Peak factor', 'How many times higher than average the busiest moment gets', 'back-of-envelope estimation'],
          ['Back-of-the-envelope estimate', 'Rough, stated-assumption arithmetic done quickly to get a number right within a factor of two or three', 'capacity planning'],
          ['CAP theorem', 'Under a network partition, a distributed store must choose consistency or availability', 'distributed trade-offs'],
          ['PACELC', 'Else (no partition), a system still trades latency against consistency', 'distributed trade-offs'],
          ['Horizontal scaling', 'Adding more machines that each carry a share of the load', 'scaling'],
          ['Vertical scaling', 'Making one machine bigger: more CPU, memory, or faster disk', 'scaling'],
          ['Monolith', 'One codebase built and deployed as a single unit', 'architecture style'],
          ['Conway\'s law', 'A system\'s structure tends to mirror the organisation\'s communication structure', 'service boundaries'],
          ['Concurrency', 'Multiple tasks in progress at once via interleaving, not necessarily at the same instant', 'concurrency vs parallelism'],
          ['Parallelism', 'Multiple tasks executing at the exact same instant, on multiple cores or machines', 'concurrency vs parallelism'],
          ['Amdahl\'s law', 'Speedup = 1 / ((1 - p) + p/s); the serial fraction sets a hard ceiling on speedup from parallelism', 'parallel scaling limits'],
          ['Premature scaling', 'Adding infrastructure to solve a scaling problem the system does not actually have yet', 'cost-aware design']
        ]
      }
    ]
  };

  root.PREP_CORE['apis-and-communication'] = {
    id: 'apis-and-communication',
    title: 'APIs, load balancing and communication',
    level: 'danger',
    levelLabel: 'Asked in almost every system design interview.',
    why: `Once the whiteboard has a client and a server on it, the very next questions are almost always about the contract between them and about what sits in between: what the API looks like, what happens when a call fails, and how does traffic actually get spread across replicas. Interviewers use this ground to see whether you have actually operated a service under real network conditions - where calls fail, time out, and arrive twice - rather than only having designed one on paper. Getting the retry and load-balancing story right is often worth more than the box diagram itself.`,
    learn: [
      {
        id: 'apc-0',
        part: 'field',
        title: 'Key terms',
        body: `<p>One pass through the words this chapter uses. Read it once, then use the words freely.</p>
<ul>
<li><b>Resource.</b> The noun an API exposes, addressed by a URL in REST - for example <code>/orders/42</code>.</li>
<li><b>Endpoint.</b> One addressable operation on a resource, such as <code>GET /orders/42</code>.</li>
<li><b>HTTP method (verb).</b> GET, POST, PUT, PATCH, DELETE - the standard vocabulary for what a request does to a resource.</li>
<li><b>Safe method.</b> A method that never changes server state, such as GET, so it can be retried and cached freely.</li>
<li><b>Idempotent method.</b> A method where doing it twice has the same effect as doing it once. GET, PUT and DELETE are idempotent by definition; POST is not.</li>
<li><b>Status code.</b> The three-digit number classifying a response's outcome: 2xx success, 4xx the caller's fault, 5xx the server's fault.</li>
<li><b>Versioning.</b> A way to change an API's contract without breaking callers still using the old one, for example a <code>/v2/</code> path prefix.</li>
<li><b>Pagination (offset vs cursor).</b> Returning a large result in bounded pages, either by a numeric offset or by an opaque cursor pointing at the last item seen.</li>
<li><b>Error contract.</b> The agreed structure of an error response: a machine-readable code, a human message, and whether retrying is likely to help.</li>
<li><b>REST.</b> An API style built on resources, standard HTTP methods and status codes, usually carrying JSON.</li>
<li><b>gRPC.</b> A binary RPC framework built on HTTP/2 and Protocol Buffers, typically used between a company's own services.</li>
<li><b>Protocol Buffers (protobuf).</b> A compact binary format with a defined schema, used by gRPC instead of JSON.</li>
<li><b>GraphQL.</b> A query language letting the caller ask for exactly the fields it needs from a single endpoint, instead of one endpoint per resource.</li>
<li><b>Over-fetching / under-fetching.</b> Getting more fields than needed, or needing several round trips to get enough fields - both common REST problems that GraphQL targets.</li>
<li><b>TCP.</b> A connection-oriented transport that guarantees ordered, complete delivery, at the cost of a handshake and of one lost packet blocking data queued behind it.</li>
<li><b>UDP.</b> A connectionless transport that sends packets with no delivery or ordering guarantee, trading reliability for lower latency and overhead.</li>
<li><b>HTTP/2.</b> The HTTP version that multiplexes many requests over one TCP connection, removing the need for many parallel connections.</li>
<li><b>Multiplexing.</b> Running several logical streams over one shared connection at once.</li>
<li><b>Head-of-line blocking.</b> One lost or slow item blocking everything queued behind it on the same channel, even though the items are otherwise unrelated.</li>
<li><b>WebSocket.</b> A protocol that upgrades an HTTP connection into a persistent, full-duplex channel, so either side can send at any time without a new request.</li>
<li><b>Full-duplex.</b> Both sides of a connection can send and receive at the same time.</li>
<li><b>API gateway.</b> A single entry point that terminates client traffic and applies cross-cutting concerns - authentication, rate limiting, routing to the right backend service.</li>
<li><b>Load balancer.</b> The component that spreads incoming connections or requests across healthy replicas of one service.</li>
<li><b>Round robin.</b> A load-balancing algorithm that sends each new request to the next replica in a fixed rotation.</li>
<li><b>Least connections.</b> A load-balancing algorithm that sends a request to whichever replica currently has the fewest open connections.</li>
<li><b>Weighted.</b> A variant of round robin or least connections where each replica gets a per-machine weight, so a bigger machine gets a proportionally larger share.</li>
<li><b>Consistent hashing.</b> A hashing scheme mapping requests and replicas onto a ring, so adding or removing one replica reshuffles only a small fraction of the keys.</li>
<li><b>Network layers.</b> Network software is described as a stack of layers, each one using the layer below it and hiding its detail. Two of them come up constantly here. <b>Layer 4</b> is the <b>transport layer</b>, where a connection is nothing more than an address and a port, carried by TCP or UDP; software at this layer moves bytes and never looks at what they mean. <b>Layer 7</b> is the <b>application layer</b>, where the message itself is visible - an HTTP request with a method, a path, headers and a body. The numbers come from the OSI reference model, an old seven-layer diagram nobody implements literally, but layer 4 and layer 7 stuck as the everyday names for "below the message" and "the message itself."</li>
<li><b>Layer 4 (L4) / Layer 7 (L7) load balancing.</b> An L4 balancer picks a replica from the address and port alone, without reading the request; an L7 balancer reads the request and can route on path, header or hostname, and can terminate TLS.</li>
<li><b>Health check (readiness / liveness).</b> A probe deciding whether a replica should receive traffic. A readiness check controls whether it gets traffic; a liveness check controls whether it gets restarted.</li>
<li><b>Retry.</b> Sending a failed request again - safe only when the operation is idempotent or the caller can tell whether the first attempt already applied.</li>
<li><b>Timeout / deadline.</b> A timeout is the longest a caller waits before giving up; a deadline is a timeout that travels with a request across every hop, so each hop knows exactly how much time is left.</li>
<li><b>Idempotency key.</b> A value the caller attaches to a request so a retried request is recognised as the same request and never applied twice.</li>
<li><b>Exponential backoff.</b> Waiting longer after each failed retry, typically doubling the wait each time.</li>
<li><b>Jitter.</b> Random variation added to a backoff delay, so many clients that failed at the same moment do not all retry at the same instant.</li>
<li><b>Batching.</b> Grouping several small units of work into one larger call to spread a fixed per-call cost across all of them.</li>
<li><b>Backpressure.</b> A saturated component telling its callers to slow down or accept rejection, instead of accepting unbounded work.</li>
<li><b>Tail latency.</b> The latency of the slowest fraction of requests, usually reported as p99 or p999, which an average hides completely.</li>
<li><b>Hedged request.</b> A second, duplicate request sent to a different replica after waiting a while for the first, using whichever answer returns first.</li>
<li><b>Load shedding.</b> Deliberately rejecting or degrading some requests under overload so the rest still meet their target.</li>
</ul>`,
        deeper: `<p>Most of this chapter is one story told from different angles: a request travels from a client, through a gateway and a load balancer, to a replica, and back - and at every one of those hops something can be slow, can fail outright, or can arrive twice. The vocabulary above is what lets you describe, precisely, which hop you mean and what you are doing about it.</p>`,
        check: {
          question: 'Which HTTP method is idempotent but not safe?',
          options: [
            'GET, because it is idempotent and also changes no state',
            'PUT, because calling it twice with the same body leaves the resource in the same final state, but it does change server state, unlike a safe method',
            'POST, because it is always idempotent',
            'DELETE is never idempotent'
          ],
          answer: 1,
          explain: 'Safe means no state change at all (GET). Idempotent only means repeating the call gives the same end result. PUT changes state - it is not safe - but calling it twice with the same body produces the same final resource, so it is idempotent.'
        }
      },
      {
        id: 'apc-f1',
        part: 'field',
        title: 'API design: resources, versioning, pagination, error contracts',
        body: `<p>An API is a promise to callers you cannot see. Small, deliberate choices here decide how painful the next change will be.</p>
<p><b>Resources.</b> Name endpoints after the nouns in the domain, not the actions: <code>POST /orders</code> to create an order, not <code>/createOrder</code>. Use the standard HTTP verbs to say what is happening to that noun, and use status codes predictably, so a caller can branch on the class of the response (2xx, 4xx, 5xx) without parsing the body first.</p>
<p><b>Versioning.</b> The discipline that keeps an API changeable without breaking existing callers: add new fields rather than repurposing old ones, make new fields optional so old clients keep working unmodified, and never change what an existing field means. When a change cannot be made compatibly, expose it as a new version (a path prefix like <code>/v2/</code>, or a header) and keep the old version alive until callers have migrated off it.</p>
<p><b>Pagination.</b> Never return an unbounded list. Offset pagination (<code>?page=3</code>) is simple but breaks under concurrent inserts, since rows shift between pages and a caller can see duplicates or miss rows entirely. Cursor pagination hands back an opaque pointer derived from a stable sort key, and stays correct even while data is being written. Always cap the page size on the server, regardless of what the client asks for.</p>
<p><b>Error contract.</b> A caller needs three things from an error: a stable, machine-readable code it can branch its logic on (not just a human sentence that might be reworded later), a human-readable message for logs and debugging, and a signal for whether retrying is likely to help. A well-formed error response is part of the API's contract, exactly as much as a successful one.</p>`,
        deeper: `<p>The single most common versioning mistake is treating "optional for new clients" as good enough and skipping "does not change meaning for old ones." Repurposing a field - even one nobody seems to use - is how an API silently breaks a client nobody remembered still calls it.</p>`,
        check: {
          question: 'Why does cursor pagination usually beat offset pagination for a list that is being written to concurrently?',
          options: [
            'Cursors are always faster to compute on the server',
            'New rows inserted between page requests shift offsets, causing duplicated or skipped rows; a cursor encodes a stable position in the sort order instead',
            'Offset pagination cannot use a database index',
            'Cursors let the client request an unbounded page size'
          ],
          answer: 1,
          explain: 'An offset is positional in a result set that keeps changing underneath the reader. A cursor points at a stable position in a fixed sort order, so it stays correct while rows are inserted or removed concurrently.'
        }
      },
      {
        id: 'apc-f2',
        part: 'field',
        title: 'REST, gRPC and GraphQL: three ways to structure an API',
        body: `<p>The choice usually follows from who is calling the API and what they need, more than which style is "better" in the abstract.</p>
<p><b>REST</b> is the default for a public or browser-facing API: it maps naturally onto HTTP, is human-readable, cacheable by ordinary HTTP caches, and has the widest tooling and the widest pool of engineers who already know it. Its weakness shows up when a client needs a specific, changing combination of fields: it tends to either over-fetch (returning a large object when the caller wants three fields) or under-fetch (forcing several round trips to assemble one screen).</p>
<p><b>gRPC</b> is the common choice for calls between a company's own services, where both ends are under one team's control. Its typed schema (Protocol Buffers) catches contract mismatches at compile time rather than in production, it runs over HTTP/2 so many calls share one multiplexed connection, and it supports streaming in both directions. The cost is that it is not naturally callable from a browser without a proxy layer, and the binary format is not human-readable on the wire.</p>
<p><b>GraphQL</b> fits a single API serving many different client views over the same underlying data - a mobile app and a web app each needing a different subset of fields from the same objects. A caller asks for exactly the fields it needs in one request, solving over-fetching and under-fetching directly. The cost falls on the server: a query can look very different each time, which makes simple HTTP-level caching much harder, and an unbounded nested query can be made expensive if the server does not guard against it.</p>
<p>A useful rule of thumb: public and browser-facing, reach for REST; two backend services you own calling each other with a low latency budget, reach for gRPC; one endpoint feeding several very different client views of the same data, reach for GraphQL.</p>`,
        deeper: `<p>These are not mutually exclusive in one system: it is common to see gRPC used between internal services, with a REST or GraphQL layer at the edge translating for external or browser clients, because the constraints at the edge (must run in a browser, must be cacheable) are different from the constraints between two services you fully control.</p>`,
        check: {
          question: 'A mobile team says they fetch 20 fields per screen from a REST API but only use 3 of them, and need three separate calls to assemble one screen. Which style most directly fixes both complaints?',
          options: [
            'gRPC, because it is the fastest transport',
            'GraphQL, because the client can ask for exactly the fields it needs in a single query, fixing both the over-fetching and the multiple-round-trip problem',
            'A second REST version with more endpoints',
            'UDP, to reduce network overhead'
          ],
          answer: 1,
          explain: 'Both complaints - unused fields returned, and several calls needed for one screen - are exactly the over-fetching and under-fetching problems GraphQL is designed to remove, by letting the client specify precisely the fields it needs in one request.'
        }
      },
      {
        id: 'apc-f3',
        part: 'field',
        title: 'Transport in brief: TCP vs UDP, HTTP/2, and WebSockets',
        body: `<p>Everything in this section sits at the <b>transport layer</b>, layer 4 in the usual numbering: the part of the network stack that moves bytes between an address and a port, with no idea what those bytes mean. HTTP, and everything built on it, sits one level up at the <b>application layer</b>, layer 7, where the message has a method, a path and headers. Keeping those two apart is what makes the load-balancing choice later in this chapter a real choice rather than a pair of labels.</p>
<p><b>TCP</b> establishes a connection with a handshake, then guarantees the receiver gets every byte, in order, retransmitting anything lost. That guarantee is exactly what most application protocols, including HTTP, are built on. The cost is that a single lost packet can block everything queued behind it on that connection until it is retransmitted - head-of-line blocking at the transport layer.</p>
<p><b>UDP</b> sends packets with no handshake, no ordering guarantee, and no retransmission - the application must handle loss itself, or accept it. That trade is worthwhile when a slightly wrong or missing packet is cheaper than the delay of waiting for a perfect one: a video call frame that arrives late is often more useless than one that never arrives at all, so voice and video streaming, DNS lookups, and online games commonly choose UDP for exactly this reason.</p>
<p><b>HTTP/2</b> multiplexes many logical request streams over a single TCP connection, which removes the old need for several parallel connections per host and fixes head-of-line blocking at the HTTP layer. It does not fix TCP's own head-of-line blocking: one lost TCP packet still stalls every multiplexed stream sharing that connection, since TCP has no idea they are logically independent. HTTP/3, built on QUIC - a transport protocol that runs on top of UDP and re-implements TCP's reliability itself, one stream at a time - moves multiplexing below that layer specifically to remove this remaining blocking - worth knowing the name exists, without needing the implementation detail.</p>
<p><b>WebSockets</b> start as a normal HTTP request, then upgrade the same TCP connection into a persistent, full-duplex channel: either side can send at any time without waiting for a new request-response cycle. That fits a chat app or a live dashboard, where the server needs to push data the client did not just ask for, and it is a clear improvement over polling or long-polling, which fake the same effect with repeated requests.</p>`,
        deeper: `<p>The plain way to justify choosing UDP in an interview: name the specific thing being traded away. "I'm accepting that some video frames may simply never arrive, in exchange for never waiting on a retransmission that would arrive too late to be useful anyway" is a complete, defensible answer; "UDP is faster" on its own is not.</p>`,
        check: {
          question: 'Why might a live video call use UDP instead of TCP?',
          options: [
            'UDP guarantees packets arrive in order, which video needs',
            'A frame that arrives late from a TCP retransmission is often more useless than one that is simply dropped, so UDP\'s lack of a delivery guarantee is an acceptable trade for lower, steadier latency',
            'TCP cannot be used for anything other than web pages',
            'UDP is always more secure than TCP'
          ],
          answer: 1,
          explain: 'For real-time media, a retransmitted-but-late packet usually cannot be used anyway, so waiting for TCP\'s guarantee costs more than it is worth. UDP accepts occasional loss in exchange for not blocking on it.'
        }
      },
      {
        id: 'apc-f4',
        part: 'field',
        title: 'API gateway vs load balancer',
        body: `<p>The two are often deployed together, which is why they get confused, but they answer different questions.</p>
<p>A <b>load balancer</b> answers "which healthy replica of this one service should handle this request?" It operates at layer 4 (the transport layer: IP address and port only) or layer 7 (the application layer: the HTTP request itself) and its job is traffic distribution and health-aware routing across a set of interchangeable replicas.</p>
<p>An <b>API gateway</b> answers "which service does this request belong to, and what has to happen to it before it gets there?" It is a single front door for possibly many different backend services, and it applies cross-cutting work that has nothing to do with any one service's own logic: authenticating the caller, enforcing a rate limit, terminating TLS, transforming a request, and sometimes aggregating calls to several backend services into one response for the client.</p>
<p>In practice, a gateway usually sits in front of one or more load balancers, or has load-balancing behaviour built into it - it decides which service should handle a request, and a load balancer (its own or the target service's) then decides which specific replica of that service actually gets it. The interview-ready distinction: authentication and rate limiting belong at the gateway, because they are about the caller and apply across every service; health-aware traffic distribution across identical replicas belongs at the load balancer, because it is about one service's own capacity.</p>`,
        deeper: `<p>Many real products bundle both into one piece of software, which is exactly why it is worth being able to separate the two responsibilities in words even when they live in the same box: an interviewer is checking whether you understand the two jobs, not whether you can name a specific vendor's product.</p>`,
        check: {
          question: 'Where does per-caller rate limiting and authentication most naturally belong?',
          options: [
            'On every individual replica, duplicated across the fleet',
            'At the API gateway, since it is the single front door that sees every caller before any specific backend service does, regardless of which service or replica ends up handling the request',
            'At the load balancer, since it already inspects every request',
            'It belongs only inside the database'
          ],
          answer: 1,
          explain: 'Authentication and rate limiting are about the caller, not about any one service\'s replicas, so they belong at the single front door every request passes through before being routed onward - the gateway.'
        }
      },
      {
        id: 'apc-f5',
        part: 'field',
        title: 'Load balancing algorithms: round robin, least connections, weighted, consistent hashing, layer 4 vs layer 7, health checks',
        viz: 'l4-vs-l7-lb',
        body: `<p><b>Round robin</b> sends each new request to the next replica in a fixed rotation. It is simple and works well when replicas are the same size and requests cost about the same to serve; it works poorly when either assumption breaks, since a replica already stuck on an expensive request keeps receiving new ones at the same rate as an idle one.</p>
<p><b>Least connections</b> sends a request to whichever replica currently has the fewest open connections, adapting automatically to uneven request cost - at the price of the balancer having to track live connection counts per replica rather than just a rotation pointer.</p>
<p><b>Weighted</b> variants of either algorithm add a per-replica weight, so a bigger machine in a mixed fleet gets a proportionally larger share of requests or connections instead of an equal one.</p>
<p><b>Consistent hashing</b> maps both requests (by some key - a user id, a cache key) and replicas onto a hash ring, and sends each request to the nearest replica going around the ring. Its value shows up when replicas change: adding or removing one replica only reshuffles the small slice of keys near it on the ring, instead of remapping almost everything the way a plain hash-modulo-replica-count scheme would. It is the standard choice when the same key should keep going to the same replica, for cache locality or for a stateful connection like a WebSocket.</p>
<p><b>Layer 4 vs layer 7</b> is about how much of the request the balancer is allowed to see, and it is the same two layers the transport section named: layer 4 is the transport layer, where a connection is only an address and a port, and layer 7 is the application layer, where the HTTP message itself - method, path, headers, cookies - is readable. An L4 balancer only looks at IP address and port, which is fast and protocol-agnostic but cannot route on anything inside the request. An L7 balancer reads the actual request - path, header, cookie - and can route different paths to different backends, retry a failed request itself, and terminate TLS, at the cost of doing real CPU work per request instead of just forwarding packets.</p>
<p><b>Health checks</b> decide which replicas are even eligible to receive traffic in the first place, regardless of algorithm: a <b>readiness</b> check controls whether a replica currently gets new traffic, and a <b>liveness</b> check controls whether the replica should be restarted outright - they answer different questions and should be different endpoints, since a replica that is temporarily unable to serve is not necessarily a replica that is broken.</p>`,
        deeper: `<p>Consistent hashing is usually implemented with several virtual nodes per physical replica scattered around the ring, rather than one point per replica, specifically so that the keys going to any one replica are spread evenly rather than clumped - without virtual nodes, a replica can end up owning an unfairly large or small arc of the ring purely by the luck of where its one hash fell.</p>`,
        check: {
          question: 'A cache-serving fleet needs the same request key to keep going to the same replica, so the cache stays warm, but replicas are added and removed as load changes. Which load-balancing approach fits best?',
          options: [
            'Plain round robin, since it is simplest',
            'Consistent hashing, since it keeps the same key mapped to (nearly) the same replica and only reshuffles a small fraction of keys when the replica count changes',
            'Least connections, since it reacts fastest to load',
            'Layer 4 balancing, since it is the fastest option'
          ],
          answer: 1,
          explain: 'Consistent hashing is specifically designed for this: a key keeps going to the same replica for cache locality, and adding or removing a replica only reshuffles the keys near it on the ring rather than remapping almost everything.'
        }
      },
      {
        id: 'apc-f6',
        part: 'field',
        title: 'Retries, timeouts, idempotency keys, and exponential backoff with jitter',
        viz: 'retry-backoff-jitter',
        body: `<p>A network call can fail in a way that is genuinely ambiguous: the request might never have arrived, or it might have arrived, succeeded, and only the response was lost. A retry without a plan for that ambiguity risks doing the work twice.</p>
<p><b>Timeouts and deadlines.</b> Every remote call needs a timeout smaller than whatever time budget the caller has left, or a slow dependency can hold a thread open indefinitely. A deadline is the sharper version: the caller states a total time budget, and each hop passes on whatever remains, so a hop with nothing left simply fails fast instead of doing work nobody will wait for.</p>
<p><b>What is safe to retry.</b> A safe or idempotent operation (GET, PUT, DELETE) can be retried outright, since repeating it changes nothing about the outcome. A non-idempotent operation (a plain POST, like "charge this card") needs an <b>idempotency key</b> - a value the caller generates once and attaches to every attempt of that logical operation - so the server can recognise a retry as the same request and return the original result instead of doing the work again.</p>
<p><b>Exponential backoff with jitter.</b> Retrying instantly after a failure just adds to whatever load already caused it. Backoff waits longer after each attempt, typically doubling the delay: with a 100 ms base, the fourth retry's unjittered wait is 100 x 2^3 = 800 ms, usually capped at some maximum. Without <b>jitter</b>, every client that failed at the same moment retries at the same moment again, turning a brief blip into a synchronised wave; jitter picks the actual delay randomly within that window - for example, anywhere from 0 up to the capped backoff value - so retries spread out in time instead of arriving together.</p>
<p><b>A retry budget.</b> Even with backoff and jitter, retries add load precisely when a dependency is already struggling. Capping the fraction of total traffic that is allowed to be retries prevents a failing dependency from receiving several times its normal load at its worst moment.</p>`,
        deeper: `<p>The arithmetic worth being able to say out loud: if every client retries up to three times on failure with no budget, a dependency that starts failing can suddenly face up to four times its normal request rate - the original attempt plus three retries - at exactly the moment it has the least spare capacity. Backoff spreads that load out in time, jitter stops it from being synchronised, and a retry budget caps the total; most systems implement the first and rarely the third, which is why naming the retry budget stands out.</p>`,
        check: {
          question: 'What specific problem does jitter fix that exponential backoff alone does not?',
          options: [
            'Jitter makes each individual retry succeed with higher probability',
            'Backoff alone still lets every client that failed at the same instant retry at the same instant again; jitter randomises the exact wait so retries spread out over time instead of arriving as a synchronised wave',
            'Jitter removes the need for a timeout',
            'Jitter is only relevant for idempotent operations'
          ],
          answer: 1,
          explain: 'Backoff controls how long the average wait grows; it says nothing about many clients that failed together retrying together. Jitter adds randomness to the exact delay so those clients spread out instead of hitting the dependency in a synchronised wave.'
        }
      },
      {
        id: 'apc-f7',
        part: 'field',
        title: 'Batching and backpressure',
        viz: 'backpressure',
        body: `<p><b>Batching</b> groups several small units of work into one larger call, spreading a fixed per-call cost across all of them - fewer database round trips for a bulk write, fewer external API calls to respect a third-party rate limit, more efficient use of a GPU by processing several inference requests together. The cost is a batching window: work sits waiting for the batch to fill (or a timer to expire) before it is sent, trading a small amount of added latency for a real gain in throughput and cost per unit of work.</p>
<p><b>Backpressure</b> is what a saturated component must do instead of silently accepting more work than it can handle: tell its caller to slow down, or reject the excess outright, rather than letting a queue grow without bound. A bounded queue with rejection is backpressure; an unbounded queue is its absence, and it is a dangerous absence, because it turns overload into a latency problem that is invisible until it has already become a crisis - work keeps being accepted, but the time to get to it keeps growing, with nothing visibly failing until the delay itself becomes unacceptable.</p>
<p><b>How it shows up concretely.</b> A saturated API returns 429 (rate limited) or 503 (unavailable), ideally with a retry-after hint, rather than silently queueing every request indefinitely. A message queue's consumer signals how much work it can currently accept rather than the producer pushing blindly. And the signal should propagate: a component that is itself being backpressured by something downstream should pass that pressure upstream to its own callers, rather than absorbing it into an ever-growing internal queue and hiding the problem one more hop back.</p>`,
        deeper: `<p>The reason backpressure is worth treating as a design decision in its own right rather than an implementation detail: a system with real backpressure fails loudly and immediately at the point of saturation, which is diagnosable, while a system without it fails quietly and later, somewhere else entirely, which is not.</p>`,
        check: {
          question: 'A queue between a producer and a slower consumer is unbounded. What is the actual risk this creates?',
          options: [
            'The queue will reject work once it is full, protecting the consumer',
            'The queue keeps accepting work with no limit, so latency for anything in the queue grows silently and without bound until it becomes a crisis, instead of the producer getting an early, visible signal to slow down',
            'Unbounded queues always run out of memory immediately',
            'There is no risk, since a queue always protects the consumer from overload'
          ],
          answer: 1,
          explain: 'An unbounded queue hides overload rather than showing it: nothing fails, but the time to get through the queue keeps growing, invisibly, until the delay itself is the incident. A bounded queue with rejection turns that into an immediate, visible signal instead.'
        }
      },
      {
        id: 'apc-f8',
        part: 'field',
        title: 'Tail latency: p99, hedged requests, and load shedding',
        viz: 'tail-latency-hedge',
        body: `<p>An average latency hides exactly the requests a real user notices. <b>Tail latency</b> - usually reported as p99 or p999 - is the latency of the slowest fraction of requests, and at scale it matters far more than it looks like it should.</p>
<p><b>Why fan-out makes it worse.</b> Suppose one backend server answers slowly only 1% of the time on its own - a 99% chance of being fast for any single call. If a single user request fans out to 100 such servers and needs all 100 to answer quickly, the chance that <i>none</i> of them is slow is 0.99^100 ≈ 0.37, so the request as a whole is slow roughly 1 - 0.37 ≈ 63% of the time - even though each individual server is fast 99% of the time. A rare individual problem becomes an ordinary experience once enough calls have to fan out and all succeed quickly together.</p>
<p><b>Hedged requests</b> are one direct mitigation: send the request to one replica, and if the response has not come back after a short wait (often set around the typical, p50-ish latency), send a second, duplicate request to a different replica - then use whichever response comes back first and discard the other. This trades a modest amount of extra load for a meaningfully better tail, and it only works when the two attempts are genuinely independent (different replicas, ideally not sharing whatever caused the first one to be slow).</p>
<p><b>Load shedding</b> is the last-resort response to real overload, rather than to ordinary tail variance: when a system cannot serve every request within its target, it deliberately rejects or degrades lower-priority work first - an optional personalisation step, a non-critical background job - so that the requests that matter most still meet their target instead of everything degrading together.</p>`,
        deeper: `<p>The fan-out arithmetic above is the core argument in "The Tail at Scale" (see readings): the more independent calls a single user-facing request depends on, the more that request's own latency is dominated by whichever one of those calls happens to be slowest, not by the typical case for any one of them. That is exactly why tail latency, not average latency, is the number worth designing against once a system has any real fan-out in it.</p>`,
        check: {
          question: 'A single user request fans out to 50 backend calls, each of which is slow 2% of the time on its own, independently. Roughly how often is the overall request slow (needing all 50 to be fast)?',
          options: [
            'About 2%, the same as any one backend',
            'About 1 - 0.98^50 ≈ 64%, because the chance that all 50 independent calls are fast is 0.98^50 ≈ 0.36',
            '100%, since 50 calls guarantees a slow one',
            'Exactly 50 x 2% = 100%'
          ],
          answer: 1,
          explain: 'The chance all 50 independent calls are fast is 0.98^50 ≈ 0.36, so the chance at least one is slow - making the overall request slow - is about 1 - 0.36 ≈ 64%. Fan-out compounds an individually rare slowdown into a common one.'
        }
      }
    ],
    connect: null,
    activities: [
      {
        id: 'apc-a1',
        type: 'design',
        title: 'Design the retry and idempotency strategy for a payments API',
        prompt: `"Our checkout service calls a payments service to charge a card, over a network that occasionally drops responses. Walk me through exactly how you'd make retries safe here, including what should happen if the checkout client itself times out and the customer clicks 'pay' again."`,
        timeboxSec: 1200,
        rubric: `Marking guide, out of 10. (1) Identifies that a charge is not naturally idempotent and that retrying it blindly risks a double charge. (2) Proposes a client- or checkout-service-generated idempotency key attached to every attempt of the same logical charge, with the payments service storing seen keys and returning the original result on a repeat. (3) States that the key and the charge must be recorded together, atomically, or the race just moves rather than disappearing. (4) Distinguishes the checkout-to-payments retry (safe, with the idempotency key) from the customer clicking "pay" again after their own client times out - and proposes the client reuse the same idempotency key for that resubmission rather than generating a new one, so a customer-level retry is also caught. (5) Names timeouts smaller than the checkout flow's own budget, with a deadline that propagates. (6) Names exponential backoff with jitter for the service-to-service retry, and states why jitter matters (avoiding synchronised retries). (7) Proposes a bounded number of retries or a retry budget rather than retrying indefinitely. (8) Addresses the ambiguous outcome directly: if the response is lost but the charge succeeded, the idempotency key is what prevents a second charge on retry, rather than assuming failure always means "nothing happened." (9) Mentions circuit-breaking or failing fast to a clear error once retries are exhausted, rather than leaving the customer waiting indefinitely. (10) Stays concrete rather than restating vocabulary. Deduct for: recommending retries on the charge call with no idempotency mechanism at all; treating "the client can just retry" as automatically safe; no mention of the double-submission case from the customer's own client. {{HONESTY}}`,
        model: `"The core problem is that charging a card is not naturally idempotent, and a lost response doesn't tell you whether the charge happened - so a blind retry risks a double charge, which is worse than a failed one.

I'd have the checkout service generate an idempotency key once per logical checkout attempt, and attach it to every call to the payments service for that attempt, including retries. The payments service stores the key together with the outcome in the same atomic write as the charge itself, so a repeated call with the same key returns the original stored result instead of charging again - storing them separately would just move the race rather than close it.

For the network-level retry between checkout and payments, I'd use a short timeout - well inside the checkout flow's overall budget - with exponential backoff and jitter, capped at two or three attempts, so a blip doesn't turn into the customer waiting a long time, and so a burst of simultaneous failures doesn't retry in lockstep and pile more load onto an already struggling payments service.

The case I'd make sure to cover explicitly is the customer's own client timing out and them clicking 'pay' again. That's a retry too, just at a different layer, and it needs the same protection: the checkout client should reuse the same idempotency key for that resubmission rather than generating a fresh one, so it's caught by the exact same mechanism as a network-level retry, and the customer never gets charged twice just because their own connection was slow.

If retries are exhausted, I'd fail fast with a clear, honest error rather than leaving the customer staring at a spinner - and I'd log the ambiguous case for reconciliation, because even a well-designed idempotency scheme should be checked against, not just trusted blindly, for a system handling real money."`
      },
      {
        id: 'apc-a2',
        type: 'formulate',
        title: 'Choose a load-balancing algorithm for a stateful WebSocket service',
        prompt: `A chat service keeps a persistent WebSocket connection per user, and each replica holds some in-memory state about the connections it owns. Which load-balancing algorithm would you use to route new connections, and would you use layer 4 or layer 7? Justify the choice.`,
        timeboxSec: 300,
        rubric: `Must-haves: (1) recognises that a persistent, stateful connection makes plain round robin or least connections a poor fit on their own, since the concern here is not spreading requests but placing a long-lived connection somewhere consistent; (2) proposes consistent hashing (typically on a user or session id) so a given user's reconnect attempts, or any routing based on their id, go somewhere predictable, or explicitly justifies routing state living at the gateway/connection layer instead; (3) chooses layer 7 and justifies it - a WebSocket upgrade starts as an HTTP request, and L7 can read the request to make an informed routing or authentication decision at connection time, whereas L4 cannot; (4) notes that once the WebSocket is established, the balancer's job for that connection is mostly done, since the connection stays pinned to one replica for its lifetime, unlike a stream of independent short-lived requests. Common mistakes: proposing round robin with no acknowledgement that it ignores the long-lived nature of the connection; choosing L4 with no justification; ignoring what happens on reconnect. {{HONESTY}}`,
        model: `"Because each connection is long-lived and each replica holds in-memory state about the connections it owns, this isn't really a 'spread the next request evenly' problem the way plain round robin or least connections assume - it's a 'place this connection somewhere and keep it there' problem.

I'd lean toward layer 7, since establishing a WebSocket starts as a normal HTTP request with an upgrade header, and I want to be able to read that request - check auth, maybe route based on a user id - before deciding which replica gets the long-lived connection. Layer 4 can't see any of that.

For the algorithm, if I need a given user's connection attempts to go somewhere predictable - useful if there's any per-user state cached at the edge, or if I want reconnects to have a chance of hitting the same replica - I'd use consistent hashing on the user id rather than round robin or least connections, since round robin has no concept of 'this key should go where it went before' and would scatter one user's reconnects across the fleet for no benefit.

Once the connection is established, the load balancer's decision is essentially done for that connection's lifetime - it's pinned to one replica until it disconnects, which is different from a stream of independent short HTTP requests. So the algorithm choice matters most at connection time, and I'd focus the design effort there rather than trying to rebalance already-open connections."`
      },
      {
        id: 'apc-a3',
        type: 'followup',
        title: 'Interview question: REST vs gRPC vs GraphQL - which one and why',
        prompt: `An interviewer asks: "When would you reach for REST versus gRPC versus GraphQL?" Answer in first person, in about 90 seconds.`,
        timeboxSec: 120,
        rubric: `Must-haves: (1) REST correctly tied to public or browser-facing APIs, citing cacheability, human-readability, or tooling as the reason; (2) gRPC correctly tied to internal service-to-service calls where both ends are owned by the same team, citing the typed schema, HTTP/2, or low latency as the reason; (3) GraphQL correctly tied to one API serving several different client views over the same data, naming over-fetching or under-fetching as the specific problem it solves; (4) at least one real cost of GraphQL named (caching difficulty, or the risk of an expensive nested query) or one real cost of gRPC named (not natively browser-callable, not human-readable on the wire); (5) bases the choice on who is calling and what they need, rather than declaring one style universally best. Common mistakes: naming only one style; declaring a universal favourite with no situational reasoning; describing GraphQL as a transport rather than a query language over an existing transport. {{HONESTY}}`,
        model: `"It mostly comes down to who's calling the API and what they need from it, more than one style being objectively best.

For a public or browser-facing API, I reach for REST by default - it maps naturally onto HTTP, it's human-readable, it's cacheable with ordinary HTTP caching, and it has the widest tooling, so most callers already know how to work with it.

For calls between my own services, where I control both ends, I'd reach for gRPC. The typed schema from Protocol Buffers catches a contract mismatch at compile time instead of in production, and it runs over HTTP/2 so a lot of calls share one connection efficiently - which matters when latency budgets between internal services are tight. The trade-off is it's not naturally callable from a browser without a proxy, and the wire format isn't human-readable, which makes ad hoc debugging a bit harder.

If I've got one API serving genuinely different client views of the same data - say a mobile app and a web dashboard each needing a different slice of the same objects - I'd reach for GraphQL, because the client can ask for exactly the fields it needs instead of over-fetching a fixed REST response or making several round trips to assemble one screen. The cost falls on the server side: a query can look different every time, which makes simple caching much harder, and I'd need to guard against an expensive, deeply nested query being sent by an over-eager client.

In practice I've seen these combined - gRPC internally, with REST or GraphQL at the edge translating for external and browser clients - because the constraints at the edge are genuinely different from the constraints between two services I fully control."`
      }
    ],
    sayQuestion: null,
    sayItOutLoud: null,
    readings: [
      { l: 'Timeouts, retries and backoff with jitter (Amazon Builders\' Library)', u: 'https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/', w: 'The clearest production account of why naive retries cause outages, and exactly how backoff and jitter fix it - written by engineers who have been paged for the failure mode.', m: 20 },
      { l: 'The Tail at Scale (Dean and Barroso)', u: 'https://www.barroso.org/publications/TheTailAtScale.pdf', w: 'The paper this chapter\'s fan-out arithmetic comes from, including hedged requests as a concrete mitigation, from two of the engineers who ran Google\'s infrastructure.', m: 30 },
      { l: 'Introduction to gRPC (official docs)', u: 'https://grpc.io/docs/what-is-grpc/introduction/', w: 'The primary source on what gRPC actually is and how Protocol Buffers fit into it, from the project itself.', m: 12 },
      { l: 'PRIMER: Introduction to GraphQL', u: 'https://graphql.org/learn/', w: 'The official, short explanation of why GraphQL exists and how a query maps to exactly the fields a client asked for.', m: 15 },
      { l: 'NGINX: HTTP load balancing methods', u: 'https://docs.nginx.com/nginx/admin-guide/load-balancer/http-load-balancer/', w: 'A real load balancer\'s documentation of round robin, least connections, IP hash and health checks, described precisely rather than abstractly.', m: 15 },
      { l: 'PRIMER: WebSockets API (MDN)', u: 'https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API', w: 'The standard reference for what a WebSocket connection actually is and how the upgrade from HTTP works.', m: 10 },
      { l: 'PRIMER: What is UDP? (Cloudflare Learning)', u: 'https://www.cloudflare.com/learning/ddos/glossary/user-datagram-protocol-udp/', w: 'A short, plain explanation of UDP and why it trades reliability for speed, useful right after reading about TCP.', m: 6 },
      { l: 'Video: REST vs gRPC in Microservices - Which One Should You Use?', u: 'https://www.youtube.com/watch?v=AMNWLz_f6qM', w: 'A worked comparison of the two styles with the trade-offs stated concretely rather than as a checklist.', m: 12 }
    ],
    glossary: [
      {
        g: 'APIs, load balancing and communication',
        sub: '',
        rows: [
          ['Idempotent method', 'Doing it twice has the same effect as once; PUT and DELETE qualify, plain POST does not', 'API design'],
          ['Cursor pagination', 'A stable pointer to the last item seen, correct under concurrent inserts unlike an offset', 'API design'],
          ['gRPC', 'A binary RPC framework over HTTP/2 using Protocol Buffers, typical for internal service calls', 'API styles'],
          ['GraphQL', 'A query language letting the caller ask for exactly the fields it needs from one endpoint', 'API styles'],
          ['Head-of-line blocking', 'One lost or slow item blocks everything queued behind it on the same channel', 'transport'],
          ['Consistent hashing', 'Maps requests and replicas onto a ring so scaling reshuffles only a small fraction of keys', 'load balancing'],
          ['Layer 4 vs layer 7', 'L4 sees only IP and port; L7 reads the request and can route, retry, or terminate TLS', 'load balancing'],
          ['Idempotency key', 'A caller-supplied value letting a retried request be recognised and never applied twice', 'reliability'],
          ['Exponential backoff', 'Waiting longer, typically doubling, after each failed retry', 'reliability'],
          ['Jitter', 'Randomising the exact backoff delay so synchronised clients do not retry in lockstep', 'reliability'],
          ['Backpressure', 'A saturated component telling callers to slow down or accept rejection, instead of queueing without bound', 'overload handling'],
          ['Tail latency', 'The latency of the slowest fraction of requests (p99, p999), hidden by an average', 'performance'],
          ['Hedged request', 'A duplicate request sent to a second replica after a short wait, using whichever answers first', 'performance'],
          ['Load shedding', 'Deliberately rejecting or degrading lower-priority work under overload so the rest meets its target', 'overload handling']
        ]
      }
    ]
  };

}(typeof window !== 'undefined' ? window : this));
