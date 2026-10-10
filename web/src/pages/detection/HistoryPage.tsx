import { useState, Fragment, useEffect } from 'react'
import { Copy } from 'lucide-react'
import PaymentModal from '@/components/ui/PaymentModal'

const STATUS_TABS = ['全部状态', '未支付', '检测中', '检测完成']

type DetectionStatus = '解析完成' | '待检测' | '检测中' | '检测完成' | '已失效'

interface ReportRecord {
  id: number
  type: string
  version: string
  reportNo: string
  title: string
  author: string
  date: string
  size: string
  amount: number
  status: DetectionStatus
  statusColor: string
  paidAt?: string
  createdAt: number
  paid?: boolean
  detectionDoneAt?: number
  typeCard: {
    label: string
    sub: string
    bg: string
    badge: string
    badgeBg: string
    badgeColor: string
    logo: string
  }
}

const now = Date.now()
const oneHourAgo = now - 60 * 60 * 1000
const thirtyMinAgo = now - 30 * 60 * 1000
const oneHourPlusAgo = now - 61 * 60 * 1000
const twoMinAgo = now - 2 * 60 * 1000
const oneMinAgo = now - 1 * 60 * 1000

const EXPIRED_DAYS = 3 * 365
const threeYearsAgo = Date.now() - EXPIRED_DAYS * 24 * 60 * 60 * 1000

