
"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Stethoscope, Navigation, Activity, Sparkles } from "lucide-react"

export function AppHeader() {
    const pathname = usePathname()
    const router = useRouter()

    const mode = pathname?.includes("/navigator") ? "navigator" : "healer"

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-slate-900/80 backdrop-blur-md border-b border-white/5 z-50 flex items-center justify-between px-6">
            {/* 1. Brand */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/dashboard')}>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <Sparkles className="text-white w-5 h-5" />
                </div>
                <div>
                    <h1 className="font-bold text-white tracking-tight leading-none">AccessibilityOS</h1>
                    <span className="text-[10px] text-slate-400 font-mono">INTEGRATED PLATFORM</span>
                </div>
            </div>

            {/* 2. Mode Toggle (Center) */}
            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
                <div className="flex items-center p-1 rounded-full bg-slate-950 border border-white/10">
                    <ModeButton
                        active={mode === 'healer'}
                        onClick={() => router.push('/healer')}
                        icon={<Stethoscope size={14} />}
                        label="Healer Mode"
                        color="bg-blue-600"
                    />
                    <ModeButton
                        active={mode === 'navigator'}
                        onClick={() => router.push('/navigator')}
                        icon={<Navigation size={14} />}
                        label="Navigator Mode"
                        color="bg-purple-600"
                    />
                </div>
            </div>

            {/* 3. Global Stats */}
            <div className="flex items-center gap-6 text-xs font-mono">
                <div className="hidden md:flex flex-col items-end">
                    <span className="text-slate-400">Issues Fixed Today</span>
                    <span className="text-emerald-400 font-bold">127</span>
                </div>
                <div className="h-8 w-[1px] bg-white/10 hidden md:block"></div>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${mode === 'healer' ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
                    <span className="text-slate-300">
                        {mode === 'healer' ? 'Healer Active' : 'Navigator Active'}
                    </span>
                </div>
            </div>
        </header>
    )
}

function ModeButton({ active, onClick, icon, label, color }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "relative flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300",
                active ? "text-white" : "text-slate-500 hover:text-slate-300"
            )}
        >
            {active && (
                <motion.div
                    layoutId="activeMode"
                    className={cn("absolute inset-0 rounded-full shadow-lg", color)}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
            )}
            <span className="relative z-10 flex items-center gap-2">
                {icon} {label}
            </span>
        </button>
    )
}
