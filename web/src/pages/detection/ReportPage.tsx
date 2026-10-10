import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import StatusBadge from '@/components/ui/StatusBadge'
import { detectionApi, type DetectionReport } from '@/api'
import {
  FileText, Clock, Hash, BarChart3, Download, ArrowLeft,
  ShieldCheck, FileCheck, PenTool, BrainCircuit, AlertTriangle, CheckCircle2, Info
} from 'lucide-react'

const LAYER_CONFIG = [
  { key: 'l1', label: '学术规范', icon: FileCheck, color: '#12A594' },
  { key: 'l2', label: '学术诚信', icon: ShieldCheck, color: '#3E7BFA' },
  { key: 'l3', label: '学术表达', icon: PenTool, color: '#7C6CF0' },
  { key: 'l4', label: '批判性思维', icon: BrainCircuit, color: '#D4639E' },
]

function LayerScore({ layer, score, grade, color }: { layer: string; score: number | null | undefined; grade: string | null | undefined; color: string }) {
  return (
    <div className="card p-5 hover:shadow-card-hover transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="font-bold text-sm" style={{ color }}>{layer}</span>
        {grade && <StatusBadge status={grade} />}
      </div>
      {score != null && (
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black" style={{ color }}>{score.toFixed(1)}</span>
          <span className="text-sm text-ink-3">/ 100</span>
        </div>
      )}
      {/* Scale visualization */}
      <div className="flex gap-1 mt-3">
        {['D', 'C', 'B', 'A'].map((g, i) => {
          const active = grade && g <= grade
          return (
            <div
              key={g}
              className={`flex-1 h-2 rounded-full transition-colors ${active ? '' : 'bg-gray-100'}`}
              style={active ? { background: color } : {}}
            />
          )
        })}
      </div>
      <div className="flex justify-between text-[10px] text-ink-3 mt-1">
        <span>差</span><span>一般</span><span>良好</span><span>优秀</span>
      </div>
    </div>
  )
}

function StatCard({ label, value, color, suffix }: { label: string; value: string | number; color: string; suffix?: string }) {
  return (
    <div className="text-center p-4 rounded-xl" style={{ background: color + '10' }}>
      <p className="text-2xl font-black" style={{ color }}>{value}{suffix || ''}</p>
      <p className="text-xs text-ink-3 mt-1">{label}</p>
    </div>
  )
}

