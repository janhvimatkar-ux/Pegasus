# API Documentation

Complete API reference for the Pegasus EdTech Platform.

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication

Currently, the API does not require authentication. In production, you should implement JWT-based authentication.

## Response Format

All responses follow this structure:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error category",
  "message": "Detailed error message",
  "details": ["Array of validation errors if applicable"]
}
```

## Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid input
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Endpoints

### Health Check

Check service health status.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-10-04T10:00:00.000Z",
  "service": "pegasus-edtech-platform"
}
```

---

### Schedule Live Class

Schedule a new live class and create a Zoom meeting.

**Endpoint:** `POST /live-classes`

**Request Body:**
```json
{
  "instructorId": "instructor-123",
  "courseId": "course-456",
  "startTime": "2025-12-31T10:00:00Z",
  "duration": 60,
  "topic": "Introduction to Node.js",
  "timezone": "UTC"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| instructorId | string | Yes | Unique identifier for the instructor |
| courseId | string | Yes | Unique identifier for the course |
| startTime | string | Yes | ISO 8601 formatted date-time in the future |
| duration | number | No | Duration in minutes (15-480), default: 60 |
| topic | string | No | Meeting topic, default: "{courseId} - Live Class" |
| timezone | string | No | Timezone for the meeting, default: "UTC" |

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "instructorId": "instructor-123",
    "courseId": "course-456",
    "startTime": "2025-12-31T10:00:00Z",
    "duration": 60,
    "zoomMeetingId": "123456789",
    "zoomJoinUrl": "https://zoom.us/j/123456789?pwd=abc123",
    "zoomStartUrl": "https://zoom.us/s/123456789?zak=xyz789",
    "status": "scheduled",
    "createdAt": "2025-10-04T10:00:00.000Z",
    "updatedAt": "2025-10-04T10:00:00.000Z"
  }
}
```

**Validation Errors:**

- startTime must be in the future
- duration must be between 15 and 480 minutes
- instructorId and courseId are required

---

### Get Live Class

Retrieve a specific live class by ID.

**Endpoint:** `GET /live-classes/:classId`

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| classId | string | Unique identifier of the live class |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "instructorId": "instructor-123",
    "courseId": "course-456",
    "startTime": "2025-12-31T10:00:00Z",
    "duration": 60,
    "zoomMeetingId": "123456789",
    "zoomJoinUrl": "https://zoom.us/j/123456789?pwd=abc123",
    "zoomStartUrl": "https://zoom.us/s/123456789?zak=xyz789",
    "status": "scheduled",
    "createdAt": "2025-10-04T10:00:00.000Z",
    "updatedAt": "2025-10-04T10:00:00.000Z"
  }
}
```

**Error Response:** `404 Not Found`
```json
{
  "success": false,
  "error": "Live class not found"
}
```

---

### Get Live Classes by Course

Retrieve all live classes for a specific course.

**Endpoint:** `GET /courses/:courseId/live-classes`

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| courseId | string | Unique identifier of the course |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "instructorId": "instructor-123",
      "courseId": "course-456",
      "startTime": "2025-12-31T10:00:00Z",
      "duration": 60,
      "zoomMeetingId": "123456789",
      "zoomJoinUrl": "https://zoom.us/j/123456789?pwd=abc123",
      "zoomStartUrl": "https://zoom.us/s/123456789?zak=xyz789",
      "status": "scheduled",
      "createdAt": "2025-10-04T10:00:00.000Z",
      "updatedAt": "2025-10-04T10:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

### Get Live Classes by Instructor

Retrieve all live classes for a specific instructor.

**Endpoint:** `GET /instructors/:instructorId/live-classes`

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| instructorId | string | Unique identifier of the instructor |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "instructorId": "instructor-123",
      "courseId": "course-456",
      "startTime": "2025-12-31T10:00:00Z",
      "duration": 60,
      "zoomMeetingId": "123456789",
      "zoomJoinUrl": "https://zoom.us/j/123456789?pwd=abc123",
      "zoomStartUrl": "https://zoom.us/s/123456789?zak=xyz789",
      "status": "scheduled",
      "createdAt": "2025-10-04T10:00:00.000Z",
      "updatedAt": "2025-10-04T10:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

### Cancel Live Class

Cancel a scheduled live class and delete the associated Zoom meeting.

**Endpoint:** `DELETE /live-classes/:classId`

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| classId | string | Unique identifier of the live class |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "instructorId": "instructor-123",
    "courseId": "course-456",
    "startTime": "2025-12-31T10:00:00Z",
    "duration": 60,
    "zoomMeetingId": "123456789",
    "zoomJoinUrl": "https://zoom.us/j/123456789?pwd=abc123",
    "zoomStartUrl": "https://zoom.us/s/123456789?zak=xyz789",
    "status": "cancelled",
    "createdAt": "2025-10-04T10:00:00.000Z",
    "updatedAt": "2025-10-04T10:15:00.000Z"
  },
  "message": "Live class cancelled successfully"
}
```

