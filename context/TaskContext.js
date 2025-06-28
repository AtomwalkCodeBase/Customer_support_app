import React, { createContext, useState, useEffect } from "react";
import { getCustomerId } from "../src/services/localStore";
import {
  getCustomerDetailList,
  getTaskCategory,
  getTasksList,
} from "../src/services/productServices";

export const TaskContext = createContext();

const { performance } = global;

export const TaskProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadings, setLoadings] = useState(true);
  const [error, setError] = useState({ visible: false, message: "" });

  const fetchTaskCategories = async () => {
    setLoading(true);
    try {
      const res = await getTaskCategory();
      setCategories(res.data || []);
    } catch (err) {
      console.log("Failed to fetch categories:", err);
      setError({ visible: true, message: "Failed to load categories" });
    }
    setLoading(false);
  };

  const fetchTasks = async () => {
    setLoadings(true);
    try {
      const customerId = await getCustomerId();

      const res = await getTasksList("CUSTOMER", customerId);

      const ticketsData =
        res.data?.filter((item) => item.task_type === "TICKET")?.reverse() ||
        [];

      setTickets(ticketsData);
    } catch (err) {
      console.log("Failed to fetch tasks:", err);
      setError({ visible: true, message: "Failed to load tasks" });
    }
    setTimeout(() => {
      setLoadings(false);
    }, 500);
  };

  const clearError = () => {
    setError({ visible: false, message: "" });
  };

  // Optional: Call them initially (or do it in your screen)

  return (
    <TaskContext.Provider
      value={{
        categories,
        tickets,
        setTickets,
        loading,
        loadings,
        setLoading,
        error,
        setError,
        fetchTaskCategories,
        fetchTasks,
        clearError,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
