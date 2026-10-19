'use client'

import { useSyncExternalStore } from 'react'
import type { AuthSession } from '@/lib/types'

/**
 * Session is kept in sessionStorage so it clears when the tab closes.
 * Note: any JS-readable storage is exposed to XSS. An HttpOnly cookie set by the
 * backend is the safer long-term option (it also solves WebSocket auth).
 */
const STORAGE_KEY = 'hush.session'
const listeners = new Set<() => void>()

let cachedRaw: string | null = null
let cachedSession: AuthSession | null = null

function readSession(): AuthSession | null {
  const raw = window.sessionStorage.getItem(STORAGE_KEY)
  if (raw !== cachedRaw) {
    cachedRaw = raw
    try {
      cachedSession = raw ? (JSON.parse(raw) as AuthSession) : null
    } catch {
      cachedSession = null
    }
  }
  return cachedSession
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function notify() {
  listeners.forEach((listener) => listener())
}

export function saveSession(session: AuthSession) {
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  notify()
}

export function clearSession() {
  window.sessionStorage.removeItem(STORAGE_KEY)
  notify()
}

export function useSession() {
  const session = useSyncExternalStore(subscribe, readSession, () => null)
  const isReady = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
  return { session, isReady }
}
