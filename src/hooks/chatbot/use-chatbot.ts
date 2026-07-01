import { onAiChatBotAssistant, onCreateAnonymousSession, onGetCurrentChatBot } from '@/actions/bot'
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
    setValue,
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
          launcherPosition: string
          launcherSize: number
          widgetTheme: string
          starterPrompts: string[]
          showBranding: boolean
          helpdesk: boolean
          botMode?: string
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
  const recognitionRef = useRef<any>(null)
  // True once the visitor has actually engaged (opened the bot or sent a message).
  // Used to suppress the proactive "are you stuck?" nudge — no point nagging
  // someone who's already talking to the bot.
  const engagedRef = useRef<boolean>(false)
  const [botOpened, setBotOpened] = useState<boolean>(false)
  const onOpenChatBot = () =>
    setBotOpened((prev) => {
      if (!prev) engagedRef.current = true // user opened the bot = engaged
      if (prev) setModePicked(false) // reset mode picker when closing
      return !prev
    })
  const [loading, setLoading] = useState<boolean>(true)
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true)
  const [speaking, setSpeaking] = useState<boolean>(false)
  const [listening, setListening] = useState<boolean>(false)
  const [speechSupported, setSpeechSupported] = useState<boolean>(false)
  const [modePicked, setModePicked] = useState<boolean>(false)

  const onPickMode = (voiceAndChat: boolean) => {
    setVoiceEnabled(voiceAndChat)
    setModePicked(true)
  }
  const [onChats, setOnChats] = useState<
    { role: 'assistant' | 'user'; content: string; link?: string }[]
  >([])
  const [onAiTyping, setOnAiTyping] = useState<boolean>(false)
  const [currentBotId, setCurrentBotId] = useState<string>()
  const [sessionChatRoomId, setSessionChatRoomId] = useState<string | undefined>()
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
      if (prev) {
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current = null
        }
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel()
        }
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

  // --- Speech-to-text (voice input) -----------------------------------------
  useEffect(() => {
    if (typeof window === 'undefined') return
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setSpeechSupported(false)
      return
    }
    setSpeechSupported(true)
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.continuous = false
    recognition.maxAlternatives = 1
    recognitionRef.current = recognition

    return () => {
      try {
        recognition.abort()
      } catch {}
      recognitionRef.current = null
    }
  }, [])

  const onStopListening = () => {
    try {
      recognitionRef.current?.stop()
    } catch {}
    setListening(false)
  }

  const onStartListening = () => {
    const recognition = recognitionRef.current
    if (!recognition) return

    // Don't let the bot talk over the user while they speak
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setSpeaking(false)

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0]?.transcript ?? '')
        .join(' ')
        .trim()
      if (transcript) {
        setValue('content', transcript, { shouldValidate: true })
        // submit the recognised speech as a normal message
        onStartChatting()
      }
    }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)

    try {
      recognition.start()
      setListening(true)
    } catch {
      setListening(false)
    }
  }

  const onToggleListening = () => {
    if (listening) {
      onStopListening()
    } else {
      onStartListening()
    }
  }

  useEffect(() => {
    onScrollToBottom()
  }, [onChats, messageWindowRef])

  useEffect(() => {
    const launcherSize = currentBot?.chatBot?.launcherSize || 72
    postToParent(
      JSON.stringify({
        width: botOpened ? 420 : launcherSize,
        height: botOpened ? 640 : launcherSize,
        position: currentBot?.chatBot?.launcherPosition || 'right',
      })
    )
  }, [botOpened, currentBot?.chatBot?.launcherPosition, currentBot?.chatBot?.launcherSize])

  // Auto-greet: speak the welcome message aloud every time the chat is opened.
  // Opening the widget is a user gesture, so browsers allow audio playback here.
  useEffect(() => {
    if (botOpened && voiceEnabled && currentBot?.chatBot?.welcomeMessage) {
      onSpeakAssistantReply(currentBot.chatBot.welcomeMessage)
    }
    // When the widget closes, stop any ongoing speech.
    if (!botOpened) {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      setSpeaking(false)
    }
  }, [botOpened, voiceEnabled, currentBot?.chatBot?.welcomeMessage])

  let limitRequest = 0

  const onGetDomainChatBot = async (id: string) => {
    setCurrentBotId(id)
    const [chatbot, session] = await Promise.all([
      onGetCurrentChatBot(id),
      onCreateAnonymousSession(id),
    ])
    if (session?.chatRoomId) {
      setSessionChatRoomId(session.chatRoomId)
    }
    if (chatbot) {
      setOnChats((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: chatbot.chatBot?.welcomeMessage!,
        },
      ])
      // Chat-only bots never speak; voice/both default to speaking on.
      setVoiceEnabled(chatbot.chatBot?.botMode !== 'chat')
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
            // Already chatting/opened the bot? Don't interrupt with a nudge.
            if (engagedRef.current) return
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
    engagedRef.current = true // sending a message counts as engaged

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
        uploaded.uuid,
        sessionChatRoomId
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
        values.content,
        sessionChatRoomId
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
    listening,
    speechSupported,
    onToggleListening,
    modePicked,
    onPickMode,
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
