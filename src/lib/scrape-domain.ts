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

const PRIORITY_PATH_KEYWORDS = [
  'about',
  'pricing',
  'plans',
  'services',
  'products',
  'features',
  'solutions',
  'faq',
  'help',
  'support',
  'contact',
  'shop',
  'menu',
  'docs',
  'how-it-works',
  'team',
  'company',
]

const MAX_PAGES = 6
const PAGE_FETCH_TIMEOUT_MS = 8000
const PER_PAGE_BODY_CHARS = 1800
const TOTAL_BODY_CHARS = 9000

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

const extractInternalLinks = (html: string, baseUrl: URL) => {
  const matches = Array.from(html.matchAll(/<a[^>]+href=["'']([^"'']+)["''][^>]*>/gi))
  const links: { href: string; score: number }[] = []
  const seen = new Set<string>()

  for (const match of matches) {
    const rawHref = match[1].trim()
    if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('mailto:')) {
      continue
    }

    let absolute: URL
    try {
      absolute = new URL(rawHref, baseUrl)
    } catch {
      continue
    }

    if (absolute.host !== baseUrl.host) continue
    if (!/^https?:$/.test(absolute.protocol)) continue

    const normalised = `${absolute.origin}${absolute.pathname}`.replace(/\/$/, '')
    if (!normalised || normalised === `${baseUrl.origin}${baseUrl.pathname}`.replace(/\/$/, '')) {
      continue
    }
    if (seen.has(normalised)) continue
    seen.add(normalised)

    const lower = absolute.pathname.toLowerCase()
    const score = PRIORITY_PATH_KEYWORDS.reduce(
      (acc, kw) => (lower.includes(kw) ? acc + 1 : acc),
      0
    )

    links.push({ href: normalised, score })
  }

  return links
    .sort((a, b) => b.score - a.score)
    .map((l) => l.href)
}

type FetchedPage = {
  url: string
  title: string
  description: string
  body: string
}

const fetchPage = async (url: string): Promise<FetchedPage | null> => {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), PAGE_FETCH_TIMEOUT_MS)

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
      extractTagContent(html, 'title') || extractMeta(html, 'og:title')
    const description =
      extractMeta(html, 'description') || extractMeta(html, 'og:description')
    const body = stripHtml(html).slice(0, PER_PAGE_BODY_CHARS)

    return { url, title, description, body }
  } catch (error) {
    return null
  }
}

export type ScrapedDomain = {
  url: string
  title: string
  description: string
  knowledgeBase: string
  pagesScraped: string[]
}

export const scrapeDomain = async (
  domain: string
): Promise<ScrapedDomain | null> => {
  const homepageUrl = normaliseUrl(domain)

  try {
    const baseResponse = await fetch(homepageUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; CorinnaBot/1.0; +https://corinna.ai/bot)',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout
        ? AbortSignal.timeout(PAGE_FETCH_TIMEOUT_MS)
        : undefined,
    })

    if (!baseResponse.ok) return null

    const homepageHtml = await baseResponse.text()
    const baseUrlObj = new URL(baseResponse.url || homepageUrl)

    const homepageTitle =
      extractTagContent(homepageHtml, 'title') ||
      extractMeta(homepageHtml, 'og:title') ||
      domain
    const homepageDescription =
      extractMeta(homepageHtml, 'description') ||
      extractMeta(homepageHtml, 'og:description') ||
      ''
    const homepageBody = stripHtml(homepageHtml).slice(0, PER_PAGE_BODY_CHARS)

    const candidateLinks = extractInternalLinks(homepageHtml, baseUrlObj).slice(
      0,
      MAX_PAGES - 1
    )

    const subPageResults = await Promise.all(
      candidateLinks.map((link) => fetchPage(link))
    )

    const pages: FetchedPage[] = [
      {
        url: baseResponse.url || homepageUrl,
        title: homepageTitle,
        description: homepageDescription,
        body: homepageBody,
      },
      ...subPageResults.filter((p): p is FetchedPage => !!p),
    ]

    const sections: string[] = []
    let totalChars = 0
    for (const page of pages) {
      const header = `### Page: ${page.url}${page.title ? `\nTitle: ${page.title}` : ''}${page.description ? `\nDescription: ${page.description}` : ''}`
      const content = `${header}\n${page.body}`.trim()
      if (totalChars + content.length > TOTAL_BODY_CHARS) {
        sections.push(content.slice(0, TOTAL_BODY_CHARS - totalChars))
        break
      }
      sections.push(content)
      totalChars += content.length
    }

    const knowledgeBase = [
      `Site title: ${homepageTitle}`,
      homepageDescription ? `Site description: ${homepageDescription}` : null,
      `Pages scanned (${pages.length}):`,
      ...sections,
    ]
      .filter(Boolean)
      .join('\n\n')

    return {
      url: homepageUrl,
      title: homepageTitle,
      description: homepageDescription,
      knowledgeBase,
      pagesScraped: pages.map((p) => p.url),
    }
  } catch (error) {
    console.log('scrapeDomain error', error)
    return null
  }
}
