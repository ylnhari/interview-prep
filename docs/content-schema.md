# Content schema and authoring rules

A pack round is one file, `content.js`, containing a single statement:

```js
window.PREP_CONTENT = { meta, honesty, interviewAt, groups, useCore, overlays, interviewer, readings, glossary, topics };
```

All HTML strings are backtick template literals. Never write the two characters `${` inside them (the file is inlined as JavaScript). Allowed tags: `p b i ul li code`. The build escapes the page to ASCII, so any character is safe in source.

## Top level

- `meta` — `{ id, title, eyebrow, heading, footer, favicon }`. `id` scopes browser progress storage; `title` becomes the page title; `eyebrow` and `heading` fill the header.
- `interviewAt` — ISO datetime string or `null` (the header shows a countdown, or "date TBD").
- `groups` — ordered menu groups: `[{ id, label, sub, ids: [topicId, ...] }]`. Order = importance. A topic id may come from this pack or from `useCore`.
- `useCore` — array of core chapter ids from `core/library.js` to include (optional).
- `honesty` — the pack's single honesty sentence. The engine substitutes it for the `{{HONESTY}}` placeholder in every rubric at render time. Required whenever the pack uses core chapters.
- `overlays` — pack material spliced into core chapters: `{ topicId: { learn[], connect, activities[], sayQuestion, sayItOutLoud } }`. Usually kept in a separate `overlays.js` beside `content.js` (as `window.PREP_OVERLAYS`), which the build inlines when present.
- `interviewer` — `{ name, title, background[], probes[], overlap[], avoid[], sources[{label,url}] }` or `null`. Label confirmed vs inferred in the text.
- `readings` — `{ topicId: [{ l: label, u: url, w: why, m: minutes }] }`. Only URLs that resolve. Prefix primers with `PRIMER:`.
- `glossary` — `[{ g: group, sub, rows: [[term, meaning, whereInRecord, sayItAs], ...] }]`.
- `topics` — the chapters.

## Topic

```js
{ id, title, level: 'danger'|'warning'|'good', levelLabel, why,
  learn: [ { id, part: 'field'|'experience'|'role', title, viz?, body, deeper|null,
             check: { question, options[], answer: index, explain } | null } ],
  connect: { project, prompt, model, rubric } | null,
  activities: [ { id, type: 'explain'|'formulate'|'followup'|'story'|'drill'|'design'|'code',
                  title, viz?, prompt, timeboxSec|null, rubric, model } ],
  sayQuestion|null, sayItOutLoud|null }
```