const MOCK_REPORTS: ReportRecord[] = [
  // 1. 解析完成 - 未支付，剩余30分钟倒计时（正常）
  {
    id: 1,
    type: '课程论文检测',
    version: '研究生版',
    reportNo: 'a1b2c3d4e5f6g7h8',
    title: '基于深度学习的图像识别算法研究',
    author: '张三',
    date: new Date(thirtyMinAgo).toLocaleString('zh-CN', { hour12: false }),
    size: '1篇',
    amount: 30,
    status: '解析完成',
    statusColor: '#F53F3F',
    createdAt: thirtyMinAgo,
    paid: false,
    typeCard: {
      label: 'CQMS（标签化）',
      sub: '课程论文检测',
      bg: 'linear-gradient(135deg, #FFF0F0 0%, #FFE8E8 100%)',
      badge: 'CQMS',
      badgeBg: '#E44548',
      badgeColor: '#fff',
      logo: '课程论文检测',
    },
  },
  // 2. 解析完成 - 未支付，已超1小时（失效）
  {
    id: 2,
    type: '课程论文检测',
    version: '研究生版',
    reportNo: 'x9y8z7w6v5u4t3s2',
    title: '基于大语言模型的文本摘要生成研究',
    author: '张三',
    date: new Date(oneHourPlusAgo).toLocaleString('zh-CN', { hour12: false }),
    size: '1篇',
    amount: 30,
    status: '解析完成',
    statusColor: '#F53F3F',
    createdAt: oneHourPlusAgo,
    paid: false,
    typeCard: {
      label: 'CQMS（标签化）',
      sub: '课程论文检测',
      bg: 'linear-gradient(135deg, #FFF0F0 0%, #FFE8E8 100%)',
      badge: 'CQMS',
      badgeBg: '#E44548',
      badgeColor: '#fff',
      logo: '课程论文检测',
    },
  },
  // 3. 待检测 - 已支付，等待检测
  {
    id: 3,
    type: '课程论文检测',
    version: '研究生版',
    reportNo: 'r1p2o3n4m5l6k7j8',
    title: '论文标题示例',
    author: '张三',
    date: new Date(oneMinAgo).toLocaleString('zh-CN', { hour12: false }),
    size: '1篇',
    amount: 30,
    status: '待检测',
    statusColor: '#FF7D00',
    paidAt: new Date(oneMinAgo).toLocaleString('zh-CN', { hour12: false }),
    createdAt: twoMinAgo,
    paid: true,
    typeCard: {
      label: 'CQMS（标签化）',
      sub: '课程论文检测',
      bg: 'linear-gradient(135deg, #FFF0F0 0%, #FFE8E8 100%)',
      badge: 'CQMS',
      badgeBg: '#E44548',
      badgeColor: '#fff',
      logo: '课程论文检测',
    },
  },
  // 4. 检测中
  {
    id: 4,
    type: '课程论文检测',
    version: '研究生版',
    reportNo: 'd5e6f7g8h9i0j1k2',
    title: '自然语言处理中的注意力机制分析',
    author: '李四',
    date: new Date(twoMinAgo).toLocaleString('zh-CN', { hour12: false }),
    size: '1篇',
    amount: 30,
    status: '检测中',
    statusColor: '#165DFF',
    paidAt: new Date(twoMinAgo).toLocaleString('zh-CN', { hour12: false }),
    createdAt: twoMinAgo,
    paid: true,
    typeCard: {
      label: 'CQMS（标签化）',
      sub: '课程论文检测',
      bg: 'linear-gradient(135deg, #FFF0F0 0%, #FFE8E8 100%)',
      badge: 'CQMS',
      badgeBg: '#E44548',
      badgeColor: '#fff',
      logo: '课程论文检测',
    },
  },
  // 5. 检测完成（正常，未超180天）
  {
    id: 5,
    type: '课程论文检测',
    version: '研究生版',
    reportNo: 'm3n4o5p6q7r8s9t0',
    title: '学术论文示例',
    author: '李四',
    date: new Date(now - 7 * 24 * 60 * 60 * 1000).toLocaleString('zh-CN', { hour12: false }),
    size: '1篇',
    amount: 30,
    status: '检测完成',
    statusColor: '#00B42A',
    paidAt: new Date(now - 7 * 24 * 60 * 60 * 1000).toLocaleString('zh-CN', { hour12: false }),
    createdAt: now - 7 * 24 * 60 * 60 * 1000,
    paid: true,
    detectionDoneAt: now - 6 * 24 * 60 * 60 * 1000,
    typeCard: {
      label: 'CQMS（标签化）',
      sub: '课程论文检测',
      bg: 'linear-gradient(135deg, #FFF0F0 0%, #FFE8E8 100%)',
      badge: 'CQMS',
      badgeBg: '#E44548',
      badgeColor: '#fff',
      logo: '课程论文检测',
    },
  },
  // 6. 检测完成但超过3年（检测完成状态但实际失效）
  {
    id: 6,
    type: '课程论文检测',
    version: '研究生版',
    reportNo: 'h8i9j0k1l2m3n4o5',
    title: '深度学习在医学影像中的应用',
    author: '王五',
    date: new Date(threeYearsAgo).toLocaleString('zh-CN', { hour12: false }),
    size: '1篇',
    amount: 30,
    status: '检测完成',
    statusColor: '#00B42A',
    paidAt: new Date(threeYearsAgo).toLocaleString('zh-CN', { hour12: false }),
    createdAt: threeYearsAgo,
    paid: true,
    detectionDoneAt: threeYearsAgo - 30 * 24 * 60 * 60 * 1000,
    typeCard: {
      label: 'CQMS（标签化）',
      sub: '课程论文检测',
      bg: 'linear-gradient(135deg, #FFF0F0 0%, #FFE8E8 100%)',
      badge: 'CQMS',
      badgeBg: '#E44548',
      badgeColor: '#fff',
      logo: '课程论文检测',
    },
  },
]

const STATUS_COUNTS: Record<string, number> = {
  '全部状态': MOCK_REPORTS.length,
  '未支付': MOCK_REPORTS.filter(r => r.status === '解析完成' || r.status === '待检测').length,
  '检测中': MOCK_REPORTS.filter(r => r.status === '检测中').length,
  '检测完成': MOCK_REPORTS.filter(r => r.status === '检测完成').length,
}

const PAYMENT_TIMEOUT_MS = 60 * 60 * 1000

