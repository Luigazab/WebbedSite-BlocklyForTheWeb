# Classroom student review

Teachers open **Classroom → Students** and select a row. The searchable roster uses real classroom progress, streaks, and last-active dates.

The progress modal has three tabs:

- **Activities:** all classroom lessons, completion status, saved scores, and pending laboratory grades. Draft lessons are labeled and excluded from the progress percentage.
- **Quizzes:** every quiz lesson and all recorded attempts, including scores, status, and completion dates.
- **Submissions:** saved tutorial-step and laboratory files, generated code, and Blockly workspace snapshots. Teachers can enter a laboratory score from 0 to 100 and feedback, then update that grade if needed.

Announcements are created in **Classroom Posts**. Announcements and Grades no longer have separate classroom tabs.

Tutorials save completed step snapshots on Next and Finish, restore saved work when reopened, and award completion XP only once. Laboratories offer **Submit for grading** even without an automatic validator; a successful Check Work also saves a submission. Submitted lab work counts as completed while its teacher score remains pending. Teacher grades are separate from completion XP and do not award additional XP. Graded lab files cannot be overwritten by students; students see the score and feedback when reopening the lab.

Previously completed work without snapshots is identified explicitly. No past student files can be reconstructed from completion records alone.

The migration adds an RLS-protected `lesson_submissions` table. Clients have read-only table access; authenticated RPCs validate enrollment and lesson/step ownership when saving, and classroom ownership when reviewing or grading. Files are limited to 2 MB per submission. Generated code is displayed as text for teacher review rather than executed.

Run `supabase/tests/classroom_student_review.sql` in the SQL editor to check saving, tutorial step order, completion and XP deduplication, review histories, grade changes, and access restrictions. All fixtures and generated notifications roll back. The tests require existing teacher, student, third-profile, and course records.
