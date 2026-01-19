import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fetchTrackingFromAPI } from '@/lib/tracking-api'

const CACHE_DURATION_MS = 15 * 60 * 1000 // 15 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const trackingNumber = searchParams.get('id')?.trim().toUpperCase()

    if (!trackingNumber) {
      return NextResponse.json(
        { error: 'Tracking number is required' },
        { status: 400 }
      )
    }

    // Check if we have a recent record in the database
    const existingRecord = await prisma.trackingRecord.findUnique({
      where: { trackingNumber },
      include: { events: { orderBy: { createdAt: 'desc' } } },
    })

    const now = new Date()
    const isRecent = existingRecord &&
      (now.getTime() - existingRecord.updatedAt.getTime()) < CACHE_DURATION_MS

    if (isRecent && existingRecord) {
      return NextResponse.json({
        trackingNumber: existingRecord.trackingNumber,
        status: existingRecord.status,
        origin: existingRecord.origin,
        destination: existingRecord.destination,
        bookedOn: existingRecord.bookedOn,
        deliveredOn: existingRecord.deliveredOn,
        articleType: existingRecord.articleType,
        events: existingRecord.events.map((e: any) => ({
          id: e.id,
          date: e.date,
          time: e.time,
          office: e.office,
          event: e.event,
          location: e.location,
        })),
        cached: true,
      })
    }

    // Fetch from external API
    const apiResponse = await fetchTrackingFromAPI(trackingNumber)

    if (!apiResponse.success || !apiResponse.data) {
      return NextResponse.json(
        { error: apiResponse.error || 'Failed to fetch tracking information' },
        { status: 404 }
      )
    }

    const data = apiResponse.data

    // Upsert the record in the database
    const savedRecord = await prisma.trackingRecord.upsert({
      where: { trackingNumber },
      create: {
        trackingNumber,
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

    return NextResponse.json({
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
      cached: false,
    })
  } catch (error) {
    console.error('Tracking API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
