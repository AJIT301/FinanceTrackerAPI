// src/auth/services/authAPI.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Add this helper function
export const apiRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');

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

// Keep existing authAPI object
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
        return response.json();
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