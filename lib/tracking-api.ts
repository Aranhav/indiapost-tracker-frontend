import { ExternalAPIResponse, TrackingRecord } from './types'

const EXTERNAL_API_BASE = 'https://indiapost-tracker-service-production.up.railway.app'

export async function fetchTrackingFromAPI(trackingNumber: string): Promise<ExternalAPIResponse> {
  try {
    const response = await fetch(`${EXTERNAL_API_BASE}/track/${trackingNumber}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      return {
        success: false,
        error: `API returned status ${response.status}`,
      }
    }

    const data = await response.json()
    return {
      success: true,
      data: data,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

export async function fetchBulkTrackingFromAPI(
  trackingNumbers: string[]
): Promise<{ results: Array<{ trackingNumber: string; success: boolean; data?: any; error?: string }> }> {
  try {
    const response = await fetch(`${EXTERNAL_API_BASE}/track/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ trackingNumbers }),
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    // If bulk endpoint fails, fallback to individual requests
    const results = await Promise.all(
      trackingNumbers.map(async (num) => {
        const result = await fetchTrackingFromAPI(num)
        return {
          trackingNumber: num,
          success: result.success,
          data: result.data,
          error: result.error,
        }
      })
    )
    return { results }
  }
}

export function normalizeStatus(status: string | undefined): string {
  if (!status) return 'unknown'

  const lowerStatus = status.toLowerCase()

  if (lowerStatus.includes('delivered')) return 'delivered'
  if (lowerStatus.includes('out for delivery')) return 'out_for_delivery'
  if (lowerStatus.includes('transit') || lowerStatus.includes('dispatched')) return 'in_transit'
  if (lowerStatus.includes('picked') || lowerStatus.includes('received')) return 'picked_up'
  if (lowerStatus.includes('booked') || lowerStatus.includes('posted')) return 'booked'
  if (lowerStatus.includes('returned') || lowerStatus.includes('rto')) return 'returned'
  if (lowerStatus.includes('failed') || lowerStatus.includes('undelivered')) return 'failed'

  return 'in_transit'
}
