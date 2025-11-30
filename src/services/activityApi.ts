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

export const getActivityLogs = (limit = 50, skip = 0) =>
    request(`/api/activity/logs?limit=${limit}&skip=${skip}`);

export const getActiveSessions = () =>
    request('/api/activity/sessions');

export const getFailedLoginAttempts = () =>
    request('/api/activity/failed-logins');
