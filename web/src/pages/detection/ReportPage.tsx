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
    <div className="card card-pad card-hover">
      <div className="flex items-center justify-between mb-3">
        <span className="font-bold text-body" style={{ color }}>{layer}</span>
        {grade && <StatusBadge status={grade} />}
      </div>
      {score != null && (
        <div className="flex items-baseline gap-1">
          <span className="metric-value" style={{ color }}>{score.toFixed(1)}</span>
          <span className="text-caption text-ink-3">/ 100</span>
        </div>
      )}
      {/* Scale visualization */}
      <div className="flex gap-1 mt-3">
        {['D', 'C', 'B', 'A'].map((g) => {
          const active = grade && g <= grade
          return (
            <div
              key={g}
              className={`flex-1 h-2 rounded-full transition-colors ${active ? '' : 'bg-line-soft'}`}
              style={active ? { background: color } : {}}
            />
          )
        })}
      </div>
      <div className="flex justify-between text-micro text-ink-3 mt-1">
        <span>差</span><span>一般</span><span>良好</span><span>优秀</span>
      </div>
    </div>
  )
}

function StatCard({ label, value, color, suffix }: { label: string; value: string | number; color: string; suffix?: string }) {
  return (
    <div className="metric-card card-hover">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="block w-[3px] h-[14px] rounded-full shrink-0" style={{ background: color }} />
        <span className="metric-label">{label}</span>
      </div>
      <p className="metric-value" style={{ color }}>
        {value}
        {suffix && <span className="text-subtitle ml-0.5">{suffix}</span>}
      </p>
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
      <div className="min-h-screen bg-page">
          <div className="flex items-center justify-center py-32"><span className="text-ink-3">加载中…</span></div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-page">
          <div className="flex items-center justify-center py-32"><span className="text-ink-3">报告不存在</span></div>
      </div>
    )
  }

  const issueTotal = report.issue_count_risk + report.issue_count_warn + report.issue_count_good

  return (
    <div className="min-h-screen bg-page">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/detection/history" className="btn-ghost btn-sm">
            <ArrowLeft size={16} /> 返回
          </Link>
          <div className="ml-auto flex gap-2">
            <button className="btn-outline btn-sm">
              <Download size={14} /> 下载报告
            </button>
          </div>
        </div>

        {/* Hero banner */}
        <div className="rounded-2xl bg-brand-gradient-hero shadow-lg text-white p-8 mb-6">
          <p className="text-brand-200 text-caption font-semibold mb-2">个人学术能力诊断报告</p>
          <h1 className="text-title font-bold mb-1">课程论文写作训练与学术规范检测报告</h1>
          <div className="flex flex-wrap gap-4 mt-4 text-caption text-brand-100 tnum">
            <span className="flex items-center gap-1"><Hash size={12} /> {report.report_number}</span>
            <span className="flex items-center gap-1"><Clock size={12} /> {report.generated_at ? new Date(report.generated_at).toLocaleString('zh-CN') : '-'}</span>
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard label="综合评分" value={report.overall_score?.toFixed(1) ?? '-'} color="#017173" suffix="分" />
          <StatCard label="文本相似度" value={report.similarity_rate?.toFixed(1) ?? '-'} color="#F53F3F" suffix="%" />
          <StatCard label="AIGC疑似率" value={report.aigc_rate?.toFixed(1) ?? '-'} color="#7C6CF0" suffix="%" />
          <StatCard label="综合等级" value={report.overall_grade ?? '-'} color="#046f6f" />
        </div>

        {/* Issue summary */}
        <div className="card card-pad mb-6">
          <h2 className="section-title mb-4">
            <BarChart3 size={18} className="text-brand-700" /> 问题概览
          </h2>
          {issueTotal > 0 && (
            <div className="flex h-2 rounded-full overflow-hidden mb-4">
              <div className="bg-danger" style={{ width: `${(report.issue_count_risk / issueTotal) * 100}%` }} />
              <div className="bg-warning" style={{ width: `${(report.issue_count_warn / issueTotal) * 100}%` }} />
              <div className="bg-success" style={{ width: `${(report.issue_count_good / issueTotal) * 100}%` }} />
            </div>
          )}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-danger-soft rounded-lg py-4 text-center">
              <p className="metric-value text-danger">{report.issue_count_risk}</p>
              <p className="text-micro text-ink-3 mt-1">需改进</p>
            </div>
            <div className="bg-warning-soft rounded-lg py-4 text-center">
              <p className="metric-value text-warning">{report.issue_count_warn}</p>
              <p className="text-micro text-ink-3 mt-1">需关注</p>
            </div>
            <div className="bg-success-soft rounded-lg py-4 text-center">
              <p className="metric-value text-success">{report.issue_count_good}</p>
              <p className="text-micro text-ink-3 mt-1">达标</p>
            </div>
          </div>
        </div>

        {/* Layer scores */}
        <h2 className="section-title mb-4">各维度评分</h2>
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
          <div className="card card-pad mb-6">
            <h2 className="section-title mb-4">
              <Info size={18} className="text-brand-700" /> 综合诊断
            </h2>
            <div className="bg-brand-soft rounded-lg px-4 py-3">
              <div className="prose prose-sm max-w-none text-ink-2 leading-relaxed">
                {(() => {
                  try {
                    const d = JSON.parse(report.detail.replace(/'/g, '"'))
                    return <p>{d.summary || '暂无综合诊断'}</p>
                  } catch {
                    return <pre className="whitespace-pre-wrap text-body">{report.detail}</pre>
                  }
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Report detail table */}
        <div className="mb-6">
          <h2 className="section-title mb-4">
            <FileText size={18} className="text-brand-700" /> 检测明细
          </h2>
          <div className="table-wrap overflow-x-auto">
            <table className="w-full text-body">
              <thead>
                <tr className="table-head">
                  <th className="text-left py-3 px-4 font-medium">检测维度</th>
                  <th className="text-left py-3 px-4 font-medium">评分</th>
                  <th className="text-left py-3 px-4 font-medium">等级</th>
                  <th className="text-left py-3 px-4 font-medium">状态</th>
                </tr>
              </thead>
              <tbody>
                {LAYER_CONFIG.map(l => {
                  const score = report[`${l.key}_score` as keyof DetectionReport] as number | null
                  const grade = report[`${l.key}_grade` as keyof DetectionReport] as string | null
                  return (
                    <tr key={l.key} className="table-row">
                      <td className="py-3 px-4 font-semibold" style={{ color: l.color }}>{l.label}</td>
                      <td className="py-3 px-4 font-bold tnum">{score?.toFixed(1) ?? '-'}</td>
                      <td className="py-3 px-4">{grade && <StatusBadge status={grade} />}</td>
                      <td className="py-3 px-4">
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
                <tr className="table-row bg-brand-soft font-bold">
                  <td className="py-3 px-4 text-brand-700">综合评分</td>
                  <td className="py-3 px-4 text-brand-700 tnum">{report.overall_score?.toFixed(1) ?? '-'}</td>
                  <td className="py-3 px-4">{report.overall_grade && <StatusBadge status={report.overall_grade} />}</td>
                  <td className="py-3 px-4">
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
