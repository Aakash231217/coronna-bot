import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { nextCookies } from 'better-auth/next-js'
import { client } from './prisma'

export const auth = betterAuth({
  database: prismaAdapter(client, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  user: {
    additionalFields: {
      fullname: {
        type: 'string',
        required: false,
        defaultValue: '',
      },
      type: {
        type: 'string',
        required: false,
        defaultValue: 'owner',
      },
    },
  },
  advanced: {
    database: {
      generateId: 'uuid',
    },
  },
  plugins: [nextCookies()],
})
