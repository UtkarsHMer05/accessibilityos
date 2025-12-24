
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const { mode, action, details } = await req.json()

        const db = (await import('@/lib/db')).default

        await db.activityLog.create({
            data: {
                mode: mode || 'system',
                action: action || 'unknown',
                details: details || {}
            }
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Activity log error:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
