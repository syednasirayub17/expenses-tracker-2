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

export const getWallets = () => request('/api/wallets');

export const createWallet = (data: any) =>
    request('/api/wallets', {
        method: 'POST',
        body: JSON.stringify(data)
    });

export const joinWallet = (inviteCode: string) =>
    request('/api/wallets/join', {
        method: 'POST',
        body: JSON.stringify({ inviteCode })
    });

export const getWalletTransactions = (walletId: string) =>
    request(`/api/wallets/${walletId}/transactions`);

export const addSharedExpense = (walletId: string, data: any) =>
    request(`/api/wallets/${walletId}/transactions`, {
        method: 'POST',
        body: JSON.stringify(data)
    });

export const getWalletBalances = (walletId: string) =>
    request(`/api/wallets/${walletId}/balances`);

export const recordSettlement = (walletId: string, data: any) =>
    request(`/api/wallets/${walletId}/settle`, {
        method: 'POST',
        body: JSON.stringify(data)
    });
