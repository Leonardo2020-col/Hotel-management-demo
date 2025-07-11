import React from 'react';
import { 
  Edit, 
  Trash2, 
  Users, 
  MapPin,
  CheckCircle,
  AlertTriangle,
  Wrench,
  Ban,
  Eye,
  Clock
} from 'lucide-react';
import Button from '../common/Button';
import { ROOM_STATUS } from '../../utils/roomMockData';
import { formatCurrency } from '../../utils/formatters';
import classNames from 'classnames';

const RoomList = ({ 
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

  const handleSelectAll = () => {
    onSelectRoom(
      selectedRooms.length === rooms.length 
        ? [] 
        : rooms.map(r => r.id)
    );
  };

  const handleSelectRoom = (roomId) => {
    onSelectRoom(prev => 
      prev.includes(roomId)
        ? prev.filter(id => id !== roomId)
        : [...prev, roomId]
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="w-20 h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <input
              type="checkbox"
              checked={selectedRooms.length === rooms.length && rooms.length > 0}
              onChange={handleSelectAll}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">
              {selectedRooms.length > 0 
                ? `${selectedRooms.length} seleccionada${selectedRooms.length > 1 ? 's' : ''}`
                : `${rooms.length} habitación${rooms.length !== 1 ? 'es' : ''}`
              }
            </span>
          </div>
          
          {selectedRooms.length > 0 && (
            <div className="flex space-x-2">
              <Button size="sm" variant="outline">
                Asignar Limpieza
              </Button>
              <Button size="sm" variant="danger">
                Eliminar Seleccionadas
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Rooms List */}
      <div className="divide-y divide-gray-200">
        {rooms.map((room) => {
          const StatusIcon = getStatusIcon(room.status);
          const isSelected = selectedRooms.includes(room.id);

          return (
            <div 
              key={room.id} 
              className={classNames(
                'p-6 hover:bg-gray-50 transition-colors',
                isSelected && 'bg-blue-50'
              )}
            >
              <div className="flex items-start space-x-4">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleSelectRoom(room.id)}
                  className="mt-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />

                {/* Room Visual */}
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {room.number}
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Room Info */}
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Habitación {room.number}
                        </h3>
                        <span className={classNames(
                          'px-3 py-1 rounded-full text-xs font-semibold border flex items-center space-x-1',
                          getStatusColor(room.status)
                        )}>
                          <StatusIcon size={12} />
                          <span>{room.status}</span>
                        </span>
                      </div>

                      {/* Room Details */}
                      <div className="flex items-center space-x-6 mb-3">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin size={14} />
                          <span>Piso {room.floor}</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-semibold text-blue-600">
                            {formatCurrency(room.rate)}/noche
                          </span>
                        </div>
                      </div>

                      {/* Current Guest */}
                      {room.currentGuest && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                          <p className="text-sm font-medium text-blue-900">
                            <Users size={14} className="inline mr-1" />
                            Huésped: {room.currentGuest.name}
                          </p>
                          <p className="text-xs text-blue-700">
                            Check-out: {new Date(room.currentGuest.checkOut).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      )}

                      {/* Next Reservation */}
                      {room.nextReservation && !room.currentGuest && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                          <p className="text-sm font-medium text-yellow-900">
                            Próxima reserva: {room.nextReservation.guest}
                          </p>
                          <p className="text-xs text-yellow-700">
                            Check-in: {new Date(room.nextReservation.checkIn).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        icon={Eye}
                      >
                        Ver
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        icon={Edit}
                        onClick={() => onEdit(room.id)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        icon={Trash2}
                        onClick={() => onDelete(room.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoomList;