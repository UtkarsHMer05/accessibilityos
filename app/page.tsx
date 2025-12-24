
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, Activity, Zap, Brain, Eye, Wrench, Link2, CheckCircle2, Globe, TrendingUp } from 'lucide-react'
import { getWinningMetrics } from '@/lib/integration-metrics'

export default async function LandingPage() {
  const metrics = await getWinningMetrics()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-slate-950 relative overflow-hidden">

      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 text-center space-y-8 p-6 max-w-6xl w-full">
        {/* Hackathon Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium uppercase tracking-wider mb-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Sparkles size={12} />
          <span>Gemini 3 Hackathon Project</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 drop-shadow-2xl">
          Accessibility<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">OS</span>
        </h1>

        <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          The autonomous platform that <span className="text-blue-400 font-bold">Fixes (Healer)</span> and <span className="text-purple-400 font-bold">Verifies (Navigator)</span> accessibility issues in real-time.
        </p>

        {/* WINNING METRICS GRID - The "Wow" Factor */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 py-6">
          <MetricCard value={metrics.totalIssuesFixed} label="Issues Fixed" icon={<Wrench className="text-blue-400" />} />
          <MetricCard value={metrics.totalSites} label="Sites Improved" icon={<Globe className="text-indigo-400" />} />
          <MetricCard value={metrics.verificationRate} label="Verified Working" icon={<CheckCircle2 className="text-emerald-400" />} />
          <MetricCard value={metrics.navigatorOnly.toString()} label="Navigator Catches" icon={<Eye className="text-purple-400" />} />
          <MetricCard value={metrics.speedMultiplier} label="Faster vs Manual" icon={<Zap className="text-yellow-400" />} />
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400">
          <Link href="/integration/live?demo=true">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 h-16 text-xl font-bold shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all hover:scale-105 border-2 border-emerald-400/20">
              <Activity className="w-6 h-6 mr-2 animate-pulse" /> Launch Live Demo
            </Button>
          </Link>
          <Link href="/integration/playground">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 h-16 text-xl font-bold shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all hover:scale-105 border-2 border-purple-400/20">
              <Zap className="w-6 h-6 mr-2" /> Try Your Code
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="lg" className="h-16 px-8 text-lg border-white/10 text-slate-300 hover:bg-white/5 hover:text-white">
              Enter Dashboard <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>

        {/* Quick Links Footer */}
        <div className="flex justify-center gap-8 pt-8 mt-8 border-t border-white/5 opacity-60 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500 text-sm font-mono text-slate-500">
          <span>v2.0.0-hackathon-build</span>
          <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> System Operational</span>
          <span>Powered by Gemini 1.5 Pro</span>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ value, label, icon }: { value: string, label: string, icon: any }) {
  return (
    <div className="p-4 bg-slate-900/80 backdrop-blur border border-white/10 rounded-2xl flex flex-col items-center justify-center hover:border-blue-500/30 transition-colors group">
      <div className="mb-2 p-2 bg-white/5 rounded-full group-hover:scale-110 transition-transform">{icon}</div>
      <div className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-1 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
        {value}
      </div>
      <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</div>
    </div>
  )
}
