
import { geminiClient } from './client'
import { retryGeminiCall } from './utils'

export async function scanHTMLForIssues(htmlCode: string): Promise<any[]> {
  const model = geminiClient.getFlashModel()

  const prompt = `
    You are an expert Accessibility Auditor (WCAG 2.1 AA).
    Your job is to find accessibility issues in the provided HTML code.
    
    FOCUS ON THESE VIOLATIONS:
    1. Interactive elements that are not keyboard accessible (e.g. <div onclick="..."> instead of <button>).
    2. Form inputs missing associated labels.
    3. Images missing valid alt text.
    4. Non-descriptive link text (e.g. "click here").
    5. Color contrast issues (if inline styles or style tags are visible).
    
    HTML TO AUDIT:
    \`\`\`html
    ${htmlCode.substring(0, 15000)}
    \`\`\`
    
    RETURN FORMAT JSON ARRAY:
    [
      { 
        "type": "issue-type-id", 
        "element": "exact substring of the element code", 
        "description": "Clear explanation of the accessibility failure",
        "suggestion": "Specific recommendation for fixing it" 
      }
    ]
    
    Return ONLY valid JSON. No markdown.
  `

  try {
    const result = await retryGeminiCall(() => model.generateContent(prompt))
    const text = result.response.text()
    // Strip markdown if present
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim()
    return JSON.parse(cleanJson)
  } catch (error: any) {
    console.error('❌ Gemini Flash Scan Failed (after retries):', error.message)
    // Return empty array so we don't show "Mock" junk. 
    // The user will see Axe results at least.
    return []
  }
}
