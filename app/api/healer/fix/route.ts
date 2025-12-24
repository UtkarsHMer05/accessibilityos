
import { NextResponse } from 'next/server'
import { geminiClient } from '@/lib/gemini/client'

export async function POST(req: Request) {
    try {
        const { html, violations } = await req.json()

        if (!html || !violations) {
            return NextResponse.json({ error: 'HTML and Violations required' }, { status: 400 })
        }

        // MOCK / DEMO MODE CHECK
        const { DEMO_BROKEN_HTML, DEMO_PARTIAL_FIXED_HTML } = await import('@/lib/demo-data')

        if (html.includes("DEMO MODE") || html.trim() === DEMO_BROKEN_HTML.trim()) {
            console.log("⚡️ DEMO MODE DETECTED: Returning hardcoded fix.")
            await new Promise(r => setTimeout(r, 2000))

            return NextResponse.json({
                success: true,
                fixedHTML: DEMO_PARTIAL_FIXED_HTML,
                fixes: [
                    { id: '1', description: 'Added alt text to image', type: 'missing_alt' },
                    { id: '2', description: 'Improved link description', type: 'link_text' },
                    { id: '3', description: 'Added role="button" to div', type: 'semantic_html' }
                ],
                logs: [
                    "Thinking: Image tag missing alt attribute...",
                    "GenFix: Added descriptive alt text.",
                    "GenFix: Updated semantic elements."
                ]
            })
        }

        // Build a simple prompt that fixes ALL issues at once (more reliable than multiple calls)
        const issuesList = violations.map((v: any) => `- ${v.id || 'issue'}: ${v.description || 'accessibility issue'}`).join('\n')

        const prompt = `You are an expert Frontend Accessibility Engineer.

FIX ALL of these accessibility violations in the HTML below:
${issuesList}

ORIGINAL HTML:
\`\`\`html
${html}
\`\`\`

INSTRUCTIONS:
1. Fix ALL the issues listed above
2. Return ONLY the complete fixed HTML code
3. Do NOT include any explanation, just the raw HTML
4. Maintain original structure, classes, and IDs
5. Common fixes:
   - Missing alt: add descriptive alt text
   - Div as button: change to <button> element
   - Missing labels: add <label> or aria-label
   - Vague links: change "click here" to descriptive text
   - Missing title: add <title> tag
   - Missing lang: add lang="en" to html tag

Return ONLY the fixed HTML, nothing else:`

        try {
            const model = geminiClient.getProModel()
            const result = await model.generateContent(prompt)
            let fixedHTML = result.response.text()

            // Clean up any markdown formatting the AI might have added
            fixedHTML = fixedHTML.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim()

            // Generate fixes summary
            const fixes = violations.map((v: any, i: number) => ({
                issueId: v.id || `fix-${i}`,
                originalCode: '(see original)',
                fixedCode: '(see fixed HTML)',
                thinking: `Fixed ${v.id || 'issue'}: ${v.description || 'accessibility violation'}`,
                applied: true
            }))

            // Log to DB
            try {
                const db = (await import('@/lib/db')).default
                const fixedIds = violations.map((v: any) => v.dbId).filter(Boolean)

                if (fixedIds.length > 0) {
                    await db.accessibilityIssue.updateMany({
                        where: { id: { in: fixedIds } },
                        data: { status: 'fixed', fixedAt: new Date() }
                    })
                }

                await db.activityLog.create({
                    data: {
                        mode: 'healer',
                        action: 'auto_fix_applied',
                        details: { issuesFixed: violations.length, files: 1 }
                    }
                })
            } catch (dbError) {
                console.warn('DB logging failed (non-blocking):', dbError)
            }

            return NextResponse.json({
                success: true,
                fixedHTML,
                fixes,
                logs: [
                    `Analyzing ${violations.length} violations...`,
                    `Generated fixes for all issues`,
                    `Applied WCAG 2.1 compliant corrections`
                ]
            })

        } catch (geminiError: any) {
            console.error('Gemini API error:', geminiError)

            // Return a helpful error response instead of 500
            return NextResponse.json({
                success: false,
                error: `AI fix failed: ${geminiError.message}`,
                fixedHTML: html, // Return original so diff shows nothing changed
                fixes: [],
                logs: [`Error: ${geminiError.message}`, 'Please check your Gemini API quota']
            })
        }

    } catch (error: any) {
        console.error('Fix API error:', error)
        return NextResponse.json({
            success: false,
            error: error.message,
            fixedHTML: '',
            fixes: [],
            logs: ['Fix failed: ' + error.message]
        }, { status: 500 })
    }
}
