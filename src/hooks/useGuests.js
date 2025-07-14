// src/hooks/useGuests.js - CONECTADO CON SUPABASE
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';

export const useGuests = () => {
  const [guests, setGuests] = useState([]);
  const [guestsStats, setGuestsStats] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calcular estadísticas automáticamente cuando cambien los datos
  const calculatedStats = useMemo(() => {
    if (!guests || guests.length === 0) {
      return {
        total: 0,
        active: 0,
        vip: 0,
        frequent: 0,
        newThisMonth: 0,
        totalRevenue: 0,
        averageStay: 0,
        repeatRate: 0,
        topCountries: [],
        ageGroups: {},
        satisfactionScore: 0,
        recommendationRate: 0
      };
    }

    const total = guests.length;
    const active = guests.filter(g => g.vip_status === true).length;
    const vip = guests.filter(g => g.vip_status === true).length;
    
    // Calcular huéspedes frecuentes basado en órdenes
    const guestOrderCounts = {};
    orders.forEach(order => {
      if (order.guest_id) {
        guestOrderCounts[order.guest_id] = (guestOrderCounts[order.guest_id] || 0) + 1;
      }
    });
    const frequent = Object.values(guestOrderCounts).filter(count => count >= 3).length;

    // Huéspedes nuevos este mes
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newThisMonth = guests.filter(g => {
      const createdDate = new Date(g.created_at);
      return createdDate.getMonth() === currentMonth && 
             createdDate.getFullYear() === currentYear;
    }).length;

    // Ingresos totales de órdenes completadas
    const totalRevenue = orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + parseFloat(o.total || 0), 0);

    // Estancia promedio (simulada por ahora)
    const completedOrders = orders.filter(o => o.status === 'completed');
    const averageStay = completedOrders.length > 0 
      ? Math.round(completedOrders.reduce((sum, o) => {
          const checkIn = new Date(o.check_in_date);
          const checkOut = new Date(o.check_out_date || o.check_in_date);
          const days = Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
          return sum + days;
        }, 0) / completedOrders.length)
      : 0;

    // Tasa de retorno
    const repeatGuests = Object.values(guestOrderCounts).filter(count => count > 1).length;
    const repeatRate = total > 0 ? Math.round((repeatGuests / total) * 100) : 0;

    // Países principales
    const countryCount = {};
    guests.forEach(guest => {
      if (guest.nationality) {
        countryCount[guest.nationality] = (countryCount[guest.nationality] || 0) + 1;
      }
    });

    const topCountries = Object.entries(countryCount)
      .map(([country, count]) => ({
        name: country,
        code: country.slice(0, 2).toUpperCase(),
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Grupos de edad
    const ageGroups = {
      '18-25': 0,
      '26-35': 0,
      '36-50': 0,
      '51-65': 0,
      '65+': 0
    };

    guests.forEach(guest => {
      if (guest.birth_date) {
        const age = new Date().getFullYear() - new Date(guest.birth_date).getFullYear();
        
        if (age >= 18 && age <= 25) ageGroups['18-25']++;
        else if (age >= 26 && age <= 35) ageGroups['26-35']++;
        else if (age >= 36 && age <= 50) ageGroups['36-50']++;
        else if (age >= 51 && age <= 65) ageGroups['51-65']++;
        else if (age > 65) ageGroups['65+']++;
      }
    });

    return {
      total,
      active,
      vip,
      frequent,
      newThisMonth,
      totalRevenue,
      averageStay,
      repeatRate,
      topCountries,
      ageGroups,
      satisfactionScore: 4.2, // Simulado por ahora
      recommendationRate: 85 // Simulado por ahora
    };
  }, [guests, orders]);

  // Cargar huéspedes desde Supabase
  const loadGuests = async () => {
    try {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setGuests(data || []);
      return data;
    } catch (error) {
      console.error('Error cargando huéspedes:', error);
      setError(error.message);
      return [];
    }
  };

  // Cargar reservas desde Supabase
  const loadReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          guests (full_name, email, phone),
          rooms (number, type, price)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedReservations = data.map(reservation => ({
        id: reservation.id,
        guestId: reservation.guest_id,
        guest: reservation.guests,
        room: reservation.rooms,
        confirmationCode: reservation.confirmation_code,
        checkIn: reservation.check_in_date,
        checkOut: reservation.check_out_date,
        adults: reservation.adults,
        children: reservation.children,
        status: reservation.status,
        totalAmount: parseFloat(reservation.total_amount),
        paidAmount: parseFloat(reservation.paid_amount || 0),
        paymentStatus: reservation.payment_status,
        specialRequests: reservation.special_requests,
        createdAt: reservation.created_at
      }));

      setReservations(formattedReservations);
      return formattedReservations;
    } catch (error) {
      console.error('Error cargando reservas:', error);
      setError(error.message);
      return [];
    }
  };

  // Cargar órdenes desde Supabase
  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(data || []);
      return data;
    } catch (error) {
      console.error('Error cargando órdenes:', error);
      setError(error.message);
      return [];
    }
  };

  // Crear nuevo huésped
  const createGuest = async (guestData) => {
    try {
      const { data, error } = await supabase
        .from('guests')
        .insert([{
          dni: guestData.dni,
          passport: guestData.passport,
          full_name: guestData.fullName,
          email: guestData.email,
          phone: guestData.phone,
          nationality: guestData.nationality,
          birth_date: guestData.birthDate,
          address: guestData.address,
          emergency_contact: guestData.emergencyContact || {},
          preferences: guestData.preferences || {},
          vip_status: guestData.vipStatus || false,
          blacklisted: guestData.blacklisted || false,
          notes: guestData.notes
        }])
        .select()
        .single();

      if (error) throw error;

      // Recargar huéspedes
      await loadGuests();

      return { success: true, data };
    } catch (error) {
      console.error('Error creando huésped:', error);
      return { success: false, error: error.message };
    }
  };

  // Actualizar huésped
  const updateGuest = async (guestId, updateData) => {
    try {
      const { error } = await supabase
        .from('guests')
        .update({
          dni: updateData.dni,
          passport: updateData.passport,
          full_name: updateData.fullName,
          email: updateData.email,
          phone: updateData.phone,
          nationality: updateData.nationality,
          birth_date: updateData.birthDate,
          address: updateData.address,
          emergency_contact: updateData.emergencyContact,
          preferences: updateData.preferences,
          vip_status: updateData.vipStatus,
          blacklisted: updateData.blacklisted,
          notes: updateData.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', guestId);

      if (error) throw error;

      // Recargar huéspedes
      await loadGuests();

      return { success: true };
    } catch (error) {
      console.error('Error actualizando huésped:', error);
      return { success: false, error: error.message };
    }
  };

  // Eliminar huésped (solo si no tiene reservas)
  const deleteGuest = async (guestId) => {
    try {
      // Verificar si tiene reservas u órdenes
      const { data: guestReservations } = await supabase
        .from('reservations')
        .select('id')
        .eq('guest_id', guestId);

      const { data: guestOrders } = await supabase
        .from('orders')
        .select('id')
        .eq('guest_id', guestId);

      if ((guestReservations && guestReservations.length > 0) || 
          (guestOrders && guestOrders.length > 0)) {
        return { 
          success: false, 
          error: 'No se puede eliminar el huésped porque tiene reservas u órdenes asociadas' 
        };
      }

      const { error } = await supabase
        .from('guests')
        .delete()
        .eq('id', guestId);

      if (error) throw error;

      // Recargar huéspedes
      await loadGuests();

      return { success: true };
    } catch (error) {
      console.error('Error eliminando huésped:', error);
      return { success: false, error: error.message };
    }
  };

  // Obtener reservas de un huésped
  const getGuestReservations = (guestId) => {
    return reservations.filter(reservation => reservation.guestId === guestId)
      .sort((a, b) => new Date(b.checkIn) - new Date(a.checkIn));
  };

  // Obtener órdenes de un huésped
  const getGuestOrders = (guestId) => {
    return orders.filter(order => order.guest_id === guestId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  };

  // Obtener historial completo de un huésped
  const getGuestHistory = (guestId) => {
    const guestReservations = getGuestReservations(guestId);
    const guestOrders = getGuestOrders(guestId);
    
    const history = [];

    // Agregar reservas al historial
    guestReservations.forEach(reservation => {
      history.push({
        id: `reservation-${reservation.id}`,
        type: 'reservation',
        date: reservation.checkIn,
        description: `Reserva en habitación ${reservation.room?.number}`,
        details: {
          confirmationCode: reservation.confirmationCode,
          checkIn: reservation.checkIn,
          checkOut: reservation.checkOut,
          roomNumber: reservation.room?.number,
          roomType: reservation.room?.type,
          totalAmount: reservation.totalAmount,
          status: reservation.status,
          adults: reservation.adults,
          children: reservation.children
        }
      });
    });

    // Agregar órdenes al historial
    guestOrders.forEach(order => {
      history.push({
        id: `order-${order.id}`,
        type: 'order',
        date: order.check_in_date,
        description: `Estadía en habitación ${order.room_number}`,
        details: {
          roomNumber: order.room_number,
          checkIn: order.check_in_date,
          checkOut: order.check_out_date,
          total: order.total,
          status: order.status,
          paymentMethod: order.payment_method
        }
      });
    });

    // Ordenar por fecha más reciente
    return history.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // Buscar huéspedes
  const searchGuests = (searchTerm) => {
    if (!searchTerm) return guests;
    
    const term = searchTerm.toLowerCase();
    return guests.filter(guest => 
      guest.full_name?.toLowerCase().includes(term) ||
      guest.email?.toLowerCase().includes(term) ||
      guest.phone?.includes(term) ||
      guest.dni?.includes(term) ||
      guest.passport?.includes(term) ||
      guest.nationality?.toLowerCase().includes(term)
    );
  };

  // Obtener huéspedes VIP
  const getVipGuests = () => {
    return guests.filter(guest => guest.vip_status === true)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  };

  // Obtener huéspedes frecuentes (con múltiples órdenes)
  const getFrequentGuests = () => {
    const guestOrderCounts = {};
    orders.forEach(order => {
      if (order.guest_id) {
        guestOrderCounts[order.guest_id] = (guestOrderCounts[order.guest_id] || 0) + 1;
      }
    });

    return guests.filter(guest => (guestOrderCounts[guest.id] || 0) >= 3)
      .map(guest => ({
        ...guest,
        totalVisits: guestOrderCounts[guest.id] || 0
      }))
      .sort((a, b) => b.totalVisits - a.totalVisits);
  };

  // Obtener cumpleañeros del mes
  const getBirthdayGuests = () => {
    const currentMonth = new Date().getMonth();
    
    return guests.filter(guest => {
      if (!guest.birth_date) return false;
      const guestMonth = new Date(guest.birth_date).getMonth();
      return guestMonth === currentMonth;
    }).sort((a, b) => {
      const dayA = new Date(a.birth_date).getDate();
      const dayB = new Date(b.birth_date).getDate();
      return dayA - dayB;
    });
  };

  // Obtener huéspedes activos (con órdenes activas)
  const getActiveGuests = () => {
    const activeOrderGuestIds = orders
      .filter(order => order.status === 'active')
      .map(order => order.guest_id);

    return guests.filter(guest => activeOrderGuestIds.includes(guest.id));
  };

  // Obtener estadísticas de un huésped específico
  const getGuestStats = (guestId) => {
    const guestOrders = getGuestOrders(guestId);
    const guestReservations = getGuestReservations(guestId);
    
    const totalSpent = guestOrders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
    
    const totalVisits = guestOrders.length;
    
    const averageStay = guestOrders.length > 0
      ? guestOrders.reduce((sum, order) => {
          const checkIn = new Date(order.check_in_date);
          const checkOut = new Date(order.check_out_date || order.check_in_date);
          const days = Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
          return sum + days;
        }, 0) / guestOrders.length
      : 0;

    const lastVisit = guestOrders.length > 0 
      ? new Date(Math.max(...guestOrders.map(o => new Date(o.check_in_date)))).toISOString().split('T')[0]
      : null;

    return {
      totalVisits,
      totalSpent,
      averageStay: Math.round(averageStay),
      lastVisit,
      reservationsCount: guestReservations.length,
      activeOrders: guestOrders.filter(o => o.status === 'active').length
    };
  };

  // Refrescar todos los datos
  const refreshData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        loadGuests(),
        loadReservations(),
        loadOrders()
      ]);
    } catch (error) {
      console.error('Error refrescando datos de huéspedes:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Suscripción a cambios en tiempo real
  useEffect(() => {
    // Canal para huéspedes
    const guestsChannel = supabase
      .channel('guests_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'guests' },
        (payload) => {
          console.log('Cambio en huéspedes:', payload);
          loadGuests();
        }
      )
      .subscribe();

    // Canal para reservas
    const reservationsChannel = supabase
      .channel('reservations_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'reservations' },
        (payload) => {
          console.log('Cambio en reservas:', payload);
          loadReservations();
        }
      )
      .subscribe();

    // Canal para órdenes
    const ordersChannel = supabase
      .channel('orders_guests_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('Cambio en órdenes:', payload);
          loadOrders();
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(guestsChannel);
      supabase.removeChannel(reservationsChannel);
      supabase.removeChannel(ordersChannel);
    };
  }, []);

  // Actualizar estadísticas cuando cambien los datos
  useEffect(() => {
    setGuestsStats(calculatedStats);
  }, [calculatedStats]);

  // Cargar datos iniciales
  useEffect(() => {
    refreshData();
  }, []);

  return {
    // Datos principales
    guests,
    guestsStats,
    reservations,
    orders,
    loading,
    error,
    
    // Métodos CRUD
    createGuest,
    updateGuest,
    deleteGuest,
    
    // Métodos de consulta
    getGuestReservations,
    getGuestOrders,
    getGuestHistory,
    getGuestStats,
    searchGuests,
    getVipGuests,
    getFrequentGuests,
    getBirthdayGuests,
    getActiveGuests,
    refreshData,
    
    // Funciones de recarga individual
    loadGuests,
    loadReservations,
    loadOrders
  };
};