import SignInFormProvider from '@/components/forms/sign-in/form-provider'
import LoginForm from '@/components/forms/sign-in/login-form'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'

const SignInPage = () => {
  return (
    <SignInFormProvider>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your Corinna AI workspace.
          </p>
        </div>
        <LoginForm />
        <Button
          type="submit"
          className="h-11 w-full rounded-xl bg-brand-gradient text-base font-semibold text-white shadow-[0_12px_28px_-10px_rgba(91,91,214,0.6)] hover:opacity-95"
        >
          Sign in
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Don’t have an account?{' '}
          <Link
            href="/auth/sign-up"
            className="font-semibold text-brand hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </SignInFormProvider>
  )
}

export default SignInPage
