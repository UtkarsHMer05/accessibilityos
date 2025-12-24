import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
    try {
        // Get REAL activity logs from the database
        const [healerLogs, navigatorLogs, stats] = await Promise.all([
            prisma.activityLog.findMany({
                where: { mode: 'healer' },
                orderBy: { timestamp: 'desc' },
                take: 10
            }),
            prisma.activityLog.findMany({
                where: { mode: 'navigator' },
                orderBy: { timestamp: 'desc' },
                take: 10
            }),
            prisma.activityLog.count()
        ])

        // Format logs for display
        const formatLogs = (logs: any[]) => logs.map(log => ({
            time: new Date(log.timestamp).toLocaleTimeString('en-US', { hour12: false }),
            text: log.action,
            color: log.action.includes('Error') || log.action.includes('Found') ? 'text-red-400' :
                log.action.includes('Fixed') || log.action.includes('Applied') || log.action.includes('✅') ? 'text-emerald-400' :
                    log.action.includes('Scanning') || log.action.includes('Generating') ? 'text-blue-400' :
                        'text-slate-400'
        }))

        return NextResponse.json({
            hasData: healerLogs.length > 0 || navigatorLogs.length > 0,
            healerLogs: formatLogs(healerLogs.reverse()),
            navigatorLogs: formatLogs(navigatorLogs.reverse()),
            stats: {
                totalOperations: stats,
                healerActive: healerLogs.length > 0,
                navigatorActive: navigatorLogs.length > 0
            }
        })
    } catch (error) {
        console.error('Live feed API error:', error)
        return NextResponse.json({
            hasData: false,
            healerLogs: [],
            navigatorLogs: [],
            stats: { totalOperations: 0, healerActive: false, navigatorActive: false }
        })
    }
}
