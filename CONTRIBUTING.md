# Contributing

Thanks for improving the public interview-preparation course. This repository is
public; keep every proposed change generic and safe to publish.

## Before you start

Read `AGENTS.md`, `README.md` and `docs/maintenance.md`. Public source is the
generic renderer, `core/` and `packs/course/`. Personal packs, employer notes,
local output and published-artifact URLs must remain in ignored paths and must
not appear in a pull request.

Keep course, topic, section, activity and quiz IDs stable. A content revision
must not silently reinterpret a saved answer or reset learner progress. See
`docs/content-schema.md` for the compatibility rules.

## Validate locally

Run the checks relevant to the change before opening a pull request:

```sh
python engine/public_build.py
node engine/check.js public-dist/course.html
node engine/test_io.js
node engine/test_public_progress.js
node engine/test_public_shell_behavior.cjs
node engine/test_rag_architecture.cjs
python -m unittest engine.test_public_build
node engine/test_teaching_order.cjs
node --test engine/test_progress_compatibility.cjs
```

Use the optional public sync configuration only when you need to exercise its
integration. It is a public Firebase web identifier with this exact shape; do
not add service accounts, private keys, owner configuration or environment
secrets to the repository or CI.

```json
{
  "purpose": "public-progress-v1",
  "enabled": true,
  "firebase": {
    "apiKey": "public-web-api-key",
    "authDomain": "project.firebaseapp.com",
    "projectId": "project-id",
    "appId": "firebase-app-id"
  }
}
```

The guest build must continue to work with no configuration:

```sh
python engine/public_build.py --output-dir public-dist-guest
```

For the optional integration check, add
`--public-sync-config config/public-sync.json`. Publishing static course files
must never migrate, delete, clear or write user progress.

## Pull requests and release

Open a pull request against `main`. Fork and pull-request checks are
secret-free and do not deploy Firebase rules or Pages. They always validate a
guest build and, when the reviewed `config/public-sync.json` exists, validate
that configured build too. A reviewed merge then builds and deploys only
`public-dist/` to the existing GitHub Pages URL. A missing configuration keeps
the published site in guest mode; a present but malformed configuration fails
the build rather than disabling sync silently.

The maintainer reviews contributed changes before merging. `CODEOWNERS`
requests that review; it is not itself a branch-protection rule. The
single-maintainer protection policy requires the public course and Firestore
rule checks, disallows force-pushes and branch deletion, and keeps a documented
independent review for substantial maintainer-authored changes. A maintainer
cannot approve their own GitHub pull request, so do not claim a second human
approval when the review was performed by an independent assistant. Verify
the actual repository settings before relying on this policy.

Firestore rules are reviewed and deployed by an authorized operator as a
separate action when rules change. A passing Pages deployment does not prove a
rules deployment, user-data migration or sync release. The public sync planning
target is approximately 1,000 registered users, not a promise of daily active
users, capacity or quota.
