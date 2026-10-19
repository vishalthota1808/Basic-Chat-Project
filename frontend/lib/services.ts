import { httpAuthService } from '@/lib/api/auth-service'
import { httpChatService } from '@/lib/api/chat-service'
import { config } from '@/lib/config'
import { mockAuthService, mockChatService } from '@/lib/mock/mock-services'

/** The single place where mock vs. real services are chosen. */
export const authService = config.useMockAuth ? mockAuthService : httpAuthService
export const chatService = config.useMockChat ? mockChatService : httpChatService

/** Chat is still on mock data — used by the "mock data" badge and preview banners. */
export const isMockMode = config.useMockChat
/** Auth is still on mock data — used by the mock-password hint on the login form. */
export const isMockAuthMode = config.useMockAuth
