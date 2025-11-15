require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Goal = require('../models/Goal');
const UserAvailability = require('../models/UserAvailability');

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Goal.deleteMany({});
    await UserAvailability.deleteMany({});
    console.log('Cleared existing data');

    // Create sample users
    const student = await User.create({
      name: 'John Student',
      email: 'student@test.com',
      password: 'password123',
      role: 'student',
      timezone: 'America/New_York'
    });

    const mentor = await User.create({
      name: 'Jane Mentor',
      email: 'mentor@test.com',
      password: 'password123',
      role: 'mentor',
      timezone: 'America/New_York'
    });

    console.log('Created sample users');

    // Create availability for student (Mon-Fri: 18:00-21:00, Sat-Sun: 10:00-16:00)
    const weekdayAvailability = [1, 2, 3, 4, 5].map(day => ({
      userId: student._id,
      weekday: day,
      startTime: '18:00',
      endTime: '21:00'
    }));

    const weekendAvailability = [0, 6].map(day => ({
      userId: student._id,
      weekday: day,
      startTime: '10:00',
      endTime: '16:00'
    }));

    await UserAvailability.insertMany([...weekdayAvailability, ...weekendAvailability]);
    console.log('Created availability schedule');

    // Create sample goals
    const now = new Date();
    const goals = [];

    // Goal 1: Upcoming exam (high priority, 3 days)
    goals.push(await Goal.create({
      userId: student._id,
      title: 'Math Midterm Preparation',
      description: 'Study chapters 5-8 for upcoming midterm exam',
      dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      priority: 'high',
      estimatedTotalMinutes: 300 // 5 hours
    }));

    // Goal 2: Assignment (medium priority, 5 days)
    goals.push(await Goal.create({
      userId: student._id,
      title: 'Physics Lab Report',
      description: 'Complete lab report on motion experiments',
      dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      priority: 'med',
      estimatedTotalMinutes: 180 // 3 hours
    }));

    // Goal 3: Long-term project (low priority, 30 days)
    goals.push(await Goal.create({
      userId: student._id,
      title: 'Final Project Research',
      description: 'Research and outline final project for computer science',
      dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      priority: 'low',
      estimatedTotalMinutes: 600 // 10 hours
    }));

    console.log('Created sample goals');

    console.log('\n=== Seed Data Summary ===');
    console.log(`Students: ${1}`);
    console.log(`Mentors: ${1}`);
    console.log(`Goals: ${goals.length}`);
    console.log('\n=== Sample Login Credentials ===');
    console.log('Student:');
    console.log('  Email: student@test.com');
    console.log('  Password: password123');
    console.log('\nMentor:');
    console.log('  Email: mentor@test.com');
    console.log('  Password: password123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
