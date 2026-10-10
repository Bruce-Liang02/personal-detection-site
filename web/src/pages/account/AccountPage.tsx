import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useNavigate } from 'react-router-dom'
import { Smartphone, Lock, LogOut, HelpCircle, X, Eye, EyeOff } from 'lucide-react'

/* ─── 滑块验证组件 ─── */
function SliderCaptcha({ onVerified }: { onVerified: () => void }) {
  const [done, setDone] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState(0)
  const sliderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!dragging) return
    const handleMove = (e: MouseEvent) => {
      if (!sliderRef.current) return
      const rect = sliderRef.current.getBoundingClientRect()
      const p = Math.min(Math.max(0, e.clientX - rect.left), rect.width)
      setProgress((p / rect.width) * 100)
      if (p / rect.width >= 0.95) {
        setDone(true)
        setDragging(false)
        onVerified()
      }
    }
    const handleUp = () => {
      if (!done) setProgress(0)
      setDragging(false)
    }
    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleUp)
    return () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleUp)
    }
  }, [dragging, done, onVerified])

  return (
    <div
      ref={sliderRef}
      className={`relative h-10 rounded-md border select-none overflow-hidden ${
        done ? 'bg-success-soft border-success-border' : 'bg-line-soft border-line'
      }`}
      onMouseDown={(e) => {
        if (!done) { e.preventDefault(); setDragging(true) }
      }}
    >
      {progress > 0 && (
        <div
          className={`absolute top-0 left-0 h-full ${done ? 'bg-success-soft' : 'bg-brand-soft-2'}`}
          style={{ width: `${progress}%` }}
        />
      )}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className={`text-body ${done ? 'text-success font-medium' : 'text-ink-3'}`}>
          {done ? '验证通过' : '请按住滑块，拖动到最右边'}
        </span>
      </div>
      <div
        className={`absolute top-0 left-0 h-full w-10 flex items-center justify-center border-r cursor-grab active:cursor-grabbing transition-colors ${
          done
            ? 'bg-success border-success text-white'
            : 'bg-white border-line text-ink-2 hover:text-brand hover:border-brand-line'
        }`}
        style={{ left: done ? 'calc(100% - 40px)' : `${Math.max(0, progress - 5)}%` }}
      >
        <span className="text-caption font-bold">{done ? '✓' : '»'}</span>
      </div>
    </div>
  )
}

/* ─── 验证码倒计时 hook ─── */
function useCountdown() {
  const [countdown, setCountdown] = useState(0)
  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])
  const start = () => setCountdown(60)
  const reset = () => setCountdown(0)
  return { countdown, start, reset }
}

/* ─── 弹窗输入框 ─── */
function ModalField({
  label,
  prefix,
  placeholder,
  type = 'text',
  value,
  onChange,
  disabled,
  right,
}: {
  label?: string
  prefix?: string
  placeholder?: string
  type?: string
  value: string
  onChange?: (v: string) => void
  disabled?: boolean
  right?: React.ReactNode
}) {
  return (
    <div className="mb-4">
      {label && <p className="label-text">{label}</p>}
      <div className={`flex items-center h-10 border rounded-md ${disabled ? 'bg-line-lighter border-line' : 'border-line focus-within:border-brand focus-within:ring-2 focus-within:ring-brand-soft-2 transition-colors'}`}>
        {prefix && <span className="pl-3 text-body text-ink whitespace-nowrap">{prefix}</span>}
        <input
          type={type}
          value={value}
          onChange={e => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`flex-1 h-full px-3 text-body outline-none placeholder:text-ink-3 bg-transparent ${disabled ? 'text-ink-3 cursor-not-allowed' : 'text-ink'}`}
        />
        {right}
      </div>
    </div>
  )
}

/* ─── 账号设置卡片 ─── */
const SETTINGS = [
  {
    icon: Smartphone,
    label: '手机号码',
    status: '已绑定',
    valueKey: 'phone',
    action: '修改',
    modalType: 'phone' as const,
  },
  {
    icon: Lock,
    label: '账号密码',
    status: '已设置',
    valueKey: 'password',
    action: '修改',
    modalType: 'password' as const,
  },
]

type ModalKind = 'phone' | 'password' | 'delete' | null

