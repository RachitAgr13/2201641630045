# URL Shortener

A comprehensive React URL Shortener Web Application with advanced logging middleware, analytics, and expiry management.

## Features

### Core Functionality
- **URL Shortening**: Create short links with up to 5 concurrent URLs per user
- **Custom Shortcodes**: Optional custom shortcodes (3-20 characters)
- **Expiry Management**: Configurable validity periods (5 minutes to 24 hours)
- **Click Analytics**: Detailed tracking with timestamps and geographical data
- **Real-time Statistics**: Comprehensive analytics dashboard

### Technical Features
- **Comprehensive Logging**: Structured logging with multiple levels (ERROR, WARN, INFO, DEBUG)
- **Client-side Validation**: Input validation before API calls
- **Error Handling**: Robust error handling with user-friendly messages
- **Material-UI Design**: Modern, responsive UI with excellent UX
- **RESTful API**: Clean API endpoints for all operations

## Project Structure

```
c:\volume_D\2201641630045\
├── Frontend Test Submission/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navigation.js     # Navigation component
│   │   │   ├── URLShortener.js   # Main URL shortening page
│   │   │   └── URLStatistics.js  # Analytics dashboard
│   │   ├── App.js               # Main React app
│   │   └── index.js             # React entry point
│   └── package.json             # Frontend dependencies
├── Logging Middleware/
│   ├── server.js                # Comprehensive logging middleware
│   └── api-server.js            # Express.js backend server
├── logs/                        # Auto-generated log files
├── package.json                 # Main project configuration
└── README.md                    # This file
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Quick Start

1. **Install all dependencies**:
   ```bash
   npm run install-all
   ```

2. **Start the application**:
   ```bash
   npm start
   ```

   This will start both the backend server (port 3001) and React frontend (port 3000).

### Manual Setup

1. **Install root dependencies**:
   ```bash
   npm install
   ```

2. **Install frontend dependencies**:
   ```bash
   cd "Frontend Test Submission"
   npm install
   cd ..
   ```

3. **Start backend server**:
   ```bash
   npm run server
   ```

4. **Start frontend (in another terminal)**:
   ```bash
   npm run client
   ```

## API Endpoints

### POST /api/shorten
Create a shortened URL.

**Request Body**:
```json
{
  "originalUrl": "https://example.com/very-long-url",
  "customShortcode": "my-code",  // Optional
  "validityPeriod": 30           // Minutes, default: 30
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "originalUrl": "https://example.com/very-long-url",
    "shortCode": "abc123",
    "shortUrl": "http://localhost:3001/abc123",
    "expiryDate": "2023-12-01T12:00:00.000Z",
    "validityPeriod": 30
  }
}
```

### GET /api/urls
Get all URLs with statistics.

### GET /api/analytics/:shortCode
Get detailed analytics for a specific URL.

### GET /:shortCode
Redirect to the original URL (with analytics tracking).

### GET /api/health
Health check endpoint.

## Logging System

The application uses a comprehensive logging middleware that captures:

- **HTTP Requests/Responses**: All API calls with timing and status codes
- **URL Operations**: Creation, access, expiry events
- **Validation Errors**: Client-side and server-side validation failures
- **System Events**: Server startup, database operations, errors

### Test Server Integration
The logging middleware integrates with the Test Server API:
- **API Endpoint**: `http://28.244.56.144/evaluation-service/logs`
- **Method**: POST
- **Payload**: `{stack, level, package, message}`
- **Timeout**: 5 seconds with graceful failure handling

### Log Structure
```
[timestamp] [level] [package] message (Stack: stack-trace)
```

### Log Destinations
- **Test Server API**: All logs sent to evaluation service
- **Local Files**: Saved to `logs/app-YYYY-MM-DD.log`
- **Console Output**: For development debugging
- **Structured Format**: JSON payload for API integration

## Requirements Compliance

✅ **Mandatory Logging Integration**: Extensive use of the logging middleware throughout the application
✅ **React Application**: Built with React 18 and Material-UI
✅ **Authentication**: Pre-authorized access (no login required as specified)
✅ **Short Link Uniqueness**: Automatic generation ensures uniqueness
✅ **Default Validity**: 30-minute default expiry with customizable options
✅ **Custom Shortcodes**: Support for user-defined shortcodes with validation
✅ **Redirection**: Proper HTTP redirects with client-side routing management
✅ **Error Handling**: Comprehensive error handling with user-friendly messages
✅ **User Experience**: Clean, intuitive UI with focus on key elements
✅ **Material UI Only**: Exclusively uses Material-UI components (no other CSS libraries)

## Usage Examples

### Creating a Short URL
1. Navigate to the URL Shortener page
2. Enter your long URL
3. Optionally set a custom shortcode
4. Choose validity period
5. Click "Shorten URL"

### Viewing Statistics
1. Navigate to the Statistics page
2. View all created URLs with:
   - Creation and expiry dates
   - Click counts
   - Geographic data of clicks
   - Status (Active/Expired)

### Accessing Short URLs
- Visit `http://localhost:3001/[shortcode]` to be redirected
- Each access is logged with timestamp and location data

## Development

### Available Scripts
- `npm start` - Start both backend and frontend
- `npm run server` - Start only backend server
- `npm run client` - Start only frontend
- `npm run build` - Build frontend for production
- `npm run install-all` - Install all dependencies

### Environment Variables
- `PORT` - Backend server port (default: 3001)

## Technical Specifications

- **Backend**: Node.js with Express.js
- **Frontend**: React 18 with Material-UI v5
- **State Management**: React hooks (useState, useEffect)
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Styling**: Material-UI theming system
- **Data Storage**: In-memory (Map objects) - easily replaceable with database
- **Logging**: Custom middleware with file and console output

## Troubleshooting

### Common Issues

1. **Frontend fails to start**: Make sure you've run `npm run install-all` to install all dependencies
2. **CORS errors**: Backend should be running on port 3001 with CORS enabled
3. **Module not found**: Ensure all dependencies are installed in both root and frontend directories

### Installation Steps if npm start fails:
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd "Frontend Test Submission"
npm install
cd ..

# Start the application
npm start
