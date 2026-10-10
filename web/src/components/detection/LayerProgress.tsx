interface LayerProgressProps {
  layer: string   // L1 / L2 / L3 / L4
  label: string
  score?: number | null
  grade?: string | null
  status: string | null  // pending / running / done
  color: string   // CSS variable or hex
}

const LAYER_COLORS: Record<string, { from: string; to: string; icon: string }> = {
  L1: { from: '#12A594', to: '#2BBBA8', icon: '📐' },
  L2: { from: '#3E7BFA', to: '#6A9BFF', icon: '🔍' },
  L3: { from: '#7C6CF0', to: '#9B7CF0', icon: '️' },
  L4: { from: '#D4639E', to: '#E9A3C4', icon: '' },
}

export default function LayerProgress({ layer, label, score, grade, status, color }: LayerProgressProps) {
  const cfg = LAYER_COLORS[layer] || { from: '#86909c', to: '#c9cdd4', icon: '📋' }
  const progress = status === 'done' ? 100 : status === 'running' ? 50 : 0

  return (
    <div className="card card-pad card-hover">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-subtitle">{cfg.icon}</span>
          <span className="font-bold text-body" style={{ color: cfg.from }}>{label}</span>
        </div>
        {grade && (
          <span className="badge" style={{ backgroundColor: cfg.from + '18', color: cfg.from }}>{grade}</span>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full bg-line-soft rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out-soft"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${cfg.from}, ${cfg.to})`,
          }}
        />
      </div>

      <div className="flex items-center justify-between text-micro text-ink-3">
        <span>{status === 'done' ? '检测完成' : status === 'running' ? '正在检测…' : '等待检测'}</span>
        {score != null && <span className="font-bold text-subtitle tnum" style={{ color: cfg.from }}>{score.toFixed(1)}分</span>}
      </div>
    </div>
  )
}
