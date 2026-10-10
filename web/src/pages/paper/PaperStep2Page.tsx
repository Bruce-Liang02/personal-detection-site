import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PaymentModal from '@/components/ui/PaymentModal'
import ParsingProgressModal from '@/components/ui/ParsingProgressModal'
import { useDetectionStore } from '@/stores/detectionStore'

const STEPS_DEFAULT = [
  { num: 1, label: '上传文档', desc: '已完成', status: 'finish' as const },
  { num: 2, label: '确认支付', desc: '当前步骤', status: 'process' as const },
  { num: 3, label: '查看报告', desc: '待处理', status: 'wait' as const },
]

const STEPS_DONE = [
  { num: 1, label: '上传文档', desc: '已完成', status: 'finish' as const },
  { num: 2, label: '确认支付', desc: '已完成', status: 'finish' as const },
  { num: 3, label: '查看报告', desc: '当前步骤', status: 'process' as const },
]

interface DetectionItem {
  id: string
  type: string
  badge: string
  version: string
  size: string
  unitPrice: string
  totalPrice: number
  selected: boolean
}

const DETECTION_ITEMS: DetectionItem[] = [
  {
    id: 'cqms',
    type: '课程论文检测',
    badge: 'CQMS',
    version: '研究生版',
    size: '1篇',
    unitPrice: '30.00元/篇',
    totalPrice: 30,
    selected: true,
  },
]

