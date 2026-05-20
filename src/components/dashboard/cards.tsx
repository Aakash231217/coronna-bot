import React from 'react'

type Props = {
  title: string
  value: number | string
  icon: JSX.Element
  sales?: boolean
  trend?: string
}

const DashboardCard = ({ icon, title, value, sales, trend }: Props) => {
  return (
    <div className="group relative w-full overflow-hidden rounded-2xl border border-border bg-card p-6 transition hover:border-brand/40 hover:shadow-[0_18px_40px_-20px_rgba(91,91,214,0.4)]">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand/20 opacity-0 blur-3xl transition group-hover:opacity-60" />
      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-gradient text-white shadow">
            {icon}
          </div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
        </div>
        {trend && (
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-500">
            {trend}
          </span>
        )}
      </div>
      <p className="relative mt-6 text-3xl font-bold tracking-tight">
        {sales && '$'}
        {value}
      </p>
    </div>
  )
}

export default DashboardCard
