
import { GoogleGenerativeAI } from '@google/generative-ai'
import 'dotenv/config'

const API_KEY = process.env.GEMINI_API_KEY || ''
const genAI = new GoogleGenerativeAI(API_KEY)

async function listModels() {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' }) // Fallback check
        console.log('Testing gemini-pro availability...')
        const result = await model.generateContent('Hello')
        console.log('✅ gemini-pro is working!', result.response.text())
    } catch (e: any) {
        console.error('❌ gemini-pro failed:', e.message)
    }
}

listModels()
