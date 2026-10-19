import Link from 'next/link'
import { Logo } from '@/components/brand/logo'
import { PreviewModeBadge } from '@/components/preview-mode-badge'

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string
  description: string
  children: React.ReactNode
  footer: React.ReactNode
}) {
  return (
    <main className="flex min-h-dvh flex-col bg-background">
      <header className="flex items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/login" className="rounded-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
          <Logo />
        </Link>
        <PreviewModeBadge />
      </header>

      <div className="flex flex-1 items-center justify-center px-5 pb-16">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex flex-col gap-1.5">
            <h1 className="text-xl font-semibold tracking-tight text-balance">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">{children}</div>
          <p className="mt-5 text-center text-sm text-muted-foreground">{footer}</p>
        </div>
      </div>
    </main>
  )
}
