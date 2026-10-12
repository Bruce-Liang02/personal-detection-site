import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BrandLogo from '@/components/ui/BrandLogo'
import { useAuthStore } from '@/stores/authStore'
import { detectionApi } from '@/api'
import { Phone, Search, ChevronDown, LogOut } from 'lucide-react'
import Footer from '@/components/ui/Footer'

/* ── Report number format: 4 hex type prefix + 16 hex unique token = 20 hex chars ── */
const REPORT_NUMBER_RE = /^[0-9a-fA-F]{20}$/

/* ── Toast ─ */
interface ToastState {
  message: string
}

function Toast({ message }: { message: string }) {
  return (
    <div className="fixed top-[64px] left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 bg-danger-soft rounded-lg px-4 py-2.5 shadow-sm text-body text-ink">
      <span className="w-5 h-5 rounded-full bg-danger flex items-center justify-center shrink-0">
        <svg xmlns="https://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M3.5 3.5L8.5 8.5M8.5 3.5L3.5 8.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </span>
      {message}
    </div>
  )
}

/* ── Result detail row ── */
function DetailRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value == null) return null
  return (
    <p className="text-[14px] text-ink leading-[28px]">
      <span className="text-ink-3 mr-1">■</span>{label}：{value}
    </p>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   ReportVerifyContent
   ═══════════════════════════════════════════════════════════════════ */
export function ReportVerifyContent() {
  const [reportNumber, setReportNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [result, setResult] = useState<null | {
    valid: boolean
    info?: {
      report_number: string
      paper_title: string | null
      author_name: string | null
      generated_at: string | null
    }
  }>(null)

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ message })
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }, [])

  useEffect(() => {
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current) }
  }, [])

  async function handleVerify() {
    const trimmed = reportNumber.trim()
    if (!trimmed) {
      showToast('请输入报告编号')
      return
    }

    // 1) Format check
    if (!REPORT_NUMBER_RE.test(trimmed)) {
      showToast('报告编号格式有误')
      setResult(null)
      return
    }

    // 2) Call API
    setLoading(true)
    setResult(null)
    try {
      const res = await detectionApi.verifyReport(trimmed)
      // API returns { code: 0, data: {...} } on success
      setResult({
        valid: true,
        info: {
          report_number: res.data.report_number,
          paper_title: res.data.paper_title,
          author_name: res.data.author_name,
          generated_at: res.data.generated_at,
        },
      })
    } catch (err: any) {
      const msg = err?.message ?? ''
      if (msg.includes('未查询到报告')) {
        // 3a) Format correct but not found
        showToast('未查询到报告')
        setResult({ valid: false })
      } else if (msg.includes('格式有误')) {
        showToast('报告编号格式有误')
        setResult(null)
      } else {
        showToast('验真失败，请稍后重试')
        setResult({ valid: false })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {toast && <Toast message={toast.message} />}

      {/* ═══ Banner 区块 ═══ */}
      <div className="relative h-[220px] w-full overflow-hidden" style={{ background: 'url(/verify-bg.png) 0% 0% / 100% 100% no-repeat' }}>
        <div className="pt-[48px]" style={{ paddingLeft: '23.4%' }}>
          <p className="text-[44px] font-bold leading-[1.1] tracking-[1.76px] text-ink mb-4 whitespace-nowrap">
            <span className="text-brand-700 mr-1">VPCS</span>独家认证
          </p>
          <p className="text-[44px] font-bold leading-[1.1] tracking-[1.76px] text-ink whitespace-nowrap">
            维普论文报告验真
          </p>
        </div>
        <div className="absolute top-[24px] w-[320px] h-[177px]" style={{ right: '23.4%', background: 'url(/verify-illustration.png) 0% 0% / 100% 100% no-repeat' }} />
      </div>

      {/* ═══ Content ═══ */}
      <div className="bg-page w-full pt-[40px] pb-[20px] px-4">
        <div className="relative w-full max-w-[1000px] min-h-[504px] mx-auto rounded-lg px-[40px] py-[40px] md:px-[134px] bg-gradient-to-b from-brand-soft to-white border border-line">
          {/* 左侧水印徽章 */}
          <div className="absolute left-0 top-0 w-[290px] h-[279px] pointer-events-none" style={{ background: 'url(/verify-icon.png) center / contain no-repeat' }} />

          {/* 检测类型 */}
          <div className="relative flex items-center gap-6 mb-[20px] flex-wrap">
            <div className="shrink-0 text-[14px] text-ink leading-[26px]">检测类型</div>
            <div
              className="relative w-[140px] h-[48px] flex items-center justify-center select-none
                bg-white text-[16px] rounded-md cursor-default"
              style={{
                border: '1px solid var(--brand)',
                color: 'var(--brand)',
              }}
            >
              课程论文检测
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-brand flex items-center justify-center">
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
            </div>
          </div>

          {/* 报告编号 + 验真按钮 */}
          <div className="relative flex items-center gap-6 flex-wrap">
            <div className="shrink-0 text-[14px] text-ink leading-[26px]">报告编号</div>
            <div className="flex-1 min-w-[320px] flex items-center">
              <input
                className="input-field h-[48px] flex-1 mr-[12px] rounded-md"
                placeholder="请输入报告编号"
                value={reportNumber}
                onChange={e => { setReportNumber(e.target.value); setResult(null) }}
                onKeyDown={e => e.key === 'Enter' && handleVerify()}
              />
              <button
                onClick={handleVerify}
                disabled={loading}
                className="btn-primary w-[120px] !h-[48px] shrink-0 text-[16px]"
              >
                {loading ? '验真中…' : '报告验真'}
              </button>
            </div>
          </div>

          {/* 结果区 */}
          <div className="relative w-full">
            {result ? (
              result.valid ? (
                /* ── 验证通过 ─ */
                <div className="mt-[32px] px-[24px] pb-[24px]">
                  {/* 标题行 */}
                  <div className="flex items-center gap-2 mb-[16px]">
                    <svg xmlns="https://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
                      <circle cx="12" cy="12" r="12" fill="#017173"/>
                      <path d="M7 12.5L10.5 16L17 8.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-[18px] font-bold text-ink">报告已通过官方验证</span>
                  </div>
                  {/* 详情列表 */}
                  <div className="space-y-0">
                    <DetailRow label="验证产品" value="课程论文检测" />
                    <DetailRow label="版本类型" value="课程论文检测报告" />
                    <DetailRow label="报告编号" value={result.info?.report_number} />
                    <DetailRow label="检测时间" value={result.info?.generated_at ? new Date(result.info.generated_at).toLocaleString('zh-CN') : null} />
                    <DetailRow label="论文题目" value={result.info?.paper_title} />
                    <DetailRow label="作者" value={result.info?.author_name} />
                    <DetailRow label="检测单位" value="维普论文检测" />
                  </div>
                </div>
              ) : (
                /* ── 未找到报告 ── */
                <div className="flex flex-col items-center justify-center gap-[16px] pt-[40px]">
                  <img src="/verify-nodata.png" alt="" className="w-[256px] h-[120px]" />
                  <span className="text-[14px] text-ink-2 leading-[22px]">
                    验证未通过，您查询的报告编号错误或不存在！
                  </span>
                </div>
              )
            ) : (
              /* ── 无结果（初始状态） ── */
              <div className="flex flex-col items-center justify-center gap-[16px] pt-[40px]">
                <img src="/verify-nodata.png" alt="" className="w-[256px] h-[120px]" />
                <span className="text-[14px] text-ink-2 leading-[22px]">请输入报告编号进行验真</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   ReportVerifyPage (standalone with navbar + footer)
   ═══════════════════════════════════════════════════════════════════ */
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
    <div className="min-h-screen bg-page flex flex-col">
      {/* ═══ Navbar ═══ */}
      <header className="sticky top-0 z-50 bg-white border-b border-line">
        <div className="w-full px-6 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 shrink-0">
              <BrandLogo size={48} />
              <div className="leading-tight">
                <p className="text-[20px] font-black text-brand-700 tracking-wide">
                  研究生课程论文写作训练与学术规范检测系统
                </p>
                <p className="text-[11px] text-ink-3 font-semibold tracking-wider -mt-0.5">
                  GRADUATE COURSE PAPER WRITING &amp; ACADEMIC NORMS DETECTION SYSTEM
                </p>
              </div>
            </Link>
            <div className="hidden md:flex items-center gap-0.5">
              <span className="px-3.5 py-1.5 text-[15px] font-bold text-brand">报告验真</span>
              <a href="/report-demo.html" target="_blank" rel="noopener noreferrer" className="px-3.5 py-1.5 text-[15px] font-medium text-ink-2 hover:text-brand transition-colors rounded">报告演示</a>
              <Link to="/download-report" className="px-3.5 py-1.5 text-[15px] font-medium text-ink-2 hover:text-brand transition-colors rounded">下载报告</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-sm text-ink-2">
              <Phone size={13} />
              <span className="font-medium">400-607-5550</span>
            </div>
            {isLoggedIn ? (
              <>
                <span className="text-line">|</span>
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 rounded hover:bg-line-lighter transition-colors px-2 py-1"
                  >
                    <img src="/avatar.png" alt="avatar" className="w-8 h-8 rounded-full" />
                    <div className="leading-tight text-left">
                      <div className="flex items-center gap-1">
                        <span className="text-[14px] text-ink">{user?.nickname || user?.username}</span>
                        <ChevronDown size={13} className="text-ink-3" />
                      </div>
                      <div className="mt-0.5">
                        <span className="badge-brand">个人用户</span>
                      </div>
                    </div>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg border border-line shadow-lg py-1 z-50">
                      <button
                        onClick={() => { logout(); setMenuOpen(false); navigate('/login') }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-danger hover:bg-danger-soft"
                      >
                        <LogOut size={13} /> 退出登录
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link to="/login" className="btn-primary btn-md text-caption">
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
