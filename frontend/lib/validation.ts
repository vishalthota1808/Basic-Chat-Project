export type FieldErrors<T extends string> = Partial<Record<T, string>>

export function validateLogin(username: string, password: string) {
  const errors: FieldErrors<'username' | 'password'> = {}
  if (!username.trim()) errors.username = 'Enter your username.'
  if (!password) errors.password = 'Enter your password.'
  return errors
}

export function validateRegistration(username: string, password: string, confirmPassword: string) {
  const errors: FieldErrors<'username' | 'password' | 'confirmPassword'> = {}
  if (!username.trim()) errors.username = 'Choose a username.'
  if (!password) errors.password = 'Choose a password.'
  if (!confirmPassword) errors.confirmPassword = 'Confirm your password.'
  else if (password && password !== confirmPassword) errors.confirmPassword = 'Passwords do not match.'
  return errors
}

export function errorMessage(error: unknown, fallback = 'Something went wrong. Please try again.') {
  return error instanceof Error && error.message ? error.message : fallback
}
