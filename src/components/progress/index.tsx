'use client'
import React from 'react'

type ProgressBarProps = {
  label: string
  end: number
  credits: number
}

export const ProgressBar = ({ label, end, credits }: ProgressBarProps) => {
  const safeEnd = end > 0 ? end : 1
  const pct = Math.min(100, Math.max(0, (credits / safeEnd) * 100))

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{credits}</span> /{' '}
          {end}
        </p>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-brand-gradient transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
