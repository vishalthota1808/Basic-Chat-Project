import { isMockMode } from '@/lib/services'

export function PreviewModeBadge() {
  if (!isMockMode) return null
  return (
    <span
      title="Using local mock data. Nothing is sent to a server."
      className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 font-mono text-[10px] font-medium tracking-wider text-muted-foreground uppercase"
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-amber-300/80" />
      Mock data
    </span>
  )
}
