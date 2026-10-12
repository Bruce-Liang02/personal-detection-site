import { Link, useLocation } from 'react-router-dom'
import BrandLogo from './BrandLogo'
import { useAuthStore } from '@/stores/authStore'
import { Coins, ChevronDown, LogOut, User, Phone } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { maskPhone, IconVerify, IconDemo, IconDownload } from './officialIcons'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const loc = useLocation()
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
    <nav className="sticky top-0 z-50 bg-white border-b border-line">
      <div className="w-full h-16 pl-5 pr-6 flex items-center justify-between">

        {/* ── LEFT: Logo + 系统名 ── */}
        <Link to={isLoggedIn ? '/dashboard' : '/'} className="flex items-center gap-3 shrink-0 group">
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

        {/* ── RIGHT ── */}
        {isLoggedIn ? (
          <div className="flex items-center">
            <div className="hidden md:flex items-center gap-6 mr-5">
              {navItems.map(item =>
                item.external ? (
                  <a
                    key={item.key}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-body text-ink-2 hover:text-brand transition-colors"
                  >
                    {item.icon} {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.key}
                    to={item.href}
                    className={`flex items-center gap-1.5 text-body transition-colors ${
                      loc.pathname === item.href ? 'text-brand font-medium' : 'text-ink-2 hover:text-brand'
                    }`}
                  >
                    {item.icon} {item.label}
                  </Link>
                )
              )}
            </div>

            <div className="hidden md:block w-px h-4 bg-line mr-4" />

            <div className="relative" ref={menuRef}>
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
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-line shadow-lg py-1">
                  <div className="px-3 py-2 border-b border-line-soft">
                    <p className="text-body font-medium text-ink">{user?.nickname || user?.username}</p>
                    <p className="text-micro text-ink-3">@{user?.username}</p>
                  </div>
                  <Link to="/account" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-body text-ink-2 hover:bg-line-lighter">
                    <User size={13} /> 个人资料
                  </Link>
                  <Link to="/detection/history" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-body text-ink-2 hover:bg-line-lighter">
                    <Coins size={13} /> 检测报告
                  </Link>
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
        ) : (
          <div className="flex items-center gap-5">
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/verify"
                className={`px-3 py-1.5 text-body font-medium transition-colors rounded-sm ${
                  loc.pathname === '/verify' ? 'text-brand font-semibold' : 'text-ink-2 hover:text-brand'
                }`}
              >
                报告验真
              </Link>
              <a
                href="/report-demo.html"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-body font-medium text-ink-2 hover:text-brand transition-colors rounded-sm"
              >
                报告演示
              </a>
              <Link
                to="/download-report"
                className={`px-3 py-1.5 text-body font-medium transition-colors rounded-sm ${
                  loc.pathname === '/download-report' ? 'text-brand font-semibold' : 'text-ink-2 hover:text-brand'
                }`}
              >
                下载报告
              </Link>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-caption text-ink-2">
              <Phone size={13} />
              <span className="font-medium tnum">400-607-5550</span>
            </div>
            <Link to="/login" className="btn-primary btn-md !rounded-md px-6">
              登录/注册
            </Link>
          </div>
        )}
      </div>

      {/* Authenticated sub-nav */}
      {isLoggedIn && (
        <div className="border-t border-line-soft bg-page">
          <div className="w-full px-6 flex items-center gap-1 h-9">
            {[
              { path: '/dashboard', label: '工作台' },
              { path: '/detection/upload', label: '论文检测' },
              { path: '/detection/history', label: '检测报告' },
            ].map(item => {
              const active = loc.pathname.startsWith(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-1 text-caption font-medium rounded-sm transition-colors ${
                    active ? 'bg-brand text-white shadow-brand' : 'text-ink-2 hover:text-brand hover:bg-white'
                  }`}
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