**Error Response:** `404 Not Found`
```json
{
  "success": false,
  "error": "Failed to cancel live class",
  "message": "Live class not found: {classId}"
}
```

---

## Live Class Status

A live class can have one of the following statuses:

- `scheduled` - Class is scheduled and waiting to start
- `active` - Class is currently in progress
- `completed` - Class has finished
- `cancelled` - Class was cancelled

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Window:** 15 minutes
- **Max Requests:** 100 per window per IP
- **Response:** `429 Too Many Requests`

```json
{
  "success": false,
  "error": "Too many requests from this IP, please try again later."
}
```

---

## Examples

### Using cURL

**Schedule a class:**
```bash
curl -X POST http://localhost:3000/api/v1/live-classes \
  -H "Content-Type: application/json" \
  -d '{
    "instructorId": "instructor-123",
    "courseId": "course-456",
    "startTime": "2025-12-31T10:00:00Z",
    "duration": 60
  }'
```

**Get a class:**
```bash
curl http://localhost:3000/api/v1/live-classes/{classId}
```

**Cancel a class:**
```bash
curl -X DELETE http://localhost:3000/api/v1/live-classes/{classId}
```

### Using JavaScript (axios)

```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1'
});

// Schedule a class
async function scheduleClass() {
  const response = await api.post('/live-classes', {
    instructorId: 'instructor-123',
    courseId: 'course-456',
    startTime: '2025-12-31T10:00:00Z',
    duration: 60
  });
  
  console.log(response.data);
}

// Get a class
async function getClass(classId) {
  const response = await api.get(`/live-classes/${classId}`);
  console.log(response.data);
}

// Cancel a class
async function cancelClass(classId) {
  const response = await api.delete(`/live-classes/${classId}`);
  console.log(response.data);
}
```

### Using Python (requests)

```python
import requests

BASE_URL = 'http://localhost:3000/api/v1'

# Schedule a class
def schedule_class():
    response = requests.post(f'{BASE_URL}/live-classes', json={
        'instructorId': 'instructor-123',
        'courseId': 'course-456',
        'startTime': '2025-12-31T10:00:00Z',
        'duration': 60
    })
    return response.json()

# Get a class
def get_class(class_id):
    response = requests.get(f'{BASE_URL}/live-classes/{class_id}')
    return response.json()

# Cancel a class
def cancel_class(class_id):
    response = requests.delete(f'{BASE_URL}/live-classes/{class_id}')
    return response.json()
```

---

## Webhook Support (Coming Soon)

Future versions will support webhooks for:
- Class start notifications
- Class end notifications
- Participant join/leave events
- Recording availability

---

## Need Help?

- Check the [README](README.md) for setup instructions
- See [QUICKSTART](QUICKSTART.md) for quick examples
- Review the [examples](examples/) directory
- Create an issue on GitHub

