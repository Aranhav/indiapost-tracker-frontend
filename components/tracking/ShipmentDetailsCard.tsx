"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "./StatusBadge"
import { TrackingRecord } from "@/lib/types"
import { ArrowRight, Calendar, Package } from "lucide-react"

interface ShipmentDetailsCardProps {
  tracking: TrackingRecord
}

export function ShipmentDetailsCard({ tracking }: ShipmentDetailsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Shipment Details</CardTitle>
          <StatusBadge status={tracking.status || 'unknown'} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tracking Number */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-500 mb-1">Tracking Number</p>
          <p className="font-mono text-lg font-semibold text-gray-900">
            {tracking.trackingNumber}
          </p>
        </div>

        {/* Origin to Destination */}
        {(tracking.origin || tracking.destination) && (
          <div className="flex items-center gap-3 py-2">
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">Origin</p>
              <p className="font-medium text-gray-900">
                {tracking.origin || '-'}
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1 text-right">
              <p className="text-sm text-gray-500 mb-1">Destination</p>
              <p className="font-medium text-gray-900">
                {tracking.destination || '-'}
              </p>
            </div>
          </div>
        )}

        {/* Article Type */}
        {tracking.articleType && (
          <div className="flex items-center gap-3 py-2 border-t border-gray-100">
            <Package className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Article Type</p>
              <p className="font-medium text-gray-900">{tracking.articleType}</p>
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
          {tracking.bookedOn && (
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Booked On</p>
                <p className="font-medium text-gray-900">{tracking.bookedOn}</p>
              </div>
            </div>
          )}
          {tracking.deliveredOn && (
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-green-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Delivered On</p>
                <p className="font-medium text-green-600">{tracking.deliveredOn}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
