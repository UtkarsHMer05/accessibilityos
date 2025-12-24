
import { NextResponse } from 'next/server'
import { scanHTML } from '@/lib/accessibility/axe-scanner'
import { hybridScan } from '@/lib/healer/hybrid-scanner'
import db from '@/lib/db'

export async function POST(req: Request) {
    try {
        const { html, url } = await req.json()

        if (!html) {
            return NextResponse.json({ error: 'HTML content is required' }, { status: 400 })
        }

        // MOCK / DEMO MODE CHECK
        const { DEMO_BROKEN_HTML } = await import('@/lib/demo-data')
        let scanResult;

        if (html.includes("DEMO MODE") || html.trim() === DEMO_BROKEN_HTML.trim()) {
            // Fake Scan Results for Demo
            scanResult = {
                violations: [
                    { id: 'image-alt', impact: 'critical', description: 'Images must have alternate text', nodes: [{ html: '<img src="sneaker.jpg" />' }] },
                    { id: 'button-name', impact: 'critical', description: 'Buttons must have discernible text', nodes: [{ html: '<div onclick="addToCart()" class="btn">Add to Cart</div>' }] },
                    { id: 'link-name', impact: 'moderate', description: 'Links must have discernible text', nodes: [{ html: '<a href="#">Read details</a>' }] }
                ],
                scoreEstimation: { before: 52, after: 95 }
            }
        } else {
            // 1. Hybrid Scan (Axe + Gemini)
            scanResult = await hybridScan(html)
        }

        // 2. Save to DB (Background)
        const siteUrl = url || 'https://uploaded-content.local'
        let savedViolations = scanResult.violations

        try {
            // Upsert Website
            await db.website.upsert({
                where: { url: siteUrl },
                create: { url: siteUrl, lastScanned: new Date() },
                update: { lastScanned: new Date() }
            })

            // Save Issues (Archive old detected ones for this URL first to avoid dupes in this demo)
            // Instead of deleting (which can violate FK), we mark them as 'archived'
            await db.accessibilityIssue.updateMany({
                where: { websiteUrl: siteUrl, status: 'detected' },
                data: { status: 'archived' }
            })

            // Create new issues
            const issuePromises = scanResult.violations.map(v =>
                db.accessibilityIssue.create({
                    data: {
                        websiteUrl: siteUrl,
                        issueType: v.id,
                        sourceMode: 'healer',
                        description: v.description,
                        codeLocation: v.nodes?.[0]?.html || 'unknown',
                        severity: v.impact || 'moderate',
                        status: 'detected',
                        detectedAt: new Date()
                    }
                })
            )

            const savedIssues = await Promise.all(issuePromises)

            // Log Scan Activity
            await db.activityLog.create({
                data: {
                    mode: 'healer',
                    action: 'scan_completed',
                    details: {
                        issuesFound: savedIssues.length,
                        url: siteUrl
                    }
                }
            })

            // Return violations WITH their new DB IDs (mapped by index or lookalike)
            // Ideally we return the `savedIssues` but they match 1:1 with `scanResult.violations`
            savedViolations = scanResult.violations.map((v, i) => ({
                ...v,
                dbId: savedIssues[i]?.id
            }))

        } catch (e) {
            console.warn('DB Save failed (non-blocking):', e)
        }

        return NextResponse.json({
            success: true,
            violations: savedViolations,
            scoreEstimation: scanResult.scoreEstimation
        })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
