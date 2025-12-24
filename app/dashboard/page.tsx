"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ActivityFeed } from "@/components/shared/ActivityFeed"
import { Card } from "@/components/ui/card"
import { Stethoscope, Navigation, Users, Zap, ArrowUpRight, RefreshCw, AlertCircle } from "lucide-react"
import { IntegrationHealthWidget } from "@/components/integration/IntegrationHealthWidget"

interface DashboardData {
    totalIssues: number
    healerIssues: number
    navigatorIssues: number
    crossLinked: number
    fixRate: number
    activityCount: number
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/integration/analytics')
                const json = await res.json()
                setData({
                    totalIssues: json.metrics.totalIssues,
                    healerIssues: json.metrics.healerIssues,
                    navigatorIssues: json.metrics.navigatorIssues,
                    crossLinked: json.metrics.detectionOverlap,
                    fixRate: json.metrics.fixSuccessRate,
                    activityCount: json.metrics.crossModeOperations
                })
            } catch (err) {
                console.error('Failed to fetch dashboard data:', err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
        const interval = setInterval(fetchData, 5000)
        return () => clearInterval(interval)
    }, [])

    const hasData = data && data.totalIssues > 0

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">System Overview</h1>
                    <p className="text-slate-400">Real-time accessibility intelligence across both modes.</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 ${hasData ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                    <div className={`w-2 h-2 rounded-full ${hasData ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    {hasData ? 'LIVE DATA' : 'NO DATA YET'}
                </div>
            </header>

            {/* 1. KEY METRICS - Real Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    label="Combined Health Score"
                    value={isLoading ? "..." : hasData ? `${data.fixRate}` : "0"}
                    subvalue={hasData ? "Based on fix rate" : "No activity yet"}
                    icon={<ActivityGraph />}
                    color={hasData ? "text-emerald-400" : "text-slate-500"}
                />
                <MetricCard
                    label="Issues Fixed (Healer)"
                    value={isLoading ? "..." : String(data?.healerIssues || 0)}
                    subvalue={hasData ? `${data.fixRate}% fix rate` : "No scans yet"}
                    icon={<Stethoscope className={hasData ? "text-blue-400" : "text-slate-500"} />}
                />
                <MetricCard
                    label="Verified (Navigator)"
                    value={isLoading ? "..." : String(data?.navigatorIssues || 0)}
                    subvalue={hasData ? "Verification tests" : "No tests yet"}
                    icon={<Navigation className={hasData ? "text-purple-400" : "text-slate-500"} />}
                />
                <MetricCard
                    label="Integration Events"
                    value={isLoading ? "..." : String(data?.crossLinked || 0)}
                    subvalue="Cross-mode triggers"
                    icon={<Zap className={hasData ? "text-yellow-400" : "text-slate-500"} />}
                />
            </div>

            {/* 2. MAIN CONTENT AREA */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT: Charts/Deep Dive */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Integration Health Score - Replaces generic insights */}
                    <IntegrationHealthWidget />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <LinkCard
                            title="Launch Healer"
                            desc="Scan and fix code automatically"
                            icon={<Stethoscope />}
                            href="/healer"
                            color="bg-blue-600"
                        />
                        <LinkCard
                            title="Launch Navigator"
                            desc="Simulate blind user experience"
                            icon={<Navigation />}
                            href="/navigator"
                            color="bg-purple-600"
                        />
                    </div>

                    {/* Integration Hub */}
                    <div className="p-6 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-emerald-900/20 rounded-xl border border-white/10">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Zap className="text-emerald-400 w-5 h-5" /> Integration Hub
                        </h3>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <IntegrationLink href="/integration/live" icon="⚡" label="Live View" />
                            <IntegrationLink href="/integration/analytics" icon="📊" label="Analytics" />
                            <IntegrationLink href="/integration/comparison" icon="🔀" label="Comparison" />
                            <IntegrationLink href="/integration/journey" icon="🗺️" label="Issue Journey" />
                        </div>
                    </div>
                </div>

                {/* RIGHT: Activity Feed - Now with fixed height and scroll */}
                <div className="lg:col-span-1 h-[700px] overflow-hidden">
                    <ActivityFeed />
                </div>
            </div>
        </div>
    )
}

function MetricCard({ label, value, subvalue, icon, color }: any) {
    return (
        <Card className="glass-card p-6 border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                {icon}
            </div>
            <div className="relative z-10">
                <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">{label}</div>
                <div className={`text-3xl font-bold ${color || 'text-white'}`}>{value}</div>
                <div className="text-xs text-slate-500 mt-1">{subvalue}</div>
            </div>
        </Card>
    )
}

function LinkCard({ title, desc, icon, href, color }: any) {
    return (
        <a href={href} className="block group">
            <Card className="glass-card p-6 border-white/5 hover:border-white/10 transition-all hover:translate-y-[-2px]">
                <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {title} <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-sm text-slate-400 mt-1">{desc}</p>
            </Card>
        </a>
    )
}

function ActivityGraph() {
    return (
        <svg viewBox="0 0 100 50" className="w-full h-full text-current">
            <path d="M0 25 Q 25 50 50 25 T 100 25" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
    )
}

function IntegrationLink({ href, icon, label }: { href: string, icon: string, label: string }) {
    return (
        <a href={href} className="p-3 bg-slate-800/50 border border-white/5 rounded-lg hover:border-emerald-500/30 hover:bg-slate-800 transition-all text-center group">
            <div className="text-xl mb-1">{icon}</div>
            <div className="text-xs font-medium text-slate-300 group-hover:text-emerald-300">{label}</div>
        </a>
    )
}
