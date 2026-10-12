import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BrandLogo from '@/components/ui/BrandLogo'
import { useAuthStore } from '@/stores/authStore'
import SliderCaptcha from '@/components/ui/SliderCaptcha'
import { RegisterModal, ResetPasswordModal } from '@/components/ui/AccountModals'
import { Eye, EyeOff, Loader2, User, Lock, Smartphone, Check } from 'lucide-react'

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
    <div className="min-h-screen flex flex-col relative bg-page" style={{ background: 'url(/login-bg.jpg) center / cover no-repeat var(--page)' }}>
      {/* ═══ 左上角署名（点击返回首页） ═══ */}
      <Link to="/" className="flex lg:absolute lg:top-[34px] lg:left-[44px] items-center gap-3 px-6 pt-6 lg:p-0 z-10 cursor-pointer shrink-0">
        <BrandLogo size={44} />
        <div className="leading-tight">
          <p className="text-[17px] font-extrabold text-ink">研究生课程论文写作训练与学术规范检测系统</p>
          <p className="text-[10px] text-ink-3 tracking-wider">GRADUATE COURSE PAPER WRITING &amp; ACADEMIC NORMS DETECTION SYSTEM</p>
        </div>
      </Link>

      {/* ═══ 主区域：左产品介绍 + 右登录卡 ═══ */}
      <div className="flex-1 flex items-center justify-center gap-12 xl:gap-20 px-8 pt-[86px] pb-[64px]">
        {/* 左：轮播样式静态内容（上文本 + 下示意图） */}
        <div className="hidden lg:block w-[50%] max-w-[680px] shrink-0">
          {/* 文本（依据检测报告与产品手册生成） */}
          <h1 className="text-[34px] font-black leading-tight mb-5">
            <span className="text-brand-700">写作训练</span>
            <span className="mx-3 text-line font-normal">|</span>
            <span className="text-ink">学术规范检测</span>
          </h1>
          <p className="text-[15px] leading-[26px] text-ink-2">
            系统从学术诚信、格式规范、语言表达、结构逻辑四大维度开展智能质检，
            依托十万级学术资源库与动态语义＋指纹比对算法，精准识别重复内容，
            并结合 AI 生成特征算法快速识别疑似 AI 生成文本，输出结构化改进建议。
          </p>
          <p className="mt-6 text-[15px] font-bold text-ink">适用论文类型</p>
          <div className="mt-3 flex flex-wrap gap-x-8 gap-y-2">
            {['研究生课程论文'].map(s => (
              <span key={s} className="flex items-center gap-1.5 text-[14px] text-ink">
                <span className="w-[18px] h-[18px] rounded-full bg-brand flex items-center justify-center">
                  <Check size={11} className="text-white" />
                </span>
                {s}
              </span>
            ))}
          </div>

          {/* 示意图（浏览器窗口 + 检测标签 + 检测报告插画） */}
          <div className="relative mt-9 select-none" aria-hidden>
            <img
              src="/login-illustration.png"
              alt=""
              className="h-[420px] w-auto -mb-[120px]"
              draggable={false}
            />
          </div>
        </div>

        {/* 右：登录卡片 */}
        <div className="relative w-full max-w-[440px] card px-10 py-9">
          <h2 className="text-[26px] font-bold text-ink mb-5">欢迎登录</h2>

          {/* Tab：用户登录 / 验证码登录 */}
          <div className="flex gap-8 border-b border-line mb-6">
            {([['account', '用户登录'], ['code', '验证码登录']] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => { setTab(key); setError('') }}
                className={`pb-2.5 text-[16px] -mb-px border-b-2 transition-colors ${
                  tab === key ? 'text-brand-700 border-brand font-medium' : 'text-ink-2 border-transparent hover:text-brand'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 bg-danger-soft text-danger text-caption rounded-md px-4 py-2.5">{error}</div>
          )}

          {tab === 'account' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <User size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
                <input
                  className="input-field h-11 pl-10 pr-3"
                  placeholder="手机号/用户名"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="relative">
                <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
                <input
                  className="input-field h-11 pl-10 pr-11"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="密码"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink-2"
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
                className="btn-primary w-full !h-11 text-subtitle"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : '立即登录'}
              </button>
            </form>
          ) : (
            <form onSubmit={e => { e.preventDefault(); setError('验证码登录功能开发中') }} className="space-y-4">
              <div className="relative">
                <Smartphone size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
                <input
                  className="input-field h-11 pl-10 pr-3"
                  placeholder="手机号"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                />
              </div>
              <div className="relative">
                <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
                <input
                  className="input-field h-11 pl-10 pr-28"
                  placeholder="验证码"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={handleSendCode}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[13px] text-brand font-medium hover:text-brand-800"
                >
                  获取验证码
                </button>
              </div>
              <button
                type="submit"
                className="btn-primary w-full !h-11 text-subtitle"
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
              className="mt-0.5 accent-brand"
            />
            <span className="text-caption text-ink-2 leading-[20px]">
              我已阅读
              <span onClick={() => setProtocolModal('register')} className="link mx-0.5" style={{ cursor: 'pointer' }}>《用户注册协议》</span>
              、
              <span onClick={() => setProtocolModal('privacy')} className="link mx-0.5" style={{ cursor: 'pointer' }}>《用户隐私政策》</span>
            </span>
          </label>

          {/* 协议弹窗（z-[60] 确保在注册弹窗 z-50 之上） */}
          {protocolModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(29,33,41,.45)] backdrop-blur-[2px]" onClick={() => setProtocolModal(null)}>
              <div className="relative modal w-[90%] max-w-[640px] max-h-[80vh]" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h3 className="text-[16px] font-bold text-ink">
                    {protocolModal === 'register' ? '用户注册协议' : '用户隐私政策'}
                  </h3>
                  <button onClick={() => setProtocolModal(null)} className="text-ink-3 hover:text-ink text-xl leading-none">&times;</button>
                </div>
                <div className="modal-body agreement-content" dangerouslySetInnerHTML={{ __html: protocolHtml }} />
                <div className="modal-footer">
                  <button onClick={() => setProtocolModal(null)} className="btn-primary btn-md">
                    关闭
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 底部链接（1:1 复刻官网样式与点击交互：免费注册→用户注册弹窗，忘记密码→忘记密码弹窗） */}
          <div className="mt-4 mb-5 flex items-center justify-between text-[14px] text-ink-2">
            <button type="button" onClick={() => setShowRegister(true)} className="cursor-pointer link">免费注册</button>
            <button type="button" onClick={() => setShowReset(true)} className="cursor-pointer link">忘记密码？</button>
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
