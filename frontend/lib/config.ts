/**
 * Frontend configuration, read from NEXT_PUBLIC_* environment variables.
 * See .env.example for the available options.
 */
const mockDataDefault = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'false'

/** Per-service override that falls back to the global mock flag. */
function useMockFor(value: string | undefined) {
  return value === undefined ? mockDataDefault : value !== 'false'
}

export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000',
  wsUrl: process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:3000/ws',
  // Mock mode is ON unless explicitly disabled, so the UI is previewable without a backend.
  // Auth and chat can be switched independently while the frontend is being connected.
  useMockAuth: useMockFor(process.env.NEXT_PUBLIC_USE_MOCK_AUTH),
  useMockChat: useMockFor(process.env.NEXT_PUBLIC_USE_MOCK_CHAT),
} as const  
