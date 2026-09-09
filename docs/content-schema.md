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

## Packs: the public course and private packs

- `packs/course/content.js` is the public course: it uses every chapter in `core/library.js` through `useCore`, carries a neutral `honesty` sentence, `overlays: {}`, `interviewer: null` and `interviewAt: null`, and its `groups` are reading-order tracks rather than a round's agenda. It contains no candidate record and no employer research, and it is the pack the published site is built from. Its own `start-here` topic explains the course, the recommended path and how progress is exported.
- `packs/<private>/<round>/content.js` is one interview process. It lists the core chapters it wants in `useCore`, adds its own chapters for the employer's systems, the candidate's systems and the round's logistics, and puts everything candidate- or employer-specific for a core chapter in a sibling `overlays.js`. `packs/*` is ignored by git except `packs/_template/` and `packs/course/`.
- Chunk and activity ids must be unique across `core/library.js` and every overlay a pack loads, because the engine merges them into one chapter.

## Voice

- Coach voice (addressed to the reader as "you"): `why`, learn bodies, `deeper`, prompts, rubrics, interviewer block. In core it never addresses a specific candidate.
- Candidate voice (first person, spoken to the interviewer): `sayItOutLoud`, `connect.model`, and `model` of `followup`/`story` activities. These are words the candidate would actually say. No commentary about the answer, no references to the document, no second-person coaching inside quotes. 140–250 words for a 60–90-second answer.
- `sayQuestion` states the interviewer question the spoken answer answers; every exercise prompt states the question in the interviewer's words.

## Honesty rule

Each pack defines one sentence in `honesty`, naming the candidate's verified record and the claims that are automatic retries (tools, methods or experience not in the record). Every `rubric` and `connect.rubric` ends with the placeholder `{{HONESTY}}`, which the engine replaces with that sentence at render time; a pack that omits `honesty` gets a neutral fallback that grades on correctness only. Graders receive the sentence with every attempt; overclaims are named in feedback.

## Facts

- Candidate facts come only from the verified record (the résumé/profile the candidate approved). No invented metrics, titles, tools, clients or incidents. Model answers for incident or conflict stories give the shape and say so when the record has no specific incident.
- Employer facts carry a source and date in the text, e.g. "(Company engineering blog, Oct 2020)". Third-party interview reports are labelled unverified and cited by role, city and month. Anything the sources do not say is stated as unknown so the candidate never overclaims internals.
- Industry, internal team and ML problem type are different axes; do not list an internal team as an industry.

## Ordering

Chapters in `groups`, activities within a chapter, drills and question-bank chunks are ordered by importance for the round. Add and revise rather than delete; delete only what is clearly irrelevant, and say what was removed.
