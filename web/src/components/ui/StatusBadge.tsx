interface StatusBadgeProps {
  status: string  // pass | warn | fail | pending | running | done | completed | failed
  label?: string
}

const MAP: Record<string, { cls: string; label: string }> = {
  pass:     { cls: 'badge-success', label: '通过' },
  good:     { cls: 'badge-success', label: '达标' },
  done:     { cls: 'badge-success', label: '已完成' },
  completed:{ cls: 'badge-success', label: '已完成' },
  warn:     { cls: 'badge-warning', label: '需关注' },
  pending:  { cls: 'badge-warning', label: '待检测' },
  queued:   { cls: 'badge-neutral', label: '排队中' },
  running:  { cls: 'badge-brand',   label: '检测中' },
  fail:     { cls: 'badge-danger',  label: '需改进' },
  failed:   { cls: 'badge-danger',  label: '失败' },
  risk:     { cls: 'badge-danger',  label: '需改进' },
  A:        { cls: 'badge-success', label: 'A 优秀' },
  B:        { cls: 'badge-success', label: 'B 良好' },
  C:        { cls: 'badge-warning', label: 'C 一般' },
  D:        { cls: 'badge-warning', label: 'D 较差' },
  R:        { cls: 'badge-danger',  label: 'R 不合格' },
}

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const info = MAP[status] || { cls: 'badge-neutral', label: status }
  return (
    <span className={`badge ${info.cls}`}>
      {label || info.label}
    </span>
  )
}