function formatCountdown(ms: number): string {
  if (ms <= 0) return '0 时 0 分 0 秒'
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return `${h} 时 ${String(m).padStart(2, '0')} 分 ${String(s).padStart(2, '0')} 秒`
}

function ExpiredStamp() {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
        <circle cx="36" cy="36" r="32" stroke="#D9D9D9" strokeWidth="2.5" strokeDasharray="4 3" />
        <circle cx="36" cy="36" r="26" stroke="#C9CDD4" strokeWidth="1.5" />
        <text x="36" y="38" textAnchor="middle" fill="#B0B5BE" fontSize="14" fontWeight="600">已失效</text>
      </svg>
    </div>
  )
}

export default function HistoryPage() {
  const [activeStatus, setActiveStatus] = useState('全部状态')
  const [searchField, setSearchField] = useState('标题')
  const [searchText, setSearchText] = useState('')
  const [records, setRecords] = useState(MOCK_REPORTS)
  const [, setTick] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [payingRecord, setPayingRecord] = useState<ReportRecord | null>(null)

  // 每秒刷新以更新倒计时
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  const filtered = records.filter(r => {
    if (activeStatus === '未支付') return r.status === '解析完成' || r.status === '待检测'
    if (activeStatus === '检测中') return r.status === '检测中'
    if (activeStatus === '检测完成') return r.status === '检测完成'
    return true
  }).filter(r => {
    if (!searchText) return true
    const val = searchField === '标题' ? r.title : r.reportNo
    return val.toLowerCase().includes(searchText.toLowerCase())
  })

  function getRemainingMs(r: ReportRecord): number {
    const elapsed = Date.now() - r.createdAt
    return Math.max(0, PAYMENT_TIMEOUT_MS - elapsed)
  }

  function isExpired180Days(r: ReportRecord): boolean {
    if (!r.detectionDoneAt) return false
    return Date.now() - r.detectionDoneAt > EXPIRED_DAYS * 24 * 60 * 60 * 1000
  }

  function handleDelete(id: number) {
    setRecords(prev => prev.filter(r => r.id !== id))
  }

  function handlePay(r: ReportRecord) {
    setPayingRecord(r)
    setShowModal(true)
  }

  function handlePaid() {
    if (!payingRecord) return
    setRecords(prev =>
      prev.map(rec =>
        rec.id === payingRecord.id
          ? { ...rec, paid: true, paidAt: new Date().toLocaleString('zh-CN', { hour12: false }), status: '检测中' as DetectionStatus, statusColor: '#165DFF' }
          : rec
      )
    )
  }

  return (
    <div className="w-full">
      <div className="bg-white rounded-sm">
        {/* Status filter + search */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E6EB]">
          <div className="flex items-center">
            {STATUS_TABS.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveStatus(tab)}
                className={`text-[14px] px-5 py-1.5 border transition-colors ${
                  i > 0 ? '-ml-px' : ''
                } ${
                  activeStatus === tab
                    ? 'border-[#F53F3F] text-[#F53F3F] bg-white z-10 relative'
                    : 'border-[#E5E6EB] text-[#4E5969] bg-white hover:text-[#1D2129]'
                } ${i === 0 ? 'rounded-l' : ''} ${i === STATUS_TABS.length - 1 ? 'rounded-r' : ''}`}
              >
                {tab}
                <span className={`ml-1 ${activeStatus === tab ? 'text-[#F53F3F]' : 'text-[#86909C]'}`}>
                  ({STATUS_COUNTS[tab]})
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={searchField}
              onChange={e => setSearchField(e.target.value)}
              className="h-[32px] border border-[#E5E6EB] rounded px-2 text-[14px] text-[#4E5969] outline-none bg-white cursor-pointer"
            >
              <option>标题</option>
              <option>报告编号</option>
            </select>
            <input
              type="text"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              placeholder="请输入"
              className="h-[32px] w-[200px] border border-[#E5E6EB] rounded px-3 text-[14px] outline-none focus:border-[#165DFF] placeholder-[#C9CDD4]"
            />
            <button className="h-[32px] px-4 bg-[#F53F3F] text-white text-[14px] rounded hover:bg-[#F76560] transition-colors">
              搜索
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto" style={{ maxHeight: '700px', overflowY: 'auto' }}>
          <table className="text-[14px]" style={{ tableLayout: 'fixed', width: '100%' }}>
            <colgroup>
              <col style={{ width: '18%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '22%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '12%' }} />
            </colgroup>
            <thead>
              <tr className="bg-[#F7F8FA]">
                <th className="text-center py-3 px-2 font-medium text-[#4E5969] text-[14px] border-b border-[#E5E6EB]">检测类型</th>
                <th className="text-center py-3 px-2 font-medium text-[#4E5969] text-[14px] border-b border-[#E5E6EB]">报告编号</th>
                <th className="text-center py-3 px-2 font-medium text-[#4E5969] text-[14px] border-b border-[#E5E6EB]">检测信息</th>
                <th className="text-center py-3 px-2 font-medium text-[#4E5969] text-[14px] border-b border-[#E5E6EB]">付费信息</th>
                <th className="text-center py-3 px-2 font-medium text-[#4E5969] text-[14px] border-b border-[#E5E6EB]">检测结果</th>
                <th className="text-center py-3 px-2 font-medium text-[#4E5969] text-[14px] border-b border-[#E5E6EB]">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const cardBg = '/card-chachong.svg'
                const remainingMs = getRemainingMs(r)
                const unpaidAndExpired = r.status === '解析完成' && !r.paid && remainingMs <= 0
                const reportExpired = r.status === '检测完成' && isExpired180Days(r)

                return (
                  <Fragment key={r.id}>
                    {/* 检测信息行 - 浅紫灰底色 */}
                    <tr className="bg-[#F0F0F8]">
                      <td colSpan={6} className="py-2 px-4">
                        <div className="flex items-center gap-6">
                          <span className="text-[13px] text-[#4E5969]">{r.date}</span>
                          {r.title && <span className="text-[13px] text-[#4E5969]">标题：{r.title}</span>}
                          {r.author && <span className="text-[13px] text-[#4E5969]">作者：{r.author}</span>}
                        </div>
                      </td>
                    </tr>
                    {/* 报告数据行 */}
                    <tr className="border-b border-[#F2F3F5]">
                      <td className="py-4 px-2">
                        <div className="rounded overflow-hidden" style={{ backgroundImage: `url(${cardBg})`, backgroundSize: 'cover', minHeight: '60px' }}>
                          <div className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[12px] font-bold px-1.5 py-0.5 rounded" style={{ background: r.typeCard.badgeBg, color: r.typeCard.badgeColor, fontSize: '10px' }}>
                                {r.typeCard.badge}
                              </span>
                              <span className="text-[13px] font-bold text-[#1D2129]">{r.typeCard.logo}</span>
                            </div>
                            <span className="inline-block text-[11px] mt-1 px-1.5 py-0.5 rounded border text-[#F53F3F] border-[#F53F3F] bg-white">
                              {r.version}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="text-center py-4 px-2">
                        <span className="text-[14px] text-[#1D2129] font-mono">{r.reportNo}</span>
                        <button className="ml-1 text-[#86909C] hover:text-[#165DFF]">
                          <Copy size={13} />
                        </button>
                      </td>
                      <td className="text-center py-4 px-2 text-[14px] text-[#1D2129]">{r.size}</td>
                      <td className="text-center py-4 px-2 text-[14px] text-[#F53F3F]">￥{r.amount}</td>
                      <td className="text-center py-4 px-2">
                        <span className="text-[14px]" style={{ color: r.statusColor }}>{r.status}</span>
                      </td>
                      <td className="text-center py-4 px-2">
                        {/* 未支付且未超时：立即支付 + 倒计时 + 删除记录 */}
                        {r.status === '解析完成' && !r.paid && !unpaidAndExpired && (
                          <div className="flex flex-col items-center gap-1.5">
                            <button
                              onClick={() => handlePay(r)}
                              className="w-[90px] h-[36px] bg-[#E44548] hover:bg-[#c93a3d] text-white text-[14px] font-medium rounded-[4px] transition-colors"
                            >
                              立即支付
                            </button>
                            <span className="text-[13px] text-[#4E5969]">剩余 {formatCountdown(remainingMs)}</span>
                            <button onClick={() => handleDelete(r.id)} className="text-[14px] text-[#4E5969] hover:text-[#F53F3F]">删除记录</button>
                          </div>
                        )}
                        {/* 未支付且已超时：已失效 + 删除记录 */}
                        {r.status === '解析完成' && !r.paid && unpaidAndExpired && (
                          <div className="flex flex-col items-center gap-1.5">
                            <ExpiredStamp />
                            <button onClick={() => handleDelete(r.id)} className="text-[14px] text-[#4E5969] hover:text-[#F53F3F]">删除记录</button>
                          </div>
                        )}
                        {/* 待检测：立即支付 + 倒计时 + 删除记录 */}
                        {r.status === '待检测' && (
                          <div className="flex flex-col items-center gap-1.5">
                            <button
                              onClick={() => handlePay(r)}
                              className="w-[90px] h-[36px] bg-[#E44548] hover:bg-[#c93a3d] text-white text-[14px] font-medium rounded-[4px] transition-colors"
                            >
                              立即支付
                            </button>
                            <span className="text-[13px] text-[#4E5969]">剩余 {formatCountdown(remainingMs)}</span>
                            <button onClick={() => handleDelete(r.id)} className="text-[14px] text-[#4E5969] hover:text-[#F53F3F]">删除记录</button>
                          </div>
                        )}
                        {/* 检测中：横杠 */}
                        {r.status === '检测中' && (
                          <span className="text-[14px] text-[#C9CDD4]">-</span>
                        )}
                        {/* 检测完成未超期：查看报告 + 下载报告 + 删除记录 */}
                        {r.status === '检测完成' && !reportExpired && (
                          <div className="flex flex-col items-center gap-1.5">
                            <a href="/report-demo.html" target="_blank" rel="noopener noreferrer" className="text-[14px] text-[#165DFF] hover:text-[#0E42D2]">查看报告</a>
                            <a href="/report-demo.zip" download="检测报告.zip" className="text-[14px] text-[#165DFF] hover:text-[#0E42D2]">下载报告</a>
                            <button onClick={() => handleDelete(r.id)} className="text-[14px] text-[#4E5969] hover:text-[#F53F3F]">删除记录</button>
                          </div>
                        )}
                        {/* 检测完成但超180天：已失效 + 删除记录 */}
                        {r.status === '检测完成' && reportExpired && (
                          <div className="flex flex-col items-center gap-1.5">
                            <ExpiredStamp />
                            <button onClick={() => handleDelete(r.id)} className="text-[14px] text-[#4E5969] hover:text-[#F53F3F]">删除记录</button>
                          </div>
                        )}
                        {/* 已失效 */}
                        {r.status === '已失效' && (
                          <div className="flex flex-col items-center gap-1.5">
                            <ExpiredStamp />
                            <button onClick={() => handleDelete(r.id)} className="text-[14px] text-[#4E5969] hover:text-[#F53F3F]">删除记录</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E5E6EB]">
          <span className="text-[14px] text-[#4E5969]">共 {filtered.length} 条记录</span>
        </div>
      </div>

      <PaymentModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setPayingRecord(null) }}
        onPaid={handlePaid}
        totalPrice={payingRecord?.amount ?? 0}
      />
    </div>
  )
}
