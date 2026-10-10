import { useState, useRef } from 'react'
import { Plus, ChevronDown, Check, Inbox } from 'lucide-react'
import DateRangePicker from '@/components/ui/DateRangePicker'

/* ═══ 类型与数据 ═══════════════════════════════════════════════════ */

type OrderStatus = '未开票' | '开票中' | '已开票'
interface Order {
  id: number
  orderNo: string
  type: string
  amount: number
  payMethod: string
  payTime: string
  status: OrderStatus
}

interface InvoiceTitle {
  id: string
  type: '企业单位' | '个人'
  name: string
  taxNo: string
  address: string
  phone: string
  bank: string
  account: string
  email: string
  isDefault?: boolean
}

interface InvoiceRecord {
  id: number
  time: string
  invoiceNo: string
  amount: number
  status: string
}

const STORE_KEY = 'invoice_titles_v1'

const SEED_TITLES: InvoiceTitle[] = [
  {
    id: 't1',
    type: '企业单位',
    name: '重庆泛语科技有限公司',
    taxNo: '91500107MA61B000XR',
    address: '重庆市沙坪坝区大学城中路 88 号',
    phone: '023-65668888',
    bank: '中国工商银行重庆大学城支行',
    account: '3100 1607 0910 5200 056',
    email: 'finance@example.com',
    isDefault: true,
  },
]

const MOCK_ORDERS: Order[] = [
  { id: 1, orderNo: '202610091414269483', type: '课程论文检测', amount: 15, payMethod: '微信支付', payTime: '2026-10-09 14:14:02', status: '未开票' },
  { id: 2, orderNo: '20261009131517ffdd1c', type: '课程论文检测', amount: 20, payMethod: '支付宝', payTime: '2026-10-09 13:15:17', status: '未开票' },
  { id: 3, orderNo: '2026100911121735e494', type: '课程论文检测', amount: 80, payMethod: '支付宝', payTime: '2026-10-09 11:12:41', status: '开票中' },
  { id: 4, orderNo: '20261008104742d12d8c', type: '课程论文检测', amount: 15, payMethod: '微信支付', payTime: '2026-10-08 10:47:42', status: '已开票' },
  { id: 5, orderNo: '20261007180215ffdd9a', type: '课程论文检测', amount: 20, payMethod: '微信支付', payTime: '2026-10-07 18:02:15', status: '已开票' },
  { id: 6, orderNo: '20261007163022901ab3', type: '课程论文检测', amount: 15, payMethod: '支付宝', payTime: '2026-10-07 16:30:22', status: '未开票' },
]

const MOCK_INVOICES: InvoiceRecord[] = [
  { id: 1, time: '2026-10-08 09:20:11', invoiceNo: '26948300930112', amount: 15, status: '已开具' },
  { id: 2, time: '2026-10-07 10:05:44', invoiceNo: '26948300888765', amount: 20, status: '已开具' },
]

const EMPTY_TITLE: InvoiceTitle = { id: '', type: '企业单位', name: '', taxNo: '', address: '', phone: '', bank: '', account: '', email: '' }

function loadTitles(): InvoiceTitle[] {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return SEED_TITLES
}

/* ═══ 局部 Toast ═══════════════════════════════════════════════════ */

function showToastMessage(msg: string, type: 'success' | 'error' = 'success') {
  return { msg, type }
}

/* ═══ 页面 ═════════════════════════════════════════════════════════ */

