import { CircleAlert, CircleCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

export function FormAlert({ tone, children }: { tone: 'error' | 'success'; children: React.ReactNode }) {
  const Icon = tone === 'error' ? CircleAlert : CircleCheck
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-xs leading-relaxed',
        tone === 'error'
          ? 'border-red-900/50 bg-red-950/40 text-red-300'
          : 'border-emerald-900/50 bg-emerald-950/40 text-emerald-300',
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  )
}
