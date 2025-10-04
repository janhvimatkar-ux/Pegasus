# Pegasus EdTech Platform

A robust Node.js service skeleton for an educational technology platform with integrated live class scheduling and Zoom integration.

## Features

- **Modular Architecture**: Clean separation of concerns with organized folder structure
- **Environment-Driven Configuration**: Secure management of API keys and secrets via environment variables
- **Structured Logging**: Comprehensive logging with Winston for debugging and monitoring
- **Live Class Scheduling**: Full-featured service for scheduling and managing live classes
- **Zoom Integration**: Mock and real Zoom API integration for virtual classrooms
- **Input Validation**: Request validation using Joi
- **Security**: Helmet for security headers, CORS support, rate limiting
- **Comprehensive Testing**: Unit tests for all components with Jest
- **RESTful API**: Clean API design following REST principles

## Project Structure

```
pegasus-edtech-platform/
├── src/
│   ├── config/             # Environment configuration
│   │   └── index.js
│   ├── controllers/        # Request handlers
│   │   └── liveClassController.js
│   ├── middleware/         # Express middleware
│   │   └── errorHandler.js
│   ├── models/            # Data models
│   │   └── LiveClass.js
│   ├── routes/            # API routes
│   │   └── index.js
│   ├── services/          # Business logic
│   │   ├── liveClassService.js
│   │   └── zoomService.js
│   ├── utils/             # Utilities
│   │   └── logger.js
│   └── index.js           # Application entry point
├── tests/                 # Test files
│   ├── config/
│   ├── controllers/
│   ├── models/
│   └── services/
├── logs/                  # Log files (auto-generated)
├── .env                   # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## Prerequisites

- Node.js >= 16.x
- npm >= 8.x

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pegasus-edtech-platform
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
# Copy the .env file and update with your values
cp .env .env.local
```

Edit `.env` with your configuration:
- `ZOOM_API_KEY`: Your Zoom API key
- `ZOOM_API_SECRET`: Your Zoom API secret
- `JWT_SECRET`: Secret for JWT token generation
- Other configuration as needed

## Usage

### Development Mode

Start the server with auto-reload:
```bash
npm run dev
```

### Production Mode

Start the server:
```bash
npm start
```

### Running Tests

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## API Endpoints

### Health Check
```
GET /api/v1/health
```

### Schedule Live Class
```
POST /api/v1/live-classes

Body:
{
  "instructorId": "string",
  "courseId": "string",
  "startTime": "ISO 8601 date string",
  "duration": 60 (optional, minutes),
  "topic": "string (optional)"
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "instructorId": "string",
    "courseId": "string",
    "startTime": "ISO 8601 date",
    "duration": 60,
    "zoomMeetingId": "string",
    "zoomJoinUrl": "string",
    "zoomStartUrl": "string",
    "status": "scheduled",
    "createdAt": "ISO 8601 date",
    "updatedAt": "ISO 8601 date"
  }
}
```

### Get Live Class
```
GET /api/v1/live-classes/:classId
```

### Get Live Classes by Course
```
GET /api/v1/courses/:courseId/live-classes
```

### Get Live Classes by Instructor
```
GET /api/v1/instructors/:instructorId/live-classes
```

### Cancel Live Class
```
DELETE /api/v1/live-classes/:classId
```

## Core Service: schedule_live_class

The main service function for scheduling live classes:

```javascript
const liveClassService = require('./src/services/liveClassService');

// Schedule a live class
const liveClass = await liveClassService.schedule_live_class(
  'instructor-123',    // instructorId
  'course-456',        // courseId
  '2025-12-31T10:00:00Z',  // startTime (ISO 8601)
  {
    duration: 60,      // optional, minutes
    topic: 'Advanced Mathematics',  // optional
    timezone: 'UTC'    // optional
  }
);
```

### Features:
- Validates all input parameters
- Creates a Zoom meeting (mock or real based on configuration)
- Returns complete class information including Zoom URLs
- Logs all operations for debugging

## Mock Zoom API

In development mode or when Zoom API credentials are not configured, the service uses mock Zoom data:

- Generates realistic meeting IDs, URLs, and passwords
- Simulates API latency
- Returns properly formatted Zoom meeting objects
- Perfect for development and testing without real Zoom account

To use real Zoom API:
1. Set `ZOOM_API_KEY` and `ZOOM_API_SECRET` in `.env`
2. Implement OAuth token retrieval in `zoomService.js`
3. Set `NODE_ENV=production`

## Logging

The service uses Winston for structured logging:

- **Console**: Colored output in development
- **File**: All logs in `logs/app.log`
- **Error File**: Errors only in `logs/error.log`
- **Structured Data**: JSON format for easy parsing
- **HTTP Requests**: Automatic request/response logging

Example logs:
```
2025-10-04 10:30:15 [info]: HTTP Request {
  "method": "POST",
  "url": "/api/v1/live-classes",
  "statusCode": 201,
  "responseTime": "234ms"
}
```

## Security Features

- **Helmet**: Security headers
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: Prevent abuse (100 requests per 15 minutes by default)
- **Input Validation**: All requests validated with Joi
- **Environment Variables**: Sensitive data in .env files (not committed)

## Testing

The project includes comprehensive unit tests:

- **Models**: LiveClass validation and methods
- **Services**: liveClassService and zoomService
- **Controllers**: API endpoint behavior
- **Config**: Configuration validation

All tests are written with Jest and include:
- Positive test cases
- Negative test cases
- Edge cases
- Error handling

Test coverage report is generated in `coverage/` directory.

## Error Handling

Global error handling middleware catches and logs all errors:
- Validation errors return 400
- Not found errors return 404
- Server errors return 500
- All errors are logged with context

## Future Enhancements

- Database integration (PostgreSQL/MongoDB)
- User authentication and authorization
- WebSocket support for real-time updates
- Zoom webhook handling
- Recording management
- Attendance tracking
- Email notifications
- Calendar integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT

## Support

For questions or issues, please open an issue on GitHub.
