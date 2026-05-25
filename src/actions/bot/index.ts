'use server'

import { client } from '@/lib/prisma'
import { extractEmailsFromString, extractURLfromString } from '@/lib/utils'
import { onRealTimeChat } from '../conversation'
import { onMailer } from '../mailer'
import { onRecordUnansweredQuestion, onSearchDomainKnowledge } from '../settings'
import OpenAi from 'openai'

const openRouterKey = process.env.OPEN_ROUTER_KEY || process.env.OPENROUTER_API_KEY
const aiModel = process.env.OPEN_ROUTER_MODEL || 'openai/gpt-4o-mini'

const openai = new OpenAi({
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

export const onStoreConversations = async (
  id: string,
  message: string,
  role: 'assistant' | 'user'
) => {
  await client.chatRoom.update({
    where: {
      id,
    },
    data: {
      message: {
        create: {
          message,
          role,
        },
      },
    },
  })
}

export const onGetCurrentChatBot = async (id: string) => {
  try {
    const chatbot = await client.domain.findUnique({
      where: {
        id,
      },
      select: {
        helpdesk: true,
        name: true,
        chatBot: {
          select: {
            id: true,
            welcomeMessage: true,
            icon: true,
            textColor: true,
            background: true,
            launcherPosition: true,
            launcherSize: true,
            widgetTheme: true,
            starterPrompts: true,
            showBranding: true,
            helpdesk: true,
          },
        },
      },
    })

    if (chatbot) {
      return chatbot
    }
  } catch (error) {
    console.log(error)
  }
}

let customerEmail: string | undefined

const buildRagContext = async (domainId: string, message: string) => {
  const chunks = await onSearchDomainKnowledge(domainId, message, 4)
  const relevant = chunks.filter((chunk) => chunk.score > 0.12)

  return {
    context: relevant
      .map(
        (chunk, index) =>
          `[${index + 1}] ${chunk.source.title} (${chunk.source.type})\n${chunk.content}`
      )
      .join('\n\n'),
    citations: relevant.map((chunk, index) => `[${index + 1}] ${chunk.source.title}`),
    hasRelevantSources: relevant.length > 0,
  }
}

const withCitations = (content: string | null | undefined, citations: string[]) => {
  const safeContent = content || ''
  if (!citations.length) return safeContent
  return `${safeContent}\n\nSources: ${citations.join(', ')}`
}

export const onAiChatBotAssistant = async (
  id: string,
  chat: { role: 'assistant' | 'user'; content: string }[],
  author: 'user',
  message: string
) => {
  try {
    const chatBotDomain = await client.domain.findUnique({
      where: {
        id,
      },
      select: {
        name: true,
        description: true,
        knowledgeBase: true,
        filterQuestions: {
          where: {
            answered: null,
          },
          select: {
            question: true,
          },
        },
      },
    })
    if (chatBotDomain) {
      const rag = await buildRagContext(id, message)
      const extractedEmail = extractEmailsFromString(message)
      if (extractedEmail) {
        customerEmail = extractedEmail[0]
      }

      if (customerEmail) {
        const checkCustomer = await client.domain.findUnique({
          where: {
            id,
          },
          select: {
            User: {
              select: {
                email: true,
              },
            },
            name: true,
            customer: {
              where: {
                email: {
                  startsWith: customerEmail,
                },
              },
              select: {
                id: true,
                email: true,
                questions: true,
                chatRoom: {
                  select: {
                    id: true,
                    live: true,
                    mailed: true,
                  },
                },
              },
            },
          },
        })
        if (checkCustomer && !checkCustomer.customer.length) {
          const newCustomer = await client.domain.update({
            where: {
              id,
            },
            data: {
              customer: {
                create: {
                  email: customerEmail,
                  questions: {
                    create: chatBotDomain.filterQuestions,
                  },
                  chatRoom: {
                    create: {},
                  },
                },
              },
            },
          })
          if (newCustomer) {
            console.log('new customer made')
            const response = {
              role: 'assistant',
              content: `Welcome aboard ${
                customerEmail.split('@')[0]
              }! I'm glad to connect with you. Is there anything you need help with?`,
            }
            return { response }
          }
        }
        if (checkCustomer && checkCustomer.customer[0].chatRoom[0].live) {
          await onStoreConversations(
            checkCustomer?.customer[0].chatRoom[0].id!,
            message,
            author
          )
          
          onRealTimeChat(
            checkCustomer.customer[0].chatRoom[0].id,
            message,
            'user',
            author
          )

          if (!checkCustomer.customer[0].chatRoom[0].mailed) {
            if (checkCustomer.User?.email) onMailer(checkCustomer.User.email)

            //update mail status to prevent spamming
            const mailed = await client.chatRoom.update({
              where: {
                id: checkCustomer.customer[0].chatRoom[0].id,
              },
              data: {
                mailed: true,
              },
            })

            if (mailed) {
              return {
                live: true,
                chatRoom: checkCustomer.customer[0].chatRoom[0].id,
              }
            }
          }
          return {
            live: true,
            chatRoom: checkCustomer.customer[0].chatRoom[0].id,
          }
        }

        await onStoreConversations(
          checkCustomer?.customer[0].chatRoom[0].id!,
          message,
          author
        )

        const chatCompletion = await openai.chat.completions.create({
          messages: [
            {
              role: 'assistant',
              content: `
              You are the AI sales assistant for ${chatBotDomain.name}.
              ${chatBotDomain.description ? `Business summary: ${chatBotDomain.description}` : ''}
              ${rag.context ? `Use these retrieved source chunks as the highest priority factual context. Cite them in your answer when useful.\n\nRETRIEVED SOURCES:\n${rag.context}` : chatBotDomain.knowledgeBase ? `Use the following knowledge base from the company website to answer factual questions accurately. Do not invent information that is not present here.\n\nKNOWLEDGE BASE:\n${chatBotDomain.knowledgeBase}` : ''}

              You will get an array of questions that you must ask the customer. 
              
              Progress the conversation using those questions. 
              
              Whenever you ask a question from the array i need you to add a keyword at the end of the question (complete) this keyword is extremely important. 
              
              Do not forget it.

              only add this keyword when your asking a question from the array of questions. No other question satisfies this condition

              Always maintain character and stay respectfull.

              The array of questions : [${chatBotDomain.filterQuestions
                .map((questions) => questions.question)
                .join(', ')}]

              if the customer says something out of context or inapporpriate. Simply say this is beyond you and you will get a real user to continue the conversation. And add a keyword (realtime) at the end.

              if the customer agrees to book an appointment send them this link ${(process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || 'http://localhost:3000').replace(/\/$/, '')}/portal/${id}/appointment/${
                checkCustomer?.customer[0].id
              }

              if the customer wants to buy a product redirect them to the payment page ${(process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || 'http://localhost:3000').replace(/\/$/, '')}/portal/${id}/payment/${
                checkCustomer?.customer[0].id
              }
          `,
            },
            ...chat,
            {
              role: 'user',
              content: message,
            },
          ],
          model: aiModel,
        })

        if (chatCompletion.choices[0].message.content?.includes('(realtime)')) {
          const realtime = await client.chatRoom.update({
            where: {
              id: checkCustomer?.customer[0].chatRoom[0].id,
            },
            data: {
              live: true,
            },
          })

          if (realtime) {
            const response = {
              role: 'assistant',
              content: withCitations(
                chatCompletion.choices[0].message.content.replace('(realtime)', ''),
                rag.citations
              ),
            }

            await onStoreConversations(
              checkCustomer?.customer[0].chatRoom[0].id!,
              response.content,
              'assistant'
            )

            return { response }
          }
        }
        if (chat[chat.length - 1].content.includes('(complete)')) {
          const firstUnansweredQuestion =
            await client.customerResponses.findFirst({
              where: {
                customerId: checkCustomer?.customer[0].id,
                answered: null,
              },
              select: {
                id: true,
              },
              orderBy: {
                question: 'asc',
              },
            })
          if (firstUnansweredQuestion) {
            await client.customerResponses.update({
              where: {
                id: firstUnansweredQuestion.id,
              },
              data: {
                answered: message,
              },
            })
          }
        }

        if (chatCompletion) {
          const generatedLink = extractURLfromString(
            chatCompletion.choices[0].message.content as string
          )

          if (generatedLink) {
            const link = generatedLink[0]
            const response = {
              role: 'assistant',
              content: `Great! you can follow the link to proceed`,
              link: link.slice(0, -1),
            }

            await onStoreConversations(
              checkCustomer?.customer[0].chatRoom[0].id!,
              `${response.content} ${response.link}`,
              'assistant'
            )

            return { response }
          }

          const response = {
            role: 'assistant',
            content: withCitations(chatCompletion.choices[0].message.content, rag.citations),
          }

          if (!rag.hasRelevantSources && message.trim().endsWith('?')) {
            await onRecordUnansweredQuestion(id, message)
          }

          await onStoreConversations(
            checkCustomer?.customer[0].chatRoom[0].id!,
            `${response.content}`,
            'assistant'
          )

          return { response }
        }
      }
      console.log('No customer')
      const chatCompletion = await openai.chat.completions.create({
        messages: [
          {
            role: 'assistant',
            content: `
            You are the AI sales assistant for ${chatBotDomain.name}.
            ${chatBotDomain.description ? `Business summary: ${chatBotDomain.description}` : ''}
            ${rag.context ? `Use these retrieved source chunks as the highest priority factual context. Cite them in your answer when useful.\n\nRETRIEVED SOURCES:\n${rag.context}` : chatBotDomain.knowledgeBase ? `Use the following knowledge base from the company website to answer factual questions accurately. Do not invent information that is not present here.\n\nKNOWLEDGE BASE:\n${chatBotDomain.knowledgeBase}` : ''}

            Your goal is to have a natural, human-like conversation with the customer in order to understand their needs, provide relevant information based on the knowledge base above, and ultimately guide them towards making a purchase or redirect them to a link if they havent provided all relevant information.
            Right now you are talking to a customer for the first time. Start by giving them a warm welcome on behalf of ${chatBotDomain.name} and make them feel welcomed.

            Your next task is lead the conversation naturally to get the customers email address. Be respectful and never break character

          `,
          },
          ...chat,
          {
            role: 'user',
            content: message,
          },
        ],
        model: aiModel,
      })

      if (chatCompletion) {
        const response = {
          role: 'assistant',
          content: withCitations(chatCompletion.choices[0].message.content, rag.citations),
        }

        if (!rag.hasRelevantSources && message.trim().endsWith('?')) {
          await onRecordUnansweredQuestion(id, message)
        }

        return { response }
      }
    }
  } catch (error) {
    console.log(error)
  }
}
