// src/auth/services/tokenService.js
export const tokenService = {
    setToken: (token) => {
        localStorage.setItem('token', token);
    },

    getToken: () => {
        return localStorage.getItem('token');
    },

    removeToken: () => {
        localStorage.removeItem('token');
    },

    hasToken: () => {
        return !!localStorage.getItem('token');
    }
};