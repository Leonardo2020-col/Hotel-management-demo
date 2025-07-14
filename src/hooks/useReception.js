// src/hooks/useReception.js - Con funciones SQL restauradas
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext, PERMISSIONS } from './useAuth';
import { useBranch } from './useBranch';
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
  const { hasPermission } = useAuthContext();
  const { selectedBranch } = useBranch();
  
  const [receptionData, setReceptionData] = useState({
    rooms: [],
    reservations: [],
    todayArrivals: [],
    todayDepartures: [],
    occupancyStats: null,
    revenueStats: null,
    activeOrders: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [realTimeConnected, setRealTimeConnected] = useState(false);

  // Obtener datos del dashboard de recepción con funciones SQL
  const fetchReceptionData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const dateStr = selectedDate.toISOString().split('T')[0];
      const branchId = selectedBranch?.id || 1;

      // 1. Obtener habitaciones con vista mejorada
      const { data: rooms, error: roomsError } = await supabase
        .from('room_status_view')
        .select('*')
        .eq('branch_id', branchId)
        .order('number');

      if (roomsError) {
        console.warn('Error fetching room_status_view, falling back to basic query:', roomsError);
        // Fallback a consulta básica
        const { data: basicRooms, error: basicError } = await supabase
          .from('rooms')
          .select('*')
          .eq('branch_id', branchId)
          .order('number');
        
        if (basicError) throw basicError;
        // Transformar datos básicos al formato esperado
        const transformedRooms = (basicRooms || []).map(room => ({
          ...room,
          branch_name: selectedBranch?.name,
          branch_code: selectedBranch?.code,
          guest_name: null,
          check_in_date: null,
          check_out_date: null,
          cleaning_status: null,
          cleaning_staff_id: null
        }));
        rooms = transformedRooms;
      }

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
          room:rooms!inner(
            id,
            number,
            type,
            price,
            branch_id
          )
        `)
        .eq('check_in_date', dateStr)
        .eq('room.branch_id', branchId)
        .in('status', ['confirmed', 'pending']);

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
          room:rooms!inner(
            id,
            number,
            type,
            price,
            branch_id
          )
        `)
        .eq('check_out_date', dateStr)
        .eq('room.branch_id', branchId)
        .eq('status', 'checked_in');

      if (departuresError) throw departuresError;

      // 4. Obtener estadísticas de ocupación usando función SQL
      let occupancyStats = {
        totalRooms: 0,
        occupiedRooms: 0,
        availableRooms: 0,
        checkoutRooms: 0,
        cleaningRooms: 0,
        occupancyRate: 0
      };

      try {
        const { data: occupancyData, error: occupancyError } = await supabase
          .rpc('get_branch_occupancy_stats', {
            p_branch_id: branchId,
            p_date: dateStr
          });

        if (occupancyError) throw occupancyError;
        
        if (occupancyData && occupancyData[0]) {
          occupancyStats = {
            totalRooms: occupancyData[0].total_rooms,
            occupiedRooms: occupancyData[0].occupied_rooms,
            availableRooms: occupancyData[0].available_rooms,
            checkoutRooms: occupancyData[0].checkout_rooms,
            cleaningRooms: occupancyData[0].cleaning_rooms,
            occupancyRate: parseFloat(occupancyData[0].occupancy_rate)
          };
        }
      } catch (funcError) {
        console.warn('Error calling get_branch_occupancy_stats, using fallback calculation:', funcError);
        // Fallback: calcular desde los datos de habitaciones
        const totalRooms = rooms?.length || 0;
        const occupiedRooms = rooms?.filter(r => r.status === 'occupied').length || 0;
        const availableRooms = rooms?.filter(r => r.status === 'available').length || 0;
        const checkoutRooms = rooms?.filter(r => r.status === 'checkout').length || 0;
        const cleaningRooms = rooms?.filter(r => r.status === 'cleaning').length || 0;
        
        occupancyStats = {
          totalRooms,
          occupiedRooms,
          availableRooms,
          checkoutRooms,
          cleaningRooms,
          occupancyRate: totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100 * 100) / 100 : 0
        };
      }

      // 5. Obtener órdenes activas
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
        .eq('status', 'active');

      if (ordersError) throw ordersError;

      // 6. Obtener estadísticas de ingresos usando función SQL
      let revenueStats = {
        expectedRevenue: 0,
        collectedRevenue: 0,
        pendingRevenue: 0
      };

      try {
        const { data: revenueData, error: revenueError } = await supabase
          .rpc('get_branch_revenue_stats', {
            p_branch_id: branchId,
            p_start_date: dateStr,
            p_end_date: dateStr
          });

        if (revenueError) throw revenueError;
        
        if (revenueData && revenueData[0]) {
          revenueStats = {
            expectedRevenue: parseFloat(revenueData[0].total_revenue),
            collectedRevenue: parseFloat(revenueData[0].paid_amount),
            pendingRevenue: parseFloat(revenueData[0].pending_payments)
          };
        }
      } catch (funcError) {
        console.warn('Error calling get_branch_revenue_stats, using fallback calculation:', funcError);
        // Fallback: cálculo básico desde órdenes
        const todayRevenue = activeOrders?.reduce((sum, order) => sum + parseFloat(order.total || 0), 0) || 0;
        revenueStats = {
          expectedRevenue: todayRevenue,
          collectedRevenue: todayRevenue * 0.8, // Estimado
          pendingRevenue: todayRevenue * 0.2
        };
      }

      // Transformar datos para el frontend
      const transformedData = {
        rooms: (rooms || []).map(room => ({
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
        todayArrivals: (todayArrivals || []).map(arrival => ({
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
        todayDepartures: (todayDepartures || []).map(departure => ({
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
        activeOrders: (activeOrders || []).map(order => ({
          id: order.id,
          roomNumber: order.room_number?.toString(),
          guestName: order.guest_name,
          guest: order.guest ? {
            id: order.guest.id,
            name: order.guest.full_name,
            email: order.guest.email,
            phone: order.guest.phone
          } : null,
          roomPrice: parseFloat(order.room_price || 0),
          servicesTotal: parseFloat(order.services_total || 0),
          total: parseFloat(order.total || 0),
          checkInDate: order.check_in_date,
          checkInTime: order.check_in_time,
          checkOutDate: order.check_out_date,
          paymentStatus: order.payment_status
        })),
        occupancyStats,
        revenueStats
      };

      setReceptionData(transformedData);
    } catch (err) {
      console.error('Error fetching reception data:', err);
      setError(err.message);
      
      // Establecer datos por defecto en caso de error
      setReceptionData({
        rooms: [],
        reservations: [],
        todayArrivals: [],
        todayDepartures: [],
        activeOrders: [],
        occupancyStats: {
          totalRooms: 0,
          occupiedRooms: 0,
          availableRooms: 0,
          checkoutRooms: 0,
          cleaningRooms: 0,
          occupancyRate: 0
        },
        revenueStats: {
          expectedRevenue: 0,
          collectedRevenue: 0,
          pendingRevenue: 0
        }
      });
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedBranch]);

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
          guest:guests(full_name, email, phone),
          room:rooms!inner(number, branch_id)
        `)
        .eq('room.number', roomNumber)
        .eq('room.branch_id', selectedBranch?.id || 1)
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
  }, [selectedBranch]);

  // Obtener estadísticas de ocupación para un rango de fechas
  const getOccupancyStats = useCallback(async (startDate, endDate) => {
    try {
      const { data, error } = await supabase
        .rpc('get_occupancy_stats_by_branch', {
          p_start_date: startDate,
          p_end_date: endDate,
          p_branch_id: selectedBranch?.id || null
        });

      if (error) throw error;

      return data.map(stat => ({
        date: stat.stat_date,
        branchId: stat.branch_id,
        branchName: stat.branch_name,
        totalRooms: stat.total_rooms,
        occupiedRooms: stat.occupied_rooms,
        availableRooms: stat.available_rooms,
        occupancyRate: parseFloat(stat.occupancy_rate)
      }));
    } catch (error) {
      console.error('Error fetching occupancy stats:', error);
      toast.error('Error al obtener estadísticas de ocupación');
      
      // Fallback: usar función simple
      try {
        const { data: fallbackData, error: fallbackError } = await supabase
          .rpc('get_occupancy_stats', {
            p_start_date: startDate,
            p_end_date: endDate
          });

        if (fallbackError) throw fallbackError;

        return fallbackData.map(stat => ({
          date: stat.stat_date,
          branchId: selectedBranch?.id || 1,
          branchName: selectedBranch?.name || 'Principal',
          totalRooms: stat.total_rooms,
          occupiedRooms: stat.occupied_rooms,
          availableRooms: stat.available_rooms,
          occupancyRate: parseFloat(stat.occupancy_rate)
        }));
      } catch (fallbackError) {
        console.error('Fallback occupancy stats also failed:', fallbackError);
        return [];
      }
    }
  }, [selectedBranch]);

  // Generar reporte de llegadas y salidas
  const getDailyMovements = useCallback(async (date) => {
    try {
      const dateStr = new Date(date).toISOString().split('T')[0];
      const branchId = selectedBranch?.id || 1;

      const [arrivalsResponse, departuresResponse] = await Promise.all([
        supabase
          .from('reservations')
          .select(`
            *,
            guest:guests(full_name, phone, email),
            room:rooms!inner(number, type, branch_id)
          `)
          .eq('check_in_date', dateStr)
          .eq('room.branch_id', branchId)
          .in('status', ['confirmed', 'checked_in']),
        
        supabase
          .from('reservations')
          .select(`
            *,
            guest:guests(full_name, phone, email),
            room:rooms!inner(number, type, branch_id)
          `)
          .eq('check_out_date', dateStr)
          .eq('room.branch_id', branchId)
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
  }, [selectedBranch]);

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
    if (selectedBranch) {
      fetchReceptionData();
    }
  }, [fetchReceptionData, selectedBranch]);

  // Configurar suscripciones en tiempo real
  useEffect(() => {
    if (!selectedBranch) return;

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
  }, [fetchReceptionData, selectedBranch]);

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