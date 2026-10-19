'use client'

import { ArrowLeft, MoreHorizontal } from 'lucide-react'
import { Composer } from '@/components/chat/composer'
import { MessageList } from '@/components/chat/message-list'
import { UserAvatar } from '@/components/user-avatar'
import { getSelfId, useConversation } from '@/hooks/use-conversation'
import type { AuthSession, PublicUser } from '@/lib/types'

export function ConversationPanel({
  session,
  user,
  onBack,
}: {
  session: AuthSession
  user: PublicUser
  onBack: () => void
}) {
  const { messages, error, isLoading, retry, sendMessage, sendError } = useConversation(session, user.id)

  return (
    <section aria-label={`Conversation with ${user.username}`} className="flex min-h-0 flex-1 flex-col bg-[#09090b]">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-zinc-800/60 bg-[#0c0c0e] px-3 md:px-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to people"
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 md:hidden"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
        </button>

        {/* Avatar + name */}
        <UserAvatar username={user.username} size="md" statusDot />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-zinc-100">{user.username}</h2>
          <p className="text-[11px] text-zinc-500">Online</p>
        </div>

        {/* Actions */}
        <button
          type="button"
          aria-label="More options"
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600"
        >
          <MoreHorizontal className="size-4" aria-hidden="true" />
        </button>
      </header>

      <MessageList
        messages={messages}
        selfId={getSelfId(session)}
        otherUsername={user.username}
        isLoading={isLoading}
        error={error}
        onRetry={retry}
      />

      <Composer recipientUsername={user.username} onSend={sendMessage} sendError={sendError} />
    </section>
  )
}
