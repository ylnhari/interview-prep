// The public course. It is a content pack like any other, but it carries nothing personal and no
// employer research: every chapter comes from core/library.js, the honesty rule is neutral, and
// every reading is a public primary source. Personal packs live in packs/<private>/ with an
// overlays.js that splices their own material into these same chapters. See docs/content-schema.md.
window.PREP_CONTENT = {
  meta: {
    id: "course",
    title: "ML and AI engineering: learn, explain, build",
    eyebrow: "Open engineering course",
    heading: "Understand. Experiment. Build.",
    footer: "Open Progress tools to check where progress is saved and to export or import a backup."
  },

  honesty: "Honesty rule: mark the answer on whether it is correct and well reasoned. If it claims specific production experience, treat that claim as unchecked rather than true.",

  interviewAt: null,

  groups: [
    { id: "start", label: "Start with the MLE path", sub: "choose a starting point, then use the supporting systems and coding material as you need it", ids: ["start-here"] },
    { id: "track1", label: "Track 1 \u00b7 System design", sub: "how networks work, requirements, APIs, databases, caching, distributed systems, storage, queues, search, counting, realtime, reliability, and ten worked cases", ids: ["system-design-fundamentals", "networking-basics", "requirements-and-capacity", "apis-and-communication", "sql-databases", "nosql-partitioning-ids", "caching", "distributed-coordination", "storage-engines", "queues-and-streams", "search-and-retrieval", "counting-and-sketches", "realtime-and-feeds", "sre-practices", "system-design-cases"] },
    { id: "track2", label: "Track 2 \u00b7 Production ML systems", sub: "how a model gets built and shipped, features, serving, reliability, the tools, and training on GPUs at scale", ids: ["ml-lifecycle-platform", "data-features", "serving-and-scale", "reliability-ops", "mlops-tooling", "training-at-scale"] },
    { id: "track3", label: "Track 3 \u00b7 LLMs in production", sub: "serving and cost, inference engineering, fine-tuning and alignment, retrieval and agents", ids: ["genai-platform", "llm-inference-engineering", "llm-fine-tuning-and-alignment", "rag-and-agents"] },
    { id: "track4", label: "Track 4 \u00b7 Maths and ML foundations", sub: "the maths, data and generalisation, classical models, evaluation, and deep learning", ids: ["ml-math-essentials", "data-and-generalization", "classical-models", "evaluation-and-selection", "deep-learning-essentials"] },
    { id: "track5", label: "Track 5 \u00b7 Decision systems", sub: "forecasting with uncertainty, optimisation, feedback loops that re-plan, and when to let a model learn the decision", ids: ["forecasting-uq", "or-tooling", "control-theory", "rl-judgment"] },
    { id: "track6", label: "Track 6 \u00b7 Practice", sub: "scenario questions, coding drills, and about three hundred questions with the answers hidden", ids: ["coding-drills", "scenario-questions", "question-bank-system-design", "question-bank-mle", "question-bank-ml-foundations", "question-bank-llm", "question-bank-fundamentals"] }
  ],

  useCore: [
    "system-design-fundamentals",
    "networking-basics",
    "requirements-and-capacity",
    "apis-and-communication",
    "sql-databases",
    "nosql-partitioning-ids",
    "caching",
    "distributed-coordination",
    "storage-engines",
    "queues-and-streams",
    "search-and-retrieval",
    "counting-and-sketches",
    "realtime-and-feeds",
    "sre-practices",
    "system-design-cases",
    "ml-lifecycle-platform",
    "data-features",
    "serving-and-scale",
    "reliability-ops",
    "mlops-tooling",
    "training-at-scale",
    "genai-platform",
    "llm-inference-engineering",
    "llm-fine-tuning-and-alignment",
    "rag-and-agents",
    "ml-math-essentials",
    "data-and-generalization",
    "classical-models",
    "evaluation-and-selection",
    "deep-learning-essentials",
    "forecasting-uq",
    "or-tooling",
    "control-theory",
    "rl-judgment",
    "scenario-questions",
    "coding-drills",
    "question-bank-system-design",
    "question-bank-mle",
    "question-bank-ml-foundations",
    "question-bank-llm",
    "question-bank-fundamentals"
  ],

  // The public course adds nothing on top of the shared chapters: nothing personal, no employer research.
  overlays: {},

  interviewer: null,

  readings: {
    "system-design-fundamentals": [
      { l: "The System Design Primer", u: "https://github.com/donnemartin/system-design-primer", w: "The best free reference for the words everyone uses: load balancing, caching, sharding, replication, CAP, queues, consistency. Skim the index, then read the caching and database sections properly.", m: 60 },
      { l: "PRIMER: Circuit Breaker", u: "https://martinfowler.com/bliki/CircuitBreaker.html", w: "The clearest short definition of the pattern, including the half-open state most people forget to mention.", m: 10 },
      { l: "Caching strategies and best practices", u: "https://aws.amazon.com/caching/best-practices/", w: "Cache-aside, read-through and write-through side by side, and what each one means for keeping cached data fresh.", m: 12 },
      { l: "Amazon Builders' Library", u: "https://aws.amazon.com/builders-library/", w: "Read the timeouts, retries and backoff article and the load shedding article. Two of these teach you more than a textbook chapter.", m: 40 },
      { l: "Kubernetes: Ingress", u: "https://kubernetes.io/docs/concepts/services-networking/ingress/", w: "The Kubernetes object that does layer-7 routing, which is what sits behind every \"how does a request reach my service\" answer.", m: 15 },
      { l: "Google SRE book: table of contents", u: "https://sre.google/sre-book/table-of-contents/", w: "Read the load balancing chapters and the chapter on addressing cascading failures. That is where the words backpressure and graceful degradation come from.", m: 45 }
    ],
    "ml-lifecycle-platform": [
      { l: "Google: Rules of Machine Learning", u: "https://developers.google.com/machine-learning/guides/rules-of-ml", w: "The standard checklist for shipping and running ML. Rules 1 to 15 make the case for building the pipeline before the model.", m: 35 },
      { l: "Hidden Technical Debt in Machine Learning Systems (NeurIPS 2015)", u: "https://papers.nips.cc/paper/2015/hash/86df7dcfd896fcaf2674f757a2463eba-Abstract.html", w: "Where the idea that \"the model is a small box in a large diagram\" comes from. Read it for glue code, pipeline jungles and entanglement.", m: 25 },
      { l: "MLOps: continuous delivery and automation pipelines in machine learning", u: "https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning", w: "The standard set of maturity levels for the lifecycle, and a good place to get the name of each stage.", m: 30 },
      { l: "Argo CD documentation", u: "https://argo-cd.readthedocs.io/en/stable/", w: "What a GitOps reconciliation controller actually does, described by the tool that does it.", m: 15 }
    ],
    "data-features": [
      {
        "l": "Google: Rules of Machine Learning, especially training-serving skew",
        "u": "https://developers.google.com/machine-learning/guides/rules-of-ml",
        "w": "Primary engineering guidance on feature logging, reuse of transformations, time-aware evaluation, and training-serving skew.",
        "m": 20
      },
      {
        "l": "Feast: Point-in-time joins",
        "u": "https://docs.feast.dev/getting-started/concepts/point-in-time-joins",
        "w": "Official open-source feature-store documentation on historical retrieval, event timestamps, created timestamps, and availability-aware filtering.",
        "m": 12
      },
      {
        "l": "Feast: Feature serving and model inference",
        "u": "https://docs.feast.dev/getting-started/architecture/model-inference",
        "w": "Official comparison of online inference with online features and precomputed predictions, including freshness and latency trade-offs.",
        "m": 12
      },
      {
        "l": "TensorFlow Data Validation guide",
        "u": "https://www.tensorflow.org/tfx/guide/tfdv",
        "w": "Official documentation on schema-based validation, missing values, anomalies, skew, and drift.",
        "m": 15
      },
      {
        "l": "NIST AI Risk Management Framework 1.0",
        "u": "https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=936225",
        "w": "Primary public guidance connecting data provenance, privacy, monitoring, and documented system requirements.",
        "m": 20
      }
    ],
    "serving-and-scale": [
      { l: "Horizontal Pod Autoscaling", u: "https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/", w: "What the HPA measures, how the stabilisation window works, and why it cannot create new nodes.", m: 18 },
      { l: "Google SRE book: service level objectives", u: "https://sre.google/sre-book/service-level-objectives/", w: "SLI, SLO and error budget, and why you quote percentiles rather than averages. The chapters on latency assume you know these words.", m: 20 },
      { l: "Amazon Builders' Library", u: "https://aws.amazon.com/builders-library/", w: "The load shedding article and the timeouts-and-retries article are the shortest correct explanations of two things you will be asked to defend.", m: 25 }
    ],
    "reliability-ops": [
      { l: "PRIMER: Service level objectives", u: "https://sre.google/sre-book/service-level-objectives/", w: "Indicator, objective, agreement and error budget, each defined once and defined correctly.", m: 25 },
      { l: "Implementing SLOs", u: "https://sre.google/workbook/implementing-slos/", w: "How to pick a window and a percentile, and what to do once the error budget is spent.", m: 30 },
      { l: "Hidden Technical Debt in Machine Learning Systems (NeurIPS 2015)", u: "https://papers.nips.cc/paper/2015/hash/86df7dcfd896fcaf2674f757a2463eba-Abstract.html", w: "Feedback loops, undeclared consumers and CACE. These are the failures an ML reliability question is really asking about.", m: 25 }
    ],
    "forecasting-uq": [
      { l: "PRIMER: Hyndman and Athanasopoulos - what can be forecast?", u: "https://otexts.com/fpp3/what-can-be-forecast.html", w: "The whole vocabulary in ten minutes: horizon, time series, seasonality, and a single number against a range.", m: 10 },
      { l: "PRIMER: Hyndman - evaluating point forecast accuracy", u: "https://otexts.com/fpp3/accuracy.html", w: "MAE, MAPE, RMSE and MASE, and what each of them hides. These are the metrics you will be asked to name and defend.", m: 8 },
      { l: "Hyndman - prediction intervals", u: "https://otexts.com/fpp3/prediction-intervals.html", w: "Short, authoritative, and exactly the words you need for giving a range instead of a single number.", m: 12 },
      { l: "Hyndman - time-series cross-validation (rolling origin)", u: "https://otexts.com/fpp3/tscv.html", w: "How to backtest honestly, and why one train-test split tells you almost nothing.", m: 8 },
      { l: "A Gentle Introduction to Conformal Prediction (Angelopoulos and Bates), Section 1", u: "https://arxiv.org/abs/2107.07511", w: "The calibration-set recipe and the coverage guarantee in a few pages. Watch for the exchangeability caveat, which is what bites you on time series.", m: 20 },
      { l: "Simple linear regression: confidence and prediction intervals", u: "https://en.wikipedia.org/wiki/Simple_linear_regression#Confidence_intervals", w: "The formula behind the oldest interval there is, so you can say exactly which of the two you are quoting.", m: 12 },
      { l: "Jackknife resampling", u: "https://en.wikipedia.org/wiki/Jackknife_resampling", w: "The proper name for refitting with one observation left out at a time, and how it differs from a bootstrap.", m: 6 }
    ],
    "or-tooling": [
      { l: "PRIMER: Mathematical optimization (first two sections)", u: "https://en.wikipedia.org/wiki/Mathematical_optimization", w: "Decision variables, objective, constraints, and feasible against optimal. Five minutes, and you do not need the equations.", m: 6 },
      { l: "PRIMER: OR-Tools overview", u: "https://developers.google.com/optimization/introduction", w: "The split between the model and the solver, and the list of engines a toolkit can call.", m: 6 },
      { l: "PRIMER: Integer programming (intro)", u: "https://en.wikipedia.org/wiki/Integer_programming", w: "What LP and MIP are, and why integer variables make a problem hard. Read the opening paragraphs only.", m: 8 },
      { l: "Constraint programming and CP-SAT", u: "https://developers.google.com/optimization/cp", w: "What CP is, how it differs from LP and MIP, and why it suits scheduling problems.", m: 6 },
      { l: "PRIMER: Metaheuristic (intro)", u: "https://en.wikipedia.org/wiki/Metaheuristic", w: "The umbrella term for simulated annealing, genetic algorithms and tabu search: methods that find good solutions without proving they are the best.", m: 5 },
      { l: "Simulated annealing", u: "https://en.wikipedia.org/wiki/Simulated_annealing", w: "The acceptance rule, the cooling schedule, and how it relates to Metropolis-Hastings. Skip the proofs.", m: 15 },
      { l: "Solving an assignment problem (MIP)", u: "https://developers.google.com/optimization/assignment/assignment_example", w: "The binary x[i][j] formulation, which you should be able to write out from memory.", m: 10 },
      { l: "Vehicle routing with time windows", u: "https://developers.google.com/optimization/routing/vrptw", w: "The standard routing model, with the constraints stated clearly.", m: 15 },
      { l: "Employee scheduling with CP-SAT", u: "https://developers.google.com/optimization/scheduling/employee_scheduling", w: "The same kind of problem solved exactly, so you can compare it with a metaheuristic.", m: 15 },
      { l: "Local-search options in a routing solver", u: "https://developers.google.com/optimization/routing/routing_options", w: "Guided local search, simulated annealing, tabu search and time limits, as a real solver offers them.", m: 8 },
      { l: "CVXPY: what is CVXPY?", u: "https://www.cvxpy.org/tutorial/intro/index.html", w: "Enough to know what it is: a modeling language for convex problems, not a solver.", m: 8 },
      { l: "Gurobi Optimizer overview", u: "https://www.gurobi.com/solutions/gurobi-optimizer/", w: "Enough to know what it is: a commercial LP and MIP engine that you call through a modeling layer.", m: 5 }
    ],
    "control-theory": [
      { l: "PRIMER: Feedback (intro only)", u: "https://en.wikipedia.org/wiki/Feedback", w: "The one idea everything else builds on: you measure the output and feed it back into the next decision.", m: 4 },
      { l: "Control theory: open-loop and closed-loop control", u: "https://en.wikipedia.org/wiki/Control_theory#Open-loop_and_closed-loop_(feedback)_control", w: "Skip anything with an equation in it. What you need are the words: plant, setpoint, feedback, disturbance and stability.", m: 8 },
      { l: "Kubernetes HPA: algorithm details", u: "https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/#algorithm-details", w: "A feedback controller with damping, described entirely in software terms. Read the part about the stabilisation window.", m: 8 },
      { l: "OPTIONAL, after the chapter: Model predictive control (overview only)", u: "https://en.wikipedia.org/wiki/Model_predictive_control", w: "Read it only so you recognise the name for the forecast, optimise and re-solve loop. Do not study it.", m: 6 }
    ],
    "rl-judgment": [
      { l: "PRIMER: Reinforcement learning (intro)", u: "https://en.wikipedia.org/wiki/Reinforcement_learning", w: "Agent, environment, state, action, reward and policy: the words to learn before you open the book.", m: 8 },
      { l: "Multi-armed and contextual bandits", u: "https://en.wikipedia.org/wiki/Multi-armed_bandit", w: "The cheaper alternative to full reinforcement learning, and it covers most real business decisions.", m: 8 },
      { l: "Sutton and Barto, Reinforcement Learning: An Introduction - Chapter 1 and 3.1 to 3.3", u: "http://incompleteideas.net/book/the-book-2nd.html", w: "The standard wording for Markov decision processes. Read only the introduction and the definition of an MDP.", m: 30 }
    ],
    "genai-platform": [
      { l: "OWASP Top 10 for LLM Applications", u: "https://owasp.org/www-project-top-10-for-large-language-model-applications/", w: "The words for talking about guardrails: prompt injection, insecure output handling and data leakage.", m: 20 },
      { l: "vLLM documentation", u: "https://docs.vllm.ai/en/latest/", w: "Continuous batching and paged attention, the two things behind most answers about LLM throughput.", m: 15 },
      { l: "Google: Rules of Machine Learning", u: "https://developers.google.com/machine-learning/guides/rules-of-ml", w: "Nothing in it is about LLMs, and that is the point: what you owe in production does not change just because the model changed.", m: 15 }
    ],
    "scenario-questions": [
      { l: "Google SRE book: table of contents", u: "https://sre.google/sre-book/table-of-contents/", w: "Read effective troubleshooting, emergency response and postmortem culture. Scenario answers are marked on that shape: contain, diagnose, fix, prevent.", m: 40 },
      { l: "Amazon Builders' Library", u: "https://aws.amazon.com/builders-library/", w: "Real accounts of what goes wrong under load, which is where these scenarios come from.", m: 25 }
    ],
    "coding-drills": [
      { l: "Python heapq documentation", u: "https://docs.python.org/3/library/heapq.html", w: "Top-k, streaming selection and merge patterns. Know nlargest, heappushpop and heapreplace well enough not to look them up.", m: 15 },
      { l: "PostgreSQL: window functions tutorial", u: "https://www.postgresql.org/docs/current/tutorial-window.html", w: "The shortest correct explanation of OVER, PARTITION BY and frames. It is the one SQL topic that comes up again and again.", m: 20 }
    ],
    "question-bank-fundamentals": [
      { l: "PRIMER: Hyndman - evaluating point forecast accuracy", u: "https://otexts.com/fpp3/accuracy.html", w: "Roughly a third of the forecasting answers here just restate one of these pages. Read it before you test yourself.", m: 8 },
      { l: "PRIMER: OR-Tools overview", u: "https://developers.google.com/optimization/introduction", w: "The split between the model and the solver, which is behind most of the optimisation answers here.", m: 6 }
    ],
    "question-bank-mle": [
      { l: "Google: Rules of Machine Learning", u: "https://developers.google.com/machine-learning/guides/rules-of-ml", w: "Roughly a third of the answers here are a restatement of one of these rules. Read it once before you test yourself, so you know which ones.", m: 35 }
    ]
  },

  glossary: [
    {
      g: "Optimisation and operations research",
      sub: "The words you need when an interviewer asks you to write a problem down as a model. Column three gives a common place the term appears in an interview or system design.",
      rows: [
        ["Decision variable", "The thing you get to choose; the unknown the solver fills in. Binary variables encode yes/no decisions.", "Any assignment, selection or scheduling problem.", "\"x[i][j] is binary, one if task i goes to worker j\""],
        ["Objective function", "The single number being minimised or maximised. Where the business trade-off actually gets written down.", "An optimisation model; the units make the trade-off concrete.", "\"minimise expected handle time in minutes, weighted by priority\""],
        ["Hard against soft constraint", "A hard constraint must hold for a solution to be feasible. A soft constraint is a preference whose violation is represented and penalised, often with a slack or violation variable in the objective.", "A model that may trade one requirement against another.", "\"I would make capacity soft with a steep penalty, so a bad day returns a plan rather than infeasible\""],
        ["Linear programming / mixed-integer programming / CP-SAT", "Linear programming has a linear objective and constraints over continuous variables. Mixed-integer programming also requires some variables to be integers. Constraint programming with satisfiability techniques, or CP-SAT, is strong on logical, assignment and scheduling constraints.", "Naming the kind of problem before you model it.", "\"binaries with a linear cost, so this is a mixed-integer program; CP-SAT is a reasonable engine too\""],
        ["Optimality gap", "The difference between the best feasible objective found and a valid bound on the optimum, usually reported as a percentage. Exact optimisation algorithms can often certify it; a standalone metaheuristic usually cannot.", "Stopping a solver before it proves optimality.", "\"stop at a 2 percent gap or the time limit, whichever comes first\""],
        ["Metaheuristic", "A high-level search strategy that aims for a good feasible solution without proving optimality, such as simulated annealing, a genetic algorithm, tabu search or guided local search.", "Large routing and scheduling problems with a deadline.", "\"guided local search under a time limit, returning the best feasible solution found\""],
        ["Simulated annealing", "Accept a worse move with a probability set by how much worse it is and by a temperature that cools over the run.", "Large combinatorial scheduling; a common interview explain-it question.", "\"a Monte Carlo search over schedules with a cooling schedule\""],
        ["Warm start", "Give the solver an existing solution or initial values so it may find a good incumbent faster. Staying close to the old solution needs a separate constraint or change cost.", "A recurring solve with a previous plan available.", "\"warm-start from the previous plan for speed; add a change cost if continuity matters\""],
        ["Time limit", "A wall-clock budget after which the solver stops and returns the best feasible solution found, if any, together with any available bound or status.", "Dispatch, staffing and other plans with a deadline.", "\"a proven optimum after the deadline is worth nothing\""],
        ["Vehicle routing problem / vehicle routing with time windows", "The vehicle routing problem assigns and orders stops for vehicles under constraints such as capacity. Vehicle routing with time windows also constrains when each stop may be served. Both are NP-hard.", "A common worked example for exact solvers and metaheuristics.", "\"a capacitated vehicle-routing problem with time windows, solved daily\""],
        ["Stochastic and robust optimisation", "Stochastic optimisation chooses against a probability distribution or weighted scenarios; robust optimisation protects against the worst case in a stated uncertainty set.", "A forecast that feeds a plan under uncertainty.", "\"plan against uncertainty rather than treating the point forecast as certain\""]
      ]
    },
    {
      g: "Forecasting and uncertainty",
      sub: "Give a range, not a single number. Column three gives a common place the term appears in an interview or system design.",
      rows: [
        ["Point forecast", "A single predicted value per horizon step.", "A common model output; other models emit quantiles or predictive distributions.", "\"a point forecast, with no error bar attached to it\""],
        ["Prediction interval", "An interval intended to contain one future outcome at a stated coverage rate. Its validity depends on the model and interval construction.", "A forecast consumed by a plan or solver.", "\"a 90 percent prediction interval, not a confidence interval\""],
        ["Confidence interval for the mean", "An interval estimating the mean response at a given input. In the usual comparison at the same input and level, it is narrower than the prediction interval for one new outcome.", "Regression output and the distinction between an average and one future observation.", "\"for the same input and level, the mean-response interval is narrower than the interval for one future outcome\""],
        ["Quantile regression / pinball loss", "Train directly for chosen quantiles, such as the 10th, 50th and 90th percentiles, using asymmetric pinball loss. Several common gradient-boosting libraries support it.", "A direct route to conditional quantiles when the model can be retrained.", "\"a quantile objective at the 10th, 50th and 90th percentiles\""],
        ["Conformal prediction", "Calibrate a model's residual or conformity scores to form intervals with finite-sample marginal coverage under exchangeability. Dependent time series need a method whose assumptions match the data.", "Adding uncertainty estimates to an existing model.", "\"conformal calibration, with its exchangeability or time-series assumptions stated\""],
        ["Coverage and width", "A 90 percent interval should contain 90 percent of outcomes, and be as narrow as possible. Judge both, never one.", "Every question about whether intervals are any good.", "\"coverage and width together, per segment and per horizon\""],
        ["Rolling-origin backtest", "Move the forecast origin through history, train only on earlier information, and evaluate the horizons the deployment will predict. Match the refitting schedule to the intended system.", "A standard time-series validation method; a final chronological holdout can serve a different purpose.", "\"walk-forward validation rather than random splits\""],
        ["MASE", "Mean absolute scaled error: forecast error scaled by the training-series error of a naive one-step forecast, or a seasonal-naive forecast for seasonal data. Below one beats that scale.", "Comparing errors across series with different units.", "\"MASE against the appropriate naive scale\""],
        ["Global against local model", "A global model learns shared parameters across many series; a local model is fitted separately to each series. A global model may use a series identifier or other covariates, but need not.", "A problem with many related series.", "\"one global model, so short and new series can borrow strength\""],
        ["Newsvendor quantile", "When under-supply and over-supply cost different amounts, the cost-minimising plan is built on a quantile, not the mean.", "Staffing, inventory, capacity planning.", "\"if a shortfall costs three times an idle hour, plan nearer the 75th percentile\""]
      ]
    },
    {
      g: "Control and sequential decisions",
      sub: "Loops, not equations. Column three gives a common place the term appears in an interview or system design.",
      rows: [
        ["Plant / state / observation / setpoint / feedback", "The plant is the system being controlled; its state is the information needed to predict how it evolves; an observation is what sensors reveal; the setpoint is the target; feedback uses measured outcomes to adjust later actions.", "A re-planning or autoscaling loop.", "\"closed loop: observe, decide, act, observe again\""],
        ["Open against closed loop", "Compute a plan and execute it blind, against re-measuring and correcting. A system can be both at different timescales.", "Any batch planner.", "\"closed loop across days, open loop within a day\""],
        ["Receding horizon / model predictive control", "Plan over a horizon, commit only the first action, discard the rest, then re-solve on fresh measurements. Model predictive control is usually shortened to MPC.", "Daily or hourly re-solving planners.", "\"plan long, commit short, re-solve on fresh data\""],
        ["Cadence and staleness", "How often the loop re-solves, and how old its inputs may get before the decision stops being defensible.", "An early design question for a feedback or re-planning loop.", "\"cadence comes from how fast the inputs move, not from how fast the solver runs\""],
        ["Damping and hysteresis", "Damping reduces oscillation or abrupt response; hysteresis uses different thresholds for switching into and out of a state.", "Autoscalers and plans that should not jump on small input changes.", "\"use thresholds, constraints, penalties or rate limits to keep the loop stable\""],
        ["Thrash / churn", "Repeated large plan changes caused by reacting too strongly to small or noisy input changes.", "A re-solving planner without enough stability control.", "\"frequent re-planning can increase churn unless the design penalises changes or filters noise\""],
        ["Markov decision process / policy / reward", "A Markov decision process, or MDP, specifies states, actions, rewards and transition probabilities. A policy maps available state information to actions; reinforcement learning is one way to learn it.", "Describing a sequential decision problem.", "\"I would describe it as an MDP, and still start with the optimiser\""],
        ["Contextual bandit", "See a context, choose one action, observe only that action's reward - and your choice does not change the next context.", "One-step decisions with no material effect on later contexts or rewards.", "\"a bandit before full reinforcement learning, because there is no carry-over\""],
        ["Off-policy evaluation", "Estimate a new policy's value from data collected by another policy. Importance-weighted and doubly robust estimators use logged action probabilities and rely on action overlap; direct or model-based estimators extrapolate with stronger modelling assumptions instead.", "Evaluating a learned policy before a live rollout.", "\"off-policy evaluation on logs, then shadow, then a guarded ramp\""],
        ["Reward hacking", "The policy optimising the number you wrote instead of the outcome you meant, by finding a degenerate case.", "Every reward-design question.", "\"reward completions and it starves the hard jobs - so watch the tail, not the mean\""]
      ]
    },
    {
      g: "Production ML systems",
      sub: "The words for the platform around a model. Column three gives a common place the term appears in an interview or system design.",
      rows: [
        ["ML lifecycle", "A lifecycle commonly includes ingestion, features, training, evaluation, registration, approval, deployment, serving, monitoring and retraining. Teams may combine or rename stages.", "A useful structure for an end-to-end ML design answer.", "\"the full lifecycle, data through retraining, not just the training half\""],
        ["Paved road", "A supported default path with guardrails built in, that a team can take without asking permission.", "Platform adoption and standardisation questions.", "\"the supported path should make the safe choice the easy choice\""],
        ["GitOps", "Desired state is versioned in Git and a controller reconciles the running system towards it. Reverting a declaration does not automatically undo data changes or external side effects.", "Delivery, audit and rollback of declarative state.", "\"Git holds the desired state, and the controller reconciles towards it\""],
        ["Model registry", "A versioned catalogue of model artefacts and metadata such as metrics, lineage and approval state. Deployments reference an immutable model version; stage labels are optional.", "An early control point in model delivery.", "\"a registry entry with lineage and an approval state\""],
        ["Feature store", "A system for defining and retrieving features consistently for training and serving. It may provide an offline historical store, a low-latency online store, or both.", "Feature consistency, freshness and retrieval design.", "\"shared definitions, with offline and online retrieval where the use case needs them\""],
        ["Point-in-time correctness", "Building each training row with feature values available when its prediction would have been made. An as-of join uses the row's event or prediction timestamp; when availability timestamps are recorded, they can also exclude later backfills.", "Preventing future information from leaking into training data.", "\"join features as of the prediction event, not on the entity key alone\""],
        ["Training-serving skew", "A mismatch between the features, preprocessing or data distribution used in training and what serving supplies.", "Investigating a model that looks good offline but degrades in production.", "\"share definitions where possible, then test offline and online outputs for parity\""],
        ["Label latency", "The delay between a prediction or outcome event and the time its ground-truth label becomes available. It limits how current supervised evaluation and retraining data can be.", "Renewal, repayment, appeals and other outcomes observed later.", "\"labels arrive weeks after predictions, so immediate monitoring uses clearly labelled proxies\""],
        ["Latency budget", "The end-to-end time limit, split explicitly across hops with headroom left unallocated.", "Every real-time serving question.", "\"decomposed hop by hop, with a timeout smaller than what is left\""],
        ["Degraded path", "A fallback response used when a dependency fails, designed to remain safe and useful enough for the product and measured separately.", "A dependency-failure design question.", "\"degrade when a safe fallback exists; fail closed when a wrong decision is worse than no decision\""],
        ["Shadow / canary / blue-green", "Score without acting; send a small live slice; run two full environments and switch traffic in one move.", "Any rollout question.", "\"shadow, canary, ramp, switch - and rollback reverts the model and its features together\""],
        ["Data drift against concept drift", "Data drift is a change in the input distribution. Concept drift is a change in the relationship between inputs and labels. Input drift can be measured without labels; confirming concept drift generally needs mature labels or a justified proxy.", "Monitoring whether production data and model behaviour have changed.", "\"the inputs moved, or the relationship between inputs and outcomes moved\""],
        ["Service level indicator / objective / error budget", "A service level indicator, or SLI, is a reliability measure. A service level objective, or SLO, is its target over a scope and window. The error budget is the allowed miss rate; latency objectives may use a percentile or a good-events ratio.", "Turning a reliability promise into a measurable target.", "\"define the indicator, target, scope and window, then state the error-budget policy\""],
        ["Idempotency key", "A stable request or event identifier that a receiver stores and checks so retries within a defined retention window do not repeat the effect.", "At-least-once delivery and client retries.", "\"use durable deduplication or an idempotent transaction to make retries safe within a stated scope\""]
      ]
    },
    {
      g: "Generic system design",
      sub: "The follow-up questions that come once your architecture diagram is on the screen. Column three gives a common place the term appears in an interview or system design.",
      rows: [
        ["Load balancer (transport layer / L4; application layer / L7)", "Spreads requests over healthy replicas. Layer 4 routes by address and port; layer 7 reads the request and routes by path, header or host.", "The entry point on many request-serving diagrams.", "\"layer 7 at the edge, so I can route by path and shift traffic by header\""],
        ["Health check", "A probe that decides whether a replica takes traffic. Readiness decides whether it gets traffic; liveness restarts the process.", "How a service stays up during a release.", "\"readiness decides whether it gets traffic, liveness restarts it - not the same probe\""],
        ["Stateless service", "No required per-client state stays inside one replica between requests, so any replica can usually serve the next request. This makes horizontal scaling simpler; stateful systems can scale with explicit partitioning, replication or stable identities.", "Scaling a request-serving tier across replicas.", "\"stateless request handling scales independently until a shared dependency becomes the bottleneck\""],
        ["Read-through / write-through / write-back cache", "Read-through loads the cache on a miss. Write-through updates the backing store in the synchronous write path. Write-back acknowledges the cache write and flushes later, adding data-loss risk; every pattern still needs a failure and consistency policy.", "Choosing how reads, writes and failures interact with a cache.", "\"how stale is too stale, and what happens on a partial failure - those decide the pattern\""],
        ["Cache invalidation and TTL", "How a cached value stops being used: explicit invalidation, or expiry after a time to live. Consistency lives here.", "Every caching question, one level down.", "\"either the writer invalidates, or you accept staleness bounded by the TTL\""],
        ["Cache stampede", "Many requests miss at once because a popular key expired, and all hit the store together.", "The failure mode behind a sudden database spike.", "\"stagger the expiry and let one caller refresh while the rest serve stale\""],
        ["Index, replication, sharding", "An auxiliary lookup structure; copies on more than one node; splitting data across nodes by a key.", "Scaling storage reads, writes or capacity.", "\"pick a shard key with enough distinct values, an even load distribution and no hot entity\""],
        ["CAP theorem and ACID transactions", "During a network partition, CAP says a distributed system cannot guarantee both linearizable consistency and a non-error response from every non-failed node. ACID means atomicity, consistency, isolation and durability: transaction properties with a different scope.", "Reasoning about partitions and transactional storage.", "\"during a partition, state which operations remain available and which consistency guarantee they give\""],
        ["Message queue and async work", "A buffer between producer and consumer that can decouple their rates and lifetimes. With suitable durability, capacity and retention, a temporary slowdown becomes a backlog until a limit is reached.", "Absorbing a spike or moving work off a request path.", "\"a queue turns a short latency spike into a backlog with an explicit limit\""],
        ["Exactly-once semantics", "The appearance of processing each message once, built from at-least-once delivery plus idempotent or transactional writes. End-to-end, not a transport feature.", "The trap in every question about streaming.", "\"exactly-once is a property of the whole path, not something the broker gives you\""],
        ["Rate limiting and backpressure", "Capping what a caller may send, and letting a saturated component slow or reject callers rather than queue without bound.", "Overload behaviour.", "\"a bounded queue with rejection beats an unbounded queue with silence\""],
        ["Circuit breaker", "Stop calling a failing dependency after a threshold, fail fast for a cooldown, then probe with a trial request.", "The answer to \"what if that dependency is down\".", "\"open on failure, fail fast, half-open to probe\""],
        ["Retry with jitter", "Exponential backoff with randomness, so retries do not synchronise into a second outage.", "Any retry policy.", "\"backoff with jitter and a retry budget, or the retries are the outage\""],
        ["Pagination (offset against cursor)", "Returning a large ordered result in bounded pages. Offsets can skip or repeat items under concurrent writes; a cursor built on a stable unique order key avoids those shifts, but is not automatically snapshot-consistent.", "A frequently updated list or feed.", "\"cursor-based on a stable order key, because offsets can skip and repeat rows when the data moves\""],
        ["Observability: metrics, logs, traces", "Aggregated numbers over time; individual event records; the causal path of one request across services.", "How you know anything is wrong.", "\"metrics say something is wrong, traces say where\""]
      ]
    },
    {
      g: "Cloud services, provider by provider",
      sub: "Major cloud providers offer comparable layers, with different capabilities, limits and integration details. Column three gives a common place the layer appears in an interview or system design.",
      rows: [
        ["Managed Kubernetes", "A provider-operated Kubernetes control plane implementing the standard Kubernetes API. Basic workload manifests are often portable; storage, load balancers, identity, custom resources, operators, meshes and autoscaling can need provider-specific changes.", "Deploying a containerised service on a managed cluster.", "\"portable at the standard workload layer; verify each infrastructure integration\""],
        ["Workload identity binding", "Giving a workload a cloud identity and permissions without embedding long-lived static keys. In Kubernetes this commonly maps a service account or pod identity to provider-specific configuration.", "An identity integration to verify when changing providers.", "\"same goal, but verify how this provider binds a workload to permissions\""],
        ["Managed ML platform", "A provider product that may combine training and processing jobs, pipelines, a model catalogue, feature management and hosted inference. The boundaries differ by provider.", "Comparing managed services with separately assembled components.", "\"map the product names to the capabilities the system actually needs\""],
        ["Managed feature store", "A provider-operated feature service that may offer offline history, low-latency online reads, materialisation and point-in-time joins. Verify the stores and retrieval guarantees it supports.", "Feature consistency, freshness and retrieval design.", "\"check whether it provides the online, offline and point-in-time paths this design needs\""],
        ["Serverless functions", "Event-triggered functions whose instances and scaling are managed by the provider. Execution limits depend on the product and hosting plan; long or restart-sensitive work often belongs in a durable workflow or job service.", "Glue, triggers and short request handling.", "\"check the plan's limits; use a durable workflow or job for long work\""],
        ["Object storage", "Durable object storage commonly used for data-lake files, artefacts and model files. Query cost and speed depend on file format, partition layout, pruning and the query engine.", "A common storage layer for offline ML and analytics data.", "\"file format and partition pruning both affect query cost\""],
        ["Managed streaming", "A provider-operated event stream or managed Kafka service. Ordering scope, partition or shard control, scaling and retention differ by product.", "Ingesting a continuous event flow.", "\"the partition or ordering key can be a capacity decision; check what the service exposes\""],
        ["Managed stream processing", "A provider-operated runner for batch or streaming dataflows. Event-time windows, watermarks and late-data handling depend on its programming model and runner.", "Computing features or aggregates from a stream.", "\"keep the dataflow semantics portable, then verify the runner's guarantees\""],
        ["Warehouse and query-in-place", "A managed analytical warehouse stores or manages columnar data; a query-in-place engine reads files from object storage. Pricing may follow bytes scanned, reserved capacity or compute time.", "Offline analytics and historical feature retrieval.", "\"one provider may bundle these while another splits them; check storage layout and pricing\""],
        ["Infrastructure as code", "Defining infrastructure in versioned machine-readable configuration so changes can be reviewed and applied reproducibly. Tools may be provider-specific or multi-provider.", "Managing cloud resources through reviewed changes.", "\"declare infrastructure in versioned code rather than configuring it by hand\""],
        ["Managed monitoring and tracing", "Provider-operated backends for metrics, logs, alerts and distributed traces, with provider-specific query, retention and pricing. OpenTelemetry can make instrumentation and export more portable.", "The observability layer of a deployed service.", "\"standardise instrumentation and export, then treat queries, alerts and retention as provider-specific\""],
        ["Secrets and identity", "A secret store, and a model for granting permissions - roles with trust policies, or principals bound on a resource.", "Every production deployment.", "\"same concepts, different binding model\""]
      ]
    }
  ],

  topics: [
    {
      id: "start-here",
      title: "Choose your MLE path",
      level: "good",
      levelLabel: "Five minutes, then pick a track",
      why: `Learn to design, ship and operate ML systems, then explain the data, model and service trade-offs behind them.`,
      learn: [
        {
          id: "sh-1",
          part: "field",
          title: "What to focus on",
          viz: null,
          body: `<p>Start with production ML systems, ML foundations and the practice questions. Add LLM systems or decision systems when the role needs them. System design and coding are supporting material: use them to explain the services, data paths and trade-offs around a model in production.</p>
<p>Each chapter teaches one subject. It defines the terms it uses, explains the mechanism, links to readings and gives you practice.</p>`,
          deeper: `<p>The order inside each track is a recommended learning sequence based on prerequisites and course priorities. The coloured chapter labels show the course's recommended focus, not how hard a subject is or how much you already know.</p>`
        },
        {
          id: "sh-2",
          part: "field",
          title: "Choose a starting point",
          viz: null,
          body: `<p>For a general MLE interview, begin with Tracks 2 and 4, then use Track 6 to find gaps. Add Track 3 for LLM roles and Track 5 for forecasting, optimisation or decision roles. Track 1 gives the system design you need to explain the production environment. The hours are reading plus exercises.</p>
<ul>
<li><b>Track 1 - System design</b> (about 32 hours, fifteen chapters). The fundamentals first, then how networks actually work, requirements and capacity, APIs and load balancing, relational and NoSQL databases, caching, distributed systems, storage engines, queues and streams, search, counting at scale, realtime delivery, reliability practices, and ten worked cases. Most interview processes ask these before the machine learning questions.</li>
<li><b>Track 2 - Production ML systems</b> (about 14 hours, six chapters). How a model gets built and shipped, the feature and data layer, serving and autoscaling, keeping it up and correct, the tools you would use, and training on GPUs at scale.</li>
<li><b>Track 3 - LLMs in production</b> (about 10 hours, four chapters). What it costs to serve a large language model, inference engineering from the KV cache to quantization, fine-tuning and alignment, and retrieval and agents.</li>
<li><b>Track 4 - Maths and ML foundations</b> (about 12 hours, five chapters). The maths every interviewer expects, data and generalisation, classical models, evaluation and metrics, and deep learning essentials. Read this track first if the maths and the classical models feel rusty.</li>
<li><b>Track 5 - Decision systems</b> (about 10 hours, four chapters). Forecasting with a range instead of a single number, optimisation under constraints, the feedback loop that joins the two, and when to learn a policy instead.</li>
<li><b>Track 6 - Practice</b> (about 12 hours). Coding practice, scenario questions, and about three hundred questions with the answers hidden, to test yourself on rather than to read.</li>
</ul>
<p>If you have a week, read the Key terms sections in Tracks 2 and 4, then work through the MLE and foundations question banks in Track 6. Let the questions you cannot answer choose the next chapter. If you have two days, do those question banks first and read the linked chapters behind the gaps.</p>`,
          deeper: `<p>Tracks 3 and 5 are specialised depth, not harder versions of Track 4. Use Track 5 when the job involves forecasting, scheduling, routing, capacity or pricing. Use Track 3 when it involves LLM serving, retrieval, fine-tuning or agents.</p>`
        },
        {
          id: "sh-diagnostic", part: "field", title: "Experienced reader: diagnose, practise, then read",
          body: `<p>Skip the basics you can already explain. Start with <a href="#rag-and-agents/raa-a4">the existing nine-minute controlled-document RAG design</a> without revealing its answer. Compare your diagram with its marking guide; choose only the weak area: <a href="#rag-and-agents/raa-f5">retrieval/evaluation definitions</a>, <a href="#genai-platform/gp-structured-output-drill">structured-answer validation</a>, or <a href="#rag-and-agents/raa-agent-resume-case">agent recovery and approvals</a>. Use the <a href="#coding-drills/cdr-diagnostic">25-minute coding diagnostic</a> separately.</p>
<p>For AI application delivery, practise <a href="#scenario-questions/sq-discovery-pilot-handoff">discovery to pilot to handoff</a>. An optional twenty-minute application exercise is to define a batch endpoint with per-item results, partial failures, deadlines and retry rules using the existing API/testing chapters. Separate deterministic contract/permission tests from model-quality evaluations. If you already study system design elsewhere, use this course's relevant links as gap checks rather than restarting Track 1.</p>
<p>Read only what the exercise exposed: LangGraph replay/idempotency (20 minutes), Anthropic agent evaluation structure and repeated trials (15), or Contextual Retrieval indexing-time augmentation (15). Microsoft multitenant RAG is an optional five-minute controls cross-check. The ByteMonk video is an optional overview. These are estimated study budgets, not publisher runtimes; readings live in the retrieval/agents chapter. Mark an exercise practised after testing and explaining it; existing completion marks remain intact.</p>`, deeper: null, check: null
        },
        {
          id: "sh-3",
          part: "field",
          title: "Keep your place",
          viz: null,
          body: `<p>Your progress is saved in this browser. Use Progress tools in the header to export a backup or import one on another device. When sign-in sync is available, it can also keep your course progress between devices.</p>
<p>Compare exercises with the strong answers and mark them practised. Course content and progress are stored separately, so routine course updates preserve your completion marks.</p>`,
          deeper: null,
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


// Public navigation and learning metadata. Role paths recommend order, never restrict access.
(function(C) {
  C.paths = [
    {id:'mle',label:'ML Engineer',ids:['ml-math-essentials','data-and-generalization','classical-models','evaluation-and-selection','system-design-fundamentals','ml-lifecycle-platform','data-features','serving-and-scale','reliability-ops','mlops-tooling','coding-drills','question-bank-mle'],capstone:'Build an evaluation plan, point-in-time feature contract and safe serving runbook for a tabular model.'},
    {id:'ai',label:'AI Engineer',ids:['system-design-fundamentals','ml-math-essentials','evaluation-and-selection','deep-learning-essentials','genai-platform','search-and-retrieval','rag-and-agents','llm-inference-engineering','reliability-ops','scenario-questions','question-bank-llm'],capstone:'Diagnose a retrieval or serving trace, test evidence and action boundaries, and defend quality, latency and cost.'},
    {id:'fde',label:'Forward-deployed AI Engineer',ids:['system-design-fundamentals','requirements-and-capacity','apis-and-communication','sql-databases','data-features','evaluation-and-selection','genai-platform','search-and-retrieval','rag-and-agents','mlops-tooling','sre-practices','scenario-questions','system-design-cases'],capstone:'Produce a discovery brief, pilot acceptance and stop criteria, integration tests and a support handover.'},
    {id:'staff',label:'Staff Engineer',ids:['requirements-and-capacity','queues-and-streams','distributed-coordination','storage-engines','sre-practices','ml-lifecycle-platform','serving-and-scale','reliability-ops','system-design-cases','scenario-questions'],capstone:'Assumes production fluency. Write an ADR with alternatives, dependency owners, migration milestones and measurable handover criteria. Completion does not confer staff level.'}
  ];
  C.groups = [
    {id:'start',label:'Choose a path',sub:'skip ahead whenever useful',ids:['start-here']},
    {id:'track4',label:'ML foundations',sub:'math, generalization, models, evaluation and deep learning',ids:['ml-math-essentials','data-and-generalization','classical-models','evaluation-and-selection','deep-learning-essentials']},
    {id:'track1',label:'Systems foundations and cases',sub:'requests, state, data, failure and architecture',ids:['system-design-fundamentals','networking-basics','requirements-and-capacity','apis-and-communication','sql-databases','nosql-partitioning-ids','caching','distributed-coordination','storage-engines','queues-and-streams','search-and-retrieval','counting-and-sketches','realtime-and-feeds','sre-practices','system-design-cases']},
    {id:'track2',label:'Production ML',sub:'data contracts, deployment and reliable decisions',ids:['ml-lifecycle-platform','data-features','serving-and-scale','reliability-ops','mlops-tooling']},
    {id:'track3',label:'AI engineering',sub:'generation, retrieval, adaptation, serving and training',ids:['genai-platform','rag-and-agents','llm-inference-engineering','llm-fine-tuning-and-alignment','training-at-scale']},
    {id:'track5',label:'Optional decision systems',sub:'forecasting, optimization, feedback and sequential decisions',ids:['forecasting-uq','or-tooling','control-theory','rl-judgment']},
    {id:'track6',label:'Practice and question banks',sub:'applied tasks first; reference answers are optional review',ids:['coding-drills','scenario-questions','question-bank-system-design','question-bank-mle','question-bank-ml-foundations','question-bank-llm','question-bank-fundamentals']}
  ];
  const G = {
    'start-here':['Choose a path and locate one useful practice task.','Learning plan',[]],
    'ml-math-essentials':['Check gradients, dimensions and probability assumptions.','Annotated calculation',[]],
    'data-and-generalization':['Identify leakage, sampling and missing-data assumptions.','Leakage-safe data split checklist',['ml-math-essentials']],
    'classical-models':['Compare configured baselines using independent evaluation data.','Baseline comparison and calibration report',['data-and-generalization','ml-math-essentials']],
    'evaluation-and-selection':['Choose operating-point metrics and defend uncertainty.','Evaluation plan and metric counterexample',['data-and-generalization','classical-models']],
    'deep-learning-essentials':['Trace gradients and tensor shapes; diagnose a training failure.','Shape and gradient test report',['ml-math-essentials','evaluation-and-selection']],
    'system-design-fundamentals':['Trace a request and explain state and failure boundaries.','Annotated request-path diagram',['networking-basics']],
    'networking-basics':['Explain an HTTP request over a fallible transport.','Request trace with ambiguous outcomes',['coding-drills']],
    'requirements-and-capacity':['Translate goals into measurable constraints and units.','Capacity worksheet and acceptance criteria',['system-design-fundamentals']],
    'apis-and-communication':['Specify retry-safe request and response contracts.','API contract tests',['networking-basics']],
    'sql-databases':['Choose transactions, query plans and safe schema changes.','SQL fixture results and migration plan',['coding-drills']],
    'nosql-partitioning-ids':['Choose keys and partitioning under workload constraints.','Partition and consistency ADR',['sql-databases']],
    'caching':['Predict cache freshness and partial-failure behavior.','Cache failure test matrix',['apis-and-communication','sql-databases']],
    'distributed-coordination':['State quorum, ordering and fencing assumptions.','Failure timeline and consistency ADR',['nosql-partitioning-ids','queues-and-streams']],
    'storage-engines':['Explain persistence and crash-safe publication boundaries.','Recovery test plan',['sql-databases']],
    'queues-and-streams':['Handle duplicates, late data and bounded retries.','Replay and idempotency test results',['apis-and-communication','sql-databases']],
    'search-and-retrieval':['Compare ranking baselines on judged query slices.','Retrieval evaluation table',['evaluation-and-selection']],
    'counting-and-sketches':['Choose exact or approximate counts with explicit error.','Window and sketch error worksheet',['ml-math-essentials','queues-and-streams']],
    'realtime-and-feeds':['Choose delivery and fanout under explicit failure constraints.','Delivery contract and failure trace',['queues-and-streams','caching']],
    'sre-practices':['Calculate a request error budget and plan safe mitigation.','SLO worksheet and incident runbook',['requirements-and-capacity']],
    'system-design-cases':['Defend architecture alternatives and failure domains.','ADR and tenant feature-system handover',['requirements-and-capacity','data-features','sre-practices']],
    'ml-lifecycle-platform':['Connect data, model identity and deployment decisions.','Lifecycle ownership and lineage map',['evaluation-and-selection','system-design-fundamentals']],
    'data-features':['Enforce event-time, availability and tenant contracts.','Point-in-time fixture and feature contract',['sql-databases','data-and-generalization']],
    'serving-and-scale':['Diagnose a serving bottleneck using workload evidence.','Serving capacity and rollout plan',['ml-lifecycle-platform','data-features']],
    'reliability-ops':['Separate service failures from delayed model-quality evidence.','Quality incident runbook',['sre-practices','evaluation-and-selection']],
    'mlops-tooling':['Validate a bounded API and reproducible artifact identity.','Contract tests and deployment manifest',['ml-lifecycle-platform','coding-drills']],
    'genai-platform':['Choose generation contracts and measure end-to-end quality and cost.','Generation validation and evaluation plan',['system-design-fundamentals','evaluation-and-selection']],
    'rag-and-agents':['Test evidence sufficiency, authorization and recovery.','Retrieval evaluation and action-boundary tests',['genai-platform','search-and-retrieval']],
    'llm-inference-engineering':['Distinguish queue, cache, compute and scheduler hypotheses.','Annotated request trace and optimization experiment',['genai-platform','deep-learning-essentials']],
    'llm-fine-tuning-and-alignment':['Inspect training data and compare adaptation on held-out tasks.','Training-batch audit and regression report',['deep-learning-essentials','evaluation-and-selection']],
    'training-at-scale':['Calculate retained and transient memory; choose measured parallelism.','Resource ledger and profiler diagnosis',['deep-learning-essentials','mlops-tooling']],
    'forecasting-uq':['Backtest decision-aligned forecasts and interval coverage and width.','Horizon backtest and uncertainty report',['evaluation-and-selection','ml-math-essentials']],
    'or-tooling':['Validate solver status, encoded constraints and fallback feasibility.','Constraint model and status handling tests',['ml-math-essentials','requirements-and-capacity']],
    'control-theory':['Distinguish feedback planning from explicit MPC assumptions.','Controller constraint and failure analysis',['or-tooling','forecasting-uq']],
    'rl-judgment':['Choose prediction, bandits or sequential decisions from evidence.','Policy evaluation and coverage plan',['evaluation-and-selection','control-theory']],
    'coding-drills':['Test actual code and SQL against edge-case fixtures.','Executed tests and explained patch',[]],
    'scenario-questions':['Choose risk-aware actions and named decision ownership.','Pilot or incident handover checklist',['requirements-and-capacity','sre-practices']]
  };
  C.chapterGuides = {};
  C.useCore.concat(['start-here']).forEach(id => {
    const g = G[id] || ['Explain a mechanism with stated assumptions, then apply a changed constraint.','Closed-book explanation and corrected retry',['evaluation-and-selection']];
    C.chapterGuides[id] = {outcome:g[0],artifact:g[1],prerequisites:g[2]};
  });
  const start=C.topics.find(t=>t.id==='start-here');
  start.title='Choose your engineering path'; start.levelLabel='Start anywhere';
  start.learn.find(s=>s.id==='sh-1').body='<p>Choose ML engineering, AI engineering, forward-deployed delivery or staff engineering. Recommendations change the order and final project; every chapter stays available. Start with a diagram or an applied task, predict what happens, then inspect the explanation.</p><p>Build learning evidence: tests, a trace diagnosis, an evaluation plan, an architecture decision or a runbook. Explain one trade-off aloud in 60–90 seconds. That is an optional rehearsal budget, not a timer.</p>';
  start.learn.find(s=>s.id==='sh-1').deeper=null;
  start.learn.find(s=>s.id==='sh-2').body='<p>Use the role paths on <a href="#home">the course home</a>, or browse all six subject groups. Before a production task, check that you can <a href="#networking-basics">trace a request</a>, <a href="#sql-databases">write a JOIN and reason about a transaction</a>, and <a href="#requirements-and-capacity">estimate units</a>. Use the <a href="#coding-drills/cdr-diagnostic">coding diagnostic</a> to choose gaps rather than repeat familiar material.</p><p>Math and deep-learning depth support AI mechanisms; distributed training and decision systems are optional when your problem needs them. Staff recommendations assume production fluency and confer no job level. Question banks are optional closed-book review, not the default lesson experience.</p>';
  start.learn.find(s=>s.id==='sh-2').deeper=null;
  start.learn.find(s=>s.id==='sh-3').body='<p>Progress is self-recorded learning evidence, not mastery, a credential or a prediction of interview success. Export a backup from Progress tools and import it on another device. Optional Google sync is separate from course access; guest learning always works.</p><p>Existing completion and answer history survive updates. A revised lesson may deserve another attempt. Reveal feedback after a prediction, then retry with a changed constraint and keep the resulting test, diagram or decision.</p>';
  const providers={'youtube.com':'YouTube / linked creator','youtu.be':'YouTube / linked creator','developers.google.com':'Google','sre.google':'Google SRE','huggingface.co':'Hugging Face','cs336.stanford.edu':'Stanford CS336','arxiv.org':'Paper authors / arXiv','docs.vllm.ai':'vLLM','otexts.com':'Hyndman and Athanasopoulos','postgresql.org':'PostgreSQL','scikit-learn.org':'scikit-learn'};
  Object.values(C.readings).forEach(rs=>rs.forEach((r,i)=>{
    const host=(r.u.match(/^https?:\/\/([^/]+)/)||['','External provider'])[1].replace(/^www\./,'');
    r.provider=r.provider || providers[host] || host;
    r.format=r.format || (/youtu/.test(host)?'Video':/arxiv|\.pdf/.test(r.u)?'Paper':'Reading / linked materials');
    r.access=r.access || 'External access not independently verified; some linked tools or compute may require an account';
    r.purpose=r.w; r.budgetLabel='Estimated study budget'; r.featured=i===0;
  }));
})(window.PREP_CONTENT);

// Optional references stay available in Go deeper; selected teaching matches the chapter's task.
(function(C,core){
  C.useCore.forEach(id=>{
    const rs=C.readings[id]||((core[id]||{}).readings)||[];
    rs.forEach(r=>{if(/^optional\b/i.test(r.l||''))r.optional=true;});
  });
  const selections={
    'rag-and-agents':'https://research.google/pubs/sufficient-context-a-new-lens-on-retrieval-augmented-generation-systems/',
    'distributed-coordination':'http://thesecretlivesofdata.com/raft/'
  };
  Object.keys(selections).forEach(id=>{
    const rs=C.readings[id]||((core[id]||{}).readings)||[];
    rs.forEach(r=>{r.featured=r.u===selections[id];
      if(r.featured){r.optional=false;r.purpose=r.w;
        r.provider=id==='rag-and-agents'?'Google Research':'The Secret Lives of Data';
        r.format=id==='rag-and-agents'?'Paper and public landing page':'Interactive explanation';
      }
      if(/ByteMonk/i.test(r.l||'')){r.optional=true;r.l='Optional sponsored overview: ByteMonk architecture (video)';}
    });
  });
})(window.PREP_CONTENT,window.PREP_CORE||{});

(function(C){
  C.useCore.push('enterprise-feature-platform');
  C.groups.find(g=>g.id==='track1').ids.push('enterprise-feature-platform');
  C.paths.filter(p=>p.id==='mle'||p.id==='fde'||p.id==='staff').forEach(p=>p.ids.splice(p.ids.indexOf('system-design-cases')>=0?p.ids.indexOf('system-design-cases'):p.ids.length-1,0,'enterprise-feature-platform'));
  C.chapterGuides['enterprise-feature-platform']={outcome:'Defend a tenant-safe, time-correct feature path through changing freshness and failure constraints.',prerequisites:['data-features','queues-and-streams','sre-practices'],artifact:'Five-line ADR, historical eligibility tests, replay invariants and tenant incident runbook'};
  const add=(id,r)=>{C.readings[id]=C.readings[id]||((window.PREP_CORE&&window.PREP_CORE[id]&&window.PREP_CORE[id].readings)||[]).slice();C.readings[id].unshift(Object.assign({featured:true,m:20,access:'Public landing page readable without login; linked compute or platform features may require accounts',checkedAt:'2026-10-09',budgetLabel:'Estimated study budget'},r));};
  add('classical-models',{l:'Google ML Crash Course: classification',u:'https://developers.google.com/machine-learning/crash-course/classification',w:'Use animations and threshold examples, then reproduce the local precision counterexample.',provider:'Google',format:'Course: videos, visuals and exercises'});
  add('deep-learning-essentials',{l:'Karpathy: build micrograd',u:'https://karpathy.ai/zero-to-hero.html',w:'Construct backpropagation after local shape and gradient checks. Creator lists 2h25m for the full micrograd video; the 20-minute budget here is for selecting a segment.',provider:'Andrej Karpathy',format:'Video and code',publisherDuration:'2h25m'});
  add('training-at-scale',{l:'Stanford CS336: resource accounting and profiling',u:'https://cs336.stanford.edu/',w:'Select GPU, parallelism and inference teaching. Advanced assignments may need substantial prerequisites and compatible GPUs.',provider:'Stanford University',format:'Lectures, recordings and assignments'});
  add('system-design-cases',{l:'C4 architecture views',u:'https://c4model.com/',w:'Use context and container views for the capstone, then annotate one request sequence and failure domain.',provider:'Simon Brown / C4 model',format:'Reading, diagrams and linked videos'});
  add('system-design-cases',{l:'Documenting architecture decisions',u:'https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions',w:'Optional format for a short decision record with alternatives, consequences and revisit evidence.',provider:'Michael Nygard / Cognitect',format:'Article'});
  C.readings['enterprise-feature-platform']=[
    {l:'Tenant isolation: security and noisy neighbors',u:'https://docs.aws.amazon.com/whitepapers/latest/saas-tenant-isolation-strategies/isolation-security-or-noisy-neighbor.html',w:'Separate unauthorized access from resource interference; one does not prove the other.',provider:'AWS',format:'Architecture documentation',m:10},
    {l:'Feast point-in-time joins',u:'https://docs.feast.dev/getting-started/concepts/point-in-time-joins',w:'Backward-looking event-time joins and TTL are a foundation; availability-time and observed serving replay require additional evidence.',provider:'Feast',format:'Documentation',m:10},
    {l:'Beam timing model',u:'https://beam.apache.org/documentation/basics/',w:'Watermarks, windows and triggers, with explicit late-data policy.',provider:'Apache Beam',format:'Documentation',m:15},
    {l:'Flink connector guarantees',u:'https://nightlies.apache.org/flink/flink-docs-stable/docs/connectors/datastream/guarantees/',w:'Check source, state and sink participation before claiming end-to-end exactly-once effects.',provider:'Apache Flink',format:'Documentation',m:10}
  ];
  C.readings['enterprise-feature-platform'].forEach(r=>{r.access='Public documentation; running a platform may require services or compute';r.checkedAt='2026-10-09';r.purpose=r.w;r.budgetLabel='Estimated study budget';});
  Object.values(C.readings).forEach(rs=>rs.forEach(r=>{r.purpose=r.purpose||r.w;if(/ByteMonk/i.test(r.l))r.access='Optional sponsored overview; YouTube access varies';}));
})(window.PREP_CONTENT);

(function(C){
  C.useCore.push('recommendation-systems','experimentation-and-causal-measurement');
  C.groups.find(g=>g.id==='track4').ids.push('experimentation-and-causal-measurement');
  C.groups.find(g=>g.id==='track2').ids.push('recommendation-systems');
  C.paths.forEach(p=>{var at=p.ids.indexOf('evaluation-and-selection');p.ids.splice(at>=0?at+1:p.ids.length,0,'experimentation-and-causal-measurement');if(p.id==='mle')p.ids.splice(p.ids.indexOf('data-features')+1,0,'recommendation-systems');});
  C.chapterGuides['recommendation-systems']={outcome:'Diagnose missing candidates, exposure bias and ranking quality under a latency budget.',prerequisites:['evaluation-and-selection','search-and-retrieval','data-features'],artifact:'Ranking evaluation and evidence-based release gate'};
  C.chapterGuides['experimentation-and-causal-measurement']={outcome:'Design an interpretable experiment with allocation, stopping and harm controls.',prerequisites:['ml-math-essentials','evaluation-and-selection'],artifact:'Experiment plan with randomization unit, MDE, guardrails and stop criteria'};
  C.readings['recommendation-systems']=[{l:'Google Recommendation Systems',u:'https://developers.google.com/machine-learning/recommendation',w:'Selected candidate generation, scoring and reranking teaching. The publisher gives four hours for the whole course; use only the relevant segment here.',m:25,provider:'Google',format:'Course: readings, examples and exercises',access:'Public teaching; prerequisite MLCC or equivalent and linear algebra',budgetLabel:'Estimated selected study budget',featured:true}];
  C.readings['experimentation-and-causal-measurement']=[{l:'A Dirty Dozen: metric interpretation pitfalls in online experiments',u:'https://www.microsoft.com/en-us/research/publication/a-dirty-dozen-twelve-common-metric-interpretation-pitfalls-in-online-controlled-experiments/',w:'Primary examples to use when defending randomization, metrics and decision limits.',m:20,provider:'Microsoft Research / paper authors',format:'Paper and public landing page',access:'Public paper page; no publisher runtime asserted',budgetLabel:'Estimated study budget',featured:true}];
  ['recommendation-systems','experimentation-and-causal-measurement'].forEach(id=>{
    const inherited=((window.PREP_CORE||{})[id]||{}).readings||[];
    inherited.forEach(r=>{if(!C.readings[id].some(existing=>existing.u===r.u))C.readings[id].push(Object.assign({},r));});
  });
})(window.PREP_CONTENT);

(function(C,core){
  var status={"https://github.com/donnemartin/system-design-primer":200,"https://martinfowler.com/bliki/CircuitBreaker.html":200,"https://aws.amazon.com/caching/best-practices/":200,"https://aws.amazon.com/builders-library/":200,"https://kubernetes.io/docs/concepts/services-networking/ingress/":200,"https://sre.google/sre-book/table-of-contents/":200,"https://www.cloudflare.com/learning/ddos/glossary/open-systems-interconnection-model-osi/":403,"https://hpbn.co/building-blocks-of-tcp/":200,"https://www.youtube.com/watch?v=jE_FcgpQ7Co":200,"https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Evolution_of_HTTP":200,"https://www.youtube.com/watch?v=a-sBfyiXysI":200,"https://www.cloudflare.com/learning/ssl/what-happens-in-a-tls-handshake/":403,"https://www.youtube.com/watch?v=27r4Bzuj5NQ":200,"https://hpbn.co/primer-on-latency-and-bandwidth/":200,"https://gist.github.com/jboner/2841832":200,"https://en.wikipedia.org/wiki/High_availability":200,"http://dbmsmusings.blogspot.com/2010/04/problems-with-cap-and-yahoos-little.html":200,"https://martinfowler.com/bliki/MonolithFirst.html":200,"https://en.wikipedia.org/wiki/Amdahl%27s_law":200,"https://bytebytego.com/courses/system-design-interview/back-of-the-envelope-estimation":200,"https://www.youtube.com/watch?v=eR5pIYfxKgY":200,"https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/design-principles.html":200,"https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/":200,"https://www.barroso.org/publications/TheTailAtScale.pdf":200,"https://grpc.io/docs/what-is-grpc/introduction/":200,"https://graphql.org/learn/":200,"https://docs.nginx.com/nginx/admin-guide/load-balancer/http-load-balancer/":200,"https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API":200,"https://www.cloudflare.com/learning/ddos/glossary/user-datagram-protocol-udp/":403,"https://www.youtube.com/watch?v=AMNWLz_f6qM":200,"https://use-the-index-luke.com/":200,"https://www.postgresql.org/docs/current/mvcc.html":200,"https://www.postgresql.org/docs/current/transaction-iso.html":200,"https://www.postgresql.org/docs/current/wal-intro.html":200,"https://www.youtube.com/watch?v=JWSObwhGGxY":200,"https://blog.bytebytego.com/p/database-indexing-strategies":200,"https://github.blog/news-insights/company-news/gh-ost-github-s-online-migration-tool-for-mysql/":200,"https://blog.bytebytego.com/p/sql-vs-nosql-choosing-the-right-database":200,"https://www.youtube.com/watch?v=UF9Iqmg94tk":200,"https://www.youtube.com/watch?v=g3BV_holJK4":200,"https://en.wikipedia.org/wiki/Bloom_filter":200,"https://www.mongodb.com/docs/manual/reference/bson-types/":200,"https://aws.amazon.com/blogs/database/choosing-the-right-dynamodb-partition-key":200,"https://use-the-index-luke.com/sql/partial-results/fetch-next-page":200,"https://cloud.google.com/storage/docs/storage-classes":200,"https://blog.bytebytego.com/p/top-caching-strategies":200,"https://redis.io/docs/latest/develop/reference/eviction/":200,"https://aws.amazon.com/builders-library/caching-challenges-and-strategies/":200,"https://www.hellointerview.com/learn/system-design/core-concepts/caching":200,"https://www.youtube.com/watch?v=kiCbLOPmBh4":200,"https://www.youtube.com/watch?v=NCePGsRZFus":200,"https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html":200,"https://martin.kleppmann.com/2015/05/11/please-stop-calling-databases-cp-or-ap.html":200,"https://raft.github.io/":200,"http://thesecretlivesofdata.com/raft/":200,"https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/":200,"https://lamport.azurewebsites.net/pubs/time-clocks.pdf":200,"https://www.youtube.com/watch?v=rvKKj7JU92g":200,"https://highscalability.com/gossip-protocol-explained/":200,"https://riak.com/assets/bitcask-intro.pdf":200,"https://www.scylladb.com/wp-content/uploads/ScyllaDB-Designing-Data-Intensive-Applications.pdf":200,"https://github.com/facebook/rocksdb/wiki/Compaction":200,"https://github.com/google/leveldb/blob/main/doc/table_format.md":200,"https://www.youtube.com/watch?v=I6jB0nM9SKU":200,"https://blog.bytebytego.com/p/b-trees-vs-lsm-trees-comparison-and":200,"https://arpitbhayani.me/notes/how-erasure-coding-achieves-s3-durability-with-reduced-storage-costs":200,"https://www.nan.fyi/database":200,"https://www.youtube.com/watch?v=e5uAhoT1hhU":200,"https://docs.confluent.io/platform/current/schema-registry/fundamentals/schema-evolution.html":200,"https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html":200,"https://www.confluent.io/blog/exactly-once-semantics-are-possible-heres-how-apache-kafka-does-it/":200,"https://learn.microsoft.com/en-us/azure/architecture/patterns/idempotent-consumer":200,"https://www.prisma.io/blog/you-dont-need-a-job-queue-postgres-already-has-skip-locked":200,"https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/backfill.html":200,"https://www.techinterview.org/post/3233474168/system-design-twitter-news-feed-timeline-fanout-on-write-fanout-on-read-celebrity-problem-ranking-caching/":200,"https://nlp.stanford.edu/IR-book/html/htmledition/tokenization-1.html":200,"https://www.elastic.co/blog/practical-bm25-part-2-the-bm25-algorithm-and-its-variables":200,"https://lucene.apache.org/core/9_11_1/core/org/apache/lucene/search/similarities/BM25Similarity.html":200,"https://www.elastic.co/guide/en/elasticsearch/reference/current/near-real-time.html":200,"https://www.elastic.co/docs/reference/elasticsearch/rest-apis/reciprocal-rank-fusion":200,"https://www.pinecone.io/learn/series/faiss/hnsw/":200,"https://developers.google.com/search/docs/fundamentals/how-search-works":200,"https://www.youtube.com/watch?v=TZ_LSourdUc":200,"https://www.oreilly.com/radar/the-world-beyond-batch-streaming-101/":200,"https://www.oreilly.com/radar/the-world-beyond-batch-streaming-102/":200,"https://redis.io/docs/latest/develop/data-types/probabilistic/hyperloglogs/":200,"http://antirez.com/news/75":200,"https://redis.io/docs/latest/develop/data-types/probabilistic/count-min-sketch/":200,"https://www.youtube.com/watch?v=fU9hR3kiOK0":200,"https://github.com/tdunning/t-digest":200,"https://www.datadoghq.com/blog/engineering/computing-accurate-percentiles-with-ddsketch/":200,"https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events":200,"https://ably.com/blog/websockets-vs-long-polling":200,"https://www.youtube.com/watch?v=gzIcGhJC8hA":200,"https://www.youtube.com/watch?v=ugAZsDdmwJQ":200,"https://github.com/twitter-archive/flockdb":200,"https://www.youtube.com/watch?v=QmX2NPkJTKg":200,"https://www.youtube.com/watch?v=e8cX9pQdu7Y":200,"https://sre.google/sre-book/monitoring-distributed-systems/":200,"https://sre.google/sre-book/service-level-objectives/":200,"https://sre.google/sre-book/embracing-risk/":200,"https://sre.google/workbook/alerting-on-slos/":200,"https://sre.google/sre-book/postmortem-culture/":200,"https://martinfowler.com/bliki/ParallelChange.html":200,"https://www.youtube.com/watch?v=ONSCQWLD9d0":200,"https://www.youtube.com/watch?v=YXkOdWBwqaA":200,"https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions":200,"https://c4model.com/":200,"https://code.flickr.net/2010/02/08/ticket-servers-distributed-unique-primary-keys-on-the-cheap/":200,"https://stripe.com/blog/idempotency":200,"https://stripe.dev/blog/ledger-stripe-system-for-tracking-and-validating-money-movement":200,"https://www.youtube.com/watch?v=Ox-aXX2qekU":200,"https://blog.bytebytego.com/p/how-stripe-detects-fraudulent-transactions":200,"https://www.anyscale.com/blog/continuous-batching-llm-inference":200,"https://eugeneyan.com/writing/system-design-for-discovery/":200,"https://developers.google.com/machine-learning/guides/rules-of-ml":200,"https://papers.nips.cc/paper/2015/hash/86df7dcfd896fcaf2674f757a2463eba-Abstract.html":200,"https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning":200,"https://argo-cd.readthedocs.io/en/stable/":200,"https://docs.feast.dev/getting-started/concepts/point-in-time-joins":200,"https://docs.feast.dev/getting-started/architecture/model-inference":200,"https://www.tensorflow.org/tfx/guide/tfdv":200,"https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=936225":200,"https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/":200,"https://sre.google/workbook/implementing-slos/":200,"https://dvc.org/doc/start":200,"https://mlflow.org/docs/latest/ml/tracking/":200,"https://fastapi.tiangolo.com/tutorial/":200,"https://kubernetes.io/docs/concepts/workloads/pods/":200,"https://prometheus.io/docs/introduction/overview/":200,"https://docs.greatexpectations.io/docs/home/":200,"https://www.youtube.com/watch?v=TlHvYWVUZyc":200,"https://cs336.stanford.edu/":200,"https://horace.io/brrr_intro.html":200,"https://arxiv.org/abs/1910.02054":200,"https://docs.pytorch.org/tutorials/intermediate/FSDP_tutorial.html":200,"https://docs.pytorch.org/tutorials/intermediate/ddp_tutorial.html":200,"https://arxiv.org/abs/2205.14135":200,"https://www.youtube.com/watch?v=l8pRSuU81PU":200,"https://www.youtube.com/watch?v=7EJjdDLK4cg":200,"https://developer.nvidia.com/nccl":200,"https://owasp.org/www-project-top-10-for-large-language-model-applications/":200,"https://docs.vllm.ai/en/latest/":200,"https://arxiv.org/abs/2309.06180":200,"https://www.youtube.com/watch?v=zy8ChVd_oTM":200,"https://arxiv.org/abs/2211.17192":200,"https://arxiv.org/abs/2306.00978":200,"https://arxiv.org/abs/2210.17323":200,"https://arxiv.org/abs/2506.04645":200,"https://arxiv.org/abs/2106.09685":200,"https://www.youtube.com/watch?v=PXWYUTMt-AU":200,"https://arxiv.org/abs/2305.14314":200,"https://arxiv.org/abs/2305.11206":200,"https://arxiv.org/abs/2203.02155":200,"https://www.youtube.com/watch?v=qGyFrqc34yc":200,"https://arxiv.org/abs/2305.18290":200,"https://arxiv.org/abs/2402.03300":200,"https://docs.langchain.com/oss/python/langgraph/functional-api":200,"https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents":200,"https://www.anthropic.com/engineering/contextual-retrieval":200,"https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/secure-multitenant-rag":200,"https://www.youtube.com/watch?v=4KiiKQ9RVvA":200,"https://research.google/pubs/sufficient-context-a-new-lens-on-retrieval-augmented-generation-systems/":200,"https://learn.microsoft.com/en-us/azure/search/search-document-level-access-overview":200,"https://developers.llamaindex.ai/python/framework/understanding/rag/":200,"https://www.pinecone.io/learn/chunking-strategies/":200,"https://www.elastic.co/search-labs/blog/hybrid-search-elasticsearch":200,"https://arxiv.org/abs/1603.09320":200,"https://www.anthropic.com/research/building-effective-agents":200,"https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf":200,"https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/":200,"https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab":200,"https://www.youtube.com/playlist?list=PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr":200,"https://www.youtube.com/watch?v=VMj-3S1tku0":200,"https://www.youtube.com/watch?v=9wCnvr7Xw4E":200,"https://www.youtube.com/watch?v=XepXtl9YKwc":200,"https://colah.github.io/posts/2015-09-Visual-Information/":200,"https://en.wikipedia.org/wiki/Softmax_function":200,"https://ruder.io/optimizing-gradient-descent/":200,"https://www.youtube.com/watch?v=EuBBz3bI-aA":200,"https://www.youtube.com/watch?v=Q81RR3yKn30":200,"https://www.youtube.com/watch?v=NGf0voTMlcs":200,"https://www.kaggle.com/code/alexisbcook/data-leakage/tutorial":200,"https://developers.google.com/machine-learning/guides/rules-of-ml#rule_37_measure_trainingserving_skew":200,"https://en.wikipedia.org/wiki/Probably_approximately_correct_learning":200,"https://huyenchip.com/2022/02/07/data-distribution-shifts-and-monitoring.html":200,"https://scikit-learn.org/stable/modules/preprocessing.html":200,"https://developers.google.com/machine-learning/crash-course/classification":200,"https://www.youtube.com/watch?v=7VeUPuFGJHk":200,"https://www.youtube.com/watch?v=J4Wdy0Wc_xQ":200,"https://www.youtube.com/watch?v=3CC4N4z3GJc":200,"https://xgboost.readthedocs.io/en/stable/tutorials/model.html":200,"https://lightgbm.readthedocs.io/en/latest/Features.html":200,"https://scikit-learn.org/stable/modules/calibration.html":200,"https://www.youtube.com/watch?v=yIYKR4sgzI8":200,"https://christophm.github.io/interpretable-ml-book/shap.html":200,"https://www.youtube.com/watch?v=4jRBRDbJemM":200,"https://www.youtube.com/watch?v=Kdsp6soqA7o":200,"https://www.youtube.com/watch?v=fSytzGwwBVw":200,"https://scikit-learn.org/stable/modules/cross_validation.html":200,"https://scikit-learn.org/stable/modules/model_evaluation.html":200,"https://www.evidentlyai.com/classification-metrics/confusion-matrix":200,"https://www.evanmiller.org/how-not-to-run-an-ab-test.html":200,"https://karpathy.ai/zero-to-hero.html":200,"https://www.youtube.com/watch?v=aircAruvnKk":200,"https://www.youtube.com/watch?v=tIeHLnjs5U8":200,"https://www.youtube.com/watch?v=kCc8FmEb1nY":200,"https://jalammar.github.io/illustrated-transformer/":200,"https://www.youtube.com/watch?v=IN2XmBhILt4":200,"https://d2l.ai/":200,"https://arxiv.org/abs/2104.09864":200,"https://otexts.com/fpp3/what-can-be-forecast.html":200,"https://otexts.com/fpp3/accuracy.html":200,"https://otexts.com/fpp3/prediction-intervals.html":200,"https://otexts.com/fpp3/tscv.html":200,"https://arxiv.org/abs/2107.07511":200,"https://en.wikipedia.org/wiki/Simple_linear_regression#Confidence_intervals":200,"https://en.wikipedia.org/wiki/Jackknife_resampling":200,"https://en.wikipedia.org/wiki/Mathematical_optimization":200,"https://developers.google.com/optimization/introduction":200,"https://en.wikipedia.org/wiki/Integer_programming":200,"https://developers.google.com/optimization/cp":200,"https://en.wikipedia.org/wiki/Metaheuristic":200,"https://en.wikipedia.org/wiki/Simulated_annealing":200,"https://developers.google.com/optimization/assignment/assignment_example":200,"https://developers.google.com/optimization/routing/vrptw":200,"https://developers.google.com/optimization/scheduling/employee_scheduling":200,"https://developers.google.com/optimization/routing/routing_options":200,"https://www.cvxpy.org/tutorial/intro/index.html":200,"https://www.gurobi.com/solutions/gurobi-optimizer/":200,"https://en.wikipedia.org/wiki/Feedback":200,"https://en.wikipedia.org/wiki/Control_theory#Open-loop_and_closed-loop_(feedback)_control":200,"https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/#algorithm-details":200,"https://en.wikipedia.org/wiki/Model_predictive_control":200,"https://en.wikipedia.org/wiki/Reinforcement_learning":200,"https://en.wikipedia.org/wiki/Multi-armed_bandit":200,"http://incompleteideas.net/book/the-book-2nd.html":200,"https://docs.python.org/3/library/heapq.html":200,"https://www.postgresql.org/docs/current/tutorial-window.html":200,"https://blog.bytebytego.com/p/a-crash-course-in-caching-part-1":200,"https://www.youtube.com/watch?v=zaRkONvyGr8":200,"https://antirez.com/news/75":200,"https://www.youtube.com/watch?v=P-9FwZxO1zE":200,"https://huyenchip.com/ml-interviews-book/":200,"https://developers.google.com/machine-learning/crash-course":200,"https://www.youtube.com/watch?v=eMlx5fFNoYc":200,"https://fanout.sh/blog/llm-inference-interview-questions":200,"https://vllm.ai/blog/2023-06-20-vllm":200,"https://magazine.sebastianraschka.com/p/practical-tips-for-finetuning-llms":200,"https://developers.openai.com/api/docs/guides/function-calling":200,"https://www.deeplearning.ai/the-batch/how-agents-can-improve-llm-performance/":200,"https://docs.aws.amazon.com/whitepapers/latest/saas-tenant-isolation-strategies/isolation-security-or-noisy-neighbor.html":200,"https://beam.apache.org/documentation/basics/":200,"https://nightlies.apache.org/flink/flink-docs-stable/docs/connectors/datastream/guarantees/":200,"https://developers.google.com/machine-learning/recommendation":200,"https://www.microsoft.com/en-us/research/publication/a-dirty-dozen-twelve-common-metric-interpretation-pitfalls-in-online-controlled-experiments/":200,"https://scikit-learn.org/stable/modules/generated/sklearn.metrics.ndcg_score.html":200,"https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.permutation_test.html":200};

  C.useCore.forEach(function(id){var rs=C.readings[id]||(core[id]&&core[id].readings)||[];rs.forEach(function(r){
    var host=(r.u.match(/^https?:\/\/([^/]+)/)||['','External provider'])[1].replace(/^www\./,'');
    r.provider=r.provider||host;r.format=r.format||(/youtu/.test(host)?'Video':'Reading / reference');r.purpose=r.purpose||r.w;
    if(status[r.u]===200)r.access=(r.access||'External resource')+'; URL reachable 2026-10-09, playback and linked account requirements not verified';
    else if(status[r.u])r.access='Access uncertain: HTTP '+status[r.u]+' on 2026-10-09; not classified as a broken link';
    r.checkedAt='2026-10-09';r.budgetLabel='Estimated study budget';
    if(r.w)r.w=r.w.replace(/The best free reference/g,'A free reference').replace(/best on the internet/gi,'selected teaching');
  });});
})(window.PREP_CONTENT,window.PREP_CORE||{});

// Paths assume some background; recommended prerequisites are refreshers, never access gates.
(function(C){
  const background={mle:'Before the path, try the coding diagnostic. Review request tracing, SQL and reliability basics where your project exposes a gap.',ai:'Check Python, statistical evaluation and request tracing before the AI mechanisms. Use background chapters when a diagnostic exposes a gap.',fde:'Check request tracing, SQL, data cutoffs and basic evaluation before the delivery case. Review supporting math and lifecycle concepts as needed.',staff:'Assumes production fluency in APIs, databases, features, evaluation and reliability. Review a background chapter when you cannot defend its contract.'};
  C.chapterGuides['ml-math-essentials'].background='Basic arithmetic and algebra are useful background. Python/NumPy helps verify numerical examples; the coding diagnostic is optional background, not a mathematical prerequisite.';
  C.paths.forEach(p=>{
    p.background=background[p.id];
    p.entryReviewIds=[...new Set(p.ids.flatMap(id=>(C.chapterGuides[id].prerequisites||[]).filter(pr=>!p.ids.includes(pr))))];
    if(p.id==='mle')p.entryReviewIds.unshift('coding-drills');
  });
})(window.PREP_CONTENT);

(function(C){
 const purposes={
  'https://lightgbm.readthedocs.io/en/latest/Features.html':'Primary explanation of leaf-wise growth and histogram binning. XGBoost also supports histogram methods and configurable growth; compare actual versions and equal benchmark budgets.',
  'https://arxiv.org/abs/2205.14135':'Original FlashAttention paper. Inspect IO traffic, tiling and online softmax; speed depends on the selected workload and supported implementation.',
  'https://www.youtube.com/watch?v=3CC4N4z3GJc':'Visual introduction to fitting additional trees to residuals or the current ensemble objective gradient.'
 };
 Object.values(C.readings).forEach(rs=>rs.forEach(r=>{if(purposes[r.u]){r.w=purposes[r.u];r.purpose=r.w;}}));
})(window.PREP_CONTENT);
