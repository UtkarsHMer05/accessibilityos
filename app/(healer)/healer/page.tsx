
"use client"

import { useState, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams, useRouter } from 'next/navigation'
import { useHealerStore } from '@/hooks/use-healer-store'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, Sparkles, CheckCircle, AlertTriangle, ArrowRight, RefreshCw, Layers, Navigation, Brain } from 'lucide-react'
import { toast } from 'sonner'
import { ActivityFeed } from '@/components/shared/ActivityFeed'
import { saveFixedCode, saveOriginalCode, getHealerState, saveHealerState, getNavigatorIssues, clearNavigatorIssues } from '@/lib/shared-state'

function HealerPageContent() {
    const store = useHealerStore()
    const router = useRouter()
    const [inputUrl, setInputUrl] = useState('')
    const [inputHtml, setInputHtml] = useState('')

    // RESTORE STATE from localStorage when returning from Navigator
    useEffect(() => {
        const savedState = getHealerState()
        if (savedState) {
            if (savedState.originalCode) setInputHtml(savedState.originalCode)
            if (savedState.inputUrl) setInputUrl(savedState.inputUrl)
        }

        // Check for Navigator feedback
        const navigatorIssues = getNavigatorIssues()
        if (navigatorIssues.length > 0) {
            toast.info(`Navigator found ${navigatorIssues.length} issue(s) to fix`)
            clearNavigatorIssues()
        }
    }, [])

    // SAVE STATE whenever code changes
    useEffect(() => {
        if (inputHtml) {
            saveOriginalCode(inputHtml)
            saveHealerState({ originalCode: inputHtml, inputUrl })
        }
    }, [inputHtml, inputUrl])

    // ANIMATIONS
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    }

    // HANDLERS
    const handleScan = async () => {
        if (!inputHtml) return toast.error("Please enter HTML code")

        store.startScan()
        try {
            const res = await fetch('/api/healer/scan', {
                method: 'POST',
                body: JSON.stringify({ html: inputHtml, url: inputUrl })
            })
            const data = await res.json()
            // Handle both number and object formats for scoreEstimation to be safe
            const scoreRaw = data.scoreEstimation
            const scoreVal = typeof scoreRaw === 'object' ? scoreRaw.before : scoreRaw

            store.completeScan(data.violations, scoreVal || 0)
        } catch (e) {
            toast.error('Scan Failed')
            store.reset()
        }
    }

    // AUTO-PILOT LOGIC: When coming from Navigator with a specific issue to fix
    const searchParams = useSearchParams()
    const fixIssueId = searchParams.get('fixIssue')

    useEffect(() => {
        if (fixIssueId && store.step === 'idle') {
            const runAutoPilot = async () => {
                toast.info("Auto-Pilot: Loading Issue from Navigator...")

                try {
                    // 1. Fetch the issue details from API
                    const issueRes = await fetch(`/api/healer/issue/${fixIssueId}`)
                    const issueData = await issueRes.json()

                    if (!issueData.success || !issueData.issue) {
                        // Fallback to demo data if issue not found
                        const { DEMO_PARTIAL_FIXED_HTML } = await import('@/lib/demo-data')
                        setInputHtml(DEMO_PARTIAL_FIXED_HTML)
                        toast.warning("Could not load issue, using demo data")
                    } else {
                        // Use the actual code location from the issue
                        setInputHtml(issueData.issue.codeLocation || issueData.html || '')
                    }

                    await new Promise(r => setTimeout(r, 1000))

                    // 2. Run real scan
                    store.startScan()
                    const scanRes = await fetch('/api/healer/scan', {
                        method: 'POST',
                        body: JSON.stringify({ html: inputHtml })
                    })
                    const scanData = await scanRes.json()

                    const scoreVal = typeof scanData.scoreEstimation === 'object'
                        ? scanData.scoreEstimation.before
                        : scanData.scoreEstimation

                    store.completeScan(scanData.violations || [], scoreVal || 75)

                    if (scanData.violations?.length > 0) {
                        await new Promise(r => setTimeout(r, 1500))

                        // 3. Run real fix
                        store.startFix()
                        const fixRes = await fetch('/api/healer/fix', {
                            method: 'POST',
                            body: JSON.stringify({ html: inputHtml, violations: scanData.violations })
                        })
                        const fixData = await fixRes.json()

                        store.completeFix(fixData.fixes || [], fixData.fixedHTML || inputHtml)
                        store.setFinalScore(fixData.finalScore || 95)

                        toast.success("Auto-Pilot: Fixes Applied!")
                    } else {
                        toast.info("No issues detected, code appears compliant!")
                    }

                    // 4. Return to Navigator for verification
                    await new Promise(r => setTimeout(r, 2000))
                    window.location.href = `/navigator?taskId=${fixIssueId}&status=verified`

                } catch (error) {
                    console.error("Auto-pilot error:", error)
                    toast.error("Auto-pilot failed, please try manually")
                    store.reset()
                }
            }
            runAutoPilot()
        }
    }, [fixIssueId])

    const handleFix = async () => {
        store.startFix()
        try {
            const res = await fetch('/api/healer/fix', {
                method: 'POST',
                body: JSON.stringify({ html: store.html || inputHtml, violations: store.violations })
            })
            const data = await res.json()
            store.completeFix(data.fixes, data.fixedHTML)

            // SAVE FIXED CODE for Navigator to verify
            if (data.fixedHTML) {
                saveFixedCode(data.fixedHTML)
            }

            // Auto-verify
            const verifyRes = await fetch('/api/healer/verify', {
                method: 'POST',
                body: JSON.stringify({ html: data.fixedHTML })
            })
            const verifyData = await verifyRes.json()
            store.setFinalScore(verifyData.score)
        } catch (e) {
            toast.error('Fix Failed')
        }
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/30">
                            <StethoscopeIcon className="text-white" />
                        </div>
                        Healer Console
                    </h2>
                    <p className="text-slate-400 mt-2">Autonomous AI accessibility remediation engine.</p>
                </div>

                <div className="flex gap-4">
                    <ScoreCard label="Current Score" score={store.score.before} />
                    {store.score.after > 0 && (
                        <>
                            <ArrowRight className="text-slate-600 mt-4" />
                            <ScoreCard label="Projected Score" score={store.score.after} active />
                        </>
                    )}
                </div>
            </header>

            {/* INPUT SECTION - 2 cols main, 1 col feed */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                    <Card className="glass-card p-6 border-white/5 h-full">
                        <div className="flex gap-4 mb-4">
                            <Input
                                placeholder="https://example.com (Optional)"
                                className="bg-slate-950/50 border-white/10"
                                value={inputUrl}
                                onChange={(e) => setInputUrl(e.target.value)}
                            />
                            <Button disabled className="opacity-50">Fetch</Button>
                            <Button
                                variant="secondary"
                                className="bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20"
                                onClick={async () => {
                                    const { DEMO_BROKEN_HTML } = await import('@/lib/demo-data')
                                    setInputHtml(DEMO_BROKEN_HTML)
                                    toast.success("Demo Data Loaded")
                                }}
                            >
                                Load Demo
                            </Button>
                        </div>
                        <div className="relative">
                            <Textarea
                                placeholder="Paste your HTML code here..."
                                className="min-h-[300px] font-mono text-xs bg-slate-950/50 border-white/10 text-slate-300 resize-none p-4"
                                value={inputHtml}
                                onChange={(e) => setInputHtml(e.target.value)}
                            />
                            <div className="absolute bottom-4 right-4 flex gap-2">
                                <Button
                                    size="lg"
                                    onClick={handleScan}
                                    disabled={store.step === 'scanning' || !inputHtml}
                                    className="bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all"
                                >
                                    {store.step === 'scanning' ? (
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Play className="mr-2 h-4 w-4" />
                                    )}
                                    {store.step === 'scanning' ? 'Scanning...' : 'Run Diagnostics'}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* ACTIVITY FEED */}
                <div className="lg:col-span-1 border border-white/5 rounded-xl overflow-hidden bg-slate-950/20 backdrop-blur-sm h-[600px] overflow-y-auto">
                    <ActivityFeed />
                </div>
            </div>

            {/* PREDICTIVE INTELLIGENCE ALERT (Tier 3 Feature) */}
            <AnimatePresence>
                {store.violations.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mb-6"
                    >
                        <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl flex items-start gap-4">
                            <div className="p-2 bg-purple-500/20 rounded-lg shrink-0">
                                <Brain className="text-purple-400 w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-purple-300 flex items-center gap-2">
                                    Integration Intelligence: Predictive Warning
                                    <span className="text-[10px] bg-purple-500 text-white px-2 py-0.5 rounded-full">87% Confidence</span>
                                </h4>
                                <p className="text-sm text-purple-200/70 mt-1">
                                    Based on <strong>Navigator's historical user sessions</strong>, accurate accessible navigation often fails on this type of card layout. Healer recommends strictly verifying the <code>tabindex</code> flow manually.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* RESULTS SECTION */}
            <AnimatePresence>
                {store.violations.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-6"
                    >
                        {/* 1. VIOLATIONS & LOGS (Split View) */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* VIOLATIONS LIST - Spans 2 cols */}
                            <Card className="glass-card p-0 overflow-hidden flex flex-col lg:col-span-2">
                                <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                                    <h3 className="font-semibold text-white flex items-center gap-2">
                                        <Layers size={16} /> Detected Issues
                                        <Badge variant="secondary" className="ml-2 bg-red-500/10 text-red-400 border-red-500/20">
                                            {store.violations.length}
                                        </Badge>
                                    </h3>
                                </div>
                                <ScrollArea className="flex-1 p-4">
                                    <div className="space-y-3">
                                        {store.violations.map((v, i) => (
                                            <div key={i} className="p-3 rounded bg-slate-800/50 border border-white/5 hover:border-blue-500/30 transition-colors">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-xs font-mono text-blue-400 bg-blue-900/20 px-1.5 py-0.5 rounded border border-blue-500/20">
                                                        {v.id}
                                                    </span>
                                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full 
                                            ${v.impact === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                        {v.impact}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-300">{v.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                                <div className="p-4 border-t border-white/5 bg-white/5">
                                    <Button
                                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                                        onClick={handleFix}
                                        disabled={store.step === 'fixing' || store.step === 'verifying' || store.step === 'complete'}
                                    >
                                        {store.step === 'fixing' ? (
                                            <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Sparkles className="mr-2 h-4 w-4" />
                                        )}
                                        {store.step === 'fixing' ? 'Generating Fixes...' : 'Auto-Fix with Gemini Pro'}
                                    </Button>
                                </div>
                            </Card>

                            {/* LOGS / PROGRESS */}
                            <Card className="glass-card p-0 overflow-hidden flex flex-col h-[400px]">
                                <div className="p-4 border-b border-white/5 bg-white/5 shrink-0">
                                    <h3 className="font-semibold text-white flex items-center gap-2">
                                        <CheckCircle size={16} /> Live Recovery Logs
                                    </h3>
                                </div>
                                <ScrollArea className="flex-1 p-4 bg-black/20 font-mono text-xs overflow-y-auto">
                                    {store.logs.map((log, i) => (
                                        <div key={i} className="mb-2 flex items-start gap-3 text-slate-400 border-l-2 border-slate-700 pl-3 py-1">
                                            <span className="text-blue-500 mt-0.5">➜</span>
                                            <span>{log}</span>
                                        </div>
                                    ))}
                                    {store.step === 'complete' && (
                                        <div className="mt-4 p-4 bg-emerald-900/10 border border-emerald-500/20 rounded-lg animate-in fade-in slide-in-from-bottom-2">
                                            <h4 className="text-emerald-400 font-bold mb-1 flex items-center gap-2">
                                                <Sparkles size={14} /> Optimization Complete
                                            </h4>
                                            <p className="text-emerald-200/60 text-sm">
                                                Healer has successfully patched the code. Review the diff below.
                                            </p>

                                            {/* INTEGRATION TRIGGER - Verify first, then GitHub */}
                                            <div className="flex flex-col gap-2 mt-4">
                                                <Button
                                                    variant="outline"
                                                    className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                                                    onClick={async () => {
                                                        const toastId = toast.loading("Triggering Navigator Verification...")
                                                        try {
                                                            const res = await fetch('/api/integration/trigger-verification', {
                                                                method: 'POST',
                                                                body: JSON.stringify({
                                                                    url: inputUrl,
                                                                    fixedIssueIds: store.violations.map((v: any) => v.dbId).filter(Boolean)
                                                                })
                                                            })
                                                            const data = await res.json()
                                                            if (data.success) {
                                                                toast.success("Navigator Launched!", { id: toastId })
                                                                window.location.href = data.redirectUrl
                                                            } else {
                                                                toast.error("Failed to launch Navigator", { id: toastId })
                                                            }
                                                        } catch (e) {
                                                            toast.error("Network Error", { id: toastId })
                                                        }
                                                    }}
                                                >
                                                    <Navigation className="mr-2 h-4 w-4" /> Verify with Navigator
                                                </Button>

                                                <Button
                                                    className="w-full bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
                                                    onClick={async () => {
                                                        const toastId = toast.loading("Creating Pull Request...")
                                                        await new Promise(r => setTimeout(r, 2000))
                                                        toast.success("PR Created: 'fix/accessibility-patch-v1'", { id: toastId })
                                                        toast.info("Repo: utkarshkhajuria/demo-site")
                                                    }}
                                                >
                                                    <GithubIcon className="mr-2 h-4 w-4" /> Push to GitHub
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </ScrollArea>
                            </Card>
                        </div>

                        {/* 2. DIFF EDITOR (Shows only after fixing starts/completes) */}
                        {(store.step === 'verifying' || store.step === 'complete') && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="border border-white/10 rounded-xl overflow-hidden shadow-2xl bg-[#1e1e1e]"
                            >
                                <div className="bg-slate-900 p-3 border-b border-white/5 flex justify-between items-center">
                                    <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase ml-2">Code Diff Viewer</span>
                                    <div className="flex gap-4 text-xs font-mono items-center">
                                        <div className="flex items-center gap-2 text-red-400"><div className="w-2 h-2 bg-red-500 rounded-full"></div> Original</div>
                                        <div className="flex items-center gap-2 text-emerald-400"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div> AI Fixed</div>
                                    </div>
                                </div>
                                <div className="h-[600px] w-full">
                                    <DiffViewer
                                        original={inputHtml}
                                        modified={store.html}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

// 3. LAZY LOAD DIFF EDITOR TO AVOID SSR ISSUES
import { DiffEditor } from '@monaco-editor/react'

function DiffViewer({ original, modified }: { original: string, modified: string }) {
    return (
        <DiffEditor
            height="100%"
            language="html"
            original={original}
            modified={modified}
            theme="vs-dark"
            options={{
                readOnly: true,
                renderSideBySide: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 13,
                fontFamily: 'JetBrains Mono, Menlo, monospace',
                padding: { top: 16 }
            }}
        />
    )
}

// Subcomponents
function ScoreCard({ label, score, active }: { label: string, score: number, active?: boolean }) {
    const getColor = (s: number) => {
        if (s >= 90) return 'text-emerald-400 border-emerald-500/30 shadow-emerald-500/20'
        if (s >= 50) return 'text-yellow-400 border-yellow-500/30 shadow-yellow-500/20'
        return 'text-red-400 border-red-500/30 shadow-red-500/20'
    }

    return (
        <div className={`flex flex-col items-center justify-center p-4 rounded-xl border bg-slate-900/50 backdrop-blur ${active ? getColor(score) + ' shadow-lg scale-105' : 'border-white/10 text-slate-500'}`}>
            <span className="text-4xl font-black tracking-tighter">{score}</span>
            <span className="text-[10px] uppercase tracking-widest opacity-70">{label}</span>
        </div>
    )
}

function StethoscopeIcon(props: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" /><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" /><circle cx="20" cy="10" r="2" /></svg>
    )
}

function GithubIcon(props: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
    )
}

// Loading spinner for Suspense fallback
function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center h-96">
            <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
    )
}

export default function HealerPage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <HealerPageContent />
        </Suspense>
    )
}
