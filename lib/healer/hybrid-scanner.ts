
import { scanHTML as scanLocal } from '@/lib/accessibility/axe-scanner'
import { scanHTMLForIssues as scanGemini } from '@/lib/gemini/flash'

export interface HybridScanResult {
    violations: any[]
    scoreEstimation: number
    source: 'hybrid' | 'local_only'
}

/**
 * Merges Axe-core (Deterministic) and Gemini (Probabilistic) results.
 * Gracefully degrades to Axe-only if Gemini is rate limited.
 */
export async function hybridScan(html: string): Promise<HybridScanResult> {
    // 1. Run Local Scan (Fast, Blocking)
    const localResult = await scanLocal(html)
    let mergedViolations = [...localResult.violations]

    // 2. Run Gemini Scan (Slow, Non-Blocking attempt)
    try {
        // We only scan snippet if it's not huge to save tokens
        const geminiIssues = await scanGemini(html)

        // Transform Gemini issues to match Axe format
        const geminiViolations = geminiIssues.map((issue: any) => ({
            id: `ai-${issue.type}`, // distinct ID prefix
            impact: 'serious', // Assume AI finds non-trivial stuff
            description: issue.suggestion || issue.description || 'AI detected usability issue',
            help: 'AI Suggestion',
            nodes: [
                {
                    html: issue.element,
                    target: ['AI_Context_Match'],
                    failureSummary: issue.suggestion
                }
            ]
        }))

        // Merge!
        mergedViolations = [...mergedViolations, ...geminiViolations]

        return {
            violations: mergedViolations,
            scoreEstimation: localResult.scoreEstimation, // Keep axe score as baseline
            source: 'hybrid'
        }

    } catch (e) {
        console.warn('Hybrid Scan: Gemini skipped (Rate Limit/Error)', e)
        return {
            violations: mergedViolations,
            scoreEstimation: localResult.scoreEstimation,
            source: 'local_only'
        }
    }
}
