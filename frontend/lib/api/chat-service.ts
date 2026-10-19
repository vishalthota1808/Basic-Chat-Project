import { ApiError, getJson } from '@/lib/api/http'
import { sendChatMessage, toChatMessage, type ServerMessage } from '@/lib/realtime/chat-socket'
import type { ChatMessage, MessageStatus, OutgoingChatMessage, PublicUser, UserId } from '@/lib/types'

export interface ChatService {
  listUsers(token: string): Promise<PublicUser[]>
  getConversation(token: string, otherUserId: UserId): Promise<ChatMessage[]>
  sendMessage(token: string, message: OutgoingChatMessage): Promise<MessageStatus>
}

interface UsersResponse {
  users?: PublicUser[]
}

interface ConversationResponse {
  messages?: ServerMessage[]
}

/** Real backend implementation. */
export const httpChatService: ChatService = {
  async listUsers(token) {
    const data = await getJson<UsersResponse>('/users', token)

    if (!Array.isArray(data?.users)) {
      throw new ApiError('Unexpected response from the server.', 500)
    }

    return data.users
  },

  async getConversation(token, otherUserId) {
    const data = await getJson<ConversationResponse>(`/messages/${otherUserId}`, token)

    if (!Array.isArray(data?.messages)) {
      throw new ApiError('Unexpected response from the server.', 500)
    }

    return data.messages.map((row) => toChatMessage(row))
  },

  async sendMessage(_token, message) {
    // The socket is authenticated once per session; the JWT is not resent per message.
    await sendChatMessage(message)
    return 'sending'
  },
}
