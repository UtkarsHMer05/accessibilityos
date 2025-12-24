import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
    try {
        const activities = await prisma.activityLog.findMany({
            orderBy: { timestamp: 'desc' },
            take: 50
        })

        return NextResponse.json(activities)
    } catch (error: any) {
        console.error('Activity feed error:', error)
        // Return empty array instead of 500 on error
        return NextResponse.json([])
    }
}
