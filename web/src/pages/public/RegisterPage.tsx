import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BrandLogo from '@/components/ui/BrandLogo'
import { useAuthStore } from '@/stores/authStore'
import { UserPlus, Loader2 } from 'lucide-react'
import Footer from '@/components/ui/Footer'

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', password: '', password2: '', phone: '', nickname: '', referral_code: '' })
  const [error, setError] = useState('')
  const { register, loading } = useAuthStore()
  const nav = useNavigate()

  function update(key: string, val: string) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password !== form.password2) {
      setError('两次输入的密码不一致')
      return
    }
    try {
      await register({
        username: form.username,
        password: form.password,
        phone: form.phone || undefined,
        nickname: form.nickname || undefined,
        referral_code: form.referral_code || undefined,
      })
      nav('/login')
    } catch (err: any) {
      setError(err.message || '注册失败')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left: brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-gradient-hero text-white p-12 flex-col justify-between relative overflow-hidden">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <BrandLogo size={40} />
            <div>
              <p className="font-extrabold text-xl">课程论文检测平台</p>
              <p className="text-brand-100 text-sm">Course Paper Detection Platform</p>
            </div>
          </div>
          <h1 className="text-4xl font-black mb-4">
            开启学术<br />
            <span className="text-brand-100">规范之旅</span>
          </h1>
          <p className="text-brand-100 text-lg max-w-md leading-relaxed">
            注册即享 1 次免费论文检测，四层维度全面评估你的论文质量。
          </p>
        </div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
        <p className="text-brand-100 text-sm">&copy; 2026 课程论文检测平台</p>
      </div>

      {/* Right: register form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <BrandLogo size={36} />
            <span className="text-xl font-extrabold text-brand-700">论文检测平台</span>
          </div>

          <h2 className="text-2xl font-black text-ink mb-1">创建账号</h2>
          <p className="text-ink-3 mb-8">注册即可开始论文检测</p>

          {error && (
            <div className="mb-4 bg-danger-soft text-danger text-caption rounded-md px-4 py-3 font-medium">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-text">用户名 *</label>
              <input className="input-field" placeholder="3-64位字符" value={form.username} onChange={e => update('username', e.target.value)} required minLength={3} maxLength={64} />
            </div>
            <div>
              <label className="label-text">手机号</label>
              <input className="input-field" placeholder="选填" value={form.phone} onChange={e => update('phone', e.target.value)} />
            </div>
            <div>
              <label className="label-text">昵称</label>
              <input className="input-field" placeholder="选填" value={form.nickname} onChange={e => update('nickname', e.target.value)} />
            </div>
            <div>
              <label className="label-text">密码 *</label>
              <input className="input-field" type="password" placeholder="6-128位" value={form.password} onChange={e => update('password', e.target.value)} required minLength={6} />
            </div>
            <div>
              <label className="label-text">确认密码 *</label>
              <input className="input-field" type="password" placeholder="再次输入密码" value={form.password2} onChange={e => update('password2', e.target.value)} required />
            </div>
            <div>
              <label className="label-text">邀请码</label>
              <input className="input-field" placeholder="选填，邀请人注册双方各得1次检测" value={form.referral_code} onChange={e => update('referral_code', e.target.value)} />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full !py-3.5 text-base">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <><UserPlus size={18} /> 立即注册</>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-3">
            已有账号？{' '}
            <Link to="/login" className="link font-semibold">立即登录</Link>
          </p>
          <p className="mt-2 text-center text-sm">
            <Link to="/" className="text-ink-3 hover:text-brand">返回首页</Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}
