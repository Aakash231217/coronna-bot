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
      phone: {
        type: 'string',
        required: false,
      },
      businessEmail: {
        type: 'string',
        required: false,
      },
      companyName: {
        type: 'string',
        required: false,
      },
      website: {
        type: 'string',
        required: false,
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
