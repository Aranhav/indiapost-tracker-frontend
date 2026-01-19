export interface TrackingEvent {
  id?: string
  date: string
  time?: string
  office?: string
  event: string
  location?: string
}

export interface TrackingRecord {
  id?: string
  trackingNumber: string
  status?: string
  origin?: string
  destination?: string
  bookedOn?: string
  deliveredOn?: string
  articleType?: string
  events: TrackingEvent[]
  rawResponse?: any
  createdAt?: Date
  updatedAt?: Date
}

export interface BulkTrackingResult {
  trackingNumber: string
  success: boolean
  data?: TrackingRecord
  error?: string
}

export interface ExternalAPIResponse {
  success: boolean
  data?: {
    trackingNumber: string
    status: string
    origin?: string
    destination?: string
    bookedOn?: string
    deliveredOn?: string
    articleType?: string
    events: Array<{
      date: string
      time?: string
      office?: string
      event: string
      location?: string
    }>
  }
  error?: string
}

export type TrackingStatus =
  | 'booked'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed'
  | 'returned'
  | 'unknown'
