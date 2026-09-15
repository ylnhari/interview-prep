# Public course and optional progress-sync architecture

## Decision

Keep the course canonical at the existing static GitHub Pages URL. Add only
optional, compact public-progress synchronization through a separate Firebase
Spark project. Private packs, owner configuration and existing private progress
implementation remain outside this delivery path.

```
                  reviewed merge to main
                            |
                            v
 public source -> public_build.py -> public-dist -> GitHub Pages course
       |              |                  |
       |              |                  +-- static code/content only
       |              +-- allowlists packs/course
       |                  and typed public config only
       v
 guest browser <----------------------- course always usable offline/local
       |
       | optional Google sign-in, only when public config is present
       v
 public-progress adapter <---- transaction ----> Spark Firestore
                                           users/{uid}/progress/course
```

## Components and trust boundaries

| Component | Responsibility | Must not do |
| --- | --- | --- |
| `packs/course`, `core`, renderer | Canonical public learning content | Read private packs or personal records. |
| `engine/public_build.py` | Produce only `public-dist/`, remove the generic private adapter, inline the public adapter, validate typed public config from `config/public-sync.json` when supplied | Accept owner config, generic config, local packs or output from `dist/`. |
| `engine/public-progress.js` | Optional browser-side Google auth and compact progress transport | Load Firebase while idle, listen continuously, store profiles/content, or make learning depend on sync. |
| Spark Firestore | Isolated per-user progress document | Hold course content, private workspaces, user email/profile data or grading history. |
| GitHub Pages workflow | Deploy reviewed static output after merge | Deploy Firebase rules, use Firebase secrets, or mutate progress. |
| Rules operator path | Review, emulator-test and deploy Firestore rules when they change | Piggyback on an unrelated Pages/content release. |

## Data model and merge

The sole document is `users/{uid}/progress/course` with
`schemaVersion: 1`, JSON-string `payload`, and server `updatedAt`. The client
rejects payloads above 131,072 UTF-8 bytes and answer drafts above 4,096 bytes;
it never truncates them. Rules enforce the same payload ceiling and exact
field set.

The client records a baseline after a read. A save transaction recomputes the
remote document and applies the local diff since that baseline. Therefore
different fields changed on different devices merge, while the same field uses
the latest successful save. This is deliberately a compact state-sync model,
not an event log or grading-history system.

## Failure and release behavior

Guest state is immediately local. Sync is best-effort with delayed and capped
saves, explicit flushes, backoff, and a later refresh on foreground/online;
browser-close delivery is not guaranteed. A failure visibly remains local and
does not block reading.

The delivery sequence is: secret-free pull-request checks, reviewed merge,
static Pages deployment, then live guest verification. Firestore rule deployment
is separately reviewed and verified only when rules change. Neither path runs a
data migration or deletes progress. The approximately 1,000 registered-user
planning target is not a daily-active-user or quota guarantee.
