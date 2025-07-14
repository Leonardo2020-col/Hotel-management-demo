// src/hooks/useDashboard.js - CONECTADO CON SUPABASE
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';

export const useDashboard = () => {
  const [stats, setStats] = useState({
    rooms: {
      total: 0,
      available: 0,
      occupied: 0,
      checkout: 0,
      cleaning: 0,
      maintenance: 0,
      occupancyRate: 0
    },
    revenue: {
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      lastMonth: 0,
      growth: 0
    },
    orders: {
      active: 0,
      completed: 0,
      totalToday: 0,
      pending: 0
    },
    inventory: {
      lowStock: 0,
      totalItems: 0,
      totalValue: 0,
      outOfStock: 0
    },
    guests: {
      checkedIn: 0,
      checkingOut: 0,
      total: 0,
      newToday: 0
    },
    cleaning: {
      pending: 0,
      inProgress: 0,
      completed: 0
    }
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [upcomingCheckOuts, setUpcomingCheckOuts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Función para cargar estadísticas de habitaciones
  const loadRoomStats = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('status');

      if (error) throw error;

      const roomStats = data.reduce((acc, room) => {
        acc.total++;
        switch (room.status) {
          case 'available':
            acc.available++;
            break;
          case 'occupied':
            acc.occupied++;
            break;
          case 'checkout':
            acc.checkout++;
            break;
          case 'cleaning':
            acc.cleaning++;
            break;
          case 'maintenance':
            acc.maintenance++;
            break;
          default:
            acc.available++;
        }
        return acc;
      }, { total: 0, available: 0, occupied: 0, checkout: 0, cleaning: 0, maintenance: 0 });

      roomStats.occupancyRate = roomStats.total > 0 
        ? Math.round((roomStats.occupied / roomStats.total) * 100) 
        : 0;

      return roomStats;
    } catch (error) {
      console.error('Error cargando estadísticas de habitaciones:', error);
      return { total: 0, available: 0, occupied: 0, checkout: 0, cleaning: 0, maintenance: 0, occupancyRate: 0 };
    }
  };

  // Función para cargar estadísticas de ingresos
  const loadRevenueStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      const lastMonthStart = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0];
      const lastMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString().split('T')[0];

      // Ingresos de hoy
      const { data: todayRevenue, error: todayError } = await supabase
        .from('orders')
        .select('total')
        .eq('check_in_date', today)
        .eq('status', 'completed');

      if (todayError) throw todayError;

      // Ingresos de esta semana
      const { data: weekRevenue, error: weekError } = await supabase
        .from('orders')
        .select('total')
        .gte('check_in_date', weekAgo)
        .eq('status', 'completed');

      if (weekError) throw weekError;

      // Ingresos de este mes
      const { data: monthRevenue, error: monthError } = await supabase
        .from('orders')
        .select('total')
        .gte('check_in_date', monthStart)
        .eq('status', 'completed');

      if (monthError) throw monthError;

      // Ingresos del mes pasado
      const { data: lastMonthRevenue, error: lastMonthError } = await supabase
        .from('orders')
        .select('total')
        .gte('check_in_date', lastMonthStart)
        .lte('check_in_date', lastMonthEnd)
        .eq('status', 'completed');

      if (lastMonthError) throw lastMonthError;

      const todayTotal = todayRevenue.reduce((sum, order) => sum + parseFloat(order.total), 0);
      const weekTotal = weekRevenue.reduce((sum, order) => sum + parseFloat(order.total), 0);
      const monthTotal = monthRevenue.reduce((sum, order) => sum + parseFloat(order.total), 0);
      const lastMonthTotal = lastMonthRevenue.reduce((sum, order) => sum + parseFloat(order.total), 0);

      const growth = lastMonthTotal > 0 
        ? Math.round(((monthTotal - lastMonthTotal) / lastMonthTotal) * 100)
        : 0;

      return {
        today: todayTotal,
        thisWeek: weekTotal,
        thisMonth: monthTotal,
        lastMonth: lastMonthTotal,
        growth
      };
    } catch (error) {
      console.error('Error cargando estadísticas de ingresos:', error);
      return { today: 0, thisWeek: 0, thisMonth: 0, lastMonth: 0, growth: 0 };
    }
  };

  // Función para cargar estadísticas de órdenes
  const loadOrderStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Órdenes activas
      const { data: activeOrders, error: activeError } = await supabase
        .from('orders')
        .select('id')
        .eq('status', 'active');

      if (activeError) throw activeError;

      // Órdenes completadas
      const { data: completedOrders, error: completedError } = await supabase
        .from('orders')
        .select('id')
        .eq('status', 'completed');

      if (completedError) throw completedError;

      // Órdenes de hoy
      const { data: todayOrders, error: todayError } = await supabase
        .from('orders')
        .select('id')
        .eq('check_in_date', today);

      if (todayError) throw todayError;

      return {
        active: activeOrders.length,
        completed: completedOrders.length,
        totalToday: todayOrders.length,
        pending: 0 // Por ahora no hay estado pending en orders
      };
    } catch (error) {
      console.error('Error cargando estadísticas de órdenes:', error);
      return { active: 0, completed: 0, totalToday: 0, pending: 0 };
    }
  };

  // Función para cargar estadísticas de inventario
  const loadInventoryStats = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('current_stock, min_stock, unit_cost')
        .eq('status', 'active');

      if (error) throw error;

      const stats = data.reduce((acc, item) => {
        acc.totalItems++;
        acc.totalValue += item.current_stock * item.unit_cost;
        
        if (item.current_stock === 0) {
          acc.outOfStock++;
        } else if (item.current_stock <= item.min_stock) {
          acc.lowStock++;
        }
        
        return acc;
      }, { totalItems: 0, totalValue: 0, lowStock: 0, outOfStock: 0 });

      return stats;
    } catch (error) {
      console.error('Error cargando estadísticas de inventario:', error);
      return { totalItems: 0, totalValue: 0, lowStock: 0, outOfStock: 0 };
    }
  };

  // Función para cargar estadísticas de huéspedes
  const loadGuestStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Huéspedes actualmente registrados (órdenes activas)
      const { data: activeGuests, error: activeError } = await supabase
        .from('orders')
        .select('guest_name')
        .eq('status', 'active');

      if (activeError) throw activeError;

      // Huéspedes que hicieron checkout hoy
      const { data: checkoutToday, error: checkoutError } = await supabase
        .from('orders')
        .select('guest_name')
        .eq('check_out_date', today)
        .eq('status', 'completed');

      if (checkoutError) throw checkoutError;

      // Total de huéspedes únicos
      const { data: allGuests, error: allError } = await supabase
        .from('guests')
        .select('id');

      if (allError) throw allError;

      // Huéspedes nuevos hoy
      const { data: newToday, error: newError } = await supabase
        .from('guests')
        .select('id')
        .eq('created_at::date', today);

      if (newError) throw newError;

      return {
        checkedIn: activeGuests.length,
        checkingOut: checkoutToday.length,
        total: allGuests.length,
        newToday: newToday.length
      };
    } catch (error) {
      console.error('Error cargando estadísticas de huéspedes:', error);
      return { checkedIn: 0, checkingOut: 0, total: 0, newToday: 0 };
    }
  };

  // Función para cargar estadísticas de limpieza
  const loadCleaningStats = async () => {
    try {
      const { data, error } = await supabase
        .from('room_cleaning')
        .select('status')
        .in('status', ['pending', 'in_progress', 'completed']);

      if (error) throw error;

      const stats = data.reduce((acc, task) => {
        switch (task.status) {
          case 'pending':
            acc.pending++;
            break;
          case 'in_progress':
            acc.inProgress++;
            break;
          case 'completed':
            acc.completed++;
            break;
        }
        return acc;
      }, { pending: 0, inProgress: 0, completed: 0 });

      return stats;
    } catch (error) {
      console.error('Error cargando estadísticas de limpieza:', error);
      return { pending: 0, inProgress: 0, completed: 0 };
    }
  };

  // Función para cargar actividad reciente
  const loadRecentActivity = async () => {
    try {
      const activities = [];

      // Órdenes recientes (últimas 10)
      const { data: recentOrders, error: ordersError } = await supabase
        .from('orders')
        .select('*, rooms(number)')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!ordersError && recentOrders) {
        recentOrders.forEach(order => {
          activities.push({
            id: `order-${order.id}`,
            type: order.status === 'active' ? 'check-in' : 'check-out',
            message: `${order.guest_name} - Habitación ${order.room_number}`,
            timestamp: order.check_out_time || order.created_at,
            details: {
              room: order.room_number,
              guest: order.guest_name,
              total: order.total
            }
          });
        });
      }

      // Tareas de limpieza recientes
      const { data: recentCleaning, error: cleaningError } = await supabase
        .from('room_cleaning')
        .select('*, rooms(number), staff(full_name)')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!cleaningError && recentCleaning) {
        recentCleaning.forEach(task => {
          activities.push({
            id: `cleaning-${task.id}`,
            type: 'cleaning',
            message: `Limpieza ${task.status} - Habitación ${task.rooms?.number}`,
            timestamp: task.completed_at || task.started_at || task.created_at,
            details: {
              room: task.rooms?.number,
              staff: task.staff?.full_name,
              status: task.status
            }
          });
        });
      }

      // Ordenar por timestamp más reciente
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setRecentActivity(activities.slice(0, 10));
      return activities;
    } catch (error) {
      console.error('Error cargando actividad reciente:', error);
      return [];
    }
  };

  // Función para cargar items con stock bajo
  const loadLowStockItems = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('id, name, current_stock, min_stock, category, unit')
        .eq('status', 'active')
        .lte('current_stock', supabase.rpc('min_stock'))
        .gt('current_stock', 0)
        .order('current_stock')
        .limit(10);

      if (error) {
        // Fallback query si rpc no funciona
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('inventory')
          .select('id, name, current_stock, min_stock, category, unit')
          .eq('status', 'active')
          .order('current_stock')
          .limit(20);

        if (fallbackError) throw fallbackError;

        const lowStock = fallbackData.filter(item => 
          item.current_stock <= item.min_stock && item.current_stock > 0
        ).slice(0, 10);

        setLowStockItems(lowStock);
        return lowStock;
      }

      setLowStockItems(data || []);
      return data;
    } catch (error) {
      console.error('Error cargando items con stock bajo:', error);
      return [];
    }
  };

  // Función para cargar próximos check-outs
  const loadUpcomingCheckOuts = async () => {
    try {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const { data, error } = await supabase
        .from('orders')
        .select('id, guest_name, room_number, check_in_date, total')
        .eq('status', 'active')
        .order('check_in_date');

      if (error) throw error;

      // Simular check-out dates (check_in_date + 1-3 días)
      const upcomingCheckOuts = data.map(order => ({
        ...order,
        estimatedCheckOut: new Date(new Date(order.check_in_date).getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000)
      })).filter(order => {
        const checkOutDate = new Date(order.estimatedCheckOut);
        return checkOutDate >= today && checkOutDate <= tomorrow;
      }).slice(0, 5);

      setUpcomingCheckOuts(upcomingCheckOuts);
      return upcomingCheckOuts;
    } catch (error) {
      console.error('Error cargando próximos check-outs:', error);
      return [];
    }
  };

  // Función para refrescar todas las estadísticas
  const refreshStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        roomStats,
        revenueStats,
        orderStats,
        inventoryStats,
        guestStats,
        cleaningStats
      ] = await Promise.all([
        loadRoomStats(),
        loadRevenueStats(),
        loadOrderStats(),
        loadInventoryStats(),
        loadGuestStats(),
        loadCleaningStats()
      ]);

      setStats({
        rooms: roomStats,
        revenue: revenueStats,
        orders: orderStats,
        inventory: inventoryStats,
        guests: guestStats,
        cleaning: cleaningStats
      });

      // Cargar datos adicionales
      await Promise.all([
        loadRecentActivity(),
        loadLowStockItems(),
        loadUpcomingCheckOuts()
      ]);

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error refrescando estadísticas:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Calcular tendencias
  const getTrends = useMemo(() => {
    return {
      occupancy: {
        value: stats.rooms.occupancyRate,
        trend: stats.rooms.occupancyRate > 75 ? 'up' : stats.rooms.occupancyRate < 50 ? 'down' : 'stable',
        change: '+5%' // Esto sería calculado con datos históricos
      },
      revenue: {
        value: stats.revenue.growth,
        trend: stats.revenue.growth > 0 ? 'up' : stats.revenue.growth < 0 ? 'down' : 'stable',
        change: `${stats.revenue.growth > 0 ? '+' : ''}${stats.revenue.growth}%`
      },
      guests: {
        value: stats.guests.checkedIn,
        trend: stats.guests.newToday > 0 ? 'up' : 'stable',
        change: `+${stats.guests.newToday} hoy`
      }
    };
  }, [stats]);

  // Suscripción a cambios en tiempo real
  useEffect(() => {
    // Canales para diferentes tablas
    const roomsChannel = supabase
      .channel('dashboard_rooms')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'rooms' },
        () => loadRoomStats().then(roomStats => 
          setStats(prev => ({ ...prev, rooms: roomStats }))
        )
      )
      .subscribe();

    const ordersChannel = supabase
      .channel('dashboard_orders')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          Promise.all([loadRevenueStats(), loadOrderStats(), loadGuestStats()])
            .then(([revenueStats, orderStats, guestStats]) => {
              setStats(prev => ({ 
                ...prev, 
                revenue: revenueStats, 
                orders: orderStats,
                guests: guestStats 
              }));
            });
          loadRecentActivity();
          loadUpcomingCheckOuts();
        }
      )
      .subscribe();

    const inventoryChannel = supabase
      .channel('dashboard_inventory')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'inventory' },
        () => {
          loadInventoryStats().then(inventoryStats => 
            setStats(prev => ({ ...prev, inventory: inventoryStats }))
          );
          loadLowStockItems();
        }
      )
      .subscribe();

    const cleaningChannel = supabase
      .channel('dashboard_cleaning')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'room_cleaning' },
        () => {
          loadCleaningStats().then(cleaningStats => 
            setStats(prev => ({ ...prev, cleaning: cleaningStats }))
          );
          loadRecentActivity();
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(roomsChannel);
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(inventoryChannel);
      supabase.removeChannel(cleaningChannel);
    };
  }, []);

  // Auto-refresh cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      refreshStats();
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    refreshStats();
  }, []);

  return {
    // Datos principales
    stats,
    recentActivity,
    lowStockItems,
    upcomingCheckOuts,
    trends: getTrends,
    
    // Estados
    loading,
    error,
    lastUpdated,
    
    // Funciones
    refreshStats,
    
    // Funciones individuales de carga
    loadRoomStats,
    loadRevenueStats,
    loadOrderStats,
    loadInventoryStats,
    loadGuestStats,
    loadCleaningStats,
    loadRecentActivity,
    loadLowStockItems,
    loadUpcomingCheckOuts
  };
};