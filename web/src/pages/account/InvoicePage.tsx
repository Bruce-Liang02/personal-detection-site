import { useState, useRef, useEffect } from 'react'
import type { CSSProperties } from 'react'
import { Plus, ChevronDown, Check, Inbox, Upload } from 'lucide-react'
import DateRangePicker from '@/components/ui/DateRangePicker'
import SliderCaptcha from '@/components/ui/SliderCaptcha'
import * as XLSX from 'xlsx'
import { generateInvoicePdf } from './invoicePdf'

/* ═══ 类型与数据 ═══════════════════════════════════════════════════ */

type OrderStatus = '未开票' | '开票中' | '已开票' | '作废中'
interface InvoiceDetail {
  orders: { orderNo: string; amount: number; type: string; payMethod: string }[]
}
interface Order {
  id: number
  orderNo: string
  type: string
  amount: number
  payMethod: string
  payTime: string
  status: OrderStatus
  detail?: InvoiceDetail
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
  status: '开票中' | '已开票' | '作废中'
  buyerName: string
  buyerTaxNo: string
  detail?: InvoiceDetail
}

const MOCK_ORDERS: Order[] = [
  { id: 1, orderNo: '202610091414269483', type: '课程论文检测', amount: 15, payMethod: '微信支付', payTime: '2026-10-09 14:14:02', status: '未开票' },
  { id: 2, orderNo: '20261009131517ffdd1c', type: '课程论文检测', amount: 20, payMethod: '支付宝', payTime: '2026-10-09 13:15:17', status: '未开票' },
  {
    id: 3, orderNo: '2026100911121735e494', type: '课程论文检测', amount: 80, payMethod: '支付宝', payTime: '2026-10-09 11:12:41', status: '开票中',
    detail: { orders: [{ orderNo: '2026100911121735e494', amount: 80, type: '课程论文检测', payMethod: '支付宝' }] },
  },
  {
    id: 4, orderNo: '20261008104742d12d8c', type: '课程论文检测', amount: 15, payMethod: '微信支付', payTime: '2026-10-08 10:47:42', status: '作废中',
    detail: { orders: [{ orderNo: '20261008104742d12d8c', amount: 15, type: '课程论文检测', payMethod: '微信支付' }] },
  },
  {
    id: 5, orderNo: '20261007180215ffdd9a', type: '课程论文检测', amount: 20, payMethod: '微信支付', payTime: '2026-10-07 18:02:15', status: '已开票',
    detail: { orders: [{ orderNo: '20261007180215ffdd9a', amount: 20, type: '课程论文检测', payMethod: '微信支付' }] },
  },
  { id: 6, orderNo: '20261007163022901ab3', type: '课程论文检测', amount: 15, payMethod: '支付宝', payTime: '2026-10-07 16:30:22', status: '未开票' },
]

const MOCK_INVOICES: InvoiceRecord[] = [
  { id: 3, time: '2026-10-09 11:20:35', invoiceNo: '--', amount: 80, status: '开票中', buyerName: '张三', buyerTaxNo: '500113199001274836', detail: { orders: [{ orderNo: '2026100911121735e494', amount: 80, type: '课程论文检测', payMethod: '支付宝' }] } },
  { id: 1, time: '2026-10-08 09:20:11', invoiceNo: '26948300930112', amount: 15, status: '作废中', buyerName: '张三', buyerTaxNo: '500113199001274836', detail: { orders: [{ orderNo: '20261008104742d12d8c', amount: 15, type: '课程论文检测', payMethod: '微信支付' }] } },
  { id: 2, time: '2026-10-07 10:05:44', invoiceNo: '26948300888765', amount: 20, status: '已开票', buyerName: '张三', buyerTaxNo: '500113199001274836', detail: { orders: [{ orderNo: '20261007180215ffdd9a', amount: 20, type: '课程论文检测', payMethod: '微信支付' }] } },
]

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

const EMPTY_TITLE: InvoiceTitle = { id: '', type: '企业单位', name: '', taxNo: '', address: '', phone: '', bank: '', account: '', email: '' }

function loadTitles(): InvoiceTitle[] {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return SEED_TITLES
}

/* ═══ 金额转中文大写（价税合计） ═══════════════════════════════════ */

