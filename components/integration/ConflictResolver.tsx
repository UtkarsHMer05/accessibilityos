"use client"
import { AlertTriangle, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

export function ConflictResolver() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-amber-900/10 border border-amber-500/30 rounded-xl"
        >
            <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                    <h4 className="font-bold text-amber-300">Integration Conflict Detected</h4>
                    <p className="text-sm text-amber-200/60 mt-1">Both modes suggested different fixes for the same issue.</p>
                </div>
            </div>

            <div className="space-y-4">
                {/* Healer's Fix */}
                <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-950/30 rounded-r">
                    <p className="text-xs font-bold text-blue-400 mb-1">🛠️ Healer's Fix:</p>
                    <code className="text-xs text-slate-300 font-mono">aria-label="Submit form"</code>
                    <p className="text-[10px] text-slate-500 mt-1">Based on button text analysis</p>
                </div>

                {/* Navigator's Recommendation */}
                <div className="border-l-4 border-purple-500 pl-4 py-2 bg-purple-950/30 rounded-r">
                    <p className="text-xs font-bold text-purple-400 mb-1">👁️ Navigator's Recommendation:</p>
                    <code className="text-xs text-slate-300 font-mono">aria-label="Complete purchase and proceed"</code>
                    <p className="text-[10px] text-slate-500 mt-1">Based on user flow context</p>
                </div>

                {/* AI Resolution */}
                <div className="border-l-4 border-emerald-500 pl-4 py-2 bg-emerald-950/30 rounded-r">
                    <p className="text-xs font-bold text-emerald-400 mb-1">🤖 AI Resolution:</p>
                    <code className="text-xs text-emerald-300 font-mono">aria-label="Complete purchase" aria-describedby="help"</code>
                    <p className="text-[10px] text-slate-500 mt-1">Balanced: Concise label + descriptive help</p>
                </div>
            </div>

            <Button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500">
                <Check className="w-4 h-4 mr-2" /> Apply AI-Resolved Fix
            </Button>
        </motion.div>
    )
}
