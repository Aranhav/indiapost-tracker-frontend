"use client"

import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = status?.toLowerCase() || 'unknown'

  const getStatusConfig = () => {
    if (normalizedStatus.includes('delivered')) {
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        label: 'Delivered'
      }
    }
    if (normalizedStatus.includes('out for delivery')) {
      return {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        label: 'Out for Delivery'
      }
    }
    if (normalizedStatus.includes('transit') || normalizedStatus.includes('dispatched')) {
      return {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        label: 'In Transit'
      }
    }
    if (normalizedStatus.includes('picked') || normalizedStatus.includes('received')) {
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        label: 'Picked Up'
      }
    }
    if (normalizedStatus.includes('booked') || normalizedStatus.includes('posted')) {
      return {
        bg: 'bg-slate-50',
        text: 'text-slate-700',
        border: 'border-slate-200',
        label: 'Booked'
      }
    }
    if (normalizedStatus.includes('returned') || normalizedStatus.includes('rto')) {
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        label: 'Returned'
      }
    }
    if (normalizedStatus.includes('failed') || normalizedStatus.includes('undelivered')) {
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        label: 'Failed'
      }
    }
    return {
      bg: 'bg-gray-50',
      text: 'text-gray-600',
      border: 'border-gray-200',
      label: status || 'Unknown'
    }
  }

  const config = getStatusConfig()

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      {config.label}
    </span>
  )
}
