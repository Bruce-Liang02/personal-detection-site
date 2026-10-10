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
    <div className="overlay">
      <div className="modal w-[520px]">
        {/* Header */}
        <div className="modal-header">
          <h2 className="section-title">解析进度</h2>
          <button onClick={onClose} className="text-ink-3 hover:text-ink transition-colors" aria-label="关闭">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {/* Warning Banner */}
          <div className="mb-5 bg-warning-soft border border-warning-border rounded-md px-4 py-3 flex items-start gap-2.5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5">
              <circle cx="8" cy="8" r="7" stroke="#FF7D00" strokeWidth="1.5" />
              <path d="M8 4.5v4" stroke="#FF7D00" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="8" cy="11" r="0.75" fill="#FF7D00" />
            </svg>
            <span className="text-caption text-warning leading-relaxed">
              系统正在解析文档，各检测项耗时不同。若耗时较久，可前往"检测报告"页查看进度。
            </span>
          </div>

          {/* Detection Item Card */}
          <div className="card card-pad">
            <div className="flex items-center justify-between mb-3">
              <span className="text-body font-medium text-ink">
                {detectionName} · {detectionVersion}
              </span>
              <span className={`text-body font-medium ${done ? 'text-success' : 'text-brand-700'}`}>
                {done ? '解析完成' : '解析中'}
              </span>
            </div>

            <div className="progress-track !h-2">
              {done ? (
                <div className="h-full rounded-full transition-all duration-500 bg-brand-gradient" />
              ) : (
                <div
                  className="h-full rounded-full transition-all duration-100"
                  style={{
                    width: `${Math.min(progress, 100)}%`,
                    background: 'linear-gradient(90deg, #7dd0c2, #017173, #7dd0c2)',
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
