import { useState, useEffect } from 'react'

interface ParsingProgressModalProps {
  isOpen: boolean
  onClose: () => void
  done: boolean
  detectionName: string
  detectionVersion: string
}

export default function ParsingProgressModal({
  isOpen,
  onClose,
  done,
  detectionName,
  detectionVersion,
}: ParsingProgressModalProps) {
  const [progress, setProgress] = useState(0)

  // 进度条动画：从 0 增长到 100，与外层 3s 定时器同步
  useEffect(() => {
    if (!isOpen) {
      setProgress(0)
      return
    }
    if (done) {
      setProgress(100)
      return
    }

    const totalDuration = 3000
    const interval = 50
    const step = 100 / (totalDuration / interval)
    let current = 0

    const timer = setInterval(() => {
      current += step + Math.random() * step * 0.5
      if (current >= 100) {
        current = 100
        clearInterval(timer)
      }
      setProgress(current)
    }, interval)

    return () => clearInterval(timer)
  }, [isOpen, done])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-[520px]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E6EB]">
          <h2 className="text-[18px] font-bold text-[#1D2129]">解析进度</h2>
          <button onClick={onClose} className="text-[#86909C] hover:text-[#1D2129] transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5">
          {/* Warning Banner */}
          <div className="mb-5 bg-[#FFF7E8] border border-[#FFD4A8] rounded px-4 py-3 flex items-start gap-2.5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5">
              <circle cx="8" cy="8" r="7" stroke="#F77234" strokeWidth="1.5" />
              <path d="M8 4.5v4" stroke="#F77234" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="8" cy="11" r="0.75" fill="#F77234" />
            </svg>
            <span className="text-[13px] text-[#F77234] leading-relaxed">
              系统正在解析文档，各检测项耗时不同。若耗时较久，可前往"检测报告"页查看进度。
            </span>
          </div>

          {/* Detection Item Card */}
          <div className="border border-[#E5E6EB] rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[15px] font-medium text-[#1D2129]">
                {detectionName} · {detectionVersion}
              </span>
              <span className={`text-[14px] font-medium ${done ? 'text-[#00B42A]' : 'text-[#165DFF]'}`}>
                {done ? '解析完成' : '解析中'}
              </span>
            </div>

            <div className="w-full h-[10px] bg-[#F2F3F5] rounded-full overflow-hidden">
              {done ? (
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: '100%', background: 'linear-gradient(90deg, #00B42A, #288463)' }}
                />
              ) : (
                <div
                  className="h-full rounded-full transition-all duration-100"
                  style={{
                    width: `${Math.min(progress, 100)}%`,
                    background: 'linear-gradient(90deg, #93B4FF, #165DFF, #93B4FF)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.5s linear infinite',
                  }}
                />
              )}
            </div>
          </div>
        </div>

        <style>{`
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    </div>
  )
}
