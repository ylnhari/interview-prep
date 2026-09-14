# Interview Prep

A local-first interview-preparation engine with a public course and optional private packs. It renders chapters, concept diagrams, readings, exercises, spoken answers, question banks and glossaries. One private pack can be used per interview process (company, role, round); shared chapters live in `core/`.

Read this file, then `README.md`, then the pack you are working on.

## Layout

- `engine/shell.html` — the page template. Everything shown is driven by the content object it is built with; do not put pack-specific text here.
- `engine/viz-lib.js` plus `engine/viz/*.js` — the animated inline-SVG concept-diagram library (`window.VIZLIB`, `window.VIZLIB_CAPTIONS`), referenced from content by `viz: "<id>"`. `engine/viz-catalog.md` lists the ids. New diagrams go in a new file under `engine/viz/` using `window.VIZLIB_HELPERS` (see `docs/extending.md`).
- `engine/build.py` — builds one pack round into `dist/<pack>__<round>.html` (inlines viz library, core chapters and the pack content; escapes the output to pure ASCII so it renders correctly regardless of host charset). Usage: `python engine/build.py packs/<pack>/<round>`.
- `engine/serve.py` — loopback-only static server for `dist/` (see Local server below).
- `engine/check.js` — schema validation for a built page or a content file (`node engine/check.js dist/<file>.html`).
- `engine/roadmap.py` — builds every pack round and `dist/index.html`, the course home page: each pack as a card, its tracks as a vertical path of chapters and sections with deep links and progress; packs with a `kind: "prereqs"` chapter are listed after the course with a "Prerequisites: n of m" line. Change only `render_index`, its CSS and its script; standard library only.
- `engine/public_build.py` — builds the explicitly allowlisted `packs/course` into `public-dist/`, with public-only roadmap, metadata, `robots.txt` and sitemap. It never scans local packs or reads from `dist/`. Optional `--cloud-config` accepts public Firebase web settings only; never include owner identifiers or credentials.
- `engine/test_io.js` — unit test for the progress export/import functions in the shell (`node engine/test_io.js`). Progress lives in `localStorage` under `prep-state-<meta.id>-v1`; the header's Export/Import buttons move it between devices as a JSON file.
- `core/library.js` plus `core/<track>.js` — shared GENERIC chapters (`window.PREP_CORE[<topicId>] = topic`; the build loads `library.js` first, then the rest in name order), field-level only: no candidate, employer or role-specific text; rubrics carry the placeholder `{{HONESTY}}` which the engine replaces with the pack's sentence. A pack lists the chapters it uses in `useCore`.
- `packs/<pack>/<round>/content.js` — one round's content (`window.PREP_CONTENT = {...}`) with `honesty`, `useCore`, and optional `overlays.js` (`window.PREP_OVERLAYS = { topicId: { learn, activities, connect, sayQuestion, sayItOutLoud } }`) that splices candidate-specific material into core chapters at runtime. `notes*.md` hold the round's intel and sources. Only `packs/_template/` and `packs/course/` are tracked; every other pack is ignored and private.
- `packs/course/content.js` — the public course (tracked): every core chapter, grouped into reading-order tracks, with a neutral honesty rule, public readings, a general glossary and no overlay. It is the only pack included in the Pages artifact.
- `docs/content-schema.md` — the content object schema and authoring rules (voice, plain English, honesty rule, define-before-use, diagrams). `docs/extending.md` — how to add chapters and diagrams in separate files.
- `local/` (ignored) — machine-specific settings, published-artifact URLs, scratch builds.
- `dist/` (ignored) — built pages.

## Content rules (summary; full text in `docs/content-schema.md`)

- Two voices, never mixed: coach voice (bodies, deeper, why, prompts, rubrics) and candidate voice (spoken answers, follow-up and story model answers, recall-exercise model). Candidate-voice blocks are things the candidate would actually say, in first person, with no commentary about the answer.
- Every chapter opens with a `Key terms` chunk defining every term it uses; terms are defined before use in reading order. No chunk carries an `In the room:` line, and no core text explains the document rather than the subject or addresses a specific candidate.
- Every rubric carries the pack's single honesty sentence verbatim, tied to the candidate's verified record; graders must flag overclaims. No invented facts about the candidate or the employer; employer facts carry a source and date; unverified third-party reports are labelled as such.
- Order chapters, drills and questions by importance for the round. Add and revise rather than delete; delete only what is clearly irrelevant.
- Diagrams: reference ids from `engine/viz-catalog.md`; add new diagrams to `engine/viz-lib.js` following its helper conventions (CSS-variable colours only, `uid`-prefixed ids, the shell's animation classes).

## Local server

Bind `127.0.0.1` only. Resolve the port through the vendored resolver (`engine/portlib.py`): `--port` → `INTERVIEW_PREP_PORT` → workspace `ports.json` (walked up from the repository) → documented default `8781`. Never hunt for a free port. Run `python engine/serve.py` and open the printed URL; it lists `dist/`.

The GitHub Pages site is open to any engineer and builds only the public course. Visitors can keep progress locally; the authorized owner can sign in from the public course page or the separate private dashboard to sync chapter/checklist progress and quiz selections. Free-form answer drafts and grading history stay in the browser and are not synced. Roadmap progress remains browser-local. Hosting private content is an optional, independent deployment and is not part of the public Pages build.

## Working alongside other tools

This repository owns prep content and its rendering, nothing else. A job-search tracker should point at a pack here when an interview is scheduled rather than duplicating prep material; a mock-interview workflow can draw questions from a pack's question bank and grade against its rubrics; a learning workspace can host worked derivations or notebooks that a chapter's readings link to. Machine-specific links to such tools belong in `local/` (ignored), not here.

## Privacy and gates

- Public repository (MIT). Everything tracked must be generic: engine, core chapters, docs, template, the public course pack. Personal or company-specific packs, notes, glossaries of the candidate's record, published-artifact URLs and machine settings live only in ignored paths (`packs/<private>`, `local/`, `dist/`). Before any commit, grep the staged files for employer names, personal identifiers, credentials and absolute user paths.
- Creating or editing files does not authorise a commit, push, publication or account action; each needs the user's explicit approval for the current task.

## Validation before handoff

```
python engine/build.py packs/<pack>/<round>
node engine/check.js dist/<pack>__<round>.html
node engine/test_io.js
git status --short
```
Scan changed tracked files for credentials and absolute user paths.

Public Pages validation uses `python engine/public_build.py`, then validates `public-dist/course.html` with
`node engine/check.js`. Upload only `public-dist/`; never upload `dist/` or all of `packs/`.

## Living artifacts

- GitHub Pages at `https://ylnhari.github.io/interview-prep/` describes the current public course. Refresh it after an approved public-course change through `.github/workflows/pages.yml`; that workflow builds only `packs/course` into `public-dist/`.
