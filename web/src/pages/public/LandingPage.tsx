import { Link, useNavigate } from 'react-router-dom'
import BrandLogo from '@/components/ui/BrandLogo'
import { useAuthStore } from '@/stores/authStore'
import {
  ShieldCheck, FileCheck, Sparkles, PenTool, BrainCircuit,
  Upload, BarChart3, Download, ArrowRight, CheckCircle2, Phone, ChevronDown,
  GraduationCap, BookOpen, FileSearch, BarChart2,
  Target, Zap, Shield, Layers, LogOut
} from 'lucide-react'
import Footer from '@/components/ui/Footer'
import { useState, useRef, useEffect } from 'react'

const LAYERS = [
  { icon: FileCheck, title: '学术规范', desc: '论文结构、标题层级、字体字号、段落间距、图表格式、引用标注等7项格式规范检测', color: '#12A594' },
  { icon: ShieldCheck, title: '学术诚信', desc: '文本相似度检测、AIGC生成内容检测、虚假参考文献检测，守护学术诚信底线', color: '#3E7BFA' },
  { icon: PenTool, title: '学术表达', desc: '学术语言规范检测，识别成分缺失、指代不明、搭配不当、冗余表达、数字书写不规范等问题', color: '#7C6CF0' },
  { icon: BrainCircuit, title: '批判性思维', desc: '逻辑一致性、论证严密性、结论综合分析、结构表达清晰度四维批判性思维评估', color: '#D4639E' },
]

/* 报告面板四维结论数据（与 report-demo.html 报告一致，计数式呈现） */
const REPORT_ROWS = [
  { no: '一', alias: '规范筑基', title: '学术格式规范', color: '#12A594', fix: 4, watch: 0, pass: 4 },
  { no: '二', alias: '诚信守正', title: '学术诚信意识', color: '#3E7BFA', fix: 2, watch: 1, pass: 0 },
  { no: '三', alias: '严谨表达', title: '学术表达水平', color: '#7C6CF0', fix: 1, watch: 0, pass: 0 },
  { no: '四', alias: '思辨逻辑', title: '学术思辨能力', color: '#D4639E', fix: 2, watch: 1, pass: 1 },
]

const FEATURES = [
  {
    icon: Target,
    title: '检测维度全面',
    desc: '四层递进式评估体系，从格式规范到批判性思维逐层深入，覆盖论文质量全维度。',
    img: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=photorealistic%20open%20thesis%20papers%20with%20teal%20holographic%20analysis%20layers%2C%20clean%20desk%2C%20soft%20daylight&image_size=landscape_16_9',
  },
  {
    icon: Zap,
    title: '智能高效',
    desc: '基于深度学习算法，自动识别论文问题并生成详尽的修改建议，平均检测时间仅3-5分钟。',
    img: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=photorealistic%20laptop%20with%20AI%20document%20analysis%20dashboard%2C%20glowing%20light%20trails%2C%20modern%20office%2C%20teal%20tones&image_size=landscape_16_9',
  },
  {
    icon: Shield,
    title: '结果精准可靠',
    desc: '依托海量学术文献数据库，相似度比对覆盖全面，AIGC检测准确率高，结果权威可信。',
    img: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=photorealistic%20magnifier%20and%20shield%20over%20academic%20papers%2C%20verification%20concept%2C%20soft%20studio%20light%2C%20teal%20accents&image_size=landscape_16_9',
  },
]

