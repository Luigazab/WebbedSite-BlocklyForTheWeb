export const MIN_PASSWORD_LENGTH = 12
export const MAX_PASSWORD_LENGTH = 72
export const PASSWORD_HELP = 'Use 12–72 characters. Avoid passwords exposed in data breaches.'

export function passwordValidationError(password) {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
  }
  // Supabase uses bcrypt; checking bytes avoids silently truncated passwords.
  if (new TextEncoder().encode(password).length > MAX_PASSWORD_LENGTH) {
    return 'Password must be no more than 72 UTF-8 bytes.'
  }
  return null
}

export function assertPasswordPolicy(password) {
  const error = passwordValidationError(password)
  if (error) throw new Error(error)
}
