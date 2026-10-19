import type { LucideIcon } from 'lucide-react'
import { RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/** Shared empty / error state block used across the chat UI. */
export function StatePanel({
  icon: Icon,
  title,
  description,
  tone = 'default',
  onRetry,
  className,
}: {
  icon: LucideIcon
  title: string
  description?: string
  tone?: 'default' | 'error'
  onRetry?: () => void
  className?: string
}) {
  return (
    <div
      role={tone === 'error' ? 'alert' : undefined}
      className={cn('flex flex-col items-center justify-center gap-3 px-6 text-center', className)}
    >
      <span
        className={cn(
          'flex size-10 items-center justify-center rounded-xl border',
          tone === 'error'
            ? 'border-destructive/30 bg-destructive/10 text-destructive'
            : 'border-border bg-card text-muted-foreground',
        )}
      >
        <Icon className="size-4.5" aria-hidden="true" />
      </span>
      <div className="flex max-w-xs flex-col gap-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && <p className="text-pretty text-xs leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RotateCw aria-hidden="true" />
          Try again
        </Button>
      )}
    </div>
  )
}
