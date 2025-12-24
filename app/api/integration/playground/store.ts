
// In-memory session storage (singleton pattern for Next.js API routes)
// Note: In a production environment, this should be replaced with Redis or a database

interface Session {
    id: string
    status: string
    userCode: string
    userCss: string
    runHealer: boolean
    runNavigator: boolean
    healerStatus: string
    healerProgress: number
    healerIssuesFound: number
    healerIssuesFixed: number
    navigatorStatus: string
    navigatorProgress: number
    navigatorTestsRun: number
    navigatorTestsPass: number
    navigatorTests: Array<{ name: string, status: 'pending' | 'running' | 'passed' | 'failed', evidence?: string }>
    dataFlowCount: number
    startedAt: number
    fixedCode: string | null
    beforeScore: number | null
    afterScore: number | null
    [key: string]: any
}

interface Activity {
    id: string
    mode: string
    action: string
    message: string
    timestamp: string
}

// Global scope check to prevent multiple instances in dev mode
const globalForStore = global as unknown as {
    playgroundSessions: Map<string, Session>
    playgroundActivities: Map<string, Activity[]>
}

export const sessions = globalForStore.playgroundSessions || new Map<string, Session>()
export const activities = globalForStore.playgroundActivities || new Map<string, Activity[]>()

if (process.env.NODE_ENV !== 'production') {
    globalForStore.playgroundSessions = sessions
    globalForStore.playgroundActivities = activities
}

// Helper functions
export function getSession(sessionId: string) {
    return sessions.get(sessionId)
}

export function updateSession(sessionId: string, data: Partial<Session>) {
    const session = sessions.get(sessionId)
    if (session) {
        sessions.set(sessionId, { ...session, ...data })
    }
}

export function logActivity(sessionId: string, mode: string, action: string, message: string) {
    const sessionActivities = activities.get(sessionId) || []
    const activity = {
        id: `act_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        mode,
        action,
        message,
        timestamp: new Date().toISOString()
    }
    sessionActivities.push(activity)
    activities.set(sessionId, sessionActivities)
    return activity
}

export function getNewActivities(sessionId: string, lastId?: string): Activity[] {
    const sessionActivities = activities.get(sessionId) || []
    if (!lastId) return sessionActivities.slice(-20)

    const lastIndex = sessionActivities.findIndex(a => a.id === lastId)
    if (lastIndex === -1) return sessionActivities.slice(-20)

    return sessionActivities.slice(lastIndex + 1)
}
