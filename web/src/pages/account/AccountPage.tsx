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
      className="relative h-[40px] bg-[#F7F8FA] border border-[#E5E6EB] rounded overflow-hidden select-none"
      onMouseDown={(e) => {
        if (!done) { e.preventDefault(); setDragging(true) }
      }}
    >
      {progress > 0 && (
        <div className="absolute top-0 left-0 h-full bg-[#E8F0FE]" style={{ width: `${progress}%` }} />
      )}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className={`text-[14px] ${done ? 'text-[#00B42A]' : 'text-[#C9CDD4]'}`}>
          {done ? '验证通过' : '请按住滑块，拖动到最右边'}
        </span>
      </div>
      <div
        className={`absolute top-0 left-0 h-full w-[40px] flex items-center justify-center border-r border-[#E5E6EB] cursor-grab active:cursor-grabbing transition-colors ${
          done ? 'bg-[#00B42A] border-[#00B42A]' : 'bg-white hover:bg-[#F7F8FA]'
        }`}
        style={{ left: done ? 'calc(100% - 40px)' : `${Math.max(0, progress - 5)}%` }}
      >
        <span className={done ? 'text-white' : 'text-[#4E5969]'}>{done ? '✓' : '>>'}</span>
      </div>
    </div>
  )
}

/* ─── 验证码倒计时 hook ── */
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
      {label && <p className="text-[14px] text-[#1D2129] font-medium mb-2">{label}</p>}
      <div className={`flex items-center h-[40px] border rounded ${disabled ? 'bg-[#F7F8FA] border-[#E5E6EB]' : 'border-[#E5E6EB]'}`}>
        {prefix && <span className="pl-4 text-[14px] text-[#1D2129] whitespace-nowrap">{prefix}</span>}
        <input
          type={type}
          value={value}
          onChange={e => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`flex-1 h-full px-3 text-[14px] outline-none placeholder:text-[#C9CDD4] bg-transparent ${disabled ? 'text-[#86909C] cursor-not-allowed' : 'text-[#1D2129]'}`}
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
      <div className="relative h-[120px] rounded overflow-hidden" style={{
        background: 'linear-gradient(135deg, #E8F0FE 0%, #D4E4FC 30%, #C8DBF8 60%, #B8D0F4 100%)',
      }}>
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.15) 20px, rgba(255,255,255,0.15) 40px)',
        }} />
        <div className="relative flex flex-col items-center justify-center h-full">
          <div className="w-[64px] h-[64px] rounded-full bg-[#FFE0E0] flex items-center justify-center mb-2">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="14" r="8" fill="#FFB0B0" />
              <path d="M4 32c0-7.7 6.3-14 14-14s14 6.3 14 14" fill="#FF8080" />
            </svg>
          </div>
          <p className="text-[16px] font-bold text-[#1D2129]">{nickname}</p>
        </div>
      </div>

      {/* Content */}
      <div className="mt-6 bg-white rounded-sm p-6">
        <div className="flex items-center gap-1 mb-6">
          {(['settings', 'delete'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[16px] font-bold px-4 pb-2 border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-[#F53F3F] text-[#F53F3F]'
                  : 'border-transparent text-[#1D2129] hover:text-[#4E5969]'
              }`}
            >
              {tab === 'settings' ? '账号设置' : '账号注销'}
            </button>
          ))}
        </div>

        {activeTab === 'settings' ? (
          <>
            <div className="flex items-center gap-1.5 mb-4">
              <h2 className="text-[16px] font-bold text-[#1D2129]">账号设置</h2>
              <HelpCircle size={14} className="text-[#86909C] cursor-pointer" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {SETTINGS.map((item, i) => {
                const Icon = item.icon
                const displayValue = item.valueKey === 'phone' ? phone : '密码至少8位字符'
                return (
                  <div key={i} className="border border-[#E5E6EB] rounded px-5 py-4 flex items-center gap-4">
                    <div className="w-[40px] h-[40px] rounded-full bg-[#F7F8FA] flex items-center justify-center shrink-0">
                      <Icon size={20} color="#4E5969" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-bold text-[#1D2129] mb-1">{item.label}</p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] text-[#00B42A] flex items-center gap-0.5">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <circle cx="6" cy="6" r="5" fill="#00B42A" />
                            <path d="M3.5 6L5.5 8L8.5 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          {item.status}
                        </span>
                        <span className="text-[13px] text-[#4E5969]">{displayValue}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setModalKind(item.modalType)}
                      className="shrink-0 h-[32px] px-4 border border-[#E5E6EB] rounded text-[14px] text-[#4E5969] hover:border-[#F53F3F] hover:text-[#F53F3F] transition-colors"
                    >
                      {item.action}
                    </button>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-4 border border-[#E5E6EB] rounded px-5 py-5">
            <div className="w-[40px] h-[40px] rounded-full bg-[#F7F8FA] flex items-center justify-center shrink-0">
              <LogOut size={20} color="#4E5969" />
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-bold text-[#1D2129] mb-1">注销</p>
              <p className="text-[13px] text-[#4E5969]">注销后将无法登录系统，无法保留检测报告等内容。</p>
            </div>
            <button
              onClick={() => setModalKind('delete')}
              className="shrink-0 h-[32px] px-5 border border-[#F53F3F] rounded text-[14px] text-[#F53F3F] hover:bg-[#FFF2F0] transition-colors"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-[520px]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E6EB]">
          <h2 className="text-[18px] font-bold text-[#1D2129]">修改手机号</h2>
          <button onClick={onClose} className="text-[#86909C] hover:text-[#1D2129] transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="px-8 pt-6 pb-4">
          <div className="flex items-center">
            {STEPS.map((s, i) => {
              const isActive = s.num === step
              const isPast = s.num < step
              return (
                <div key={s.num} className="flex items-center flex-1 last:flex-none">
                  {/* Circle + label */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className={`w-[28px] h-[28px] rounded-full flex items-center justify-center text-[14px] font-bold ${
                      isActive || isPast ? 'bg-[#F53F3F] text-white' : 'bg-[#F2F3F5] text-[#86909C]'
                    }`}>{s.num}</div>
                    <span className={`text-[14px] ${isActive || isPast ? 'font-bold text-[#1D2129]' : 'font-normal text-[#86909C]'}`}>
                      {s.label}
                    </span>
                  </div>
                  {/* Connector line */}
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 mx-3 border-t-2 ${
                      isPast ? 'border-dashed border-[#F53F3F]' : 'border-solid border-[#E5E6EB]'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4 min-h-[200px]">
          {/* ── Step 1: 密码验证 ── */}
          {step === 1 && (
            <>
              {/* Warning */}
              <div className="mb-4 bg-[#FFF7E8] border border-[#FFD4A8] rounded px-4 py-2.5 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                  <circle cx="8" cy="8" r="7" stroke="#F77234" strokeWidth="1.5" />
                  <path d="M8 4.5v4" stroke="#F77234" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="8" cy="11" r="0.75" fill="#F77234" />
                </svg>
                <span className="text-[13px] text-[#F77234]">修改手机号码后，将无法通过原手机号码登录</span>
              </div>

              {/* Password input */}
              <ModalField label="密码" placeholder="请输入" value={password} onChange={setPassword} />

              {/* Current phone (greyed out) */}
              <div className="mb-4">
                <div className="flex items-center h-[40px] bg-[#F7F8FA] border border-[#E5E6EB] rounded px-4">
                  <span className="text-[14px] text-[#C9CDD4]">当前手机号码</span>
                  <span className="ml-3 text-[14px] text-[#86909C]">{phone}</span>
                </div>
              </div>

              {/* Slider captcha */}
              <div className="mb-4">
                <SliderCaptcha onVerified={() => setSliderOk(true)} />
              </div>

              {/* SMS verification code */}
              <div className="mb-2 flex items-center gap-2">
                <div className="flex-1 flex items-center border border-[#E5E6EB] rounded h-[40px] px-3">
                  <span className="text-[14px] text-[#1D2129] mr-2 whitespace-nowrap">验证码</span>
                  <input
                    type="text"
                    value={smsCode}
                    onChange={e => setSmsCode(e.target.value)}
                    placeholder="请输入"
                    className="flex-1 h-full text-[14px] outline-none placeholder:text-[#C9CDD4]"
                  />
                </div>
                <button
                  onClick={handleGetSms}
                  disabled={!sliderOk || countdown > 0}
                  className={`h-[40px] px-4 text-[14px] rounded whitespace-nowrap transition-colors ${
                    !sliderOk || countdown > 0 ? 'text-[#C9CDD4] cursor-not-allowed' : 'text-[#F53F3F] hover:text-[#F76560]'
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
                <div className="flex-1 flex items-center border border-[#E5E6EB] rounded h-[40px] px-3">
                  <span className="text-[14px] text-[#1D2129] mr-2 whitespace-nowrap">验证码</span>
                  <input
                    type="text"
                    value={newPhoneCode}
                    onChange={e => setNewPhoneCode(e.target.value)}
                    placeholder="请输入"
                    className="flex-1 h-full text-[14px] outline-none placeholder:text-[#C9CDD4]"
                  />
                </div>
                <button
                  onClick={handleGetNewSms}
                  disabled={!newPhone || newCountdown > 0}
                  className={`h-[40px] px-4 text-[14px] rounded whitespace-nowrap transition-colors ${
                    !newPhone || newCountdown > 0 ? 'text-[#C9CDD4] cursor-not-allowed' : 'text-[#F53F3F] hover:text-[#F76560]'
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
                <circle cx="32" cy="32" r="32" fill="#00B42A" opacity="0.1" />
                <circle cx="32" cy="32" r="22" fill="#00B42A" opacity="0.2" />
                <circle cx="32" cy="32" r="14" fill="#00B42A" />
                <path d="M24 32l6 6 10-10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-[16px] font-bold text-[#1D2129] mb-1">修改成功</p>
              <p className="text-[14px] text-[#86909C]">您的手机号码已成功修改为 {newPhone ? newPhone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '新号码'}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E5E6EB]">
          <button onClick={onClose} className="h-[40px] px-8 border border-[#E5E6EB] rounded-[4px] text-[14px] text-[#4E5969] hover:border-[#C9CDD4] transition-colors">
            取消
          </button>
          {step === 1 && (
            <button
              onClick={handleNext}
              disabled={!password || !sliderOk || !smsCode}
              className={`h-[40px] px-8 rounded-[4px] text-[14px] font-medium transition-colors ${
                password && sliderOk && smsCode ? 'bg-[#F53F3F] hover:bg-[#F76560] text-white' : 'bg-[#F5F6FA] text-[#C9CDD4] cursor-not-allowed'
              }`}
            >
              下一步
            </button>
          )}
          {step === 2 && (
            <>
              <button onClick={handlePrev} className="h-[40px] px-8 border border-[#E5E6EB] rounded-[4px] text-[14px] text-[#4E5969] hover:border-[#C9CDD4] transition-colors">
                上一步
              </button>
              <button
                onClick={handleNext}
                disabled={!newPhone || !newPhoneCode}
                className={`h-[40px] px-8 rounded-[4px] text-[14px] font-medium transition-colors ${
                  newPhone && newPhoneCode ? 'bg-[#F53F3F] hover:bg-[#F76560] text-white' : 'bg-[#F5F6FA] text-[#C9CDD4] cursor-not-allowed'
                }`}
              >
                下一步
              </button>
            </>
          )}
          {step === 3 && (
            <button onClick={handleConfirm} className="h-[40px] px-8 rounded-[4px] text-[14px] font-medium bg-[#F53F3F] hover:bg-[#F76560] text-white transition-colors">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-[480px]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E6EB]">
          <h2 className="text-[18px] font-bold text-[#1D2129]">修改账号密码</h2>
          <button onClick={onClose} className="text-[#86909C] hover:text-[#1D2129] transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5">
          {/* 当前手机号 */}
          <ModalField prefix="当前手机号码" value={phone} disabled />

          {/* 滑块验证 */}
          <div className="mb-4">
            <SliderCaptcha onVerified={() => setSliderOk(true)} />
          </div>

          {/* 短信验证码 */}
          <div className="mb-4 flex items-center gap-2">
            <div className="flex-1 flex items-center border border-[#E5E6EB] rounded h-[40px] px-3">
              <span className="text-[14px] text-[#1D2129] mr-2 whitespace-nowrap">验证码</span>
              <input
                type="text"
                value={smsCode}
                onChange={e => setSmsCode(e.target.value)}
                placeholder="请输入"
                className="flex-1 h-full text-[14px] outline-none placeholder:text-[#C9CDD4]"
              />
            </div>
            <button
              onClick={handleGetSms}
              disabled={!sliderOk || countdown > 0}
              className={`h-[40px] px-4 text-[14px] rounded whitespace-nowrap transition-colors ${
                !sliderOk || countdown > 0 ? 'text-[#C9CDD4] cursor-not-allowed' : 'text-[#F53F3F] hover:text-[#F76560]'
              }`}
            >
              {countdown > 0 ? `${countdown}s 后重新获取` : '获取验证码'}
            </button>
          </div>

          {/* 新密码 */}
          <div className="mb-4">
            <p className="text-[14px] text-[#1D2129] font-medium mb-2">新密码</p>
            <div className="flex items-center h-[40px] border border-[#E5E6EB] rounded">
              <input
                type={showPwd ? 'text' : 'password'}
                value={newPwd}
                onChange={e => setNewPwd(e.target.value)}
                placeholder="请输入新密码（至少8位字符）"
                className="flex-1 h-full px-4 text-[14px] outline-none placeholder:text-[#C9CDD4] bg-transparent text-[#1D2129]"
              />
              <button onClick={() => setShowPwd(v => !v)} className="px-3 text-[#86909C] hover:text-[#4E5969]">
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* 确认密码 */}
          <div className="mb-4">
            <p className="text-[14px] text-[#1D2129] font-medium mb-2">确认密码</p>
            <div className="flex items-center h-[40px] border border-[#E5E6EB] rounded">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPwd}
                onChange={e => setConfirmPwd(e.target.value)}
                placeholder="请再次输入新密码"
                className="flex-1 h-full px-4 text-[14px] outline-none placeholder:text-[#C9CDD4] bg-transparent text-[#1D2129]"
              />
              <button onClick={() => setShowConfirm(v => !v)} className="px-3 text-[#86909C] hover:text-[#4E5969]">
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E5E6EB]">
          <button onClick={onClose} className="h-[40px] px-8 border border-[#E5E6EB] rounded-[4px] text-[14px] text-[#4E5969] hover:border-[#C9CDD4] transition-colors">
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={!smsCode || !newPwd || !confirmPwd}
            className={`h-[40px] px-8 rounded-[4px] text-[14px] font-medium transition-colors ${
              smsCode && newPwd && confirmPwd ? 'bg-[#F53F3F] hover:bg-[#F76560] text-white' : 'bg-[#F5F6FA] text-[#C9CDD4] cursor-not-allowed'
            }`}
          >
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-[480px]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E6EB]">
          <h2 className="text-[18px] font-bold text-[#1D2129]">注销账号</h2>
          <button onClick={onClose} className="text-[#86909C] hover:text-[#1D2129] transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5">
          <ModalField prefix="当前手机号码" value={phone} disabled />

          <div className="mb-4">
            <SliderCaptcha onVerified={() => setSliderOk(true)} />
          </div>

          <div className="mb-4 flex items-center gap-2">
            <div className="flex-1 flex items-center border border-[#E5E6EB] rounded h-[40px] px-3">
              <span className="text-[14px] text-[#1D2129] mr-2 whitespace-nowrap">验证码</span>
              <input
                type="text"
                value={smsCode}
                onChange={e => setSmsCode(e.target.value)}
                placeholder="请输入"
                className="flex-1 h-full text-[14px] outline-none placeholder:text-[#C9CDD4]"
              />
            </div>
            <button
              onClick={handleGetSms}
              disabled={!sliderOk || countdown > 0}
              className={`h-[40px] px-4 text-[14px] rounded whitespace-nowrap transition-colors ${
                !sliderOk || countdown > 0 ? 'text-[#C9CDD4] cursor-not-allowed' : 'text-[#F53F3F] hover:text-[#F76560]'
              }`}
            >
              {countdown > 0 ? `${countdown}s 后重新获取` : '获取验证码'}
            </button>
          </div>

          <p className="text-[13px] text-[#F53F3F]">注销后将无法登录系统，无法保留检测报告等内容！</p>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E5E6EB]">
          <button onClick={onClose} className="h-[40px] px-8 border border-[#E5E6EB] rounded-[4px] text-[14px] text-[#4E5969] hover:border-[#C9CDD4] transition-colors">
            取消
          </button>
          <button
            onClick={onConfirmed}
            disabled={!smsCode}
            className={`h-[40px] px-8 rounded-[4px] text-[14px] font-medium transition-colors ${
              smsCode ? 'bg-[#F53F3F] hover:bg-[#F76560] text-white' : 'bg-[#F5F6FA] text-[#C9CDD4] cursor-not-allowed'
            }`}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  )
}
