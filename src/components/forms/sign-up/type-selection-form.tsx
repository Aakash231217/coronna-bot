import React from 'react'
import { FieldValues, UseFormRegister } from 'react-hook-form'
import UserTypeCard from './user-type-card'

type Props = {
  register: UseFormRegister<FieldValues>
  userType: 'owner' | 'student'
  setUserType: React.Dispatch<React.SetStateAction<'owner' | 'student'>>
}

const TypeSelectionForm = ({ register, setUserType, userType }: Props) => {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">Tell us who you are</h2>
        <p className="text-sm text-muted-foreground">
          We&apos;ll tailor the dashboard for your role.
        </p>
      </div>
      <div className="grid gap-3">
        <UserTypeCard
          register={register}
          setUserType={setUserType}
          userType={userType}
          value="owner"
          title="I own a business"
          text="Setting up Corinna AI for my own company."
        />
        <UserTypeCard
          register={register}
          setUserType={setUserType}
          userType={userType}
          value="student"
          title="I&apos;m exploring"
          text="Just learning what Corinna can do."
        />
      </div>
    </div>
  )
}

export default TypeSelectionForm
