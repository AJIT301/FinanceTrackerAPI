import { debugLog } from '../utils/debug';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

debugLog('Debug initialized');

export const apiRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem('authToken');

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers
        }
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return response;
};

// Auth API object
export const authAPI = {
    login: async (credentials) => {
        const formData = new URLSearchParams();
        formData.append('username', credentials.email);
        formData.append('password', credentials.password);

        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
        });

        if (!response.ok) throw new Error('Login failed');

        const data = await response.json();
        if (data.access_token) {
            localStorage.setItem('authToken', data.access_token);
            debugLog('Token stored successfully!');
        }

        return data;
    },

    register: async (userData) => {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        if (!response.ok) throw new Error('Registration failed');
        return response.json();
    },

    getCurrentUser: async () => {
        const response = await apiRequest('/auth/me');
        return response.json();
    }
};

// Export getCurrentUser separately for easy import
export const getCurrentUser = authAPI.getCurrentUser;
