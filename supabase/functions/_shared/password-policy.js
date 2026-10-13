export const MIN_PASSWORD_LENGTH = 12

export async function checkPassword(password, { fetchRange = fetch, digest = crypto.subtle.digest.bind(crypto.subtle) } = {}) {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) throw Object.assign(new Error('Password must be at least 12 characters.'), { status: 422 })
  const bytes = new TextEncoder().encode(password)
  if (bytes.length > 72) throw Object.assign(new Error('Password must be no more than 72 UTF-8 bytes.'), { status: 422 })
  const hash = Array.from(new Uint8Array(await digest('SHA-1', bytes)), value => value.toString(16).padStart(2, '0')).join('').toUpperCase()
  // HIBP receives only five hash characters, never the password or full hash.
  const response = await fetchRange(`https://api.pwnedpasswords.com/range/${hash.slice(0, 5)}`, {
    headers: { 'Add-Padding': 'true', 'User-Agent': 'WebbedSite-Password-Screening' },
    signal: AbortSignal.timeout(8000),
  })
  if (!response.ok) throw Object.assign(new Error('Password screening is unavailable. Please try again.'), { status: 503 })
  const entries = await response.text()
  const compromised = entries.split(/\r?\n/).some(line => {
    const [suffix, count] = line.split(':')
    return suffix === hash.slice(5) && Number(count) > 0
  })
  if (compromised) throw Object.assign(new Error('This password appears in known data breaches. Choose a different password.'), { status: 422 })
}
