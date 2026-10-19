import { formatTime } from '@/lib/format'
import type { ChatMessage, MessageStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

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
}: {
  message: ChatMessage
  isOwn: boolean
  continuesGroup: boolean
  endsGroup: boolean
}) {
  const statusLabel = isOwn ? STATUS_LABEL[message.status] : null
  const showMeta = endsGroup || statusLabel !== null

  return (
    <li className={cn('flex flex-col', isOwn ? 'items-end' : 'items-start', continuesGroup ? 'mt-0.5' : 'mt-3 first:mt-0')}>
      <p
        className={cn(
          'max-w-[85%] rounded-2xl px-3.5 py-2 text-[14px] leading-relaxed break-words whitespace-pre-wrap sm:max-w-[70%]',
          isOwn ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground',
          isOwn && endsGroup && 'rounded-br-md',
          !isOwn && endsGroup && 'rounded-bl-md',
          message.status === 'preview' && 'bg-primary/15 text-foreground ring-1 ring-primary/40 ring-inset',
          message.status === 'sending' && 'opacity-70',
          message.status === 'failed' && 'bg-destructive/15 text-foreground ring-1 ring-destructive/50 ring-inset',
        )}
      >
        {message.content}
      </p>
      {showMeta && (
        <p className="mt-1 flex items-center gap-1.5 px-1 text-[11px] text-muted-foreground">
          <time dateTime={message.createdAt}>{formatTime(new Date(message.createdAt))}</time>
          {statusLabel && (
            <span className={cn(message.status === 'failed' && 'text-destructive')}>{`· ${statusLabel}`}</span>
          )}
        </p>
      )}
    </li>
  )
}