export default function PaperStep2Page() {
  const nav = useNavigate()
  const { file, paperTitle, authorName, clear: clearDetection } = useDetectionStore()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showParsing, setShowParsing] = useState(false)
  const [parsingDone, setParsingDone] = useState(false)
  const [items] = useState(DETECTION_ITEMS)
  const [currentStep, setCurrentStep] = useState<number>(2)
  const [detectionDone, setDetectionDone] = useState(false)
  const [reportId, setReportId] = useState<string>('')

  const steps = currentStep === 2 ? STEPS_DEFAULT : STEPS_DONE

  // 进入步骤3时立即生成报告编号
  useEffect(() => {
    if (currentStep !== 3) return
    const now = new Date()
    const dateStr = now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0')
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase()
    setReportId(`RPT${dateStr}${randomStr}`)
    setDetectionDone(true)
  }, [currentStep])

  // 进入步骤2时自动弹出解析进度弹窗，重置解析状态，3s后自动完成
  useEffect(() => {
    if (currentStep !== 2) return
    setParsingDone(false)
    setShowParsing(true)
    const timer = setTimeout(() => {
      setParsingDone(true)
    }, 3000)
    return () => clearTimeout(timer)
  }, [currentStep])

  // 解析完成后 1s 自动关闭弹窗
  useEffect(() => {
    if (!parsingDone) return
    const timer = setTimeout(() => {
      setShowParsing(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [parsingDone])

  const fileData = file?.name || ''

  const selectedItems = items.filter(i => i.selected)
  const totalPrice = selectedItems.reduce((sum, i) => sum + i.totalPrice, 0)

  async function handleConfirmPayment() {
    if (!fileData) { setError('未找到上传文件'); return }
    if (selectedItems.length === 0) { setError('请至少选择一项检测类型'); return }
    
    setSubmitting(true)
    setError('')
    setShowModal(true)
    setSubmitting(false)
  }

  function handlePaid() {
    setShowModal(false)
    setCurrentStep(3)
  }

  function handleBack() {
    clearDetection()
    setCurrentStep(2)
    nav('/paper')
  }

  return (
    <div>
      {/* ═ Step Progress ═══ */}
      <div className="card card-pad mb-6">
        <div className="flex items-center">
          {steps.map((step, i) => {
            const isFinish = step.status === 'finish'
            const isActive = step.status === 'process'
            const descColor = isFinish ? 'text-brand-700' : 'text-ink-3'
            const titleColor = isActive ? 'font-bold text-brand-700' : 'font-normal text-ink'
            return (
              <div key={step.num} className="flex items-center flex-1">
                <div className="flex items-center flex-shrink-0">
                  {isFinish ? (
                    <svg className="shrink-0 mr-3" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#017173" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <div className={`w-7 h-7 mr-3 rounded-full flex items-center justify-center shrink-0 ${isActive ? 'bg-brand-700 text-white shadow-brand' : 'bg-line-soft text-ink-3'}`}>
                      <span className="text-subtitle font-medium tnum">{step.num}</span>
                    </div>
                  )}
                  <div>
                    <p className={`text-subtitle whitespace-nowrap ${titleColor}`}>{step.label}</p>
                    <p className={`text-micro whitespace-nowrap ${descColor}`}>{step.desc}</p>
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 mx-4 border-t-2 border-dashed ${(isFinish || isActive) ? 'border-brand-700' : 'border-line'}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ═══ Step 2: Payment ═══ */}
      {currentStep === 2 && (
        <>
          {/* Detection Type Card */}
          <div className="card card-pad mb-6 relative">
            {/* 解析中蒙版 */}
            {!parsingDone && (
              <div className="absolute inset-0 z-10 bg-white/70 rounded-lg flex items-center justify-center">
                <div className="w-8 h-8 border-[3px] border-brand-700 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            <h3 className="text-subtitle text-ink mb-4">标题：{paperTitle} | 作者：{authorName}</h3>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {items.map(item => (
                <div
                  key={item.id}
                  className={`relative rounded-lg border-2 p-4 transition-all ${
                    item.selected
                      ? 'border-brand-700 bg-brand-soft'
                      : 'border-line bg-white'
                  }`}
                >
                  <div className="absolute top-2 right-2 w-5 h-5 bg-brand-700 rounded-full flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge-brand">
                      {item.badge}
                    </span>
                    <span className="text-body font-bold text-ink">{item.type}</span>
                  </div>
                  <div className="text-micro text-ink-3">
                    {item.version}
                  </div>
                </div>
              ))}
            </div>

            {/* Fee Details Table */}
            <h4 className="section-title mb-3">
              费用明细 <span className="text-micro text-ink-3 font-normal">（默认选择当前最大优惠）</span>
            </h4>

            <div className="table-wrap mb-4">
            <table className="w-full text-body">
              <thead>
                <tr className="table-head">
                  <th className="text-left py-3 px-4 font-medium">检测类型</th>
                  <th className="text-left py-3 px-4 font-medium">计费信息</th>
                  <th className="text-left py-3 px-4 font-medium">实付金额</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="table-row">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="badge-brand">
                          {item.badge}
                        </span>
                        <div>
                          <p className="text-body text-ink font-medium">{item.type}</p>
                          <p className="text-micro text-ink-3">{item.version}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {parsingDone ? (
                        <>
                          <p className="text-body text-ink tnum">{item.size}</p>
                          <p className="text-micro text-ink-3 tnum">{item.unitPrice}</p>
                        </>
                      ) : (
                        <p className="text-body text-ink-3 flex items-center gap-1.5">
                          <span className="w-3.5 h-3.5 border-2 border-brand-700 border-t-transparent rounded-full animate-spin inline-block" />
                          计算中
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {parsingDone ? (
                        item.selected ? (
                          <span className="text-subtitle text-brand-700 font-bold tnum">￥{item.totalPrice}</span>
                        ) : (
                          <span className="text-body text-ink-4">—</span>
                        )
                      ) : (
                        <span className="text-body text-ink-3 flex items-center gap-1.5">
                          <span className="w-3.5 h-3.5 border-2 border-brand-700 border-t-transparent rounded-full animate-spin inline-block" />
                          计算中
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>

            {/* ══ 底部操作栏 ══ */}
            <div className="flex items-center justify-between pt-4">
              <span className="text-body text-ink-2">共 <span className="text-brand-700 font-medium tnum">{selectedItems.length}</span> 项检测类型</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-body text-ink-2">金额总计：</span>
                  {parsingDone ? (
                    <span className="text-[24px] text-brand-700 font-bold tnum">￥{totalPrice}</span>
                  ) : (
                    <span className="text-subtitle text-ink-3 font-medium flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 border-2 border-brand-700 border-t-transparent rounded-full animate-spin inline-block" />
                      计算中
                    </span>
                  )}
                </div>
                <button
                  onClick={() => nav('/paper')}
                  className="btn-outline btn-md"
                >
                  上一步
                </button>
                <button
                  disabled={!parsingDone || submitting || selectedItems.length === 0}
                  onClick={handleConfirmPayment}
                  className="btn-primary btn-md"
                >
                  {submitting ? '提交中…' : '确认支付'}
                </button>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 bg-danger-soft border border-danger-border text-danger text-caption rounded-lg px-4 py-3 font-medium">{error}</div>
          )}
        </>
      )}

      {/* ═══ Step 3: Detection in Progress ═══ */}
      {currentStep === 3 && (
        <div className="card card-pad">
          <div className="table-wrap">
          <table className="w-full text-body">
            <thead>
              <tr className="table-head">
                <th className="text-left py-3 px-4 font-medium">检测类型</th>
                <th className="text-left py-3 px-4 font-medium">报告编号</th>
                <th className="text-left py-3 px-4 font-medium">消费时间</th>
                <th className="text-left py-3 px-4 font-medium">消费金额</th>
                <th className="text-left py-3 px-4 font-medium">状态</th>
                <th className="text-left py-3 px-4 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {items.filter(i => i.selected).map(item => (
                <tr key={item.id} className="table-row">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="badge-brand">
                        {item.badge}
                      </span>
                      <div>
                        <p className="text-body text-ink font-medium">{item.type}</p>
                        <p className="text-micro text-ink-3">{item.version}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-body text-ink-2 font-mono tnum">
                    {detectionDone && reportId ? reportId : '—'}
                  </td>
                  <td className="py-3 px-4 text-body text-ink-2 tnum">{new Date().toLocaleString('zh-CN')}</td>
                  <td className="py-3 px-4 text-subtitle text-brand-700 font-bold tnum">￥{item.totalPrice}</td>
                  <td className="py-3 px-4">
                    {detectionDone ? (
                      <span className="badge-success">
                        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M4.5 7L6.5 9L9.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        检测完成
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-body text-brand-700">
                        <span className="w-2 h-2 rounded-full bg-brand-700 animate-pulse" />
                        检测中
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {detectionDone ? (
                      <div className="flex items-center gap-3">
                        <a href="/report-demo.html" target="_blank" rel="noopener noreferrer" className="link text-body">查看报告</a>
                        <a href="/report-demo.zip" download="检测报告.zip" className="link text-body">下载报告</a>
                      </div>
                    ) : (
                      <span className="text-body text-ink-4">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={handleBack}
              className="btn-outline btn-md"
            >
              返回
            </button>
          </div>
        </div>
      )}

      {/* ══ Payment Modal ═══ */}
      <PaymentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onPaid={handlePaid}
        totalPrice={totalPrice}
      />

      {/* ══ 解析进度弹窗 ═══ */}
      <ParsingProgressModal
        isOpen={showParsing}
        onClose={() => setShowParsing(false)}
        done={parsingDone}
        detectionName="课程论文写作训练与学术规范检测"
        detectionVersion="个人版"
      />
    </div>
  )
}