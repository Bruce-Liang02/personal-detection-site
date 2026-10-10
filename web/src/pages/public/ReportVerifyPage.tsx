import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BrandLogo from '@/components/ui/BrandLogo'
import { useAuthStore } from '@/stores/authStore'
import { Phone, Search, CheckCircle2, AlertCircle, ChevronDown, LogOut, User } from 'lucide-react'
import Footer from '@/components/ui/Footer'

const DETECTION_TYPES = [
  { key: 'coursePaper', label: '课程论文检测' },
]

/* 内容区（登录后在 SidebarLayout 框架内复用；独立访问时由默认导出包裹导航与页脚） */
export function ReportVerifyContent() {
  const [selectedType, setSelectedType] = useState('coursePaper')
  const [reportNumber, setReportNumber] = useState('')
  const [result, setResult] = useState<null | { valid: boolean; info?: Record<string, string> }>(null)
  const [loading, setLoading] = useState(false)

  async function handleVerify() {
    if (!reportNumber.trim()) {
      setResult({ valid: false })
      return
    }
    setLoading(true)
    setResult(null)
    await new Promise(r => setTimeout(r, 1200))
    // TODO: 对接后端 /api/v1/verify/{report_number}
    setResult({ valid: false })
    setLoading(false)
  }

  return (
    <>
      {/* ═══ Banner 区块（官网 top_bg 规格：高 220px，标题 44px/700 #072155，插图 320×177） ═══ */}
      <div className="relative h-[220px] w-full overflow-hidden" style={{ background: 'url(/verify-bg.png) 0% 0% / 100% 100% no-repeat' }}>
        <div className="pt-[48px]" style={{ paddingLeft: '23.4%' }}>
          <p className="text-[44px] font-bold leading-[1.1] tracking-[1.76px] text-[#072155] mb-4 whitespace-nowrap">
            <span className="text-[#e51b1f] mr-1">CQMS</span>独家认证
          </p>
          <p className="text-[44px] font-bold leading-[1.1] tracking-[1.76px] text-[#072155] whitespace-nowrap">
            维普课程论文报告验真
          </p>
        </div>
        {/* 右侧插图 */}
        <div className="absolute top-[24px] w-[320px] h-[177px]" style={{ right: '23.4%', background: 'url(/verify-illustration.png) 0% 0% / 100% 100% no-repeat' }} />
      </div>

      {/* ═══ Content（官网 .main 规格：白底，main_box 1000px 渐变卡片） ═══ */}
      <div className="bg-white w-full pt-[40px] pb-[20px] px-4">
        <div
          className="relative w-full max-w-[1000px] min-h-[504px] mx-auto rounded-[8px] px-[40px] py-[40px] md:px-[134px]"
          style={{ border: '1px solid #e4e7f2', background: 'linear-gradient(#eef6ff 0%, #ffffff 22.35%)' }}
        >
          {/* 左侧水印徽章 */}
          <div className="absolute left-0 top-0 w-[290px] h-[279px] pointer-events-none" style={{ background: 'url(/verify-icon.png) center / contain no-repeat' }} />

          {/* 检测类型 */}
          <div className="relative flex items-center gap-6 mb-[20px] flex-wrap">
            <div className="shrink-0 text-[14px] text-[#1d2129] leading-[26px]">检测类型</div>
            <div className="flex items-center gap-[12px] flex-wrap">
              {DETECTION_TYPES.map(t => (
                <div
                  key={t.key}
                  onClick={() => setSelectedType(t.key)}
                  className="w-[140px] h-[48px] flex items-center justify-center cursor-pointer select-none
                    bg-white text-[16px] rounded-[4px] transition-colors"
                  style={{
                    border: selectedType === t.key ? '1px solid #E44548' : '1px solid #e5e6eb',
                    color: selectedType === t.key ? '#E44548' : '#1d2129',
                  }}
                >
                  {t.label}
                </div>
              ))}
            </div>
          </div>

          {/* 报告编号 + 验真按钮（官网：输入框与按钮间距 12px，按钮 120×48） */}
          <div className="relative flex items-center gap-6 flex-wrap">
            <div className="shrink-0 text-[14px] text-[#1d2129] leading-[26px]">报告编号</div>
            <div className="flex-1 min-w-[320px] flex items-center">
              <input
                className="flex-1 h-[48px] mr-[12px] px-4 bg-white text-[14px] text-[#1d2129] rounded-[4px] placeholder:text-[#a9aeb8] focus:outline-none focus:border-[#E44548]"
                style={{ border: '1px solid #e5e6eb' }}
                placeholder="请输入"
                value={reportNumber}
                onChange={e => { setReportNumber(e.target.value); setResult(null) }}
                onKeyDown={e => e.key === 'Enter' && handleVerify()}
              />
              <button
                onClick={handleVerify}
                disabled={loading}
                className="w-[120px] h-[48px] rounded-[4px] bg-[#E44548] hover:bg-[#c93a3d] disabled:opacity-60 text-white text-[16px]
                  flex items-center justify-center gap-1.5 transition-colors shrink-0"
              >
                {loading ? '验真中…' : <><Search size={16} /> 报告验真</>}
              </button>
            </div>
          </div>

          {/* 结果区（官网 result_box：无结果时展示 nodata 插图 + 提示文字） */}
          <div className="relative w-full">
            {result ? (
              <div className={`mt-[24px] rounded-[4px] p-[20px] flex items-start gap-3
                ${result.valid ? 'bg-[#e8ffea]' : 'bg-[#ffece8]'}`}
                style={{ border: result.valid ? '1px solid #a8d9b0' : '1px solid #f3c1bd' }}>
                {result.valid ? (
                  <CheckCircle2 size={20} className="text-[#00b42a] shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle size={20} className="text-[#f53f3f] shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  {result.valid ? (
                    <>
                      <p className="font-bold text-[#00b42a] text-[14px] mb-2">验真通过，报告真实有效</p>
                      <div className="space-y-1.5 text-[13px] text-[#4e5969]">
                        <p>论文标题：{result.info?.title}</p>
                        <p>检测时间：{result.info?.time}</p>
                        <p>综合评分：{result.info?.score}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="font-bold text-[#f53f3f] text-[14px] mb-1">未找到该报告</p>
                      <p className="text-[13px] text-[#4e5969]">请检查报告编号是否输入正确，或联系客服 400-607-5550</p>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-[16px] pt-[40px]">
                <img src="/verify-nodata.png" alt="" className="w-[256px] h-[120px]" />
                <span className="text-[14px] text-[#4e5969] leading-[22px]">请输入报告编号进行验真</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default function ReportVerifyPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const isLoggedIn = !!user

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex flex-col">
      {/* ═══ Navbar ═══ */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="w-full px-6 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to={isLoggedIn ? '/dashboard' : '/'} className="flex items-center gap-3 shrink-0">
              <BrandLogo size={48} />
              <div className="leading-tight">
                <p className="text-[20px] font-black text-[#017173] tracking-wide">
                  研究生课程论文写作训练与学术规范检测系统
                </p>
                <p className="text-[11px] text-gray-400 font-semibold tracking-wider -mt-0.5">
                  GRADUATE COURSE PAPER WRITING &amp; ACADEMIC NORMS DETECTION SYSTEM
                </p>
              </div>
            </Link>
            <div className="hidden md:flex items-center gap-0.5">
              <span className="px-3.5 py-1.5 text-[15px] font-bold text-[#D73431]">报告验真</span>
              <a href="/report-demo.html" target="_blank" rel="noopener noreferrer" className="px-3.5 py-1.5 text-[15px] font-medium text-gray-600 hover:text-[#D73431] transition-colors rounded">报告演示</a>
              <Link to="/download-report" className="px-3.5 py-1.5 text-[15px] font-medium text-gray-600 hover:text-[#D73431] transition-colors rounded">下载报告</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-sm text-gray-800">
              <Phone size={13} />
              <span className="font-medium">400-607-5550</span>
            </div>
            {isLoggedIn ? (
              <>
                <span className="text-[#d6dae5]">|</span>
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 rounded hover:bg-gray-50 transition-colors px-2 py-1"
                  >
                    <img src="/avatar.png" alt="avatar" className="w-8 h-8 rounded-full" />
                    <span className="text-[14px] text-[#1d2129]">{user?.nickname || user?.username}</span>
                    <ChevronDown size={13} className="text-[#86909c]" />
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg border border-[#e5e6eb] shadow-lg py-1 z-50">
                      <Link to="/account" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-[#4e5969] hover:bg-gray-50">
                        <User size={13} /> 个人资料
                      </Link>
                      <button
                        onClick={() => { logout(); setMenuOpen(false); navigate('/login') }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#E44548] hover:bg-[#ffece8]"
                      >
                        <LogOut size={13} /> 退出登录
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link to="/login" className="bg-[#E44548] hover:bg-[#c93a3d] text-white text-sm font-bold px-5 py-2 rounded transition-colors">
                登录/注册
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ═══ 内容 ═══ */}
      <ReportVerifyContent />

      {/* ═══ Footer ═══ */}
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  )
}
