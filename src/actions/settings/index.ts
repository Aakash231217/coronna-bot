'use server'
import { client } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/current-user'
import { scrapeDomain } from '@/lib/scrape-domain'
import { chunkText, cosineSimilarity, embedText } from '@/lib/rag'
import OpenAi from 'openai'

const openRouterKey = process.env.OPEN_ROUTER_KEY || process.env.OPENROUTER_API_KEY
const aiModel = process.env.OPEN_ROUTER_MODEL || 'openai/gpt-4o-mini'
const testBotClient = new OpenAi({
  apiKey: openRouterKey || process.env.OPEN_AI_KEY,
  baseURL: openRouterKey ? 'https://openrouter.ai/api/v1' : undefined,
  defaultHeaders: openRouterKey
    ? {
        'HTTP-Referer':
          process.env.NEXT_PUBLIC_APP_URL ||
          process.env.BETTER_AUTH_URL ||
          'http://localhost:3000',
        'X-Title': 'Corinna AI',
      }
    : undefined,
})

export const onRescanDomain = async (domainId: string) => {
  try {
    const domain = await client.domain.findUnique({
      where: { id: domainId },
      select: { name: true },
    })
    if (!domain) return { status: 404, message: 'Domain not found' }

    const scraped = await scrapeDomain(domain.name)
    if (!scraped) {
      return {
        status: 400,
        message: 'Could not reach this website. Check the URL.',
      }
    }

    await client.domain.update({
      where: { id: domainId },
      data: {
        description: scraped.description,
        knowledgeBase: scraped.knowledgeBase,
        knowledgeBaseUpdatedAt: new Date(),
      },
    })

    return {
      status: 200,
      message: 'Website scanned and knowledge base updated.',
    }
  } catch (error) {
    console.log(error)
    return { status: 500, message: 'Unable to scan website.' }
  }
}

export const onIntegrateDomain = async (domain: string, icon: string) => {
  const user = await getCurrentUser()
  if (!user) return
  try {
    const domainExists = await client.user.findFirst({
      where: {
        id: user.id,
        domains: {
          some: {
            name: domain,
          },
        },
      },
    })

    if (!domainExists) {
      const scraped = await scrapeDomain(domain)

      const newDomain = await client.user.update({
        where: {
          id: user.id,
        },
        data: {
          domains: {
            create: {
              name: domain,
              icon,
              description: scraped?.description || null,
              knowledgeBase: scraped?.knowledgeBase || null,
              knowledgeBaseUpdatedAt: scraped ? new Date() : null,
              chatBot: {
                create: {
                  welcomeMessage: 'Hey there, have  a question? Text us here',
                },
              },
            },
          },
        },
      })

      if (newDomain) {
        return {
          status: 200,
          message: scraped
            ? 'Domain added and website scanned for knowledge base'
            : 'Domain added (could not scan website automatically — try Re-scan later)',
        }
      }
    }
    return {
      status: 400,
      message: 'Domain already exists',
    }
  } catch (error) {
    console.log(error)
  }
}

export const onGetSubscriptionPlan = async () => {
  try {
    const user = await getCurrentUser()
    if (!user) return
    const plan = await client.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        subscription: {
          select: {
            plan: true,
          },
        },
      },
    })
    if (plan) {
      return plan.subscription?.plan
    }
  } catch (error) {
    console.log(error)
  }
}

export const onGetAllAccountDomains = async () => {
  const user = await getCurrentUser()
  if (!user) return
  try {
    const domains = await client.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        id: true,
        domains: {
          select: {
            name: true,
            icon: true,
            id: true,
            customer: {
              select: {
                chatRoom: {
                  select: {
                    id: true,
                    live: true,
                  },
                },
              },
            },
          },
        },
      },
    })
    return { ...domains }
  } catch (error) {
    console.log(error)
  }
}
export const onUpdatePassword = async (password: string) => {
  try {
    const user = await getCurrentUser()

    if (!user) return null
    return {
      status: 400,
      message: 'Password update must be handled through Better Auth account settings.',
    }
  } catch (error) {
    console.log(error)
  }
}

