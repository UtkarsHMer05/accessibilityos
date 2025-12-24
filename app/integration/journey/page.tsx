"use client"
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, AlertTriangle, RefreshCw, Activity, AlertCircle } from 'lucide-react'

interface TimelineItem {
    mode: string
    icon: string
    time: string
    title: string
    description: string
    status: string
    code?: { before: string, after: string } | null
}

interface HealthData {
    overall: number
    crossModeFlow: number
    autoTrigger: number
    feedbackLoop: number
    learningEffectiveness: number
}

interface JourneyData {
    hasData: boolean
    timeline: TimelineItem[]
    health: HealthData
    stats: {
        totalIssues: number
        fixedIssues: number
        verifiedIssues: number
        crossLinked: number
    }
}

export default function IntegrationJourneyPage() {
    const [data, setData] = useState<JourneyData | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/integration/journey')
                const json = await res.json()
                setData(json)
            } catch (err) {
                console.error('Failed to fetch journey data:', err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
        const interval = setInterval(fetchData, 5000)
        return () => clearInterval(interval)
    }, [])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#050510] flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#050510] text-white p-8">
            <header className="mb-10 flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">
                        Issue Lifecycle Journey
                    </h1>
                    <p className="text-slate-400 mt-2">
                        {data?.hasData ? 'Real issues from your Healer & Navigator sessions.' : 'Use Healer or Navigator to see real issue journeys.'}
                    </p>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${data?.hasData ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                    {data?.hasData ? 'REAL DATA' : 'NO DATA YET'}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Timeline */}
                <div className="lg:col-span-2">
                    {!data?.hasData ? (
                        <div className="p-12 bg-slate-900/50 border border-white/10 rounded-2xl text-center">
                            <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                            <h2 className="text-xl font-bold mb-2">No Issues Yet</h2>
                            <p className="text-slate-400 mb-6">Use Healer to scan some HTML and create real accessibility issues.</p>
                            <a href="/healer" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold inline-block">
                                🛠️ Go to Healer
                            </a>
                        </div>
                    ) : (
                        <IssueTimeline timeline={data.timeline} />
                    )}
                </div>

                {/* Health Widget */}
                <div>
                    <IntegrationHealthWidget health={data?.health} hasData={data?.hasData || false} stats={data?.stats} />
                </div>
            </div>
        </div>
    )
}

function IssueTimeline({ timeline }: { timeline: TimelineItem[] }) {
    return (
        <div className="space-y-0 relative">
            <div className="absolute left-6 top-8 bottom-8 w-[2px] bg-gradient-to-b from-blue-500 via-purple-500 to-emerald-500" />

            {timeline.map((step, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className="relative flex gap-4 py-4"
                >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg z-10 border-2 shrink-0
                        ${step.mode === 'healer' ? 'bg-blue-950 border-blue-500' : ''}
                        ${step.mode === 'navigator' ? 'bg-purple-950 border-purple-500' : ''}
                        ${step.mode === 'integration' ? 'bg-amber-950 border-amber-500' : ''}
                    `}>
                        {step.icon}
                    </div>

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
                    </div>
                </motion.div>
            ))}
        </div>
    )
}

function IntegrationHealthWidget({ health, hasData, stats }: { health?: HealthData, hasData: boolean, stats?: any }) {
    const healthMetrics = [
        { label: 'Cross-mode data flow', score: health?.crossModeFlow || 0, desc: 'Issues linked between modes' },
        { label: 'Auto-trigger reliability', score: health?.autoTrigger || 0, desc: 'Verified after fix' },
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
                    {hasData ? 'REAL DATA' : 'NO DATA'}
                </div>
            </div>

            <div className="text-center mb-6">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`text-6xl font-black ${hasData && (health?.overall || 0) > 0 ? 'text-emerald-400' : 'text-slate-500'}`}
                >
                    {health?.overall || 0}%
                </motion.div>
                <p className="text-xs text-slate-500 mt-1">
                    {hasData ? 'Based on your actual usage' : 'Use the tools to generate data'}
                </p>
            </div>

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

            {hasData && stats && (
                <div className="mt-6 p-3 bg-slate-800/50 border border-white/5 rounded-lg text-xs">
                    <div className="grid grid-cols-2 gap-2">
                        <div>Total: <span className="text-white font-bold">{stats.totalIssues}</span></div>
                        <div>Fixed: <span className="text-emerald-400 font-bold">{stats.fixedIssues}</span></div>
                        <div>Verified: <span className="text-purple-400 font-bold">{stats.verifiedIssues}</span></div>
                        <div>Linked: <span className="text-blue-400 font-bold">{stats.crossLinked}</span></div>
                    </div>
                </div>
            )}

            <div className={`mt-6 p-3 rounded-lg ${hasData ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-slate-800/50 border border-white/5'}`}>
                <p className="text-xs text-slate-300">
                    {hasData ? '✅ Data based on your real usage.' : '⚠️ No activity yet. Use Healer or Navigator.'}
                </p>
            </div>
        </div>
    )
}
