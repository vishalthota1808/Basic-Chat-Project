'use client'

import { LogOut, Search } from 'lucide-react'
import { useState } from 'react'
import { Logo } from '@/components/brand/logo'
import { UserList } from '@/components/chat/user-list'
import { PreviewModeBadge } from '@/components/preview-mode-badge'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/user-avatar'
import { useUsers } from '@/hooks/use-users'
import type { AuthSession, PublicUser, UserId } from '@/lib/types'
import { cn } from '@/lib/utils'

export function Sidebar({
  session,
  selectedUserId,
  onSelectUser,
  onLogout,
  className,
}: {
  session: AuthSession
  selectedUserId: UserId | null
  onSelectUser: (user: PublicUser) => void
  onLogout: () => void
  className?: string
}) {
  const [query, setQuery] = useState('')
  const { users, error, isLoading, retry } = useUsers(session.token)

  const normalizedQuery = query.trim().toLowerCase()
  const otherUsers = users.filter((user) => user.id !== session.userId)
  const visibleUsers = normalizedQuery
    ? otherUsers.filter((user) => user.username.toLowerCase().includes(normalizedQuery))
    : otherUsers

  return (
    <aside
      aria-label="Conversations"
      className={cn('flex w-full shrink-0 flex-col border-r border-border bg-card md:w-80', className)}
    >
      <div className="flex h-14 items-center justify-between gap-2 px-4">
        <Logo />
        <PreviewModeBadge />
      </div>

      <div className="px-3 pb-2">
        <label htmlFor="user-search" className="sr-only">
          Search people
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="user-search"
            type="search"
            placeholder="Search people"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            disabled={isLoading || Boolean(error)}
            autoComplete="off"
            className="h-9 w-full rounded-lg border border-transparent bg-muted pr-3 pl-9 text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:opacity-50"
          />
        </div>
      </div>

      <h2 className="px-5 pt-2 pb-1.5 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
        People
      </h2>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        <UserList
          users={visibleUsers}
          isLoading={isLoading}
          error={error}
          onRetry={retry}
          isFiltered={Boolean(normalizedQuery)}
          selectedUserId={selectedUserId}
          onSelectUser={onSelectUser}
        />
      </div>

      <div className="flex items-center gap-3 border-t border-border px-3 py-3">
        <UserAvatar username={session.username} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{session.username}</p>
          <p className="text-xs text-muted-foreground">Signed in</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onLogout} aria-label="Log out" title="Log out">
          <LogOut aria-hidden="true" />
        </Button>
      </div>
    </aside>
  )
}
