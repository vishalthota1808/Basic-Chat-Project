import Link from 'next/link'
import { Logo } from '@/components/brand/logo'

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
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#070709] px-4 py-12 selection:bg-zinc-700 selection:text-white">
      {/* Subtle celestial grid and starfield background */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(#3f3f46_1px,transparent_1px),linear-gradient(to_right,#27272a25_1px,transparent_1px),linear-gradient(to_bottom,#27272a25_1px,transparent_1px)] [background-size:48px_48px,96px_96px,96px_96px]" 
      />
      {/* Soft radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[650px] rounded-full bg-zinc-600/5 blur-[120px]"
      />

      {/* Top subtle nav */}
      <header className="absolute top-0 inset-x-0 flex items-center justify-between px-6 py-5 z-10">
        <Link
          href="/login"
          className="transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 rounded-md"
        >
          <Logo />
        </Link>
      </header>

      {/* Centered Modal Card */}
      <div className="relative z-10 w-full max-w-[420px]">
        <div className="rounded-2xl border border-zinc-800/80 bg-[#121214] p-7 shadow-2xl shadow-black/80 sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
            <p className="mt-1.5 text-sm text-zinc-400">{description}</p>
          </div>

          {children}

          <div className="mt-6 text-center text-sm text-zinc-400">
            {footer}
          </div>
        </div>
      </div>
    </main>
  )
}
