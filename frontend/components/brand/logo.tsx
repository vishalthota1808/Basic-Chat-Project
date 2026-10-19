import { MessageSquareCode } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5 select-none', className)}>
      <span
        aria-hidden="true"
        className="flex size-7 items-center justify-center rounded-lg bg-white text-black shadow-sm"
      >
        <MessageSquareCode className="size-4" />
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-white font-sans">
        Whispr
      </span>
    </span>
  )
}
