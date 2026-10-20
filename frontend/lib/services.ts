import { httpAuthService } from '@/lib/api/auth-service'
import { httpChatService } from '@/lib/api/chat-service'

/** The backend-backed services used by the app. */
export const authService = httpAuthService
export const chatService = httpChatService
