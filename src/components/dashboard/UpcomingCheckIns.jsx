import React from 'react';
import { Clock, User, MapPin, Calendar } from 'lucide-react';
import Button from '../common/Button';

const UpcomingCheckIns = ({ checkIns, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
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
          Check-ins de Hoy
        </h3>
        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
          {checkIns.length} pendientes
        </span>
      </div>

      <div className="space-y-4">
        {checkIns.map((checkIn) => (
          <div
            key={checkIn.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-semibold text-gray-900">{checkIn.guest}</h4>
                  <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                    {checkIn.type}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <MapPin size={14} />
                    <span>Habitación {checkIn.room}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock size={14} />
                    <span>{checkIn.time}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar size={14} />
                    <span>{checkIn.nights} noche{checkIn.nights > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                icon={User}
              >
                Ver Perfil
              </Button>
              <Button
                size="sm"
                variant="primary"
                className="flex-1"
              >
                Check-in
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <Button
          variant="ghost"
          fullWidth
          className="text-blue-600 hover:text-blue-700"
        >
          Ver todos los check-ins
        </Button>
      </div>
    </div>
  );
};

export default UpcomingCheckIns;