export default function ReportPage() {
  const { reportId } = useParams<{ reportId: string }>()
  const [report, setReport] = useState<DetectionReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!reportId) return
    detectionApi.getReport(Number(reportId)).then(res => setReport(res.data)).finally(() => setLoading(false))
  }, [reportId])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7F4]">
          <div className="flex items-center justify-center py-32"><span className="text-ink-3">加载中…</span></div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-[#F8F7F4]">
          <div className="flex items-center justify-center py-32"><span className="text-ink-3">报告不存在</span></div>
      </div>
    )
  }

  const issueTotal = report.issue_count_risk + report.issue_count_warn + report.issue_count_good

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/detection/history" className="btn-ghost">
            <ArrowLeft size={16} /> 返回
          </Link>
          <div className="ml-auto flex gap-2">
            <button className="btn-outline text-sm">
              <Download size={14} /> 下载报告
            </button>
          </div>
        </div>

        {/* Hero banner */}
        <div className="rounded-2xl bg-gradient-to-r from-brand-700 to-brand-900 text-white p-8 mb-6">
          <p className="text-brand-200 text-sm font-semibold mb-2">个人学术能力诊断报告</p>
          <h1 className="text-2xl font-black mb-1">课程论文写作训练与学术规范检测报告</h1>
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-brand-100">
            <span className="flex items-center gap-1"><Hash size={12} /> {report.report_number}</span>
            <span className="flex items-center gap-1"><Clock size={12} /> {report.generated_at ? new Date(report.generated_at).toLocaleString('zh-CN') : '-'}</span>
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard label="综合评分" value={report.overall_score?.toFixed(1) ?? '-'} color="#1B6B5A" suffix="分" />
          <StatCard label="文本相似度" value={report.similarity_rate?.toFixed(1) ?? '-'} color="#D73431" suffix="%" />
          <StatCard label="AIGC疑似率" value={report.aigc_rate?.toFixed(1) ?? '-'} color="#7C6CF0" suffix="%" />
          <StatCard label="综合等级" value={report.overall_grade ?? '-'} color="#288463" />
        </div>

        {/* Issue summary */}
        <div className="card p-6 mb-6">
          <h2 className="font-extrabold text-ink mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-brand-700" /> 问题概览
          </h2>
          {issueTotal > 0 && (
            <div className="flex h-3 rounded-full overflow-hidden mb-3">
              <div className="bg-danger" style={{ width: `${(report.issue_count_risk / issueTotal) * 100}%` }} />
              <div className="bg-warning" style={{ width: `${(report.issue_count_warn / issueTotal) * 100}%` }} />
              <div className="bg-success" style={{ width: `${(report.issue_count_good / issueTotal) * 100}%` }} />
            </div>
          )}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-black text-danger">{report.issue_count_risk}</p>
              <p className="text-xs text-ink-3">需改进</p>
            </div>
            <div>
              <p className="text-2xl font-black text-warning">{report.issue_count_warn}</p>
              <p className="text-xs text-ink-3">需关注</p>
            </div>
            <div>
              <p className="text-2xl font-black text-success">{report.issue_count_good}</p>
              <p className="text-xs text-ink-3">达标</p>
            </div>
          </div>
        </div>

        {/* Layer scores */}
        <h2 className="text-xl font-extrabold text-ink mb-4">各维度评分</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {LAYER_CONFIG.map(l => (
            <LayerScore
              key={l.key}
              layer={l.label}
              score={report[`${l.key}_score` as keyof DetectionReport] as number}
              grade={report[`${l.key}_grade` as keyof DetectionReport] as string}
              color={l.color}
            />
          ))}
        </div>

        {/* Detail summary (from report.detail JSON) */}
        {report.detail && (
          <div className="card p-6 mb-6">
            <h2 className="font-extrabold text-ink mb-4 flex items-center gap-2">
              <Info size={18} className="text-accent-600" /> 综合诊断
            </h2>
            <div className="prose prose-sm max-w-none text-ink-2 leading-relaxed">
              {(() => {
                try {
                  const d = JSON.parse(report.detail.replace(/'/g, '"'))
                  return <p>{d.summary || '暂无综合诊断'}</p>
                } catch {
                  return <pre className="whitespace-pre-wrap text-sm">{report.detail}</pre>
                }
              })()}
            </div>
          </div>
        )}

        {/* Report detail table */}
        <div className="card p-6">
          <h2 className="font-extrabold text-ink mb-4 flex items-center gap-2">
            <FileText size={18} className="text-brand-700" /> 检测明细
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-3 px-2 font-semibold text-ink-2">检测维度</th>
                  <th className="text-left py-3 px-2 font-semibold text-ink-2">评分</th>
                  <th className="text-left py-3 px-2 font-semibold text-ink-2">等级</th>
                  <th className="text-left py-3 px-2 font-semibold text-ink-2">状态</th>
                </tr>
              </thead>
              <tbody>
                {LAYER_CONFIG.map(l => {
                  const score = report[`${l.key}_score` as keyof DetectionReport] as number | null
                  const grade = report[`${l.key}_grade` as keyof DetectionReport] as string | null
                  return (
                    <tr key={l.key} className="border-b border-line/50 hover:bg-brand-50/30">
                      <td className="py-3 px-2 font-semibold" style={{ color: l.color }}>{l.label}</td>
                      <td className="py-3 px-2 font-bold">{score?.toFixed(1) ?? '-'}</td>
                      <td className="py-3 px-2">{grade && <StatusBadge status={grade} />}</td>
                      <td className="py-3 px-2">
                        {grade
                          ? grade === 'A' || grade === 'B'
                            ? <span className="badge badge-success">达标</span>
                            : grade === 'C'
                              ? <span className="badge badge-warning">需关注</span>
                              : <span className="badge badge-danger">需改进</span>
                          : <span className="text-ink-3">-</span>
                        }
                      </td>
                    </tr>
                  )
                })}
                <tr className="bg-brand-50/50 font-bold">
                  <td className="py-3 px-2 text-brand-700">综合评分</td>
                  <td className="py-3 px-2 text-brand-700">{report.overall_score?.toFixed(1) ?? '-'}</td>
                  <td className="py-3 px-2">{report.overall_grade && <StatusBadge status={report.overall_grade} />}</td>
                  <td className="py-3 px-2">
                    {report.overall_grade
                      ? (report.overall_grade === 'A' || report.overall_grade === 'B')
                        ? <span className="badge badge-success">通过</span>
                        : <span className="badge badge-warning">需关注</span>
                      : <span className="text-ink-3">-</span>
                    }
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </div>
  )
}
