/**
 * Smart Study Planner v2 - MongoDB Seeding Script
 * Seeds database with realistic sample data reflecting the schema
 * Run with: npm run seed
 */

const path = require('path');
// Load .env from backend root (works whether script is run from project root or scripts folder)
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Goal = require('../models/Goal');
const WorkUnit = require('../models/WorkUnit');
const UserAvailability = require('../models/UserAvailability');
const CalendarEvent = require('../models/CalendarEvent');

// Sample data
const seedUsers = [
  {
    name: 'Dileep Kumar MR',
    email: 'dileepmr35@gmail.com',
    password: 'Dileep*123456',
    role: 'student',
    timezone: 'Asia/Kolkata',
    availabilityRules: {
      preferredStudyHours: '9:00-12:00,14:00-17:00,19:00-22:00',
      breakDuration: 15,
      sessionDuration: 90
    }
  },
  {
    name: 'Mentor Admin',
    email: 'mentor@example.com',
    password: 'password123',
    role: 'mentor',
    timezone: 'Asia/Kolkata'
  },
  {
    name: 'Parent User',
    email: 'parent@example.com',
    password: 'password123',
    role: 'parent',
    timezone: 'Asia/Kolkata'
  },
  {
    name: 'System Admin',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
    timezone: 'Asia/Kolkata'
  }
];

const seedUserAvailability = (userId) => [
  // Monday - Friday: 9 AM to 10 PM
  {
    userId,
    weekday: 1,
    startTime: '09:00',
    endTime: '22:00',
    exceptions: []
  },
  {
    userId,
    weekday: 2,
    startTime: '09:00',
    endTime: '22:00',
    exceptions: []
  },
  {
    userId,
    weekday: 3,
    startTime: '09:00',
    endTime: '22:00',
    exceptions: []
  },
  {
    userId,
    weekday: 4,
    startTime: '09:00',
    endTime: '22:00',
    exceptions: []
  },
  {
    userId,
    weekday: 5,
    startTime: '09:00',
    endTime: '22:00',
    exceptions: []
  },
  {
    userId,
    weekday: 6,
    startTime: '10:00',
    endTime: '20:00',
    exceptions: []
  },
  {
    userId,
    weekday: 0,
    startTime: '14:00',
    endTime: '20:00',
    exceptions: []
  }
];

const seedGoals = (userId) => [
  {
    userId,
    title: 'Master JavaScript Fundamentals',
    description: 'Learn ES6+, async/await, and JavaScript design patterns',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    priority: 'high',
    estimatedTotalMinutes: 72,
    remainingMinutes: 72,
    prerequisites: [],
    status: 'active'
  },
  {
    userId,
    title: 'Complete React Course',
    description: 'Build 5 complete React projects with hooks, state management, and routing',
    dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    priority: 'high',
    estimatedTotalMinutes: 96,
    remainingMinutes: 96,
    prerequisites: [],
    status: 'active'
  },
  {
    userId,
    title: 'Learn MongoDB & Mongoose',
    description: 'Database design, schema modeling, aggregation pipelines, and optimization',
    dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    priority: 'med',
    estimatedTotalMinutes: 48,
    remainingMinutes: 48,
    prerequisites: [],
    status: 'active'
  },
  {
    userId,
    title: 'Build RESTful APIs with Express',
    description: 'Create production-ready APIs with authentication, validation, and error handling',
    dueDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
    priority: 'med',
    estimatedTotalMinutes: 60,
    remainingMinutes: 60,
    prerequisites: [],
    status: 'active'
  },
  {
    userId,
    title: 'Docker & DevOps Basics',
    description: 'Containerization, Docker Compose, CI/CD pipelines, and deployment',
    dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    priority: 'low',
    estimatedTotalMinutes: 42,
    remainingMinutes: 42,
    prerequisites: [],
    status: 'active'
  },
  {
    userId,
    title: 'Advanced CSS & Responsive Design',
    description: 'Flexbox, Grid, animations, and mobile-first design principles',
    dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    priority: 'med',
    estimatedTotalMinutes: 36,
    remainingMinutes: 36,
    prerequisites: [],
    status: 'active'
  }
];

