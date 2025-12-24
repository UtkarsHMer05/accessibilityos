"use client"
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Database, ArrowRight } from 'lucide-react'

const dataFlowEvents = [
    { id: 1, source: 'healer', destination: 'database', label: 'ISSUE_CREATE', color: 'blue' },
    { id: 2, source: 'database', destination: 'navigator', label: 'VERIFY_TASK', color: 'green' },
    { id: 3, source: 'navigator', destination: 'database', label: 'FEEDBACK', color: 'purple' },
    { id: 4, source: 'database', destination: 'healer', label: 'LEARN_PATTERN', color: 'emerald' },
]

export function LiveFlowDiagram() {
    const [activeFlows, setActiveFlows] = useState<number[]>([])
    const [opCount, setOpCount] = useState(1247)

    useEffect(() => {
        // Simulate live data flows
        const interval = setInterval(() => {
            const randomFlow = Math.floor(Math.random() * dataFlowEvents.length)
            setActiveFlows(prev => [...prev.slice(-3), randomFlow])
            setOpCount(prev => prev + 1)
        }, 1200)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="relative h-80 w-full p-6 bg-slate-900/50 border border-white/10 rounded-2xl">
            {/* Healer Node */}
            <motion.div
                animate={{ scale: activeFlows.includes(0) || activeFlows.includes(3) ? 1.05 : 1 }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-blue-950 border-2 border-blue-500 p-4 rounded-xl w-32 text-center"
            >
                <span className="text-2xl">🛠️</span>
                <p className="font-bold text-blue-400 mt-1">HEALER</p>
                <p className="text-[10px] text-slate-400">Fixing issues...</p>
            </motion.div>

            {/* Database Node (Center) */}
            <motion.div
                animate={{ scale: activeFlows.length > 0 ? [1, 1.02, 1] : 1 }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-950 border-2 border-emerald-500 p-4 rounded-xl w-36 text-center z-10"
            >
                <Database className="w-6 h-6 mx-auto text-emerald-400" />
                <p className="font-bold text-emerald-400 mt-1">SHARED DB</p>
                <p className="text-xs text-emerald-300/60">{opCount} ops</p>
            </motion.div>

            {/* Navigator Node */}
            <motion.div
                animate={{ scale: activeFlows.includes(1) || activeFlows.includes(2) ? 1.05 : 1 }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-purple-950 border-2 border-purple-500 p-4 rounded-xl w-32 text-center"
            >
                <span className="text-2xl">👁️</span>
                <p className="font-bold text-purple-400 mt-1">NAVIGATOR</p>
                <p className="text-[10px] text-slate-400">Testing fixes...</p>
            </motion.div>

            {/* Flow Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Healer → Database */}
                <motion.line
                    x1="18" y1="50" x2="42" y2="50"
                    stroke="url(#blueGrad)"
                    strokeWidth="0.5"
                    strokeDasharray="3 1"
                    animate={{ opacity: activeFlows.includes(0) ? 1 : 0.3 }}
                />
                {/* Database → Navigator */}
                <motion.line
                    x1="58" y1="50" x2="82" y2="50"
                    stroke="url(#greenGrad)"
                    strokeWidth="0.5"
                    strokeDasharray="3 1"
                    animate={{ opacity: activeFlows.includes(1) ? 1 : 0.3 }}
                />
                <defs>
                    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                    <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Live Stats */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
                <p className="text-sm text-slate-300">
                    Total cross-mode operations: <strong className="text-emerald-400">{opCount}</strong>
                </p>
                <p className="text-[10px] text-slate-500">Real-time data flow visualization</p>
            </div>
        </div>
    )
}
