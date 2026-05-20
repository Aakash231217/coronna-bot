import { SIDE_BAR_MENU } from '@/constants/menu'

import React from 'react'

import { Bot, LogOut, MonitorSmartphone } from 'lucide-react'
import MenuItem from './menu-item'
import DomainMenu from './domain-menu'

type MinMenuProps = {
  onShrink(): void
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

export const MinMenu = ({
  onShrink,
  current,
  onSignOut,
  domains,
}: MinMenuProps) => {
  return (
    <div className="flex h-full flex-col items-center px-2 py-4">
      <button
        type="button"
        onClick={onShrink}
        className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient text-white shadow animate-fade-in opacity-0 delay-300 fill-mode-forwards"
        aria-label="Expand sidebar"
      >
        <Bot className="h-4 w-4" />
      </button>
      <div className="flex h-full flex-col justify-between pt-8 animate-fade-in opacity-0 delay-300 fill-mode-forwards">
        <div className="flex flex-col items-center gap-1">
          {SIDE_BAR_MENU.map((menu, key) => (
            <MenuItem
              size="min"
              {...menu}
              key={key}
              current={current}
            />
          ))}
          <DomainMenu
            min
            domains={domains}
          />
        </div>
        <div className="flex flex-col items-center gap-1">
          <MenuItem
            size="min"
            label="Mobile App"
            icon={<MonitorSmartphone />}
          />
          <MenuItem
            size="min"
            label="Sign out"
            icon={<LogOut />}
            onSignOut={onSignOut}
          />
        </div>
      </div>
    </div>
  )
}
