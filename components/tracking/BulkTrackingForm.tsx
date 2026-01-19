"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BulkResultsTable } from "./BulkResultsTable"
import { TrackingRecord } from "@/lib/types"
import { Search, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export function BulkTrackingForm() {
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<TrackingRecord[]>([])
  const [stats, setStats] = useState<{ total: number; successful: number; failed: number } | null>(null)

  const parseTrackingNumbers = (text: string): string[] => {
    // Split by newlines, commas, or spaces and clean up
    const numbers = text
      .split(/[\n,\s]+/)
      .map((n) => n.trim().toUpperCase())
      .filter((n) => n.length > 0)

    // Remove duplicates
    return Array.from(new Set(numbers))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trackingNumbers = parseTrackingNumbers(input)

    if (trackingNumbers.length === 0) {
      toast({
        title: "Error",
        description: "Please enter at least one tracking number",
        variant: "destructive",
      })
      return
    }

    if (trackingNumbers.length > 50) {
      toast({
        title: "Error",
        description: "Maximum 50 tracking numbers allowed at once",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setResults([])
    setStats(null)

    try {
      const response = await fetch('/api/track-bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trackingNumbers }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch tracking information")
      }

      setResults(data.results || [])
      setStats({
        total: data.total || trackingNumbers.length,
        successful: data.successful || 0,
        failed: data.failed || 0,
      })

      toast({
        title: "Success",
        description: `Tracked ${data.successful} of ${data.total} shipments`,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const exampleNumbers = "LP951627598IN\nEM123456789IN\nRR987654321IN"

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bulk Track Shipments</CardTitle>
          <CardDescription>
            Enter multiple tracking numbers separated by newlines, commas, or spaces (max 50)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder={exampleNumbers}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[150px] font-mono"
              disabled={loading}
            />
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {parseTrackingNumbers(input).length} tracking numbers entered
              </p>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Tracking...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Track All
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-gray-50">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{stats.successful}</p>
              <p className="text-sm text-gray-500">Successful</p>
            </CardContent>
          </Card>
          <Card className="bg-red-50">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              <p className="text-sm text-gray-500">Failed</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results Table */}
      <BulkResultsTable results={results} />
    </div>
  )
}
