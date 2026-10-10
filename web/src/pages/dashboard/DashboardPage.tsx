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
    <div className="min-h-screen bg-[#f7f7f7]">
      <Navbar />

      {/* ═══ Hero Banner ═══ */}
      <div className="bg-white">
        <div className="max-w-[1200px] mx-auto px-6 py-10 flex items-center gap-12">
          {/* Left */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-[28px] font-black text-gray-900">个人版</h2>
              <span className="bg-[#E44548]/10 text-[#E44548] text-[13px] font-bold px-3 py-1 rounded-full">全新升级</span>
            </div>
            <p className="text-[15px] text-gray-500 leading-relaxed mb-6 max-w-md">
              专为个人用户提供的论文检测工具，帮助用户有效检查学术不端行为，
              严格校验格式规范，辅助用户提升论文质量。
            </p>
            <Link to="/detection/upload" className="inline-flex items-center gap-2 border-2 border-[#E44548] text-[#E44548] font-bold px-6 py-2.5 rounded hover:bg-[#E44548] hover:text-white transition-all text-[15px]">
              立即使用 <ArrowRight size={16} />
            </Link>
          </div>

          {/* Right: detection tool visual */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-[420px] h-[240px] bg-[#f8f9fc] rounded-2xl border border-gray-100 p-6">
              {/* Version tabs */}
              <div className="flex gap-2 mb-4 justify-center">
                {['个人版'].map((v, i) => (
                  <div key={i} className="px-4 py-1.5 bg-[#E44548] text-white text-[12px] font-bold rounded">{v}</div>
                ))}
              </div>
              {/* Detection tools circle */}
              <div className="flex items-center justify-center gap-6 mt-6">
                {LAYER_ICONS.map((l, i) => {
                  const Icon = l.icon
                  return (
                    <div key={i} className="text-center">
                      <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center mb-1.5"
                        style={{ border: `1px solid ${l.color}20` }}>
                        <Icon size={22} style={{ color: l.color }} />
                      </div>
                      <span className="text-[10px] text-gray-500">{l.label}</span>
                    </div>
                  )
                })}
              </div>
              {/* Upload hint */}
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-1.5 bg-white rounded-lg px-4 py-2 text-[12px] text-gray-400 shadow-sm border border-gray-100">
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
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <p className="text-[13px] text-gray-400 mb-1">剩余检测次数</p>
            <p className="text-[32px] font-black text-[#017173]">{balance}</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <p className="text-[13px] text-gray-400 mb-1">累计已检测</p>
            <p className="text-[32px] font-black text-gray-900">{recentReports.length}</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <p className="text-[13px] text-gray-400 mb-1">最近检测</p>
            <p className="text-[32px] font-black text-gray-900">
              {recentReports[0] ? new Date(recentReports[0].created_at).toLocaleDateString('zh-CN') : '-'}
            </p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <Link to="/detection/upload" className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#017173]/8 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Upload size={22} className="text-[#017173]" />
            </div>
            <p className="font-bold text-gray-900 mb-1">上传论文</p>
            <p className="text-[13px] text-gray-400">上传 .doc/.docx/.pdf 开始四层维度检测</p>
          </Link>
          <Link to="/detection/history" className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#3E7BFA]/8 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <FileText size={22} className="text-[#3E7BFA]" />
            </div>
            <p className="font-bold text-gray-900 mb-1">历史报告</p>
            <p className="text-[13px] text-gray-400">查看和管理所有检测报告</p>
          </Link>
          <Link to="/credits" className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#C87F2C]/8 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <FileText size={22} className="text-[#C87F2C]" />
            </div>
            <p className="font-bold text-gray-900 mb-1">充值中心</p>
            <p className="text-[13px] text-gray-400">购买检测次数套餐</p>
          </Link>
        </div>

        {/* Recent reports */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[16px] font-bold text-gray-900">最近检测报告</h3>
            <Link to="/detection/history" className="text-[13px] text-[#017173] font-semibold hover:underline flex items-center gap-1">
              查看全部 <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <p className="text-center text-gray-400 py-10">加载中…</p>
          ) : recentReports.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 font-semibold mb-2">暂无检测记录</p>
              <p className="text-[13px] text-gray-400 mb-4">上传你的第一篇论文开始检测吧</p>
              <Link to="/detection/upload" className="inline-flex items-center gap-2 bg-[#E44548] hover:bg-[#c93a3d] text-white font-bold px-5 py-2.5 rounded transition-colors text-[14px]">
                <Upload size={14} /> 上传论文
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentReports.map(r => (
                <Link
                  key={r.id}
                  to={`/detection/report/${r.id}`}
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-[#f8f9fc] hover:border-gray-200 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-[#017173]/8 flex items-center justify-center shrink-0">
                      <FileText size={18} className="text-[#017173]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 truncate">{r.paper_title || r.file_name}</p>
                      <p className="text-[12px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                        <Clock size={10} /> {new Date(r.created_at).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 ml-3">
                    <div className="text-center">
                      <p className="text-[11px] text-gray-400">相似度</p>
                      <p className="font-bold text-[#E44548] text-[14px]">{r.similarity_rate?.toFixed(1) ?? '-'}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[11px] text-gray-400">AIGC</p>
                      <p className="font-bold text-[#3E7BFA] text-[14px]">{r.aigc_rate?.toFixed(1) ?? '-'}%</p>
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
