import { cn } from '@/lib/utils'

const GRADIENTS = [
  'bg-gradient-to-br from-fuchsia-600 to-pink-500 shadow-sm shadow-pink-500/20',
  'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-sm shadow-purple-500/20',
  'bg-gradient-to-br from-rose-500 to-orange-400 shadow-sm shadow-orange-500/20',
  'bg-gradient-to-br from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/20',
  'bg-gradient-to-br from-blue-600 via-sky-500 to-cyan-400 shadow-sm shadow-blue-500/20',
  'bg-gradient-to-br from-violet-600 to-indigo-500 shadow-sm shadow-indigo-500/20',
]

function gradientFor(username: string) {
  let hash = 0
  for (const char of username) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return GRADIENTS[hash % GRADIENTS.length]
}

function initialsFor(username: string) {
  const parts = username.split(/[._\-\s]+/).filter(Boolean)
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : username.slice(0, 2)
  return letters.toUpperCase()
}

const SIZES = {
  sm: 'size-8 text-[11px]',
  md: 'size-10 text-xs',
  lg: 'size-11 text-sm',
} as const

export function UserAvatar({
  username,
  size = 'md',
  statusDot,
  className,
}: {
  username: string
  size?: keyof typeof SIZES
  statusDot?: boolean
  className?: string
}) {
  return (
    <div className="relative inline-flex shrink-0">
      <span
        aria-hidden="true"
        className={cn(
          'flex items-center justify-center rounded-full font-bold text-white tracking-wide select-none',
          SIZES[size],
          gradientFor(username),
          className,
        )}
      >
        {initialsFor(username)}
      </span>
      {statusDot && (
        <span
          aria-hidden="true"
          className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-[#111113] bg-emerald-500"
        />
      )}
    </div>
  )
}
