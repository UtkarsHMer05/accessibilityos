
import { JSDOM } from 'jsdom'
import { generateAccessibilityFix } from '../gemini/pro'

interface FixAction {
    issueId: string
    originalCode: string
    fixedCode: string
    thinking: string
    applied: boolean
}

export interface HealerResult {
    fixedHTML: string
    fixes: FixAction[]
    logs: string[]
}

export async function healHTML(originalHTML: string, violations: any[]): Promise<HealerResult> {
    const dom = new JSDOM(originalHTML)
    const document = dom.window.document
    const fixes: FixAction[] = []
    const logs: string[] = []

    logs.push(`Starting Healer loop. Violations to fix: ${violations.length}`)

    // If no violations or violations don't have proper nodes, 
    // fall back to a whole-document fix approach
    const hasProperNodes = violations.some(v =>
        v.nodes && Array.isArray(v.nodes) && v.nodes.length > 0 &&
        v.nodes[0].target && v.nodes[0].target.length > 0
    )

    if (!hasProperNodes) {
        logs.push('No specific node selectors found - using whole-document fix approach')

        // Fix the entire HTML at once
        try {
            for (const violation of violations) {
                const result = await generateAccessibilityFix(originalHTML, violation)

                if (result.fixedCode && result.fixedCode !== originalHTML) {
                    fixes.push({
                        issueId: violation.id || 'general',
                        originalCode: originalHTML.substring(0, 200) + '...',
                        fixedCode: result.fixedCode.substring(0, 200) + '...',
                        thinking: result.thinking,
                        applied: true
                    })
                    logs.push(`✅ Fix generated for: ${violation.id || violation.description}`)

                    // Return the fixed HTML from the first successful fix
                    return {
                        fixedHTML: result.fixedCode,
                        fixes,
                        logs
                    }
                }
            }
        } catch (err) {
            logs.push(`❌ Whole-document fix failed: ${err}`)
        }

        // If all else fails, return original
        return {
            fixedHTML: originalHTML,
            fixes,
            logs
        }
    }

    // Original approach: Fix specific elements using CSS selectors
    for (const violation of violations) {
        if (!violation.nodes || !Array.isArray(violation.nodes)) continue;

        for (const node of violation.nodes) {
            if (!node.target || node.target.length === 0) continue;

            const selector = node.target[0]
            logs.push(`Attempting fix for ${violation.id} at ${selector}`)

            try {
                const element = document.querySelector(selector)
                if (!element) {
                    logs.push(`⚠️ Element not found for selector: ${selector}`)
                    continue
                }

                const originalCode = element.outerHTML

                // Call Gemini
                const geminiResult = await generateAccessibilityFix(originalCode, violation)

                if (geminiResult.fixedCode && geminiResult.fixedCode !== originalCode) {
                    // Apply the fix
                    const tempDiv = document.createElement('div')
                    tempDiv.innerHTML = geminiResult.fixedCode

                    if (tempDiv.firstElementChild) {
                        element.replaceWith(tempDiv.firstElementChild)

                        fixes.push({
                            issueId: violation.id,
                            originalCode,
                            fixedCode: geminiResult.fixedCode,
                            thinking: geminiResult.thinking,
                            applied: true
                        })
                        logs.push(`✅ Fix applied for ${violation.id}`)
                    }
                } else {
                    logs.push(`⚠️ No fix generated or code identical for ${violation.id}`)
                }

            } catch (err) {
                logs.push(`❌ Error fixing ${violation.id}: ${err}`)
            }
        }
    }

    // Return just the body's inner content
    const fixedHTML = document.body.innerHTML

    return {
        fixedHTML,
        fixes,
        logs
    }
}
