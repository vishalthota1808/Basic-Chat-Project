  'use client'

  import { Loader2 } from 'lucide-react'
  import { useRouter } from 'next/navigation'
  import { useEffect, useState } from 'react'
  import { ConversationPanel } from '@/components/chat/conversation-panel'
  import { NoConversationSelected } from '@/components/chat/no-conversation-selected'
  import { Sidebar } from '@/components/chat/sidebar'
  import { connectChatSocket, disconnectChatSocket } from '@/lib/realtime/chat-socket'
  import { clearSession, useSession } from '@/lib/session'
  import type { PublicUser } from '@/lib/types'
  import { cn } from '@/lib/utils'

  export function ChatApp() {
    const router = useRouter()
    const { session, isReady } = useSession()
    // The selected conversation is UI state only; it never affects the logged-in identity.
    const [selectedUser, setSelectedUser] = useState<PublicUser | null>(null)

    useEffect(() => {
      if (isReady && !session) router.replace('/login')
    }, [isReady, session, router])

    // Keep one authenticated socket open for the whole chat session.
    useEffect(() => {
      if (!session) return
      connectChatSocket(session.token)
      return () => disconnectChatSocket()
    }, [session])

    if (!session) {
      return (
        <div className="flex h-dvh items-center justify-center" role="status">
          <Loader2 className="size-5 animate-spin text-muted-foreground" aria-hidden="true" />
          <span className="sr-only">Loading</span>
        </div>
      )
    }

    function handleLogout() {
      clearSession()
      router.replace('/login')
    }

    return (
      <div className="flex h-dvh overflow-hidden bg-background">
        <Sidebar
          session={session}
          selectedUserId={selectedUser?.id ?? null}
          onSelectUser={setSelectedUser}
          onLogout={handleLogout}
          className={cn(selectedUser && 'hidden md:flex')}
        />
        <main className={cn('min-w-0 flex-1 flex-col', selectedUser ? 'flex' : 'hidden md:flex')}>
          {selectedUser ? (
            <ConversationPanel
              key={selectedUser.id}
              session={session}
              user={selectedUser}
              onBack={() => setSelectedUser(null)}
            />
          ) : (
            <NoConversationSelected />
          )}
        </main>
      </div>
    )
  }
