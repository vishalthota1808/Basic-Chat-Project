'use client'

import { CircleAlert, SendHorizontal } from 'lucide-react'
import { useRef, useState } from 'react'

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
    <div className="shrink-0 border-t border-zinc-800/60 bg-[#0c0c0e] px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-5">
      <div className="mx-auto max-w-3xl">
        {sendError && (
          <p role="alert" className="mb-2 flex items-start gap-2 text-xs text-red-400">
            <CircleAlert className="mt-px size-3.5 shrink-0" aria-hidden="true" />
            {sendError}
          </p>
        )}
        <form
          onSubmit={(event) => {
            event.preventDefault()
            submit()
          }}
          className="flex items-end gap-2 rounded-xl border border-zinc-800 bg-zinc-900/70 p-1.5 pl-4 transition-colors focus-within:border-zinc-600 focus-within:ring-1 focus-within:ring-zinc-600/40"
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
            placeholder={`Message ${recipientUsername}…`}
            className="max-h-40 min-h-8 flex-1 resize-none bg-transparent py-1.5 text-sm leading-5 text-zinc-100 outline-none [field-sizing:content] placeholder:text-zinc-500"
          />
          <button
            type="submit"
            disabled={!canSend}
            aria-label="Send message"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-zinc-950 transition-all hover:bg-zinc-200 active:bg-zinc-300 disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
          >
            <SendHorizontal className="size-4" aria-hidden="true" />
          </button>
        </form>
        <p className="mt-1.5 hidden px-1 text-[11px] text-zinc-600 sm:block">
          <kbd className="font-sans font-medium text-zinc-500">Enter</kbd> to send ·{' '}
          <kbd className="font-sans font-medium text-zinc-500">Shift + Enter</kbd> for a new line
        </p>
      </div>
    </div>
  )
}
