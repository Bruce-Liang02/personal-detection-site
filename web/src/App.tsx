import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { api } from '@/api/request'

import LandingPage from '@/pages/public/LandingPage'
import LoginPage from '@/pages/public/LoginPage'
import RegisterPage from '@/pages/public/RegisterPage'
import ReportVerifyPage, { ReportVerifyContent } from '@/pages/public/ReportVerifyPage'
import DownloadReportPage, { DownloadReportContent } from '@/pages/public/DownloadReportPage'
import SidebarLayout from '@/components/ui/SidebarLayout'
import PaperDetectionPage from '@/pages/paper/PaperDetectionPage'
import PaperStep2Page from '@/pages/paper/PaperStep2Page'
import ConsumptionRecordsPage from '@/pages/paper/ConsumptionRecordsPage'
import HistoryPage from '@/pages/detection/HistoryPage'
import ReportPage from '@/pages/detection/ReportPage'
import ProgressPage from '@/pages/detection/ProgressPage'
import AccountPage from '@/pages/account/AccountPage'
import InvoicePage from '@/pages/account/InvoicePage'
import InvoicePreviewContent from '@/pages/account/InvoicePreviewContent'
import InvitePage from '@/pages/referral/InvitePage'

/** Route guard: redirects to /login if no valid token. */
function Protected({ children }: { children: React.ReactNode }) {
  const { token, fetchProfile } = useAuthStore()
  useEffect(() => {
    if (token) fetchProfile()
  }, [token])
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify" element={<ReportVerifyPage />} />
      <Route path="/download-report" element={<DownloadReportPage />} />
      {/* 发票票面预览（开票历史「查看」新标签页打开） */}
      <Route path="/billPreview/index" element={<Protected><InvoicePreviewContent /></Protected>} />

      {/* Sidebar layout routes (logged-in) */}
      <Route element={<Protected><SidebarLayout /></Protected>}>
        <Route path="/paper" element={<PaperDetectionPage />} />
        <Route path="/paper/step2" element={<PaperStep2Page />} />
        {/* 官网同款：登录后顶栏「报告验真 / 下载报告」在框架内打开（-m-6 抵消 main 的 p-6，内容通栏） */}
        <Route path="/paperVerifyListed/index" element={<div className="-m-6"><ReportVerifyContent /></div>} />
        <Route path="/downloadListed/index" element={<div className="-m-6"><DownloadReportContent /></div>} />
        <Route path="/detection/history" element={<HistoryPage />} />
        <Route path="/detection/report/:reportId" element={<ReportPage />} />
        <Route path="/detection/progress/:taskId" element={<ProgressPage />} />
        <Route path="/credits/records" element={<ConsumptionRecordsPage />} />
        <Route path="/invoice" element={<InvoicePage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/invite" element={<InvitePage />} />
      </Route>

      {/* Redirects */}
      <Route path="/dashboard" element={<Navigate to="/paper" replace />} />
      <Route path="/detection/upload" element={<Navigate to="/paper" replace />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
