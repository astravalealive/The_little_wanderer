# GitHub Pages repair proposal

Observed: the live GitHub Pages URL for `haigen-version.json` returned 404 on iPad, while `main` contains the manifest and canonical `haigen.html` (build 425).

## Required settings before merging
In repository Settings → Pages, set **Build and deployment → Source → GitHub Actions**. This setting cannot be verified or changed by the available connector. Confirm the repository Pages URL and custom domain, if any, before approval.

## Proposed workflow
On a merge to main, publish the repository contents using the official GitHub Pages Actions, then verify that both `haigen.html` and `haigen-version.json` are reachable and the live build matches the source manifest. A manual dispatch is also available.

## Safety and limitations
This PR changes only deployment automation and documentation. It does not edit gameplay, artwork, controls or saves. It will **not** deploy before merge or manual dispatch. Existing GitHub Pages configuration and deployment history were not accessible through the connector. Publishing will fail until Pages Source is GitHub Actions, and the Pages environment must allow deployment. The live manifest 404 alone does not prove whether the entire game is missing or only out of sync.

## Acceptance
Confirm GitHub Pages source is Actions; review PR; merge only after approval; wait for Pages workflow success; open the published `haigen.html` and `haigen-version.json` on an iPad; confirm displayed build equals manifest; confirm existing save loads.