export default function AccountPage() {
  const nav = useNavigate()
  const { user, logout } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'settings' | 'delete'>('settings')
  const [modalKind, setModalKind] = useState<ModalKind>(null)

  const phone = user?.phone ? user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '188****2642'
  const nickname = user?.nickname || user?.username || '188****2642'

  return (
    <div className="w-full">
      {/* Banner */}
      <div className="relative h-[140px] rounded-lg overflow-hidden bg-brand-gradient-hero">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.07) 20px, rgba(255,255,255,0.07) 40px)',
        }} />
        <div className="relative flex flex-col items-center justify-center h-full">
          <div className="w-16 h-16 rounded-full bg-white/15 ring-2 ring-white/30 flex items-center justify-center mb-2.5">
            <svg width="38" height="38" viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="14" r="8" fill="rgba(255,255,255,.85)" />
              <path d="M4 32c0-7.7 6.3-14 14-14s14 6.3 14 14" fill="rgba(255,255,255,.65)" />
            </svg>
          </div>
          <p className="text-subtitle font-bold text-white">{nickname}</p>
        </div>
      </div>

      {/* Content */}
      <div className="mt-6 bg-white rounded-lg border border-line shadow-card p-6">
        <div className="flex items-center gap-1 mb-6 border-b border-line-soft">
          {(['settings', 'delete'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-body font-bold px-4 pb-3 -mb-px border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-brand text-brand'
                  : 'border-transparent text-ink-2 hover:text-ink'
              }`}
            >
              {tab === 'settings' ? '账号设置' : '账号注销'}
            </button>
          ))}
        </div>

        {activeTab === 'settings' ? (
          <>
            <div className="flex items-center gap-1.5 mb-4">
              <h2 className="section-title">账号设置</h2>
              <HelpCircle size={14} className="text-ink-3 cursor-pointer" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {SETTINGS.map((item, i) => {
                const Icon = item.icon
                const displayValue = item.valueKey === 'phone' ? phone : '密码至少8位字符'
                return (
                  <div key={i} className="card card-hover px-5 py-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-brand-soft flex items-center justify-center shrink-0">
                      <Icon size={20} className="text-brand-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-body font-bold text-ink mb-1">{item.label}</p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-caption text-success flex items-center gap-0.5">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <circle cx="6" cy="6" r="5" fill="currentColor" />
                            <path d="M3.5 6L5.5 8L8.5 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          {item.status}
                        </span>
                        <span className="text-caption text-ink-2">{displayValue}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setModalKind(item.modalType)}
                      className="shrink-0 btn-outline btn-sm"
                    >
                      {item.action}
                    </button>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-4 card px-5 py-5">
            <div className="w-10 h-10 rounded-lg bg-danger-soft flex items-center justify-center shrink-0">
              <LogOut size={20} className="text-danger" />
            </div>
            <div className="flex-1">
              <p className="text-body font-bold text-ink mb-1">注销</p>
              <p className="text-caption text-ink-2">注销后将无法登录系统，无法保留检测报告等内容。</p>
            </div>
            <button
              onClick={() => setModalKind('delete')}
              className="shrink-0 btn-danger btn-sm"
            >
              注销
            </button>
          </div>
        )}
      </div>

      {/* ═══ 修改手机号弹窗 ═══ */}
      {modalKind === 'phone' && <ChangePhoneModal phone={phone} onClose={() => setModalKind(null)} />}

      {/* ═══ 修改账号密码弹窗 ═══ */}
      {modalKind === 'password' && <ChangePasswordModal phone={phone} onClose={() => setModalKind(null)} />}

      {/* ═══ 注销账号弹窗 ═══ */}
      {modalKind === 'delete' && <DeleteAccountModal phone={phone} onClose={() => setModalKind(null)} onConfirmed={() => { setModalKind(null); logout(); nav('/') }} />}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   修改手机号弹窗（3步骤：密码验证 → 绑定新手机号 → 完成）
   ═══════════════════════════════════════════════════════ */
function ChangePhoneModal({ phone, onClose }: { phone: string; onClose: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1)

  // Step 1 state
  const [password, setPassword] = useState('')
  const [sliderOk, setSliderOk] = useState(false)
  const [smsCode, setSmsCode] = useState('')
  const { countdown, start, reset } = useCountdown()

  // Step 2 state
  const [newPhone, setNewPhone] = useState('')
  const [newPhoneCode, setNewPhoneCode] = useState('')
  const { countdown: newCountdown, start: newStart, reset: newReset } = useCountdown()

  function handleGetSms() {
    if (!sliderOk || countdown > 0) return
    start()
  }

  function handleGetNewSms() {
    if (!newPhone || newCountdown > 0) return
    newStart()
  }

  function handleNext() {
    if (step === 1) {
      if (!password || !sliderOk || !smsCode) return
      setStep(2)
    } else if (step === 2) {
      if (!newPhone || !newPhoneCode) return
      setStep(3)
    }
  }

  function handleReset() {
    setSliderOk(false)
    setSmsCode('')
    reset()
  }

  function handlePrev() {
    setStep(1)
    handleReset()
  }

  function handleConfirm() {
    alert('手机号修改成功')
    onClose()
  }

  /* ── 步骤条 ── */
  const STEPS = [
    { num: 1, label: '密码验证' },
    { num: 2, label: '绑定新手机号' },
    { num: 3, label: '完成' },
  ]

  return (
    <div className="overlay">
      <div className="modal w-[520px]">
        {/* Header */}
        <div className="modal-header">
          <h2 className="section-title">修改手机号</h2>
          <button onClick={onClose} className="text-ink-3 hover:text-ink transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="px-8 pt-6 pb-4 border-b border-line-soft">
          <div className="flex items-center">
            {STEPS.map((s, i) => {
              const isActive = s.num === step
              const isPast = s.num < step
              return (
                <div key={s.num} className="flex items-center flex-1 last:flex-none">
                  {/* Circle + label */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-caption font-bold ${
                      isActive || isPast ? 'bg-brand text-white' : 'bg-line-soft text-ink-3'
                    }`}>{s.num}</div>
                    <span className={`text-body ${isActive || isPast ? 'font-bold text-ink' : 'font-normal text-ink-3'}`}>
                      {s.label}
                    </span>
                  </div>
                  {/* Connector line */}
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 mx-3 border-t-2 ${
                      isPast ? 'border-dashed border-brand-300' : 'border-solid border-line'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* ── Step 1: 密码验证 ── */}
          {step === 1 && (
            <>
              {/* Warning */}
              <div className="mb-4 bg-warning-soft border border-warning-border rounded-md px-4 py-2.5 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                  <circle cx="8" cy="8" r="7" stroke="var(--warning)" strokeWidth="1.5" />
                  <path d="M8 4.5v4" stroke="var(--warning)" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="8" cy="11" r="0.75" fill="var(--warning)" />
                </svg>
                <span className="text-caption text-warning">修改手机号码后，将无法通过原手机号码登录</span>
              </div>

              {/* Password input */}
              <ModalField label="密码" placeholder="请输入" value={password} onChange={setPassword} />

              {/* Current phone (greyed out) */}
              <div className="mb-4">
                <div className="flex items-center h-10 bg-line-lighter border border-line rounded-md px-4">
                  <span className="text-body text-ink-3">当前手机号码</span>
                  <span className="ml-3 text-body text-ink-2 tnum">{phone}</span>
                </div>
              </div>

              {/* Slider captcha */}
              <div className="mb-4">
                <SliderCaptcha onVerified={() => setSliderOk(true)} />
              </div>

              {/* SMS verification code */}
              <div className="mb-2 flex items-center gap-2">
                <div className="flex-1 flex items-center border border-line rounded-md h-10 px-3 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand-soft-2 transition-colors">
                  <span className="text-body text-ink mr-2 whitespace-nowrap">验证码</span>
                  <input
                    type="text"
                    value={smsCode}
                    onChange={e => setSmsCode(e.target.value)}
                    placeholder="请输入"
                    className="flex-1 h-full text-body outline-none placeholder:text-ink-3"
                  />
                </div>
                <button
                  onClick={handleGetSms}
                  disabled={!sliderOk || countdown > 0}
                  className={`h-10 px-4 text-body rounded-md whitespace-nowrap transition-colors ${
                    !sliderOk || countdown > 0 ? 'text-ink-4 cursor-not-allowed' : 'text-brand hover:text-brand-800'
                  }`}
                >
                  {countdown > 0 ? `${countdown}s 后重新获取` : '获取验证码'}
                </button>
              </div>
            </>
          )}

          {/* ─ Step 2: 绑定新手机号 ── */}
          {step === 2 && (
            <>
              <ModalField label="新手机号码" prefix="+86" placeholder="请输入新手机号码" value={newPhone} onChange={setNewPhone} />

              <div className="mb-2 flex items-center gap-2">
                <div className="flex-1 flex items-center border border-line rounded-md h-10 px-3 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand-soft-2 transition-colors">
                  <span className="text-body text-ink mr-2 whitespace-nowrap">验证码</span>
                  <input
                    type="text"
                    value={newPhoneCode}
                    onChange={e => setNewPhoneCode(e.target.value)}
                    placeholder="请输入"
                    className="flex-1 h-full text-body outline-none placeholder:text-ink-3"
                  />
                </div>
                <button
                  onClick={handleGetNewSms}
                  disabled={!newPhone || newCountdown > 0}
                  className={`h-10 px-4 text-body rounded-md whitespace-nowrap transition-colors ${
                    !newPhone || newCountdown > 0 ? 'text-ink-4 cursor-not-allowed' : 'text-brand hover:text-brand-800'
                  }`}
                >
                  {newCountdown > 0 ? `${newCountdown}s 后重新获取` : '获取验证码'}
                </button>
              </div>
            </>
          )}

          {/* ── Step 3: 完成 ── */}
          {step === 3 && (
            <div className="flex flex-col items-center justify-center py-8">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="mb-4">
                <circle cx="32" cy="32" r="32" fill="currentColor" opacity="0.1" style={{ color: 'var(--success)' }} />
                <circle cx="32" cy="32" r="22" fill="currentColor" opacity="0.2" style={{ color: 'var(--success)' }} />
                <circle cx="32" cy="32" r="14" fill="currentColor" style={{ color: 'var(--success)' }} />
                <path d="M24 32l6 6 10-10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-subtitle font-bold text-ink mb-1">修改成功</p>
              <p className="text-body text-ink-3">您的手机号码已成功修改为 {newPhone ? newPhone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '新号码'}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn-outline btn-md">
            取消
          </button>
          {step === 1 && (
            <button onClick={handleNext} disabled={!password || !sliderOk || !smsCode} className="btn-primary btn-md">
              下一步
            </button>
          )}
          {step === 2 && (
            <>
              <button onClick={handlePrev} className="btn-outline btn-md">
                上一步
              </button>
              <button onClick={handleNext} disabled={!newPhone || !newPhoneCode} className="btn-primary btn-md">
                下一步
              </button>
            </>
          )}
          {step === 3 && (
            <button onClick={handleConfirm} className="btn-primary btn-md">
              完成
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   修改账号密码弹窗
   ═══════════════════════════════════════════════════════ */
function ChangePasswordModal({ phone, onClose }: { phone: string; onClose: () => void }) {
  const [sliderOk, setSliderOk] = useState(false)
  const [smsCode, setSmsCode] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const { countdown, start } = useCountdown()

  function handleGetSms() {
    if (!sliderOk || countdown > 0) return
    start()
  }

  function handleConfirm() {
    if (newPwd !== confirmPwd) {
      alert('两次密码输入不一致')
      return
    }
    if (newPwd.length < 8) {
      alert('密码至少8位字符')
      return
    }
    alert('密码修改成功')
    onClose()
  }

  return (
    <div className="overlay">
      <div className="modal w-[480px]">
        <div className="modal-header">
          <h2 className="section-title">修改账号密码</h2>
          <button onClick={onClose} className="text-ink-3 hover:text-ink transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* 当前手机号 */}
          <ModalField prefix="当前手机号码" value={phone} disabled />

          {/* 滑块验证 */}
          <div className="mb-4">
            <SliderCaptcha onVerified={() => setSliderOk(true)} />
          </div>

          {/* 短信验证码 */}
          <div className="mb-4 flex items-center gap-2">
            <div className="flex-1 flex items-center border border-line rounded-md h-10 px-3 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand-soft-2 transition-colors">
              <span className="text-body text-ink mr-2 whitespace-nowrap">验证码</span>
              <input
                type="text"
                value={smsCode}
                onChange={e => setSmsCode(e.target.value)}
                placeholder="请输入"
                className="flex-1 h-full text-body outline-none placeholder:text-ink-3"
              />
            </div>
            <button
              onClick={handleGetSms}
              disabled={!sliderOk || countdown > 0}
              className={`h-10 px-4 text-body rounded-md whitespace-nowrap transition-colors ${
                !sliderOk || countdown > 0 ? 'text-ink-4 cursor-not-allowed' : 'text-brand hover:text-brand-800'
              }`}
            >
              {countdown > 0 ? `${countdown}s 后重新获取` : '获取验证码'}
            </button>
          </div>

          {/* 新密码 */}
          <div className="mb-4">
            <p className="label-text">新密码</p>
            <div className="flex items-center h-10 border border-line rounded-md focus-within:border-brand focus-within:ring-2 focus-within:ring-brand-soft-2 transition-colors">
              <input
                type={showPwd ? 'text' : 'password'}
                value={newPwd}
                onChange={e => setNewPwd(e.target.value)}
                placeholder="请输入新密码（至少8位字符）"
                className="flex-1 h-full px-3 text-body outline-none placeholder:text-ink-3 bg-transparent text-ink"
              />
              <button onClick={() => setShowPwd(v => !v)} className="px-3 text-ink-3 hover:text-brand transition-colors">
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* 确认密码 */}
          <div className="mb-4">
            <p className="label-text">确认密码</p>
            <div className="flex items-center h-10 border border-line rounded-md focus-within:border-brand focus-within:ring-2 focus-within:ring-brand-soft-2 transition-colors">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPwd}
                onChange={e => setConfirmPwd(e.target.value)}
                placeholder="请再次输入新密码"
                className="flex-1 h-full px-3 text-body outline-none placeholder:text-ink-3 bg-transparent text-ink"
              />
              <button onClick={() => setShowConfirm(v => !v)} className="px-3 text-ink-3 hover:text-brand transition-colors">
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-outline btn-md">
            取消
          </button>
          <button onClick={handleConfirm} disabled={!smsCode || !newPwd || !confirmPwd} className="btn-primary btn-md">
            确定
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   注销账号弹窗
   ═══════════════════════════════════════════════════════ */
function DeleteAccountModal({ phone, onClose, onConfirmed }: { phone: string; onClose: () => void; onConfirmed: () => void }) {
  const [sliderOk, setSliderOk] = useState(false)
  const [smsCode, setSmsCode] = useState('')
  const { countdown, start } = useCountdown()

  function handleGetSms() {
    if (!sliderOk || countdown > 0) return
    start()
  }

  return (
    <div className="overlay">
      <div className="modal w-[480px]">
        <div className="modal-header">
          <h2 className="section-title text-danger">注销账号</h2>
          <button onClick={onClose} className="text-ink-3 hover:text-ink transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <ModalField prefix="当前手机号码" value={phone} disabled />

          <div className="mb-4">
            <SliderCaptcha onVerified={() => setSliderOk(true)} />
          </div>

          <div className="mb-4 flex items-center gap-2">
            <div className="flex-1 flex items-center border border-line rounded-md h-10 px-3 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand-soft-2 transition-colors">
              <span className="text-body text-ink mr-2 whitespace-nowrap">验证码</span>
              <input
                type="text"
                value={smsCode}
                onChange={e => setSmsCode(e.target.value)}
                placeholder="请输入"
                className="flex-1 h-full text-body outline-none placeholder:text-ink-3"
              />
            </div>
            <button
              onClick={handleGetSms}
              disabled={!sliderOk || countdown > 0}
              className={`h-10 px-4 text-body rounded-md whitespace-nowrap transition-colors ${
                !sliderOk || countdown > 0 ? 'text-ink-4 cursor-not-allowed' : 'text-brand hover:text-brand-800'
              }`}
            >
              {countdown > 0 ? `${countdown}s 后重新获取` : '获取验证码'}
            </button>
          </div>

          <div className="bg-danger-soft border border-danger-border rounded-md px-4 py-2.5">
            <p className="text-caption text-danger">注销后将无法登录系统，无法保留检测报告等内容！</p>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-outline btn-md">
            取消
          </button>
          <button onClick={onConfirmed} disabled={!smsCode} className="btn-danger btn-md">
            确定
          </button>
        </div>
      </div>
    </div>
  )
}