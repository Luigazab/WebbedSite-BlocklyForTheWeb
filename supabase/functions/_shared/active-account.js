// Service-role adapters must enforce account restrictions before bypassing RLS.
export async function authenticateActiveAccount(db, token) {
  const {data,error} = await db.auth.getUser(token)
  if (error || !data?.user) return null
  const [setup,status] = await Promise.all([
    db.from('profiles').select('must_change_password').eq('id',data.user.id).single(),
    db.auth.admin.getUserById(data.user.id),
  ])
  if (setup.error || status.error || !setup.data || !status.data?.user || setup.data.must_change_password) return null
  const until = status.data.user.banned_until
  if (until && (!Number.isFinite(Date.parse(until)) || Date.parse(until)>Date.now())) return null
  return data.user
}
