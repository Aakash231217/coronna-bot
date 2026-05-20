import * as React from 'react'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'

const links = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'News Room', href: '#news' },
  { label: 'Docs', href: '#' },
]

function NavBar() {
  return (
    <div className="sticky top-4 z-50 mx-auto flex w-[min(96%,1180px)] items-center justify-between gap-5 rounded-2xl border border-border bg-card/80 px-5 py-3 backdrop-blur-xl shadow-[0_8px_30px_-12px_rgba(91,91,214,0.25)]">
      <Link
        href="/"
        className="flex items-center gap-2 text-base font-semibold tracking-tight"
      >
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-gradient text-white shadow-md">
          <Sparkles className="h-4 w-4" />
        </span>
        <span>Corinna AI</span>
      </Link>
      <ul className="hidden gap-7 text-sm text-muted-foreground md:flex">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="transition hover:text-foreground"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-2">
        <Link
          href="/auth/sign-in"
          className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:inline-flex"
        >
          Sign in
        </Link>
        <Link
          href="/auth/sign-up"
          className="inline-flex items-center justify-center rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_24px_-12px_rgba(91,91,214,0.7)] transition hover:shadow-[0_12px_24px_-10px_rgba(91,91,214,0.6)]"
        >
          Start free
        </Link>
      </div>
    </div>
  )
}

export default NavBar