- Part order inside a chapter: `field` (the subject, generic) → `experience` (what the candidate did, with the correct technical names, and the honest boundary) → `role` (how it applies to this role, from the job description and recruiter information only).
- Chapters in `core/library.js` carry `field` chunks only, and their `connect`, `sayQuestion` and `sayItOutLoud` are `null`: core is shared by every pack and must name no candidate and no employer. A pack supplies its own `experience` and `role` chunks, exercises, connect block and spoken answer through its overlay. The engine splices overlay learn chunks in after the last `field` chunk, appends overlay activities, and sets the connect and say fields.
- The first learn chunk of every core chapter is titled `Key terms`: every term the chapter uses, each defined in one sentence with an example. Later chunks may use those words freely; never introduce a new undefined term.
- No learn chunk carries an `In the room:` closing paragraph. Bodies teach the subject; they do not narrate the document. Sentences that explain the page rather than the subject ("this chapter covers…", "you will be asked…", "as an assessor would…") do not belong in core.
- `viz` names a diagram id from `engine/viz-catalog.md`; the shell renders it at the top of the section. Use it where the diagram shows the mechanism; foundations, glossary and question-bank chunks usually have none.
- `link: { url, label }` on a learn chunk renders a prominent "Open in the course" button (new tab) under the chunk title, before the body; the chunk's tick button then reads "Mark done". Used by private packs that send the reader to a generic chapter on the public site and back.
- `kind: "prereqs"` on a topic renders its learn chunks as a compact checklist (title, one-line body, the link button, a done tick) instead of prose sections, and its header shows "n of m done". Such a chapter carries no `activities`; the home page shows the pack with a "Prerequisites: n of m generic chapters done" line.
- A chapter whose chunks all share one `part` shows no part headers; the "Part 1 / 2 / 3" movements appear only when a chapter mixes `field`, `experience` and `role` chunks.
- Question-bank chapters: id containing `question-bank` (`question-bank-fundamentals`, `question-bank-mle`, or a pack's own `mle-question-bank`); body lists `<li><b>Qn.</b> …</li>`, deeper lists `<li><b>An.</b> …</li>` in the same order; the shell pairs them and adds a hide/show toggle.

## Two kinds of chapter

Not every chapter is a lesson. Decide which kind a chapter is before writing it, and do not apply the teaching format to the other kind.

- **A teaching chapter** explains a subject the reader must be able to use: Key terms first, sections that build, a quick check per section, exercises with a marking guide, a spoken answer. Core chapters are all of this kind.
- **A reading chapter** gives context the reader needs to have in mind: what the interview day looks like, what a company builds, what its engineering writing says, what other people reported. It is written as a briefing. It carries no quizzes (`check: null` throughout) and no exercises (`activities: []`); if an exercise is worth doing, it belongs in a practice chapter. It ends with one short section, "What this means for you", which is the only place that advises what to say. Explain the subject before advising on it: a chapter about a company's systems opens with what the company builds, never with what not to claim.

A quiz belongs only where the chapter teaches something the reader must be able to use under pressure, and only when it tests substance. A question about how a mechanism works, what a service does, a number or a trade-off earns its place. A question about how to present, what to say, how a panel scores, or how to lay out a deck does not: leave that as reading and let the exercises be the practice. Chapters that describe an interview, a company, its published values, other candidates' reports, or a plan for the day carry none. The orientation chapter of a course carries none either: never quiz the reader on how the site works.

Every term that points at a concept the reader has not met must be explained where it is used, or the chapter that explains it must be named. Writing "layer 4" without first saying that network software is described in layers, that layer 4 is the transport layer of addresses and ports and layer 7 is the application layer where the request itself is visible, leaves the term pointing at nothing.

Do not teach the vocabulary of the hiring process as if it were a subject. Name the terms the reader will actually hear, in one paragraph, inside the chapter that describes the day.

Material drawn from other people's reported interviews is good-to-have. Say so in its opening sentence, say that their role may differ from the reader's, and use "worth skimming" rather than "you must know". Such a chapter's `levelLabel` is "Good to have".

Never pose a question without answering it. Any question in a body, list or prompt carries its answer within a few sentences, unless it is a question-bank chapter, where the answers live in `deeper` and the reader reveals them.

Extra detail is part of the reading. Outside question banks the engine appends `deeper` to `body` and renders one continuous piece, so write it as a continuation, not as an aside the reader might skip. The engine also rotates each quiz's options at render time, so the correct answer never sits in the same place twice; never refer to an option by letter or position.

## Packs: the public course and private packs

- `packs/course/content.js` is the public course: it uses every chapter in `core/library.js` through `useCore`, carries a neutral `honesty` sentence, `overlays: {}`, `interviewer: null` and `interviewAt: null`, and its `groups` are reading-order tracks rather than a round's agenda. It contains no candidate record and no employer research, and it is the pack the published site is built from. Its own `start-here` topic explains the course, the recommended path and how progress is exported.
- `packs/<private>/<round>/content.js` is one interview process. It lists the core chapters it wants in `useCore`, adds its own chapters for the employer's systems, the candidate's systems and the round's logistics, and puts everything candidate- or employer-specific for a core chapter in a sibling `overlays.js`. `packs/*` is ignored by git except `packs/_template/` and `packs/course/`.
- Chunk and activity ids must be unique across `core/library.js` and every overlay a pack loads, because the engine merges them into one chapter.

## Voice

- Coach voice (addressed to the reader as "you"): `why`, learn bodies, `deeper`, prompts, rubrics, interviewer block. In core it never addresses a specific candidate.
- Candidate voice (first person, spoken to the interviewer): `sayItOutLoud`, `connect.model`, and `model` of `followup`/`story` activities. These are words the candidate would actually say. No commentary about the answer, no references to the document, no second-person coaching inside quotes. 140–250 words for a 60–90-second answer.
- `sayQuestion` states the interviewer question the spoken answer answers; every exercise prompt states the question in the interviewer's words.

## Plain English

- Use the words a normal engineer uses in conversation. No coach idioms or figurative shorthand: not "loop" for the interview rounds, "shape" for a format, "spine", "seam", "in flight", "lever", "rung", "movement", "beat", "cadence" (outside control theory and scheduling), "frame", "narrative", "anchor", "hook", "land", "surface" as a verb, "the room", "muscle", "crisp", "tight", "unpack", "dig into", "under the hood", "north star", "table stakes", "double-click", "zoom out", "move the needle". Say "the interview rounds", "the format", "the structure", "while it is running", "the setting", "the step", "the part", "the point", "how often", "describe", "the story", "base on", "an opening for a follow-up question", "come across clearly", "show", "the interview".
- Keep a word when it is the correct technical name (control loop, feedback loop, training loop, loop frequency, API surface area, tensor shape, latency budget). Test: would a textbook use it?
- Short, direct sentences. A reader should never have to guess what a word stands for.
- Words we replaced in the audit of 9 September 2026, and what to write instead: assessor (interviewer); gate as a noun or verb (the checks before release, decides whether it gets traffic); signal meaning an impression (evidence, what they take away); probe as a verb (ask about, press on); surface as a verb (bring up, show); verdict, retry, pass as marks (passed, try again); overclaim (claiming more than you did); honest boundary (saying what you have and have not done); your record (your experience, what you have actually built); the candidate meaning the reader (you); artifact meaning a document (the deck, the diagram, the file); chunk (section); pack (this course, these chapters); activity (exercise); drill as a noun (practice problem); rubric (marking guide); grade (mark); stance (position); harness (the setup); calibrate figuratively (check, judge); instrument as a verb (measure); first-class (in its own right); incumbent (the model already in production); generic (general, shared); prompts meaning interview questions (questions); compensation (pay); tenancy (keeping customers separate); externalise (say out loud); operationalise, generalisable, second-order (plain equivalents). Keep candidate model, readiness probe, network retry, statistical calibration, build artifact, and a company's own round names.

## Honesty rule

Each pack defines one sentence in `honesty`, naming the candidate's verified record and the claims that are automatic retries (tools, methods or experience not in the record). Every `rubric` and `connect.rubric` ends with the placeholder `{{HONESTY}}`, which the engine replaces with that sentence at render time; a pack that omits `honesty` gets a neutral fallback that grades on correctness only. Graders receive the sentence with every attempt; overclaims are named in feedback.

## Facts

- Candidate facts come only from the verified record (the résumé/profile the candidate approved). No invented metrics, titles, tools, clients or incidents. Model answers for incident or conflict stories give the shape and say so when the record has no specific incident.
- Employer facts carry a source and date in the text, e.g. "(Company engineering blog, Oct 2020)". Third-party interview reports are labelled unverified and cited by role, city and month. Anything the sources do not say is stated as unknown so the candidate never overclaims internals.
- Industry, internal team and ML problem type are different axes; do not list an internal team as an industry.

## Ordering

Chapters in `groups`, activities within a chapter, drills and question-bank chunks are ordered by importance for the round. Add and revise rather than delete; delete only what is clearly irrelevant, and say what was removed.