export const onGetCurrentDomainInfo = async (domain: string) => {
  const user = await getCurrentUser()
  if (!user) return
  try {
    const userDomain = await client.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        subscription: {
          select: {
            plan: true,
          },
        },
        domains: {
          where: {
            name: {
              contains: domain,
            },
          },
          select: {
            id: true,
            name: true,
            icon: true,
            userId: true,
            products: true,
            chatBot: {
              select: {
                id: true,
                welcomeMessage: true,
                icon: true,
                background: true,
                textColor: true,
                launcherPosition: true,
                launcherSize: true,
                widgetTheme: true,
                starterPrompts: true,
                showBranding: true,
              },
            },
          },
        },
      },
    })
    if (userDomain) {
      return userDomain
    }
  } catch (error) {
    console.log(error)
  }
}

export const onUpdateDomain = async (id: string, name: string) => {
  try {
    //check if domain with name exists
    const domainExists = await client.domain.findFirst({
      where: {
        name: {
          contains: name,
        },
      },
    })

    if (!domainExists) {
      const domain = await client.domain.update({
        where: {
          id,
        },
        data: {
          name,
        },
      })

      if (domain) {
        return {
          status: 200,
          message: 'Domain updated',
        }
      }

      return {
        status: 400,
        message: 'Oops something went wrong!',
      }
    }

    return {
      status: 400,
      message: 'Domain with this name already exists',
    }
  } catch (error) {
    console.log(error)
  }
}

export const onChatBotImageUpdate = async (id: string, icon: string) => {
  const user = await getCurrentUser()

  if (!user) return

  try {
    const domain = await client.domain.update({
      where: {
        id,
      },
      data: {
        chatBot: {
          update: {
            data: {
              icon,
            },
          },
        },
      },
    })

    if (domain) {
      return {
        status: 200,
        message: 'Domain updated',
      }
    }

    return {
      status: 400,
      message: 'Oops something went wrong!',
    }
  } catch (error) {
    console.log(error)
  }
}

export const onUpdateWelcomeMessage = async (
  message: string,
  domainId: string
) => {
  try {
    const update = await client.domain.update({
      where: {
        id: domainId,
      },
      data: {
        chatBot: {
          update: {
            data: {
              welcomeMessage: message,
            },
          },
        },
      },
    })

    if (update) {
      return { status: 200, message: 'Welcome message updated' }
    }
  } catch (error) {
    console.log(error)
  }
}

export const onDeleteUserDomain = async (id: string) => {
  const user = await getCurrentUser()

  if (!user) return

  try {
    //first verify that domain belongs to user
    const validUser = await client.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        id: true,
      },
    })

    if (validUser) {
      //check that domain belongs to this user and delete
      const deletedDomain = await client.domain.delete({
        where: {
          userId: validUser.id,
          id,
        },
        select: {
          name: true,
        },
      })

      if (deletedDomain) {
        return {
          status: 200,
          message: `${deletedDomain.name} was deleted successfully`,
        }
      }
    }
  } catch (error) {
    console.log(error)
  }
}

export const onCreateHelpDeskQuestion = async (
  id: string,
  question: string,
  answer: string
) => {
  try {
    const helpDeskQuestion = await client.domain.update({
      where: {
        id,
      },
      data: {
        helpdesk: {
          create: {
            question,
            answer,
          },
        },
      },
      include: {
        helpdesk: {
          select: {
            id: true,
            question: true,
            answer: true,
          },
        },
      },
    })

    if (helpDeskQuestion) {
      return {
        status: 200,
        message: 'New help desk question added',
        questions: helpDeskQuestion.helpdesk,
      }
    }

    return {
      status: 400,
      message: 'Oops! something went wrong',
    }
  } catch (error) {
    console.log(error)
  }
}

export const onGetAllHelpDeskQuestions = async (id: string) => {
  try {
    const questions = await client.helpDesk.findMany({
      where: {
        domainId: id,
      },
      select: {
        question: true,
        answer: true,
        id: true,
      },
    })

    return {
      status: 200,
      message: 'New help desk question added',
      questions: questions,
    }
  } catch (error) {
    console.log(error)
  }
}

export const onCreateFilterQuestions = async (id: string, question: string) => {
  try {
    const filterQuestion = await client.domain.update({
      where: {
        id,
      },
      data: {
        filterQuestions: {
          create: {
            question,
          },
        },
      },
      include: {
        filterQuestions: {
          select: {
            id: true,
            question: true,
          },
        },
      },
    })

    if (filterQuestion) {
      return {
        status: 200,
        message: 'Filter question added',
        questions: filterQuestion.filterQuestions,
      }
    }
    return {
      status: 400,
      message: 'Oops! something went wrong',
    }
  } catch (error) {
    console.log(error)
  }
}

export const onGetAllFilterQuestions = async (id: string) => {
  try {
    const questions = await client.filterQuestions.findMany({
      where: {
        domainId: id,
      },
      select: {
        question: true,
        id: true,
      },
      orderBy: {
        question: 'asc',
      },
    })

    return {
      status: 200,
      message: '',
      questions: questions,
    }
  } catch (error) {
    console.log(error)
  }
}

export const onGetPaymentConnected = async () => {
  try {
    const user = await getCurrentUser()
    if (user) {
      const connected = await client.user.findUnique({
        where: {
          id: user.id,
        },
        select: {
          stripeId: true,
        },
      })
      if (connected) {
        return connected.stripeId
      }
    }
  } catch (error) {
    console.log(error)
  }
}

export const onTrainDomainSource = async (domainId: string, formData: FormData) => {
  try {
    const file = formData.get('file') as File | null
    const pastedText = formData.get('text')?.toString() || ''
    const requestedTitle = formData.get('title')?.toString().trim()

    let content = pastedText
    let title = requestedTitle || 'Manual text source'
    let type: 'TEXT' | 'PDF' = 'TEXT'

    if (file && file.size > 0) {
      title = requestedTitle || file.name
      const buffer = Buffer.from(await file.arrayBuffer())

      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        type = 'PDF'
        const { PDFParse } = await import('pdf-parse')
        const parser = new PDFParse({ data: buffer })
        const parsed = await parser.getText()
        await parser.destroy()
        content = parsed.text
      } else {
        content = buffer.toString('utf-8')
      }
    }

    if (!content.trim()) {
      return { status: 400, message: 'Add text or upload a readable PDF/text file.' }
    }

    const chunks = chunkText(content)
    if (!chunks.length) {
      return { status: 400, message: 'Could not create training chunks from this source.' }
    }

    const source = await client.domainSource.create({
      data: {
        domainId,
        title,
        type,
        content,
        summary: chunks[0].slice(0, 500),
        chunks: {
          create: await Promise.all(
            chunks.map(async (chunk, index) => ({
              content: chunk,
              order: index,
              embedding: await embedText(chunk),
            }))
          ),
        },
      },
      include: {
        chunks: true,
      },
    })

    await client.domain.update({
      where: { id: domainId },
      data: {
        knowledgeBaseUpdatedAt: new Date(),
        knowledgeBase: content.slice(0, 12000),
      },
    })

    return {
      status: 200,
      message: `Trained ${source.chunks.length} chunks from ${title}.`,
      source: {
        id: source.id,
        title: source.title,
        type: source.type,
        chunks: source.chunks.length,
        createdAt: source.createdAt,
      },
    }
  } catch (error) {
    console.log(error)
    return { status: 500, message: 'Unable to train this source.' }
  }
}

export const onGetDomainSources = async (domainId: string) => {
  try {
    const sources = await client.domainSource.findMany({
      where: { domainId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        createdAt: true,
        _count: { select: { chunks: true } },
      },
    })

    return { status: 200, sources }
  } catch (error) {
    console.log(error)
    return { status: 500, sources: [] }
  }
}

export const onDeleteDomainSource = async (sourceId: string) => {
  try {
    await client.domainSource.delete({ where: { id: sourceId } })
    return { status: 200, message: 'Source removed.' }
  } catch (error) {
    console.log(error)
    return { status: 500, message: 'Unable to remove source.' }
  }
}