const seedWorkUnits = (userId, goalIds) => {
  const units = [];
  const now = new Date();
  
  for (let day = 0; day < 7; day++) {
    const dayStart = new Date(now.getTime() + day * 24 * 60 * 60 * 1000);
    dayStart.setHours(9, 0, 0, 0);
    
    const sessions = [
      { start: 9, end: 11, goalIndex: day % goalIds.length },
      { start: 14, end: 16, goalIndex: (day + 1) % goalIds.length },
      { start: 19, end: 21, goalIndex: (day + 2) % goalIds.length }
    ];
    
    sessions.forEach((session, idx) => {
      const sessionStart = new Date(dayStart);
      sessionStart.setHours(session.start, 0, 0, 0);
      
      const sessionEnd = new Date(dayStart);
      sessionEnd.setHours(session.end, 0, 0, 0);
      
      const duration = (session.end - session.start) * 60;
      
      units.push({
        goalId: goalIds[session.goalIndex],
        userId,
        durationMinutes: duration,
        scheduledStart: sessionStart,
        scheduledEnd: sessionEnd,
        status: day === 0 && idx === 0 ? 'in-progress' : 'todo',
        sequenceIndex: day * 3 + idx,
        actualStart: day === 0 && idx === 0 ? now : null,
        actualEnd: null,
        urgencyScore: Math.floor(Math.random() * 100)
      });
    });
  }
  
  return units;
};

const seedCalendarEvents = (userId) => {
  const events = [];
  const addDays = (d, days) => {
    const dt = new Date(d.getTime());
    dt.setDate(dt.getDate() + days);
    return dt;
  };

  // Weekly Team Meeting (2 days from now, 10:00-11:00)
  const twoDays = addDays(new Date(), 2);
  const meetingStart = new Date(twoDays);
  meetingStart.setHours(10, 0, 0, 0);
  const meetingEnd = new Date(twoDays);
  meetingEnd.setHours(11, 0, 0, 0);

  events.push({
    userId,
    title: 'Weekly Team Meeting',
    description: 'Sync up with study group on progress',
    start: meetingStart,
    end: meetingEnd,
    source: 'planner'
  });

  // Code Review Session (5 days from now, 15:00-16:00)
  const fiveDays = addDays(new Date(), 5);
  const reviewStart = new Date(fiveDays);
  reviewStart.setHours(15, 0, 0, 0);
  const reviewEnd = new Date(fiveDays);
  reviewEnd.setHours(16, 0, 0, 0);

  events.push({
    userId,
    title: 'Code Review Session',
    description: 'Review project code with mentor',
    start: reviewStart,
    end: reviewEnd,
    source: 'planner'
  });

  // Project Deadline (14 days from now, end of day)
  const fourteenDays = addDays(new Date(), 14);
  const deadlineStart = new Date(fourteenDays);
  deadlineStart.setHours(23, 59, 0, 0);
  const deadlineEnd = new Date(fourteenDays);
  deadlineEnd.setHours(23, 59, 59, 0);

  events.push({
    userId,
    title: 'Project Deadline',
    description: 'Complete full-stack project submission',
    start: deadlineStart,
    end: deadlineEnd,
    source: 'planner'
  });

  return events;
};

/**
 * Main seeding function
 */
async function seedData() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Goal.deleteMany({}),
      WorkUnit.deleteMany({}),
      UserAvailability.deleteMany({}),
      CalendarEvent.deleteMany({})
    ]);
    console.log('✓ Database cleared');

    // Seed users (using .create() to trigger bcrypt hashing middleware)
    console.log('\n👥 Seeding users...');
    const createdUsers = [];
    for (const userData of seedUsers) {
      const user = await User.create(userData);
      createdUsers.push(user);
    }
    console.log(`✓ Created ${createdUsers.length} users`);
    createdUsers.forEach(user => console.log(`  - ${user.email} (${user.role})`));

    // Seed data for each user
    for (const user of createdUsers) {
      console.log(`\n📚 Seeding data for ${user.name}...`);

      // Only seed study-related data for students and mentors
      if (['student', 'mentor'].includes(user.role)) {
        // Seed availability
        const availability = seedUserAvailability(user._id);
        await UserAvailability.insertMany(availability);
        console.log(`✓ Created ${availability.length} availability slots`);

        // Seed goals
        const goals = seedGoals(user._id);
        const createdGoals = await Goal.insertMany(goals);
        console.log(`✓ Created ${createdGoals.length} goals`);
        createdGoals.forEach(goal => console.log(`  - ${goal.title} (${goal.priority})`));

        // Seed work units
        const goalIds = createdGoals.map(g => g._id);
        const workUnits = seedWorkUnits(user._id, goalIds);
        await WorkUnit.insertMany(workUnits);
        console.log(`✓ Created ${workUnits.length} work units`);

        // Seed calendar events
        const events = seedCalendarEvents(user._id);
        await CalendarEvent.insertMany(events);
        console.log(`✓ Created ${events.length} calendar events`);
      }
    }

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`  - Users: ${createdUsers.length}`);
    console.log(`  - Goals per student: ${seedGoals(null).length}`);
    console.log(`  - Work units (7 days): ${seedWorkUnits(null, [null, null, null]).length}`);
    console.log(`  - Calendar events per user: ${seedCalendarEvents(null).length}`);


    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seedData();
