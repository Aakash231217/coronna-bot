'use client'

import { onUpdateWidgetSettings } from '@/actions/settings'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Settings2, Loader2 } from 'lucide-react'
import React, { useState, useTransition } from 'react'

const BEHAVIOR_OPTIONS = [
  { value: 'sales', label: 'Sales', description: 'Focuses on converting visitors into customers' },
  { value: 'helping', label: 'Helping', description: 'Prioritises solving problems and answering questions thoroughly' },
  { value: 'talkative', label: 'Talkative', description: 'Warm, conversational and engaging' },
  { value: 'lead_nurturing', label: 'Lead Nurturing', description: 'Builds trust and guides visitors to become qualified leads' },
]

type WidgetCustomizationPanelProps = {
  domainId: string
  chatBot: {
    launcherPosition?: string
    launcherSize?: number
    widgetTheme?: string
    starterPrompts?: string[]
    showBranding?: boolean
    behaviorMode?: string
  } | null
}

const WidgetCustomizationPanel = ({ domainId, chatBot }: WidgetCustomizationPanelProps) => {
  const [launcherPosition, setLauncherPosition] = useState(chatBot?.launcherPosition || 'right')
  const [launcherSize, setLauncherSize] = useState(chatBot?.launcherSize || 72)
  const [widgetTheme, setWidgetTheme] = useState(chatBot?.widgetTheme || 'light')
  const [showBranding, setShowBranding] = useState(chatBot?.showBranding ?? true)
  const [behaviorMode, setBehaviorMode] = useState(chatBot?.behaviorMode || 'sales')
  const [starterPrompts, setStarterPrompts] = useState<string[]>(
    chatBot?.starterPrompts?.length
      ? chatBot.starterPrompts
      : ['What services do you offer?', 'Can I book an appointment?', 'Can I talk to your team?']
  )
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const updatePrompt = (index: number, value: string) => {
    setStarterPrompts((prev) => prev.map((prompt, promptIndex) => (promptIndex === index ? value : prompt)))
  }

  const onSave = () => {
    startTransition(async () => {
      const response = await onUpdateWidgetSettings(domainId, {
        launcherPosition,
        launcherSize,
        widgetTheme,
        showBranding,
        starterPrompts,
        behaviorMode,
      })
      toast({ title: response.status === 200 ? 'Saved' : 'Error', description: response.message })
    })
  }

  return (
    <Card className="rounded-2xl">
      <CardContent className="grid gap-5 p-5">
        <div>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Settings2 className="h-5 w-5 text-orange" />
            Widget controls
          </CardTitle>
          <CardDescription className="mt-1">
            Configure launcher placement, size, starter questions and branding before publishing.
          </CardDescription>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-gravel">
            Launcher position
            <select
              value={launcherPosition}
              onChange={(event) => setLauncherPosition(event.target.value)}
              className="rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-orange"
            >
              <option value="right">Bottom right</option>
              <option value="left">Bottom left</option>
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium text-gravel">
            Bubble size: {launcherSize}px
            <input
              type="range"
              min={56}
              max={88}
              value={launcherSize}
              onChange={(event) => setLauncherSize(Number(event.target.value))}
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-gravel">
            Widget theme
            <select
              value={widgetTheme}
              onChange={(event) => setWidgetTheme(event.target.value)}
              className="rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-orange"
            >
              <option value="light">Light</option>
              <option value="warm">Warm</option>
              <option value="dark">Dark</option>
            </select>
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 px-3 py-2 text-sm font-medium text-gravel">
            <input
              type="checkbox"
              checked={showBranding}
              onChange={(event) => setShowBranding(event.target.checked)}
            />
            Show powered-by branding
          </label>
        </div>

        <div className="grid gap-2">
          <p className="text-sm font-semibold text-gravel">Bot behavior trigger</p>
          <p className="text-xs text-muted-foreground">Controls how the AI approaches each conversation.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {BEHAVIOR_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setBehaviorMode(opt.value)}
                className={`rounded-xl border p-3 text-left text-sm transition ${
                  behaviorMode === opt.value
                    ? 'border-orange bg-orange/10 font-semibold text-orange'
                    : 'border-border bg-white text-gravel hover:border-orange/50'
                }`}
              >
                <span className="block font-medium">{opt.label}</span>
                <span className="block text-xs text-muted-foreground">{opt.description}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-2">
          <p className="text-sm font-semibold text-gravel">Starter questions</p>
          {starterPrompts.map((prompt, index) => (
            <input
              key={index}
              value={prompt}
              onChange={(event) => updatePrompt(index, event.target.value)}
              className="rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-orange"
            />
          ))}
        </div>

        <Button type="button" onClick={onSave} disabled={isPending} className="w-fit">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save widget controls
        </Button>
      </CardContent>
    </Card>
  )
}

export default WidgetCustomizationPanel