export const onSearchDomainKnowledge = async (domainId: string, query: string, limit = 4) => {
  const queryEmbedding = await embedText(query)
  const chunks = await client.sourceChunk.findMany({
    where: { source: { domainId } },
    select: {
      id: true,
      content: true,
      embedding: true,
      source: { select: { title: true, type: true } },
    },
  })

  return chunks
    .map((chunk) => ({
      ...chunk,
      score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
}

export const onRecordUnansweredQuestion = async (domainId: string, question: string) => {
  try {
    const normalized = question.trim().slice(0, 500)
    if (!normalized) return

    await client.unansweredQuestion.create({
      data: { domainId, question: normalized },
    })
  } catch (error) {
    console.log(error)
  }
}

export const onGetDomainUnansweredQuestions = async (domainId: string) => {
  try {
    const questions = await client.unansweredQuestion.findMany({
      where: { domainId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    })
    return { status: 200, questions }
  } catch (error) {
    console.log(error)
    return { status: 500, questions: [] }
  }
}

export const onResolveUnansweredQuestion = async (id: string, answer: string) => {
  try {
    const updated = await client.unansweredQuestion.update({
      where: { id },
      data: { answer, resolved: true },
    })

    return { status: 200, question: updated }
  } catch (error) {
    console.log(error)
    return { status: 500, message: 'Unable to resolve question.' }
  }
}

export const onGetDomainBotAnalytics = async (domainId: string) => {
  try {
    const [sources, chunks, unanswered, resolved, chats, messages, bookings] =
      await Promise.all([
        client.domainSource.count({ where: { domainId } }),
        client.sourceChunk.count({ where: { source: { domainId } } }),
        client.unansweredQuestion.count({ where: { domainId, resolved: false } }),
        client.unansweredQuestion.count({ where: { domainId, resolved: true } }),
        client.chatRoom.count({ where: { Customer: { domainId } } }),
        client.chatMessage.count({ where: { ChatRoom: { Customer: { domainId } } } }),
        client.bookings.count({ where: { domainId } }),
      ])

    return {
      status: 200,
      analytics: { sources, chunks, unanswered, resolved, chats, messages, bookings },
    }
  } catch (error) {
    console.log(error)
    return {
      status: 500,
      analytics: { sources: 0, chunks: 0, unanswered: 0, resolved: 0, chats: 0, messages: 0, bookings: 0 },
    }
  }
}

export const onUpdateWidgetSettings = async (
  domainId: string,
  settings: {
    launcherPosition: string
    launcherSize: number
    widgetTheme: string
    showBranding: boolean
    starterPrompts: string[]
  }
) => {
  try {
    const updated = await client.chatBot.update({
      where: { domainId },
      data: {
        launcherPosition: settings.launcherPosition,
        launcherSize: settings.launcherSize,
        widgetTheme: settings.widgetTheme,
        showBranding: settings.showBranding,
        starterPrompts: settings.starterPrompts.filter(Boolean).slice(0, 4),
      },
    })

    return { status: 200, message: 'Widget settings saved.', chatBot: updated }
  } catch (error) {
    console.log(error)
    return { status: 500, message: 'Unable to save widget settings.' }
  }
}

export const onTestDomainBot = async (domainId: string, question: string) => {
  try {
    const domain = await client.domain.findUnique({
      where: { id: domainId },
      select: {
        name: true,
        description: true,
        knowledgeBase: true,
        helpdesk: { select: { question: true, answer: true } },
      },
    })

    if (!domain) return { status: 404, message: 'Domain not found.' }

    const chunks = await onSearchDomainKnowledge(domainId, question, 5)
    const relevant = chunks.filter((chunk) => chunk.score > 0.12)
    const citations = relevant.map((chunk, index) => `[${index + 1}] ${chunk.source.title}`)
    const context = relevant
      .map(
        (chunk, index) =>
          `[${index + 1}] ${chunk.source.title} (${chunk.source.type})\n${chunk.content}`
      )
      .join('\n\n')

    const completion = await testBotClient.chat.completions.create({
      model: aiModel,
      messages: [
        {
          role: 'system',
          content: `You are testing the unpublished chatbot for ${domain.name}. Answer using retrieved sources first. If sources are insufficient, say what is missing instead of inventing facts.\n\nBusiness summary: ${domain.description || 'Not provided'}\n\nRetrieved sources:\n${context || 'No relevant trained source found.'}\n\nHelpdesk Q&A:\n${domain.helpdesk.map((item) => `Q: ${item.question}\nA: ${item.answer}`).join('\n\n')}`,
        },
        { role: 'user', content: question },
      ],
    })

    if (!relevant.length && question.trim().endsWith('?')) {
      await onRecordUnansweredQuestion(domainId, question)
    }

    return {
      status: 200,
      answer: completion.choices[0].message.content || 'No answer generated.',
      citations,
      usedSources: relevant.length,
    }
  } catch (error) {
    console.log(error)
    return { status: 500, message: 'Unable to test chatbot.' }
  }
}

export const onCreateNewDomainProduct = async (
  id: string,
  name: string,
  image: string,
  price: string
) => {
  try {
    const product = await client.domain.update({
      where: {
        id,
      },
      data: {
        products: {
          create: {
            name,
            image,
            price: parseInt(price),
          },
        },
      },
    })

    if (product) {
      return {
        status: 200,
        message: 'Product successfully created',
      }
    }
  } catch (error) {
    console.log(error)
  }
}
