# System Architecture

## Overview

Pegasus EdTech Platform follows a layered architecture pattern with clear separation of concerns.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                               │
│                    (Web/Mobile/API)                          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ HTTP/REST
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    EXPRESS SERVER                            │
│                  (src/index.js)                              │
│                                                               │
│  ┌────────────────────────────────────────────────────┐     │
│  │           MIDDLEWARE LAYER                          │     │
│  │                                                      │     │
│  │  • Helmet (Security Headers)                        │     │
│  │  • CORS (Cross-Origin)                              │     │
│  │  • Rate Limiter (Anti-abuse)                        │     │
│  │  • Body Parser (JSON)                               │     │
│  │  • Request Logger                                   │     │
│  │  • Error Handler                                    │     │
│  └──────────────────────┬───────────────────────────────┘     │
│                         │                                     │
│  ┌──────────────────────▼───────────────────────────────┐   │
│  │               ROUTES LAYER                            │   │
│  │           (src/routes/index.js)                       │   │
│  │                                                        │   │
│  │  GET  /api/v1/health                                  │   │
│  │  POST /api/v1/live-classes                            │   │
│  │  GET  /api/v1/live-classes/:id                        │   │
│  │  GET  /api/v1/courses/:id/live-classes                │   │
│  │  GET  /api/v1/instructors/:id/live-classes            │   │
│  │  DEL  /api/v1/live-classes/:id                        │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         │                                     │
│  ┌──────────────────────▼───────────────────────────────┐   │
│  │            CONTROLLER LAYER                           │   │
│  │     (src/controllers/liveClassController.js)          │   │
│  │                                                        │   │
│  │  • Request Validation (Joi)                           │   │
│  │  • Input Sanitization                                 │   │
│  │  • Response Formatting                                │   │
│  │  • Error Handling                                     │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         │                                     │
│  ┌──────────────────────▼───────────────────────────────┐   │
│  │             SERVICE LAYER                             │   │
│  │         (src/services/*.js)                           │   │
│  │                                                        │   │
│  │  ┌─────────────────────────────────────────────┐     │   │
│  │  │   Live Class Service                        │     │   │
│  │  │   • schedule_live_class()                   │     │   │
│  │  │   • getLiveClass()                          │     │   │
│  │  │   • cancelLiveClass()                       │     │   │
│  │  │   • updateStatus()                          │     │   │
│  │  └──────────────┬──────────────────────────────┘     │   │
│  │                 │                                     │   │
│  │  ┌──────────────▼──────────────────────────────┐     │   │
│  │  │   Zoom Service                              │     │   │
│  │  │   • createMeeting()                         │     │   │
│  │  │   • getMeeting()                            │     │   │
│  │  │   • deleteMeeting()                         │     │   │
│  │  │   • generateMockMeeting()                   │     │   │
│  │  └────────────────────────────────────────────┘     │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         │                                     │
│  ┌──────────────────────▼───────────────────────────────┐   │
│  │             MODEL LAYER                               │   │
│  │          (src/models/*.js)                            │   │
│  │                                                        │   │
│  │  • LiveClass                                          │   │
│  │    - Data validation                                  │   │
│  │    - Business rules                                   │   │
│  │    - Serialization                                    │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                               │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│                    CROSS-CUTTING CONCERNS                      │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Config     │  │   Logger     │  │   Utils      │        │
│  │              │  │              │  │              │        │
│  │ • Environment│  │ • Winston    │  │ • Helpers    │        │
│  │ • Validation │  │ • Structured │  │ • Constants  │        │
│  │ • Secrets    │  │ • File + Log │  │ • Formatters │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│                     EXTERNAL SERVICES                          │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Zoom API   │  │   Database   │  │    Email     │        │
│  │              │  │              │  │              │        │
│  │ • Real/Mock  │  │ • Future     │  │ • Future     │        │
│  │ • OAuth      │  │ • PostgreSQL │  │ • SMTP       │        │
│  │ • Webhooks   │  │ • MongoDB    │  │ • Templates  │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└───────────────────────────────────────────────────────────────┘
```

## Data Flow

### Schedule Live Class Flow

```
┌────────┐                                                    ┌──────────┐
│ Client │                                                    │ External │
└───┬────┘                                                    └────┬─────┘
    │                                                              │
    │ 1. POST /api/v1/live-classes                                │
    │ { instructorId, courseId, startTime, ... }                  │
    ├──────────────────────────────────────────►                  │
    │                                           │                  │
    │                                2. Validate Input             │
    │                                (Joi Schema)                  │
    │                                           │                  │
    │                                3. Call Service               │
    │                          schedule_live_class()               │
    │                                           │                  │
    │                                4. Validate Business Rules    │
    │                                (LiveClass.validate())        │
    │                                           │                  │
    │                                5. Create Zoom Meeting        │
    │                                           ├──────────────────►
    │                                           │                  │
    │                                           │ 6. Mock/Real API│
    │                                           │ Response         │
    │                                           ◄──────────────────┤
    │                                           │                  │
    │                                7. Store LiveClass            │
    │                                (In-Memory Map)               │
    │                                           │                  │
    │                                8. Log Activity               │
    │                                (Winston Logger)              │
    │                                           │                  │
    │ 9. Return Response                        │                  │
    ◄──────────────────────────────────────────┤                  │
    │ { success: true, data: {...} }            │                  │
    │                                                              │
```

## Component Interactions

### Request Processing Pipeline

```
Request
  │
  ├─► Middleware Stack
  │     ├─► Security (Helmet)
  │     ├─► CORS
  │     ├─► Rate Limiter
  │     ├─► Body Parser
  │     └─► Request Logger
  │
  ├─► Router
  │     └─► Route Matching
  │
  ├─► Controller
  │     ├─► Input Validation (Joi)
  │     └─► Call Service
  │
  ├─► Service Layer
  │     ├─► Business Logic
  │     ├─► Model Validation
  │     └─► External API Calls
  │
  ├─► Model Layer
  │     ├─► Data Validation
  │     └─► Serialization
  │
  └─► Response
        ├─► Success Response
        └─► Error Response
```

## Module Dependencies

```
index.js
  ├─► config
  │     └─► dotenv
  │
  ├─► utils/logger
  │     └─► winston
  │
  ├─► middleware
  │     ├─► helmet
  │     ├─► cors
  │     ├─► express-rate-limit
  │     └─► errorHandler
  │
  └─► routes
        └─► controllers
              └─► services
                    ├─► models
                    │     └─► joi (validation)
                    │     └─► uuid
                    │
                    └─► external services
                          └─► axios
```

## Design Patterns

### 1. Layered Architecture
- **Presentation Layer**: Controllers
- **Business Logic Layer**: Services
- **Data Layer**: Models
- **Cross-Cutting**: Config, Logger, Utils

### 2. Dependency Injection
- Services are singletons
- Controllers depend on services
- Easy to mock for testing

### 3. Factory Pattern
- LiveClass model construction
- Mock data generation

### 4. Singleton Pattern
- Logger instance
- Service instances
- Configuration

### 5. Middleware Pattern
- Express middleware chain
- Request processing pipeline
- Error handling

## Security Architecture

```
┌────────────────────────────────────────────┐
│          SECURITY LAYERS                    │
│                                             │
│  1. Network Layer                           │
│     └─► Rate Limiting (IP-based)           │
│                                             │
│  2. Transport Layer                         │
│     └─► HTTPS (in production)              │
│                                             │
│  3. Application Layer                       │
│     ├─► Helmet (Security Headers)          │
│     ├─► CORS (Origin Control)              │
│     └─► Input Validation (Joi)             │
│                                             │
│  4. Authentication Layer (Future)           │
│     ├─► JWT Tokens                          │
│     └─► User Sessions                       │
│                                             │
│  5. Authorization Layer (Future)            │
│     ├─► Role-Based Access Control          │
│     └─► Resource Permissions                │
│                                             │
│  6. Data Layer                              │
│     ├─► Environment Variables              │
│     └─► Secret Management                   │
└────────────────────────────────────────────┘
```

## Logging Architecture

```
┌──────────────────────────────────────────┐
│           LOGGING FLOW                    │
│                                           │
│  Application Events                       │
│         │                                 │
│         ├─► HTTP Requests                 │
│         │     └─► Request Logger          │
│         │                                 │
│         ├─► Service Calls                 │
│         │     └─► Service Logger          │
│         │                                 │
│         ├─► Errors                        │
│         │     └─► Error Logger            │
│         │                                 │
│         └─► Custom Events                 │
│               └─► Event Logger            │
│                                           │
│              ▼                            │
│                                           │
│         Winston Logger                    │
│              │                            │
│         ┌────┴────┐                       │
│         │         │                       │
│    Console    File                        │
│    Transport  Transport                   │
│         │         │                       │
│      stdout   logs/                       │
│              ├─► app.log                  │
│              └─► error.log                │
└──────────────────────────────────────────┘
```

## Error Handling Architecture

```
┌──────────────────────────────────────────┐
│        ERROR HANDLING FLOW                │
│                                           │
│  Error Occurs                             │
│         │                                 │
│         ├─► Validation Error              │
│         │     └─► 400 Bad Request         │
│         │                                 │
│         ├─► Not Found Error               │
│         │     └─► 404 Not Found           │
│         │                                 │
│         ├─► Business Logic Error          │
│         │     └─► 400/422                 │
│         │                                 │
│         └─► Unexpected Error              │
│               └─► 500 Internal Error      │
│                                           │
│              ▼                            │
│                                           │
│    Error Handler Middleware               │
│              │                            │
│         ┌────┴────┐                       │
│         │         │                       │
│      Logging   Response                   │
│         │         │                       │
│    Winston    JSON Error                  │
│    Logger     Response                    │
│                                           │
│    Stack trace in dev mode                │
│    Sanitized message in prod              │
└──────────────────────────────────────────┘
```

## Testing Architecture

```
┌────────────────────────────────────────────┐
│           TESTING STRATEGY                  │
│                                             │
│  Unit Tests (Jest)                          │
│    ├─► Models                               │
│    │     └─► Validation logic               │
│    │     └─► Business rules                 │
│    │                                         │
│    ├─► Services                             │
│    │     └─► Business logic                 │
│    │     └─► External service mocks         │
│    │                                         │
│    └─► Utils                                │
│          └─► Helper functions               │
│                                             │
│  Integration Tests (Supertest)              │
│    └─► Controllers                          │
│          └─► API endpoints                  │
│          └─► Request/response flow          │
│                                             │
│  Mocking Strategy                           │
│    ├─► Zoom API (Mock Service)             │
│    └─► Database (In-Memory)                 │
│                                             │
│  Coverage Target: >70%                      │
└────────────────────────────────────────────┘
```

## Deployment Architecture (Future)

```
┌────────────────────────────────────────────┐
│         DEPLOYMENT PIPELINE                 │
│                                             │
│  Developer                                  │
│      │                                      │
│      ├─► Git Push                           │
│      │                                      │
│      ▼                                      │
│  GitHub                                     │
│      │                                      │
│      ├─► CI/CD (GitHub Actions)            │
│      │     ├─► Lint                         │
│      │     ├─► Test                         │
│      │     ├─► Build                        │
│      │     └─► Deploy                       │
│      │                                      │
│      ▼                                      │
│  Container Registry                         │
│      │                                      │
│      ├─► Docker Image                       │
│      │                                      │
│      ▼                                      │
│  Kubernetes Cluster                         │
│      │                                      │
│      ├─► Pods (Node.js App)                │
│      ├─► Services (Load Balancer)          │
│      ├─► Ingress (API Gateway)             │
│      └─► ConfigMaps/Secrets                │
│                                             │
│  External Services                          │
│      ├─► Database (PostgreSQL)             │
│      ├─► Cache (Redis)                      │
│      ├─► Monitoring (Prometheus)           │
│      └─► Logging (ELK Stack)               │
└────────────────────────────────────────────┘
```

## Scalability Considerations

### Horizontal Scaling
- Stateless design (ready for multiple instances)
- No session storage in memory
- Load balancer friendly

### Vertical Scaling
- Efficient async operations
- Non-blocking I/O
- Resource-efficient

### Performance Optimizations
- In-memory caching (future: Redis)
- Database indexing (future)
- Connection pooling (future)
- Response compression (future)

## Maintainability Features

1. **Clear Structure**: Easy to navigate
2. **Separation of Concerns**: Each layer has single responsibility
3. **Comprehensive Tests**: Safe refactoring
4. **Detailed Logging**: Easy debugging
5. **Documentation**: Code + external docs
6. **Type Validation**: Runtime type checking

## Future Architecture Enhancements

1. **Microservices**: Split into separate services
2. **Event-Driven**: Message queue integration
3. **GraphQL**: Alternative to REST
4. **WebSocket**: Real-time features
5. **Caching Layer**: Redis integration
6. **Service Mesh**: Istio/Linkerd
7. **Observability**: Full tracing and metrics

---

This architecture is designed to be:
- ✅ Scalable
- ✅ Maintainable
- ✅ Testable
- ✅ Secure
- ✅ Observable
- ✅ Extensible

