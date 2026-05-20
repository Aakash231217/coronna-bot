import { cn } from '@/lib/utils'
import Link from 'next/link'
import React from 'react'

type Props = {
  size: 'max' | 'min'
  label: string
  icon: JSX.Element
  path?: string
  current?: string
  onSignOut?(): void
}

const MenuItem = ({ size, path, icon, label, current, onSignOut }: Props) => {
  const active = !!current && current === path
  const href = path ? `/${path}` : '#'

  if (size === 'max') {
    return (
      <Link
        onClick={onSignOut}
        className={cn(
          'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition',
          active
            ? 'bg-brand/10 text-foreground'
            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
        )}
        href={href}
      >
        {active && (
          <span className="absolute left-0 top-1/2 h-6 -translate-y-1/2 -translate-x-1 rounded-r-full bg-brand-gradient w-1" />
        )}
        <span
          className={cn(
            'grid h-7 w-7 place-items-center rounded-lg transition',
            active
              ? 'bg-brand-gradient text-white shadow-sm'
              : 'bg-secondary text-muted-foreground group-hover:text-foreground'
          )}
        >
          {icon}
        </span>
        <span className={cn('font-medium', active && 'text-foreground')}>
          {label}
        </span>
      </Link>
    )
  }

  return (
    <Link
      onClick={onSignOut}
      className={cn(
        'group relative grid h-10 w-10 place-items-center rounded-xl transition',
        active
          ? 'bg-brand-gradient text-white shadow'
          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
      )}
      href={href}
      aria-label={label}
      title={label}
    >
      {icon}
    </Link>
  )
}

export default MenuItem