export function toChineseAmount(n: number): string {
  const digits = '零壹贰叁肆伍陆柒捌玖'
  const units = ['', '拾', '佰', '仟']
  const bigUnits = ['', '万', '亿']
  const [intPart, decPart = '00'] = n.toFixed(2).split('.')
  const groups: string[] = []
  let rest = intPart
  while (rest.length > 4) { groups.unshift(rest.slice(-4)); rest = rest.slice(0, -4) }
  groups.unshift(rest)
  let intStr = ''
  groups.forEach((g, gi) => {
    let s = ''
    let zero = false
    for (let i = 0; i < g.length; i++) {
      const d = +g[i]
      const u = units[g.length - 1 - i]
      if (d === 0) { zero = s !== '' } else {
        if (zero) { s += '零'; zero = false }
        s += digits[d] + u
      }
    }
    if (s) s += bigUnits[groups.length - 1 - gi]
    intStr += s
  })
  let result = intStr ? intStr + '元' : ''
  const jiao = +(decPart[0] || 0), fen = +(decPart[1] || 0)
  if (jiao === 0 && fen === 0) result += '整'
  else {
    if (jiao) result += digits[jiao] + '角'
    else if (fen) result += '零'
    if (fen) result += digits[fen] + '分'
  }
  return result || '零元整'
}

/* 票面楷体深红（官网 .bill_create 票面样式） */
export const kai: CSSProperties = { fontFamily: '"KaiTi_GB2312", "KaiTi", "STKaiti", "SimKai", serif', color: '#800000' }

/* ═══ 局部 Toast ═══════════════════════════════════════════════════ */

function showToastMessage(msg: string, type: 'success' | 'error' = 'success') {
  return { msg, type }
}

/* ═══ 页面 ═════════════════════════════════════════════════════════ */

