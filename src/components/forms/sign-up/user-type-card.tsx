'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Briefcase, GraduationCap } from 'lucide-react'
import React from 'react'
import { FieldValues, UseFormRegister } from 'react-hook-form'

type Props = {
  value: string
  title: string
  text: string
  register: UseFormRegister<FieldValues>
  userType: 'owner' | 'student'
  setUserType: React.Dispatch<React.SetStateAction<'owner' | 'student'>>
}

const UserTypeCard = ({
  register,
  setUserType,
  text,
  title,
  userType,
  value,
}: Props) => {
  const active = userType === value
  const Icon = value === 'owner' ? Briefcase : GraduationCap

  return (
    <Label htmlFor={value}>
      <div
        className={cn(
          'group flex w-full cursor-pointer items-center justify-between rounded-2xl border p-4 transition',
          active
            ? 'border-brand bg-brand/5 shadow-[0_10px_30px_-15px_rgba(91,91,214,0.55)]'
            : 'border-border bg-card hover:border-brand/50'
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'grid h-11 w-11 place-items-center rounded-xl transition',
              active
                ? 'bg-brand-gradient text-white shadow'
                : 'bg-secondary text-muted-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">{title}</p>
            <p className="text-xs text-muted-foreground">{text}</p>
          </div>
        </div>
        <div
          className={cn(
            'flex h-5 w-5 items-center justify-center rounded-full border-2 transition',
            active ? 'border-brand bg-brand' : 'border-border'
          )}
        >
          <span
            className={cn(
              'h-2 w-2 rounded-full bg-white transition',
              !active && 'opacity-0'
            )}
          />
          <Input
            {...register('type', {
              onChange: (event) => setUserType(event.target.value),
            })}
            value={value}
            id={value}
            className="hidden"
            type="radio"
          />
        </div>
      </div>
    </Label>
  )
}

export default UserTypeCard
