import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '@/components/ui/Navbar'
import { useAuthStore } from '@/stores/authStore'
import { useCreditStore } from '@/stores/creditStore'
import { detectionApi, type DetectionReport } from '@/api'
import { Upload, FileText, Clock, ArrowRight, ShieldCheck, FileCheck, PenTool, BrainCircuit } from 'lucide-react'
import StatusBadge from '@/components/ui/StatusBadge'

const LAYER_ICONS = [
  { icon: FileCheck, label: '学术规范', color: '#12A594' },
  { icon: ShieldCheck, label: '学术诚信', color: '#3E7BFA' },
  { icon: PenTool, label: '学术表达', color: '#7C6CF0' },
  { icon: BrainCircuit, label: '批判思维', color: '#D4639E' },
]

export default function DashboardPage() {
  const { user, fetchProfile } = useAuthStore()
  const { balance, refresh } = useCreditStore()
  const [recentReports, setRecentReports] = useState<(DetectionReport & { file_name: string; paper_title: string | null; status: string })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
    refresh()
    detectionApi.listReports(1, 5).then(res => {
      setRecentReports(res.data.items)
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-page">
      <Navbar />

      {/* ═══ Hero Banner ═══ */}
      <div className="bg-brand-gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 24px, rgba(255,255,255,0.05) 24px, rgba(255,255,255,0.05) 48px)',
        }} />
        <div className="relative max-w-[1200px] mx-auto px-6 py-12 flex items-center gap-12">
          {/* Left */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-title font-extrabold text-white">个人版</h2>
              <span className="bg-white/15 ring-1 ring-white/30 text-white text-caption font-bold px-3 py-1 rounded-full">全新升级</span>
            </div>
            <p className="text-body text-brand-100 leading-relaxed mb-7 max-w-md">
              专为个人用户提供的论文检测工具，帮助用户有效检查学术不端行为，
              严格校验格式规范，辅助用户提升论文质量。
            </p>
            <Link to="/detection/upload" className="btn-primary btn-lg bg-white !text-brand-700 hover:bg-brand-50 shadow-brand">
              立即使用 <ArrowRight size={16} />
            </Link>
          </div>

          {/* Right: detection tool visual */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-[420px] h-[240px] bg-white rounded-xl border border-white/20 shadow-lg p-6">
              {/* Version tabs */}
              <div className="flex gap-2 mb-4 justify-center">
                {['个人版'].map((v, i) => (
                  <div key={i} className="px-4 py-1.5 bg-brand text-white text-micro font-bold rounded-full">{v}</div>
                ))}
              </div>
              {/* Detection tools circle */}
              <div className="flex items-center justify-center gap-6 mt-6">
                {LAYER_ICONS.map((l, i) => {
                  const Icon = l.icon
                  return (
                    <div key={i} className="text-center">
                      <div className="w-14 h-14 rounded-xl bg-white border border-line shadow-sm flex items-center justify-center mb-1.5">
                        <Icon size={22} style={{ color: l.color }} />
                      </div>
                      <span className="text-micro text-ink-3">{l.label}</span>
                    </div>
                  )
                })}
              </div>
              {/* Upload hint */}
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-1.5 bg-line-lighter rounded-lg px-4 py-2 text-micro text-ink-2 border border-line">
                  <Upload size={12} /> 支持 doc、docx、pdf，限50MB以内
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Main Content ═══ */}
      <main className="max-w-[1200px] mx-auto px-6 py-8">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="metric-card card-hover">
            <p className="metric-label mb-1.5">剩余检测次数</p>
            <p className="metric-value text-brand-700">{balance}</p>
          </div>
          <div className="metric-card card-hover">
            <p className="metric-label mb-1.5">累计已检测</p>
            <p className="metric-value text-ink">{recentReports.length}</p>
          </div>
          <div className="metric-card card-hover">
            <p className="metric-label mb-1.5">最近检测</p>
            <p className="metric-value text-ink text-[20px] pt-1.5">
              {recentReports[0] ? new Date(recentReports[0].created_at).toLocaleDateString('zh-CN') : '-'}
            </p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <Link to="/detection/upload" className="card card-pad card-hover group">
            <div className="w-12 h-12 rounded-xl bg-brand-soft flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Upload size={22} className="text-brand-700" />
            </div>
            <p className="font-bold text-ink mb-1 text-body">上传论文</p>
            <p className="text-caption text-ink-3">上传 .doc/.docx/.pdf 开始四层维度检测</p>
          </Link>
          <Link to="/detection/history" className="card card-pad card-hover group">
            <div className="w-12 h-12 rounded-xl bg-l2/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <FileText size={22} className="text-l2" />
            </div>
            <p className="font-bold text-ink mb-1 text-body">历史报告</p>
            <p className="text-caption text-ink-3">查看和管理所有检测报告</p>
          </Link>
          <Link to="/credits" className="card card-pad card-hover group">
            <div className="w-12 h-12 rounded-xl bg-warning-soft flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <FileText size={22} className="text-warning" />
            </div>
            <p className="font-bold text-ink mb-1 text-body">充值中心</p>
            <p className="text-caption text-ink-3">购买检测次数套餐</p>
          </Link>
        </div>

        {/* Recent reports */}
        <div className="card card-pad">
          <div className="flex items-center justify-between mb-5">
            <h3 className="section-title">最近检测报告</h3>
            <Link to="/detection/history" className="link text-caption font-semibold flex items-center gap-1">
              查看全部 <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <p className="text-center text-ink-3 py-10">加载中…</p>
          ) : recentReports.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto mb-3 text-ink-4" strokeWidth={1.5} />
              <p className="text-ink-2 font-semibold mb-2 text-body">暂无检测记录</p>
              <p className="text-caption text-ink-3 mb-4">上传你的第一篇论文开始检测吧</p>
              <Link to="/detection/upload" className="btn-primary btn-md">
                <Upload size={14} /> 上传论文
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentReports.map(r => (
                <Link
                  key={r.id}
                  to={`/detection/report/${r.id}`}
                  className="flex items-center justify-between p-4 rounded-lg border border-line card-hover"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-brand-soft flex items-center justify-center shrink-0">
                      <FileText size={18} className="text-brand-700" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-ink truncate text-body">{r.paper_title || r.file_name}</p>
                      <p className="text-micro text-ink-3 flex items-center gap-1.5 mt-0.5 tnum">
                        <Clock size={10} /> {new Date(r.created_at).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 ml-3">
                    <div className="text-center">
                      <p className="text-micro text-ink-3">相似度</p>
                      <p className="font-bold text-brand-700 text-caption tnum">{r.similarity_rate?.toFixed(1) ?? '-'}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-micro text-ink-3">AIGC</p>
                      <p className="font-bold text-l2 text-caption tnum">{r.aigc_rate?.toFixed(1) ?? '-'}%</p>
                    </div>
                    {r.overall_grade && <StatusBadge status={r.overall_grade} />}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
