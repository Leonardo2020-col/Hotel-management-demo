import React from 'react';
import { AlertTriangle, Sparkles, User } from 'lucide-react';
import Button from '../common/Button';
import classNames from 'classnames';

const RoomsToClean = ({ rooms, loading }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return {
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-200',
          badge: 'bg-red-100 text-red-800'
        };
      case 'medium':
        return {
          bg: 'bg-yellow-50',
          text: 'text-yellow-700',
          border: 'border-yellow-200',
          badge: 'bg-yellow-100 text-yellow-800'
        };
      case 'low':
        return {
          bg: 'bg-green-50',
          text: 'text-green-700',
          border: 'border-green-200',
          badge: 'bg-green-100 text-green-800'
        };
      default:
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          border: 'border-gray-200',
          badge: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high':
        return 'Urgente';
      case 'medium':
        return 'Normal';
      case 'low':
        return 'Baja';
      default:
        return 'Normal';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Limpieza Pendiente
          </h3>
        </div>
        <span className="bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1 rounded-full">
          {rooms.length} habitaciones
        </span>
      </div>

      <div className="space-y-3">
        {rooms.map((room, index) => {
          const colors = getPriorityColor(room.priority);
          
          return (
            <div
              key={index}
              className={classNames(
                'p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md',
                colors.bg,
                colors.border
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-gray-900">
                      Habitación {room.room}
                    </h4>
                    <span className={classNames(
                      'px-2 py-1 text-xs rounded-full font-medium',
                      colors.badge
                    )}>
                      {getPriorityText(room.priority)}
                    </span>
                    {room.priority === 'high' && (
                      <AlertTriangle size={16} className="text-red-500" />
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="font-medium">{room.type}</span>
                    <div className="flex items-center space-x-1">
                      <User size={14} />
                      <span>{room.lastGuest}</span>
                    </div>
                  </div>
                </div>
                
                <Button
                  size="sm"
                  variant="primary"
                  icon={Sparkles}
                  className="ml-4"
                >
                  Asignar
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <Button
          variant="ghost"
          fullWidth
          icon={Sparkles}
          className="text-blue-600 hover:text-blue-700"
        >
          Gestionar todas las habitaciones
        </Button>
      </div>
    </div>
  );
};

export default RoomsToClean;