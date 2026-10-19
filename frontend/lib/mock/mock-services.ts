/**
 * MOCK SERVICES — simulate the backend locally for UI previews.
 * Nothing here talks to a server, and sent messages are never delivered.
 */
import type { AuthService } from '@/lib/api/auth-service'
import type { ChatService } from '@/lib/api/chat-service'
import { ApiError } from '@/lib/api/http'
import { MOCK_PASSWORD, MOCK_SELF_ID, MOCK_USERS, buildMockConversation } from '@/lib/mock/mock-data'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const mockAuthService: AuthService = {
  async login({ username, password }) {
    await delay(700)
    if (password !== MOCK_PASSWORD) {
      throw new ApiError('Incorrect username or password.', 401)
    }
    return { token: 'mock-preview-token', username, userId: MOCK_SELF_ID }
  },

  async register({ username }) {
    await delay(800)
    if (MOCK_USERS.some((user) => user.username.toLowerCase() === username.toLowerCase())) {
      throw new ApiError('That username is already taken.', 409)
    }
    return { id: MOCK_SELF_ID, username }
  },
}

export const mockChatService: ChatService = {
  async listUsers() {
    await delay(600)
    return MOCK_USERS
  },

  async getConversation(_token, otherUserId) {
    await delay(450)
    return buildMockConversation(otherUserId)
  },

  async sendMessage() {
    await delay(150)
    return 'preview'
  },
}
