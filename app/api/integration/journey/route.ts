import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
    try {
        // Get REAL issues from database, ordered by detection time
        const issues = await prisma.accessibilityIssue.findMany({
            orderBy: { detectedAt: 'asc' },
            take: 10
        })

        // Get real activity logs
        const logs = await prisma.activityLog.findMany({
            orderBy: { timestamp: 'asc' },
            take: 20
        })

        // Get real counts for health calculation
        const [totalIssues, fixedIssues, verifiedIssues, crossLinked] = await Promise.all([
            prisma.accessibilityIssue.count(),
            prisma.accessibilityIssue.count({ where: { status: 'fixed' } }),
            prisma.accessibilityIssue.count({ where: { status: 'verified' } }),
            prisma.accessibilityIssue.count({ where: { relatedIssueId: { not: null } } })
        ])

        const hasData = totalIssues > 0 || logs.length > 0

        // Format issues into journey timeline
        const timeline = issues.map((issue: any, idx: number) => ({
            mode: issue.sourceMode || 'healer',
            icon: issue.status === 'verified' ? '✅' :
                issue.status === 'fixed' ? '🛠️' :
                    issue.status === 'open' ? '🔍' : '⚠️',
            time: new Date(issue.detectedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            title: issue.status === 'verified' ? 'Verified' :
                issue.status === 'fixed' ? 'Fixed' : 'Detected',
            description: issue.description || issue.issueType,
            status: issue.status === 'verified' ? 'success' :
                issue.status === 'fixed' ? 'completed' :
                    issue.status === 'open' ? 'completed' : 'warning',
            code: issue.status === 'fixed' ? {
                before: `Element with issue: ${issue.issueType}`,
                after: `Fixed: ${issue.issueType}`
            } : null
        }))

        // Calculate REAL health metrics
        const fixRate = totalIssues > 0 ? Math.round((fixedIssues / totalIssues) * 100) : 0
        const verifyRate = fixedIssues > 0 ? Math.round((verifiedIssues / fixedIssues) * 100) : 0
        const crossLinkRate = totalIssues > 0 ? Math.round((crossLinked / totalIssues) * 100) : 0

        return NextResponse.json({
            hasData,
            timeline,
            health: {
                overall: hasData ? Math.round((fixRate + verifyRate + crossLinkRate) / 3) : 0,
                crossModeFlow: crossLinkRate,
                autoTrigger: verifyRate,
                feedbackLoop: fixRate,
                learningEffectiveness: hasData ? Math.min(fixRate, 100) : 0
            },
            stats: {
                totalIssues,
                fixedIssues,
                verifiedIssues,
                crossLinked
            }
        })
    } catch (error) {
        console.error('Journey API error:', error)
        return NextResponse.json({
            hasData: false,
            timeline: [],
            health: { overall: 0, crossModeFlow: 0, autoTrigger: 0, feedbackLoop: 0, learningEffectiveness: 0 },
            stats: { totalIssues: 0, fixedIssues: 0, verifiedIssues: 0, crossLinked: 0 }
        })
    }
}
