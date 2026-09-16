# Public course security audit — 2026-09-17

Scope: the current public repository and browser bundle, including the public
Firestore rules, public progress adapter, shell renderers, course content,
release configuration, and production dependencies. The audit was read-only;
no private repository, account data, or browser credentials were inspected.

## Result

- No high or critical source-backed issue was found.
- External links are now restricted to `http:` and `https:` before they are
  assigned to browser anchors. Active schemes such as `javascript:` and
  `data:` are rejected.
- Authenticated progress reads and writes remain bound to the exact verified
  Google UID. Anonymous and cross-user access are denied by rules and emulator
  tests.
- The Firebase web configuration in `config/public-sync.json` is browser
  configuration, not a secret. Abuse resistance comes from Auth, Firestore
  rules, quotas and the bounded document shape.
- Production dependencies have no vulnerabilities in the runtime/production
  set (`npm audit --omit=dev`). Development-only Firebase CLI dependencies
  currently report eight moderate advisories; automatic force-fixing would
  require a breaking CLI downgrade, so it was not applied.

## Residual controls

Course and visualization HTML is authored in this repository and is rendered
as trusted content. Keep that boundary intact: do not feed user-provided or
Firestore-provided HTML into the shell's HTML sinks. If content ever becomes
user-editable in the public product, add a strict allowlist sanitizer and
regression tests before enabling it.

The audit is evidence for this revision, not a guarantee against future
changes. Re-run it for renderer, rules, dependency, or content-loading
changes.
