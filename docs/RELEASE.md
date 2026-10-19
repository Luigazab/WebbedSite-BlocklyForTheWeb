# Completion release — 19 October 2026

## Deployment order

1. Preserve the working tree and record existing migration history. Several older local filenames differ from deployed timestamps; match migrations by their name and content, and do not replay the directory blindly.
2. Apply `completion_release`, then `release_curriculum`. These add columns, protected RPCs, policies, history, and 36 master lessons. They do not replace existing classroom content or accounts.
3. Run `npm run build:tutorial-runtime`. Deploy the `tutorial` function with its generated runtime and import map; deploy `admin-auth`. Preserve each function's existing JWT setting. `admin-auth` authenticates and checks administrator roles itself.
4. Run the tests and frontend build, then publish the matching frontend through Netlify.
5. Check the live account journeys below and record the deployed commit/build identifiers.

The initial deployment preserved 6 profiles, 5 projects, 7 quiz attempts, 8 lesson completion records and 3 classrooms. Master lessons increased from 8 to 44. No existing submissions or classroom badge awards existed at the preflight snapshot. Existing classroom copies are intentionally unchanged.

## Verification evidence

- `npm test`: 111 tests passed, including HTML/CSS/JavaScript reference regeneration, interactive JavaScript examples, reusable composition output, authentication behavior, tutorial validation and previews.
- `npm run build:tutorial-runtime`: generated the deployable worker from the browser's generator and validation sources.
- `npm run build`: passes. The initial entry JavaScript is approximately 544 KB (162 KB gzip), compared with approximately 4.35 MB before route splitting. Editor/authoring chunks still produce size warnings.
- `supabase/tests/completion_release.sql` and `supabase/tests/report_and_role_isolation.sql`: rollback-only tests pass against the deployed schema. They cover signup metadata, teacher password enforcement, server quiz scoring, hidden answer keys, lab drafts/submission/revision, rubric freezing, stale reviews, duplicate XP/projects/badges, checkpoint proficiency, gradebook access and independent template imports. Synthetic accounts do not survive.
- Security advisor: the course-count view now follows caller permissions; mutable function paths and anonymous privileged-function warnings were addressed. The display directory deliberately remains a narrow owner-executed view of names and avatars, preserving existing API foreign-key joins; it exposes no email, role or activity fields. Its advisor finding is documented and intentional. The remaining private notification queue intentionally has no client policies. The platform uses its existing application password-breach screening; Supabase's separate built-in leaked-password setting remains disabled.

## Live acceptance record

Record date, role, classroom, observed result and evidence for each journey. Database tests are not a substitute for these UI checks.

| Journey | Status |
| --- | --- |
| Public registration creates a student even with changed metadata | Database verified; live signup/confirmation pending |
| Admin creates a teacher; teacher signs in and changes temporary password | Service/database verified; complete browser journey pending |
| Two teachers import the same template and edit independent copies | Database verified; browser journey pending |
| Student completes lecture, quiz, tutorial and lab; continues while pending | Automated/database verified; full browser journey pending |
| Teacher requests revision, student resubmits, teacher passes it | Database verified; full browser journey pending |
| Personal/tutorial/lab projects save, reopen, preview and export | Generator and runtime verified; browser acceptance pending |
| Teacher creates a reusable block, student reopens and submits it | Runtime/version policies verified; browser acceptance pending |
| Reports, screenshot access, status history and dashboard reconciliation | Report/history/screenshot permissions verified with two teachers, separate students and an admin; live browser acceptance pending |
| Password-recovery delivery, link, password change and old-password rejection | Delivery and password form confirmed by inbox owner; password change/old-password/used-link checks pending |
| Disabled accounts and direct-route protection | Automated authorization checks; live browser acceptance pending |

## Rollback and recovery

Keep the pre-change working tree backup and previous frontend deployment. Prefer a forward fix for application regressions. A frontend rollback must remain compatible with server scoring and restricted answer-key access; the older client expected access to quiz answer keys and is not fully compatible. Do not drop new columns/tables, delete student work, replay old migrations, or restore an older database snapshot over newer student activity. Disable affected authoring actions temporarily if necessary while retaining read access to saved work.

The generated curriculum seed is additive and idempotent by its authored slugs. Removing a curriculum lesson after it has been imported or assessed is not a safe rollback. Unpublish an affected master lesson and correct it; existing classroom copies require an explicit teacher edit.

## Human gates before evaluation

The subject teacher must review the nine topic objectives, checkpoint difficulty, three-question quizzes and laboratory rubrics. These are starter sequences, not a validated comprehensive course. The adviser must confirm that reusable compositions of supported blocks satisfy the teacher-added-block revision. Conduct the planned student/teacher evaluation and report only observed results. Regenerate the manuscript's image-based diagrams and page-numbered lists after the adviser reviews the updated model.
