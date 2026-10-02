# Notifications

The database migrations and `deliver-notification-emails` Edge Function are deployed to Supabase project `ffnjdqoiaywleodqswnp`. Frontend changes are in this checkout and still need your normal app deployment.

## Enable email delivery

Set these three values in [Supabase Edge Function Secrets](https://supabase.com/dashboard/project/ffnjdqoiaywleodqswnp/functions/secrets):

- `RESEND_API_KEY`: a Resend key authorized to send email.
- `NOTIFICATION_FROM_EMAIL`: an address on your verified Resend domain, for example `WebbedSite <notifications@your-domain.com>`.
- `APP_URL`: your deployed app's HTTPS origin, for example `https://your-app.example` (no path, query, or credentials).

Never put these secrets in `VITE_` variables or commit them. Supabase provides the function's service key automatically. The scheduler token is already generated and stored in Vault. Once all three values are configured, the every-minute cron job starts processing pending notifications automatically, including those queued since this feature was installed. No historical notifications were backfilled.

The web host must serve `index.html` for SPA routes such as `/notifications/<id>` and `/classroom-posts/<id>`. Email links preserve their destination through sign-in and use the recipient's database permissions to open content. Confirm this on your deployed host before enabling email.

Provider setup reference: [Supabase sending email with Resend](https://supabase.com/docs/guides/functions/examples/send-emails).

## Events and recipients

| Event | Recipients | Destination |
| --- | --- | --- |
| Classroom announcement | Current students and teacher, excluding author | Exact post |
| Classroom post comment or like | Post author, excluding self; must still belong to classroom | Exact post |
| Classroom join | Student and teacher | Their classroom view |
| Project like | Project owner, excluding self | Project details |

Automatic learning activity posts are not broadcast to the whole class. The bell updates through Realtime, refreshes on window focus, and polls once a minute to recover missed events. The unread count includes older pages. Recipients can only change the read flag, not the notification content or target.

## Email worker

New notifications create a private queue job in the same database transaction. Email failures do not roll back the classroom action. A custom 256-bit scheduler token authenticates the worker; API callers cannot choose recipients or supply email content. The token validation and queue RPCs are service-role-only. `verify_jwt=false` is intentional because the worker implements this custom authentication.

Jobs are claimed with row locks and five-minute leases, retried with exponential delay up to five attempts, and use a stable Resend idempotency key. Retries stop after 23 hours from the first attempt to stay within the provider's idempotency window. Missing verified recipient addresses and lost target access are skipped. `sent` means the provider accepted the email; it does not guarantee inbox delivery. Delivery/bounce webhooks are not included.

Inspect status as a database administrator:

```sql
select status, count(*) from private.notification_email_jobs group by status;
select notification_id, attempts, last_error
from private.notification_email_jobs where status in ('failed', 'skipped');
```

Do not blindly reset failed jobs after the idempotency window: check provider records first to avoid duplicate sends. Keep APP_URL and sender stable while retries are pending. Until configuration exists, the worker returns `503 Email delivery is not configured` without consuming attempts.

## Verification

- `node --test tests/notifications.test.mjs`: destination mapping, login redirect restrictions, email escaping.
- Run `supabase/tests/notifications.sql` through the SQL editor: database events, recipients, read access, write restrictions, queue claims and retries. All test writes roll back; no test emails are sent.
- Production Vite build and targeted notification-file lint pass. Existing project-wide lint issues and Blockly build warnings are outside this feature.
- Actual provider delivery remains unverified until email secrets are set and a real notification is sent.

Supabase advisors found existing issues outside this feature, including missing RLS on `classroom_courses` and a definer view `course_with_counts`. See [RLS guidance](https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public) and [view guidance](https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view). The private queue intentionally has RLS with no client policies: only its privileged worker can access it.

These migrations assume the existing WebbedSite schema; they are not a full schema bootstrap for a new empty project. The cron endpoint is specific to this Supabase project.
