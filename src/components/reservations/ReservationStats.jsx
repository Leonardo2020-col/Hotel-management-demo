import React from 'react';
import { Calendar, CheckCircle, Clock } from 'lucide-react';

const ReservationStats = ({ stats, loading }) => {
  const statCards = [
    {
      title: 'Total Reservas',
      value: stats.total,
      icon: Calendar,
      color: 'blue',
      description: 'Todas las reservas'
    },
    {
      title: 'Confirmadas',
      value: stats.confirmed,
      icon: CheckCircle,
      color: 'green',
      description: 'Reservas confirmadas'
    },
    {
      title: 'Pendientes',
      value: stats.pending,
      icon: Clock,
      color: 'yellow',
      description: 'Esperando confirmación'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        icon: 'text-blue-600',
        border: 'border-blue-200'
      },
      green: {
        bg: 'bg-green-50',
        icon: 'text-green-600',
        border: 'border-green-200'
      },
      yellow: {
        bg: 'bg-yellow-50',
        icon: 'text-yellow-600',
        border: 'border-yellow-200'
      }
    };
    return colors[color] || colors.blue;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {statCards.map((card, index) => {
        const colors = getColorClasses(card.color);
        const Icon = card.icon;

        return (
          <div 
            key={index}
            className={`bg-white rounded-xl shadow-lg border ${colors.border} p-6 hover:shadow-xl transition-shadow duration-300`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {card.value}
                </p>
                <p className="text-xs text-gray-500">
                  {card.description}
                </p>
              </div>
              
              <div className={`p-3 rounded-lg ${colors.bg}`}>
                <Icon className={`w-6 h-6 ${colors.icon}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReservationStats;