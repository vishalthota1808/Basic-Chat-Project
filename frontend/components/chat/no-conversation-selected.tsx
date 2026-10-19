import { MessagesSquare } from 'lucide-react'

export function NoConversationSelected() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl rounded-bl-md border border-border bg-card text-primary">
        <MessagesSquare className="size-5" aria-hidden="true" />
      </span>
      <div className="flex max-w-xs flex-col gap-1.5">
        <h2 className="text-base font-semibold">Pick someone to talk to</h2>
        <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
          Choose a person from the list to open your private conversation.
        </p>
      </div>
    </div>
  )
}
