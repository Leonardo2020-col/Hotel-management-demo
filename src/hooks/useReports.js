// src/hooks/useReports.js - CONECTADO CON SUPABASE
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';

export const useReports = (dateRange = {}, selectedPeriod = 'thisMonth') => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para diferentes tipos de datos
  const [rooms, setRooms] = useState([]);
  const [orders, setOrders] = useState([]);
  const [guests, setGuests] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [orderServices, setOrderServices] = useState([]);
  const [cleaningTasks, setCleaningTasks] = useState([]);

  // Calcular fechas según el período seleccionado
  const calculatedDateRange = useMemo(() => {
    const today = new Date();
    let startDate, endDate;

    switch (selectedPeriod) {
      case 'today':
        startDate = new Date(today);
        endDate = new Date(today);
        break;
      case 'yesterday':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 1);
        endDate = new Date(startDate);
        break;
      case 'thisWeek':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay());
        endDate = new Date(today);
        break;
      case 'lastWeek':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay() - 7);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        break;
      case 'thisMonth':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today);
        break;
      case 'lastMonth':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'thisYear':
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today);
        break;
      case 'custom':
        startDate = dateRange.startDate ? new Date(dateRange.startDate) : new Date(today);
        endDate = dateRange.endDate ? new Date(dateRange.endDate) : new Date(today);
        break;
      default:
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  }, [selectedPeriod, dateRange]);

  // Cargar todos los datos necesarios para reportes
  const loadAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Cargar datos en paralelo
      const [
        roomsData,
        ordersData, 
        guestsData,
        inventoryData,
        orderServicesData,
        cleaningData
      ] = await Promise.all([
        loadRooms(),
        loadOrders(),
        loadGuests(),
        loadInventory(),
        loadOrderServices(),
        loadCleaningTasks()
      ]);

      setRooms(roomsData);
      setOrders(ordersData);
      setGuests(guestsData);
      setInventory(inventoryData);
      setOrderServices(orderServicesData);
      setCleaningTasks(cleaningData);

    } catch (error) {
      console.error('Error cargando datos para reportes:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar habitaciones
  const loadRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error cargando habitaciones:', error);
      return [];
    }
  };

  // Cargar órdenes del período
  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .gte('check_in_date', calculatedDateRange.startDate)
        .lte('check_in_date', calculatedDateRange.endDate)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error cargando órdenes:', error);
      return [];
    }
  };

  // Cargar huéspedes
  const loadGuests = async () => {
    try {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error cargando huéspedes:', error);
      return [];
    }
  };

  // Cargar inventario
  const loadInventory = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error cargando inventario:', error);
      return [];
    }
  };

  // Cargar servicios de órdenes
  const loadOrderServices = async () => {
    try {
      const { data, error } = await supabase
        .from('order_services')
        .select(`
          *,
          services (name, category),
          orders (check_in_date, status)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error cargando servicios de órdenes:', error);
      return [];
    }
  };

  // Cargar tareas de limpieza
  const loadCleaningTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('room_cleaning')
        .select(`
          *,
          rooms (number, floor, type),
          staff (full_name)
        `)
        .gte('created_at', calculatedDateRange.startDate)
        .lte('created_at', calculatedDateRange.endDate);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error cargando tareas de limpieza:', error);
      return [];
    }
  };

  // Estadísticas generales calculadas
  const overviewStats = useMemo(() => {
    if (!orders.length) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        occupancyRate: 0,
        totalGuests: 0,
        avgStay: 0
      };
    }

    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calcular ocupación promedio
    const roomDays = rooms.length * getDaysInPeriod();
    const occupiedDays = orders.filter(o => o.status === 'completed' || o.status === 'active').length;
    const occupancyRate = roomDays > 0 ? (occupiedDays / roomDays) * 100 : 0;

    // Huéspedes únicos en el período
    const uniqueGuests = new Set(orders.map(o => o.guest_name)).size;

    // Estancia promedio
    const completedOrders = orders.filter(o => o.status === 'completed' && o.check_out_date);
    const avgStay = completedOrders.length > 0 
      ? completedOrders.reduce((sum, order) => {
          const checkIn = new Date(order.check_in_date);
          const checkOut = new Date(order.check_out_date);
          const days = Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
          return sum + days;
        }, 0) / completedOrders.length
      : 1;

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      occupancyRate: Math.round(occupancyRate),
      totalGuests: uniqueGuests,
      avgStay: Math.round(avgStay * 10) / 10
    };
  }, [orders, rooms]);

  // Datos de ocupación por día
  const occupancyData = useMemo(() => {
    if (!orders.length) return [];

    const dailyData = {};
    const startDate = new Date(calculatedDateRange.startDate);
    const endDate = new Date(calculatedDateRange.endDate);

    // Inicializar todos los días
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dailyData[dateStr] = {
        date: dateStr,
        occupiedRooms: 0,
        availableRooms: rooms.length,
        occupancy: 0
      };
    }

    // Contar habitaciones ocupadas por día
    orders.forEach(order => {
      const checkInDate = order.check_in_date;
      if (dailyData[checkInDate]) {
        dailyData[checkInDate].occupiedRooms++;
        dailyData[checkInDate].availableRooms--;
      }
    });

    // Calcular porcentaje de ocupación
    Object.keys(dailyData).forEach(date => {
      const data = dailyData[date];
      data.occupancy = rooms.length > 0 
        ? Math.round((data.occupiedRooms / rooms.length) * 100) 
        : 0;
    });

    return Object.values(dailyData).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [orders, rooms, calculatedDateRange]);

  // Datos de ingresos por categoría
  const revenueData = useMemo(() => {
    const categoryRevenue = {};

    // Ingresos por habitaciones
    const roomRevenue = orders.reduce((sum, order) => sum + parseFloat(order.room_price || 0), 0);
    categoryRevenue['Habitaciones'] = roomRevenue;

    // Ingresos por servicios adicionales
    const servicesInPeriod = orderServices.filter(service => {
      const orderDate = service.orders?.check_in_date;
      return orderDate >= calculatedDateRange.startDate && 
             orderDate <= calculatedDateRange.endDate;
    });

    const serviceCategories = {};
    servicesInPeriod.forEach(service => {
      const category = service.services?.category || 'Otros servicios';
      serviceCategories[category] = (serviceCategories[category] || 0) + parseFloat(service.total_price || 0);
    });

    Object.entries(serviceCategories).forEach(([category, amount]) => {
      categoryRevenue[category] = amount;
    });

    // Convertir a array y calcular porcentajes
    const totalRevenue = Object.values(categoryRevenue).reduce((sum, amount) => sum + amount, 0);
    
    return Object.entries(categoryRevenue).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100 * 10) / 10 : 0
    })).sort((a, b) => b.amount - a.amount);
  }, [orders, orderServices, calculatedDateRange]);

  // Datos de huéspedes
  const guestsData = useMemo(() => {
    const guestsInPeriod = orders.map(order => order.guest_name).filter(Boolean);
    const uniqueGuests = [...new Set(guestsInPeriod)];
    
    // Análisis demográfico basado en órdenes del período
    const nationalityCount = {};
    orders.forEach(order => {
      const guest = guests.find(g => g.full_name === order.guest_name);
      if (guest && guest.nationality) {
        nationalityCount[guest.nationality] = (nationalityCount[guest.nationality] || 0) + 1;
      }
    });

    const demographics = Object.entries(nationalityCount)
      .map(([country, count]) => ({
        country,
        guests: count,
        percentage: Math.round((count / uniqueGuests.length) * 100 * 10) / 10
      }))
      .sort((a, b) => b.guests - a.guests)
      .slice(0, 5);

    // Calcular estadísticas
    const newGuests = guests.filter(guest => {
      const createdDate = guest.created_at.split('T')[0];
      return createdDate >= calculatedDateRange.startDate && 
             createdDate <= calculatedDateRange.endDate;
    }).length;

    const returningGuests = uniqueGuests.length - newGuests;

    return {
      totalGuests: uniqueGuests.length,
      newGuests,
      returningGuests,
      averageStay: overviewStats.avgStay,
      satisfactionScore: 4.3, // Simulado - se puede integrar con encuestas futuras
      demographics
    };
  }, [orders, guests, calculatedDateRange, overviewStats.avgStay]);

  // Datos de habitaciones
  const roomsData = useMemo(() => {
    // Análisis por tipo de habitación
    const roomTypeStats = {};
    
    rooms.forEach(room => {
      if (!roomTypeStats[room.type]) {
        roomTypeStats[room.type] = {
          type: room.type,
          total: 0,
          occupied: 0,
          revenue: 0
        };
      }
      roomTypeStats[room.type].total++;
    });

    // Contar ocupación y ingresos por tipo
    orders.forEach(order => {
      const room = rooms.find(r => r.number === order.room_number);
      if (room && roomTypeStats[room.type]) {
        roomTypeStats[room.type].occupied++;
        roomTypeStats[room.type].revenue += parseFloat(order.room_price || 0);
      }
    });

    const roomTypes = Object.values(roomTypeStats);

    // Estado de mantenimiento (simulado)
    const maintenanceStatus = {
      operational: rooms.filter(r => r.status !== 'maintenance' && r.status !== 'out_of_order').length,
      maintenance: rooms.filter(r => r.status === 'maintenance').length,
      outOfOrder: rooms.filter(r => r.status === 'out_of_order').length
    };

    return {
      totalRooms: rooms.length,
      roomTypes,
      maintenanceStatus
    };
  }, [rooms, orders]);

  // Datos de inventario/suministros
  const suppliesData = useMemo(() => {
    const totalValue = inventory.reduce((sum, item) => 
      sum + (item.current_stock * item.unit_cost), 0
    );

    // Consumo por categoría (basado en servicios vendidos)
    const categoryConsumption = {};
    orderServices
      .filter(service => {
        const orderDate = service.orders?.check_in_date;
        return orderDate >= calculatedDateRange.startDate && 
               orderDate <= calculatedDateRange.endDate;
      })
      .forEach(service => {
        const category = service.services?.category || 'Otros';
        categoryConsumption[category] = (categoryConsumption[category] || 0) + 
          parseFloat(service.total_price || 0);
      });

    const totalConsumption = Object.values(categoryConsumption).reduce((sum, amount) => sum + amount, 0);

    const categoriesConsumption = Object.entries(categoryConsumption).map(([category, consumed]) => ({
      category,
      consumed,
      percentage: totalConsumption > 0 ? Math.round((consumed / totalConsumption) * 100 * 10) / 10 : 0
    }));

    const stockAlerts = inventory.filter(item => 
      item.current_stock <= item.min_stock
    ).length;

    return {
      totalValue,
      categoriesConsumption,
      stockAlerts,
      monthlyConsumption: totalConsumption
    };
  }, [inventory, orderServices, calculatedDateRange]);

  // Datos de limpieza
  const cleaningData = useMemo(() => {
    const stats = {
      totalTasks: cleaningTasks.length,
      completed: cleaningTasks.filter(t => t.status === 'completed').length,
      pending: cleaningTasks.filter(t => t.status === 'pending').length,
      inProgress: cleaningTasks.filter(t => t.status === 'in_progress').length,
      averageTime: 0
    };

    // Calcular tiempo promedio de limpieza
    const completedTasks = cleaningTasks.filter(t => 
      t.status === 'completed' && t.actual_duration
    );
    
    if (completedTasks.length > 0) {
      stats.averageTime = Math.round(
        completedTasks.reduce((sum, task) => sum + task.actual_duration, 0) / completedTasks.length
      );
    }

    return stats;
  }, [cleaningTasks]);

  // Función auxiliar para obtener días en el período
  const getDaysInPeriod = () => {
    const startDate = new Date(calculatedDateRange.startDate);
    const endDate = new Date(calculatedDateRange.endDate);
    return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  };

  // Generar reporte personalizado
  const generateReport = async (reportConfig) => {
    try {
      setLoading(true);
      
      // Simular generación de reporte
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const reportData = {
        overview: overviewStats,
        occupancy: occupancyData,
        revenue: revenueData,
        guests: guestsData,
        rooms: roomsData,
        supplies: suppliesData,
        cleaning: cleaningData,
        period: calculatedDateRange,
        generatedAt: new Date().toISOString(),
        config: reportConfig
      };
      
      setLoading(false);
      return {
        success: true,
        reportId: Date.now().toString(),
        data: reportData
      };
    } catch (error) {
      setError('Error generando reporte personalizado');
      setLoading(false);
      throw error;
    }
  };

  // Exportar reporte
  const exportReport = async (reportType, format = 'pdf') => {
    try {
      const reportData = {
        overview: overviewStats,
        occupancy: occupancyData,
        revenue: revenueData,
        guests: guestsData,
        rooms: roomsData,
        supplies: suppliesData,
        cleaning: cleaningData
      };

      // Crear contenido del reporte
      let content = '';
      
      if (format === 'csv') {
        // Generar CSV simple para ocupación
        content = 'Fecha,Habitaciones Ocupadas,Habitaciones Disponibles,Ocupación %\n';
        occupancyData.forEach(day => {
          content += `${day.date},${day.occupiedRooms},${day.availableRooms},${day.occupancy}\n`;
        });
      } else {
        // Generar reporte en texto para otros formatos
        content = `
REPORTE DE HOTEL - ${selectedPeriod.toUpperCase()}
Período: ${calculatedDateRange.startDate} a ${calculatedDateRange.endDate}
Generado: ${new Date().toLocaleString()}

=== RESUMEN GENERAL ===
Ingresos totales: $${overviewStats.totalRevenue.toFixed(2)}
Total de órdenes: ${overviewStats.totalOrders}
Valor promedio por orden: $${overviewStats.avgOrderValue.toFixed(2)}
Tasa de ocupación: ${overviewStats.occupancyRate}%
Total de huéspedes: ${overviewStats.totalGuests}
Estancia promedio: ${overviewStats.avgStay} días

=== INGRESOS POR CATEGORÍA ===
${revenueData.map(item => `${item.category}: $${item.amount.toFixed(2)} (${item.percentage}%)`).join('\n')}

=== ESTADÍSTICAS DE HABITACIONES ===
Total de habitaciones: ${roomsData.totalRooms}
${roomsData.roomTypes.map(type => 
  `${type.type}: ${type.occupied}/${type.total} ocupadas - $${type.revenue.toFixed(2)} ingresos`
).join('\n')}
        `;
      }

      // Crear y descargar archivo
      const blob = new Blob([content], { 
        type: format === 'csv' ? 'text/csv' : 'text/plain' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_${reportType}_${calculatedDateRange.startDate}_${calculatedDateRange.endDate}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      throw new Error('Error al exportar el reporte');
    }
  };

  // Cargar datos cuando cambie el período
  useEffect(() => {
    loadAllData();
  }, [calculatedDateRange.startDate, calculatedDateRange.endDate]);

  return {
    // Datos calculados
    overviewStats,
    occupancyData,
    revenueData,
    guestsData,
    roomsData,
    suppliesData,
    cleaningData,
    
    // Metadatos
    dateRange: calculatedDateRange,
    selectedPeriod,
    loading,
    error,
    
    // Métodos
    generateReport,
    exportReport,
    refreshData: loadAllData,
    
    // Datos raw (si se necesitan)
    rawData: {
      rooms,
      orders,
      guests,
      inventory,
      orderServices,
      cleaningTasks
    }
  };
};