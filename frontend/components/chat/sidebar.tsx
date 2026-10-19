'use client'

import { LogOut, MessageSquarePlus, Search, Settings } from 'lucide-react'
import { useState } from 'react'
import { Logo } from '@/components/brand/logo'
import { UserList } from '@/components/chat/user-list'
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
      className={cn(
        'flex w-full shrink-0 flex-col border-r border-zinc-800/60 bg-[#0c0c0e] md:w-72',
        className,
      )}
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between px-4">
        <Logo />
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="New conversation"
            className="flex size-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600"
          >
            <MessageSquarePlus className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Settings"
            className="flex size-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600"
          >
            <Settings className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 pb-3">
        <label htmlFor="user-search" className="sr-only">
          Search people
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-zinc-500"
            aria-hidden="true"
          />
          <input
            id="user-search"
            type="search"
            placeholder="Search people..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            disabled={isLoading || Boolean(error)}
            autoComplete="off"
            className="h-9 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 pr-3 pl-8 text-sm text-zinc-100 transition-colors outline-none placeholder:text-zinc-500 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 disabled:opacity-50"
          />
        </div>
      </div>

      {/* Section label */}
      <p className="px-4 pb-2 text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">
        Direct Messages
      </p>

      {/* User list */}
      <div className="min-h-0 flex-1 overflow-y-auto pb-2">
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

      {/* Footer — logged-in user */}
      <div className="flex items-center gap-3 border-t border-zinc-800/60 px-3 py-3">
        <UserAvatar username={session.username} size="sm" statusDot />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-zinc-100">{session.username}</p>
          <p className="text-[11px] text-zinc-500">Online</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          aria-label="Log out"
          title="Log out"
          className="flex size-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600"
        >
          <LogOut className="size-4" aria-hidden="true" />
        </button>
      </div>
    </aside>
  )
}
