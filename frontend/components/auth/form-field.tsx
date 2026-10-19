'use client'

import { Eye, EyeOff, Lock, User, type LucideIcon } from 'lucide-react'
import { useId, useState } from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type FieldProps = Omit<React.ComponentProps<'input'>, 'id'> & {
  label: string
  error?: string
  icon?: LucideIcon
}

function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null
  return (
    <p id={id} className="text-xs text-red-400">
      {error}
    </p>
  )
}

export function TextField({ label, error, className, icon: Icon = User, ...props }: FieldProps) {
  const id = useId()
  const errorId = `${id}-error`
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-zinc-300">
        {label}
      </Label>
      <div
        className={cn(
          'flex h-11 w-full items-center gap-2.5 rounded-xl border border-zinc-800 bg-[#09090b] px-3.5 transition-colors focus-within:border-zinc-600 focus-within:ring-1 focus-within:ring-zinc-600',
          error && 'border-red-500/60 focus-within:border-red-500 focus-within:ring-red-500/30',
          className,
        )}
      >
        {Icon && <Icon className="size-4 shrink-0 text-zinc-500" aria-hidden="true" />}
        <input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className="w-full flex-1 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 outline-none disabled:cursor-not-allowed disabled:opacity-50"
          {...props}
        />
      </div>
      <FieldError id={errorId} error={error} />
    </div>
  )
}

export function PasswordField({
  label,
  error,
  className,
  visible,
  onVisibleChange,
  ...props
}: FieldProps & { visible?: boolean; onVisibleChange?: (visible: boolean) => void }) {
  const id = useId()
  const errorId = `${id}-error`
  const [localVisible, setLocalVisible] = useState(false)
  const isVisible = visible ?? localVisible
  const setVisible = onVisibleChange ?? setLocalVisible

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-zinc-300">
        {label}
      </Label>
      <div
        className={cn(
          'relative flex h-11 w-full items-center gap-2.5 rounded-xl border border-zinc-800 bg-[#09090b] px-3.5 transition-colors focus-within:border-zinc-600 focus-within:ring-1 focus-within:ring-zinc-600',
          error && 'border-red-500/60 focus-within:border-red-500 focus-within:ring-red-500/30',
          className,
        )}
      >
        <Lock className="size-4 shrink-0 text-zinc-500" aria-hidden="true" />
        <input
          id={id}
          type={isVisible ? 'text' : 'password'}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className="w-full flex-1 bg-transparent pr-8 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none disabled:cursor-not-allowed disabled:opacity-50"
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible(!isVisible)}
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          aria-pressed={isVisible}
          className="absolute right-3 text-zinc-500 transition-colors hover:text-zinc-300 focus-visible:text-zinc-200 focus-visible:outline-none"
        >
          {isVisible ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
        </button>
      </div>
      <FieldError id={errorId} error={error} />
    </div>
  )
}
