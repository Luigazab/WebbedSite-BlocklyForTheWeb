# Blockly tutorials

Teacher/admin routes use TutorialBuilderPage, useTutorialBuilder, tutorialBuilderStore and blockTutorialService. Students use TutorialViewer; tutorial.service adapts the same block tutorial tables through buildStudentSteps.

## Authoring
1. Select a topic, title and XP.
2. Build starting blocks for each file on step 1 and click Capture workspace as starting blocks. Empty starting workspaces are allowed.
3. Build the completed solution, write Remi's instruction/hint, choose a toolbox category and optional block, and capture the solution.
4. Configure tests and click Apply tests. Recapture after changing solution blocks. Save requires capturing pending edits.
5. Append the next step. Its initial state is the previous expected state per file; unchanged files inherit the nearest earlier solution. Steps have no reorder operation. Editing an earlier solution updates downstream starting states. Deleting a step reconnects this chain.
6. Publish checks instructions, captured solutions, and that the reference code passes its own tests.

## Test cases
Tests are per captured file; all tests on all captured files must pass before Next/Finish. The active workspace is regenerated at validation time. Block IDs and screen coordinates are not compared.

Example JSON:
```json
[
  {"type":"htmlText","selector":"h1","value":"Welcome","message":"Add a heading that says Welcome."},
  {"type":"htmlAttribute","selector":"img","attribute":"alt","value":"Remi","message":"Describe your image as Remi."}
]
```

Supported checks: htmlExists (selector), htmlText (selector/value), htmlAttribute (selector/attribute/value), codeIncludes (value), codeEquals (value). Optional message provides student feedback. HTML checks parse inert markup and accept additional elements. Invalid selectors fail. An empty test array falls back to generated-code equality after trimming outer whitespace and normalizing line endings. This is layout-independent but is not semantic code equivalence. codeIncludes is literal and can match comments; prefer HTML checks for markup.

CSS/JavaScript currently support source checks only. Runtime output, computed styles, clicks, and input/output tests need a separate isolated execution runner with timeouts and resource limits; never evaluate student JavaScript in the application origin.

## Persistence and verification limits
Uses existing initial_content_json, expected_blocks_json, expected_code, test_cases and highlight columns. No database migration is applied. Verify existing columns and teacher/admin RLS permissions in your project. CRUD uses several requests, so a multi-table save is not atomic. Production hardening should move aggregate saves/deletes to a transaction with ownership checks.

Client validation provides learning feedback, not tamper-proof grading. Current submission RPC records progress but does not re-run these tests; authoritative grading/XP requires server-side validation against stored tests and regenerated submitted blocks. Answers are currently delivered to the browser. Do not use this flow for hidden-test exams.

Run: node --test tests/tutorial.test.mjs and npm run build. Live authenticated CRUD and browser interaction still require a connected project and accounts.
