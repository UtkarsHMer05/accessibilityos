
'use client'

import { useState, useEffect, Suspense, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { HealerPanel } from '@/components/integration/HealerPanel'
import { NavigatorPanel } from '@/components/integration/NavigatorPanel'
import { DataFlowAnimation } from '@/components/integration/DataFlowAnimation'
import { ActivityStream } from '@/components/integration/ActivityStream'
import { TopBar } from '@/components/integration/TopBar'
import { PlayCircle, Loader2, RefreshCw, Activity } from 'lucide-react'

// Demo HTML code
const DEMO_CODE = `<div class="product-card">
  <img src="shoes.png">
  <span class="title">Sneakers</span>
  <div onclick="buy()">Buy Now</div>
  <a href="#">more</a>
</div>`

interface ActivityItem {
    id: string
    timestamp: Date
    mode: 'healer' | 'navigator' | 'integration'
    action: string
    message: string
}

export default function LiveIntegrationPage() {
    return (
        <Suspense fallback={<LoadingScreen />}>
            <LiveContent />
        </Suspense>
    )
}

function LiveContent() {
    const searchParams = useSearchParams()
    const isDemoMode = searchParams.get('demo') === 'true'

    // Session state
    const [isStarted, setIsStarted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [duration, setDuration] = useState(0)
    const [phase, setPhase] = useState<'idle' | 'healer' | 'transfer' | 'navigator' | 'feedback' | 'complete'>('idle')

    // Healer state
    const [healerStatus, setHealerStatus] = useState<'idle' | 'scanning' | 'fixing' | 'complete'>('idle')
    const [healerProgress, setHealerProgress] = useState(0)
    const [issuesFound, setIssuesFound] = useState(0)
    const [issuesFixed, setIssuesFixed] = useState(0)

    // Navigator state
    const [navigatorStatus, setNavigatorStatus] = useState<'waiting' | 'verifying' | 'complete'>('waiting')
    const [navigatorProgress, setNavigatorProgress] = useState(0)
    const [testsRun, setTestsRun] = useState(0)
    const [testsPass, setTestsPass] = useState(0)
    const [navigatorNarration, setNavigatorNarration] = useState('')
    const [navigatorIssues, setNavigatorIssues] = useState<{ element: string; issue: string }[]>([])

    // Integration state
    const [dataFlowCount, setDataFlowCount] = useState(0)
    const [currentFlow, setCurrentFlow] = useState<'healer-to-navigator' | 'navigator-to-healer' | null>(null)
    const [activities, setActivities] = useState<ActivityItem[]>([])

    const timerRef = useRef<NodeJS.Timeout | null>(null)

    // Add activity log
    const addActivity = useCallback((mode: 'healer' | 'navigator' | 'integration', action: string, message: string) => {
        const newActivity: ActivityItem = {
            id: `${Date.now()}-${Math.random()}`,
            timestamp: new Date(),
            mode,
            action,
            message
        }
        setActivities(prev => [newActivity, ...prev].slice(0, 50))
    }, [])

    // Duration timer
    useEffect(() => {
        if (isStarted && phase !== 'complete') {
            timerRef.current = setInterval(() => {
                setDuration(d => d + 1)
            }, 1000)
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [isStarted, phase])

    // Main demo orchestration
    const runDemo = useCallback(async () => {
        setIsStarted(true)
        setIsLoading(false)
        setDuration(0)
        setActivities([])

        // =========== PHASE 1: HEALER SCANNING ===========
        setPhase('healer')
        setHealerStatus('scanning')
        addActivity('healer', 'scan_started', '🔍 Starting accessibility scan...')

        await animateProgress(setHealerProgress, 0, 30, 1500)
        addActivity('healer', 'analyzing', '📊 Analyzing DOM structure...')

        await animateProgress(setHealerProgress, 30, 50, 1500)
        setIssuesFound(4)
        addActivity('healer', 'issues_found', '⚠️ Found 4 accessibility issues!')

        // =========== PHASE 2: HEALER FIXING ===========
        setHealerStatus('fixing')
        addActivity('healer', 'fix_started', '🛠️ Generating fixes with Gemini Pro...')

        for (let i = 1; i <= 4; i++) {
            await sleep(800)
            setIssuesFixed(i)
            setHealerProgress(50 + (i * 12))
            addActivity('healer', 'fix_applied', `✅ Fixed issue ${i}/4: ${['Missing alt text', 'Non-semantic button', 'Vague link text', 'Missing title'][i - 1]}`)
        }

        setHealerProgress(100)
        setHealerStatus('complete')
        addActivity('healer', 'complete', '✅ Healer complete! Score: 58 → 94')

        await sleep(1000)

        // =========== PHASE 3: DATA TRANSFER ===========
        setPhase('transfer')
        setCurrentFlow('healer-to-navigator')
        setDataFlowCount(1)
        addActivity('integration', 'data_transfer', '🔄 Sending fixed code to Navigator for verification...')

        await sleep(2000)

        // =========== PHASE 4: NAVIGATOR VERIFYING ===========
        setPhase('navigator')
        setNavigatorStatus('verifying')
        setCurrentFlow(null)
        addActivity('navigator', 'verification_started', '👁️ Navigator received code, starting AI verification...')

        // Test 1: Images
        await sleep(1000)
        setNavigatorNarration("I can now hear the image descriptions. The alt text is contextual and helpful.")
        setNavigatorProgress(25)
        setTestsRun(1)
        setTestsPass(1)
        addActivity('navigator', 'test_pass', '✅ Image alt text verified')

        // Test 2: Buttons
        await sleep(1500)
        setNavigatorNarration("Testing button accessibility... I can Tab to the Buy button now.")
        setNavigatorProgress(50)
        setTestsRun(2)
        setTestsPass(2)
        addActivity('navigator', 'test_pass', '✅ Button semantic structure verified')

        // Test 3: Links
        await sleep(1500)
        setNavigatorNarration("Link text is now descriptive. I know where it leads.")
        setNavigatorProgress(75)
        setTestsRun(3)
        setTestsPass(3)
        addActivity('navigator', 'test_pass', '✅ Link text verified')

        // Test 4: Keyboard flow (finds issue)
        await sleep(1500)
        setNavigatorNarration("Testing complete keyboard flow... Wait, the focus indicator is hard to see.")
        setNavigatorProgress(100)
        setTestsRun(4)
        setTestsPass(3)
        setNavigatorIssues([{ element: '#buy-btn', issue: 'Focus indicator needs higher contrast' }])
        addActivity('navigator', 'issue_found', '⚠️ Found issue: Focus indicator needs improvement')

        await sleep(1000)
        setNavigatorStatus('complete')
        addActivity('navigator', 'complete', '✅ Navigator verification complete: 3/4 tests passed')

        // =========== PHASE 5: FEEDBACK LOOP ===========
        await sleep(1500)
        setPhase('feedback')
        setCurrentFlow('navigator-to-healer')
        setDataFlowCount(2)
        addActivity('integration', 'feedback_sent', '🔄 Navigator sending feedback to Healer...')

        await sleep(2000)
        addActivity('healer', 'feedback_received', '📩 Healer received Navigator feedback')
        addActivity('healer', 'refix_applied', '✅ Applied enhanced focus outline CSS')

        await sleep(1500)
        addActivity('navigator', 'retest_pass', '✅ Re-verified: Focus indicator now visible!')

        // =========== COMPLETE ===========
        setPhase('complete')
        setCurrentFlow(null)
        setDataFlowCount(3)
        addActivity('integration', 'complete', '🎉 Integration loop complete! All fixes verified.')

    }, [addActivity])

    // Auto-start in demo mode
    useEffect(() => {
        if (isDemoMode && !isStarted) {
            setIsLoading(true)
            setTimeout(() => {
                runDemo()
            }, 1500)
        }
    }, [isDemoMode, isStarted, runDemo])

    // Start screen
    if (!isStarted && !isLoading) {
        return <StartScreen onStart={() => { setIsLoading(true); setTimeout(runDemo, 1000) }} isLoading={isLoading} />
    }

    // Loading screen
    if (isLoading && !isStarted) {
        return <LoadingScreen />
    }

    return (
        <div className="h-screen flex flex-col bg-[#020617] overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02]" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[150px]" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[150px]" />

            {/* Top Bar */}
            <TopBar
                status={phase === 'complete' ? 'complete' : 'running'}
                healthScore={phase === 'complete' ? 97 : 85 + dataFlowCount * 4}
                duration={duration}
                opsPerSecond={Math.floor(34 + Math.random() * 10)}
            />

            {/* Main Split Screen */}
            <div className="flex-1 grid grid-cols-[45%_10%_45%] gap-2 p-4 overflow-hidden">
                {/* Left: Healer Panel */}
                <HealerPanel
                    status={healerStatus}
                    progress={healerProgress}
                    issuesFound={issuesFound}
                    issuesFixed={issuesFixed}
                    score={healerStatus === 'complete' ? { before: 58, after: 94 } : undefined}
                />

                {/* Center: Data Flow */}
                <DataFlowAnimation
                    dataFlowCount={dataFlowCount}
                    currentFlow={currentFlow}
                    isActive={phase !== 'idle' && phase !== 'complete'}
                />

                {/* Right: Navigator Panel */}
                <NavigatorPanel
                    status={navigatorStatus}
                    progress={navigatorProgress}
                    testsRun={testsRun}
                    testsPass={testsPass}
                    currentNarration={navigatorNarration}
                    issuesFound={navigatorIssues}
                />
            </div>

            {/* Bottom: Activity Stream */}
            <ActivityStream activities={activities} />

            {/* Restart Button */}
            {phase === 'complete' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-52 left-1/2 -translate-x-1/2"
                >
                    <Button
                        onClick={() => {
                            setIsStarted(false)
                            setPhase('idle')
                            setHealerStatus('idle')
                            setHealerProgress(0)
                            setIssuesFound(0)
                            setIssuesFixed(0)
                            setNavigatorStatus('waiting')
                            setNavigatorProgress(0)
                            setTestsRun(0)
                            setTestsPass(0)
                            setNavigatorNarration('')
                            setNavigatorIssues([])
                            setDataFlowCount(0)
                            setCurrentFlow(null)
                            setTimeout(() => runDemo(), 500)
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500"
                    >
                        <RefreshCw className="mr-2 h-4 w-4" /> Replay Demo
                    </Button>
                </motion.div>
            )}
        </div>
    )
}

function StartScreen({ onStart, isLoading }: { onStart: () => void; isLoading: boolean }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02]" />
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center relative z-10"
            >
                <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-blue-500 via-emerald-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl">
                    <Activity className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-5xl font-black text-white mb-4">
                    Live Integration
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-purple-400">
                        Monitor
                    </span>
                </h1>
                <p className="text-xl text-slate-400 mb-10 max-w-lg mx-auto">
                    Watch Healer and Navigator work together in real-time.
                    The ultimate proof of integration.
                </p>
                <Button
                    size="lg"
                    onClick={onStart}
                    disabled={isLoading}
                    className="text-lg px-10 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Initializing...
                        </>
                    ) : (
                        <>
                            <PlayCircle className="mr-2 h-5 w-5" />
                            Start Live Demo
                        </>
                    )}
                </Button>
            </motion.div>
        </div>
    )
}

function LoadingScreen() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
                <Loader2 className="w-12 h-12 text-purple-400" />
            </motion.div>
        </div>
    )
}

// Helper functions
function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function animateProgress(
    setter: (value: number | ((prev: number) => number)) => void,
    from: number,
    to: number,
    duration: number
): Promise<void> {
    return new Promise(resolve => {
        const steps = 20
        const stepDuration = duration / steps
        const increment = (to - from) / steps
        let current = from
        let step = 0

        const interval = setInterval(() => {
            step++
            current += increment
            setter(Math.round(current))

            if (step >= steps) {
                clearInterval(interval)
                setter(to)
                resolve()
            }
        }, stepDuration)
    })
}
