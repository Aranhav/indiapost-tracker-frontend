/**
 * Script to clean up duplicate tracking events from the database
 * Run this BEFORE applying the new schema migration
 *
 * Usage: npx ts-node scripts/cleanup-duplicates.ts
 * Or: npx tsx scripts/cleanup-duplicates.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupDuplicateEvents() {
  console.log('Starting duplicate event cleanup...\n')

  // Get all tracking records
  const records = await prisma.trackingRecord.findMany({
    include: { events: true },
  })

  console.log(`Found ${records.length} tracking records to process\n`)

  let totalDuplicatesRemoved = 0

  for (const record of records) {
    const events = record.events
    const seen = new Map<string, string>() // key -> eventId to keep
    const duplicateIds: string[] = []

    for (const event of events) {
      // Create composite key
      const key = `${event.date || ''}-${event.time || ''}-${event.event || ''}-${event.office || ''}`

      if (seen.has(key)) {
        // This is a duplicate, mark for deletion
        duplicateIds.push(event.id)
      } else {
        // First occurrence, keep it
        seen.set(key, event.id)
      }
    }

    if (duplicateIds.length > 0) {
      console.log(`Tracking #${record.trackingNumber}: Found ${duplicateIds.length} duplicate events`)

      // Delete duplicates
      await prisma.trackingEvent.deleteMany({
        where: {
          id: { in: duplicateIds },
        },
      })

      totalDuplicatesRemoved += duplicateIds.length
    }
  }

  console.log(`\n✅ Cleanup complete! Removed ${totalDuplicatesRemoved} duplicate events.`)
}

async function main() {
  try {
    await cleanupDuplicateEvents()
  } catch (error) {
    console.error('Error during cleanup:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
