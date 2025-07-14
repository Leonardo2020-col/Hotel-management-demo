// src/hooks/useReception.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export const ROOM_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  CHECKOUT: 'checkout',
  CLEANING: 'cleaning',
  MAINTENANCE: 'maintenance',
  OUT_OF_ORDER: 'out_of_order'
};

export const useReception = (selectedDate = new Date()) => {
  const [receptionData, setReceptionData] = useState({
    rooms: [],
    reservations: [],
    todayArrivals: [],
    todayDepartures: [],
    occupancyStats: null,
    revenueStats: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [realTimeConnected, setRealTimeConnected] = useState(false);

  // Obtener datos del dashboard de recepción
  const fetchReceptionData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const dateStr = selectedDate.toISOString().split('T')[0];

      // 1. Obtener habitaciones con estado actual
      const { data: rooms, error: roomsError } = await supabase
        .from('room_status_view')
        .select('*')
        .order('number');

      if (roomsError) throw roomsError;

      // 2. Obtener llegadas del día
      const { data: todayArrivals, error: arrivalsError } = await supabase
        .from('reservations')
        .select(`
          *,
          guest:guests(
            id,
            full_name,
            email,
            phone,
            dni
          ),
          room:rooms(
            id,
            number,
            type,
            price
          )
        `)
        .eq('check_in_date', dateStr)
        .in('status', ['confirmed', 'pending'])
        .order('created_at');

      if (arrivalsError) throw arrivalsError;

      // 3. Obtener salidas del día
      const { data: todayDepartures, error: departuresError } = await supabase
        .from('reservations')
        .select(`
          *,
          guest:guests(
            id,
            full_name,
            email,
            phone,
            dni
          ),
          room:rooms(
            id,
            number,
            type,
            price
          )
        `)
        .eq('check_out_date', dateStr)
        .eq('status', 'checked_in')
        .order('created_at');

      if (departuresError) throw departuresError;

      // 4. Obtener estadísticas de ocupación
      const { data: occupancyStats, error: occupancyError } = await supabase
        .from('daily_stats_view')
        .select('*')
        .single();

      if (occupancyError) throw occupancyError;

      // 5. Obtener órdenes activas (huéspedes actuales)
      const { data: activeOrders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          guest:guests(
            id,
            full_name,
            email,
            phone
          )
        `)
        .eq('status', 'active')
        .order('room_number');

      if (ordersError) throw ordersError;

      // 6. Calcular estadísticas de ingresos del día
      const { data: revenueData, error: revenueError } = await supabase
        .from('reservations')
        .select('total_amount, paid_amount, status')
        .eq('check_in_date', dateStr);

      if (revenueError) throw revenueError;

      const revenueStats = {
        expectedRevenue: revenueData.reduce((sum, r) => sum + parseFloat(r.total_amount), 0),
        collectedRevenue: revenueData.reduce((sum, r) => sum + parseFloat(r.paid_amount || 0), 0),
        pendingRevenue: revenueData.reduce((sum, r) => 
          sum + (parseFloat(r.total_amount) - parseFloat(r.paid_amount || 0)), 0
        )
      };

      // Transformar datos para el frontend
      const transformedData = {
        rooms: rooms.map(room => ({
          id: room.id,
          number: room.number.toString(),
          floor: room.floor,
          type: room.type,
          status: room.status,
          price: parseFloat(room.price),
          guestName: room.guest_name,
          checkInDate: room.check_in_date,
          checkOutDate: room.check_out_date,
          cleaningStatus: room.cleaning_status,
          cleaningStaffId: room.cleaning_staff_id
        })),
        todayArrivals: todayArrivals.map(arrival => ({
          id: arrival.id,
          confirmationCode: arrival.confirmation_code,
          guest: {
            id: arrival.guest?.id,
            name: arrival.guest?.full_name,
            email: arrival.guest?.email,
            phone: arrival.guest?.phone,
            dni: arrival.guest?.dni
          },
          room: {
            id: arrival.room?.id,
            number: arrival.room?.number?.toString(),
            type: arrival.room?.type,
            price: arrival.room?.price
          },
          checkIn: arrival.check_in_date,
          checkOut: arrival.check_out_date,
          adults: arrival.adults,
          children: arrival.children,
          status: arrival.status,
          totalAmount: parseFloat(arrival.total_amount),
          specialRequests: arrival.special_requests
        })),
        todayDepartures: todayDepartures.map(departure => ({
          id: departure.id,
          confirmationCode: departure.confirmation_code,
          guest: {
            id: departure.guest?.id,
            name: departure.guest?.full_name,
            email: departure.guest?.email,
            phone: departure.guest?.phone,
            dni: departure.guest?.dni
          },
          room: {
            id: departure.room?.id,
            number: departure.room?.number?.toString(),
            type: departure.room?.type,
            price: departure.room?.price
          },
          checkIn: departure.check_in_date,
          checkOut: departure.check_out_date,
          totalAmount: parseFloat(departure.total_amount),
          paidAmount: parseFloat(departure.paid_amount || 0)
        })),
        activeOrders: activeOrders.map(order => ({
          id: order.id,
          roomNumber: order.room_number.toString(),
          guestName: order.guest_name,
          guest: order.guest ? {
            id: order.guest.id,
            name: order.guest.full_name,
            email: order.guest.email,
            phone: order.guest.phone
          } : null,
          roomPrice: parseFloat(order.room_price),
          servicesTotal: parseFloat(order.services_total || 0),
          total: parseFloat(order.total),
          checkInDate: order.check_in_date,
          checkInTime: order.check_in_time,
          checkOutDate: order.check_out_date,
          paymentStatus: order.payment_status
        })),
        occupancyStats: {
          totalRooms: occupancyStats.total_rooms,
          occupiedRooms: occupancyStats.occupied_rooms,
          availableRooms: occupancyStats.available_rooms,
          checkoutRooms: occupancyStats.checkout_rooms,
          cleaningRooms: occupancyStats.cleaning_rooms,
          occupancyRate: parseFloat(occupancyStats.occupancy_rate)
        },
        revenueStats
      };

      setReceptionData(transformedData);
    } catch (err) {
      console.error('Error fetching reception data:', err);
      setError(err.message);
      toast.error('Error al cargar datos de recepción');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  // Check-in de huésped
  const handleCheckIn = useCallback(async (reservationId, roomNumber, additionalData = {}) => {
    try {
      // 1. Actualizar estado de la reserva
      const { error: reservationError } = await supabase
        .from('reservations')
        .update({
          status: 'checked_in',
          ...additionalData
        })
        .eq('id', reservationId);

      if (reservationError) throw reservationError;

      // 2. Actualizar estado de la habitación
      const { error: roomError } = await supabase
        .from('rooms')
        .update({ status: 'occupied' })
        .eq('number', roomNumber);

      if (roomError) throw roomError;

      // 3. Crear orden activa
      const { data: reservation } = await supabase
        .from('reservations')
        .select(`
          *,
          guest:guests(full_name),
          room:rooms(price)
        `)
        .eq('id', reservationId)
        .single();

      if (reservation) {
        const { error: orderError } = await supabase
          .from('orders')
          .insert({
            reservation_id: reservationId,
            room_number: roomNumber,
            guest_name: reservation.guest.full_name,
            guest_id: reservation.guest_id,
            room_price: reservation.room.price,
            total: reservation.total_amount,
            check_in_date: reservation.check_in_date,
            check_in_time: new Date().toISOString(),
            status: 'active'
          });

        if (orderError) throw orderError;
      }

      toast.success(`Check-in realizado exitosamente para habitación ${roomNumber}`);
      await fetchReceptionData(); // Recargar datos
    } catch (error) {
      console.error('Error during check-in:', error);
      toast.error('Error al realizar check-in: ' + error.message);
      throw error;
    }
  }, [fetchReceptionData]);

  // Check-out de huésped
  const handleCheckOut = useCallback(async (reservationId, roomNumber, additionalCharges = 0) => {
    try {
      // 1. Actualizar estado de la reserva
      const { error: reservationError } = await supabase
        .from('reservations')
        .update({
          status: 'checked_out'
        })
        .eq('id', reservationId);

      if (reservationError) throw reservationError;

      // 2. Actualizar estado de la habitación
      const { error: roomError } = await supabase
        .from('rooms')
        .update({ status: 'checkout' })
        .eq('number', roomNumber);

      if (roomError) throw roomError;

      // 3. Completar la orden
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          status: 'completed',
          check_out_date: new Date().toISOString().split('T')[0],
          check_out_time: new Date().toISOString(),
          services_total: additionalCharges,
          total: supabase.raw(`room_price + ${additionalCharges}`)
        })
        .eq('reservation_id', reservationId);

      if (orderError) throw orderError;

      // 4. Crear tarea de limpieza
      const { data: roomData } = await supabase
        .from('rooms')
        .select('id')
        .eq('number', roomNumber)
        .single();

      if (roomData) {
        const { error: cleaningError } = await supabase
          .from('room_cleaning')
          .insert({
            room_id: roomData.id,
            status: 'pending',
            cleaning_type: 'checkout',
            priority: 'high'
          });

        if (cleaningError) console.warn('Error creating cleaning task:', cleaningError);
      }

      toast.success(`Check-out realizado exitosamente para habitación ${roomNumber}`);
      await fetchReceptionData(); // Recargar datos
    } catch (error) {
      console.error('Error during check-out:', error);
      toast.error('Error al realizar check-out: ' + error.message);
      throw error;
    }
  }, [fetchReceptionData]);

  // Cambiar estado de habitación
  const updateRoomStatus = useCallback(async (roomNumber, newStatus, notes = '') => {
    try {
      const { error } = await supabase
        .from('rooms')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('number', roomNumber);

      if (error) throw error;

      // Si se marca como limpieza, crear tarea de limpieza
      if (newStatus === 'cleaning') {
        const { data: roomData } = await supabase
          .from('rooms')
          .select('id')
          .eq('number', roomNumber)
          .single();

        if (roomData) {
          await supabase
            .from('room_cleaning')
            .insert({
              room_id: roomData.id,
              status: 'pending',
              cleaning_type: 'maintenance',
              notes: notes,
              priority: 'medium'
            });
        }
      }

      const statusMessages = {
        available: 'disponible',
        occupied: 'ocupada',
        checkout: 'pendiente de limpieza',
        cleaning: 'en limpieza',
        maintenance: 'en mantenimiento',
        out_of_order: 'fuera de servicio'
      };

      toast.success(`Habitación ${roomNumber} marcada como ${statusMessages[newStatus]}`);
      await fetchReceptionData();
    } catch (error) {
      console.error('Error updating room status:', error);
      toast.error('Error al actualizar estado de habitación: ' + error.message);
      throw error;
    }
  }, [fetchReceptionData]);

  // Asignar habitación a reserva
  const assignRoom = useCallback(async (reservationId, roomId) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ room_id: roomId })
        .eq('id', reservationId);

      if (error) throw error;

      toast.success('Habitación asignada exitosamente');
      await fetchReceptionData();
    } catch (error) {
      console.error('Error assigning room:', error);
      toast.error('Error al asignar habitación: ' + error.message);
      throw error;
    }
  }, [fetchReceptionData]);

  // Obtener historial de movimientos de una habitación
  const getRoomHistory = useCallback(async (roomNumber, days = 30) => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          guest:guests(full_name, email, phone)
        `)
        .eq('room.number', roomNumber)
        .gte('check_in_date', startDate.toISOString().split('T')[0])
        .order('check_in_date', { ascending: false });

      if (error) throw error;

      return data.map(reservation => ({
        id: reservation.id,
        confirmationCode: reservation.confirmation_code,
        guest: reservation.guest,
        checkIn: reservation.check_in_date,
        checkOut: reservation.check_out_date,
        status: reservation.status,
        totalAmount: parseFloat(reservation.total_amount)
      }));
    } catch (error) {
      console.error('Error fetching room history:', error);
      toast.error('Error al obtener historial de habitación');
      return [];
    }
  }, []);

  // Obtener estadísticas de ocupación para un rango de fechas
  const getOccupancyStats = useCallback(async (startDate, endDate) => {
    try {
      const { data, error } = await supabase
        .rpc('get_occupancy_stats', {
          start_date: startDate,
          end_date: endDate
        });

      if (error) throw error;

      return data.map(stat => ({
        date: stat.date,
        totalRooms: stat.total_rooms,
        occupiedRooms: stat.occupied_rooms,
        availableRooms: stat.available_rooms,
        occupancyRate: parseFloat(stat.occupancy_rate)
      }));
    } catch (error) {
      console.error('Error fetching occupancy stats:', error);
      toast.error('Error al obtener estadísticas de ocupación');
      return [];
    }
  }, []);

  // Generar reporte de llegadas y salidas
  const getDailyMovements = useCallback(async (date) => {
    try {
      const dateStr = new Date(date).toISOString().split('T')[0];

      const [arrivalsResponse, departuresResponse] = await Promise.all([
        supabase
          .from('reservations')
          .select(`
            *,
            guest:guests(full_name, phone, email),
            room:rooms(number, type)
          `)
          .eq('check_in_date', dateStr)
          .in('status', ['confirmed', 'checked_in']),
        
        supabase
          .from('reservations')
          .select(`
            *,
            guest:guests(full_name, phone, email),
            room:rooms(number, type)
          `)
          .eq('check_out_date', dateStr)
          .in('status', ['checked_in', 'checked_out'])
      ]);

      if (arrivalsResponse.error) throw arrivalsResponse.error;
      if (departuresResponse.error) throw departuresResponse.error;

      return {
        arrivals: arrivalsResponse.data.map(arr => ({
          confirmationCode: arr.confirmation_code,
          guest: arr.guest,
          room: arr.room,
          status: arr.status,
          totalAmount: parseFloat(arr.total_amount),
          specialRequests: arr.special_requests
        })),
        departures: departuresResponse.data.map(dep => ({
          confirmationCode: dep.confirmation_code,
          guest: dep.guest,
          room: dep.room,
          status: dep.status,
          totalAmount: parseFloat(dep.total_amount),
          paidAmount: parseFloat(dep.paid_amount || 0)
        }))
      };
    } catch (error) {
      console.error('Error fetching daily movements:', error);
      toast.error('Error al obtener movimientos del día');
      return { arrivals: [], departures: [] };
    }
  }, []);

  // Buscar huésped por diferentes criterios
  const searchGuest = useCallback(async (searchTerm) => {
    try {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,dni.eq.${searchTerm},phone.ilike.%${searchTerm}%`)
        .limit(10);

      if (error) throw error;

      return data.map(guest => ({
        id: guest.id,
        name: guest.full_name,
        email: guest.email,
        phone: guest.phone,
        dni: guest.dni,
        nationality: guest.nationality,
        vipStatus: guest.vip_status,
        blacklisted: guest.blacklisted
      }));
    } catch (error) {
      console.error('Error searching guest:', error);
      toast.error('Error al buscar huésped');
      return [];
    }
  }, []);

  // Cargar datos inicialmente
  useEffect(() => {
    fetchReceptionData();
  }, [fetchReceptionData]);

  // Configurar suscripciones en tiempo real
  useEffect(() => {
    const subscriptions = [];

    // Suscripción a cambios en reservas
    const reservationsSubscription = supabase
      .channel('reservations_reception')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'reservations' }, 
        () => {
          console.log('Reservation changed, refreshing reception data');
          fetchReceptionData();
        }
      )
      .subscribe();

    // Suscripción a cambios en habitaciones
    const roomsSubscription = supabase
      .channel('rooms_reception')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'rooms' }, 
        () => {
          console.log('Room status changed, refreshing reception data');
          fetchReceptionData();
        }
      )
      .subscribe();

    // Suscripción a cambios en órdenes
    const ordersSubscription = supabase
      .channel('orders_reception')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' }, 
        () => {
          console.log('Order changed, refreshing reception data');
          fetchReceptionData();
        }
      )
      .subscribe();

    subscriptions.push(reservationsSubscription, roomsSubscription, ordersSubscription);

    // Marcar como conectado cuando todas las suscripciones estén activas
    Promise.all(subscriptions.map(sub => 
      new Promise(resolve => {
        const channel = sub;
        if (channel.state === 'subscribed') resolve();
        else channel.subscribe(resolve);
      })
    )).then(() => {
      setRealTimeConnected(true);
    });

    return () => {
      subscriptions.forEach(sub => sub.unsubscribe());
      setRealTimeConnected(false);
    };
  }, [fetchReceptionData]);

  // Auto-refresh cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        fetchReceptionData();
      }
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [fetchReceptionData, loading]);

  return {
    // Datos principales
    receptionData,
    loading,
    error,
    realTimeConnected,

    // Acciones principales
    handleCheckIn,
    handleCheckOut,
    updateRoomStatus,
    assignRoom,

    // Utilidades y consultas
    getRoomHistory,
    getOccupancyStats,
    getDailyMovements,
    searchGuest,

    // Funciones de recarga
    refreshData: fetchReceptionData,

    // Constantes
    ROOM_STATUS
  };
};