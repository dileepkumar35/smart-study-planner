const Goal = require('../models/Goal');
const WorkUnit = require('../models/WorkUnit');
const CalendarEvent = require('../models/CalendarEvent');
const UserAvailability = require('../models/UserAvailability');

/**
 * Scheduler Configuration
 */
const CONFIG = {
  MIN_CHUNK_MINUTES: 25,
  MAX_CHUNK_MINUTES: 90,
  POMODORO_SIZE: 25,
  MIN_DAILY_PROGRESS: 30,
  HORIZON_DAYS: 30,
  URGENCY_EPSILON: 0.001
};

/**
 * Main Scheduler Engine
 * Implements rule-based scheduling algorithm
 */
class SchedulerEngine {
  constructor(userId, timezone = 'UTC') {
    this.userId = userId;
    this.timezone = timezone;
    this.conflicts = [];
  }

  /**
   * Generate schedule for user
   */
  async generate(targetDate = null) {
    try {
      // Step 1: Get all active goals
      const goals = await this.getActiveGoals();
      
      if (goals.length === 0) {
        return {
          workUnits: [],
          conflicts: [],
          message: 'No active goals to schedule'
        };
      }

      // Step 2: Compute scheduling horizon
      const horizon = this.computeHorizon(goals, targetDate);
      
      // Step 3: Get user availability windows
      const availabilityMap = await this.createAvailabilityCalendar(horizon);
      
      // Step 4: Get existing calendar events and work units
      await this.subtractExistingCommitments(availabilityMap, horizon);
      
      // Step 5: Normalize goal urgency scores
      const scoredGoals = this.computeUrgencyScores(goals);
      
      // Step 6: Chunk goals into work units
      const chunkedGoals = this.chunkGoals(scoredGoals);
      
      // Step 7: Greedy allocation by day
      const scheduledUnits = this.allocateWorkUnits(chunkedGoals, availabilityMap, horizon);
      
      // Step 8: Save work units to database
      const savedUnits = await this.saveWorkUnits(scheduledUnits);
      
      return {
        workUnits: savedUnits,
        conflicts: this.conflicts,
        message: `Successfully scheduled ${savedUnits.length} work units`
      };
    } catch (error) {
      console.error('Scheduler error:', error);
      throw error;
    }
  }

  /**
   * Get all active goals for user
   */
  async getActiveGoals() {
    return await Goal.find({
      userId: this.userId,
      status: 'active',
      remainingMinutes: { $gt: 0 }
    }).sort({ dueDate: 1, priority: -1 });
  }

  /**
   * Compute scheduling horizon
   */
  computeHorizon(goals, targetDate) {
    const today = targetDate ? new Date(targetDate) : new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find nearest due date or use default horizon
    const nearestDueDate = goals.length > 0 
      ? new Date(Math.min(...goals.map(g => new Date(g.dueDate))))
      : new Date(today.getTime() + CONFIG.HORIZON_DAYS * 24 * 60 * 60 * 1000);
    
    const endDate = new Date(Math.max(
      today.getTime() + CONFIG.HORIZON_DAYS * 24 * 60 * 60 * 1000,
      nearestDueDate.getTime()
    ));
    
    return { startDate: today, endDate };
  }

