# Developer Notes - Smart Study Planner v2

## Quick Start for Developers

### Prerequisites
- Node.js >= 16, npm/yarn
- MongoDB Atlas account (connection string in `.env`)
- Git

### Setup
```bash
# Backend
cd backend && npm install && npm run seed && npm run dev

# Frontend (new terminal)
cd frontend && npm install && npm run dev
```

**Access**: Frontend http://localhost:5173 | Backend http://localhost:5000/api

## Key Architecture Decisions

### 1. Scheduler Engine (Core Logic)
Located in `backend/src/services/SchedulerEngine.js`. Implements 7-step algorithm:
- Calculates urgency: `(priority × remaining_minutes) / (days_left + ε)`
- Generates optimal work units (25-90 min chunks)
- Allocates to available calendar slots using greedy approach
- Flags conflicts and impossible schedules

### 2. Authentication Flow
- JWT tokens stored in localStorage (frontend)
- Protected routes use `auth.js` middleware
- Token expiry configurable via `JWT_EXPIRY` env var

### 3. Database Schema
- **User**: email, password (bcrypt), name, role, settings
- **Goal**: userId, title, priority, deadline, status, progress
- **WorkUnit**: goalId, duration, status, scheduledStart
- **CalendarEvent**: userId, workUnitId, startTime, endTime
- **UserAvailability**: userId, weekday, timeSlots

### 4. Frontend State Management
- React Context API for Auth, Goals, Schedule (see `context/`)
- Component tree: App → Routes → Page Components → Feature Components
- Axios interceptor auto-injects JWT tokens

## Common Development Tasks

### Add New API Endpoint
1. Create route in `backend/src/routes/newRoutes.js`
2. Add controller logic in `backend/src/controllers/newController.js`
3. Register route in `server.js`
4. Add API call in `frontend/src/services/api.js`

### Add New Data Model
1. Create schema in `backend/src/models/NewModel.js`
2. Export from models index
3. Import and use in controllers
4. Update database migrations if needed

### Add New React Page
1. Create component in `frontend/src/pages/NewPage.jsx`
2. Add route in `App.jsx`
3. Add navigation link in `SharedNavbar.jsx`

## Testing

### Backend
```bash
npm run test          # Run all tests
npm run test:watch   # Watch mode
```

### Frontend
```bash
npm run lint         # Check code quality
```

## Environment Variables

**Backend (.env)**
```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
JWT_EXPIRY=7d
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

**Frontend (.env.local)**
```
VITE_API_BASE=http://localhost:5000/api
```

## Debugging Tips

1. **Backend**: Use `console.log()` or VSCode debugger with `node --inspect`
2. **Frontend**: React DevTools extension + browser console
3. **Database**: MongoDB Atlas dashboard or Compass CLI tool
4. **API**: Use Postman/Insomnia to test endpoints directly

## Performance Considerations

- Scheduler caching: Cache generated schedules for 1 hour to avoid recalculations
- Database indexes: Ensure indexes on `userId`, `goalId`, `deadline`
- Frontend: Lazy load pages using React Router code splitting
- API: Implement pagination for large datasets (goals, work-units)

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| CORS errors | Check CORS_ORIGIN env var matches frontend URL |
| JWT expiry | Extend JWT_EXPIRY in .env or implement refresh tokens |
| Scheduler conflicts | Review algorithm in SchedulerEngine.js |
| MongoDB connection | Verify connection string in MONGODB_URI |

## Code Style Guide

- Use ES6+ syntax (arrow functions, destructuring, template literals)
- Follow camelCase for variables and files
- Use async/await over promises
- Add JSDoc comments for functions
- Keep functions under 50 lines when possible

## Deployment Checklist

- [ ] Update `.env` with production values
- [ ] Run `npm run build` for frontend
- [ ] Run tests: `npm run test`
- [ ] Update database indexes
- [ ] Configure HTTPS
- [ ] Set up CI/CD pipeline
- [ ] Review security (JWT, CORS, input validation)
