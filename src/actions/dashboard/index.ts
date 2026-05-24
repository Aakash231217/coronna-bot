'use server'

import { client } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/current-user'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET!, {
  typescript: true,
  apiVersion: '2024-04-10',
})

export const getUserClients = async () => {
  try {
    const user = await getCurrentUser()
    if (user) {
      const clients = await client.customer.count({
        where: {
          Domain: {
            User: {
              id: user.id,
            },
          },
        },
      })
      if (clients) {
        return clients
      }
    }
  } catch (error) {
    console.log(error)
  }
}

export const getUserBalance = async () => {
  try {
    const user = await getCurrentUser()
    if (user) {
      const connectedStripe = await client.user.findUnique({
        where: {
          id: user.id,
        },
        select: {
          stripeId: true,
        },
      })

      if (connectedStripe?.stripeId) {
        const transactions = await stripe.balance.retrieve({
          stripeAccount: connectedStripe.stripeId,
        })

        if (transactions) {
          const sales = transactions.pending.reduce((total, next) => {
            return total + next.amount
          }, 0)

          return sales / 100
        }
      }
    }
  } catch (error) {
    console.log(error)
  }
}

export const getUserPlanInfo = async () => {
  try {
    const user = await getCurrentUser()
    if (user) {
      const plan = await client.user.findUnique({
        where: {
          id: user.id,
        },
        select: {
          _count: {
            select: {
              domains: true,
            },
          },
          subscription: {
            select: {
              plan: true,
              credits: true,
            },
          },
        },
      })
      if (plan) {
        return {
          plan: plan.subscription?.plan,
          credits: plan.subscription?.credits,
          domains: plan._count.domains,
        }
      }
    }
  } catch (error) {
    console.log(error)
  }
}

export const getUserTotalProductPrices = async () => {
  try {
    const user = await getCurrentUser()
    if (user) {
      const products = await client.product.findMany({
        where: {
          Domain: {
            User: {
              id: user.id,
            },
          },
        },
        select: {
          price: true,
        },
      })

      if (products) {
        const total = products.reduce((total, next) => {
          return total + next.price
        }, 0)

        return total
      }
    }
  } catch (error) {
    console.log(error)
  }
}

export const getUserTransactions = async () => {
  try {
    const user = await getCurrentUser()
    if (user) {
      const connectedStripe = await client.user.findUnique({
        where: {
          id: user.id,
        },
        select: {
          stripeId: true,
        },
      })

      if (connectedStripe?.stripeId) {
        const transactions = await stripe.charges.list({
          stripeAccount: connectedStripe.stripeId,
        })
        if (transactions) {
          return transactions
        }
      }
    }
  } catch (error) {
    console.log(error)
  }
}

const startOfDay = (date: Date) => {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

const formatDateKey = (date: Date) => date.toISOString().slice(0, 10)

const buildLastSevenDays = () => {
  const today = startOfDay(new Date())
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (6 - index))
    return date
  })
}

const countByDay = (items: { createdAt: Date }[], days: Date[]) => {
  const counts = new Map(days.map((day) => [formatDateKey(day), 0]))

  items.forEach((item) => {
    const key = formatDateKey(startOfDay(item.createdAt))
    if (counts.has(key)) counts.set(key, (counts.get(key) || 0) + 1)
  })

  return days.map((day) => counts.get(formatDateKey(day)) || 0)
}

export const getDashboardAnalytics = async () => {
  try {
    const user = await getCurrentUser()
    if (!user) return null

    const days = buildLastSevenDays()
    const from = days[0]

    const [domains, customers, bookings, chatRooms, liveChatRooms, messages, products] =
      await Promise.all([
        client.domain.count({
          where: {
            userId: user.id,
          },
        }),
        client.customer.findMany({
          where: {
            Domain: {
              userId: user.id,
            },
          },
          select: {
            id: true,
            questions: {
              where: {
                answered: {
                  not: null,
                },
              },
              select: {
                id: true,
              },
            },
          },
        }),
        client.bookings.findMany({
          where: {
            Customer: {
              Domain: {
                userId: user.id,
              },
            },
          },
          select: {
            id: true,
            createdAt: true,
          },
        }),
        client.chatRoom.findMany({
          where: {
            Customer: {
              Domain: {
                userId: user.id,
              },
            },
          },
          select: {
            id: true,
            createdAt: true,
          },
        }),
        client.chatRoom.count({
          where: {
            live: true,
            Customer: {
              Domain: {
                userId: user.id,
              },
            },
          },
        }),
        client.chatMessage.findMany({
          where: {
            createdAt: {
              gte: from,
            },
            ChatRoom: {
              Customer: {
                Domain: {
                  userId: user.id,
                },
              },
            },
          },
          select: {
            id: true,
            createdAt: true,
          },
        }),
        client.product.findMany({
          where: {
            Domain: {
              userId: user.id,
            },
          },
          select: {
            price: true,
          },
        }),
      ])

    const qualifiedLeads = customers.filter(
      (customer) => customer.questions.length > 0
    ).length
    const pipeline = products.reduce((total, product) => total + product.price, 0) * customers.length
    const weeklyBookings = countByDay(bookings, days)
    const weeklyMessages = countByDay(messages, days)
    const weeklyActivity = days.map(
      (_, index) => weeklyBookings[index] + weeklyMessages[index]
    )

    return {
      domains,
      customers: customers.length,
      bookings: bookings.length,
      chatRooms: chatRooms.length,
      liveChatRooms,
      messages: messages.length,
      qualifiedLeads,
      pipeline,
      weeklyBookings,
      weeklyMessages,
      weeklyActivity,
      funnel: {
        conversations: chatRooms.length,
        leads: customers.length,
        qualifiedLeads,
        appointments: bookings.length,
      },
      channelMix: {
        widgetChats: chatRooms.length,
        appointments: bookings.length,
        liveFollowUp: liveChatRooms,
      },
    }
  } catch (error) {
    console.log(error)
    return null
  }
}
