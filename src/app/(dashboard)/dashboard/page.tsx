import { getUserAppointments } from '@/actions/appointment'
import {
  getUserClients,
  getUserTotalProductPrices,
} from '@/actions/dashboard'
import DashboardCard from '@/components/dashboard/cards'
import InfoBar from '@/components/infobar'
import {
  CalendarClock,
  TrendingUp,
  Users,
  Bot,
  Globe2,
} from 'lucide-react'
import React from 'react'

const Page = async () => {
  const clients = await getUserClients()
  const bookings = await getUserAppointments()
  const products = await getUserTotalProductPrices()

  const pipeline = (products || 0) * (clients || 0)

  return (
    <>
      <InfoBar />
      <div className="scrollbar-pretty h-0 w-full flex-1 overflow-y-auto pr-1">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardCard
            value={clients || 0}
            title="Potential clients"
            icon={<Users className="h-5 w-5" />}
          />
          <DashboardCard
            value={pipeline}
            sales
            title="Pipeline value"
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <DashboardCard
            value={bookings || 0}
            title="Appointments"
            icon={<CalendarClock className="h-5 w-5" />}
          />
          <DashboardCard
            value={clients || 0}
            title="Conversations ready"
            icon={<Bot className="h-5 w-5" />}
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-5">
          <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">Workspace access</h2>
                <p className="text-sm text-muted-foreground">
                  Subscription blocks are removed for this local build.
                </p>
              </div>
              <span className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand">
                Open access
              </span>
            </div>
            <div className="mt-6 grid gap-3">
              {[
                ['Unlimited domain setup', 'Add and train chatbot domains without plan checks.'],
                ['No Stripe required', 'Payments and Connect onboarding are hidden from the app UI.'],
                ['Chatbot-first workflow', 'Focus on widget, conversations and appointment capture.'],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="text-sm font-semibold text-gravel">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{copy}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient text-white shadow">
                  <Globe2 className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Setup guide</h2>
                  <p className="text-sm text-muted-foreground">
                    Make the chatbot live on your customer website.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {[
                ['1', 'Add a domain', 'Train the bot from your site content.'],
                ['2', 'Customize mascot', 'Pick skin tone, hair and personality.'],
                ['3', 'Copy widget code', 'Paste the embed script on your website.'],
              ].map(([step, title, copy]) => (
                <div key={step} className="rounded-2xl border border-border bg-muted/30 p-4">
                  <div className="mb-4 grid h-9 w-9 place-items-center rounded-full bg-brand text-sm font-bold text-white">
                    {step}
                  </div>
                  <p className="text-sm font-semibold text-gravel">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Page
