# Three-lane read-only development trial: Character Art

Status: audit-only draft PR. No gameplay, asset, save, deployment or automation changes authorized.

Common starting main SHA: e7c9292bd4180d787e43995239c406b1330e11ad

## Inspection scope
Approved Haigen directional atlas, Skölli adult atlas, region outfits and visual consistency

## Relevant files / references
assets/haigen-reference-walk-atlas.webp; assets/skolli-adult-approved.webp; assets/haigen-region-outfits.png; APPROVED-ART-BASELINE.md

## Overlap and blockers
haigen.html sprite mapping shared with gameplay; approved artwork must not be replaced

## Isolation rules
- This branch changes only this audit document under docs/trials/.
- No modifications to haigen.html, index.html, assets, workflows or existing automation.
- Any subsequent implementation needs separate approval and fresh main reconciliation.
- Preserve the approved artwork baseline and saved games.
- Draft only. Do not merge or deploy.

## Proof-of-concept acceptance
- Branch starts from the recorded common SHA.
- One unique audit document commit.
- Draft PR targets main and contains only this document.
- Compare three PR file lists for zero overlap.
- Independent AI-agent execution and GitHub Actions concurrency remain unproven unless separately measured.
- Cost: no paid service explicitly requested; actual billing and runner usage not verified.
