"use client"

import { TrackingEvent } from "@/lib/types"
import { cn } from "@/lib/utils"
import { MapPin } from "lucide-react"

interface TrackingTimelineProps {
  events: TrackingEvent[]
  className?: string
}

export function TrackingTimeline({ events, className }: TrackingTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8 text-sm">
        No tracking events available
      </div>
    )
  }

  return (
    <div className={cn("relative", className)}>
      <div className="space-y-0">
        {events.map((event, index) => {
          const isFirst = index === 0
          const isLast = index === events.length - 1
          const isDelivered = event.event?.toLowerCase().includes('delivered')

          // Determine dot styling based on position and status
          const getDotStyles = () => {
            if (isFirst && isDelivered) {
              return "bg-emerald-500 ring-4 ring-emerald-50"
            }
            if (isFirst) {
              return "bg-orange-500 ring-4 ring-orange-50"
            }
            return "bg-gray-200"
          }

          // Determine line styling
          const getLineStyles = () => {
            if (isFirst && isDelivered) {
              return "bg-emerald-200"
            }
            if (isFirst) {
              return "bg-orange-200"
            }
            return "bg-gray-100"
          }

          return (
            <div key={event.id || index} className="relative flex gap-4">
              {/* Timeline line and dot */}
              <div className="flex flex-col items-center w-4">
                {/* Dot */}
                <div
                  className={cn(
                    "w-3 h-3 rounded-full flex-shrink-0 z-10 transition-all",
                    getDotStyles()
                  )}
                />
                {/* Line */}
                {!isLast && (
                  <div
                    className={cn(
                      "w-px flex-1 min-h-[32px]",
                      getLineStyles()
                    )}
                  />
                )}
              </div>

              {/* Event content */}
              <div className={cn("pb-5 flex-1 -mt-0.5", isLast && "pb-0")}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm leading-tight",
                        isFirst
                          ? "font-medium text-gray-900"
                          : "text-gray-500"
                      )}
                    >
                      {event.event}
                    </p>
                    {(event.office || event.location) && (
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-gray-300 flex-shrink-0" />
                        <span className="text-xs text-gray-400 truncate">
                          {event.office || event.location}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={cn(
                      "text-xs",
                      isFirst ? "text-gray-600" : "text-gray-400"
                    )}>
                      {event.date}
                    </p>
                    {event.time && (
                      <p className="text-xs text-gray-400">{event.time}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
