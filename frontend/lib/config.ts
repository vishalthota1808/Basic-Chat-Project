/**
 * Frontend configuration, read from NEXT_PUBLIC_* environment variables.
 * See .env.example for the available options.
 */
export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000',
  wsUrl: process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:3000/ws',
} as const
