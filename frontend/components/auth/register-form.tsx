'use client'

import { ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { FormAlert } from '@/components/auth/form-alert'
import { PasswordField, TextField } from '@/components/auth/form-field'
import { Button, buttonVariants } from '@/components/ui/button'
import { authService } from '@/lib/services'
import { cn } from '@/lib/utils'
import { type FieldErrors, errorMessage, validateRegistration } from '@/lib/validation'

type Field = 'username' | 'password' | 'confirmPassword'

export function RegisterForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordsVisible, setPasswordsVisible] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<Field>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdUsername, setCreatedUsername] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    const errors = validateRegistration(username, password, confirmPassword)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setIsSubmitting(true)
    try {
      const user = await authService.register({ username: username.trim(), password })
      setCreatedUsername(user.username)
    } catch (error) {
      setFormError(errorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (createdUsername) {
    return (
      <div className="flex flex-col gap-4">
        <FormAlert tone="success">
          Account <span className="font-semibold">{createdUsername}</span> created. You can now sign in.
        </FormAlert>
        <Link href="/login" className={cn(buttonVariants({ size: 'lg' }), 'h-10 w-full')}>
          Continue to sign in
          <ArrowRight aria-hidden="true" />
        </Link>
      </div>
    )
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
        autoComplete="new-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={fieldErrors.password}
        disabled={isSubmitting}
        visible={passwordsVisible}
        onVisibleChange={setPasswordsVisible}
      />
      <PasswordField
        label="Confirm password"
        name="confirmPassword"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        error={fieldErrors.confirmPassword}
        disabled={isSubmitting}
        visible={passwordsVisible}
        onVisibleChange={setPasswordsVisible}
      />

      <Button type="submit" size="lg" className="mt-1 h-10 w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="animate-spin" aria-hidden="true" />}
        {isSubmitting ? 'Creating account…' : 'Create account'}
      </Button>
    </form>
  )
}
