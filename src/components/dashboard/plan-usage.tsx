import React from 'react'
import { ProgressBar } from '../progress'

type PlanUsageProps = {
  plan: 'STANDARD' | 'PRO' | 'ULTIMATE'
  credits: number
  domains: number
  clients: number
}

export const PlanUsage = ({
  plan,
  credits,
  domains,
  clients,
}: PlanUsageProps) => {
  const emailLimit = plan == 'STANDARD' ? 10 : plan == 'PRO' ? 50 : 500
  const domainLimit = plan == 'STANDARD' ? 1 : plan == 'PRO' ? 2 : 100
  const clientLimit = plan == 'STANDARD' ? 10 : plan == 'PRO' ? 50 : 500

  return (
    <div className="mt-6 flex flex-col gap-5">
      <ProgressBar
        end={emailLimit}
        label="Email credits"
        credits={credits}
      />
      <ProgressBar
        end={domainLimit}
        label="Domains"
        credits={domains}
      />
      <ProgressBar
        end={clientLimit}
        label="Contacts"
        credits={clients}
      />
    </div>
  )
}
