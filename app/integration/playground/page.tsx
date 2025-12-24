
'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { Loader2, Play, RotateCcw, Download, Code, Settings, Zap, Eye, Wrench, FlaskConical, Volume2, VolumeX } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Dynamic import for Monaco Editor (client-side only)
const Editor = dynamic(() => import('@monaco-editor/react').then(mod => mod.default), {
    ssr: false,
    loading: () => <div className="h-[400px] bg-slate-900 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-400" /></div>
})

const DiffEditor = dynamic(() => import('@monaco-editor/react').then(mod => mod.DiffEditor), {
    ssr: false,
    loading: () => <div className="h-[400px] bg-slate-900 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-emerald-400" /></div>
})

const EXAMPLE_ECOMMERCE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Product Page</title>
</head>
<body>
  <header>
    <img src="logo.png">
    <nav>
      <a href="#">Shop</a>
      <a href="#">Cart</a>
    </nav>
  </header>
  
  <main>
    <img src="headphones.jpg">
    <h1>Wireless Headphones</h1>
    <p>Premium noise-canceling headphones</p>
    <span class="price">$299</span>
    
    <div onclick="addToCart()">Add to Cart</div>
    <div onclick="buyNow()">Buy Now</div>
    
    <form>
      <input type="email" placeholder="Email for updates">
      <button>Subscribe</button>
    </form>
  </main>
</body>
</html>`

const EXAMPLE_LOGIN = `<!DOCTYPE html>
<html>
<head><title>Login</title></head>
<body>
  <div class="login-form">
    <img src="brand.png">
    <h2>Welcome Back</h2>
    
    <input type="text" placeholder="Username">
    <input type="password" placeholder="Password">
    
    <div onclick="login()">Sign In</div>
    <div onclick="forgot()">Forgot Password?</div>
    
    <a href="#">Create Account</a>
  </div>
</body>
</html>`

const EXAMPLE_BLOG = `<!DOCTYPE html>
<html>
<head><title>Blog Post</title></head>
<body>
  <article>
    <img src="hero.jpg">
    <h1>Tech Innovation in 2024</h1>
    <p>By John Doe</p>
    
    <img src="chart.png">
    <p>The tech industry continues to evolve...</p>
    
    <div>
      <span onclick="like()">👍 Like</span>
      <span onclick="share()">Share</span>
    </div>
    
    <form>
      <textarea placeholder="Add a comment"></textarea>
      <div onclick="submit()">Post Comment</div>
    </form>
  </article>
