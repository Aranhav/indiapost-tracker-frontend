"use client"

import { useState } from "react"
import { BulkResultsTable } from "./BulkResultsTable"
import { TrackingRecord } from "@/lib/types"
import { Search, Loader2, Layers, CheckCircle2, XCircle, Hash } from "lucide-react"
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

    if (trackingNumbers.length > 10) {
      toast({
        title: "Error",
        description: "Maximum 10 tracking numbers allowed at once",
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

  const currentCount = parseTrackingNumbers(input).length
  const exampleNumbers = "LP951627598IN\nEM123456789IN\nRR987654321IN"

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-orange-50 rounded-lg">
            <Layers className="w-5 h-5 text-orange-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Bulk Track Shipments</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4 ml-12">
          Enter multiple tracking numbers separated by newlines, commas, or spaces (max 10)
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            placeholder={exampleNumbers}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="w-full min-h-[160px] px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-mono text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed resize-y"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${currentCount > 10 ? 'text-red-600' : 'text-gray-600'}`}>
                {currentCount} / 10
              </span>
              <span className="text-sm text-gray-400">tracking numbers</span>
            </div>

            <button
              type="submit"
              disabled={loading || currentCount === 0 || currentCount > 10}
              className="h-11 px-6 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg flex items-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:ring-offset-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Tracking...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Track All</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          {/* Total */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Hash className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-500">Total</p>
              </div>
            </div>
          </div>

          {/* Successful */}
          <div className="bg-white rounded-xl shadow-sm border border-green-100 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.successful}</p>
                <p className="text-sm text-gray-500">Successful</p>
              </div>
            </div>
          </div>

          {/* Failed */}
          <div className="bg-white rounded-xl shadow-sm border border-red-100 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                <p className="text-sm text-gray-500">Failed</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Table */}
      <BulkResultsTable results={results} />
    </div>
  )
}
