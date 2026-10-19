'use client'

import { ArrowLeft, Info } from 'lucide-react'
import { Composer } from '@/components/chat/composer'
import { MessageList } from '@/components/chat/message-list'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/user-avatar'
import { getSelfId, useConversation } from '@/hooks/use-conversation'
import { isMockMode } from '@/lib/services'
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
    <section aria-label={`Conversation with ${user.username}`} className="flex min-h-0 flex-1 flex-col">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-3 md:px-5">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back to people" className="md:hidden">
          <ArrowLeft aria-hidden="true" />
        </Button>
        <UserAvatar username={user.username} size="sm" />
        <h2 className="min-w-0 truncate text-sm font-semibold">{user.username}</h2>
      </header>

      {isMockMode && (
        <p className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground md:px-5">
          <Info className="size-3.5 shrink-0" aria-hidden="true" />
          Preview mode: messages you send stay on this device and are not delivered.
        </p>
      )}

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
