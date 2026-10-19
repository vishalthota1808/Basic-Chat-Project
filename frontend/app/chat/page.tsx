import type { Metadata } from 'next'
import { ChatApp } from '@/components/chat/chat-app'

export const metadata: Metadata = { title: 'Messages' }

export default function ChatPage() {
  return <ChatApp />
}
