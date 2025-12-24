
import { NextResponse } from 'next/server'
import { scoreHtml } from '@/lib/accessibility/lighthouse'

export async function POST(req: Request) {
    try {
        const { html } = await req.json()

        if (!html) {
            return NextResponse.json({ error: 'HTML content is required' }, { status: 400 })
        }

        const report = await scoreHtml(html)

        return NextResponse.json({
            success: true,
            score: report.score,
            details: report.jsonReport?.audits || []
        })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
