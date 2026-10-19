import { config } from '@/lib/config'
import type { ChatMessage, MessageStatus, OutgoingChatMessage } from '@/lib/types'

/** Raw message row as returned by the backend (Postgres uses snake_case). */
export interface ServerMessage {
  id: number
  sender_id: number
  receiver_id: number
  content: string
  created_at: string
  /** Present only on live frames, so the sender can reconcile its optimistic message. */
  clientId?: string | null
}

export function toChatMessage(row: ServerMessage, status: MessageStatus = 'sent'): ChatMessage {
  return {
    id: row.clientId ?? String(row.id),
    senderId: row.sender_id,
    receiverId: row.receiver_id,
    content: row.content,
    createdAt: row.created_at,
    status,
  }
}

type MessageListener = (message: ChatMessage) => void

const listeners = new Set<MessageListener>()

let socket: WebSocket | null = null
let sessionToken: string | null = null
let connecting: Promise<void> | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let stopped = true
// Incremented on every connect/disconnect so abandoned attempts cannot revive themselves.
let generation = 0

/**
 * Browsers cannot set an Authorization header on a WebSocket handshake, so we
 * exchange the JWT for a short-lived, single-use ticket over HTTP first.
 */
async function fetchTicket(token: string): Promise<string> {
  const response = await fetch(`${config.apiUrl}/ws-ticket`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    throw new Error('Could not authenticate the real-time connection.')
  }

  const data = (await response.json()) as { ticket?: string }
  if (!data.ticket) {
    throw new Error('The server did not return a real-time ticket.')
  }

  return data.ticket
}

function handleFrame(event: MessageEvent) {
  let row: ServerMessage
  try {
    row = JSON.parse(String(event.data)) as ServerMessage
  } catch {
    return
  }

  if (
    typeof row?.id !== 'number' ||
    typeof row.sender_id !== 'number' ||
    typeof row.receiver_id !== 'number' ||
    typeof row.content !== 'string'
  ) {
    return
  }

  const message = toChatMessage(row)
  listeners.forEach((listener) => listener(message))
}

function scheduleReconnect(gen: number) {
  if (gen !== generation || stopped || !sessionToken || reconnectTimer) return

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null
    if (gen !== generation || stopped) return

    void openSocket(gen).catch(() => scheduleReconnect(gen))
  }, 1_500)
}

function openSocket(gen: number = generation): Promise<void> {
  if (gen !== generation) return Promise.resolve()
  if (socket?.readyState === WebSocket.OPEN) return Promise.resolve()
  if (connecting) return connecting

  const token = sessionToken
  if (!token) return Promise.reject(new Error('Not signed in.'))

  const attempt = (async () => {
    const ticket = await fetchTicket(token)
    if (stopped || gen !== generation) throw new Error('Connection stopped.')

    await new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(`${config.wsUrl}?ticket=${encodeURIComponent(ticket)}`)
      socket = ws
      let settled = false

      const timer = setTimeout(() => {
        if (settled) return
        settled = true
        ws.close()
        reject(new Error('Timed out connecting to the chat server.'))
      }, 10_000)

      ws.addEventListener('open', () => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        resolve()
      })

      ws.addEventListener('message', handleFrame)

      ws.addEventListener('error', () => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        reject(new Error('Could not open the real-time connection.'))
      })

      ws.addEventListener('close', () => {
        clearTimeout(timer)
        const wasCurrent = socket === ws
        if (wasCurrent) socket = null

        if (!settled) {
          settled = true
          reject(new Error('The real-time connection closed.'))
        }

        if (wasCurrent) scheduleReconnect(gen)
      })
    })
  })()

  connecting = attempt
  attempt.then(
    () => {
      if (connecting === attempt) connecting = null
    },
    () => {
      if (connecting === attempt) connecting = null
    },
  )

  return attempt
}

async function ensureOpen(): Promise<WebSocket> {
  if (socket?.readyState === WebSocket.OPEN) return socket

  await openSocket()

  if (!socket || socket.readyState !== WebSocket.OPEN) {
    throw new Error('Not connected to the chat server.')
  }

  return socket
}

/** Opens (or reuses) the authenticated WebSocket for this session. */
export function connectChatSocket(token: string) {
  if (sessionToken === token && (socket || connecting)) return

  stopSocket()
  sessionToken = token
  stopped = false

  void openSocket(generation).catch(() => scheduleReconnect(generation))
}

export function disconnectChatSocket() {
  stopSocket()
}

function stopSocket() {
  stopped = true
  sessionToken = null
  connecting = null
  generation += 1

  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }

  const current = socket
  socket = null
  current?.close()
}

/** Subscribes to messages delivered over the socket (sent echoes and incoming messages). */
export function subscribeToMessages(listener: MessageListener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Sends a message, waiting briefly for the socket to be ready. */
export async function sendChatMessage(message: OutgoingChatMessage): Promise<void> {
  const ws = await ensureOpen()
  ws.send(JSON.stringify(message))
}
