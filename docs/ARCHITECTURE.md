# Smart Study Planner v2 - Architecture Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│  React 18 + Vite + MUI | Dashboard, Goals, Calendar, Auth   │
└────────────────┬────────────────────────────────────────────┘
                 │ Axios HTTP/REST
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                       API GATEWAY (Express)                 │
│  Port 5000 | CORS | Request Logging | Error Handling        │
└────┬────────────┬────────────┬────────────┬────────────┬────┘
     │            │            │            │            │
     ▼            ▼            ▼            ▼            ▼
  AUTH      GOALS      WORK-UNITS    SCHEDULER    NOTIFICATIONS
  Routes    Routes     Routes        Routes       Routes
     │            │            │            │            │
     ▼            ▼            ▼            ▼            ▼
  Auth         Goal          WorkUnit    Scheduler   Notification
  Controller   Controller    Controller  Controller  Controller
     │            │            │            │            │
     └────────────┴────────────┴────────────┴────────────┘
              │ Middleware: Auth, Validate, Error Handler
              ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATA LAYER                              │
│  MongoDB Atlas + Mongoose ODM                              │
│  ┌─────────┬────────┬──────────┬───────────┬────────────┐  │
│  │ User    │ Goal   │WorkUnit  │Calendar   │Notification│  │
│  │ Model   │ Model  │ Model    │Event Model│ Model      │  │
│  └─────────┴────────┴──────────┴───────────┴────────────┘  │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │  SchedulerEngine Service       │
        │  Urgency Scoring Algorithm     │
        │  Conflict Detection            │
        │  Work Unit Generation          │
        └────────────────────────────────┘

## Key Features Flow
User Creates Goal → Scheduler Engine Analyzes
→ Generates Work Units → Allocates to Calendar → User Accepts/Reschedules
```

## Component Stack

| Layer | Tech | Purpose |
|-------|------|---------|
| Frontend | React 18, Vite, MUI 5 | UI, State Management, Routing |
| Backend API | Node.js, Express 4.18 | REST API, Business Logic |
| Database | MongoDB, Mongoose 8 | Data Persistence |
| Auth | JWT + bcrypt | Secure Authentication |
| Scheduler | SchedulerEngine Service | Intelligent Scheduling |

## Data Models Relationship

```
User (1) ─────── (Many) Goal
                    │
                    └─── (Many) WorkUnit
                            │
                            └─── (Many) CalendarEvent
                            
User (1) ─────── (Many) Notification
User (1) ─────── (Many) UserAvailability (Weekly Slots)
```
