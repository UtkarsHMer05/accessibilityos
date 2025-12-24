
'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Activity, Timer, Cpu } from 'lucide-react'

interface TopBarProps {
    status: string
    healthScore: number
    duration: number
    opsPerSecond?: number
}

export function TopBar({
    status = 'idle',
    healthScore = 0,
    duration = 0,
    opsPerSecond = 0
}: TopBarProps) {
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className="h-16 bg-gradient-to-r from-blue-600 via-emerald-500 to-purple-600 px-6 flex items-center justify-between">
            {/* Left: Title */}
            <div className="flex items-center gap-4">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur">
                    <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        System Core: <span className="text-white/90">Live Integration Network</span>
                    </h1>
                    <div className="flex items-center gap-2 text-xs text-white/70">
                        <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse" />
                            SYSTEM OPERATIONAL
                        </span>
                        <span>•</span>
                        <span>{opsPerSecond} OPS/SEC</span>
                    </div>
                </div>
            </div>

            {/* Right: Metrics */}
            <div className="flex items-center gap-6">
                {/* Integration Health */}
                <div className="text-center">
                    <div className="text-[10px] text-white/60 uppercase">Integration Health</div>
                    <div className="text-2xl font-bold text-white flex items-center gap-1">
                        {healthScore}%
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className={`w-2 h-2 rounded-full ${healthScore > 80 ? 'bg-emerald-400' : 'bg-yellow-400'}`}
                        />
                    </div>
                </div>

                {/* Status */}
                <div className="text-center">
                    <motion.div
                        animate={status === 'running' ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ duration: 1, repeat: Infinity }}
                    >
                        <Badge className={`text-sm ${status === 'complete' ? 'bg-emerald-500' :
                                status === 'running' ? 'bg-blue-500 animate-pulse' :
                                    'bg-slate-600'
                            }`}>
                            ● {status.toUpperCase()}
                        </Badge>
                    </motion.div>
                </div>

                {/* Duration */}
                <div className="text-center">
                    <div className="text-[10px] text-white/60 uppercase flex items-center gap-1">
                        <Timer className="w-3 h-3" /> Duration
                    </div>
                    <div className="text-lg font-mono text-white">
                        {formatDuration(duration)}
                    </div>
                </div>
            </div>
        </div>
    )
}
