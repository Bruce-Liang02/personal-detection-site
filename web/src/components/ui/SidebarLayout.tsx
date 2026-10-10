import { Link, useLocation, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useCreditStore } from '@/stores/creditStore'
import { useEffect, useState } from 'react'
import { FileText, FileSearch, Coins, Receipt, User, ChevronDown, LogOut } from 'lucide-react'
import BrandLogo from '@/components/ui/BrandLogo'
import { maskPhone, IconVerify, IconDemo, IconDownload } from '@/components/ui/officialIcons'

const SIDEBAR_ITEMS = [
  { path: '/paper', label: '论文检测', icon: FileSearch },
  { path: '/detection/history', label: '检测报告', icon: FileText },
  { path: '/credits', label: '账户充值', icon: Receipt },
  { path: '/credits/records', label: '消费记录', icon: Coins },
  { path: '/account', label: '个人资料', icon: User },
]

export default function SidebarLayout() {
  const { user, logout } = useAuthStore()
  const { refresh } = useCreditStore()
  const loc = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => { refresh() }, [loc.pathname])

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
      {/* ═══ 顶部导航栏（官网登录后样式） ═══ */}
      <header className="h-[64px] bg-white border-b border-[#e5e6eb] flex items-center justify-between pl-5 pr-6 shrink-0 sticky top-0 z-40">
        {/* 左：Logo + 系统名（点击回首页 /） */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <BrandLogo size={44} />
          <div className="leading-tight">
            <p className="text-[19px] font-black text-[#017173] tracking-wide">
              研究生课程论文写作训练与学术规范检测系统
            </p>
            <p className="text-[10px] text-gray-400 font-semibold tracking-wider -mt-0.5">
              GRADUATE COURSE PAPER WRITING &amp; ACADEMIC NORMS DETECTION SYSTEM
            </p>
          </div>
        </Link>

        {/* 右：入口 + 分隔线 + 头像 */}
        <div className="flex items-center">
          <div className="flex items-center gap-[24px] mr-5 whitespace-nowrap">
            <Link to="/paperVerifyListed/index" className="flex items-center gap-[6px] text-[14px] text-[#1d2129] hover:text-[#E44548] transition-colors">
              <IconVerify /> 报告验真
            </Link>
            <a
              href="/report-demo.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-[6px] text-[14px] text-[#1d2129] hover:text-[#E44548] transition-colors"
            >
              <IconDemo /> 报告演示
            </a>
            <Link to="/downloadListed/index" className="flex items-center gap-[6px] text-[14px] text-[#1d2129] hover:text-[#E44548] transition-colors">
              <IconDownload /> 下载报告
            </Link>
          </div>

          <div className="w-px h-4 bg-[#d6dae5] mr-4" />

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-[12px] rounded hover:bg-gray-50 transition-colors pr-1"
            >
              <img src="/avatar.png" alt="avatar" className="w-11 h-11 rounded-full" />
              <div className="leading-tight text-left">
                <div className="flex items-center gap-1">
                  <span className="text-[14px] text-[#1d2129]">{maskPhone(user?.phone || user?.username)}</span>
                  <ChevronDown size={13} className="text-[#86909c]" />
                </div>
                <div className="mt-0.5">
                  <span className="inline-block text-[10px] leading-[14px] text-[#E44548] bg-[#FFDEDE] rounded-[2px] px-1">个人用户</span>
                </div>
              </div>
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg border border-[#e5e6eb] shadow-lg py-1 z-50">
                <div className="px-3 py-2 border-b border-[#f0f2f7]">
                  <p className="text-sm font-bold text-[#1d2129]">{user?.nickname || user?.username}</p>
                  <p className="text-xs text-gray-400">@{user?.username}</p>
                </div>
                <Link to="/account" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-[#4e5969] hover:bg-gray-50">
                  <User size={13} /> 个人资料
                </Link>
                <button
                  onClick={() => { logout(); setMenuOpen(false); window.location.href = '/login' }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#E44548] hover:bg-[#ffece8]"
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
        <aside className="w-[150px] bg-white border-r border-[#f0f2f7] flex flex-col shrink-0">
          <nav className="flex-1 py-3 px-2">
            {SIDEBAR_ITEMS.map(item => {
              const Icon = item.icon
              const active = loc.pathname === item.path ||
                (item.path === '/paper' && loc.pathname.startsWith('/paper/')) ||
                (item.path === '/detection/history' && loc.pathname.startsWith('/detection/report'))
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-2.5 py-2.5 rounded-[3px] text-[13px] font-medium mb-0.5 transition-colors
                    ${active
                      ? 'bg-[linear-gradient(90deg,#FFDEDE_0%,#FFF6F6_100%)] text-[#E44548]'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <Icon size={15} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Page content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
