# Smart Study Planner v2

An intelligent study planning application with automated scheduling based on goals, priorities, and user availability.

## Features

- **Smart Scheduling**: Rule-based engine that automatically allocates study time
- **Goal Management**: Create and track study goals with priorities and deadlines
- **Availability Management**: Set weekly availability windows
- **Calendar View**: Visualize schedule with drag-and-drop rescheduling
- **Progress Tracking**: Monitor progress on goals and completed work units
- **Mentor/Parent View**: Track student progress (for mentors and parents)
- **Notifications**: Browser, email, and webhook notifications for upcoming sessions

## Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Smart Scheduler Engine

### Frontend
- React + Vite
- Material-UI (MUI)
- React Router
- Axios
- date-fns

## Quick Start

### Prerequisites
- Node.js >= 16
- MongoDB Atlas account (already configured)

### Backend Setup

```bash
cd backend
npm install
npm run seed  # Seed database with sample data
npm run dev   # Start development server
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev   # Start Vite dev server
```

### Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

### Sample Login Credentials

**Student Account:**
- Email: student@test.com
- Password: password123

**Mentor Account:**
- Email: mentor@test.com
- Password: password123

## Project Structure

```
ssp/smart-study-planner-v2/
├── backend/
│   ├── src/
│   │   ├── models/          # Mongoose models
│   │   ├── controllers/     # Route controllers
│   │   ├── routes/          # Express routes
│   │   ├── middleware/      # Auth, validation
│   │   ├── services/        # Scheduler engine
│   │   ├── scripts/         # Seed data
│   │   └── server.js        # Entry point
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React context
│   │   ├── services/        # API services
│   │   └── App.jsx
│   ├── package.json
│   └── .env
└── README.md
```

## Scheduler Algorithm

The intelligent scheduler implements a rule-based algorithm:

1. **Horizon Calculation**: Determines scheduling window based on goal deadlines
2. **Availability Mapping**: Creates calendar from user's weekly availability
3. **Conflict Subtraction**: Removes existing events and commitments
4. **Urgency Scoring**: `urgency = (priority × remaining_minutes) / (time_left + ε)`
5. **Goal Chunking**: Breaks goals into optimal work units (25-90 minutes)
6. **Greedy Allocation**: Assigns highest urgency chunks to earliest slots
7. **Conflict Detection**: Flags impossible schedules and suggests actions

## API Endpoints

- **Auth**: `/api/auth/register`, `/api/auth/login`
- **Goals**: `/api/goals` (CRUD + prioritize)
- **Work Units**: `/api/work-units` (CRUD + status updates)
- **Scheduler**: `/api/scheduler/generate`, `/api/scheduler/calendar`
- **Notifications**: `/api/notifications`
- **Mentor**: `/api/mentor/users/:userId/progress`

## Development Status

✅ Backend API complete (all models, routes, controllers)  
✅ Scheduler engine implemented  
✅ Frontend structure and auth flow  
✅ Dashboard with today's schedule  
🚧 Full calendar view with drag-and-drop  
🚧 Availability editor (weekly grid)  
🚧 Complete goal management UI  
🚧 Mentor/parent view  
🚧 Browser notifications

## License

MIT
