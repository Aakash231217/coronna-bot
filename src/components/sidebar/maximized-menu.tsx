import { SIDE_BAR_MENU } from '@/constants/menu'
import { Bot, ChevronsLeft, LogOut, MonitorSmartphone } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import DomainMenu from './domain-menu'
import MenuItem from './menu-item'

type Props = {
  onExpand(): void
  current: string
  onSignOut(): void
  domains:
    | {
        id: string
        name: string
        icon: string | null
      }[]
    | null
    | undefined
}

const MaxMenu = ({ current, domains, onExpand, onSignOut }: Props) => {
  return (
    <div className="flex h-full flex-col px-4 py-4">
      <div className="flex items-center justify-between animate-fade-in opacity-0 delay-300 fill-mode-forwards">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient text-white shadow">
            <Bot className="h-4 w-4" />
          </span>
          <span>Corinna AI</span>
        </Link>
        <button
          type="button"
          onClick={onExpand}
          className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          aria-label="Collapse sidebar"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
      </div>

      <div className="flex h-full flex-col justify-between pt-8 animate-fade-in opacity-0 delay-300 fill-mode-forwards">
        <div className="flex flex-col gap-1">
          <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Menu
          </p>
          {SIDE_BAR_MENU.map((menu, key) => (
            <MenuItem
              size="max"
              {...menu}
              key={key}
              current={current}
            />
          ))}
          <DomainMenu domains={domains} />
        </div>
        <div className="flex flex-col gap-1">
          <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Options
          </p>
          <MenuItem
            size="max"
            label="Mobile App"
            icon={<MonitorSmartphone />}
          />
          <MenuItem
            size="max"
            label="Sign out"
            icon={<LogOut />}
            onSignOut={onSignOut}
          />
        </div>
      </div>
    </div>
  )
}

export default MaxMenu