  /**
   * Create availability calendar from user's weekly schedule
   */
  async createAvailabilityCalendar(horizon) {
    const availability = await UserAvailability.find({ userId: this.userId });
    const availabilityMap = new Map();
    
    let currentDate = new Date(horizon.startDate);
    
    while (currentDate <= horizon.endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const weekday = currentDate.getDay();
      
      // Find availability for this weekday
      const dayAvailability = availability.find(a => a.weekday === weekday);
      
      if (dayAvailability) {
        // Check for exceptions (vacations, holidays)
        const hasException = dayAvailability.exceptions.some(exc => {
          const excDate = new Date(exc.date);
          return excDate.toISOString().split('T')[0] === dateKey;
        });
        
        if (!hasException) {
          const slots = this.parseTimeSlots(currentDate, dayAvailability.startTime, dayAvailability.endTime);
          availabilityMap.set(dateKey, slots);
        } else {
          availabilityMap.set(dateKey, []);
        }
      } else {
        availabilityMap.set(dateKey, []);
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return availabilityMap;
  }

  /**
   * Parse time slots from start and end time strings
   */
  parseTimeSlots(date, startTime, endTime) {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const start = new Date(date);
    start.setHours(startHour, startMin, 0, 0);
    
    const end = new Date(date);
    end.setHours(endHour, endMin, 0, 0);
    
    return [{ start, end, available: true }];
  }

  /**
   * Subtract existing commitments from availability
   */
  async subtractExistingCommitments(availabilityMap, horizon) {
    // Get existing calendar events
    const events = await CalendarEvent.find({
      userId: this.userId,
      start: { $gte: horizon.startDate, $lte: horizon.endDate }
    });
    
    // Get existing scheduled work units (not done or skipped)
    const existingUnits = await WorkUnit.find({
      userId: this.userId,
      scheduledStart: { $gte: horizon.startDate, $lte: horizon.endDate },
      status: { $in: ['todo', 'in-progress'] }
    });
    
    // Combine all commitments
    const commitments = [
      ...events.map(e => ({ start: e.start, end: e.end })),
      ...existingUnits.map(u => ({ start: u.scheduledStart, end: u.scheduledEnd }))
    ];
    
    // Subtract from availability
    for (const [dateKey, slots] of availabilityMap.entries()) {
      const updatedSlots = this.subtractCommitments(slots, commitments);
      availabilityMap.set(dateKey, updatedSlots);
    }
  }

  /**
   * Subtract commitments from time slots
   */
  subtractCommitments(slots, commitments) {
    let resultSlots = [...slots];
    
    for (const commitment of commitments) {
      const newSlots = [];
      
      for (const slot of resultSlots) {
        if (commitment.end <= slot.start || commitment.start >= slot.end) {
          // No overlap
          newSlots.push(slot);
        } else if (commitment.start <= slot.start && commitment.end >= slot.end) {
          // Commitment completely covers slot - skip it
          continue;
        } else if (commitment.start > slot.start && commitment.end < slot.end) {
          // Commitment splits slot
          newSlots.push({ start: slot.start, end: commitment.start, available: true });
          newSlots.push({ start: commitment.end, end: slot.end, available: true });
        } else if (commitment.start <= slot.start) {
          // Commitment covers start
          newSlots.push({ start: commitment.end, end: slot.end, available: true });
        } else {
          // Commitment covers end
          newSlots.push({ start: slot.start, end: commitment.start, available: true });
        }
      }
      
      resultSlots = newSlots;
    }
    
    return resultSlots;
  }

  /**
   * Compute urgency scores for goals
   */
  computeUrgencyScores(goals) {
    const now = new Date();
    
    return goals.map(goal => {
      const timeLeft = (new Date(goal.dueDate) - now) / (1000 * 60); // minutes
      const priorityWeight = { 'low': 1, 'med': 2, 'high': 3 }[goal.priority];
      
      // Urgency score: higher is more urgent
      const urgency = (priorityWeight * goal.remainingMinutes) / (timeLeft + CONFIG.URGENCY_EPSILON);
      
      return {
        ...goal.toObject(),
        urgencyScore: urgency,
        timeLeftMinutes: timeLeft
      };
    }).sort((a, b) => b.urgencyScore - a.urgencyScore);
  }

  /**
   * Chunk goals into work units
   */
  chunkGoals(goals) {
    const chunked = [];
    
    for (const goal of goals) {
      const chunks = [];
      let remaining = goal.remainingMinutes;
      let sequenceIndex = 0;
      
      while (remaining > 0) {
        const chunkSize = Math.min(
          remaining,
          this.calculateOptimalChunkSize(remaining)
        );
        
        chunks.push({
          goalId: goal._id,
          durationMinutes: chunkSize,
          urgencyScore: goal.urgencyScore,
          priority: goal.priority,
          dueDate: goal.dueDate,
          sequenceIndex: sequenceIndex++
        });
        
        remaining -= chunkSize;
      }
      
      chunked.push({ goal, chunks });
    }
    
    return chunked;
  }

  /**
   * Calculate optimal chunk size (Pomodoro-like)
   */
  calculateOptimalChunkSize(remaining) {
    if (remaining <= CONFIG.MIN_CHUNK_MINUTES) {
      return remaining;
    }
    
    if (remaining <= CONFIG.MAX_CHUNK_MINUTES) {
      // Round to nearest Pomodoro if close
      const pomodoros = Math.round(remaining / CONFIG.POMODORO_SIZE);
      return Math.min(pomodoros * CONFIG.POMODORO_SIZE, CONFIG.MAX_CHUNK_MINUTES);
    }
    
    return CONFIG.MAX_CHUNK_MINUTES;
  }

  /**
   * Allocate work units to available time slots
   */
  allocateWorkUnits(chunkedGoals, availabilityMap, horizon) {
    const scheduledUnits = [];
    const allChunks = [];
    
    // Flatten all chunks and sort by urgency
    for (const { chunks } of chunkedGoals) {
      allChunks.push(...chunks);
    }
    allChunks.sort((a, b) => b.urgencyScore - a.urgencyScore);
    
    // Allocate chunks day by day
    let currentDate = new Date(horizon.startDate);
    
    while (currentDate <= horizon.endDate && allChunks.length > 0) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const slots = availabilityMap.get(dateKey) || [];
      
      // Allocate highest urgency chunks to this day's slots
      for (const slot of slots) {
        const slotDuration = (slot.end - slot.start) / (1000 * 60);
        let slotRemaining = slotDuration;
        let slotStart = new Date(slot.start);
        
        while (slotRemaining >= CONFIG.MIN_CHUNK_MINUTES && allChunks.length > 0) {
          const chunk = allChunks[0];
          
          if (chunk.durationMinutes <= slotRemaining) {
            // Chunk fits in remaining slot
            const scheduledEnd = new Date(slotStart.getTime() + chunk.durationMinutes * 60 * 1000);
            
            scheduledUnits.push({
              ...chunk,
              scheduledStart: new Date(slotStart),
              scheduledEnd: scheduledEnd
            });
            
            slotStart = scheduledEnd;
            slotRemaining -= chunk.durationMinutes;
            allChunks.shift(); // Remove allocated chunk
          } else {
            break; // Chunk too large for remaining slot
          }
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Mark conflicts for unscheduled chunks
    if (allChunks.length > 0) {
      for (const chunk of allChunks) {
        this.conflicts.push({
          goalId: chunk.goalId,
          reason: 'Insufficient availability before due date',
          durationMinutes: chunk.durationMinutes,
          dueDate: chunk.dueDate
        });
      }
    }
    
    return scheduledUnits;
  }

  /**
   * Save work units to database
   */
  async saveWorkUnits(scheduledUnits) {
    const saved = [];
    
    for (const unit of scheduledUnits) {
      const workUnit = await WorkUnit.create({
        goalId: unit.goalId,
        userId: this.userId,
        durationMinutes: unit.durationMinutes,
        scheduledStart: unit.scheduledStart,
        scheduledEnd: unit.scheduledEnd,
        sequenceIndex: unit.sequenceIndex,
        urgencyScore: unit.urgencyScore,
        status: 'todo'
      });
      
      saved.push(workUnit);
    }
    
    return saved;
  }
}

module.exports = SchedulerEngine;
