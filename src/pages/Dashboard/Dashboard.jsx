// src/pages/Dashboard/Dashboard.jsx - ACTUALIZADO CON MODAL
import React, { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  DollarSign,
  Bed,
  TrendingUp,
  Clock,
  RefreshCw
} from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/dashboard/StatCard';
import OccupancyChart from '../../components/dashboard/OccupancyChart';
import RevenueChart from '../../components/dashboard/RevenueChart';
import RecentActivity from '../../components/dashboard/RecentActivity';
import UpcomingCheckIns from '../../components/dashboard/UpcomingCheckIns';
import RoomsToClean from '../../components/dashboard/RoomsToClean';
import QuickCheckInModal from '../../components/dashboard/QuickCheckInModal';
import Button from '../../components/common/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';

const Dashboard = () => {
  const { hasPermission } = useAuth();
  const [showQuickCheckIn, setShowQuickCheckIn] = useState(false);

  const {
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
  } = useDashboard();

  const occupancyTrend = getOccupancyTrend();
  const revenueTrend = getRevenueTrend();

  const handleQuickCheckIn = (checkInData) => {
    console.log('Check-in rápido:', checkInData);
    // Aquí implementarías la lógica de check-in
    alert(`Check-in exitoso!\nHuésped: ${checkInData.guest.fullName}\nHabitación: ${checkInData.room}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Vista general del Hotel Paraíso
          </p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <div className="text-sm text-gray-500">
            Última actualización: {formatDate(lastUpdated, 'HH:mm')}
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={() => window.location.reload()}
          >
            Actualizar
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Nueva Reserva - Solo para recepción */}
        {hasPermission('reservations', 'write') && (
          <Button
            variant="primary"
            className="h-12"
            icon={Calendar}
          >
            Nueva Reserva
          </Button>
        )}
        
        {/* Check-in Rápido - Solo para recepción */}
        {hasPermission('reservations', 'write') && (
          <Button
            variant="success"
            className="h-12"
            icon={Users}
            onClick={() => setShowQuickCheckIn(true)}
          >
            Check-in Rápido
          </Button>
        )}
        
        {/* Gestionar Habitaciones - Para todos */}
        <Button
          variant="warning"
          className="h-12"
          icon={Bed}
        >
          Gestionar Habitaciones
        </Button>
        
        {/* Ver Reportes - Para todos */}
        <Button
          variant="purple"
          className="h-12 bg-purple-600 hover:bg-purple-700 text-white"
          icon={BarChart3}
        >
          Ver Reportes
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tasa de Ocupación"
          value={`${stats.occupancy}%`}
          subtitle={`${stats.occupiedRooms}/${stats.totalRooms} habitaciones`}
          icon={BarChart3}
          trend={occupancyTrend}
          color="blue"
          loading={loading}
        />
        
        <StatCard
          title="Huéspedes Actuales"
          value={stats.totalGuests}
          subtitle={`+${stats.checkInsToday} check-ins hoy`}
          icon={Users}
          color="green"
          loading={loading}
        />
        
        <StatCard
          title="Ingresos del Mes"
          value={formatCurrency(stats.revenue.thisMonth)}
          subtitle={`${formatCurrency(stats.revenue.today)} hoy`}
          icon={DollarSign}
          trend={revenueTrend}
          color="purple"
          loading={loading}
        />
        
        <StatCard
          title="Tarifa Promedio"
          value={formatCurrency(stats.averageRate)}
          subtitle={`Satisfacción: ${stats.guestSatisfaction}/5.0`}
          icon={TrendingUp}
          color="yellow"
          loading={loading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <OccupancyChart data={occupancyData} loading={loading} />
        </div>
        <div>
          <RevenueChart data={revenueByCategory} loading={loading} />
        </div>
      </div>

      {/* Widgets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <RecentActivity activities={recentActivity} loading={loading} />
        </div>
        <div>
          <UpcomingCheckIns checkIns={upcomingCheckIns} loading={loading} />
        </div>
        <div>
          <RoomsToClean rooms={roomsToClean} loading={loading} />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Check-outs Pendientes</p>
              <p className="text-3xl font-bold">{stats.checkOutsToday}</p>
              <p className="text-blue-100 text-sm mt-1">Para hoy</p>
            </div>
            <Clock className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Habitaciones Disponibles</p>
              <p className="text-3xl font-bold">{stats.availableRooms}</p>
              <p className="text-green-100 text-sm mt-1">Listas para ocupar</p>
            </div>
            <Bed className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Ingresos Semanales</p>
              <p className="text-3xl font-bold">{formatCurrency(stats.revenue.thisWeek)}</p>
              <p className="text-purple-100 text-sm mt-1">Esta semana</p>
            </div>
            <DollarSign className="w-12 h-12 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Modal de Check-in Rápido */}
      <QuickCheckInModal
        isOpen={showQuickCheckIn}
        onClose={() => setShowQuickCheckIn(false)}
        onSubmit={handleQuickCheckIn}
      />
    </div>
  );
};

export default Dashboard;