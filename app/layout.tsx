import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'India Post Tracker | Xindus',
  description: 'Track your India Post shipments in real-time',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">
        <header className="bg-white sticky top-0 z-50 border-b border-slate-100">
          <div className="max-w-5xl mx-auto px-6 py-3">
            <div className="flex items-center gap-2">
              <span className="text-orange-500 font-medium">///</span>
              <h1 className="text-base font-medium text-slate-800">
                India Post Tracker
              </h1>
              <span className="text-slate-300">|</span>
              <span className="text-sm text-slate-400">Xindus</span>
            </div>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-6 py-10">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  )
}
