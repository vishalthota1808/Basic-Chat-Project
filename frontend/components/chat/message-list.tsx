'use client'

import { ArrowDown, MessageCircleDashed, ServerOff } from 'lucide-react'
import { Fragment } from 'react'
import { MessageBubble } from '@/components/chat/message-bubble'
import { StatePanel } from '@/components/state-panel'
import { useAutoScroll } from '@/hooks/use-auto-scroll'
import { formatDayLabel, isSameDay } from '@/lib/format'
import type { ChatMessage, UserId } from '@/lib/types'
import { cn } from '@/lib/utils'

const GROUP_WINDOW_MS = 5 * 60_000

export function MessageList({
  messages,
  selfId,
  otherUsername,
  isLoading,
  error,
  onRetry,
}: {
  messages: ChatMessage[]
  selfId: UserId
  otherUsername: string
  isLoading: boolean
  error?: Error
  onRetry: () => void
}) {
  const lastMessage = messages.at(-1)
  const { containerRef, handleScroll, hasUnseen, scrollToBottom } = useAutoScroll(
    messages.length,
    lastMessage?.senderId === selfId,
  )

  if (isLoading) {
    return (
      <div role="status" aria-label="Loading messages" className="flex flex-1 flex-col justify-end gap-3 p-5">
        {[48, 32, 60, 40].map((width, index) => (
          <span
            key={index}
            className={cn('h-9 animate-pulse rounded-2xl bg-muted', index % 2 === 1 && 'self-end')}
            style={{ width: `${width}%` }}
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <StatePanel
        icon={ServerOff}
        tone="error"
        title="Couldn't load this conversation"
        description={error.message}
        onRetry={onRetry}
        className="flex-1"
      />
    )
  }

  if (messages.length === 0) {
    return (
      <StatePanel
        icon={MessageCircleDashed}
        title="No messages yet"
        description={`Say hello to ${otherUsername} to start the conversation.`}
        className="flex-1"
      />
    )
  }

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        role="log"
        aria-label="Messages"
        aria-live="polite"
        tabIndex={0}
        className="h-full overflow-y-auto px-3 py-4 outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-inset md:px-6"
      >
        <ol className="mx-auto flex max-w-3xl flex-col">
          {messages.map((message, index) => {
            const previous = messages[index - 1]
            const next = messages[index + 1]
            const date = new Date(message.createdAt)
            const startsNewDay = !previous || !isSameDay(new Date(previous.createdAt), date)
            const continuesGroup =
              !startsNewDay &&
              previous.senderId === message.senderId &&
              date.getTime() - new Date(previous.createdAt).getTime() < GROUP_WINDOW_MS
            const endsGroup =
              !next ||
              next.senderId !== message.senderId ||
              !isSameDay(new Date(next.createdAt), date) ||
              new Date(next.createdAt).getTime() - date.getTime() >= GROUP_WINDOW_MS

            return (
              <Fragment key={message.id}>
                {startsNewDay && (
                  <li className="my-4 flex justify-center first:mt-0">
                    <span className="text-[11px] font-medium text-muted-foreground">{formatDayLabel(date)}</span>
                  </li>
                )}
                <MessageBubble
                  message={message}
                  isOwn={message.senderId === selfId}
                  continuesGroup={continuesGroup}
                  endsGroup={endsGroup}
                />
              </Fragment>
            )
          })}
        </ol>
      </div>

      {hasUnseen && (
        <button
          type="button"
          onClick={() => scrollToBottom('smooth')}
          className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-border bg-popover px-3 py-1.5 text-xs font-medium text-popover-foreground transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
        >
          <ArrowDown className="size-3.5" aria-hidden="true" />
          New messages
        </button>
      )}
    </div>
  )
}
