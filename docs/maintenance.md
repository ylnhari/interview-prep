# Maintaining the public course

This is the canonical handoff for any assistant or human. Read `AGENTS.md`,
`README.md` and this file first. If a tool does not auto-load repository
instructions, explicitly ask it to read those files. `CLAUDE.md` is only a thin
entry point; no workflow depends on that tool, a conversation or native memory.

## Scope and sources of truth

- `core/`, `packs/course/` and the generic renderer are canonical public source.
- Public Pages is static and builds only `packs/course`. Guest learning, browser-local progress and export/import must work with no Firebase configuration.
- Optional public Google sync uses a separate Spark project and a bounded per-user progress document. It is not a course-content store and does not include private packs, user profile data or grading history. Its detailed contract is `public-sync.md`.
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
node engine/test_public_progress.js
node engine/test_public_shell_behavior.cjs
node engine/test_rag_architecture.cjs
python -m unittest engine.test_public_build
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

The full pull-request check suite also requires Node 20+, Java 21, and the
pinned development dependencies. Run `npm ci` and `npm run test:public-rules`
to test access rules using the local Firestore emulator. See
`public-rules-testing.md`. No production account or credentials are needed.

## Public sync and Pages release boundaries

1. A pull request to `main` runs only secret-free checks. It must not receive Firebase service-account credentials, deploy rules, or write progress.
2. A reviewed merge runs the static Pages build and deploys only `public-dist/`. It uses reviewed `config/public-sync.json` when present, otherwise a guest build; a present malformed file fails instead of falling back. It never writes, migrates, deletes or resets progress.
3. If Firestore rules change, an authorized operator deploys and verifies them separately after review. Do not attach rules deployment to content releases or assume a Pages success proves the rules were released.
4. Verify the canonical Pages URL and the guest path after deployment. When optional sync is enabled, use a synthetic account only to verify the documented sign-in/save/read behavior; never use private packs or real candidate data.

The project plans for roughly 1,000 registered users, not a guaranteed daily-active-user rate, quota reservation or availability level. Monitor the separate Spark project's actual quota and errors before expanding usage.

## Owner-authorized downstream handoff

The public course is independent of any private companion. External
contributors need only this repository. When the owner's private app is also
in the approved task scope, record the reviewed public commit and follow that
private repository's maintenance runbook for its content and renderer update.
Do not copy private content or configuration into this repository or Actions.

Keep the private app on its known-good revision until its own compatibility,
authentication, rendering, and progress checks pass. Moving a private general
course to the public app requires working public sign-in, a backed-up progress
transfer without overwriting an existing target, and readback verification.
Keep the old course and source progress as recovery data. Do not redirect users
to an unverified destination or assume a public renderer is a compatible private
replacement. Report public publication and private synchronization separately.

## Recovery

For a UI regression, restore reviewed code with a new ordinary commit after
review, rebuild and verify the live page. Preserve content IDs and browser state.
For a content incompatibility, stop and resolve it before publication. Never
delete browser storage or instruct visitors to clear their progress to fix a
maintenance failure. Export/import is the portable recovery path for users.
