"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = status?.toLowerCase() || 'unknown'

  const getStatusConfig = () => {
    if (normalizedStatus.includes('delivered')) {
      return { variant: 'success' as const, label: 'Delivered' }
    }
    if (normalizedStatus.includes('out for delivery')) {
      return { variant: 'default' as const, label: 'Out for Delivery' }
    }
    if (normalizedStatus.includes('transit') || normalizedStatus.includes('dispatched')) {
      return { variant: 'default' as const, label: 'In Transit' }
    }
    if (normalizedStatus.includes('picked') || normalizedStatus.includes('received')) {
      return { variant: 'secondary' as const, label: 'Picked Up' }
    }
    if (normalizedStatus.includes('booked') || normalizedStatus.includes('posted')) {
      return { variant: 'secondary' as const, label: 'Booked' }
    }
    if (normalizedStatus.includes('returned') || normalizedStatus.includes('rto')) {
      return { variant: 'warning' as const, label: 'Returned' }
    }
    if (normalizedStatus.includes('failed') || normalizedStatus.includes('undelivered')) {
      return { variant: 'destructive' as const, label: 'Failed' }
    }
    return { variant: 'secondary' as const, label: status || 'Unknown' }
  }

  const config = getStatusConfig()

  return (
    <Badge variant={config.variant} className={cn("capitalize", className)}>
      {config.label}
    </Badge>
  )
}
