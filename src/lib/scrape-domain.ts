const STRIP_TAGS = [
  'script',
  'style',
  'noscript',
  'iframe',
  'svg',
  'header',
  'footer',
  'nav',
]

const cleanText = (text: string) =>
  text
    .replace(/\s+/g, ' ')
    .replace(/\u00a0/g, ' ')
    .trim()

const extractTagContent = (html: string, tag: string) => {
  const match = html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'))
  return match ? cleanText(match[1].replace(/<[^>]+>/g, ' ')) : ''
}

const extractMeta = (html: string, name: string) => {
  const re = new RegExp(
    `<meta[^>]+(?:name|property)=["']${name}["'][^>]*content=["']([^"']+)["']`,
    'i'
  )
  const m = html.match(re)
  return m ? cleanText(m[1]) : ''
}

const stripHtml = (html: string) => {
  let cleaned = html
  for (const tag of STRIP_TAGS) {
    cleaned = cleaned.replace(
      new RegExp(`<${tag}[\\s\\S]*?</${tag}>`, 'gi'),
      ' '
    )
  }
  cleaned = cleaned.replace(/<[^>]+>/g, ' ')
  return cleanText(cleaned)
}

const normaliseUrl = (input: string) => {
  let url = input.trim()
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`
  }
  return url
}

export type ScrapedDomain = {
  url: string
  title: string
  description: string
  knowledgeBase: string
}

export const scrapeDomain = async (
  domain: string
): Promise<ScrapedDomain | null> => {
  const url = normaliseUrl(domain)

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; CorinnaBot/1.0; +https://corinna.ai/bot)',
      },
      signal: controller.signal,
      redirect: 'follow',
    })

    clearTimeout(timeout)

    if (!response.ok) return null

    const html = await response.text()

    const title =
      extractTagContent(html, 'title') ||
      extractMeta(html, 'og:title') ||
      domain

    const description =
      extractMeta(html, 'description') ||
      extractMeta(html, 'og:description') ||
      ''

    const body = stripHtml(html).slice(0, 6000)

    const knowledgeBase = [
      title ? `Site title: ${title}` : null,
      description ? `Site description: ${description}` : null,
      body ? `Content excerpt:\n${body}` : null,
    ]
      .filter(Boolean)
      .join('\n\n')

    return {
      url,
      title,
      description,
      knowledgeBase,
    }
  } catch (error) {
    console.log('scrapeDomain error', error)
    return null
  }
}
