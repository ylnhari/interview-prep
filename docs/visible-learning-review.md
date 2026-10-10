# Visible teaching and AI architecture follow-up

This follow-up starts from public release `afe1156de288e202a0504c1be9360ca493fec91f`.
It retains the earlier [whole-course resolution ledger](course-redesign-audit.md)
and its five domain checklists. It changes presentation and original practice,
without changing existing IDs, quiz mappings, answer revisions or progress data.

## Changes and resolution

| Finding | Implemented result | Evidence |
| --- | --- | --- |
| Diagrams appeared before hidden explanations | Seven public lesson guides show a concrete scenario and mechanism; other lessons show a complete opening paragraph or their complete short body. The visible excerpt is excluded from the remaining disclosure. | `test_ai_learning.cjs`, append-order check and rendered `gp-f2` / `raa-f1a` |
| Key terms and reference banks could dominate the opening | They remain optional disclosures as allowed by the requested learning flow. Private first-chunk disclosure behavior is retained. | Shell source tests; public glossary remains collapsed |
| Fixed SVG drawings shrank labels below readable size | Public SVG geometry scales with its smallest label to a 14px floor inside a labeled, focusable scroll region. New architectures use responsive semantic HTML. | Actual SVG width 1064px for a 760px viewBox with 10px labels; 1120px for 9.5px labels. Both yield 14px rendered labels. |
| Platform diagram covered only input/output filters | Catalog, eligibility/policy, router/runtime, bounded model/tools, independent response checks and separate release/evaluation feedback are explicit. | Three fictional fixtures; native control tests and actual confidential/unavailable routing |
| RAG lacked an inspectable failure trace | Current, superseded, revoked, missing-addendum and empty-evidence fixtures show source/version/access, permitted candidates, actual context and support/outcome. Revoked source content is withheld. | Controller tests and actual revoked fixture: only P1 enters candidates/context |
| Recall, hit and complete evidence could be conflated | One versus three required passages produces distinct metrics after prediction. | Original fixture arithmetic and controller event tests |
| Agent recovery needed an effect boundary | Exact consent, current authorization, durable intent/key, receiver effect, unknown outcome and authorized reconciliation are distinct. Unknown unsupported effects remain uncertain. | Success, timeout/applied, revoked, changed-argument and unsupported-contract cases; repeated resume and reset tests |
| Inference diagnosis needed measured intervals | A: queue 800ms / prefill 80ms; B: 20ms / 600ms; C: 30ms / 100ms, 900ms inter-token stall and three preemptions. Median inter-token time is 20ms. Missing upstream/first-token/output-length data is explicit. | Actual C trace/feedback and controller tests; no asserted total completion time or linear scaling |
| Serving architecture was incomplete | Gateway/identity, admission/router, scheduler/tokenizer, cache/accelerator, streaming, observed results and reviewed deployment feedback form one original board. | Retained `lie-f9` route and catalog/schema checks |
| Outcome was revealed before a prediction | Platform, RAG and evidence cases expose inputs first; a native prediction is required before outcome/feedback. A fixture change clears the prediction and feedback. | Actual unavailable routing gate; controller tests for all branches |
| Guide comparison text was unused; changed results lacked announcements | Optional post-attempt spoken comparison consumes `lessonGuides.prediction`; a concise status summary announces fixture/results and the worked trace is labeled. | Source/order tests and actual inference result summary |
| Rendered review caught residual stale content | Corrected the malformed fine-tuning link and universal prompt-cost/interview-frequency wording; brought the shared batching diagram/caption into conditional agreement with its teaching. | Effective-content link-balance and domain regression checks |
| Activity IDs existed but links had no DOM scroll target | Existing `#topic/activity-id` routes now land on the actual exercise and Resume retains the activity destination. No ID is renamed. | Real capstone, agent-resume and structured-validation drill links; route regression tests |
| Light warning/danger text was too faint | Darker existing light-theme tokens; selects and options have explicit foreground/background colors. | Bounded light/dark rendered review |

## Verification

The final public inventory remains 45 chapters, 376 lessons, 309 canonical
knowledge checks and 129 activities (nine explicitly typed code), with 207
visualization references and 284 readings. All original 41 chapters remain
discoverable. The supplied accuracy findings, new recommendation/experimentation
work and earlier compatibility revisions are documented in the existing ledgers.

Codex In-app Browser tested the actual built public course and a local light-theme
variant using the existing root theme attribute. At 320px, document client and
scroll width both measured 305px; at 390px both measured 375px, excluding the
scrollbar. New board labels remained 14px and fully opaque at rest. Light selects
were dark text on white; dark selects were light text on the dark surface.
Revoked RAG evidence was excluded before context construction. Agent timeout
reconciliation kept the effect count at one after repeated resume, and revoked
access blocked the next operation. Trace C showed the correct 900ms inter-token
gap and a hypothesis-qualified next measurement. Keyboard Tab reached the
labeled diagram region with a visible outline. Temporary viewport overrides
were reset.

The new controller test dispatches the actual mount/change/click/reset handlers
against a small DOM contract fixture. It does not claim pixel-layout or assistive
technology coverage. Browser checks supply the bounded rendering evidence.
Existing progress/import/export, public delivery boundary, hydration, catalog,
domain arithmetic/displayed-code and compatibility tests remain required.
The new controller test runs in both PR and Pages workflows.

This review did not exercise every chapter, video, GPU runtime or screen reader.
No external media runtime or architecture replication is claimed. The local
Java runtime remains unavailable; the unchanged secret-free Firestore emulator
checks must pass in GitHub before publication. No rules deployment or production
progress action belongs to this release.

## Final readability corrections

An independent rendered/source review found seven remaining lessons with only
5–17 words before a closed explanation: `sdf-f3`, `nb-f6`,
`ss-v3-request-stages`, `ss-f4`, `ss-f5`, `or-2` and `ct-5`. Each now starts
with authored context explaining a concrete mechanism, constraint or worked
example. The longer teaching remains available, and the visible paragraph is
not repeated inside its disclosure. No sentence-count heuristic or additional
quiz mapping is introduced. `test_ai_learning.cjs` inspects the actual resolved
course text, checks those mechanisms and the displayed six-replica arithmetic,
and checks for remaining non-reference slogans of 17 words or fewer.

Harbor's separately mounted stage diagram did not pass through the shell's SVG
preparation. Its dynamic SVG now has a 968px geometry floor: its 760-unit
viewBox and smallest 11-unit label produce at least 14px rendered text. The
existing labeled, focusable diagram region contains horizontal scrolling; a
visible hint explains it. Geometry checks cover all four stages and six failure
settings. The native stage and constraint controls retain their behavior.

Codex In-app Browser confirmed all seven authored openings visible while their
extended explanation stayed closed. At 320px, page client and scroll width both
measured 305px, while the Harbor region was 249px wide and its SVG 968px wide.
Stage four and the regional constraint redrew correctly; keyboard Right scrolled
the focused region with a visible outline. Desktop page width and scroll width
both measured 1040px. Temporary viewport overrides were reset. Existing AI,
progress, navigation, domain and guest/configured-build tests passed; the local
Python suite passed 29 tests with two Windows symlink-privilege skips. The
required Linux CI also checks those platform-specific cases before publication.
