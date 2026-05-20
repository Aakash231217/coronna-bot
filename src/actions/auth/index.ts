'use server'

import { client } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/current-user'
import { redirect } from 'next/navigation'
import { onGetAllAccountDomains } from '../settings'

export const onLoginUser = async () => {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/sign-in')

  try {
    const authenticated = await client.user.update({
      where: {
        id: user.id,
      },
      data: {
        fullname: user.name || user.email,
        type: 'owner',
        subscription: {
          upsert: {
            create: {},
            update: {},
          },
        },
      },
      select: {
        fullname: true,
        id: true,
        type: true,
      },
    })

    const domains = await onGetAllAccountDomains()
    return { status: 200, user: authenticated, domain: domains?.domains }
  } catch (error) {
    return { status: 400 }
  }
}
