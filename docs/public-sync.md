# Optional public progress sync

The public course remains a static GitHub Pages site. Anyone can read and use
it as a guest; no account, Firebase configuration or network service is needed
to learn, save local progress, or export/import a backup.

Visitors may optionally sign in with Google when the public Spark-project web
configuration is present in the reviewed build. That project is separate from
all personal content and private workspaces.

## What is stored

Each verified user owns one bounded document:

```
users/{uid}/progress/course
```

It has exactly these fields:

| Field | Meaning |
| --- | --- |
| `schemaVersion` | Number `1`. |
| `payload` | Compact JSON progress string, at most 131,072 UTF-8 bytes. |
| `updatedAt` | Server timestamp. |

The compact payload can include completion, checks, quiz choices, exercise
status, and answer drafts. Each draft is limited to 4,096 UTF-8 bytes. It must
not include course content, a profile, email address, private-pack data,
grading history, or an unbounded answer history.

Firestore rules require a verified Google user and an exact UID match. They
allow no other collection or document fields. This delivery has no delete
control, so delete remains denied; a later explicit delete control may allow
only that user's one progress document. Rules and emulator tests live with the
reviewed Firebase rules; they are not deployed by the Pages workflow.

## User behavior and reliability

Local changes take effect immediately. The adapter reads once on activation,
then refreshes only when the tab is foregrounded or returns online, at most once
per minute. It has no continuous Firestore listener and does not poll while
idle.

A save starts five seconds after the first local change and no more than once
per 60 seconds during active editing. Save, sign-out and a visible Save-now
control can flush pending work. Browser-close delivery cannot be guaranteed;
the pending local copy survives a later reopen. Offline or failed saves use
backoff and never block course reading.

The first remote read establishes an acknowledged baseline. A transaction
merges local differences from that baseline onto freshly read remote progress:
changes to distinct fields on two devices survive, while the latest successful
write wins for the same field. A signed-in visitor explicitly chooses whether
to import guest progress after a backup; the account is never silently replaced.
Account-specific cache and baseline keys are cleared or isolated on sign-out so
they cannot become guest or another-account state.

## Public configuration

`engine/public_build.py` accepts configuration only through
`--public-sync-config`. The reviewed production location is
`config/public-sync.json`; when it is absent, Pages intentionally publishes the
fully working guest build. The JSON must have exactly this type:

```json
{
  "purpose": "public-progress-v1",
  "enabled": true,
  "firebase": {
    "apiKey": "public-web-api-key",
    "authDomain": "project.firebaseapp.com",
    "projectId": "project-id",
    "appId": "firebase-app-id",
    "messagingSenderId": "optional-public-id"
  }
}
```

The `purpose` discriminator is required so a lookalike owner/private web
configuration is not accepted. The Firebase web values identify a browser
project; they are public web configuration, not a service account. The build rejects absent required fields,
unknown fields, private keys, generic config shapes, and owner
`PREP_CLOUD_CONFIG`. The default build supplies no configuration and must stay
fully usable in guest mode. Do not use CI secrets for this configuration and do
not place credentials in a workflow, repository, issue or pull request.

## Delivery boundaries

Pull requests to `main` run secret-free checks. They always build a guest
artifact and additionally build the configured artifact when the reviewed
public config exists. After review, a merge builds the static `public-dist/`
artifact and deploys it to the existing GitHub Pages URL. A malformed present
configuration fails this path; it never falls back silently. Deployment is
content and client code only: it never imports, migrates, clears, deletes or
writes Firestore progress. A rule change is a separate reviewed operator
deployment, followed by its own emulator and live verification.

The planning target is approximately 1,000 registered users. It is not a daily
active-user commitment, a Firebase Spark quota reservation, or an availability
guarantee. Monitor actual quota and error behavior before changing that target.

Client-side batching and payload limits reduce normal use; they are not
server-enforced abuse controls. A signed-in user can bypass the browser's save
schedule and consume project-wide free operations. Per-user access rules
protect records, not service availability against quota exhaustion. With
billing disabled, exhausted quotas can interrupt synchronization; keep local
backups usable and review observed abuse before adding more infrastructure.
