# Independent visual evidence review — 21 November 2026

Source: PR #272 workflow run 44894746180, artifact `controlled-depth-269` (72 PNG captures). Reviewed contact sheet of representative forest, iPhone and iPad screenshots.

## Confirmed
- Capture job succeeded and produced images for all three named viewports, subjects and obstacle front/behind combinations.
- Trees, rocks and stump render, but screenshots alone do not establish correct depth ordering.
- The `forest` and `ipad` test viewports are both 1024×768. They differ by browser mobile flag, not dimensions.
- The screenshot script uses `kind='troll'` to reposition `caveTrolls`; its presence in the rendered world depth queue is **not asserted**.
- In several representative troll/stump screenshots, the subject cannot be confidently distinguished from stump artwork. The front and behind images look materially similar at contact-sheet scale.
- The current harness only asserts finite positions and absence of JavaScript errors. It has no occlusion, anchor, or visible-subject assertion.

## Required before visual sign-off
1. Inspect each full-resolution image, especially troll-stump pairs, and label each pass/fail with the visible actor and overlap.
2. Confirm troll world rendering and correct stump Y-sort; do not claim troll coverage from filenames alone.
3. Ensure iPhone and iPad capture expected target viewport and actor size; verify HUD does not obscure subject.
4. Add a deterministic subject-visibility or screenshot-comparison gate with reviewed baselines, or keep explicit manual visual review mandatory.
5. Re-run captures on current main rather than assuming stacked PR #272's branch reflects main.

## PR #273 merge-scope note
PR #273 itself only adds a save-reader fixture test, CI workflow, and QA documentation; it does **not** alter game rendering. Its green CI proves those source-level checks run, not that game depth visuals are correct. The save fixture is synthetic and representative, not a historical production save export.
