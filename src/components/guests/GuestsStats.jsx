import React from 'react';
import { Users, UserCheck, Star, Globe, Calendar, TrendingUp, Award, Phone } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const GuestsStats = ({ stats, loading }) => {
  const safeStats = stats || {
    total: 0,
    active: 0,
    vip: 0,
    frequent: 0,
    newThisMonth: 0,
    totalRevenue: 0,
    averageStay: 0,
    repeatRate: 0,
    topCountries: [],
    ageGroups: {
      '18-25': 0,
      '26-35': 0,
      '36-50': 0,
      '51-65': 0,
      '65+': 0
    }
  };

  const mainStats = [
    {
      title: 'Total Huéspedes',
      value: safeStats.total,
      icon: Users,
      color: 'blue',
      description: 'Registrados en el sistema'
    },
    {
      title: 'Huéspedes Activos',
      value: safeStats.active,
      icon: UserCheck,
      color: 'green',
      description: 'Actualmente en el hotel'
    },
    {
      title: 'Huéspedes VIP',
      value: safeStats.vip,
      icon: Star,
      color: 'yellow',
      description: 'Con estatus premium'
    },
    {
      title: 'Huéspedes Frecuentes',
      value: safeStats.frequent,
      icon: Award,
      color: 'purple',
      description: '5+ visitas registradas'
    },
    {
      title: 'Nuevos Este Mes',
      value: safeStats.newThisMonth,
      icon: TrendingUp,
      color: 'indigo',
      description: 'Registros recientes'
    },
    {
      title: 'Ingresos Totales',
      value: formatCurrency(safeStats.totalRevenue),
      icon: TrendingUp,
      color: 'green',
      description: 'Generados por huéspedes'
    },
    {
      title: 'Estancia Promedio',
      value: `${safeStats.averageStay} días`,
      icon: Calendar,
      color: 'blue',
      description: 'Duración media'
    },
    {
      title: 'Tasa de Retorno',
      value: `${safeStats.repeatRate}%`,
      icon: Users,
      color: 'orange',
      description: 'Huéspedes que regresan'
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'text-blue-600 bg-blue-50',
      green: 'text-green-600 bg-green-50',
      purple: 'text-purple-600 bg-purple-50',
      yellow: 'text-yellow-600 bg-yellow-50',
      orange: 'text-orange-600 bg-orange-50',
      red: 'text-red-600 bg-red-50',
      indigo: 'text-indigo-600 bg-indigo-50',
      gray: 'text-gray-600 bg-gray-50'
    };
    return colorMap[color] || 'text-gray-600 bg-gray-50';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
              <div className="animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-20 sm:w-24"></div>
                    <div className="h-6 sm:h-8 bg-gray-200 rounded w-12 sm:w-16"></div>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="mt-3 sm:mt-4">
                  <div className="h-2 sm:h-3 bg-gray-200 rounded w-16 sm:w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {mainStats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = getColorClasses(stat.color);
          
          return (
            <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">
                    {stat.title}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                    {stat.description}
                  </p>
                </div>
                <div className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${colorClasses}`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Insights adicionales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Countries */}
        {safeStats.topCountries && safeStats.topCountries.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Globe className="w-5 h-5 text-blue-500 mr-2" />
              Principales Países
            </h3>
            <div className="space-y-3">
              {safeStats.topCountries.slice(0, 5).map((country, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-6 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        {country.code}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {country.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{country.count}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(country.count / safeStats.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Age Groups */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 text-purple-500 mr-2" />
            Distribución por Edad
          </h3>
          <div className="space-y-3">
            {Object.entries(safeStats.ageGroups).map(([ageRange, count]) => (
              <div key={ageRange} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{ageRange} años</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{count}</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${safeStats.total > 0 ? (count / safeStats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Métricas de rendimiento */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Métricas de Rendimiento</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-green-800 mb-1">Ingresos por Huésped</p>
            <p className="text-xl sm:text-2xl font-bold text-green-600">
              {safeStats.total > 0 ? formatCurrency(safeStats.totalRevenue / safeStats.total) : formatCurrency(0)}
            </p>
            <p className="text-xs text-green-700 mt-1">Promedio</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-800 mb-1">Satisfacción</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">
              {safeStats.satisfactionScore || 4.2}/5
            </p>
            <p className="text-xs text-blue-700 mt-1">Puntuación media</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-sm font-medium text-purple-800 mb-1">Recomendación</p>
            <p className="text-xl sm:text-2xl font-bold text-purple-600">
              {safeStats.recommendationRate || 87}%
            </p>
            <p className="text-xs text-purple-700 mt-1">NPS Score</p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {!loading && safeStats.total === 0 && (
        <div className="text-center py-8 sm:py-12">
          <Users className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
            No hay huéspedes registrados
          </h3>
          <p className="text-sm sm:text-base text-gray-600">
            Comienza agregando tu primer huésped al sistema
          </p>
        </div>
      )}
    </div>
  );
};

export default GuestsStats;