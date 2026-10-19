const timeFormatter = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })
const dayFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'short', day: 'numeric' })

export function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString()
}

export function formatTime(date: Date) {
  return timeFormatter.format(date)
}

export function formatDayLabel(date: Date) {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (isSameDay(date, today)) return 'Today'
  if (isSameDay(date, yesterday)) return 'Yesterday'
  return dayFormatter.format(date)
}
