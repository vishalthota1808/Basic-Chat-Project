'use client'

import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FormAlert } from '@/components/auth/form-alert'
import { PasswordField, TextField } from '@/components/auth/form-field'
import { authService } from '@/lib/services'
import { saveSession } from '@/lib/session'
import { type FieldErrors, errorMessage, validateLogin } from '@/lib/validation'

export function LoginForm() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
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
        placeholder="your_username"
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
        placeholder="••••••••"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={fieldErrors.password}
        disabled={isSubmitting}
      />

      {/* Options Row: Remember Me & Forgot Password */}
      <div className="flex items-center justify-between pt-0.5 text-xs">
        <label className="flex cursor-pointer items-center gap-2 select-none text-zinc-400 hover:text-zinc-300">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="size-3.5 rounded border border-zinc-700 bg-zinc-900 accent-white transition-colors"
          />
          <span>Remember me</span>
        </label>
        <span className="text-zinc-400 transition-colors hover:text-zinc-200 cursor-pointer">
          Forgot password?
        </span>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 flex h-11 w-full items-center justify-center rounded-xl bg-white text-sm font-semibold text-zinc-950 transition-all hover:bg-zinc-200 active:bg-zinc-300 disabled:pointer-events-none disabled:opacity-50"
      >
        {isSubmitting ? (
          <Loader2 className="size-4 animate-spin text-zinc-950" aria-hidden="true" />
        ) : (
          'Continue'
        )}
      </button>
    </form>
  )
}
