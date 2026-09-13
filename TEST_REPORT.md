# Test Report — Meadow Balance Lab

## Test environment

- Debian GNU/Linux 12
- Chromium 152.0.7977.82
- Playwright Core 1.63.0
- Node.js 22
- Static Python HTTP server
- Local QA URL: http://127.0.0.1:8090/

## Automated model tests

Command:

node model.test.js

Actual result:

MODEL TESTS: 7/7 PASS

Verified:

1. values remain bounded from 0 to 100;
2. identical inputs produce deterministic output;
3. low water reduces plant values over time;
4. a consumer without food declines;
5. healthy resources support plants;
6. state never produces NaN;
7. scenario reset is reproducible.

## Real-browser functional QA

Browser automation was executed with Playwright Core using system Chromium.

Actual result:

BROWSER QA: 19 PASS / 0 FAIL

Verified:

1. page loads with correct title;
2. no JavaScript errors on load;
3. 360px has no horizontal overflow;
4. 768px has no horizontal overflow;
5. 1280px has no horizontal overflow;
6. Build accepts a viable habitat;
7. Build gives specific feedback;
8. low-water scenario reduces plant value;
9. Predict activity completes;
10. simulation explains what changed;
11. Restore recognizes recovery;
12. Restore gives model-specific feedback;
13. completion summary appears;
14. lesson reset clears Build progress;
15. lesson reset clears Predict progress;
16. lesson reset clears Restore progress;
17. lesson reset clears organism choices;
18. keyboard navigation reaches interactive content;
19. no JavaScript errors occur during activities.

## Acceptance evidence

### Build a habitat

Procedure:

1. Open Build.
2. Select grass and wildflowers.
3. Select rabbit and grasshopper.
4. Select fox.
5. Check the habitat.

Expected:

The model recognizes a coherent combination containing at least two producers, two herbivores, and one predator.

Actual result:

PASS.

Evidence:

evidence/activity-1-build.png

## Low-water experiment

Procedure:

1. Open Predict.
2. Choose the drought scenario.
3. Record a prediction.
4. Advance the model.

Expected:

Plant values change downward over subsequent model steps because water is limiting.

Actual result:

PASS.

Evidence:

evidence/activity-2-predict.png

## Consumer without food

Automated model test initializes a consumer without appropriate plant food.

Expected:

The consumer cannot thrive indefinitely.

Actual result:

PASS. Consumer model value declines.

## Restore resources

Procedure:

1. Open Restore.
2. Start with the unfamiliar struggling habitat.
3. Increase water and sunlight.
4. Advance the model.

Expected:

Plant support improves according to the documented deterministic rules.

Actual result:

PASS.

Evidence:

evidence/activity-3-restore.png

## Determinism

The same starting state and actions were evaluated repeatedly.

Expected:

Identical input produces identical output.

Actual result:

PASS.

## State safety

Automated tests verify that organism values:

- stay between 0 and 100;
- never become negative;
- never become infinite;
- never become NaN.

Actual result:

PASS.

## Reset

The complete lesson reset was tested after completing the activities.

Verified:

- Build progress clears;
- Predict progress clears;
- Restore progress clears;
- organism selections clear;
- learner state returns to the initial lesson state.

Actual result:

PASS.

## Responsive layout

Real-browser viewport tests:

- 360px
- 768px
- 1280px

No horizontal overflow was detected.

Evidence:

evidence/viewport-360.png
evidence/viewport-768.png
evidence/viewport-1280.png

## Keyboard accessibility

Keyboard navigation reaches interactive lesson content.

Core activities use semantic HTML controls and do not require drag interaction.

Actual result:

PASS.

## Reduced motion

The stylesheet contains a prefers-reduced-motion rule to suppress unnecessary motion for users requesting reduced motion.

## Touch considerations

Controls use practical touch-target sizing and responsive layouts.

Automated viewport emulation was used.

A physical touchscreen device was not part of this QA run.

## JavaScript error regression

An initial browser QA run detected one console error.

Diagnostic tracing identified it as:

http://127.0.0.1:8090/favicon.ico

The missing favicon request produced HTTP 404.

A self-contained inline SVG favicon was added to index.html.

The complete browser QA suite was then repeated.

Final result:

BROWSER QA: 19 PASS / 0 FAIL

No JavaScript or resource errors were detected during the final activity run.

## Evidence files

- evidence/activity-1-build.png
- evidence/activity-2-predict.png
- evidence/activity-3-restore.png
- evidence/viewport-360.png
- evidence/viewport-768.png
- evidence/viewport-1280.png

## Numbered learner walkthrough

1. Open Meadow Balance Lab.
2. Review the producer and consumer definitions.
3. Open Build.
4. Select organisms for the meadow.
5. Check the habitat.
6. Read the feedback.
7. Open Predict.
8. Select a scenario.
9. Record a prediction.
10. Advance one simulation step.
11. Compare the result with the prediction.
12. Read what changed and why.
13. Open Restore.
14. Inspect the struggling habitat.
15. Adjust environmental conditions.
16. Advance the model.
17. Retry if necessary.
18. Review the completion summary.
19. Use Reset lesson to replay.

## QA limitation

These tests demonstrate the tested behaviors in Chromium and the specified viewports.

They do not constitute formal third-party WCAG certification or exhaustive testing across every browser and physical device.

## Final post-fix regression

After correcting the individual Predict and Restore reset handlers, the complete regression suite was repeated.

Final browser result:

FINAL BROWSER QA: 27 PASS / 0 FAIL

Additional individual reset regression:

RESET REGRESSION: 12 PASS / 0 FAIL

Model regression after the UI reset fix:

MODEL TESTS: 7/7 PASS

The final regression confirmed:

- responsive rendering at 360px, 768px, and 1280px;
- no horizontal overflow;
- no JavaScript errors;
- Build completion and specific feedback;
- drought experiment changes modeled population indicators;
- Predict activity completion;
- explicit simulation explanations;
- Predict individual reset clears completion, progress, prediction choice, and simulation history;
- Restore recognizes recovery;
- Restore individual reset clears completion and progress and restores default environmental values;
- Pause provides explicit learner feedback;
- full lesson reset clears all activity completion state and organism selections;
- keyboard navigation reaches interactive controls;
- deterministic model tests remain fully passing.

