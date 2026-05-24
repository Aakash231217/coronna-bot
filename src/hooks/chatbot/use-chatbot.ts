import { onAiChatBotAssistant, onGetCurrentChatBot } from '@/actions/bot'
import { postToParent, pusherClient } from '@/lib/utils'
import {
  ChatBotMessageProps,
  ChatBotMessageSchema,
} from '@/schemas/conversation.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState } from 'react'
import { UploadClient } from '@uploadcare/upload-client'

import { useForm } from 'react-hook-form'

const upload = new UploadClient({
  publicKey: process.env.NEXT_PUBLIC_UPLOAD_CARE_PUBLIC_KEY as string,
})

export const useChatBot = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChatBotMessageProps>({
    resolver: zodResolver(ChatBotMessageSchema),
  })
  const [currentBot, setCurrentBot] = useState<
    | {
        name: string
        chatBot: {
          id: string
          icon: string | null
          welcomeMessage: string | null
          background: string | null
          textColor: string | null
          helpdesk: boolean
        } | null
        helpdesk: {
          id: string
          question: string
          answer: string
          domainId: string | null
        }[]
      }
    | undefined
  >()
  const messageWindowRef = useRef<HTMLDivElement | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [botOpened, setBotOpened] = useState<boolean>(false)
  const onOpenChatBot = () => setBotOpened((prev) => !prev)
  const [loading, setLoading] = useState<boolean>(true)
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true)
  const [speaking, setSpeaking] = useState<boolean>(false)
  const [onChats, setOnChats] = useState<
    { role: 'assistant' | 'user'; content: string; link?: string }[]
  >([])
  const [onAiTyping, setOnAiTyping] = useState<boolean>(false)
  const [currentBotId, setCurrentBotId] = useState<string>()
  const [onRealTime, setOnRealTime] = useState<
    { chatroom: string; mode: boolean } | undefined
  >(undefined)

  const onScrollToBottom = () => {
    messageWindowRef.current?.scroll({
      top: messageWindowRef.current.scrollHeight,
      left: 0,
      behavior: 'smooth',
    })
  }

  const onToggleVoice = () => {
    setVoiceEnabled((prev) => {
      if (prev && audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
        setSpeaking(false)
      }
      return !prev
    })
  }

  const speakWithBrowser = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    try {
      window.speechSynthesis.cancel()
      const utter = new SpeechSynthesisUtterance(text)
      utter.lang = 'en-US'
      utter.rate = 1
      utter.pitch = 1
      utter.onstart = () => setSpeaking(true)
      utter.onend = () => setSpeaking(false)
      utter.onerror = () => setSpeaking(false)
      window.speechSynthesis.speak(utter)
    } catch {
      setSpeaking(false)
    }
  }

  const onSpeakAssistantReply = async (message?: string | null) => {
    if (!voiceEnabled || !message) return
    const cleaned = message.replace('(complete)', '').trim()

    try {
      const response = await fetch('/api/voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: cleaned }),
      })

      if (!response.ok) {
        console.warn(
          '[voice] /api/voice failed',
          response.status,
          '— falling back to browser TTS'
        )
        speakWithBrowser(cleaned)
        return
      }

      if (response.status === 204) {
        console.warn('[voice] ELEVENLABS_API_KEY not configured on server — using browser TTS')
        speakWithBrowser(cleaned)
        return
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      audioRef.current?.pause()
      const audio = new Audio(audioUrl)
      audio.preload = 'auto'
      audioRef.current = audio
      setSpeaking(true)

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl)
        setSpeaking(false)
      }
      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl)
        setSpeaking(false)
      }

      try {
        await audio.play()
      } catch (playError) {
        console.warn(
          '[voice] Browser blocked autoplay. The next message after a user click should play.',
          playError
        )
        setSpeaking(false)
      }
    } catch (error) {
      console.error('[voice] error', error)
      setSpeaking(false)
    }
  }

  useEffect(() => {
    onScrollToBottom()
  }, [onChats, messageWindowRef])

  useEffect(() => {
    postToParent(
      JSON.stringify({
        width: botOpened ? 420 : 72,
        height: botOpened ? 640 : 72,
      })
    )
  }, [botOpened])

  let limitRequest = 0

  const onGetDomainChatBot = async (id: string) => {
    setCurrentBotId(id)
    const chatbot = await onGetCurrentChatBot(id)
    if (chatbot) {
      setOnChats((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: chatbot.chatBot?.welcomeMessage!,
        },
      ])
      setCurrentBot(chatbot)
      setLoading(false)
    }
  }

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      const data = e.data
      // legacy: plain string is the bot id
      if (limitRequest < 1 && typeof data === 'string') {
        onGetDomainChatBot(data)
        limitRequest++
        return
      }
      // proactive trigger from parent page
      if (typeof data === 'string' && data.startsWith('{')) {
        try {
          const payload = JSON.parse(data)
          if (payload?.type === 'bot:proactive') {
            const reason: string = payload.reason || 'idle'
            const path: string = payload.path || ''
            const proactiveMsg =
              reason === 'exit-intent'
                ? `Before you go — is there anything I can help you with on ${
                    path || 'this page'
                  }?`
                : `Looks like you might be looking for something on ${
                    path || 'this page'
                  }. Want me to help find it?`
            setBotOpened(true)
            setOnChats((prev) => {
              if (prev.some((m) => m.content === proactiveMsg)) return prev
              return [...prev, { role: 'assistant', content: proactiveMsg }]
            })
            onSpeakAssistantReply(proactiveMsg)
          }
        } catch {}
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  const onStartChatting = handleSubmit(async (values) => {
    console.log('ALL VALUES', values)

    if (values.image?.length) {
      console.log('IMAGE fROM ', values.image[0])
      const uploaded = await upload.uploadFile(values.image[0])
      if (!onRealTime?.mode) {
        setOnChats((prev: any) => [
          ...prev,
          {
            role: 'user',
            content: uploaded.uuid,
          },
        ])
      }

      console.log('🟡 RESPONSE FROM UC', uploaded.uuid)
      setOnAiTyping(true)
      const response = await onAiChatBotAssistant(
        currentBotId!,
        onChats,
        'user',
        uploaded.uuid
      )

      if (response) {
        setOnAiTyping(false)
        if (response.live) {
          setOnRealTime((prev) => ({
            ...prev,
            chatroom: response.chatRoom,
            mode: response.live,
          }))
        } else if (response.response) {
          setOnChats((prev: any) => [...prev, response.response])
          onSpeakAssistantReply(response.response.content)
        }
      }
    }
    reset()

    if (values.content) {
      if (!onRealTime?.mode) {
        setOnChats((prev: any) => [
          ...prev,
          {
            role: 'user',
            content: values.content,
          },
        ])
      }

      setOnAiTyping(true)

      const response = await onAiChatBotAssistant(
        currentBotId!,
        onChats,
        'user',
        values.content
      )

      if (response) {
        setOnAiTyping(false)
        if (response.live) {
          setOnRealTime((prev) => ({
            ...prev,
            chatroom: response.chatRoom,
            mode: response.live,
          }))
        } else if (response.response) {
          setOnChats((prev: any) => [...prev, response.response])
          onSpeakAssistantReply(response.response.content)
        }
      }
    }
  })

  return {
    botOpened,
    onOpenChatBot,
    onStartChatting,
    onChats,
    register,
    onAiTyping,
    messageWindowRef,
    currentBot,
    loading,
    setOnChats,
    onRealTime,
    errors,
    voiceEnabled,
    speaking,
    onToggleVoice,
  }
}

export const useRealTime = (
  chatRoom: string,
  setChats: React.Dispatch<
    React.SetStateAction<
      {
        role: 'user' | 'assistant'
        content: string
        link?: string | undefined
      }[]
    >
  >
) => {
  const counterRef = useRef(1)

  useEffect(() => {
    pusherClient.subscribe(chatRoom)
    pusherClient.bind('realtime-mode', (data: any) => {
      console.log('✅', data)
      if (counterRef.current !== 1) {
        setChats((prev: any) => [
          ...prev,
          {
            role: data.chat.role,
            content: data.chat.message,
          },
        ])
      }
      counterRef.current += 1
    })
    return () => {
      pusherClient.unbind('realtime-mode')
      pusherClient.unsubscribe(chatRoom)
    }
  }, [])
}
