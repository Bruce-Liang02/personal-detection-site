import { useAuthStore } from '@/stores/authStore'
import { Gift, Users, Share2, ArrowRight, Copy, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

export default function InvitePage() {
  const { user } = useAuthStore()
  const [copied, setCopied] = useState(false)

  function copyCode() {
    if (user?.referral_code) {
      navigator.clipboard.writeText(user.referral_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div>
      <div className="max-w-[800px] mx-auto">
        <h1 className="text-2xl font-black text-ink mb-1">邀请好友</h1>
        <p className="text-ink-3 mb-6">邀请好友注册，双方各获得 1 次免费检测</p>

        {/* Hero card */}
        <div className="card p-8 mb-6 bg-gradient-to-br from-accent-50 to-white !border-accent-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-accent-100 flex items-center justify-center">
              <Gift size={32} className="text-accent-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-ink">邀请奖励</h2>
              <p className="text-ink-2 text-sm">每邀请一位好友注册，你和好友各获得 1 次免费检测</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-accent-100 mb-4">
            <p className="text-xs text-ink-3 mb-1">你的邀请码</p>
            <div className="flex items-center gap-3">
              <p className="text-2xl font-black text-accent-700 font-mono tracking-wider">{user?.referral_code || '-'}</p>
              <button onClick={copyCode} className="btn-ghost text-xs">
                {copied ? <><CheckCircle2 size={12} /> 已复制</> : <><Copy size={12} /> 复制</>}
              </button>
            </div>
          </div>

          <p className="text-xs text-ink-3">
            将邀请码分享给好友，好友注册时填写即可激活奖励。
          </p>
        </div>

        {/* How it works */}
        <div className="card p-6">
          <h2 className="font-extrabold text-ink mb-4 flex items-center gap-2">
            <Users size={18} className="text-brand-700" /> 邀请流程
          </h2>
          <div className="space-y-4">
            {[
              { step: '1', title: '分享邀请码', desc: '将你的邀请码分享给好友' },
              { step: '2', title: '好友注册', desc: '好友使用邀请码注册新账号' },
              { step: '3', title: '双方获奖', desc: '你和好友各获得 1 次免费检测' },
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-brand-700 text-white flex items-center justify-center font-bold text-sm shrink-0">{s.step}</div>
                <div>
                  <p className="font-bold text-ink">{s.title}</p>
                  <p className="text-sm text-ink-3">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
  )
}
