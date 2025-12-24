
import axe from 'axe-core'
import { JSDOM } from 'jsdom'

export interface ScanResult {
    violations: any[]
    passes: number
    incomplete: number
    scoreEstimation: number
}

export async function scanHTML(htmlString: string): Promise<ScanResult> {
    // 1. Parse HTML into a virtual DOM
    const dom = new JSDOM(htmlString)

    // 2. Hack: axe-core requires a global window/document to run
    // We attach the virtual window to the global scope temporarily
    // Note: This might need isolation in a real concurrent server (Worker Threads)
    // For basic MVP/CLI it works perfectly.
    const oldWindow = global.window
    const oldDocument = global.document

    // @ts-ignore
    global.window = dom.window
    // @ts-ignore
    global.document = dom.window.document
    // @ts-ignore
    global.Node = dom.window.Node

    try {
        const results = await axe.run(dom.window.document.documentElement, {
            runOnly: {
                type: 'tag',
                values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']
            },
            rules: {
                'color-contrast': { enabled: false }, // Requires layout/canvas
                'link-in-text-block': { enabled: false }, // often fails in jsdom
                'region': { enabled: false } // overly strict for snippets
            }
        })

        // Simple mock score estimation based on pass/fail ratio
        const total = results.passes.length + results.violations.length
        const score = total > 0 ? Math.round((results.passes.length / total) * 100) : 100

        return {
            violations: results.violations,
            passes: results.passes.length,
            incomplete: results.incomplete.length,
            scoreEstimation: score
        }
    } catch (error) {
        console.error('Axe Scan Error:', error)
        throw error
    } finally {
        // Cleanup globals
        if (oldWindow) global.window = oldWindow
        if (oldDocument) global.document = oldDocument
    }
}
