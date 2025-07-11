// hooks/useReports.js
import { useState, useEffect, useMemo } from 'react';

export const useReports = (dateRange, selectedPeriod) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simular datos de reportes
  const mockData = {
    overview: {
      avgOccupancy: 78,
      totalRevenue: 245000,
      totalGuests: 342,
      avgRate: 185.50
    },
    occupancy: [
      { date: '2025-06-01', occupancy: 65, availableRooms: 15, occupiedRooms: 35 },
      { date: '2025-06-02', occupancy: 72, availableRooms: 14, occupiedRooms: 36 },
      { date: '2025-06-03', occupancy: 78, availableRooms: 11, occupiedRooms: 39 },
      { date: '2025-06-04', occupancy: 85, availableRooms: 8, occupiedRooms: 42 },
      { date: '2025-06-05', occupancy: 92, availableRooms: 4, occupiedRooms: 46 },
      { date: '2025-06-06', occupancy: 88, availableRooms: 6, occupiedRooms: 44 },
      { date: '2025-06-07', occupancy: 77, availableRooms: 12, occupiedRooms: 38 }
    ],
    revenue: [
      { category: 'Habitaciones', amount: 185000, percentage: 75.5 },
      { category: 'Restaurante', amount: 32000, percentage: 13.1 },
      { category: 'Spa', amount: 18000, percentage: 7.3 },
      { category: 'Servicios Adicionales', amount: 10000, percentage: 4.1 }
    ],
    guests: {
      totalGuests: 342,
      newGuests: 156,
      returningGuests: 186,
      averageStay: 3.2,
      satisfactionScore: 4.6,
      demographics: [
        { country: 'Perú', guests: 180, percentage: 52.6 },
        { country: 'Estados Unidos', guests: 65, percentage: 19.0 },
        { country: 'España', guests: 32, percentage: 9.4 },
        { country: 'Brasil', guests: 28, percentage: 8.2 },
        { country: 'Otros', guests: 37, percentage: 10.8 }
      ]
    },
    rooms: {
      totalRooms: 50,
      roomTypes: [
        { type: 'Estándar', total: 20, occupied: 15, revenue: 75000 },
        { type: 'Deluxe', total: 15, occupied: 12, revenue: 84000 },
        { type: 'Suite', total: 10, occupied: 8, revenue: 64000 },
        { type: 'Presidential', total: 5, occupied: 3, revenue: 22000 }
      ],
      maintenanceStatus: {
        operational: 47,
        maintenance: 2,
        outOfOrder: 1
      }
    },
    supplies: {
      totalValue: 85000,
      categoriesConsumption: [
        { category: 'Limpieza', consumed: 15000, percentage: 35.7 },
        { category: 'Amenidades', consumed: 12000, percentage: 28.6 },
        { category: 'Lencería', consumed: 8000, percentage: 19.0 },
        { category: 'Mantenimiento', consumed: 7000, percentage: 16.7 }
      ],
      stockAlerts: 8,
      monthlyConsumption: 42000
    }
  };

  // Simular carga de datos
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simular delay de API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los datos de reportes');
        setLoading(false);
      }
    };

    loadData();
  }, [dateRange, selectedPeriod]);

  // Calcular estadísticas del overview basadas en el período
  const overviewStats = useMemo(() => {
    if (loading) return null;
    
    // Ajustar datos según el período seleccionado
    const multiplier = selectedPeriod === 'thisMonth' ? 1 : 
                      selectedPeriod === 'lastMonth' ? 0.95 : 1.1;
    
    return {
      avgOccupancy: Math.round(mockData.overview.avgOccupancy * multiplier),
      totalRevenue: Math.round(mockData.overview.totalRevenue * multiplier),
      totalGuests: Math.round(mockData.overview.totalGuests * multiplier),
      avgRate: Math.round(mockData.overview.avgRate * multiplier * 100) / 100
    };
  }, [loading, selectedPeriod]);

  // Datos de ocupación
  const occupancyData = useMemo(() => {
    if (loading) return null;
    return mockData.occupancy;
  }, [loading]);

  // Datos de ingresos
  const revenueData = useMemo(() => {
    if (loading) return null;
    return mockData.revenue;
  }, [loading]);

  // Datos de huéspedes
  const guestsData = useMemo(() => {
    if (loading) return null;
    return mockData.guests;
  }, [loading]);

  // Datos de habitaciones
  const roomsData = useMemo(() => {
    if (loading) return null;
    return mockData.rooms;
  }, [loading]);

  // Datos de insumos
  const suppliesData = useMemo(() => {
    if (loading) return null;
    return mockData.supplies;
  }, [loading]);

  // Generar reporte personalizado
  const generateReport = async (reportConfig) => {
    try {
      setLoading(true);
      
      // Simular generación de reporte
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Generando reporte con configuración:', reportConfig);
      
      setLoading(false);
      return {
        success: true,
        reportId: Date.now().toString(),
        downloadUrl: '#'
      };
    } catch (error) {
      setError('Error al generar el reporte personalizado');
      setLoading(false);
      throw error;
    }
  };

  // Exportar reporte
  const exportReport = async (reportType, format = 'pdf', dateRange) => {
    try {
      // Simular exportación
      console.log(`Exportando reporte ${reportType} en formato ${format}`, dateRange);
      
      // En una implementación real, aquí llamarías a tu API
      const blob = new Blob(['Contenido del reporte simulado'], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_${reportType}_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      throw new Error('Error al exportar el reporte');
    }
  };

  return {
    // Datos
    overviewStats,
    occupancyData,
    revenueData,
    guestsData,
    roomsData,
    suppliesData,
    loading,
    error,
    
    // Métodos
    generateReport,
    exportReport
  };
};