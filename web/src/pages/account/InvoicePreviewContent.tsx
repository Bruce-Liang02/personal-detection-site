import { useState, type ReactNode } from 'react'
import { Download } from 'lucide-react'
import { kai, toChineseAmount } from './InvoicePage'
import { generateInvoicePdf } from './invoicePdf'

/* 发票票面预览页（官网「查看」为新标签页打开税务 PDF，本系统用独立预览页替代；数据经 localStorage 由列表页传入） */

const PREVIEW_KEY = 'invoice_preview_v1'

interface PreviewRecord {
  invoiceNo: string
  time: string
  amount: number
  buyerName: string
  buyerTaxNo: string
}

function loadRecord(): PreviewRecord | null {
  try {
    const raw = localStorage.getItem(PREVIEW_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return null
}

/* 票面左上角二维码（演示用确定性图案） */
function QrCode({ size = 72 }: { size?: number }) {
  const N = 25
  const cells: ReactNode[] = []
  let seed = 20261012
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }
  const inFinder = (r: number, c: number) =>
    [[2, 2], [2, 16], [16, 2]].some(([zr, zc]) => r >= zr && r < zr + 7 && c >= zc && c < zc + 7)
  for (let r = 2; r < N - 2; r++) {
    for (let c = 2; c < N - 2; c++) {
      if (inFinder(r, c)) continue
      if (rnd() > 0.52) cells.push(<rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} />)
    }
  }
  const finder = (fr: number, fc: number) => (
    <g key={`f-${fr}-${fc}`}>
      <rect x={fc} y={fr} width={7} height={7} fill="#1d2129" />
      <rect x={fc + 1} y={fr + 1} width={5} height={5} fill="#fff" />
      <rect x={fc + 2} y={fr + 2} width={3} height={3} fill="#1d2129" />
    </g>
  )
  return (
    <svg width={size} height={size} viewBox={`0 0 ${N} ${N}`} className="shrink-0">
      <rect width={N} height={N} fill="#fff" />
      {cells}
      {finder(2, 2)}
      {finder(2, 16)}
      {finder(16, 2)}
    </svg>
  )
}

/* 发票监制章（红章，覆盖在标题下划线上） */
function InvoiceStamp() {
  return (
    <svg width="170" height="96" viewBox="0 0 170 96" className="pointer-events-none absolute left-1/2 top-[30px] -translate-x-1/2 z-10 opacity-90">
      <defs>
        <path id="stamp-top" d="M 20 50 A 66 38 0 0 1 150 50" fill="none" />
        <path id="stamp-bottom" d="M 14 44 A 72 44 0 0 0 156 44" fill="none" />
      </defs>
      <ellipse cx="85" cy="48" rx="79" ry="43" fill="none" stroke="#e02020" strokeWidth="2.5" />
      <text fill="#e02020" fontSize="14" fontWeight="bold" letterSpacing="3">
        <textPath href="#stamp-top" startOffset="50%" textAnchor="middle">全国统一发票监制章</textPath>
      </text>
      <text x="85" y="54" textAnchor="middle" fill="#e02020" fontSize="15">★</text>
      <text fill="#e02020" fontSize="9" letterSpacing="1.5">
        <textPath href="#stamp-bottom" startOffset="50%" textAnchor="middle">国家税务总局重庆市税务局</textPath>
      </text>
    </svg>
  )
}

