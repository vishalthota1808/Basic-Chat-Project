import { formatTime } from '@/lib/format'
import type { ChatMessage, MessageStatus } from '@/lib/types'
import { cn } from '@/lib/utils'
import { UserAvatar } from '@/components/user-avatar'

const STATUS_LABEL: Record<MessageStatus, string | null> = {
  preview: 'Local preview · not delivered',
  sending: 'Sending…',
  sent: null,
  failed: 'Not sent',
}

export function MessageBubble({
  message,
  isOwn,
  continuesGroup,
  endsGroup,
  otherUsername,
}: {
  message: ChatMessage
  isOwn: boolean
  continuesGroup: boolean
  endsGroup: boolean
  otherUsername: string
}) {
  const statusLabel = isOwn ? STATUS_LABEL[message.status] : null
  const showMeta = endsGroup || statusLabel !== null

  return (
    <li
      className={cn(
        'flex items-end gap-2',
        isOwn ? 'flex-row-reverse' : 'flex-row',
        continuesGroup ? 'mt-0.5' : 'mt-4 first:mt-0',
      )}
    >
      {/* Avatar — only shown on last message in incoming group */}
      {!isOwn && (
        <div className="shrink-0 self-end">
          {endsGroup ? (
            <UserAvatar username={otherUsername} size="sm" />
          ) : (
            <span className="block size-8" aria-hidden="true" />
          )}
        </div>
      )}

      <div className={cn('flex max-w-[75%] flex-col gap-1 sm:max-w-[60%]', isOwn ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'rounded-2xl px-3.5 py-2 text-[14px] leading-relaxed break-words whitespace-pre-wrap',
            isOwn
              ? [
                  'bg-white text-zinc-950 shadow-sm',
                  endsGroup && 'rounded-br-md',
                  message.status === 'sending' && 'opacity-60',
                  message.status === 'failed' &&
                    'bg-transparent text-zinc-100 ring-1 ring-red-500/50 ring-inset',
                  message.status === 'preview' &&
                    'bg-transparent text-zinc-300 ring-1 ring-zinc-600 ring-inset',
                ]
              : [
                  'bg-zinc-800 text-zinc-100',
                  endsGroup && 'rounded-bl-md',
                ],
          )}
        >
          {message.content}
        </div>

        {showMeta && (
          <p className="flex items-center gap-1.5 px-1 text-[11px] text-zinc-500">
            <time dateTime={message.createdAt}>{formatTime(new Date(message.createdAt))}</time>
            {statusLabel && (
              <span className={cn(message.status === 'failed' && 'text-red-400')}>
                · {statusLabel}
              </span>
            )}
          </p>
        )}
      </div>
    </li>
  )
}
