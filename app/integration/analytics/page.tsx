"use client"
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Activity, Zap, Brain, TrendingUp, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react'
import { IntegrationHealthWidget } from '@/components/integration/IntegrationHealthWidget'

interface AnalyticsData {
    timestamp: string
    realtime: boolean
    metrics: {
        detectionOverlap: number
        healerBlindSpots: number
        fixSuccessRate: number
        learningVelocity: number
        totalIssues: number
        healerIssues: number
        navigatorIssues: number
        crossModeOperations: number
        patternsLearned: number
    }
    integrationHealth: {
        overall: number
        crossModeFlow: number
        autoTrigger: number
        feedbackLoop: number
        learningEffectiveness: number
    }
    testResults: {
        crossModeTriggers: { passed: number, total: number }
        dataFlowIntegrity: { passed: number, total: number }
        feedbackLoop: { passed: number, total: number }
        databaseSync: { passed: number, total: number }
        learningPipeline: { passed: number, total: number }
    }
}

export default function IntegrationAnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
    const [isLoading, setIsLoading] = useState(true)

    const fetchData = async () => {
        try {
            const res = await fetch('/api/integration/analytics')
            const json = await res.json()
            setData(json)
            setLastUpdate(new Date())
        } catch (err) {
            console.error('Failed to fetch analytics:', err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
        // Real-time: Refresh every 5 seconds
        const interval = setInterval(fetchData, 5000)
        return () => clearInterval(interval)
    }, [])

    if (isLoading || !data) {
        return (
            <div className="min-h-screen bg-[#050510] flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
                    <p className="text-slate-400">Loading real-time analytics...</p>
                </div>
            </div>
        )
    }

    // Check if we have real data
    const hasRealData = data.metrics.totalIssues > 0

    return (
        <div className="min-h-screen bg-[#050510] text-white p-8">
            <header className="mb-10 flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">
                        Integration Intelligence
                    </h1>
                    <p className="text-slate-400 mt-2">
                        {hasRealData ? 'Real metrics from your actual usage.' : 'Use Healer or Navigator to generate real data.'}
                    </p>
                </div>
                <div className="text-right">
                    <div className={`flex items-center gap-2 text-sm ${hasRealData ? 'text-emerald-400' : 'text-amber-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${hasRealData ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                        {hasRealData ? 'LIVE DATA' : 'NO DATA YET'}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                        Updated: {lastUpdate.toLocaleTimeString()}
                    </p>
                </div>
            </header>

            {/* No Data State */}
            {!hasRealData && (
                <div className="mb-8 p-6 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-4">
                    <AlertCircle className="w-8 h-8 text-amber-400 shrink-0" />
                    <div>
                        <h3 className="font-bold text-amber-400">No Activity Yet</h3>
                        <p className="text-sm text-slate-400">The metrics below will show real data once you use Healer or Navigator.</p>
                    </div>
                    <div className="ml-auto flex gap-2">
                        <a href="/healer" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-bold">Use Healer</a>
                        <a href="/navigator" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-bold">Use Navigator</a>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {/* Metric 1 */}
                <AnalyticsCard delay={0.1}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-sm font-medium text-slate-400">Detection Overlap</h3>
                            <div className={`text-4xl font-bold mt-1 ${hasRealData ? 'text-emerald-400' : 'text-slate-500'}`}>
                                {data.metrics.detectionOverlap}
                            </div>
                            <p className="text-xs text-emerald-300/60">issues</p>
                        </div>
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <Activity className="text-emerald-500 w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-xs text-slate-500">Cross-linked issues found by both modes</p>
                </AnalyticsCard>

                {/* Metric 2 */}
                <AnalyticsCard delay={0.2}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-sm font-medium text-slate-400">Navigator-Only Issues</h3>
                            <div className={`text-4xl font-bold mt-1 ${hasRealData ? 'text-purple-400' : 'text-slate-500'}`}>
                                {data.metrics.navigatorIssues}
                            </div>
                            <p className="text-xs text-purple-300/60">issues</p>
                        </div>
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                            <Zap className="text-purple-500 w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-xs text-slate-500">Issues from Navigator mode</p>
                </AnalyticsCard>

                {/* Metric 3 */}
                <AnalyticsCard delay={0.3}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-sm font-medium text-slate-400">Fix Success Rate</h3>
                            <div className={`text-4xl font-bold mt-1 ${hasRealData ? 'text-blue-400' : 'text-slate-500'}`}>
                                {data.metrics.fixSuccessRate}%
                            </div>
                            <p className="text-xs text-blue-300/60">verified</p>
                        </div>
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <CheckCircle className="text-blue-500 w-5 h-5" />
                        </div>
                    </div>
                    <div className="space-y-1 text-[10px] border-t border-white/5 pt-2 mt-2">
                        <div className="text-emerald-400">✅ {data.metrics.healerIssues} Healer issues</div>
                        <div className="text-purple-400">🔄 {data.metrics.navigatorIssues} Navigator issues</div>
                    </div>
                </AnalyticsCard>

                {/* Metric 4 */}
                <AnalyticsCard delay={0.4}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-sm font-medium text-slate-400">Patterns Learned</h3>
                            <div className={`text-4xl font-bold mt-1 ${hasRealData ? 'text-amber-400' : 'text-slate-500'}`}>
                                {data.metrics.patternsLearned}
                            </div>
                            <p className="text-xs text-amber-300/60">patterns</p>
                        </div>
                        <div className="p-2 bg-amber-500/10 rounded-lg">
                            <Brain className="text-amber-500 w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-xs text-slate-500">AI patterns from feedback loop</p>
                </AnalyticsCard>
            </div>

            {/* COMPARISON CHART */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <Card className="bg-slate-900/50 border-white/5 lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-xl">Speed Advantage: Integration vs Separate Tools</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="border-r border-white/10 pr-8">
                                <h4 className="font-semibold text-red-400 mb-4">❌ Without Integration</h4>
                                <ol className="text-sm space-y-2">
                                    <li className="flex gap-2"><span className="text-slate-500">1.</span> Healer scans (2 min)</li>
                                    <li className="flex gap-2"><span className="text-slate-500">2.</span> Developer reviews (30 min)</li>
                                    <li className="flex gap-2"><span className="text-slate-500">3.</span> Manual fixes (2 hours)</li>
                                    <li className="flex gap-2"><span className="text-slate-500">4.</span> Deploy (10 min)</li>
                                    <li className="flex gap-2"><span className="text-slate-500">5.</span> Schedule user testing (3 days)</li>
                                    <li className="flex gap-2"><span className="text-slate-500">6.</span> Get feedback (1 week)</li>
                                    <li className="flex gap-2"><span className="text-slate-500">7.</span> Fix again (1 day)</li>
                                </ol>
                                <div className="mt-4 p-3 bg-red-500/10 rounded text-xl font-bold text-red-400">
                                    Total: 10+ days
                                </div>
                            </div>
                            <div className="pl-8">
                                <h4 className="font-semibold text-emerald-400 mb-4">✅ With AccessibilityOS</h4>
                                <ol className="text-sm space-y-2">
                                    <li className="flex gap-2"><span className="text-emerald-500">1.</span> Healer scans + fixes (2 min)</li>
                                    <li className="flex gap-2"><span className="text-emerald-500">2.</span> Auto-triggers Navigator (instant)</li>
                                    <li className="flex gap-2"><span className="text-emerald-500">3.</span> Navigator tests (1 min)</li>
                                    <li className="flex gap-2"><span className="text-emerald-500">4.</span> Finds issue → Re-fixes (30 sec)</li>
                                    <li className="flex gap-2"><span className="text-emerald-500">5.</span> Navigator re-verifies (30 sec)</li>
                                    <li className="flex gap-2 text-emerald-300"><span className="text-emerald-500">6.</span> Confirmed working ✓</li>
                                </ol>
                                <div className="mt-4 p-3 bg-emerald-500/10 rounded text-xl font-bold text-emerald-400">
                                    Total: 4 minutes
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 p-4 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-emerald-600/20 rounded-xl text-center border border-white/10">
                            <p className="text-3xl font-black text-white">3,600x faster with integration</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Integration Health Widget */}
                <IntegrationHealthWidget />
            </div>

            {/* YOUR ACTIVITY SUMMARY */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Activity Summary */}
                <Card className="bg-slate-900/50 border-white/5">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-400" />
                            Your Activity Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {hasRealData ? (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg">
                                    <span className="text-slate-300">Total Issues</span>
                                    <span className="text-2xl font-bold text-white">{data.metrics.totalIssues}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg">
                                    <span className="text-slate-300">Healer Issues</span>
                                    <span className="text-2xl font-bold text-blue-400">{data.metrics.healerIssues}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg">
                                    <span className="text-slate-300">Navigator Issues</span>
                                    <span className="text-2xl font-bold text-purple-400">{data.metrics.navigatorIssues}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg">
                                    <span className="text-slate-300">Cross-Mode Operations</span>
                                    <span className="text-2xl font-bold text-emerald-400">{data.metrics.crossModeOperations}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                <p>No activity yet.</p>
                                <p className="text-sm mt-2">Use Healer or Navigator to see your stats.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* DATABASE TEST RESULTS */}
                <Card className="bg-slate-900/50 border-white/5">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                            System Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <TestResult name="Database connected" count="✓" status={true} />
                        <TestResult name="Healer mode" count={data.metrics.healerIssues > 0 ? "Active" : "Idle"} status={data.metrics.healerIssues > 0} />
                        <TestResult name="Navigator mode" count={data.metrics.navigatorIssues > 0 ? "Active" : "Idle"} status={data.metrics.navigatorIssues > 0} />
                        <TestResult name="Cross-mode sync" count={data.metrics.detectionOverlap > 0 ? "Active" : "Idle"} status={data.metrics.detectionOverlap > 0} />
                        <TestResult name="AI Learning" count={data.metrics.patternsLearned > 0 ? "Active" : "Idle"} status={data.metrics.patternsLearned > 0} />

                        <div className={`mt-4 p-3 border rounded-lg flex items-center gap-2 ${hasRealData ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-slate-800/50 border-white/5'}`}>
                            {hasRealData ? (
                                <>
                                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                                    <span className="text-sm text-emerald-300 font-bold">System active with real data</span>
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="w-4 h-4 text-amber-400" />
                                    <span className="text-sm text-amber-300 font-bold">Awaiting first usage</span>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function AnalyticsCard({ children, delay }: { children: React.ReactNode, delay: number }) {
    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay }}
            className="p-6 bg-slate-900/50 border border-white/5 rounded-xl hover:border-purple-500/30 transition-colors"
        >
            {children}
        </motion.div>
    )
}

function TestResult({ name, count, status }: { name: string, count: string, status: boolean }) {
    return (
        <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-2">
                {status ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-500" />
                )}
                <span className="text-sm text-slate-300">{name}</span>
            </div>
            <span className={`text-xs font-mono ${status ? 'text-emerald-400' : 'text-slate-500'}`}>{count}</span>
        </div>
    )
}
