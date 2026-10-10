import { useEffect, useState } from 'react'
import { X, Check, Loader2 } from 'lucide-react'
import SliderCaptcha from '@/components/ui/SliderCaptcha'

/* ═══ 官网同款弹窗外壳：标题左对齐 + 右上角关闭；点遮罩、ESC 均不可关闭 ═══ */
function ModalShell({
  width,
  title,
  onClose,
  footer,
  children,
}: {
  width: number
  title: string
  onClose: () => void
  footer: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="overlay">
      <div className="modal" style={{ width }}>
        {/* Header */}
        <div className="modal-header">
          <h3 className="text-subtitle font-bold text-ink">{title}</h3>
          <button onClick={onClose} className="p-1 text-ink-3 hover:text-ink transition-colors">
            <X size={16} />
          </button>
        </div>
        {/* Body */}
        <div className="modal-body">{children}</div>
        {/* Footer */}
        <div className="modal-footer">{footer}</div>
      </div>
    </div>
  )
}

/* 带前缀文本的输入框（Arco input prefix 样式） */
function PrefixInput({
  prefix,
  error,
  suffix,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { prefix: string; error?: string; suffix?: React.ReactNode }) {
  return (
    <div>
      <div className={`flex items-center h-10 border rounded-md bg-white transition-colors focus-within:border-brand focus-within:ring-2 focus-within:ring-brand-soft-2 ${error ? 'border-danger' : 'border-line'}`}>
        <span className="pl-3 pr-2 text-body text-ink-2 whitespace-nowrap shrink-0">{prefix}</span>
        <input
          className="flex-1 min-w-0 h-full pr-3 text-body text-ink outline-none placeholder:text-ink-3"
          {...props}
        />
        {suffix}
      </div>
      {error && <p className="mt-1.5 text-micro text-danger">{error}</p>}
    </div>
  )
}

/* 弹窗底部按钮 */
function FooterButtons({ onCancel, onOk, loading, okText = '确定' }: { onCancel: () => void; onOk: () => void; loading?: boolean; okText?: string }) {
  return (
    <>
      <button onClick={onCancel} className="btn-outline btn-sm">
        取消
      </button>
      <button onClick={onOk} disabled={loading} className="btn-primary btn-sm">
        {loading && <Loader2 size={13} className="animate-spin" />}
        {okText}
      </button>
    </>
  )
}

/* 顶部轻提示（官网 Message 样式） */
function Toast({ text }: { text: string }) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-1.5 bg-white border border-line rounded-lg px-4 py-2.5 shadow-md text-body text-ink">
      <span className="w-4 h-4 rounded-full bg-success flex items-center justify-center shrink-0">
        <Check size={11} className="text-white" />
      </span>
      {text}
    </div>
  )
}

/* 倒计时 Hook */
function useCountdown() {
  const [countdown, setCountdown] = useState(0)
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])
  return { countdown, setCountdown }
}

