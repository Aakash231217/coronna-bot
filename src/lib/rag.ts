import OpenAi from 'openai'

const openRouterKey = process.env.OPEN_ROUTER_KEY || process.env.OPENROUTER_API_KEY
const appUrl =
  process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || 'http://localhost:3000'

const embeddingClient = new OpenAi({
  apiKey: openRouterKey || process.env.OPEN_AI_KEY || 'missing-key',
  baseURL: openRouterKey ? 'https://openrouter.ai/api/v1' : undefined,
  defaultHeaders: openRouterKey
    ? {
        'HTTP-Referer': appUrl,
        'X-Title': 'Corinna AI',
      }
    : undefined,
})

const EMBEDDING_DIMENSIONS = 256

export const cleanSourceText = (text: string) =>
  text
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()

export const chunkText = (text: string, chunkSize = 1200, overlap = 160) => {
  const clean = cleanSourceText(text)
  const chunks: string[] = []
  let index = 0

  while (index < clean.length) {
    const next = clean.slice(index, index + chunkSize)
    const boundary = next.lastIndexOf('\n\n') > 400 ? next.lastIndexOf('\n\n') : next.length
    const chunk = next.slice(0, boundary).trim()
    if (chunk) chunks.push(chunk)
    index += Math.max(boundary - overlap, 1)
  }

  return chunks.slice(0, 80)
}

const hashToken = (token: string) => {
  let hash = 2166136261
  for (let index = 0; index < token.length; index += 1) {
    hash ^= token.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return Math.abs(hash)
}

const localEmbedding = (text: string) => {
  const vector = Array.from({ length: EMBEDDING_DIMENSIONS }, () => 0)
  const tokens = text.toLowerCase().match(/[a-z0-9]+/g) || []

  for (const token of tokens) {
    const position = hashToken(token) % EMBEDDING_DIMENSIONS
    vector[position] += 1
  }

  const magnitude = Math.sqrt(vector.reduce((total, value) => total + value * value, 0)) || 1
  return vector.map((value) => value / magnitude)
}

export const embedText = async (text: string) => {
  const model =
    process.env.OPEN_ROUTER_EMBEDDING_MODEL ||
    process.env.EMBEDDING_MODEL ||
    'openai/text-embedding-3-small'

  if (!openRouterKey && !process.env.OPEN_AI_KEY) return localEmbedding(text)

  try {
    const response = await embeddingClient.embeddings.create({
      model,
      input: text.slice(0, 7000),
    })

    return response.data[0].embedding
  } catch (error) {
    console.log('Embedding provider failed, using local fallback embedding.', error)
    return localEmbedding(text)
  }
}

export const cosineSimilarity = (left: number[], right: number[]) => {
  const length = Math.min(left.length, right.length)
  if (!length) return 0

  let dot = 0
  let leftMagnitude = 0
  let rightMagnitude = 0

  for (let index = 0; index < length; index += 1) {
    dot += left[index] * right[index]
    leftMagnitude += left[index] * left[index]
    rightMagnitude += right[index] * right[index]
  }

  if (!leftMagnitude || !rightMagnitude) return 0
  return dot / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude))
}
