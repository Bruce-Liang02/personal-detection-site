import { Link, useLocation, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useEffect, useState } from 'react'
import { FileText, FileSearch, Coins, ReceiptText, User, ChevronDown, LogOut } from 'lucide-react'
import BrandLogo from '@/components/ui/BrandLogo'
import { maskPhone, IconVerify, IconDemo, IconDownload } from '@/components/ui/officialIcons'

const SIDEBAR_GROUPS = [
  {
    label: '功能导航',
    items: [
      { path: '/paper', label: '论文检测', icon: FileSearch },
      { path: '/detection/history', label: '检测报告', icon: FileText },
      { path: '/credits/records', label: '消费记录', icon: Coins },
      { path: '/account', label: '个人资料', icon: User },
    ],
  },
  {
    label: '不开发实现',
    items: [
      { path: '/invoice', label: '发票管理', icon: ReceiptText },
    ],
  },
]

export default function SidebarLayout() {
  const { user, logout } = useAuthStore()
  const loc = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {}, [loc.pathname])

  return (
    <div className="min-h-screen bg-page flex flex-col">
      {/* ═══ 顶部导航栏 ═══ */}
      <header className="h-16 bg-white border-b border-line flex items-center justify-between pl-5 pr-6 shrink-0 sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <BrandLogo size={44} />
          <div className="leading-tight">
            <p className="text-[18px] font-extrabold text-brand tracking-wide">
              研究生课程论文写作训练与学术规范检测系统
            </p>
            <p className="text-[10px] text-ink-3 font-medium tracking-wider -mt-0.5">
              GRADUATE COURSE PAPER WRITING &amp; ACADEMIC NORMS DETECTION SYSTEM
            </p>
          </div>
        </Link>

        <div className="flex items-center">
          <div className="flex items-center gap-6 mr-5 whitespace-nowrap">
            <Link
              to="/paperVerifyListed/index"
              className={`flex items-center gap-1.5 text-body transition-colors ${
                loc.pathname === '/paperVerifyListed/index' ? 'text-brand font-bold' : 'text-ink-2 hover:text-brand'
              }`}
            >
              <IconVerify /> 报告验真
            </Link>
            <a
              href="/report-demo.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-body text-ink-2 hover:text-brand transition-colors"
            >
              <IconDemo /> 报告演示
            </a>
            <Link
              to="/downloadListed/index"
              className={`flex items-center gap-1.5 text-body transition-colors ${
                loc.pathname === '/downloadListed/index' ? 'text-brand font-bold' : 'text-ink-2 hover:text-brand'
              }`}
            >
              <IconDownload /> 下载报告
            </Link>
          </div>

          <div className="w-px h-4 bg-line mr-4" />

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-3 rounded-md hover:bg-line-lighter transition-colors pr-1"
            >
              <img src="/avatar.png" alt="avatar" className="w-10 h-10 rounded-full ring-2 ring-brand-soft" />
              <div className="leading-tight text-left">
                <div className="flex items-center gap-1">
                  <span className="text-body text-ink">{maskPhone(user?.phone || user?.username)}</span>
                  <ChevronDown size={13} className="text-ink-3" />
                </div>
                <div className="mt-0.5">
                  <span className="badge-brand text-[10px] leading-[16px]">个人用户</span>
                </div>
              </div>
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-line shadow-lg py-1 z-50">
                <div className="px-3 py-2 border-b border-line-soft">
                  <p className="text-body font-medium text-ink">{user?.nickname || user?.username}</p>
                  <p className="text-micro text-ink-3">@{user?.username}</p>
                </div>
                <button
                  onClick={() => { logout(); setMenuOpen(false); window.location.href = '/login' }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-body text-danger hover:bg-danger-soft"
                >
                  <LogOut size={13} /> 退出登录
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ═══ 下方：侧边栏 + 内容区 ═══ */}
      <div className="flex-1 flex">
        <aside className="w-[168px] bg-white border-r border-line-soft flex flex-col shrink-0">
          <nav className="flex-1 py-1 px-3">
            {SIDEBAR_GROUPS.map(group => (
              <div key={group.label} className="mb-2">
                <p className="text-micro font-semibold text-ink-3 tracking-wider px-3 pb-1.5 pt-2">{group.label}</p>
                {group.items.map(item => {
                  const Icon = item.icon
                  const active = loc.pathname === item.path ||
                    (item.path === '/paper' && loc.pathname.startsWith('/paper/')) ||
                    (item.path === '/detection/history' && loc.pathname.startsWith('/detection/report'))
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md text-body font-medium mb-0.5 transition-all duration-200
                        ${active
                          ? 'bg-brand-soft text-brand'
                          : 'text-ink-2 hover:bg-line-lighter hover:text-ink'
                        }`}
                    >
                      <Icon size={15} className={active ? 'text-brand' : 'text-ink-3'} />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            ))}
          </nav>
        </aside>

        {/* Page content */}
        <main className="flex-1 p-6 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}