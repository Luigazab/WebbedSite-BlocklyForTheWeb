# WebbedSite completion release

Updated 21 October 2026. Existing uncommitted editor/JavaScript work was preserved in a pre-change temporary backup and incorporated into the release. Baseline: 87 automated tests and a passing build. Current: 112 automated tests, passing production build and shared runtime packaging; database role/assessment/report/import tests pass using rollback-only fixtures.

## Feature status

| Feature | Status | Evidence / remaining acceptance |
| --- | --- | --- |
| Student-only signup, admin teacher creation, forced password replacement | Implemented; awaiting live account journey | Database metadata and password guards; auth service tests |
| Shared settings, required indicators, role navigation and redirects | Admin/student settings and all role sidebars checked live | Real profile settings, required fields, student security form and old teacher-registration redirect |
| Independent classroom copies and four-type imports | Working in database and live teacher checks | Release verification imported all 12 JavaScript activities; import now preserves reference blocks, structure requirements and guidance without linking the classroom copy to its template |
| Labs: optional checks, drafts, snapshots, rubric totals, review and resubmission | Working in automated/database and live browser checks | Miss Ali completed draft, submission, 70% Needs revision, revision 2, 90% Passed and preserved feedback/history in Release verification |
| Gradebook, filters, CSV and student My Progress | Teacher gradebook, rubric review and student results/history/progress checked live | Legacy 3/10 displays as 30% consistently; lectures stay unscored; final lab shows 90% Passed; CSV export remains awaiting a live download check |
| Course-specific checkpoint proficiency | Working in database tests and live browser checks | Miss Ali remains Beginner after passing beginner quiz/lab; intermediate and advanced remain awaiting assessment; prerequisite tiers, pending labs and XP exclusions tested |
| Personal and learning projects; source filters and links | Working in automated and live browser checks | Tutorial and laboratory projects saved once, reopened with HTML/JavaScript files, filtered by source, previewed and exported as ZIP |
| Versioned teacher reusable block compositions | Working in automated and live browser checks | Counter page and Counter interaction v1 were captured, reopened by Miss Ali, executed in preview, submitted in a lab and exported without losing behavior |
| HTML/CSS/JavaScript starter curriculum, three tiers per subject | Implemented; awaiting subject approval | 36 new master lessons; reference regeneration and JS interaction tests |
| Publication validation | Working in database | Incomplete drafts cannot be published; course publish now persists changes |
| Staff dashboards and analytics | Admin/teacher summaries checked live | Account/classroom/template counts reconcile with records; scoped lab queue, published-activity denominator and analytics date labels |
| Reports, status history, private screenshots | Database permissions pass; admin/student pages checked live | Required report fields, personal history and filters load; two-teacher/student isolation and screenshot ownership tested in database |
| Disabled accounts and private-record boundaries | Working in database/auth tests | Banned-account rejection, cross-classroom access denial and directory-field checks |
| Route splitting and runtime deployment | Working build; deployed functions verified | Measured deployed entry: 544,342 decoded bytes, served with Brotli; about 4.35 MB before; large editor chunks remain |
| Frontend deployment and complete browser acceptance | Deployed; core learning journey passed, broader role matrix remains | Miss Ali completed all four lesson types and the full lab revision cycle; final progress correctly remains Beginner while higher checkpoints are unassessed |
| Setup, deployment and defense documentation | Prepared | README, docs/RELEASE.md, DEFENSE-DEMO.md and THESIS-ALIGNMENT.md |
| Native manuscript edits | Not applied | Drive edit request declined; proposed wording/diagrams saved locally |

Existing accounts, projects, quiz attempts, completions and classrooms were preserved at schema deployment. Templates increased from 8 to 44 lessons. Existing classroom copies were not overwritten. Several older local migration timestamps differ from deployed history; do not replay them blindly.

The production client now handles a removed lazy-loaded bundle after deployment by reloading once per browser session cooldown. This addresses the transient error page observed when an already-open sign-in session crossed a Netlify release.

## Human acceptance gates

- [ ] Subject teacher approves objectives, checkpoint questions, rubric and passing requirements.
- [ ] Adviser confirms reusable compositions satisfy the requested teacher-added-block capability and approves the three-subject title/scope.
- [x] Recovery email delivery and link opening the password form — inbox owner confirmed.
- [ ] User completes password change, old-password rejection and used-link checks; public signup confirmation also remains to be tested.
- [ ] Full browser journey with admin, two teachers, and students in separate classrooms.
- [ ] Student/teacher usability sessions conducted; record only observed results.
- [ ] Manuscript diagrams, instruments and page-numbered lists updated and reviewed. Native Drive edits remain declined.

Automated results do not establish completion of these human gates. See docs/RELEASE.md for deployment order, compatibility constraints and recovery guidance.
