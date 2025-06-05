import React, { createContext, useState, useCallback } from 'react';
import { getCustomerId } from '../src/services/localStore';
import { getCustomerDetailList, getTaskCategory, getTasksList } from '../src/services/productServices';

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({ visible: false, message: '' });

  // Fetch task categories
  const fetchTaskCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getTaskCategory();
      // console.log("category", res.data)
      setCategories(res.data);
    } catch (error) {
      console.log('Failed to fetch categories:', error);
      setError({ visible: true, message: 'Failed to load categories' });
    }
    setTimeout(() => {
       setLoading(false);
    }, 1000);
    
  }, []);

  // Fetch user tasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const customerId = await getCustomerId();
      const res = await getTasksList('ALL', customerId);
      // console.log("Task data", res.data)
      setTickets(res.data);
    } catch (error) {
      console.log('Failed to fetch tasks:', error.message);
      setError({ visible: true, message: 'Failed to load tasks' });
    }setTimeout(() => {
       setLoading(false);
    }, 1000);
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