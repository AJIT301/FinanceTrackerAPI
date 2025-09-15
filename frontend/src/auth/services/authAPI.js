import { debugLog } from '../utils/debug';

// Get API base URL with fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.0.10:5000/api';

// console.log('Environment variables:', import.meta.env);
// console.log('API_BASE_URL:', API_BASE_URL);

// Check if API_BASE_URL is still undefined
if (!API_BASE_URL || API_BASE_URL === 'undefined') {
    console.error('⚠️ VITE_API_BASE_URL is not set! Please check your .env file');
}

export const apiRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem('authToken');

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            ...(token && { 'Authorization': `Bearer ${token}` }),
            'Content-Type': 'application/json',
            ...options.headers
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    return response;
};

// Auth API object
export const authAPI = {
    login: async (credentials) => {
        try {
            const formData = new URLSearchParams();
            formData.append('username', credentials.email);
            formData.append('password', credentials.password);

            debugLog('Attempting login to:', `${API_BASE_URL}/auth/login`);

            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Login failed: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            if (data.access_token) {
                localStorage.setItem('authToken', data.access_token);
                debugLog('Token stored successfully!');
            }

            return data;
        } catch (error) {
            debugLog('Login error:', error);
            throw error;
        }
    },

    register: async (userData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Registration failed: ${response.status} - ${errorText}`);
            }
            return response.json();
        } catch (error) {
            debugLog('Registration error:', error);
            throw error;
        }
    },

    getCurrentUser: async () => {
        try {
            const response = await apiRequest('/auth/me');
            return response.json();
        } catch (error) {
            debugLog('Get current user error:', error);
            throw error;
        }
    },

    getUserSettings: async () => {
        try {
            const response = await apiRequest('/api/settings');
            return response.json();
        } catch (error) {
            debugLog('Get user settings error:', error);
            throw error;
        }
    },

    updateUserSettings: async (settings) => {
        try {
            const response = await apiRequest('/api/settings', {
                method: 'PATCH',
                body: JSON.stringify(settings)
            });
            return response.json();
        } catch (error) {
            debugLog('Update user settings error:', error);
            throw error;
        }
    }
};

// Export getCurrentUser separately for easy import
export const getCurrentUser = authAPI.getCurrentUser;