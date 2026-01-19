"use client"

import { Button } from "@/components/ui/button"
import { TrackingRecord } from "@/lib/types"
import { exportToCSV, exportToExcel } from "@/lib/export-utils"
import { Download } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ExportButtonProps {
  data: TrackingRecord[]
  filename?: string
  disabled?: boolean
}

export function ExportButton({
  data,
  filename = "tracking-export",
  disabled = false,
}: ExportButtonProps) {
  const handleExport = (format: "csv" | "xlsx") => {
    const timestamp = new Date().toISOString().split("T")[0]
    const fullFilename = `${filename}-${timestamp}`

    if (format === "csv") {
      exportToCSV(data, fullFilename)
    } else {
      exportToExcel(data, fullFilename)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled || data.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("csv")}>
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("xlsx")}>
          Export as Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
