import { ChatBotMessageProps } from '@/schemas/conversation.schema'
import React, { forwardRef } from 'react'
import { UseFormRegister } from 'react-hook-form'
import RealTimeMode from './real-time'
import Image from 'next/image'
import TabsMenu from '../tabs/intex'
import { BOT_TABS_MENU } from '@/constants/menu'
import ChatIcon from '@/icons/chat-icon'
import { TabsContent } from '../ui/tabs'
import { Separator } from '../ui/separator'
import Bubble from './bubble'
import { Responding } from './responding'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { MessageSquare, Mic, MicOff, Paperclip, Send, Volume2, VolumeX } from 'lucide-react'
import { Label } from '../ui/label'
import { CardDescription, CardTitle } from '../ui/card'
import Accordion from '../accordian'
import UploadButton from '../upload-button'
import BotAvatar3D from './bot-avatar-3d'

type Props = {
  errors: any
  register: UseFormRegister<ChatBotMessageProps>
  chats: { role: 'assistant' | 'user'; content: string; link?: string }[]
  onChat(): void
  onResponding: boolean
  domainName: string
  theme?: string | null
  textColor?: string | null
  widgetTheme?: string
  starterPrompts: string[]
  showBranding: boolean
  help?: boolean
  realtimeMode:
    | {
        chatroom: string
        mode: boolean
      }
    | undefined
  helpdesk: {
    id: string
    question: string
    answer: string
    domainId: string | null
  }[]
  setChat: React.Dispatch<
    React.SetStateAction<
      {
        role: 'user' | 'assistant'
        content: string
        link?: string | undefined
      }[]
    >
  >
  voiceEnabled: boolean
  speaking: boolean
  onToggleVoice(): void
  listening: boolean
  speechSupported: boolean
  onToggleListening(): void
  modePicked?: boolean
  onPickMode?: (voiceAndChat: boolean) => void
}

