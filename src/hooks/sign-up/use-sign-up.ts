'use client'
import { useToast } from '@/components/ui/use-toast'
import {
  UserRegistrationProps,
  UserRegistrationSchema,
} from '@/schemas/auth.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

export const useSignUpForm = () => {
  const { toast } = useToast()
  const [loading, setLoading] = useState<boolean>(false)
  const router = useRouter()
  const methods = useForm<UserRegistrationProps>({
    resolver: zodResolver(UserRegistrationSchema),
    defaultValues: {
      type: 'owner',
    },
    mode: 'onChange',
  })

  const onGenerateOTP = async (
    email: string,
    password: string,
    onNext: React.Dispatch<React.SetStateAction<number>>
  ) => {
    onNext((prev) => prev + 1)
  }

  const onHandleSubmit = methods.handleSubmit(
    async (values: UserRegistrationProps) => {
      try {
        setLoading(true)
        const { error } = await authClient.signUp.email({
          email: values.email,
          password: values.password,
          name: values.fullname,
          callbackURL: '/dashboard',
        })

        if (error) {
          toast({ title: 'Error', description: error.message })
          return
        }

        toast({ title: 'Success', description: 'Account created' })
        router.push('/dashboard')
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error?.message ?? 'Something went wrong',
        })
      } finally {
        setLoading(false)
      }
    }
  )
  return {
    methods,
    onHandleSubmit,
    onGenerateOTP,
    loading,
  }
}
