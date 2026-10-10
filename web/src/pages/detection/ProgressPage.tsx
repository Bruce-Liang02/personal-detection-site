import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import LayerProgress from '@/components/detection/LayerProgress'
import StatusBadge from '@/components/ui/StatusBadge'
import { detectionApi, type DetectionTask } from '@/api'
import { Loader2, FileText, Clock, AlertCircle } from 'lucide-react'

const LAYER_LABELS: Record<string, string> = {
  L1_format: '学术规范',
  L2_integrity: '学术诚信',
  L3_expression: '学术表达',
  L4_critical: '批判性思维',
}

export default function ProgressPage() {
  const { taskId } = useParams<{ taskId: string }>()
  const nav = useNavigate()
  const [task, setTask] = useState<DetectionTask | null>(null)
  const [error, setError] = useState('')
  const pollRef = useRef<ReturnType<typeof setInterval>>()

  useEffect(() => {
    if (!taskId) return

    async function poll() {
      try {
        const res = await detectionApi.pollTask(Number(taskId))
        setTask(res.data.task)

        if (res.data.completed) {
          clearInterval(pollRef.current)
          // Navigate to report after a brief delay
          setTimeout(() => {
            if (res.data.report) {
              nav(`/detection/report/${res.data.report!.id}`)
            }
          }, 1500)
        }
      } catch (err: any) {
        setError(err.message)
        clearInterval(pollRef.current)
      }
    }

    poll()
    pollRef.current = setInterval(poll, 2000)
    return () => clearInterval(pollRef.current)
  }, [taskId])

  if (!task) {
    return (
      <div className="min-h-screen bg-[#F8F7F4]">
          <div className="flex items-center justify-center py-32">
          <Loader2 className="animate-spin text-brand-700" size={32} />
        </div>
      </div>
    )
  }

  const isProcessing = task.status === 'processing'
  const isCompleted = task.status === 'completed'
  const isFailed = task.status === 'failed'

  return (
    <div>
      <div className="max-w-[900px] mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-ink">检测进度</h1>
          <p className="text-ink-3 mt-1">
            {isProcessing ? '正在对论文进行四层维度全面分析…' : isCompleted ? '检测完成！' : '检测出错'}
          </p>
        </div>

        {/* Task info card */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center">
              <FileText size={24} className="text-brand-700" />
            </div>
            <div>
              <p className="font-bold text-ink">{task.paper_title || task.file_name}</p>
              <p className="text-sm text-ink-3 flex items-center gap-2">
                <Clock size={12} />
                {task.started_at ? new Date(task.started_at).toLocaleString('zh-CN') : '等待中'}
              </p>
            </div>
            <div className="ml-auto">
              <StatusBadge status={task.status} />
            </div>
          </div>

          {/* Overall progress */}
          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-semibold text-ink">总体进度</span>
              <span className="font-bold text-brand-700">{task.progress}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700 transition-all duration-500"
                style={{ width: `${task.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Layer progress */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
          <LayerProgress layer="L1" label="学术规范" score={null} grade={null} status={task.l1_status} color="#12A594" />
          <LayerProgress layer="L2" label="学术诚信" score={null} grade={null} status={task.l2_status} color="#3E7BFA" />
          <LayerProgress layer="L3" label="学术表达" score={null} grade={null} status={task.l3_status} color="#7C6CF0" />
          <LayerProgress layer="L4" label="批判性思维" score={null} grade={null} status={task.l4_status} color="#D4639E" />
        </div>

        {/* Current layer indicator */}
        {isProcessing && task.current_layer && (
          <div className="card p-4 bg-accent-50 !border-accent-200 flex items-center gap-3">
            <Loader2 className="animate-spin text-accent-600" size={20} />
            <span className="text-sm font-semibold text-accent-700">
              正在检测：{LAYER_LABELS[task.current_layer] || task.current_layer}
            </span>
          </div>
        )}

        {isFailed && (
          <div className="card p-6 bg-danger-soft !border-danger flex items-start gap-3">
            <AlertCircle className="text-danger shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-bold text-danger">检测失败</p>
              <p className="text-sm text-ink-2 mt-1">{task.progress > 0 ? '检测过程中出现错误' : error}</p>
            </div>
          </div>
        )}

        {isCompleted && (
          <div className="card p-6 bg-success-soft !border-success flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center">
              <span className="text-white font-bold text-lg">✓</span>
            </div>
            <div>
              <p className="font-bold text-success">检测完成</p>
              <p className="text-sm text-ink-2">正在跳转到报告页面…</p>
            </div>
          </div>
        )}
      </div>
      </div>
  )
}
