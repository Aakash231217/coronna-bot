import React from 'react'
import BreadCrumb from './bread-crumb'
import { Bell, Headphones, Search } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

const InfoBar = () => {
  return (
    <div className="mb-8 flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <BreadCrumb />
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search…"
            className="h-10 w-64 rounded-xl border border-border bg-card pl-9 pr-3 text-sm shadow-sm transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-card text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-xl bg-brand-gradient text-white shadow"
          aria-label="Support"
        >
          <Headphones className="h-4 w-4" />
        </button>
        <Avatar className="h-10 w-10 border border-border">
          <AvatarImage
            src="https://github.com/shadcn.png"
            alt="@shadcn"
          />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>
    </div>
  )
}

export default InfoBar
