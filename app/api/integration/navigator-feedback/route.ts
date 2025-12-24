
import { NextResponse } from 'next/server'
import db from '@/lib/db'

export async function POST(req: Request) {
    try {
        const { issueType, success, feedback } = await req.json()

        // 1. Update the Global Pattern Memory
        // Upsert ensures we create the pattern if it's the first time seeing this issue type
        const pattern = await db.accessibilityPattern.upsert({
            where: { issueType: issueType || 'general' },
            update: {
                successfulFixes: { increment: success ? 1 : 0 },
                failedFixes: { increment: success ? 0 : 1 },
                lastLearnedAt: new Date(),
                // Simplistic learning: If failing, add a "Stricter" modifier
                promptModifier: success ? undefined : "Focus strictly on native HTML elements over ARIA."
            },
            create: {
                issueType: issueType || 'general',
                successfulFixes: success ? 1 : 0,
                failedFixes: success ? 0 : 1,
                promptModifier: "Always verify keyboard focusability."
            }
        })

        // 2. Log this "Learning Event"
        await db.activityLog.create({
            data: {
                mode: 'integration',
                action: 'learning_update',
                details: JSON.stringify({
                    pattern: issueType,
                    learned: success ? "Reinforced Success" : "Detected Flaw",
                    newModifier: pattern.promptModifier
                })
            }
        })

        return NextResponse.json({ success: true, learned: true })

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
