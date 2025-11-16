# Smart Study Planner v2 - API Documentation

**Base URL**: `http://localhost:5000/api`

## Authentication Endpoints

### Register User
```
POST /auth/register
Content-Type: application/json

{
  "email": "user@test.com",
  "password": "password123",
  "name": "John Doe",
  "role": "student" | "mentor" | "parent"
}

Response: 201 { success, token, user: {id, email, name, role} }
```

### Login
```
POST /auth/login
{ "email": "user@test.com", "password": "password123" }

Response: 200 { token, user }
```

## Goals Management

### Create Goal
```
POST /goals
Headers: { Authorization: "Bearer <token>" }
{ "title": "Learn React", "description": "...", "priority": 1-5, 
  "deadline": "2024-12-31", "estimatedMinutes": 480 }

Response: 201 { goal }
```

### Get All Goals
```
GET /goals
Headers: { Authorization: "Bearer <token>" }

Response: 200 [{ id, title, priority, deadline, status, progress }]
```

### Update Goal Status
```
PUT /goals/:id
{ "status": "in-progress" | "completed" | "paused" }
```

### Prioritize Goals
```
POST /goals/prioritize
{ "goalIds": ["id1", "id2"], "priorities": [1, 2] }
```

## Work Units (Study Sessions)

### Create Work Unit
```
POST /work-units
{ "goalId": "...", "duration": 45, "title": "Chapter 5 Reading",
  "scheduledStart": "2024-11-20T10:00:00Z" }

Response: 201 { workUnit }
```

### Get Work Units
```
GET /work-units?status=pending|completed|in-progress
```

### Update Work Unit Status
```
PATCH /work-units/:id/status
{ "status": "completed" | "in-progress" | "skipped" }
```

## Scheduler Engine

### Generate Schedule
```
POST /scheduler/generate
{ "goalIds": ["id1", "id2"], "startDate": "2024-11-20", "days": 7 }

Response: 200 {
  schedule: [
    { date, slots: [{time, goalId, duration, title}] }
  ],
  workUnits: [...],
  conflicts: [...]
}
```

### Get Calendar View
```
GET /scheduler/calendar?month=11&year=2024

Response: 200 { events: [CalendarEvent] }
```

## Availability Management

### Set Weekly Availability
```
POST /users/:id/availability
{ weekdays: [
  { day: "Monday", slots: [{start: "09:00", end: "17:00"}] }
] }
```

### Get User Availability
```
GET /users/:id/availability
```

## Notifications

### Get Notifications
```
GET /notifications
```

### Mark as Read
```
PATCH /notifications/:id/read
```

## Mentor View

### Get Student Progress
```
GET /mentor/users/:studentId/progress
Headers: { Authorization: "Bearer <token>" }

Response: 200 {
  goals: [{title, progress%, deadline, status}],
  completedWorkUnits: N,
  totalScheduledMinutes: M
}
```

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |

## Authentication Header
All protected routes require:
```
Authorization: Bearer <JWT_TOKEN>
```
