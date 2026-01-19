import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fetchBulkTrackingFromAPI } from '@/lib/tracking-api'

const MAX_TRACKING_NUMBERS = 10

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const trackingNumbers: string[] = body.trackingNumbers || []

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

    // Fetch from external API
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

        try {
          // Upsert to database
          const savedRecord = await prisma.trackingRecord.upsert({
            where: { trackingNumber: result.trackingNumber },
            create: {
              trackingNumber: result.trackingNumber,
              status: data.status,
              origin: data.origin,
              destination: data.destination,
              bookedOn: data.bookedOn,
              deliveredOn: data.deliveredOn,
              articleType: data.articleType,
              rawResponse: data,
              events: {
                create: (data.events || []).map((event: any) => ({
                  date: event.date,
                  time: event.time,
                  office: event.office,
                  event: event.event,
                  location: event.location,
                })),
              },
            },
            update: {
              status: data.status,
              origin: data.origin,
              destination: data.destination,
              bookedOn: data.bookedOn,
              deliveredOn: data.deliveredOn,
              articleType: data.articleType,
              rawResponse: data,
              events: {
                deleteMany: {},
                create: (data.events || []).map((event: any) => ({
                  date: event.date,
                  time: event.time,
                  office: event.office,
                  event: event.event,
                  location: event.location,
                })),
              },
            },
            include: { events: { orderBy: { createdAt: 'desc' } } },
          })

          processedResults.push({
            trackingNumber: savedRecord.trackingNumber,
            status: savedRecord.status,
            origin: savedRecord.origin,
            destination: savedRecord.destination,
            bookedOn: savedRecord.bookedOn,
            deliveredOn: savedRecord.deliveredOn,
            articleType: savedRecord.articleType,
            events: savedRecord.events.map((e: any) => ({
              id: e.id,
              date: e.date,
              time: e.time,
              office: e.office,
              event: e.event,
              location: e.location,
            })),
          })
        } catch (dbError) {
          console.error(`DB error for ${result.trackingNumber}:`, dbError)
          // Still include the result even if DB save fails
          processedResults.push({
            trackingNumber: result.trackingNumber,
            status: data.status,
            origin: data.origin,
            destination: data.destination,
            bookedOn: data.bookedOn,
            deliveredOn: data.deliveredOn,
            articleType: data.articleType,
            events: data.events || [],
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
