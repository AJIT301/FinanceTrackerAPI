// src/auth/services/tokenService.js
export const tokenService = {
    setToken: (token) => {
        localStorage.setItem('authToken', token);
    },

    getToken: () => {
        return localStorage.getItem('authToken');
    },

    removeToken: () => {
        localStorage.removeItem('authToken');
    },

    hasToken: () => {
        return !!localStorage.getItem('authToken');
    }
};