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
  const workbook = XLSX.utils.book_new()

  // Sheet 1: Summary
  const summaryData = records.map((record) => {
    const lastEvent = record.events?.[0]
    return {
      'Tracking Number': record.trackingNumber,
      'Status': record.status || '',
      'Origin': record.origin || '',
      'Destination': record.destination || '',
      'Article Type': record.articleType || '',
      'Booked On': record.bookedOn || '',
      'Delivered On': record.deliveredOn || '',
      'Total Events': record.events?.length || 0,
      'Last Event': lastEvent?.event || '',
      'Last Event Date': lastEvent?.date || '',
    }
  })

  const summarySheet = XLSX.utils.json_to_sheet(summaryData)

  // Auto-size columns for summary
  const summaryKeys = Object.keys(summaryData[0] || {})
  summarySheet['!cols'] = summaryKeys.map((key) => {
    const maxLength = Math.max(
      key.length,
      ...summaryData.map((row) => String(row[key as keyof typeof row] || '').length)
    )
    return { wch: Math.min(maxLength + 2, 50) }
  })

  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

  // Sheet 2: Detailed Events
  const eventsData: any[] = []

  records.forEach((record) => {
    if (record.events && record.events.length > 0) {
      record.events.forEach((event, index) => {
        eventsData.push({
          'Tracking Number': record.trackingNumber,
          'Status': record.status || '',
          'Origin': record.origin || '',
          'Destination': record.destination || '',
          'Event #': index + 1,
          'Event Date': event.date || '',
          'Event Time': event.time || '',
          'Event Description': event.event || '',
          'Office/Location': event.office || event.location || '',
        })
      })
    } else {
      // Add a row even if no events
      eventsData.push({
        'Tracking Number': record.trackingNumber,
        'Status': record.status || '',
        'Origin': record.origin || '',
        'Destination': record.destination || '',
        'Event #': '-',
        'Event Date': '-',
        'Event Time': '-',
        'Event Description': 'No events available',
        'Office/Location': '-',
      })
    }
  })

  const eventsSheet = XLSX.utils.json_to_sheet(eventsData)

  // Auto-size columns for events
  const eventsKeys = Object.keys(eventsData[0] || {})
  eventsSheet['!cols'] = eventsKeys.map((key) => {
    const maxLength = Math.max(
      key.length,
      ...eventsData.map((row) => String(row[key as keyof typeof row] || '').length)
    )
    return { wch: Math.min(maxLength + 2, 60) }
  })

  XLSX.utils.book_append_sheet(workbook, eventsSheet, 'Detailed Events')

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
  const workbook = XLSX.utils.book_new()

  // Sheet 1: Summary
  const summaryData = records.map((record) => {
    const lastEvent = record.events?.[0]
    return {
      'Tracking Number': record.trackingNumber,
      'Status': record.status || '',
      'Origin': record.origin || '',
      'Destination': record.destination || '',
      'Article Type': record.articleType || '',
      'Booked On': record.bookedOn || '',
      'Delivered On': record.deliveredOn || '',
      'Total Events': record.events?.length || 0,
      'Last Event': lastEvent?.event || '',
      'Last Event Date': lastEvent?.date || '',
    }
  })

  const summarySheet = XLSX.utils.json_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

  // Sheet 2: Detailed Events
  const eventsData: any[] = []

  records.forEach((record) => {
    if (record.events && record.events.length > 0) {
      record.events.forEach((event, index) => {
        eventsData.push({
          'Tracking Number': record.trackingNumber,
          'Status': record.status || '',
          'Origin': record.origin || '',
          'Destination': record.destination || '',
          'Event #': index + 1,
          'Event Date': event.date || '',
          'Event Time': event.time || '',
          'Event Description': event.event || '',
          'Office/Location': event.office || event.location || '',
        })
      })
    }
  })

  if (eventsData.length > 0) {
    const eventsSheet = XLSX.utils.json_to_sheet(eventsData)
    XLSX.utils.book_append_sheet(workbook, eventsSheet, 'Detailed Events')
  }

  return XLSX.write(workbook, { type: 'array', bookType: 'xlsx' }) as Uint8Array
}
