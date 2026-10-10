import { useState, useRef, useEffect } from 'react'
import { Upload, ChevronLeft, ChevronRight } from 'lucide-react'
import * as XLSX from 'xlsx'
import DateRangePicker from '@/components/ui/DateRangePicker'

// Mock data matching official site format
const MOCK_RECORDS = [
  { type: '课程论文检测', reportNo: 'd5e6f7g8h9i0j1k2', orderNo: 'WX202606091028473651', time: new Date(Date.now() - 2 * 60 * 1000).toLocaleString('zh-CN', { hour12: false }), amount: 30, payMethod: '微信支付' },
  { type: '课程论文检测', reportNo: 'm3n4o5p6q7r8s9t0', orderNo: 'ZFB202610021543098762', time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleString('zh-CN', { hour12: false }), amount: 30, payMethod: '支付宝' },
  { type: '课程论文检测', reportNo: 'h8i9j0k1l2m3n4o5', orderNo: 'WX202310120832174590', time: new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000).toLocaleString('zh-CN', { hour12: false }), amount: 30, payMethod: '微信支付' },
]

export default function ConsumptionRecordsPage() {
  const [orderNo, setOrderNo] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)

  const total = MOCK_RECORDS.length
  const totalPages = Math.ceil(total / pageSize)

  function handleExport() {
    // 数据转换为导出格式
    const exportData = MOCK_RECORDS.map(r => ({
      '类型': r.type,
      '报告编号': r.reportNo,
      '订单号': r.orderNo,
      '消费时间': r.time,
      '消费金额': r.amount,
      '支付方式': r.payMethod,
    }))

    // 创建工作表
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '消费记录')

    // 导出文件
    const fileName = `消费记录_${new Date().toISOString().slice(0, 10)}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  return (
    <div>
      <div className="card overflow-hidden w-full">
        {/* Filter area */}
        <div className="px-6 pt-6">
          {/* Order number row */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-body text-ink-2 w-[72px] shrink-0 text-right">订单编号</span>
            <input
              type="text"
              placeholder="输入订单编号"
              value={orderNo}
              onChange={e => setOrderNo(e.target.value)}
              className="h-8 w-[320px] rounded-md border border-line bg-white px-3 text-body outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-100 transition-all placeholder:text-ink-4"
            />
          </div>
          {/* Date range row */}
          <div className="flex items-center justify-between pb-5 border-b border-line">
            <div className="flex items-center gap-3">
              <span className="text-body text-ink-2 w-[72px] shrink-0 text-right">筛选时间</span>
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
              />
            </div>
            <button onClick={handleExport} className="btn-primary btn-sm">
              <Upload size={14} />
              导出订单
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="table-wrap border-0 rounded-none overflow-x-auto px-0">
          <table className="text-body" style={{ tableLayout: 'fixed', width: '100%' }}>
            <colgroup>
              <col style={{ width: '15%' }} />
              <col style={{ width: '25%' }} />
              <col style={{ width: '25%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '15%' }} />
            </colgroup>
            <thead>
              <tr className="table-head">
                <th className="text-center py-3 px-2 font-medium">类型</th>
                <th className="text-center py-3 px-2 font-medium">报告编号</th>
                <th className="text-center py-3 px-2 font-medium">订单号</th>
                <th className="text-center py-3 px-2 font-medium">消费时间</th>
                <th className="text-center py-3 px-2 font-medium">消费金额</th>
                <th className="text-center py-3 px-2 font-medium">支付方式</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_RECORDS.map((r, i) => (
                <tr key={i} className="table-row">
                  <td className="text-center py-4 px-2 text-body text-ink">{r.type}</td>
                  <td className="text-center py-4 px-2 text-body text-ink font-mono tnum">{r.reportNo}</td>
                  <td className="text-center py-4 px-2 text-body text-ink tnum">{r.orderNo}</td>
                  <td className="text-center py-4 px-2 text-body text-ink tnum">{r.time}</td>
                  <td className="text-center py-4 px-2 text-body text-brand-700 font-bold tnum">￥{r.amount}</td>
                  <td className="text-center py-4 px-2 text-body text-ink">{r.payMethod}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-line">
          <span className="text-body text-ink-2">共 {total} 项数据</span>
          <div className="flex items-center gap-3">
            <select className="h-8 rounded-md border border-line bg-white px-2 text-body text-ink-2 outline-none cursor-pointer focus:border-brand-700 transition-colors">
              <option>10 条/页</option>
              <option>20 条/页</option>
              <option>50 条/页</option>
            </select>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-line bg-white text-ink-3 hover:border-brand-700 hover:text-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-line disabled:hover:text-ink-3"
              >
                <ChevronLeft size={14} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-md border border-brand-700 bg-brand-soft text-brand-700 text-body font-medium tnum">
                {page}
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-line bg-white text-ink-3 hover:border-brand-700 hover:text-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-line disabled:hover:text-ink-3"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
