"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TrackingTimeline } from "./TrackingTimeline"
import { ShipmentDetailsCard } from "./ShipmentDetailsCard"
import { TrackingRecord } from "@/lib/types"
import { Search, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export function SingleTrackingForm() {
  const [trackingNumber, setTrackingNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TrackingRecord | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmed = trackingNumber.trim().toUpperCase()
    if (!trimmed) {
      toast({
        title: "Error",
        description: "Please enter a tracking number",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`/api/track?id=${encodeURIComponent(trimmed)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch tracking information")
      }

      setResult(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred"
      setError(message)
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Track Your Shipment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Enter tracking number (e.g., LP951627598IN)"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="h-12"
                disabled={loading}
              />
            </div>
            <Button type="submit" size="lg" disabled={loading}>
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Track
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-36" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-40" />
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="grid md:grid-cols-2 gap-6">
          <ShipmentDetailsCard tracking={result} />
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tracking Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <TrackingTimeline events={result.events || []} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
