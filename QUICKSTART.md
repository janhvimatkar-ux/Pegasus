# Quick Start Guide

Get up and running with Pegasus EdTech Platform in 5 minutes!

## Prerequisites

- Node.js 16+ installed
- npm 8+ installed

Check versions:
```bash
node --version
npm --version
```

## Installation

1. **Clone and navigate to the project:**
```bash
cd pegasus-edtech-platform
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment (already done, but you can customize):**
```bash
# The .env file is already set up with development defaults
# Edit if you want to change ports or add real Zoom credentials
```

## Start the Server

```bash
npm run dev
```

You should see:
```
Server started on localhost:3000
```

## Test the API

### 1. Health Check
```bash
curl http://localhost:3000/api/v1/health
```

Expected response:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-10-04T...",
  "service": "pegasus-edtech-platform"
}
```

### 2. Schedule a Live Class

```bash
curl -X POST http://localhost:3000/api/v1/live-classes \
  -H "Content-Type: application/json" \
  -d '{
    "instructorId": "instructor-123",
    "courseId": "course-456",
    "startTime": "2025-12-31T10:00:00Z",
    "duration": 60,
    "topic": "Introduction to Node.js"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "id": "...",
    "instructorId": "instructor-123",
    "courseId": "course-456",
    "startTime": "2025-12-31T10:00:00Z",
    "duration": 60,
    "zoomMeetingId": "123456789",
    "zoomJoinUrl": "https://zoom.us/j/...",
    "zoomStartUrl": "https://zoom.us/s/...",
    "status": "scheduled",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### 3. Get the Live Class

Replace `{CLASS_ID}` with the ID from the previous response:

```bash
curl http://localhost:3000/api/v1/live-classes/{CLASS_ID}
```

### 4. Get All Classes for a Course

```bash
curl http://localhost:3000/api/v1/courses/course-456/live-classes
```

### 5. Cancel a Live Class

```bash
curl -X DELETE http://localhost:3000/api/v1/live-classes/{CLASS_ID}
```

## Run Tests

```bash
npm test
```

Expected output:
```
Test Suites: 5 passed, 5 total
Tests:       XX passed, XX total
```

## What's Next?

1. **Explore the API**: Check out the full API documentation in README.md
2. **Customize Configuration**: Edit `.env` for your needs
3. **Add Real Zoom Integration**: Add your Zoom API credentials
4. **Explore the Code**: Start with `src/services/liveClassService.js`
5. **Build Your Features**: Follow the patterns established in the codebase

## Common Commands

```bash
npm start           # Start production server
npm run dev         # Start development server with auto-reload
npm test            # Run all tests
npm run test:watch  # Run tests in watch mode
npm run lint        # Check code style
```

## Project Structure Quick Reference

```
src/
├── config/         # Environment variables & config
├── controllers/    # API request handlers
├── services/       # Business logic (START HERE!)
├── models/         # Data models
├── routes/         # API endpoints
├── middleware/     # Express middleware
└── utils/          # Helpers (logger, etc.)
```

## Key Files

- `src/services/liveClassService.js` - Main scheduling logic
- `src/services/zoomService.js` - Zoom API integration
- `src/models/LiveClass.js` - Live class data model
- `.env` - Configuration

## Troubleshooting

**Port already in use?**
```bash
# Change PORT in .env file
PORT=3001
```

**Tests failing?**
```bash
# Clear Jest cache
npm test -- --clearCache
npm test
```

**Module not found?**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

## Need Help?

- Read the full README.md
- Check the code examples in tests/
- Review the inline documentation
- Create an issue on GitHub

Happy coding! 🚀

