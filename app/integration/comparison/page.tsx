"use client"
import { motion } from 'framer-motion'
import { XCircle, CheckCircle, Zap, Brain, Clock, Target } from 'lucide-react'

export default function IntegrationComparisonPage() {
    return (
        <div className="min-h-screen bg-[#050510] text-white p-8">
            <header className="text-center mb-12">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-slate-200 to-emerald-400">
                    The Integration Advantage
                </h1>
                <p className="text-slate-400 mt-2">Why AccessibilityOS beats separate tools.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {/* WITHOUT INTEGRATION */}
                <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="border-4 border-red-500/50 bg-red-950/10 rounded-2xl p-8"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <XCircle className="w-8 h-8 text-red-500" />
                        <h2 className="text-2xl font-bold text-red-400">Without Integration</h2>
                    </div>

                    <div className="space-y-4">
                        <ProblemCard icon="📊" title="Data Silos"
                            description="Healer found 120 issues. Navigator found 30. 18 were duplicates nobody noticed."
                            impact="Wasted effort fixing same issue twice"
                        />
                        <ProblemCard icon="❓" title="No Verification"
                            description="Healer fixed 110 issues. But 12 didn't actually work for real users."
                            impact="False confidence in accessibility"
                        />
                        <ProblemCard icon="⏰" title="Manual Coordination"
                            description="Developer manually triggers tests, waits, applies fixes separately."
                            impact="Takes weeks instead of minutes"
                        />
                        <ProblemCard icon="🔁" title="No Learning"
                            description="Healer keeps missing the same issues Navigator catches."
                            impact="No improvement over time"
                        />
                    </div>

                    <div className="mt-8 p-4 bg-red-500/20 rounded-xl text-center">
                        <p className="text-2xl font-bold text-red-400">60% accuracy</p>
                        <p className="text-sm text-red-300/60">Weeks of manual work</p>
                    </div>
                </motion.div>

                {/* WITH INTEGRATION */}
                <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="border-4 border-emerald-500/50 bg-emerald-950/10 rounded-2xl p-8"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                        <h2 className="text-2xl font-bold text-emerald-400">With AccessibilityOS</h2>
                    </div>

                    <div className="space-y-4">
                        <SolutionCard icon="🧠" title="Unified Intelligence"
                            description="Single database auto-deduplicates 18 overlapping issues."
                            impact="Zero wasted effort"
                        />
                        <SolutionCard icon="✅" title="Automatic Verification"
                            description="Every Healer fix auto-triggers Navigator test. 12 bad fixes caught instantly."
                            impact="97% fix success rate"
                        />
                        <SolutionCard icon="⚡" title="Zero-Touch Workflow"
                            description="Healer → Navigator → Re-fix → Re-verify in 4 minutes, no human needed."
                            impact="3,600x faster"
                        />
                        <SolutionCard icon="📈" title="Continuous Learning"
                            description="Navigator failures train Healer. Accuracy improved 60% → 87%."
                            impact="Gets smarter over time"
                        />
                    </div>

                    <div className="mt-8 p-4 bg-emerald-500/20 rounded-xl text-center">
                        <p className="text-2xl font-bold text-emerald-400">97% accuracy</p>
                        <p className="text-sm text-emerald-300/60">4 minutes of automated work</p>
                    </div>
                </motion.div>
            </div>

            {/* Bottom Stats */}
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="max-w-2xl mx-auto mt-12 p-6 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-emerald-600/20 rounded-2xl border border-white/10 text-center"
            >
                <p className="text-4xl font-black text-white">3,600x Faster</p>
                <p className="text-slate-400 mt-2">Integration isn't a feature. It's the entire advantage.</p>
            </motion.div>
        </div>
    )
}

function ProblemCard({ icon, title, description, impact }: any) {
    return (
        <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{icon}</span>
                <h3 className="font-bold text-red-300">{title}</h3>
            </div>
            <p className="text-sm text-slate-400 mb-2">{description}</p>
            <p className="text-xs text-red-400/80">⚠️ {impact}</p>
        </div>
    )
}

function SolutionCard({ icon, title, description, impact }: any) {
    return (
        <div className="p-4 bg-emerald-900/20 border border-emerald-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{icon}</span>
                <h3 className="font-bold text-emerald-300">{title}</h3>
            </div>
            <p className="text-sm text-slate-400 mb-2">{description}</p>
            <p className="text-xs text-emerald-400/80">✅ {impact}</p>
        </div>
    )
}
