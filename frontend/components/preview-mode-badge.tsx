import { isMockMode } from '@/lib/services'

export function PreviewModeBadge() {
  if (!isMockMode) return null
  return (
    <span
      title="Using local mock data. Nothing is sent to a server."
      className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-900 px-2 py-0.5 font-mono text-[10px] font-medium tracking-wider text-zinc-400 uppercase"
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-zinc-400" />
      Mock
    </span>
  )
}
