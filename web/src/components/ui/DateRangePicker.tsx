import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

/**
 * 双月日历区间选择器（与官网消费记录页筛选时间同款）
 * 选完起止日期后自动应用并收起面板
 */
export default function DateRangePicker({
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
            <div key={w} className="text-center text-[12px] text-ink-4 py-1">
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
                    ? 'text-ink-4 hover:bg-line-lighter'
                    : isSelected
                    ? 'bg-brand text-white rounded-full font-medium'
                    : isInRange
                    ? 'bg-brand-soft text-brand-700'
                    : isToday
                    ? 'text-brand font-medium'
                    : 'text-ink hover:bg-line-lighter rounded-full'
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
        className="h-10 w-full bg-white border border-line rounded-md px-3 pr-9 text-body outline-none cursor-pointer transition-colors focus:border-brand focus:ring-2 focus:ring-brand-soft-2"
        style={{
          color: startDate || endDate ? 'var(--ink)' : 'var(--ink-3)',
          borderColor: isOpen ? 'var(--brand)' : undefined,
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
      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" size={14} color="var(--ink-3)" />

      {isOpen && (
        <div className="absolute top-[calc(100%+6px)] left-0 bg-white border border-line rounded-lg shadow-lg z-50 w-[560px]">
          {/* 月份导航 */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-line-soft">
            <div className="flex items-center gap-1">
              <button onClick={goPrevMonth} className="p-1 hover:bg-line-soft hover:text-brand rounded-sm text-ink-2 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 17l-5-5 5-5"/><path d="M18 17l-5-5 5-5"/></svg>
              </button>
              <button onClick={() => { const m = leftMonth.month === 0 ? 11 : leftMonth.month - 1; const y = leftMonth.month === 0 ? leftMonth.year - 1 : leftMonth.year; setLeftMonth({ year: y, month: m }) }} className="p-1 hover:bg-line-soft hover:text-brand rounded-sm text-ink-2 transition-colors">
                <ChevronLeft size={14} />
              </button>
            </div>
            <div className="flex items-center gap-8">
              <span className="text-body font-semibold text-ink tnum">
                {leftMonth.year} - {String(leftMonth.month + 1).padStart(2, '0')}
              </span>
              <span className="text-body font-semibold text-ink tnum">
                {rightMonth.year} - {String(rightMonth.month + 1).padStart(2, '0')}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => { const m = leftMonth.month === 11 ? 0 : leftMonth.month + 1; const y = leftMonth.month === 11 ? leftMonth.year + 1 : leftMonth.year; setLeftMonth({ year: y, month: m }) }} className="p-1 hover:bg-line-soft hover:text-brand rounded-sm text-ink-2 transition-colors">
                <ChevronRight size={14} />
              </button>
              <button onClick={goNextMonth} className="p-1 hover:bg-line-soft hover:text-brand rounded-sm text-ink-2 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 17l5-5-5-5"/><path d="M6 17l5-5-5-5"/></svg>
              </button>
            </div>
          </div>

          <div className="flex gap-2 px-3 pb-3 pt-2">
            {renderMonth(leftMonth)}
            <div className="w-px bg-line" />
            {renderMonth(rightMonth)}
          </div>
        </div>
      )}
    </div>
  )
}
