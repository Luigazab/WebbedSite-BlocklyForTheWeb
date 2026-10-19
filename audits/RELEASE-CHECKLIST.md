# WebbedSite completion release

Updated 19 October 2026. Existing uncommitted editor/JavaScript work was preserved in a pre-change temporary backup and incorporated into the release. Baseline: 87 automated tests and a passing build. Current: 111 automated tests, passing production build and shared runtime packaging; database role/assessment/report tests pass using rollback-only fixtures.

## Feature status

| Feature | Status | Evidence / remaining acceptance |
| --- | --- | --- |
| Student-only signup, admin teacher creation, forced password replacement | Implemented; awaiting live account journey | Database metadata and password guards; auth service tests |
| Shared settings, required indicators, role navigation and redirects | Implemented; awaiting browser review | Role routes; shared account forms |
| Independent classroom copies and four-type imports | Working in database tests | Two imports retain separate edits and assessment metadata |
| Labs: optional checks, drafts, snapshots, rubric totals, review and resubmission | Working in automated/database checks | Revision/history, stale review and idempotence checks; teacher UI acceptance pending |
| Gradebook, filters, CSV and student My Progress | Implemented; awaiting live browser journey | Real scoped RPCs; score/completion separation |
| Course-specific checkpoint proficiency | Working in database tests | Beginner/Intermediate/Advanced prerequisites; pending labs and XP excluded |
| Personal and learning projects; source filters and links | Implemented; awaiting live save/reopen/export | Once-per-lesson project copy; local-file migration regression checks |
| Versioned teacher reusable block compositions | Runtime verified; awaiting browser journey | Save/reopen and shared generator/runtime tests; classroom access policies |
| HTML/CSS/JavaScript starter curriculum, three tiers per subject | Implemented; awaiting subject approval | 36 new master lessons; reference regeneration and JS interaction tests |
| Publication validation | Working in database | Incomplete drafts cannot be published; course publish now persists changes |
| Staff dashboards and analytics | Implemented; awaiting live reconciliation | Real counts, scoped lab queues, stated periods and denominators |
| Reports, status history, private screenshots | Working in database permission tests | Two teachers, separate students and administrator; broad storage policies cannot bypass screenshot ownership |
| Disabled accounts and private-record boundaries | Working in database/auth tests | Banned-account rejection, cross-classroom access denial and directory-field checks |
| Route splitting and runtime deployment | Working build; deployed functions verified | Entry about 544 KB vs 4.35 MB before; large editor chunks remain |
| Frontend deployment and complete browser acceptance | Deployed; acceptance in progress | Release marker and teacher-registration redirect verified; admin Overview/Analytics load real data; other role journeys pending |
| Setup, deployment and defense documentation | Prepared | README, docs/RELEASE.md, DEFENSE-DEMO.md and THESIS-ALIGNMENT.md |
| Native manuscript edits | Not applied | Drive edit request declined; proposed wording/diagrams saved locally |

Existing accounts, projects, quiz attempts, completions and classrooms were preserved at schema deployment. Templates increased from 8 to 44 lessons. Existing classroom copies were not overwritten. Several older local migration timestamps differ from deployed history; do not replay them blindly.

## Human acceptance gates

- [ ] Subject teacher approves objectives, checkpoint questions, rubric and passing requirements.
- [ ] Adviser confirms reusable compositions satisfy the requested teacher-added-block capability and approves the three-subject title/scope.
- [x] Recovery email delivery and link opening the password form — inbox owner confirmed.
- [ ] User completes password change, old-password rejection and used-link checks; public signup confirmation also remains to be tested.
- [ ] Full browser journey with admin, two teachers, and students in separate classrooms.
- [ ] Student/teacher usability sessions conducted; record only observed results.
- [ ] Manuscript diagrams, instruments and page-numbered lists updated and reviewed. Native Drive edits remain declined.

Automated results do not establish completion of these human gates. See docs/RELEASE.md for deployment order, compatibility constraints and recovery guidance.
