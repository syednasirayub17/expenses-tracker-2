const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const getAuthToken = () => {
    return localStorage.getItem('token')
}

const request = async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken()
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    }

    const response = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers,
    })

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
}

export interface Categories {
    expense: string[]
    income: string[]
    payment: string[]
}

// Get all categories for the authenticated user
export const getCategories = (): Promise<Categories> =>
    request('/api/categories')

// Add a category to a specific type
export const addCategory = (
    type: 'expense' | 'income' | 'payment',
    category: string
): Promise<Categories> =>
    request(`/api/categories/${type}`, {
        method: 'POST',
        body: JSON.stringify({ category }),
    })

// Delete a category from a specific type
export const deleteCategory = (
    type: 'expense' | 'income' | 'payment',
    category: string
): Promise<Categories> =>
    request(`/api/categories/${type}/${encodeURIComponent(category)}`, {
        method: 'DELETE',
    })
