import { getUserAppointments } from '@/actions/appointment'
import {
  getUserBalance,
  getUserClients,
  getUserPlanInfo,
  getUserTotalProductPrices,
  getUserTransactions,
} from '@/actions/dashboard'
import DashboardCard from '@/components/dashboard/cards'
import { PlanUsage } from '@/components/dashboard/plan-usage'
import InfoBar from '@/components/infobar'
import {
  CalendarClock,
  DollarSign,
  ReceiptText,
  TrendingUp,
  Users,
} from 'lucide-react'
import React from 'react'

const Page = async () => {
  const clients = await getUserClients()
  const sales = await getUserBalance()
  const bookings = await getUserAppointments()
  const plan = await getUserPlanInfo()
  const transactions = await getUserTransactions()
  const products = await getUserTotalProductPrices()

  const pipeline = (products || 0) * (clients || 0)

  return (
    <>
      <InfoBar />
      <div className="scrollbar-pretty h-0 w-full flex-1 overflow-y-auto pr-1">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardCard
            value={clients || 0}
            title="Potential clients"
            icon={<Users className="h-5 w-5" />}
          />
          <DashboardCard
            value={pipeline}
            sales
            title="Pipeline value"
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <DashboardCard
            value={bookings || 0}
            title="Appointments"
            icon={<CalendarClock className="h-5 w-5" />}
          />
          <DashboardCard
            value={sales || 0}
            sales
            title="Total sales"
            icon={<DollarSign className="h-5 w-5" />}
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-5">
          <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">Plan usage</h2>
                <p className="text-sm text-muted-foreground">
                  Track credits, domains and contacts.
                </p>
              </div>
              <span className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand">
                {plan?.plan ?? 'STANDARD'}
              </span>
            </div>
            <PlanUsage
              plan={plan?.plan!}
              credits={plan?.credits || 0}
              domains={plan?.domains || 0}
              clients={clients || 0}
            />
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient text-white shadow">
                  <ReceiptText className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Recent transactions</h2>
                  <p className="text-sm text-muted-foreground">
                    Latest Stripe payouts on this account.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="text-xs font-semibold text-brand hover:underline"
              >
                See more
              </button>
            </div>

            <div className="mt-5 divide-y divide-border">
              {transactions && transactions.data.length > 0 ? (
                transactions.data.slice(0, 6).map((transaction) => (
                  <div
                    className="flex items-center justify-between py-4"
                    key={transaction.id}
                  >
                    <div>
                      <p className="text-sm font-semibold">
                        {transaction.calculated_statement_descriptor ||
                          'Stripe charge'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.created * 1000).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-base font-semibold">
                      ${(transaction.amount / 100).toFixed(2)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
                  <ReceiptText className="h-6 w-6 text-muted-foreground/50" />
                  <p>No transactions yet — connect Stripe to start.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Page