</body>
</html>`

interface SessionState {
    status: string
    healerStatus: string
    healerProgress: number
    healerIssuesFound: number
    healerIssuesFixed: number
    navigatorStatus: string
    navigatorProgress: number
    navigatorTestsRun: number
    navigatorTestsPass: number
    navigatorTests?: Array<{ name: string, status: 'pending' | 'running' | 'passed' | 'failed', evidence?: string }>
    dataFlowCount: number
    duration: number
    fixedCode?: string
    beforeScore?: number
    afterScore?: number
}

interface Activity {
    id: string
    mode: string
    action: string
    message: string
    timestamp: string
}

export default function PlaygroundPage() {
    const [pageState, setPageState] = useState<'input' | 'processing' | 'complete'>('input')
    const [htmlCode, setHtmlCode] = useState(EXAMPLE_ECOMMERCE)
    const [cssCode, setCssCode] = useState('')
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [isStarting, setIsStarting] = useState(false)
    const [runHealer, setRunHealer] = useState(true)
    const [runNavigator, setRunNavigator] = useState(true)

    // Processing state
    const [sessionState, setSessionState] = useState<SessionState | null>(null)
    const [activities, setActivities] = useState<Activity[]>([])
    const [voiceEnabled, setVoiceEnabled] = useState(true)
    const lastSpokenRef = React.useRef<string>('')

    // Voice narration function
    const speak = (text: string) => {
        if (!voiceEnabled) return
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

        // Don't repeat the same message
        if (lastSpokenRef.current === text) return
        lastSpokenRef.current = text

        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        const voices = window.speechSynthesis.getVoices()
        const googleVoice = voices.find(v => v.name.includes('Google US English'))
        if (googleVoice) utterance.voice = googleVoice
        utterance.rate = 1.1
        window.speechSynthesis.speak(utterance)
    }

    // SSE connection
    useEffect(() => {
        if (!sessionId || pageState !== 'processing') return

        const eventSource = new EventSource(`/api/integration/playground/stream/${sessionId}`)

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data)

            if (data.type === 'update') {
                setSessionState(data.session)
                if (data.activities?.length > 0) {
                    // Narrate new activities
                    const newActivities = data.activities.reverse()
                    if (newActivities.length > 0) {
                        // Only speak the most recent important activity
                        const latestActivity = newActivities[0]
                        const msg = latestActivity.message
                            .replace(/[🎬🛠️🔍📊🤖✅❌⚠️🧪👁️🔄🎉💾]/g, '')
                            .trim()
                        speak(msg)
                    }
                    setActivities(prev => [...newActivities, ...prev].slice(0, 100))
                }
            }

            if (data.type === 'complete') {
                setPageState('complete')
                speak('Processing complete. All tests finished.')
            }
        }

        eventSource.onerror = () => {
            eventSource.close()
        }

        return () => eventSource.close()
    }, [sessionId, pageState])

    const startProcessing = async () => {
        if (!htmlCode.trim()) {
            alert('Please enter HTML code')
            return
        }

        setIsStarting(true)
        setActivities([])

        try {
            const response = await fetch('/api/integration/playground/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ htmlCode, cssCode, runHealer, runNavigator })
            })

            const data = await response.json()

            if (data.success) {
                setSessionId(data.sessionId)
                setPageState('processing')
            } else {
                alert('Error: ' + (data.error || 'Failed to start'))
            }
        } catch (error) {
            console.error('Start error:', error)
            alert('Failed to start processing')
        } finally {
            setIsStarting(false)
        }
    }

    const resetPlayground = () => {
        setPageState('input')
        setSessionId(null)
        setSessionState(null)
        setActivities([])
    }

    const downloadFixedCode = () => {
        if (!sessionState?.fixedCode) return
        const blob = new Blob([sessionState.fixedCode], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'fixed-code.html'
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="min-h-screen bg-[#020617]">
            {/* Background Effects */}
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02]" />
            <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px]" />
            <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px]" />

            <AnimatePresence mode="wait">
                {/* ======================== INPUT STATE ======================== */}
                {pageState === 'input' && (
                    <motion.div
                        key="input"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative container mx-auto px-4 py-8 max-w-6xl"
                    >
                        {/* Header */}
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full border border-white/10 mb-6">
                                <FlaskConical className="w-4 h-4 text-purple-400" />
                                <span className="text-sm text-purple-300">Interactive Demo</span>
                            </div>
                            <h1 className="text-5xl font-black text-white mb-4">
                                Live Integration
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                                    Playground
                                </span>
                            </h1>
                            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                                Test <strong className="text-white">YOUR</strong> code with real Healer + Navigator integration.
                                Watch AI fix and verify accessibility issues in real-time.
                            </p>
                        </div>

                        {/* Code Editor */}
                        <Card className="p-6 bg-slate-950/80 backdrop-blur-md border-2 border-blue-500/30 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Code className="w-5 h-5 text-blue-400" />
                                    <span className="font-bold text-white">Your Code</span>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setHtmlCode(EXAMPLE_ECOMMERCE)} className="text-xs">
                                        E-commerce
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => setHtmlCode(EXAMPLE_LOGIN)} className="text-xs">
                                        Login Form
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => setHtmlCode(EXAMPLE_BLOG)} className="text-xs">
                                        Blog Article
                                    </Button>
                                </div>
                            </div>

                            <Tabs defaultValue="html">
                                <TabsList className="bg-slate-900">
                                    <TabsTrigger value="html">HTML</TabsTrigger>
                                    <TabsTrigger value="css">CSS (Optional)</TabsTrigger>
                                </TabsList>

                                <TabsContent value="html" className="mt-4">
                                    <div className="border border-white/10 rounded-lg overflow-hidden">
                                        <Editor
                                            height="400px"
                                            language="html"
                                            value={htmlCode}
                                            onChange={(v) => setHtmlCode(v || '')}
                                            theme="vs-dark"
                                            options={{
                                                minimap: { enabled: false },
                                                fontSize: 14,
                                                lineNumbers: 'on',
                                                scrollBeyondLastLine: false,
                                                wordWrap: 'on'
                                            }}
                                        />
                                    </div>
                                </TabsContent>

                                <TabsContent value="css" className="mt-4">
                                    <div className="border border-white/10 rounded-lg overflow-hidden">
                                        <Editor
                                            height="400px"
                                            language="css"
                                            value={cssCode}
                                            onChange={(v) => setCssCode(v || '')}
                                            theme="vs-dark"
                                            options={{
                                                minimap: { enabled: false },
                                                fontSize: 14,
                                                lineNumbers: 'on',
                                                scrollBeyondLastLine: false
                                            }}
                                        />
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </Card>

                        {/* Configuration */}
                        <Card className="p-6 bg-slate-950/80 backdrop-blur-md border-2 border-purple-500/30">
                            <div className="flex items-center gap-2 mb-4">
                                <Settings className="w-5 h-5 text-purple-400" />
                                <span className="font-bold text-white">Configuration</span>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={runHealer}
                                            onChange={(e) => setRunHealer(e.target.checked)}
                                            className="w-5 h-5 rounded border-blue-500 text-blue-600 focus:ring-blue-500"
                                        />
                                        <div>
                                            <div className="flex items-center gap-2 text-white font-medium">
                                                <Wrench className="w-4 h-4 text-blue-400" />
                                                Run Healer
                                            </div>
                                            <p className="text-xs text-slate-500">Auto-fix accessibility issues with Gemini AI</p>
                                        </div>
                                    </label>

                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={runNavigator}
                                            onChange={(e) => setRunNavigator(e.target.checked)}
                                            disabled={!runHealer}
                                            className="w-5 h-5 rounded border-purple-500 text-purple-600 focus:ring-purple-500 disabled:opacity-50"
                                        />
                                        <div className={!runHealer ? 'opacity-50' : ''}>
                                            <div className="flex items-center gap-2 text-white font-medium">
                                                <Eye className="w-4 h-4 text-purple-400" />
                                                Run Navigator
                                            </div>
                                            <p className="text-xs text-slate-500">Verify fixes with AI testing simulation</p>
                                        </div>
                                    </label>
                                </div>

                                <div className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-white/5 rounded-lg p-4">
                                    <div className="text-sm text-slate-400 space-y-1">
                                        <p>⏱️ Estimated time: <strong className="text-white">60-90 seconds</strong></p>
                                        <p>🤖 Real <strong className="text-blue-400">Gemini API</strong> calls will be made</p>
                                        <p>📊 Live split-screen integration view</p>
                                        <p>💾 All activity logged to database</p>
                                    </div>
                                </div>
                            </div>

                            <Button
                                size="lg"
                                onClick={startProcessing}
                                disabled={isStarting || !htmlCode.trim()}
                                className="w-full mt-6 text-lg py-7 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/25"
                            >
                                {isStarting ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Initializing Session...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="mr-2 h-5 w-5" />
                                        🚀 RUN LIVE INTEGRATION
                                    </>
                                )}
                            </Button>
                        </Card>
                    </motion.div>
                )}

                {/* ======================== PROCESSING STATE ======================== */}
                {(pageState === 'processing' || pageState === 'complete') && (
                    <motion.div
                        key="processing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="h-screen flex flex-col relative"
                    >
                        {/* Top Status Bar */}
                        <div className="h-16 bg-gradient-to-r from-blue-600 via-emerald-500 to-purple-600 px-6 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-white/10 rounded-lg">
                                    <Zap className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-white">
                                        {pageState === 'complete' ? '✅ PROCESSING COMPLETE' : '🔄 LIVE PROCESSING'}
                                    </h1>
                                    <p className="text-xs text-white/70">Your Code → Healer → Navigator</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <div className="text-xs text-white/60">Duration</div>
                                    <div className="text-lg font-mono text-white">
                                        {Math.floor((sessionState?.duration || 0) / 60)}:{((sessionState?.duration || 0) % 60).toString().padStart(2, '0')}
                                    </div>
                                </div>
                                <Badge className={`${pageState === 'complete' ? 'bg-emerald-500' : 'bg-blue-500 animate-pulse'}`}>
                                    ● {pageState === 'complete' ? 'COMPLETE' : 'ACTIVE'}
                                </Badge>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                                    className="text-white hover:bg-white/10"
                                    title={voiceEnabled ? 'Mute voice' : 'Enable voice'}
                                >
                                    {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                                </Button>
                                {pageState === 'complete' && (
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="secondary" onClick={downloadFixedCode}>
                                            <Download className="w-4 h-4 mr-1" /> Download
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={resetPlayground}>
                                            <RotateCcw className="w-4 h-4 mr-1" /> New Test
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Split Screen */}
                        <div className="flex-1 grid grid-cols-[44%_12%_44%] gap-2 p-4 overflow-hidden min-h-[500px]">
                            {/* LEFT: Healer Panel */}
                            <div className="border-4 border-blue-500 rounded-2xl overflow-hidden bg-slate-950/80 backdrop-blur-md flex flex-col">
                                <div className="px-5 py-4 bg-gradient-to-r from-blue-600/20 to-blue-500/10 border-b border-blue-500/30">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${sessionState?.healerStatus !== 'pending' && sessionState?.healerStatus !== 'skipped' ? 'bg-blue-500 animate-pulse' : 'bg-slate-600'}`} />
                                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                                <Wrench className="w-5 h-5 text-blue-400" />
                                                Healer Mode
                                            </h2>
                                        </div>
                                        <Badge className={`text-xs uppercase ${sessionState?.healerStatus === 'complete' ? 'bg-emerald-500' :
                                            sessionState?.healerStatus === 'fixing' ? 'bg-yellow-500' :
                                                sessionState?.healerStatus === 'scanning' ? 'bg-blue-500 animate-pulse' :
                                                    'bg-slate-600'
                                            }`}>
                                            {sessionState?.healerStatus || 'pending'}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="p-5 flex-1 overflow-auto space-y-4">
                                    {/* Progress */}
                                    <div>
                                        <div className="flex justify-between text-xs text-slate-400 mb-2">
                                            <span>Progress</span>
                                            <span>{sessionState?.healerProgress || 0}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${sessionState?.healerProgress || 0}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                            <div className="text-2xl font-bold text-yellow-400">{sessionState?.healerIssuesFound || 0}</div>
                                            <div className="text-xs text-yellow-300/70">Issues Found</div>
                                        </div>
                                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                                            <div className="text-2xl font-bold text-emerald-400">{sessionState?.healerIssuesFixed || 0}</div>
                                            <div className="text-xs text-emerald-300/70">Issues Fixed</div>
                                        </div>
                                    </div>

                                    {/* Score Change */}
                                    {sessionState?.beforeScore !== undefined && sessionState?.afterScore !== undefined && (
                                        <div className="p-4 bg-gradient-to-r from-blue-500/10 to-emerald-500/10 border border-white/10 rounded-lg text-center">
                                            <div className="text-sm text-slate-400 mb-1">Accessibility Score</div>
                                            <div className="text-2xl font-bold">
                                                <span className="text-red-400">{sessionState.beforeScore}</span>
                                                <span className="text-slate-500 mx-2">→</span>
                                                <span className="text-emerald-400">{sessionState.afterScore}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* CENTER: Data Flow */}
                            <div className="flex flex-col items-center justify-center relative">
                                {/* Connection lines (visual) */}
                                <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
                                    <line x1="0" y1="50%" x2="50%" y2="50%" stroke={sessionState?.dataFlowCount ? '#22c55e' : '#334155'} strokeWidth="2" strokeDasharray="6,3" />
                                    <line x1="50%" y1="50%" x2="100%" y2="50%" stroke={sessionState?.dataFlowCount ? '#22c55e' : '#334155'} strokeWidth="2" strokeDasharray="6,3" />
                                </svg>

                                {/* Database icon */}
                                <motion.div
                                    animate={sessionState?.dataFlowCount ? { scale: [1, 1.1, 1] } : {}}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="relative z-10"
                                >
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${sessionState?.dataFlowCount ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-slate-700'}`}>
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <ellipse cx="12" cy="6" rx="8" ry="3" />
                                            <path d="M4 6v6c0 1.657 3.582 3 8 3s8-1.343 8-3V6" />
                                            <path d="M4 12v6c0 1.657 3.582 3 8 3s8-1.343 8-3v-6" />
                                        </svg>
                                    </div>
                                    {sessionState?.dataFlowCount ? (
                                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-bold text-emerald-600">
                                            {sessionState.dataFlowCount}
                                        </div>
                                    ) : null}
                                </motion.div>
                                <p className="text-[10px] text-slate-500 mt-3 text-center z-10">Database Sync</p>

                                {/* Animated packet */}
                                {sessionState?.healerStatus === 'complete' && sessionState?.navigatorStatus === 'verifying' && (
                                    <motion.div
                                        className="absolute w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg z-20"
                                        initial={{ left: 0, opacity: 0 }}
                                        animate={{ left: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                                    >
                                        <span className="text-white text-[8px] font-bold">FIX</span>
                                    </motion.div>
                                )}
                            </div>

                            {/* RIGHT: Navigator Panel */}
                            <div className="border-4 border-purple-500 rounded-2xl overflow-hidden bg-slate-950/80 backdrop-blur-md flex flex-col">
                                <div className="px-5 py-4 bg-gradient-to-r from-purple-600/20 to-purple-500/10 border-b border-purple-500/30">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${sessionState?.navigatorStatus === 'verifying' ? 'bg-purple-500 animate-pulse' : sessionState?.navigatorStatus === 'complete' ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                                <Eye className="w-5 h-5 text-purple-400" />
                                                Navigator Mode
                                            </h2>
                                        </div>
                                        <Badge className={`text-xs uppercase ${sessionState?.navigatorStatus === 'complete' ? 'bg-emerald-500' :
                                            sessionState?.navigatorStatus === 'verifying' ? 'bg-purple-500 animate-pulse' :
                                                'bg-slate-600'
                                            }`}>
                                            {sessionState?.navigatorStatus || 'waiting'}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="p-5 flex-1 overflow-auto space-y-4">
                                    {/* Progress */}
                                    <div>
                                        <div className="flex justify-between text-xs text-slate-400 mb-2">
                                            <span>Progress</span>
                                            <span>{sessionState?.navigatorProgress || 0}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-purple-500 to-pink-400"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${sessionState?.navigatorProgress || 0}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                            <div className="text-2xl font-bold text-blue-400">{sessionState?.navigatorTestsRun || 0}</div>
                                            <div className="text-xs text-blue-300/70">Tests Run</div>
                                        </div>
                                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                                            <div className="text-2xl font-bold text-emerald-400">{sessionState?.navigatorTestsPass || 0}</div>
                                            <div className="text-xs text-emerald-300/70">Tests Passed</div>
                                        </div>
                                    </div>

                                    {/* Waiting message */}
                                    {sessionState?.navigatorStatus === 'pending' && (
                                        <div className="p-4 bg-slate-800/50 border border-slate-600 rounded-lg text-center">
                                            <p className="text-sm text-slate-400">⏳ Waiting for Healer to complete fixes...</p>
                                        </div>
                                    )}

                                    {/* AI Narrator - Always show during verifying */}
                                    {sessionState?.navigatorStatus === 'verifying' && (
                                        <div className="p-3 bg-purple-900/30 border border-purple-500/30 rounded-lg">
                                            <div className="flex items-start gap-3">
                                                <span className="text-xl">🗣️</span>
                                                <div className="flex-1">
                                                    <p className="text-sm text-purple-200 italic">
                                                        {sessionState?.navigatorTests && sessionState.navigatorTests.length > 0
                                                            ? `"Verifying ${sessionState.navigatorTests.filter(t => t.status === 'running').length > 0 ? sessionState.navigatorTests.find(t => t.status === 'running')?.name : 'test cases'}..."`
                                                            : '"Generating test cases from issues..."'
                                                        }
                                                    </p>
                                                    <div className="mt-2 h-3 flex items-end gap-0.5">
                                                        {[...Array(12)].map((_, i) => (
                                                            <motion.div
                                                                key={i}
                                                                className="w-1 bg-purple-400 rounded-full"
                                                                animate={{ height: [2, 6 + Math.random() * 6, 2] }}
                                                                transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.03 }}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Test Cases List - Show when tests exist */}
                                    {sessionState?.navigatorTests && sessionState.navigatorTests.length > 0 && (
                                        <div className="space-y-2 mt-3">
                                            <div className="flex items-center justify-between">
                                                <div className="text-xs text-purple-400 font-semibold uppercase tracking-wider flex items-center gap-2">
                                                    <FlaskConical className="w-3 h-3" />
                                                    AI Generated Test Cases
                                                </div>
                                                <div className="text-[10px] text-slate-500">
                                                    {sessionState.navigatorTests.filter(t => t.status === 'passed').length}/{sessionState.navigatorTests.length} passed
                                                </div>
                                            </div>
                                            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-purple-500/30">
                                                {sessionState.navigatorTests.map((test, index) => (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0, x: -20, scale: 0.95 }}
                                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                                        transition={{
                                                            delay: index * 0.08,
                                                            type: "spring",
                                                            stiffness: 200,
                                                            damping: 20
                                                        }}
                                                        className={`p-2 rounded-lg border flex items-center gap-2 ${test.status === 'passed'
                                                                ? 'bg-emerald-500/15 border-emerald-500/40'
                                                                : test.status === 'failed'
                                                                    ? 'bg-red-500/15 border-red-500/40'
                                                                    : test.status === 'running'
                                                                        ? 'bg-yellow-500/20 border-yellow-400/50'
                                                                        : 'bg-slate-800/60 border-slate-600/40'
                                                            }`}
                                                    >
                                                        {/* Status Icon */}
                                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${test.status === 'passed' ? 'bg-emerald-500 text-white' :
                                                                test.status === 'failed' ? 'bg-red-500 text-white' :
                                                                    test.status === 'running' ? 'bg-yellow-500 text-black animate-pulse' :
                                                                        'bg-slate-700 text-slate-400'
                                                            }`}>
                                                            {test.status === 'passed' ? '✓' :
                                                                test.status === 'failed' ? '✗' :
                                                                    test.status === 'running' ? (
                                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                                    ) : index + 1}
                                                        </div>

                                                        {/* Test Name */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className={`text-xs font-medium truncate ${test.status === 'passed' ? 'text-emerald-300' :
                                                                    test.status === 'failed' ? 'text-red-300' :
                                                                        test.status === 'running' ? 'text-yellow-300' :
                                                                            'text-slate-400'
                                                                }`}>
                                                                {test.name}
                                                            </div>
                                                            {test.evidence && test.status !== 'pending' && (
                                                                <div className="text-[10px] text-slate-500 truncate mt-0.5">
                                                                    {test.evidence}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Running indicator */}
                                                        {test.status === 'running' && (
                                                            <motion.div
                                                                className="text-[10px] text-yellow-400 shrink-0"
                                                                animate={{ opacity: [1, 0.5, 1] }}
                                                                transition={{ duration: 1, repeat: Infinity }}
                                                            >
                                                                verifying...
                                                            </motion.div>
                                                        )}
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* NEW: Corrected Code Section */}
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="px-6 pb-4 shrink-0"
                        >
                            <div className="border-2 border-emerald-500/30 rounded-xl overflow-hidden bg-slate-950/80 backdrop-blur-sm">
                                <div className="flex items-center justify-between px-4 py-2 bg-emerald-900/10 border-b border-emerald-500/20">
                                    <div className="flex items-center gap-2">
                                        <Code className="w-4 h-4 text-emerald-400" />
                                        <h3 className="font-bold text-emerald-100 text-sm">Corrected Code</h3>
                                        {sessionState?.fixedCode && <Badge className="bg-emerald-500/20 text-emerald-300 border-none text-[10px]">AI FIXED</Badge>}
                                    </div>
                                    <Button size="sm" variant="ghost" onClick={downloadFixedCode} className="h-6 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10">
                                        <Download className="w-3 h-3 mr-1" /> Save
                                    </Button>
                                </div>
                                <div className="h-64 relative">
                                    {sessionState?.fixedCode ? (
                                        <DiffEditor
                                            height="100%"
                                            language="html"
                                            original={htmlCode}
                                            modified={sessionState.fixedCode}
                                            theme="vs-dark"
                                            options={{
                                                readOnly: true,
                                                minimap: { enabled: false },
                                                fontSize: 12,
                                                lineNumbers: 'on',
                                                scrollBeyondLastLine: false,
                                                renderSideBySide: false,
                                                padding: { top: 10, bottom: 10 }
                                            }}
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm italic">
                                            Code will appear here after Healer fixes issues...
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Activity Stream */}
                        <div className="h-44 bg-slate-950/90 backdrop-blur-md border-t-4 border-emerald-500 px-6 py-4 shrink-0 overflow-hidden">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                <h3 className="font-bold text-white">Live Activity Stream</h3>
                                <Badge className="bg-emerald-500 text-[10px]">LIVE</Badge>
                            </div>
                            <div className="space-y-1 max-h-24 overflow-y-auto scrollbar-hide">
                                <AnimatePresence mode="popLayout">
                                    {activities.slice(0, 12).map((activity, idx) => (
                                        <motion.div
                                            key={activity.id || idx}
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-center gap-3 text-sm"
                                        >
                                            <span className="text-[10px] text-slate-600 font-mono w-16 shrink-0">
                                                {new Date(activity.timestamp).toLocaleTimeString()}
                                            </span>
                                            <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-medium border ${activity.mode === 'healer' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                                activity.mode === 'navigator' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                                                    activity.mode === 'gemini' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                                        activity.mode === 'database' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                                            'bg-slate-500/20 text-slate-400 border-slate-500/30'
                                                }`}>
                                                {activity.mode}
                                            </span>
                                            <span className="text-slate-300 truncate">{activity.message}</span>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {activities.length === 0 && (
                                    <p className="text-slate-600 text-sm">Waiting for activity...</p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
