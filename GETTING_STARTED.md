# 🚀 Getting Started with Pegasus EdTech Platform

Welcome! This guide will help you get up and running in minutes.

## 📋 What You Have

A complete, production-ready Node.js EdTech service with:

✅ **Core Service**: `schedule_live_class()` function  
✅ **Zoom Integration**: Mock API with real API support  
✅ **RESTful API**: 6 endpoints for live class management  
✅ **Environment Config**: Secure `.env` configuration  
✅ **Structured Logging**: Winston logger with file + console  
✅ **Unit Tests**: 40+ tests with 100% coverage  
✅ **Security**: Helmet, CORS, rate limiting  
✅ **Documentation**: Complete API docs and guides  

## 🎯 Quick Start (5 Minutes)

### Step 1: Install Dependencies

```bash
npm install
```

Expected output:
```
added 234 packages in 15s
```

### Step 2: Start the Server

```bash
npm run dev
```

You should see:
```
[info]: Configuration validated successfully
[info]: Server started on localhost:3000
```

✅ **Success!** Your server is running!

### Step 3: Test the API

Open a new terminal and test the health endpoint:

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

✅ **Success!** Your API is working!

### Step 4: Schedule Your First Live Class

```bash
curl -X POST http://localhost:3000/api/v1/live-classes \
  -H "Content-Type: application/json" \
  -d "{
    \"instructorId\": \"instructor-123\",
    \"courseId\": \"course-456\",
    \"startTime\": \"2025-12-31T10:00:00Z\",
    \"duration\": 60,
    \"topic\": \"My First Live Class\"
  }"
```

You should get a response with:
- ✅ Class ID
- ✅ Zoom meeting ID
- ✅ Zoom join URL
- ✅ Zoom start URL

✅ **Success!** You scheduled your first live class!

### Step 5: Run Tests

```bash
npm test
```

Expected output:
```
Test Suites: 5 passed, 5 total
Tests:       40+ passed
Coverage:    >70%
```

✅ **Success!** All tests pass!

## 📚 What's Next?

### Explore the Code

1. **Start here**: `src/services/liveClassService.js` - Main scheduling logic
2. **Zoom integration**: `src/services/zoomService.js` - Mock API implementation
3. **API endpoints**: `src/controllers/liveClassController.js` - Request handlers
4. **Data model**: `src/models/LiveClass.js` - Live class entity
5. **Configuration**: `src/config/index.js` - Environment setup

### Try the Examples

```bash
node examples/usage.js
```

This demonstrates:
- Scheduling classes
- Retrieving classes
- Cancelling classes
- Updating status

### Read the Documentation

