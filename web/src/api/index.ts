import { api } from './request'

/* ── Auth ── */
export const authApi = {
  register: (data: { username: string; password: string; phone?: string; nickname?: string; referral_code?: string }) =>
    api.post<{ user_id: number; username: string; nickname: string }>('/auth/register', data),

  login: (data: { username: string; password: string }) =>
    api.post<{ access_token: string; refresh_token: string; token_type: string; user_id: number; username: string; nickname: string }>('/auth/login', data),

  refresh: (refresh_token: string) =>
    api.post<{ access_token: string; token_type: string }>('/auth/refresh', { refresh_token }),

  resetPassword: (data: { username: string; old_password: string; new_password: string }) =>
    api.post('/auth/password-reset', data),
}

/* ── User ── */
export const userApi = {
  getMe: () =>
    api.get<{ id: number; username: string; phone: string | null; email: string | null; nickname: string; avatar: string | null; bio: string | null; referral_code: string | null; notification_enabled: boolean; email_notification: boolean; created_at: string; last_login_at: string | null }>('/user/me'),

  updateMe: (data: Record<string, unknown>) =>
    api.put('/user/me', data),
}

/* ── Detection ── */
export interface DetectionTask {
  id: number; user_id: number; status: string; paper_title: string | null;
  file_name: string; progress: number; current_layer: string | null;
  l1_status: string | null; l2_status: string | null;
  l3_status: string | null; l4_status: string | null;
  overall_score: number | null; overall_grade: string | null;
  started_at: string | null; finished_at: string | null;
  created_at: string; word_count: number;
}

export interface DetectionReport {
  id: number; task_id: number; report_number: string;
  overall_score: number | null; overall_grade: string | null;
  l1_score: number | null; l1_grade: string | null;
  l2_score: number | null; l2_grade: string | null;
  l3_score: number | null; l3_grade: string | null;
  l4_score: number | null; l4_grade: string | null;
  similarity_rate: number | null; aigc_rate: number | null;
  issue_count_risk: number; issue_count_warn: number; issue_count_good: number;
  detail: string | null; generated_at: string | null; created_at: string;
}

export const detectionApi = {
  upload: (form: FormData) =>
    api.upload<DetectionTask>('/detection/upload', form),

  getTask: (taskId: number) =>
    api.get<DetectionTask>(`/detection/tasks/${taskId}`),

  pollTask: (taskId: number) =>
    api.post<{ task: DetectionTask; report?: DetectionReport; completed: boolean }>(`/detection/tasks/${taskId}/poll`),

  listReports: (page = 1, pageSize = 10) =>
    api.get<{ total: number; page: number; page_size: number; items: (DetectionReport & { file_name: string; paper_title: string | null; status: string; finished_at: string | null })[] }>(`/detection/reports?page=${page}&page_size=${pageSize}`),

  getReport: (reportId: number) =>
    api.get<DetectionReport>(`/detection/reports/${reportId}`),

  /** Public report verification — no auth required */
  verifyReport: (reportNumber: string) =>
    api.post<{
      report_number: string
      detection_type: string
      paper_title: string | null
      author_name: string | null
      overall_score: number | null
      overall_grade: string | null
      l1_score: number | null
      l1_grade: string | null
      l2_score: number | null
      l2_grade: string | null
      l3_score: number | null
      l3_grade: string | null
      l4_score: number | null
      l4_grade: string | null
      similarity_rate: number | null
      aigc_rate: number | null
      generated_at: string | null
      created_at: string | null
    }>('/detection/verify', { report_number: reportNumber }),
}
