"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "./StatusBadge"
import { TrackingTimeline } from "./TrackingTimeline"
import { TrackingRecord } from "@/lib/types"
import { ChevronDown, ChevronUp, Download } from "lucide-react"
import { exportToCSV, exportToExcel } from "@/lib/export-utils"

interface BulkResultsTableProps {
  results: TrackingRecord[]
}

export function BulkResultsTable({ results }: BulkResultsTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

  const toggleRow = (trackingNumber: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(trackingNumber)) {
      newExpanded.delete(trackingNumber)
    } else {
      newExpanded.add(trackingNumber)
    }
    setExpandedRows(newExpanded)
  }

  const toggleSelection = (trackingNumber: string) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(trackingNumber)) {
      newSelected.delete(trackingNumber)
    } else {
      newSelected.add(trackingNumber)
    }
    setSelectedRows(newSelected)
  }

  const toggleAllSelection = () => {
    if (selectedRows.size === results.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(results.map((r) => r.trackingNumber)))
    }
  }

  const handleExport = (format: 'csv' | 'xlsx') => {
    const dataToExport =
      selectedRows.size > 0
        ? results.filter((r) => selectedRows.has(r.trackingNumber))
        : results

    if (format === 'csv') {
      exportToCSV(dataToExport, `tracking-export-${Date.now()}`)
    } else {
      exportToExcel(dataToExport, `tracking-export-${Date.now()}`)
    }
  }

  if (results.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Results ({results.length} shipments)
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('csv')}
            >
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('xlsx')}
            >
              <Download className="w-4 h-4 mr-2" />
              Excel
            </Button>
          </div>
        </div>
        {selectedRows.size > 0 && (
          <p className="text-sm text-gray-500">
            {selectedRows.size} selected - export will include selected items only
          </p>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selectedRows.size === results.length}
                  onChange={toggleAllSelection}
                  className="w-4 h-4 rounded border-gray-300"
                />
              </TableHead>
              <TableHead>Tracking #</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Origin</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Last Event</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result) => {
              const isExpanded = expandedRows.has(result.trackingNumber)
              const isSelected = selectedRows.has(result.trackingNumber)
              const lastEvent = result.events?.[0]

              return (
                <>
                  <TableRow
                    key={result.trackingNumber}
                    className="cursor-pointer"
                    onClick={() => toggleRow(result.trackingNumber)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelection(result.trackingNumber)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell className="font-mono font-medium">
                      {result.trackingNumber}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={result.status || 'unknown'} />
                    </TableCell>
                    <TableCell>{result.origin || '-'}</TableCell>
                    <TableCell>{result.destination || '-'}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {lastEvent?.event || '-'}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow key={`${result.trackingNumber}-expanded`}>
                      <TableCell colSpan={7} className="bg-gray-50">
                        <div className="p-4">
                          <TrackingTimeline events={result.events || []} />
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
