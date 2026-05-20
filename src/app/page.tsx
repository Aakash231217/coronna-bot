import { onGetBlogPosts } from '@/actions/landing'
import NavBar from '@/components/navbar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { pricingCards } from '@/constants/landing-page'
import clsx from 'clsx'
import {
  ArrowRight,
  BarChart3,
  Bot,
  CalendarClock,
  Check,
  Globe2,
  MessageCircle,
  Mic2,
  ShieldCheck,
  Sparkles,
  Wand2,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import parse from 'html-react-parser'
import { getMonthName } from '@/lib/utils'

const features = [
  {
    icon: <Wand2 className="h-5 w-5" />,
    title: 'Auto knowledge base',
    description:
      'Paste a domain and Corinna crawls the homepage, pricing, FAQs and more — your bot is ready in seconds.',
  },
  {
    icon: <Mic2 className="h-5 w-5" />,
    title: 'Voice replies',
    description:
      'Replies stream as natural speech with ElevenLabs and gracefully fall back to the browser engine.',
  },
  {
    icon: <CalendarClock className="h-5 w-5" />,
    title: 'Books & qualifies leads',
    description:
      'Captures emails, qualifies prospects, and routes them to appointment or payment flows automatically.',
  },
  {
    icon: <MessageCircle className="h-5 w-5" />,
    title: 'Live handoff',
    description:
      'Switch any chat to real-time mode and your team takes over without breaking the customer experience.',
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    title: 'Sales-ready dashboard',
    description:
      'Track potential clients, pipeline value, appointments and Stripe revenue in one beautiful view.',
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: 'Secure by default',
    description:
      'Better Auth sessions, Supabase Postgres, scoped API routes. Built so customer data stays where it belongs.',
  },
]

const stats = [
  { value: '15k+', label: 'Messages handled' },
  { value: '4.9/5', label: 'Customer rating' },
  { value: '92%', label: 'Lead capture rate' },
  { value: '< 60s', label: 'Time to deploy' },
]

export default async function Home() {
  const posts:
    | {
        id: string
        title: string
        image: string
        content: string
        createdAt: Date
      }[]
    | undefined = await onGetBlogPosts()

  return (
    <main className="grid-bg min-h-screen pb-24">
      <div className="px-4 pt-4">
        <NavBar />
      </div>

      {/* HERO */}
      <section className="relative mx-auto mt-16 w-[min(96%,1180px)]">
        <div className="absolute inset-x-0 -top-10 -z-10 mx-auto h-72 max-w-3xl rounded-full bg-brand-gradient opacity-25 blur-3xl" />
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-brand" />
            AI sales assistant for modern teams
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-6xl text-balance">
            Turn every website visitor into a{' '}
            <span className="text-brand-gradient">qualified conversation</span>
          </h1>
          <p className="mt-6 max-w-2xl text-balance text-base text-muted-foreground md:text-lg">
            Corinna AI scans your business, talks to your customers in your
            voice, books appointments, captures leads and routes payments —
            from one tiny embed script.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_-10px_rgba(91,91,214,0.6)] transition hover:translate-y-[-1px]"
            >
              Start free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/70 px-5 py-3 text-sm font-medium text-foreground backdrop-blur hover:bg-card"
            >
              See how it works
            </Link>
          </div>

          <div className="mt-12 grid w-full max-w-3xl grid-cols-2 gap-3 md:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="glass-card rounded-2xl px-4 py-4 text-center"
              >
                <div className="text-2xl font-bold tracking-tight">
                  {s.value}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product preview */}
        <div className="relative mx-auto mt-16 w-full max-w-5xl">
          <div className="absolute inset-x-10 -bottom-6 h-20 rounded-full bg-brand opacity-20 blur-3xl" />
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[0_30px_80px_-30px_rgba(91,91,214,0.35)]">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
              <div className="ml-3 inline-flex items-center gap-2 rounded-md bg-muted px-3 py-1 text-xs text-muted-foreground">
                <Globe2 className="h-3 w-3" />
                app.corinna.ai/dashboard
              </div>
            </div>
            <div className="relative aspect-[16/9] w-full bg-gradient-to-br from-secondary to-card">
              <Image
                src="/images/app-ui.png"
                alt="Dashboard preview"
                fill
                className="object-cover object-top"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="mx-auto mt-28 w-[min(96%,1180px)]"
      >
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-brand">
            Built for revenue teams
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl text-balance">
            Everything you need to convert chats into customers
          </h2>
          <p className="mt-3 text-muted-foreground">
            From the moment someone lands on your site, Corinna is qualifying,
            answering, booking and capturing — so your team can focus on the
            ones ready to buy.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition hover:border-brand/60 hover:shadow-[0_18px_40px_-20px_rgba(91,91,214,0.45)]"
            >
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand opacity-0 blur-3xl transition group-hover:opacity-30" />
              <div className="relative">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-md">
                  {f.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {f.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section
        id="pricing"
        className="mx-auto mt-28 w-[min(96%,1180px)]"
      >
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-brand">
            Pricing
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl text-balance">
            Choose what fits you right
          </h2>
          <p className="mt-3 text-muted-foreground">
            Start free, scale when you're ready. No hidden fees.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {pricingCards.map((card) => {
            const featured = card.title === 'Ultimate'
            return (
              <div
                key={card.title}
                className={clsx(
                  'relative flex flex-col rounded-3xl border bg-card p-6 transition',
                  featured
                    ? 'border-brand ring-1 ring-brand/40 shadow-[0_20px_45px_-20px_rgba(91,91,214,0.5)]'
                    : 'border-border hover:border-brand/40'
                )}
              >
                {featured && (
                  <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-brand-gradient px-3 py-1 text-xs font-semibold text-white shadow">
                    <Sparkles className="h-3 w-3" />
                    Most popular
                  </span>
                )}
                <h3
                  className={clsx(
                    'text-lg font-semibold',
                    featured && 'text-brand-gradient'
                  )}
                >
                  {card.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {card.description}
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{card.price}</span>
                  <span className="text-sm text-muted-foreground">
                    / month
                  </span>
                </div>
                <ul className="mt-6 flex flex-col gap-3 text-sm">
                  {card.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2"
                    >
                      <Check className="mt-0.5 h-4 w-4 text-brand" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/auth/sign-up?plan=${card.title}`}
                  className={clsx(
                    'mt-8 inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition',
                    featured
                      ? 'bg-brand-gradient text-white shadow-[0_12px_28px_-10px_rgba(91,91,214,0.6)] hover:translate-y-[-1px]'
                      : 'border border-border bg-secondary text-foreground hover:bg-secondary/80'
                  )}
                >
                  Get started
                </Link>
              </div>
            )
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto mt-28 w-[min(96%,1180px)]">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="text-sm font-semibold uppercase tracking-widest text-brand">
              How it works
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl text-balance">
              From paste to production in three steps
            </h2>
            <div className="mt-10 flex flex-col gap-6">
              {[
                {
                  step: '01',
                  title: 'Add your domain',
                  text: 'Drop your URL into Corinna. We crawl the site and build a knowledge base your AI can answer from.',
                },
                {
                  step: '02',
                  title: 'Customise the bot',
                  text: 'Set welcome message, brand colours, helpdesk answers and qualification questions in minutes.',
                },
                {
                  step: '03',
                  title: 'Embed and sell',
                  text: 'Paste one script tag on your site. Replies stream with voice and qualified leads land in your inbox.',
                },
              ].map((s) => (
                <div
                  key={s.step}
                  className="flex gap-4"
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-gradient text-sm font-bold text-white shadow">
                    {s.step}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{s.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {s.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-brand-gradient opacity-20 blur-3xl" />
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[0_25px_60px_-25px_rgba(91,91,214,0.45)]">
              <div className="flex items-center gap-3 border-b border-border px-5 py-4">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient text-white">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Corinna AI</p>
                  <p className="text-xs text-muted-foreground">
                    Live on autunes.com
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 px-5 py-6">
                <div className="self-start rounded-2xl rounded-bl-md bg-secondary px-4 py-3 text-sm shadow-sm">
                  Hey there 👋 looking for help choosing the right plan?
                </div>
                <div className="self-end rounded-2xl rounded-br-md bg-brand-gradient px-4 py-3 text-sm text-white shadow">
                  Yes, I need 2 user seats and Vastu-aware booking.
                </div>
                <div className="self-start rounded-2xl rounded-bl-md bg-secondary px-4 py-3 text-sm shadow-sm">
                  Got it. The Pro plan covers 2 seats and integrates with our
                  booking flow. Want me to open the checkout?
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BLOGS */}
      {posts && posts.length > 0 && (
        <section
          id="news"
          className="mx-auto mt-28 w-[min(96%,1180px)]"
        >
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="text-sm font-semibold uppercase tracking-widest text-brand">
                News Room
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl text-balance">
                Latest from the team
              </h2>
            </div>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {posts.map((post) => (
              <Link
                href={`/blogs/${post.id}`}
                key={post.id}
                className="group"
              >
                <Card className="flex h-full flex-col overflow-hidden rounded-2xl border-border transition hover:border-brand/50 hover:shadow-[0_18px_40px_-20px_rgba(91,91,214,0.4)]">
                  <div className="relative aspect-video w-full overflow-hidden">
                    <Image
                      src={`${process.env.CLOUDWAYS_UPLOADS_URL}${post.image}`}
                      alt="post featured image"
                      fill
                      className="object-cover transition group-hover:scale-105"
                    />
                  </div>
                  <CardHeader>
                    <CardDescription>
                      {getMonthName(post.createdAt.getMonth())}{' '}
                      {post.createdAt.getDate()}, {post.createdAt.getFullYear()}
                    </CardDescription>
                    <CardTitle className="text-lg">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-sm text-muted-foreground">
                    {parse(post.content.slice(4, 140))}...
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto mt-28 w-[min(96%,1180px)]">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-10 text-center">
          <div className="absolute inset-x-0 -top-20 -z-10 mx-auto h-72 w-3/4 rounded-full bg-brand-gradient opacity-30 blur-3xl" />
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl text-balance">
            Ready to make every page sell?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Spin up your AI sales rep in under a minute. No credit card. No
            heavy setup.
          </p>
          <Link
            href="/auth/sign-up"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_-10px_rgba(91,91,214,0.6)] transition hover:translate-y-[-1px]"
          >
            Start free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  )
}
