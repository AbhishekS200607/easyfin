const API_BASE_URL = 'http://localhost:8081/api';

const API_ENDPOINTS = {
    AUTH: {
        LOGIN: `${API_BASE_URL}/auth/login`,
        REGISTER: `${API_BASE_URL}/auth/register`
    },
    TRANSACTIONS: {
        BASE: `${API_BASE_URL}/transactions`,
        SUMMARY: `${API_BASE_URL}/transactions/summary`
    },
    CATEGORIES: {
        BASE: `${API_BASE_URL}/categories`
    }
};

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};