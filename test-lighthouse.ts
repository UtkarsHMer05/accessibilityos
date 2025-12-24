
import { scoreHtml } from './lib/accessibility/lighthouse'

async function main() {
    const html = `
    <!DOCTYPE html>
    <title>Test</title>
    <h1>Heading</h1>
    <img src="cat.jpg" alt="A cat">
    <p>Good contrast text.</p>
  `

    console.log('Testing Lighthouse Score...')
    const result = await scoreHtml(html)
    console.log('Score:', result.score)

    if (result.score === 0) {
        console.error('❌ Lighthouse failed (likely no Chrome found).')
        process.exit(1)
    }
}

main()
