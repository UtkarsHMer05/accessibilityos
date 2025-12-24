"use client"
import { Activity } from 'lucide-react'
import { motion } from 'framer-motion'

export function IntegrationStatusBadge() {
    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed bottom-4 right-4 z-50"
        >
            <div className="bg-emerald-950/90 backdrop-blur border border-emerald-500/30 px-4 py-2 rounded-full flex items-center gap-3 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <div className="relative">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping absolute" />
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                </div>
                <span className="text-xs font-bold text-emerald-400">Integration Active</span>
                <div className="text-[10px] text-slate-400 border-l border-white/10 pl-3">
                    <div>Healer ↔ Navigator: <span className="text-emerald-400">Connected</span></div>
                </div>
            </div>
        </motion.div>
    )
}
