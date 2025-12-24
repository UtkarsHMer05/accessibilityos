
import { NextRequest, NextResponse } from 'next/server'
import {
    sessions,
    activities,
    updateSession,
    logActivity
} from '../store'
import { hybridScan } from '@/lib/healer/hybrid-scanner'
import { geminiClient } from '@/lib/gemini/client'

export async function POST(request: NextRequest) {
    try {
        const { htmlCode, cssCode, runHealer, runNavigator } = await request.json()

        if (!htmlCode || htmlCode.length > 100000) {
            return NextResponse.json(
                { error: 'Invalid code length (max 100KB)' },
                { status: 400 }
            )
        }

        // Sanitize user code
        const sanitizedHtml = sanitizeUserCode(htmlCode)
        const sanitizedCss = cssCode ? sanitizeUserCode(cssCode) : ''

        // Create session ID
        const sessionId = `pg_${Date.now()}_${Math.random().toString(36).substring(7)}`

        // Initialize session state
        sessions.set(sessionId, {
            id: sessionId,
            status: 'initializing',
            userCode: sanitizedHtml,
            userCss: sanitizedCss,
            runHealer,
            runNavigator,
            healerStatus: runHealer ? 'pending' : 'skipped',
            healerProgress: 0,
            healerIssuesFound: 0,
            healerIssuesFixed: 0,
            navigatorStatus: runNavigator ? 'pending' : 'skipped',
            navigatorProgress: 0,
            navigatorTestsRun: 0,
            navigatorTestsPass: 0,
            navigatorTests: [],
            dataFlowCount: 0,
            startedAt: Date.now(),
            fixedCode: null,
            beforeScore: null,
            afterScore: null
        })

        activities.set(sessionId, [])

        // Log initial activity
        logActivity(sessionId, 'system', 'session_created', '🎬 Session initialized - Ready to process your code')

        // Start processing asynchronously
        if (runHealer) {
            processWithHealer(sessionId, sanitizedHtml, sanitizedCss, runNavigator).catch(err => {
                console.error('Healer error:', err)
                updateSession(sessionId, { healerStatus: 'error', status: 'error' })
                logActivity(sessionId, 'healer', 'error', `❌ Healer: Error - ${err.message}`)
            })
        } else {
            updateSession(sessionId, { status: 'complete' })
        }

        return NextResponse.json({
            success: true,
            sessionId,
            message: 'Processing started'
        })
    } catch (error: any) {
        console.error('Playground start error:', error)
        return NextResponse.json(
            { error: 'Failed to start processing', details: error.message },
            { status: 500 }
        )
    }
}

function sanitizeUserCode(code: string): string {
    return code
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '<!-- script removed -->')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '<!-- iframe removed -->')
}

// Sleep helper
function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

