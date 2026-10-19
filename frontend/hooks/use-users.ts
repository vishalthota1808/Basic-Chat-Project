'use client'

import useSWR from 'swr'
import { chatService } from '@/lib/services'

export function useUsers(token: string) {
  const { data, error, isLoading, mutate } = useSWR(
    ['users', token],
    ([, sessionToken]) => chatService.listUsers(sessionToken),
    { shouldRetryOnError: false },
  )

  return {
    users: data ?? [],
    error: error as Error | undefined,
    isLoading,
    retry: () => mutate(),
  }
}
