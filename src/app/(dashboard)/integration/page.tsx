import InfoBar from '@/components/infobar'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { BadgeCheck, Globe2, MessageSquare, Sparkles } from 'lucide-react'

const IntegrationsPage = async () => {
  return (
    <>
      <InfoBar />
      <div className="scrollbar-pretty h-0 w-full flex-1 overflow-y-auto pr-2">
        <div className="rounded-[28px] border border-border bg-[linear-gradient(145deg,#ffffff,#f8fafc)] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="mb-8 flex flex-col gap-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
              <Sparkles className="h-4 w-4" />
              Local friendly integrations
            </div>
            <h1 className="text-3xl font-bold text-gravel">No Stripe setup needed</h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Payment integrations are hidden for this build. Focus on chatbot embeds, lead capture and support workflows without US-only payment onboarding.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              [Globe2, 'Website widget', 'Embed your chatbot on any domain with the generated script.'],
              [MessageSquare, 'Live conversations', 'Follow up with visitors from the conversations dashboard.'],
            ].map(([Icon, title, copy]) => (
              <Card key={title as string} className="rounded-2xl">
                <CardContent className="p-5">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient text-white shadow">
                      <Icon className="h-5 w-5" />
                    </div>
                    <BadgeCheck className="h-5 w-5 text-brand" />
                  </div>
                  <CardTitle className="text-base">{title as string}</CardTitle>
                  <CardDescription className="mt-2 leading-6">{copy as string}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default IntegrationsPage
