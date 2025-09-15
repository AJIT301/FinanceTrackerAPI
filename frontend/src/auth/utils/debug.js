// src/utils/debug.js
const isDebug = import.meta.env.VITE_DEBUG === 'true';
const debugNamespaces = import.meta.env.VITE_DEBUG_NAMESPACES || '';

// Parse namespaces from environment variable
const getEnabledNamespaces = () => {
    if (!debugNamespaces) return [];
    return debugNamespaces.split(',').map(ns => ns.trim());
};

const enabledNamespaces = getEnabledNamespaces();

// Check if namespace is enabled
const isNamespaceEnabled = (namespace) => {
    if (!isDebug || enabledNamespaces.length === 0) return isDebug;
    
    return enabledNamespaces.some(ns => {
        if (ns === '*') return true;
        if (ns.endsWith('*')) {
            return namespace.startsWith(ns.slice(0, -1));
        }
        return namespace === ns;
    });
};

// Main debug class
class Debugger {
    constructor(namespace) {
        this.namespace = namespace;
        this.enabled = isNamespaceEnabled(namespace);
        // Each instance has its own timer tracking
        this.activeTimers = new Set();
        this.pendingTimers = new Set();
    }

    log(...args) {
        if (this.enabled) {
            const timestamp = new Date().toISOString();
            console.log(`[DEBUG ${timestamp}] [${this.namespace}]`, ...args);
        }
    }

    error(...args) {
        if (this.enabled) {
            const timestamp = new Date().toISOString();
            console.error(`[ERROR ${timestamp}] [${this.namespace}]`, ...args);
        }
    }

    warn(...args) {
        if (this.enabled) {
            const timestamp = new Date().toISOString();
            console.warn(`[WARN ${timestamp}] [${this.namespace}]`, ...args);
        }
    }

    group(...args) {
        if (this.enabled) {
            console.group(`[${this.namespace}]`, ...args);
        }
    }

    groupEnd() {
        if (this.enabled) {
            console.groupEnd();
        }
    }

    time(label) {
        if (this.enabled) {
            const fullLabel = `[${this.namespace}] ${label}`;
            
            // Only start timer if it's not already active
            if (!this.activeTimers.has(fullLabel) && !this.pendingTimers.has(fullLabel)) {
                this.pendingTimers.add(fullLabel);
                // Small delay to handle React's double invocation
                setTimeout(() => {
                    if (this.pendingTimers.has(fullLabel)) {
                        this.pendingTimers.delete(fullLabel);
                        this.activeTimers.add(fullLabel);
                        console.time(fullLabel);
                    }
                }, 0);
            }
        }
    }

    timeEnd(label) {
        if (this.enabled) {
            const fullLabel = `[${this.namespace}] ${label}`;
            
            // Clean up pending timers
            if (this.pendingTimers.has(fullLabel)) {
                this.pendingTimers.delete(fullLabel);
            }
            
            // End active timer
            if (this.activeTimers.has(fullLabel)) {
                this.activeTimers.delete(fullLabel);
                console.timeEnd(fullLabel);
            }
        }
    }
}

// Factory function to create debuggers for different namespaces
export const createDebugger = (namespace) => {
    if (!isDebug) {
        return {
            log: () => {},
            error: () => {},
            warn: () => {},
            group: () => {},
            groupEnd: () => {},
            time: () => {},
            timeEnd: () => {}
        };
    }
    
    return new Debugger(namespace);
};

// Backward compatibility
const globalDebugger = new Debugger('global');
export const debugLog = globalDebugger.log.bind(globalDebugger);
export const debugError = globalDebugger.error.bind(globalDebugger);
export const debugWarn = globalDebugger.warn.bind(globalDebugger);
export const debugGroup = globalDebugger.group.bind(globalDebugger);
export const debugGroupEnd = globalDebugger.groupEnd.bind(globalDebugger);
export const debugTime = globalDebugger.time.bind(globalDebugger);
export const debugTimeEnd = globalDebugger.timeEnd.bind(globalDebugger);