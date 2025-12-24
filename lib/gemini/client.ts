
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai'
import 'dotenv/config' // Auto-load .env files in scripts

const API_KEY = process.env.GEMINI_API_KEY || ''

class GeminiClient {
    private genAI: GoogleGenerativeAI
    private proModel: GenerativeModel
    private flashModel: GenerativeModel

    constructor() {
        if (!API_KEY) {
            console.warn('⚠️ GEMINI_API_KEY is missing. AI features will fail.')
        }
        this.genAI = new GoogleGenerativeAI(API_KEY)
        // Using Gemini 2.0 Flash (stable) - Latest Google AI model
        // Higher rate limits than experimental versions
        this.proModel = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
        this.flashModel = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    }

    getProModel() {
        return this.proModel
    }

    getFlashModel() {
        return this.flashModel
    }
}

// Singleton instance
export const geminiClient = new GeminiClient()
