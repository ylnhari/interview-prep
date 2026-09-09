// The public course. It is a pack like any other, but it carries no candidate record and no
// employer research: every chapter comes from core/library.js, the honesty rule is neutral, and
// every reading is a public primary source. Personal packs live in packs/<private>/ with an
// overlays.js that splices their own material into these same chapters. See docs/content-schema.md.
window.PREP_CONTENT = {
  meta: {
    id: "course",
    title: "Interview Prep Course",
    eyebrow: "ML & software engineering interviews",
    heading: "The course",
    footer: "Progress is saved in this browser; export it from the header to carry it to another device."
  },

  honesty: "Honesty rule: grade on correctness and reasoning; when the answer claims specific production experience, mark it unverified rather than assumed.",

  interviewAt: null,

  groups: [
    { id: "start", label: "Start here", sub: "what the course is, and the order to take it in", ids: ["start-here"] },
    {
      id: "track1", label: "Track 1 · System design fundamentals",
      sub: "the generic half of every answer: balancers, caches, stores, queues, overload",
      ids: ["system-design-fundamentals"]
    },
    {
      id: "track2", label: "Track 2 · Production ML systems",
      sub: "the lifecycle, the feature layer, the latency budget, and staying up and correct",
      ids: ["ml-lifecycle-platform", "data-features", "serving-and-scale", "reliability-ops"]
    },
    {
      id: "track3", label: "Track 3 · Decision systems",
      sub: "forecasting under uncertainty, constrained optimisation, control loops, and when to learn a policy",
      ids: ["forecasting-uq", "or-tooling", "control-theory", "rl-judgment"]
    },
    {
      id: "track4", label: "Track 4 · GenAI in production",
      sub: "serving economics, guardrails, retrieval, and the fast conceptual AI round",
      ids: ["genai-platform"]
    },
    {
      id: "track5", label: "Track 5 · Practice",
      sub: "scenarios, coding drills, and a hundred questions to self-test against",
      ids: ["scenario-questions", "coding-drills", "question-bank-fundamentals", "question-bank-mle"]
    }
  ],

  useCore: [
    "system-design-fundamentals",
    "ml-lifecycle-platform",
    "data-features",
    "serving-and-scale",
    "reliability-ops",
    "forecasting-uq",
    "or-tooling",
    "control-theory",
    "rl-judgment",
    "genai-platform",
    "scenario-questions",
    "coding-drills",
    "question-bank-fundamentals",
    "question-bank-mle"
  ],

  // A public course carries no candidate-specific or employer-specific material.
  overlays: {},

  interviewer: null,

  readings: {
    "system-design-fundamentals": [
      { l: "The System Design Primer", u: "https://github.com/donnemartin/system-design-primer", w: "The best free reference for the generic vocabulary: load balancing, caching, sharding, replication, CAP, queues, consistency. Read the index, then the caching and database sections properly.", m: 60 },
      { l: "PRIMER: Circuit Breaker", u: "https://martinfowler.com/bliki/CircuitBreaker.html", w: "The clearest short definition of the pattern, including the half-open state most answers forget.", m: 10 },
      { l: "Caching strategies and best practices", u: "https://aws.amazon.com/caching/best-practices/", w: "Cache-aside, read-through and write-through side by side, with the invalidation consequences of each.", m: 12 },
      { l: "Amazon Builders' Library", u: "https://aws.amazon.com/builders-library/", w: "Read the timeouts, retries and backoff article and the load shedding article. Two of these are worth more than a textbook chapter.", m: 40 },
      { l: "Kubernetes: Ingress", u: "https://kubernetes.io/docs/concepts/services-networking/ingress/", w: "The layer-7 routing object behind every \"how does a request reach my service\" answer.", m: 15 },
      { l: "Google SRE book: table of contents", u: "https://sre.google/sre-book/table-of-contents/", w: "Read the load balancing chapters and the chapter on addressing cascading failures for the language of backpressure and graceful degradation.", m: 45 }
    ],
    "ml-lifecycle-platform": [
      { l: "Google: Rules of Machine Learning", u: "https://developers.google.com/machine-learning/guides/rules-of-ml", w: "The canonical checklist for shipping and operating ML. Rules 1 to 15 carry the pipeline-before-model argument.", m: 35 },
      { l: "Hidden Technical Debt in Machine Learning Systems (NeurIPS 2015)", u: "https://papers.nips.cc/paper/2015/hash/86df7dcfd896fcaf2674f757a2463eba-Abstract.html", w: "Where \"the model is a small box in a large diagram\" comes from. Read it for glue code, pipeline jungles and entanglement.", m: 25 },
      { l: "MLOps: continuous delivery and automation pipelines in machine learning", u: "https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning", w: "The standard maturity-level model for the lifecycle, and a good source for stage names.", m: 30 },
      { l: "Argo CD documentation", u: "https://argo-cd.readthedocs.io/en/stable/", w: "What a GitOps reconciliation controller actually does, in the words of the controller itself.", m: 15 }
    ],
    "data-features": [
      { l: "PRIMER: Feast concepts - feature views", u: "https://docs.feast.dev/getting-started/concepts/feature-view", w: "The vocabulary a feature-store question is scored against: entity, feature view, online and offline store.", m: 12 },
      { l: "Feast: feature store concepts", u: "https://docs.feast.dev/getting-started/concepts", w: "Entity, feature view, online store, offline store, point-in-time join, in the open-source vocabulary everyone borrows.", m: 18 },
      { l: "Apache Beam: streaming pipeline basics", u: "https://beam.apache.org/documentation/basics/", w: "Event time against processing time, windows and watermarks, from the model that defined the terms.", m: 20 },
      { l: "Apache Beam programming guide", u: "https://beam.apache.org/documentation/programming-guide/", w: "The windowing, watermark and triggering sections, for the exact words to use about late data.", m: 30 },
      { l: "Google: Rules of Machine Learning", u: "https://developers.google.com/machine-learning/guides/rules-of-ml", w: "Read the training-serving skew rules specifically. They are the shortest correct statement of the problem.", m: 15 }
    ],
    "serving-and-scale": [
      { l: "Horizontal Pod Autoscaling", u: "https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/", w: "What HPA measures, how the stabilisation window works, and why it cannot create nodes.", m: 18 },
      { l: "Google SRE book: service level objectives", u: "https://sre.google/sre-book/service-level-objectives/", w: "SLI, SLO, error budget, and why you pick percentiles rather than means. The latency material assumes this vocabulary.", m: 20 },
      { l: "Amazon Builders' Library", u: "https://aws.amazon.com/builders-library/", w: "The load shedding and the timeouts-and-retries articles are the shortest correct statements of two things you will be asked to defend.", m: 25 }
    ],
    "reliability-ops": [
      { l: "PRIMER: Service level objectives", u: "https://sre.google/sre-book/service-level-objectives/", w: "Indicator, objective, agreement and error budget, defined once and correctly.", m: 25 },
      { l: "Implementing SLOs", u: "https://sre.google/workbook/implementing-slos/", w: "How to choose a window and a percentile, and what to do when the budget is spent.", m: 30 },
      { l: "Hidden Technical Debt in Machine Learning Systems (NeurIPS 2015)", u: "https://papers.nips.cc/paper/2015/hash/86df7dcfd896fcaf2674f757a2463eba-Abstract.html", w: "Feedback loops, undeclared consumers and CACE - the failure modes an ML reliability question is really about.", m: 25 }
    ],
    "forecasting-uq": [
      { l: "PRIMER: Hyndman and Athanasopoulos - what can be forecast?", u: "https://otexts.com/fpp3/what-can-be-forecast.html", w: "The whole vocabulary of the field in ten minutes: horizon, time series, seasonality, point against interval.", m: 10 },
      { l: "PRIMER: Hyndman - evaluating point forecast accuracy", u: "https://otexts.com/fpp3/accuracy.html", w: "MAE, MAPE, RMSE and MASE, and what each one hides. These are the metrics you will be asked to name and defend.", m: 8 },
      { l: "Hyndman - prediction intervals", u: "https://otexts.com/fpp3/prediction-intervals.html", w: "Short, authoritative, and exactly the intervals-not-points language.", m: 12 },
      { l: "Hyndman - time-series cross-validation (rolling origin)", u: "https://otexts.com/fpp3/tscv.html", w: "How to backtest honestly, and why a single split tells you almost nothing.", m: 8 },
      { l: "A Gentle Introduction to Conformal Prediction (Angelopoulos and Bates), Section 1", u: "https://arxiv.org/abs/2107.07511", w: "The calibration-set recipe and the coverage guarantee in a few pages. Note the exchangeability caveat for time series.", m: 20 },
      { l: "Simple linear regression: confidence and prediction intervals", u: "https://en.wikipedia.org/wiki/Simple_linear_regression#Confidence_intervals", w: "The formula behind the oldest interval in the business, so you can say precisely which of the two you are quoting.", m: 12 },
      { l: "Jackknife resampling", u: "https://en.wikipedia.org/wiki/Jackknife_resampling", w: "The correct name for refitting with one observation dropped at a time, and how it differs from a bootstrap.", m: 6 }
    ],
    "or-tooling": [
      { l: "PRIMER: Mathematical optimization (first two sections)", u: "https://en.wikipedia.org/wiki/Mathematical_optimization", w: "Decision variables, objective, constraints, feasible against optimal. Five minutes, no equations needed.", m: 6 },
      { l: "PRIMER: OR-Tools overview", u: "https://developers.google.com/optimization/introduction", w: "The model-against-solver idea, and the list of engines a toolkit can call.", m: 6 },
      { l: "PRIMER: Integer programming (intro)", u: "https://en.wikipedia.org/wiki/Integer_programming", w: "What LP and MIP are, and why integer variables make problems hard. Intro paragraphs only.", m: 8 },
      { l: "Constraint programming and CP-SAT", u: "https://developers.google.com/optimization/cp", w: "What CP is, how it differs from LP and MIP, and why it suits scheduling.", m: 6 },
      { l: "PRIMER: Metaheuristic (intro)", u: "https://en.wikipedia.org/wiki/Metaheuristic", w: "The umbrella term for simulated annealing, genetic algorithms and tabu search: good solutions without proof.", m: 5 },
      { l: "Simulated annealing", u: "https://en.wikipedia.org/wiki/Simulated_annealing", w: "Acceptance rule, cooling schedule, and the relation to Metropolis-Hastings. Skip the proofs.", m: 15 },
      { l: "Solving an assignment problem (MIP)", u: "https://developers.google.com/optimization/assignment/assignment_example", w: "The binary x[i][j] formulation you should be able to write cold.", m: 10 },
      { l: "Vehicle routing with time windows", u: "https://developers.google.com/optimization/routing/vrptw", w: "The canonical routing model, with the constraints stated crisply.", m: 15 },
      { l: "Employee scheduling with CP-SAT", u: "https://developers.google.com/optimization/scheduling/employee_scheduling", w: "The same problem class solved exactly, to contrast with a metaheuristic approach.", m: 15 },
      { l: "Local-search options in a routing solver", u: "https://developers.google.com/optimization/routing/routing_options", w: "Guided local search, simulated annealing, tabu, and time limits, as a solver actually exposes them.", m: 8 },
      { l: "CVXPY: what is CVXPY?", u: "https://www.cvxpy.org/tutorial/intro/index.html", w: "Enough to place it: a modeling language for convex problems, not a solver.", m: 8 },
      { l: "Gurobi Optimizer overview", u: "https://www.gurobi.com/solutions/gurobi-optimizer/", w: "Enough to place it: a commercial LP and MIP engine you would call through a modeling layer.", m: 5 }
    ],
    "control-theory": [
      { l: "PRIMER: Feedback (intro only)", u: "https://en.wikipedia.org/wiki/Feedback", w: "The one idea everything else builds on: output measured and fed back into the next decision.", m: 4 },
      { l: "Control theory: open-loop and closed-loop control", u: "https://en.wikipedia.org/wiki/Control_theory#Open-loop_and_closed-loop_(feedback)_control", w: "Skip everything with an equation. You need the words: plant, setpoint, feedback, disturbance, stability.", m: 8 },
      { l: "Kubernetes HPA: algorithm details", u: "https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/#algorithm-details", w: "A feedback controller with damping, written entirely in software terms. Read the stabilisation window.", m: 8 },
      { l: "OPTIONAL, after the chapter: Model predictive control (overview only)", u: "https://en.wikipedia.org/wiki/Model_predictive_control", w: "Only to recognise the name for the forecast-optimise-re-solve loop. Do not study it.", m: 6 }
    ],
    "rl-judgment": [
      { l: "PRIMER: Reinforcement learning (intro)", u: "https://en.wikipedia.org/wiki/Reinforcement_learning", w: "Agent, environment, state, action, reward, policy - the vocabulary before the book.", m: 8 },
      { l: "Multi-armed and contextual bandits", u: "https://en.wikipedia.org/wiki/Multi-armed_bandit", w: "The cheaper-than-RL option that covers most industrial decisions.", m: 8 },
      { l: "Sutton and Barto, Reinforcement Learning: An Introduction - Chapter 1 and 3.1 to 3.3", u: "http://incompleteideas.net/book/the-book-2nd.html", w: "The canonical MDP vocabulary. Read only the introduction and the MDP definition.", m: 30 }
    ],
    "genai-platform": [
      { l: "OWASP Top 10 for LLM Applications", u: "https://owasp.org/www-project-top-10-for-large-language-model-applications/", w: "The guardrail vocabulary: prompt injection, insecure output handling, data leakage.", m: 20 },
      { l: "vLLM documentation", u: "https://docs.vllm.ai/en/latest/", w: "Continuous batching and paged attention, the two main factors behind most LLM throughput answers.", m: 15 },
      { l: "Google: Rules of Machine Learning", u: "https://developers.google.com/machine-learning/guides/rules-of-ml", w: "Nothing in it is about LLMs, which is the point: the platform obligations do not change when the model changes.", m: 15 }
    ],
    "scenario-questions": [
      { l: "Google SRE book: table of contents", u: "https://sre.google/sre-book/table-of-contents/", w: "Read effective troubleshooting, emergency response and postmortem culture. Scenario answers score on that structure: contain, diagnose, fix, prevent.", m: 40 },
      { l: "Amazon Builders' Library", u: "https://aws.amazon.com/builders-library/", w: "Concrete accounts of what actually goes wrong under load, which is where scenario prompts come from.", m: 25 }
    ],
    "coding-drills": [
      { l: "Python heapq documentation", u: "https://docs.python.org/3/library/heapq.html", w: "Top-k, streaming selection and merge patterns. Know nlargest, heappushpop and heapreplace without looking them up.", m: 15 },
      { l: "PostgreSQL: window functions tutorial", u: "https://www.postgresql.org/docs/current/tutorial-window.html", w: "The shortest correct explanation of OVER, PARTITION BY and frames - the one SQL topic that reliably appears.", m: 20 }
    ],
    "question-bank-fundamentals": [
      { l: "PRIMER: Hyndman - evaluating point forecast accuracy", u: "https://otexts.com/fpp3/accuracy.html", w: "Roughly a third of the forecasting answers here restate one of these pages. Read it before self-testing.", m: 8 },
      { l: "PRIMER: OR-Tools overview", u: "https://developers.google.com/optimization/introduction", w: "The model-against-solver split behind most of the optimisation answers in this bank.", m: 6 }
    ],
    "question-bank-mle": [
      { l: "Google: Rules of Machine Learning", u: "https://developers.google.com/machine-learning/guides/rules-of-ml", w: "Roughly a third of the answers in this bank are a restatement of one of these rules. Read it once before self-testing so you know which.", m: 35 }
    ]
  },

  glossary: [
    {
      g: "Optimisation and operations research",
      sub: "The words a formulation question is scored against. Column three says where each term typically shows up.",
      rows: [
        ["Decision variable", "The thing you get to choose; the unknown the solver fills in. Binary variables encode yes/no decisions.", "Any assignment, selection or scheduling problem.", "\"x[i][j] is binary, one if task i goes to worker j\""],
        ["Objective function", "The single number being minimised or maximised. Where the business trade-off actually gets written down.", "Every optimisation prompt; the units are the part that gets probed.", "\"minimise expected handle time in minutes, weighted by priority\""],
        ["Hard against soft constraint", "Hard must hold or the answer is invalid; soft is a preference violated at a price, via a slack variable penalised in the objective.", "The follow-up to every formulation question.", "\"I would make capacity soft with a steep penalty, so a bad day returns a plan rather than infeasible\""],
        ["LP / MIP / CP-SAT", "Continuous and linear; the same with integer or binary variables; a constraint-programming engine strong on logical and scheduling structure.", "Naming the problem class before you model it.", "\"binaries with a linear cost, so this is a MIP - CP-SAT is a reasonable engine too\""],
        ["Optimality gap", "How much better the true optimum could be, measured against a relaxation bound. Exact solvers report it; metaheuristics do not.", "Whenever you say you stopped the solver early.", "\"stop at a 2 percent gap or the time limit, whichever comes first\""],
        ["Metaheuristic", "A general strategy for escaping local optima: simulated annealing, genetic algorithms, tabu search, guided local search.", "Large routing and scheduling instances under a clock.", "\"guided local search under a time limit, and I take the best feasible solution\""],
        ["Simulated annealing", "Accept a worse move with a probability set by how much worse it is and by a temperature that cools over the run.", "Large combinatorial scheduling; a common interview explain-it question.", "\"a Monte Carlo search over schedules with a cooling schedule\""],
        ["Warm start", "Seed the solver with the previous solution so it starts from something good and stays close to it.", "Any daily or hourly re-solve.", "\"warm start from yesterday's plan, for speed and for continuity\""],
        ["Time limit", "A wall-clock budget after which the solver returns its best feasible answer. On a decision with a deadline it is part of the specification.", "Dispatch, staffing and any plan with a publish time.", "\"a proven optimum after the deadline is worth nothing\""],
        ["VRP / VRPTW", "Vehicle routing, with time windows: assign stops to vehicles and order them under capacity and time constraints. NP-hard.", "The standard worked example for metaheuristics.", "\"a capacitated VRP with time windows, solved daily\""],
        ["Stochastic and robust optimisation", "Optimise against demand scenarios or against a worst case, rather than against one point forecast.", "Whenever a forecast feeds a plan.", "\"plan against a service-level quantile, not the mean\""]
      ]
    },
    {
      g: "Forecasting and uncertainty",
      sub: "Intervals, not points. Column three says where each term typically shows up.",
      rows: [
        ["Point forecast", "A single predicted value per horizon step.", "The default output of any regression or boosted-tree forecaster.", "\"a point forecast, with no error bar attached to it\""],
        ["Prediction interval", "A range for a single future outcome with a stated probability. Carries parameter uncertainty plus residual noise.", "Anything a plan or a solver consumes.", "\"a 90 percent prediction interval, not a confidence interval\""],
        ["Confidence interval for the mean", "A range for where the average outcome sits, carrying only parameter uncertainty. Always the narrower of the two.", "Regression output, and the distinction a statistician will probe.", "\"that band is a confidence interval on the mean forecast, so it is narrower than a prediction interval\""],
        ["Quantile regression / pinball loss", "Train directly for p10, p50 and p90 with an asymmetric loss. Native in the common gradient-boosting libraries.", "The cheapest route to intervals when you own the model.", "\"a quantile objective at p10, p50 and p90\""],
        ["Conformal prediction", "Wrap any point model: calibrate on held-out residuals for a distribution-free interval. Time series needs rolling calibration.", "When a point model already exists and cannot be replaced.", "\"conformal on a rolling calibration window - distribution-free, but not assumption-free\""],
        ["Coverage and width", "A 90 percent interval should contain 90 percent of outcomes, and be as narrow as possible. Judge both, never one.", "Every question about whether intervals are any good.", "\"coverage and width together, per segment and per horizon\""],
        ["Rolling-origin backtest", "Walk the origin forward through history, refitting and re-forecasting at each step, and average the errors.", "The only defensible way to validate a time-series model.", "\"walk-forward validation, not random splits\""],
        ["MASE", "Mean absolute scaled error: your error divided by a seasonal naive forecast's error. Below one means you beat the benchmark.", "Comparing across series of different scales.", "\"MASE against seasonal naive, because that is the bar\""],
        ["Global against local model", "One model across all series with the series identity as a feature, against one model fitted per series.", "Any problem with many related series.", "\"one global model, so short and new series borrow strength\""],
        ["Newsvendor quantile", "When under-supply and over-supply cost different amounts, the cost-minimising plan is built on a quantile, not the mean.", "Staffing, inventory, capacity planning.", "\"if a shortfall costs three times an idle hour, plan nearer the 75th percentile\""]
      ]
    },
    {
      g: "Control and sequential decisions",
      sub: "Loops, not equations. Column three says where each term typically shows up.",
      rows: [
        ["Plant / state / setpoint / feedback", "The system being steered; what you measure; the target; measuring your own action's result and using it next time.", "Any re-planning or autoscaling loop.", "\"closed loop: measure, decide, act, re-measure\""],
        ["Open against closed loop", "Compute a plan and execute it blind, against re-measuring and correcting. A system can be both at different timescales.", "Any batch planner.", "\"closed loop across days, open loop within a day\""],
        ["Receding horizon / MPC", "Plan over a horizon, commit only the first action, discard the rest, re-solve on fresh measurements.", "Daily or hourly re-solving planners.", "\"plan long, commit short, re-solve on fresh data\""],
        ["Cadence and staleness", "How often the loop re-solves, and how old its inputs may get before the decision stops being defensible.", "The first design question about any loop.", "\"cadence comes from how fast the inputs move, not from how fast the solver runs\""],
        ["Damping and hysteresis", "Deliberately slowing the reaction, and requiring a bigger change to switch back than to switch in.", "Autoscalers, and any plan people live under.", "\"stability belongs in the objective, not in a config file\""],
        ["Thrash / churn", "The plan changing every time it is recomputed, until the people living under it stop trusting it.", "The classic complaint about a re-solving planner.", "\"penalise deviation from the published plan, and re-solving more often makes it worse\""],
        ["MDP / policy / reward", "States, actions, rewards and transitions; a policy maps a state to an action; reinforcement learning learns the policy.", "Describing a sequential decision problem.", "\"I would describe it as an MDP, and still start with the optimizer\""],
        ["Contextual bandit", "See a context, choose one action, observe only that action's reward - and your choice does not change the next context.", "Most decisions people call reinforcement learning.", "\"a bandit before full RL, because there is no carry-over\""],
        ["Off-policy evaluation", "Estimating a new policy's value from decisions logged under an old one. Needs the logged action probabilities.", "Before any learned policy touches traffic.", "\"off-policy evaluation on logs, then shadow, then a guarded ramp\""],
        ["Reward hacking", "The policy optimising the number you wrote instead of the outcome you meant, by finding a degenerate case.", "Every reward-design question.", "\"reward completions and it starves the hard jobs - so watch the tail, not the mean\""]
      ]
    },
    {
      g: "Production ML systems",
      sub: "The platform vocabulary. Column three says where each term typically shows up.",
      rows: [
        ["ML lifecycle", "Nine stages: ingestion, features, training, evaluation, registration, approval, deployment, serving and monitoring, retraining.", "The basis of almost every ML design answer.", "\"the full lifecycle, data through retraining, not just the training half\""],
        ["Paved road", "A supported default path with guardrails built in, that a team can take without asking permission.", "Any adoption or standards question.", "\"we made the safe path the fast path\""],
        ["GitOps", "Desired state declared in Git; a controller reconciles the running system to it. Rollback is a revert.", "Delivery, audit and rollback in one mechanism.", "\"Git is the source of truth, and the controller reconciles\""],
        ["Model registry", "A versioned store of artefacts with metrics, lineage, approval state and a stage label. Deployments reference a version, not a path.", "The first thing worth building in an immature setup.", "\"a registry entry with lineage and an approval state\""],
        ["Feature store", "One definition computed once and used by both training and serving, with an online store for the request path and an offline store for history.", "The densest source of design questions.", "\"one definition, two read paths\""],
        ["Point-in-time correctness", "Building a training row using only values knowable at the label's timestamp. The mechanism is an as-of join.", "The rule that prevents leakage.", "\"as-of joins, never a plain join on the entity key\""],
        ["Training-serving skew", "The training feature and the serving feature are computed differently, so the model meets a different distribution in production.", "The most common cause of a model that looks fine offline.", "\"same code path for both, or you will pay for it\""],
        ["Label latency", "The delay between a prediction and the arrival of its ground truth, which bounds how fast retraining can help.", "Fraud, credit, churn, anything with a dispute window.", "\"my labels are weeks behind my predictions, so I watch proxies\""],
        ["Latency budget", "The end-to-end time limit, split explicitly across hops with headroom left unallocated.", "Every real-time serving question.", "\"decomposed hop by hop, with a timeout smaller than what is left\""],
        ["Degraded path", "A worse but valid answer when a dependency fails, instead of an error - and it needs its own metric.", "The answer to \"what if the feature store is down\".", "\"a failed dependency should produce a worse decision, never no decision\""],
        ["Shadow / canary / blue-green", "Score without acting; send a small live slice; run two full environments and switch traffic in one move.", "Any rollout question.", "\"shadow, canary, ramp, switch - and rollback reverts the model and its features together\""],
        ["Data drift against concept drift", "The input distribution moving, against the input-to-label relationship changing. The first is visible without labels; the second is not.", "Every monitoring question.", "\"the inputs moved, against the world moved\""],
        ["SLI / SLO / error budget", "The measured indicator, the target it must hold, and the shortfall the target permits before you stop shipping.", "How you turn a reliability argument into arithmetic.", "\"the SLO names a percentile, a threshold and a window\""],
        ["Idempotency key", "A stable identifier derived from an event, so processing it twice has the same effect as once.", "Any at-least-once stream.", "\"at-least-once delivery plus an idempotency key gives you effectively-once\""]
      ]
    },
    {
      g: "Generic system design",
      sub: "The follow-ups that arrive once an architecture diagram is on the screen. Column three says where each term typically shows up.",
      rows: [
        ["Load balancer (L4 / L7)", "Spreads requests over healthy replicas. Layer 4 routes by address and port; layer 7 reads the request and routes by path, header or host.", "The first box on almost every diagram.", "\"layer 7 at the edge, so I can route by path and shift traffic by header\""],
        ["Health check", "A probe deciding whether a replica takes traffic. Readiness gates traffic; liveness restarts the process.", "How a service stays up during a release.", "\"readiness gates traffic, liveness restarts - not the same probe\""],
        ["Stateless service", "No per-client state between requests, so any replica can serve any request. State lives in a store or in the request.", "The precondition for horizontal scaling.", "\"stateless, which is why it scales flat\""],
        ["Read-through / write-through / write-back cache", "The cache loads on a miss; every write goes to both; writes go into the cache and flush later. Only the last can lose data.", "The standard caching follow-up.", "\"how stale is too stale - that number chooses the pattern\""],
        ["Cache invalidation and TTL", "How a cached value stops being used: explicit invalidation, or expiry after a time to live. Consistency lives here.", "Every caching question, one level down.", "\"either the writer invalidates, or you accept staleness bounded by the TTL\""],
        ["Cache stampede", "Many requests miss at once because a popular key expired, and all hit the store together.", "The failure mode behind a sudden database spike.", "\"stagger the expiry and let one caller refresh while the rest serve stale\""],
        ["Index, replication, sharding", "An auxiliary lookup structure; copies on more than one node; splitting data across nodes by a key.", "Any \"how would you scale that table\" question.", "\"pick a shard key with even cardinality and no hot entity\""],
        ["CAP and ACID", "Under a partition you choose consistency or availability; and the transactional guarantees that stop concurrent work corrupting state.", "Direct recognition questions.", "\"under a partition you pick one - the rest of the time you get both\""],
        ["Message queue and async work", "A durable buffer between producer and consumer, so a slow consumer becomes a backlog rather than an error.", "Anything that must absorb a spike.", "\"a queue turns a latency problem into a backlog problem\""],
        ["Exactly-once semantics", "The appearance of processing each message once, built from at-least-once delivery plus idempotent or transactional writes. End-to-end, not a transport feature.", "The trap in every streaming question.", "\"exactly-once is a property of the whole path, not something the broker gives you\""],
        ["Rate limiting and backpressure", "Capping what a caller may send, and letting a saturated component slow or reject callers rather than queue without bound.", "Overload behaviour.", "\"a bounded queue with rejection beats an unbounded queue with silence\""],
        ["Circuit breaker", "Stop calling a failing dependency after a threshold, fail fast for a cooldown, then probe with a trial request.", "The answer to \"what if that dependency is down\".", "\"open on failure, fail fast, half-open to probe\""],
        ["Retry with jitter", "Exponential backoff with randomness, so retries do not synchronise into a second outage.", "Any retry policy.", "\"backoff with jitter and a retry budget, or the retries are the outage\""],
        ["Pagination (offset against cursor)", "Returning a large result in bounded pages. Cursors are stable under concurrent writes; offsets are not.", "A direct recognition question in many interview processes.", "\"cursor-based, because offsets skip and repeat rows when the data moves\""],
        ["Observability: metrics, logs, traces", "Aggregated numbers over time; individual event records; the causal path of one request across services.", "How you know anything is wrong.", "\"metrics say something is wrong, traces say where\""]
      ]
    },
    {
      g: "Cloud services, mapped generically",
      sub: "Every major cloud has the same layers under different nouns. Column three says where each layer typically shows up.",
      rows: [
        ["Managed Kubernetes", "The same Kubernetes API, manifests, operators, service mesh and autoscaler, with the control plane run for you.", "Wherever a containerised service is deployed.", "\"the same Kubernetes - the manifests move unchanged between providers\""],
        ["Workload identity binding", "Binding a Kubernetes service account to a cloud role, so pods get credentials without static keys.", "The first thing to relearn when changing provider.", "\"same idea under a different name - a service account bound to a role\""],
        ["Managed ML platform", "Training jobs, processing jobs, pipelines, a model registry, a feature store and hosted inference endpoints, under one product name.", "The vendor-specific noun for a stack you may have built yourself.", "\"the same six capabilities, under a different product name\""],
        ["Managed feature store", "Feature groups with an online store for request-path reads and an offline store for training, with point-in-time retrieval.", "Any consistency-focused design.", "\"online and offline stores with point-in-time joins\""],
        ["Serverless functions", "Event-driven execution with no instances to manage, and a hard execution-time ceiling that rules out long jobs.", "Glue, triggers, and light request handling.", "\"functions stop at their time limit, so a long job belongs in a container job\""],
        ["Object storage", "The default landing place for data lakes, artefacts and model files, with event notifications and prefix-based partitioning.", "Under almost every offline store and artefact registry.", "\"the partitioning scheme is what decides what a query costs\""],
        ["Managed streaming", "Partitioned streaming with an explicit shard or partition count and per-partition ordering, or managed Kafka.", "The ingest side of any real-time system.", "\"the partition key is a real capacity decision, not a detail\""],
        ["Managed stream processing", "A managed runner for a streaming dataflow model, with event-time windows, watermarks and late data.", "Feature computation on a stream.", "\"the programming model is the portable part; the runner is replaceable\""],
        ["Warehouse and query-in-place", "A columnar warehouse, and a query engine that reads files in place and bills on bytes scanned.", "The offline analytics half of a feature platform.", "\"one provider bundles these; another splits them, and partitioning becomes my problem\""],
        ["Infrastructure as code", "Declaring cloud resources so they are versioned and reviewed - either through Kubernetes custom resources or a provider-neutral tool.", "The infrastructure half of a GitOps standard.", "\"cloud resources declared in Git and reconciled, rather than clicked\""],
        ["Managed monitoring and tracing", "Metrics, logs and alarms, plus distributed tracing, with managed equivalents of the common open-source stacks.", "The observability layer of any service.", "\"instrument with OpenTelemetry, and the backend is a collector configuration\""],
        ["Secrets and identity", "A secret store, and a model for granting permissions - roles with trust policies, or principals bound on a resource.", "Every production deployment.", "\"same concepts, different binding model\""]
      ]
    }
  ],

  topics: [
    {
      id: "start-here",
      title: "Start here: what this course is and how to work through it",
      level: "good",
      levelLabel: "Five minutes, then Track 1",
      why: `A course-style syllabus for machine learning and software engineering interviews: fourteen chapters in five tracks, each with definitions, diagrams, primary-source readings, quick checks and graded exercises.`,
      learn: [
        {
          id: "sh-1",
          part: "field",
          title: "What this is",
          viz: null,
          body: `<p>Fourteen chapters, grouped into five tracks, covering the material that production machine learning and backend engineering interviews actually draw on. It is written as a course rather than as a checklist: every chapter opens with the terms it uses, defines them before use, and then builds.</p>
<p>Each chapter has the same structure.</p>
<ul>
<li><b>Key terms</b> - every word the chapter uses, defined once with an example. Later sections use them freely.</li>
<li><b>Sections</b> - the subject, one idea at a time, with an animated diagram where the diagram shows a mechanism rather than decorating the page.</li>
<li><b>Go one level deeper</b> - the second-order point on each section: the refinement, the failure mode, or the thing that gets asked as a follow-up.</li>
<li><b>Quick checks</b> - a multiple-choice question per section, for recall rather than for study.</li>
<li><b>Readings</b> - primary sources only, with a time estimate and a sentence on why that specific page.</li>
<li><b>Exercises</b> - explain, design, formulate, code, drill, or answer a follow-up out loud, each with a timebox, a rubric of must-haves and common mistakes, and a model answer.</li>
</ul>
<p>Nothing here is about one person or one employer. The chapters teach the subject; a personal pack is what adds your own systems on top.</p>`,
          deeper: `<p>Two structural rules are worth knowing because they change how you read. First, ordering is meaning: chapters, exercises and question-bank entries are listed in order of importance, so the first thing you see is the thing most likely to be asked. Second, the chapters are deliberately shareable - no candidate record, no employer research - which is why the rubrics grade correctness and reasoning and treat any claim of specific production experience as unverified.</p>`,
          check: {
            question: "What does the \"Go one level deeper\" block on each section contain?",
            options: [
              "The same content restated more simply",
              "The second-order point: the refinement, the failure mode, or the usual follow-up question",
              "A list of further reading links",
              "The answers to the quick checks"
            ],
            answer: 1,
            explain: "It is the follow-up layer. The section body gives the idea; the deeper block gives the refinement an interviewer reaches for once the first answer is given."
          }
        },
        {
          id: "sh-2",
          part: "field",
          title: "The recommended path",
          viz: null,
          body: `<p>Take the tracks in order. Each one assumes the previous, and the estimates below are reading plus exercises, not reading alone.</p>
<ul>
<li><b>Track 1 - System design fundamentals</b> (about 6 hours). Balancers, caching, stores, queues, idempotency, overload and failure, APIs. Every later track assumes this vocabulary, and in most interview processes the generic questions arrive before the machine-learning ones.</li>
<li><b>Track 2 - Production ML systems</b> (about 10 hours, four chapters). The lifecycle and the platform around it, the feature and data layer, the latency budget and the autoscaler, and the two health questions - is it up, and is it right.</li>
<li><b>Track 3 - Decision systems</b> (about 10 hours, four chapters). Forecasting with intervals, constrained optimisation, the control loop that wires them together, and the judgement call about when to learn a policy instead.</li>
<li><b>Track 4 - GenAI in production</b> (about 3 hours). Serving economics, guardrails, retrieval, and the short conceptual answers a fast AI round wants.</li>
<li><b>Track 5 - Practice</b> (about 8 hours). Scenario prompts, coding drills, and a hundred questions with the answers hidden, for self-testing rather than reading.</li>
</ul>
<p>Two shortcuts, if the time is not there. If you have a week, read the key terms of every chapter in Tracks 1 and 2 first, then do Track 5 and let the questions you cannot answer choose what you read next. If you have two days, do Track 5 only, and read the chapter behind every question that came out badly.</p>`,
          deeper: `<p>The tracks are ordered by dependency, not by difficulty. Track 3 is not harder than Track 2; it is separate, and it matters most for roles built on forecasting, scheduling, routing, capacity or pricing. If the role you are preparing for has none of those, Track 3 is optional depth and Track 5 is the better use of the hours. Conversely, a decision-systems role can treat Track 4 as optional and should not skip Track 3.</p>`,
          check: {
            question: "You have two days before the interview. What does the course suggest?",
            options: [
              "Read all fourteen chapters quickly, in order",
              "Work Track 5 first, and read the chapter behind each question that came out badly",
              "Read only the key terms of every chapter and stop there",
              "Skip the exercises and read the model answers"
            ],
            answer: 1,
            explain: "With very little time the scarce resource is retrieval under pressure, not reading. Self-testing first tells you which chapters are actually worth the remaining hours."
          }
        },
        {
          id: "sh-3",
          part: "field",
          title: "How the exercises work, and how to keep your progress",
          viz: null,
          body: `<p><b>Exercises.</b> Each one gives a prompt, a timebox and a rubric. Write your answer, or say it out loud where the type calls for it, before you open anything else. Then compare it against the model answer and the rubric's must-have list.</p>
<p>On this public site, grading is a self-check: you write, you reveal the model answer, and you score yourself against the must-haves and the common mistakes. Automatic grading by Claude exists only in a copy of a page published as a Claude artifact, which is a private workflow rather than part of this site. The rubrics are written to be usable either way - they are checklists, not hidden keys.</p>
<p>Two habits make the exercises worth far more than reading. Answer before you look, even badly: a rubric read after a genuine attempt teaches what you missed, while a rubric read first teaches you to copy. And respect the timebox, because an answer that runs long in practice runs long in the interview.</p>
<p><b>Progress.</b> Everything you write, every check you answer and every section you tick off is stored in this browser only. Nothing is sent anywhere by the page itself. That means progress is per browser and per device: a different browser, a private window, or cleared site data starts empty.</p>
<p>To move it, use the export control in the header. Export writes your progress to a file; import reads it back on another device or another browser. Export before you clear site data, and export before an interview if you want your notes on a second machine.</p>`,
          deeper: `<p>If you want to build your own version of this: the course is a content pack like any other, and the chapters it uses live in a shared core library. A private pack lists the same chapter ids and adds an overlay - extra sections describing your own systems, extra exercises about them, and a one-sentence honesty rule naming what you have actually done, which every rubric then grades against. That is the mechanism that keeps a personal record out of a public repository while still using the same chapters.</p>`,
          check: null
        }
      ],
      connect: null,
      activities: [],
      sayQuestion: null,
      sayItOutLoud: null
    }
  ]
};
