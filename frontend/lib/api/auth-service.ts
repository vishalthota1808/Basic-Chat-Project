import { ApiError, postJson } from '@/lib/api/http'
import type { AuthSession, Credentials, LoginResponse, PublicUser } from '@/lib/types'

export interface AuthService {
  login(credentials: Credentials): Promise<AuthSession>
  register(credentials: Credentials): Promise<PublicUser>
}

/**
 * Reads the user id from the JWT payload for display purposes only.
 * The token is NOT verified here — the backend remains the source of truth.
 */
export function readUserIdFromToken(token: string): number | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    const id = json.userId ?? json.id ?? json.sub
    const numericId = Number(id)
    return Number.isInteger(numericId) ? numericId : null
  } catch {
    return null
  }
}

/** Accepts `{ id, username }` or `{ user: { id, username } }`. Adjust if your backend differs. */
function toPublicUser(data: unknown): PublicUser {
  const source =
    data && typeof data === 'object' && 'user' in data
      ? (data as { user: unknown }).user
      : data
  const { id, username } = (source ?? {}) as Partial<PublicUser>
  if (typeof id !== 'number' || typeof username !== 'string') {
    throw new ApiError('Unexpected response from the server.', 500)
  }
  return { id, username }
}

export const httpAuthService: AuthService = {
  async login(credentials) {
    try {
      const data = await postJson<LoginResponse>('/login', credentials)
      if (!data?.token) throw new ApiError('Unexpected response from the server.', 500)
      return {
        token: data.token,
        username: credentials.username,
        userId: readUserIdFromToken(data.token),
      }
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 400 || error.status === 404)
      ) {
        throw new ApiError('Incorrect username or password.', error.status)
      }
      throw error
    }
  },

  async register(credentials) {
    try {
      return toPublicUser(await postJson<unknown>('/register', credentials))
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        throw new ApiError('That username is already taken.', 409)
      }
      throw error
    }
  },
}
