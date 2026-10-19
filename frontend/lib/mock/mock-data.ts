/**
 * MOCK DATA — for previewing the UI only.
 * These are NOT real database users and their ids do not exist on the backend.
 * Disable with NEXT_PUBLIC_USE_MOCK_DATA=false.
 */
import type { ChatMessage, PublicUser, UserId } from '@/lib/types'

export const MOCK_PASSWORD = 'password123'

/** Id assigned to whoever signs in while in mock mode. */
export const MOCK_SELF_ID: UserId = -1

export const MOCK_USERS: PublicUser[] = [
  { id: -101, username: 'ana.ruiz' },
  { id: -102, username: 'kenji' },
  { id: -103, username: 'marta_k' },
  { id: -104, username: 'devon' },
  { id: -105, username: 'priya.s' },
  { id: -106, username: 'olu' },
]

type Script = Array<[from: 'me' | 'them', minutesAgo: number, content: string]>

const SCRIPTS: Record<UserId, Script> = {
  [-101]: [
    ['them', 60 * 26, 'Did you get a chance to look at the schema draft?'],
    ['me', 60 * 26 - 4, 'Yes! Left a few comments on the messages table.'],
    ['me', 60 * 26 - 3, 'Mostly about indexing receiver_id + created_at together.'],
    ['them', 60 * 25, 'Makes sense, history queries will need that.'],
    ['them', 42, 'Morning — pushed the migration.'],
    ['me', 38, 'Nice, pulling it now.'],
    ['them', 12, 'Let me know if the seed script breaks anything.'],
  ],
  [-102]: [
    ['them', 60 * 50, 'Are we still on for the study session Thursday?'],
    ['me', 60 * 49, 'Yep, library at 4?'],
    ['them', 60 * 49 - 2, 'Perfect. I will bring the networking notes.'],
  ],
  [-103]: [
    ['me', 95, 'How did the Argon2 benchmark go?'],
    ['them', 90, 'Around 60ms per hash with the defaults on my laptop.'],
    ['them', 89, "That feels fine for login. I wouldn't go lower on memory cost."],
    ['me', 80, 'Agreed. Keeping the defaults.'],
  ],
  [-104]: [],
  [-105]: [
    ['them', 60 * 24 * 6, 'Thanks for the help with the JWT middleware!'],
    ['me', 60 * 24 * 6 - 10, 'Anytime. The expiry check was the tricky part.'],
  ],
  [-106]: [],
}

export function buildMockConversation(otherUserId: UserId): ChatMessage[] {
  const now = Date.now()
  return (SCRIPTS[otherUserId] ?? []).map(([from, minutesAgo, content], index) => ({
    id: `mock-${otherUserId}-${index}`,
    senderId: from === 'me' ? MOCK_SELF_ID : otherUserId,
    receiverId: from === 'me' ? otherUserId : MOCK_SELF_ID,
    content,
    createdAt: new Date(now - minutesAgo * 60_000).toISOString(),
    status: 'sent',
  }))
}
