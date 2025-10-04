import pytest
from unittest.mock import MagicMock, patch

# Placeholder for the actual implementation
class WebhookService:
    def __init__(self):
        self.processed_events = set()

    def process_zoom_event(self, event: dict, event_id: str):
        if event_id in self.processed_events:
            raise ValueError("Event already processed")
        
        event_type = event.get("event")
        
        if event_type == "meeting.updated":
            self.handle_meeting_updated(event.get("payload"))
        elif event_type == "meeting.deleted":
            self.handle_meeting_deleted(event.get("payload"))
        else:
            # In a real scenario, you'd probably log this.
            print(f"Unhandled event type: {event_type}")
            
        self.processed_events.add(event_id)

    def handle_meeting_updated(self, payload: dict):
        pass

    def handle_meeting_deleted(self, payload: dict):
        pass

@pytest.fixture
def webhook_service():
    return WebhookService()

def test_process_meeting_updated_event(webhook_service, mocker):
    mocker.patch.object(webhook_service, 'handle_meeting_updated')
    event = {
        "event": "meeting.updated",
        "payload": {"object": {"id": "123", "topic": "Test Meeting"}}
    }
    event_id = "event_1"
    
    webhook_service.process_zoom_event(event, event_id)
    
    webhook_service.handle_meeting_updated.assert_called_once_with(event["payload"])

def test_process_meeting_deleted_event(webhook_service, mocker):
    mocker.patch.object(webhook_service, 'handle_meeting_deleted')
    event = {
        "event": "meeting.deleted",
        "payload": {"object": {"id": "456"}}
    }
    event_id = "event_2"
    
    webhook_service.process_zoom_event(event, event_id)
    
    webhook_service.handle_meeting_deleted.assert_called_once_with(event["payload"])

def test_idempotency_prevents_duplicate_processing(webhook_service):
    event = {"event": "meeting.updated", "payload": {}}
    event_id = "event_3"
    
    webhook_service.process_zoom_event(event, event_id)
    
    with pytest.raises(ValueError, match="Event already processed"):
        webhook_service.process_zoom_event(event, event_id)

def test_unknown_event_type_is_handled(webhook_service, capsys):
    event = {"event": "meeting.unknown", "payload": {}}
    event_id = "event_4"
    
    webhook_service.process_zoom_event(event, event_id)
    
    captured = capsys.readouterr()
    assert "Unhandled event type: meeting.unknown" in captured.out
