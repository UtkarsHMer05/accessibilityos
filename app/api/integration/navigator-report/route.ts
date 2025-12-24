
import { NextResponse } from 'next/server'
import db from '@/lib/db'

export async function POST(req: Request) {
    try {
        const { taskId, issueDescription } = await req.json()

        // DEFAULT FALLBACK (For Demo Mode where taskId might be "demo-task-...")
        // If DB fails or task is not found, we redirect to Healer anyway with a "Demo Issue ID"
        let newIssueId = 'demo-navigator-issue-' + Date.now()

        try {
            // 1. Find the parent task to get the URL
            const task = await db.accessibilityIssue.findUnique({
                where: { id: taskId }
            })

            if (task) {
                // 2. Create the "Navigator Reported" Issue
                const newIssue = await db.accessibilityIssue.create({
                    data: {
                        websiteUrl: task.websiteUrl,
                        issueType: 'navigator_reported',
                        sourceMode: 'navigator',
                        description: issueDescription || "User reported accessibility barrier",
                        severity: 'critical',
                        status: 'detected',
                        detectedAt: new Date()
                    }
                })
                newIssueId = newIssue.id
            }

            // 3. Log Activity (Best effort)
            await db.activityLog.create({
                data: {
                    mode: 'integration',
                    action: 'navigator_report_logged',
                    details: {
                        from: 'navigator',
                        to: 'healer',
                        issueId: newIssueId,
                        note: "Healer auto-fix requested"
                    }
                }
            })

        } catch (dbError) {
            console.warn("⚠️ Navigator Report: DB failed or Demo Task ID used. Using Fallback.", dbError)
            // Swallow error and proceed with the fake ID
        }

        return NextResponse.json({
            success: true,
            issueId: newIssueId,
            redirectUrl: `/healer?fixIssue=${newIssueId}`
        })

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
