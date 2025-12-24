
"use client"

import { useState, useEffect, useRef, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Navigation, Mic, PlayCircle, Loader2, Stethoscope, CheckCircle,
    AlertTriangle, Eye, Keyboard, RefreshCw, Code, ArrowLeft, Wrench
} from 'lucide-react'
import { ActivityFeed } from '@/components/shared/ActivityFeed'
import { getFixedCode, getOriginalCode, saveNavigatorIssues, saveFixedCode } from '@/lib/shared-state'

interface VerificationStep {
    id: string
    name: string
    description: string
    status: 'pending' | 'running' | 'passed' | 'failed'
}

interface VerifiedFix {
    element: string
    fix: string
    quality: 'excellent' | 'good' | 'needs_improvement'
    feedback: string
}

interface IssueFound {
    type: string
    severity: 'low' | 'medium' | 'high'
    description: string
    element: string
}

function NavigatorContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const taskId = searchParams.get('taskId')
    const fromHealer = searchParams.get('fromHealer') === 'true'

    const [phase, setPhase] = useState<'no-code' | 'ready' | 'running' | 'complete'>('no-code')
    const [currentStep, setCurrentStep] = useState(0)
    const [narration, setNarration] = useState<{ time: Date; text: string; type: 'info' | 'success' | 'warning' }[]>([])
    const [verifiedFixes, setVerifiedFixes] = useState<VerifiedFix[]>([])
    const [issuesFound, setIssuesFound] = useState<IssueFound[]>([])
    const [overallScore, setOverallScore] = useState(0)
    const [codeToVerify, setCodeToVerify] = useState<string>('')
    const [isLoading, setIsLoading] = useState(true)
    const narrationRef = useRef<HTMLDivElement>(null)

    const [steps, setSteps] = useState<VerificationStep[]>([])

    // Load code from Healer on mount
    useEffect(() => {
        const fixedCode = getFixedCode()
        if (fixedCode) {
            setCodeToVerify(fixedCode)
            setPhase('ready')
        } else {
            setPhase('no-code')
        }
        setIsLoading(false)
    }, [])

    // Auto-scroll narration
    useEffect(() => {
        if (narrationRef.current) {
            narrationRef.current.scrollTop = narrationRef.current.scrollHeight
        }
    }, [narration])

    // Speak narration
    const speak = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel()
            const utterance = new SpeechSynthesisUtterance(text)
            utterance.rate = 1.1
            window.speechSynthesis.speak(utterance)
        }
    }

    const addNarration = (text: string, type: 'info' | 'success' | 'warning' = 'info') => {
        setNarration(prev => [...prev, { time: new Date(), text, type }])
        speak(text)
    }

    // Run verification with real Gemini API
    const runVerification = async () => {
        setPhase('running')
        setNarration([])
        setVerifiedFixes([])
        setIssuesFound([])
        setSteps([]) // Clear previous

        addNarration("Starting accessibility verification. I'm Alex, your AI tester.")
        await new Promise(r => setTimeout(r, 1000))

        addNarration("Analyzing your code to generate custom test scenarios...")

        // 1. GENERATE TESTS
        let currentTests: VerificationStep[] = []
        try {
            const genRes = await fetch('/api/navigator/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: codeToVerify, mode: 'generate' })
            })
            const genData = await genRes.json()

            if (genData.tests) {
                currentTests = genData.tests.map((t: any) => ({ ...t, status: 'pending' }))
                setSteps(currentTests)
                addNarration(`I've generated ${currentTests.length} specific test scenarios for this code.`, 'success')
            } else {
                throw new Error('No tests generated')
            }
        } catch (e) {
            console.error(e)
            addNarration("Could not generate custom tests. Falling back to standard checks.", 'warning')
            currentTests = [
                { id: 'structure', name: 'HTML Structure', description: 'Verify semantic structure', status: 'pending' },
                { id: 'interactive', name: 'Interactive Elements', description: 'Check buttons and links', status: 'pending' }
            ]
            setSteps(currentTests)
        }

        // Wait for rate limit (4s)
        await new Promise(r => setTimeout(r, 4000))

        // 2. RUN TESTS LOOP
        let failuresCount = 0
        for (let i = 0; i < currentTests.length; i++) {
            const test = currentTests[i]

            // Update UI to running
            setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'running' } : s))
            setCurrentStep(i)
            addNarration(`Running Test ${i + 1}: ${test.name}...`)

            // Verify Call
            try {
                const res = await fetch('/api/navigator/verify-code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        code: codeToVerify,
                        mode: 'verify',
                        testCase: test
                    })
                })
                const result = await res.json()

                if (result.passed) {
                    addNarration(result.feedback || "Test passed successfully.", 'success')
                    setVerifiedFixes(prev => [...prev, {
                        element: result.element || 'page',
                        fix: test.name,
                        quality: result.quality || 'excellent',
                        feedback: result.feedback || 'Verified'
                    }])
                    setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'passed' } : s))
                } else {
                    failuresCount++
                    addNarration(result.feedback || "Issues found.", 'warning')
                    setIssuesFound(prev => [...prev, {
                        type: test.id,
                        severity: result.severity || 'medium',
                        description: result.feedback || 'Issue details not provided',
                        element: result.element || 'element'
                    }])
                    setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'failed' } : s))
                }
            } catch (e) {
                failuresCount++
                addNarration("Verification step failed due to network error.", 'warning')
                setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'failed' } : s))
            }

            // Rate Limit Wait (8s) between tests, but not after the last one
            if (i < currentTests.length - 1) {
                await new Promise(r => setTimeout(r, 8000))
            }
        }

        // Final Summary
        await new Promise(r => setTimeout(r, 1000))

        const score = failuresCount === 0 ? 100 : Math.max(60, 100 - (failuresCount * 20))
        setOverallScore(score)

        addNarration(
            `Verification complete! ${currentTests.length - failuresCount} fixes verified. ${failuresCount > 0 ? failuresCount + ' issues need attention.' : 'No new issues detected!'}`,
            failuresCount > 0 ? 'warning' : 'success'
        )

        setPhase('complete')

        // Log to activity
        try {
            await fetch('/api/activity/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode: 'navigator',
                    action: 'verification_completed',
                    details: { verifiedFixes: currentTests.length - failuresCount, issuesFound: failuresCount, score }
                })
            })
        } catch (e) { console.log('Activity log failed') }
    }

    // AUTOMATED LOOP: Auto-fix with Healer and re-verify
    const [isAutoFixing, setIsAutoFixing] = useState(false)
    const [loopCount, setLoopCount] = useState(0)

    const autoFixAndReVerify = async () => {
        if (issuesFound.length === 0) {
            // No issues, just go back to Healer
            router.push('/healer')
            return
        }

        setIsAutoFixing(true)
        setPhase('running')
        setNarration([])

        addNarration(`🔄 Starting automated fix loop (Iteration ${loopCount + 1})...`)
        await new Promise(r => setTimeout(r, 1000))

        addNarration(`Sending ${issuesFound.length} issues to Healer AI for automatic fixing...`)

        try {
            // Call the auto-fix API
            const response = await fetch('/api/healer/auto-fix-loop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: codeToVerify,
                    issues: issuesFound.map(i => ({
                        element: i.element,
                        description: i.description,
                        severity: i.severity
                    }))
                })
            })

            const result = await response.json()

            if (result.success && result.fixedHTML) {
                addNarration(`✅ Healer fixed ${result.issuesFixed} issues automatically!`, 'success')
                await new Promise(r => setTimeout(r, 1500))

                // Save the new fixed code
                saveFixedCode(result.fixedHTML)
                setCodeToVerify(result.fixedHTML)

                // Increment loop counter
                setLoopCount(prev => prev + 1)

                addNarration(`🔄 Re-running Navigator verification on fixed code...`, 'info')
                await new Promise(r => setTimeout(r, 1000))

                // Reset state and restart verification
                setIsAutoFixing(false)
                setVerifiedFixes([])
                setIssuesFound([])
                setSteps([])

                // Automatically restart verification with new code
                // We call runVerification but need to use the new code
                // Since we updated codeToVerify state, we need a slight delay for React to update
                await new Promise(r => setTimeout(r, 500))
                runVerification()

            } else {
                addNarration(`⚠️ Auto-fix failed: ${result.error || 'Unknown error'}`, 'warning')
                setIsAutoFixing(false)
                setPhase('complete')
            }

        } catch (error: any) {
            addNarration(`❌ Auto-fix loop error: ${error.message}`, 'warning')
            setIsAutoFixing(false)
            setPhase('complete')
        }
    }

    // Legacy: Send to Healer manually (for Back button)
    const sendToHealer = async () => {
        if (issuesFound.length > 0) {
            saveNavigatorIssues(issuesFound.map(i => ({
                element: i.element,
                issue: i.description,
                severity: i.severity
            })))
        }
        router.push('/healer?fromNavigator=true')
    }

    // Go back to Healer to add code
    const goToHealer = () => {
        router.push('/healer')
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-6">
                {/* Header */}
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-600 rounded-lg shadow-lg shadow-purple-500/30">
                            <Navigation className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Navigator Verification</h1>
                            <p className="text-slate-400">AI-powered accessibility testing from a user perspective</p>
                        </div>
                    </div>
                    {taskId && <Badge variant="secondary" className="bg-blue-500/10 text-blue-400">Task: {taskId.slice(0, 8)}...</Badge>}
                </header>

                {/* Main Card */}
                <Card className="glass-card border-purple-500/20 overflow-hidden">
                    {/* No Code State */}
                    {phase === 'no-code' && (
                        <div className="p-8 text-center">
                            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-600">
                                <Code className="w-10 h-10 text-slate-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">No Code to Verify</h2>
                            <p className="text-slate-400 mb-6 max-w-md mx-auto">
                                Navigator needs fixed code from Healer to verify. Go to Healer first, scan and fix your code, then click "Verify with Navigator".
                            </p>
                            <Button onClick={goToHealer} className="bg-blue-600 hover:bg-blue-500">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Go to Healer
                            </Button>
                        </div>
                    )}

                    {/* Ready State */}
                    {phase === 'ready' && (
                        <div className="p-8">
                            <div className="text-center mb-6">
                                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-purple-500/10 flex items-center justify-center border-2 border-purple-500/30">
                                    <Eye className="w-10 h-10 text-purple-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">Ready to Verify</h2>
                                <p className="text-slate-400 mb-4 max-w-md mx-auto">
                                    Navigator will test Healer's fixes using AI to simulate how disabled users experience your page.
                                </p>
                            </div>

                            {/* Code Preview */}
                            <div className="mb-6 p-4 bg-slate-950 rounded-lg border border-white/10">
                                <div className="flex items-center gap-2 mb-2 text-xs text-slate-500">
                                    <Code className="w-3 h-3" /> Code from Healer
                                </div>
                                <pre className="text-xs text-slate-400 overflow-auto max-h-32 font-mono">
                                    {codeToVerify.slice(0, 500)}{codeToVerify.length > 500 ? '...' : ''}
                                </pre>
                            </div>

                            <div className="space-y-3 text-left max-w-sm mx-auto mb-8">
                                {steps.length > 0 ? steps.map((step, i) => (
                                    <div key={step.id} className="flex items-center gap-3 text-sm text-slate-400">
                                        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs">{i + 1}</div>
                                        <span>{step.name}</span>
                                    </div>
                                )) : (
                                    <div className="text-center p-4 bg-slate-900/50 rounded-lg border border-slate-800">
                                        <div className="flex justify-center mb-2">
                                            <Wrench className="w-5 h-5 text-purple-500/50" />
                                        </div>
                                        <p className="text-xs text-slate-400">
                                            <span className="text-purple-400 font-semibold">AI Agent</span> will analyze code and generate custom test scenarios.
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="text-center">
                                <Button
                                    size="lg"
                                    className="bg-purple-600 hover:bg-purple-500"
                                    onClick={runVerification}
                                >
                                    <PlayCircle className="mr-2" /> Start AI Verification
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Running State */}
                    {phase === 'running' && (
                        <div className="grid grid-cols-2 divide-x divide-white/10">
                            {/* Left: Progress */}
                            <div className="p-6 space-y-4">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <Keyboard className="w-4 h-4" /> Test Scenarios
                                </h3>
                                {steps.map((step, i) => (
                                    <motion.div
                                        key={step.id}
                                        className={`p-3 rounded-lg border ${step.status === 'running' ? 'bg-purple-500/10 border-purple-500/30' :
                                            step.status === 'passed' ? 'bg-emerald-500/10 border-emerald-500/30' :
                                                step.status === 'failed' ? 'bg-red-500/10 border-red-500/30' :
                                                    'bg-slate-800/50 border-white/5'
                                            }`}
                                        animate={step.status === 'running' ? { scale: [1, 1.02, 1] } : {}}
                                        transition={{ repeat: Infinity, duration: 1 }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {step.status === 'running' && <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />}
                                                {step.status === 'passed' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                                                {step.status === 'pending' && <div className="w-4 h-4 rounded-full bg-slate-600" />}
                                                <span className="font-medium text-white text-sm">{step.name}</span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1 ml-6">{step.description}</p>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Right: Narration */}
                            <div className="p-6 bg-slate-950/50">
                                <h3 className="font-bold text-white flex items-center gap-2 mb-4">
                                    <Mic className="w-4 h-4 text-purple-400" /> AI Narration
                                </h3>
                                <div ref={narrationRef} className="h-[300px] overflow-y-auto space-y-2 scrollbar-hide">
                                    <AnimatePresence>
                                        {narration.map((item, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className={`p-2 rounded text-sm ${item.type === 'success' ? 'bg-emerald-500/10 text-emerald-300' :
                                                    item.type === 'warning' ? 'bg-yellow-500/10 text-yellow-300' :
                                                        'bg-white/5 text-slate-300'
                                                    }`}
                                            >
                                                <span className="text-[10px] text-slate-500 mr-2">{item.time.toLocaleTimeString()}</span>
                                                {item.text}
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Complete State */}
                    {phase === 'complete' && (
                        <div className="p-6 space-y-6">
                            {/* Score */}
                            <div className="text-center">
                                {loopCount > 0 && (
                                    <Badge className="mb-4 bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                        🔄 Auto-Fix Loop: Iteration {loopCount}
                                    </Badge>
                                )}
                                <div className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center border-4 ${overallScore >= 90 ? 'bg-emerald-500/20 border-emerald-500' :
                                    overallScore >= 70 ? 'bg-yellow-500/20 border-yellow-500' :
                                        'bg-red-500/20 border-red-500'
                                    }`}>
                                    <span className="text-3xl font-bold text-white">{overallScore}</span>
                                </div>
                                <h2 className="text-2xl font-bold text-white">Verification Complete</h2>
                                <p className="text-slate-400">
                                    {verifiedFixes.length} fixes verified • {issuesFound.length} issues found
                                </p>
                            </div>

                            {/* Verified Fixes */}
                            {verifiedFixes.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="font-bold text-emerald-400 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" /> Verified Fixes ({verifiedFixes.length})
                                    </h3>
                                    {verifiedFixes.map((fix, i) => (
                                        <div key={i} className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="text-white font-mono text-sm">{fix.element}</span>
                                                    <p className="text-xs text-slate-400">{fix.feedback}</p>
                                                </div>
                                                <Badge className={
                                                    fix.quality === 'excellent' ? 'bg-emerald-500' :
                                                        fix.quality === 'good' ? 'bg-blue-500' : 'bg-yellow-500'
                                                }>{fix.quality}</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Issues Found */}
                            {issuesFound.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="font-bold text-yellow-400 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" /> Issues Found ({issuesFound.length})
                                    </h3>
                                    {issuesFound.map((issue, i) => (
                                        <div key={i} className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="text-white font-medium text-sm">{issue.description}</span>
                                                    <p className="text-xs text-slate-400 mt-1">Element: {issue.element}</p>
                                                </div>
                                                <Badge className="bg-yellow-500">{issue.severity}</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 justify-center pt-4">
                                <Button variant="outline" onClick={() => { setPhase('ready'); setNarration([]); setVerifiedFixes([]); setIssuesFound([]); setSteps(prev => prev.map(s => ({ ...s, status: 'pending' }))); }}>
                                    <RefreshCw className="mr-2 h-4 w-4" /> Re-verify
                                </Button>
                                {issuesFound.length > 0 ? (
                                    <Button
                                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
                                        onClick={autoFixAndReVerify}
                                        disabled={isAutoFixing}
                                    >
                                        {isAutoFixing ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Stethoscope className="mr-2 h-4 w-4" />
                                        )}
                                        {isAutoFixing ? 'Auto-Fixing...' : '🔄 Auto-Fix & Re-Verify'}
                                    </Button>
                                ) : (
                                    <Button className="bg-blue-600 hover:bg-blue-500" onClick={sendToHealer}>
                                        <Stethoscope className="mr-2 h-4 w-4" />
                                        Back to Healer
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
                <ActivityFeed />
            </div>
        </div>
    )
}

export default function NavigatorPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 text-purple-400 animate-spin" /></div>}>
            <NavigatorContent />
        </Suspense>
    )
}
