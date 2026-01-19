import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fetchBulkTrackingFromAPI } from '@/lib/tracking-api'
import { filterFlightEvents, getFlightSummary } from '@/lib/flight-utils'

const MAX_TRACKING_NUMBERS = 10

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const trackingNumbers: string[] = body.trackingNumbers || []
    const flightOnly: boolean = body.flightOnly === true

    if (!Array.isArray(trackingNumbers) || trackingNumbers.length === 0) {
      return NextResponse.json(
        { error: 'trackingNumbers array is required' },
        { status: 400 }
      )
    }

    // Clean and validate tracking numbers
    const cleanedNumbers = Array.from(new Set(
      trackingNumbers
        .map(n => String(n).trim().toUpperCase())
        .filter(n => n.length > 0)
    ))

    if (cleanedNumbers.length > MAX_TRACKING_NUMBERS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_TRACKING_NUMBERS} tracking numbers allowed` },
        { status: 400 }
      )
    }

    // Always fetch fresh data from scraping API
    const apiResponse = await fetchBulkTrackingFromAPI(cleanedNumbers)
    const results = apiResponse.results || []

    let successful = 0
    let failed = 0
    const processedResults: any[] = []

    // Process each result and save to database
    for (const result of results) {
      if (result.success && result.data) {
        successful++
        const data = result.data

        // Deduplicate events
        const uniqueEvents = deduplicateEvents(data.events || [])

        try {
          // Save to database using transaction to prevent race conditions
          const savedRecord = await prisma.$transaction(async (tx) => {
            // Delete existing events for this tracking number
            const existingRecord = await tx.trackingRecord.findUnique({
              where: { trackingNumber: result.trackingNumber },
            })

            if (existingRecord) {
              await tx.trackingEvent.deleteMany({
                where: { trackingRecordId: existingRecord.id },
              })
            }

            // Upsert the record with new events
            return tx.trackingRecord.upsert({
              where: { trackingNumber: result.trackingNumber },
              create: {
                trackingNumber: result.trackingNumber,
                status: data.status,
                origin: data.origin,
                destination: data.destination,
                bookedOn: data.booked_on || data.bookedOn,
                deliveredOn: data.delivered_on || data.deliveredOn,
                articleType: data.article_type || data.articleType,
                rawResponse: data,
                events: {
                  create: uniqueEvents.map((event: any) => ({
                    date: event.date || '',
                    time: event.time || null,
                    office: event.office || null,
                    event: event.event || '',
                    location: event.location || null,
                  })),
                },
              },
              update: {
                status: data.status,
                origin: data.origin,
                destination: data.destination,
                bookedOn: data.booked_on || data.bookedOn,
                deliveredOn: data.delivered_on || data.deliveredOn,
                articleType: data.article_type || data.articleType,
                rawResponse: data,
                events: {
                  create: uniqueEvents.map((event: any) => ({
                    date: event.date || '',
                    time: event.time || null,
                    office: event.office || null,
                    event: event.event || '',
                    location: event.location || null,
                  })),
                },
              },
              include: { events: { orderBy: { date: 'desc' } } },
            })
          })

          // Map events to response format
          let responseEvents = savedRecord.events.map((e: any) => ({
            id: e.id,
            date: e.date,
            time: e.time,
            office: e.office,
            event: e.event,
            location: e.location,
          }))

          // Filter to flight events only if requested
          if (flightOnly) {
            responseEvents = filterFlightEvents(responseEvents)
          }

          // Get flight summary
          const flightSummary = getFlightSummary(savedRecord.events)

          processedResults.push({
            trackingNumber: savedRecord.trackingNumber,
            status: savedRecord.status,
            origin: savedRecord.origin,
            destination: savedRecord.destination,
            bookedOn: savedRecord.bookedOn,
            deliveredOn: savedRecord.deliveredOn,
            articleType: savedRecord.articleType,
            events: responseEvents,
            flightSummary: {
              hasFlightEvents: flightSummary.hasFlightEvents,
              flightEventCount: flightSummary.flightCount,
              flights: flightSummary.flights,
            },
          })
        } catch (dbError) {
          console.error(`DB error for ${result.trackingNumber}:`, dbError)
          // Still include the result even if DB save fails
          let responseEvents = uniqueEvents
          if (flightOnly) {
            responseEvents = filterFlightEvents(uniqueEvents)
          }
          const flightSummary = getFlightSummary(uniqueEvents)

          processedResults.push({
            trackingNumber: result.trackingNumber,
            status: data.status,
            origin: data.origin,
            destination: data.destination,
            bookedOn: data.booked_on || data.bookedOn,
            deliveredOn: data.delivered_on || data.deliveredOn,
            articleType: data.article_type || data.articleType,
            events: responseEvents,
            flightSummary: {
              hasFlightEvents: flightSummary.hasFlightEvents,
              flightEventCount: flightSummary.flightCount,
              flights: flightSummary.flights,
            },
          })
        }
      } else {
        failed++
      }
    }

    // Save bulk session
    await prisma.bulkSession.create({
      data: {
        trackingNumbers: cleanedNumbers,
        total: cleanedNumbers.length,
        successful,
        failed,
      },
    })

    return NextResponse.json({
      total: cleanedNumbers.length,
      successful,
      failed,
      flightOnly,
      results: processedResults,
    })
  } catch (error) {
    console.error('Bulk tracking API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to deduplicate events based on composite key
function deduplicateEvents(events: any[]): any[] {
  const seen = new Set<string>()
  const unique: any[] = []

  for (const event of events) {
    // Create a composite key from date, time, event, and office
    const key = `${event.date || ''}-${event.time || ''}-${event.event || ''}-${event.office || ''}`

    if (!seen.has(key)) {
      seen.add(key)
      unique.push(event)
    }
  }

  return unique
}
