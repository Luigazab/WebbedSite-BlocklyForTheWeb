# WebbedSite

Classroom learning and visual programming for HTML, CSS and JavaScript, built with React/Vite, Blockly, Supabase and Netlify.

## Local development

Use Node.js 22 or a compatible supported version. Run `npm ci`, then create `.env` with the project's frontend credentials:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY
```

Never put a service-role key in a Vite variable. Run `npm run dev`; the printed local address opens the app. Email-confirmation and recovery redirects must be allowed in Supabase Auth for the intended local or deployed origin. Confirmation remains required for public registration.

```sh
npm test
npm run build:tutorial-runtime
npm run build
```

The build produces `dist/`. Netlify runs the build command in `netlify.toml`; `public/_redirects` supports client routes. Lazy routes keep authoring/editor code out of the initial account page, although some editor bundles remain large.

## Accounts and navigation

Students register publicly, complete onboarding and enroll by classroom code. Administrators create teacher accounts through Users. Teachers replace administrator-assigned passwords before using classrooms. Account Settings, Help & Report an Issue and Sign out are available in the sidebar footer.

| Role | Main pages | Classroom tools |
| --- | --- | --- |
| Admin | Overview, Users, Course Templates, Reports, Analytics | Maintains master content |
| Teacher | Home, Classrooms, My Projects | Template import, topics/lessons, students, gradebook, posts, badges and progression |
| Student | Home, My Classrooms, My Projects | Lessons, My Progress, activity and classmates |

Importing a template makes a separate classroom copy. Later master edits do not overwrite classroom work. Existing classrooms must explicitly import an unassigned course or have their teacher update their own lessons; this release does not silently replace them.

## Learning and assessment

Lectures and tutorials record completion. Quizzes use timed server-scored attempts and retain attempt history; their summary uses the best completed attempt. Quizzes with assessment records cannot have their questions replaced: create a new quiz lesson to preserve the old records.

Labs use a 100-point rubric with a default passing score of 75. Students save drafts and submit a project snapshot, then may continue while review is pending. Teachers enter criterion scores and feedback. Students can revise after Needs revision; earlier snapshots and reviews remain available. Optional checks are formative and do not submit work automatically.

Proficiency is specific to each course in a classroom. Not yet assessed, Beginner, Intermediate and Advanced derive from designated checkpoint quizzes and reviewed labs, with earlier tiers required. XP, speed and ordinary completion are separate. These labels do not certify general web-development competence.

Teachers can capture one connected group of supported blocks in one language as a versioned reusable block. Students can insert classroom versions; saved work retains the internal workspace. Custom parameters, arbitrary generators and recursion are deferred.

## Database and functions

The repository contains additive migrations for the existing deployed schema, not a standalone baseline database dump. For a fresh project, obtain the original baseline schema before applying these migrations. For the existing project, reconcile migration names/content with deployed history: some older timestamps differ. Apply the completion release before the curriculum seed, then deploy the matching `tutorial` and `admin-auth` functions before the frontend. Build the ignored generated tutorial runtime immediately before deployment; never deploy a stale copy.

The curriculum source is `scripts/release-curriculum-source.mjs`. Run `node scripts/build-release-curriculum.mjs` to regenerate its JSON and SQL seed. It adds nine topic sequences, each with lecture, tutorial, quiz and laboratory. Subject-teacher approval of objectives, questions and rubrics is still required before evaluation.

See [release/deployment and acceptance](docs/RELEASE.md), [defense walkthrough](docs/DEFENSE-DEMO.md), [thesis model and diagrams](docs/THESIS-ALIGNMENT.md), [completion checklist](audits/RELEASE-CHECKLIST.md), [notifications](supabase/NOTIFICATIONS.md) and [tutorial service](supabase/functions/tutorial/README.md).

## Known release limits

The initial diagnostic and weighted course grade are deferred. Labs receive teacher review; source-text checks do not prove JavaScript behavior. The starter curriculum is not a validated comprehensive course. Admin and teacher pages have been checked on the live site, and the inbox owner confirmed recovery email delivery and the password form. Full learning journeys, password replacement, adviser/subject-teacher review, and observed student/teacher evaluation remain explicit release gates until their evidence is recorded. Automated tests alone do not complete those gates.
