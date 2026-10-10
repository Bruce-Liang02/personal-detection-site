import { useState, useEffect } from 'react'
import { X, CheckCircle2 } from 'lucide-react'

const PAYMENT_METHODS = [
  { id: 'wechat', name: '微信', desc: '扫码快捷支付', color: '#07C160', icon: 'wechat' },
  { id: 'alipay', name: '支付宝', desc: '扫码快捷支付', color: '#1677FF', icon: 'alipay' },
]

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onPaid: () => void
  totalPrice: number
}

export default function PaymentModal({ isOpen, onClose, onPaid, totalPrice }: PaymentModalProps) {
  const [selectedPayment, setSelectedPayment] = useState('wechat')

  useEffect(() => {
    if (!isOpen) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  function handlePaid() {
    onClose()
    onPaid()
  }

  if (!isOpen) return null

  return (
    <div className="overlay">
      <div className="modal w-[860px]">
        {/* Header */}
        <div className="modal-header">
          <h2 className="text-subtitle font-bold text-ink">确认支付</h2>
          <button
            onClick={onClose}
            className="text-ink-3 hover:text-ink transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Payment method selection */}
          <h3 className="section-title mb-4">请选择支付方式</h3>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {PAYMENT_METHODS.map(method => (
              <button
                key={method.id}
                onClick={() => setSelectedPayment(method.id)}
                className={`p-4 rounded-lg border transition-all flex items-center gap-3 text-left ${
                  selectedPayment === method.id
                    ? 'border-brand bg-brand-soft shadow-xs'
                    : 'border-line bg-white hover:border-brand-line'
                }`}
              >
                <div className="shrink-0">
                  {method.icon === 'wechat' && (
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <rect width="28" height="28" rx="6" fill="#07C160" />
                      <path d="M19.3 10.2c-.4-2.1-2.5-3.7-5-3.7-2.9 0-5.3 1.9-5.3 4.3 0 1.3.7 2.4 1.7 3.2l-.8 1.8 2.3-1.1c.6.2 1.2.3 1.9.3h.2c-.1-.3-.1-.6-.1-.9 0-2.3 2.1-4.2 4.6-4.2.4 0 .8.1 1.2.2z" fill="white" />
                      <path d="M23 17.5c0-1.9-1.9-3.4-4.2-3.4s-4.2 1.5-4.2 3.4 1.9 3.4 4.2 3.4c.5 0 1-.1 1.5-.2l1.8.9-.6-1.8c.9-.8 1.5-1.9 1.5-3.1z" fill="white" opacity=".75" />
                    </svg>
                  )}
                  {method.icon === 'alipay' && (
                    <div className="w-8 h-8 rounded-full bg-[#1677FF] flex items-center justify-center text-white text-[14px] font-bold">支</div>
                  )}
                </div>
                <div className="text-left min-w-0">
                  <p className="text-body font-medium text-ink">{method.name}</p>
                  {method.desc && <p className="text-micro text-ink-3">{method.desc}</p>}
                </div>
                {selectedPayment === method.id && (
                  <CheckCircle2 size={18} className="ml-auto shrink-0 text-brand" />
                )}
              </button>
            ))}
          </div>

          {/* QR Code + Amount + Instructions */}
          <div className="bg-line-lighter border border-line-soft rounded-lg p-8 flex items-start gap-8">
            <div className="shrink-0 flex flex-col items-center">
              <div className="bg-white p-4 rounded-md border border-line shadow-sm mb-3">
                {selectedPayment === 'wechat' ? (
                  <img src="/wechat-qr.png" alt="微信支付二维码" className="w-[160px] h-[160px]" />
                ) : (
                  <img src="/alipay-qr.png" alt="支付宝支付二维码" className="w-[160px] h-[160px]" />
                )}
              </div>
              <p className="text-caption text-ink-2">扫码快捷支付</p>
            </div>

            <div className="flex-1 pt-2">
              <div className="mb-6">
                <span className="text-caption text-ink-3 mb-1 block">实付金额</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-subtitle text-brand-700">¥</span>
                  <span className="text-display text-gradient-brand tnum">{totalPrice}</span>
                </div>
              </div>

              <div>
                <p className="section-title mb-3">支付说明</p>
                <ol className="text-caption text-ink-2 space-y-2 list-decimal list-inside leading-relaxed">
                  <li>若已支付，<span className="text-brand font-semibold tnum">30S</span>后页面还未跳转，可点击【我已支付】或关闭该弹窗</li>
                  <li>当确认支付完成后，请勿切换其他支付方式再次生成订单，避免重复支付</li>
                  <li>可根据{selectedPayment === 'wechat' ? '微信' : '支付宝'}订单号到【下载报告】页面下载报告</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn-outline btn-md">
            取消
          </button>
          <button onClick={handlePaid} className="btn-primary btn-md">
            我已支付
          </button>
        </div>
      </div>
    </div>
  )
}
