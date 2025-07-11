// src/services/receptionService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const receptionService = {
  // Obtener datos del dashboard
  getDashboardData: async (date) => {
    const response = await fetch(`${API_BASE_URL}/reception/dashboard?date=${date}`);
    return response.json();
  },

  // Check-in
  checkInGuest: async (reservationId, roomNumber) => {
    const response = await fetch(`${API_BASE_URL}/reception/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reservationId, roomNumber })
    });
    return response.json();
  },

  // Check-out
  checkOutGuest: async (reservationId) => {
    const response = await fetch(`${API_BASE_URL}/reception/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reservationId })
    });
    return response.json();
  },

  // Actualizar estado de habitación
  updateRoomStatus: async (roomNumber, status) => {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomNumber}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return response.json();
  }
};