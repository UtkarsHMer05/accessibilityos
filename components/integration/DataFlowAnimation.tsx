
'use client'

import { motion } from 'framer-motion'
import { Database, ArrowRight, Zap } from 'lucide-react'

interface DataFlowAnimationProps {
    dataFlowCount: number
    currentFlow?: 'healer-to-navigator' | 'navigator-to-healer' | null
    isActive: boolean
}

export function DataFlowAnimation({
    dataFlowCount = 0,
    currentFlow = null,
    isActive = false
}: DataFlowAnimationProps) {
    return (
        <div className="h-full flex flex-col items-center justify-center relative px-4">
            {/* Connection Lines */}
            <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
                {/* Healer to Database line */}
                <motion.line
                    x1="0" y1="50%" x2="50%" y2="50%"
                    stroke={currentFlow === 'healer-to-navigator' ? '#3b82f6' : '#334155'}
                    strokeWidth="2"
                    strokeDasharray="8,4"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, repeat: Infinity }}
                />
                {/* Database to Navigator line */}
                <motion.line
                    x1="50%" y1="50%" x2="100%" y2="50%"
                    stroke={currentFlow === 'healer-to-navigator' ? '#a855f7' : currentFlow === 'navigator-to-healer' ? '#f59e0b' : '#334155'}
                    strokeWidth="2"
                    strokeDasharray="8,4"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                />
            </svg>

            {/* Database Icon (Center) */}
            <motion.div
                animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="relative z-10"
            >
                <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg ${isActive ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-slate-700'
                    }`}>
                    <Database className="w-10 h-10 text-white" />
                </div>
                {/* Counter Badge */}
                {dataFlowCount > 0 && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-bold text-emerald-600 shadow-lg"
                    >
                        {dataFlowCount}
                    </motion.div>
                )}
            </motion.div>

            <p className="text-xs text-slate-500 mt-3 text-center z-10">
                Shared Database
            </p>

            {/* Data Packet Animation: Healer → Navigator */}
            {currentFlow === 'healer-to-navigator' && (
                <motion.div
                    className="absolute w-12 h-12 rounded-full flex items-center justify-center shadow-lg z-20"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
                    initial={{ left: '0%', opacity: 0 }}
                    animate={{
                        left: ['0%', '45%', '100%'],
                        opacity: [0, 1, 1, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                >
                    <span className="text-white text-[10px] font-bold">FIX</span>
                </motion.div>
            )}

            {/* Data Packet Animation: Navigator → Healer (Feedback) */}
            {currentFlow === 'navigator-to-healer' && (
                <motion.div
                    className="absolute w-12 h-12 rounded-full flex items-center justify-center shadow-lg z-20"
                    style={{ background: 'linear-gradient(135deg, #a855f7, #f59e0b)' }}
                    initial={{ right: '0%', opacity: 0 }}
                    animate={{
                        right: ['0%', '45%', '100%'],
                        opacity: [0, 1, 1, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                >
                    <span className="text-white text-[10px] font-bold">FB</span>
                </motion.div>
            )}

            {/* Arrow indicators */}
            <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10">
                <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                >
                    <ArrowRight className="w-6 h-6 text-blue-400" />
                </motion.div>
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
                <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                >
                    <ArrowRight className="w-6 h-6 text-purple-400" />
                </motion.div>
            </div>

            {/* Status Label */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute bottom-8 bg-slate-800/80 px-4 py-2 rounded-full z-10 flex items-center gap-2"
            >
                {isActive && <Zap className="w-3 h-3 text-yellow-400 animate-pulse" />}
                <span className="text-[10px] text-slate-400 font-mono">
                    {dataFlowCount} transfers
                </span>
            </motion.div>
        </div>
    )
}
