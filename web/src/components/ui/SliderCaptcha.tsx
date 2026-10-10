import { useRef, useState } from 'react'
import { Check } from 'lucide-react'

/* 滑块验证（拖到最右侧即通过），登录页与注册/找回密码弹窗共用 */
function SliderCaptcha({ done, onDone }: { done: boolean; onDone: () => void }) {
  const [pos, setPos] = useState(0)
  const [dragging, setDragging] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)

  function onStart(e: React.PointerEvent) {
    if (done) return
    setDragging(true)
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  }
  function onMove(e: React.PointerEvent) {
    if (!dragging || done || !trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    const max = rect.width - 44
    const p = Math.min(Math.max(e.clientX - rect.left - 22, 0), max)
    setPos(p)
    if (p >= max - 2) {
      setDragging(false)
      onDone()
    }
  }
  function onEnd() {
    if (!done) setPos(0)
    setDragging(false)
  }

  return (
    <div
      ref={trackRef}
      className={`relative h-10 rounded-sm select-none ${done ? 'bg-success-soft border border-success-border' : 'bg-line-soft'}`}
    >
      <div
        className={`absolute top-0 left-0 h-full rounded-sm ${done ? 'bg-success-soft' : 'bg-white border border-line'}`}
        style={{ width: `${Math.max(pos + 44, 44)}px` }}
      />
      <span className="absolute inset-0 flex items-center justify-center text-[13px] pointer-events-none">
        {done ? (
          <span className="flex items-center gap-1.5 text-success">
            <Check size={15} /> 验证通过
          </span>
        ) : (
          <span className="text-ink-3">请按住滑块，拖动到最右边</span>
        )}
      </span>
      <div
        onPointerDown={onStart}
        onPointerMove={onMove}
        onPointerUp={onEnd}
        onPointerCancel={onEnd}
        className={`absolute top-0 left-0 w-[44px] h-10 rounded-sm flex items-center justify-center cursor-grab active:cursor-grabbing transition-colors ${
          done ? 'bg-success text-white' : 'bg-white border border-line text-ink-3 hover:text-brand hover:border-brand-line shadow-xs'
        }`}
        style={{ transform: `translateX(${pos}px)` }}
      >
        {done ? <Check size={17} /> : <span className="tracking-[-2px] text-[15px] font-bold">»»</span>}
      </div>
    </div>
  )
}

export default SliderCaptcha
