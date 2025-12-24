// Simplified Lighthouse-like scoring for HTML content
// The actual Lighthouse library has dynamic imports that don't work with Next.js bundler
// This provides a simpler accessibility scoring function

export async function scoreHtml(html: string): Promise<{ score: number, jsonReport?: any }> {
    // Simple heuristic scoring based on common accessibility issues
    let score = 100
    const issues: string[] = []

    // Check for images without alt text
    const imgWithoutAlt = (html.match(/<img(?![^>]*alt=)[^>]*>/gi) || []).length
    if (imgWithoutAlt > 0) {
        score -= imgWithoutAlt * 5
        issues.push(`${imgWithoutAlt} images missing alt text`)
    }

    // Check for buttons/links without accessible names
    const emptyButtons = (html.match(/<button[^>]*>\s*<\/button>/gi) || []).length
    if (emptyButtons > 0) {
        score -= emptyButtons * 10
        issues.push(`${emptyButtons} empty buttons`)
    }

    // Check for form inputs without labels
    const inputsWithoutLabels = (html.match(/<input(?![^>]*aria-label)[^>]*>/gi) || []).length
    const labels = (html.match(/<label/gi) || []).length
    if (inputsWithoutLabels > labels) {
        score -= (inputsWithoutLabels - labels) * 5
        issues.push(`${inputsWithoutLabels - labels} inputs may lack labels`)
    }

    // Check for proper heading hierarchy
    const h1Count = (html.match(/<h1/gi) || []).length
    if (h1Count === 0 && html.length > 500) {
        score -= 5
        issues.push('No h1 heading found')
    } else if (h1Count > 1) {
        score -= 5
        issues.push('Multiple h1 headings')
    }

    // Check for lang attribute
    if (!html.match(/<html[^>]*lang=/i)) {
        score -= 5
        issues.push('Missing lang attribute on html')
    }

    // Ensure score stays in range
    score = Math.max(0, Math.min(100, score))

    return {
        score,
        jsonReport: {
            audits: issues.map(issue => ({
                id: issue.toLowerCase().replace(/\s+/g, '-'),
                title: issue,
                score: 0
            }))
        }
    }
}

// Export runLighthouse as alias for compatibility
export const runLighthouse = scoreHtml
