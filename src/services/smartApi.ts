const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getAuthToken = () => {
    return localStorage.getItem('token');
};

const request = async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
};

// Category Suggestion
export const suggestCategory = (description: string) =>
    request('/api/smart/suggest-category', {
        method: 'POST',
        body: JSON.stringify({ description })
    });

// Insights
export const getInsights = () => request('/api/smart/insights');

// Budget Suggestions
export const getBudgetSuggestions = () => request('/api/smart/budget-suggestions');

// Category Breakdown
export const getCategoryBreakdown = (months: number = 1) =>
    request(`/api/smart/category-breakdown?months=${months}`);
