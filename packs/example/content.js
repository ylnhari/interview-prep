// Public demo pack. It uses the eight shared core chapters unchanged and adds nothing
// candidate-specific: no overlay, a neutral honesty sentence, and public readings only.
// Copy packs/_template/ to start a real pack; see docs/content-schema.md.
window.PREP_CONTENT = {
  meta: {
    id: "example",
    title: "Example: ML Engineer loop",
    eyebrow: "Example pack · ML Engineer · production ML loop",
    heading: "Production ML at scale",
    footer: "Demo pack · exercises are graded against a rubric; progress is saved in this browser."
  },

  // One sentence, copied into every rubric at render time wherever a rubric contains {{HONESTY}}.
  // A real pack replaces this with a sentence naming the candidate's verified record.
  honesty: "Honesty rule: no candidate record was supplied for this pack; grade the answer on correctness and reasoning only and flag any claim of specific production experience as unverified.",

  interviewAt: null,

  groups: [
    { id: "intel", label: "Start here", sub: "what this pack is and how to use it", ids: ["round-intel"] },
    {
      id: "core", label: "Core subjects", sub: "the shared generic chapters",
      ids: [
        "system-design-fundamentals",
        "ml-lifecycle-platform",
        "data-features",
        "serving-and-scale",
        "reliability-ops",
        "genai-platform",
        "scenario-questions",
        "coding-drills"
      ]
    }
  ],

  useCore: [
    "system-design-fundamentals",
    "ml-lifecycle-platform",
    "data-features",
    "serving-and-scale",
    "reliability-ops",
    "genai-platform",
    "scenario-questions",
    "coding-drills"
  ],

  // No candidate-specific or employer-specific material in a public pack.
  overlays: {},

  interviewer: null,

  readings: {
    "system-design-fundamentals": [
      { l: "PRIMER: Circuit Breaker", u: "https://martinfowler.com/bliki/CircuitBreaker.html", w: "The clearest short definition of the pattern, including the half-open state most answers forget.", m: 10 },
      { l: "Caching strategies and best practices", u: "https://aws.amazon.com/caching/best-practices/", w: "Cache-aside, read-through and write-through side by side, with the invalidation consequences of each.", m: 12 }
    ],
    "ml-lifecycle-platform": [
      { l: "MLOps: continuous delivery and automation pipelines in machine learning", u: "https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning", w: "The standard maturity-level framing for the lifecycle, and a good source for stage names.", m: 30 },
      { l: "Argo CD documentation", u: "https://argo-cd.readthedocs.io/en/stable/", w: "What a GitOps reconciliation controller actually does, in the words of the controller itself.", m: 15 }
    ],
    "data-features": [
      { l: "PRIMER: Feast concepts - feature views", u: "https://docs.feast.dev/getting-started/concepts/feature-view", w: "The vocabulary a feature-store question is scored against: entity, feature view, online and offline store.", m: 12 },
      { l: "Apache Beam: streaming pipeline basics", u: "https://beam.apache.org/documentation/basics/", w: "Event time against processing time, windows and watermarks, from the model that defined the terms.", m: 20 }
    ],
    "serving-and-scale": [
      { l: "Horizontal Pod Autoscaling", u: "https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/", w: "What HPA measures, how the stabilisation window works, and why it cannot create nodes.", m: 18 }
    ],
    "reliability-ops": [
      { l: "PRIMER: Service level objectives", u: "https://sre.google/sre-book/service-level-objectives/", w: "Indicator, objective, agreement and error budget, defined once and correctly.", m: 25 },
      { l: "Implementing SLOs", u: "https://sre.google/workbook/implementing-slos/", w: "How to choose a window and a percentile, and what to do when the budget is spent.", m: 30 }
    ],
    "genai-platform": [
      { l: "OWASP Top 10 for LLM Applications", u: "https://owasp.org/www-project-top-10-for-large-language-model-applications/", w: "The guardrail vocabulary an interviewer will use: prompt injection, insecure output handling, data leakage.", m: 20 },
      { l: "vLLM documentation", u: "https://docs.vllm.ai/en/latest/", w: "Continuous batching and paged attention, the two levers behind most LLM throughput answers.", m: 15 }
    ],
    "coding-drills": [
      { l: "PostgreSQL: window functions tutorial", u: "https://www.postgresql.org/docs/current/tutorial-window.html", w: "The one SQL topic that reliably appears in ML-flavoured coding rounds.", m: 15 }
    ]
  },

  glossary: [
    {
      g: "Platform and lifecycle",
      sub: "The words that separate someone who deployed a model from someone who owns a platform.",
      rows: [
        ["Paved road", "The supported default path with guardrails built in, that a team can take without asking permission.", "Name the standard you set, and who adopted it.", "\"we made the compliant path the fastest path\""],
        ["Model registry", "The versioned store of model artefacts with metadata, lineage and approval state, from which deployments are made.", "Name the registry you used and what it recorded.", "\"deployments reference a registry version, never a file path\""],
        ["GitOps", "Git holds the desired state and a controller continuously reconciles the running system to it.", "Name the CI tool, the CD controller and what was declared in Git.", "\"rollback is a revert, and the controller reconciles\""],
        ["Promotion gate", "The automated condition a candidate model must pass before it can replace the incumbent.", "Say honestly how automated yours was.", "\"the incumbent is scored on the same rows, so the comparison is paired\""]
      ]
    },
    {
      g: "Data and features",
      sub: "The densest vocabulary in the course; almost every term can be turned into a question.",
      rows: [
        ["Point-in-time correctness", "Building a training row using only values knowable at the label's timestamp. Also called an as-of join.", "Say whether your training set was built this way, and how.", "\"the join is as-of the label timestamp, not as-of today\""],
        ["Training-serving skew", "The training feature and the serving feature are computed differently, so the model meets a different distribution in production.", "Name the test that would have caught it.", "\"I score the same records through both paths and assert they match\""],
        ["Label latency", "The delay before ground truth arrives, which bounds how often retraining can help.", "State your label horizon in days.", "\"the labels mature in weeks, so the retraining cadence is bounded by labels, not compute\""],
        ["Idempotency key", "A stable identifier derived from an event, so processing it twice has the same effect as processing it once.", "Say whether your sinks tolerated redelivery.", "\"at-least-once delivery plus an idempotency key gives you effectively-once\""]
      ]
    },
    {
      g: "Serving and reliability",
      sub: "The half of the answer that decides whether the design survives contact with production.",
      rows: [
        ["Latency budget", "The end-to-end time allowance, decomposed per hop, with a timeout and a defined failure behaviour for each.", "State your budget and the largest term inside it.", "\"the feature fetch is the largest and most variable term\""],
        ["Degraded path", "A worse but valid answer returned when a dependency fails, instead of an error.", "Say what your fallback returned and how often it fired.", "\"on timeout we score with request-only features and mark the decision degraded\""],
        ["Error budget", "The shortfall an SLO permits, spent on releases; when it is gone, shipping stops.", "Say whether you actually had one.", "\"we have twelve minutes of budget left this month\""],
        ["Shadow deployment", "The new version scores real traffic with its output discarded, so it can be compared at zero customer risk.", "Say whether you ran one before promotion.", "\"shadow first, because scoring can be separated from acting\""]
      ]
    }
  ],

  topics: [
    {
      id: "round-intel",
      title: "How to use this pack",
      level: "warning",
      levelLabel: "Read first",
      why: `This is the public example pack. It carries no candidate record and no employer research: it exists to show the shape of a pack and to let you work through the eight shared core chapters as they ship.`,
      learn: [
        {
          id: "ri-0",
          part: "field",
          title: "Foundations: the words this app uses",
          viz: null,
          body: `<p>Every term the rest of the app assumes, defined once.</p>
<ul>
<li><b>Pack</b> - one interview process, in one folder: a <code>content.js</code> file with the chapters, readings and glossary for that round. This is a pack.</li>
<li><b>Core chapter</b> - a shared, generic chapter that lives in <code>core/library.js</code> and is reused across packs. A pack opts in by listing its id in <code>useCore</code>.</li>
<li><b>Overlay</b> - a private file a pack may add to splice its own material into a core chapter: extra learn chunks, extra exercises, a connect block and a spoken answer. This pack has none, which is why the core chapters here read as pure subject matter.</li>
<li><b>Chunk</b> - one section of a chapter. A <code>field</code> chunk teaches the subject generically; an <code>experience</code> chunk describes what the candidate did; a <code>role</code> chunk applies it to one job. Only field chunks live in core.</li>
<li><b>Activity</b> - a graded exercise: explain, design, code, drill, or answer a follow-up out loud. You write an answer, and it is graded against the chapter's rubric.</li>
<li><b>Rubric</b> - the must-haves and common mistakes an answer is scored against. Every rubric ends with the pack's honesty sentence.</li>
<li><b>Honesty sentence</b> - one sentence per pack naming what the candidate has actually done, so a grader can flag claims that go beyond it. In a real pack it names the verified record; in this one it simply says no record was supplied.</li>
<li><b>In the room</b> - the closing line of every learn chunk: a question to expect, or a phrase to use.</li>
</ul>
<p><b>In the room:</b> the vocabulary above is the app's, not an interviewer's - but "field, experience, role" is a genuinely useful way to structure any answer: the general principle, what you did, and how it applies here.</p>`,
          deeper: `<p>Two design choices are worth knowing before you build your own pack. First, core chapters are deliberately employer-neutral and candidate-neutral, so they can be shared by every pack without leaking anyone's record; anything specific belongs in the pack, or in a pack overlay that is never published. Second, ordering is meaning: chapters, exercises and question-bank entries are listed in order of importance for the round, so the first thing you see is the thing most likely to be asked.</p>`,
          check: {
            question: "Where does material about a specific candidate's own systems belong?",
            options: [
              "In the core chapter, marked with a comment",
              "In the pack, or in the pack's private overlay - never in core",
              "In the engine, so every pack inherits it",
              "In the glossary only"
            ],
            answer: 1,
            explain: "Core is shared by every pack and is meant to be publishable. Candidate and employer material lives in the pack, and the overlay is how it gets spliced back into a core chapter at render time."
          }
        },
        {
          id: "ri-1",
          part: "field",
          title: "How to work through it",
          viz: null,
          body: `<p>A working order that suits most production-ML loops.</p>
<ol>
<li><b>Read the foundations chunk of each chapter first</b>, across all eight chapters, before going deep in any one. Every later chunk assumes those words, and the definitions are cheap.</li>
<li><b>Then take the chapters in listed order.</b> System design fundamentals comes first because every later chapter assumes it; the coding and scenario chapters come last because they are practice rather than new material.</li>
<li><b>Answer the exercises in writing, out loud where the type says so.</b> A design or explain exercise you only think about is not an exercise. The timeboxes are real - an answer that runs long in practice runs long in the room.</li>
<li><b>Read the rubric only after your first attempt.</b> The must-have list is a much better teacher when it tells you what you missed than when it tells you what to write.</li>
<li><b>Use the multiple-choice checks as recall, not as study.</b> They are there to catch a definition you think you know.</li>
</ol>
<p>Progress is stored in this browser only. Nothing you write is sent anywhere by the page itself.</p>
<p><b>In the room:</b> the single most transferable habit in this app is stating structure before content - "there are two health questions here, is it up and is it right" - because interviewers score structure and it is the part you can rehearse.</p>`,
          deeper: `<p>To build a real pack: copy <code>packs/_template/</code>, set <code>meta.id</code> to something unique (it scopes the saved progress), write the honesty sentence for the candidate whose record you actually have, list the core chapters you want in <code>useCore</code>, and add pack-specific chapters for the employer's own systems, the candidate's systems, and the round's logistics. Build it with <code>python engine/build.py packs/&lt;pack&gt;/&lt;round&gt;</code> and validate with <code>node engine/check.js</code>. Keep anything private out of a published repository.</p>`,
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
