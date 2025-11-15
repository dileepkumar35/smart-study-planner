# Smart Study Planner v2 - Backend

Backend API for Smart Study Planner v2 application with intelligent scheduling engine.

## Features

- **User Management**: Authentication with JWT, role-based access control (student, mentor, parent, admin)
- **Goal Management**: Create, update, and track study goals with priorities and deadlines
- **Smart Scheduler**: Rule-based scheduling engine that allocates study time based on:
  - Goal urgency and priority
  - User availability windows
  - Existing commitments
  - Optimal chunk sizes (Pomodoro-inspired)
- **Work Units**: Scheduled study sessions with status tracking
- **Calendar Integration**: Import external events and view unified calendar
- **Notifications**: Browser, email, and webhook notifications
- **Mentor/Parent View**: Monitor student progress and upcoming deadlines

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Express Validator

## Quick Start

### Prerequisites

- Node.js >= 16
- MongoDB Atlas account (or local MongoDB)

### Installation

```bash
# Install dependencies
npm install

# Copy .env file and configure
# Already configured with MongoDB Atlas connection

# Seed database with sample data
npm run seed

# Start development server
npm run dev

# Start production server
npm start
```

### Sample Login Credentials

After running `npm run seed`:

**Student:**
- Email: student@test.com
- Password: password123

**Mentor:**
- Email: mentor@test.com
- Password: password123

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user

### Users
- GET `/api/users/me` - Get profile
- PUT `/api/users/me` - Update profile
- GET `/api/users/me/availability` - Get availability
- PUT `/api/users/me/availability` - Update availability

### Goals
- POST `/api/goals` - Create goal
- GET `/api/goals` - List goals
- GET `/api/goals/:id` - Get goal details
- PUT `/api/goals/:id` - Update goal
- DELETE `/api/goals/:id` - Delete goal
- POST `/api/goals/:id/prioritize` - Adjust priority/deadline

### Work Units
- GET `/api/work-units` - Get work units (filter by date)
- POST `/api/work-units` - Create work unit manually
- PUT `/api/work-units/:id/status` - Update status (todo/in-progress/done/skipped)
- PUT `/api/work-units/:id/reschedule` - Reschedule work unit
- DELETE `/api/work-units/:id` - Delete work unit

### Scheduler
- POST `/api/scheduler/generate` - Generate schedule
- POST `/api/scheduler/regenerate` - Regenerate full schedule
- GET `/api/scheduler/calendar` - Get calendar (events + work units)
- POST `/api/scheduler/calendar/import` - Import external events

### Notifications
- GET `/api/notifications` - Get notifications
- POST `/api/notifications` - Create notification
- POST `/api/notifications/test` - Test notification

### Mentor/Parent
- GET `/api/mentor/users` - Get students list
- GET `/api/mentor/users/:userId/progress` - Get student progress

## Scheduler Algorithm

The scheduler implements a deterministic rule-based algorithm:

1. **Compute Horizon**: Determine scheduling window based on goal due dates
2. **Create Availability Calendar**: Parse user's weekly availability with exceptions
3. **Subtract Commitments**: Remove existing events and scheduled work
4. **Calculate Urgency**: Score = (priority × remaining_minutes) / (time_left + ε)
5. **Chunk Goals**: Break down goals into optimal work units (25-90 min)
6. **Greedy Allocation**: Assign highest urgency chunks to earliest available slots
7. **Conflict Detection**: Flag goals that can't be scheduled before deadline

## Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
```

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## License

MIT
