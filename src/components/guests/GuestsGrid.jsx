import React from 'react';
import { 
  Trash2, 
  Eye, 
  Phone,
  Mail,
  User
} from 'lucide-react';
import Button from '../common/Button';
import classNames from 'classnames';

const GuestsGrid = ({ 
  guests, 
  loading, 
  selectedGuests, 
  onSelectGuest,
  onEdit,
  onDelete,
  onViewProfile,
  reservations
}) => {

  const handleSelectGuest = (guestId) => {
    onSelectGuest(prev => 
      prev.includes(guestId)
        ? prev.filter(id => id !== guestId)
        : [...prev, guestId]
    );
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="mt-4 flex space-x-2">
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {guests.map((guest) => {
        const isSelected = selectedGuests.includes(guest.id);

        return (
          <div
            key={guest.id}
            className={classNames(
              'bg-white rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl relative overflow-hidden',
              isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-100'
            )}
          >
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-gray-200">
              {/* Guest Avatar and Info */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">
                    {guest.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 leading-tight break-words">
                    {guest.fullName}
                  </h3>
                  <p className="text-sm text-gray-600 truncate">
                    DNI: {guest.dni || guest.documentNumber}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-3">
              {/* Contact Information */}
              <div className="space-y-3">
                {/* Teléfono (opcional) */}
                {guest.phone && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone size={14} className="flex-shrink-0" />
                    <span className="truncate">{guest.phone}</span>
                  </div>
                )}
                
                {/* Email (opcional) */}
                {guest.email && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail size={14} className="flex-shrink-0" />
                    <span className="truncate">{guest.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <div className="space-y-2">
                {/* Primera fila - Ver Perfil (botón completo) */}
                <Button
                  size="sm"
                  variant="primary"
                  icon={Eye}
                  onClick={() => onViewProfile(guest)}
                  className="w-full text-xs"
                >
                  Ver Perfil
                </Button>
                
                {/* Segunda fila - Solo Eliminar */}
                <Button
                  size="sm"
                  variant="danger"
                  icon={Trash2}
                  onClick={() => onDelete(guest.id)}
                  className="w-full text-xs"
                >
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GuestsGrid;