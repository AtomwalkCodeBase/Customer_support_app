import React, { createContext, useState, useCallback } from 'react';
import { getCustomerId } from '../src/services/localStore';
import { getTaskCategory, getTasksList } from '../src/services/productServices';

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({ visible: false, message: '' });

  // Fetch task categories
  const fetchTaskCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getTaskCategory();
      setCategories(res.data);
    } catch (error) {
      console.log('Failed to fetch categories:', error);
      setError({ visible: true, message: 'Failed to load categories' });
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user tasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const customerId = await getCustomerId();
      const res = await getTasksList('ALL', customerId);
      setTickets(res.data);
    } catch (error) {
      console.log('Failed to fetch tasks:', error.message);
      setError({ visible: true, message: 'Failed to load tasks' });
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = () => {
    setError({ visible: false, message: '' });
  };

  return (
    <TaskContext.Provider
      value={{
        categories,
        tickets,
        setTickets, // Allow components to update tickets (e.g., after saving)
        loading,
        error,
        fetchTaskCategories,
        fetchTasks,
        clearError,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};