export default function InvoicePage() {
  const [tab, setTab] = useState<'orders' | 'history'>('orders')
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS)
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(MOCK_INVOICES)
  const [selected, setSelected] = useState<number[]>([])
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)

  // 筛选（草稿 → 点击搜索后生效）
  const [draft, setDraft] = useState({ orderNo: '', from: '', to: '', status: '' })
  const [applied, setApplied] = useState({ orderNo: '', from: '', to: '', status: '' })

  // 开票视图：list 列表 / create 立即开票表单（官网 .bill_create 同款页内切换）
  const [view, setView] = useState<'list' | 'create'>('list')
  const [createForm, setCreateForm] = useState({
    titleType: '单位' as '单位' | '个人',
    name: '', taxNo: '', address: '', bank: '', phone: '', account: '', other: '',
  })
  const [titlesOpen, setTitlesOpen] = useState(false)
  const [titles, setTitles] = useState<InvoiceTitle[]>(loadTitles)
  const [titleMode, setTitleMode] = useState<'list' | 'form'>('list')
  const [editingTitle, setEditingTitle] = useState<InvoiceTitle>(EMPTY_TITLE)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [detailData, setDetailData] = useState<InvoiceDetail | null>(null)
  const [voidRecord, setVoidRecord] = useState<InvoiceRecord | null>(null)
  const [captchaDone, setCaptchaDone] = useState(false)
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [smsCode, setSmsCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const codeTimer = useRef<number | undefined>(undefined)

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

  /* —— 立即开票（官网 bill_create 流程） —— */
  function openCreate(ids?: number[]) {
    if (!ids && selected.length === 0) {
      showToast('请先勾选需要开票的订单', 'error')
      return
    }
    setView('create')
  }

  function backToList() {
    setView('list')
    setSelected([])
  }

  function submitCreate() {
    if (!createForm.name.trim()) { showToast('请输入发票抬头名称', 'error'); return }
    if (!createForm.taxNo.trim()) {
      showToast(createForm.titleType === '单位' ? '请输入统一社会信用代码/纳税人识别号' : '个人抬头请输入身份证号码', 'error')
      return
    }
    setConfirmOpen(true)
    setCaptchaDone(false)
    setSmsCode('')
    setCountdown(0)
  }

  function sendCode() {
    if (countdown > 0) return
    if (!/^1\d{10}$/.test(phone.trim())) { showToast('请先输入正确的收票人手机号', 'error'); return }
    setCountdown(60)
    showToast('验证码已发送（模拟环境，输入任意6位数字即可）', 'success')
    codeTimer.current = window.setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { window.clearInterval(codeTimer.current); return 0 }
        return c - 1
      })
    }, 1000)
  }

  function confirmInvoice() {
    if (!captchaDone) { showToast('请先完成滑块验证', 'error'); return }
    if (!/^1\d{10}$/.test(phone.trim())) { showToast('请输入正确的收票人手机号', 'error'); return }
    if (!/^\d{6}$/.test(smsCode.trim())) { showToast('请输入6位验证码', 'error'); return }
    if (!email.trim()) { showToast('请输入电子邮箱', 'error'); return }
    if (!/^[\w.+-]+@[\w-]+\.[\w.]+$/.test(email.trim())) { showToast('请输入正确的电子邮箱', 'error'); return }
    const ids = selectedOrders.map(o => o.id)
    const detail: InvoiceDetail = {
      orders: selectedOrders.map(o => ({ orderNo: o.orderNo, amount: o.amount, type: o.type, payMethod: o.payMethod })),
    }
    setOrders(prev => prev.map(o => ids.includes(o.id) ? { ...o, status: '开票中' as OrderStatus, detail } : o))
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
    setInvoices(prev => [{ id: Date.now(), time: timeStr, invoiceNo: '--', amount: totalAmount, status: '开票中' as const, buyerName: createForm.name.trim(), buyerTaxNo: createForm.taxNo.trim(), detail }, ...prev])
    setSelected([])
    setConfirmOpen(false)
    setView('list')
    setTab('history')
    showToast('开票申请已提交，开票时间1-2天（遇节假日顺延）', 'success')
  }

  function exportDetail(d: InvoiceDetail) {
    const ws = XLSX.utils.json_to_sheet(
      d.orders.map(o => ({ 订单号: o.orderNo, 订单金额: o.amount, 订单类型: o.type, 消费方式: o.payMethod })),
    )
    ws['!cols'] = [{ wch: 24 }, { wch: 10 }, { wch: 14 }, { wch: 10 }]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '开票明细')
    XLSX.writeFile(wb, '开票明细.xlsx')
    showToast('明细已导出', 'success')
  }

  /* —— 开票历史：作废 / 查看 —— */
  function downloadInvoice(v: InvoiceRecord) {
    generateInvoicePdf(
      { invoiceNo: v.invoiceNo, time: v.time, amount: v.amount, buyerName: v.buyerName, buyerTaxNo: v.buyerTaxNo },
      toChineseAmount(v.amount),
    )
    showToast('发票 PDF 已开始下载', 'success')
  }

  function viewInvoice(v: InvoiceRecord) {
    localStorage.setItem('invoice_preview_v1', JSON.stringify({ invoiceNo: v.invoiceNo, time: v.time, amount: v.amount, buyerName: v.buyerName, buyerTaxNo: v.buyerTaxNo }))
  }

  function confirmVoid() {
    if (!voidRecord) return
    const id = voidRecord.id
    setInvoices(prev => prev.map(v => v.id === id ? { ...v, status: '作废中' as const } : v))
    setVoidRecord(null)
    showToast('作废成功', 'success')
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

  const statusBadge: Record<OrderStatus, string> = { '未开票': 'badge-neutral', '开票中': 'badge-info', '已开票': 'badge-success', '作废中': 'badge-info' }

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

      {view === 'create' ? (
        <div>
          {/* 返回（灰底区域，官网同款） */}
          <button onClick={backToList} className="flex items-center gap-1.5 text-[16px] text-[#1d2129] hover:text-[#E44548] transition-colors mb-3">
            <span className="text-[20px] leading-none">←</span> 返回
          </button>

          {/* 白色表单体 */}
          <div className="bg-white p-5">
            {/* 提示条 */}
            <div className="flex items-start gap-2 bg-[#fff7e8] border border-[#ff7d00] rounded-[4px] px-3 py-2">
              <span className="w-2 h-2 rounded-full bg-[#ff7d00] mt-[8px] shrink-0" />
              <p className="text-[14px] text-[#333639] leading-[22px]">
                提供增值税普票。需要发票的客户，请正确填写以下信息，开票时间1-2天（遇节假日顺延）。由于税务要求，现所有发票不论专票普票，企业/事业单位税号需提供纳税人识别号（或社会信用代码）；个人税号需提供个人身份证号码。
              </p>
            </div>

            {/* 发票抬头类型 */}
            <div className="mt-4 flex items-center gap-2">
              <span className="flex items-center gap-1 text-[14px] font-medium text-[#1d2129]">
                <span className="text-[#E44548]">*</span>发票抬头类型：
              </span>
              <div className="flex items-center gap-5 ml-2">
                {(['单位', '个人'] as const).map(tp => (
                  <label key={tp} className="flex items-center gap-1.5 text-[14px] text-[#1d2129] cursor-pointer">
                    <input
                      type="radio"
                      name="billTitleType"
                      checked={createForm.titleType === tp}
                      onChange={() => setCreateForm({ ...createForm, titleType: tp })}
                      className="accent-[#E44548]"
                    />
                    {tp}
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-dashed border-[#d6dae5] mt-7" />

            {/* 票头（官网无框，浮于白底） */}
            <div className="flex items-center px-5 pt-3 pb-3 gap-4">
              <div className="w-[78px] h-[80px] border border-dashed border-[#e2b9b9] rounded-[2px] flex items-center justify-center text-[12px] text-[#e2b9b9] shrink-0">二维码</div>
              <div className="flex-1 text-center min-w-0">
                <span className="inline-block text-[30px] leading-[42px] tracking-[5px] px-3 border-b-[5px] border-double border-[#800000] whitespace-nowrap" style={kai}>电子发票（普通发票）</span>
              </div>
              <div className="w-[150px] shrink-0 text-[14px] leading-[26px]">
                <p><span style={kai}>发票号码：</span><span className="text-[#333639]" style={{ fontFamily: kai.fontFamily }}>以实际为准</span></p>
                <p><span style={kai}>开票日期：</span><span className="text-[#333639]" style={{ fontFamily: kai.fontFamily }}>以实际为准</span></p>
              </div>
            </div>

            {/* 票面主体线框（官网：从购买方信息开始） */}
            <div className="border border-[#e2b9b9] bg-white">
              {/* 购买方 / 销售方（官网：4 个带边框单元格，标签格竖排垂直居中） */}
              <div className="flex border-b border-[#e2b9b9]">
                <div className="w-9 flex items-center justify-center shrink-0 border-r border-[#e2b9b9]">
                  <span className="text-[16px]" style={{ ...kai, writingMode: 'vertical-rl', letterSpacing: '6px' }}>购买方信息</span>
                </div>
                <div className="flex-1 py-4 pl-6 pr-4 space-y-3 min-w-0 border-r border-[#e2b9b9]">
                  <div className="flex items-center flex-wrap gap-y-1">
                    <span className="text-[16px] shrink-0" style={kai}>名称（必填）：</span>
                    <input
                      value={createForm.name}
                      onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                      placeholder="请输入"
                      className="h-10 w-[280px] border border-[#e5e6eb] rounded-[2px] px-3 text-[14px] text-[#1d2129] placeholder:text-[#c9cdd4] outline-none focus:border-[#E44548]"
                    />
                  </div>
                  <div className="flex items-center flex-wrap gap-y-1">
                    <span className="text-[16px] shrink-0" style={kai}>统一社会信用代码/纳税人识别号（必填）：</span>
                    <input
                      value={createForm.taxNo}
                      onChange={e => setCreateForm({ ...createForm, taxNo: e.target.value })}
                      placeholder={createForm.titleType === '单位' ? '请输入' : '请输入个人身份证号码'}
                      className="h-10 w-[280px] border border-[#e5e6eb] rounded-[2px] px-3 text-[14px] text-[#1d2129] placeholder:text-[#c9cdd4] outline-none focus:border-[#E44548]"
                    />
                  </div>
                </div>
                <div className="w-9 flex items-center justify-center shrink-0 border-r border-[#e2b9b9]">
                  <span className="text-[16px]" style={{ ...kai, writingMode: 'vertical-rl', letterSpacing: '6px' }}>销售方信息</span>
                </div>
                <div className="flex-1 py-4 pl-6 pr-4 space-y-3 min-w-0">
                  <p className="text-[14px] text-[#333639] leading-[40px]">
                    <span className="text-[16px]" style={kai}>名称：</span>重庆泛语科技有限公司
                  </p>
                  <p className="text-[14px] text-[#333639] leading-[40px]">
                    <span className="text-[16px]" style={kai}>统一社会信用代码/纳税人识别号：</span>91500000MA5U3KNC9J
                  </p>
                </div>
              </div>

              {/* 项目明细（官网：全部左对齐、列间无线条、税额右对齐） */}
              <table className="w-full table-fixed">
                <colgroup>
                  <col style={{ width: '14%' }} />
                  <col style={{ width: '14%' }} />
                  <col style={{ width: '18%' }} />
                  <col style={{ width: '9%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '9%' }} />
                  <col style={{ width: '16%' }} />
                  <col style={{ width: '10%' }} />
                </colgroup>
                <thead>
                  <tr>
                    {['项目名称', '规格型号', '单 位', '数 量', '单 价', '金 额', '税率/征收率'].map(h => (
                      <th key={h} className="text-center py-2.5 text-[16px] font-normal" style={kai}>{h}</th>
                    ))}
                    <th className="text-right py-2.5 pr-4 text-[16px] font-normal" style={kai}>税 额</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="pb-3">
                      <div className="space-y-1">
                        <p className="text-[15px] text-[#86909c]">*生产生活服务</p>
                        <p className="text-[15px] text-[#86909c]">*信息系统服务</p>
                      </div>
                    </td>
                    <td className="pb-3" />
                    <td className="pb-3" />
                    <td className="pb-3 text-center text-[14px] text-[#333639]">1</td>
                    <td className="pb-3 text-center text-[14px] text-[#333639]">{totalAmount}</td>
                    <td className="pb-3 text-center text-[14px] text-[#333639]">{totalAmount}</td>
                    <td className="pb-3 text-center text-[14px] text-[#333639]">6%</td>
                    <td className="pb-3 pr-4 text-right text-[14px] text-[#333639]">{(totalAmount / 1.06 * 0.06).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

              {/* 价税合计（细线与③一致，数值黑字） */}
              <div className="flex items-stretch h-[40px] border-y border-[#e2b9b9]">
                <div className="w-1/3 flex items-center justify-center text-[18px] border-r border-[#e2b9b9]" style={kai}>
                  价税合计（大写）
                </div>
                <div className="flex-1 grid grid-cols-2 items-center px-5">
                  <div className="flex items-center gap-2">
                    <span className="w-[14px] h-[14px] rounded-full border border-[#1d2129] inline-flex items-center justify-center shrink-0">
                      <span className="text-[9px] leading-none text-[#1d2129]">✕</span>
                    </span>
                    <span className="text-[18px] text-[#1d2129]" style={{ fontFamily: kai.fontFamily }}>{toChineseAmount(totalAmount)}</span>
                  </div>
                  <div className="text-center text-[18px] text-[#1d2129]" style={{ fontFamily: kai.fontFamily }}>
                    <span className="text-[#E44548]/60">（小写）</span>¥{totalAmount}
                  </div>
                </div>
              </div>

              {/* 备注块（官网：标签为仅带右边框的单元格，内容垂直居中） */}
              <div className="flex">
                <div className="w-10 flex items-center justify-center shrink-0 border-r border-[#e2b9b9]">
                  <span className="text-[16px] text-[#800000]" style={{ writingMode: 'vertical-rl', letterSpacing: '4px' }}>备注</span>
                </div>
                <div className="flex-1 grid grid-cols-2 min-w-0">
                  <div className="px-4 py-2.5 flex items-center flex-wrap gap-y-1">
                    <span className="text-[16px] shrink-0" style={kai}>购买方地址（非必填）：</span>
                    <input
                      value={createForm.address}
                      onChange={e => setCreateForm({ ...createForm, address: e.target.value })}
                      placeholder="请输入单位/学校规定地址，非个人地址"
                      className="h-10 w-[280px] border border-[#e5e6eb] rounded-[2px] px-3 text-[14px] text-[#1d2129] placeholder:text-[#c9cdd4] outline-none focus:border-[#E44548]"
                    />
                  </div>
                  <div className="px-4 py-2.5 flex items-center flex-wrap gap-y-1">
                    <span className="text-[16px] shrink-0" style={kai}>电话（非必填）：</span>
                    <input
                      value={createForm.phone}
                      onChange={e => setCreateForm({ ...createForm, phone: e.target.value })}
                      placeholder="请输入单位/学校电话"
                      className="h-10 w-[280px] border border-[#e5e6eb] rounded-[2px] px-3 text-[14px] text-[#1d2129] placeholder:text-[#c9cdd4] outline-none focus:border-[#E44548]"
                    />
                  </div>
                  <div className="px-4 py-2.5 flex items-center flex-wrap gap-y-1">
                    <span className="text-[16px] shrink-0" style={kai}>购方开户银行（非必填）：</span>
                    <input
                      value={createForm.bank}
                      onChange={e => setCreateForm({ ...createForm, bank: e.target.value })}
                      placeholder="请输入开户行名称"
                      className="h-10 w-[280px] border border-[#e5e6eb] rounded-[2px] px-3 text-[14px] text-[#1d2129] placeholder:text-[#c9cdd4] outline-none focus:border-[#E44548]"
                    />
                  </div>
                  <div className="px-4 py-2.5 flex items-center flex-wrap gap-y-1">
                    <span className="text-[16px] shrink-0" style={kai}>银行账号（非必填）：</span>
                    <input
                      value={createForm.account}
                      onChange={e => setCreateForm({ ...createForm, account: e.target.value })}
                      placeholder="请输入银行账号"
                      className="h-10 w-[280px] border border-[#e5e6eb] rounded-[2px] px-3 text-[14px] text-[#1d2129] placeholder:text-[#c9cdd4] outline-none focus:border-[#E44548]"
                    />
                  </div>
                  <div className="px-4 py-2.5 text-[14px] text-[#333639]">
                    <span className="text-[16px]" style={kai}>销方开户银行：</span>光大银行重庆分行星光支行
                  </div>
                  <div className="px-4 py-2.5 text-[14px] text-[#333639]">
                    <span className="text-[16px]" style={kai}>银行账号：</span>78490188000161641
                  </div>
                  <div className="px-4 py-2.5 flex items-start gap-y-1">
                    <span className="text-[16px] shrink-0 pt-1.5" style={kai}>其他信息：</span>
                    <textarea
                      value={createForm.other}
                      onChange={e => setCreateForm({ ...createForm, other: e.target.value })}
                      placeholder="请输入"
                      rows={2}
                      className="flex-1 min-w-0 border border-[#e5e6eb] rounded-[2px] px-3 py-2 text-[14px] text-[#1d2129] placeholder:text-[#c9cdd4] outline-none focus:border-[#E44548] resize-y"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="bg-white px-5 py-3 flex justify-end gap-3.5">
            <button onClick={backToList} className="w-[140px] h-[48px] bg-white border border-[#c9cdd4] rounded-[2px] text-[16px] text-[#4e5969] hover:border-[#E44548] hover:text-[#E44548] transition-colors">取消</button>
            <button onClick={submitCreate} className="w-[140px] h-[48px] bg-[#E44548] hover:bg-[#c93a3d] rounded-[2px] text-[16px] text-white transition-colors">确认开票</button>
          </div>
        </div>
      ) : (
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
                      <option value="作废中">作废中</option>
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

            {/* ═══ 工具栏：合并开票 ═══ */}
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => openCreate()}
                className="btn-primary btn-sm"
              >
                <Plus size={14} /> 合并开票
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
                            <button onClick={() => { setSelected([o.id]); openCreate([o.id]) }} className="link text-caption">
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
                        <td className="text-center"><span className={v.status === '已开票' ? 'badge-success' : 'badge-info'}>{v.status}</span></td>
                        <td className="text-center">
                          {v.status === '已开票' ? (
                            <div className="flex items-center justify-center gap-3">
                              <button onClick={() => downloadInvoice(v)} className="link text-caption">下载</button>
                              <a href="/billPreview/index" target="_blank" rel="noopener noreferrer" onClick={() => viewInvoice(v)} className="link text-caption cursor-pointer">查看</a>
                              <button onClick={() => setVoidRecord(v)} className="link text-caption">作废</button>
                              {v.detail && <button onClick={() => setDetailData(v.detail!)} className="link text-caption">明细</button>}
                            </div>
                          ) : v.detail ? (
                            <button onClick={() => setDetailData(v.detail!)} className="link text-caption">明细</button>
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
        )}

      {/* ═══ 确认开票信息弹窗（官网同款） ═══ */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" onClick={() => setConfirmOpen(false)}>
          <div className="w-[560px] bg-white rounded-[4px] shadow-xl max-h-[86vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 pt-5 pb-4">
              <h3 className="text-[16px] font-bold text-[#1d2129]">确认开票信息</h3>
              <button onClick={() => setConfirmOpen(false)} className="text-[#86909c] hover:text-[#1d2129] text-xl leading-none">&times;</button>
            </div>
            <div className="px-6 pb-5 overflow-y-auto flex-1">
              {/* 提示 */}
              <div className="flex items-start gap-2 bg-[#fff7e8] border border-[#ff7d00] rounded-[4px] px-3 py-2">
                <span className="mt-[4px] w-[14px] h-[14px] rounded-full bg-[#ff7d00] text-white text-[10px] leading-[14px] text-center shrink-0">i</span>
                <p className="text-[13px] text-[#333639] leading-[20px]">请与报销单位确认发票抬头及纳税人识别号，确保信息准确无误，避免开具无效发票!</p>
              </div>
              {/* 开票信息汇总 */}
              <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-3 text-[14px] leading-[22px]">
                <p><span className="text-[#E44548]">*</span>发票类型：<span className="text-[#1d2129]">电子发票</span></p>
                <p><span className="text-[#E44548]">*</span>发票抬头类型：<span className="text-[#1d2129]">{createForm.titleType}</span></p>
                <p><span className="text-[#E44548]">*</span>开票金额（元）：<span className="text-[#1d2129]">{totalAmount}</span></p>
                <p><span className="text-[#E44548]">*</span>名称：<span className="text-[#1d2129]">{createForm.name}</span></p>
                <p><span className="text-[#E44548]">*</span>纳税人识别号：<span className="text-[#1d2129]">{createForm.taxNo}</span></p>
                <p>购买方地址：<span className="text-[#1d2129]">{createForm.address || '--'}</span></p>
                <p>注册电话：<span className="text-[#1d2129]">{createForm.phone || '--'}</span></p>
                <p>购方开户银行：<span className="text-[#1d2129]">{createForm.bank || '--'}</span></p>
                <p>银行卡号：<span className="text-[#1d2129]">{createForm.account || '--'}</span></p>
              </div>
              <div className="border-t border-dashed border-[#d6dae5] my-4" />
              {/* 收票信息 */}
              <div className="flex items-center gap-2 mb-3">
                <span className="w-[3px] h-[14px] bg-[#E44548]" />
                <span className="text-[15px] font-bold text-[#1d2129]">收票信息</span>
                <span className="text-[12px] text-[#86909c]">用于接收电子发票，请谨慎填写</span>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[14px] text-[#1d2129] mb-2"><span className="text-[#E44548]">*</span>收票人手机号</p>
                  <div className="flex items-center gap-4">
                    <input
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="请输入"
                      maxLength={11}
                      className="h-10 w-[200px] shrink-0 border border-[#e5e6eb] rounded-[2px] px-3 text-[14px] text-[#1d2129] placeholder:text-[#c9cdd4] outline-none focus:border-[#E44548]"
                    />
                    {!captchaDone ? (
                      <div className="flex-1 min-w-0">
                        <SliderCaptcha done={captchaDone} onDone={() => setCaptchaDone(true)} />
                      </div>
                    ) : (
                      <div className="flex-1 min-w-0 flex items-center gap-3">
                        <input
                          value={smsCode}
                          onChange={e => setSmsCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="请输入6位验证码"
                          maxLength={6}
                          className="h-10 flex-1 min-w-0 border border-[#e5e6eb] rounded-[2px] px-3 text-[14px] text-[#1d2129] placeholder:text-[#c9cdd4] outline-none focus:border-[#E44548]"
                        />
                        <button
                          type="button"
                          onClick={sendCode}
                          disabled={countdown > 0}
                          className={`shrink-0 text-[14px] transition-colors ${countdown > 0 ? 'text-[#c9cdd4] cursor-not-allowed' : 'text-[#E44548] hover:text-[#c93a3d]'}`}
                        >
                          {countdown > 0 ? `${countdown}s后重发` : '获取验证码'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-[14px] text-[#1d2129] mb-2"><span className="text-[#E44548]">*</span>电子邮箱</p>
                  <input
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="请输入"
                    className="h-10 w-full border border-[#e5e6eb] rounded-[2px] px-3 text-[14px] text-[#1d2129] placeholder:text-[#c9cdd4] outline-none focus:border-[#E44548]"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 flex justify-end gap-3 border-t border-[#f0f2f7]">
              <button onClick={() => setConfirmOpen(false)} className="h-[36px] px-5 bg-white border border-[#c9cdd4] rounded-[2px] text-[14px] text-[#4e5969] hover:border-[#E44548] hover:text-[#E44548] transition-colors">取消</button>
              <button onClick={confirmInvoice} className="h-[36px] px-5 bg-[#E44548] hover:bg-[#c93a3d] rounded-[2px] text-[14px] text-white transition-colors">确认</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ 明细弹窗（官网同款：导出明细 + 订单列表） ═══ */}
      {detailData && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" onClick={() => setDetailData(null)}>
          <div className="w-[800px] bg-white rounded-[4px] shadow-xl max-h-[86vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-[18px] border-b border-[#f0f2f7] shrink-0">
              <h3 className="text-[16px] font-medium text-[#1d2129]">明细</h3>
              <button onClick={() => setDetailData(null)} className="text-[#4e5969] hover:text-[#1d2129] text-xl leading-none transition-colors">&times;</button>
            </div>
            <div className="px-6 pt-5 pb-6 overflow-y-auto flex-1">
              <button
                onClick={() => exportDetail(detailData)}
                className="h-[32px] px-4 bg-[#E44548] hover:bg-[#c93a3d] rounded-[2px] text-[14px] text-white inline-flex items-center gap-1.5 transition-colors"
              >
                <Upload size={14} /> 导出明细
              </button>
              <table className="w-full mt-4 text-[14px]">
                <thead>
                  <tr className="bg-[#f7f8fa] h-[44px] text-left text-[#1d2129]">
                    <th className="font-normal pl-4 w-[70px]">序号</th>
                    <th className="font-normal w-[250px]">订单号</th>
                    <th className="font-normal w-[150px]">订单金额</th>
                    <th className="font-normal w-[160px]">订单类型</th>
                    <th className="font-normal">消费方式</th>
                  </tr>
                </thead>
                <tbody>
                  {detailData.orders.map((o, i) => (
                    <tr key={o.orderNo} className="h-[48px] border-b border-[#f0f2f7] text-[#1d2129]">
                      <td className="pl-4">{i + 1}</td>
                      <td>{o.orderNo}</td>
                      <td className="text-[#E44548]">¥ {o.amount}</td>
                      <td>{o.type}</td>
                      <td>{o.payMethod}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 flex justify-end border-t border-[#f0f2f7] shrink-0">
              <button onClick={() => setDetailData(null)} className="h-[36px] px-5 bg-white border border-[#c9cdd4] rounded-[2px] text-[14px] text-[#4e5969] hover:border-[#E44548] hover:text-[#E44548] transition-colors">关闭</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ 确认作废弹窗（官网同款） ═══ */}
      {voidRecord && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" onClick={() => setVoidRecord(null)}>
          <div className="w-[400px] bg-white rounded-[4px] shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 pt-5 pb-3 flex items-center gap-2">
              <span className="w-[16px] h-[16px] rounded-full bg-[#ff7d00] text-white text-[11px] leading-[16px] text-center shrink-0">!</span>
              <h3 className="text-[16px] font-bold text-[#1d2129]">确认作废</h3>
            </div>
            <div className="px-6 pb-5">
              <p className="text-[14px] text-[#4e5969] leading-[24px]">点击确定后，本发票将提交作废申请并进入作废流程。<br />此操作一经提交不可撤销，且不支持二次作废，请务必谨慎确认。</p>
            </div>
            <div className="px-6 py-4 flex justify-end gap-3">
              <button onClick={() => setVoidRecord(null)} className="h-[32px] px-4 bg-white border border-[#c9cdd4] rounded-[2px] text-[14px] text-[#4e5969] hover:border-[#E44548] hover:text-[#E44548] transition-colors">取消</button>
              <button onClick={confirmVoid} className="h-[32px] px-4 bg-[#E44548] hover:bg-[#c93a3d] rounded-[2px] text-[14px] text-white transition-colors">确定</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ 发票抬头管理弹窗 ═══ */}
      {titlesOpen && (
        <div className="overlay" onClick={() => { setTitlesOpen(false); setTitleMode('list') }}>
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
