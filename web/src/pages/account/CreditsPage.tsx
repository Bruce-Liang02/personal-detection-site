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
          <h1 className="page-title">充值中心</h1>
          <p className="page-desc">购买检测次数，开始论文质量诊断</p>
        </div>

        {successMsg && (
          <div className="mb-6 bg-success-soft text-success border border-success-border rounded-lg px-4 py-3 font-medium flex items-center gap-2">
            <CheckCircle2 size={16} /> {successMsg}
          </div>
        )}

        {/* Balance card */}
        <div className="card p-8 mb-6 bg-brand-gradient-hero text-white !border-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
          <div className="relative">
            <div className="flex items-center gap-2.5 mb-3">
              <Coins size={22} />
              <span className="font-semibold text-brand-100">当前余额</span>
            </div>
            <p className="flex items-baseline gap-2 mb-5">
              <span className="text-display font-extrabold tnum">{balance}</span>
              <span className="text-subtitle font-semibold text-brand-200">次</span>
            </p>
            <div className="flex gap-10 text-caption text-brand-100">
              <span>累计充值 <b className="text-white tnum">{total_recharged}</b> 次</span>
              <span>累计消耗 <b className="text-white tnum">{total_consumed}</b> 次</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('packages')}
            className={`inline-flex items-center gap-1.5 h-10 px-5 rounded-md text-body font-semibold border transition-all ${
              tab === 'packages'
                ? 'bg-brand text-white border-brand shadow-brand'
                : 'bg-white text-ink-2 border-line hover:border-brand hover:text-brand'
            }`}
          >
            <Package size={14} /> 充值套餐
          </button>
          <button
            onClick={() => setTab('history')}
            className={`inline-flex items-center gap-1.5 h-10 px-5 rounded-md text-body font-semibold border transition-all ${
              tab === 'history'
                ? 'bg-brand text-white border-brand shadow-brand'
                : 'bg-white text-ink-2 border-line hover:border-brand hover:text-brand'
            }`}
          >
            <History size={14} /> 消费记录
          </button>
        </div>

        {tab === 'packages' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Object.entries(packages).map(([key, pkg]) => (
              <div key={key} className="card card-pad card-hover group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-28 h-28 bg-brand-soft rounded-bl-full opacity-70 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-subtitle font-bold text-ink">{pkg.name}</p>
                    {paying === pkg.price && <Loader2 size={16} className="animate-spin text-brand" />}
                  </div>
                  <p className="flex items-baseline gap-0.5 mb-1.5">
                    <span className="text-subtitle font-bold text-brand-700">¥</span>
                    <span className="text-display font-extrabold text-gradient-brand tnum leading-none">{pkg.price}</span>
                  </p>
                  <div className="inline-flex items-center gap-1.5 badge-brand mb-5">
                    <Coins size={12} /> 含 {pkg.credits} 次检测
                  </div>
                  <button
                    onClick={() => handleBuy(key, pkg)}
                    disabled={paying !== null}
                    className="btn-primary btn-md w-full"
                  >
                    {paying === pkg.price ? <Loader2 className="animate-spin" size={16} /> : <><CreditCard size={14} /> 立即购买</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'history' && (
          <div className="card card-pad">
            {transactions.length === 0 ? (
              <p className="text-center text-ink-3 py-8">暂无消费记录</p>
            ) : (
              <div>
                {transactions.map(t => (
                  <div key={t.id} className="table-row flex items-center justify-between py-3.5 last:border-0">
                    <div>
                      <p className="font-semibold text-ink text-body">{t.description || t.type}</p>
                      <p className="text-micro text-ink-3 tnum">{new Date(t.created_at).toLocaleString('zh-CN')}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-subtitle tnum ${t.amount > 0 ? 'text-success' : 'text-ink-2'}`}>
                        {t.amount > 0 ? '+' : ''}{t.amount}
                      </p>
                      <p className="text-micro text-ink-3 tnum">余额 {t.balance_after}</p>
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
