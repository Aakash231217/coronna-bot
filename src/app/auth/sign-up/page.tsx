import ButtonHandler from '@/components/forms/sign-up/button-handlers'
import SignUpFormProvider from '@/components/forms/sign-up/form-provider'
import HighLightBar from '@/components/forms/sign-up/highlight-bar'
import RegistrationFormStep from '@/components/forms/sign-up/registration-step'

import React from 'react'

type Props = {}

const SignUp = (props: Props) => {
  return (
    <SignUpFormProvider>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Create your account
          </h1>
          <p className="text-sm text-muted-foreground">
            Spin up your AI sales assistant in minutes.
          </p>
        </div>
        <HighLightBar />
        <RegistrationFormStep />
        <ButtonHandler />
      </div>
    </SignUpFormProvider>
  )
}

export default SignUp
