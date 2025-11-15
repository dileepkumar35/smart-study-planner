import { createContext, useContext, useState, useCallback } from 'react';
import { goalsAPI } from '../services/api';

const GoalContext = createContext();

export const useGoals = () => {
  const context = useContext(GoalContext);
  if (!context) {
    throw new Error('useGoals must be used within a GoalProvider');
  }
  return context;
};

export const GoalProvider = ({ children }) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGoals = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await goalsAPI.getAll(params);
      setGoals(response.data.data.goals);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch goals';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const createGoal = async (goalData) => {
    try {
      const response = await goalsAPI.create(goalData);
      setGoals([...goals, response.data.data.goal]);
      return { success: true, goal: response.data.data.goal };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create goal';
      return { success: false, error: errorMsg };
    }
  };

  const updateGoal = async (id, updates) => {
    try {
      const response = await goalsAPI.update(id, updates);
      const updatedGoal = response.data.data.goal;
      setGoals(goals.map(g => g._id === id ? updatedGoal : g));
      return { success: true, goal: updatedGoal };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update goal';
      return { success: false, error: errorMsg };
    }
  };

  const deleteGoal = async (id) => {
    try {
      await goalsAPI.delete(id);
      setGoals(goals.filter(g => g._id !== id));
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete goal';
      return { success: false, error: errorMsg };
    }
  };

  const prioritizeGoal = async (id, data) => {
    try {
      const response = await goalsAPI.prioritize(id, data);
      const updatedGoal = response.data.data.goal;
      setGoals(goals.map(g => g._id === id ? updatedGoal : g));
      return { success: true, goal: updatedGoal };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to prioritize goal';
      return { success: false, error: errorMsg };
    }
  };

  const value = {
    goals,
    loading,
    error,
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    prioritizeGoal
  };

  return (
    <GoalContext.Provider value={value}>
      {children}
    </GoalContext.Provider>
  );
};
