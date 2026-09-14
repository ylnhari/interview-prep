# Maintaining the public course

This is the canonical handoff for any assistant or human. Read `AGENTS.md`,
`README.md` and this file first. If a tool does not auto-load repository
instructions, explicitly ask it to read those files. `CLAUDE.md` is only a thin
entry point; no workflow depends on that tool, a conversation or native memory.

## Scope and sources of truth

- `core/`, `packs/course/` and the generic renderer are canonical public source.
- Public Pages is guest-only, with browser-local progress and export/import.
- An owner-authorized private companion may consume a committed course snapshot
  and renderer. It is a separate deployment, not part of this public build.
- Never publish local private packs or put private deployment credentials in
  public Actions. This public repository must work for unrelated contributors.

## Routine update

1. Inspect `git status --short`, the diff and the current published revision.
   Preserve unrelated work. Do not stage the entire checkout.
2. Edit generic content or renderer. Follow `content-schema.md` and preserve pack,
   topic, section and activity IDs. Preserve existing quiz questions, ordered
   options and answer indices until an explicit compatibility review resolves
   any changes. A retained section ID cannot make a different answer mean the
   same thing. Never reset progress as a shortcut.
3. Run the checks below and review the rendered page, including the affected
   section on a phone-sized viewport. Use synthetic state for write tests.
4. With publication authority, commit only the reviewed files. Run the committed
   revision comparison before pushing; `BASE_SHA` is the full SHA of the last
   relevant published/reviewed baseline, not an arbitrary recent commit.
5. Scan the entire unpushed history for private data, credentials and machine
   paths. Push normally; never force-push to bypass the checks.
6. Confirm the Pages run succeeded and inspect the actual public page. A green
   build alone does not prove that the page is live or correct.
7. When maintaining the owner's paired dashboards, follow the downstream handoff
   below before reporting the combined task complete.

```sh
python engine/public_build.py
node engine/check.js public-dist/course.html
node engine/test_io.js
node engine/test_cloud_progress.js
node engine/test_teaching_order.cjs
node engine/test_initial_hydration.cjs
node --test engine/test_progress_compatibility.cjs
node engine/check_progress_compatibility.cjs BASE_SHA HEAD_SHA
```

Use full resolved Git commit hashes for the final command. It reads only
committed allowlisted public sources, so it does not validate uncommitted edits.
The compatibility check is deliberately conservative: an existing quiz text or
mapping change needs deliberate review, even when intended as a correction.
It does not prove that new prose is accurate, or that old completion marks mean
the reader has studied a rewritten lesson. Do not remove the guard merely to
make a release pass; agree a scoped content/progress migration when necessary.

## Downstream handoff for the owner's paired dashboards

This is a maintainer obligation only when the private companion is authorized
and accessible. It does not require public contributors to access private data.

1. Record the exact public commit that was reviewed and published.
2. Open the separately authorized private repository and read its `AGENTS.md`,
   `README.md` and `docs/maintenance.md`. Use its `sync-public-course.cjs` tool;
   do not copy a dirty working tree or embed private content in public output.
3. Refresh both the immutable course snapshot and matching renderer. Publish
   changed private content using its revision-checked content publisher; deploy
   Hosting only when the built runtime changed. Preserve personal packs and all
   progress. Run the private readback and live verification gates.
4. Report the two results independently. If private access, login, connectivity
   or review is unavailable, state **public updated; private sync pending** with
   the public SHA and the missing step. Never claim background synchronization.

Private and public deployments cannot be atomically released together. After an
interruption, inspect the actual published revisions and finish the remaining
steps; do not blindly repeat a content write with an uncertain outcome.

## Recovery

For a UI regression, restore reviewed code with a new ordinary commit after
review, rebuild and verify the live page. Preserve content IDs and browser state.
For a content incompatibility, stop and resolve it before publication. Never
delete browser storage or instruct visitors to clear their progress to fix a
maintenance failure. Export/import is the portable recovery path for users.
