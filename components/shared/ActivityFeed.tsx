
"use client"

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Stethoscope, Navigation, RefreshCw, ArrowRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Activity {
    id: string
    mode: 'healer' | 'navigator' | 'integration'
    action: string
    details: any
    timestamp: string
}

export function ActivityFeed() {
    const [activities, setActivities] = useState<Activity[]>([])

    // Polling simulation for "Live" feel
    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const res = await fetch('/api/activity/feed')
                if (res.ok) {
                    const data = await res.json()
                    setActivities(data)
                }
            } catch (e) {
                console.error("Feed fetch error", e)
            }
        }

        fetchFeed()
        const interval = setInterval(fetchFeed, 2000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="w-full max-w-sm border-l border-white/5 bg-slate-900/50 backdrop-blur-sm h-full max-h-[700px] flex flex-col rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/5 flex justify-between items-center shrink-0">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Live Activity Stream</span>
                <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                    {activities.length === 0 && (
                        <div className="text-center text-slate-500 text-xs py-10">
                            No recent activity
                        </div>
                    )}
                    {activities.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            className="relative pl-4 border-l-2 border-slate-700"
                        >
                            <div className={`absolute -left-[5px] top-0 w-2 h-2 rounded-full ring-4 ring-slate-900 
                                ${item.mode === 'healer' ? 'bg-blue-500' :
                                    item.mode === 'navigator' ? 'bg-purple-500' : 'bg-emerald-500'}`}
                            />

                            <div className="flex items-center gap-2 mb-1">
                                {item.mode === 'healer' && <Stethoscope size={12} className="text-blue-400" />}
                                {item.mode === 'navigator' && <Navigation size={12} className="text-purple-400" />}
                                {item.mode === 'integration' && <RefreshCw size={12} className="text-emerald-400" />}

                                <span className="text-[10px] text-slate-500 font-mono">
                                    {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                                </span>
                            </div>

                            <p className="text-sm text-slate-300 font-medium">
                                {item.action.replace(/_/g, ' ')}
                            </p>

                            {item.details && (
                                <div className="mt-1 text-xs text-slate-500 bg-slate-950/50 p-2 rounded border border-white/5 font-mono">
                                    {JSON.stringify(item.details).substring(0, 100)}...
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    )
}
