/* 发票 PDF 生成：票面绘制到离屏 Canvas → JPEG → 封装为单页 PDF（A4 横向），无第三方依赖 */

export interface InvoicePdfData {
  invoiceNo: string
  time: string
  amount: number
  buyerName: string
  buyerTaxNo: string
}

const W = 1414
const H = 1000
const LINE = '#e2b9b9'
const RED = '#800000'
const STAMP = '#e02020'
const INK = '#333639'
const PINK = 'rgba(228, 69, 72, 0.6)'
const KAI = '"Kaiti SC", "KaiTi", "STKaiti", "SimKai", serif'

/* 票面绘制 */
function drawFace(data: InvoicePdfData, upper: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  const net = (data.amount / 1.06).toFixed(2)
  const tax = (data.amount - data.amount / 1.06).toFixed(2)
  const [y, m, d] = data.time.slice(0, 10).split('-')

  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, W, H)

  const text = (t: string, x: number, yPos: number, size: number, color = RED, align: CanvasTextAlign = 'left', family = KAI) => {
    ctx.font = `${size}px ${family}`
    ctx.fillStyle = color
    ctx.textAlign = align
    ctx.fillText(t, x, yPos)
  }
  const hline = (x1: number, x2: number, yPos: number, w = 1.5, color = LINE) => {
    ctx.strokeStyle = color
    ctx.lineWidth = w
    ctx.beginPath()
    ctx.moveTo(x1, yPos)
    ctx.lineTo(x2, yPos)
    ctx.stroke()
  }
  const vline = (x: number, y1: number, y2: number, w = 1.5, color = LINE) => {
    ctx.strokeStyle = color
    ctx.lineWidth = w
    ctx.beginPath()
    ctx.moveTo(x, y1)
    ctx.lineTo(x, y2)
    ctx.stroke()
  }
  const vlabel = (chars: string, x: number, startY: number, size: number, step: number) => {
    ctx.font = `${size}px ${KAI}`
    ctx.fillStyle = RED
    ctx.textAlign = 'center'
    chars.split('').forEach((ch, i) => ctx.fillText(ch, x, startY + i * step))
  }

  /* —— 二维码（确定性图案） —— */
  let seed = 20261012
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }
  const cell = 120 / 25
  const inFinder = (r: number, c: number) => [[2, 2], [2, 16], [16, 2]].some(([zr, zc]) => r >= zr && r < zr + 7 && c >= zc && c < zc + 7)
  ctx.fillStyle = '#1d2129'
  for (let r = 2; r <= 22; r++) {
    for (let c = 2; c <= 22; c++) {
      if (inFinder(r, c)) continue
      if (rnd() > 0.52) ctx.fillRect(60 + c * cell, 48 + r * cell, cell, cell)
    }
  }
  const finder = (fr: number, fc: number) => {
    const px = 60 + fc * cell
    const py = 48 + fr * cell
    const s = 7 * cell
    ctx.fillStyle = '#1d2129'
    ctx.fillRect(px, py, s, s)
    ctx.fillStyle = '#fff'
    ctx.fillRect(px + cell, py + cell, s - 2 * cell, s - 2 * cell)
    ctx.fillStyle = '#1d2129'
    ctx.fillRect(px + 2 * cell, py + 2 * cell, s - 4 * cell, s - 4 * cell)
  }
  finder(2, 2)
  finder(2, 16)
  finder(16, 2)

  /* —— 标题 + 双线 —— */
  text('电子发票（普通发票）', 707, 132, 52, RED, 'center')
  hline(460, 954, 158, 3, RED)
  hline(460, 954, 167, 1.2, RED)

  /* —— 监制章（覆盖标题下线） —— */
  ctx.strokeStyle = STAMP
  ctx.lineWidth = 3.5
  ctx.beginPath()
  ctx.ellipse(707, 195, 115, 60, 0, 0, Math.PI * 2)
  ctx.stroke()
  text('全国统一发票监制章', 707, 182, 24, STAMP, 'center')
  text('★', 707, 220, 28, STAMP, 'center')
  text('国家税务总局重庆市税务局', 707, 242, 13, STAMP, 'center')

  /* —— 右侧号码/日期 —— */
  text('发票号码：', 1040, 80, 20)
  text(data.invoiceNo, 1165, 80, 18, INK)
  text('开票日期：', 1040, 118, 20)
  text(`${+y}年${+m}月${+d}日`, 1165, 118, 18, INK)

  /* —— 购买方 / 销售方 —— */
  ctx.strokeStyle = LINE
  ctx.lineWidth = 1.5
  ctx.strokeRect(60, 270, 1294, 140)
  vline(100, 270, 410)
  vline(707, 270, 410)
  vline(747, 270, 410)
  vlabel('购买方信息', 80, 306, 18, 24)
  vlabel('销售方信息', 727, 306, 18, 24)
  text('名称：', 120, 320, 22)
  text(data.buyerName, 198, 320, 20, INK)
  text('统一社会信用代码/纳税人识别号：', 120, 375, 19)
  text(data.buyerTaxNo, 442, 375, 18, INK)
  text('名称：', 787, 320, 22)
  text('重庆泛语科技有限公司', 865, 320, 20, INK)
  text('统一社会信用代码/纳税人识别号：', 787, 375, 19)
  text('91500000MA5U3KNC9J', 1109, 375, 18, INK)

  /* —— 项目明细表 —— */
  const cols = [60, 422, 538, 629, 733, 901, 1069, 1198, 1354]
  const center = (i: number) => (cols[i] + cols[i + 1]) / 2
  const heads = ['项目名称', '规格型号', '单 位', '数 量', '单 价', '金 额', '税率/征收率']
  heads.forEach((t, i) => text(t, center(i), 450, 22, RED, 'center'))
  text('税 额', 1340, 450, 22, RED, 'right')
  text('*生产生活服务*信息系统服务', 80, 502, 16, INK)
  text('1', center(3), 502, 20, INK, 'center')
  text(net, center(4), 502, 20, INK, 'center')
  text(net, center(5), 502, 20, INK, 'center')
  text('6%', center(6), 502, 20, INK, 'center')
  text(tax, 1340, 502, 20, INK, 'right')
  hline(60, 1354, 528)
  text('合　　计', center(0), 564, 22, RED, 'center')
  text(net, center(5), 564, 20, INK, 'center')
  text(tax, 1340, 564, 20, INK, 'right')

  /* —— 价税合计 —— */
  hline(60, 1354, 582)
  hline(60, 1354, 634)
  vline(300, 582, 634)
  text('价税合计（大写）', 180, 616, 22, RED, 'center')
  ctx.strokeStyle = INK
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(330, 608, 11, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(323, 601)
  ctx.lineTo(337, 615)
  ctx.moveTo(337, 601)
  ctx.lineTo(323, 615)
  ctx.stroke()
  text(upper, 355, 616, 24, INK)
  text('（小写）', 1120, 616, 20, PINK)
  text(`¥${data.amount.toFixed(2)}`, 1340, 616, 22, INK, 'right')

  /* —— 备注 —— */
  hline(60, 1354, 634)
  vline(100, 634, 700)
  vlabel('备注', 80, 660, 16, 24)
  hline(60, 1354, 700)

  /* —— 开票人 —— */
  text('开票人：易倩妮', 707, 748, 20, RED, 'center')

  return canvas
}