export default function InvoicePage() {
  const [tab, setTab] = useState<'orders' | 'history'>('orders')
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS)
  const [invoices] = useState<InvoiceRecord[]>(MOCK_INVOICES)
  const [selected, setSelected] = useState<number[]>([])
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)

  // 筛选（草稿 → 点击搜索后生效）
  const [draft, setDraft] = useState({ orderNo: '', from: '', to: '', status: '' })
  const [applied, setApplied] = useState({ orderNo: '', from: '', to: '', status: '' })

  // 弹窗
  const [mergeOpen, setMergeOpen] = useState(false)
  const [titlesOpen, setTitlesOpen] = useState(false)
  const [titles, setTitles] = useState<InvoiceTitle[]>(loadTitles)
  const [titleMode, setTitleMode] = useState<'list' | 'form'>('list')
  const [editingTitle, setEditingTitle] = useState<InvoiceTitle>(EMPTY_TITLE)
  const [mergeTitleId, setMergeTitleId] = useState<string>('')
  const [mergeEmail, setMergeEmail] = useState('')

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast(showToastMessage(msg, type))
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2200)
  }

  function persistTitles(next: InvoiceTitle[]) {
    setTitles(next)
    localStorage.setItem(STORE_KEY, JSON.stringify(next))
  }

  /* —— 筛选 —— */
  const filteredOrders = orders.filter(o =>
    (!applied.orderNo || o.orderNo.includes(applied.orderNo.trim())) &&
    (!applied.status || o.status === applied.status) &&
    (!applied.from || o.payTime.slice(0, 10) >= applied.from) &&
    (!applied.to || o.payTime.slice(0, 10) <= applied.to)
  )
  const filteredInvoices = invoices.filter(v =>
    (!applied.from || v.time.slice(0, 10) >= applied.from) &&
    (!applied.to || v.time.slice(0, 10) <= applied.to)
  )

  const selectableIds = filteredOrders.filter(o => o.status === '未开票').map(o => o.id)
  const allChecked = selectableIds.length > 0 && selectableIds.every(id => selected.includes(id))
  const selectedOrders = orders.filter(o => selected.includes(o.id))
  const totalAmount = selectedOrders.reduce((s, o) => s + o.amount, 0)

  function toggleSelect(id: number) {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  function toggleAll() {
    setSelected(allChecked ? [] : selectableIds)
  }

  function handleSearch() {
    setApplied({ ...draft })
    showToast('查询完成', 'success')
  }

  function handleReset() {
    const cleared = { orderNo: '', from: '', to: '', status: '' }
    setDraft(cleared)
    setApplied(cleared)
  }

  /* —— 开票申请 —— */
  function openMerge(orderIds?: number[]) {
    if (!orderIds && selected.length === 0) {
      showToast('请先勾选需要开票的订单', 'error')
      return
    }
    const def = titles.find(t => t.isDefault) || titles[0]
    setMergeTitleId(def?.id || '')
    setMergeEmail(def?.email || '')
    setMergeOpen(true)
  }

  function submitMerge() {
    if (!mergeTitleId) {
      showToast('请选择发票抬头', 'error')
      return
    }
    if (!/^[\w.+-]+@[\w-]+\.[\w.]+$/.test(mergeEmail.trim())) {
      showToast('请输入正确的接收邮箱', 'error')
      return
    }
    const ids = selectedOrders.map(o => o.id)
    setOrders(prev => prev.map(o => ids.includes(o.id) ? { ...o, status: '开票中' as OrderStatus } : o))
    setSelected([])
    setMergeOpen(false)
    showToast('开票申请已提交，发票将在 1-3 个工作日内开具', 'success')
  }

  /* —— 抬头管理 —— */
  function openTitles() {
    setTitlesOpen(true)
    setTitleMode('list')
  }

  function saveTitle() {
    if (!editingTitle.name.trim()) { showToast('请输入发票抬头名称', 'error'); return }
    if (editingTitle.type === '企业单位' && !editingTitle.taxNo.trim()) { showToast('企业抬头请填写单位税号', 'error'); return }
    if (editingTitle.email && !/^[\w.+-]+@[\w-]+\.[\w.]+$/.test(editingTitle.email)) { showToast('接收邮箱格式不正确', 'error'); return }
    if (editingTitle.id) {
      persistTitles(titles.map(t => t.id === editingTitle.id ? editingTitle : t))
    } else {
      const id = `t${Date.now()}`
      persistTitles([...titles, { ...editingTitle, id, isDefault: titles.length === 0 }])
    }
    showToast('发票抬头已保存', 'success')
    setTitleMode('list')
  }

  function removeTitle(id: string) {
    const next = titles.filter(t => t.id !== id)
    if (next.length && !next.some(t => t.isDefault)) next[0] = { ...next[0], isDefault: true }
    persistTitles(next)
    showToast('发票抬头已删除', 'success')
  }

  const statusBadge: Record<OrderStatus, string> = { '未开票': 'badge-neutral', '开票中': 'badge-info', '已开票': 'badge-success' }

  return (
    <div>
      {toast && (
        <div
          className={`fixed top-20 left-1/2 -translate-x-1/2 z-[70] px-4 py-2.5 rounded-lg text-body text-white shadow-lg ${
            toast.type === 'success' ? 'bg-success' : 'bg-danger'
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* ═══ 白卡容器（官网 billManage 规格） ═══ */}
      <div className="card p-6 min-h-[calc(100vh-140px)]">
        {/* ═══ Tabs：全部订单 / 开票历史 ═══ */}
        <div className="px-1 border-b border-line flex gap-[56px]">
          {([['orders', '全部订单'], ['history', '开票历史']] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`pb-3 pt-1 text-body font-bold leading-5 -mb-px border-b-[3px] transition-colors ${
                tab === key ? 'text-brand border-brand' : 'text-ink-2 border-transparent hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'orders' ? (
          <>
            {/* ═══ 筛选表单（单行：与截图一致） ═══ */}
            <div className="mt-5 flex items-center gap-6">
              <div className="flex-1 flex items-center gap-[30px]">
                <div className="flex items-center gap-[30px]">
                  <span className="text-body text-ink-2 shrink-0">订单编号</span>
                  <input
                    value={draft.orderNo}
                    onChange={e => setDraft({ ...draft, orderNo: e.target.value })}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    placeholder="请输入"
                    className="input-field w-[194px]"
                  />
                </div>
                <div className="flex items-center gap-[30px]">
                  <span className="text-body text-ink-2 shrink-0">筛选时间</span>
                  <DateRangePicker
                    startDate={draft.from}
                    endDate={draft.to}
                    onStartDateChange={v => setDraft({ ...draft, from: v })}
                    onEndDateChange={v => setDraft({ ...draft, to: v })}
                  />
                </div>
                <div className="flex items-center gap-[30px]">
                  <span className="text-body text-ink-2 shrink-0">开票状态</span>
                  <div className="relative">
                    <select
                      value={draft.status}
                      onChange={e => setDraft({ ...draft, status: e.target.value })}
                      className="input-field w-[170px] appearance-none pl-3 pr-8 cursor-pointer"
                    >
                      <option value="">请选择</option>
                      <option value="未开票">未开票</option>
                      <option value="开票中">开票中</option>
                      <option value="已开票">已开票</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 shrink-0">
                <button onClick={handleReset} className="btn-outline btn-sm">重置</button>
                <button onClick={handleSearch} className="btn-primary btn-sm">搜索</button>
              </div>
            </div>

            {/* ═══ 工具栏：合并开票 + 发票抬头管理 ═══ */}
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => openMerge()}
                className="btn-primary btn-sm"
              >
                <Plus size={14} /> 合并开票
              </button>
              <button
                onClick={openTitles}
                className="btn-secondary btn-sm"
              >
                发票抬头管理
              </button>
              {selected.length > 0 && (
                <span className="text-caption text-ink-3 ml-1">已选 {selected.length} 笔，合计 <span className="text-brand-700 font-semibold tnum">¥{totalAmount}</span></span>
              )}
            </div>

            {/* ═══ 订单表格 ═══ */}
            <div className="mt-5 table-wrap">
              <table className="w-full table-fixed text-body">
                <colgroup>
                  <col style={{ width: 40 }} />
                  <col style={{ width: 50 }} />
                  <col style={{ width: 260 }} />
                  <col style={{ width: 100 }} />
                  <col style={{ width: 80 }} />
                  <col style={{ width: 90 }} />
                  <col style={{ width: 180 }} />
                  <col style={{ width: 88 }} />
                  <col style={{ width: 90 }} />
                </colgroup>
                <thead>
                  <tr className="table-head h-[48px]">
                    <th className="text-center">
                      <span
                        onClick={() => toggleAll()}
                        className={`inline-flex w-[15px] h-[15px] rounded-xs border items-center justify-center cursor-pointer align-middle transition-colors ${
                          allChecked ? 'bg-brand border-brand' : 'bg-white border-ink-4 hover:border-brand'
                        } ${selectableIds.length === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
                      >
                        {allChecked && <Check size={10} className="text-white" strokeWidth={3} />}
                      </span>
                    </th>
                    {['序号', '订单编号', '类型', '金额', '消费方式', '消费时间', '开票状态', '操作'].map(h => (
                      <th key={h} className="text-center font-medium px-2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={9}>
                        <div className="py-16 flex flex-col items-center gap-3">
                          <Inbox size={44} className="text-ink-4" strokeWidth={1.5} />
                          <span className="text-caption text-ink-3">暂无数据</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((o, i) => (
                      <tr key={o.id} className="table-row h-[54px]">
                        <td className="text-center">
                          <span
                            onClick={() => o.status === '未开票' && toggleSelect(o.id)}
                            className={`inline-flex w-[15px] h-[15px] rounded-xs border items-center justify-center align-middle transition-colors ${
                              selected.includes(o.id) ? 'bg-brand border-brand' : 'bg-white border-ink-4 hover:border-brand'
                            } ${o.status !== '未开票' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            {selected.includes(o.id) && <Check size={10} className="text-white" strokeWidth={3} />}
                          </span>
                        </td>
                        <td className="text-center text-ink-2">{i + 1}</td>
                        <td className="text-center text-ink font-mono text-[13px]">{o.orderNo}</td>
                        <td className="text-center text-ink-2">{o.type}</td>
                        <td className="text-center text-ink font-semibold tnum">¥{o.amount}</td>
                        <td className="text-center text-ink-2">{o.payMethod}</td>
                        <td className="text-center text-ink-2 tnum text-caption">{o.payTime}</td>
                        <td className="text-center"><span className={statusBadge[o.status]}>{o.status}</span></td>
                        <td className="text-center">
                          {o.status === '未开票' ? (
                            <button onClick={() => { setSelected([o.id]); openMerge([o.id]) }} className="link text-caption">
                              申请开票
                            </button>
                          ) : (
                            <span className="text-ink-4">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* ═══ 分页栏 ═══ */}
            <div className="mt-4 flex items-center justify-between text-caption text-ink-2">
              <span>共 {filteredOrders.length} 项数据</span>
              <div className="flex items-center gap-2">
                <select className="input-field !h-7 !w-[110px] text-caption">
                  <option>10 条/页</option>
                  <option>20 条/页</option>
                  <option>50 条/页</option>
                </select>
                <button className="btn-ghost btn-sm !h-7">‹</button>
                <button className="btn-sm !h-7 !px-2.5 border border-brand bg-brand text-white rounded">1</button>
                <button className="btn-ghost btn-sm !h-7">›</button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* ═══ 开票历史：筛选 ═══ */}
            <div className="mt-5 flex items-center gap-[30px]">
              <span className="text-body text-ink-2 shrink-0">筛选时间</span>
              <DateRangePicker
                startDate={draft.from}
                endDate={draft.to}
                onStartDateChange={v => setDraft({ ...draft, from: v })}
                onEndDateChange={v => setDraft({ ...draft, to: v })}
              />
              <div className="flex gap-3 ml-auto">
                <button onClick={handleReset} className="btn-outline btn-sm">重置</button>
                <button onClick={handleSearch} className="btn-primary btn-sm">搜索</button>
              </div>
            </div>

            {/* ═══ 开票历史表格 ═══ */}
            <div className="mt-5 table-wrap">
              <table className="w-full table-fixed text-body">
                <colgroup>
                  <col style={{ width: 88 }} />
                  <col style={{ width: 180 }} />
                  <col style={{ width: 200 }} />
                  <col style={{ width: 129 }} />
                  <col style={{ width: 129 }} />
                  <col />
                </colgroup>
                <thead>
                  <tr className="table-head h-[48px]">
                    {['序号', '开票时间', '发票号码', '开票金额', '开票状态', '操作'].map(h => (
                      <th key={h} className="text-center font-medium px-2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="py-16 flex flex-col items-center gap-3">
                          <Inbox size={44} className="text-ink-4" strokeWidth={1.5} />
                          <span className="text-caption text-ink-3">暂无数据</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((v, i) => (
                      <tr key={v.id} className="table-row h-[54px]">
                        <td className="text-center text-ink-2">{i + 1}</td>
                        <td className="text-center text-ink-2 tnum text-caption">{v.time}</td>
                        <td className="text-center text-ink font-mono text-[13px]">{v.invoiceNo}</td>
                        <td className="text-center text-ink font-semibold tnum">¥{v.amount}</td>
                        <td className="text-center"><span className="badge-success">已开具</span></td>
                        <td className="text-center">
                          <button onClick={() => showToast('发票文件生成中，请稍后在邮箱查收', 'success')} className="link text-caption">
                            下载发票
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* ═══ 分页栏 ═══ */}
            <div className="mt-4 flex items-center justify-between text-caption text-ink-2">
              <span>共 {filteredInvoices.length} 项数据</span>
              <div className="flex items-center gap-2">
                <select className="input-field !h-7 !w-[110px] text-caption">
                  <option>10 条/页</option>
                  <option>20 条/页</option>
                  <option>50 条/页</option>
                </select>
                <button className="btn-ghost btn-sm !h-7">‹</button>
                <button className="btn-sm !h-7 !px-2.5 border border-brand bg-brand text-white rounded">1</button>
                <button className="btn-ghost btn-sm !h-7">›</button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ═══ 合并开票弹窗 ═══ */}
      {mergeOpen && (
        <div className="overlay" onClick={() => setMergeOpen(false)}>
          <div className="modal w-[520px]" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="section-title">合并开票</h3>
              <button onClick={() => setMergeOpen(false)} className="text-ink-3 hover:text-ink text-xl leading-none transition-colors">&times;</button>
            </div>
            <div className="modal-body space-y-4">
              <p className="text-body text-ink-2">
                已选 <span className="text-brand-700 font-semibold tnum">{selectedOrders.length}</span> 笔订单，合计金额
                <span className="text-brand-700 font-semibold tnum"> ¥{totalAmount}</span>
              </p>
              <div>
                <p className="label-text">选择发票抬头</p>
                {titles.length === 0 ? (
                  <div className="border border-dashed border-line rounded-md py-6 text-center">
                    <p className="text-caption text-ink-3 mb-2">暂无发票抬头</p>
                    <button onClick={() => { setEditingTitle(EMPTY_TITLE); setTitleMode('form'); setTitlesOpen(true) }} className="link text-caption">
                      立即新增
                    </button>
                  </div>
                ) : (
                  <div className="max-h-[180px] overflow-y-auto space-y-2">
                    {titles.map(t => (
                      <div
                        key={t.id}
                        onClick={() => { setMergeTitleId(t.id); setMergeEmail(t.email) }}
                        className={`flex items-center gap-2.5 border rounded-md px-3 py-2.5 cursor-pointer transition-all ${
                          mergeTitleId === t.id ? 'border-brand bg-brand-soft' : 'border-line hover:border-brand-line'
                        }`}
                      >
                        <span className={`w-[15px] h-[15px] rounded-full border flex items-center justify-center shrink-0 ${mergeTitleId === t.id ? 'border-brand' : 'border-ink-4'}`}>
                          {mergeTitleId === t.id && <span className="w-[8px] h-[8px] rounded-full bg-brand" />}
                        </span>
                        <span className={t.type === '企业单位' ? 'badge-brand' : 'badge-info'}>{t.type}</span>
                        <span className="text-body text-ink truncate">{t.name}</span>
                        {t.isDefault && <span className="badge-brand ml-auto shrink-0">默认</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-body text-ink-2 shrink-0 w-[84px]">接收邮箱</span>
                <input
                  value={mergeEmail}
                  onChange={e => setMergeEmail(e.target.value)}
                  placeholder="电子发票将发送至该邮箱"
                  className="input-field flex-1"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setMergeOpen(false)} className="btn-outline btn-sm">取消</button>
              <button onClick={submitMerge} className="btn-primary btn-sm">提交申请</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ 发票抬头管理弹窗 ═══ */}
      {titlesOpen && (
        <div className={`overlay ${mergeOpen ? '!z-[60]' : ''}`} onClick={() => { setTitlesOpen(false); setTitleMode('list') }}>
          <div className="modal w-[640px]" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="section-title">发票抬头管理</h3>
              <button onClick={() => { setTitlesOpen(false); setTitleMode('list') }} className="text-ink-3 hover:text-ink text-xl leading-none transition-colors">&times;</button>
            </div>

            {titleMode === 'list' ? (
              <>
                <div className="modal-body space-y-3">
                  {titles.length === 0 ? (
                    <div className="py-10 text-center text-caption text-ink-3">暂无发票抬头，点击下方按钮新增</div>
                  ) : (
                    <div className="space-y-3">
                      {titles.map(t => (
                        <div key={t.id} className="border border-line rounded-md p-3.5 flex items-start justify-between card-hover">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={t.type === '企业单位' ? 'badge-brand' : 'badge-info'}>{t.type}</span>
                              <span className="text-body font-medium text-ink truncate">{t.name}</span>
                              {t.isDefault && <span className="badge-brand">默认</span>}
                            </div>
                            {t.type === '企业单位' && t.taxNo && (
                              <p className="text-micro text-ink-3 mt-1.5">税号：{t.taxNo}</p>
                            )}
                            {t.email && <p className="text-micro text-ink-3 mt-0.5">接收邮箱：{t.email}</p>}
                          </div>
                          <div className="flex items-center gap-3 shrink-0 ml-3 text-caption">
                            {!t.isDefault && (
                              <button onClick={() => persistTitles(titles.map(x => ({ ...x, isDefault: x.id === t.id })))} className="link">设为默认</button>
                            )}
                            <button onClick={() => { setEditingTitle(t); setTitleMode('form') }} className="link">编辑</button>
                            <button onClick={() => removeTitle(t.id)} className="text-danger hover:text-[#d93030] transition-colors">删除</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="px-6 py-4 border-t border-line shrink-0">
                  <button
                    onClick={() => { setEditingTitle(EMPTY_TITLE); setTitleMode('form') }}
                    className="w-full h-10 border border-dashed border-ink-4 rounded-md text-body text-ink-2 hover:border-brand hover:text-brand flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus size={14} /> 新增发票抬头
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="modal-body space-y-3">
                  <div className="flex items-center">
                    <span className="w-[80px] text-caption text-ink-2 text-right shrink-0"><span className="text-danger">*</span> 抬头类型</span>
                    <div className="flex items-center gap-5 ml-4">
                      {(['企业单位', '个人'] as const).map(tp => (
                        <label key={tp} className="flex items-center gap-1.5 text-body text-ink cursor-pointer">
                          <input
                            type="radio"
                            name="titleType"
                            checked={editingTitle.type === tp}
                            onChange={() => setEditingTitle({ ...editingTitle, type: tp })}
                            className="accent-brand-700"
                          />
                          {tp}
                        </label>
                      ))}
                    </div>
                  </div>
                  {([
                    ['name', '发票抬头', true],
                    ['taxNo', '单位税号', editingTitle.type === '企业单位'],
                    ['address', '注册地址', false],
                    ['phone', '注册电话', false],
                    ['bank', '开户银行', false],
                    ['account', '银行账号', false],
                    ['email', '接收邮箱', false],
                  ] as const).map(([field, label, required]) => (
                    <div key={field} className="flex items-center">
                      <span className="w-[80px] text-caption text-ink-2 text-right shrink-0">
                        {required && <span className="text-danger">*</span>} {label}
                      </span>
                      <input
                        value={editingTitle[field]}
                        onChange={e => setEditingTitle({ ...editingTitle, [field]: e.target.value })}
                        placeholder={`请输入${label}`}
                        className="input-field flex-1 ml-4"
                      />
                    </div>
                  ))}
                </div>
                <div className="modal-footer">
                  <button onClick={() => setTitleMode('list')} className="btn-outline btn-sm">取消</button>
                  <button onClick={saveTitle} className="btn-primary btn-sm">保存</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
