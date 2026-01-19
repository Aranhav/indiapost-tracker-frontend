/**
 * Flight Event Detection Utilities
 *
 * Identifies flight/air transport events in India Post tracking data
 * based on event types and location patterns.
 */

// Event types that definitively indicate flight/air transport
const DEFINITIVE_FLIGHT_EVENTS = [
  'aircraft take off',
  'handed over to airport facility',
  'transport leg completed',
]

// Event types that indicate international/export (flight-related)
const EXPORT_FLIGHT_EVENTS = [
  'sent to export customs',
  'out from export customs',
  'received receptacle from abroad',
  'assigned to load plan',
]

// Pattern to detect flight numbers in location field
// Matches: "Flight - AI0187 (DEL to YYZ)" or "Flight - LH0761 (INDEL to DEFRA)"
const FLIGHT_NUMBER_PATTERN = /Flight\s*-\s*[A-Z]{2}\d{3,4}/i

/**
 * Determines if a tracking event is a flight/air transport event
 */
export function isFlightEvent(event: {
  event: string
  location?: string | null
  office?: string | null
}): boolean {
  const eventText = (event.event || '').toLowerCase().trim()
  const locationText = (event.location || '').toLowerCase().trim()

  // Check for definitive flight events
  for (const flightEvent of DEFINITIVE_FLIGHT_EVENTS) {
    if (eventText.includes(flightEvent)) {
      return true
    }
  }

  // Check for flight number pattern in location
  if (event.location && FLIGHT_NUMBER_PATTERN.test(event.location)) {
    return true
  }

  // Check for export/international flight events
  for (const exportEvent of EXPORT_FLIGHT_EVENTS) {
    if (eventText.includes(exportEvent)) {
      return true
    }
  }

  // Check for flight-related keywords in location
  if (
    locationText.includes('flight') ||
    locationText.includes('airport') ||
    locationText.includes('aircraft')
  ) {
    return true
  }

  return false
}

/**
 * Filters an array of events to return only flight-related events
 */
export function filterFlightEvents<T extends { event: string; location?: string | null; office?: string | null }>(
  events: T[]
): T[] {
  return events.filter(isFlightEvent)
}

/**
 * Extracts flight information from a location string
 * Returns null if no flight info found
 */
export function extractFlightInfo(location: string | null | undefined): {
  flightNumber: string
  airline: string
  origin: string
  destination: string
} | null {
  if (!location) return null

  // Pattern: "Flight - AI0187 (DEL to YYZ)"
  const match = location.match(/Flight\s*-\s*([A-Z]{2})(\d{3,4})\s*\(([A-Z]+)\s*to\s*([A-Z]+)\)/i)

  if (match) {
    return {
      flightNumber: `${match[1]}${match[2]}`,
      airline: match[1],
      origin: match[3],
      destination: match[4],
    }
  }

  return null
}

/**
 * Gets flight summary for a tracking record
 */
export function getFlightSummary(events: Array<{ event: string; location?: string | null; date?: string; time?: string }>): {
  hasFlightEvents: boolean
  flightCount: number
  flights: Array<{
    flightNumber: string
    airline: string
    origin: string
    destination: string
    date?: string
    time?: string
  }>
} {
  const flightEvents = filterFlightEvents(events)
  const flights: Array<{
    flightNumber: string
    airline: string
    origin: string
    destination: string
    date?: string
    time?: string
  }> = []

  const seenFlights = new Set<string>()

  for (const event of flightEvents) {
    const flightInfo = extractFlightInfo(event.location)
    if (flightInfo && !seenFlights.has(flightInfo.flightNumber)) {
      seenFlights.add(flightInfo.flightNumber)
      flights.push({
        ...flightInfo,
        date: event.date,
        time: event.time,
      })
    }
  }

  return {
    hasFlightEvents: flightEvents.length > 0,
    flightCount: flightEvents.length,
    flights,
  }
}
