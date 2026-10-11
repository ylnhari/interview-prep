# Independent public UI review — 2026-10-11

Reviewed the final working-tree public renderer changes against baseline `abd4b97ad27c9b2c95a8409a49b018fd9a5311fe`. This pass was independent of the renderer implementation and changed no renderer source.

## Coverage and evidence

- `node engine/test_lesson_views.cjs` passed all 520 retained lesson/practice destinations across 45 chapters: one primary view and one h1, canonical lesson numbering, direct primary content and worked models, learning completion, valid/invalid deep links and repeated history routes.
- The same test passed Previous/Next sequencing through all 520 destinations for each of the four role paths. Chapter numbers remain canonical rather than being renumbered by recommendations.
- Actual `nextUnfinished` execution passed each role path after all lessons were complete: Continue chooses the exact first unfinished practice; all practices passed yields no false chapter restart; an unfinished lesson retains priority.
- Actual completion rerender execution passed focused/unfocused cases: rendering replaces the DOM, preserves scroll and restores focus to the replacement completion button only when the old completion button held focus.
- Actual resource renderer execution passed an optional sponsored video preceding a featured teaching video: only the featured eligible video embeds. A featured text reading excludes the unrelated optional video embed. Optional labels and access text are visible.
- `node engine/test_navigation_numbering.cjs` passed all 45 chapter labels, lesson labels, completion marks, retained anchors, click targets, four role paths and filtered search.
- `node engine/test_visual_course.cjs` passed actual route handlers, browser-history source contracts, interactive simulation events, saved resume routing and lesson refresh behavior.
- `node engine/test_review_diagrams.cjs` passed all 204 referenced diagram occurrences / 163 distinct definitions. The companion diagram audit records the full chapter matrix and caption/mechanism corrections.

No blocking defect was found in the reviewed changes. Stable lesson routes and stored progress keys remain in use.

## Residual observation

The existing `selfMarkButton` treats `status: 'pass'` without `self: true` as visually unpressed, while progress and Continue treat that historical graded practice as complete. This predates the reviewed change. It may be intentional separation of grading and self-recording, but is worth an explicit compatibility decision before changing it. The 520-route harness stubs practice completion buttons, so its success does not independently test that legacy-state presentation.

## Limits

These are executed renderer/helper tests with a synthetic DOM and source review. They do not demonstrate browser pixel layout, real font widths, color contrast, screen-reader output or live mobile menu geometry for every lesson. The local browser runtime remained unavailable because of its Windows MXC/transport failure. Independent browser sampling and final exact-commit Pages verification remain separate release evidence; no blanket desktop/mobile screenshot pass is claimed here.
