'use client'

import {
  onGetDomainBotAnalytics,
  onGetDomainUnansweredQuestions,
  onResolveUnansweredQuestion,
} from '@/actions/settings'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { BarChart3, CheckCircle2, HelpCircle, Loader2 } from 'lucide-react'
import React, { useEffect, useState, useTransition } from 'react'

type Analytics = {
  sources: number
  chunks: number
  unanswered: number
  resolved: number
  chats: number
  messages: number
  bookings: number
}

type Question = {
  id: string
  question: string
  answer: string | null
  resolved: boolean
  createdAt: Date
}

const BotAnalyticsPanel = ({ domainId }: { domainId: string }) => {
  const [analytics, setAnalytics] = useState<Analytics>()
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const load = () => {
    startTransition(async () => {
      const [analyticsResponse, questionsResponse] = await Promise.all([
        onGetDomainBotAnalytics(domainId),
        onGetDomainUnansweredQuestions(domainId),
      ])
      setAnalytics(analyticsResponse.analytics)
      setQuestions((questionsResponse.questions || []) as Question[])
    })
  }

  useEffect(() => {
    load()
  }, [domainId])

  const onResolve = (questionId: string) => {
    startTransition(async () => {
      const response = await onResolveUnansweredQuestion(questionId, answers[questionId] || '')
      toast({
        title: response.status === 200 ? 'Question resolved' : 'Error',
        description: response.status === 200 ? 'Use this answer as future training material.' : response.message,
      })
      load()
    })
  }

  const metrics = [
    ['Sources', analytics?.sources || 0],
    ['Chunks', analytics?.chunks || 0],
    ['Chats', analytics?.chats || 0],
    ['Messages', analytics?.messages || 0],
    ['Bookings', analytics?.bookings || 0],
    ['Unanswered', analytics?.unanswered || 0],
  ]

  return (
    <Card className="rounded-2xl">
      <CardContent className="grid gap-5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BarChart3 className="h-5 w-5 text-orange" />
              Bot analytics
            </CardTitle>
            <CardDescription className="mt-1">
              Production data from trained sources, messages, bookings and unanswered questions.
            </CardDescription>
          </div>
          {isPending && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {metrics.map(([label, value]) => (
            <div key={label} className="rounded-xl border border-border bg-muted/20 p-3">
              <p className="text-2xl font-bold text-gravel">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-gravel">
            <HelpCircle className="h-4 w-4 text-orange" />
            Unanswered questions
          </div>
          {questions.length ? (
            questions.map((item) => (
              <div key={item.id} className="grid gap-3 rounded-xl border border-border bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-gravel">{item.question}</p>
                  {item.resolved && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                </div>
                {item.resolved ? (
                  <p className="text-xs leading-5 text-muted-foreground">{item.answer}</p>
                ) : (
                  <div className="grid gap-2">
                    <textarea
                      value={answers[item.id] || ''}
                      onChange={(event) => setAnswers((prev) => ({ ...prev, [item.id]: event.target.value }))}
                      placeholder="Add the correct answer, then use it as source training text."
                      className="min-h-[72px] rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-orange"
                    />
                    <Button type="button" size="sm" className="w-fit" onClick={() => onResolve(item.id)}>
                      Mark resolved
                    </Button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
              No unanswered questions yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default BotAnalyticsPanel