export const BotWindow = forwardRef<HTMLDivElement, Props>(
  (
    {
      errors,
      register,
      chats,
      onChat,
      onResponding,
      domainName,
      helpdesk,
      realtimeMode,
      setChat,
      textColor,
      theme,
      widgetTheme,
      starterPrompts,
      showBranding,
      help,
      voiceEnabled,
      speaking,
      onToggleVoice,
      listening,
      speechSupported,
      onToggleListening,
      modePicked,
      onPickMode,
    },
    ref
  ) => {
    console.log(errors)

    if (!modePicked && onPickMode) {
      return (
        <div className={`mr-6 flex h-[560px] w-[360px] flex-col overflow-hidden rounded-3xl border border-border shadow-[0_30px_60px_-30px_rgba(91,91,214,0.35)] ${widgetTheme === 'dark' ? 'bg-[#111827] text-white' : 'bg-card'}`}>
          <div className="flex items-center gap-3 border-b border-border bg-brand-gradient px-5 py-4 text-white">
            <div className="h-12 w-12 overflow-hidden rounded-full ring-2 ring-white/40">
              <BotAvatar3D size={48} speaking={false} />
            </div>
            <div>
              <h3 className="text-sm font-semibold leading-tight">Corinna AI Sales Rep</h3>
              <p className="text-xs text-white/80">{domainName?.split('.com')[0] ?? 'Online'}</p>
            </div>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
            <p className="text-center text-sm font-semibold text-gravel">Choose your experience</p>
            <button
              type="button"
              onClick={() => onPickMode(true)}
              className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-orange bg-orange/5 p-5 text-center transition hover:bg-orange/10"
            >
              <Volume2 className="h-7 w-7 text-orange" />
              <span className="text-sm font-bold text-orange">Voice + Chat</span>
              <span className="text-xs text-muted-foreground">Bot speaks its replies aloud. You can also type or speak.</span>
            </button>
            <button
              type="button"
              onClick={() => onPickMode(false)}
              className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-border p-5 text-center transition hover:border-orange/40 hover:bg-orange/5"
            >
              <MessageSquare className="h-7 w-7 text-gravel" />
              <span className="text-sm font-bold text-gravel">Chat only</span>
              <span className="text-xs text-muted-foreground">Silent text conversation. No audio.</span>
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className={`mr-6 flex h-[560px] w-[360px] max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-3xl border border-border shadow-[0_30px_60px_-30px_rgba(91,91,214,0.35)] ${widgetTheme === 'dark' ? 'bg-[#111827] text-white' : 'bg-card'}`}>
        <div className="flex items-center justify-between gap-3 border-b border-border bg-brand-gradient px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded-full ring-2 ring-white/40">
              <BotAvatar3D size={48} speaking={speaking} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold leading-tight">
                Corinna AI Sales Rep
              </h3>
              <p className="text-xs text-white/80">
                {domainName?.split('.com')[0] ?? 'Online'}
              </p>
              {realtimeMode?.mode && (
                <RealTimeMode
                  setChats={setChat}
                  chatRoomId={realtimeMode.chatroom}
                />
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onToggleVoice}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
            title={voiceEnabled ? 'Mute voice replies' : 'Enable voice replies'}
          >
            {voiceEnabled ? (
              <Volume2
                className={`h-4 w-4 ${speaking ? 'animate-pulse' : ''}`}
              />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </button>
        </div>
        <TabsMenu
          triggers={BOT_TABS_MENU}
          className=" bg-transparent border-[1px] border-border m-2"
        >
          <TabsContent value="chat">
            <Separator orientation="horizontal" />
            <div className="flex flex-col h-full">
              <div
                style={{
                  background: theme || '',
                  color: textColor || '',
                }}
                className="px-3 flex h-[310px] flex-col py-5 gap-3 chat-window overflow-y-auto"
                ref={ref}
              >
                {chats.map((chat, key) => (
                  <Bubble
                    key={key}
                    message={chat}
                  />
                ))}
                {onResponding && <Responding />}
                {starterPrompts.length > 0 && chats.length <= 1 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {starterPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        className="rounded-full border border-border bg-white px-3 py-1 text-xs text-gray-700 shadow-sm"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <form
                onSubmit={onChat}
                className="flex px-3 py-1 flex-col flex-1 bg-porcelain"
              >
                <div className="flex items-center justify-between gap-2">
                  <Input
                    {...register('content')}
                    placeholder={listening ? 'Listening…' : 'Type your message...'}
                    className="focus-visible:ring-0 flex-1 p-0 focus-visible:ring-offset-0 bg-porcelain rounded-none outline-none border-none"
                  />
                  {speechSupported && (
                    <Button
                      type="button"
                      onClick={onToggleListening}
                      title={listening ? 'Stop listening' : 'Speak your message'}
                      className={`mt-3 ${listening ? 'animate-pulse bg-red-500 hover:bg-red-600' : ''}`}
                    >
                      {listening ? <MicOff /> : <Mic />}
                    </Button>
                  )}
                  <Button
                    type="submit"
                    className="mt-3"
                  >
                    <Send />
                  </Button>
                </div>
                <Label htmlFor="bot-image">
                  <Paperclip />
                  <Input
                    {...register('image')}
                    type="file"
                    id="bot-image"
                    className="hidden"
                  />
                </Label>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="helpdesk">
            <div className="h-[485px] overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4">
              <div>
                <CardTitle>Help Desk</CardTitle>
                <CardDescription>
                  Browse from a list of questions people usually ask.
                </CardDescription>
              </div>
              <Separator orientation="horizontal" />

              {helpdesk.map((desk) => (
                <Accordion
                  key={desk.id}
                  trigger={desk.question}
                  content={desk.answer}
                />
              ))}
            </div>
          </TabsContent>
        </TabsMenu>
        {showBranding && <div className="flex justify-center ">
          <p className="text-gray-400 text-xs">Powered By Web Prodigies</p>
        </div>}
      </div>
    )
  }
)

BotWindow.displayName = 'BotWindow'
