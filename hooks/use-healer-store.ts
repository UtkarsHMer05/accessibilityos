
import { create } from 'zustand'

type HealerStep = 'idle' | 'scanning' | 'fixing' | 'verifying' | 'complete'

interface Violation {
    id: string
    description: string
    impact: string
    nodes: any[]
}

interface FixLog {
    issueId: string
    originalCode: string
    fixedCode: string
    thinking: string
    applied: boolean
}

interface HealerState {
    step: HealerStep
    url: string
    html: string
    violations: Violation[]
    fixes: FixLog[]
    score: { before: number; after: number }
    logs: string[]

    // Actions
    setUrl: (url: string) => void
    setHtml: (html: string) => void
    startScan: () => void
    completeScan: (violations: Violation[], scoreEstimation: number) => void
    startFix: () => void
    completeFix: (fixes: FixLog[], finalHtml: string) => void
    setFinalScore: (score: number) => void
    reset: () => void
    addLog: (msg: string) => void
}

export const useHealerStore = create<HealerState>((set) => ({
    step: 'idle',
    url: '',
    html: '',
    violations: [],
    fixes: [],
    score: { before: 0, after: 0 },
    logs: [],

    setUrl: (url) => set({ url }),
    setHtml: (html) => set({ html }),

    startScan: () => set({ step: 'scanning', logs: ['🔍 Starting analysis...'] }),

    completeScan: (violations, scoreEstimation) => set((state) => ({
        step: 'idle', // User reviews before fixing? Or auto? Let's say idle for now to show results
        violations,
        score: { ...state.score, before: scoreEstimation },
        logs: [...state.logs, `✅ Found ${violations.length} issues. Est. Score: ${scoreEstimation}`]
    })),

    startFix: async () => {
        set((state) => ({ step: 'fixing', logs: [...state.logs, '🚑 Retrieving learned patterns...'] }))

        // Simulate fetching patterns (In real app, we'd fetch from DB)
        // For MVP Demo, we simulate the "Learning" effect visually
        await new Promise(r => setTimeout(r, 800))
        set((state) => ({ logs: [...state.logs, '🧠 Applied pattern: "Native Button Preference" (Confidence: 98%)'] }))

        set((state) => ({
            logs: [...state.logs, '🚑 Generating AI fixes...']
        }))
    },

    completeFix: (fixes, finalHtml) => set((state) => ({
        step: 'verifying', // Move straight to verifying
        fixes,
        html: finalHtml,
        logs: [...state.logs, `✨ Applied ${fixes.length} fixes.`]
    })),

    setFinalScore: (score) => set((state) => ({
        step: 'complete',
        score: { ...state.score, after: score },
        logs: [...state.logs, `🏆 Final Score: ${score}`]
    })),

    reset: () => set({
        step: 'idle', url: '', html: '', violations: [], fixes: [], score: { before: 0, after: 0 }, logs: []
    }),

    addLog: (msg) => set((state) => ({ logs: [...state.logs, msg] }))
}))
