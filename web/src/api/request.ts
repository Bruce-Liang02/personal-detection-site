/** Unified API client with Bearer-token auth and auto-logout on 401. */
const BASE = '/api/v1'

interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

class ApiClient {
  private token: string | null = null

  setToken(token: string) {
    this.token = token
    localStorage.setItem('access_token', token)
  }

  getToken(): string | null {
    if (this.token) return this.token
    this.token = localStorage.getItem('access_token')
    return this.token
  }

  clearToken() {
    this.token = null
    localStorage.removeItem('access_token')
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    options?: { isForm?: boolean },
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {}
    const token = this.getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`

    let bodyInit: BodyInit | undefined
    if (body) {
      if (options?.isForm) {
        bodyInit = body as FormData
      } else {
        headers['Content-Type'] = 'application/json'
        bodyInit = JSON.stringify(body)
      }
    }

    const res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: bodyInit,
    })

    if (res.status === 401) {
      this.clearToken()
      window.location.href = '/login'
      throw new Error('未登录或Token已过期')
    }

    const json: ApiResponse<T> = await res.json()
    if (json.code !== 0) throw new Error(json.message)
    return json
  }

  get<T>(path: string) { return this.request<T>('GET', path) }
  post<T>(path: string, body?: unknown) { return this.request<T>('POST', path, body) }
  put<T>(path: string, body?: unknown) { return this.request<T>('PUT', path, body) }
  upload<T>(path: string, form: FormData) { return this.request<T>('POST', path, form, { isForm: true }) }
}

export const api = new ApiClient()
export type { ApiResponse }
