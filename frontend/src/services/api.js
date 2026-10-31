// Base API configuration
// Set VITE_API_URL in .env to your backend URL, e.g. http://localhost:3000/api
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const IS_DEV = import.meta.env.DEV

class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.status = status
    this.data = data
    this.name = 'ApiError'
  }
}

/**
 * Ghi log yêu cầu API ra console (chỉ ở môi trường dev).
 * @param {string} method
 * @param {string} url
 * @param {any} body
 */
function logRequest(method, url, body) {
  if (!IS_DEV) return
  const payload = body && body instanceof FormData ? '[FormData]' : body
  console.groupCollapsed(`[API Request] ${method.toUpperCase()} ${url}`)
  if (payload) console.log('Payload:', payload)
  console.groupEnd()
}

/**
 * Ghi log lỗi API ra console (chỉ ở môi trường dev).
 * @param {string} method
 * @param {string} url
 * @param {number|undefined} status
 * @param {string|undefined} message
 */
function logError(method, url, status, message) {
  if (!IS_DEV) return
  console.groupCollapsed(`[API Error] ${method.toUpperCase()} ${url} - Status: ${status ?? 'N/A'} - Message: ${message ?? 'N/A'}`)
  console.error('Error detail:', { method, url, status, message })
  console.groupEnd()
}

/**
 * Lấy token phân hệ phù hợp (Candidate, Employer, Admin)
 * Ngăn chặn tình trạng chồng chéo token giữa các phân hệ khi đăng nhập cùng trình duyệt
 */
export function getActiveToken(endpoint = '') {
  if (typeof window === 'undefined') {
    return localStorage.getItem('nexcv_token')
  }

  const path = window.location.pathname || ''

  // 1. Phân hệ Admin
  if (endpoint.startsWith('/admin') || path.startsWith('/admin')) {
    return localStorage.getItem('nexcv_admin_token') || localStorage.getItem('nexcv_token')
  }

  // 2. Phân hệ Nhà tuyển dụng
  if (endpoint.startsWith('/employer') || path.startsWith('/employer')) {
    return localStorage.getItem('nexcv_employer_token') || localStorage.getItem('nexcv_token')
  }

  // 3. Phân hệ Ứng viên (mặc định)
  return localStorage.getItem('nexcv_candidate_token') || localStorage.getItem('nexcv_token')
}

async function request(endpoint, options = {}) {
  const token = options.token || getActiveToken(endpoint)

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  // Don't set Content-Type for FormData (browser will set multipart boundary)
  if (options.body instanceof FormData) {
    delete headers['Content-Type']
  }

  const config = {
    method: options.method || 'GET',
    headers,
    ...(options.body && { body: options.body instanceof FormData ? options.body : JSON.stringify(options.body) }),
    signal: options.signal,
  }

  const method = config.method
  const url = `${BASE_URL}${endpoint}`
  logRequest(method, url, options.body)

  try {
    const res = await fetch(url, config)

    // No content
    if (res.status === 204) return null

    const data = await res.json().catch(() => null)

    if (!res.ok) {
      const message = data?.message || data?.detail || `HTTP ${res.status}`
      logError(method, url, res.status, message)
      throw new ApiError(message, res.status, data)
    }

    return data
  } catch (err) {
    // Nếu là ApiError đã ném ở trên rồi thì logError đã được gọi, không gọi lại
    if (err instanceof ApiError) throw err
    if (err.name === 'AbortError') throw err
    const message = err.message || 'Network error'
    logError(method, url, 0, message)
    throw new ApiError(message, 0, null)
  }
}

// Convenience methods
export const api = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options) => request(endpoint, { ...options, method: 'PUT', body }),
  patch: (endpoint, body, options) => request(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
  upload: (endpoint, formData, options) =>
    request(endpoint, { ...options, method: 'POST', body: formData }),
}

export { ApiError }
export default api
