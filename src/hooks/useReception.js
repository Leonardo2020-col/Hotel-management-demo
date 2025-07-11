// src/hooks/useReception.js
import { useState, useEffect } from 'react';

export const useReception = (selectedDate) => {
  const [receptionData, setReceptionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReceptionData();
  }, [selectedDate]);

  const fetchReceptionData = async () => {
    try {
      setLoading(true);
      // Aquí harías la llamada a tu API
      const response = await fetch('/api/reception/dashboard');
      const data = await response.json();
      setReceptionData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (reservationId) => {
    // Lógica de check-in
  };

  const handleCheckOut = async (reservationId) => {
    // Lógica de check-out
  };

  return {
    receptionData,
    loading,
    error,
    handleCheckIn,
    handleCheckOut,
    refreshData: fetchReceptionData
  };
};