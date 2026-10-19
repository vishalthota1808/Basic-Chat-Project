import { SearchX, ServerOff, Users } from 'lucide-react'
import { StatePanel } from '@/components/state-panel'
import { UserAvatar } from '@/components/user-avatar'
import type { PublicUser, UserId } from '@/lib/types'
import { cn } from '@/lib/utils'

export function UserList({
  users,
  isLoading,
  error,
  onRetry,
  isFiltered,
  selectedUserId,
  onSelectUser,
}: {
  users: PublicUser[]
  isLoading: boolean
  error?: Error
  onRetry: () => void
  isFiltered: boolean
  selectedUserId: UserId | null
  onSelectUser: (user: PublicUser) => void
}) {
  if (isLoading) {
    return (
      <div role="status" aria-label="Loading people" className="flex flex-col gap-0.5 px-2">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex items-center gap-3 rounded-xl px-3 py-2.5">
            <span className="size-10 animate-pulse rounded-full bg-zinc-800" />
            <div className="flex flex-1 flex-col gap-1.5">
              <span
                className="h-2.5 animate-pulse rounded bg-zinc-800"
                style={{ width: `${40 + ((index * 17) % 35)}%` }}
              />
              <span className="h-2 w-24 animate-pulse rounded bg-zinc-800/60" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <StatePanel
        icon={ServerOff}
        tone="error"
        title="Couldn't load people"
        description={error.message}
        onRetry={onRetry}
        className="py-10"
      />
    )
  }

  if (users.length === 0) {
    return isFiltered ? (
      <StatePanel icon={SearchX} title="No matches" description="No one with that username." className="py-10" />
    ) : (
      <StatePanel icon={Users} title="No one here yet" description="Other users will appear once they register." className="py-10" />
    )
  }

  return (
    <ul className="flex flex-col gap-0.5 px-2">
      {users.map((user) => {
        const isSelected = user.id === selectedUserId
        return (
          <li key={user.id}>
            <button
              type="button"
              onClick={() => onSelectUser(user)}
              aria-current={isSelected ? 'true' : undefined}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-zinc-600',
                isSelected
                  ? 'bg-zinc-800/80 text-zinc-100'
                  : 'text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100 active:bg-zinc-800/70',
              )}
            >
              <UserAvatar username={user.username} statusDot />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium leading-snug">{user.username}</p>
                <p className="truncate text-[11px] text-zinc-500 leading-snug">Click to start chatting</p>
              </div>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
