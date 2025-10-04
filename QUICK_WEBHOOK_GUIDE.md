# Quick Webhook Guide

## 🚀 Get Started in 5 Minutes

### 1. Configure Webhook Secret

Add to `.env`:
```bash
ZOOM_WEBHOOK_SECRET=your_webhook_secret_here
```

### 2. Start Server

```bash
npm run dev
```

Server listens on: `http://localhost:3000/api/v1/webhooks/zoom`

### 3. Test Webhook

Send a test webhook:

```bash
curl -X POST http://localhost:3000/api/v1/webhooks/zoom \
  -H "Content-Type: application/json" \
  -d '{
    "event": "meeting.started",
    "event_id": "test-event-123",
    "payload": {
      "object": {
        "id": 123456789
      }
    }
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Webhook processed",
  "eventId": "..."
}
```

### 4. Check Logs

```bash
tail -f logs/app.log | grep -i webhook
```

You'll see:
```
[info]: Webhook received { eventType: 'meeting.started', eventId: 'test-event-123' }
[info]: Webhook processing started { status: 'processing' }
[info]: Webhook processing completed { status: 'processed' }
```

### 5. Monitor Webhooks

View recent webhooks:
```bash
curl http://localhost:3000/api/v1/webhooks/events?limit=10
```

---

## 🎯 Common Tasks

### Check if Webhook Processed

```bash
curl http://localhost:3000/api/v1/webhooks/events?status=processed
```

### Check Failed Webhooks

```bash
curl http://localhost:3000/api/v1/webhooks/events?status=failed
```

### View Specific Event

```bash
curl http://localhost:3000/api/v1/webhooks/events/{eventId}
```

---

## 🧪 Test Scenarios

### Test 1: Meeting Started

```bash
curl -X POST http://localhost:3000/api/v1/webhooks/zoom \
  -H "Content-Type: application/json" \
  -d '{
    "event": "meeting.started",
    "event_id": "start-123",
    "payload": {
      "object": {
        "id": 123456789
      }
    }
  }'
```

**Expected:** LiveClass status → "active"

### Test 2: Meeting Ended

```bash
curl -X POST http://localhost:3000/api/v1/webhooks/zoom \
  -H "Content-Type: application/json" \
  -d '{
    "event": "meeting.ended",
    "event_id": "end-123",
    "payload": {
      "object": {
        "id": 123456789
      }
    }
  }'
```

**Expected:** LiveClass status → "completed"

### Test 3: Duplicate Detection

Send the same webhook twice:

```bash
# First time
curl -X POST http://localhost:3000/api/v1/webhooks/zoom \
  -H "Content-Type: application/json" \
  -d '{
    "event": "meeting.started",
    "event_id": "duplicate-test",
    "payload": { "object": { "id": 999 } }
  }'

# Second time (duplicate)
curl -X POST http://localhost:3000/api/v1/webhooks/zoom \
  -H "Content-Type: application/json" \
  -d '{
    "event": "meeting.started",
    "event_id": "duplicate-test",
    "payload": { "object": { "id": 999 } }
  }'
```

**Expected:** Second request returns `"duplicate": true`

---

## 📊 Event Flow

```
Webhook Arrives
    ↓
Signature Verified ✓
    ↓
Idempotency Check ✓
    ↓
Mark as Processing
    ↓
Execute Handler
    ↓
Update LiveClass
    ↓
Mark as Processed
    ↓
Return 200 OK
```

---

## 🔍 Debugging

### Enable Debug Logging

```bash
# Add to .env
LOG_LEVEL=debug
```

### Check Recent Events

```bash
# Last 5 events
curl 'http://localhost:3000/api/v1/webhooks/events?limit=5'

# Failed events only
curl 'http://localhost:3000/api/v1/webhooks/events?status=failed'

# Specific event type
curl 'http://localhost:3000/api/v1/webhooks/events?eventType=meeting.started'
```

### View Full Logs

```bash
# All webhook logs
tail -f logs/app.log | grep webhook

# Only errors
tail -f logs/error.log
```

---

## 🎬 Real Zoom Setup

### Step 1: Get Webhook Secret

1. Go to Zoom Marketplace
2. Select your app
3. Features → Event Subscriptions
4. Copy "Secret Token"

### Step 2: Add to Environment

```bash
# In .env
ZOOM_WEBHOOK_SECRET=your_actual_secret_here
```

### Step 3: Configure Endpoint

In Zoom dashboard:
```
Endpoint URL: https://your-domain.com/api/v1/webhooks/zoom
```

### Step 4: Subscribe to Events

Enable these events:
- ✅ meeting.started
- ✅ meeting.ended
- ✅ meeting.updated
- ✅ meeting.deleted
- ✅ meeting.participant_joined
- ✅ meeting.participant_left

### Step 5: Verify

Zoom will send a verification request. Check logs:
```bash
tail -f logs/app.log | grep "endpoint.url_validation"
```

---

## 📋 Checklist

Before going live:

- [ ] `ZOOM_WEBHOOK_SECRET` configured
- [ ] Server accessible via HTTPS
- [ ] Webhook endpoint added to Zoom
- [ ] Events subscribed in Zoom dashboard
- [ ] Signature verification tested
- [ ] Monitoring endpoints work
- [ ] Logs are being written
- [ ] Tests pass: `npm test`

---

## 🆘 Troubleshooting

### Webhook Returns 401

**Issue:** Signature verification failed

**Fix:**
1. Check `ZOOM_WEBHOOK_SECRET` matches Zoom dashboard
2. Verify request has `x-zm-signature` header
3. Check server time is accurate

### Webhook Not Processing

**Issue:** No status updates

**Fix:**
1. Check meeting ID exists in system
2. Verify event type is supported
3. Check logs for errors
4. Ensure live class has matching `zoomMeetingId`

### Duplicate Processing

**Issue:** Same webhook processed multiple times

**Fix:**
1. Check idempotency is working
2. Verify `event_id` is unique per event
3. Clear webhook cache if testing: `webhookService.clearAll()`

---

## 💡 Quick Tips

1. **Use ngrok for local testing:**
   ```bash
   ngrok http 3000
   # Use ngrok URL in Zoom dashboard
   ```

2. **Monitor in real-time:**
   ```bash
   watch -n 1 'curl -s http://localhost:3000/api/v1/webhooks/events?limit=5'
   ```

3. **Test idempotency:**
   ```bash
   # Send same event twice, second should skip
   ```

4. **Check retry behavior:**
   ```bash
   # Look for "Webhook will be retried" in logs
   tail -f logs/app.log | grep -i retry
   ```

---

## 📚 More Info

- Full documentation: [WEBHOOK_IMPLEMENTATION.md](WEBHOOK_IMPLEMENTATION.md)
- Summary: [WEBHOOK_SUMMARY.md](WEBHOOK_SUMMARY.md)
- Main README: [README.md](README.md)

---

## ✅ Verification

Your webhook system is working if:

✅ Server responds to webhook POST requests  
✅ Idempotency prevents duplicates  
✅ Status updates apply to live classes  
✅ Logs show received → processing → processed → applied  
✅ Failed webhooks retry automatically  
✅ Monitoring endpoints return data  

---

**Ready to go!** 🚀 Start receiving Zoom webhooks in minutes.

