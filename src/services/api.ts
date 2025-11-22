/// <reference types="vite/client" />
const API_BASE = import.meta.env.VITE_API_BASE || ''

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || res.statusText)
  }
  return res.json()
}

export const daybookApi = {
  list: () => request('/api/daybook'),
  create: (payload: any) => request('/api/daybook', { method: 'POST', body: JSON.stringify(payload) }),
  get: (id: string) => request(`/api/daybook/${id}`),
  update: (id: string, payload: any) => request(`/api/daybook/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (id: string) => request(`/api/daybook/${id}`, { method: 'DELETE' }),
}

export const journalApi = {
  list: () => request('/api/journal'),
  create: (payload: any) => request('/api/journal', { method: 'POST', body: JSON.stringify(payload) }),
  get: (id: string) => request(`/api/journal/${id}`),
  update: (id: string, payload: any) => request(`/api/journal/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (id: string) => request(`/api/journal/${id}`, { method: 'DELETE' }),
}

export const investmentApi = {
  stocks: {
    list: () => request('/api/investing/stocks'),
    create: (p: any) => request('/api/investing/stocks', { method: 'POST', body: JSON.stringify(p) }),
    update: (id: string, p: any) => request(`/api/investing/stocks/${id}`, { method: 'PUT', body: JSON.stringify(p) }),
    remove: (id: string) => request(`/api/investing/stocks/${id}`, { method: 'DELETE' }),
  },
  sips: {
    list: () => request('/api/investing/sips'),
    create: (p: any) => request('/api/investing/sips', { method: 'POST', body: JSON.stringify(p) }),
    update: (id: string, p: any) => request(`/api/investing/sips/${id}`, { method: 'PUT', body: JSON.stringify(p) }),
    remove: (id: string) => request(`/api/investing/sips/${id}`, { method: 'DELETE' }),
  },
}

export default { daybookApi, journalApi, investmentApi }