const STEPS = [
  { icon: Upload, title: '上传论文', desc: '支持 .doc / .docx / .pdf 格式，最大50MB' },
  { icon: Sparkles, title: '智能检测', desc: '四层维度全面分析，3-5分钟完成' },
  { icon: BarChart3, title: '查看报告', desc: '详尽的诊断分析与修改建议' },
  { icon: Download, title: '下载报告', desc: 'HTML / PDF 多格式导出' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const token = useAuthStore(s => s.token)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const isLoggedIn = !!user

  // 个人用户：未登录跳登录页，已登录进入主页
  const handlePersonal = () => {
    navigate(token ? '/paper' : '/login')
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ═══ HEADER ═══ */}
      <header className="sticky top-0 z-50 bg-white border-b border-line shrink-0">
        <div className="w-full px-6 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 shrink-0">
              <BrandLogo size={48} />
              <div className="leading-tight">
                <p className="text-[20px] font-black text-brand-700 tracking-wide">
                  研究生课程论文写作训练与学术规范检测系统
                </p>
                <p className="text-[11px] text-ink-3 font-semibold tracking-wider -mt-0.5">
                  GRADUATE COURSE PAPER WRITING &amp; ACADEMIC NORMS DETECTION SYSTEM
                </p>
              </div>
            </Link>
            <div className="hidden md:flex items-center gap-0.5">
              <Link to="/verify" className="px-3.5 py-1.5 text-[15px] font-medium text-ink-2 hover:text-brand transition-colors rounded">报告验真</Link>
              <a href="/report-demo.html" target="_blank" rel="noopener noreferrer" className="px-3.5 py-1.5 text-[15px] font-medium text-ink-2 hover:text-brand transition-colors rounded">报告演示</a>
              <Link to="/download-report" className="px-3.5 py-1.5 text-[15px] font-medium text-ink-2 hover:text-brand transition-colors rounded">下载报告</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-sm text-ink-2">
              <Phone size={13} />
              <span className="font-medium">400-607-5550</span>
            </div>
            {isLoggedIn ? (
              <>
                <span className="text-line">|</span>
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 rounded hover:bg-line-lighter transition-colors px-2 py-1"
                  >
                    <img src="/avatar.png" alt="avatar" className="w-8 h-8 rounded-full" />
                    <div className="leading-tight text-left">
                      <div className="flex items-center gap-1">
                        <span className="text-[14px] text-ink">{user?.nickname || user?.username}</span>
                        <ChevronDown size={13} className="text-ink-3" />
                      </div>
                      <div className="mt-0.5">
                        <span className="badge-brand">个人用户</span>
                      </div>
                    </div>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg border border-line shadow-lg py-1 z-50">
                      <button
                        onClick={() => { logout(); setMenuOpen(false); navigate('/login') }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-danger hover:bg-danger-soft"
                      >
                        <LogOut size={13} /> 退出登录
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link to="/login" className="btn-primary btn-md text-caption">
                登录/注册
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* === HERO SECTION - CSS 3D Animation (VPCS Style) === */}
      <section className="relative overflow-hidden h-[600px] !mt-0" style={{ background: 'url(/hero-bg.png) center 3% / cover no-repeat' }}>
        {/* Animated background orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-[700px] h-[700px] rounded-full opacity-[0.08]" style={{ background: 'radial-gradient(circle, #017173, transparent 70%)', animation: 'glow1 8s ease-in-out infinite' }} />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-[0.06]" style={{ background: 'radial-gradient(circle, #3E7BFA, transparent 70%)', animation: 'glow2 10s ease-in-out infinite' }} />
        </div>

        <div className="relative max-w-[1200px] mx-auto px-8 h-full flex items-center gap-12">
          {/* Left: text content */}
          <div className="flex-[1.1] max-w-[520px]">
            {/* Main heading */}
            <h1 className="text-[42px] font-black text-ink leading-[1.2] mb-6" style={{ textShadow: '0 1px 12px rgba(255,255,255,.9)' }}>
              研究生课程论文<br />
              <span className="text-brand-700">写作训练与学术规范</span><br />
              检测系统
            </h1>

            {/* Description */}
            <p className="text-[16px] text-ink-2 mb-10 leading-relaxed" style={{ textShadow: '0 1px 10px rgba(255,255,255,.9)' }}>
              四层维度评估体系，从学术规范到批判性思维全面分析论文质量，
              自动生成详细的诊断报告与修改建议。
            </p>

            {/* CTA buttons */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handlePersonal}
                className="btn-primary btn-lg hover:scale-105"
              >
                提交检测
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Right: 3D animated scene - mimicking VPCS video effect */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-[480px] h-[440px]" style={{ perspective: '1200px' }}>

              {/* === 3D ROTATING PLATFORM === */}
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2" style={{ transformStyle: 'preserve-3d' }}>

                {/* Platform base shadow */}
                <div className="absolute w-[340px] h-[340px] left-1/2 -translate-x-1/2 bottom-0 rounded-full opacity-30 blur-2xl"
                  style={{ background: 'radial-gradient(ellipse, #017173, transparent 70%)' }} />

                {/* Outer ring - deepest layer */}
                <div className="absolute w-[380px] h-[380px] left-1/2 -translate-x-1/2 bottom-[10px] rounded-full"
                  style={{
                    transform: 'rotateX(72deg)',
                    background: 'linear-gradient(135deg, rgba(1,113,115,0.20), rgba(1,113,115,0.08))',
                    border: '2px solid rgba(1,113,115,0.28)',
                    boxShadow: '0 4px 30px rgba(1,113,115,0.16), inset 0 2px 20px rgba(255,255,255,0.6)',
                    animation: 'discRotate 25s linear infinite',
                  }}>
                  <div className="absolute inset-0 rounded-full" style={{ border: '1px solid rgba(255,255,255,0.3)', transform: 'translateY(-3px)' }} />
                  <div className="absolute top-0 left-1/2 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#12A594] to-[#2BBBA8] -translate-x-1/2 -translate-y-1/2 shadow-lg shadow-[#12A594]/40" />
                </div>

                {/* Middle ring */}
                <div className="absolute w-[300px] h-[300px] left-1/2 -translate-x-1/2 bottom-[30px] rounded-full"
                  style={{
                    transform: 'rotateX(72deg)',
                    background: 'linear-gradient(135deg, rgba(1,113,115,0.26), rgba(1,113,115,0.12))',
                    border: '2px solid rgba(1,113,115,0.36)',
                    boxShadow: '0 3px 24px rgba(1,113,115,0.20), inset 0 2px 16px rgba(255,255,255,0.7)',
                    animation: 'discRotate 18s linear infinite reverse',
                  }}>
                  <div className="absolute inset-0 rounded-full" style={{ border: '1px solid rgba(255,255,255,0.35)', transform: 'translateY(-2px)' }} />
                  <div className="absolute bottom-0 right-[28%] w-3 h-3 rounded-full bg-gradient-to-br from-[#D4639E] to-[#E9A3C4] translate-y-1/2 shadow-lg shadow-[#D4639E]/40" />
                </div>

                {/* Inner ring - topmost disc layer */}
                <div className="absolute w-[220px] h-[220px] left-1/2 -translate-x-1/2 bottom-[50px] rounded-full"
                  style={{
                    transform: 'rotateX(72deg)',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.92), rgba(1,113,115,0.16))',
                    border: '2px solid rgba(1,113,115,0.45)',
                    boxShadow: '0 2px 20px rgba(1,113,115,0.22), inset 0 2px 12px rgba(255,255,255,0.85)',
                    animation: 'discRotate 14s linear infinite',
                  }}>
                  <div className="absolute inset-0 rounded-full" style={{ border: '1px solid rgba(255,255,255,0.5)', transform: 'translateY(-1.5px)' }} />
                  <div className="absolute top-1/2 left-0 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#3E7BFA] to-[#6A9BFF] -translate-x-1/2 shadow-lg shadow-[#3E7BFA]/40" />
                </div>

                {/* Center hub on platform */}
                <div className="absolute w-[80px] h-[80px] left-1/2 -translate-x-1/2 bottom-[62px] rounded-full"
                  style={{
                    transform: 'rotateX(72deg)',
                    background: 'linear-gradient(135deg, #017173, #02b1a6)',
                    boxShadow: '0 4px 24px rgba(1,113,115,0.4), inset 0 2px 8px rgba(255,255,255,0.2)',
                    animation: 'discRotate 14s linear infinite',
                  }}>
                  <div className="absolute inset-2 rounded-full flex items-center justify-center" style={{ transform: 'rotateX(-72deg)' }}>
                    <CheckCircle2 size={28} className="text-white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                  </div>
                </div>
              </div>

              {/* === FLOATING PAPER CARD === */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[210px]" style={{ animation: 'cardFloat 4s ease-in-out infinite' }}>
                <div className="bg-white rounded-2xl p-5" style={{
                  boxShadow: '0 20px 60px rgba(1,113,115,0.12), 0 8px 24px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)',
                  border: '1px solid rgba(255,255,255,0.8)',
                }}>
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#017173] to-[#02b1a6] flex items-center justify-center shadow-lg">
                      <FileSearch size={16} className="text-white" />
                    </div>
                    <span className="text-[12px] font-bold text-brand-700">论文检测</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-line-soft rounded-full w-full" />
                    <div className="h-2 bg-line-soft rounded-full w-[85%]" />
                    <div className="h-2 rounded-full w-[65%]" style={{ background: 'linear-gradient(90deg, #12A594, #2BBBA8)', opacity: 0.3 }} />
                    <div className="h-2 bg-line-soft rounded-full w-full" />
                    <div className="h-2 bg-line-soft rounded-full w-[70%]" />
                    <div className="h-2 rounded-full w-[50%]" style={{ background: 'linear-gradient(90deg, #3E7BFA, #6A9BFF)', opacity: 0.25 }} />
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-5 rounded-full px-2.5 flex items-center" style={{ background: 'rgba(18,165,148,0.12)' }}>
                      <span className="text-[9px] font-bold text-[#12A594]">达标</span>
                    </div>
                    <div className="h-5 rounded-full px-2.5 flex items-center" style={{ background: 'rgba(62,123,250,0.12)' }}>
                      <span className="text-[9px] font-bold text-[#3E7BFA]">检测中</span>
                    </div>
                  </div>
                </div>
                {/* Card shadow on platform */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[160px] h-4 rounded-full opacity-30 blur-md" style={{ background: '#017173', animation: 'shadowPulse 4s ease-in-out infinite' }} />
              </div>

              {/* === FOUR LAYER TAGS === */}
              <div className="absolute top-10 left-0 px-4 py-2 rounded-full text-white text-[12px] font-bold shadow-xl"
                style={{ background: 'linear-gradient(135deg, #12A594, #2BBBA8)', animation: 'tag1 5s ease-in-out infinite', boxShadow: '0 6px 20px rgba(18,165,148,0.35)' }}>
                <span className="opacity-80 mr-1">L1</span>学术规范
              </div>
              <div className="absolute top-[115px] right-0 px-4 py-2 rounded-full text-white text-[12px] font-bold shadow-xl"
                style={{ background: 'linear-gradient(135deg, #3E7BFA, #6A9BFF)', animation: 'tag2 6s ease-in-out infinite', boxShadow: '0 6px 20px rgba(62,123,250,0.35)' }}>
                <span className="opacity-80 mr-1">L2</span>学术诚信
              </div>
              <div className="absolute bottom-[100px] left-0 px-4 py-2 rounded-full text-white text-[12px] font-bold shadow-xl"
                style={{ background: 'linear-gradient(135deg, #7C6CF0, #9B7CF0)', animation: 'tag3 5.5s ease-in-out infinite', boxShadow: '0 6px 20px rgba(124,108,240,0.35)' }}>
                <span className="opacity-80 mr-1">L3</span>学术表达
              </div>
              <div className="absolute bottom-[75px] right-4 px-4 py-2 rounded-full text-white text-[12px] font-bold shadow-xl"
                style={{ background: 'linear-gradient(135deg, #D4639E, #E9A3C4)', animation: 'tag4 7s ease-in-out infinite', boxShadow: '0 6px 20px rgba(212,99,158,0.35)' }}>
                <span className="opacity-80 mr-1">L4</span>批判思维
              </div>

              {/* === FLOATING PARTICLES === */}
              <div className="absolute top-8 left-16 w-3 h-3 rounded-full" style={{ background: 'radial-gradient(circle, #12A594, transparent)', animation: 'particle 6s ease-in-out infinite' }} />
              <div className="absolute top-28 right-20 w-2.5 h-2.5 rounded-full" style={{ background: 'radial-gradient(circle, #3E7BFA, transparent)', animation: 'particle 8s ease-in-out infinite 1s' }} />
              <div className="absolute bottom-24 left-24 w-3.5 h-3.5 rounded-full" style={{ background: 'radial-gradient(circle, #D4639E, transparent)', animation: 'particle 7s ease-in-out infinite 2s' }} />
              <div className="absolute bottom-12 right-16 w-2 h-2 rounded-full" style={{ background: 'radial-gradient(circle, #7C6CF0, transparent)', animation: 'particle 5s ease-in-out infinite 0.5s' }} />
            </div>
          </div>
        </div>

        <style>{`
          @keyframes discRotate {
            0% { transform: rotateX(72deg) rotateZ(0deg); }
            100% { transform: rotateX(72deg) rotateZ(360deg); }
          }
          @keyframes cardFloat {
            0%, 100% { transform: translateX(-50%) translateY(0); }
            50% { transform: translateX(-50%) translateY(-18px); }
          }
          @keyframes shadowPulse {
            0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.25; }
            50% { transform: translateX(-50%) scale(0.85); opacity: 0.15; }
          }
          @keyframes tag1 { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
          @keyframes tag2 { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
          @keyframes tag3 { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
          @keyframes tag4 { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }
          @keyframes particle {
            0%, 100% { transform: translateY(0) scale(1); opacity: 0.5; }
            50% { transform: translateY(-22px) scale(1.6); opacity: 0.8; }
          }
          @keyframes glow1 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(40px, 30px); } }
          @keyframes glow2 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-30px, -40px); } }
        `}
        </style>
      </section>
      {/* ═══ FOUR DETECTION LAYERS（参照维普格式检测区块排版：居中标题 + 左宽图卡 + 右要点列表） ═══ */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-bold text-brand-700 tracking-widest mb-2">DETECTION SYSTEM</p>
            <h2 className="text-[32px] font-black text-ink mb-3">四维检测体系</h2>
            <p className="text-ink-3 text-[15px]">从格式规范到批判性思维，全面覆盖论文质量评估</p>
          </div>
          {/* 官网「了解我们的检测产品」同款比例再放宽：左图 62% / 右文 38%；左卡与右栏等高 */}
          <div className="grid lg:grid-cols-[62fr_38fr] gap-10">
            {/* 左：绿色简介卡 + 检测报告视觉（flex-1 填满剩余高度，图片按比例自适应） */}
            <div className="rounded-2xl p-6 relative overflow-hidden flex flex-col" style={{ background: 'linear-gradient(135deg, #e9f8f3 0%, #d4f0e7 100%)' }}>
              <p className="text-[14px] leading-[26px] text-ink">
                研究生课程论文检测系统构建四层递进式检测体系，从样式规范、学术诚信到语言表达、批判性思维逐层深入。系统全面定位论文问题，帮助学生在修改中提升写作水平，助力教师高效评阅论文。
              </p>
              <div className="mt-6 flex-1 min-h-0 flex items-center justify-center">
                <img src="/detection-system.png" alt="学术规范检测报告" className="max-h-full max-w-full w-auto h-auto" />
              </div>
            </div>

            {/* 右：四层要点 */}
            <div className="lg:pt-2">
              <div className="space-y-5">
                {LAYERS.map((l, i) => {
                  const Icon = l.icon
                  return (
                    <div key={i} className="flex gap-4">
                      <span className="mt-[8px] w-2.5 h-2.5 rotate-45 rounded-[2px] shrink-0" style={{ background: l.color }} />
                      <div className="min-w-0">
                        <p className="font-bold text-[18px] text-ink mb-2">{l.title}</p>
                        <p className="text-[15px] text-ink-2 leading-[26px]">{l.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="py-20 bg-gradient-to-b from-line-lighter to-white">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-bold text-brand-700 tracking-widest mb-2">FEATURES</p>
            <h2 className="text-[32px] font-black text-ink mb-3">核心优势</h2>
            <p className="text-ink-3 text-[15px]">技术驱动，为论文质量保驾护航</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {FEATURES.map((f, i) => {
              const Icon = f.icon
              return (
                <div key={i} className="group rounded-2xl overflow-hidden border border-line bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  {/* 顶部配图 */}
                  <div className="h-[190px] overflow-hidden relative">
                    <img src={f.img} alt={f.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  {/* 卡身（浅蓝渐变，官网同款）；图标徽章跨界摆放，不受图片容器裁切 */}
                  <div className="relative p-6 pt-8" style={{ background: 'linear-gradient(180deg, #f3f8fc 0%, #e9f1f9 100%)' }}>
                    <span className="absolute -top-5 left-6 w-10 h-10 rounded-xl bg-white shadow-md flex items-center justify-center">
                      <Icon size={20} className="text-brand-700" />
                    </span>
                    <p className="font-extrabold text-[18px] text-ink mb-2">{f.title}</p>
                    <p className="text-[13px] text-ink-3 leading-relaxed">{f.desc}</p>
                    <span className="inline-flex mt-6 text-ink-2 group-hover:text-brand group-hover:translate-x-1 transition-all">
                      <ArrowRight size={18} />
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ═══ */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-bold text-brand-700 tracking-widest mb-2">HOW IT WORKS</p>
            <h2 className="text-[32px] font-black text-ink mb-3">使用流程</h2>
            <p className="text-ink-3 text-[15px]">四步完成论文质量诊断</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((s, i) => {
              const Icon = s.icon
              return (
                <div key={i} className="relative">
                  {i < STEPS.length - 1 && (
                    <div className="hidden lg:block absolute top-[72px] left-[60%] w-[80%] h-[2px] bg-line-soft" />
                  )}
                  <div className="relative z-10 card card-hover rounded-2xl p-6 text-center h-full">
                    <p className="text-[10px] font-bold text-brand-700 tracking-widest mb-4">STEP 0{i + 1}</p>
                    <div className="relative z-10 w-16 h-16 mx-auto rounded-2xl bg-brand-gradient flex items-center justify-center mb-4 shadow-brand">
                      <Icon size={26} className="text-white" />
                    </div>
                    <p className="font-extrabold text-[16px] text-ink mb-1.5">{s.title}</p>
                    <p className="text-[13px] text-ink-3 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <Footer />
    </div>
  )
}
