'use client'
import { useChatBot } from '@/hooks/chatbot/use-chatbot'
import React from 'react'
import { BotWindow } from './window'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import BotFace3D from './bot-face-3d'

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
  } = useChatBot()

  return (
    <div className="h-screen flex flex-col justify-end items-end gap-4">
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
      <div
        className={cn(
          'rounded-full relative cursor-pointer shadow-md w-[72px] h-[72px] flex items-center justify-center bg-grandis',
          loading ? 'invisible' : 'visible'
        )}
        onClick={onOpenChatBot}
        style={{
          width: currentBot?.chatBot?.launcherSize || 72,
          height: currentBot?.chatBot?.launcherSize || 72,
        }}
      >
        {currentBot?.chatBot?.icon ? (
          <Image
            src={`https://ucarecdn.com/${currentBot.chatBot.icon}/`}
            alt="bot"
            fill
          />
        ) : (
          <BotFace3D size={72} />
        )}
      </div>
    </div>
  )
}

export default AiChatBot
