"use client"
import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'
import { useState, useEffect } from 'react'

interface HealthData {
    overall: number
    crossModeFlow: number
    autoTrigger: number
    feedbackLoop: number
    learningEffectiveness: number
}

export function IntegrationHealthWidget() {
    const [health, setHealth] = useState<HealthData | null>(null)
    const [hasData, setHasData] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/integration/journey')
                const json = await res.json()
                setHealth(json.health)
                setHasData(json.hasData)
            } catch (err) {
                console.error('Failed to fetch health data:', err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
        const interval = setInterval(fetchData, 5000)
        return () => clearInterval(interval)
    }, [])

    const healthMetrics = [
        { label: 'Cross-mode data flow', score: health?.crossModeFlow || 0, desc: 'Issues linked between modes' },
        { label: 'Auto-trigger reliability', score: health?.autoTrigger || 0, desc: 'Fixes verified' },
        { label: 'Feedback loop speed', score: health?.feedbackLoop || 0, desc: 'Issues fixed' },
        { label: 'Learning effectiveness', score: health?.learningEffectiveness || 0, desc: 'Patterns learned' },
    ]

    return (
        <div className="p-6 bg-slate-900/80 backdrop-blur border border-white/10 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Integration Health
                </h3>
                <div className={`text-xs px-2 py-1 rounded-full border ${hasData ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20'}`}>
                    {isLoading ? 'LOADING...' : hasData ? 'REAL DATA' : 'NO DATA'}
                </div>
            </div>

            {/* Big Score */}
            <div className="text-center mb-6">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`text-6xl font-black ${hasData && (health?.overall || 0) > 0 ? 'text-emerald-400' : 'text-slate-500'}`}
                >
                    {health?.overall || 0}%
                </motion.div>
                <p className="text-xs text-slate-500 mt-1">
                    {hasData ? 'Based on your actual usage' : 'No activity yet'}
                </p>
            </div>

            {/* Metrics */}
            <div className="space-y-3">
                {healthMetrics.map((metric, i) => (
                    <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-400">{metric.label}</span>
                            <span className="text-white font-bold">{metric.score}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${metric.score}%` }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500"
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className={`mt-6 p-3 rounded-lg ${hasData ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-slate-800/50 border border-white/5'}`}>
                <p className="text-xs text-slate-300">
                    {hasData ? '✅ Based on your real usage data.' : '⚠️ Use Healer or Navigator to generate data.'}
                </p>
            </div>
        </div>
    )
}
