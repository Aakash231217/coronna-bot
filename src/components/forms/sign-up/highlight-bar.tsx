'use client'
import { useAuthContextHook } from '@/context/use-auth-context'
import { cn } from '@/lib/utils'
import React from 'react'

const steps = ['Account type', 'Your details', 'Business info']

const HighLightBar = () => {
  const { currentStep } = useAuthContextHook()

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-2">
        {steps.map((_, idx) => {
          const stepNumber = idx + 1
          const active = currentStep >= stepNumber
          return (
            <div
              key={stepNumber}
              className={cn(
                'h-1.5 rounded-full transition',
                active ? 'bg-brand-gradient' : 'bg-muted'
              )}
            />
          )
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        Step {currentStep} of {steps.length} —{' '}
        <span className="text-foreground">{steps[currentStep - 1]}</span>
      </p>
    </div>
  )
}

export default HighLightBar
