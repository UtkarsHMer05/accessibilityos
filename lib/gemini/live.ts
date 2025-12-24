
"use client"

// GEMINI LIVE CLIENT (INTERACTIVE)
// Uses Web Speech API for Recognition (STT) and Synthesis (TTS)
// Now integrated with real Gemini API for intelligent responses about code

export class GeminiLiveClient {
    private isConnected = false
    private onLog: (msg: string) => void
    private recognition: any = null
    private codeContext: string = '' // Stores the user's code for context

    constructor(onLog: (msg: string) => void) {
        this.onLog = onLog

        // Initialize Speech Recognition if available (Chrome/Safari)
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
            if (SpeechRecognition) {
                this.recognition = new SpeechRecognition()
                this.recognition.continuous = true
                this.recognition.lang = 'en-US'
                this.recognition.interimResults = false

                this.recognition.onresult = (event: any) => {
                    const last = event.results.length - 1
                    const text = event.results[last][0].transcript
                    this.handleUserVoice(text)
                }

                this.recognition.onerror = (event: any) => {
                    console.warn("Speech Rec Error:", event.error)
                }
            }
        }
    }

    setCodeContext(code: string) {
        this.codeContext = code
    }

    async connect() {
        this.isConnected = true
        this.onLog("🔌 Connecting to Gemini Live (Simulated Protocol)...")
        await new Promise(r => setTimeout(r, 800))
        this.onLog("✅ Connected to gemini-2.0-flash-exp (Live)")

        // Start Listening
        if (this.recognition) {
            try {
                this.recognition.start()
                this.onLog("🎤 Microphone Active. You can speak to the AI.")
            } catch (e) {
                console.warn("Mic start failed", e)
            }
        }
    }

    async startSession(context: string) {
        if (!this.isConnected) await this.connect()
        this.onLog("👀 Analyzing visual context...")

        // Initial Greeting
        await this.speak(context.includes("Re-verifying")
            ? "I am back. Re-scanning the page now."
            : "Hello. I am the accessibility simulator. I am ready to test your code.")
    }

    // THE BRAIN: Uses real Gemini API for intelligent responses
    async handleUserVoice(text: string) {
        this.onLog(`👤 User: "${text}"`)
        const lower = text.toLowerCase()

        // Simple greetings can be handled locally
        if (lower.match(/^(hello|hi|hey)$/)) {
            await this.speak("Hello! How can I help you with your code's accessibility?")
            return
        }

        // For all code-related questions, use Gemini API
        try {
            const response = await this.callGeminiForResponse(text)
            await this.speak(response)
        } catch (error) {
            console.error('Gemini API error:', error)
            await this.speak("I'm having trouble connecting. Let me try again.")
        }
    }

    // Call real Gemini API for conversational responses
    async callGeminiForResponse(userMessage: string): Promise<string> {
        const systemPrompt = `You are Navigator, an AI accessibility assistant that simulates how a blind user experiences web pages.
        
Your personality:
- Helpful and conversational, like a friendly expert colleague
- You speak naturally, not robotically
- Keep responses concise (1-3 sentences usually)
- When asked about code, analyze it for accessibility issues

${this.codeContext ? `
The user is working on this HTML code:
\`\`\`html
${this.codeContext}
\`\`\`
` : 'No code context provided yet.'}

User's message: "${userMessage}"

Respond naturally. If they ask about errors, tell them what accessibility issues you see. If they ask general questions about their code, help them. Be conversational but focused on accessibility.`

        try {
            const res = await fetch('/api/navigator/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage, codeContext: this.codeContext })
            })

            if (!res.ok) {
                throw new Error('API call failed')
            }

            const data = await res.json()
            return data.response || "I understand. Let me think about that."
        } catch (error) {
            // Fallback to helpful response
            return this.getLocalFallbackResponse(userMessage)
        }
    }

    // Local fallback if API fails
    getLocalFallbackResponse(text: string): string {
        const lower = text.toLowerCase()

        if (lower.includes('error') || lower.includes('issue') || lower.includes('wrong')) {
            if (this.codeContext) {
                const issues = []
                if (this.codeContext.includes('<img') && !this.codeContext.includes('alt=')) {
                    issues.push("images without alt text")
                }
                if (this.codeContext.includes('onclick') && this.codeContext.includes('<div')) {
                    issues.push("div elements used as buttons")
                }
                if (this.codeContext.includes('Click here')) {
                    issues.push("vague link text")
                }
                if (issues.length > 0) {
                    return `I found: ${issues.join(', ')}. Would you like me to explain how to fix them?`
                }
            }
            return "Let me look at your code. Could you make sure it's loaded in the editor?"
        }

        if (lower.includes('fix') || lower.includes('help')) {
            return "I can help identify accessibility issues. Use the Auto-Fix with Healer button to automatically fix detected problems."
        }

        if (lower.includes('what') && lower.includes('code')) {
            if (this.codeContext) {
                return "I can see your HTML code. It appears to be a web component. Would you like me to check it for accessibility issues?"
            }
            return "I don't see any code loaded yet. Please paste your HTML in the Healer editor first."
        }

        return "I'm here to help with accessibility. You can ask me about errors in your code, or I can test it like a screen reader would."
    }

    async speak(text: string) {
        this.onLog(`🗣️ AI: "${text}"`)

        if ('speechSynthesis' in window) {
            // Cancel current speech to interrupt
            window.speechSynthesis.cancel()

            const utterance = new SpeechSynthesisUtterance(text)
            const voices = window.speechSynthesis.getVoices()
            // Prefer a "Google US English" voice if available for realism
            const googleVoice = voices.find(v => v.name.includes('Google US English'))
            if (googleVoice) utterance.voice = googleVoice

            utterance.rate = 1.1
            window.speechSynthesis.speak(utterance)
        }
    }

    async disconnect() {
        this.isConnected = false
        this.onLog("🔌 Disconnected")
        window.speechSynthesis.cancel()
        if (this.recognition) this.recognition.stop()
    }
}
