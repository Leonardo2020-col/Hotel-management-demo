import { useState, useEffect } from 'react';
import { hotelStats, occupancyData, revenueByCategory, recentActivity, upcomingCheckIns, roomsToClean } from '../utils/mockData';

export const useDashboard = () => {
  const [stats, setStats] = useState(hotelStats);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Simular actualizaciones en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prevStats => ({
        ...prevStats,
        revenue: {
          ...prevStats.revenue,
          today: prevStats.revenue.today + Math.floor(Math.random() * 50)
        },
        totalGuests: prevStats.totalGuests + Math.floor(Math.random() * 3) - 1
      }));
      setLastUpdated(new Date());
    }, 30000); // Actualizar cada 30 segundos

    // Simular carga inicial
    setTimeout(() => setLoading(false), 1000);

    return () => clearInterval(interval);
  }, []);

  const getOccupancyTrend = () => {
    const thisMonth = stats.occupancy;
    const lastMonth = 72; // Simulado
    const difference = thisMonth - lastMonth;
    return {
      value: difference,
      isPositive: difference > 0,
      percentage: Math.abs((difference / lastMonth) * 100).toFixed(1)
    };
  };

  const getRevenueTrend = () => {
    const thisMonth = stats.revenue.thisMonth;
    const lastMonth = stats.revenue.lastMonth;
    const difference = thisMonth - lastMonth;
    return {
      value: difference,
      isPositive: difference > 0,
      percentage: Math.abs((difference / lastMonth) * 100).toFixed(1)
    };
  };

  return {
    stats,
    occupancyData,
    revenueByCategory,
    recentActivity,
    upcomingCheckIns,
    roomsToClean,
    loading,
    lastUpdated,
    getOccupancyTrend,
    getRevenueTrend
  };
};