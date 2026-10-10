import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BrandLogo from '@/components/ui/BrandLogo'
import { useAuthStore } from '@/stores/authStore'
import SliderCaptcha from '@/components/ui/SliderCaptcha'
import { RegisterModal, ResetPasswordModal } from '@/components/ui/AccountModals'
import { Eye, EyeOff, Loader2, User, Lock, Smartphone, Check, Search } from 'lucide-react'

export default function LoginPage() {
  const [tab, setTab] = useState<'account' | 'code'>('account')
  const [protocolModal, setProtocolModal] = useState<'register' | 'privacy' | null>(null)
  const [protocolHtml, setProtocolHtml] = useState('')
  const [showRegister, setShowRegister] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [captchaDone, setCaptchaDone] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const { login, loading } = useAuthStore()
  const nav = useNavigate()

  // 协议弹窗打开时加载对应 HTML 内容
  useEffect(() => {
    if (!protocolModal) { setProtocolHtml(''); return }
    const file = protocolModal === 'register' ? '/agreement-register.html' : '/agreement-privacy.html'
    fetch(file).then(r => r.text()).then(setProtocolHtml).catch(() => setProtocolHtml(''))
  }, [protocolModal])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!captchaDone) {
      setError('请先完成滑块验证')
      return
    }
    if (!agreed) {
      setError('请先阅读并同意《用户注册协议》与《用户隐私政策》')
      return
    }
    try {
      await login(username, password)
      nav('/dashboard')
    } catch (err: any) {
      setError(err.message || '登录失败')
    }
  }

  function handleSendCode() {
    alert('验证码发送功能开发中')
  }

  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: 'url(/login-bg.jpg) center / cover no-repeat #eef2ff' }}>
      {/* ═══ 左上角署名（点击返回首页） ═══ */}
      <Link to="/" className="flex lg:absolute lg:top-[34px] lg:left-[44px] items-center gap-3 px-6 pt-6 lg:p-0 z-10 cursor-pointer shrink-0">
        <BrandLogo size={44} />
        <div className="leading-tight">
          <p className="text-[17px] font-extrabold text-[#1d2129]">研究生课程论文写作训练与学术规范检测系统</p>
          <p className="text-[10px] text-[#86909c] tracking-wider">GRADUATE COURSE PAPER WRITING &amp; ACADEMIC NORMS DETECTION SYSTEM</p>
        </div>
      </Link>

      {/* ═══ 主区域：左产品介绍 + 右登录卡 ═══ */}
      <div className="flex-1 flex items-center justify-center gap-12 xl:gap-20 px-8 pt-[86px] pb-[64px]">
        {/* 左：轮播样式静态内容（上文本 + 下示意图） */}
        <div className="hidden lg:block w-[50%] max-w-[680px] shrink-0">
          {/* 文本（依据检测报告与产品手册生成） */}
          <h1 className="text-[34px] font-black leading-tight mb-5">
            <span className="text-[#e51b1f]">写作训练</span>
            <span className="mx-3 text-[#dcdfe6] font-normal">|</span>
            <span className="text-[#1d2129]">学术规范检测</span>
          </h1>
          <p className="text-[15px] leading-[26px] text-[#4e5969]">
            系统从学术诚信、格式规范、语言表达、结构逻辑四大维度开展智能质检，
            依托十万级学术资源库与动态语义＋指纹比对算法，精准识别重复内容，
            并结合 AI 生成特征算法快速识别疑似 AI 生成文本，输出结构化改进建议。
          </p>
          <p className="mt-6 text-[15px] font-bold text-[#1d2129]">适用论文类型</p>
          <div className="mt-3 flex flex-wrap gap-x-8 gap-y-2">
            {['研究生课程论文'].map(s => (
              <span key={s} className="flex items-center gap-1.5 text-[14px] text-[#1d2129]">
                <span className="w-[18px] h-[18px] rounded-full bg-[#165DFF] flex items-center justify-center">
                  <Check size={11} className="text-white" />
                </span>
                {s}
              </span>
            ))}
          </div>

          {/* 示意图（参考轮播插画样式：浏览器窗口 + 检测标签） */}
          <div className="relative mt-9 select-none" style={{ aspectRatio: '2.8/1' }} aria-hidden>
            <img
              src="/login-illustration.png"
              alt="课程论文检测示意图"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* 右：登录卡片 */}
        <div className="relative w-full max-w-[440px] bg-white rounded-lg shadow-[0_8px_40px_rgba(29,33,41,0.08)] px-10 py-9">
          <h2 className="text-[26px] font-bold text-[#1d2129] mb-5">欢迎登录</h2>

          {/* Tab：用户登录 / 验证码登录 */}
          <div className="flex gap-8 border-b border-[#e5e6eb] mb-6">
            {([['account', '用户登录'], ['code', '验证码登录']] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => { setTab(key); setError('') }}
                className={`pb-2.5 text-[16px] -mb-px border-b-2 transition-colors ${
                  tab === key ? 'text-[#E44548] border-[#E44548] font-medium' : 'text-[#4e5969] border-transparent hover:text-[#E44548]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 bg-[#ffece8] text-[#f53f3f] text-sm rounded px-4 py-2.5">{error}</div>
          )}

          {tab === 'account' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <User size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86909c]" />
                <input
                  className="w-full h-11 pl-10 pr-3 rounded border border-[#e5e6eb] text-[14px] text-[#1d2129] placeholder:text-[#86909c] focus:outline-none focus:border-[#E44548]"
                  placeholder="手机号/用户名"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="relative">
                <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86909c]" />
                <input
                  className="w-full h-11 pl-10 pr-11 rounded border border-[#e5e6eb] text-[14px] text-[#1d2129] placeholder:text-[#86909c] focus:outline-none focus:border-[#E44548]"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="密码"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#86909c] hover:text-[#4e5969]"
                  onClick={() => setShowPwd(!showPwd)}
                >
                  {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              {/* 滑块验证 */}
              <SliderCaptcha done={captchaDone} onDone={() => setCaptchaDone(true)} />

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded bg-[#E44548] hover:bg-[#c93a3d] disabled:opacity-60 text-white text-[15px] font-medium flex items-center justify-center transition-colors"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : '立即登录'}
              </button>
            </form>
          ) : (
            <form onSubmit={e => { e.preventDefault(); setError('验证码登录功能开发中') }} className="space-y-4">
              <div className="relative">
                <Smartphone size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86909c]" />
                <input
                  className="w-full h-11 pl-10 pr-3 rounded border border-[#e5e6eb] text-[14px] text-[#1d2129] placeholder:text-[#86909c] focus:outline-none focus:border-[#E44548]"
                  placeholder="手机号"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                />
              </div>
              <div className="relative">
                <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86909c]" />
                <input
                  className="w-full h-11 pl-10 pr-28 rounded border border-[#e5e6eb] text-[14px] text-[#1d2129] placeholder:text-[#86909c] focus:outline-none focus:border-[#E44548]"
                  placeholder="验证码"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={handleSendCode}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[13px] text-[#E44548] font-medium"
                >
                  获取验证码
                </button>
              </div>
              <button
                type="submit"
                className="w-full h-11 rounded bg-[#E44548] hover:bg-[#c93a3d] text-white text-[15px] font-medium transition-colors"
              >
                立即登录
              </button>
            </form>
          )}

          {/* 协议勾选 */}
          <label className="mt-4 flex items-start gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="mt-0.5 accent-[#E44548]"
            />
            <span className="text-[13px] text-[#4e5969] leading-[20px]">
              我已阅读
              <span onClick={() => setProtocolModal('register')} className="text-[#165DFF] mx-0.5" style={{ cursor: 'pointer' }}>《用户注册协议》</span>
              、
              <span onClick={() => setProtocolModal('privacy')} className="text-[#165DFF] mx-0.5" style={{ cursor: 'pointer' }}>《用户隐私政策》</span>
            </span>
          </label>

          {/* 协议弹窗 */}
          {protocolModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setProtocolModal(null)}>
              <div className="relative bg-white rounded-lg shadow-2xl w-[90%] max-w-[640px] max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e6eb]">
                  <h3 className="text-[16px] font-bold text-[#1d2129]">
                    {protocolModal === 'register' ? '用户注册协议' : '用户隐私政策'}
                  </h3>
                  <button onClick={() => setProtocolModal(null)} className="text-[#86909c] hover:text-[#1d2129] text-xl leading-none">&times;</button>
                </div>
                <div className="px-6 py-4 overflow-y-auto flex-1 agreement-content" dangerouslySetInnerHTML={{ __html: protocolHtml }} />
                <div className="flex justify-end px-6 py-3 border-t border-[#e5e6eb]">
                  <button onClick={() => setProtocolModal(null)} className="px-6 py-2 rounded bg-[#E44548] hover:bg-[#c93a3d] text-white text-[14px] transition-colors">
                    关闭
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 底部链接（1:1 复刻官网样式与点击交互：免费注册→用户注册弹窗，忘记密码→忘记密码弹窗） */}
          <div className="mt-4 mb-5 flex items-center justify-between text-[14px] text-[#515a6e]">
            <button type="button" onClick={() => setShowRegister(true)} className="cursor-pointer">免费注册</button>
            <button type="button" onClick={() => setShowReset(true)} className="cursor-pointer">忘记密码？</button>
          </div>
        </div>
      </div>

      {/* 用户注册弹窗（官网同款：450px，遮罩/ESC 不可关闭） */}
      <RegisterModal
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        onOpenProtocol={p => setProtocolModal(p)}
      />
      {/* 忘记密码弹窗（官网同款：400px，遮罩/ESC 不可关闭） */}
      <ResetPasswordModal
        isOpen={showReset}
        onClose={() => setShowReset(false)}
      />
    </div>
  )
}
