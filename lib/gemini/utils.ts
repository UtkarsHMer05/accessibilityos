
export async function retryGeminiCall<T>(
    fn: () => Promise<T>,
    retries = 3,
    delay = 2000
): Promise<T> {
    try {
        return await fn()
    } catch (error: any) {
        if (retries > 0 && (error.message?.includes('429') || error.status === 429)) {
            const recommendedWait = 32000 // 32s average
            const finalDelay = Math.max(delay, (4 - retries) * 10000) // 10s, 20s, 30s
            console.warn(`⚠️ Gemini Rate Limit (429). Retrying in ${finalDelay}ms... (${retries} attempts left)`)

            await new Promise(resolve => setTimeout(resolve, finalDelay))
            return retryGeminiCall(fn, retries - 1, finalDelay)
        }
        throw error
    }
}
