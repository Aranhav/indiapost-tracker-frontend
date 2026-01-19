"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SingleTrackingForm } from "@/components/tracking/SingleTrackingForm"
import { BulkTrackingForm } from "@/components/tracking/BulkTrackingForm"
import { Package, Layers } from "lucide-react"

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl px-8 py-12 text-center">
        <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-6">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          <span className="text-orange-400 text-sm font-medium">Real-time Tracking</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
          Track Your Shipments
        </h2>
        <p className="text-slate-400 max-w-lg mx-auto text-base leading-relaxed">
          Get instant updates on your India Post packages with delivery status, location tracking, and estimated delivery times.
        </p>
      </div>

      {/* Tracking Tabs */}
      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full max-w-sm mx-auto grid-cols-2 bg-slate-100 p-1 rounded-xl h-12">
          <TabsTrigger
            value="single"
            className="flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-600"
          >
            <Package className="w-4 h-4" />
            Single
          </TabsTrigger>
          <TabsTrigger
            value="bulk"
            className="flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-600"
          >
            <Layers className="w-4 h-4" />
            Bulk
          </TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="mt-6">
          <SingleTrackingForm />
        </TabsContent>

        <TabsContent value="bulk" className="mt-6">
          <BulkTrackingForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}
