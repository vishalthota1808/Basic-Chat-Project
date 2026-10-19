import { cn } from '@/lib/utils'

const TINTS = [
  'bg-[oklch(0.33_0.035_168)] text-[oklch(0.9_0.05_168)]',
  'bg-[oklch(0.33_0.035_250)] text-[oklch(0.9_0.04_250)]',
  'bg-[oklch(0.33_0.035_300)] text-[oklch(0.9_0.04_300)]',
  'bg-[oklch(0.34_0.035_60)] text-[oklch(0.92_0.05_75)]',
  'bg-[oklch(0.33_0.035_20)] text-[oklch(0.9_0.04_20)]',
]

function tintFor(username: string) {
  let hash = 0
  for (const char of username) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return TINTS[hash % TINTS.length]
}

function initialsFor(username: string) {
  const parts = username.split(/[._\-\s]+/).filter(Boolean)
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : username.slice(0, 2)
  return letters.toUpperCase()
}

const SIZES = {
  sm: 'size-8 text-[11px]',
  md: 'size-9 text-xs',
} as const

export function UserAvatar({
  username,
  size = 'md',
  className,
}: {
  username: string
  size?: keyof typeof SIZES
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-semibold tracking-wide select-none',
        SIZES[size],
        tintFor(username),
        className,
      )}
    >
      {initialsFor(username)}
    </span>
  )
}
