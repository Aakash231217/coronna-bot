import { getCurrentUser } from '@/lib/current-user'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Bot, ShieldCheck, Sparkles, Zap } from 'lucide-react'
import React from 'react'

type Props = {
  children: React.ReactNode
}

const perks = [
  {
    icon: <Zap className="h-4 w-4" />,
    title: 'Deploy in 60 seconds',
    text: 'One snippet, any website, voice-enabled chat.',
  },
  {
    icon: <Sparkles className="h-4 w-4" />,
    title: 'Trained on your site',
    text: 'Auto-crawls your domain to build a smart knowledge base.',
  },
  {
    icon: <ShieldCheck className="h-4 w-4" />,
    title: 'Secure by default',
    text: 'Better Auth sessions and scoped Postgres storage.',
  },
]

const Layout = async ({ children }: Props) => {
  const user = await getCurrentUser()

  if (user) redirect('/dashboard')

  return (
    <div className="grid-bg flex min-h-screen w-full items-stretch">
      {/* Left brand panel */}
      <div className="relative hidden flex-1 overflow-hidden lg:flex">
        <div className="absolute inset-0 bg-brand-gradient opacity-95" />
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute right-0 bottom-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="relative z-10 flex flex-1 flex-col justify-between p-12 text-white">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold tracking-tight"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 backdrop-blur">
              <Bot className="h-5 w-5" />
            </span>
            Corinna AI
          </Link>

          <div>
            <h2 className="text-4xl font-bold tracking-tight text-balance">
              Your AI sales rep, ready in under a minute.
            </h2>
            <p className="mt-3 max-w-md text-white/80">
              Crawl any domain, customise your chatbot, embed it anywhere —
              voice replies and live handoff included.
            </p>
            <div className="mt-10 flex flex-col gap-4">
              {perks.map((p) => (
                <div
                  key={p.title}
                  className="flex items-start gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-md"
                >
                  <div className="mt-0.5 grid h-8 w-8 place-items-center rounded-lg bg-white/20">
                    {p.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{p.title}</p>
                    <p className="text-xs text-white/75">{p.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-white/70">
            © {new Date().getFullYear()} Corinna AI. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 lg:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient text-white">
              <Bot className="h-5 w-5" />
            </span>
            <span className="text-base font-semibold tracking-tight">
              Corinna AI
            </span>
          </div>
          <div className="glass-card rounded-3xl p-8 shadow-[0_30px_60px_-30px_rgba(91,91,214,0.35)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Layout
