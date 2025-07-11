import React from 'react';
import { Bed, Users, Sparkles, Wrench, AlertTriangle, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const RoomStats = ({ stats, roomsByType, loading }) => {
  // AGREGAR VALIDACIÓN PARA STATS UNDEFINED
  const safeStats = stats || {
    total: 0,
    available: 0,
    occupied: 0,
    occupancyRate: 0,
    cleaning: 0,
    maintenance: 0,
    outOfOrder: 0,
    needsCleaning: 0,
    revenue: {
      today: 0,
      thisMonth: 0,
      average: 0
    }
  };

  const mainStats = [
    {
      title: 'Total Habitaciones',
      value: safeStats.total,
      icon: Bed,
      color: 'blue',
      description: 'Habitaciones totales'
    },
    {
      title: 'Disponibles',
      value: safeStats.available,
      icon: Users,
      color: 'green',
      description: 'Listas para ocupar'
    },
    {
      title: 'Ocupadas',
      value: safeStats.occupied,
      icon: Users,
      color: 'purple',
      description: 'Con huéspedes'
    },
    {
      title: 'Tasa de Ocupación',
      value: `${safeStats.occupancyRate}%`,
      icon: TrendingUp,
      color: 'yellow',
      description: 'Porcentaje actual'
    },
    {
      title: 'En Limpieza',
      value: safeStats.cleaning,
      icon: Sparkles,
      color: 'blue',
      description: 'Siendo limpiadas'
    },
    {
      title: 'Mantenimiento',
      value: safeStats.maintenance,
      icon: Wrench,
      color: 'orange',
      description: 'En reparación'
    },
    {
      title: 'Fuera de Servicio',
      value: safeStats.outOfOrder,
      icon: AlertTriangle,
      color: 'red',
      description: 'No disponibles'
    },
    {
      title: 'Necesitan Limpieza',
      value: safeStats.needsCleaning,
      icon: Sparkles,
      color: 'red',
      description: 'Pendientes de limpieza'
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'text-blue-600 bg-blue-50',
      green: 'text-green-600 bg-green-50',
      purple: 'text-purple-600 bg-purple-50',
      yellow: 'text-yellow-600 bg-yellow-50',
      orange: 'text-orange-600 bg-orange-50',
      red: 'text-red-600 bg-red-50'
    };
    return colorMap[color] || 'text-gray-600 bg-gray-50';
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="mt-4">
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = getColorClasses(stat.color);
          
          return (
            <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stat.description}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${colorClasses}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Summary */}
      {safeStats.revenue && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Resumen de Ingresos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-800 mb-1">Hoy</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(safeStats.revenue.today)}
              </p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800 mb-1">Este Mes</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(safeStats.revenue.thisMonth)}
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm font-medium text-purple-800 mb-1">Promedio Diario</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(safeStats.revenue.average)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Room Types Distribution */}
      {roomsByType && roomsByType.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Distribución por Tipo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roomsByType.map((type, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{type.name}</h4>
                  <span className="text-sm text-gray-600">{type.count} hab.</span>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Disponibles:</span>
                    <span className="text-green-600 font-medium">{type.available}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ocupadas:</span>
                    <span className="text-blue-600 font-medium">{type.occupied}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tarifa promedio:</span>
                    <span className="font-medium">{formatCurrency(type.averageRate)}</span>
                  </div>
                </div>
                
                {/* Progress bar for occupancy */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Ocupación</span>
                    <span>{Math.round((type.occupied / type.count) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(type.occupied / type.count) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && safeStats.total === 0 && (
        <div className="text-center py-12">
          <Bed className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay habitaciones registradas
          </h3>
          <p className="text-gray-600">
            Comienza agregando tu primera habitación al sistema
          </p>
        </div>
      )}
    </div>
  );
};

export default RoomStats;