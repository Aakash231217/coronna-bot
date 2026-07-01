'use client'
import { useChatBot } from '@/hooks/chatbot/use-chatbot'
import React, { useState } from 'react'
import { BotWindow } from './window'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import BotAvatar3D from './bot-avatar-3d'

type Props = {}

const AiChatBot = (props: Props) => {
  const {
    onOpenChatBot,
    botOpened,
    onChats,
    register,
    onStartChatting,
    onAiTyping,
    messageWindowRef,
    currentBot,
    loading,
    onRealTime,
    setOnChats,
    errors,
    voiceEnabled,
    speaking,
    onToggleVoice,
    listening,
    speechSupported,
    onToggleListening,
    isMobile,
  } = useChatBot()

  const [iconError, setIconError] = useState(false)
  const launcherSize = currentBot?.chatBot?.launcherSize || 72
  // On mobile the open widget fills the screen, so the floating launcher is hidden.
  const fullScreen = isMobile && botOpened

  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        fullScreen ? 'h-[100dvh] w-screen' : 'h-screen justify-end items-end'
      )}
    >
      {botOpened && (
        <BotWindow
          errors={errors}
          setChat={setOnChats}
          realtimeMode={onRealTime}
          helpdesk={currentBot?.helpdesk!}
          domainName={currentBot?.name!}
          ref={messageWindowRef}
          help={currentBot?.chatBot?.helpdesk}
          theme={currentBot?.chatBot?.background}
          textColor={currentBot?.chatBot?.textColor}
          widgetTheme={currentBot?.chatBot?.widgetTheme}
          starterPrompts={currentBot?.chatBot?.starterPrompts || []}
          showBranding={currentBot?.chatBot?.showBranding ?? true}
          botMode={currentBot?.chatBot?.botMode || 'both'}
          isMobile={isMobile}
          onClose={onOpenChatBot}
          chats={onChats}
          register={register}
          onChat={onStartChatting}
          onResponding={onAiTyping}
          voiceEnabled={voiceEnabled}
          speaking={speaking}
          onToggleVoice={onToggleVoice}
          listening={listening}
          speechSupported={speechSupported}
          onToggleListening={onToggleListening}
        />
      )}
      {!fullScreen && (
        <div
          className={cn(
            'rounded-full relative overflow-hidden cursor-pointer shadow-md flex items-center justify-center bg-grandis',
            loading ? 'invisible' : 'visible'
          )}
          onClick={onOpenChatBot}
          style={{ width: launcherSize, height: launcherSize }}
        >
          {currentBot?.chatBot?.icon && !iconError ? (
            <Image
              src={`https://ucarecdn.com/${currentBot.chatBot.icon}/`}
              alt="bot"
              fill
              sizes="72px"
              className="object-cover"
              onError={() => setIconError(true)}
            />
          ) : (
            <BotAvatar3D size={launcherSize} speaking={speaking} />
          )}
        </div>
      )}
    </div>
  )
}

export default AiChatBot