export default function InvoicePreviewContent() {
  const [record] = useState<PreviewRecord | null>(loadRecord)
  const [dlCount, setDlCount] = useState(0)

  if (!record) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#e8eaee]">
        <p className="text-[14px] text-[#86909c]">发票数据不存在或已失效，请从「发票管理 → 开票历史」重新打开</p>
      </div>
    )
  }

  const net = record.amount / 1.06
  const tax = record.amount - net
  const [y, m, d] = record.time.slice(0, 10).split('-')

  return (
    <div className="min-h-screen bg-[#e8eaee] py-6 px-4 overflow-auto">
      {/* PDF 工具栏（官网为浏览器 PDF 查看器：页码 + 下载） */}
      <div className="w-[1040px] max-w-[96vw] mx-auto mb-3 h-10 rounded-[4px] bg-[#323639] px-4 flex items-center justify-between text-[13px] text-white/90">
        <span className="truncate">电子发票（普通发票）-{record.invoiceNo}.pdf</span>
        <div className="flex items-center gap-5 shrink-0 ml-4">
          <span className="tnum">1 / 1</span>
          <span className="tnum">下载次数：{dlCount}</span>
          <button
            onClick={() => {
              generateInvoicePdf({ invoiceNo: record.invoiceNo, time: record.time, amount: record.amount, buyerName: record.buyerName, buyerTaxNo: record.buyerTaxNo }, toChineseAmount(record.amount))
              setDlCount(c => c + 1)
            }}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Download size={14} /> 下载
          </button>
        </div>
      </div>

      <div className="w-[1040px] max-w-[96vw] mx-auto bg-white shadow-lg p-8">
        {/* 票头 */}
        <div className="flex items-center gap-4">
          <QrCode size={72} />
          <div className="flex-1 text-center min-w-0 relative">
            <span className="inline-block text-[30px] leading-[44px] tracking-[6px] px-3 border-b-[5px] border-double border-[#800000] whitespace-nowrap" style={kai}>电子发票（普通发票）</span>
            <InvoiceStamp />
          </div>
          <div className="w-[230px] shrink-0 text-[13px] leading-[26px]">
            <p><span style={kai}>发票号码：</span><span className="text-[#333639]">{record.invoiceNo}</span></p>
            <p><span style={kai}>开票日期：</span><span className="text-[#333639]">{+y}年{+m}月{+d}日</span></p>
          </div>
        </div>
        {/* 购买方 / 销售方 */}
        <div className="mt-4 flex border border-[#e2b9b9]">
          <div className="w-9 flex items-center justify-center shrink-0 border-r border-[#e2b9b9]">
            <span className="text-[15px]" style={{ ...kai, writingMode: 'vertical-rl', letterSpacing: '5px' }}>购买方信息</span>
          </div>
          <div className="flex-1 py-3.5 pl-5 pr-4 space-y-3 min-w-0 border-r border-[#e2b9b9]">
            <p className="text-[14px] text-[#333639] leading-[26px]"><span className="text-[16px] shrink-0" style={kai}>名称：</span>{record.buyerName}</p>
            <p className="text-[14px] text-[#333639] leading-[26px] whitespace-nowrap"><span className="text-[15px]" style={kai}>统一社会信用代码/纳税人识别号：</span>{record.buyerTaxNo}</p>
          </div>
          <div className="w-9 flex items-center justify-center shrink-0 border-r border-[#e2b9b9]">
            <span className="text-[15px]" style={{ ...kai, writingMode: 'vertical-rl', letterSpacing: '5px' }}>销售方信息</span>
          </div>
          <div className="flex-1 py-3.5 pl-5 pr-4 space-y-3 min-w-0">
            <p className="text-[14px] text-[#333639] leading-[26px]"><span className="text-[16px] shrink-0" style={kai}>名称：</span>重庆泛语科技有限公司</p>
            <p className="text-[14px] text-[#333639] leading-[26px] whitespace-nowrap"><span className="text-[15px]" style={kai}>统一社会信用代码/纳税人识别号：</span>91500000MA5U3KNC9J</p>
          </div>
        </div>
        {/* 项目明细 */}
        <table className="w-full table-fixed border border-t-0 border-[#e2b9b9]">
          <colgroup>
            <col style={{ width: '28%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '7%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '13%' }} />
            <col style={{ width: '13%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '12%' }} />
          </colgroup>
          <thead>
            <tr className="border-b border-[#e2b9b9]">
              {['项目名称', '规格型号', '单 位', '数 量', '单 价', '金 额', '税率/征收率'].map(h => (
                <th key={h} className="py-2.5 text-[15px] font-normal text-center" style={kai}>{h}</th>
              ))}
              <th className="py-2.5 pr-3 text-[15px] font-normal text-right" style={kai}>税 额</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-3 py-2.5 text-[14px] text-[#333639]">*生产生活服务*信息系统服务</td>
              <td className="py-2.5" />
              <td className="py-2.5" />
              <td className="py-2.5 text-center text-[14px] text-[#333639]">1</td>
              <td className="py-2.5 text-center text-[14px] text-[#333639] tnum">{net.toFixed(2)}</td>
              <td className="py-2.5 text-center text-[14px] text-[#333639] tnum">{net.toFixed(2)}</td>
              <td className="py-2.5 text-center text-[14px] text-[#333639]">6%</td>
              <td className="py-2.5 pr-3 text-right text-[14px] text-[#333639] tnum">{tax.toFixed(2)}</td>
            </tr>
            <tr className="border-t border-[#e2b9b9]">
              <td className="px-3 py-2.5 text-[15px] text-center" style={kai}>合　　计</td>
              <td colSpan={4} />
              <td className="py-2.5 text-center text-[14px] text-[#333639] tnum">{net.toFixed(2)}</td>
              <td />
              <td className="py-2.5 pr-3 text-right text-[14px] text-[#333639] tnum">{tax.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        {/* 价税合计 */}
        <div className="flex items-stretch h-[46px] border border-t-0 border-[#e2b9b9]">
          <div className="w-[220px] flex items-center justify-center text-[16px] border-r border-[#e2b9b9]" style={kai}>价税合计（大写）</div>
          <div className="flex-1 grid grid-cols-2 items-center px-5">
            <div className="flex items-center gap-2">
              <span className="w-[15px] h-[15px] rounded-full border border-[#1d2129] inline-flex items-center justify-center shrink-0">
                <span className="text-[10px] leading-none text-[#1d2129]">✕</span>
              </span>
              <span className="text-[17px] text-[#1d2129]" style={{ fontFamily: kai.fontFamily }}>{toChineseAmount(record.amount)}</span>
            </div>
            <div className="text-right text-[17px] text-[#1d2129] tnum" style={{ fontFamily: kai.fontFamily }}>
              <span className="text-[#E44548]/60">（小写）</span>¥{record.amount.toFixed(2)}
            </div>
          </div>
        </div>
        {/* 备注 */}
        <div className="flex min-h-[68px] border border-t-0 border-[#e2b9b9]">
          <div className="w-9 flex items-center justify-center shrink-0 border-r border-[#e2b9b9]">
            <span className="text-[14px] text-[#800000]" style={{ writingMode: 'vertical-rl', letterSpacing: '3px' }}>备注</span>
          </div>
          <div className="flex-1" />
        </div>
        <p className="mt-6 text-[14px] text-[#333639] text-center"><span style={kai}>开票人：</span>易倩妮</p>
      </div>
    </div>
  )
}
