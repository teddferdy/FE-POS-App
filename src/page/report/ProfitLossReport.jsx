import React, { useState } from "react"
import { useQuery } from "react-query"
import { useTranslation } from "react-i18next"
import { getProfitLoss } from "@/services/report"
import { Card, CardContent } from "@/components/ui/card"
import PageHeader from "@/components/ui/PageHeader"
import { Loading } from "@/components/ui/loading"
import { format } from "date-fns"
import { DatePicker } from "@/components/ui/date-picker"

const ProfitLossReport = () => {
  const { t } = useTranslation()
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())

  const { data, isLoading } = useQuery(
    ["profit-loss", startDate, endDate],
    () => getProfitLoss({ startDate: format(startDate, "yyyy-MM-dd"), endDate: format(endDate, "yyyy-MM-dd") }),
    { staleTime: 30000 }
  )

  const pl = data?.data || {}

  const summaryCards = [
    { label: "Total Revenue", value: pl.totalRevenue, color: "text-green-600" },
    { label: "Net Revenue", value: pl.netRevenue, color: "text-blue-600" },
    { label: "Total HPP", value: pl.totalHpp, color: "text-orange-600" },
    { label: "Gross Profit", value: pl.grossProfit, color: "text-purple-600" },
    { label: "Margin %", value: pl.marginPersen != null ? `${pl.marginPersen}%` : null, color: "text-primary" },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { i18nKey: "breadcrumb.home" },
          { label: "Laporan Laba Rugi" }
        ]}
        title="Laporan Laba Rugi"
        description="Ringkasan pendapatan, HPP, dan laba kotor">
        <div className="flex items-center gap-2">
          <DatePicker date={startDate} setDate={setStartDate} />
          <DatePicker date={endDate} setDate={setEndDate} />
        </div>
      </PageHeader>

      {isLoading ? (
        <Loading fullscreen size="lg" label="Memuat data laba rugi..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {summaryCards.map(card => (
            <Card key={card.label}>
              <CardContent className="p-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{card.label}</p>
                <p className={`text-xl font-bold ${card.color}`}>
                  {card.value != null
                    ? typeof card.value === "number"
                      ? `Rp ${Number(card.value).toLocaleString()}`
                      : card.value
                    : "-"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProfitLossReport
