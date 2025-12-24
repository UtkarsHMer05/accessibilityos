import { NextResponse } from 'next/server'
import { geminiClient } from '@/lib/gemini/client'

export const maxDuration = 60

export async function POST(req: Request) {
    try {
        const { code, issues } = await req.json()

        if (!code) {
            return NextResponse.json({ success: false, error: 'No code provided' }, { status: 400 })
        }

        if (!issues || issues.length === 0) {
            return NextResponse.json({ success: false, error: 'No issues to fix' }, { status: 400 })
        }

        // Format issues for Gemini
        const issuesList = issues.map((i: any, idx: number) =>
            `${idx + 1}. [${i.severity?.toUpperCase() || 'MEDIUM'}] ${i.description || i.issue} (Element: ${i.element})`
        ).join('\n')

        const prompt = `You are an expert Accessibility Engineer. Navigator AI found these issues during verification:

ISSUES FOUND BY NAVIGATOR:
${issuesList}

CURRENT CODE (that failed verification):
\`\`\`html
${code.slice(0, 10000)}
\`\`\`

YOUR TASK:
1. Fix ALL the issues listed above
2. Return ONLY the complete fixed HTML code
3. Make sure all accessibility violations are resolved
4. Each fix should address the specific element mentioned
5. Do NOT include any explanation, markdown, or code fences - JUST the raw HTML

Return ONLY the fixed HTML:`

        try {
            const model = geminiClient.getProModel()
            const result = await model.generateContent(prompt)
            let fixedHTML = result.response.text()

            // Clean up any markdown formatting
            fixedHTML = fixedHTML.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim()

            console.log('🔄 Auto-fix loop: Fixed', issues.length, 'issues from Navigator')

            // Log to activity
            try {
                const db = (await import('@/lib/db')).default
                await db.activityLog.create({
                    data: {
                        mode: 'healer',
                        action: 'auto_fix_from_navigator',
                        details: { issuesFixed: issues.length, loopIteration: true }
                    }
                })
            } catch (dbError) {
                console.warn('DB log failed:', dbError)
            }

            return NextResponse.json({
                success: true,
                fixedHTML,
                issuesFixed: issues.length,
                message: `Fixed ${issues.length} issues found by Navigator`
            })

        } catch (geminiError: any) {
            console.error('⚠️ Gemini auto-fix error:', geminiError.message)
            return NextResponse.json({
                success: false,
                error: geminiError.message,
                fixedHTML: code // Return original if failed
            })
        }

    } catch (error: any) {
        console.error('Auto-fix loop error:', error)
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}
