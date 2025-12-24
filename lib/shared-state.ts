
// Shared state management for Healer and Navigator integration
// Uses localStorage to persist code and state between page navigations

const STORAGE_KEYS = {
    ORIGINAL_CODE: 'accessibilityos_original_code',
    FIXED_CODE: 'accessibilityos_fixed_code',
    VIOLATIONS: 'accessibilityos_violations',
    HEALER_STATE: 'accessibilityos_healer_state',
    NAVIGATOR_ISSUES: 'accessibilityos_navigator_issues'
} as const

export interface HealerState {
    originalCode: string
    fixedCode: string
    violations: any[]
    inputUrl: string
    step: string
    logs: string[]
}

export interface NavigatorIssue {
    element: string
    issue: string
    severity: 'low' | 'medium' | 'high'
}

// Save Healer state to localStorage
export function saveHealerState(state: Partial<HealerState>) {
    try {
        const existing = getHealerState()
        const merged = { ...existing, ...state }
        localStorage.setItem(STORAGE_KEYS.HEALER_STATE, JSON.stringify(merged))
    } catch (e) {
        console.error('Failed to save Healer state:', e)
    }
}

// Get Healer state from localStorage
export function getHealerState(): HealerState | null {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.HEALER_STATE)
        return saved ? JSON.parse(saved) : null
    } catch (e) {
        console.error('Failed to get Healer state:', e)
        return null
    }
}

// Save fixed code for Navigator to verify
export function saveFixedCode(code: string) {
    try {
        localStorage.setItem(STORAGE_KEYS.FIXED_CODE, code)
    } catch (e) {
        console.error('Failed to save fixed code:', e)
    }
}

// Get fixed code for Navigator
export function getFixedCode(): string | null {
    try {
        return localStorage.getItem(STORAGE_KEYS.FIXED_CODE)
    } catch (e) {
        console.error('Failed to get fixed code:', e)
        return null
    }
}

// Save original code
export function saveOriginalCode(code: string) {
    try {
        localStorage.setItem(STORAGE_KEYS.ORIGINAL_CODE, code)
    } catch (e) {
        console.error('Failed to save original code:', e)
    }
}

// Get original code
export function getOriginalCode(): string | null {
    try {
        return localStorage.getItem(STORAGE_KEYS.ORIGINAL_CODE)
    } catch (e) {
        console.error('Failed to get original code:', e)
        return null
    }
}

// Save violations for reference
export function saveViolations(violations: any[]) {
    try {
        localStorage.setItem(STORAGE_KEYS.VIOLATIONS, JSON.stringify(violations))
    } catch (e) {
        console.error('Failed to save violations:', e)
    }
}

// Get saved violations
export function getViolations(): any[] {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.VIOLATIONS)
        return saved ? JSON.parse(saved) : []
    } catch (e) {
        console.error('Failed to get violations:', e)
        return []
    }
}

// Save Navigator issues for Healer to re-fix
export function saveNavigatorIssues(issues: NavigatorIssue[]) {
    try {
        localStorage.setItem(STORAGE_KEYS.NAVIGATOR_ISSUES, JSON.stringify(issues))
    } catch (e) {
        console.error('Failed to save Navigator issues:', e)
    }
}

// Get Navigator issues in Healer
export function getNavigatorIssues(): NavigatorIssue[] {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.NAVIGATOR_ISSUES)
        return saved ? JSON.parse(saved) : []
    } catch (e) {
        console.error('Failed to get Navigator issues:', e)
        return []
    }
}

// Clear Navigator issues after Healer processes them
export function clearNavigatorIssues() {
    try {
        localStorage.removeItem(STORAGE_KEYS.NAVIGATOR_ISSUES)
    } catch (e) {
        console.error('Failed to clear Navigator issues:', e)
    }
}

// Clear all shared state (for reset)
export function clearAllState() {
    try {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key)
        })
    } catch (e) {
        console.error('Failed to clear all state:', e)
    }
}
