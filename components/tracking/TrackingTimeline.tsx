"use client"

import { TrackingEvent } from "@/lib/types"
import { cn } from "@/lib/utils"
import { CheckCircle2, Circle, MapPin } from "lucide-react"

interface TrackingTimelineProps {
  events: TrackingEvent[]
  className?: string
}

export function TrackingTimeline({ events, className }: TrackingTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
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

          return (
            <div key={event.id || index} className="relative flex gap-4">
              {/* Timeline line and dot */}
              <div className="flex flex-col items-center">
                {/* Dot */}
                <div
                  className={cn(
                    "w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 z-10",
                    isFirst
                      ? isDelivered
                        ? "bg-green-500 ring-4 ring-green-100"
                        : "bg-primary-500 ring-4 ring-primary-100"
                      : "bg-gray-300"
                  )}
                >
                  {isFirst && isDelivered ? (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  ) : isFirst ? (
                    <Circle className="w-2 h-2 text-white fill-white" />
                  ) : null}
                </div>
                {/* Line */}
                {!isLast && (
                  <div
                    className={cn(
                      "w-0.5 flex-1 min-h-[40px]",
                      isFirst ? "bg-green-300" : "bg-gray-200"
                    )}
                  />
                )}
              </div>

              {/* Event content */}
              <div className={cn("pb-6 flex-1", isLast && "pb-0")}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p
                      className={cn(
                        "font-medium",
                        isFirst ? "text-gray-900" : "text-gray-600"
                      )}
                    >
                      {event.event}
                    </p>
                    {(event.office || event.location) && (
                      <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>{event.office || event.location}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-500 flex-shrink-0">
                    <p>{event.date}</p>
                    {event.time && <p>{event.time}</p>}
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
