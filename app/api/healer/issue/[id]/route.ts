
import { NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const issue = await db.accessibilityIssue.findUnique({
            where: { id },
            include: {
                website: true
            }
        })

        if (!issue) {
            return NextResponse.json({
                success: false,
                error: 'Issue not found'
            }, { status: 404 })
        }

        // Try to get the HTML from the website record or return the code location
        return NextResponse.json({
            success: true,
            issue: {
                id: issue.id,
                type: issue.issueType,
                description: issue.description,
                severity: issue.severity,
                codeLocation: issue.codeLocation,
                websiteUrl: issue.websiteUrl
            },
            // In a real app, we'd fetch/store the actual HTML
            html: issue.codeLocation
        })
    } catch (error: any) {
        console.error('Failed to fetch issue:', error)
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}
