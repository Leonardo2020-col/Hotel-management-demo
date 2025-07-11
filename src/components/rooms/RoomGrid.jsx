import React from 'react';
import { 
  Edit, 
  Trash2, 
  MapPin, 
  CheckCircle,
  Clock,
  AlertTriangle,
  Wrench,
  Ban,
  Users
} from 'lucide-react';
import Button from '../common/Button';
import { ROOM_STATUS } from '../../utils/roomMockData';
import { formatCurrency } from '../../utils/formatters';
import classNames from 'classnames';

const RoomGrid = ({ 
  rooms, 
  loading, 
  selectedRooms, 
  onSelectRoom,
  onStatusChange,
  onEdit,
  onDelete 
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case ROOM_STATUS.AVAILABLE:
        return 'bg-green-100 text-green-800 border-green-200';
      case ROOM_STATUS.OCCUPIED:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case ROOM_STATUS.CLEANING:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case ROOM_STATUS.MAINTENANCE:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case ROOM_STATUS.OUT_OF_ORDER:
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case ROOM_STATUS.AVAILABLE:
        return CheckCircle;
      case ROOM_STATUS.OCCUPIED:
        return Users;
      case ROOM_STATUS.CLEANING:
        return Clock;
      case ROOM_STATUS.MAINTENANCE:
        return Wrench;
      case ROOM_STATUS.OUT_OF_ORDER:
        return Ban;
      default:
        return AlertTriangle;
    }
  };

  const handleSelectRoom = (roomId) => {
    onSelectRoom(prev => 
      prev.includes(roomId)
        ? prev.filter(id => id !== roomId)
        : [...prev, roomId]
    );
  };

  const StatusActions = ({ room }) => {
    const availableActions = [];

    switch (room.status) {
      case ROOM_STATUS.AVAILABLE:
        availableActions.push(
          { 
            label: 'Ocupar', 
            action: () => onStatusChange(room.id, ROOM_STATUS.OCCUPIED),
            color: 'primary'
          },
          { 
            label: 'Limpieza', 
            action: () => onStatusChange(room.id, ROOM_STATUS.CLEANING),
            color: 'warning'
          }
        );
        break;
      case ROOM_STATUS.OCCUPIED:
        availableActions.push(
          { 
            label: 'Liberar', 
            action: () => onStatusChange(room.id, ROOM_STATUS.AVAILABLE),
            color: 'success'
          }
        );
        break;
      case ROOM_STATUS.CLEANING:
        availableActions.push(
          { 
            label: 'Finalizar', 
            action: () => onStatusChange(room.id, ROOM_STATUS.AVAILABLE),
            color: 'success'
          }
        );
        break;
      case ROOM_STATUS.MAINTENANCE:
        availableActions.push(
          { 
            label: 'Finalizar', 
            action: () => onStatusChange(room.id, ROOM_STATUS.AVAILABLE),
            color: 'success'
          }
        );
        break;
    }

    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {availableActions.map((action, index) => (
          <Button
            key={index}
            size="sm"
            variant={action.color}
            onClick={action.action}
            className="text-xs px-3 py-1"
          >
            {action.label}
          </Button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="mt-4 flex space-x-2">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {rooms.map((room) => {
        const StatusIcon = getStatusIcon(room.status);
        const isSelected = selectedRooms.includes(room.id);

        return (
          <div
            key={room.id}
            className={classNames(
              'bg-white rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl',
              isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-100'
            )}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectRoom(room.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <h3 className="text-xl font-bold text-gray-900">
                    {room.number}
                  </h3>
                </div>
                <span className={classNames(
                  'px-3 py-1 rounded-full text-xs font-semibold border flex items-center space-x-1',
                  getStatusColor(room.status)
                )}>
                  <StatusIcon size={14} />
                  <span>{room.status}</span>
                </span>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <MapPin size={14} />
                  <span>Piso {room.floor}</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Rate */}
              <div className="text-center">
                <span className="text-2xl font-bold text-blue-600">
                  {formatCurrency(room.rate)}/noche
                </span>
              </div>

              {/* Current Guest */}
              {room.currentGuest && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-blue-900">
                    Huésped: {room.currentGuest.name}
                  </p>
                  <p className="text-xs text-blue-700">
                    Check-out: {new Date(room.currentGuest.checkOut).toLocaleDateString('es-ES')}
                  </p>
                </div>
              )}

              {/* Next Reservation */}
              {room.nextReservation && !room.currentGuest && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-yellow-900">
                    Próxima Reserva: {room.nextReservation.guest}
                  </p>
                  <p className="text-xs text-yellow-700">
                    Check-in: {new Date(room.nextReservation.checkIn).toLocaleDateString('es-ES')}
                  </p>
                </div>
              )}

              {/* Status Actions */}
              <StatusActions room={room} />
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <div className="flex justify-between space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  icon={Edit}
                  onClick={() => onEdit(room.id)}
                  className="flex-1"
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  icon={Trash2}
                  onClick={() => onDelete(room.id)}
                  className="flex-1"
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

export default RoomGrid;