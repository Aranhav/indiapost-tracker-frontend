# India Post Tracker Frontend

A Next.js application for tracking India Post shipments with real-time scraping, flight event filtering, and bulk tracking capabilities.

## Tech Stack

- **Framework:** Next.js 14
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI, shadcn/ui

## Features

- Single shipment tracking
- Bulk tracking (up to 10 shipments)
- Flight event filtering
- Export to CSV/Excel
- Real-time scraping from India Post

---

## API Documentation

### Base URL

```
https://your-domain.com/api
```

---

### 1. Single Tracking

Track a single shipment by tracking number.

**Endpoint:** `GET /api/track`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | India Post tracking number (e.g., `LP951627598IN`) |
| `flightOnly` | boolean | No | If `true`, returns only flight/air transport events |

**Example Requests:**

```bash
# Get all events
curl "https://your-domain.com/api/track?id=LP951627598IN"

# Get only flight events
curl "https://your-domain.com/api/track?id=LP951627598IN&flightOnly=true"
```

**Response:**

```json
{
  "trackingNumber": "LP951627598IN",
  "status": "Delivered",
  "origin": "India",
  "destination": "Canada",
  "bookedOn": "08-01-2026",
  "deliveredOn": "16-01-2026",
  "articleType": "Letter Post",
  "events": [
    {
      "id": "clxxx...",
      "date": "11-01-2026",
      "time": "07:27:00",
      "office": null,
      "event": "Aircraft take off",
      "location": "Flight - AI0187 (DEL to YYZ)"
    }
  ],
  "flightSummary": {
    "hasFlightEvents": true,
    "flightEventCount": 5,
    "flights": [
      {
        "flightNumber": "AI0187",
        "airline": "AI",
        "origin": "DEL",
        "destination": "YYZ",
        "date": "11-01-2026",
        "time": "07:27:00"
      }
    ]
  },
  "cached": false,
  "flightOnly": false
}
```

---

### 2. Bulk Tracking

Track multiple shipments simultaneously.

**Endpoint:** `POST /api/track-bulk`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `trackingNumbers` | string[] | Yes | Array of tracking numbers (max 10) |
| `flightOnly` | boolean | No | If `true`, returns only flight events for all shipments |

**Example Request:**

```bash
curl -X POST "https://your-domain.com/api/track-bulk" \
  -H "Content-Type: application/json" \
  -d '{
    "trackingNumbers": ["LP951627598IN", "LP951629165IN"],
    "flightOnly": true
  }'
```

**Response:**

```json
{
  "total": 2,
  "successful": 2,
  "failed": 0,
  "flightOnly": true,
  "results": [
    {
      "trackingNumber": "LP951627598IN",
      "status": "Delivered",
      "origin": "India",
      "destination": "Canada",
      "bookedOn": "08-01-2026",
      "deliveredOn": "16-01-2026",
      "articleType": "Letter Post",
      "events": [...],
      "flightSummary": {
        "hasFlightEvents": true,
        "flightEventCount": 5,
        "flights": [...]
      }
    },
    {
      "trackingNumber": "LP951629165IN",
      "status": "Delivered",
      "events": [...],
      "flightSummary": {...}
    }
  ]
}
```

---

## Flight Event Detection

The API automatically detects and categorizes flight/air transport events based on:

### Definitive Flight Indicators

| Event Type | Description |
|------------|-------------|
| `Aircraft take off` | Package departed on aircraft |
| `Handed over to Airport facility` | Handoff to airport |
| `Transport leg completed` | Flight segment completed |

### Export/International Indicators

| Event Type | Description |
|------------|-------------|
| `Sent to Export Customs` | Pre-flight customs clearance |
| `Out from Export Customs` | Cleared for export |
| `Received Receptacle from abroad` | Arrived via international flight |
| `Assigned to load plan` | Cargo load planning |

### Flight Number Pattern

Flight information is extracted from the `location` field:

```
Flight - AI0187 (DEL to YYZ)
         ↑       ↑       ↑
      Airline  Origin  Destination
```

**Supported Airlines:** AI (Air India), LH (Lufthansa), and others

---

## Response Fields

### Tracking Response

| Field | Type | Description |
|-------|------|-------------|
| `trackingNumber` | string | The tracking number |
| `status` | string | Current status (Delivered, In Transit, etc.) |
| `origin` | string | Origin country/location |
| `destination` | string | Destination country/location |
| `bookedOn` | string | Booking date |
| `deliveredOn` | string | Delivery date (if delivered) |
| `articleType` | string | Type of shipment |
| `events` | array | List of tracking events |
| `flightSummary` | object | Summary of flight information |
| `cached` | boolean | Whether data was from cache |
| `flightOnly` | boolean | Whether only flight events are returned |

### Event Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique event ID |
| `date` | string | Event date |
| `time` | string | Event time |
| `office` | string | Post office name |
| `event` | string | Event description |
| `location` | string | Location details (may contain flight info) |

### Flight Summary Object

| Field | Type | Description |
|-------|------|-------------|
| `hasFlightEvents` | boolean | Whether shipment has flight events |
| `flightEventCount` | number | Number of flight-related events |
| `flights` | array | List of unique flights used |

### Flight Object

| Field | Type | Description |
|-------|------|-------------|
| `flightNumber` | string | Flight number (e.g., AI0187) |
| `airline` | string | Airline code (e.g., AI) |
| `origin` | string | Origin airport code |
| `destination` | string | Destination airport code |
| `date` | string | Date of flight event |
| `time` | string | Time of flight event |

---

## Error Responses

| Status Code | Description |
|-------------|-------------|
| 400 | Bad request (missing tracking number, too many items) |
| 404 | Tracking information not found |
| 500 | Internal server error |

**Error Response Format:**

```json
{
  "error": "Error message description"
}
```

---

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL

# Run database migrations
npx prisma db push

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev
```

### Environment Variables

```env
DATABASE_URL="postgresql://user:password@host:port/database"
```

---

## Scripts

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Database operations
npx prisma db push      # Push schema to database
npx prisma generate     # Generate Prisma client
npx prisma studio       # Open database GUI

# Cleanup duplicates (if needed)
npx tsx scripts/cleanup-duplicates.ts
```

---

## License

MIT
