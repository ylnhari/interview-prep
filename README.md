# Interview Prep

A free course for machine learning and software engineering interviews, with chapters, worked examples, and practice questions. The same local engine can also build private interview notes from packs that are not part of the public course.

**What's inside:** forty-two chapters in six tracks: system design (fourteen chapters from requirements and APIs through databases, caching, distributed systems, storage engines, queues, search, counting, realtime delivery and reliability, to ten worked cases), production ML systems, LLMs in production (inference engineering, fine-tuning, retrieval and agents), maths and ML foundations, decision systems (forecasting, optimisation, control, reinforcement learning), and practice (scenarios, coding drills, five question banks with about three hundred questions). Every chapter defines its terms first, has animated concept diagrams, practice exercises with marking guides, and a short list of the best videos and articles on the subject.

Private packs are excluded from the public build. The GitHub Pages site builds only `packs/course` into `public-dist/`; it does not scan or upload the local `dist/` directory.

**What a page gives you**

- Chapters in importance order, each with a Key terms section (every term defined before use), animated concept diagrams (inline SVG, both themes), primary-source readings with a time estimate, quick checks, a "map it onto your own work" recall exercise, practice exercises with marking guides, and a spoken answer to rehearse against the interviewer's question.
- Question banks with answers inline (toggle to self-test) and a general glossary. Private packs can add a round or interviewer profile with confirmed facts separated from inferences.
- A roadmap page (`index.html` on the public site, `dist/index.html` for local builds) linking tracks, chapters and sections with browser-saved progress.
- Progress is saved in the browser and can be exported or imported as a JSON file. Public visitors can read the course without signing in and keep progress locally. The authorized owner can sign in from the public course page or the separate private dashboard to sync chapter/checklist progress and quiz selections; free-form answer drafts and grading history stay in this browser and are not synced. Roadmap progress remains browser-local. Exercises include a strong answer to compare against and can be self-marked as practised.

## See it online

The public course and roadmap are published from this repository with GitHub Pages: **https://ylnhari.github.io/interview-prep/** (rebuilt on every push by `.github/workflows/pages.yml`). The public site is open to any engineer; no account is needed to read the course. The authorized owner can sign in from the public course page or the separate private dashboard to sync chapter/checklist progress and quiz selections; free-form answer drafts and grading history stay in this browser and are not synced. Roadmap progress remains browser-local. No private interview pack is part of the Pages artifact. Hosting private content is optional and independent of this public deployment.

## Quick start

```
python engine/roadmap.py            # local workflow: builds available packs under packs/ plus dist/index.html
python engine/public_build.py       # public workflow: builds only packs/course into public-dist/
python engine/serve.py              # loopback server; prints http://127.0.0.1:<port>/
node engine/check.js dist/course.html
node engine/test_io.js               # progress export/import round-trip
```

Python 3.9+ and Node 18+ (Node is used only for validation and the roadmap summary). No other dependencies.

## Your own packs stay private

`packs/*` is ignored by git except `packs/_template/` and `packs/course/`. Create `packs/<company-role>/<round>/content.js` from the template. A pack can carry an `overlays.js` that adds experience, recall exercises and spoken answers to shared chapters, and a one-sentence `honesty` rule that the grader applies to every exercise. Local builds may include such packs; `engine/public_build.py` never discovers or includes them.

## Authoring

`docs/extending.md` explains how to add a chapter or a diagram in its own file. `docs/content-schema.md` is the contract: the content object, the two voices (coach vs candidate), define-before-use, the honesty rule, diagrams by id, importance ordering. `engine/viz-catalog.md` lists the diagrams (about 170). Add a diagram to `engine/viz-lib.js` following its helper conventions (CSS-variable colours only, `uid`-prefixed ids, the shell's animation classes).

## Layout

```
engine/    shell.html, viz-lib.js + viz/*.js (diagrams), viz-catalog.md, build.py, roadmap.py, public_build.py, check.js, serve.py, portlib.py
core/      library.js + one file per track — the shared chapters (window.PREP_CORE)
packs/     _template/  course/  <your private packs, ignored>
docs/      content-schema.md
dist/      local built pages (ignored)
public-dist/ allowlisted GitHub Pages artifact
local/     machine-specific notes (ignored)
```

## Local server

`engine/serve.py` binds `127.0.0.1` only and resolves its port as `--port` → `INTERVIEW_PREP_PORT` → a workspace `ports.json` found by walking up from the repository → default `8781`. The resolver (`engine/portlib.py`) is self-contained; a fresh clone runs with no configuration.

## License

MIT.
