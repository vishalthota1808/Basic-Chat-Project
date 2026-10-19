import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        aria-hidden="true"
        className="flex size-7 items-center justify-center rounded-[10px] rounded-bl-[3px] bg-primary text-primary-foreground"
      >
        <span className="size-2 rounded-full bg-primary-foreground" />
      </span>
      <span className="text-[15px] font-semibold tracking-tight">Hush</span>
    </span>
  )
}
