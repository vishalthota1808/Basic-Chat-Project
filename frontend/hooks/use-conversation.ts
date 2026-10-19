'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { subscribeToMessages } from '@/lib/realtime/chat-socket'
import { chatService } from '@/lib/services'
import type { AuthSession, ChatMessage, MessageStatus, UserId } from '@/lib/types'

export function getSelfId(session: AuthSession): UserId {
  return session.userId ?? 0
}

export function useConversation(session: AuthSession, otherUserId: UserId) {
  const [sendError, setSendError] = useState<string | null>(null)

  const { data, error, isLoading, mutate } = useSWR(
    ['conversation', session.token, otherUserId] as const,
    ([, token, userId]) => chatService.getConversation(token, userId),
    {
      // Keep locally added messages when switching back to a conversation.
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    },
  )

  // Live frames: new messages from the other user, and echoes of our own sends.
  useEffect(() => {
    return subscribeToMessages((incoming) => {
      if (incoming.senderId !== otherUserId && incoming.receiverId !== otherUserId) return

      void mutate(
        (previous = []) => {
          const index = previous.findIndex((item) => item.id === incoming.id)
          if (index === -1) return [...previous, incoming]

          // Reconcile the optimistic message with the server's saved copy.
          const next = [...previous]
          next[index] = incoming
          return next
        },
        { revalidate: false },
      )
    })
  }, [mutate, otherUserId])

  async function sendMessage(content: string) {
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      senderId: getSelfId(session),
      receiverId: otherUserId,
      content,
      createdAt: new Date().toISOString(),
      status: 'sending',
    }

    setSendError(null)
    await mutate((previous = []) => [...previous, message], { revalidate: false })

    let status: MessageStatus
    try {
      status = await chatService.sendMessage(session.token, {
        receiverId: otherUserId,
        content,
        clientId: message.id,
      })
    } catch (sendFailure) {
      status = 'failed'
      setSendError(sendFailure instanceof Error ? sendFailure.message : 'Message could not be sent.')
    }

    await mutate(
      (previous = []) => previous.map((item) => (item.id === message.id ? { ...item, status } : item)),
      { revalidate: false },
    )
  }

  return {
    messages: data ?? [],
    error: error as Error | undefined,
    isLoading,
    retry: () => mutate(),
    sendMessage,
    sendError,
  }
}
