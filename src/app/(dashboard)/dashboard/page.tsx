import { getDashboardAnalytics } from '@/actions/dashboard'
import DashboardCard from '@/components/dashboard/cards'
import InfoBar from '@/components/infobar'
import {
  CalendarClock,
  TrendingUp,
  Users,
  Bot,
  Globe2,
  ArrowUpRight,
  MessageCircle,
  MousePointerClick,
  Radar,
  Sparkles,
} from 'lucide-react'
import React from 'react'

const TrendChart = ({ values }: { values: number[] }) => {
  const max = Math.max(...values, 1)
  const hasData = values.some((value) => value > 0)
  const points = values
    .map((value, index) => {
      const x = 10 + (index / (values.length - 1)) * 280
      const y = 140 - (value / max) * 104
      return `${x},${y}`
    })
    .join(' ')

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gravel">Engagement trend</h2>
          <p className="mt-1 text-sm text-muted-foreground">Real chat messages and appointments from the last 7 days.</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
          <ArrowUpRight className="h-3.5 w-3.5" /> Database
        </span>
      </div>
      <div className="mt-6 h-[260px] rounded-2xl bg-[linear-gradient(180deg,hsl(var(--brand)/0.08),transparent)] p-4">
        {hasData ? (
          <svg viewBox="0 0 300 160" className="h-full w-full overflow-visible">
            {[36, 62, 88, 114, 140].map((y) => (
              <line key={y} x1="10" x2="290" y1={y} y2={y} stroke="hsl(var(--border))" strokeDasharray="4 6" />
            ))}
            <defs>
              <linearGradient id="dashboardTrendFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--brand))" stopOpacity="0.28" />
                <stop offset="100%" stopColor="hsl(var(--brand))" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points={`10,150 ${points} 290,150`} fill="url(#dashboardTrendFill)" />
            <polyline points={points} fill="none" stroke="hsl(var(--brand))" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            {values.map((value, index) => {
              const x = 10 + (index / (values.length - 1)) * 280
              const y = 140 - (value / max) * 104
              return <circle key={index} cx={x} cy={y} r="5" fill="white" stroke="hsl(var(--brand))" strokeWidth="4" />
            })}
          </svg>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center text-sm text-muted-foreground">
            <MessageCircle className="mb-3 h-8 w-8 text-muted-foreground/50" />
            <p>No engagement data yet.</p>
            <p className="text-xs">Chatbot messages and bookings will appear here.</p>
          </div>
        )}
      </div>
      <div className="mt-4 grid grid-cols-7 text-center text-xs font-medium text-muted-foreground">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <span key={day}>{day}</span>)}
      </div>
    </div>
  )
}

