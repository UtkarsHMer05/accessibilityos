
import { NextResponse } from 'next/server'
import { geminiClient } from '@/lib/gemini/client'

export async function POST(req: Request) {
    try {
        const { message, codeContext, conversationHistory } = await req.json()

        const model = geminiClient.getProModel()

        // Build conversation context
        const historyContext = conversationHistory && conversationHistory.length > 0
            ? `\n\nRecent conversation:\n${conversationHistory.map((m: any) => `${m.role === 'user' ? 'User' : 'You'}: ${m.content}`).join('\n')}`
            : ''

        const systemPrompt = `You are Navigator, an AI accessibility assistant for web developers.

Your personality:
- Friendly, helpful, and conversational (like a knowledgeable colleague)
- You give practical, actionable advice
- You keep responses concise but thorough (2-4 sentences usually)
- You can analyze HTML code for WCAG 2.1 accessibility issues
- You explain things simply without being condescending

${codeContext ? `
The user shared this code to analyze:
\`\`\`html
${codeContext}
\`\`\`
When discussing this code, point out specific issues you see.
` : ''}
${historyContext}

User's current message: "${message}"

Respond naturally and helpfully. Focus on accessibility topics but be conversational.
If they ask about their code, analyze it for accessibility issues.
If they ask general questions, answer them knowledgeably.
Don't be overly restrictive - try to help with whatever they're asking about.`

        const result = await model.generateContent(systemPrompt)
        const response = result.response.text()

        return NextResponse.json({
            success: true,
            response: response
        })
    } catch (error: any) {
        console.error('Navigator chat error:', error)
        return NextResponse.json({
            success: false,
            response: "I'm having trouble processing that. Could you try again?",
            error: error.message
        }, { status: 500 })
    }
}
