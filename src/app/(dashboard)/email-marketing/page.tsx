import InfoBar from '@/components/infobar'
import { Lock, Mail, Sparkles } from 'lucide-react'
import React from 'react'

const Page = async () => {
  return (
    <>
      <InfoBar />
      <div className="scrollbar-pretty h-0 w-full flex-1 overflow-y-auto pr-2">
        <div className="relative min-h-[680px] overflow-hidden rounded-[28px] border border-border bg-[radial-gradient(circle_at_20%_10%,rgba(255,186,89,0.22),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(94,151,246,0.18),transparent_30%),linear-gradient(145deg,#ffffff,#f8fafc)] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="absolute right-8 top-8 hidden h-40 w-40 rounded-full border border-dashed border-orange/40 md:block" />
          <div className="absolute bottom-10 right-14 hidden h-24 w-24 rounded-3xl bg-orange/10 blur-sm md:block" />

          <div className="relative z-10 flex max-w-4xl flex-col gap-8">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-orange/20 bg-orange/10 px-4 py-2 text-sm font-semibold text-orange">
              <Lock className="h-4 w-4" />
              Feature coming soon
            </div>

            <div>
              <h1 className="max-w-3xl text-4xl font-bold tracking-normal text-gravel md:text-5xl">
                Email marketing is getting rebuilt.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                Campaigns, contacts, templates and bulk sending are temporarily locked while the new Indian-market friendly outreach system is prepared.
              </p>
            </div>

            <div className="grid max-w-5xl gap-4 md:grid-cols-3">
              {[
                ['Audience lists', 'Import and segment leads captured by the chatbot.'],
                ['Campaign builder', 'Create polished follow-ups without touching Stripe or paid credits.'],
                ['Delivery controls', 'Safer sending, better templates and clear analytics.'],
              ].map(([title, copy]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-border bg-white/80 p-5 shadow-sm backdrop-blur"
                >
                  <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-brand-gradient text-white shadow">
                    <Mail className="h-4 w-4" />
                  </div>
                  <h2 className="text-base font-bold text-gravel">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-white/90 p-4 shadow-sm">
              <Sparkles className="h-5 w-5 text-orange" />
              <p className="text-sm font-medium text-gravel">
                The rest of the dashboard is unlocked. You can keep using domains, chatbot settings, conversations and appointments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Page
