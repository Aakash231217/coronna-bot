import React from 'react'
import { cn } from '@/lib/utils'

type BotFace3DProps = {
  className?: string
  size?: number
}

const BotFace3D = ({ className, size = 80 }: BotFace3DProps) => {
  return (
    <div
      className={cn('relative shrink-0 rounded-full', className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_25%,#fff7d6_0%,#ffd669_35%,#f59b2f_72%,#a95515_100%)] shadow-[inset_-10px_-12px_18px_rgba(91,50,18,0.25),inset_10px_8px_16px_rgba(255,255,255,0.55),0_12px_24px_rgba(93,62,28,0.22)]" />
      <div className="absolute left-[17%] top-[13%] h-[18%] w-[28%] rounded-full bg-white/55 blur-[2px]" />
      <div className="absolute left-[24%] top-[37%] h-[14%] w-[14%] rounded-full bg-[#3f3125] shadow-[inset_-2px_-2px_2px_rgba(0,0,0,0.22)]">
        <div className="absolute left-[18%] top-[15%] h-[28%] w-[28%] rounded-full bg-white" />
      </div>
      <div className="absolute right-[24%] top-[37%] h-[14%] w-[14%] rounded-full bg-[#3f3125] shadow-[inset_-2px_-2px_2px_rgba(0,0,0,0.22)]">
        <div className="absolute left-[18%] top-[15%] h-[28%] w-[28%] rounded-full bg-white" />
      </div>
      <div className="absolute left-1/2 top-[48%] h-[10%] w-[9%] -translate-x-1/2 rounded-full bg-[#d37d22] shadow-[inset_0_-2px_2px_rgba(91,50,18,0.18)]" />
      <div className="absolute left-1/2 top-[63%] h-[11%] w-[32%] -translate-x-1/2 rounded-b-full border-b-[3px] border-[#6d4428]" />
      <div className="absolute -right-[5%] bottom-[13%] h-[28%] w-[28%] rounded-full bg-[radial-gradient(circle_at_35%_35%,#ffffff_0%,#dff7ff_38%,#78c9ef_100%)] shadow-[0_6px_12px_rgba(57,118,148,0.25)]" />
      <div className="absolute right-[3%] bottom-[21%] h-[12%] w-[12%] rounded-full bg-[#3d6f86]" />
    </div>
  )
}

export default BotFace3D
