import { config } from '@/lib/config'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/** Thrown when the UI needs something the backend does not provide yet. */
export class BackendCapabilityError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BackendCapabilityError'
  }
}

function readErrorMessage(data: unknown): string | null {
  if (data && typeof data === 'object') {
    const { error, message } = data as Record<string, unknown>
    if (typeof error === 'string') return error
    if (typeof message === 'string') return message
  }
  return null
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${config.apiUrl}${path}`, init)
  } catch {
    throw new ApiError('Could not reach the server. Check that the backend is running.', 0)
  }

  const data: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(
      readErrorMessage(data) ?? `Request failed (${response.status}).`,
      response.status,
    )
  }

  return data as T
}

export function postJson<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

/** Authenticated GET. The JWT is sent as a Bearer token, matching the backend. */
export function getJson<T>(path: string, token: string): Promise<T> {
  return request<T>(path, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  })
}