const FunnelChart = ({
  conversations,
  leads,
  qualifiedLeads,
  appointments,
}: {
  conversations: number
  leads: number
  qualifiedLeads: number
  appointments: number
}) => {
  const base = Math.max(conversations, 1)
  const items = [
    ['Conversations', conversations, 'bg-brand'],
    ['Captured leads', leads, 'bg-brand/80'],
    ['Qualified leads', qualifiedLeads, 'bg-orange'],
    ['Appointments', appointments, 'bg-emerald-500'],
  ]

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-gradient text-white shadow">
          <Radar className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gravel">Lead funnel</h2>
            <p className="text-sm text-muted-foreground">Real funnel from conversations to bookings.</p>
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-4">
        {items.map(([label, value, color]) => (
          <div key={label as string}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-gravel">{label as string}</span>
              <span className="font-bold text-foreground">{value as number}</span>
            </div>
            <div className="h-11 rounded-xl bg-muted p-1">
              <div
                className={`${color as string} flex h-full items-center justify-end rounded-lg px-3 text-xs font-bold text-white shadow-sm`}
                style={{ width: `${value ? Math.max(8, (Number(value) / base) * 100) : 0}%` }}
              >
                {Math.round((Number(value) / base) * 100)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const ChannelMix = ({
  widgetChats,
  appointments,
  liveFollowUp,
}: {
  widgetChats: number
  appointments: number
  liveFollowUp: number
}) => {
  const channels = [
    ['Widget chats', widgetChats, 'bg-brand'],
    ['Appointments', appointments, 'bg-orange'],
    ['Live follow-up', liveFollowUp, 'bg-emerald-500'],
  ]
  const total = channels.reduce((sum, [, value]) => sum + Number(value), 0)

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gravel">Channel mix</h2>
          <p className="text-sm text-muted-foreground">Lead sources snapshot.</p>
        </div>
        <MousePointerClick className="h-5 w-5 text-brand" />
      </div>
      <div className="mt-6 flex h-4 overflow-hidden rounded-full bg-muted">
        {total > 0 ? channels.map(([label, value, color]) => (
          <div key={label as string} className={color as string} style={{ width: `${(Number(value) / total) * 100}%` }} />
        )) : null}
      </div>
      <div className="mt-5 grid gap-3">
        {channels.map(([label, value, color]) => (
          <div key={label as string} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${color as string}`} />
              <span className="text-muted-foreground">{label as string}</span>
            </div>
            <span className="font-semibold">{value as number}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const ActivityBars = ({ values }: { values: number[] }) => {
  const max = Math.max(...values, 1)
  const hasData = values.some((value) => value > 0)
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gravel">Weekly activity</h2>
          <p className="text-sm text-muted-foreground">Chatbot engagement pulse.</p>
        </div>
        <MessageCircle className="h-5 w-5 text-brand" />
      </div>
      <div className="mt-6 flex h-[190px] items-end gap-3 rounded-2xl bg-muted/40 p-4">
        {hasData ? values.map((value, index) => (
          <div key={index} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-[145px] w-full items-end rounded-full bg-white p-1 shadow-inner">
              <div className="w-full rounded-full bg-brand-gradient" style={{ height: `${value ? Math.max(16, (value / max) * 100) : 0}%` }} />
            </div>
            <span className="text-[11px] font-semibold text-muted-foreground">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</span>
          </div>
        )) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center text-sm text-muted-foreground">
            <MessageCircle className="mb-3 h-7 w-7 text-muted-foreground/50" />
            <p>No weekly activity yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

const Page = async () => {
  const analytics = await getDashboardAnalytics()

  const clients = analytics?.customers || 0
  const bookings = analytics?.bookings || 0
  const pipeline = analytics?.pipeline || 0
  const trend = analytics?.weeklyActivity || [0, 0, 0, 0, 0, 0, 0]

  return (
    <>
      <InfoBar />
      <div className="scrollbar-pretty h-0 w-full flex-1 overflow-y-auto pr-1">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardCard
            value={clients || 0}
            title="Potential clients"
            icon={<Users className="h-5 w-5" />}
            trend="+12%"
          />
          <DashboardCard
            value={pipeline}
            sales
            title="Pipeline value"
            icon={<TrendingUp className="h-5 w-5" />}
            trend="Active"
          />
          <DashboardCard
            value={bookings || 0}
            title="Appointments"
            icon={<CalendarClock className="h-5 w-5" />}
            trend="This week"
          />
          <DashboardCard
            value={clients || 0}
            title="Conversations ready"
            icon={<Bot className="h-5 w-5" />}
            trend="Live"
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-5">
          <TrendChart values={trend} />
          <FunnelChart
            conversations={analytics?.funnel.conversations || 0}
            leads={analytics?.funnel.leads || 0}
            qualifiedLeads={analytics?.funnel.qualifiedLeads || 0}
            appointments={analytics?.funnel.appointments || 0}
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <ChannelMix
            widgetChats={analytics?.channelMix.widgetChats || 0}
            appointments={analytics?.channelMix.appointments || 0}
            liveFollowUp={analytics?.channelMix.liveFollowUp || 0}
          />
          <ActivityBars values={trend} />
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gravel">Workspace access</h2>
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
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
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
              <div className="hidden items-center gap-2 rounded-full bg-orange/10 px-3 py-1 text-xs font-semibold text-orange md:flex">
                <Sparkles className="h-3.5 w-3.5" /> Widget launch path
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
    </>
  )
}

export default Page
