# Akeneo PIM Custom App Extension - Demo

A demonstration application showing how to build custom iframe extensions for Akeneo PIM. This app integrates with Akeneo's Product Information Management system to display product data, order information, and leverages the PostMessage API for context communication.

## Features

### 1. Product Information Display
- Displays product details (SKU, Name, Family) fetched from Akeneo PIM
- Automatically retrieves product data based on UUID from URL query parameters
- Color-coded UI matching Akeneo's design system

### 2. Order Status Integration
- Shows order information for products (number, quantity, status)
- Integrates with external ERP systems (currently using mocked data for demo)
- Color-coded order statuses (Shipped: green, Pending: orange, Cancelled: red)

### 3. Akeneo Context API
- Demonstrates PostMessage API integration with Akeneo PIM
- Requests and displays context information (locale, channel)
- Shows authenticated user information (UUID, username, groups)
- Real-time communication between iframe and parent window

### 4. PDF Generation & Upload
- Generates comprehensive product summary PDFs
- Includes product data, descriptions, and external stock information
- Automatically uploads generated PDFs back to Akeneo as media files

## Technology Stack

**Frontend:**
- React 18
- Akeneo Design System (ADS)
- React Router DOM

**Backend:**
- Node.js & Express
- Axios for API calls
- JWT for authentication
- PDFKit for PDF generation

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables by copying `.env.dist` to `.env`:
   ```bash
   cp .env.dist .env
   ```

4. Update the `.env` file with your Akeneo PIM credentials:
   - `AKENEO_BASE_URL` - Your Akeneo PIM instance URL
   - `AKENEO_CLIENT_ID` - OAuth client ID
   - `AKENEO_SECRET` - OAuth client secret
   - `AKENEO_USERNAME` - API username
   - `AKENEO_PASSWORD` - API password
   - `IFRAME_EXTENSION_SECRET` - Secret for iframe extension token verification

5. Build the frontend:
   ```bash
   npm run build
   ```

6. Start the application:
   ```bash
   npm run dev    # Development mode with auto-reload
   npm start      # Production mode
   ```

## API Endpoints

### GET `/api/get-product-order-status/:uuid`
Fetches product information from Akeneo and combines it with order status data.

### POST `/api/generate-pdf`
Generates a PDF summary for a product and uploads it to Akeneo PIM.

**Request body:**
```json
{
  "data": { "productUuid": "..." },
  "context": { "locale": "en_US", "channel": "..." },
  "user": { "uuid": "...", "username": "...", "groups": [...] },
  "timestamp": 1234567890
}
```

### GET `/api/get-mocked-external-data`
Returns mocked external stock data for demonstration purposes.

### GET `/api/get-mocked-order-status/:sku`
Returns mocked order status data for a given product SKU.

### POST `/api/verify-token`
Verifies JWT tokens for iframe extension authentication.

## Usage in Akeneo PIM

1. Configure this app as a custom app in your Akeneo PIM instance
2. Add the iframe extension to product edit pages
3. The extension will automatically load product data and display order information
4. Use the "Request Context" button to retrieve Akeneo context and user information

## Architecture

```
┌─────────────────────────────────────────────────────┐
│           Akeneo PIM (Parent Window)                │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │   Custom App Iframe Extension                 │ │
│  │   ┌─────────────────────────────────────┐     │ │
│  │   │  React Frontend (IframeExtension)   │     │ │
│  │   │  - Product Display                  │     │ │
│  │   │  - Order Information                │     │ │
│  │   │  - PostMessage Communication        │     │ │
│  │   └─────────────────────────────────────┘     │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
                         │
                         │ HTTP/API Calls
                         ▼
┌─────────────────────────────────────────────────────┐
│           Express Backend Server                    │
│   - Product API Integration                         │
│   - PDF Generation                                  │
│   - External Data Integration                       │
│   - Authentication & Token Verification             │
└─────────────────────────────────────────────────────┘
```

## Development

- Frontend source files are in `/src/components/`
- Backend routes are in `/routes/index.js`
- Helper functions are in `/src/helpers/`
- Built files are served from `/public/`

## License

This is a demonstration application for educational purposes.