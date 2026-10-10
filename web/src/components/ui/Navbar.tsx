import { Link, useLocation } from 'react-router-dom'
import BrandLogo from './BrandLogo'
import { useAuthStore } from '@/stores/authStore'
import { useCreditStore } from '@/stores/creditStore'
import { Coins, ChevronDown, LogOut, User, Phone } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { maskPhone, IconVerify, IconDemo, IconDownload } from './officialIcons'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const { balance, refresh } = useCreditStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const loc = useLocation()

  useEffect(() => { refresh() }, [loc.pathname])
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const isLoggedIn = !!user
  const navItems = [
    { key: '/verify', label: '报告验真', icon: <IconVerify />, href: '/verify' },
    { key: '/report-demo', label: '报告演示', icon: <IconDemo />, href: '/report-demo.html', external: true },
    { key: '/download-report', label: '下载报告', icon: <IconDownload />, href: '/download-report' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[#e5e6eb]">
      <div className="w-full h-[64px] pl-5 pr-6 flex items-center justify-between">

        {/* ── LEFT: Logo + 系统名 ── */}
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

        {/* ── RIGHT ── */}
        {isLoggedIn ? (
          <div className="flex items-center">
            {/* 官网同款右侧入口（图标 + 文字） */}
            <div className="hidden md:flex items-center gap-[24px] mr-5">
              {navItems.map(item =>
                item.external ? (
                  <a
                    key={item.key}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-[6px] text-[14px] text-[#1d2129] hover:text-[#E44548] transition-colors"
                  >
                    {item.icon} {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.key}
                    to={item.href}
                    className={`flex items-center gap-[6px] text-[14px] transition-colors ${
                      loc.pathname === item.href ? 'text-[#E44548]' : 'text-[#1d2129] hover:text-[#E44548]'
                    }`}
                  >
                    {item.icon} {item.label}
                  </Link>
                )
              )}
            </div>

            {/* 分隔线 */}
            <div className="hidden md:block w-px h-4 bg-[#d6dae5] mr-4" />

            {/* 头像 + 脱敏手机号 + 个人用户标签 */}
            <div className="relative" ref={menuRef}>
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
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg border border-[#e5e6eb] shadow-lg py-1">
                  <div className="px-3 py-2 border-b border-[#f0f2f7]">
                    <p className="text-sm font-bold text-[#1d2129]">{user?.nickname || user?.username}</p>
                    <p className="text-xs text-gray-400">@{user?.username}</p>
                  </div>
                  <Link to="/account" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-[#4e5969] hover:bg-gray-50">
                    <User size={13} /> 个人资料
                  </Link>
                  <Link to="/detection/history" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-[#4e5969] hover:bg-gray-50">
                    <Coins size={13} /> 检测报告
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
        ) : (
          <div className="flex items-center gap-4">
            {/* 未登录：导航入口（文字版） */}
            <div className="hidden md:flex items-center gap-0.5">
              <Link
                to="/verify"
                className={`px-3.5 py-1.5 text-[15px] font-medium transition-colors rounded ${
                  loc.pathname === '/verify' ? 'text-[#D73431] font-bold' : 'text-gray-600 hover:text-[#D73431]'
                }`}
              >
                报告验真
              </Link>
              <a
                href="/report-demo.html"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 text-[15px] font-medium text-gray-600 hover:text-[#D73431] transition-colors rounded"
              >
                报告演示
              </a>
              <Link
                to="/download-report"
                className={`px-3.5 py-1.5 text-[15px] font-medium transition-colors rounded ${
                  loc.pathname === '/download-report' ? 'text-[#D73431] font-bold' : 'text-gray-600 hover:text-[#D73431]'
                }`}
              >
                下载报告
              </Link>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-sm text-gray-800">
              <Phone size={13} />
              <span className="font-medium">400-607-5550</span>
            </div>
            <Link to="/login" className="bg-[#E44548] hover:bg-[#c93a3d] text-white text-sm font-bold px-5 py-2 rounded transition-colors">
              登录/注册
            </Link>
          </div>
        )}
      </div>

      {/* Authenticated sub-nav */}
      {isLoggedIn && (
        <div className="border-t border-[#f0f2f7] bg-gray-50/60">
          <div className="w-full px-6 flex items-center gap-1 h-9">
            {[
              { path: '/dashboard', label: '工作台' },
              { path: '/detection/upload', label: '论文检测' },
              { path: '/detection/history', label: '检测报告' },
              { path: '/credits', label: '充值中心' },
            ].map(item => {
              const active = loc.pathname.startsWith(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-1 text-[13px] font-medium rounded transition-colors
                    ${active ? 'bg-[#017173] text-white' : 'text-gray-500 hover:text-[#017173] hover:bg-white'}`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
}
