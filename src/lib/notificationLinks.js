export function notificationDestination(notification, role) {
  if (notification.post_id) return `/classroom-posts/${encodeURIComponent(notification.post_id)}`
  if (notification.classroom_id && ['student', 'teacher'].includes(role)) {
    return `/${role}/classrooms/${encodeURIComponent(notification.classroom_id)}`
  }
  if (notification.project_id && ['student', 'teacher'].includes(role)) {
    return `/${role}/projects?project=${encodeURIComponent(notification.project_id)}`
  }
  return null
}

// Only notification entry points may be carried through login.
export function notificationReturnPath(search) {
  const next = new URLSearchParams(search).get('next')
  return /^\/(notifications|classroom-posts)\/[0-9a-f-]{36}$/i.test(next ?? '') ? next : null
}
