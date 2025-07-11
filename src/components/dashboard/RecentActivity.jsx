import React from 'react';
import { 
  LogIn, 
  LogOut, 
  Calendar, 
  Wrench, 
  Clock,
  User,
  MapPin
} from 'lucide-react';
import classNames from 'classnames';

const RecentActivity = ({ activities, loading }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'checkin':
        return LogIn;
      case 'checkout':
        return LogOut;
      case 'reservation':
        return Calendar;
      case 'maintenance':
        return Wrench;
      default:
        return Clock;
    }
  };

  const getActivityColor = (type, status) => {
    if (status === 'pending') return 'text-yellow-500';
    
    switch (type) {
      case 'checkin':
        return 'text-green-500';
      case 'checkout':
        return 'text-blue-500';
      case 'reservation':
        return 'text-purple-500';
      case 'maintenance':
        return 'text-orange-500';
      default:
        return 'text-gray-500';
    }
  };

  const getActivityBg = (type, status) => {
    if (status === 'pending') return 'bg-yellow-50';
    
    switch (type) {
      case 'checkin':
        return 'bg-green-50';
      case 'checkout':
        return 'bg-blue-50';
      case 'reservation':
        return 'bg-purple-50';
      case 'maintenance':
        return 'bg-orange-50';
      default:
        return 'bg-gray-50';
    }
  };

  const getActivityText = (type) => {
    switch (type) {
      case 'checkin':
        return 'Check-in';
      case 'checkout':
        return 'Check-out';
      case 'reservation':
        return 'Reserva';
      case 'maintenance':
        return 'Mantenimiento';
      default:
        return 'Actividad';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Actividad Reciente
        </h3>
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          Ver todo
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = getActivityIcon(activity.type);
          const colorClass = getActivityColor(activity.type, activity.status);
          const bgClass = getActivityBg(activity.type, activity.status);

          return (
            <div
              key={activity.id}
              className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className={classNames('p-2 rounded-full', bgClass)}>
                <Icon size={20} className={colorClass} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {getActivityText(activity.type)}
                  </p>
                  {activity.status === 'pending' && (
                    <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                      Pendiente
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 mt-1">
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <User size={14} />
                    <span>{activity.guest}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <MapPin size={14} />
                    <span>Hab. {activity.room}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Clock size={14} />
                <span>{activity.time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivity;