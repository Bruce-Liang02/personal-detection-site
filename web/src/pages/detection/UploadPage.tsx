import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '@/components/ui/Navbar'
import UploadZone from '@/components/detection/UploadZone'
import { detectionApi } from '@/api'
import { Send, Loader2, FileText } from 'lucide-react'

export default function UploadPage() {
  const nav = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [paperTitle, setPaperTitle] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [courseName, setCourseName] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [majorName, setMajorName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) { setError('请先上传论文文件'); return }
    setSubmitting(true)
    setError('')

    const form = new FormData()
    form.append('file', file)
    form.append('paper_title', paperTitle)
    form.append('author_name', authorName)
    form.append('course_name', courseName)
    form.append('school_name', schoolName)
    form.append('major_name', majorName)
    form.append('student_id', studentId)

    try {
      const res = await detectionApi.upload(form)
      nav(`/detection/progress/${res.data.id}`)
    } catch (err: any) {
      setError(err.message || '提交失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-page">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="page-title">上传论文检测</h1>
          <p className="page-desc">上传论文文件，填写基本信息，提交四层维度全面检测</p>
        </div>

        {error && (
          <div className="mb-6 bg-danger-soft border border-danger-border text-danger text-body rounded-lg px-4 py-3 font-medium">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload */}
          <div className="card card-pad">
            <h2 className="section-title mb-4">
              <FileText size={18} className="text-brand-700" /> 论文文件
            </h2>
            <UploadZone onFileSelect={setFile} />
          </div>

          {/* Paper Info */}
          <div className="card card-pad">
            <h2 className="section-title mb-4">论文信息</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label-text">论文标题</label>
                <input className="input-field" placeholder="请输入论文标题" value={paperTitle} onChange={e => setPaperTitle(e.target.value)} />
              </div>
              <div>
                <label className="label-text">作者姓名</label>
                <input className="input-field" placeholder="请输入作者姓名" value={authorName} onChange={e => setAuthorName(e.target.value)} />
              </div>
              <div>
                <label className="label-text">学号</label>
                <input className="input-field" placeholder="请输入学号" value={studentId} onChange={e => setStudentId(e.target.value)} />
              </div>
              <div>
                <label className="label-text">课程名称</label>
                <input className="input-field" placeholder="请输入课程名称" value={courseName} onChange={e => setCourseName(e.target.value)} />
              </div>
              <div>
                <label className="label-text">学校名称</label>
                <input className="input-field" placeholder="请输入学校名称" value={schoolName} onChange={e => setSchoolName(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className="label-text">专业名称</label>
                <input className="input-field" placeholder="请输入专业名称" value={majorName} onChange={e => setMajorName(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={submitting || !file} className="btn-primary btn-lg w-full">
            {submitting ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> 提交检测</>}
          </button>
        </form>
      </main>
    </div>
  )
}
