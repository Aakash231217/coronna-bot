import Section from '@/components/section-label'
import UploadButton from '@/components/upload-button'
import BotFace3D from '@/components/chatbot/bot-face-3d'

import Image from 'next/image'
import React from 'react'
import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form'

type Props = {
  register: UseFormRegister<FieldValues>
  errors: FieldErrors<FieldValues>
  chatBot: {
    id: string
    icon: string | null
    welcomeMessage: string | null
  } | null
}

const personaOptions = [
  {
    name: '3D Mascot',
    description: 'Warm AI sales assistant',
    accent: 'from-amber-100 to-orange-200',
  },
  {
    name: 'Human Rep',
    description: 'Premium consultant look',
    accent: 'from-sky-100 to-blue-200',
  },
  {
    name: 'Voice Agent',
    description: 'Talk-ready support bot',
    accent: 'from-violet-100 to-fuchsia-200',
  },
]

const EditChatbotIcon = ({ register, errors, chatBot }: Props) => {
  return (
    <div className="py-5 flex flex-col gap-5 items-start">
      <Section
        label="Bot identity"
        message="Pick a premium personality style or upload your own face for the chatbot."
      />
      <div className="grid w-full max-w-[560px] grid-cols-1 gap-3 sm:grid-cols-3">
        {personaOptions.map((persona, index) => (
          <div
            key={persona.name}
            className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className={`mb-3 flex h-20 items-center justify-center rounded-2xl bg-gradient-to-br ${persona.accent}`}>
              {index === 0 ? (
                <BotFace3D size={58} />
              ) : (
                <div className="relative h-14 w-14 rounded-full bg-white/80 shadow-[inset_-6px_-8px_12px_rgba(15,23,42,0.14),0_10px_18px_rgba(15,23,42,0.12)]">
                  <div className="absolute left-[18px] top-[23px] h-1.5 w-1.5 rounded-full bg-gray-800" />
                  <div className="absolute right-[18px] top-[23px] h-1.5 w-1.5 rounded-full bg-gray-800" />
                  <div className="absolute bottom-[15px] left-1/2 h-2 w-5 -translate-x-1/2 rounded-b-full border-b-2 border-gray-800" />
                  {index === 2 && <div className="absolute -right-1 bottom-2 h-4 w-4 rounded-full bg-orange shadow" />}
                </div>
              )}
            </div>
            <p className="text-sm font-bold text-gray-900">{persona.name}</p>
            <p className="text-xs leading-snug text-gray-500">{persona.description}</p>
          </div>
        ))}
      </div>
      <UploadButton
        label="Upload Custom Bot Face"
        register={register}
        errors={errors}
      />
      {chatBot?.icon ? (
        <div className="rounded-full overflow-hidden">
          <Image
            src={`https://ucarecdn.com/${chatBot.icon}/`}
            alt="bot"
            width={80}
            height={80}
          />
        </div>
      ) : (
        <div className="rounded-full cursor-pointer shadow-md w-20 h-20 flex items-center justify-center bg-grandis">
          <BotFace3D size={80} />
        </div>
      )}
    </div>
  )
}

export default EditChatbotIcon
