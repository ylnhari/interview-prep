# Interview Prep

A private, local-first application for preparing for technical interviews: a reusable engine that renders course-style prep pages (chapters with foundations, animated concept diagrams, readings, Claude-graded exercises, spoken answers, a question bank and a glossary) from content packs. One pack per interview process (company, role, round); shared generic chapters live in `core/` and are reused across packs.

Read this file, then `README.md`, then the pack you are working on.

## Layout

- `engine/shell.html` — the page template. Everything shown is driven by the content object it is built with; do not put pack-specific text here.
- `engine/viz-lib.js` — the animated inline-SVG concept-diagram library (`window.VIZLIB`, `window.VIZLIB_CAPTIONS`), referenced from content by `viz: "<id>"`. `engine/viz-catalog.md` lists the ids.
- `engine/build.py` — builds one pack round into `dist/<pack>__<round>.html` (inlines viz library, core chapters and the pack content; escapes the output to pure ASCII so it renders correctly regardless of host charset). Usage: `python engine/build.py packs/<pack>/<round>`.
- `engine/serve.py` — loopback-only static server for `dist/` (see Local server below).
- `engine/check.js` — schema validation for a built page or a content file (`node engine/check.js dist/<file>.html`).
- `engine/roadmap.py` — builds every pack round and `dist/index.html`, the fan-out map of every pack → chapter → section with deep links and progress.
- `core/library.js` — shared GENERIC chapters (`window.PREP_CORE = { <topicId>: topic }`), field-level only: no candidate, employer or role-specific text; rubrics carry the placeholder `{{HONESTY}}` which the engine replaces with the pack's sentence. A pack lists the chapters it uses in `useCore`.
- `packs/<pack>/<round>/content.js` — one round's content (`window.PREP_CONTENT = {...}`) with `honesty`, `useCore`, and optional `overlays.js` (`window.PREP_OVERLAYS = { topicId: { learn, activities, connect, sayQuestion, sayItOutLoud } }`) that splices candidate-specific material into core chapters at runtime. `notes*.md` hold the round's intel and sources. Only `packs/_template/` and `packs/example/` are tracked; every other pack is ignored and private.
- `docs/content-schema.md` — the content object schema and authoring rules (voice, honesty rule, define-before-use, diagrams).
- `local/` (ignored) — machine-specific settings, published-artifact URLs, scratch builds.
- `dist/` (ignored) — built pages.

## Content rules (summary; full text in `docs/content-schema.md`)

- Two voices, never mixed: coach voice (bodies, deeper, why, prompts, rubrics, "In the room" lines) and candidate voice (spoken answers, follow-up and story model answers, recall-exercise model). Candidate-voice blocks are things the candidate would actually say, in first person, with no commentary about the answer.
- Every chapter opens with a Foundations chunk defining every term it uses; terms are defined before use in reading order; every learn chunk ends with an `In the room:` line.
- Every rubric carries the pack's single honesty sentence verbatim, tied to the candidate's verified record; graders must flag overclaims. No invented facts about the candidate or the employer; employer facts carry a source and date; unverified third-party reports are labelled as such.
- Order chapters, drills and questions by importance for the round. Add and revise rather than delete; delete only what is clearly irrelevant.
- Diagrams: reference ids from `engine/viz-catalog.md`; add new diagrams to `engine/viz-lib.js` following its helper conventions (CSS-variable colours only, `uid`-prefixed ids, the shell's animation classes).

## Local server

Bind `127.0.0.1` only. Resolve the port through the vendored resolver (`engine/portlib.py`): `--port` → `INTERVIEW_PREP_PORT` → workspace `ports.json` (walked up from the repository) → documented default `8781`. Never hunt for a free port. Run `python engine/serve.py` and open the printed URL; it lists `dist/`.

Phone access is by publishing a built page as a private Claude artifact from a Claude Code session; record the URL in `local/artifacts.md` (ignored), never in tracked files.

## Working alongside other tools

This repository owns prep content and its rendering, nothing else. A job-search tracker should point at a pack here when an interview is scheduled rather than duplicating prep material; a mock-interview workflow can draw questions from a pack's question bank and grade against its rubrics; a learning workspace can host worked derivations or notebooks that a chapter's readings link to. Machine-specific links to such tools belong in `local/` (ignored), not here.

## Privacy and gates

- Public repository (MIT). Everything tracked must be generic: engine, core chapters, docs, template, example pack. Personal or company-specific packs, notes, glossaries of the candidate's record, published-artifact URLs and machine settings live only in ignored paths (`packs/<private>`, `local/`, `dist/`). Before any commit, grep the staged files for employer names, personal identifiers, credentials and absolute user paths.
- Creating or editing files does not authorise a commit, push, publication or account action; each needs the user's explicit approval for the current task.

## Validation before handoff

```
python engine/build.py packs/<pack>/<round>
node engine/check.js dist/<pack>__<round>.html
git status --short
```
Scan changed tracked files for credentials and absolute user paths.
