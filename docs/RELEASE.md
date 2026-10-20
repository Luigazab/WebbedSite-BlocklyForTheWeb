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
- `node scripts/verify-deployment.mjs`: anonymous production check on 19 October measured 543,964 decoded entry bytes with Brotli response encoding and the expected release marker. This measures the entry module, not all later lazy-loaded editor assets.
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
| Disabled accounts and direct-route protection | Automated authorization checks; signed-in student redirected away from admin and teacher pages; disabled-account browser check pending |

Read-only browser checks on 19 October used the owner's existing administrator and teacher accounts. Admin Overview, Course Templates (including the JavaScript sequence), Reports, Analytics and Account Settings loaded. Teacher Home, classroom Students, Gradebook, student attempt history and My Projects loaded. Counts reconciled with stored records. The legacy quiz normalization preserves a stored correct-answer count of 3 and shows 30% for its ten-question quiz. Saved project details open with HTML/JavaScript tabs. These checks do not establish draft recovery, lab revision, export, account provisioning or complete cross-role journeys.

The existing student account was also checked in ICT A. Home, My Classrooms, published/locked content messages, the lecture viewer, quiz results and both saved attempts, My Progress, project filters/details, Help/report history and profile/security settings loaded. My Progress and quiz history agree with the teacher's 30% summary. The completed lecture remains unscored, and courses without checkpoints display Not yet assessed. Existing classroom copies still contain their older content; new master lessons were not inserted into them silently. No new assessment attempt, completion, grade or project was created during these checks.

On 20 October, the owner authorized changing the unused Miss Ali account from teacher to student for release testing; its password was not changed. A separate `Release verification` classroom was created and received the 12-activity JavaScript sequence. The live import exposed an omission in the clone function: reference block JSON, structure requirements and tutorial guidance were not copied even though generated reference code was. Migration `preserve_imported_tutorial_solutions` fixes future imports, a rollback-only regression verifies copy independence, and the new classroom's 18 expected-file rows and nine steps were repaired from their master counterparts. No existing classroom was updated.

Teacher authoring then captured `Counter page` v1 for HTML and `Counter interaction` v1 for JavaScript. Both are scoped to Release verification, and the JavaScript reference preview changed the visible counter from 0 to 1. The corresponding student save/reopen/submission/export journey remains pending.

## Rollback and recovery

Keep the pre-change working tree backup and previous frontend deployment. Prefer a forward fix for application regressions. A frontend rollback must remain compatible with server scoring and restricted answer-key access; the older client expected access to quiz answer keys and is not fully compatible. Do not drop new columns/tables, delete student work, replay old migrations, or restore an older database snapshot over newer student activity. Disable affected authoring actions temporarily if necessary while retaining read access to saved work.

The generated curriculum seed is additive and idempotent by its authored slugs. Removing a curriculum lesson after it has been imported or assessed is not a safe rollback. Unpublish an affected master lesson and correct it; existing classroom copies require an explicit teacher edit.

## Human gates before evaluation

The subject teacher must review the nine topic objectives, checkpoint difficulty, three-question quizzes and laboratory rubrics. These are starter sequences, not a validated comprehensive course. The adviser must confirm that reusable compositions of supported blocks satisfy the teacher-added-block revision. Conduct the planned student/teacher evaluation and report only observed results. Regenerate the manuscript's image-based diagrams and page-numbered lists after the adviser reviews the updated model.
