'use client'

import { Eye, EyeOff } from 'lucide-react'
import { useId, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type FieldProps = Omit<React.ComponentProps<'input'>, 'id'> & {
  label: string
  error?: string
}

const inputClasses = 'h-10 rounded-lg bg-background px-3 dark:bg-background'

function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null
  return (
    <p id={id} className="text-xs text-destructive">
      {error}
    </p>
  )
}

export function TextField({ label, error, className, ...props }: FieldProps) {
  const id = useId()
  const errorId = `${id}-error`
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={cn(inputClasses, className)}
        {...props}
      />
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
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={isVisible ? 'text' : 'password'}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={cn(inputClasses, 'pr-10', className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible(!isVisible)}
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          aria-pressed={isVisible}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          {isVisible ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
        </button>
      </div>
      <FieldError id={errorId} error={error} />
    </div>
  )
}
