
import { scanHTML } from './lib/accessibility/axe-scanner'
import { healHTML } from './lib/healer/fix-generator'
import fs from 'fs'
import path from 'path'

async function main() {
  // 1. Load broken HTML
  const htmlPath = path.join(process.cwd(), 'public/demo-sites/broken.html')
  const html = fs.readFileSync(htmlPath, 'utf-8')

  console.log('📄 Loaded broken.html')

  // 2. Scan
  console.log('🔍 Scanning...')
  const scanResult = await scanHTML(html)
  console.log(`   Found ${scanResult.violations.length} violations.`)

  // 3. Heal
  console.log('🚑 Healing...')
  const healResult = await healHTML(html, scanResult.violations)

  console.log('📊 Healer Report:')
  healResult.fixes.forEach(f => {
    console.log(`   ✅ Fixed ${f.issueId}`)
    console.log(`      Original: ${f.originalCode}`)
    console.log(`      Fixed:    ${f.fixedCode.replace(/\n/g, '')}`)
  })

  // 4. Save result
  const fixedPath = path.join(process.cwd(), 'public/demo-sites/fixed.html')
  fs.writeFileSync(fixedPath, healResult.fixedHTML)
  console.log(`💾 Saved fixed HTML to ${fixedPath}`)
}

main().catch(console.error)
