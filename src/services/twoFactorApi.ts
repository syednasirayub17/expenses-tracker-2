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

export const setup2FA = () => request('/api/2fa/setup', { method: 'POST' });

export const verifySetup = (token: string) =>
    request('/api/2fa/verify-setup', {
        method: 'POST',
        body: JSON.stringify({ token })
    });

export const verify2FA = (userId: string, token: string, isBackupCode: boolean = false) =>
    request('/api/2fa/verify', {
        method: 'POST',
        body: JSON.stringify({ userId, token, isBackupCode })
    });

export const disable2FA = (password: string) =>
    request('/api/2fa/disable', {
        method: 'POST',
        body: JSON.stringify({ password })
    });

export const get2FAStatus = () => request('/api/2fa/status');
