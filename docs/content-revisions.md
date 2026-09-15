# Explicit content revisions and saved progress

Course progress is keyed by the course, topic, role, and item ID. A normal
content update must preserve those identifiers and every retained quiz mapping.
`engine/check_progress_compatibility.cjs` fails closed when it detects a lost
topic, section, activity, or changed saved quiz mapping.

## When a complete rewrite needs new IDs

An approved rewrite may replace individual sections or activities with fresh
IDs. This is an explicit content retirement, not a data migration. It does not
read, modify, reset, delete, or upload browser or cloud progress.

Old progress and exported state remain intact under their original IDs. New
items start uncompleted because they have new IDs; no old answer, completion, or
quiz selection is applied to them. A retirement never erases user history.

## Reviewed manifest

The candidate commit may add `content-revisions.json`. The compatibility CLI
reads that exact file as a regular Git blob from the candidate commit; it never
uses the working tree, a symlink, or an arbitrary path. If the file is absent,
the default fail-closed compatibility rules apply unchanged.

The manifest has exactly this shape:

```json
{
  "version": 1,
  "retirements": [
    {
      "pack": "course",
      "topic": "topic-id",
      "role": "learn",
      "id": "retired-item-id",
      "sha256": "canonical-full-item-sha256",
      "reason": "Approved explanation for why this exact item is retired.",
      "replacements": ["new-item-id"]
    }
  ]
}
```

`role` is exactly `learn` or `activities`. `pack`, `topic`, every item ID and
every replacement ID must be ordinary repository IDs. A retirement has a
non-empty reason and at least one unique replacement ID. The replacement IDs
must already exist in the same topic and role in the candidate. When the
retired item is still in the comparison baseline, every replacement ID must be
new—absent from that entire baseline—not an unrelated existing item relabeled
as a replacement.

For an item present in the baseline, `sha256` must equal the SHA-256 of that
item's canonical full JSON object (sorted object keys, with all item fields).
The manifest permits only that exact item to be missing. It cannot delete a
course or topic, move an item across roles, retain a changed quiz under its old
ID, reuse a retired ID anywhere in the candidate, duplicate an entry, use a
wildcard, or use prototype/unknown keys.

On later comparisons an already-retired ID may be absent from the new baseline.
Its manifest entry remains valid only while all listed replacement IDs still
exist in the specified candidate topic and role. Design a later retirement
explicitly rather than assuming manifest entries bypass future guards.

## Maintainer procedure

1. Author the replacement in a clean content context using fresh IDs. Do not
   reuse the retired IDs or reuse old quiz choices as a migration shortcut.
2. After the candidate content is ready for review, generate the manifest from
   the reviewed baseline's IDs and canonical item hashes. Do not copy prior
   prose into new content to create this metadata.
3. Review the reason, topic/role, exact hashes, and replacements alongside the
   content change. Keep the manifest in the same candidate commit.
4. Run:

   ```sh
   node engine/test_progress_compatibility.cjs
   node engine/check_progress_compatibility.cjs BASE_SHA HEAD_SHA
   ```

   Use full commit hashes. A passing compatibility check proves only ID and
   saved-state handling; it does not approve the rewritten lesson's quality.

No command in this process authorizes a deployment, database action, progress
migration, or reset.
