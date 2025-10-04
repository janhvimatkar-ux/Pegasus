# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-04

### Added
- Initial service skeleton for EdTech platform
- Modular folder structure with separation of concerns
- Environment-driven configuration system
- Structured logging with Winston
- Live class scheduling service
- Zoom API integration with mock data support
- RESTful API endpoints for live class management
- Input validation with Joi
- Comprehensive unit tests for all components
- Security features (Helmet, CORS, rate limiting)
- Error handling middleware
- Health check endpoint
- Complete API documentation

### Features
- `schedule_live_class(instructor_id, course_id, start_time)` - Core scheduling function
- Get live classes by ID, course, or instructor
- Cancel scheduled live classes
- Mock Zoom API for development
- Automatic Zoom meeting creation
- Request/response logging
- Configuration validation

### Tests
- Model validation tests
- Service layer tests
- Controller/API endpoint tests
- Configuration tests
- >70% code coverage

### Documentation
- Comprehensive README
- API endpoint documentation
- Contributing guidelines
- Code of conduct
- Setup instructions
- Architecture overview

## [Unreleased]

### Planned
- Database integration (PostgreSQL/MongoDB)
- User authentication and authorization
- WebSocket support for real-time updates
- Zoom webhook handling
- Recording management
- Attendance tracking
- Email notifications
- Calendar integration
- Payment processing
- Course management
- Student enrollment
- Grades and assessments

