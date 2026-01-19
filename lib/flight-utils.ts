/**
 * Flight Event Detection Utilities
 *
 * Simple detection: if "flight" appears in the location field, it's a flight event.
 */

/**
 * Determines if a tracking event is a flight event
 * Simple check: location contains "flight"
 */
export function isFlightEvent(event: {
  event: string
  location?: string | null
}): boolean {
  const location = (event.location || '').toLowerCase()
  return location.includes('flight')
}

/**
 * Filters an array of events to return only flight events
 */
export function filterFlightEvents<T extends { event: string; location?: string | null }>(
  events: T[]
): T[] {
  return events.filter(isFlightEvent)
}

/**
 * Extracts flight info from location string
 * Example: "Flight - AI0187 (DEL to YYZ)" -> { flightNumber: "AI0187", ... }
 */
export function extractFlightInfo(location: string | null | undefined): {
  flightNumber: string
  airline: string
  origin: string
  destination: string
} | null {
  if (!location) return null

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
 * Gets flight summary for tracking events
 */
export function getFlightSummary(events: Array<{ event: string; location?: string | null; date?: string; time?: string | null }>): {
  hasFlightEvents: boolean
  flightCount: number
  flights: Array<{
    flightNumber: string
    airline: string
    origin: string
    destination: string
    date?: string
    time?: string | null
  }>
} {
  const flightEvents = filterFlightEvents(events)
  const flights: Array<{
    flightNumber: string
    airline: string
    origin: string
    destination: string
    date?: string
    time?: string | null
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
