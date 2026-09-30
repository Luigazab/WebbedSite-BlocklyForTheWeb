import { createClient } from 'npm:@supabase/supabase-js@2.94.0'
import { buildNotificationEmail } from './email.js'

const reply = (status: number, body: object) => Response.json(body, { status })

Deno.serve(async request => {
  if (request.method !== 'POST') return reply(405, { error: 'Method not allowed' })
  const token = request.headers.get('x-notification-token')
  if (!token || token.length !== 64) return reply(401, { error: 'Unauthorized' })
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: authorized, error: authError } = await db.rpc('notification_worker_authorized', { p_token: token })
  if (authError || !authorized) return reply(401, { error: 'Unauthorized' })
  const apiKey = Deno.env.get('RESEND_API_KEY')
  const from = Deno.env.get('NOTIFICATION_FROM_EMAIL')
  const appUrl = Deno.env.get('APP_URL')
  if (!apiKey || !from || !appUrl) return reply(503, { error: 'Email delivery is not configured' })
  try { buildNotificationEmail({ notification_id: 'check', email: 'check@example.com' }, appUrl, from) }
  catch { return reply(503, { error: 'APP_URL must be an HTTPS origin' }) }

  const { data: jobs, error } = await db.rpc('claim_notification_emails')
  if (error) return reply(500, { error: 'Could not claim email jobs' })
  let sent = 0
  let skipped = 0
  let failed = 0
  for (const job of jobs ?? []) {
    let status = 'pending'
    let failure: string | null = null
    try {
      if (!job.email) {
        status = 'skipped'; failure = 'Recipient has no confirmed email'
      } else {
        let accessible = true
        if (job.classroom_id) {
          const { data: room, error: roomError } = await db.from('classrooms').select('teacher_id').eq('id', job.classroom_id).maybeSingle()
          if (roomError) throw new Error('Classroom lookup failed')
          const { data: member, error: memberError } = await db.from('classroom_members').select('student_id')
            .eq('classroom_id', job.classroom_id).eq('student_id', job.user_id).maybeSingle()
          if (memberError) throw new Error('Membership lookup failed')
          accessible = !!room && (room.teacher_id === job.user_id || !!member)
        } else if (job.project_id) {
          const { data: project, error: projectError } = await db.from('projects').select('user_id,is_public').eq('id', job.project_id).maybeSingle()
          if (projectError) throw new Error('Project lookup failed')
          accessible = !!project && (project.user_id === job.user_id || project.is_public)
        } else {
          accessible = false
        }
        if (!accessible) {
          status = 'skipped'; failure = 'Notification target is unavailable to the recipient'
        } else {
          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST', signal: AbortSignal.timeout(8000),
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': `notification-${job.notification_id}` },
            body: JSON.stringify(buildNotificationEmail(job, appUrl, from)),
          })
          if (!response.ok) throw new Error(`Email provider returned HTTP ${response.status}`)
          status = 'sent'
        }
      }
    } catch (error) {
      failure = error instanceof Error ? error.message : 'Email delivery failed'
    }
    const { error: finishError } = await db.rpc('finish_notification_email', {
      p_id: job.notification_id, p_lease: job.lease_id, p_status: status, p_error: failure,
    })
    if (finishError) { failed++; continue }
    if (status === 'sent') sent++
    else if (status === 'skipped') skipped++
    else failed++
    // Respect the provider's default request-rate limit, including retries.
    await new Promise(resolve => setTimeout(resolve, 600))
  }
  return reply(200, { sent, skipped, failed })
})
