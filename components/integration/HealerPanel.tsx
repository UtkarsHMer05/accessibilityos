
'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Code, CheckCircle, Loader2, AlertTriangle, Sparkles } from 'lucide-react'

interface HealerPanelProps {
    status: string
    progress: number
    issuesFound: number
    issuesFixed: number
    currentAction?: string
    codeLines?: { line: string; type: 'original' | 'fixed' | 'error' }[]
    score?: { before: number; after: number }
}

export function HealerPanel({
    status = 'idle',
    progress = 0,
    issuesFound = 0,
    issuesFixed = 0,
    currentAction = '',
    codeLines = [],
    score
}: HealerPanelProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-full flex flex-col border-4 border-blue-500 rounded-2xl overflow-hidden bg-slate-950/80 backdrop-blur-md"
        >
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-blue-600/20 to-blue-500/10 border-b border-blue-500/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${status !== 'idle' ? 'bg-blue-500 animate-pulse' : 'bg-slate-600'}`} />
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Code className="w-5 h-5 text-blue-400" />
                            Healer Mode
                        </h2>
                    </div>
                    <Badge className={`text-xs uppercase ${status === 'complete' ? 'bg-emerald-500' :
                            status === 'fixing' ? 'bg-yellow-500' :
                                status === 'scanning' ? 'bg-blue-500 animate-pulse' :
                                    'bg-slate-600'
                        }`}>
                        {status}
                    </Badge>
                </div>
            </div>

            {/* Current Task */}
            <div className="px-5 py-3 border-b border-white/5">
                <Card className="p-3 bg-blue-500/10 border-blue-500/30">
                    <div className="text-xs text-blue-300 uppercase mb-1">Current Task</div>
                    <p className="text-sm text-white">
                        {status === 'idle' && '⏳ Waiting to start...'}
                        {status === 'scanning' && '🔍 Scanning code for accessibility issues...'}
                        {status === 'fixing' && `🛠️ Fixing issues with Gemini AI (${issuesFixed}/${issuesFound})...`}
                        {status === 'complete' && '✅ All fixes applied successfully!'}
                    </p>
                </Card>
            </div>

            {/* Progress Bar */}
            <div className="px-5 py-3">
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                    <span>Progress</span>
                    <span>{progress}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>

            {/* Live Updates */}
            <div className="px-5 py-3 flex-1 overflow-auto">
                <div className="text-xs text-slate-500 uppercase mb-2">Live Updates</div>
                <div className="space-y-2">
                    {issuesFound > 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 text-sm text-yellow-400"
                        >
                            <AlertTriangle className="w-4 h-4" />
                            Found {issuesFound} accessibility issues
                        </motion.div>
                    )}
                    {issuesFixed > 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 text-sm text-emerald-400"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Fixed {issuesFixed}/{issuesFound} issues
                        </motion.div>
                    )}
                    {status === 'fixing' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-2 text-sm text-blue-400"
                        >
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <Sparkles className="w-4 h-4" /> Generating fixes with Gemini Pro...
                        </motion.div>
                    )}
                    {currentAction && (
                        <div className="text-xs text-slate-500 mt-2">{currentAction}</div>
                    )}
                </div>
            </div>

            {/* Mini Code Diff */}
            {(status === 'fixing' || status === 'complete') && (
                <div className="px-5 py-3 border-t border-white/5">
                    <div className="text-xs text-slate-500 uppercase mb-2">Code Preview</div>
                    <Card className="p-3 bg-slate-900 font-mono text-xs overflow-auto max-h-24">
                        <div className="text-red-400">- &lt;img src="product.jpg"&gt;</div>
                        <div className="text-emerald-400">+ &lt;img src="product.jpg" alt="Running shoes"&gt;</div>
                        <div className="text-red-400 mt-1">- &lt;div onclick="buy()"&gt;Buy&lt;/div&gt;</div>
                        <div className="text-emerald-400">+ &lt;button onclick="buy()"&gt;Buy&lt;/button&gt;</div>
                    </Card>
                </div>
            )}

            {/* Metrics */}
            {status === 'complete' && score && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-5 py-4 bg-emerald-500/10 border-t border-emerald-500/30"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-400">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-bold">Complete!</span>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-slate-400">Score</div>
                            <div className="text-lg font-bold">
                                <span className="text-red-400">{score.before}</span>
                                <span className="text-slate-500 mx-1">→</span>
                                <span className="text-emerald-400">{score.after}</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    )
}
