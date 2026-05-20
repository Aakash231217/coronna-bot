import { onLoginUser } from '@/actions/auth'
import SideBar from '@/components/sidebar'
import { ChatProvider } from '@/context/user-chat-context'
import React from 'react'

type Props = {
  children: React.ReactNode
}

const OwnerLayout = async ({ children }: Props) => {
  const authenticated = await onLoginUser()
  if (!authenticated) return null

  return (
    <ChatProvider>
      <div className="grid-bg flex h-screen w-full overflow-hidden">
        <SideBar domains={authenticated.domain} />
        <div className="flex h-screen w-full flex-col px-4 py-6 pl-24 md:px-8 md:py-8 md:pl-8">
          {children}
        </div>
      </div>
    </ChatProvider>
  )
}

export default OwnerLayout
