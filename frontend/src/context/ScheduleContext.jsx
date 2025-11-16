import { createContext, useContext, useState, useCallback } from 'react';
import { workUnitsAPI, schedulerAPI } from '../services/api';

const ScheduleContext = createContext();

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
};

export const ScheduleProvider = ({ children }) => {
  const [workUnits, setWorkUnits] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWorkUnits = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await workUnitsAPI.getAll(params);
      setWorkUnits(response.data.data.workUnits);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch work units';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateWorkUnitStatus = async (id, status) => {
    try {
      const response = await workUnitsAPI.updateStatus(id, status);
      const updatedUnit = response.data.data.workUnit;
      setWorkUnits(workUnits.map(u => u._id === id ? updatedUnit : u));
      return { success: true, workUnit: updatedUnit };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update status';
      return { success: false, error: errorMsg };
    }
  };

  const rescheduleWorkUnit = async (id, scheduledStart, scheduledEnd) => {
    try {
      const response = await workUnitsAPI.reschedule(id, { scheduledStart, scheduledEnd });
      const updatedUnit = response.data.data.workUnit;
      setWorkUnits(workUnits.map(u => u._id === id ? updatedUnit : u));
      return { success: true, workUnit: updatedUnit };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to reschedule';
      return { success: false, error: errorMsg };
    }
  };

  const generateSchedule = async (date = null) => {
    setLoading(true);
    try {
      const response = await schedulerAPI.generate(date);
      return { 
        success: true, 
        workUnits: response.data.data.workUnits,
        conflicts: response.data.data.conflicts
      };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to generate schedule';
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const regenerateSchedule = async () => {
    setLoading(true);
    try {
      const response = await schedulerAPI.regenerate();
      return { 
        success: true, 
        workUnits: response.data.data.workUnits,
        conflicts: response.data.data.conflicts
      };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to regenerate schedule';
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendar = async (rangeStart, rangeEnd) => {
    setLoading(true);
    setError(null);
    try {
      const response = await schedulerAPI.getCalendar(rangeStart, rangeEnd);
      setWorkUnits(response.data.data.workUnits);
      setCalendarEvents(response.data.data.events);
      return { 
        success: true,
        workUnits: response.data.data.workUnits,
        events: response.data.data.events
      };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch calendar';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    workUnits,
    calendarEvents,
    loading,
    error,
    fetchWorkUnits,
    updateWorkUnitStatus,
    rescheduleWorkUnit,
    generateSchedule,
    regenerateSchedule,
    fetchCalendar
  };

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
};