/* ═══════════ 用户注册弹窗（450px，1:1 复刻官网） ═══════════ */
export function RegisterModal({
  isOpen,
  onClose,
  onOpenProtocol,
}: {
  isOpen: boolean
  onClose: () => void
  onOpenProtocol: (p: 'register' | 'privacy') => void
}) {
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [captchaDone, setCaptchaDone] = useState(false)
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')
  const { countdown, setCountdown } = useCountdown()

  if (!isOpen) return null

  function handleSendCode() {
    if (countdown > 0) return
    const errs: Record<string, string> = {}
    if (!captchaDone) errs.captcha = '请点击按钮完成验证'
    if (!/^1\d{10}$/.test(phone)) errs.phone = '请输入正确的手机号'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    setCountdown(60)
  }

  function handleOk() {
    const errs: Record<string, string> = {}
    if (!/^[a-zA-Z0-9]{6,20}$/.test(username)) errs.username = '长度6到20个字符，仅由大小写字母和数字构成'
    if (!/^1\d{10}$/.test(phone)) errs.phone = '请输入正确的手机号'
    if (!captchaDone) errs.captcha = '请点击按钮完成验证'
    if (!code) errs.code = '请填写验证码'
    if (!password) errs.password = '请填写密码'
    if (!agreed) errs.agreed = '请先阅读并同意《用户注册协议》与《用户隐私政策》'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onClose()
      setToast('注册成功')
      setTimeout(() => setToast(''), 2000)
    }, 800)
  }

  return (
    <>
      {toast && <Toast text={toast} />}
      <ModalShell
        width={450}
        title="用户注册"
        onClose={onClose}
        footer={<FooterButtons onCancel={onClose} onOk={handleOk} loading={loading} />}
      >
        <div className="space-y-4">
          <PrefixInput
            prefix="用户名"
            placeholder="长度6到20个字符，仅由大小写字母和数字构成"
            value={username}
            onChange={e => setUsername(e.target.value)}
            error={errors.username}
          />
          <PrefixInput
            prefix="手机号"
            placeholder="请输入手机号"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            error={errors.phone}
          />
          <div>
            <SliderCaptcha done={captchaDone} onDone={() => { setCaptchaDone(true); setErrors(e => ({ ...e, captcha: '' })) }} />
            {errors.captcha && <p className="mt-1.5 text-micro text-danger">{errors.captcha}</p>}
          </div>
          <PrefixInput
            prefix="验证码"
            placeholder="请输入验证码"
            value={code}
            onChange={e => setCode(e.target.value)}
            error={errors.code}
            suffix={
              <button
                type="button"
                onClick={handleSendCode}
                className={`pr-3 shrink-0 text-[13px] whitespace-nowrap transition-colors ${countdown > 0 ? 'text-ink-4 cursor-not-allowed' : 'text-brand hover:text-brand-800'}`}
              >
                {countdown > 0 ? `${countdown}s` : '获取验证码'}
              </button>
            }
          />
          <PrefixInput
            prefix="密码"
            type="password"
            placeholder="请输入"
            value={password}
            onChange={e => setPassword(e.target.value)}
            error={errors.password}
          />
          <div>
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input type="checkbox" checked={agreed} onChange={e => { setAgreed(e.target.checked); setErrors(er => ({ ...er, agreed: '' })) }} className="accent-brand-700" />
              <span className="text-[13px] text-ink-2">
                我已阅读
                <span onClick={() => onOpenProtocol('register')} className="link mx-0.5 cursor-pointer">《用户注册协议》</span>
                、
                <span onClick={() => onOpenProtocol('privacy')} className="link mx-0.5 cursor-pointer">《用户隐私政策》</span>
              </span>
            </label>
            {errors.agreed && <p className="mt-1.5 text-micro text-danger">{errors.agreed}</p>}
          </div>
          <p className="text-[13px] text-ink-2">
            已有账号
            <span onClick={onClose} className="link ml-1 cursor-pointer">立即登录</span>
          </p>
        </div>
      </ModalShell>
    </>
  )
}

/* ═══════════ 忘记密码弹窗（400px，1:1 复刻官网） ═══════════ */
export function ResetPasswordModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [contact, setContact] = useState('')
  const [captchaDone, setCaptchaDone] = useState(false)
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')
  const { countdown, setCountdown } = useCountdown()

  if (!isOpen) return null

  function handleSendCode() {
    if (countdown > 0) return
    const errs: Record<string, string> = {}
    if (!contact) errs.contact = '请输入手机号'
    if (!captchaDone) errs.captcha = '请点击按钮完成验证'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    setCountdown(60)
  }

  function handleOk() {
    const errs: Record<string, string> = {}
    if (!contact) errs.contact = '请输入手机号'
    if (!captchaDone) errs.captcha = '请点击按钮完成验证'
    if (!code) errs.code = '请输入验证码'
    if (!password) errs.password = '请输入密码'
    if (password && confirmPassword !== password) errs.confirmPassword = '两次密码不一致'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onClose()
      setToast('修改成功')
      setTimeout(() => setToast(''), 2000)
    }, 800)
  }

  return (
    <>
      {toast && <Toast text={toast} />}
      <ModalShell
        width={400}
        title="忘记密码"
        onClose={onClose}
        footer={<FooterButtons onCancel={onClose} onOk={handleOk} loading={loading} />}
      >
        <div className="space-y-4">
          <PrefixInput
            prefix="手机号码"
            placeholder="请输入"
            value={contact}
            onChange={e => setContact(e.target.value)}
            error={errors.contact}
          />
          <div>
            <SliderCaptcha done={captchaDone} onDone={() => { setCaptchaDone(true); setErrors(e => ({ ...e, captcha: '' })) }} />
            {errors.captcha && <p className="mt-1.5 text-micro text-danger">{errors.captcha}</p>}
          </div>
          <PrefixInput
            prefix="验证码"
            placeholder="请输入"
            value={code}
            onChange={e => setCode(e.target.value)}
            error={errors.code}
            suffix={
              <button
                type="button"
                onClick={handleSendCode}
                className={`pr-3 shrink-0 text-[13px] whitespace-nowrap transition-colors ${countdown > 0 ? 'text-ink-4 cursor-not-allowed' : 'text-brand hover:text-brand-800'}`}
              >
                {countdown > 0 ? `${countdown}s` : '获取验证码'}
              </button>
            }
          />
          <PrefixInput
            prefix="新密码"
            type="password"
            placeholder="请输入"
            value={password}
            onChange={e => setPassword(e.target.value)}
            error={errors.password}
          />
          <PrefixInput
            prefix="确认新密码"
            type="password"
            placeholder="请输入"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
          />
        </div>
      </ModalShell>
    </>
  )
}
