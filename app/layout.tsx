import { Inter } from "next/font/google"
import "./globals.css"
import Link from "next/link"
import { AppHeader } from "@/components/layout/AppHeader"
import { IntegrationStatusBadge } from "@/components/integration/IntegrationStatusBadge"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-blue-500/30">

          <AppHeader />

          {/* Main Content Area */}
          <main className="pt-20 pb-10 min-h-screen relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-slate-950">
            {/* Background noise texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] contrast-150 brightness-100"></div>

            <div className="relative z-10 px-6 max-w-7xl mx-auto">
              {children}
            </div>
          </main>

          {/* Persistent Integration Status */}
          <IntegrationStatusBadge />
        </div>
      </body>
    </html>
  )
}


