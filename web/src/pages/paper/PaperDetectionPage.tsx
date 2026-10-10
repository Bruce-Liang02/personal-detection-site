import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload } from 'lucide-react'
import { detectionApi } from '@/api'
import { useDetectionStore } from '@/stores/detectionStore'

/* ═══ Toast 通知 ═══ */
interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}

let toastId = 0
const toastListeners = new Set<(toast: Toast) => void>()

function showToast(message: string, type: 'success' | 'error' = 'success') {
  const t: Toast = { id: ++toastId, message, type }
  toastListeners.forEach(fn => fn(t))
}

function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const handler = (t: Toast) => {
      setToasts(prev => [...prev, t])
      setTimeout(() => setToasts(prev => prev.filter(x => x.id !== t.id)), 3000)
    }
    toastListeners.add(handler)
    return () => { toastListeners.delete(handler) }
  }, [])

  return (
    <div className="fixed top-[80px] left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg shadow-lg text-[14px] font-medium pointer-events-auto ${
            t.type === 'success' ? 'bg-[#00B42A] text-white' : 'bg-[#FFF0F0] text-[#F53F3F] border border-[#FECACA]'
          }`}
          style={{ animation: 'toastIn 0.3s ease-out' }}
        >
          {t.type === 'success' ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
              <circle cx="8" cy="8" r="7" fill="white" opacity="0.3" />
              <path d="M4.5 8.2L7 10.7L11.5 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
              <circle cx="8" cy="8" r="7" fill="#F53F3F" />
              <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
          {t.message}
        </div>
      ))}
      <style>{`@keyframes toastIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  )
}

/* 步骤条（官网同款 Arco Steps 样式） */
const STEPS = [
  { num: 1, label: '上传文档', desc: '当前步骤', status: 'process' },
  { num: 2, label: '确认支付', desc: '待处理', status: 'wait' },
  { num: 3, label: '查看报告', desc: '待处理', status: 'wait' },
]

/* 官网同款圆形对勾图标 */
function TealCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="shrink-0" aria-hidden="true">
      <circle cx="8" cy="8" r="8" fill="#017173" />
      <path d="M4.6 8.3l2.2 2.2 4.6-4.8" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* Word 文档图标 */
function WordFileIcon() {
  return (
    <svg width="40" height="44" viewBox="0 0 40 44" aria-hidden="true">
      <path d="M4 3a3 3 0 0 1 3-3h18l11 11v30a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V3z" fill="#FFFFFF" stroke="#D6DAE5" strokeWidth="1.5" />
      <path d="M25 0l11 11H27a2 2 0 0 1-2-2V0z" fill="#DCE9FB" />
      <text x="20" y="28" textAnchor="middle" fontSize="19" fontWeight="800" fill="#185ABD" fontFamily="Arial, Helvetica, sans-serif">W</text>
      <rect x="10" y="33" width="20" height="3.5" rx="1.75" fill="#185ABD" />
    </svg>
  )
}

/* 文件夹图标（空上传区） */
function FolderIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path d="M8 16a4 4 0 0 1 4-4h12l6 6h22a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V16z" fill="#E5E6EB" />
      <rect x="12" y="26" width="40" height="24" rx="2" fill="#D0D3D8" />
    </svg>
  )
}

export default function PaperDetectionPage() {
  const nav = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const { file, paperTitle, authorName, setFile, setPaperTitle, setAuthorName } = useDetectionStore()
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ file?: boolean; title?: boolean; author?: boolean }>({})

  /* ── 选中文件 → 模拟上传（上传中遮罩 → 成功 toast + 自动填标题） ── */
  const handleFile = useCallback((f?: File) => {
    if (!f) return
    setError('')
    setUploadError(false)
    setUploading(true)

    // 模拟后端上传延迟（截图1：深色遮罩 + "正在上传并提取文档名称，请稍等"）
    setTimeout(() => {
      setFile(f)
      const titleFromName = f.name.replace(/\.[^./\\]+$/, '')
      setPaperTitle(titleFromName)
      setUploading(false)
      showToast('上传成功！题目已替换为文件名。', 'success')
      if (inputRef.current) inputRef.current.value = ''
    }, 1500)
  }, [])

  /* ── 删除文档 → 重置 + 成功 toast ── */
  const clearFile = useCallback(() => {
    setFile(null)
    setPaperTitle('')
    setUploadError(false)
    if (inputRef.current) inputRef.current.value = ''
    showToast('删除成功', 'success')
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // 逐字段校验：缺失哪个就红 toast 提示哪个，并标记红框
    if (!file) {
      setUploadError(true)
      setFieldErrors({ file: true })
      showToast('请上传文档', 'error')
      return
    }
    if (!paperTitle.trim()) {
      setFieldErrors(prev => ({ ...prev, title: true }))
      showToast('请输入标题', 'error')
      return
    }
    if (!authorName.trim()) {
      setFieldErrors(prev => ({ ...prev, author: true }))
      showToast('请输入作者', 'error')
      return
    }
    setFieldErrors({})
    setUploadError(false)
    setSubmitting(true)
    setError('')

    const form = new FormData()
    form.append('file', file)
    form.append('paper_title', paperTitle)
    form.append('author_name', authorName)

    try {
      const res = await detectionApi.upload(form)
      sessionStorage.setItem('paper_task_id', String(res.data?.id ?? ''))
      sessionStorage.setItem('paper_file_name', file.name)
      sessionStorage.setItem('paper_title', paperTitle)
      sessionStorage.setItem('paper_author', authorName)
      nav('/paper/step2')
    } catch (err: any) {
      const errMsg = err?.message || ''
      if (errMsg.includes('检测次数不足') || errMsg.includes('余额') || errMsg.includes('充值')) {
        sessionStorage.setItem('paper_task_id', '')
        sessionStorage.setItem('paper_file_name', file.name)
        sessionStorage.setItem('paper_title', paperTitle)
        sessionStorage.setItem('paper_author', authorName)
        nav('/paper/step2')
      } else {
        setError(errMsg || '上传失败，请稍后重试')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <ToastContainer />

      {/* ═ Banner ═══ */}
      <div
        className="h-[140px] rounded-[4px] mb-6 overflow-hidden"
        style={{
          backgroundImage: 'url(/paper-banner.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: '0 0',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="h-full px-[100px] pt-[27px]">
          <div className="flex items-center gap-[10px]">
            <h2 className="text-[20px] leading-[26px] font-bold text-[#1C2B57]">课程论文写作训练与学术规范检测</h2>
            <span className="shrink-0 inline-flex items-center h-[24px] rounded-full p-[1px] bg-[linear-gradient(90deg,#017173_0%,#8AE6DB_100%)]">
              <span className="inline-flex items-center h-full px-[9px] rounded-full bg-white text-[12px] leading-none font-bold text-[#1C2B57]">全面升级</span>
            </span>
          </div>
          <div className="mt-[12px]">
            <p className="flex items-center gap-[6px] text-[14px] leading-[26px] text-[#1D2129]">
              <TealCheck /> 从检测、报告、修改全链路优化
            </p>
            <p className="flex items-center gap-[6px] text-[14px] leading-[26px] text-[#1D2129]">
              <TealCheck /> 四层维度全面评估论文质量
            </p>
          </div>
        </div>
      </div>

      {/* ═══ Step Progress ═══ */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <div className="flex items-center">
          {STEPS.map((step, i) => {
            const isFinish = step.status === 'finish'
            const isActive = step.status === 'process'
            const descColor = isFinish ? 'text-[#E44548]' : 'text-[#4E5969]'
            const titleColor = isActive ? 'font-medium text-[#E44548]' : 'font-normal text-[#1D2129]'
            return (
              <div key={step.num} className="flex items-center flex-1">
                <div className="flex items-center flex-shrink-0">
                  {isFinish ? (
                    <svg className="shrink-0 mr-3" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E44548" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <div className={`w-7 h-7 mr-3 rounded-full flex items-center justify-center shrink-0
                      ${isActive ? 'bg-[#E44548] text-white' : 'bg-[#F2F3F5] text-[#4E5969]'}`}>
                      <span className="text-[16px] font-medium">{step.num}</span>
                    </div>
                  )}
                  <div>
                    <p className={`text-[16px] leading-[28px] whitespace-nowrap ${titleColor}`}>{step.label}</p>
                    <p className={`text-[12px] leading-[18px] whitespace-nowrap ${descColor}`}>{step.desc}</p>
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 mx-4 border-t-2 border-dashed ${isActive ? 'border-[#E44548]' : 'border-[#E5E6EB]'}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ══ Upload Form ═══ */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        {error && (
          <div className="mb-5 bg-[#ffece8] text-[#f53f3f] text-[13px] rounded-lg px-4 py-3 font-medium">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload zone */}
          <div className="flex items-start gap-3 mb-5">
            <label className="shrink-0 w-[96px] text-right text-[14px] text-[#1D2129] pt-[10px]">
              <span className="text-[#F53F3F] mr-0.5">*</span>上传文档
            </label>
            <div className="flex-1 min-w-0">
              <div
                className={`rounded-[4px] border h-[200px] px-6 text-center transition-colors relative overflow-hidden flex items-center justify-center
                  ${uploadError ? 'border-2 border-[#F53F3F] bg-[#FAFBFC]' : ''}
                  ${file && !uploading ? 'border border-[#E5E6EB] bg-[#FAFBFC]' : ''}
                  ${!file && !uploading && !uploadError ? 'border-2 border-dashed border-[#E5E6EB] bg-[#F7F8FA] hover:border-[#C9CDD4]' : ''}
                  ${dragOver ? '!border-[#165DFF] !bg-[#E8F0FE]' : ''}
                `}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={e => { e.preventDefault(); setDragOver(false) }}
                onDrop={e => {
                  e.preventDefault()
                  setDragOver(false)
                  const f = e.dataTransfer.files?.[0]
                  if (f) handleFile(f)
                }}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".doc,.docx,.pdf,.wps,.txt"
                  className="hidden"
                  id="file-upload"
                  onChange={e => handleFile(e.target.files?.[0])}
                />

                {/* ─ 状态 A：上传中（深色遮罩）── */}
                {uploading && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[rgba(0,0,0,0.5)]">
                    <WordFileIcon />
                    <p className="text-[14px] text-white mt-2 font-medium">{file ? file.name : ''}</p>
                    <p className="text-[13px] text-white/80 mt-1">正在上传并提取文档名称，请稍等</p>
                  </div>
                )}

                {/* ── 状态 B：已上传（文件卡片）── */}
                {file && !uploading && (
                  <div className="flex flex-col items-center">
                    <WordFileIcon />
                    <p className="text-[14px] text-[#1D2129] mt-2.5 truncate max-w-[520px]">{file.name}</p>
                    <div className="flex items-center gap-5 mt-2">
                      <button type="button" onClick={clearFile} className="text-[13px] text-[#86909C] hover:text-[#4E5969] transition-colors">
                        删除
                      </button>
                      <button type="button" onClick={() => inputRef.current?.click()} className="text-[13px] text-[#165DFF] hover:text-[#0E42D2] transition-colors">
                        重新上传
                      </button>
                    </div>
                  </div>
                )}

                {/* ── 状态 C：空上传区 ── */}
                {!file && !uploading && (
                  <label htmlFor="file-upload" className="cursor-pointer block">
                    <div className="flex flex-col items-center gap-3">
                      <FolderIcon />
                      <p className="text-[14px] text-[#165DFF] font-medium">点击或拖拽文件到此处上传</p>
                      <p className="text-[13px] text-[#86909C] leading-relaxed">
                        支持文档格式：word文件（.doc .docx .wps）、文本文件（.txt）、PDF文件（.pdf）、WPS文件（.wps），文件大小在50M以内
                      </p>
                      <p className="text-[13px] text-[#86909C] leading-relaxed">
                        注：修订、批注模式会导致报告内容缺失，请核查论文内容后上传
                      </p>
                    </div>
                  </label>
                )}
              </div>
              {/* 未上传文件的错误提示（红字） */}
              {uploadError && !file && (
                <p className="text-[13px] text-[#F53F3F] mt-2 ml-1">请上传文件</p>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="flex items-start gap-3 mb-5">
            <label className="shrink-0 w-[96px] text-right text-[14px] text-[#1D2129] pt-[10px]">
              <span className="text-[#F53F3F] mr-0.5">*</span>标题
            </label>
            <div className="flex-1 min-w-0">
              <div className="relative">
                <input
                  className={`w-full h-[40px] px-3 pr-12 rounded-[4px] border text-[14px] text-[#1D2129] focus:outline-none transition-colors ${
                    fieldErrors.title
                      ? 'border-[#F53F3F] placeholder:text-[#F53F3F]'
                      : 'border-[#E5E6EB] placeholder:text-[#C9CDD4] focus:border-[#165DFF]'
                  }`}
                  placeholder="请输入（系统将自动识别文档名称）"
                  maxLength={248}
                  value={paperTitle}
                  onChange={e => { setPaperTitle(e.target.value); if (fieldErrors.title) setFieldErrors(prev => ({ ...prev, title: false })) }}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#C9CDD4]">{paperTitle.length}/248</span>
              </div>
              <p className="text-[13px] text-[#86909C] mt-[10px] leading-relaxed">
                提交前请认真核对<span className="text-[#F53F3F] font-medium">标题</span>，其准确性将直接<span className="text-[#F53F3F] font-medium">影响检测结果</span>，且会在报告中展示，提交检测后<span className="text-[#F53F3F] font-medium">无法修改</span>。
              </p>
            </div>
          </div>

          {/* Author */}
          <div className="flex items-start gap-3 mb-5">
            <label className="shrink-0 w-[96px] text-right text-[14px] text-[#1D2129] pt-[10px]">
              <span className="text-[#F53F3F] mr-0.5">*</span>作者
            </label>
            <div className="flex-1 min-w-0">
              <div className="relative">
                <input
                  className={`w-full h-[40px] px-3 pr-12 rounded-[4px] border text-[14px] text-[#1D2129] focus:outline-none transition-colors ${
                    fieldErrors.author
                      ? 'border-[#F53F3F] placeholder:text-[#F53F3F]'
                      : 'border-[#E5E6EB] placeholder:text-[#C9CDD4] focus:border-[#165DFF]'
                  }`}
                  placeholder="请输入"
                  maxLength={50}
                  value={authorName}
                  onChange={e => { setAuthorName(e.target.value); if (fieldErrors.author) setFieldErrors(prev => ({ ...prev, author: false })) }}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#C9CDD4]">{authorName.length}/50</span>
              </div>
              <p className="text-[13px] text-[#86909C] mt-[10px] leading-relaxed">
                请准确填写<span className="text-[#F53F3F] font-medium">作者姓名</span>，多名作者用"，"分隔；其准确性将直接<span className="text-[#F53F3F] font-medium">影响检测结果</span>，且会在报告中展示，提交检测后<span className="text-[#F53F3F] font-medium">无法修改</span>。
              </p>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={submitting || !file}
            className="w-full h-[40px] bg-[#E44548] hover:bg-[#c93a3d] disabled:opacity-50 text-white text-[14px] font-medium rounded-[4px] transition-colors flex items-center justify-center gap-2">
            {submitting ? '提交中…' : '下一步'}
          </button>
        </form>
      </div>
    </div>
  )
}
