import React, { useState } from "react"
import { useQuery } from "react-query"
import { useTranslation } from "react-i18next"
import { getCashFlow } from "@/services/report"
import { Card, CardContent } from "@/components/ui/card"
import PageHeader from "@/components/ui/PageHeader"
import { format } from "date-fns"
import { DatePicker } from "@/components/ui/date-picker"

const CashFlowReport = () => {
  const { t } = useTranslation()
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())

  const { data, isLoading } = useQuery(
    ["cash-flow", startDate, endDate],
    () => getCashFlow({ startDate: format(startDate, "yyyy-MM-dd"), endDate: format(endDate, "yyyy-MM-dd") }),
    { staleTime: 30000 }
  )

  const cf = data?.data || {}

  const summaryCards = [
    { label: "Penerimaan Tunai", value: cf.penerimaanTunai, color: "text-green-600" },
    { label: "Penerimaan QRIS", value: cf.penerimaanQris, color: "text-blue-600" },
    { label: "Penerimaan Transfer", value: cf.penerimaanTransfer, color: "text-purple-600" },
    { label: "Total Kas Masuk", value: cf.totalKasMasuk, color: "text-primary", bold: true },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { i18nKey: "breadcrumb.home" },
          { label: "Laporan Arus Kas" }
        ]}
        title="Laporan Arus Kas"
        description="Ringkasan penerimaan kas berdasarkan metode pembayaran">
        <div className="flex items-center gap-2">
          <DatePicker date={startDate} setDate={setStartDate} />
          <DatePicker date={endDate} setDate={setEndDate} />
        </div>
      </PageHeader>

      {isLoading ? (
        <div className="text-center p-12 text-muted-foreground">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map(card => (
            <Card key={card.label}>
              <CardContent className="p-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{card.label}</p>
                <p className={`text-xl font-bold ${card.color}`}>
                  {cf != null && card.value != null
                    ? `Rp ${Number(card.value).toLocaleString()}`
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

export default CashFlowReport
