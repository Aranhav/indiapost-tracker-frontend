import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

interface ExportRow {
  'Tracking Number': string
  'Status': string
  'Origin': string
  'Destination': string
  'Article Type': string
  'Booked On': string
  'Delivered On': string
  'Last Event': string
  'Last Event Date': string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { trackingNumbers, format = 'xlsx' } = body

    if (!Array.isArray(trackingNumbers) || trackingNumbers.length === 0) {
      return NextResponse.json(
        { error: 'trackingNumbers array is required' },
        { status: 400 }
      )
    }

    // Fetch records from database
    const records = await prisma.trackingRecord.findMany({
      where: {
        trackingNumber: {
          in: trackingNumbers.map((n: string) => String(n).trim().toUpperCase()),
        },
      },
      include: {
        events: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    // Prepare data for export
    const data: ExportRow[] = records.map((record: any) => {
      const lastEvent = record.events[0]
      return {
        'Tracking Number': record.trackingNumber,
        'Status': record.status || '',
        'Origin': record.origin || '',
        'Destination': record.destination || '',
        'Article Type': record.articleType || '',
        'Booked On': record.bookedOn || '',
        'Delivered On': record.deliveredOn || '',
        'Last Event': lastEvent?.event || '',
        'Last Event Date': lastEvent?.date || '',
      }
    })

    if (format === 'csv') {
      // Generate CSV
      const headers = Object.keys(data[0] || {}) as (keyof ExportRow)[]
      const csvRows = [
        headers.join(','),
        ...data.map((row: ExportRow) =>
          headers.map((h: keyof ExportRow) => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(',')
        ),
      ]
      const csvContent = csvRows.join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename=tracking-export-${Date.now()}.csv`,
        },
      })
    } else {
      // Generate Excel
      const worksheet = XLSX.utils.json_to_sheet(data)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Tracking Data')

      // Auto-size columns
      const headers = Object.keys(data[0] || {}) as (keyof ExportRow)[]
      const maxWidths = headers.map((key: keyof ExportRow) => {
        const maxLength = Math.max(
          key.length,
          ...data.map((row: ExportRow) => String(row[key] || '').length)
        )
        return { wch: Math.min(maxLength + 2, 50) }
      })
      worksheet['!cols'] = maxWidths

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename=tracking-export-${Date.now()}.xlsx`,
        },
      })
    }
  } catch (error) {
    console.error('Export API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
