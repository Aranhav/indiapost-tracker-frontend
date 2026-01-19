"use client"

import { useState, useRef, Fragment } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "./StatusBadge"
import { TrackingTimeline } from "./TrackingTimeline"
import { TrackingRecord } from "@/lib/types"
import {
  ChevronDown,
  ChevronUp,
  Download,
  ChevronsUpDown,
  ChevronsDownUp,
  ArrowUp,
  ArrowDown,
  FileSpreadsheet,
  FileText
} from "lucide-react"
import { exportToCSV, exportToExcel } from "@/lib/export-utils"

interface BulkResultsTableProps {
  results: TrackingRecord[]
}

export function BulkResultsTable({ results }: BulkResultsTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const tableRef = useRef<HTMLDivElement>(null)

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

  const expandAll = () => {
    setExpandedRows(new Set(results.map((r) => r.trackingNumber)))
  }

  const collapseAll = () => {
    setExpandedRows(new Set())
  }

  const scrollToTop = () => {
    tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const scrollToBottom = () => {
    tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
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

  const allExpanded = expandedRows.size === results.length
  const someExpanded = expandedRows.size > 0

  return (
    <div ref={tableRef}>
      <Card className="border border-gray-100 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="text-base font-semibold text-gray-900">
                Results
              </CardTitle>
              <p className="text-sm text-gray-500 mt-0.5">
                {results.length} shipment{results.length !== 1 ? 's' : ''} found
                {selectedRows.size > 0 && (
                  <span className="text-orange-600 ml-2">
                    ({selectedRows.size} selected)
                  </span>
                )}
                {someExpanded && (
                  <span className="text-gray-400 ml-2">
                    {expandedRows.size} expanded
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {/* Expand/Collapse buttons */}
              <button
                onClick={allExpanded ? collapseAll : expandAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                {allExpanded ? (
                  <>
                    <ChevronsDownUp className="w-3.5 h-3.5" />
                    Collapse All
                  </>
                ) : (
                  <>
                    <ChevronsUpDown className="w-3.5 h-3.5" />
                    Expand All
                  </>
                )}
              </button>

              <div className="w-px h-5 bg-gray-200 mx-1" />

              {/* Scroll buttons */}
              <button
                onClick={scrollToTop}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                Top
              </button>
              <button
                onClick={scrollToBottom}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                <ArrowDown className="w-3.5 h-3.5" />
                Bottom
              </button>

              <div className="w-px h-5 bg-gray-200 mx-1" />

              {/* Export buttons */}
              <button
                onClick={() => handleExport('csv')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                CSV
              </button>
              <button
                onClick={() => handleExport('xlsx')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-md hover:bg-orange-100 hover:border-orange-300 transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Excel
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 border-b border-gray-100">
                  <TableHead className="w-12 pl-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === results.length && results.length > 0}
                      onChange={toggleAllSelection}
                      className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 focus:ring-offset-0"
                    />
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Tracking #
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Origin
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Destination
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Last Event
                  </TableHead>
                  <TableHead className="w-12 pr-4"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => {
                  const isExpanded = expandedRows.has(result.trackingNumber)
                  const isSelected = selectedRows.has(result.trackingNumber)
                  const lastEvent = result.events?.[0]

                  return (
                    <Fragment key={result.trackingNumber}>
                      <TableRow
                        className={`cursor-pointer transition-colors border-b border-gray-50 ${
                          isSelected
                            ? 'bg-orange-50/50'
                            : 'hover:bg-gray-50/50'
                        } ${isExpanded ? 'bg-gray-50/30' : ''}`}
                        onClick={() => toggleRow(result.trackingNumber)}
                      >
                        <TableCell className="pl-4" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelection(result.trackingNumber)}
                            className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 focus:ring-offset-0"
                          />
                        </TableCell>
                        <TableCell className="font-mono text-sm font-medium text-gray-900">
                          {result.trackingNumber}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={result.status || 'unknown'} />
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {result.origin || '-'}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {result.destination || '-'}
                        </TableCell>
                        <TableCell className="max-w-[200px] text-sm text-gray-500 truncate">
                          {lastEvent?.event || '-'}
                        </TableCell>
                        <TableCell className="pr-4">
                          <button className="p-1 rounded hover:bg-gray-100 transition-colors">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow className="bg-gray-50/50">
                          <TableCell colSpan={7} className="p-0">
                            <div className="px-6 py-4 border-l-2 border-orange-200 ml-4 my-2 bg-white rounded-r-lg">
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                                Tracking History
                              </p>
                              <TrackingTimeline events={result.events || []} />
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