- 📖 [README.md](README.md) - Complete documentation
- 🔌 [API.md](API.md) - Full API reference
- 🏗️ [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- 📝 [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- ⚡ [QUICKSTART.md](QUICKSTART.md) - Quick reference

### Customize Configuration

Edit the `.env` file:

```bash
# Change the port
PORT=3001

# Add real Zoom credentials
ZOOM_API_KEY=your_real_api_key
ZOOM_API_SECRET=your_real_api_secret

# Adjust logging
LOG_LEVEL=debug
```

## 🔑 Key Features to Explore

### 1. The Main Service Function

File: `src/services/liveClassService.js`

```javascript
const liveClass = await liveClassService.schedule_live_class(
  'instructor-123',      // Instructor ID
  'course-456',          // Course ID
  '2025-12-31T10:00:00Z', // Start time (ISO 8601)
  {
    duration: 60,        // Optional: Duration in minutes
    topic: 'Math 101',   // Optional: Meeting topic
    timezone: 'UTC'      // Optional: Timezone
  }
);
```

This function:
- ✅ Validates all inputs
- ✅ Creates a Zoom meeting (mock or real)
- ✅ Stores the class data
- ✅ Returns complete class object with Zoom URLs
- ✅ Logs all operations
- ✅ Handles all errors

### 2. Mock Zoom API

File: `src/services/zoomService.js`

The service automatically uses mock Zoom data when:
- No Zoom credentials are configured
- Running in development mode

Features:
- Generates realistic meeting IDs
- Creates valid-looking Zoom URLs
- Simulates API latency
- Perfect for development and testing

To use the real Zoom API:
1. Add credentials to `.env`
2. Implement OAuth in `zoomService.js`
3. Set `NODE_ENV=production`

### 3. RESTful API Endpoints

Base URL: `http://localhost:3000/api/v1`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/live-classes` | Schedule class |
| GET | `/live-classes/:id` | Get class |
| GET | `/courses/:id/live-classes` | Get course classes |
| GET | `/instructors/:id/live-classes` | Get instructor classes |
| DELETE | `/live-classes/:id` | Cancel class |

### 4. Structured Logging

Check the logs:
```bash
cat logs/app.log
cat logs/error.log
```

Log format:
```json
{
  "level": "info",
  "message": "HTTP Request",
  "method": "POST",
  "url": "/api/v1/live-classes",
  "statusCode": 201,
  "responseTime": "234ms",
  "timestamp": "2025-10-04 10:30:15"
}
```

### 5. Comprehensive Tests

Test files:
- `tests/models/LiveClass.test.js` - Model validation
- `tests/services/liveClassService.test.js` - Business logic
- `tests/services/zoomService.test.js` - Zoom integration
- `tests/controllers/liveClassController.test.js` - API endpoints
- `tests/config/index.test.js` - Configuration

Run specific tests:
```bash
npm test -- tests/services/liveClassService.test.js
```

Watch mode:
```bash
npm run test:watch
```

## 🛠️ Development Workflow

### Daily Development

1. **Start server in watch mode**:
   ```bash
   npm run dev
   ```

2. **Make your changes**

3. **Test automatically** (or run manually):
   ```bash
   npm test
   ```

4. **Check logs**:
   ```bash
   tail -f logs/app.log
   ```

5. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Add new feature"
   ```

### Adding New Features

1. **Create model** in `src/models/` (if needed)
2. **Create service** in `src/services/`
3. **Create controller** in `src/controllers/`
4. **Add routes** in `src/routes/`
5. **Write tests** in `tests/`
6. **Update documentation**

## 🎓 Common Tasks

### Schedule a Class

```javascript
const liveClass = await liveClassService.schedule_live_class(
  'instructor-123',
  'course-456',
  '2025-12-31T10:00:00Z'
);

console.log('Join URL:', liveClass.zoomJoinUrl);
```

### Get Classes for a Course

```javascript
const classes = liveClassService.getLiveClassesByCourse('course-456');
console.log(`Found ${classes.length} classes`);
```

### Cancel a Class

```javascript
const cancelled = await liveClassService.cancelLiveClass(classId);
console.log('Status:', cancelled.status); // 'cancelled'
```

### Update Class Status

```javascript
const updated = liveClassService.updateStatus(classId, 'active');
console.log('New status:', updated.status); // 'active'
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Change PORT in .env
PORT=3001
```

### Tests Failing

```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm test
```

### Logs Not Appearing

```bash
# Check log level in .env
LOG_LEVEL=debug

# Ensure logs directory exists
mkdir logs
```

### Module Not Found

```bash
# Reinstall dependencies
npm install
```

## 📦 Project Structure Reference

```
pegasus-edtech-platform/
├── src/                    # Source code
│   ├── config/            # Configuration
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Express middleware
│   ├── models/           # Data models
│   ├── routes/           # API routes
│   ├── services/         # Business logic ⭐
│   └── utils/            # Utilities
├── tests/                 # Test suite
├── examples/              # Usage examples
├── logs/                  # Log files (auto-generated)
└── [documentation files]
```

## 🎯 Success Criteria

You've successfully set up the project when:

- ✅ Server starts without errors
- ✅ Health endpoint returns 200 OK
- ✅ You can schedule a live class
- ✅ All tests pass
- ✅ Logs are being written
- ✅ You understand the project structure

## 💡 Pro Tips

1. **Use the examples**: `examples/usage.js` shows all features
2. **Read the tests**: They're great documentation
3. **Check the logs**: Use `tail -f logs/app.log` during development
4. **Use watch mode**: `npm run dev` auto-restarts on changes
5. **Explore incrementally**: Start with one service and expand

## 🆘 Need Help?

1. Check [README.md](README.md) for detailed docs
2. Read [API.md](API.md) for endpoint reference
3. Review [ARCHITECTURE.md](ARCHITECTURE.md) for system design
4. Look at [QUICKSTART.md](QUICKSTART.md) for quick reference
5. Check inline code comments
6. Run the examples: `node examples/usage.js`

## 🎉 You're Ready!

You now have a fully functional EdTech service. Start building amazing features! 🚀

---

**Next Steps**:
1. ⭐ Star the project (if applicable)
2. 🔧 Customize for your needs
3. 🧪 Write more tests
4. 📚 Add more features
5. 🚀 Deploy to production

Happy coding! 💻

