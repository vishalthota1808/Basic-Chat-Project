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
      <div role="status" aria-label="Loading people" className="flex flex-col gap-1">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex items-center gap-3 px-3 py-2.5">
            <span className="size-9 animate-pulse rounded-full bg-muted" />
            <span className="h-3 animate-pulse rounded bg-muted" style={{ width: `${40 + ((index * 17) % 35)}%` }} />
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
    <ul className="flex flex-col gap-0.5">
      {users.map((user) => {
        const isSelected = user.id === selectedUserId
        return (
          <li key={user.id}>
            <button
              type="button"
              onClick={() => onSelectUser(user)}
              aria-current={isSelected ? 'true' : undefined}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/40',
                isSelected
                  ? 'bg-accent text-accent-foreground'
                  : 'text-foreground/85 hover:bg-accent/60 hover:text-foreground active:bg-accent',
              )}
            >
              <UserAvatar username={user.username} />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{user.username}</span>
              {isSelected && <span aria-hidden="true" className="size-1.5 rounded-full bg-primary" />}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
