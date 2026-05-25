'use client'

import { onTestDomainBot } from '@/actions/settings'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { Bot, Loader2, Send } from 'lucide-react'
import React, { useState, useTransition } from 'react'

const TestBotPlayground = ({ domainId }: { domainId: string }) => {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [citations, setCitations] = useState<string[]>([])
  const [usedSources, setUsedSources] = useState(0)
  const [isPending, startTransition] = useTransition()

  const onAsk = () => {
    if (!question.trim()) return

    startTransition(async () => {
      const response = await onTestDomainBot(domainId, question)
      setAnswer(response.status === 200 ? response.answer || '' : response.message || 'Unable to test bot.')
      setCitations(response.status === 200 ? response.citations || [] : [])
      setUsedSources(response.status === 200 ? response.usedSources || 0 : 0)
    })
  }

  return (
    <Card className="rounded-2xl">
      <CardContent className="grid gap-5 p-5">
        <div>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Bot className="h-5 w-5 text-orange" />
            Test bot before publishing
          </CardTitle>
          <CardDescription className="mt-1">
            Ask a question without creating a customer, chat room or public conversation.
          </CardDescription>
        </div>

        <div className="grid gap-3">
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask the bot something from your trained sources..."
            className="min-h-[96px] rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-orange"
          />
          <Button type="button" onClick={onAsk} disabled={isPending} className="w-fit">
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Test answer
          </Button>
        </div>

        {answer && (
          <div className="rounded-2xl border border-border bg-muted/20 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-gravel">Preview response</p>
              <span className="rounded-full bg-orange/10 px-2.5 py-1 text-xs font-semibold text-orange">
                {usedSources} sources used
              </span>
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
