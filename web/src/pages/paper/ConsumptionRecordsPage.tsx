import { useState, useRef, useEffect } from 'react'
import { Upload, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import * as XLSX from 'xlsx'

// Mock data matching official site format
const MOCK_RECORDS = [
  { type: '课程论文检测', reportNo: 'd5e6f7g8h9i0j1k2', orderNo: 'WX202606091028473651', time: new Date(Date.now() - 2 * 60 * 1000).toLocaleString('zh-CN', { hour12: false }), amount: 30, payMethod: '微信支付' },
  { type: '课程论文检测', reportNo: 'm3n4o5p6q7r8s9t0', orderNo: 'ZFB202610021543098762', time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleString('zh-CN', { hour12: false }), amount: 30, payMethod: '支付宝' },
  { type: '课程论文检测', reportNo: 'h8i9j0k1l2m3n4o5', orderNo: 'WX202310120832174590', time: new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000).toLocaleString('zh-CN', { hour12: false }), amount: 30, payMethod: '微信支付' },
]

function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: {
  startDate: string
  endDate: string
  onStartDateChange: (v: string) => void
  onEndDateChange: (v: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [tempStart, setTempStart] = useState('')
  const [tempEnd, setTempEnd] = useState('')
  const [leftMonth, setLeftMonth] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  const pickerRef = useRef<HTMLDivElement>(null)
  const today = new Date()

  // 右月份 = 左月份 + 1
  const rightMonth = leftMonth.month === 11
    ? { year: leftMonth.year + 1, month: 0 }
    : { year: leftMonth.year, month: leftMonth.month + 1 }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleDayClick = (day: number, month: { year: number; month: number }) => {
    const dateStr = `${month.year}-${String(month.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    
    if (!tempStart || (tempStart && tempEnd)) {
      setTempStart(dateStr)
      setTempEnd('')
    } else {
      if (dateStr >= tempStart) {
        setTempEnd(dateStr)
      } else {
        setTempEnd(tempStart)
        setTempStart(dateStr)
      }
    }
  }

  // 自动应用
  useEffect(() => {
    if (tempStart && tempEnd) {
      onStartDateChange(tempStart)
      onEndDateChange(tempEnd)
      setIsOpen(false)
      setTempStart('')
      setTempEnd('')
    }
  }, [tempStart, tempEnd])

  const goPrevMonth = () => {
    const newMonth = leftMonth.month === 0 ? 11 : leftMonth.month - 1
    const newYear = leftMonth.month === 0 ? leftMonth.year - 1 : leftMonth.year
    setLeftMonth({ year: newYear, month: newMonth })
  }

  const goNextMonth = () => {
    const newMonth = leftMonth.month === 11 ? 0 : leftMonth.month + 1
    const newYear = leftMonth.month === 11 ? leftMonth.year + 1 : leftMonth.year
    setLeftMonth({ year: newYear, month: newMonth })
  }

  const renderMonth = (month: { year: number; month: number }) => {
    const daysInMonth = new Date(month.year, month.month + 1, 0).getDate()
    const firstDayOfWeek = new Date(month.year, month.month, 1).getDay()
    const prevDays = new Date(month.year, month.month, 0).getDate()
    const weeks = ['日', '一', '二', '三', '四', '五', '六']

    // 生成42格（6行×7列）
    const cells: { day: number; isCurrentMonth: boolean; dateStr: string }[] = []
    
    // 上月日期
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = prevDays - i
      const m = month.month === 0 ? 11 : month.month - 1
      const y = month.month === 0 ? month.year - 1 : month.year
      cells.push({ day, isCurrentMonth: false, dateStr: `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` })
    }
    // 本月日期
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({ day: i, isCurrentMonth: true, dateStr: `${month.year}-${String(month.month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}` })
    }
    // 下月日期
    const remaining = 42 - cells.length
    for (let i = 1; i <= remaining; i++) {
      const m = month.month === 11 ? 0 : month.month + 1
      const y = month.month === 11 ? month.year + 1 : month.year
      cells.push({ day: i, isCurrentMonth: false, dateStr: `${y}-${String(m + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}` })
    }

    return (
      <div className="flex-1 min-w-[250px]">
        {/* 星期 */}
        <div className="grid grid-cols-7 mb-1">
          {weeks.map(w => (
            <div key={w} className="text-center text-[12px] text-[#C9CDD4] py-1">
              {w}
            </div>
          ))}
        </div>
        
        {/* 日期 */}
        <div className="grid grid-cols-7">
          {cells.map((cell, idx) => {
            const isToday = cell.isCurrentMonth && 
              cell.day === today.getDate() && 
              month.year === today.getFullYear() && 
              month.month === today.getMonth()
            const isSelected = cell.dateStr === tempStart || cell.dateStr === tempEnd
            const isInRange = tempStart && tempEnd && cell.dateStr >= tempStart && cell.dateStr <= tempEnd
            
            return (
              <button
                key={idx}
                onClick={() => cell.isCurrentMonth && handleDayClick(cell.day, month)}
                className={`h-[36px] text-[13px] transition-colors relative ${
                  !cell.isCurrentMonth
                    ? 'text-[#C9CDD4] hover:bg-gray-50'
                    : isSelected
                    ? 'bg-[#F53F3F] text-white rounded-full'
                    : isInRange
                    ? 'bg-red-50 text-[#F53F3F]'
                    : isToday
                    ? 'text-[#F53F3F] font-medium'
                    : 'text-[#1D2129] hover:bg-gray-50 rounded-full'
                }`}
              >
                {cell.day}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  const displayText =
    startDate || endDate
      ? `${startDate} - ${endDate}`
      : '开始日期 - 结束日期'

  return (
    <div className="relative w-[290px]" ref={pickerRef}>
      <input
        type="text"
        value={displayText}
        className="h-[32px] w-full border border-[#E5E6EB] rounded px-3 pr-8 text-[14px] outline-none cursor-pointer"
        style={{ 
          color: startDate || endDate ? '#1D2129' : '#C9CDD4',
          borderColor: isOpen ? '#F53F3F' : '#E5E6EB'
        }}
        readOnly
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) {
            setTempStart('')
            setTempEnd('')
          }
        }}
      />
      <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" size={14} color="#86909C" />
      
      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 bg-white border border-[#E5E6EB] rounded shadow-lg z-50 w-[560px]">
          {/* 月份导航 */}
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-1">
              <button onClick={goPrevMonth} className="p-1 hover:bg-gray-100 rounded text-[#4E5969]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 17l-5-5 5-5"/><path d="M18 17l-5-5 5-5"/></svg>
              </button>
              <button onClick={() => { const m = leftMonth.month === 0 ? 11 : leftMonth.month - 1; const y = leftMonth.month === 0 ? leftMonth.year - 1 : leftMonth.year; setLeftMonth({ year: y, month: m }) }} className="p-1 hover:bg-gray-100 rounded text-[#4E5969]">
                <ChevronLeft size={14} />
              </button>
            </div>
            <div className="flex items-center gap-8">
              <span className="text-[14px] font-medium text-[#1D2129]">
                {leftMonth.year} - {String(leftMonth.month + 1).padStart(2, '0')}
              </span>
              <span className="text-[14px] font-medium text-[#1D2129]">
                {rightMonth.year} - {String(rightMonth.month + 1).padStart(2, '0')}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => { const m = leftMonth.month === 11 ? 0 : leftMonth.month + 1; const y = leftMonth.month === 11 ? leftMonth.year + 1 : leftMonth.year; setLeftMonth({ year: y, month: m }) }} className="p-1 hover:bg-gray-100 rounded text-[#4E5969]">
                <ChevronRight size={14} />
              </button>
              <button onClick={goNextMonth} className="p-1 hover:bg-gray-100 rounded text-[#4E5969]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 17l5-5-5-5"/><path d="M6 17l5-5-5-5"/></svg>
              </button>
            </div>
          </div>
          
          <div className="flex gap-2 px-3 pb-3">
            {renderMonth(leftMonth)}
            <div className="w-px bg-[#E5E6EB]" />
            {renderMonth(rightMonth)}
          </div>
        </div>
      )}
    </div>
  )
}

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
      <div className="bg-white w-full">
        {/* Filter area */}
        <div className="px-6 pt-6">
          {/* Order number row */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[14px] text-[#4E5969] w-[72px] shrink-0 text-right">订单编号</span>
            <input
              type="text"
              placeholder="输入订单编号"
              value={orderNo}
              onChange={e => setOrderNo(e.target.value)}
              className="h-[32px] w-[320px] border border-[#E5E6EB] rounded px-3 text-[14px] outline-none focus:border-[#165DFF] placeholder-[#C9CDD4]"
            />
          </div>
          {/* Date range row */}
          <div className="flex items-center justify-between pb-5 border-b border-[#E5E6EB]">
            <div className="flex items-center gap-3">
              <span className="text-[14px] text-[#4E5969] w-[72px] shrink-0 text-right">筛选时间</span>
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
              />
            </div>
            <button onClick={handleExport} className="inline-flex items-center gap-1.5 h-[32px] px-4 bg-[#F53F3F] text-white text-[14px] rounded hover:bg-[#F76560] transition-colors">
              <Upload size={14} />
              导出订单
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto px-6">
          <table className="text-[14px]" style={{ tableLayout: 'fixed', width: '100%' }}>
            <colgroup>
              <col style={{ width: '15%' }} />
              <col style={{ width: '25%' }} />
              <col style={{ width: '25%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '15%' }} />
            </colgroup>
            <thead>
              <tr className="bg-[#F7F8FA]">
                <th className="text-center py-3 px-2 font-medium text-[#4E5969] text-[14px] border-b border-[#E5E6EB]">类型</th>
                <th className="text-center py-3 px-2 font-medium text-[#4E5969] text-[14px] border-b border-[#E5E6EB]">报告编号</th>
                <th className="text-center py-3 px-2 font-medium text-[#4E5969] text-[14px] border-b border-[#E5E6EB]">订单号</th>
                <th className="text-center py-3 px-2 font-medium text-[#4E5969] text-[14px] border-b border-[#E5E6EB]">消费时间</th>
                <th className="text-center py-3 px-2 font-medium text-[#4E5969] text-[14px] border-b border-[#E5E6EB]">消费金额</th>
                <th className="text-center py-3 px-2 font-medium text-[#4E5969] text-[14px] border-b border-[#E5E6EB]">支付方式</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_RECORDS.map((r, i) => (
                <tr key={i} className="border-b border-[#F2F3F5]">
                  <td className="text-center py-4 px-2 text-[14px] text-[#1D2129]">{r.type}</td>
                  <td className="text-center py-4 px-2 text-[14px] text-[#1D2129] font-mono">{r.reportNo}</td>
                  <td className="text-center py-4 px-2 text-[14px] text-[#1D2129]">{r.orderNo}</td>
                  <td className="text-center py-4 px-2 text-[14px] text-[#1D2129]">{r.time}</td>
                  <td className="text-center py-4 px-2 text-[14px] text-[#F53F3F]">￥{r.amount}</td>
                  <td className="text-center py-4 px-2 text-[14px] text-[#1D2129]">{r.payMethod}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4">
          <span className="text-[14px] text-[#4E5969]">共 {total} 项数据</span>
          <div className="flex items-center gap-3">
            <select className="h-[32px] border border-[#E5E6EB] rounded px-2 text-[14px] text-[#4E5969] outline-none bg-white cursor-pointer">
              <option>10 条/页</option>
              <option>20 条/页</option>
              <option>50 条/页</option>
            </select>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="w-[32px] h-[32px] flex items-center justify-center border border-[#E5E6EB] rounded text-[#4E5969] hover:border-[#165DFF] hover:text-[#165DFF] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
              </button>
              <button className="w-[32px] h-[32px] flex items-center justify-center border border-[#F53F3F] rounded text-[#F53F3F] text-[14px] font-medium">
                {page}
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="w-[32px] h-[32px] flex items-center justify-center border border-[#E5E6EB] rounded text-[#4E5969] hover:border-[#165DFF] hover:text-[#165DFF] disabled:opacity-40 disabled:cursor-not-allowed"
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
