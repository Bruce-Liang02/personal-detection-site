import { useEffect, useState } from 'react'
import { useCreditStore } from '@/stores/creditStore'
import { creditApi } from '@/api'
import { Coins, CreditCard, Loader2, CheckCircle2, History, Package } from 'lucide-react'

export default function CreditsPage() {
  const { balance, total_recharged, total_consumed, packages, transactions, refresh, loadPackages, loadTransactions } = useCreditStore()
  const [paying, setPaying] = useState<number | null>(null)
  const [successMsg, setSuccessMsg] = useState('')
  const [tab, setTab] = useState<'packages' | 'history'>('packages')

  useEffect(() => {
    refresh()
    loadPackages()
    loadTransactions()
  }, [])

  async function handleBuy(key: string, pkg: { name: string; credits: number; price: number }) {
    setPaying(packages[key].price)
    setSuccessMsg('')
    try {
      const orderRes = await creditApi.createOrder({ package_type: key, credit_amount: pkg.credits })
      const orderId = (orderRes.data as any).id
      // Simulate payment
      await creditApi.payOrder(orderId)
      await refresh()
      await loadTransactions()
      setSuccessMsg(`充值成功！「${pkg.name}」${pkg.credits} 次检测已到账`)
    } catch (err: any) {
      alert(err.message || '充值失败')
    } finally {
      setPaying(null)
    }
  }

  return (
    <div>
      <div className="max-w-[1000px] mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-ink">充值中心</h1>
          <p className="text-ink-3 mt-1">购买检测次数，开始论文质量诊断</p>
        </div>

        {successMsg && (
          <div className="mb-6 bg-success-soft text-success rounded-xl px-4 py-3 font-medium flex items-center gap-2">
            <CheckCircle2 size={16} /> {successMsg}
          </div>
        )}

        {/* Balance card */}
        <div className="card p-8 mb-6 bg-gradient-to-br from-brand-700 to-brand-900 text-white !border-0">
          <div className="flex items-center gap-3 mb-2">
            <Coins size={24} />
            <span className="font-semibold text-brand-100">当前余额</span>
          </div>
          <p className="text-5xl font-black mb-4">{balance} <span className="text-xl font-semibold text-brand-200">次</span></p>
          <div className="flex gap-8 text-sm text-brand-100">
            <span>累计充值 <b className="text-white">{total_recharged}</b> 次</span>
            <span>累计消耗 <b className="text-white">{total_consumed}</b> 次</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('packages')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === 'packages' ? 'bg-brand-700 text-white' : 'bg-white text-ink-2'}`}
          >
            <Package size={14} className="inline mr-1" /> 充值套餐
          </button>
          <button
            onClick={() => setTab('history')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === 'history' ? 'bg-brand-700 text-white' : 'bg-white text-ink-2'}`}
          >
            <History size={14} className="inline mr-1" /> 消费记录
          </button>
        </div>

        {tab === 'packages' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Object.entries(packages).map(([key, pkg]) => (
              <div key={key} className="card p-6 hover:shadow-card-hover transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-50 rounded-bl-full opacity-50 group-hover:opacity-80 transition-opacity" />
                <div className="relative">
                  <p className="font-extrabold text-lg text-ink mb-1">{pkg.name}</p>
                  <p className="text-3xl font-black text-brand-700 mb-1">
                    ¥{pkg.price}
                  </p>
                  <p className="text-sm text-ink-3 mb-5">含 {pkg.credits} 次检测</p>
                  <button
                    onClick={() => handleBuy(key, pkg)}
                    disabled={paying !== null}
                    className="btn-primary w-full text-sm"
                  >
                    {paying === pkg.price ? <Loader2 className="animate-spin" size={16} /> : <><CreditCard size={14} /> 立即购买</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'history' && (
          <div className="card p-6">
            {transactions.length === 0 ? (
              <p className="text-center text-ink-3 py-8">暂无消费记录</p>
            ) : (
              <div className="space-y-3">
                {transactions.map(t => (
                  <div key={t.id} className="flex items-center justify-between py-3 border-b border-line/50 last:border-0">
                    <div>
                      <p className="font-semibold text-ink">{t.description || t.type}</p>
                      <p className="text-xs text-ink-3">{new Date(t.created_at).toLocaleString('zh-CN')}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-lg ${t.amount > 0 ? 'text-success' : 'text-danger'}`}>
                        {t.amount > 0 ? '+' : ''}{t.amount}
                      </p>
                      <p className="text-xs text-ink-3">余额 {t.balance_after}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      </div>
  )
}
