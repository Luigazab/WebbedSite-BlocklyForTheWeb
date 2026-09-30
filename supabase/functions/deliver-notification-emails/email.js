export function buildNotificationEmail(job, appUrl, from) {
  const url = new URL(appUrl)
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('APP_URL must be the HTTPS origin of the app')
  }
  const href = new URL(`/notifications/${encodeURIComponent(job.notification_id)}`, url).href
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])
  const content = job.content || 'You have a new notification.'
  return {
    from, to: [job.email], subject: 'New notification on WebbedSite',
    text: `${content}\n\nOpen notification: ${href}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px"><h2>WebbedSite</h2><p>${escape(content)}</p><p><a href="${escape(href)}" style="display:inline-block;padding:12px 18px;background:#7054b3;color:white;border-radius:8px;text-decoration:none">Open notification</a></p><p style="color:#64748b;font-size:12px">Sign in to view the related post or classroom.</p></div>`,
  }
}
