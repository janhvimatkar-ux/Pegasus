from datetime import datetime
import pytest
from unittest.mock import AsyncMock, patch

# This is a placeholder for the actual implementation
class ZoomService:
    async def create_meeting(self, instructor_id: str, course_id: str, start_time: datetime):
        pass

class NotificationService:
    async def send_calendar_invite(self, event_details: dict):
        pass

class ClassService:
    def __init__(self, zoom_service: ZoomService, notification_service: NotificationService):
        self.zoom_service = zoom_service
        self.notification_service = notification_service

    async def schedule_live_class(self, instructor_id: str, course_id: str, start_time: datetime, participants: list[str]):
        meeting_details = await self.zoom_service.create_meeting(instructor_id, course_id, start_time)
        
        event_details = {
            "title": f"Live class for {course_id}",
            "start_time": start_time,
            "duration": 60,
            "participants": participants,
            "meeting_url": meeting_details["join_url"],
            "course_id": course_id,
        }
        await self.notification_service.send_calendar_invite(event_details)
        
        return {
            "class_id": f"class-{course_id}-{int(datetime.now().timestamp())}",
            "instructor_id": instructor_id,
            "course_id": course_id,
            "start_time": start_time,
            "meeting_url": meeting_details["join_url"],
        }

@pytest.fixture
def zoom_service_mock():
    return AsyncMock(spec=ZoomService)

@pytest.fixture
def notification_service_mock():
    return AsyncMock(spec=NotificationService)

@pytest.mark.asyncio
async def test_schedule_live_class_success(zoom_service_mock, notification_service_mock):
    zoom_service_mock.create_meeting.return_value = {
        "id": "mock_meeting_id",
        "join_url": "https://zoom.us/j/1234567890",
        "start_url": "https://zoom.us/s/1234567890",
    }
    
    class_service = ClassService(zoom_service_mock, notification_service_mock)
    
    instructor_id = "instr_1"
    course_id = "course_1"
    start_time = datetime(2025, 10, 28, 10, 0)
    participants = ["test1@example.com", "test2@example.com"]
    
    result = await class_service.schedule_live_class(instructor_id, course_id, start_time, participants)
    
    zoom_service_mock.create_meeting.assert_called_once_with(instructor_id, course_id, start_time)
    notification_service_mock.send_calendar_invite.assert_called_once()
    
    assert result["instructor_id"] == instructor_id
    assert result["course_id"] == course_id
    assert result["meeting_url"] == "https://zoom.us/j/1234567890"

@pytest.mark.asyncio
async def test_schedule_live_class_zoom_api_failure(zoom_service_mock, notification_service_mock):
    zoom_service_mock.create_meeting.side_effect = Exception("Zoom API Error")
    
    class_service = ClassService(zoom_service_mock, notification_service_mock)
    
    with pytest.raises(Exception, match="Zoom API Error"):
        await class_service.schedule_live_class("instr_1", "course_1", datetime.now(), [])
        
    notification_service_mock.send_calendar_invite.assert_not_called()