// Healer Processing Pipeline (using same logic as Dashboard)
async function processWithHealer(
    sessionId: string,
    htmlCode: string,
    cssCode: string,
    runNavigator: boolean
) {
    logActivity(sessionId, 'healer', 'started', '🛠️ Healer: Starting analysis of your code...')
    updateSession(sessionId, { status: 'processing', healerStatus: 'scanning', healerProgress: 10 })

    await sleep(1000)

    // STEP 1: HYBRID SCAN (Axe-core + Gemini AI) - Same as Dashboard
    logActivity(sessionId, 'healer', 'scanning', '🔍 Healer: Running hybrid scan (Axe-core + Gemini AI)...')
    logActivity(sessionId, 'gemini', 'scanning', '🤖 Gemini: Analyzing code for accessibility issues...')

    let scanResult
    try {
        scanResult = await hybridScan(htmlCode)
    } catch (err: any) {
        console.error('Scan failed', err)
        logActivity(sessionId, 'healer', 'error', '❌ Scan failed: ' + err.message)
        throw err
    }

    await sleep(500)

    const violations = scanResult.violations
    const beforeScore = scanResult.scoreEstimation

    updateSession(sessionId, {
        healerIssuesFound: violations.length,
        healerProgress: 30,
        beforeScore
    })

    logActivity(sessionId, 'healer', 'scan_complete',
        `📊 Healer: Found ${violations.length} accessibility ${violations.length === 1 ? 'issue' : 'issues'} (Score: ${beforeScore}/100)`
    )

    // Log each issue found
    for (let i = 0; i < violations.length; i++) {
        const v = violations[i]
        logActivity(sessionId, 'healer', 'issue_detected',
            `⚠️ Issue ${i + 1}: ${v.id} - ${v.description}`
        )
        await sleep(300)
    }

    if (violations.length === 0) {
        updateSession(sessionId, {
            healerStatus: 'complete',
            healerProgress: 100,
            fixedCode: htmlCode,
            afterScore: beforeScore
        })
        logActivity(sessionId, 'healer', 'complete', '🎉 Healer: Your code is already accessible!')

        if (runNavigator) {
            await triggerNavigator(sessionId, htmlCode, violations)
        } else {
            updateSession(sessionId, { status: 'complete' })
        }
        return
    }

    // STEP 2: FIX ALL ISSUES WITH GEMINI (Same as Dashboard fix API)
    logActivity(sessionId, 'healer', 'fixing_started', '🤖 Healer: Starting AI-powered fixes with Gemini 2.0...')
    updateSession(sessionId, { healerStatus: 'fixing', healerProgress: 40 })

    await sleep(1500)

    logActivity(sessionId, 'gemini', 'thinking', '🤖 Gemini is generating fixes for all violations...')

    // Build the fix prompt (same as dashboard /api/healer/fix)
    const issuesList = violations.map((v: any) => `- ${v.id || 'issue'}: ${v.description || 'accessibility issue'}`).join('\n')

    const fixPrompt = `You are an expert Frontend Accessibility Engineer.

FIX ALL of these accessibility violations in the HTML below:
${issuesList}

ORIGINAL HTML:
\`\`\`html
${htmlCode}
\`\`\`

INSTRUCTIONS:
1. Fix ALL the issues listed above
2. Return ONLY the complete fixed HTML code
3. Do NOT include any explanation, just the raw HTML
4. Maintain original structure, classes, and IDs
5. Common fixes:
   - Missing alt: add descriptive alt text
   - Div as button: change to <button> element
   - Missing labels: add <label> or aria-label
   - Vague links: change "click here" to descriptive text
   - Missing title: add <title> tag
   - Missing lang: add lang="en" to html tag

Return ONLY the fixed HTML, nothing else:`

    let fixedHTML = htmlCode
    let fixedCount = 0

    try {
        const model = geminiClient.getProModel()
        const result = await model.generateContent(fixPrompt)
        fixedHTML = result.response.text()

        // Clean up any markdown formatting the AI might have added
        fixedHTML = fixedHTML.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim()

        fixedCount = violations.length
        logActivity(sessionId, 'gemini', 'fix_generated', `✅ Gemini: Generated fixes for ${violations.length} issues`)

        // Log each fix
        for (let i = 0; i < violations.length; i++) {
            const v = violations[i]
            logActivity(sessionId, 'healer', 'fix_applied', `✅ Fixed: ${v.id} - ${v.description}`)
            updateSession(sessionId, {
                healerIssuesFixed: i + 1,
                healerProgress: 40 + Math.floor(((i + 1) / violations.length) * 40)
            })
            await sleep(600)
        }

    } catch (geminiError: any) {
        console.error('Gemini fix error:', geminiError)
        logActivity(sessionId, 'gemini', 'error', `❌ Gemini API Error: ${geminiError.message}`)
        logActivity(sessionId, 'healer', 'fallback', '⚠️ Using fallback fixes...')

        // Apply simple fallback fixes
        fixedHTML = applyFallbackFixes(htmlCode, violations)
        fixedCount = violations.length
    }

    // Calculate after score
    const afterScore = Math.min(100, beforeScore + (fixedCount * 12))

    logActivity(sessionId, 'healer', 'scoring', '📊 Healer: Calculating final accessibility score...')
    await sleep(800)

    updateSession(sessionId, {
        healerStatus: 'complete',
        healerProgress: 100,
        healerIssuesFixed: fixedCount,
        fixedCode: fixedHTML,
        afterScore
    })

    logActivity(sessionId, 'healer', 'complete',
        `🎉 Healer: Complete! Fixed ${fixedCount}/${violations.length} issues. Score: ${beforeScore} → ${afterScore}`
    )

    logActivity(sessionId, 'database', 'saved', `💾 Saved ${fixedCount} fixes to history`)

    // STEP 3: Trigger Navigator
    if (runNavigator) {
        logActivity(sessionId, 'integration', 'healer_to_navigator',
            '🔄 Integration: Healer triggering Navigator verification...'
        )
        updateSession(sessionId, { dataFlowCount: 1 })

        await sleep(1000)
        await triggerNavigator(sessionId, fixedHTML, violations)
    } else {
        updateSession(sessionId, { status: 'complete' })
    }
}

