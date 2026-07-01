'use client'
import { useConversation } from '@/hooks/conversation/use-conversation'
import React, { useEffect } from 'react'
import TabsMenu from '../tabs/intex'
import { TABS_MENU } from '@/constants/menu'
import { TabsContent } from '../ui/tabs'
import ConversationSearch from './search'
import { Loader } from '../loader'
import ChatCard from './chat-card'
import { CardDescription } from '../ui/card'
import { Separator } from '../ui/separator'

type Props = {
  domains?:
    | {
        name: string
        id: string
        icon: string
      }[]
    | undefined
}

const ConversationMenu = ({ domains }: Props) => {
  const { register, setValue, chatRooms, loading, onGetActiveChatMessages, loadRooms } =
    useConversation()

  // Auto-select the first domain so conversations load immediately
  useEffect(() => {
    if (domains?.[0]?.id) {
      setValue('domain', domains[0].id)
      loadRooms(domains[0].id)
    }
  }, [domains])

  const renderRooms = (
    rooms: typeof chatRooms,
    emptyLabel: string
  ) => (
    <div className="flex flex-col">
      <Loader loading={loading}>
        {rooms.length ? (
          rooms.map((room) => (
            <ChatCard
              seen={room.chatRoom[0].message[0]?.seen}
              id={room.chatRoom[0].id}
              onChat={() => onGetActiveChatMessages(room.chatRoom[0].id)}
              createdAt={room.chatRoom[0].message[0]?.createdAt}
              key={room.chatRoom[0].id}
              title={room.email || 'Anonymous visitor'}
              description={room.chatRoom[0].message[0]?.message}
            />
          ))
        ) : (
          <CardDescription className="p-3">{emptyLabel}</CardDescription>
        )}
      </Loader>
    </div>
  )

  const unreadRooms = chatRooms.filter(
    (room) => room.chatRoom[0]?.message[0] && !room.chatRoom[0].message[0].seen
  )

  return (
    <div className="py-3 px-0">
      <TabsMenu triggers={TABS_MENU}>
        <TabsContent value="unread">
          <ConversationSearch
            domains={domains}
            register={register}
          />
          {renderRooms(unreadRooms, 'No unread chats.')}
        </TabsContent>
        <TabsContent value="all">
          <ConversationSearch
            domains={domains}
            register={register}
          />
          {renderRooms(chatRooms, 'No chats for your domain yet.')}
        </TabsContent>
        <TabsContent value="expired">
          <Separator
            orientation="horizontal"
            className="mt-5"
          />
          expired
        </TabsContent>
        <TabsContent value="starred">
          <Separator
            orientation="horizontal"
            className="mt-5"
          />
          starred
        </TabsContent>
      </TabsMenu>
    </div>
  )
}

export default ConversationMenu
