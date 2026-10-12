import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BrandLogo from '@/components/ui/BrandLogo'
import { useAuthStore } from '@/stores/authStore'
import { Phone, ChevronDown, LogOut } from 'lucide-react'
import Footer from '@/components/ui/Footer'

const REPORT_TYPES = [
  { key: 'coursePaper', label: '课程论文检测' },
]

/* 官网卡片标题问号图标（SVG path 与官网一致） */
function QuestionIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M8.00065 14.6667C4.31875 14.6667 1.33398 11.6819 1.33398 8.00004C1.33398 4.31814 4.31875 1.33337 8.00065 1.33337C11.6825 1.33337 14.6673 4.31814 14.6673 8.00004C14.6673 11.6819 11.6825 14.6667 8.00065 14.6667ZM8.00065 13.3334C10.9462 13.3334 13.334 10.9456 13.334 8.00004C13.334 5.05452 10.9462 2.66671 8.00065 2.66671C5.05513 2.66671 2.66732 5.05452 2.66732 8.00004C2.66732 10.9456 5.05513 13.3334 8.00065 13.3334ZM7.33398 10H8.66732V11.3334H7.33398V10ZM8.66732 8.90344V9.33337H7.33398V8.33337C7.33398 7.96517 7.63245 7.66671 8.00065 7.66671C8.55292 7.66671 9.00065 7.21897 9.00065 6.66671C9.00065 6.11442 8.55292 5.66671 8.00065 5.66671C7.51552 5.66671 7.11105 6.01219 7.01985 6.47055L5.71219 6.20901C5.9249 5.1395 6.86865 4.33337 8.00065 4.33337C9.28932 4.33337 10.334 5.37804 10.334 6.66671C10.334 7.72371 9.63112 8.61657 8.66732 8.90344Z"
        fill="var(--ink-4)"
      />
    </svg>
  )
}

