# Coding, SQL and progress audit resolution

Date: 2026-10-09. Baseline: f7eec0bce9e74e5577d66ab30c5c422e60a44c2c.
Effective corrections are in `core/zzz-audit-coding.js`; stable IDs and older
routes remain. Reference sources are injected by `engine/update_coding_references.py`.

| Supplied finding | Resolution and evidence |
| --- | --- |
| ML audit 15: incomplete FeatureComputer, global ordering, lifetime/rolling variance | cdr-a1 now displays a complete exact scan-based implementation, assigns the window, expires by arrival horizon, accepts explicit higher revisions, rejects stale revisions/nonfinite values and defines late/window boundaries. Current-window Welford statistics and undefined n<2 variance are explicit. `test_coding_sql.py` executes the displayed source with duplicates, reversed global event time, idle expiry, boundary, late and corrected records. |
| ML audit 16: scored top-k versus frequency sketch; deterministic merge ties | cdr-a2/f3 use globally unique IDs and one shared total tie order. Frequency-heavy-hitter sketches are explicitly a different problem. Displayed exact code is tested against distributed merge with ties, k=0, empty and NaN cases. |
| ML audit 16: sigmoid overflow sign | cdr-a3 rubric/model correctly identifies large negative z for exp(-z). Displayed sign-branch code executes at z=±1000, with hand-computed metrics and a toy train/evaluate check. |
| ML audit 17: SQL availability, event_id, boundaries and peers | cdr-f4/a4 separate event, availability and actual prediction cutoff. Explicit schemas include event_id; lower bound inclusive, upper exclusive. Reporting RANGE includes peers; decision features exclude upper-cutoff peers and require availability. Current request fields are not automatically leakage. SQLite executes the actual displayed queries with empty customers, ties, delayed availability and both boundaries. PostgreSQL interval adaptation is labeled rather than falsely claiming execution there. |
| ML audit 18: suffix-only indexes and index-only MVCC | sql-0/f2/check allow scan/engine-version-dependent skip scan; covering columns do not guarantee zero heap reads. Primary PostgreSQL multicolumn/index-only references linked. |
| ML audit 19 + systems audit 4: ANALYZE execution, relation locks, migration | sql-a2 starts with telemetry/blockers/estimated plan and bounds authorized ANALYZE execution. sql-0/f6 explain relation locks and DDL conflicts. sql-f9/check requires lock budgets, compatible old writers, transactional same-DB dual writes, concurrent-update-safe batches, parity/read-switch checks and rollback window; destructive contract is not simple rollback. |
| Diagnostic SQL/testing destinations | cdr-diagnostic SQL points to cdr-f4; testing/explanation points to new cdr-testing-explanation, containing an actual abba trace, independent oracle, reviewed patch and changed Unicode constraint. Semantic destinations are asserted. |
| Quiz corrections versus stored indices | Guard permits only reviewed exact-hash/version entries. Revised selections use versioned keys in existing checks map; old keys survive. Wrong hashes, wrong candidate/version, duplicate entries and omitted entries fail. IO and public projection tests preserve both keys. Display shuffle remains the shell owner's implementation. |

Validation: `python -m unittest engine.test_coding_sql` (5 tests),
`node --test engine/test_progress_compatibility.cjs`, `node engine/test_io.js`,
`node engine/test_public_progress.js`. Current source compared successfully with
the baseline using the exact manifest for 46 corrected quizzes across the course.
The generated revision module preserves versioned storage keys; no browser data
is rewritten. Final committed comparison must run after the full course manifest
is generated and reviewed. No publication is performed
by this workstream; the owning task handles public build, checks and release.

Limits: SQLite seconds-based fixtures validate query semantics, not PostgreSQL
planner behavior or production migration locking. The exact feature reference
scans retained records: it is intentionally inspectable, not a throughput claim.
State scales with horizon traffic and distinct identities; a hard memory bound
needs a declared cap/backpressure/spill policy. No cloud account is required.
