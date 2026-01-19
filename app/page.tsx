"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SingleTrackingForm } from "@/components/tracking/SingleTrackingForm"
import { BulkTrackingForm } from "@/components/tracking/BulkTrackingForm"
import { Package, Layers } from "lucide-react"

export default function Home() {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Track Your India Post Shipments
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Enter your tracking number to get real-time updates on your shipment status,
          location, and delivery timeline.
        </p>
      </div>

      {/* Tracking Tabs */}
      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="single" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Single Tracking
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Bulk Tracking
          </TabsTrigger>
        </TabsList>

        <TabsContent value="single">
          <SingleTrackingForm />
        </TabsContent>

        <TabsContent value="bulk">
          <BulkTrackingForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}
