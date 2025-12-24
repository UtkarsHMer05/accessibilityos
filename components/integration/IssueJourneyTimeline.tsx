"use client"
import { motion } from 'framer-motion'
import { CheckCircle, AlertTriangle, RefreshCw, Zap, Eye, Wrench } from 'lucide-react'

const timelineData = [
    { mode: 'healer', icon: '🔍', time: '2:00 PM', title: 'Healer Detected', description: 'Found missing alt text on hero image', status: 'completed' },
    { mode: 'healer', icon: '🛠️', time: '2:02 PM', title: 'Healer Fixed', description: "Generated alt: 'Modern workspace with laptop'", status: 'completed', code: { before: '<img src="hero.jpg">', after: '<img src="hero.jpg" alt="Modern workspace...">' } },
    { mode: 'navigator', icon: '🧪', time: '2:04 PM', title: 'Navigator Tested', description: 'Simulated blind user reading page', status: 'completed' },
    { mode: 'integration', icon: '⚠️', time: '2:05 PM', title: 'Navigator Found Issue', description: 'Button lacks keyboard focus indicator', status: 'warning' },
    { mode: 'healer', icon: '🔄', time: '2:06 PM', title: 'Healer Re-Fixed', description: 'Added focus:ring-2 focus:ring-blue-500', status: 'completed' },
    { mode: 'navigator', icon: '✅', time: '2:07 PM', title: 'Navigator Verified', description: 'Full checkout flow accessible', status: 'success', score: 98 },
]

export function IssueJourneyTimeline() {
    return (
        <div className="space-y-0 relative">
            {/* Vertical Line */}
            <div className="absolute left-6 top-8 bottom-8 w-[2px] bg-gradient-to-b from-blue-500 via-purple-500 to-emerald-500" />

            {timelineData.map((step, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className="relative flex gap-4 py-4"
                >
                    {/* Icon Node */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg z-10 border-2 shrink-0
                        ${step.mode === 'healer' ? 'bg-blue-950 border-blue-500' : ''}
                        ${step.mode === 'navigator' ? 'bg-purple-950 border-purple-500' : ''}
                        ${step.mode === 'integration' ? 'bg-amber-950 border-amber-500' : ''}
                    `}>
                        {step.icon}
                    </div>

                    {/* Content */}
                    <div className={`flex-1 p-4 rounded-xl border
                        ${step.status === 'completed' ? 'bg-slate-900/50 border-white/5' : ''}
                        ${step.status === 'warning' ? 'bg-amber-900/20 border-amber-500/30' : ''}
                        ${step.status === 'success' ? 'bg-emerald-900/20 border-emerald-500/30' : ''}
                    `}>
                        <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-white">{step.title}</h4>
                            <span className="text-xs text-slate-500">{step.time}</span>
                        </div>
                        <p className="text-sm text-slate-400">{step.description}</p>

                        {step.code && (
                            <div className="mt-3 text-xs font-mono space-y-1">
                                <div className="text-red-400 line-through opacity-60">{step.code.before}</div>
                                <div className="text-emerald-400">{step.code.after}</div>
                            </div>
                        )}

                        {step.score && (
                            <div className="mt-3 flex items-center gap-2">
                                <div className="text-emerald-400 font-bold text-2xl">{step.score}%</div>
                                <span className="text-xs text-emerald-300/60">Effectiveness Score</span>
                            </div>
                        )}
                    </div>
                </motion.div>
            ))}
        </div>
    )
}
