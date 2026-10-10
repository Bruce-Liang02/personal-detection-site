import { useState, useRef } from 'react'
import { FolderOpen, X } from 'lucide-react'

interface UploadZoneProps {
  onFileSelect: (file: File) => void
  acceptedTypes?: string
}

export default function UploadZone({ onFileSelect, acceptedTypes = '.doc,.docx,.pdf' }: UploadZoneProps) {
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(f: File) {
    setFile(f)
    onFileSelect(f)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }

  return (
    <div
      className={`relative rounded-lg border-2 border-dashed py-10 px-6 text-center transition-all cursor-pointer
        ${dragOver ? 'border-brand-700 bg-brand-soft' : file ? 'border-brand-700 bg-brand-soft' : 'border-line bg-line-lighter hover:border-ink-4 hover:bg-line-soft'}`}
      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={acceptedTypes}
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />

      {file ? (
        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-md bg-brand-soft flex items-center justify-center">
            <FolderOpen size={20} className="text-brand-700" />
          </div>
          <div className="text-left">
            <p className="font-medium text-body text-ink truncate max-w-[250px]">{file.name}</p>
            <p className="text-micro text-ink-3 tnum">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <button
            onClick={e => { e.stopPropagation(); setFile(null); if (inputRef.current) inputRef.current.value = '' }}
            className="ml-2 p-1 rounded-full text-ink-3 hover:text-danger hover:bg-danger-soft transition-colors"
            aria-label="移除文件"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <>
          <FolderOpen size={36} className="mx-auto mb-3 text-ink-4" />
          <p className="text-body mb-2">
            <span className="link cursor-pointer">点击或拖拽文件到此处上传</span>
          </p>
          <p className="text-micro text-ink-3 mb-1">
            支持文件格式：Word文件（.doc,.docx,.wps）、文本文件（.txt）、PDF文件（.pdf）、WPS文件（.wps），文件大小在50MB以内
          </p>
          <p className="text-micro text-ink-3">
            注：修订、批注模式会导致报告内容缺失，请核查论文内容后上传
          </p>
        </>
      )}
    </div>
  )
}
