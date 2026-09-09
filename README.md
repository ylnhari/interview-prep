# Interview Prep

Build course-style interview preparation pages from content packs: one engine, many packs. Each pack is one interview process (company, role, round). Generic chapters that every ML/software engineering loop needs live in `core/` and are reused by every pack; the company-specific material — your own story, the role's expectations, the interviewer, the reported questions — is yours and stays out of this repository.

**What a page gives you**

- Chapters in importance order, each with a Key terms section (every term defined before use), animated concept diagrams (inline SVG, both themes), primary-source readings with a time estimate, quick checks, a "map it onto your own work" recall exercise, graded exercises with a stated honesty rule, and a spoken answer to rehearse against the interviewer's question.
- A question bank with answers inline (toggle to self-test), a glossary of "what you built and what to call it", and a round or interviewer profile with confirmed facts separated from inferences.
- A roadmap page (`dist/index.html`) fanning out every pack → chapter → section with deep links and progress, so nothing gets missed.
- Progress saved in the browser, with Export/Import buttons in the header to carry it between devices as a JSON file. When a page is published as a Claude artifact, exercises are graded by Claude in-page and progress syncs server-side; served locally or on GitHub Pages, exercises show a strong answer to compare against and can be marked practised.

## See it online

The public course and the roadmap are published from this repository with GitHub Pages: **https://ylnhari.github.io/interview-prep/** (rebuilt on every push by `.github/workflows/pages.yml`). Online, exercises show a strong answer to self-check against; in-page grading by Claude is available only when a built page is published as a Claude artifact.

## Quick start

```
python engine/roadmap.py            # builds every pack under packs/ plus dist/index.html
python engine/serve.py              # loopback server; prints http://127.0.0.1:<port>/
node engine/check.js dist/course.html
node engine/test_io.js               # progress export/import round-trip
```

Python 3.9+ and Node 18+ (Node is used only for validation and the roadmap summary). No other dependencies.

## Your own packs stay private

`packs/*` is ignored by git except `packs/_template/` and `packs/course/`. Create `packs/<company-role>/<round>/content.js` from the template; it never leaves your machine unless you publish the built page yourself. A pack can carry an `overlays.js` that splices your experience, recall exercises and spoken answers into the shared core chapters, and a one-sentence `honesty` rule that the grader applies to every exercise.

## Authoring

`docs/content-schema.md` is the contract: the content object, the two voices (coach vs candidate), define-before-use, the honesty rule, diagrams by id, importance ordering. `engine/viz-catalog.md` lists the sixty diagrams. Add a diagram to `engine/viz-lib.js` following its helper conventions (CSS-variable colours only, `uid`-prefixed ids, the shell's animation classes).

## Layout

```
engine/    shell.html, viz-lib.js, viz-catalog.md, build.py, roadmap.py, check.js, serve.py, portlib.py
core/      library.js  — shared generic chapters (window.PREP_CORE)
packs/     _template/  course/  <your private packs, ignored>
docs/      content-schema.md
dist/      built pages (ignored)
local/     machine-specific notes (ignored)
```

## Local server

`engine/serve.py` binds `127.0.0.1` only and resolves its port as `--port` → `INTERVIEW_PREP_PORT` → a workspace `ports.json` found by walking up from the repository → default `8781`. The resolver (`engine/portlib.py`) is self-contained; a fresh clone runs with no configuration.

## License

MIT.
