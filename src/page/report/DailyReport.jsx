import React, { useState } from "react"
import { useQuery } from "react-query"
import { useTranslation } from "react-i18next"
import { getDailyReport } from "@/services/report"
import { Card } from "@/components/ui/card"
import PageHeader from "@/components/ui/PageHeader"
import { Loading } from "@/components/ui/loading"
import { format } from "date-fns"
import { DatePicker } from "@/components/ui/date-picker"

const DailyReport = () => {
  const { t } = useTranslation()
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())

  const { data, isLoading } = useQuery(
    ["daily-report", startDate, endDate],
    () => getDailyReport({ startDate: format(startDate, "yyyy-MM-dd"), endDate: format(endDate, "yyyy-MM-dd") }),
    { staleTime: 30000 }
  )

  const reports = data?.data || []

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { i18nKey: "breadcrumb.home" },
          { label: "Laporan Harian" }
        ]}
        title="Laporan Harian"
        description="Rekap penjualan dan operasional harian">
        <div className="flex items-center gap-2">
          <DatePicker date={startDate} setDate={setStartDate} />
          <DatePicker date={endDate} setDate={setEndDate} />
        </div>
      </PageHeader>

      {isLoading ? (
        <Loading fullscreen size="lg" label="Memuat data laporan harian..." />
      ) : reports.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <p className="text-muted-foreground">Belum ada data laporan harian</p>
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/60 border-b">
                  <th className="px-3 py-3 text-left font-semibold text-muted-foreground text-xs uppercase">Tanggal</th>
                  <th className="px-3 py-3 text-right font-semibold text-muted-foreground text-xs uppercase">Transaksi</th>
                  <th className="px-3 py-3 text-right font-semibold text-muted-foreground text-xs uppercase">Penjualan</th>
                  <th className="px-3 py-3 text-right font-semibold text-muted-foreground text-xs uppercase">HPP</th>
                  <th className="px-3 py-3 text-right font-semibold text-muted-foreground text-xs uppercase">Food Cost</th>
                  <th className="px-3 py-3 text-right font-semibold text-muted-foreground text-xs uppercase">Gross Profit</th>
                  <th className="px-3 py-3 text-right font-semibold text-muted-foreground text-xs uppercase">Net Profit</th>
                  <th className="px-3 py-3 text-right font-semibold text-muted-foreground text-xs uppercase">Covers</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r.id} className="border-b border-muted/30 hover:bg-muted/15">
                    <td className="px-3 py-3">{r.tanggal}</td>
                    <td className="px-3 py-3 text-right">{r.totalTransaksi}</td>
                    <td className="px-3 py-3 text-right">Rp {Number(r.totalPenjualanBersih).toLocaleString()}</td>
                    <td className="px-3 py-3 text-right">Rp {Number(r.totalHpp).toLocaleString()}</td>
                    <td className="px-3 py-3 text-right">{r.foodCostPersen}%</td>
                    <td className="px-3 py-3 text-right">Rp {Number(r.grossProfit).toLocaleString()}</td>
                    <td className="px-3 py-3 text-right font-semibold">Rp {Number(r.netProfit).toLocaleString()}</td>
                    <td className="px-3 py-3 text-right">{r.totalCovers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

export default DailyReport
