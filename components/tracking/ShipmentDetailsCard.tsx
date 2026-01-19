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
    <Card className="border border-gray-100 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base font-semibold text-gray-900">
            Shipment Details
          </CardTitle>
          <StatusBadge status={tracking.status || 'unknown'} />
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Tracking Number */}
        <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
            Tracking Number
          </p>
          <p className="font-mono text-lg font-semibold text-gray-900">
            {tracking.trackingNumber}
          </p>
        </div>

        {/* Origin to Destination */}
        {(tracking.origin || tracking.destination) && (
          <div className="flex items-stretch gap-3">
            <div className="flex-1 bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                Origin
              </p>
              <p className="text-sm font-medium text-gray-900">
                {tracking.origin || '-'}
              </p>
            </div>
            <div className="flex items-center">
              <ArrowRight className="w-4 h-4 text-orange-400" />
            </div>
            <div className="flex-1 bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                Destination
              </p>
              <p className="text-sm font-medium text-gray-900">
                {tracking.destination || '-'}
              </p>
            </div>
          </div>
        )}

        {/* Article Type */}
        {tracking.articleType && (
          <div className="flex items-center gap-3 py-3 border-t border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
              <Package className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Article Type
              </p>
              <p className="text-sm font-medium text-gray-900">
                {tracking.articleType}
              </p>
            </div>
          </div>
        )}

        {/* Dates */}
        {(tracking.bookedOn || tracking.deliveredOn) && (
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
            {tracking.bookedOn && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
                  <Calendar className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Booked
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {tracking.bookedOn}
                  </p>
                </div>
              </div>
            )}
            {tracking.deliveredOn && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Delivered
                  </p>
                  <p className="text-sm font-medium text-emerald-600">
                    {tracking.deliveredOn}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
