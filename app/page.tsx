"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SingleTrackingForm } from "@/components/tracking/SingleTrackingForm"
import { BulkTrackingForm } from "@/components/tracking/BulkTrackingForm"
import { Package, Layers } from "lucide-react"

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center pt-4 pb-2">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
          <span className="text-slate-400 text-sm tracking-wide uppercase">India Post</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight">
          Track Your Shipment
        </h1>
        <p className="text-slate-500 mt-2 text-base">
          Enter your tracking number to get instant updates
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
