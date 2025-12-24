
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Activity, Code, Eye, Zap, CheckCircle } from 'lucide-react'

interface ActivityItem {
    id: string
    timestamp: Date
    mode: 'healer' | 'navigator' | 'integration'
    action: string
    message: string
}

interface ActivityStreamProps {
    activities: ActivityItem[]
}

export function ActivityStream({ activities = [] }: ActivityStreamProps) {
    const getModeIcon = (mode: string) => {
        switch (mode) {
            case 'healer': return <Code className="w-3 h-3" />
            case 'navigator': return <Eye className="w-3 h-3" />
            case 'integration': return <Zap className="w-3 h-3" />
            default: return <Activity className="w-3 h-3" />
        }
    }

    const getModeColor = (mode: string) => {
        switch (mode) {
            case 'healer': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
            case 'navigator': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
            case 'integration': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
        }
    }

    const getModeLabel = (mode: string) => {
        switch (mode) {
            case 'healer': return '🛠️ Healer'
            case 'navigator': return '👁️ Navigator'
            case 'integration': return '🔄 Integration'
            default: return '📊 System'
        }
    }

    return (
        <div className="h-44 bg-slate-950/90 backdrop-blur-md border-t-4 border-emerald-500 px-6 py-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
                <Activity className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white">
                    Live Integration Activity Stream
                </h3>
                <Badge className="bg-emerald-500 text-white text-[10px] animate-pulse">
                    ● LIVE
                </Badge>
            </div>

            {/* Activity List */}
            <div className="space-y-1.5 max-h-24 overflow-y-auto scrollbar-hide">
                <AnimatePresence mode="popLayout">
                    {activities.slice(0, 10).map((activity) => (
                        <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, y: -20, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center gap-3 text-sm"
                        >
                            {/* Timestamp */}
                            <span className="text-[10px] text-slate-600 font-mono w-16 shrink-0">
                                {activity.timestamp.toLocaleTimeString()}
                            </span>

                            {/* Mode Badge */}
                            <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-medium border ${getModeColor(activity.mode)}`}>
                                {getModeLabel(activity.mode)}
                            </span>

                            {/* Message */}
                            <span className="text-slate-300 truncate flex-1">
                                {activity.message}
                            </span>

                            {/* Success indicator */}
                            {activity.action.includes('complete') && (
                                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {activities.length === 0 && (
                    <div className="text-center text-slate-600 text-sm py-4">
                        Waiting for activity...
                    </div>
                )}
            </div>
        </div>
    )
}
