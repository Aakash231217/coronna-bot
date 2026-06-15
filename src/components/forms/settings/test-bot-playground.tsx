'use client'

import { onTestDomainBot } from '@/actions/settings'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { Bot, Loader2, Mic, MicOff, Send, Volume2, VolumeX } from 'lucide-react'
import React, { useEffect, useRef, useState, useTransition } from 'react'
import BotAvatar3D from '@/components/chatbot/bot-avatar-3d'

const TestBotPlayground = ({ domainId }: { domainId: string }) => {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [citations, setCitations] = useState<string[]>([])
  const [usedSources, setUsedSources] = useState(0)
  const [speaking, setSpeaking] = useState(false)
  const [listening, setListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [isPending, startTransition] = useTransition()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const recognitionRef = useRef<any>(null)

  const speakWithBrowser = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    try {
      window.speechSynthesis.cancel()
      const utter = new SpeechSynthesisUtterance(text)
      utter.lang = 'en-US'
      utter.onstart = () => setSpeaking(true)
      utter.onend = () => setSpeaking(false)
      utter.onerror = () => setSpeaking(false)
      window.speechSynthesis.speak(utter)
    } catch {
      setSpeaking(false)
    }
  }

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setSpeaking(false)
  }

  const speak = async (text: string) => {
    const cleaned = text.replace('(complete)', '').trim()
    if (!cleaned) return

    try {
      const response = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleaned }),
      })

      if (!response.ok || response.status === 204) {
        speakWithBrowser(cleaned)
        return
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      audioRef.current?.pause()
      const audio = new Audio(audioUrl)
      audioRef.current = audio
      setSpeaking(true)
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl)
        setSpeaking(false)
      }
      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl)
        speakWithBrowser(cleaned)
      }
      await audio.play()
    } catch {
      speakWithBrowser(cleaned)
    }
  }

  const onPlayVoice = () => {
    if (speaking) {
      stopSpeaking()
      return
    }
    speak(answer)
  }

  const onAsk = (spoken?: string) => {
    const q = (spoken ?? question).trim()
    if (!q) return
    stopSpeaking()

    startTransition(async () => {
      const response = await onTestDomainBot(domainId, q)
      const reply =
        response.status === 200
          ? response.answer || ''
          : response.message || 'Unable to test bot.'
      setAnswer(reply)
      setCitations(response.status === 200 ? response.citations || [] : [])
      setUsedSources(response.status === 200 ? response.usedSources || 0 : 0)
      // Auto-speak the answer as soon as it arrives.
      if (reply) speak(reply)
    })
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

  const onToggleListening = () => {
    const recognition = recognitionRef.current
    if (!recognition) return
    if (listening) {
      try {
        recognition.stop()
      } catch {}
      setListening(false)
      return
    }

    stopSpeaking()
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0]?.transcript ?? '')
        .join(' ')
        .trim()
      if (transcript) {
        setQuestion(transcript)
        onAsk(transcript)
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

  return (
    <Card className="rounded-2xl">
      <CardContent className="grid gap-5 p-5">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-grandis">
            <BotAvatar3D size={64} speaking={speaking} />
          </div>
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Bot className="h-5 w-5 text-orange" />
              Test bot before publishing
            </CardTitle>
            <CardDescription className="mt-1">
              Ask a question without creating a customer, chat room or public conversation.
            </CardDescription>
          </div>
        </div>

        <div className="grid gap-3">
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder={
              listening
                ? 'Listening… speak now'
                : 'Ask the bot something from your trained sources...'
            }
            className="min-h-[96px] rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-orange"
          />
          <div className="flex items-center gap-2">
            <Button type="button" onClick={() => onAsk()} disabled={isPending} className="w-fit">
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Test answer
            </Button>
            {speechSupported && (
              <Button
                type="button"
                variant="outline"
                onClick={onToggleListening}
                disabled={isPending}
                className={`w-fit gap-1.5 ${listening ? 'animate-pulse border-red-500 text-red-500' : ''}`}
              >
                {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {listening ? 'Stop' : 'Speak'}
              </Button>
            )}
          </div>
        </div>

        {answer && (
          <div className="rounded-2xl border border-border bg-muted/20 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-gravel">Preview response</p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onPlayVoice}
                  className="h-7 gap-1.5 rounded-full px-3 text-xs"
                >
                  {speaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                  {speaking ? 'Stop' : 'Play voice'}
                </Button>
                <span className="rounded-full bg-orange/10 px-2.5 py-1 text-xs font-semibold text-orange">
                  {usedSources} sources used
                </span>
              </div>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-6 text-gravel">{answer}</p>
            {citations.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {citations.map((citation) => (
                  <span key={citation} className="rounded-full border border-border bg-white px-3 py-1 text-xs text-muted-foreground">
                    {citation}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default TestBotPlayground
