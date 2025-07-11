import { useState, useEffect, useCallback } from 'react';
import { mockReservations, availableRooms, RESERVATION_STATUS } from '../utils/reservationMockData';
import toast from 'react-hot-toast';

export const useReservations = (initialFilters = {}) => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    dateRange: '',
    search: '',
    source: '',
    ...initialFilters
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  // Simular carga de datos
  useEffect(() => {
    const loadReservations = () => {
      setLoading(true);
      setTimeout(() => {
        setReservations(mockReservations);
        setLoading(false);
      }, 800);
    };

    loadReservations();
  }, []);

  // Filtrar reservas
  useEffect(() => {
    let filtered = [...reservations];

    // Filtro por estado
    if (filters.status) {
      filtered = filtered.filter(reservation => reservation.status === filters.status);
    }

    // Filtro por búsqueda (nombre, código, email)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(reservation => 
        reservation.guest.name.toLowerCase().includes(searchTerm) ||
        reservation.confirmationCode.toLowerCase().includes(searchTerm) ||
        reservation.guest.email.toLowerCase().includes(searchTerm) ||
        reservation.room.number.includes(searchTerm)
      );
    }

    // Filtro por fuente
    if (filters.source) {
      filtered = filtered.filter(reservation => reservation.source === filters.source);
    }

    // Filtro por rango de fechas
    if (filters.dateRange) {
      const today = new Date();
      let startDate, endDate;

      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(today);
          endDate = new Date(today);
          break;
        case 'tomorrow':
          startDate = new Date(today);
          startDate.setDate(today.getDate() + 1);
          endDate = new Date(startDate);
          break;
        case 'this_week':
          startDate = new Date(today);
          endDate = new Date(today);
          endDate.setDate(today.getDate() + 7);
          break;
        case 'next_week':
          startDate = new Date(today);
          startDate.setDate(today.getDate() + 7);
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 7);
          break;
        default:
          startDate = null;
          endDate = null;
      }

      if (startDate && endDate) {
        filtered = filtered.filter(reservation => {
          const checkInDate = new Date(reservation.checkIn);
          return checkInDate >= startDate && checkInDate <= endDate;
        });
      }
    }

    setFilteredReservations(filtered);
    setPagination(prev => ({ ...prev, total: filtered.length, page: 1 }));
  }, [reservations, filters]);

  // Crear nueva reserva
  const createReservation = useCallback(async (reservationData) => {
    try {
      const newReservation = {
        id: Date.now(),
        confirmationCode: `HTP-${new Date().getFullYear()}-${String(reservations.length + 1).padStart(3, '0')}`,
        ...reservationData,
        createdAt: new Date().toISOString(),
        createdBy: 'admin',
        paymentStatus: 'Pending'
      };

      setReservations(prev => [newReservation, ...prev]);
      toast.success('Reserva creada exitosamente');
      return newReservation;
    } catch (error) {
      toast.error('Error al crear la reserva');
      throw error;
    }
  }, [reservations.length]);

  // Actualizar reserva
  const updateReservation = useCallback(async (id, updates) => {
    try {
      setReservations(prev => prev.map(reservation => 
        reservation.id === id ? { ...reservation, ...updates } : reservation
      ));
      toast.success('Reserva actualizada exitosamente');
    } catch (error) {
      toast.error('Error al actualizar la reserva');
      throw error;
    }
  }, []);

  // Eliminar reserva
  const deleteReservation = useCallback(async (id) => {
    try {
      setReservations(prev => prev.filter(reservation => reservation.id !== id));
      toast.success('Reserva eliminada exitosamente');
    } catch (error) {
      toast.error('Error al eliminar la reserva');
      throw error;
    }
  }, []);

  // Cambiar estado de reserva
  const changeReservationStatus = useCallback(async (id, newStatus) => {
    try {
      const statusActions = {
        [RESERVATION_STATUS.CONFIRMED]: 'confirmada',
        [RESERVATION_STATUS.CHECKED_IN]: 'check-in realizado',
        [RESERVATION_STATUS.CHECKED_OUT]: 'check-out realizado',
        [RESERVATION_STATUS.CANCELLED]: 'cancelada'
      };

      await updateReservation(id, { status: newStatus });
      toast.success(`Reserva ${statusActions[newStatus] || 'actualizada'}`);
    } catch (error) {
      toast.error('Error al cambiar el estado de la reserva');
      throw error;
    }
  }, [updateReservation]);

  // Obtener reserva por ID
  const getReservationById = useCallback((id) => {
    return reservations.find(reservation => reservation.id === parseInt(id));
  }, [reservations]);

  // Estadísticas de reservas
  const getReservationStats = useCallback(() => {
    const total = reservations.length;
    const pending = reservations.filter(r => r.status === RESERVATION_STATUS.PENDING).length;
    const confirmed = reservations.filter(r => r.status === RESERVATION_STATUS.CONFIRMED).length;
    const checkedIn = reservations.filter(r => r.status === RESERVATION_STATUS.CHECKED_IN).length;
    const totalRevenue = reservations.reduce((sum, r) => sum + r.totalAmount, 0);

    return { total, pending, confirmed, checkedIn, totalRevenue };
  }, [reservations]);

  // Paginación
  const getPaginatedReservations = useCallback(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    return filteredReservations.slice(startIndex, endIndex);
  }, [filteredReservations, pagination]);

  return {
    reservations: getPaginatedReservations(),
    allReservations: filteredReservations,
    loading,
    filters,
    setFilters,
    pagination,
    setPagination,
    createReservation,
    updateReservation,
    deleteReservation,
    changeReservationStatus,
    getReservationById,
    getReservationStats,
    availableRooms
  };
};