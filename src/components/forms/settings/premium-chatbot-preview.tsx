import BotFace3D from '@/components/chatbot/bot-face-3d'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import React from 'react'
import MascotStudio from './mascot-studio'
import type { BotPersona } from './form'

type PremiumChatbotPreviewProps = {
  domainName: string
  welcomeMessage?: string | null
  icon?: string | null
  selectedPersona: BotPersona
}

const personas = [
  {
    id: 'human',
    name: 'Nova',
    label: 'Cartoon Human',
    role: 'Premium consultant',
    gradient: 'from-[#fff2bd] via-[#ffbb62] to-[#d9662d]',
  },
  {
    id: 'mascot',
    name: 'Mira',
    label: '3D Mascot',
    role: 'Warm support mascot',
    gradient: 'from-[#dff7ff] via-[#86d7f2] to-[#4f79d7]',
  },
  {
    id: 'voice',
    name: 'Kairo',
    label: 'Voice Agent',
    role: 'Talk-ready advisor',
    gradient: 'from-[#f4e3ff] via-[#c79cff] to-[#7b56d9]',
  },
] satisfies { id: BotPersona; name: string; label: string; role: string; gradient: string }[]

const MiniPersona = ({ index, active }: { index: number; active?: boolean }) => (
  <div
    className={cn(
      'relative flex h-16 w-16 items-center justify-center rounded-2xl border bg-white shadow-sm transition',
      active ? 'border-orange shadow-[0_10px_24px_rgba(255,160,64,0.25)]' : 'border-gray-200'
    )}
  >
    <div className={cn('absolute inset-2 rounded-2xl bg-gradient-to-br', personas[index].gradient)} />
    <div className="absolute inset-[13px] rounded-full bg-white/85 shadow-inner" />
    <div className="absolute left-[24px] top-[28px] h-1.5 w-1.5 rounded-full bg-gray-800" />
    <div className="absolute right-[24px] top-[28px] h-1.5 w-1.5 rounded-full bg-gray-800" />
    <div className="absolute bottom-[20px] h-2 w-5 rounded-b-full border-b-2 border-gray-800" />
  </div>
)

const PremiumChatbotPreview = ({
  domainName,
  welcomeMessage,
  icon,
  selectedPersona,
}: PremiumChatbotPreviewProps) => {
  const botMessage = welcomeMessage || 'Hey there, have a question? Text us here'
  const cleanDomain = domainName.replace(/^https?:\/\//, '').replace(/^www\./, '')
  const activeIndex = personas.findIndex((persona) => persona.id === selectedPersona)
  const activePersona = personas[activeIndex] ?? personas[0]

  return (
    <div className="sticky top-5 flex flex-col gap-4 rounded-[28px] border border-gray-200 bg-[linear-gradient(145deg,#ffffff_0%,#f8fafc_45%,#fff4df_100%)] p-4 shadow-[0_24px_80px_rgba(25,32,48,0.12)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange">Premium preview</p>
          <h3 className="text-2xl font-bold text-gravel">Create your chatbot mascot</h3>
        </div>
        <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-600 shadow-sm">
          Three.js live
        </div>
      </div>

      <MascotStudio selectedPersona={selectedPersona} />

      <div className="grid grid-cols-3 gap-3">
        {personas.map((persona, index) => (
          <div
            key={persona.name}
            className={cn(
              'rounded-2xl border bg-white p-3 shadow-sm',
              persona.id === selectedPersona ? 'border-orange' : 'border-gray-200'
            )}
          >
            <MiniPersona index={index} active={persona.id === selectedPersona} />
            <p className="mt-3 text-sm font-bold text-gray-900">{persona.name}</p>
            <p className="text-[11px] font-semibold text-orange">{persona.label}</p>
            <p className="text-[11px] leading-tight text-gray-500">{persona.role}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.1)]">
        <div className="flex items-center gap-3 border-b bg-white px-4 py-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-full bg-grandis shadow-lg">
            {icon ? (
              <Image src={`https://ucarecdn.com/${icon}/`} alt="bot" fill className="object-cover" />
            ) : (
              <BotFace3D size={64} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-lg font-bold text-gray-950">Sales Rep - {activePersona.name}</h4>
            <p className="truncate text-sm text-gray-500">{cleanDomain}</p>
          </div>
          <div className="flex -space-x-2">
            {[0, 1, 2].map((index) => (
              <div key={index} className="h-7 w-7 rounded-full border-2 border-white bg-gradient-to-br from-amber-200 to-orange-400" />
            ))}
          </div>
        </div>

        <div className="flex h-[420px] flex-col gap-4 bg-[radial-gradient(circle_at_top_right,#fff1ce_0%,transparent_35%),#f8fafc] p-5">
          <div className="max-w-[75%] rounded-2xl rounded-tl-sm bg-white p-4 text-sm text-gray-700 shadow-sm">
            <p className="mb-1 text-[11px] font-semibold text-gray-400">8:30 pm</p>
            I want help choosing the right plan.
          </div>
          <div className="ml-auto max-w-[82%] rounded-2xl rounded-tr-sm bg-grandis p-4 text-sm text-gray-900 shadow-sm">
            <p className="mb-1 text-[11px] font-semibold text-gray-500">8:31 pm</p>
            {botMessage}
          </div>
          <div className="max-w-[72%] rounded-2xl rounded-tl-sm bg-white p-4 text-sm text-gray-700 shadow-sm">
            <p className="mb-1 text-[11px] font-semibold text-gray-400">8:31 pm</p>
            Can I talk to someone from your team?
          </div>
          <div className="ml-auto flex max-w-[84%] items-center gap-3 rounded-2xl rounded-tr-sm bg-[#20283a] p-4 text-sm text-white shadow-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange text-white">◔</div>
            <div>
              <p className="font-semibold">Voice reply enabled</p>
              <p className="text-xs text-white/70">{activePersona.name} can speak replies with ElevenLabs.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PremiumChatbotPreview
