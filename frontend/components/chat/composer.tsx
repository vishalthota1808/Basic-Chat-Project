'use client'

import { CircleAlert, SendHorizontal } from 'lucide-react'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'

const MAX_LENGTH = 2000

export function Composer({
  recipientUsername,
  onSend,
  sendError,
}: {
  recipientUsername: string
  onSend: (content: string) => Promise<void>
  sendError: string | null
}) {
  const [draft, setDraft] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const canSend = draft.trim().length > 0

  function submit() {
    const content = draft.trim()
    if (!content) return
    setDraft('')
    textareaRef.current?.focus()
    void onSend(content)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.shiftKey) return
    if (event.nativeEvent.isComposing || event.keyCode === 229) return
    event.preventDefault()
    submit()
  }

  return (
    <div className="shrink-0 border-t border-border px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-6">
      <div className="mx-auto max-w-3xl">
        {sendError && (
          <p role="alert" className="mb-2 flex items-start gap-2 text-xs text-destructive">
            <CircleAlert className="mt-px size-3.5 shrink-0" aria-hidden="true" />
            {sendError}
          </p>
        )}
        <form
          onSubmit={(event) => {
            event.preventDefault()
            submit()
          }}
          className="flex items-end gap-2 rounded-xl border border-input bg-card p-1.5 pl-3.5 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/25"
        >
          <label htmlFor="message-input" className="sr-only">
            {`Message ${recipientUsername}`}
          </label>
          <textarea
            id="message-input"
            ref={textareaRef}
            rows={1}
            value={draft}
            maxLength={MAX_LENGTH}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${recipientUsername}`}
            className="max-h-40 min-h-8 flex-1 resize-none bg-transparent py-1.5 text-sm leading-5 text-foreground outline-none [field-sizing:content] placeholder:text-muted-foreground"
          />
          <Button type="submit" size="icon" disabled={!canSend} aria-label="Send message" className="size-8 rounded-lg">
            <SendHorizontal aria-hidden="true" />
          </Button>
        </form>
        <p className="mt-1.5 hidden px-1 text-[11px] text-muted-foreground sm:block">
          <kbd className="font-sans font-medium text-foreground/80">Enter</kbd> to send ·{' '}
          <kbd className="font-sans font-medium text-foreground/80">Shift + Enter</kbd> for a new line
        </p>
      </div>
    </div>
  )
}
