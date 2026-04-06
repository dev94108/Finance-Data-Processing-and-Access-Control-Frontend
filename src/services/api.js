import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// Auth
export const authAPI = {
  login:    (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me:       ()     => api.get('/auth/me'),
}

// Users
export const usersAPI = {
  getAll:  (params) => api.get('/users', { params }),
  getById: (id)     => api.get(`/users/${id}`),
  create:  (data)   => api.post('/users', data),
  update:  (id, data) => api.put(`/users/${id}`, data),
  delete:  (id)     => api.delete(`/users/${id}`),
}

// Records
export const recordsAPI = {
  getAll:  (params) => api.get('/records', { params }),
  getById: (id)     => api.get(`/records/${id}`),
  create:  (data)   => api.post('/records', data),
  update:  (id, data) => api.put(`/records/${id}`, data),
  delete:  (id)     => api.delete(`/records/${id}`),
}

// Dashboard
export const dashboardAPI = {
  summary:        () => api.get('/dashboard/summary'),
  categories:     () => api.get('/dashboard/categories'),
  recent:         (limit = 8) => api.get('/dashboard/recent', { params: { limit } }),
  monthlyTrends:  (year) => api.get('/dashboard/trends/monthly', { params: { year } }),
  weeklyTrends:   () => api.get('/dashboard/trends/weekly'),
}

export default api
