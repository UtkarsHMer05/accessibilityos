import { geminiClient } from './lib/gemini/client'

async function test() {
    console.log('Testing Gemini API...')
    try {
        const model = geminiClient.getProModel()
        const result = await model.generateContent('Say hello in one word')
        console.log('✅ API Response:', result.response.text())
    } catch (e: any) {
        console.error('❌ API Error:', e.message)
    }
}

test()
