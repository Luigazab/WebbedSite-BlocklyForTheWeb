# Classroom badges

Teachers create badges from **Classroom → Badges**. Each badge belongs to an assigned course and awards either:

- Completion of every published classroom lesson in a selected topic (empty topics do not qualify).
- A positive whole-number XP target earned in that classroom's course. XP from other classrooms or unrelated sources does not count.

Teachers can choose a library image, enter an image URL, or use the default award icon. Creating or resuming a badge immediately checks existing members. New members are also checked. Pausing prevents future awards and preserves earned badges. Requirements are immutable; create another badge for a different target.

Awards are recorded once per student and rule with a snapshot of their name, image, and requirement. They appear in **Profile → Achievements**, the profile's recent activities, and the classroom feed. Lesson completions also create classroom activity. Open classroom feeds subscribe to new posts and refresh on window focus.

The migration also repairs the legacy lesson-completion RPC and XP trigger to use the current `(user_id, classroom_id)` progress key. The public completion RPC calls a private, authenticated implementation. Repeat-attempt XP and the existing response shape are preserved. The frontend completion service uses that RPC to avoid double-counting XP.

Verification: execute `supabase/tests/classroom_badges.sql` in the SQL editor. It checks topic completion, empty topics, threshold boundaries, unrelated XP, award and post deduplication, backfill, pause/resume, the completion RPC, and access policies. Fixtures and notification queue changes roll back. The test requires existing teacher, student, third-profile, and course records.
