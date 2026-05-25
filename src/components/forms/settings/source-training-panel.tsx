'use client'

import {
  onDeleteDomainSource,
  onGetDomainSources,
  onTrainDomainSource,
} from '@/actions/settings'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { FileText, Loader2, Trash2, UploadCloud } from 'lucide-react'
import React, { useEffect, useRef, useState, useTransition } from 'react'

type SourceItem = {
  id: string
  title: string
  type: string
  status: string
  createdAt: Date
  _count: { chunks: number }
}

type SourceTrainingPanelProps = {
  domainId: string
}

const SourceTrainingPanel = ({ domainId }: SourceTrainingPanelProps) => {
  const formRef = useRef<HTMLFormElement | null>(null)
  const [sources, setSources] = useState<SourceItem[]>([])
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const loadSources = () => {
    startTransition(async () => {
      const response = await onGetDomainSources(domainId)
      setSources((response.sources || []) as SourceItem[])
    })
  }

  useEffect(() => {
    loadSources()
  }, [domainId])

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    startTransition(async () => {
      const response = await onTrainDomainSource(domainId, formData)
      toast({
        title: response.status === 200 ? 'Source trained' : 'Training failed',
        description: response.message,
      })

      if (response.status === 200) {
        formRef.current?.reset()
        loadSources()
      }
    })
  }

  const onDelete = (sourceId: string) => {
    startTransition(async () => {
      const response = await onDeleteDomainSource(sourceId)
      toast({ title: response.status === 200 ? 'Removed' : 'Error', description: response.message })
      loadSources()
    })
  }

  return (
    <Card className="rounded-2xl">
      <CardContent className="grid gap-5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <UploadCloud className="h-5 w-5 text-orange" />
              Training sources
            </CardTitle>
            <CardDescription className="mt-1">
              Upload PDFs/text or paste content. The bot retrieves chunks and cites sources while answering.
            </CardDescription>
          </div>
          {isPending && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
        </div>

        <form ref={formRef} onSubmit={onSubmit} className="grid gap-3 rounded-2xl border border-border bg-muted/20 p-4">
          <input
            name="title"
            placeholder="Source title (optional)"
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-orange"
          />
          <input
            name="file"
            type="file"
            accept=".pdf,.txt,.md,text/plain,application/pdf"
            className="rounded-xl border border-dashed border-border bg-white px-3 py-3 text-sm"
          />
          <textarea
            name="text"
            placeholder="Or paste training text, FAQs, policies, pricing notes..."
            className="min-h-[120px] rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-orange"
          />
          <Button type="submit" disabled={isPending} className="w-fit">
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
            Train source
          </Button>
        </form>

        <div className="grid gap-3">
          {sources.length ? (
            sources.map((source) => (
              <div key={source.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-white p-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange/10 text-orange">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gravel">{source.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {source.type} · {source._count.chunks} chunks · {source.status}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(source.id)}
                  className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
              No trained sources yet. Add one before publishing the widget.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default SourceTrainingPanel
