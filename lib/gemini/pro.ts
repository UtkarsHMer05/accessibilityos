
import { geminiClient } from './client'
import { retryGeminiCall } from './utils'

interface AxeViolation {
    id: string
    impact: string
    description: string
    nodes: any[]
}

interface FixResult {
    thinking: string
    fixedCode: string
}

export async function generateAccessibilityFix(
    htmlSnippet: string,
    violation: AxeViolation
): Promise<FixResult> {
    const model = geminiClient.getProModel()

    const prompt = `
    You are an expert Frontend Accessibility Engineer.
    
    TASK: Fix this specific accessibility violation.
    VIOLATION: ${violation.description}
    CONTEXT: ${violation.id}
    
    BAD CODE:
    \`\`\`html
    ${htmlSnippet}
    \`\`\`
    
    INSTRUCTIONS:
    1. rewrite the code to be WCAG 2.1 compliant.
    2. If it's a "fake button", change it to a <button>.
    3. If labels are missing, add <label> or aria-label.
    4. Maintain original classes/IDs.
    
    OUTPUT FORMAT:
    THINKING: [Brief explanation of fix]
    FIXED_CODE: [The corrected HTML snippet]
  `

    try {
        const result = await retryGeminiCall(() => model.generateContent(prompt))
        const response = result.response.text()

        // Parsing with regex to handle potential markdown variations
        const thinkingMatch = response.match(/THINKING:\s*([\s\S]*?)(?=FIXED_CODE:|$)/i)
        const codeMatch = response.match(/FIXED_CODE:\s*([\s\S]*)/i)

        let fixedCode = codeMatch ? codeMatch[1].trim() : htmlSnippet

        // Cleanup: Remove markdown code blocks if the AI added them inside the block
        fixedCode = fixedCode.replace(/```html/g, '').replace(/```/g, '').trim()

        return {
            thinking: thinkingMatch ? thinkingMatch[1].trim() : 'AI fixed the issue based on WCAG standards.',
            fixedCode: fixedCode
        }
    } catch (error: any) {
        console.error('❌ Gemini Fix Failed (after retries):', error.message)
        // Return original code so Diff Viewer shows NO CHANGE (instead of fake change)
        return {
            thinking: `Failed to generate fix: ${error.message}. Please check API quota.`,
            fixedCode: htmlSnippet
        }
    }
}
