export type UserId = number

/** Public user information as returned by the backend (never includes password data). */
export interface PublicUser {
  id: UserId
  username: string
}

export interface Credentials {
  username: string
  password: string
}

/** The logged-in user's session. Kept separate from the selected conversation. */
export interface AuthSession {
  token: string
  username: string
  /** Read from the JWT payload when available. Used only to tell sent from received messages. */
  userId: UserId | null
}

/**
 * - `preview`: added to local UI state only (mock mode). NOT delivered to anyone.
 * - `sending`: handed to the transport, waiting for confirmation.
 * - `sent`:    accepted by the backend.
 * - `failed`:  could not be sent.
 */
export type MessageStatus = 'preview' | 'sending' | 'sent' | 'failed'

export interface ChatMessage {
  id: string
  senderId: UserId
  receiverId: UserId
  content: string
  /** ISO 8601 timestamp */
  createdAt: string
  status: MessageStatus
}

/** Exact payload the backend expects over the WebSocket. The sender is derived from the JWT. */
export interface OutgoingChatMessage {
  receiverId: UserId
  content: string
  /** Client-generated id used to match the server's echo with the optimistic message. */
  clientId: string
}

export interface LoginResponse {
  token: string
}
