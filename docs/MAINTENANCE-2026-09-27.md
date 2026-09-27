# Maintenance review — 2026-09-27

## Purpose and scope

Improve keyboard continuity when the mobile course outline closes and rerenders after a chapter selection. Review and checks used the generic public renderer and synthetic state only; ignored private packs and local progress were not opened.

## Baseline findings

The outline button already received focus when opening the mobile menu, and Escape returned focus when closing it. Selecting a chapter closed the menu and replaced the focused outline button, but did not move focus to a stable element.

## Changes

- Mobile outline navigation now returns keyboard focus to the stable Contents button after rerendering, without scrolling away from a selected section.
- Added a behavior regression to the existing synthetic shell harness.
- Corrected a stale hydration test assertion to use the renderer's actual `route` parameter name; the check continues to verify the cache baseline and edits made during hydration.

## Verification

- `node engine/test_public_shell_behavior.cjs` — passed, including the mobile focus regression.
- `node engine/test_initial_hydration.cjs` — passed.
- `node engine/test_io.js` — passed.

## Remaining gaps

The shell behavior harness is dependency-free and has no browser DOM; keyboard focus behavior is covered through the existing extracted-function harness. No private pack or real progress was used. No commit or publication action was performed.
