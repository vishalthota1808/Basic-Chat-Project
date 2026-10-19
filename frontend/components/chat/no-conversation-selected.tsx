import { MessageSquareCode } from 'lucide-react'

export function NoConversationSelected() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 bg-[#09090b] px-6 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-white shadow-lg shadow-white/10">
        <MessageSquareCode className="size-6 text-zinc-950" aria-hidden="true" />
      </span>
      <div className="flex max-w-xs flex-col gap-2">
        <h2 className="text-base font-semibold text-zinc-100">Your conversations</h2>
        <p className="text-sm leading-relaxed text-zinc-500">
          Select someone from the sidebar to open a private conversation.
        </p>
      </div>
    </div>
  )
}
