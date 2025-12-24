
import { NextRequest } from 'next/server'
import { getSession, getNewActivities } from '../../store'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    const { sessionId } = await params
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
        async start(controller) {
            // Send connection confirmation
            controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'connected', message: 'Stream connected' })}\n\n`)
            )

            let lastActivityId = ''
            let pollCount = 0
            const maxPolls = 600 // 5 minutes max

            const pollInterval = setInterval(async () => {
                try {
                    pollCount++

                    // Get session state
                    const session = getSession(sessionId)

                    if (!session) {
                        clearInterval(pollInterval)
                        controller.close()
                        return
                    }

                    // Get new activities
                    const newActivities = getNewActivities(sessionId, lastActivityId)

                    // Calculate duration
                    const duration = Math.floor((Date.now() - session.startedAt) / 1000)

                    // Send update
                    const update = {
                        type: 'update',
                        session: {
                            status: session.status,
                            healerStatus: session.healerStatus,
                            healerProgress: session.healerProgress,
                            healerIssuesFound: session.healerIssuesFound,
                            healerIssuesFixed: session.healerIssuesFixed,
                            navigatorStatus: session.navigatorStatus,
                            navigatorProgress: session.navigatorProgress,
                            navigatorTestsRun: session.navigatorTestsRun,
                            navigatorTestsPass: session.navigatorTestsPass,
                            navigatorTests: session.navigatorTests,
                            dataFlowCount: session.dataFlowCount,
                            duration,
                            fixedCode: session.fixedCode,
                            beforeScore: session.beforeScore,
                            afterScore: session.afterScore
                        },
                        activities: newActivities
                    }

                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify(update)}\n\n`)
                    )

                    // Update last activity ID
                    if (newActivities.length > 0) {
                        lastActivityId = newActivities[newActivities.length - 1].id
                    }

                    // Close when complete or error or timeout
                    if (session.status === 'complete' || session.status === 'error' || pollCount >= maxPolls) {
                        controller.enqueue(
                            encoder.encode(`data: ${JSON.stringify({ type: 'complete', finalStatus: session.status })}\n\n`)
                        )
                        clearInterval(pollInterval)
                        controller.close()
                    }

                } catch (error) {
                    console.error('SSE poll error:', error)
                    clearInterval(pollInterval)
                    controller.close()
                }
            }, 500) // Poll every 500ms

            // Cleanup on abort
            request.signal.addEventListener('abort', () => {
                clearInterval(pollInterval)
                controller.close()
            })
        }
    })

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no'
        }
    })
}
