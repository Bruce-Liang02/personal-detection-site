import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-[860px] relative">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E6EB]">
          <h2 className="text-[18px] font-bold text-[#1D2129]">确认支付</h2>
          <button
            onClick={onClose}
            className="text-[#86909C] hover:text-[#1D2129] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5">
          {/* Payment method selection */}
          <h3 className="text-[15px] font-medium text-[#1D2129] mb-4">请选择支付方式</h3>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            {PAYMENT_METHODS.map(method => (
              <button
                key={method.id}
                onClick={() => setSelectedPayment(method.id)}
                className={`p-4 rounded-[4px] border-2 transition-all flex items-center gap-3 ${
                  selectedPayment === method.id
                    ? 'border-[#E44548]'
                    : 'border-[#E5E6EB] bg-white hover:border-[#C9CDD4]'
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
                  <p className="text-[14px] font-medium text-[#1D2129]">{method.name}</p>
                  {method.desc && <p className="text-[12px] text-[#86909C]">{method.desc}</p>}
                </div>
              </button>
            ))}
          </div>

          {/* QR Code + Amount + Instructions */}
          <div className="bg-[#F5F6FA] rounded-[4px] p-8 flex items-start gap-8">
            <div className="shrink-0 flex flex-col items-center">
              <div className="bg-white p-4 rounded-[4px] mb-3">
                {selectedPayment === 'wechat' ? (
                  <img src="/wechat-qr.png" alt="微信支付二维码" className="w-[160px] h-[160px]" />
                ) : (
                  <img src="/alipay-qr.png" alt="支付宝支付二维码" className="w-[160px] h-[160px]" />
                )}
              </div>
              <p className="text-[13px] text-[#4E5969]">扫码快捷支付</p>
            </div>

            <div className="flex-1 pt-2">
              <div className="mb-6">
                <span className="text-[14px] text-[#4E5969]">实付金额：</span>
                <span className="text-[12px] text-[#E44548] align-super">¥</span>
                <span className="text-[32px] text-[#E44548] font-bold leading-none">{totalPrice}</span>
              </div>
              
              <div>
                <p className="text-[14px] font-medium text-[#1D2129] mb-3">支付说明</p>
                <ol className="text-[13px] text-[#4E5969] space-y-2 list-decimal list-inside leading-relaxed">
                  <li>若已支付，<span className="text-[#E44548] font-medium">30S</span>后页面还未跳转，可点击【我已支付】或关闭该弹窗</li>
                  <li>当确认支付完成后，请勿切换其他支付方式再次生成订单，避免重复支付</li>
                  <li>可根据{selectedPayment === 'wechat' ? '微信' : '支付宝'}订单号到【下载报告】页面下载报告</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E5E6EB]">
          <button
            onClick={onClose}
            className="h-[40px] px-8 border border-[#E5E6EB] rounded-[4px] text-[14px] text-[#4E5969] hover:border-[#C9CDD4] transition-colors"
          >
            取消
          </button>
          <button
            onClick={handlePaid}
            className="h-[40px] px-8 bg-[#E44548] hover:bg-[#c93a3d] text-white text-[14px] font-medium rounded-[4px] transition-colors"
          >
            我已支付
          </button>
        </div>
      </div>
    </div>
  )
}
