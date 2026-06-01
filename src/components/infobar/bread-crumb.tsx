'use client'
import useSideBar from '@/context/use-sidebar'
import React from 'react'
import { Loader } from '../loader'
import { Switch } from '../ui/switch'

type Props = {}

const BreadCrumb = (props: Props) => {
  const {
    chatRoom,
    expand,
    loading,
    onActivateRealtime,
    onExpand,
    page,
    onSignOut,
    realtime,
  } = useSideBar()
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold capitalize tracking-tight md:text-3xl">
          {page}
        </h2>
        {page === 'conversation' && chatRoom && (
          <Loader
            loading={loading}
            className="inline p-0"
          >
            <span className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs">
              Real-time
              <Switch
                defaultChecked={realtime}
                onClick={(e) => onActivateRealtime(e)}
                className="data-[state=checked]:bg-brand data-[state=unchecked]:bg-muted"
              />
            </span>
          </Loader>
        )}
      </div>
      <p className="max-w-xl text-sm text-muted-foreground">
        {page == 'settings'
          ? 'Manage your account settings, preferences and integrations.'
          : page == 'dashboard'
          ? 'A detailed overview of your metrics, usage, customers and more.'
          : page == 'appointment'
          ? 'View and edit all your appointments.'
          : page == 'integration'
          ? 'Connect third-party applications into Corinna AI.'
          : 'Modify domain settings, chatbot options, sales questions and training.'}
      </p>
    </div>
  )
}

export default BreadCrumb