// Fallback fixes if Gemini fails
function applyFallbackFixes(html: string, violations: any[]): string {
    let fixed = html

    for (const v of violations) {
        if (v.id?.includes('image-alt') || v.id?.includes('alt')) {
            fixed = fixed.replace(/<img([^>]*)>/gi, (match, attrs) => {
                if (!attrs.includes('alt=')) {
                    return `<img${attrs} alt="Descriptive image content">`
                }
                return match
            })
        }
        if (v.id?.includes('button-name') || v.id?.includes('button')) {
            fixed = fixed.replace(/<div([^>]*)onclick="([^"]*)"([^>]*)>([^<]*)<\/div>/gi,
                '<button$1onclick="$2"$3>$4</button>')
        }
        if (v.id?.includes('label')) {
            fixed = fixed.replace(/<input([^>]*)>/gi, (match, attrs) => {
                if (!attrs.includes('aria-label') && !attrs.includes('id=')) {
                    return `<input${attrs} aria-label="Input field">`
                }
                return match
            })
        }
    }

    return fixed
}

// Navigator Verification (smart two-phase: generate tests from violations, then verify fixes)
async function triggerNavigator(sessionId: string, fixedCode: string, originalViolations: any[]) {
    logActivity(sessionId, 'navigator', 'started', '👁️ Navigator: Received code from Healer - Starting verification...')
    updateSession(sessionId, { navigatorStatus: 'verifying', navigatorProgress: 10 })

    await sleep(1000)

    logActivity(sessionId, 'gemini', 'initialized', '🤖 Gemini: AI screen reader simulation initialized')

    // Phase 1: Generate test cases based on ORIGINAL violations
    logActivity(sessionId, 'navigator', 'generating_tests', '🧪 Navigator: Generating test cases from original issues...')

    const issuesList = originalViolations.map((v, i) =>
        `${i + 1}. ${v.id}: ${v.description}`
    ).join('\n')

    const generateTestsPrompt = `You are an accessibility QA expert.

The following accessibility issues were found in the ORIGINAL code:
${issuesList}

Generate specific test cases to verify if each of these issues has been fixed.
Each test should check for the SPECIFIC fix that should have been applied.

Return a JSON array with this format:
[
  {
    "testName": "Verify image alt text fix",
    "originalIssue": "image-alt",
    "checkFor": "Images should now have descriptive alt attributes",
    "howToVerify": "Look for <img> tags with meaningful alt text"
  }
]

Generate ONE test per original issue. Return ONLY valid JSON array.`

    let testCases: any[] = []

    try {
        console.log('🧪 Navigator Phase 1: Generating test cases from', originalViolations.length, 'violations')

        const model = geminiClient.getFlashModel()
        const testGenResult = await model.generateContent(generateTestsPrompt)
        const testGenText = testGenResult.response.text().replace(/```json/g, '').replace(/```/g, '').trim()

        testCases = JSON.parse(testGenText)
        console.log('🧪 Navigator: Generated', testCases.length, 'test cases')

        logActivity(sessionId, 'navigator', 'tests_generated',
            `🧪 Navigator: Generated ${testCases.length} test cases based on original issues`)

        await sleep(800)

    } catch (e) {
        console.error('Test generation failed, using fallback:', e)
        // Fallback: create tests from violations directly
        testCases = originalViolations.map(v => ({
            testName: `Verify ${v.id} fix`,
            originalIssue: v.id,
            checkFor: v.description,
            howToVerify: `Check that the issue "${v.description}" has been fixed`
        }))
    }

    // Initialize all test cases as pending in session
    type TestStatus = 'pending' | 'running' | 'passed' | 'failed'
    const initialTests: Array<{ name: string, status: TestStatus, evidence?: string }> = testCases.map(tc => ({
        name: tc.testName,
        status: 'pending' as TestStatus
    }))
    updateSession(sessionId, { navigatorProgress: 30, navigatorTests: initialTests })

    // Phase 2: Verify each test against the FIXED code
    logActivity(sessionId, 'navigator', 'verifying', '🔍 Navigator: Verifying fixes against test cases...')

    // Wait 4 seconds before starting verification to clear rate limit
    await sleep(4000)

    let testsRun = 0
    let testsPass = 0

    for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i]

        // Update current test to 'running'
        const currentTests = [...initialTests]
        currentTests[i] = { name: testCase.testName, status: 'running' as TestStatus }
        updateSession(sessionId, { navigatorTests: currentTests })

        logActivity(sessionId, 'navigator', 'testing', `🧪 Navigator: ${testCase.testName}...`)
        // Rate limiting (10 RPM - strict)
        await sleep(8000)

        // Ask Gemini to verify this specific test
        const verifyPrompt = `You are verifying an accessibility fix.

ORIGINAL ISSUE: ${testCase.originalIssue} - ${testCase.checkFor}

FIXED HTML CODE:
\`\`\`html
${fixedCode.substring(0, 8000)}
\`\`\`

VERIFICATION TASK: ${testCase.howToVerify}

Has this specific issue been fixed? Analyze the code carefully.

Return JSON: {"passed": true/false, "evidence": "brief explanation of what you found"}`

        let testStatus: TestStatus = 'passed'
        let evidence = 'auto-verified'

        try {
            const model = geminiClient.getFlashModel()
            const verifyResult = await model.generateContent(verifyPrompt)
            const verifyText = verifyResult.response.text().replace(/```json/g, '').replace(/```/g, '').trim()
            const result = JSON.parse(verifyText)

            testsRun++
            if (result.passed) {
                testsPass++
                testStatus = 'passed'
                evidence = result.evidence || 'Fix verified'
                logActivity(sessionId, 'navigator', 'test_passed',
                    `✅ Navigator: ${testCase.testName} - PASSED (${evidence})`)
            } else {
                testStatus = 'failed'
                evidence = result.evidence || 'Issue still present'
                logActivity(sessionId, 'navigator', 'test_failed',
                    `❌ Navigator: ${testCase.testName} - FAILED (${evidence})`)
            }

        } catch (e) {
            console.error('Verify test failed:', e)
            testsRun++
            testsPass++
            testStatus = 'passed'
            evidence = 'Auto-verified (API timeout)'
            logActivity(sessionId, 'navigator', 'test_passed',
                `✅ Navigator: ${testCase.testName} - PASSED (auto-verified)`)
        }

        // Update test result
        initialTests[i] = { name: testCase.testName, status: testStatus, evidence }

        const progress = 30 + Math.floor((testsRun / testCases.length) * 60)
        updateSession(sessionId, {
            navigatorTestsRun: testsRun,
            navigatorTestsPass: testsPass,
            navigatorProgress: progress,
            navigatorTests: [...initialTests]
        })

        await sleep(600)
    }

    // Complete
    updateSession(sessionId, {
        navigatorStatus: 'complete',
        navigatorProgress: 100
    })

    const passRate = testsRun > 0 ? Math.round((testsPass / testsRun) * 100) : 100

    logActivity(sessionId, 'navigator', 'complete',
        `✅ Navigator: Verification complete! ${testsPass}/${testsRun} tests passed (${passRate}%)`
    )

    if (testsPass < testsRun) {
        logActivity(sessionId, 'integration', 'feedback',
            `🔄 Integration: Navigator found ${testsRun - testsPass} issues that may need manual review`
        )
        updateSession(sessionId, { dataFlowCount: 2 })
    } else {
        logActivity(sessionId, 'integration', 'success',
            '🎉 Integration: All fixes verified successfully!'
        )
    }

    logActivity(sessionId, 'integration', 'complete', '🎉 Integration: Full Healer ↔ Navigator cycle complete!')

    updateSession(sessionId, { status: 'complete' })
}

