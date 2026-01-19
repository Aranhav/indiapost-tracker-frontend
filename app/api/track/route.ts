import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fetchTrackingFromAPI } from '@/lib/tracking-api'
import { filterFlightEvents, getFlightSummary } from '@/lib/flight-utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const trackingNumber = searchParams.get('id')?.trim().toUpperCase()
    const flightOnly = searchParams.get('flightOnly') === 'true'

    if (!trackingNumber) {
      return NextResponse.json(
        { error: 'Tracking number is required' },
        { status: 400 }
      )
    }

    // Always fetch fresh data from scraping API
    const apiResponse = await fetchTrackingFromAPI(trackingNumber)

    if (!apiResponse.success || !apiResponse.data) {
      return NextResponse.json(
        { error: apiResponse.error || 'Failed to fetch tracking information' },
        { status: 404 }
      )
    }

    const data = apiResponse.data

    // Deduplicate events based on date + time + event + office
    const uniqueEvents = deduplicateEvents(data.events || [])

    // Save to database using transaction to prevent race conditions
    const savedRecord = await prisma.$transaction(async (tx) => {
      // Delete existing events for this tracking number
      const existingRecord = await tx.trackingRecord.findUnique({
        where: { trackingNumber },
      })

      if (existingRecord) {
        await tx.trackingEvent.deleteMany({
          where: { trackingRecordId: existingRecord.id },
        })
      }

      // Upsert the record with new events
      return tx.trackingRecord.upsert({
        where: { trackingNumber },
        create: {
          trackingNumber,
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

    return NextResponse.json({
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
      cached: false,
      flightOnly,
    })
  } catch (error) {
    console.error('Tracking API error:', error)
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