/* 内容区（登录后在 SidebarLayout 框架内复用；独立访问时由默认导出包裹导航与页脚） */
export function DownloadReportContent() {
  const [selectedType, setSelectedType] = useState('coursePaper')
  const [orderNumbers, setOrderNumbers] = useState<Record<string, string>>({})

  function updateOrder(key: string, value: string) {
    setOrderNumbers(prev => ({ ...prev, [key]: value }))
  }

  function handleDownload(method: string) {
    const orderNo = orderNumbers[method]
    if (!orderNo?.trim()) {
      alert('请输入订单编号')
      return
    }
    // TODO: 对接后端下载接口
    alert(`正在查询订单 ${orderNo} 的报告…（功能开发中）`)
  }

  /* 卡片标题：左侧品牌竖条 + 文本 + 问号图标 */
  function CardTitle({ text, withIcon = true }: { text: string; withIcon?: boolean }) {
    return (
      <div className="relative flex items-center gap-[8px] mb-[20px] pl-[15px] text-[14px] font-medium leading-[22px] text-ink">
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[15px] rounded-r-[2px] bg-brand" />
        {text}
        {withIcon && <QuestionIcon />}
      </div>
    )
  }

  /* 订单输入 + 下载报告按钮（白底、品牌描边品牌字，hover 品牌底白字） */
  function DownloadInput({ placeholder, methodKey }: { placeholder: string; methodKey: string }) {
    return (
      <div className="flex items-center h-[40px] mb-[20px]">
        <input
          className="input-field h-[40px] flex-1 min-w-0 mr-[12px]"
          placeholder={placeholder}
          value={orderNumbers[methodKey] || ''}
          onChange={e => updateOrder(methodKey, e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleDownload(methodKey)}
        />
        <button
          onClick={() => handleDownload(methodKey)}
          className="btn-outline w-[100px] h-[40px] shrink-0 !border-brand !text-brand hover:!bg-brand hover:!text-white hover:!border-brand"
        >
          下载报告
        </button>
      </div>
    )
  }

  /* 底部说明文字 */
  function BotText({ lines }: { lines: [string, string][] }) {
    return (
      <div className="text-[14px] leading-[22px] text-ink-2">
        {lines.map(([label, value], i) => (
          <div key={label} className={i === 0 ? 'mb-[8px]' : ''}>
            {label}：<span className="text-ink">{value}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      {/* ═══ Banner（官网 .top_bg 规格：高 240px，文字图 550×110 top 27%，桌面宽度下 left 23.4% 与验真页一致；窄窗口自动回退避免压到右侧插图） ═══ */}
      <div className="relative h-[240px] w-full overflow-hidden" style={{ background: 'url(/download-bg.png) center center / cover no-repeat' }}>
        <div className="absolute w-[550px] h-[110px]" style={{ left: 'max(10%, min(22%, calc(50% - 450.5px)))', top: '27%', background: 'url(/download-text.png) 0% 0% / contain no-repeat' }} />
        <div className="absolute top-0 h-full w-[523px]" style={{ left: 'min(calc(50% + 100px), calc(100% - 523px))', background: 'url(/download-illustration.png) 0% 0% / 100% 100% no-repeat' }} />
      </div>

      {/* ═══ Content（官网 .main：浅灰底 py 40px，.center 1221px） ═══ */}
      <div className="bg-page w-full">
        <div className="py-[40px] w-full">
          <div className="w-[1221px] max-w-full mx-auto">

            {/* 报告类型（标签在左、按钮在右同行 align-end；选中品牌浅底 + 品牌边字 + 右上角对勾角标） */}
            <div className="flex items-end gap-[24px] mb-[32px]">
              <div className="shrink-0 whitespace-nowrap mb-[12px] text-[16px] font-medium leading-[24px] text-ink">报告类型</div>
              <div className="flex flex-wrap gap-[12px]">
                {REPORT_TYPES.map(t => (
                  <div
                    key={t.key}
                    onClick={() => setSelectedType(t.key)}
                    className="relative w-[140px] h-[48px] flex items-center justify-center cursor-pointer select-none
                      text-[16px] leading-[18px] rounded-md transition-colors"
                    style={{
                      border: selectedType === t.key ? '1px solid var(--brand)' : '1px solid var(--line)',
                      color: selectedType === t.key ? 'var(--brand)' : 'var(--ink)',
                      background: selectedType === t.key ? 'var(--brand-soft)' : '#fff',
                    }}
                  >
                    {t.label}
                    {selectedType === t.key && (
                      <span className="absolute top-0 right-0 w-[16px] h-[16px] bg-brand rounded-tr-[4px] rounded-bl-[4px] flex items-center justify-center">
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <path d="M2.2 6.4L4.9 9L9.8 3.6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 报告下载（官网 .download_box：标签在左顶部，卡片 flex wrap gap 12） */}
            <div className="flex items-start gap-[24px]">
              <div className="shrink-0 whitespace-nowrap text-[16px] font-medium leading-[24px] text-ink">报告下载</div>
              <div className="flex flex-wrap gap-[12px]">

                {/* 微信支付 */}
                <div className="w-[556px] max-w-full h-[220px] box-border rounded-lg bg-white border border-line px-[16px] py-[24px] shadow-card">
                  <CardTitle text="微信支付" />
                  <DownloadInput placeholder="请输入微信订单编号" methodKey="wechat" />
                  <BotText lines={[['报告有效期', '保留3年'], ['订单编号查找方式', '微信钱包-交易记录-支付详情-商户订单']]} />
                </div>

                {/* 支付宝支付 */}
                <div className="w-[556px] max-w-full h-[220px] box-border rounded-lg bg-white border border-line px-[16px] py-[24px] shadow-card">
                  <CardTitle text="支付宝支付" />
                  <DownloadInput placeholder="请输入支付宝订单编号" methodKey="alipay" />
                  <BotText lines={[['报告有效期', '保留3年'], ['订单编号查找方式', '支付宝-账单-交易记录-创建时间-商户订单号']]} />
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function DownloadReportPage() {
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
              <Link to="/verify" className="px-3.5 py-1.5 text-[15px] font-medium text-ink-2 hover:text-brand transition-colors rounded">报告验真</Link>
              <a href="/report-demo.html" target="_blank" rel="noopener noreferrer" className="px-3.5 py-1.5 text-[15px] font-medium text-ink-2 hover:text-brand transition-colors rounded">报告演示</a>
              <span className="px-3.5 py-1.5 text-[15px] font-bold text-brand">下载报告</span>
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
      <DownloadReportContent />

      {/* ═══ Footer ═══ */}
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  )
}
