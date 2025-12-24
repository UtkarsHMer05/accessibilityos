
'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Eye, CheckCircle, Loader2, AlertTriangle, Volume2 } from 'lucide-react'

interface NavigatorPanelProps {
    status: string
    progress: number
    testsRun: number
    testsPass: number
    currentNarration?: string
    issuesFound?: { element: string; issue: string }[]
}

export function NavigatorPanel({
    status = 'waiting',
    progress = 0,
    testsRun = 0,
    testsPass = 0,
    currentNarration = '',
    issuesFound = []
}: NavigatorPanelProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-full flex flex-col border-4 border-purple-500 rounded-2xl overflow-hidden bg-slate-950/80 backdrop-blur-md"
        >
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-purple-600/20 to-purple-500/10 border-b border-purple-500/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${status !== 'waiting' ? 'bg-purple-500 animate-pulse' : 'bg-slate-600'}`} />
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Eye className="w-5 h-5 text-purple-400" />
                            Navigator Mode
                        </h2>
                    </div>
                    <Badge className={`text-xs uppercase ${status === 'complete' ? 'bg-emerald-500' :
                            status === 'verifying' ? 'bg-purple-500 animate-pulse' :
                                'bg-slate-600'
                        }`}>
                        {status}
                    </Badge>
                </div>
            </div>

            {/* Received Task */}
            <div className="px-5 py-3 border-b border-white/5">
                <Card className={`p-3 ${status === 'waiting' ? 'bg-slate-800/50 border-slate-700' : 'bg-purple-500/10 border-purple-500/30'}`}>
                    <div className="text-xs text-purple-300 uppercase mb-1">Verification Task</div>
                    <p className="text-sm text-white">
                        {status === 'waiting' && '⏳ Waiting for Healer to complete...'}
                        {status === 'verifying' && '🧪 Testing fixes with AI screen reader simulation...'}
                        {status === 'complete' && '✅ Verification complete!'}
                    </p>
                </Card>
            </div>

            {/* Progress Bar */}
            {status !== 'waiting' && (
                <div className="px-5 py-3">
                    <div className="flex justify-between text-xs text-slate-400 mb-2">
                        <span>Progress</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>
            )}

            {/* AI Narration */}
            {status === 'verifying' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mx-5 my-3 p-4 bg-purple-900/30 border border-purple-500/30 rounded-xl"
                >
                    <div className="flex items-start gap-3">
                        <div className="text-2xl">🗣️</div>
                        <div className="flex-1">
                            <p className="text-sm text-purple-200 italic">
                                {currentNarration || "I can now hear the image descriptions. Testing keyboard navigation..."}
                            </p>
                            {/* Audio Waveform */}
                            <div className="mt-3 h-6 flex items-end gap-0.5">
                                {[...Array(20)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="w-1 bg-purple-400 rounded-full"
                                        animate={{
                                            height: [4, 12 + Math.random() * 12, 4]
                                        }}
                                        transition={{
                                            duration: 0.6,
                                            repeat: Infinity,
                                            delay: i * 0.05,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                        <Volume2 className="w-5 h-5 text-purple-400 animate-pulse" />
                    </div>
                </motion.div>
            )}

            {/* Test Results */}
            <div className="px-5 py-3 flex-1 overflow-auto">
                <div className="text-xs text-slate-500 uppercase mb-2">Test Results</div>
                <div className="space-y-2">
                    {testsRun > 0 && (
                        <>
                            <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2 text-sm text-emerald-400"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Image alt text verified
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex items-center gap-2 text-sm text-emerald-400"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Button labels clear
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="flex items-center gap-2 text-sm text-emerald-400"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Keyboard navigation working
                            </motion.div>
                        </>
                    )}
                    {issuesFound.length > 0 && issuesFound.map((issue, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 text-sm text-yellow-400"
                        >
                            <AlertTriangle className="w-4 h-4" />
                            {issue.issue}
                        </motion.div>
                    ))}
                    {status === 'verifying' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-2 text-sm text-purple-400"
                        >
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Testing in progress...
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Final Report */}
            {status === 'complete' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-5 py-4 bg-purple-500/10 border-t border-purple-500/30"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-purple-400">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-bold">Verified!</span>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-slate-400">Tests</div>
                            <div className="text-lg font-bold text-emerald-400">
                                {testsPass}/{testsRun} passed
                            </div>
                        </div>
                    </div>
                    {issuesFound.length > 0 && (
                        <div className="mt-2 text-sm text-yellow-400">
                            ⚠️ {issuesFound.length} issue(s) sent to Healer for re-fix
                        </div>
                    )}
                </motion.div>
            )}
        </motion.div>
    )
}
