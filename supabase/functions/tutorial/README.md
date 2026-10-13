# Tutorial validation and authoring

The `tutorial` Edge Function verifies the caller's access token with Auth and uses
service-only RPCs for validation definitions, submissions, and atomic authoring.
The browser must call this function for tutorial submissions; the old direct
`save_lesson_submission` path remains available for laboratories.

Build the worker's shared runtime before deploying:

```sh
npm ci
npm run build:tutorial-runtime
supabase functions deploy tutorial --project-ref ffnjdqoiaywleodqswnp
```

Keep JWT verification enabled. `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are
provided to the worker by Supabase. Never put the service key in frontend config.
The generated `_shared/tutorial-runtime.generated.js` is ignored in Git and must
be rebuilt from the application sources for every deployment.

Requests use `action: "submit"`, `"check"`, or `"save"`. Submit/check requests carry
`lessonId`, `stepId`, and `files`; submission also requires boolean `finish`.
The caller cannot choose the acting user or trusted definition. For block files,
the worker regenerates source from `blocks_json` using the app's generators and
ignores supplied `code`. For text files, it validates `code` directly.

Every configured file objective must pass. Supported tests are `codeIncludes`,
`codeEquals`, `htmlExists`, `htmlText`, and `htmlAttribute`. Empty tests use source
equality after line-ending normalization and outer trimming. Block hierarchy is
checked only when `require_block_structure` is enabled, and that constraint is
incompatible with text mode. HTML parsing never runs student scripts. JavaScript
execution, interaction tests, and CSS rendering assertions require a separate
isolated runner if added later.

The learner view RPC supplies objective metadata without reference answers.
Owning authors/admins receive the full definition for editing and preview. A
successful server submission is bound to the current objective revision; final
completion requires validated preceding submissions. Client-written completed
step markers cannot establish completion.

Save/publish sends the entire definition in one transaction, stages deletions,
checks author ownership, and rejects a stale editor revision. Saving a draft
unpublishes that lesson. Publishing rejects empty or unsatisfiable reference
solutions and incomplete steps. The current builder authors block tutorials;
text tutorial loading and validation are supported for the later text editor.

The signup trigger creates profiles before email confirmation and permits only
student/teacher registration roles. Account role changes require an administrator.

Verification:

```sh
npm test
npm run build
```

Run each SQL script in `supabase/tests` against a test database or as its supplied
rollback transaction. `tutorial_validation_hardening.sql` covers private answers,
forged markers, skipped steps, stale objectives, teacher ownership and parent
cascades, atomic authoring, text completion, and safe signup. It creates temporary
Auth fixtures within its transaction and rolls them back with all other fixtures.
