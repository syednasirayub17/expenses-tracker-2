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

// Bank Accounts
export const getBankAccounts = () => request('/api/accounts/bank');
export const createBankAccount = (data: any) => request('/api/accounts/bank', { method: 'POST', body: JSON.stringify(data) });
export const updateBankAccount = (id: string, data: any) => request(`/api/accounts/bank/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteBankAccount = (id: string) => request(`/api/accounts/bank/${id}`, { method: 'DELETE' });

// Credit Cards
export const getCreditCards = () => request('/api/accounts/creditcard');
export const createCreditCard = (data: any) => request('/api/accounts/creditcard', { method: 'POST', body: JSON.stringify(data) });
export const updateCreditCard = (id: string, data: any) => request(`/api/accounts/creditcard/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteCreditCard = (id: string) => request(`/api/accounts/creditcard/${id}`, { method: 'DELETE' });

// Loans
export const getLoans = () => request('/api/accounts/loan');
export const createLoan = (data: any) => request('/api/accounts/loan', { method: 'POST', body: JSON.stringify(data) });
export const updateLoan = (id: string, data: any) => request(`/api/accounts/loan/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteLoan = (id: string) => request(`/api/accounts/loan/${id}`, { method: 'DELETE' });

// Budgets
export const getBudgets = () => request('/api/accounts/budget');
export const createBudget = (data: any) => request('/api/accounts/budget', { method: 'POST', body: JSON.stringify(data) });
export const updateBudget = (id: string, data: any) => request(`/api/accounts/budget/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteBudget = (id: string) => request(`/api/accounts/budget/${id}`, { method: 'DELETE' });

// Transactions
export const getTransactions = () => request('/api/accounts/transaction');
export const createTransaction = (data: any) => request('/api/accounts/transaction', { method: 'POST', body: JSON.stringify(data) });
export const updateTransaction = (id: string, data: any) => request(`/api/accounts/transaction/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteTransaction = (id: string) => request(`/api/accounts/transaction/${id}`, { method: 'DELETE' });