/* JPEG 封装为单页 PDF */
function buildPdf(jpeg: Uint8Array): Uint8Array {
  const enc = new TextEncoder()
  const parts: Uint8Array[] = []
  const offsets: number[] = []
  let pos = 0
  const push = (chunk: string | Uint8Array) => {
    const b = typeof chunk === 'string' ? enc.encode(chunk) : chunk
    parts.push(b)
    pos += b.length
  }
  const obj = (n: number, body: string) => {
    offsets[n] = pos
    push(`${n} 0 obj\n${body}\nendobj\n`)
  }

  push('%PDF-1.4\n')
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>')
  obj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>')
  obj(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /XObject << /Im0 5 0 R >> /ProcSet [/PDF /ImageC] >> /Contents 4 0 R >>`)
  const content = `q\n${W} 0 0 ${H} 0 0 cm\n/Im0 Do\nQ\n`
  obj(4, `<< /Length ${content.length} >>\nstream\n${content}endstream`)
  push(`5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${W} /Height ${H} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`)
  push(jpeg)
  push('\nendstream\nendobj\n')

  const xrefPos = pos
  let xref = 'xref\n0 6\n0000000000 65535 f \n'
  for (let i = 1; i <= 5; i++) xref += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`
  xref += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`
  push(xref)

  const out = new Uint8Array(new ArrayBuffer(pos))
  let off = 0
  for (const b of parts) {
    out.set(b, off)
    off += b.length
  }
  return out
}

export function generateInvoicePdf(data: InvoicePdfData, upper: string) {
  const canvas = drawFace(data, upper)
  const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
  const bin = atob(dataUrl.split(',')[1])
  const jpeg = new Uint8Array(new ArrayBuffer(bin.length))
  for (let i = 0; i < bin.length; i++) jpeg[i] = bin.charCodeAt(i)

  const pdfBytes = buildPdf(jpeg)
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `电子发票（普通发票）-${data.invoiceNo}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}
