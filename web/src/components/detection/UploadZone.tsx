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
      className={`relative rounded-[4px] border-2 border-dashed py-10 px-6 text-center transition-all cursor-pointer
        ${dragOver ? 'border-[#165DFF] bg-[#F2F3FF]' : file ? 'border-[#165DFF] bg-[#F2F3FF]' : 'border-[#E5E6EB] bg-[#F7F8FA] hover:border-[#C9CDD4]'}`}
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
          <div className="w-10 h-10 rounded bg-[#E8F3FF] flex items-center justify-center">
            <FolderOpen size={20} className="text-[#165DFF]" />
          </div>
          <div className="text-left">
            <p className="font-medium text-[14px] text-[#1D2129] truncate max-w-[250px]">{file.name}</p>
            <p className="text-[12px] text-[#86909C]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <button
            onClick={e => { e.stopPropagation(); setFile(null); if (inputRef.current) inputRef.current.value = '' }}
            className="ml-2 p-1 rounded-full hover:bg-black/5"
          >
            <X size={14} className="text-[#86909C]" />
          </button>
        </div>
      ) : (
        <>
          <FolderOpen size={36} className="mx-auto mb-3 text-[#C9CDD4]" />
          <p className="text-[14px] mb-2">
            <span className="text-[#165DFF] cursor-pointer hover:underline">点击或拖拽文件到此处上传</span>
          </p>
          <p className="text-[12px] text-[#86909C] mb-1">
            支持文件格式：Word文件（.doc,.docx,.wps）、文本文件（.txt）、PDF文件（.pdf）、WPS文件（.wps），文件大小在50MB以内
          </p>
          <p className="text-[12px] text-[#86909C]">
            注：修订、批注模式会导致报告内容缺失，请核查论文内容后上传
          </p>
        </>
      )}
    </div>
  )
}
