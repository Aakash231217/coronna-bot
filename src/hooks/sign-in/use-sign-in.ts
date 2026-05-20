import { useToast } from '@/components/ui/use-toast'
import { authClient } from '@/lib/auth-client'
import { UserLoginProps, UserLoginSchema } from '@/schemas/auth.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

export const useSignInForm = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const router = useRouter()
  const { toast } = useToast()
  const methods = useForm<UserLoginProps>({
    resolver: zodResolver(UserLoginSchema),
    mode: 'onChange',
  })
  const onHandleSubmit = methods.handleSubmit(
    async (values: UserLoginProps) => {
      try {
        setLoading(true)
        const { error } = await authClient.signIn.email({
          email: values.email,
          password: values.password,
          callbackURL: '/dashboard',
        })

        if (error) {
          toast({ title: 'Error', description: error.message })
          return
        }

        toast({
          title: 'Success',
          description: 'Welcome back!',
        })
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
    loading,
  }
}
