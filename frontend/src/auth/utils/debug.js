// src/utils/debug.js
//
const isDebug = import.meta.env.VITE_DEBUG === 'true';

export const debugLog = (...args) => {
    if (isDebug) {
        console.log('[DEBUG]', ...args);
    }
};