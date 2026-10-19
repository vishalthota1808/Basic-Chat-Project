'use client'

import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FormAlert } from '@/components/auth/form-alert'
import { PasswordField, TextField } from '@/components/auth/form-field'
import { Button } from '@/components/ui/button'
import { MOCK_PASSWORD } from '@/lib/mock/mock-data'
import { authService, isMockAuthMode } from '@/lib/services'
import { saveSession } from '@/lib/session'
import { type FieldErrors, errorMessage, validateLogin } from '@/lib/validation'

export function LoginForm() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<'username' | 'password'>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    const errors = validateLogin(username, password)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setIsSubmitting(true)
    try {
      const session = await authService.login({ username: username.trim(), password })
      saveSession(session)
      router.replace('/chat')
    } catch (error) {
      setFormError(errorMessage(error))
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {formError && <FormAlert tone="error">{formError}</FormAlert>}

      <TextField
        label="Username"
        name="username"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        error={fieldErrors.username}
        disabled={isSubmitting}
      />
      <PasswordField
        label="Password"
        name="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={fieldErrors.password}
        disabled={isSubmitting}
      />

      <Button type="submit" size="lg" className="mt-1 h-10 w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="animate-spin" aria-hidden="true" />}
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </Button>

      {isMockAuthMode && (
        <p className="text-xs leading-relaxed text-muted-foreground">
          Mock mode: any username works with the password{' '}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">{MOCK_PASSWORD}</code>.
        </p>
      )}
    </form>
  )
}
