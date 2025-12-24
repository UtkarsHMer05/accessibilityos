'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Activity, Zap, RefreshCw, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

export function IntegrationHealthScore({
    dataFlowReliability = 98,
    autoTriggerSuccess = 95,
    feedbackLoopSpeed = 89,
    aiAccuracy = 94
}: {
    dataFlowReliability?: number;
    autoTriggerSuccess?: number;
    feedbackLoopSpeed?: number;
    aiAccuracy?: number;
}) {
    const overallHealth = Math.round(
        (dataFlowReliability + autoTriggerSuccess + feedbackLoopSpeed + aiAccuracy) / 4
    );

    return (
        <Card className="p-6 border-l-4 border-l-green-500 bg-slate-900/50 backdrop-blur">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-500" />
                    Integration Health
                </h3>
                <Badge variant="outline" className="text-green-400 border-green-500/30 bg-green-500/10 animate-pulse">
                    LIVE
                </Badge>
            </div>

            <div className="text-center mb-8 relative">
                <div className="relative inline-flex items-center justify-center">
                    <svg className="w-32 h-32 transform -rotate-90">
                        <circle
                            className="text-slate-800"
                            strokeWidth="8"
                            stroke="currentColor"
                            fill="transparent"
                            r="58"
                            cx="64"
                            cy="64"
                        />
                        <motion.circle
                            className="text-green-500"
                            strokeWidth="8"
                            strokeDasharray={365}
                            strokeDashoffset={365 - (365 * overallHealth) / 100}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="58"
                            cx="64"
                            cy="64"
                            initial={{ strokeDashoffset: 365 }}
                            animate={{ strokeDashoffset: 365 - (365 * overallHealth) / 100 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                    </svg>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                        <span className="text-3xl font-bold text-white">{overallHealth}%</span>
                    </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                    System Score
                </p>
            </div>

            <div className="space-y-4">
                <HealthMetric
                    label="Data Flow"
                    score={dataFlowReliability}
                    icon={<RefreshCw className="w-4 h-4" />}
                    description="Handoff reliability"
                    delay={0.1}
                />
                <HealthMetric
                    label="Auto-Trigger"
                    score={autoTriggerSuccess}
                    icon={<Zap className="w-4 h-4" />}
                    description="Latency < 200ms"
                    delay={0.2}
                />
                <HealthMetric
                    label="AI Accuracy"
                    score={aiAccuracy}
                    icon={<Smartphone className="w-4 h-4" />}
                    description="Verification confidence"
                    delay={0.3}
                />
            </div>

            {overallHealth >= 90 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 p-3 bg-green-500/10 rounded-lg flex items-center gap-2 border border-green-500/20"
                >
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                    <p className="text-xs font-medium text-green-300">
                        Systems Nominal
                    </p>
                </motion.div>
            )}
        </Card>
    );
}

function HealthMetric({
    label,
    score,
    icon,
    description,
    delay
}: {
    label: string;
    score: number;
    icon: React.ReactNode;
    description: string;
    delay: number;
}) {
    return (
        <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay }}
        >
            <div className="text-slate-400 p-2 bg-slate-800 rounded-lg">{icon}</div>
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-300">{label}</span>
                    <span className={`text-sm font-bold ${score > 90 ? 'text-green-500' : 'text-yellow-500'}`}>{score}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                    <motion.div
                        className={`h-1.5 rounded-full ${score > 90 ? 'bg-green-500' : 'bg-yellow-500'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ duration: 1, delay: delay + 0.2 }}
                    />
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">{description}</p>
            </div>
        </motion.div>
    );
}
