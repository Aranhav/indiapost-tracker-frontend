import * as XLSX from 'xlsx'
import { TrackingRecord } from './types'

export function exportToCSV(records: TrackingRecord[], filename: string = 'tracking-data'): void {
  const headers = [
    'Tracking Number',
    'Status',
    'Origin',
    'Destination',
    'Article Type',
    'Booked On',
    'Delivered On',
    'Last Event',
    'Last Event Date',
  ]

  const rows = records.map((record) => {
    const lastEvent = record.events?.[0]
    return [
      record.trackingNumber,
      record.status || '',
      record.origin || '',
      record.destination || '',
      record.articleType || '',
      record.bookedOn || '',
      record.deliveredOn || '',
      lastEvent?.event || '',
      lastEvent?.date || '',
    ]
  })

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n')

  downloadFile(csvContent, `${filename}.csv`, 'text/csv')
}

export function exportToExcel(records: TrackingRecord[], filename: string = 'tracking-data'): void {
  const data = records.map((record) => {
    const lastEvent = record.events?.[0]
    return {
      'Tracking Number': record.trackingNumber,
      Status: record.status || '',
      Origin: record.origin || '',
      Destination: record.destination || '',
      'Article Type': record.articleType || '',
      'Booked On': record.bookedOn || '',
      'Delivered On': record.deliveredOn || '',
      'Last Event': lastEvent?.event || '',
      'Last Event Date': lastEvent?.date || '',
    }
  })

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Tracking Data')

  // Auto-size columns
  const maxWidths = Object.keys(data[0] || {}).map((key) => {
    const maxLength = Math.max(
      key.length,
      ...data.map((row) => String(row[key as keyof typeof row] || '').length)
    )
    return { wch: Math.min(maxLength + 2, 50) }
  })
  worksheet['!cols'] = maxWidths

  XLSX.writeFile(workbook, `${filename}.xlsx`)
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function generateExportData(records: TrackingRecord[]): Uint8Array {
  const data = records.map((record) => {
    const lastEvent = record.events?.[0]
    return {
      'Tracking Number': record.trackingNumber,
      Status: record.status || '',
      Origin: record.origin || '',
      Destination: record.destination || '',
      'Article Type': record.articleType || '',
      'Booked On': record.bookedOn || '',
      'Delivered On': record.deliveredOn || '',
      'Last Event': lastEvent?.event || '',
      'Last Event Date': lastEvent?.date || '',
    }
  })

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Tracking Data')

  return XLSX.write(workbook, { type: 'array', bookType: 'xlsx' }) as Uint8Array
}
