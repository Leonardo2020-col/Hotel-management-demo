// src/hooks/useReservations.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export const RESERVATION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CHECKED_IN: 'checked_in',
  CHECKED_OUT: 'checked_out',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show'
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PARTIAL: 'partial',
  PAID: 'paid',
  REFUNDED: 'refunded'
};

export const useReservations = (initialFilters = {}) => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    dateRange: '',
    search: '',
    source: '',
    paymentStatus: '',
    ...initialFilters
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  // Función para generar código de confirmación
  const generateConfirmationCode = async () => {
    const { data, error } = await supabase
      .rpc('generate_confirmation_code');
    
    if (error) {
      console.error('Error generating confirmation code:', error);
      return `HTP-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    }
    
    return data || `HTP-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  };

  // Cargar reservas desde Supabase
  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          guest:guests(
            id,
            full_name,
            email,
            phone,
            dni,
            nationality
          ),
          room:rooms(
            id,
            number,
            type,
            floor,
            price
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transformar datos para compatibilidad con el frontend
      const transformedReservations = data.map(reservation => ({
        id: reservation.id,
        confirmationCode: reservation.confirmation_code,
        guest: {
          id: reservation.guest?.id,
          name: reservation.guest?.full_name,
          email: reservation.guest?.email,
          phone: reservation.guest?.phone,
          dni: reservation.guest?.dni,
          nationality: reservation.guest?.nationality
        },
        room: {
          id: reservation.room?.id,
          number: reservation.room?.number?.toString(),
          type: reservation.room?.type,
          floor: reservation.room?.floor,
          price: reservation.room?.price
        },
        checkIn: reservation.check_in_date,
        checkOut: reservation.check_out_date,
        adults: reservation.adults,
        children: reservation.children,
        status: reservation.status,
        totalAmount: parseFloat(reservation.total_amount),
        paidAmount: parseFloat(reservation.paid_amount || 0),
        paymentStatus: reservation.payment_status,
        source: reservation.booking_source,
        specialRequests: reservation.special_requests,
        cancellationReason: reservation.cancellation_reason,
        createdAt: reservation.created_at,
        updatedAt: reservation.updated_at
      }));

      setReservations(transformedReservations);
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError(err.message);
      toast.error('Error al cargar las reservas');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar datos inicialmente
  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  // Filtrar reservas
  useEffect(() => {
    let filtered = [...reservations];

    // Filtro por estado
    if (filters.status) {
      filtered = filtered.filter(reservation => reservation.status === filters.status);
    }

    // Filtro por estado de pago
    if (filters.paymentStatus) {
      filtered = filtered.filter(reservation => reservation.paymentStatus === filters.paymentStatus);
    }

    // Filtro por búsqueda (nombre, código, email, habitación)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(reservation => 
        reservation.guest.name?.toLowerCase().includes(searchTerm) ||
        reservation.confirmationCode?.toLowerCase().includes(searchTerm) ||
        reservation.guest.email?.toLowerCase().includes(searchTerm) ||
        reservation.room.number?.includes(searchTerm) ||
        reservation.guest.dni?.includes(searchTerm)
      );
    }

    // Filtro por fuente de reserva
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
        case 'this_month':
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
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
      const confirmationCode = await generateConfirmationCode();

      // Preparar datos para inserción
      const reservationInsert = {
        guest_id: reservationData.guestId,
        room_id: reservationData.roomId,
        confirmation_code: confirmationCode,
        check_in_date: reservationData.checkIn,
        check_out_date: reservationData.checkOut,
        adults: reservationData.adults || 1,
        children: reservationData.children || 0,
        status: RESERVATION_STATUS.CONFIRMED,
        total_amount: reservationData.totalAmount,
        paid_amount: reservationData.paidAmount || 0,
        payment_status: reservationData.paymentStatus || PAYMENT_STATUS.PENDING,
        booking_source: reservationData.source || 'direct',
        special_requests: reservationData.specialRequests || null
      };

      const { data, error } = await supabase
        .from('reservations')
        .insert([reservationInsert])
        .select(`
          *,
          guest:guests(
            id,
            full_name,
            email,
            phone,
            dni,
            nationality
          ),
          room:rooms(
            id,
            number,
            type,
            floor,
            price
          )
        `)
        .single();

      if (error) throw error;

      // Transformar respuesta
      const newReservation = {
        id: data.id,
        confirmationCode: data.confirmation_code,
        guest: {
          id: data.guest?.id,
          name: data.guest?.full_name,
          email: data.guest?.email,
          phone: data.guest?.phone,
          dni: data.guest?.dni,
          nationality: data.guest?.nationality
        },
        room: {
          id: data.room?.id,
          number: data.room?.number?.toString(),
          type: data.room?.type,
          floor: data.room?.floor,
          price: data.room?.price
        },
        checkIn: data.check_in_date,
        checkOut: data.check_out_date,
        adults: data.adults,
        children: data.children,
        status: data.status,
        totalAmount: parseFloat(data.total_amount),
        paidAmount: parseFloat(data.paid_amount || 0),
        paymentStatus: data.payment_status,
        source: data.booking_source,
        specialRequests: data.special_requests,
        createdAt: data.created_at
      };

      // Actualizar estado local
      setReservations(prev => [newReservation, ...prev]);
      
      toast.success(`Reserva creada exitosamente. Código: ${confirmationCode}`);
      return newReservation;
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast.error('Error al crear la reserva: ' + error.message);
      throw error;
    }
  }, []);

  // Actualizar reserva
  const updateReservation = useCallback(async (id, updates) => {
    try {
      // Mapear campos del frontend a la base de datos
      const dbUpdates = {};
      
      if (updates.guestId !== undefined) dbUpdates.guest_id = updates.guestId;
      if (updates.roomId !== undefined) dbUpdates.room_id = updates.roomId;
      if (updates.checkIn !== undefined) dbUpdates.check_in_date = updates.checkIn;
      if (updates.checkOut !== undefined) dbUpdates.check_out_date = updates.checkOut;
      if (updates.adults !== undefined) dbUpdates.adults = updates.adults;
      if (updates.children !== undefined) dbUpdates.children = updates.children;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.totalAmount !== undefined) dbUpdates.total_amount = updates.totalAmount;
      if (updates.paidAmount !== undefined) dbUpdates.paid_amount = updates.paidAmount;
      if (updates.paymentStatus !== undefined) dbUpdates.payment_status = updates.paymentStatus;
      if (updates.source !== undefined) dbUpdates.booking_source = updates.source;
      if (updates.specialRequests !== undefined) dbUpdates.special_requests = updates.specialRequests;
      if (updates.cancellationReason !== undefined) dbUpdates.cancellation_reason = updates.cancellationReason;

      const { data, error } = await supabase
        .from('reservations')
        .update(dbUpdates)
        .eq('id', id)
        .select(`
          *,
          guest:guests(
            id,
            full_name,
            email,
            phone,
            dni,
            nationality
          ),
          room:rooms(
            id,
            number,
            type,
            floor,
            price
          )
        `)
        .single();

      if (error) throw error;

      // Actualizar estado local
      setReservations(prev => prev.map(reservation => 
        reservation.id === id ? {
          ...reservation,
          ...updates,
          updatedAt: data.updated_at
        } : reservation
      ));

      toast.success('Reserva actualizada exitosamente');
      return data;
    } catch (error) {
      console.error('Error updating reservation:', error);
      toast.error('Error al actualizar la reserva: ' + error.message);
      throw error;
    }
  }, []);

  // Eliminar reserva
  const deleteReservation = useCallback(async (id) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setReservations(prev => prev.filter(reservation => reservation.id !== id));
      toast.success('Reserva eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting reservation:', error);
      toast.error('Error al eliminar la reserva: ' + error.message);
      throw error;
    }
  }, []);

  // Cambiar estado de reserva
  const changeReservationStatus = useCallback(async (id, newStatus, additionalData = {}) => {
    try {
      const statusMessages = {
        [RESERVATION_STATUS.CONFIRMED]: 'confirmada',
        [RESERVATION_STATUS.CHECKED_IN]: 'check-in realizado',
        [RESERVATION_STATUS.CHECKED_OUT]: 'check-out realizado',
        [RESERVATION_STATUS.CANCELLED]: 'cancelada',
        [RESERVATION_STATUS.NO_SHOW]: 'marcada como no-show'
      };

      const updates = {
        status: newStatus,
        ...additionalData
      };

      await updateReservation(id, updates);
      toast.success(`Reserva ${statusMessages[newStatus] || 'actualizada'}`);
    } catch (error) {
      toast.error('Error al cambiar el estado de la reserva');
      throw error;
    }
  }, [updateReservation]);

  // Obtener reserva por ID
  const getReservationById = useCallback((id) => {
    return reservations.find(reservation => reservation.id === parseInt(id));
  }, [reservations]);

  // Obtener habitaciones disponibles para fechas específicas
  const getAvailableRooms = useCallback(async (checkIn, checkOut, excludeReservationId = null) => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('status', 'available');

      if (error) throw error;

      // Filtrar habitaciones que no estén ocupadas en las fechas seleccionadas
      const { data: conflictingReservations, error: reservationError } = await supabase
        .from('reservations')
        .select('room_id')
        .neq('status', 'cancelled')
        .neq('status', 'checked_out')
        .or(`check_in_date.lte.${checkOut},check_out_date.gte.${checkIn}`)
        .neq('id', excludeReservationId || 0);

      if (reservationError) throw reservationError;

      const occupiedRoomIds = conflictingReservations.map(r => r.room_id);
      const availableRooms = data.filter(room => !occupiedRoomIds.includes(room.id));

      return availableRooms.map(room => ({
        id: room.id,
        number: room.number.toString(),
        type: room.type,
        floor: room.floor,
        price: parseFloat(room.price),
        capacity: room.capacity,
        amenities: room.amenities || [],
        description: room.description
      }));
    } catch (error) {
      console.error('Error fetching available rooms:', error);
      toast.error('Error al obtener habitaciones disponibles');
      return [];
    }
  }, []);

  // Estadísticas de reservas
  const getReservationStats = useCallback(() => {
    const total = reservations.length;
    const pending = reservations.filter(r => r.status === RESERVATION_STATUS.PENDING).length;
    const confirmed = reservations.filter(r => r.status === RESERVATION_STATUS.CONFIRMED).length;
    const checkedIn = reservations.filter(r => r.status === RESERVATION_STATUS.CHECKED_IN).length;
    const checkedOut = reservations.filter(r => r.status === RESERVATION_STATUS.CHECKED_OUT).length;
    const cancelled = reservations.filter(r => r.status === RESERVATION_STATUS.CANCELLED).length;
    const noShow = reservations.filter(r => r.status === RESERVATION_STATUS.NO_SHOW).length;
    
    const totalRevenue = reservations
      .filter(r => r.status !== RESERVATION_STATUS.CANCELLED)
      .reduce((sum, r) => sum + r.totalAmount, 0);
    
    const paidAmount = reservations.reduce((sum, r) => sum + r.paidAmount, 0);
    const pendingPayments = totalRevenue - paidAmount;

    return { 
      total, 
      pending, 
      confirmed, 
      checkedIn, 
      checkedOut, 
      cancelled, 
      noShow,
      totalRevenue, 
      paidAmount, 
      pendingPayments 
    };
  }, [reservations]);

  // Paginación
  const getPaginatedReservations = useCallback(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    return filteredReservations.slice(startIndex, endIndex);
  }, [filteredReservations, pagination]);

  // Obtener reservas por fecha
  const getReservationsByDate = useCallback((date) => {
    return reservations.filter(reservation => {
      const checkInDate = new Date(reservation.checkIn).toDateString();
      const targetDate = new Date(date).toDateString();
      return checkInDate === targetDate;
    });
  }, [reservations]);

  // Suscripción a cambios en tiempo real
  useEffect(() => {
    const subscription = supabase
      .channel('reservations_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'reservations' 
        }, 
        (payload) => {
          console.log('Reservation change detected:', payload);
          fetchReservations(); // Recargar datos cuando hay cambios
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchReservations]);

  return {
    // Datos
    reservations: getPaginatedReservations(),
    allReservations: filteredReservations,
    loading,
    error,
    
    // Filtros y paginación
    filters,
    setFilters,
    pagination,
    setPagination,
    
    // Acciones CRUD
    createReservation,
    updateReservation,
    deleteReservation,
    changeReservationStatus,
    
    // Utilidades
    getReservationById,
    getAvailableRooms,
    getReservationStats,
    getReservationsByDate,
    
    // Funciones de recarga
    refreshData: fetchReservations,
    
    // Constantes
    RESERVATION_STATUS,
    PAYMENT_STATUS
  };
};