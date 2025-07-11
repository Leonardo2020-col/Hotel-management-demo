// hooks/useGuests.js
import { useState, useEffect } from 'react';
import { guestsMockData } from '../utils/guestsMockData';

export const useGuests = () => {
  const [guests, setGuests] = useState([]);
  const [guestsStats, setGuestsStats] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simular carga inicial de datos
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Simular delay de API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const data = guestsMockData();
        
        setGuests(data.guests);
        setGuestsStats(data.stats);
        setReservations(data.reservations);
        
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los datos de huéspedes');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Crear nuevo huésped
  const createGuest = async (guestData) => {
    try {
      const newGuest = {
        id: Date.now().toString(),
        ...guestData,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        totalVisits: 0,
        totalSpent: 0,
        status: 'inactive',
        vipLevel: 'none',
        rating: null,
        preferences: []
      };

      setGuests(prev => [...prev, newGuest]);
      updateStats();
      
      return newGuest;
    } catch (error) {
      throw new Error('Error al crear el huésped');
    }
  };

  // Actualizar huésped
  const updateGuest = async (guestId, updateData) => {
    try {
      setGuests(prev => prev.map(guest => 
        guest.id === guestId 
          ? { ...guest, ...updateData, lastUpdated: new Date().toISOString() }
          : guest
      ));
      
      updateStats();
      
      return true;
    } catch (error) {
      throw new Error('Error al actualizar el huésped');
    }
  };

  // Eliminar huésped
  const deleteGuest = async (guestId) => {
    try {
      setGuests(prev => prev.filter(guest => guest.id !== guestId));
      updateStats();
      return true;
    } catch (error) {
      throw new Error('Error al eliminar el huésped');
    }
  };

  // Obtener reservas de un huésped
  const getGuestReservations = (guestId) => {
    return reservations.filter(reservation => reservation.guestId === guestId)
      .sort((a, b) => new Date(b.checkIn) - new Date(a.checkIn));
  };

  // Obtener historial de un huésped
  const getGuestHistory = (guestId) => {
    const guestReservations = getGuestReservations(guestId);
    
    return guestReservations.map(reservation => ({
      id: reservation.id,
      type: 'reservation',
      date: reservation.checkIn,
      description: `Reserva en habitación ${reservation.roomNumber}`,
      details: {
        checkIn: reservation.checkIn,
        checkOut: reservation.checkOut,
        roomNumber: reservation.roomNumber,
        roomType: reservation.roomType,
        totalAmount: reservation.totalAmount,
        status: reservation.status,
        nights: reservation.nights
      }
    }));
  };

  // Actualizar estadísticas
  const updateStats = () => {
    const currentGuests = guests;
    
    const stats = {
      total: currentGuests.length,
      active: currentGuests.filter(g => g.status === 'active').length,
      vip: currentGuests.filter(g => g.vipLevel !== 'none').length,
      frequent: currentGuests.filter(g => g.totalVisits >= 5).length,
      newThisMonth: currentGuests.filter(g => {
        const createdDate = new Date(g.createdAt);
        const now = new Date();
        return createdDate.getMonth() === now.getMonth() && 
               createdDate.getFullYear() === now.getFullYear();
      }).length,
      totalRevenue: currentGuests.reduce((sum, g) => sum + (g.totalSpent || 0), 0),
      averageStay: calculateAverageStay(),
      repeatRate: calculateRepeatRate(),
      topCountries: getTopCountries(),
      ageGroups: getAgeGroups(),
      satisfactionScore: calculateSatisfactionScore(),
      recommendationRate: calculateRecommendationRate()
    };

    setGuestsStats(stats);
  };

  // Calcular estancia promedio
  const calculateAverageStay = () => {
    const completedReservations = reservations.filter(r => r.status === 'completed');
    if (completedReservations.length === 0) return 0;
    
    const totalNights = completedReservations.reduce((sum, r) => sum + r.nights, 0);
    return Math.round(totalNights / completedReservations.length);
  };

  // Calcular tasa de retorno
  const calculateRepeatRate = () => {
    const guestsWithMultipleVisits = guests.filter(g => g.totalVisits > 1).length;
    if (guests.length === 0) return 0;
    
    return Math.round((guestsWithMultipleVisits / guests.length) * 100);
  };

  // Obtener principales países
  const getTopCountries = () => {
    const countryCount = {};
    
    guests.forEach(guest => {
      countryCount[guest.country] = (countryCount[guest.country] || 0) + 1;
    });

    return Object.entries(countryCount)
      .map(([country, count]) => ({
        name: country,
        code: country.slice(0, 2).toUpperCase(),
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  // Obtener grupos de edad
  const getAgeGroups = () => {
    const ageGroups = {
      '18-25': 0,
      '26-35': 0,
      '36-50': 0,
      '51-65': 0,
      '65+': 0
    };

    guests.forEach(guest => {
      if (guest.birthDate) {
        const age = new Date().getFullYear() - new Date(guest.birthDate).getFullYear();
        
        if (age >= 18 && age <= 25) ageGroups['18-25']++;
        else if (age >= 26 && age <= 35) ageGroups['26-35']++;
        else if (age >= 36 && age <= 50) ageGroups['36-50']++;
        else if (age >= 51 && age <= 65) ageGroups['51-65']++;
        else if (age > 65) ageGroups['65+']++;
      }
    });

    return ageGroups;
  };

  // Calcular puntuación de satisfacción
  const calculateSatisfactionScore = () => {
    const guestsWithRating = guests.filter(g => g.rating);
    if (guestsWithRating.length === 0) return 0;
    
    const totalRating = guestsWithRating.reduce((sum, g) => sum + g.rating, 0);
    return (totalRating / guestsWithRating.length).toFixed(1);
  };

  // Calcular tasa de recomendación
  const calculateRecommendationRate = () => {
    const guestsWithRating = guests.filter(g => g.rating);
    if (guestsWithRating.length === 0) return 0;
    
    const promoters = guestsWithRating.filter(g => g.rating >= 4).length;
    return Math.round((promoters / guestsWithRating.length) * 100);
  };

  // Buscar huéspedes
  const searchGuests = (searchTerm) => {
    if (!searchTerm) return guests;
    
    const term = searchTerm.toLowerCase();
    return guests.filter(guest => 
      guest.fullName.toLowerCase().includes(term) ||
      guest.email.toLowerCase().includes(term) ||
      guest.phone.includes(term) ||
      guest.documentNumber.includes(term) ||
      guest.country.toLowerCase().includes(term)
    );
  };

  // Obtener huéspedes VIP
  const getVipGuests = () => {
    return guests.filter(guest => guest.vipLevel !== 'none')
      .sort((a, b) => {
        const vipOrder = { 'platinum': 3, 'gold': 2, 'silver': 1 };
        return (vipOrder[b.vipLevel] || 0) - (vipOrder[a.vipLevel] || 0);
      });
  };

  // Obtener huéspedes frecuentes
  const getFrequentGuests = () => {
    return guests.filter(guest => guest.totalVisits >= 5)
      .sort((a, b) => b.totalVisits - a.totalVisits);
  };

  // Obtener cumpleañeros del mes
  const getBirthdayGuests = () => {
    const currentMonth = new Date().getMonth();
    
    return guests.filter(guest => {
      if (!guest.birthDate) return false;
      const guestMonth = new Date(guest.birthDate).getMonth();
      return guestMonth === currentMonth;
    });
  };

  return {
    // Datos
    guests,
    guestsStats,
    reservations,
    loading,
    error,
    
    // Métodos CRUD
    createGuest,
    updateGuest,
    deleteGuest,
    
    // Métodos de consulta
    getGuestReservations,
    getGuestHistory,
    searchGuests,
    getVipGuests,
    getFrequentGuests,
    getBirthdayGuests,
    
    // Utilidades
    updateStats
  };
};