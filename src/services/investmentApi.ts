const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
    };
};

const request = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
            ...getAuthHeaders(),
            ...options.headers
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Request failed');
    }

    return response.json();
};

export const getInvestments = () => request('/api/investments');

export const getPortfolioSummary = () => request('/api/investments/portfolio');

export const addInvestment = (data: any) =>
    request('/api/investments', {
        method: 'POST',
        body: JSON.stringify(data)
    });

export const updateInvestment = (id: string, data: any) =>
    request(`/api/investments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });

export const deleteInvestment = (id: string) =>
    request(`/api/investments/${id}`, { method: 'DELETE' });

export const getCurrentGoldPrice = () => request('/api/investments/gold/price');

export const updateGoldPrice = (pricePerGram: number) =>
    request('/api/investments/gold/price', {
        method: 'POST',
        body: JSON.stringify({ pricePerGram })
    });

export const getGoldPriceHistory = (days: number = 30) =>
    request(`/api/investments/gold/history?days=${days}`);
